# OFFICE RESTU HARMONI — PROJECT PIPELINE ENGINE v2.6

## Objective
Project Pipeline Engine ialah otak workflow untuk menghubungkan Project Intake, PM AI, Project Command Center, Department AI, QA Review dan Final Delivery dalam satu realtime monitoring flow.

## Master Flow
CLIENT → PM AI → PROJECT COMMAND CENTER → DEPARTMENT AI → QA REVIEW → FINAL DELIVERY

## Main Features
1. Realtime pipeline dashboard melalui `project-pipeline-engine.html`.
2. Auto department routing berdasarkan project type template.
3. Live project stage visualization.
4. Task progress calculation berdasarkan task project.
5. QA ready counter berdasarkan task `QA_REVIEW`.
6. Delivered counter berdasarkan collection `final_deliveries`.
7. Routing rules untuk setiap department AI.

## Firestore Collections Used
- `project_intake`
- `projects`
- `tasks`
- `workflow`
- `outputs`
- `qa_reviews`
- `final_deliveries`
- `department_logs`
- `notifications`

## Operating Rule
Setiap project mesti bermula dari requirement atau Command Center. PM AI akan generate department tasks. Department AI akan execute task mengikut SOP. Output mesti dihantar ke QA Review. Hanya output approved boleh masuk Final Delivery.

## Version Note
This version continues from `office_restuharmoni_v2_3_1` and adds the Project Pipeline Engine page, UI styling, realtime render logic and database structure note.
