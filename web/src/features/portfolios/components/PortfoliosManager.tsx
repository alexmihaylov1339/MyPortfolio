'use client';

import { useState, type FormEvent } from 'react';

import {
  usePortfoliosQuery,
  useCreatePortfolioMutation,
  useUpdatePortfolioMutation,
  useDeletePortfolioWithConfirmation,
} from '../hooks';
import type { Portfolio } from '../services';

export default function PortfoliosManager() {
  const { data: portfolios, isLoading, isError } = usePortfoliosQuery();
  const createMutation = useCreatePortfolioMutation();
  const updateMutation = useUpdatePortfolioMutation();
  const { handleDelete, isDeleting } = useDeletePortfolioWithConfirmation();

  const [newName, setNewName] = useState('');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();
    if (!newName.trim()) return;
    await createMutation.mutateAsync({ name: newName.trim() });
    setNewName('');
  };

  const startRename = (portfolio: Portfolio) => {
    setRenamingId(portfolio.id);
    setRenameValue(portfolio.name);
  };

  const submitRename = async (event: FormEvent, id: string) => {
    event.preventDefault();
    if (!renameValue.trim()) return;
    await updateMutation.mutateAsync({ id, input: { name: renameValue.trim() } });
    setRenamingId(null);
  };

  const setAsDefault = (id: string) => {
    updateMutation.mutate({ id, input: { isDefault: true } });
  };

  if (isLoading) {
    return <p className="text-ink-muted">Loading portfolios…</p>;
  }

  if (isError) {
    return <p className="text-destructive-text">Could not load your portfolios.</p>;
  }

  const list = portfolios ?? [];

  return (
    <div className="space-y-3">
      {list.map((portfolio) => (
        <div
          key={portfolio.id}
          className="flex items-center justify-between gap-3 rounded-[var(--radius-card)] border border-line-soft p-4 shadow-card"
        >
          {renamingId === portfolio.id ? (
            <form
              className="flex flex-1 items-center gap-2"
              onSubmit={(event) => submitRename(event, portfolio.id)}
            >
              <input
                autoFocus
                value={renameValue}
                onChange={(event) => setRenameValue(event.target.value)}
                className="flex-1 rounded-[var(--radius-control)] border border-line px-2 py-1 text-sm"
              />
              <button type="submit" className="cursor-pointer text-sm text-brand hover:underline">
                Save
              </button>
              <button
                type="button"
                onClick={() => setRenamingId(null)}
                className="cursor-pointer text-sm text-ink-muted hover:underline"
              >
                Cancel
              </button>
            </form>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-ink-strong">{portfolio.name}</span>
                {portfolio.isDefault && (
                  <span className="rounded-full bg-brand-soft px-2 py-0.5 text-xs font-medium text-brand">
                    Default
                  </span>
                )}
              </div>
              <div className="flex gap-3 text-sm">
                <button
                  type="button"
                  onClick={() => startRename(portfolio)}
                  className="cursor-pointer text-brand hover:underline"
                >
                  Rename
                </button>
                {!portfolio.isDefault && (
                  <button
                    type="button"
                    onClick={() => setAsDefault(portfolio.id)}
                    className="cursor-pointer text-brand hover:underline"
                  >
                    Set as default
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleDelete(portfolio)}
                  disabled={isDeleting || list.length <= 1}
                  title={
                    list.length <= 1
                      ? 'Cannot delete your only portfolio'
                      : undefined
                  }
                  className="cursor-pointer text-destructive-text hover:underline disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      ))}

      <form
        onSubmit={handleCreate}
        className="flex items-center gap-2 rounded-[var(--radius-card)] border border-dashed border-line p-4"
      >
        <input
          placeholder="New portfolio name"
          value={newName}
          onChange={(event) => setNewName(event.target.value)}
          className="flex-1 rounded-[var(--radius-control)] border border-line px-2 py-1 text-sm"
        />
        <button
          type="submit"
          disabled={createMutation.isPending || !newName.trim()}
          className="cursor-pointer rounded-[var(--radius-control)] bg-brand-accent px-3 py-1.5 text-sm font-medium text-brand-accent-ink transition hover:bg-brand-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          + Add portfolio
        </button>
      </form>
    </div>
  );
}
