/* OFFICE RESTU HARMONI — AI Autonomous Execution Engine V3.0 */
import { ProjectMemory } from './ai_memory_sync_v3_0.js';
import { AIStaffController } from './ai_staff_controller_v3_0.js';
import { createHandoff, routeAfterDepartment } from './ai_collaboration_bus_v3_0.js';

export const AutonomousExecutionEngine = {
  initializeProject(project) {
    const memory = ProjectMemory.create(project);
    return {
      projectId: memory.projectId,
      autonomousStatus: 'ACTIVE',
      currentDepartment: 'PM_AI',
      currentStage: 'ANALYSIS',
      projectMemory: memory,
      createdAt: new Date().toISOString()
    };
  },

  prepareTask(task, memory, promptLibrary) {
    const next = AIStaffController.nextStatus(task);
    const preparedTask = { ...task, status: next, updatedAt: new Date().toISOString() };
    const executionPackage = AIStaffController.buildExecutionPackage(preparedTask, memory, promptLibrary);
    return { preparedTask, executionPackage };
  },

  completeDepartmentExecution(task, memory, output) {
    const updatedMemory = ProjectMemory.saveDepartmentOutput(memory, task.department, output);
    const nextDepartment = routeAfterDepartment(task.department);
    const handoff = createHandoff({
      projectId: task.projectId,
      taskId: task.taskId,
      fromDepartment: task.department,
      toDepartment: nextDepartment,
      summary: output.summary || `${task.department} completed execution.`,
      nextAction: `Route to ${nextDepartment}`
    });
    return { updatedMemory, handoff, nextDepartment };
  },

  qaDecision(task, qaResult) {
    if (qaResult.approved) {
      return { ...task, status: 'QA_APPROVED', qaStatus: 'APPROVED', updatedAt: new Date().toISOString() };
    }
    return {
      ...task,
      status: 'QA_REJECTED',
      qaStatus: 'REJECTED',
      qaIssues: qaResult.issues || [],
      updatedAt: new Date().toISOString()
    };
  }
};
