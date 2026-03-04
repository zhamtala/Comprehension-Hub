'use client';

import { Suspense } from 'react';
import ResetPasswordForm from './ResetPasswordForm';

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-4">
      <Suspense fallback={<p className="text-cyan-200">Loading reset form...</p>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}