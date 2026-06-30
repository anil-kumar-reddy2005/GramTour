'use client';
import { useState, useEffect } from 'react';
import { LayoutDashboard, X, Users, CreditCard, Activity, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminButton() {
    const [isOpen, setIsOpen] = useState(false);
    const [stats, setStats] = useState({
        creators: 0,
        tourists: 0,
        transactions: 0,
        activities: 0
    });

    // Fetch stats when opened
    useEffect(() => {
        if (isOpen) {
            fetch('/api/admin/stats')
                .then(res => res.json())
                .then(data => setStats(data))
                .catch(err => console.error(err));
        }
    }, [isOpen]);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="btn-accent"
                style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', background: '#eab308', color: 'black' }}
            >
                <LayoutDashboard size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                Admin
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            style={{
                                position: 'fixed',
                                top: 0, left: 0, right: 0, bottom: 0,
                                background: 'rgba(0,0,0,0.5)',
                                zIndex: 9998,
                                backdropFilter: 'blur(4px)'
                            }}
                        />

                        {/* Drawer */}
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            style={{
                                position: 'fixed',
                                top: 0, right: 0, bottom: 0,
                                width: '400px',
                                maxWidth: '100%',
                                background: 'white',
                                zIndex: 9999,
                                boxShadow: '-5px 0 25px rgba(0,0,0,0.1)',
                                padding: '2rem',
                                overflowY: 'auto'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Admin Dashboard</h2>
                                <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                                    <X size={24} />
                                </button>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <StatCard icon={<Users color="#3b82f6" />} title="Creators" value={stats.creators} />
                                <StatCard icon={<MapPin color="#eab308" />} title="Tourists" value={stats.tourists} />
                                <StatCard icon={<CreditCard color="#22c55e" />} title="Bookings" value={stats.transactions} />
                                <StatCard icon={<Activity color="#a855f7" />} title="Experiences" value={stats.activities} />
                            </div>

                            <div style={{ marginTop: '2.5rem' }}>
                                <h3>Recent Activity</h3>
                                <div style={{ marginTop: '1rem', color: '#666', fontSize: '0.875rem' }}>
                                    <p>Live tracking of activities will appear here.</p>
                                    <div style={{ padding: '1rem', background: '#f3f4f6', borderRadius: '8px', marginTop: '1rem' }}>
                                        <p><strong>System Status:</strong> Healthy</p>
                                        <p><strong>Uptime:</strong> 99.9%</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}

function StatCard({ icon, title, value }) {
    return (
        <div style={{
            background: '#f9fafb',
            padding: '1.25rem',
            borderRadius: '12px',
            border: '1px solid #f3f4f6'
        }}>
            <div style={{ marginBottom: '0.5rem' }}>{icon}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{value}</div>
            <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>Total {title}</div>
        </div>
    );
}
