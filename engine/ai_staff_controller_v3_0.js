/* OFFICE RESTU HARMONI — AI Staff Controller V3.0 */
export const AIStaffController = {
  nextStatus(task) {
    const status = task.status;
    if (status === 'PENDING') return 'READY_FOR_EXECUTION';
    if (status === 'READY_FOR_EXECUTION') return 'EXECUTING';
    if (status === 'EXECUTING') return 'EXECUTION_DONE';
    if (status === 'EXECUTION_DONE') return 'QA_REVIEW';
    if (status === 'QA_REJECTED') return 'READY_FOR_EXECUTION';
    if (status === 'QA_APPROVED') return 'READY_FOR_DELIVERY';
    return status || 'PENDING';
  },

  buildExecutionPackage(task, memory, promptLibrary) {
    const departmentPrompt = promptLibrary.departments?.[task.department]?.prompt || '';
    return {
      executionId: crypto.randomUUID(),
      taskId: task.taskId,
      projectId: task.projectId,
      department: task.department,
      prompt: departmentPrompt,
      sopId: task.sopId,
      inputContext: {
        memory,
        task
      },
      createdAt: new Date().toISOString()
    };
  },

  createSimulatedOutput(executionPackage) {
    return {
      executionId: executionPackage.executionId,
      taskId: executionPackage.taskId,
      department: executionPackage.department,
      status: 'EXECUTION_DONE',
      summary: `Autonomous execution package prepared for ${executionPackage.department}.`,
      deliverables: [],
      notes: 'Connect this package to AI API Integration Layer V3.1 for live model execution.',
      createdAt: new Date().toISOString()
    };
  }
};
