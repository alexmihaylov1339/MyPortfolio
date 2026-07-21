'use client';

import { useLogout } from '@shared/hooks';

export default function LogoutButton() {
  const logout = useLogout();

  return (
    <button
      type="button"
      onClick={logout}
      className="mt-6 rounded-md border border-line bg-white px-4 py-2 text-sm font-semibold text-ink-strong transition hover:bg-brand-soft"
    >
      Log out
    </button>
  );
}
