# V2.9 Implementation Checklist

## Install / Upload
- Upload all files to GitHub hosting.
- Confirm `js/firebase.js` config matches project `department-62676`.
- Add `live-command-center.html` to navigation if needed.
- Add `realtime-task-board.html` to navigation if needed.

## Firebase
- Create Firestore database.
- Apply `firebase/firestore_rules_v2_9.rules` for MVP testing.
- Test login first because rules require signed-in user.

## Test
- Open `live-command-center.html`.
- Click `Create Demo Live Project`.
- Confirm records are created in `projects`, `tasks`, `pipelines`, `workflow_logs`.
- Open `realtime-task-board.html`.
- Select department and update task status.

## Next After V2.9
- Connect Project Intake submit directly to `createLiveProject()`.
- Build Client Portal live progress.
- Add Cloud Functions for secure automation execution.
