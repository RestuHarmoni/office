/* V2.9 SOP Live Injector */
export const SOP_LINKS = { SOP_PM_PROJECT_ANALYSIS:'sop/SOP_ENGINE_AUTOMATION_RULES.md', SOP_FRONTEND_RESPONSIVE_PAGES:'templates/AUTO_TASK_GENERATOR_RULES.md', SOP_QA_GENERAL_REVIEW:'docs/REALTIME_SOP_EXECUTION_ENGINE_V2_8.md' };
export function injectSOP(task){ return { ...task, sopInjected:true, sopSource:SOP_LINKS[task.sopId] || 'knowledge-base/KNOWLEDGE_BASE_INDEX.md' }; }
