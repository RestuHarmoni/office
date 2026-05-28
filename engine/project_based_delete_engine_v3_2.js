import { auth, db } from '../assets/js/firebase.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { collection, doc, getDocs, query, where, orderBy, deleteDoc, writeBatch, limit } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const $ = id => document.getElementById(id);
const esc = v => String(v ?? '-').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const operationalCollections = ['tasks','workflow','department_logs','notifications','outputs','deliveries','qa_reviews','final_deliveries','workflow_logs','pipeline','pipelines','sop_execution','qa_checklist'];
const outputLinkedCollections = ['qa_reviews','final_deliveries','deliveries'];
let selectedProject = null;
let cachedProjects = [];

function status(msg, type='info'){
  const box = $('deleteStatus');
  if(!box) return;
  const cls = type === 'error' ? 'error' : 'hint';
  box.className = cls;
  box.textContent = msg;
}

function nowLabel(v){ try { return v?.toDate ? v.toDate().toLocaleString('ms-MY') : '-'; } catch(e){ return '-'; } }

onAuthStateChanged(auth, user => {
  if(!user){ window.location.href = '../index.html'; return; }
  setupLogout();
  loadProjects();
});

function setupLogout(){
  document.querySelectorAll('#logoutBtn,#mobileLogoutBtn').forEach(btn => btn.onclick = async () => { await signOut(auth); window.location.href='../index.html'; });
}

async function loadProjects(){
  const list = $('projectDeleteList');
  if(list) list.innerHTML = '<p class="muted">Loading projects...</p>';
  try{
    let snap;
    try { snap = await getDocs(query(collection(db,'projects'), orderBy('createdAt','desc'), limit(100))); }
    catch(e){ snap = await getDocs(query(collection(db,'projects'), limit(100))); }
    cachedProjects = [];
    snap.forEach(d => cachedProjects.push({ id:d.id, ...d.data() }));
    $('projectCount').textContent = String(cachedProjects.length);
    renderProjects();
  } catch(err){
    console.error(err);
    if(list) list.innerHTML = `<p class="error">Gagal load projects: ${esc(err.code || err.message)}</p>`;
  }
}

function renderProjects(){
  const list = $('projectDeleteList');
  if(!list) return;
  if(!cachedProjects.length){ list.innerHTML = '<p class="muted">No project found.</p>'; return; }
  let html = '<table class="table"><thead><tr><th>Project</th><th>Client</th><th>Type</th><th>Status</th><th>Created</th><th>Action</th></tr></thead><tbody>';
  cachedProjects.forEach(p => {
    const name = p.projectName || p.title || p.name || p.project || p.mainObjective || p.id;
    html += `<tr><td><strong>${esc(name)}</strong><br><small class="muted">${esc(p.id)}</small></td><td>${esc(p.clientName || p.client || p.companyName || '-')}</td><td>${esc(p.projectType || '-')}</td><td><span class="badge orange">${esc(p.status || 'ACTIVE')}</span></td><td>${esc(nowLabel(p.createdAt))}</td><td><button class="btn small red select-delete" data-id="${esc(p.id)}">Select</button></td></tr>`;
  });
  html += '</tbody></table>';
  list.innerHTML = html;
  document.querySelectorAll('.select-delete').forEach(btn => btn.onclick = () => selectProject(btn.dataset.id));
}

function selectProject(id){
  selectedProject = cachedProjects.find(p => p.id === id) || {id};
  $('selectedProjectId').value = id;
  $('selectedProjectLabel').textContent = id.length > 8 ? id.slice(0,8)+'…' : id;
  $('confirmProjectId').value = '';
  $('deleteProjectBtn').disabled = true;
  status('Project selected. Taip projectId yang sama untuk confirm delete.');
}

$('confirmProjectId')?.addEventListener('input', () => {
  $('deleteProjectBtn').disabled = !$('selectedProjectId').value || $('confirmProjectId').value.trim() !== $('selectedProjectId').value.trim();
});
$('refreshBtn')?.addEventListener('click', loadProjects);
$('deleteProjectBtn')?.addEventListener('click', async () => {
  const projectId = $('selectedProjectId').value.trim();
  const confirmId = $('confirmProjectId').value.trim();
  if(!projectId || projectId !== confirmId) return status('Confirmation projectId tidak sama.', 'error');
  const ok = window.confirm(`Delete project ${projectId}? Data project ini akan dipadam dari operational collections sahaja.`);
  if(!ok) return;
  $('deleteProjectBtn').disabled = true;
  await deleteProjectSafely(projectId);
});

async function collectDocsByProjectId(projectId){
  const docs = [];
  for(const col of operationalCollections){
    try{
      const snap = await getDocs(query(collection(db,col), where('projectId','==',projectId), limit(500)));
      snap.forEach(d => docs.push({ ref:d.ref, path:`${col}/${d.id}` }));
    } catch(err){ console.warn('Skip collection query', col, err.code || err.message); }
  }
  // direct docs for nested/project-key style if present
  for(const col of ['projects','tasks','pipeline','pipelines','workflow_logs','sop_execution','qa_checklist']){
    docs.push({ ref:doc(db,col,projectId), path:`${col}/${projectId}` });
  }
  return docs;
}

async function deleteInBatches(refs){
  const unique = new Map();
  refs.forEach(x => unique.set(x.ref.path, x.ref));
  const all = [...unique.values()];
  let deleted = 0;
  for(let i=0;i<all.length;i+=450){
    const batch = writeBatch(db);
    all.slice(i,i+450).forEach(ref => batch.delete(ref));
    await batch.commit();
    deleted += Math.min(450, all.length-i);
  }
  return deleted;
}

export async function deleteProjectSafely(projectId){
  try{
    status('Scanning related project records...');
    const refs = await collectDocsByProjectId(projectId);
    status(`Deleting ${refs.length} possible related records...`);
    const deleted = await deleteInBatches(refs);
    status(`Project ${projectId} deleted successfully. Records processed: ${deleted}.`);
    selectedProject = null;
    $('selectedProjectId').value = '';
    $('confirmProjectId').value = '';
    $('selectedProjectLabel').textContent = '-';
    await loadProjects();
  } catch(err){
    console.error(err);
    status(`Delete failed: ${err.code || err.message}. Semak Firestore rules/admin permission.`, 'error');
  }
}
