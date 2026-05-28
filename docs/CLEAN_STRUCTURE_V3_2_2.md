# OFFICE RESTU HARMONI v3.2.2 — Clean Structure

## Canonical page location
All live HTML pages are now kept at the project root, for example:
- dashboard.html
- projects.html
- tasks.html
- system-admin.html
- live-command-center.html
- realtime-task-board.html

The old `/pages` duplicate folder was removed to avoid conflict and wrong file detection.

## Canonical Project Delete Tool
Official path:
- `/tools/project-delete-tool-v3-2.html`

Legacy root path:
- `/project-delete-tool.html`

The legacy root file is only a redirect stub. It is not a duplicate full page.

## Removed duplicate/old files
- `/pages/*` duplicate page copies
- `/tools/project-delete-tool-v3-1.html`
- `/tools/project-delete-tool-v3-1-2.html`
- `/engine/project_based_delete_engine_v3_1_2.js`
- `/firebase/firestore_rules_project_delete_v3_1_2.rules`
- `/firebase/project_delete_safe_paths_v3_1_2.json`

## Protected core folders
Do not delete:
- `/departments`
- `/sop`
- `/templates`
- `/knowledge-base`
- `/prompts`
- `/engine`
- `/firebase`
- `/assets`

## Upload instruction
Upload this full ZIP contents to the website root and overwrite old files. If your hosting keeps old removed files, manually delete `/pages` and old v3.1 delete files from hosting.
