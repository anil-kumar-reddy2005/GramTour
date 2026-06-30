'use client';
import { useRouter, usePathname } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function BackButton() {
    const router = useRouter();
    const pathname = usePathname();

    // Don't show the back button on the very root home page
    if (pathname === '/') {
        return null;
    }

    return (
        <button
            onClick={() => router.back()}
            style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-primary)',
                padding: '0.25rem'
            }}
            aria-label="Go Back"
            title="Go Back"
        >
            <ArrowLeft size={24} />
        </button>
    );
}
