'use client';

import { ProtectedRoute } from '@shared/components';

import { ModelForm } from '@features/models/form/components';

export default function NewModelPage() {
  return (
    <ProtectedRoute>
      <main className="p-6">
        <h1 className="mb-6 text-xl font-semibold text-ink-strong">
          Add model
        </h1>
        <div className="max-w-md">
          <ModelForm mode="create" />
        </div>
      </main>
    </ProtectedRoute>
  );
}
