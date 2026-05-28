# OFFICE RESTU HARMONI — Project-Based Delete System v3.1.2

Source base: `office_restuharmoni_v2_3_2`

## Purpose

Option 3 delete system: padam satu project sahaja berdasarkan `projectId` tanpa mengganggu core AI Office.

## Files Added

- `project-delete-tool.html`
- `engine/project_based_delete_engine_v3_1_2.js`
- `firebase/project_delete_safe_paths_v3_1_2.json`
- `firebase/firestore_rules_project_delete_v3_1_2.rules`
- `docs/PROJECT_BASED_DELETE_SYSTEM_V3_1_2.md`
- `pages/project-delete-tool.html`
- `tools/project-delete-tool-v3-1-2.html`

## Deleted Project Data

The engine deletes project-specific operational data:

- `projects/{projectId}`
- `pipelines/{projectId}`
- all docs in `tasks` where `projectId == selected projectId`
- all docs in `workflow` where `projectId == selected projectId`
- all docs in `workflow_logs` where `projectId == selected projectId`
- all docs in `department_logs` where `projectId == selected projectId`
- all docs in `notifications` where `projectId == selected projectId`
- all docs in `deliveries` where `projectId == selected projectId`
- all docs in `outputs` where `projectId == selected projectId`
- all docs in `qa_checklist` where `projectId == selected projectId`
- all docs in `sop_execution` where `projectId == selected projectId`
- all docs in `pipeline_runs` where `projectId == selected projectId`
- all docs in `project_intake` where `projectId == selected projectId`
- all mirror docs in `departments/{department}/tasks/{taskId}` where `projectId == selected projectId`

## Protected Core Data

Never delete:

- `departments`
- `sop_templates`
- `department_templates`
- `project_task_templates`
- `knowledge_base`
- `automation_layers`
- `workflow/master`
- `qa_reviews/master_checklist`
- `ai_prompts`
- `users`
- `clients`
- `system`
- `settings`

## Usage

Open:

`project-delete-tool.html`

Steps:

1. Select project from list or paste `projectId` manually.
2. Click `Preview Delete`.
3. Confirm the target list.
4. Type `DELETE PROJECT`.
5. Click `Delete Project`.

The delete action creates an audit log in `admin_delete_logs`.

## Status

Production-safe MVP for project-specific reset and cleanup.
