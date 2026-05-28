/* V2.9 Workflow Live Engine */
export const LIVE_WORKFLOW = ['CLIENT_SUBMIT','PM_ANALYSIS','AUTO_TASK_GENERATION','DEPARTMENT_ROUTING','SOP_INJECTION','EXECUTION','QA_REVIEW','FINAL_DELIVERY'];
export function getNextStage(current){ const i=LIVE_WORKFLOW.indexOf(current); return LIVE_WORKFLOW[Math.min(i+1, LIVE_WORKFLOW.length-1)] || LIVE_WORKFLOW[0]; }
