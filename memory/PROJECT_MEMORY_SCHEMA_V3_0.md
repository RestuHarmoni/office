# Project Memory Schema V3.0

## Purpose
Central shared memory for all AI departments working on one client project.

## Schema
```json
{
  "projectId": "PROJECT_ID",
  "clientRequirement": {},
  "projectType": "Corporate Website",
  "objective": "",
  "brandRules": {},
  "designDecisions": [],
  "technicalDecisions": [],
  "departmentOutputs": {},
  "qaIssues": [],
  "approvedDeliverables": [],
  "deliveryStatus": "IN_PROGRESS",
  "lastUpdated": "ISO_DATE"
}
```

## Memory Rules
- PM AI owns project objective.
- UIUX AI owns design decisions.
- Frontend AI owns UI implementation notes.
- Backend AI owns technical structure.
- QA AI owns issue list and approval status.
- Archive AI owns final version record.
