# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- Foundation — editor project UI wired to APIs

## Current Goal

- Next feature unit in `context/feature-specs/` (canvas / Liveblocks workspace).

## Completed

- Design system (`context/feature-specs/01-design-system.md`): shadcn/ui (base-nova) configured, `lib/utils.ts` with `cn()`, lucide-react, Button, Card, Dialog, Input, Tabs, Textarea, ScrollArea in `components/ui/`, dark theme tokens in `app/globals.css`, `dark` class on `<html>`.
- Editor chrome (`context/feature-specs/02-editor.md`): `EditorNavbar`, `ProjectSidebar`, and `EditorDialog` pattern in `components/editor/`.
- Authentication (`context/feature-specs/03-auth.md`): Clerk `ClerkProvider` with `dark` theme and CSS variable overrides, sign-in/sign-up pages with two-panel auth layout, root `proxy.ts` (protected-first), `/` redirects, `UserButton` in editor navbar.
- Project dialogs (`context/feature-specs/04-project-dialogs.md`): editor home empty state, create/rename/delete dialogs with slug preview, dialog hook + provider, owned-only sidebar actions, mobile sidebar backdrop scrim.
- Prisma schema and client (`context/feature-specs/05-prisma.md`): `Project` and `ProjectCollaborator` models in `prisma/models/project.prisma` with status enum, indexes, and cascade delete; Prisma config via `prisma.config.ts`; generated client output in `app/generated/prisma`; `lib/prisma.ts` singleton that uses Accelerate when `DATABASE_URL` starts with `prisma+postgres://` and `@prisma/adapter-pg` otherwise; initial migration created and applied.
- Project APIs (`context/feature-specs/06-project-apis.md`): `GET`/`POST` `/api/projects`, `PATCH`/`DELETE` `/api/projects/[projectId]` with Clerk `ownerId`, default name `Untitled Project`, `401`/`403`/`404` responses, owner-only rename/delete; service layer in `lib/projects/service.ts`.
- Wire editor home (`context/feature-specs/07-wire-editor-home.md`): server-fetched owned/shared lists via `lib/projects/data.ts`; `useProjectActions` hook for create/rename/delete against `/api/projects`; room ID = project ID (`lib/projects/room-id.ts`); sidebar and dialogs wired; create navigates to `/editor/[projectId]`; delete refreshes or redirects from active workspace; placeholder workspace page.

## In Progress

- None.

## Next Up

- Liveblocks canvas workspace for `/editor/[projectId]`.

## Open Questions

- Add unresolved product or implementation questions here.

## Architecture Decisions

- Route protection uses protected-first `proxy.ts`: only `NEXT_PUBLIC_CLERK_SIGN_IN_URL` and `NEXT_PUBLIC_CLERK_SIGN_UP_URL` paths are public; all other routes require auth.
- Clerk appearance uses `@clerk/ui` `dark` theme with variables mapped to app CSS tokens (no hardcoded colors in auth UI).
- Project API handlers use `requireUserId()` for `401` JSON responses; mutations enforce `ownerId` match before rename/delete (`403` for non-owners).
- Project ID and Liveblocks room ID are the same string: slugified name plus a short random suffix, validated on `POST /api/projects`.

## Session Notes

- Editor chrome is wired via `EditorLayout` in `app/editor/layout.tsx` (server layout fetches projects; client layout handles navbar + sidebar state). Dialog pattern: `components/editor/editor-dialog.tsx`.
- Auth shell: `components/auth/auth-brand-panel.tsx` + `app/(auth)/layout.tsx` for sign-in/sign-up pages.
- Project UI: `hooks/use-project-actions.ts` + `components/editor/project-dialogs-provider.tsx`; lists from `getEditorProjectLists()` in `lib/projects/data.ts`.
- Project APIs: `app/api/projects/route.ts`, `app/api/projects/[projectId]/route.ts`, shared helpers in `lib/auth/require-user.ts` and `lib/api/responses.ts`.
