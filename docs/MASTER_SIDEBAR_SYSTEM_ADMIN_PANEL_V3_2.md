# OFFICE RESTU HARMONI v3.2 — Master Sidebar + System Admin Panel

Source rujukan: `office_restuharmoni_v2_3_2`.

## Objective
Menyelesaikan isu page tersembunyi dengan menambah shortcut rasmi dalam Master Sidebar dan System Admin Panel.

## Update utama
- Master Sidebar diselaraskan pada semua page utama.
- `system-admin.html` ditambah sebagai pusat shortcut admin/tools.
- `tools/project-delete-tool-v3-2.html` ditambah untuk Option 3 Project-Based Delete.
- Delete engine hanya padam data berdasarkan `projectId`.
- Core office seperti `departments`, `sop`, `templates`, `prompts`, `knowledge-base`, `assets`, `engine` dan `components` tidak dipadam.

## Upload file penting
Upload keseluruhan ZIP ke hosting. Jika mahu manual upload sahaja, minimum file terlibat ialah:

- `system-admin.html`
- `tools/project-delete-tool-v3-2.html`
- `tools/project-delete-tool-v3-1.html` redirect legacy
- `engine/project_based_delete_engine_v3_2.js`
- `firebase/project_delete_safe_paths_v3_2.json`
- `firebase/firestore_rules_project_delete_v3_2.rules`
- `css/style.css`
- semua HTML utama yang telah dikemaskini sidebar

## Cara guna delete project
1. Login admin.
2. Buka `system-admin.html`.
3. Klik `Project Delete`.
4. Pilih project.
5. Taip `projectId` yang sama untuk confirmation.
6. Klik `Delete Project`.

## Safe delete scope
System akan cuba delete:

- `projects/{projectId}`
- `tasks` where `projectId == selected projectId`
- `workflow` where `projectId == selected projectId`
- `department_logs` where `projectId == selected projectId`
- `notifications` where `projectId == selected projectId`
- `outputs` where `projectId == selected projectId`
- `deliveries` where `projectId == selected projectId`
- `qa_reviews` where `projectId == selected projectId`
- `final_deliveries` where `projectId == selected projectId`
- `workflow_logs` where `projectId == selected projectId`
- direct docs in `pipeline`, `pipelines`, `sop_execution`, `qa_checklist` using `{projectId}`

## Nota Firebase Rules
Rules yang disediakan ialah template untuk project delete. Semak rules production sebelum publish jika mahu restriction admin lebih ketat.
