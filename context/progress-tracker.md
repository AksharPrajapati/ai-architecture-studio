# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- Foundation — project sharing and collaborator management

## Current Goal

- Next feature unit in `context/feature-specs/` (Liveblocks canvas workspace).

## Completed

- Design system (`context/feature-specs/01-design-system.md`): shadcn/ui (base-nova) configured, `lib/utils.ts` with `cn()`, lucide-react, Button, Card, Dialog, Input, Tabs, Textarea, ScrollArea in `components/ui/`, dark theme tokens in `app/globals.css`, `dark` class on `<html>`.
- Editor chrome (`context/feature-specs/02-editor.md`): `EditorNavbar`, `ProjectSidebar`, and `EditorDialog` pattern in `components/editor/`.
- Authentication (`context/feature-specs/03-auth.md`): Clerk `ClerkProvider` with `dark` theme and CSS variable overrides, sign-in/sign-up pages with two-panel auth layout, root `proxy.ts` (protected-first), `/` redirects, `UserButton` in editor navbar.
- Project dialogs (`context/feature-specs/04-project-dialogs.md`): editor home empty state, create/rename/delete dialogs with slug preview, dialog hook + provider, owned-only sidebar actions, mobile sidebar backdrop scrim.
- Prisma schema and client (`context/feature-specs/05-prisma.md`): `Project` and `ProjectCollaborator` models in `prisma/models/project.prisma` with status enum, indexes, and cascade delete; Prisma config via `prisma.config.ts`; generated client output in `app/generated/prisma`; `lib/prisma.ts` singleton that uses Accelerate when `DATABASE_URL` starts with `prisma+postgres://` and `@prisma/adapter-pg` otherwise; initial migration created and applied.
- Project APIs (`context/feature-specs/06-project-apis.md`): `GET`/`POST` `/api/projects`, `PATCH`/`DELETE` `/api/projects/[projectId]` with Clerk `ownerId`, default name `Untitled Project`, `401`/`403`/`404` responses, owner-only rename/delete; service layer in `lib/projects/service.ts`.
- Wire editor home (`context/feature-specs/07-wire-editor-home.md`): server-fetched owned/shared lists via `lib/projects/data.ts`; `useProjectActions` hook for create/rename/delete against `/api/projects`; room ID = project ID (`lib/projects/room-id.ts`); sidebar and dialogs wired; create navigates to `/editor/[projectId]`; delete refreshes or redirects from active workspace; placeholder workspace page.
- Editor workspace shell (`context/feature-specs/08-editor-workspace-shell.md`): server `/editor/[projectId]` page with Clerk redirect, `lib/project-access.ts` helpers, `AccessDenied` for missing/unauthorized projects, `WorkspaceLayout` with project navbar, share/AI toggles, highlighted sidebar room, canvas and AI placeholders; editor route layout provides dialogs only; home page wraps `EditorLayout`.
- Share dialog (`context/feature-specs/09-share-dialog.md`): `GET`/`POST` `/api/projects/[projectId]/collaborators`, `DELETE` `/api/projects/[projectId]/collaborators/[collaboratorId]` with owner-only invite/remove; Clerk email enrichment in `lib/clerk/user-profiles.ts`; `ShareDialog` + `useShareDialog` wired to workspace Share button; owners invite/remove and copy link; collaborators read-only list.
- Liveblocks setup (`context/feature-specs/10-liveblocks-setup.md`): `liveblocks.config.ts` defines `Presence` (cursor, isThinking) and `UserMeta` (name, avatar, color); lazy-initialized `Liveblocks` node client via `getLiveblocks()` in `lib/liveblocks.ts` with deterministic `userIdToColor` helper; `POST /api/liveblocks-auth` requires Clerk auth, verifies project access via `getAccessibleProject`, ensures room exists via `getOrCreateRoom`, returns session token with name/avatar/color; `@liveblocks/node` added to dependencies.
- Base canvas (`context/feature-specs/11-base-canvas.md`): `types/canvas.ts` defines `CanvasNodeData` (label, color, shape), `CanvasNode`/`CanvasEdge` types, `NODE_COLORS`, `NODE_SHAPES`; `CanvasWrapper` in `components/editor/canvas-wrapper.tsx` sets up `LiveblocksProvider`+`RoomProvider`+`ClientSideSuspense`+`CanvasErrorBoundary`; `Canvas` in `components/editor/canvas.tsx` uses `useLiveblocksFlow({ suspense: true })` with `ReactFlowProvider`, loose connections, `fitView`, `MiniMap`, dot `Background`; `WorkspaceLayout` canvas placeholder replaced with `CanvasWrapper`.
- Shape panel (`context/feature-specs/12-shape-panel.md`): `ShapePanel` in `components/editor/shape-panel.tsx` is a floating pill toolbar at canvas bottom-center with draggable icon buttons for all 6 shapes; drag payload carries shape name and default size via `SHAPE_DRAG_TYPE` data key; canvas `onDrop` uses `screenToFlowPosition` to place node, calls `onNodesChange([{type:"add",...}])`; `CanvasNodeComponent` in `components/editor/canvas-node.tsx` renders all shapes as a bordered rectangle with centered label; node ID uses `${shape}-${Date.now()}-${counter}`.

## In Progress

- None.

## Next Up

- Next feature unit in `context/feature-specs/`.

## Open Questions

- Add unresolved product or implementation questions here.

## Architecture Decisions

- Route protection uses protected-first `proxy.ts`: only `NEXT_PUBLIC_CLERK_SIGN_IN_URL` and `NEXT_PUBLIC_CLERK_SIGN_UP_URL` paths are public; all other routes require auth.
- Clerk appearance uses `@clerk/ui` `dark` theme with variables mapped to app CSS tokens (no hardcoded colors in auth UI).
- Project API handlers use `requireUserId()` for `401` JSON responses; mutations enforce `ownerId` match before rename/delete (`403` for non-owners).
- Project ID and Liveblocks room ID are the same string: slugified name plus a short random suffix, validated on `POST /api/projects`.

## Session Notes

- Editor home uses `EditorLayout` in `app/editor/page.tsx` (fetches projects server-side). `app/editor/layout.tsx` wraps routes with `ProjectDialogsProvider` only. Workspace uses `WorkspaceLayout` in `components/editor/workspace-layout.tsx`. Dialog pattern: `components/editor/editor-dialog.tsx`.
- Project access: `lib/project-access.ts` (`getCurrentUserIdentity`, `userHasProjectAccess`, `getAccessibleProject`); workspace page redirects unauthenticated users to sign-in.
- Auth shell: `components/auth/auth-brand-panel.tsx` + `app/(auth)/layout.tsx` for sign-in/sign-up pages.
- Project UI: `hooks/use-project-actions.ts` + `components/editor/project-dialogs-provider.tsx`; lists from `getEditorProjectLists()` in `lib/projects/data.ts`.
- Project APIs: `app/api/projects/route.ts`, `app/api/projects/[projectId]/route.ts`, collaborator routes under `app/api/projects/[projectId]/collaborators/`, shared helpers in `lib/auth/require-user.ts` and `lib/api/responses.ts`.
- Sharing: `lib/projects/collaborators.ts` service; `components/editor/share-dialog.tsx`; collaborators stored by email only (no local user table).
- Liveblocks auth: `lib/liveblocks.ts` exports cached `liveblocks` client (global var pattern) and `userIdToColor()`; `app/api/liveblocks-auth/route.ts` uses `getAccessibleProject` for access check, `getOrCreateRoom` for lazy room creation, `prepareSession`+`session.allow(room, FULL_ACCESS)` for token issuance.
