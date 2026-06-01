# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- Foundation — auth wired; editor protected

## Current Goal

- Pick up the next feature spec from `context/feature-specs/`.

## Completed

- Design system (`context/feature-specs/01-design-system.md`): shadcn/ui (base-nova) configured, `lib/utils.ts` with `cn()`, lucide-react, Button, Card, Dialog, Input, Tabs, Textarea, ScrollArea in `components/ui/`, dark theme tokens in `app/globals.css`, `dark` class on `<html>`.
- Editor chrome (`context/feature-specs/02-editor.md`): `EditorNavbar`, `ProjectSidebar`, and `EditorDialog` pattern in `components/editor/`.
- Authentication (`context/feature-specs/03-auth.md`): Clerk `ClerkProvider` with `dark` theme and CSS variable overrides, sign-in/sign-up pages with two-panel auth layout, root `proxy.ts` (protected-first), `/` redirects, `UserButton` in editor navbar.
- Project dialogs (`context/feature-specs/04-project-dialogs.md`): editor home empty state, create/rename/delete dialogs with slug preview, `useProjectDialogs` hook, mock project lists in sidebar with owned-only actions, mobile sidebar backdrop scrim.

## In Progress

- None.

## Next Up

- Next planned feature unit (see `context/feature-specs/`).

## Open Questions

- Add unresolved product or implementation questions here.

## Architecture Decisions

- Route protection uses protected-first `proxy.ts`: only `NEXT_PUBLIC_CLERK_SIGN_IN_URL` and `NEXT_PUBLIC_CLERK_SIGN_UP_URL` paths are public; all other routes require auth.
- Clerk appearance uses `@clerk/ui` `dark` theme with variables mapped to app CSS tokens (no hardcoded colors in auth UI).

## Session Notes

- Editor chrome is wired via `EditorLayout` in `app/editor/layout.tsx` (navbar + project sidebar state). Dialog pattern: `components/editor/editor-dialog.tsx` (title, description, footer wrappers).
- Auth shell: `components/auth/auth-brand-panel.tsx` + `app/(auth)/layout.tsx` for sign-in/sign-up pages.
- Project dialogs: `hooks/use-project-dialogs.ts` + `components/editor/project-dialogs-provider.tsx` wrap the editor layout; mock data in `lib/projects/mock-projects.ts`.
