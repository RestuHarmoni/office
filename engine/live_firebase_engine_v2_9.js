/*
OFFICE RESTU HARMONI — VERSION 2.9
LIVE AUTOMATION CONNECTION SYSTEM
Role: connect Project Intake → Firestore → Auto Task → SOP Injection → Command Center.

Usage:
import { createLiveProject, listenLiveOffice, updateTaskStatus } from './engine/live_firebase_engine_v2_9.js';
*/

import { db } from '../assets/js/firebase.js';
import {
  collection, doc, addDoc, setDoc, updateDoc, getDoc,
  serverTimestamp, onSnapshot, query, where, orderBy, writeBatch
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

export const ORH_V29 = {
  version: '2.9',
  system: 'OFFICE RESTU HARMONI AI DIGITAL OFFICE',
  statusFlow: ['PENDING','IN_PROGRESS','BLOCKED','QA_REVIEW','APPROVED','DELIVERED'],
  departments: ['PM','UIUX','FRONTEND','BACKEND','QA','SEO','MARKETING','CLIENT_MANAGEMENT','CONTENT','ARCHIVE']
};

export const PROJECT_TYPE_MAP = {
  'Corporate Website': ['pm-brief','uiux-wireframe','frontend-pages','seo-foundation','qa-review','delivery-package'],
  'Company Profile Website': ['pm-brief','uiux-wireframe','frontend-pages','seo-foundation','qa-review','delivery-package'],
  'Landing Page': ['pm-brief','uiux-landing','frontend-landing','seo-foundation','qa-review','delivery-package'],
  'Physical Ecommerce Website': ['pm-brief','uiux-ecommerce','frontend-ecommerce','backend-ecommerce','seo-product','qa-ecommerce','delivery-package'],
  'Digital Ecommerce Platform': ['pm-brief','uiux-ecommerce','frontend-ecommerce','backend-digital-product','seo-product','qa-ecommerce','delivery-package'],
  'Digital & Physical Ecommerce Platform': ['pm-brief','uiux-ecommerce','frontend-ecommerce','backend-hybrid-ecommerce','seo-product','qa-ecommerce','delivery-package'],
  'Dashboard System': ['pm-brief','uiux-dashboard','frontend-dashboard','backend-dashboard','qa-system','delivery-package'],
  'Booking System': ['pm-brief','uiux-booking','frontend-booking','backend-booking','qa-system','delivery-package'],
  'Learning Management System': ['pm-brief','uiux-lms','frontend-lms','backend-lms','qa-system','delivery-package'],
  'SEO Optimization': ['pm-brief','seo-audit','seo-implementation','qa-seo-report','delivery-package'],
  'Branding System': ['pm-brief','uiux-branding','content-brand-guide','qa-review','delivery-package'],
  'default': ['pm-brief','uiux-wireframe','frontend-pages','seo-foundation','qa-review','delivery-package']
};

export const TASK_LIBRARY = {
  'pm-brief': { title:'PM Project Brief & Requirement Analysis', department:'PM', priority:'HIGH', sopId:'SOP_PM_PROJECT_ANALYSIS', checklist:['Confirm objective','Confirm scope','Confirm deliverable','Confirm deadline'] },
  'uiux-wireframe': { title:'UIUX Website Wireframe & Design Direction', department:'UIUX', priority:'NORMAL', sopId:'SOP_UIUX_WEBSITE_LAYOUT', checklist:['Layout structure','Responsive direction','Brand color','CTA placement'] },
  'uiux-landing': { title:'UIUX Landing Page Conversion Layout', department:'UIUX', priority:'HIGH', sopId:'SOP_UIUX_LANDING_PAGE', checklist:['Hero hook','Offer section','Trust section','CTA flow'] },
  'uiux-ecommerce': { title:'UIUX Ecommerce Customer Journey', department:'UIUX', priority:'HIGH', sopId:'SOP_UIUX_ECOMMERCE_FLOW', checklist:['Homepage flow','Product listing','Product detail','Cart/checkout flow'] },
  'uiux-dashboard': { title:'UIUX Dashboard Information Architecture', department:'UIUX', priority:'HIGH', sopId:'SOP_UIUX_DASHBOARD', checklist:['Navigation','KPI cards','Data table','Mobile view'] },
  'uiux-booking': { title:'UIUX Booking Flow Structure', department:'UIUX', priority:'HIGH', sopId:'SOP_UIUX_BOOKING', checklist:['Service selection','Date/time flow','Customer info','Confirmation screen'] },
  'uiux-lms': { title:'UIUX LMS Course & Student Flow', department:'UIUX', priority:'HIGH', sopId:'SOP_UIUX_LMS', checklist:['Course catalogue','Lesson page','Student dashboard','Progress display'] },
  'uiux-branding': { title:'Branding Visual Direction', department:'UIUX', priority:'NORMAL', sopId:'SOP_UIUX_BRANDING', checklist:['Logo usage','Color palette','Typography','Visual mood'] },
  'frontend-pages': { title:'Frontend Build Core Pages', department:'FRONTEND', priority:'HIGH', sopId:'SOP_FRONTEND_RESPONSIVE_PAGES', checklist:['Homepage','About/Services','Contact CTA','Mobile responsive'] },
  'frontend-landing': { title:'Frontend Build Landing Page', department:'FRONTEND', priority:'HIGH', sopId:'SOP_FRONTEND_LANDING_PAGE', checklist:['Hero section','Benefit section','CTA section','Speed optimized'] },
  'frontend-ecommerce': { title:'Frontend Build Ecommerce Interface', department:'FRONTEND', priority:'HIGH', sopId:'SOP_FRONTEND_ECOMMERCE_UI', checklist:['Product grid','Product card','Cart UI','Checkout UI'] },
  'frontend-dashboard': { title:'Frontend Build Dashboard UI', department:'FRONTEND', priority:'HIGH', sopId:'SOP_FRONTEND_DASHBOARD_UI', checklist:['KPI cards','Tables','Filters','Responsive layout'] },
  'frontend-booking': { title:'Frontend Build Booking Interface', department:'FRONTEND', priority:'HIGH', sopId:'SOP_FRONTEND_BOOKING_UI', checklist:['Service form','Calendar UI','Customer form','Confirmation UI'] },
  'frontend-lms': { title:'Frontend Build LMS Interface', department:'FRONTEND', priority:'HIGH', sopId:'SOP_FRONTEND_LMS_UI', checklist:['Course list','Lesson page','Student area','Progress UI'] },
  'backend-ecommerce': { title:'Backend Ecommerce Database & Order Flow', department:'BACKEND', priority:'HIGH', sopId:'SOP_BACKEND_ECOMMERCE', checklist:['Products collection','Orders collection','Customer records','Admin update flow'] },
  'backend-digital-product': { title:'Backend Digital Product Delivery Flow', department:'BACKEND', priority:'HIGH', sopId:'SOP_BACKEND_DIGITAL_PRODUCT', checklist:['Digital asset record','Purchase access','Delivery link','Access control'] },
  'backend-hybrid-ecommerce': { title:'Backend Hybrid Ecommerce Database', department:'BACKEND', priority:'HIGH', sopId:'SOP_BACKEND_HYBRID_ECOMMERCE', checklist:['Physical product','Digital product','Inventory field','Delivery status'] },
  'backend-dashboard': { title:'Backend Dashboard Data Structure', department:'BACKEND', priority:'HIGH', sopId:'SOP_BACKEND_DASHBOARD', checklist:['Collections','Metrics fields','Access rules','Realtime listener'] },
  'backend-booking': { title:'Backend Booking Database Structure', department:'BACKEND', priority:'HIGH', sopId:'SOP_BACKEND_BOOKING', checklist:['Services','Slots','Bookings','Status update'] },
  'backend-lms': { title:'Backend LMS Database Structure', department:'BACKEND', priority:'HIGH', sopId:'SOP_BACKEND_LMS', checklist:['Courses','Lessons','Students','Progress'] },
  'seo-foundation': { title:'SEO Foundation Setup', department:'SEO', priority:'NORMAL', sopId:'SOP_SEO_FOUNDATION', checklist:['Meta title','Meta description','Heading structure','Schema plan'] },
  'seo-product': { title:'SEO Product & Ecommerce Optimization', department:'SEO', priority:'NORMAL', sopId:'SOP_SEO_ECOMMERCE', checklist:['Product title','Product description','Category SEO','Product schema'] },
  'seo-audit': { title:'SEO Audit & Keyword Mapping', department:'SEO', priority:'HIGH', sopId:'SOP_SEO_AUDIT', checklist:['Keyword mapping','Technical audit','Competitor notes','Action plan'] },
  'seo-implementation': { title:'SEO Implementation Task', department:'SEO', priority:'HIGH', sopId:'SOP_SEO_IMPLEMENTATION', checklist:['On-page update','Schema','Internal link','Indexing readiness'] },
  'qa-review': { title:'QA Review & Approval', department:'QA', priority:'HIGH', sopId:'SOP_QA_GENERAL_REVIEW', checklist:['Responsive test','Broken link test','UI consistency','Final approval'] },
  'qa-ecommerce': { title:'QA Ecommerce Flow Testing', department:'QA', priority:'HIGH', sopId:'SOP_QA_ECOMMERCE', checklist:['Product flow','Cart flow','Checkout flow','Order record'] },
  'qa-system': { title:'QA System Function Testing', department:'QA', priority:'HIGH', sopId:'SOP_QA_SYSTEM', checklist:['Auth test','CRUD test','Realtime test','Permission test'] },
  'qa-seo-report': { title:'QA SEO Report Validation', department:'QA', priority:'NORMAL', sopId:'SOP_QA_SEO', checklist:['Meta validation','Heading validation','Schema validation','Report ready'] },
  'content-brand-guide': { title:'Content & Brand Guide Preparation', department:'CONTENT', priority:'NORMAL', sopId:'SOP_CONTENT_BRAND_GUIDE', checklist:['Tone of voice','Brand wording','Asset notes','Final guide'] },
  'delivery-package': { title:'Final Delivery Package', department:'PM', priority:'HIGH', sopId:'SOP_PM_FINAL_DELIVERY', checklist:['Files ready','QA approved','Client notes','Archive backup'] }
};

export function normalizeProjectType(projectType='') {
  return PROJECT_TYPE_MAP[projectType] ? projectType : 'default';
}

export function generateLiveTasks(project) {
  const type = normalizeProjectType(project.projectType);
  const keys = PROJECT_TYPE_MAP[type];
  return keys.map((key, index) => {
    const base = TASK_LIBRARY[key];
    return {
      taskKey: key,
      title: base.title,
      department: base.department,
      priority: project.priority === 'URGENT' ? 'URGENT' : base.priority,
      status: index === 0 ? 'PENDING' : 'PENDING',
      order: index + 1,
      sopId: base.sopId,
      sopInjected: true,
      qaChecklist: base.checklist.map(item => ({ item, checked:false })),
      projectType: project.projectType || 'General Project',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
  });
}

export async function createLiveProject(projectInput) {
  const project = {
    title: projectInput.title || projectInput.projectTitle || 'Untitled Project',
    clientName: projectInput.clientName || '',
    companyName: projectInput.companyName || '',
    projectType: projectInput.projectType || 'Corporate Website',
    priority: projectInput.priority || 'NORMAL',
    objective: projectInput.objective || '',
    status: 'ACTIVE',
    automationVersion: '2.9',
    currentStage: 'PM_ANALYSIS',
    progress: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  const projectRef = await addDoc(collection(db, 'projects'), project);
  const batch = writeBatch(db);
  const tasks = generateLiveTasks(project).map(task => ({ ...task, projectId: projectRef.id }));

  tasks.forEach(task => {
    const taskRef = doc(collection(db, 'tasks'));
    batch.set(taskRef, task);
    const deptRef = doc(collection(db, 'departments', task.department, 'tasks'), taskRef.id);
    batch.set(deptRef, { ...task, taskId: taskRef.id });
  });

  const pipelineRef = doc(db, 'pipelines', projectRef.id);
  batch.set(pipelineRef, {
    projectId: projectRef.id,
    status: 'LIVE',
    totalTasks: tasks.length,
    completedTasks: 0,
    blockedTasks: 0,
    activeDepartment: 'PM',
    stages: ORH_V29.statusFlow,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });

  const logRef = doc(collection(db, 'workflow_logs'));
  batch.set(logRef, {
    projectId: projectRef.id,
    type: 'LIVE_PROJECT_CREATED',
    message: `V2.9 created project and generated ${tasks.length} live tasks.`,
    createdAt: serverTimestamp()
  });

  await batch.commit();
  return { projectId: projectRef.id, tasksCreated: tasks.length, project };
}

export function listenLiveOffice(callback) {
  const q = query(collection(db, 'pipelines'), orderBy('updatedAt', 'desc'));
  return onSnapshot(q, snap => {
    const pipelines = snap.docs.map(d => ({ id:d.id, ...d.data() }));
    callback(pipelines);
  });
}

export function listenProjectTasks(projectId, callback) {
  const q = query(collection(db, 'tasks'), where('projectId','==',projectId), orderBy('order','asc'));
  return onSnapshot(q, snap => callback(snap.docs.map(d => ({ id:d.id, ...d.data() }))));
}

export function listenDepartmentTasks(department, callback) {
  const q = query(collection(db, 'tasks'), where('department','==',department), orderBy('updatedAt','desc'));
  return onSnapshot(q, snap => callback(snap.docs.map(d => ({ id:d.id, ...d.data() }))));
}

export async function updateTaskStatus(taskId, status, note='') {
  if (!ORH_V29.statusFlow.includes(status)) throw new Error('Invalid task status');
  await updateDoc(doc(db, 'tasks', taskId), { status, note, updatedAt: serverTimestamp() });
}

export async function recalcPipeline(projectId) {
  return { projectId, action:'Use Cloud Function or client-side task listener to recalculate progress.' };
}
