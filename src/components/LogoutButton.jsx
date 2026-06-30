'use client';
import { LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { logout } from '../app/actions/authActions';
import { useRouter } from 'next/navigation';

export default function LogoutButton() {
    const router = useRouter();

    const handleLogout = async () => {
        try {
            // Delete client side session cookie (if httpOnly is false)
            if (typeof document !== 'undefined') {
                document.cookie = 'session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
            }
            await logout();
        } catch (err) {
            console.error("Server logout error:", err);
        } finally {
            // Force a full page reload to clear all React Context and Next.js Cache
            if (typeof window !== 'undefined') {
                window.location.href = '/';
            } else {
                router.push('/');
                router.refresh();
            }
        }
    };

    return (
        <motion.button
            onClick={handleLogout}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
                background: '#fee2e2',
                border: '1px solid #fca5a5',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                borderRadius: '999px',
                color: '#dc2626',
                fontWeight: '600',
                fontSize: '0.875rem',
                transition: 'background-color 0.2s ease',
            }}
            title="Securely Logout"
        >
            <LogOut size={16} />
            <span>Logout</span>
        </motion.button>
    );
}
