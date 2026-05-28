import { auth, db } from './firebase.js';
import { protectPage, setupLogout, currentUserLabel } from './auth.js';
import { collection, addDoc, onSnapshot, serverTimestamp, query, orderBy, doc, updateDoc, setDoc, limit, increment } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

protectPage(); setupLogout(); currentUserLabel();
const $ = id => document.getElementById(id);
const esc = v => String(v ?? '-').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const badgeClass = s => ['COMPLETED','DONE','ACTIVE','APPROVED','DELIVERED'].includes(s)?'green':['URGENT','REVIEW','READY_FOR_REVIEW','QA_REVIEW','IN_PROGRESS','PM_ANALYSIS'].includes(s)?'orange':['CANCELLED','REJECTED','BLOCKED','REVISION_NEEDED'].includes(s)?'red':'purple';
const nowLabel = v => { try { return v?.toDate ? v.toDate().toLocaleString('ms-MY') : ''; } catch(e){ return ''; } };

export const DEPARTMENTS = [
  {id:'SECTION_01_PM', icon:'PM', name:'Strategic Project Director AI', short:'Project Director', role:'Analisa project, pecahkan task, assign department, monitor progress dan final delivery.'},
  {id:'SECTION_02_UIUX', icon:'UX', name:'Creative UI/UX Architect AI', short:'UI/UX Architect', role:'Design layout, responsive structure, dashboard flow dan design system.'},
  {id:'SECTION_03_FRONTEND', icon:'FE', name:'Frontend Engineering AI', short:'Frontend Engineer', role:'HTML, CSS, JavaScript, responsive frontend dan reusable component.'},
  {id:'SECTION_04_BACKEND', icon:'BE', name:'Backend Infrastructure AI', short:'Backend Engineer', role:'Database, API, authentication, session management dan storage.'},
  {id:'SECTION_05_QA', icon:'QA', name:'Quality Assurance Intelligence AI', short:'QA Intelligence', role:'Bug testing, responsive testing, UI consistency dan performance review.'},
  {id:'SECTION_06_SEO', icon:'SE', name:'SEO Optimization Specialist AI', short:'SEO Specialist', role:'Technical SEO, schema markup, keyword structure dan optimization.'},
  {id:'SECTION_07_MARKETING', icon:'MK', name:'Digital Growth Marketing AI', short:'Growth Marketing', role:'Campaign angle, launch positioning, offer clarity dan conversion support.'},
  {id:'SECTION_08_CLIENT_MANAGEMENT', icon:'CS', name:'Client Success Management AI', short:'Client Success', role:'Requirement notes, feedback, approval status dan client handover records.'},
  {id:'SECTION_09_CONTENT', icon:'CT', name:'Content Intelligence AI', short:'Content Strategist', role:'Website copy structure, section messaging, CTA direction dan brand tone.'},
  {id:'SECTION_10_ARCHIVE', icon:'AR', name:'Knowledge & Archive System AI', short:'Archive System', role:'Final files, version notes, delivery records dan reusable project references.'}
];


export const SOP_TEMPLATES = {
  SECTION_01_PM: {
    title:'PM AI SOP — Project Command & Delivery Control',
    steps:['Review client requirement','Confirm project type and scope','Generate department task template','Monitor SOP progress','Prepare final delivery summary'],
    checklist:['Project scope clear','Department task generated','Priority and deadline set','Risk note added','Ready for QA handoff']
  },
  SECTION_02_UIUX: {
    title:'UIUX AI SOP — Design System & Responsive Experience',
    steps:['Review objective, audience and design style','Prepare page/layout structure','Define responsive mobile flow','Prepare visual direction and component rule','Submit design note to Frontend'],
    checklist:['Layout direction ready','Mobile flow covered','Color/style aligned','CTA and navigation clear','Frontend handoff ready']
  },
  SECTION_03_FRONTEND: {
    title:'Frontend AI SOP — Interface Build & Component Delivery',
    steps:['Review UIUX handoff','Build responsive page/component','Connect form/button flow','Optimize mobile and desktop','Submit output to QA'],
    checklist:['No broken layout','Mobile responsive','Buttons/links working','Reusable component ready','QA submission ready']
  },
  SECTION_04_BACKEND: {
    title:'Backend AI SOP — Firebase, Data & Access Logic',
    steps:['Review data requirement','Prepare Firestore collection structure','Validate auth/session flow','Prepare security/rules note','Submit integration status'],
    checklist:['Collections defined','Auth requirement checked','Read/write path documented','Error state covered','Integration ready']
  },
  SECTION_05_QA: {
    title:'QA AI SOP — Review, Reject, Approve & Delivery Gate',
    steps:['Review department output','Run responsive and function test','Compare against checklist','Approve or reject with reason','Confirm final delivery readiness'],
    checklist:['Mobile tested','Desktop tested','No critical error','Requirement matched','Approved for delivery']
  },
  SECTION_06_SEO: {
    title:'SEO AI SOP — Technical SEO & Search Readiness',
    steps:['Review target page and business type','Prepare metadata and heading structure','Check schema/open graph readiness','Review content keyword placement','Submit SEO checklist'],
    checklist:['Meta title ready','Meta description ready','Heading order clean','Schema plan ready','Indexing basics checked']
  },
  SECTION_07_MARKETING: {
    title:'Marketing AI SOP — Offer, Campaign & Conversion Angle',
    steps:['Review target market and offer','Prepare campaign angle','Prepare CTA and conversion message','Review launch channels','Submit campaign notes'],
    checklist:['Audience clear','Offer clear','CTA clear','Launch angle ready','Marketing handoff ready']
  },
  SECTION_08_CLIENT_MANAGEMENT: {
    title:'Client Management AI SOP — Feedback & Approval Handling',
    steps:['Record client requirement','Prepare review notes','Collect feedback','Track approval status','Prepare handover communication'],
    checklist:['Client detail complete','Feedback recorded','Approval status updated','Revision note clear','Handover message ready']
  },
  SECTION_09_CONTENT: {
    title:'Content AI SOP — Website Copy & Messaging Structure',
    steps:['Review objective and audience','Prepare page copy outline','Write section messaging','Prepare CTA and FAQ','Submit copy to UIUX/Frontend'],
    checklist:['Hero message ready','Section copy ready','CTA ready','Tone aligned','Copy handoff ready']
  },
  SECTION_10_ARCHIVE: {
    title:'Archive AI SOP — Version, Delivery & Knowledge Storage',
    steps:['Collect final assets/files','Record version note','Archive project output','Store reusable knowledge','Confirm final delivery record'],
    checklist:['Final files listed','Version note ready','Delivery URL recorded','Knowledge archived','Project closeout ready']
  }
};

const QA_REVIEW_CHECKLIST = ['Requirement matched','Department SOP completed','Responsive test passed','No critical bug','Client-ready output'];

const AUTOMATION_PHASES = [
  {id:'SOP_ENGINE_AUTOMATION', title:'SOP Engine Automation', status:'ACTIVE', detail:'Auto attach SOP steps, checklist and QA gate to every generated department task.'},
  {id:'AUTO_TASK_GENERATOR', title:'Auto Task Generator', status:'ACTIVE', detail:'Project type becomes department task template with priority, SOP and routing rule.'},
  {id:'AI_COMMAND_CENTER', title:'AI Command Center', status:'READY', detail:'Realtime monitoring for project stages, active workload, blocked tasks and AI staff status.'},
  {id:'AUTONOMOUS_WORKFLOW', title:'Full Autonomous Workflow', status:'BASE_READY', detail:'PM AI to Department AI to QA to Delivery control logic prepared for future OpenAI API execution.'},
  {id:'KNOWLEDGE_BASE_SYSTEM', title:'Knowledge Base System', status:'READY', detail:'Centralized SOP, prompt library, reusable component rules, coding rules and templates.'},
  {id:'CLIENT_PORTAL', title:'Client Portal', status:'BLUEPRINT_READY', detail:'Client login, progress tracking, upload, revision, invoice and delivery center blueprint.'},
  {id:'REAL_AI_COLLABORATION', title:'Real AI Staff Collaboration', status:'V3_ROADMAP', detail:'AI-to-AI communication, memory sync and department context sharing planned for Version 3.'}
];

const KNOWLEDGE_BASE_CATEGORIES = [
  ['SOP Knowledge','Department SOP, checklist and QA rule for every AI staff section.'],
  ['Reusable Component','Website sections, dashboard cards, form blocks, layout and navigation pattern.'],
  ['Prompt Library','PM prompt, UIUX prompt, Frontend prompt, Backend prompt, QA prompt and SEO prompt.'],
  ['Design Library','Color system, typography direction, spacing, responsive rule and component standard.'],
  ['Coding Rules','HTML/CSS/JS rules, Firebase path, naming standard and mobile-first requirement.'],
  ['Template Storage','Project templates, task templates, delivery template and archive reference.']
];


function sopForDepartment(id){ return SOP_TEMPLATES[id] || {title:'General Department SOP', steps:['Review task','Execute work','Update status','Submit for QA'], checklist:['Task reviewed','Work completed','Status updated','QA ready']}; }

const DEFAULT_TASKS = [
  ['SECTION_01_PM','PM Analysis & Delivery Plan','Define scope, deliverables, timeline, risk and department handoff.'],
  ['SECTION_02_UIUX','Experience Architecture','Prepare page structure, dashboard flow and responsive layout direction.'],
  ['SECTION_09_CONTENT','Content Strategy','Prepare headline, page sections, CTA and core website messaging.'],
  ['SECTION_03_FRONTEND','Frontend Interface Build','Build responsive UI and reusable frontend components.'],
  ['SECTION_04_BACKEND','Firebase & Data Integration','Review Auth, Firestore collections, rules and system integration.'],
  ['SECTION_06_SEO','Technical SEO Foundation','Prepare metadata, headings and basic schema readiness.'],
  ['SECTION_05_QA','Quality Review','Run bug check, responsive test, UI consistency and readiness review.'],
  ['SECTION_08_CLIENT_MANAGEMENT','Client Approval Flow','Prepare review notes, collect feedback and update approval status.'],
  ['SECTION_10_ARCHIVE','Final Archive & Version Control','Store final version, changelog and delivery record.']
];

const PROJECT_TASK_TEMPLATES = {
  'Corporate Website': [
    ['SECTION_01_PM','Corporate Website Scope Plan','Define company profile pages, lead flow, delivery scope and launch checklist.'],
    ['SECTION_02_UIUX','Corporate Website UI Direction','Design premium corporate layout, homepage structure, service sections and mobile responsive flow.'],
    ['SECTION_09_CONTENT','Corporate Website Copy Structure','Prepare hero message, about section, service copy, trust section and CTA.'],
    ['SECTION_03_FRONTEND','Corporate Website Frontend Build','Build responsive homepage, services, about, contact and reusable website components.'],
    ['SECTION_04_BACKEND','Contact & Lead Capture Setup','Prepare contact form, WhatsApp CTA, Firestore lead structure and basic admin data flow.'],
    ['SECTION_06_SEO','Corporate SEO Foundation','Prepare meta title, meta description, heading structure, local SEO and schema readiness.'],
    ['SECTION_05_QA','Corporate Website QA Review','Test mobile, tablet, desktop, form flow, link accuracy and visual consistency.'],
    ['SECTION_08_CLIENT_MANAGEMENT','Client Review & Approval','Prepare preview notes, collect feedback and confirm final approval.'],
    ['SECTION_10_ARCHIVE','Corporate Website Delivery Archive','Archive final files, version note, deployment URL and delivery checklist.']
  ],
  'Company Profile Website': null,
  'Landing Page': [
    ['SECTION_01_PM','Landing Page Campaign Scope','Define offer, target audience, CTA and conversion goal.'],
    ['SECTION_02_UIUX','Landing Page Conversion Design','Design hero, benefit blocks, social proof and conversion-focused mobile layout.'],
    ['SECTION_09_CONTENT','Landing Page Sales Copy','Prepare headline, subheadline, offer copy, CTA and FAQ.'],
    ['SECTION_03_FRONTEND','Landing Page Frontend Build','Build fast responsive landing page with CTA sections and form/WhatsApp integration.'],
    ['SECTION_06_SEO','Landing Page SEO Basics','Prepare metadata, Open Graph, headings and page speed checklist.'],
    ['SECTION_05_QA','Landing Page QA','Test responsive layout, CTA buttons, form/WhatsApp and loading consistency.'],
    ['SECTION_10_ARCHIVE','Landing Page Delivery Archive','Archive campaign copy, final file and deployment URL.']
  ],
  'Physical Ecommerce Website': [
    ['SECTION_01_PM','Physical Ecommerce Scope Plan','Define product categories, order flow, shipping requirement and payment scope.'],
    ['SECTION_02_UIUX','Product Catalog UX','Design catalog, product page, cart, checkout and mobile buying journey.'],
    ['SECTION_09_CONTENT','Product Content Structure','Prepare product title, description, category and trust badges.'],
    ['SECTION_03_FRONTEND','Ecommerce Frontend Build','Build product listing, product detail, cart and checkout UI.'],
    ['SECTION_04_BACKEND','Order & Inventory Structure','Setup orders, inventory fields, customer data, shipping status and payment placeholder.'],
    ['SECTION_06_SEO','Product SEO Foundation','Prepare product schema, category metadata and ecommerce SEO structure.'],
    ['SECTION_05_QA','Checkout QA Testing','Test cart, checkout, mobile product flow, order status and error states.'],
    ['SECTION_10_ARCHIVE','Ecommerce Delivery Archive','Archive product data structure, order flow notes and deployment version.']
  ],
  'Digital Ecommerce Platform': [
    ['SECTION_01_PM','Digital Product Scope Plan','Define digital product format, access method, payment and delivery rule.'],
    ['SECTION_02_UIUX','Digital Library UX','Design product catalog, digital library, purchase flow and member access screens.'],
    ['SECTION_09_CONTENT','Digital Product Content','Prepare digital product copy, license notice, download instruction and FAQ.'],
    ['SECTION_03_FRONTEND','Digital Ecommerce Frontend','Build digital catalog, product detail, download/access UI and member screens.'],
    ['SECTION_04_BACKEND','Digital Access & Download System','Prepare payment access flag, download record, member entitlement and protected content structure.'],
    ['SECTION_06_SEO','Digital Product SEO','Prepare product metadata, schema and keyword structure for digital products.'],
    ['SECTION_05_QA','Digital Delivery QA','Test purchase-to-access flow, download states, member restriction and responsive layout.'],
    ['SECTION_10_ARCHIVE','Digital Platform Archive','Archive access rules, file delivery notes and final deployment version.']
  ],
  'Digital & Physical Ecommerce Platform': [
    ['SECTION_01_PM','Hybrid Ecommerce Scope Plan','Separate ebook flow, physical book flow, payment, shipping and member access requirements.'],
    ['SECTION_02_UIUX','Hybrid Bookstore UX Architecture','Design Islamic bookstore catalog, ebook library, physical book product page, cart and checkout journey.'],
    ['SECTION_09_CONTENT','Bookstore Content Strategy','Prepare category structure, book descriptions, author/publisher fields, ebook notes and trust copy.'],
    ['SECTION_03_FRONTEND','Hybrid Ecommerce Frontend Build','Build product catalog, ebook badge, physical shipping info, cart, checkout and member library UI.'],
    ['SECTION_04_BACKEND','Hybrid Order & Digital Access System','Setup product type field, ebook entitlement, physical order, shipping status, payment and customer records.'],
    ['SECTION_06_SEO','Islamic Bookstore SEO Foundation','Prepare ecommerce schema, book/product metadata, category SEO and Islamic bookstore keyword structure.'],
    ['SECTION_05_QA','Hybrid Ecommerce QA','Test ebook access, physical checkout, mobile buying flow, cart states and order status.'],
    ['SECTION_08_CLIENT_MANAGEMENT','Hybrid Ecommerce Client Approval','Prepare feature checklist, client review note and acceptance criteria.'],
    ['SECTION_10_ARCHIVE','Hybrid Ecommerce Delivery Archive','Archive final product data model, delivery URL, version note and deployment checklist.']
  ],
  'Subscription Ecommerce Platform': [
    ['SECTION_01_PM','Subscription Commerce Scope','Define recurring plan, member access, billing cycle and cancellation rule.'],
    ['SECTION_02_UIUX','Subscription UX Flow','Design plan comparison, checkout, account access and subscription status UI.'],
    ['SECTION_03_FRONTEND','Subscription Frontend Build','Build pricing table, checkout entry, account screen and status badges.'],
    ['SECTION_04_BACKEND','Subscription Data Structure','Prepare plans, subscription status, renewal date and user access fields.'],
    ['SECTION_05_QA','Subscription QA','Test plan selection, member access and responsive pricing flow.']
  ],
  'Dashboard System': [
    ['SECTION_01_PM','Dashboard Scope Plan','Define users, KPIs, modules, roles and data flow.'],
    ['SECTION_02_UIUX','Dashboard UX Architecture','Design sidebar, cards, tables, filters and responsive dashboard layout.'],
    ['SECTION_03_FRONTEND','Dashboard Frontend Build','Build responsive dashboard UI, cards, table layout and charts placeholder.'],
    ['SECTION_04_BACKEND','Auth & Firestore Data Model','Setup collections, user roles, rules plan and realtime data flow.'],
    ['SECTION_05_QA','Dashboard QA','Test login, realtime data, responsive dashboard and table overflow.'],
    ['SECTION_10_ARCHIVE','Dashboard Version Archive','Archive database structure, UI version and deployment notes.']
  ],
  'Booking System': [
    ['SECTION_01_PM','Booking System Scope','Define booking services, availability, customer flow and admin process.'],
    ['SECTION_02_UIUX','Booking UX Flow','Design service selection, calendar flow, confirmation and mobile booking experience.'],
    ['SECTION_03_FRONTEND','Booking Frontend Build','Build booking form, slot display, confirmation screen and admin list UI.'],
    ['SECTION_04_BACKEND','Booking Data Structure','Setup bookings, service types, status, customer record and notification-ready fields.'],
    ['SECTION_05_QA','Booking QA','Test booking submission, mobile form, status update and empty/error states.']
  ],
  'Membership System': [
    ['SECTION_01_PM','Membership Scope Plan','Define member levels, access areas, approval flow and admin controls.'],
    ['SECTION_02_UIUX','Member Portal UX','Design login, profile, protected area and membership status screens.'],
    ['SECTION_03_FRONTEND','Membership Frontend Build','Build member dashboard, profile card and protected content layout.'],
    ['SECTION_04_BACKEND','Member Auth & Role Structure','Setup Firebase Auth, user roles, membership status and access rules.'],
    ['SECTION_05_QA','Membership QA','Test login, role access, mobile member view and restricted content behavior.']
  ],
  'Learning Management System': [
    ['SECTION_01_PM','Learning Platform Scope','Define subjects, lessons, quizzes, users and reporting need.'],
    ['SECTION_02_UIUX','Learning UX Architecture','Design course list, lesson page, quiz flow and student dashboard.'],
    ['SECTION_03_FRONTEND','LMS Frontend Build','Build lesson layout, quiz UI, progress card and dashboard screens.'],
    ['SECTION_04_BACKEND','LMS Data Structure','Setup courses, lessons, quizzes, progress and user records.'],
    ['SECTION_05_QA','Learning Flow QA','Test quiz flow, progress update, responsive lesson screen and user state.']
  ],
  'Custom Web System': null,
  'Portfolio Website': null,
  'Mobile App': null,
  'Hybrid Mobile App': null,
  'Branding System': null,
  'SEO Optimization': null,
  'Marketing Campaign': null
};
PROJECT_TASK_TEMPLATES['Company Profile Website'] = PROJECT_TASK_TEMPLATES['Corporate Website'];
PROJECT_TASK_TEMPLATES['Custom Web System'] = PROJECT_TASK_TEMPLATES['Dashboard System'];
PROJECT_TASK_TEMPLATES['Portfolio Website'] = PROJECT_TASK_TEMPLATES['Corporate Website'];
PROJECT_TASK_TEMPLATES['Mobile App'] = PROJECT_TASK_TEMPLATES['Custom Web System'];
PROJECT_TASK_TEMPLATES['Hybrid Mobile App'] = PROJECT_TASK_TEMPLATES['Custom Web System'];
PROJECT_TASK_TEMPLATES['Branding System'] = [
  ['SECTION_01_PM','Branding Scope Plan','Define brand direction, deliverables and approval process.'],
  ['SECTION_02_UIUX','Brand Identity Direction','Prepare visual direction, logo usage, palette and style system.'],
  ['SECTION_09_CONTENT','Brand Messaging','Prepare tagline, tone of voice and brand description.'],
  ['SECTION_07_MARKETING','Brand Launch Angle','Prepare positioning, offer angle and launch message.'],
  ['SECTION_05_QA','Brand Consistency Review','Review visual consistency, file naming and final presentation.'],
  ['SECTION_10_ARCHIVE','Brand Asset Archive','Archive final brand assets and guideline notes.']
];
PROJECT_TASK_TEMPLATES['SEO Optimization'] = [
  ['SECTION_01_PM','SEO Scope Plan','Define target pages, industry keywords, location and objective.'],
  ['SECTION_06_SEO','Technical SEO Audit','Prepare metadata, heading structure, schema, indexing and page speed checklist.'],
  ['SECTION_09_CONTENT','SEO Content Structure','Prepare page copy outline, keyword placement and content improvement notes.'],
  ['SECTION_05_QA','SEO QA Review','Check metadata, heading order, mobile performance and broken links.'],
  ['SECTION_10_ARCHIVE','SEO Report Archive','Archive SEO checklist, keywords and final notes.']
];
PROJECT_TASK_TEMPLATES['Marketing Campaign'] = [
  ['SECTION_01_PM','Campaign Scope Plan','Define campaign goal, target audience, offer and timeline.'],
  ['SECTION_07_MARKETING','Campaign Strategy','Prepare creative angle, channel plan and conversion message.'],
  ['SECTION_09_CONTENT','Campaign Copy','Prepare ad copy, landing copy and CTA variants.'],
  ['SECTION_02_UIUX','Campaign Visual Direction','Prepare creative layout, social format and landing visual concept.'],
  ['SECTION_05_QA','Campaign QA','Review links, copy, creative consistency and publishing checklist.']
];
function getTaskTemplate(projectType=''){
  return PROJECT_TASK_TEMPLATES[projectType] || DEFAULT_TASKS;
}


function navActive(){ const page = location.pathname.split('/').pop() || 'dashboard.html'; document.querySelectorAll('.nav a').forEach(a=>{ if(a.getAttribute('href')===page) a.classList.add('active'); }); }
navActive();

async function logActivity({projectId='', project='', department='SYSTEM', action, detail='', type='activity'}){
  try{
    await addDoc(collection(db,'department_logs'), { projectId, project, department, action, detail, type, createdAt:serverTimestamp() });
  }catch(e){ console.warn('logActivity failed', e); }
}
async function notify({projectId='', project='', title, message, level='INFO'}){
  try{
    await addDoc(collection(db,'notifications'), { projectId, project, title, message, level, read:false, createdAt:serverTimestamp() });
  }catch(e){ console.warn('notify failed', e); }
}

async function seedSystem(){
  for(const d of DEPARTMENTS){
    const sop=sopForDepartment(d.id);
    await setDoc(doc(db,'departments',d.id), { ...d, status:'ACTIVE', updatedAt:serverTimestamp() }, { merge:true });
    await setDoc(doc(db,'sop_templates',d.id), { department:d.id, title:sop.title, steps:sop.steps, checklist:sop.checklist, version:'2.7', status:'ACTIVE', updatedAt:serverTimestamp() }, { merge:true });
    await setDoc(doc(db,'department_templates',d.id), { department:d.id, name:d.name, short:d.short, role:d.role, defaultChecklist:sop.checklist, version:'2.7', updatedAt:serverTimestamp() }, { merge:true });
  }
  await setDoc(doc(db,'workflow','master'), { name:'Client to Final Delivery', stages:['CLIENT_REQUEST','PM_ANALYSIS','TASK_BREAKDOWN','DEPARTMENT_AI','QA_REVIEW','FINAL_DELIVERY'], version:'2.7', updatedAt:serverTimestamp() }, { merge:true });
  await setDoc(doc(db,'qa_reviews','master_checklist'), { title:'QA Master Approval Checklist', checklist:QA_REVIEW_CHECKLIST, version:'2.7', updatedAt:serverTimestamp() }, { merge:true });
  for(const [projectType,tasks] of Object.entries(PROJECT_TASK_TEMPLATES || {})){
    if(!tasks) continue;
    await setDoc(doc(db,'project_task_templates',projectType.replaceAll('/','-')), { projectType, taskCount:tasks.length, tasks:tasks.map(([department,title,detail])=>({department,title,detail})), version:'2.7', updatedAt:serverTimestamp() }, { merge:true });
  }

  for(const phase of AUTOMATION_PHASES){
    await setDoc(doc(db,'automation_layers',phase.id), { ...phase, version:'2.7', updatedAt:serverTimestamp() }, { merge:true });
  }
  for(const [category,detail] of KNOWLEDGE_BASE_CATEGORIES){
    await setDoc(doc(db,'knowledge_base',category.replaceAll(' ','_').toUpperCase()), { category, detail, status:'READY', version:'2.7', updatedAt:serverTimestamp() }, { merge:true });
  }
}

seedSystem().catch(console.warn);

function fillDepartmentSelects(){
  ['taskDepartment','outputDepartment','noteDepartment'].forEach(id=>{ const s=$(id); if(!s) return; s.innerHTML = DEPARTMENTS.map(d=>`<option value="${d.id}">${d.id} — ${esc(d.short)}</option>`).join(''); });
}
fillDepartmentSelects();
function checkedValues(name){ return Array.from(document.querySelectorAll(`input[name="${name}"]:checked`)).map(x=>x.value); }
function valueOf(id){ return $(id)?.value?.trim?.() || ''; }
function deptLabel(id){ const d=DEPARTMENTS.find(x=>x.id===id); return d ? `${d.id} — ${d.short}` : id; }

function renderDepartmentCards(){ const box=$('departmentCards'); if(!box) return; box.innerHTML = DEPARTMENTS.map((d,i)=>`<div class="card dept-card"><div class="dept-head"><span class="badge">${String(i+1).padStart(2,'0')}</span><span class="ai-avatar">${esc(d.icon)}</span></div><h3>${esc(d.name)}</h3><p class="dept-short">${esc(d.short)}</p><p class="muted">${esc(d.role)}</p><span class="badge green">ACTIVE</span></div>`).join(''); }
renderDepartmentCards();
function renderSop(){ const chips=$('sopChips'); if(chips) chips.innerHTML=DEPARTMENTS.map(d=>`<span class="sop-chip">${esc(d.icon)} ${esc(d.short)}</span>`).join(''); const list=$('aiRoleList'); if(list) list.innerHTML=DEPARTMENTS.map(d=>`<div class="ai-role-row"><span class="ai-avatar">${esc(d.icon)}</span><div><b>${esc(d.name)}</b><p class="muted">${esc(d.id)}</p></div><span class="badge green">READY</span></div>`).join(''); }
renderSop();

async function createAutoTasks(projectId, projectName, clientName, projectType=''){
  const template = getTaskTemplate(projectType);
  for(const [departmentId,title,detail] of template){
    const sop=sopForDepartment(departmentId);
    await addDoc(collection(db,'tasks'),{ projectId, project:projectName, client:clientName, projectType, department:departmentId, title, detail, status:'TODO', sopStatus:'PENDING_SOP', sopSteps:sop.steps, checklist:sop.checklist, checklistTotal:sop.checklist.length, checklistCompleted:0, qaChecklist:QA_REVIEW_CHECKLIST, qaStatus:'NOT_READY', priority:'NORMAL', source:'SOP_ENGINE_V2_7', createdAt:serverTimestamp(), updatedAt:serverTimestamp() });
  }
  await addDoc(collection(db,'workflow'),{ projectId, project:projectName, projectType, action:'SMART_TASK_TEMPLATE_CREATED', totalTasks:template.length, stage:'TASK_BREAKDOWN', createdAt:serverTimestamp() });
  await logActivity({projectId, project:projectName, department:'SECTION_01_PM', action:'Smart project task template created', detail:`${template.length} department tasks generated for ${projectType || 'General Project'}.`});
  await notify({projectId, project:projectName, title:'Smart workflow created', message:`${projectName} uses ${projectType || 'General Project'} template with ${template.length} tasks.`, level:'SUCCESS'});
}



// V4.1 FILE-BASED PROJECT INTAKE + AI TASK FORM READER
const TASK_FILE_READER_VERSION = '4.1';
function normalizeTaskText(text=''){
  return String(text || '').replace(/\r/g,'').replace(/[\t]+/g,' ').replace(/\u00a0/g,' ').trim();
}
function pickLineValue(text, labels=[]){
  const lines = normalizeTaskText(text).split('\n').map(x=>x.trim()).filter(Boolean);
  for(const label of labels){
    const rx = new RegExp(`^\\s*${label.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}\\s*[:\\-]\\s*(.+)$`, 'i');
    for(const line of lines){ const m=line.match(rx); if(m && m[1]) return m[1].trim(); }
  }
  return '';
}
function includesAny(text, words=[]){ const low=String(text||'').toLowerCase(); return words.some(w=>low.includes(String(w).toLowerCase())); }
function detectProjectTypeFromText(text){
  const raw=pickLineValue(text,['Project Type','Jenis Project','Jenis Projek','Type']);
  if(raw) return raw;
  if(includesAny(text,['ecommerce','e-commerce','produk','cart','checkout','payment','kedai online'])) return 'Digital & Physical Ecommerce Platform';
  if(includesAny(text,['booking','appointment','reservation','tempahan'])) return 'Booking System';
  if(includesAny(text,['dashboard','admin panel','report','analytics'])) return 'Dashboard System';
  if(includesAny(text,['landing page','sales page','funnel'])) return 'Landing Page';
  if(includesAny(text,['mobile app','android','ios'])) return 'Mobile App';
  if(includesAny(text,['seo','keyword','ranking'])) return 'SEO Optimization';
  return 'Corporate Website';
}
function detectPriorityFromText(text){
  const raw=pickLineValue(text,['Priority','Keutamaan','Urgency']);
  if(raw) return /urgent|segera/i.test(raw) ? 'URGENT' : /high|tinggi/i.test(raw) ? 'HIGH' : 'NORMAL';
  if(/urgent|asap|segera|minggu ini/i.test(text)) return 'URGENT';
  if(/high priority|priority tinggi|penting/i.test(text)) return 'HIGH';
  return 'NORMAL';
}
function splitListValue(v=''){
  return String(v||'').split(/[,;|\n]+/).map(x=>x.trim()).filter(Boolean);
}
function detectPagesFromText(text){
  const raw=pickLineValue(text,['Pages','Page','Website Structure','Struktur Website','Halaman']);
  const values=splitListValue(raw || text);
  const map=[['Home',['home','homepage','utama']],['About Us',['about','tentang']],['Services',['services','servis','perkhidmatan']],['Portfolio/Gallery',['portfolio','gallery','galeri']],['Products',['product','produk']],['Blog/Article',['blog','article','artikel']],['Booking',['booking','tempahan']],['Contact',['contact','hubungi']],['Admin Panel',['admin panel','admin']]];
  return map.filter(([name,keys])=>values.some(v=>keys.some(k=>v.toLowerCase().includes(k))) || keys.some(k=>String(text).toLowerCase().includes(k))).map(([name])=>name);
}
function detectFeaturesFromText(text){
  const raw=pickLineValue(text,['Features','Feature','Fungsi','Function Required','Features Required']);
  const source=raw || text;
  const map=[['Responsive Design',['responsive','mobile friendly']],['WhatsApp Button',['whatsapp','wa button']],['Contact Form',['contact form','borang']],['Google Maps',['google maps','maps','map']],['SEO Basic',['seo']],['Firebase Login',['login','auth','firebase auth']],['Admin Dashboard',['admin dashboard','dashboard admin']],['Payment Gateway',['payment','bayaran','stripe','billplz','toyyibpay']],['Multi Language',['multi language','dwibahasa','english','bahasa']],['Analytics Tracking',['analytics','tracking','pixel','ga4']]];
  return map.filter(([name,keys])=>keys.some(k=>String(source).toLowerCase().includes(k))).map(([name])=>name);
}
function detectAssetsFromText(text){
  const raw=pickLineValue(text,['Assets','Content Assets','Bahan','Content']);
  const source=raw || text;
  const map=[['Logo Ready',['logo ready','logo ada','logo']],['Images Ready',['images ready','gambar ada','image','photo','gambar']],['Copywriting Ready',['copywriting ready','content ready','copywriting','text content']],['Video Ready',['video']],['Product Detail Ready',['product detail','senarai produk','produk detail']],['Need Content Help',['need content','perlukan content','content help','copywriting help']]];
  return map.filter(([name,keys])=>keys.some(k=>String(source).toLowerCase().includes(k))).map(([name])=>name);
}
function extractTaskFormData(text){
  const clean=normalizeTaskText(text);
  let jsonData=null;
  try{ jsonData=JSON.parse(clean); }catch(e){ jsonData=null; }
  const get=(keys)=>{
    if(jsonData){ for(const k of keys){ if(jsonData[k]) return Array.isArray(jsonData[k]) ? jsonData[k].join(', ') : String(jsonData[k]); } }
    return pickLineValue(clean, keys);
  };
  const company=get(['Company','Company Name','Brand','Brand Name','Nama Syarikat','Nama Brand']);
  const client=get(['Client Name','Client','PIC','Nama Client','Nama Klien']);
  const title=get(['Project Title','Title','Nama Project','Nama Projek']) || `${company || client || 'Client'} Website Project`;
  const objective=get(['Main Objective','Objective','Objektif','Goal','Tujuan']) || clean.slice(0,500);
  const pages = jsonData?.pages || detectPagesFromText(clean);
  const features = jsonData?.features || detectFeaturesFromText(clean);
  const assets = jsonData?.assets || detectAssetsFromText(clean);
  return {
    clientName:client,
    companyName:company,
    businessType:get(['Business Category','Business Type','Kategori Bisnes','Industry']) || 'Other',
    phone:get(['Phone','WhatsApp','Whatsapp','Telefon','No Telefon']),
    email:get(['Email','E-mail']),
    existingWebsite:get(['Current Website','Website','Social Media','Existing Website']),
    projectTitle:title,
    projectType:get(['Project Type','Jenis Project','Jenis Projek','Type']) || detectProjectTypeFromText(clean),
    priority:detectPriorityFromText(clean),
    deadline:get(['Deadline','Target Deadline','Due Date','Tarikh Siap']),
    objective,
    designStyle:get(['Design Style','Style','Konsep Design','Design Direction']) || (includesAny(clean,['minimal','clean']) ? 'Minimal Clean' : includesAny(clean,['dark','gelap']) ? 'Dark Theme' : 'Modern Professional'),
    colors:get(['Preferred Color','Color','Colour','Warna','Tema Warna']),
    reference:get(['Reference Website','Reference','Rujukan','Design Link']),
    fontStyle:get(['Font','Font Preference','Visual Preference']),
    designNotes:get(['Design Notes','Nota Design','Konsep']),
    pages,
    pageNotes:get(['Page Notes','Section Notes','Nota Page']),
    features,
    featureNotes:get(['Feature Notes','Nota Fungsi']),
    assets,
    assetNotes:get(['Asset Link','File Notes','Asset Notes','Google Drive','Drive Link']),
    pmNotes:get(['PM Notes','Internal Notes','Nota PM','Instruction','Arahan']) || 'Generated from uploaded task form using AI Task Form Reader V4.2.',
    rawText:clean,
    source:'FILE_BASED_PROJECT_INTAKE_V4_2'
  };
}
function setSelectValue(id,value){ const el=$(id); if(!el||!value) return; const opts=Array.from(el.options||[]); const found=opts.find(o=>o.value.toLowerCase()===String(value).toLowerCase() || o.textContent.toLowerCase()===String(value).toLowerCase()); if(found) el.value=found.value; else if(opts.length) el.value=opts[0].value; }
function setChecks(name, values=[]){ const wanted=(values||[]).map(x=>String(x).toLowerCase()); document.querySelectorAll(`input[name="${name}"]`).forEach(cb=>{ cb.checked=wanted.some(v=>String(cb.value).toLowerCase()===v || v.includes(String(cb.value).toLowerCase()) || String(cb.value).toLowerCase().includes(v)); }); }
function applyTaskFormData(data){
  const set=(id,val)=>{ const el=$(id); if(el && val!==undefined && val!==null && String(val).trim()!=='') el.value=String(val); };
  set('reqClientName',data.clientName); set('reqCompanyName',data.companyName); setSelectValue('reqBusinessType',data.businessType);
  set('reqPhone',data.phone); set('reqEmail',data.email); set('reqExistingWebsite',data.existingWebsite);
  set('reqProjectTitle',data.projectTitle); setSelectValue('reqProjectType',data.projectType); setSelectValue('reqPriority',data.priority); set('reqDeadline',data.deadline);
  set('reqObjective',data.objective); setSelectValue('reqDesignStyle',data.designStyle); set('reqColors',data.colors); set('reqReference',data.reference); set('reqFontStyle',data.fontStyle); set('reqDesignNotes',data.designNotes);
  setChecks('reqPages',data.pages||[]); set('reqPageNotes',data.pageNotes); setChecks('reqFeatures',data.features||[]); set('reqFeatureNotes',data.featureNotes); setChecks('reqAssets',data.assets||[]); set('reqAssetNotes',data.assetNotes); set('reqPmNotes',data.pmNotes);
}
function renderTaskFileExtract(data){
  const box=$('taskFileExtractGrid'); if(!box) return;
  const rows=[['Client',data.companyName||data.clientName||'-'],['Project',data.projectTitle||'-'],['Type',data.projectType||'-'],['Priority',data.priority||'NORMAL'],['Pages',(data.pages||[]).join(', ')||'-'],['Features',(data.features||[]).join(', ')||'-']];
  box.innerHTML=rows.map(([k,v])=>`<div class="parser-pill"><b>${esc(k)}</b><span>${esc(v)}</span></div>`).join(''); box.style.display='grid';
}

function loadExternalScript(src){
  return new Promise((resolve,reject)=>{
    const found=document.querySelector(`script[src="${src}"]`);
    if(found){ found.addEventListener('load',resolve,{once:true}); if(found.dataset.loaded==='1') resolve(); return; }
    const script=document.createElement('script'); script.src=src; script.async=true;
    script.onload=()=>{ script.dataset.loaded='1'; resolve(); };
    script.onerror=()=>reject(new Error(`Cannot load extractor library: ${src}`));
    document.head.appendChild(script);
  });
}
function xmlTextToPlainText(xml=''){
  return String(xml)
    .replace(/<w:tab\/?\s*>/g,'\t')
    .replace(/<w:br\/?\s*>/g,'\n')
    .replace(/<\/w:p>/g,'\n')
    .replace(/<[^>]+>/g,'')
    .replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&apos;/g,"'")
    .replace(/\n{3,}/g,'\n\n').trim();
}
async function readDocxTaskFile(file){
  await loadExternalScript('https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js');
  if(!window.JSZip) throw new Error('DOCX extractor failed to load. Please convert DOCX to TXT if offline.');
  const zip=await window.JSZip.loadAsync(await file.arrayBuffer());
  const doc=zip.file('word/document.xml');
  if(!doc) throw new Error('DOCX file does not contain word/document.xml.');
  const xml=await doc.async('string');
  return xmlTextToPlainText(xml);
}
async function readPdfTaskFile(file){
  await loadExternalScript('https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.min.mjs').catch(async()=>{
    await loadExternalScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.min.mjs');
  });
  const pdfjs=window.pdfjsLib;
  if(!pdfjs) throw new Error('PDF extractor failed to load. Please convert PDF to TXT if offline.');
  try{ pdfjs.GlobalWorkerOptions.workerSrc='https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.worker.min.mjs'; }catch(e){}
  const pdf=await pdfjs.getDocument({data:await file.arrayBuffer()}).promise;
  const pages=[];
  for(let i=1;i<=pdf.numPages;i++){
    const page=await pdf.getPage(i);
    const content=await page.getTextContent();
    pages.push(content.items.map(item=>item.str||'').join(' '));
  }
  const text=pages.join('\n\n').trim();
  if(!text) throw new Error('PDF text not detected. This may be scanned image PDF; OCR/API support is future phase.');
  return text;
}
async function readTaskFile(file){
  if(!file) throw new Error('Please select a task form file.');
  const name=String(file.name||'').toLowerCase();
  const type=String(file.type||'').toLowerCase();
  if(/\.(txt|md|json|csv|text)$/i.test(name) || /text|json|csv/.test(type)) return await file.text();
  if(/\.docx$/i.test(name) || type.includes('wordprocessingml')) return await readDocxTaskFile(file);
  if(/\.pdf$/i.test(name) || type.includes('pdf')) return await readPdfTaskFile(file);
  throw new Error('V4.2 supports TXT, MD, JSON, CSV, PDF and DOCX. Unsupported file type.');
}
async function handleTaskFileParse(){
  const input=$('taskFileInput'), msg=$('taskFileMsg'), preview=$('taskFilePreview');
  try{
    const file=input?.files?.[0]; const text=await readTaskFile(file); const data=extractTaskFormData(text); applyTaskFormData(data); renderTaskFileExtract(data);
    if(preview){ preview.style.display='block'; preview.textContent=text.slice(0,3000); }
    if(msg) msg.textContent='Task form read successfully. Intake form has been auto-filled. Review quickly, then click Save Requirement & Generate Project.';
  }catch(err){ if(msg) msg.textContent=err.message || 'File reader failed.'; }
}
$('parseTaskFileBtn')?.addEventListener('click', handleTaskFileParse);
$('clearTaskFileBtn')?.addEventListener('click', ()=>{ const i=$('taskFileInput'); if(i) i.value=''; const p=$('taskFilePreview'); if(p){p.textContent='';p.style.display='none';} const g=$('taskFileExtractGrid'); if(g){g.innerHTML='';g.style.display='none';} const m=$('taskFileMsg'); if(m)m.textContent=''; });
const taskDrop=$('taskFileDropZone');
if(taskDrop){ ['dragenter','dragover'].forEach(ev=>taskDrop.addEventListener(ev,e=>{e.preventDefault();taskDrop.classList.add('dragover')})); ['dragleave','drop'].forEach(ev=>taskDrop.addEventListener(ev,e=>{e.preventDefault();taskDrop.classList.remove('dragover')})); taskDrop.addEventListener('drop',e=>{ const input=$('taskFileInput'); if(input && e.dataTransfer?.files?.length){ input.files=e.dataTransfer.files; handleTaskFileParse(); }}); }

function buildRequirementPayload(){
  const company=valueOf('reqCompanyName');
  const client=valueOf('reqClientName');
  const title=valueOf('reqProjectTitle') || `${company || client || 'Client'} Website Project`;
  return {
    clientName:client,
    companyName:company,
    businessType:valueOf('reqBusinessType'),
    phone:valueOf('reqPhone'),
    email:valueOf('reqEmail'),
    existingWebsite:valueOf('reqExistingWebsite'),
    projectTitle:title,
    projectType:valueOf('reqProjectType'),
    priority:valueOf('reqPriority') || 'NORMAL',
    deadline:valueOf('reqDeadline'),
    objective:valueOf('reqObjective'),
    designStyle:valueOf('reqDesignStyle'),
    colors:valueOf('reqColors'),
    reference:valueOf('reqReference'),
    fontStyle:valueOf('reqFontStyle'),
    designNotes:valueOf('reqDesignNotes'),
    pages:checkedValues('reqPages'),
    pageNotes:valueOf('reqPageNotes'),
    features:checkedValues('reqFeatures'),
    featureNotes:valueOf('reqFeatureNotes'),
    assets:checkedValues('reqAssets'),
    assetNotes:valueOf('reqAssetNotes'),
    pmNotes:valueOf('reqPmNotes'),
    status:'REQUIREMENT_RECEIVED',
    source: valueOf('taskFileInput') ? 'FILE_BASED_PROJECT_INTAKE_V4_2' : 'CLIENT_REQUIREMENT_TEMPLATE',
    createdAt:serverTimestamp(),
    updatedAt:serverTimestamp()
  };
}
function requirementToSummary(r){
  return [
    `Objective: ${r.objective || '-'}`,
    `Design: ${r.designStyle || '-'} | Colors: ${r.colors || '-'}`,
    `Pages: ${(r.pages||[]).join(', ') || '-'}`,
    `Features: ${(r.features||[]).join(', ') || '-'}`,
    `Reference: ${r.reference || '-'}`,
    `Assets: ${(r.assets||[]).join(', ') || '-'}`,
    `Asset Notes: ${r.assetNotes || '-'}`,
    `PM Notes: ${r.pmNotes || '-'}`
  ].join('\n');
}
async function createProjectFromRequirement(requirement, requirementId=''){
  const projectName=requirement.projectTitle;
  const clientName=requirement.companyName || requirement.clientName || 'Client';
  const payload={
    name:projectName,
    client:clientName,
    type:requirement.projectType,
    clientRequest:requirementToSummary(requirement),
    pmAnalysis:requirement.pmNotes || `PM review required for ${requirement.projectType}.`,
    priority:requirement.priority || 'NORMAL',
    package:requirement.projectType || '',
    dueDate:requirement.deadline || '',
    requirementId,
    status:'PM_ANALYSIS',
    workflowStage:'TASK_BREAKDOWN',
    progress:10,
    taskTotal:getTaskTemplate(requirement.projectType).length,
    taskCompleted:0,
    createdAt:serverTimestamp(),
    updatedAt:serverTimestamp()
  };
  const ref=await addDoc(collection(db,'projects'),payload);
  await createAutoTasks(ref.id, projectName, clientName, requirement.projectType);
  await addDoc(collection(db,'workflow'),{projectId:ref.id, requirementId, project:projectName, action:'CLIENT_REQUIREMENT_IMPORTED', stage:'CLIENT_REQUEST', createdAt:serverTimestamp()});
  await logActivity({projectId:ref.id, project:projectName, department:'SECTION_01_PM', action:'Project intake imported', detail:`Requirement template converted to project for ${clientName}.`});
  return ref.id;
}
async function saveRequirement({generateProject=false}={}){
  const form=$('clientRequirementForm'); if(!form) return;
  const msg=$('clientRequirementMsg');
  const requirement=buildRequirementPayload();
  const ref=await addDoc(collection(db,'project_intake'), requirement);
  let projectId='';
  if(generateProject){
    projectId=await createProjectFromRequirement(requirement, ref.id);
    await updateDoc(doc(db,'project_intake',ref.id), {status:'PROJECT_GENERATED', projectId, updatedAt:serverTimestamp()});
    await notify({projectId, project:requirement.projectTitle, title:'Requirement converted to project', message:`${requirement.projectTitle} is now active in Command Center.`, level:'SUCCESS'});
  }else{
    await notify({project:requirement.projectTitle, title:'New project intake saved', message:`${requirement.projectTitle} saved for PM review.`, level:'INFO'});
  }
  form.reset();
  if(msg) msg.textContent = generateProject ? 'Requirement saved and project workflow generated.' : 'Requirement saved.';
}
$('clientRequirementForm')?.addEventListener('submit', async e=>{ e.preventDefault(); await saveRequirement({generateProject:true}); });
$('saveRequirementOnlyBtn')?.addEventListener('click', async ()=>{ await saveRequirement({generateProject:false}); });
$('clearClientFormBtn')?.addEventListener('click', ()=> $('clientRequirementForm')?.reset());
$('printBlankBtn')?.addEventListener('click', ()=> window.print());

$('projectForm')?.addEventListener('submit', async e=>{ e.preventDefault();
  const projectName=$('projectName').value.trim(); const clientName=$('clientName').value.trim();
  const selectedProjectType=$('projectType')?.value||'';
  const payload={ name:projectName, client:clientName, type:selectedProjectType, clientRequest:$('clientRequest')?.value.trim()||'', pmAnalysis:$('pmAnalysis')?.value.trim()||'', priority:$('priority').value, package:$('projectPackage')?.value||'', dueDate:$('dueDate')?.value||'', status:'PM_ANALYSIS', workflowStage:'TASK_BREAKDOWN', progress:10, taskTotal:getTaskTemplate(selectedProjectType).length, taskCompleted:0, createdAt:serverTimestamp(), updatedAt:serverTimestamp() };
  const ref=await addDoc(collection(db,'projects'),payload); await createAutoTasks(ref.id, projectName, clientName, selectedProjectType); e.target.reset();
});

$('taskForm')?.addEventListener('submit', async e=>{ e.preventDefault();
  const payload={ title:$('taskTitle').value.trim(), project:$('taskProject').value.trim(), department:$('taskDepartment').value, status:$('taskStatus')?.value||'TODO', detail:$('taskDetail')?.value.trim()||'', source:'MANUAL', createdAt:serverTimestamp(), updatedAt:serverTimestamp() };
  await addDoc(collection(db,'tasks'),payload); await logActivity({project:payload.project, department:payload.department, action:'Manual task created', detail:payload.title}); await notify({project:payload.project, title:'New manual task', message:payload.title}); e.target.reset(); fillDepartmentSelects();
});

$('noteForm')?.addEventListener('submit', async e=>{ e.preventDefault();
  const department=$('noteDepartment').value, project=$('noteProject').value.trim(), note=$('noteText').value.trim();
  await logActivity({project, department, action:'Department note added', detail:note, type:'note'}); await notify({project, title:'Department note', message:`${deptLabel(department)}: ${note}`, level:'INFO'}); e.target.reset(); fillDepartmentSelects();
});

$('outputForm')?.addEventListener('submit', async e=>{ e.preventDefault();
  const payload={ filename:$('outputFilename').value.trim(), project:$('outputProject').value.trim(), department:$('outputDepartment').value, type:$('outputType').value, status:'QA_REVIEW', createdAt:serverTimestamp(), updatedAt:serverTimestamp() };
  await addDoc(collection(db,'outputs'),payload); await addDoc(collection(db,'deliveries'),{...payload, deliveryStage:'QA_REVIEW'}); await logActivity({project:payload.project, department:payload.department, action:'Output sent to QA Review', detail:payload.filename}); await notify({project:payload.project, title:'Output waiting for QA', message:payload.filename, level:'REVIEW'}); e.target.reset(); fillDepartmentSelects();
});

async function updateStatus(col,id,field,value,meta={}){
  await updateDoc(doc(db,col,id), {[field]:value, updatedAt:serverTimestamp()});
  await logActivity({project:meta.project||'', department:meta.department||'SYSTEM', action:`${col} ${field} updated`, detail:value});
  await notify({project:meta.project||'', title:'Status updated', message:`${meta.title||col} → ${value}`, level:value.includes('REJECT')?'ERROR':'INFO'});
}
document.addEventListener('click', async e=>{
  const qaBtn=e.target.closest('[data-qa-action]');
  if(qaBtn){ await handleQaAction(qaBtn); return; }
  const btn=e.target.closest('[data-update]'); if(!btn) return;
  const [col,id,field,value]=btn.dataset.update.split('|');
  await updateStatus(col,id,field,value,{project:btn.dataset.project, department:btn.dataset.department, title:btn.dataset.title});
});


async function handleQaAction(btn){
  const id=btn.dataset.id, action=btn.dataset.qaAction, title=btn.dataset.title||'Output', project=btn.dataset.project||'', department=btn.dataset.department||'SECTION_05_QA';
  let status='QA_REVIEW', deliveryStage='QA_REVIEW', qaPassed=0, level='REVIEW', note='';
  if(action==='review'){
    note=prompt('QA review note:', 'Initial QA review started.') || 'QA review started.';
    status='QA_REVIEW'; deliveryStage='QA_REVIEW'; qaPassed=2;
  }else if(action==='approve'){
    note=prompt('QA approval note:', 'All QA checklist passed. Ready for final delivery.') || 'QA approved.';
    status='APPROVED'; deliveryStage='APPROVED_BY_QA'; qaPassed=QA_REVIEW_CHECKLIST.length; level='SUCCESS';
  }else if(action==='reject'){
    note=prompt('Reason for rejection / revision:', 'Revision needed before final delivery.') || 'Revision needed.';
    status='REVISION_NEEDED'; deliveryStage='REVISION_REQUIRED'; qaPassed=0; level='ERROR';
  }else if(action==='deliver'){
    note=prompt('Final delivery note:', 'Final files delivered to client and archived.') || 'Final delivery completed.';
    status='DELIVERED'; deliveryStage='FINAL_DELIVERY'; qaPassed=QA_REVIEW_CHECKLIST.length; level='SUCCESS';
  }
  await updateDoc(doc(db,'outputs',id), {status, deliveryStage, qaChecklist:QA_REVIEW_CHECKLIST, qaPassed, qaNote: action==='deliver' ? undefined : note, deliveryNote: action==='deliver' ? note : undefined, updatedAt:serverTimestamp()});
  await addDoc(collection(db,'qa_reviews'), {outputId:id, project, department, filename:title, action, status, deliveryStage, checklist:QA_REVIEW_CHECKLIST, passed:qaPassed, note, createdAt:serverTimestamp()});
  if(action==='deliver') await addDoc(collection(db,'final_deliveries'), {outputId:id, project, department, filename:title, status:'DELIVERED', deliveryNote:note, archived:true, createdAt:serverTimestamp()});
  await logActivity({project, department:'SECTION_05_QA', action:`QA ${action.toUpperCase()}`, detail:`${title} → ${status}. ${note}`});
  await notify({project, title:`QA ${action.toUpperCase()}`, message:`${title} → ${status}`, level});
}


function renderClientRequirements(){ const box=$('clientRequirementList'); if(!box) return; onSnapshot(query(collection(db,'project_intake'), orderBy('createdAt','desc'), limit(12)), snap=>{ let html=''; snap.forEach(d=>{const r=d.data(); html+=`<div class="feed-item"><b>${esc(r.projectTitle||'-')}</b><p>${esc(r.companyName||r.clientName||'Client')} • ${esc(r.projectType||'-')}</p><div class="task-meta"><span class="badge ${badgeClass(r.status)}">${esc(r.status)}</span><span class="badge purple">${esc(r.priority||'NORMAL')}</span></div><time>${esc(nowLabel(r.createdAt))}</time></div>`}); box.innerHTML=html || '<p class="muted">No project intake yet.</p>'; }); }

function renderProjects(){ const box=$('projectsTable'); const total=$('totalProjects'); if(!box&&!total) return;
  onSnapshot(query(collection(db,'projects'), orderBy('createdAt','desc')), snap=>{
    if(total) total.textContent=snap.size; if(!box) return;
    let html='<table class="table"><thead><tr><th>Project</th><th>Client</th><th>Stage</th><th>Priority</th><th>Progress</th><th>Action</th></tr></thead><tbody>';
    snap.forEach(d=>{const p=d.data(); const prog=Math.min(100,Number(p.progress||0)); html+=`<tr><td data-label="Project"><b>${esc(p.name)}</b><br><small class="muted">${esc(p.type||p.package||'')}</small></td><td data-label="Client">${esc(p.client)}</td><td data-label="Stage"><span class="badge ${badgeClass(p.status)}">${esc(p.status)}</span><br><small class="muted">${esc(p.workflowStage||'-')}</small></td><td data-label="Priority">${esc(p.priority)}</td><td data-label="Progress"><div class="progress"><span style="width:${prog}%"></span></div><small>${prog}%</small></td><td data-label="Action"><div class="actions"><button class="btn small ghost" data-title="${esc(p.name)}" data-project="${esc(p.name)}" data-update="projects|${d.id}|status|IN_PROGRESS">Start</button><button class="btn small orange" data-title="${esc(p.name)}" data-project="${esc(p.name)}" data-update="projects|${d.id}|status|QA_REVIEW">QA</button><button class="btn small green" data-title="${esc(p.name)}" data-project="${esc(p.name)}" data-update="projects|${d.id}|status|DELIVERED">Delivered</button></div></td></tr>`});
    html+='</tbody></table>'; box.innerHTML=html;
  });
}
function renderTasks(){ const total=$('totalTasks'); const lanes={TODO:$('laneTodo'), IN_PROGRESS:$('laneProgress'), QA_REVIEW:$('laneReview'), APPROVED:$('laneApproved'), COMPLETED:$('laneDone')}; const counts={TODO:$('countTodo'), IN_PROGRESS:$('countProgress'), QA_REVIEW:$('countReview'), APPROVED:$('countApproved'), COMPLETED:$('countDone')}; const hasLane=lanes.TODO; if(!hasLane&&!total) return;
  onSnapshot(query(collection(db,'tasks'), orderBy('createdAt','desc')), snap=>{
    if(total) total.textContent=snap.size; if(!hasLane) return; Object.values(lanes).forEach(l=>{ if(l) l.innerHTML=''; }); const c={TODO:0,IN_PROGRESS:0,QA_REVIEW:0,APPROVED:0,COMPLETED:0};
    snap.forEach(d=>{const t=d.data(); const status=lanes[t.status]?t.status:'TODO'; c[status]++; const lane=lanes[status]; lane.innerHTML+=`<div class="task"><b>${esc(t.title)}</b><p class="muted">${esc(t.project)} • ${esc(deptLabel(t.department))}</p>${t.detail?`<p class="task-detail">${esc(t.detail)}</p>`:''}${t.checklistTotal?`<p class="muted">SOP: ${esc(t.sopStatus||'PENDING_SOP')} • Checklist ${Number(t.checklistCompleted||0)}/${Number(t.checklistTotal||0)}</p>`:''}<div class="task-meta"><span class="badge ${badgeClass(t.status)}">${esc(t.status)}</span><span class="badge purple">${esc(t.source||'TASK')}</span></div><div class="actions"><button class="btn small ghost" data-title="${esc(t.title)}" data-project="${esc(t.project)}" data-department="${esc(t.department)}" data-update="tasks|${d.id}|status|IN_PROGRESS">Start</button><button class="btn small orange" data-title="${esc(t.title)}" data-project="${esc(t.project)}" data-department="${esc(t.department)}" data-update="tasks|${d.id}|status|QA_REVIEW">QA</button><button class="btn small green" data-title="${esc(t.title)}" data-project="${esc(t.project)}" data-department="${esc(t.department)}" data-update="tasks|${d.id}|status|APPROVED">Approve</button><button class="btn small" data-title="${esc(t.title)}" data-project="${esc(t.project)}" data-department="${esc(t.department)}" data-update="tasks|${d.id}|status|COMPLETED">Done</button><button class="btn small red" data-title="${esc(t.title)}" data-project="${esc(t.project)}" data-department="${esc(t.department)}" data-update="tasks|${d.id}|status|REVISION_NEEDED">Reject</button></div></div>`});
    Object.entries(counts).forEach(([k,el])=>{ if(el) el.textContent=c[k]; });
  });
}
function renderOutputs(){ const box=$('outputsList'); const total=$('totalOutputs'); if(!box&&!total) return;
  onSnapshot(query(collection(db,'outputs'), orderBy('createdAt','desc')), snap=>{
    if(total) total.textContent=snap.size; if(!box) return; let html='';
    snap.forEach(d=>{const o=d.data(); const checklist=o.qaChecklist||QA_REVIEW_CHECKLIST; const passed=Number(o.qaPassed||0); html+=`<div class="feed-item qa-output-card"><b>${esc(o.filename)}</b><p>${esc(o.project)} • ${esc(deptLabel(o.department))} • ${esc(o.type)}</p>${o.qaNote?`<p class="task-detail"><b>QA Note:</b> ${esc(o.qaNote)}</p>`:''}${o.deliveryNote?`<p class="task-detail"><b>Delivery Note:</b> ${esc(o.deliveryNote)}</p>`:''}<p class="muted">QA Checklist: ${passed}/${checklist.length} passed</p><div class="qa-checklist-mini">${checklist.map((x,i)=>`<span class="badge ${i<passed?'green':'purple'}">${i+1}. ${esc(x)}</span>`).join('')}</div><div class="task-meta"><span class="badge ${badgeClass(o.status)}">${esc(o.status)}</span><span class="badge purple">${esc(o.deliveryStage||'QA_GATE')}</span></div><div class="actions"><button class="btn small orange" data-qa-action="review" data-id="${d.id}" data-title="${esc(o.filename)}" data-project="${esc(o.project)}" data-department="${esc(o.department)}">QA Review</button><button class="btn small green" data-qa-action="approve" data-id="${d.id}" data-title="${esc(o.filename)}" data-project="${esc(o.project)}" data-department="${esc(o.department)}">Approve</button><button class="btn small red" data-qa-action="reject" data-id="${d.id}" data-title="${esc(o.filename)}" data-project="${esc(o.project)}" data-department="${esc(o.department)}">Reject</button><button class="btn small" data-qa-action="deliver" data-id="${d.id}" data-title="${esc(o.filename)}" data-project="${esc(o.project)}" data-department="${esc(o.department)}">Final Deliver</button></div></div>`});
    box.innerHTML=html || '<p class="muted">No output record yet.</p>';
  });
}
function renderLogs(){ const box=$('activityFeed'); if(!box) return; onSnapshot(query(collection(db,'department_logs'), orderBy('createdAt','desc'), limit(30)), snap=>{ let html=''; snap.forEach(d=>{const l=d.data(); html+=`<div class="feed-item"><b>${esc(l.action)}</b><p>${esc(l.project||'General')} • ${esc(deptLabel(l.department))}</p><p>${esc(l.detail||'')}</p><time>${esc(nowLabel(l.createdAt))}</time></div>`}); box.innerHTML=html || '<p class="muted">No activity yet.</p>'; }); }
function renderNotifications(){ const box=$('notificationFeed'); const total=$('totalNotifications'); if(!box&&!total) return; onSnapshot(query(collection(db,'notifications'), orderBy('createdAt','desc'), limit(20)), snap=>{ if(total) total.textContent=snap.size; if(!box) return; let html=''; snap.forEach(d=>{const n=d.data(); html+=`<div class="feed-item"><b>${esc(n.title)}</b><p>${esc(n.message)}</p><time>${esc(nowLabel(n.createdAt))}</time></div>`}); box.innerHTML=html || '<p class="muted">No notifications yet.</p>'; }); }

renderClientRequirements(); renderProjects(); renderTasks(); renderOutputs(); renderLogs(); renderNotifications();

function renderSopEngine(){
  const sopBox=$('sopTemplateList');
  if(sopBox){
    sopBox.innerHTML=DEPARTMENTS.map(d=>{ const sop=sopForDepartment(d.id); return `<div class="feed-item"><b>${esc(sop.title)}</b><p>${esc(d.id)} • ${esc(d.short)}</p><p class="muted">${sop.steps.map((x,i)=>`${i+1}. ${x}`).join(' | ')}</p><div class="task-meta"><span class="badge green">ACTIVE</span><span class="badge purple">${sop.checklist.length} Checklist</span></div></div>`; }).join('');
  }
  const templateBox=$('taskTemplateList');
  if(templateBox){
    templateBox.innerHTML=Object.entries(PROJECT_TASK_TEMPLATES).filter(([,tasks])=>!!tasks).map(([type,tasks])=>`<div class="feed-item"><b>${esc(type)}</b><p>${tasks.length} auto department tasks</p><p class="muted">${tasks.map(x=>deptLabel(x[0])).join(' → ')}</p><span class="badge orange">AUTO TEMPLATE</span></div>`).join('');
  }
  const qaBox=$('qaChecklistList');
  if(qaBox){
    qaBox.innerHTML=`<div class="feed-item"><b>QA Master Approval Checklist</b><p class="muted">${QA_REVIEW_CHECKLIST.map((x,i)=>`${i+1}. ${x}`).join(' | ')}</p><div class="task-meta"><span class="badge green">APPROVE</span><span class="badge red">REJECT / REVISION</span></div></div>`;
  }
}
renderSopEngine();


// =========================================================
// PROJECT PIPELINE ENGINE v2.6
// Purpose: workflow brain, auto department routing and realtime office monitoring
// =========================================================
const PIPELINE_STAGES = [
  {key:'CLIENT_REQUEST', label:'Client'},
  {key:'PM_ANALYSIS', label:'PM AI'},
  {key:'TASK_BREAKDOWN', label:'Command'},
  {key:'DEPARTMENT_AI', label:'Department'},
  {key:'QA_REVIEW', label:'QA'},
  {key:'FINAL_DELIVERY', label:'Delivery'}
];
const PIPELINE_STAGE_INDEX = {CLIENT_REQUEST:0, PM_ANALYSIS:1, TASK_BREAKDOWN:2, DEPARTMENT_AI:3, IN_PROGRESS:3, QA_REVIEW:4, APPROVED_BY_QA:4, FINAL_DELIVERY:5, DELIVERED:5};

function pipelineStageIndex(project){
  const raw = project.workflowStage || project.status || 'CLIENT_REQUEST';
  return PIPELINE_STAGE_INDEX[raw] ?? 1;
}
function pipelineNextAction(project, completed, total){
  const status = project.status || 'PM_ANALYSIS';
  if(status === 'DELIVERED') return 'Final delivery completed and ready for archive review.';
  if(status === 'QA_REVIEW') return 'QA AI perlu review output dan approve/reject.';
  if(total && completed >= total) return 'Semua task siap. Hantar output ke QA Review.';
  if(status === 'PM_ANALYSIS') return 'PM AI perlu semak scope dan pastikan task breakdown lengkap.';
  return 'Department AI perlu teruskan execution mengikut SOP task.';
}
function renderPipelineRoutingRules(){
  const box=$('pipelineRoutingRules'); if(!box) return;
  const rules=[
    ['SECTION_01_PM','PM AI receives client requirement and creates project breakdown.'],
    ['SECTION_02_UIUX','UIUX receives design direction, layout flow and responsive structure task.'],
    ['SECTION_09_CONTENT','Content receives copywriting, messaging, CTA and FAQ task.'],
    ['SECTION_03_FRONTEND','Frontend receives approved structure and builds responsive interface.'],
    ['SECTION_04_BACKEND','Backend receives auth, Firestore, API and integration task.'],
    ['SECTION_06_SEO','SEO receives metadata, heading, schema and indexing readiness task.'],
    ['SECTION_05_QA','QA receives final output for approval gate before delivery.'],
    ['SECTION_10_ARCHIVE','Archive receives delivery record, version note and reusable knowledge.']
  ];
  box.innerHTML=rules.map(([id,detail])=>{ const d=DEPARTMENTS.find(x=>x.id===id)||{}; return `<div class="routing-rule"><span class="ai-avatar">${esc(d.icon||'AI')}</span><div><b>${esc(d.short||id)}</b><p class="muted">${esc(detail)}</p></div></div>`; }).join('');
}
function renderPipelineEngine(){
  const list=$('pipelineProjectList');
  const projectTotal=$('pipelineTotalProjects'), taskTotal=$('pipelineTotalTasks'), qaReady=$('pipelineQaReady'), delivered=$('pipelineDelivered');
  if(!list && !projectTotal && !taskTotal && !qaReady && !delivered) return;
  const state={projects:[], tasks:[], deliveries:0};
  const paint=()=>{
    if(projectTotal) projectTotal.textContent=state.projects.length;
    if(taskTotal) taskTotal.textContent=state.tasks.length;
    if(qaReady) qaReady.textContent=state.tasks.filter(t=>t.status==='QA_REVIEW').length;
    if(delivered) delivered.textContent=state.deliveries;
    if(!list) return;
    const tasksByProject={};
    state.tasks.forEach(t=>{ const key=t.projectId || t.project || 'UNKNOWN'; (tasksByProject[key] ||= []).push(t); });
    list.innerHTML=state.projects.map(p=>{
      const taskSet=[...(tasksByProject[p.id]||[]), ...(tasksByProject[p.name]||[])];
      const total=Number(p.taskTotal||taskSet.length||0);
      const completed=taskSet.filter(t=>['COMPLETED','APPROVED','DELIVERED'].includes(t.status)).length || Number(p.taskCompleted||0);
      const progress=total ? Math.min(100,Math.round((completed/total)*100)) : Number(p.progress||10);
      const idx=pipelineStageIndex(p);
      const stages=PIPELINE_STAGES.map((s,i)=>`<span class="pipeline-stage ${i<=idx?'active':''}" title="${esc(s.label)}"></span>`).join('');
      return `<div class="pipeline-project-card"><div class="pipeline-project-head"><div><h4>${esc(p.name)}</h4><p class="muted">${esc(p.client||'Client')} • ${esc(p.type||p.package||'General Project')}</p></div><span class="badge ${badgeClass(p.status)}">${esc(p.status||'PM_ANALYSIS')}</span></div><div class="pipeline-stage-grid">${stages}</div><div><div class="progress"><span style="width:${progress}%"></span></div><small class="muted">${completed}/${total || 0} tasks completed • ${progress}%</small></div><p class="task-detail"><b>Next Action:</b> ${esc(pipelineNextAction(p, completed, total))}</p><div class="pipeline-meta"><span class="badge purple">Stage: ${esc(p.workflowStage||'TASK_BREAKDOWN')}</span><span class="badge orange">Priority: ${esc(p.priority||'NORMAL')}</span><span class="badge">Tasks: ${taskSet.length}</span></div></div>`;
    }).join('') || '<p class="muted">No project pipeline yet. Start from Project Intake.</p>';
  };
  onSnapshot(query(collection(db,'projects'), orderBy('createdAt','desc')), snap=>{ state.projects=[]; snap.forEach(d=>state.projects.push({id:d.id,...d.data()})); paint(); });
  onSnapshot(query(collection(db,'tasks'), orderBy('createdAt','desc')), snap=>{ state.tasks=[]; snap.forEach(d=>state.tasks.push({id:d.id,...d.data()})); paint(); });
  onSnapshot(query(collection(db,'final_deliveries'), orderBy('createdAt','desc')), snap=>{ state.deliveries=snap.size; paint(); });
}
$('refreshPipelineBtn')?.addEventListener('click', ()=>{ renderPipelineRoutingRules(); });
renderPipelineRoutingRules();
renderPipelineEngine();


function renderAutomationLayer(){
  const box=$('automationLayerList'); if(!box) return;
  box.innerHTML=AUTOMATION_PHASES.map((p,i)=>`<div class="feed-item"><b>${String(i+1).padStart(2,'0')} — ${esc(p.title)}</b><p class="muted">${esc(p.detail)}</p><div class="task-meta"><span class="badge ${badgeClass(p.status)}">${esc(p.status)}</span><span class="badge purple">VERSION 2.7</span></div></div>`).join('');
}
function renderKnowledgeBaseSystem(){
  const box=$('knowledgeBaseList'); if(!box) return;
  box.innerHTML=KNOWLEDGE_BASE_CATEGORIES.map(([title,detail])=>`<div class="feed-item"><b>${esc(title)}</b><p class="muted">${esc(detail)}</p><span class="badge green">READY</span></div>`).join('');
}
function renderAiCommandCenter(){
  const deptBox=$('aiStaffStatusList'), workBox=$('activeWorkloadList'), blockedBox=$('blockedTaskList');
  if(deptBox) deptBox.innerHTML=DEPARTMENTS.map(d=>`<div class="ai-role-row"><span class="ai-avatar">${esc(d.icon)}</span><div><b>${esc(d.short)}</b><p class="muted">${esc(d.role)}</p></div><span class="badge green">ONLINE</span></div>`).join('');
  if(!workBox && !blockedBox) return;
  onSnapshot(query(collection(db,'tasks'), orderBy('createdAt','desc')), snap=>{
    const tasks=[]; snap.forEach(d=>tasks.push({id:d.id,...d.data()}));
    if(workBox){
      const active=tasks.filter(t=>['TODO','IN_PROGRESS','QA_REVIEW','REVISION_NEEDED'].includes(t.status)).slice(0,20);
      workBox.innerHTML=active.map(t=>`<div class="feed-item"><b>${esc(t.title)}</b><p>${esc(t.project)} • ${esc(deptLabel(t.department))}</p><div class="task-meta"><span class="badge ${badgeClass(t.status)}">${esc(t.status)}</span><span class="badge purple">${esc(t.source||'TASK')}</span></div></div>`).join('') || '<p class="muted">No active workload.</p>';
    }
    if(blockedBox){
      const blocked=tasks.filter(t=>['BLOCKED','REVISION_NEEDED','REJECTED'].includes(t.status)).slice(0,20);
      blockedBox.innerHTML=blocked.map(t=>`<div class="feed-item"><b>${esc(t.title)}</b><p>${esc(t.project)} • ${esc(t.detail||'Requires attention')}</p><span class="badge red">${esc(t.status)}</span></div>`).join('') || '<p class="muted">No blocked task detected.</p>';
    }
  });
}
function renderClientPortalBlueprint(){
  const box=$('clientPortalBlueprint'); if(!box) return;
  const items=[
    ['Client Login','Firebase Auth client account for project owner access.'],
    ['Progress Tracking','Client can view stage, task progress, QA status and delivery note.'],
    ['File Upload','Client upload logo, content, photos, reference and required assets.'],
    ['Revision Request','Client submit structured feedback and revision request.'],
    ['Invoice','Future billing record, package and payment status module.'],
    ['Delivery Center','Final link, files, handover note and approval confirmation.']
  ];
  box.innerHTML=items.map(([title,detail])=>`<div class="feed-item"><b>${esc(title)}</b><p class="muted">${esc(detail)}</p><span class="badge orange">BLUEPRINT</span></div>`).join('');
}
renderAutomationLayer();
renderKnowledgeBaseSystem();
renderAiCommandCenter();
renderClientPortalBlueprint();
