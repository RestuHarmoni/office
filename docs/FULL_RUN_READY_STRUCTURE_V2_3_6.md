# OFFICE RESTU HARMONI v2.3.6 — Full Run Ready Clean Structure

Versi ini telah disusun semula daripada `office_restuharmoni_v2_3_4.zip` supaya lebih sesuai untuk upload terus ke root website.

## Struktur root rasmi

```text
/assets
  /brand
  /css
  /js
/components
/engine
/firebase
/tools
/docs
/departments
/sop
/knowledge-base
/projects
/clients
/archive

index.html
dashboard.html
projects.html
project-intake-center.html
tasks.html
departments.html
sop-engine.html
project-pipeline-engine.html
automation-intelligence.html
live-command-center.html
realtime-task-board.html
ai-command-center.html
autonomous-execution-center.html
knowledge-base.html
client-portal.html
output.html
system-admin.html
settings.html
project-delete-tool.html
```

## Perubahan penting

- `css/style.css` dipindahkan ke `assets/css/style.css`.
- Folder `js/` dipindahkan ke `assets/js/`.
- Semua HTML telah dikemaskini untuk guna path baru.
- Engine yang import Firebase telah dikemaskini kepada `../assets/js/firebase.js`.
- Folder kosong penting dicipta: `departments`, `projects`, `clients`, `archive`.
- Project Delete rasmi kekal di `tools/project-delete-tool-v3-2.html`.
- Root `project-delete-tool.html` kekal sebagai redirect/shortcut sahaja.

## Cara upload

1. Backup repo lama.
2. Kosongkan root GitHub kecuali `.git`.
3. Extract ZIP ini.
4. Upload semua kandungan dalam folder ini ke root repo/domain.
5. Commit dan push.
6. Buka website dan hard refresh: `Ctrl + Shift + R`.

## Status

Ready untuk deploy sebagai clean full package. Firebase Storage tidak wajib untuk core run semasa.
