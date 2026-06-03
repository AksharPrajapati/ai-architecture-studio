import { clerkClient } from "@clerk/nextjs/server";

export interface ClerkUserProfile {
  displayName: string | null;
  imageUrl: string | null;
}

export async function getClerkProfilesByEmails(
  emails: string[],
): Promise<Map<string, ClerkUserProfile>> {
  const profiles = new Map<string, ClerkUserProfile>();
  const normalized = [
    ...new Set(emails.map((email) => email.toLowerCase()).filter(Boolean)),
  ];

  if (normalized.length === 0) {
    return profiles;
  }

  const client = await clerkClient();
  const { data } = await client.users.getUserList({
    emailAddress: normalized,
    limit: Math.min(normalized.length, 100),
  });

  for (const user of data) {
    const primaryEmail =
      user.emailAddresses.find(
        (address) => address.id === user.primaryEmailAddressId,
      )?.emailAddress ?? user.emailAddresses[0]?.emailAddress;

    if (!primaryEmail) {
      continue;
    }

    const displayName =
      [user.firstName, user.lastName].filter(Boolean).join(" ").trim() ||
      user.username ||
      null;

    profiles.set(primaryEmail.toLowerCase(), {
      displayName,
      imageUrl: user.imageUrl,
    });
  }

  return profiles;
}
