export function normalizeEmail(email?: string): string | null {
  const normalized = email?.trim().toLowerCase() ?? '';
  return normalized || null;
}

export function publicUser(u: {
  id: string;
  email: string;
  name: string | null;
}) {
  return { id: u.id, email: u.email, name: u.name ?? undefined };
}
