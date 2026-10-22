---
"@llamaindex/workflow": patch
"@llamaindex/notion": patch
---

Pin workflow-core and notion-md-crawler to the versions used by the workspace.
Fresh npm consumers otherwise resolve workflow APIs that remove the snapshot
export and change handler arguments, or a Notion client major incompatible with
the reader's current types. Keep those dependency contracts consistent for
packed consumers as well as workspace installs.
