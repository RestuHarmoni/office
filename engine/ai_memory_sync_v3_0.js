/* OFFICE RESTU HARMONI — AI Memory Sync V3.0 */
export const ProjectMemory = {
  create(project) {
    return {
      projectId: project.projectId || crypto.randomUUID(),
      clientRequirement: project.clientRequirement || {},
      projectType: project.projectType || 'General Project',
      objective: project.objective || '',
      brandRules: project.brandRules || {},
      designDecisions: [],
      technicalDecisions: [],
      departmentOutputs: {},
      qaIssues: [],
      approvedDeliverables: [],
      deliveryStatus: 'IN_PROGRESS',
      lastUpdated: new Date().toISOString()
    };
  },

  addDecision(memory, owner, decision) {
    const entry = { owner, decision, createdAt: new Date().toISOString() };
    const key = owner.includes('UIUX') ? 'designDecisions' : 'technicalDecisions';
    memory[key].push(entry);
    memory.lastUpdated = new Date().toISOString();
    return memory;
  },

  saveDepartmentOutput(memory, department, output) {
    memory.departmentOutputs[department] = {
      output,
      updatedAt: new Date().toISOString()
    };
    memory.lastUpdated = new Date().toISOString();
    return memory;
  }
};
