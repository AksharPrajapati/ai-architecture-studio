export async function parseJsonBody(
  request: Request,
): Promise<{ ok: true; body: unknown } | { ok: false; response: Response }> {
  try {
    return { ok: true, body: await request.json() };
  } catch {
    return {
      ok: false,
      response: Response.json({ error: "Invalid JSON body" }, { status: 400 }),
    };
  }
}

export function readOptionalString(
  body: unknown,
  key: string,
): string | undefined | null {
  if (typeof body !== "object" || body === null || !(key in body)) {
    return undefined;
  }

  const value = (body as Record<string, unknown>)[key];

  if (value === null) {
    return null;
  }

  if (typeof value !== "string") {
    return null;
  }

  return value;
}

export function readRequiredString(
  body: unknown,
  key: string,
): string | undefined {
  const value = readOptionalString(body, key);

  if (value === undefined || value === null) {
    return undefined;
  }

  return value;
}
