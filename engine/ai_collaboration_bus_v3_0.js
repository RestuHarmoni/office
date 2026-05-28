/* OFFICE RESTU HARMONI — AI Collaboration Bus V3.0 */
export function createHandoff({ projectId, taskId, fromDepartment, toDepartment, summary, outputFiles = [], dependencies = [], blockers = [], qaNotes = '', nextAction = '' }) {
  return {
    messageId: crypto.randomUUID(),
    projectId,
    taskId,
    fromDepartment,
    toDepartment,
    status: blockers.length ? 'BLOCKED' : 'READY',
    summary,
    outputFiles,
    dependencies,
    blockers,
    qaNotes,
    nextAction,
    createdAt: new Date().toISOString()
  };
}

export function routeAfterDepartment(department) {
  const route = {
    PM_AI: 'UIUX_AI',
    UIUX_AI: 'FRONTEND_AI',
    FRONTEND_AI: 'BACKEND_AI',
    BACKEND_AI: 'SEO_AI',
    SEO_AI: 'QA_AI',
    CONTENT_AI: 'QA_AI',
    QA_AI: 'ARCHIVE_AI'
  };
  return route[department] || 'PM_AI';
}
