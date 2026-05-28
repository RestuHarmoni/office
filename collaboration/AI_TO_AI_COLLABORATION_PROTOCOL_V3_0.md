# AI-to-AI Collaboration Protocol V3.0

## Message Format
Every AI department handoff must include:

- projectId
- taskId
- fromDepartment
- toDepartment
- status
- summary
- outputFiles
- dependencies
- blockers
- qaNotes
- nextAction

## Handoff Flow
PM AI → UIUX AI → Frontend AI → Backend AI → SEO AI → QA AI → Archive AI

## Rework Flow
QA AI → source department → QA AI

## Blocker Flow
Any department → PM AI → Command Center

## Rules
- Never overwrite another department output without revision note.
- Every decision must be saved into project memory.
- QA rejection must include actionable fixes.
- Final delivery requires QA approval.
