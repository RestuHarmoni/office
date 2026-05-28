/* V2.9 Pipeline Tracker */
export function calculateProgress(tasks=[]){ if(!tasks.length) return 0; const done=tasks.filter(t=>['APPROVED','DELIVERED'].includes(t.status)).length; return Math.round((done/tasks.length)*100); }
export function countBlocked(tasks=[]){ return tasks.filter(t=>t.status==='BLOCKED').length; }
export function departmentLoad(tasks=[]){ return tasks.reduce((a,t)=>{a[t.department]=(a[t.department]||0)+1; return a;},{}); }
