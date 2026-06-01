# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- Foundation — editor chrome complete; ready for next feature unit

## Current Goal

- Pick up the next feature spec from `context/feature-specs/`.

## Completed

- Design system (`context/feature-specs/01-design-system.md`): shadcn/ui (base-nova) configured, `lib/utils.ts` with `cn()`, lucide-react, Button, Card, Dialog, Input, Tabs, Textarea, ScrollArea in `components/ui/`, dark theme tokens in `app/globals.css`, `dark` class on `<html>`.
- Editor chrome (`context/feature-specs/02-editor.md`): `EditorNavbar`, `ProjectSidebar`, and `EditorDialog` pattern in `components/editor/`.

## In Progress

- None.

## Next Up

- Next planned feature unit (see `context/feature-specs/`).

## Open Questions

- Add unresolved product or implementation questions here.

## Architecture Decisions

- Add decisions that affect the system design or data model.

## Session Notes

- Editor chrome is wired via `EditorLayout` in `app/(editor)/layout.tsx` (navbar + project sidebar state). Dialog pattern: `components/editor/editor-dialog.tsx` (title, description, footer wrappers; no feature dialogs yet).
