"use client";

import { useOthers } from "@liveblocks/react";
import { UserButton, useUser } from "@clerk/nextjs";

interface CollaboratorAvatarProps {
  name: string;
  avatar: string;
  color: string;
  index: number;
}

function CollaboratorAvatar({ name, avatar, color, index }: CollaboratorAvatarProps) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      title={name}
      style={{
        marginLeft: index === 0 ? 0 : -8,
        zIndex: index + 1,
        borderColor: color,
        boxShadow: `0 0 0 2px ${color}40`,
      }}
      className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full border-2 bg-elevated"
    >
      {avatar ? (
        <img src={avatar} alt={name} className="h-full w-full object-cover" />
      ) : (
        <div
          className="flex h-full w-full items-center justify-center text-xs font-semibold"
          style={{ backgroundColor: `${color}30`, color }}
        >
          {initials}
        </div>
      )}
    </div>
  );
}

export function PresenceAvatars() {
  const { user } = useUser();
  const currentUserId = user?.id;
  const others = useOthers();

  const collaborators = others.filter((other) => other.id !== currentUserId);
  const visible = collaborators.slice(0, 5);
  const overflowCount = collaborators.length - 5;

  return (
    <div className="flex items-center gap-2">
      {collaborators.length > 0 && (
        <>
          <div className="flex items-center">
            {visible.map((other, i) => (
              <CollaboratorAvatar
                key={other.connectionId}
                name={other.info?.name ?? "Unknown"}
                avatar={other.info?.avatar ?? ""}
                color={other.info?.color ?? "#808090"}
                index={i}
              />
            ))}
            {overflowCount > 0 && (
              <div
                style={{ marginLeft: -8, zIndex: visible.length + 1 }}
                className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-surface-border bg-elevated text-xs font-medium text-copy-muted"
              >
                +{overflowCount}
              </div>
            )}
          </div>
          <div className="h-5 w-px bg-surface-border" />
        </>
      )}
      <UserButton />
    </div>
  );
}
