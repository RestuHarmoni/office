# OFFICE RESTU HARMONI V4.1 — File-Based Project Intake + AI Task Form Reader

## Objective
Upgrade Project Intake Center supaya admin tidak perlu isi form satu-satu. Admin boleh upload Task Form, system baca isi file, auto isi Project Intake, dan terus generate workflow.

## Supported in static website V4.1
- TXT
- Markdown (.md)
- JSON
- CSV/plain text

PDF/DOCX tidak dipaksa dalam fasa ini kerana Firebase Storage belum wajib dan static hosting browser tidak reliable untuk parse PDF/DOCX tanpa library/API tambahan. Untuk PDF/DOCX, convert dulu ke TXT atau copy isi ke template TXT.

## Flow
Upload Task Form → Read & Auto Fill → Review data → Save Requirement & Generate Project → Auto task + SOP + department routing.

## Files Added/Updated
- project-intake-center.html
- assets/js/app.js
- assets/css/style.css
- engine/ai_task_form_reader_v4_1.js
- templates/intake/task_form_template_v4_1.txt
- templates/intake/task_form_template_v4_1.json

## Important
This feature does not require Firebase Storage. File is read locally in browser and only extracted intake data is saved to Firestore.
