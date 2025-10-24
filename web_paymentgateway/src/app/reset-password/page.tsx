'use client';

import { Suspense } from 'react';
import ResetPasswordForm from './ResetPasswordForm';

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<p className="text-center mt-10">Loading...</p>}>
            <ResetPasswordForm />
        </Suspense>
    );
}
