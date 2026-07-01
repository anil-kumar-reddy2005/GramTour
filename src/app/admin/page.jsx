'use client';
import { useState, useEffect } from 'react';
import { Users, MapPin, Package, BookOpen, Settings, Trash2, Edit2, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import './admin.css';
import { deleteVillage, updateBookingStatus, deleteExperience, updateUserRole, deleteUser } from '../actions/adminActions';
import SmartImage from '../../components/SmartImage';
export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('bookings');
    const [bookings, setBookings] = useState([]);
    const [villages, setVillages] = useState([]);
    const [experiences, setExperiences] = useState([]);
    const [users, setUsers] = useState([]);
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [settingsSaveMsg, setSettingsSaveMsg] = useState('');
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [verifyingUser, setVerifyingUser] = useState(true);

    useEffect(() => {
        // First verify admin role
        fetch('/api/auth/me')
            .then(res => res.json())
            .then(data => {
                if (!data.user || data.user.role !== 'admin') {
                    window.location.href = '/dashboard';
                } else {
                    setVerifyingUser(false);
                    fetchAdminData();
                }
            })
            .catch(() => {
                window.location.href = '/login';
            });
    }, []);

    const fetchAdminData = () => {
        Promise.all([
            fetch('/api/bookings').then(res => res.json()),
            fetch('/api/villages').then(res => res.json()),
            fetch('/api/experiences').then(res => res.json()),
            fetch('/api/admin/users').then(res => res.json()),
            fetch('/api/admin/settings').then(res => res.json())
        ]).then(([bData, vData, eData, uData, sData]) => {
            setBookings(Array.isArray(bData) ? bData : []);
            setVillages(Array.isArray(vData) ? vData : []);
            setExperiences(Array.isArray(eData) ? eData : []);
            setUsers(Array.isArray(uData) ? uData : []);
            if (sData && sData.qrCodeUrl) setQrCodeUrl(sData.qrCodeUrl);
            setLoading(false);
        });
    };

    const handleStatusChange = async (id, newStatus) => {
        const res = await updateBookingStatus(id, newStatus);
        if (res.success) {
            setBookings(bookings.map(b => b.id === id ? { ...b, status: newStatus } : b));
        } else {
            alert(res.error);
        }
    };

    const handleDeleteVillage = async (id) => {
        if (!confirm('Are you absolutely sure you want to permanently delete this village? This will delete all associated experiences and bookings as well.')) return;
        setLoading(true);
        const res = await deleteVillage(id);
        if (res.success) {
            fetchAdminData();
        } else {
            alert(res.error);
            setLoading(false);
        }
    };

    const handleDeleteExperience = async (id) => {
        if (!confirm('Are you sure you want to delete this experience?')) return;
        setLoading(true);
        const res = await deleteExperience(id);
        if (res.success) {
            fetchAdminData();
        } else {
            alert(res.error);
            setLoading(false);
        }
    };

    const handleRoleChange = async (id, role) => {
        if (!confirm(`Change this user's role to ${role}?`)) return;
        const res = await updateUserRole(id, role);
        if (res.success) {
            setUsers(users.map(u => u.id === id ? { ...u, role } : u));
        } else {
            alert(res.error);
        }
    };

    const handleDeleteUser = async (id) => {
        if (!confirm('Are you sure you want to permanently delete this user?')) return;
        const res = await deleteUser(id);
        if (res.success) {
            setUsers(users.filter(u => u.id !== id));
        } else {
            alert(res.error);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        setSettingsSaveMsg('Uploading file...');

        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch('/api/admin/settings/upload', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();

            if (res.ok && data.success) {
                setQrCodeUrl(data.qrCodeUrl);
                setSettingsSaveMsg('QR Code uploaded and saved successfully!');
                setTimeout(() => setSettingsSaveMsg(''), 3000);
            } else {
                setSettingsSaveMsg('Error uploading file: ' + (data.error || 'Unknown error'));
            }
        } catch (err) {
            console.error(err);
            setSettingsSaveMsg('Failed to upload.');
        } finally {
            setUploading(false);
            e.target.value = null; // reset input
        }
    };

    const handleSaveSettings = async (e) => {
        e.preventDefault();
        setSettingsSaveMsg('Saving...');
        try {
            const res = await fetch('/api/admin/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ qrCodeUrl })
            });
            if (res.ok) {
                setSettingsSaveMsg('Settings saved successfully!');
                setTimeout(() => setSettingsSaveMsg(''), 3000);
            } else {
                setSettingsSaveMsg('Error saving settings.');
            }
        } catch (err) {
            console.error(err);
            setSettingsSaveMsg('Failed to process.');
        }
    };

    if (verifyingUser) {
        return <div className="loading" style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Verifying credentials...</div>;
    }

    return (<div className="admin-page">
        <div className="admin-header">
            <div className="container header-content">
                <div>
                    <h1>Admin Control Panel</h1>
                    <p>Manage GramTour operations, villages, and bookings.</p>
                </div>
                <div className="admin-badge">Admin Mode</div>
            </div>
        </div>

        <div className="container" style={{ marginBottom: '2rem' }}>
            {/* Stats Summary Cards Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: '600' }}>Total Bookings</span>
                    <strong style={{ fontSize: '2.25rem', color: 'var(--color-primary)', fontWeight: '700' }}>{bookings.length}</strong>
                </div>
                <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: '600' }}>Active Villages</span>
                    <strong style={{ fontSize: '2.25rem', color: 'var(--color-primary)', fontWeight: '700' }}>{villages.length}</strong>
                </div>
                <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: '600' }}>Experiences Offered</span>
                    <strong style={{ fontSize: '2.25rem', color: 'var(--color-primary)', fontWeight: '700' }}>{experiences.length}</strong>
                </div>
                <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: '600' }}>Registered Users</span>
                    <strong style={{ fontSize: '2.25rem', color: 'var(--color-primary)', fontWeight: '700' }}>{users.length}</strong>
                </div>
            </div>
        </div>

        <div className="container admin-container">
            <aside className="admin-sidebar">
                <button className={`admin-tab ${activeTab === 'bookings' ? 'active' : ''}`} onClick={() => setActiveTab('bookings')}>
                    <BookOpen size={18} /> Manage Bookings
                </button>
                <button className={`admin-tab ${activeTab === 'villages' ? 'active' : ''}`} onClick={() => setActiveTab('villages')}>
                    <MapPin size={18} /> Villages Database
                </button>
                <button className={`admin-tab ${activeTab === 'experiences' ? 'active' : ''}`} onClick={() => setActiveTab('experiences')}>
                    <Package size={18} /> Experiences
                </button>
                <button className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
                    <Users size={18} /> Users
                </button>
                <button className={`admin-tab ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
                    <Settings size={18} /> Settings
                </button>
            </aside>

            <main className="admin-main">
                {loading ? (<div className="loading">Loading admin data...</div>) : activeTab === 'bookings' ? (<div className="admin-panel card">
                    <div className="panel-header">
                        <h2>Recent Bookings</h2>
                        <button className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>Export CSV</button>
                    </div>
                    <div className="table-container">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Date</th>
                                    <th>Experience</th>
                                    <th>Village</th>
                                    <th>Guests</th>
                                    <th>Photo ID</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bookings.map(booking => (<tr key={booking.id}>
                                    <td>#{booking.id}</td>
                                    <td>{booking.booking_date}</td>
                                    <td>{booking.experience_title}</td>
                                    <td>{booking.village_name}</td>
                                    <td>{booking.persons}</td>
                                    <td>
                                        {booking.photo_id_url ? (
                                            <a 
                                                href={booking.photo_id_url} 
                                                target="_blank" 
                                                rel="noopener noreferrer" 
                                                style={{ color: 'var(--color-primary)', fontWeight: '600', textDecoration: 'none' }}
                                            >
                                                View ID
                                            </a>
                                        ) : (
                                            <span style={{ color: 'var(--color-text-muted)' }}>None</span>
                                        )}
                                    </td>
                                    <td>
                                        <select value={booking.status} onChange={(e) => handleStatusChange(booking.id, e.target.value)} className={`status-select ${booking.status.toLowerCase()}`}>
                                            <option value="pending">Pending</option>
                                            <option value="confirmed">Confirmed</option>
                                            <option value="completed">Completed</option>
                                        </select>
                                    </td>
                                    <td>
                                        <button className="btn-accent btn-small" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>View</button>
                                    </td>
                                </tr>))}
                                {bookings.length === 0 && (<tr>
                                    <td colSpan={8} className="text-center py-4">No bookings found.</td>
                                </tr>)}
                            </tbody>
                        </table>
                    </div>
                </div>) : activeTab === 'villages' ? (<div className="admin-panel card">
                    <div className="panel-header">
                        <h2>Manage Villages</h2>
                        <Link href="/admin/villages/new" className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', textDecoration: 'none' }}>+ Add New Village</Link>
                    </div>
                    <div className="table-container">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>State</th>
                                    <th>Homestay Price</th>
                                    <th>Coordinates</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {villages.map(village => (<tr key={village.id}>
                                    <td>#{village.id}</td>
                                    <td className="font-semibold text-primary">{village.name}</td>
                                    <td>{village.state}</td>
                                    <td>₹{village.homestay_price}</td>
                                    <td className="text-muted text-sm">{village.latitude}, {village.longitude}</td>
                                    <td className="actions-cell">
                                        <Link href={`/admin/villages/${village.id}/edit`} className="btn-accent btn-small" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', marginRight: '0.5rem', textDecoration: 'none', display: 'inline-block' }}>Edit</Link>
                                        <button onClick={() => handleDeleteVillage(village.id)} className="btn-accent btn-small" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', backgroundColor: '#dc3545', border: 'none' }}>Delete</button>
                                    </td>
                                </tr>))}
                            </tbody>
                        </table>
                    </div>
                </div>) : activeTab === 'experiences' ? (<div className="admin-panel card">
                    <div className="panel-header">
                        <h2>Manage Experiences</h2>
                        <Link href="/admin/experiences/new" className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', textDecoration: 'none' }}>+ Add Experience</Link>
                    </div>
                    <div className="table-container">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Title</th>
                                    <th>Village</th>
                                    <th>Duration</th>
                                    <th>Price</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {experiences.map(exp => (<tr key={exp.id}>
                                    <td>#{exp.id}</td>
                                    <td className="font-semibold">{exp.title}</td>
                                    <td>{villages.find(v => v.id === exp.village_id)?.name || 'Unknown'}</td>
                                    <td>{exp.duration_hours}h</td>
                                    <td>₹{exp.price}</td>
                                    <td className="actions-cell">
                                        <Link href={`/admin/experiences/${exp.id}/edit`} className="btn-accent btn-small" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', marginRight: '0.5rem', textDecoration: 'none', display: 'inline-block' }}>Edit</Link>
                                        <button onClick={() => handleDeleteExperience(exp.id)} className="btn-accent btn-small" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', backgroundColor: '#dc3545', border: 'none' }}>Delete</button>
                                    </td>
                                </tr>))}
                                {experiences.length === 0 && (<tr>
                                    <td colSpan={6} className="text-center py-4">No experiences found.</td>
                                </tr>)}
                            </tbody>
                        </table>
                    </div>
                </div>) : activeTab === 'users' ? (<div className="admin-panel card">
                    <div className="panel-header">
                        <h2>Manage Users</h2>
                    </div>
                    <div className="table-container">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Joined</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (<tr key={u.id}>
                                    <td>#{u.id}</td>
                                    <td className="font-semibold">{u.name}</td>
                                    <td>{u.email}</td>
                                    <td>
                                        <select value={u.role} onChange={(e) => handleRoleChange(u.id, e.target.value)} className="role-select" style={{ padding: '0.25rem', borderRadius: '4px', border: '1px solid #d1d5db' }}>
                                            <option value="tourist">Tourist</option>
                                            <option value="creator">Creator</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </td>
                                    <td>{new Date(u.created_at).toLocaleDateString()}</td>
                                    <td className="actions-cell">
                                        <button onClick={() => handleDeleteUser(u.id)} className="btn-accent btn-small" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', backgroundColor: '#dc3545', border: 'none' }}>Delete</button>
                                    </td>
                                </tr>))}
                                {users.length === 0 && (<tr>
                                    <td colSpan={6} className="text-center py-4">No users found.</td>
                                </tr>)}
                            </tbody>
                        </table>
                    </div>
                </div>) : activeTab === 'settings' ? (
                    <div className="admin-panel card">
                        <div className="panel-header">
                            <h2>Platform Settings</h2>
                        </div>
                        <div className="settings-content" style={{ padding: '2rem' }}>
                            <form onSubmit={handleSaveSettings} style={{ maxWidth: '600px' }}>
                                <div className="form-group">
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Custom UPI QR Code URL</label>
                                    <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>Enter a direct image URL (e.g. from an image host like Imgur, or a local public path like `/myqr.png`) to display to tourists during checkout.</p>
                                    <input
                                        type="text"
                                        value={qrCodeUrl}
                                        onChange={(e) => setQrCodeUrl(e.target.value)}
                                        placeholder="https://example.com/my-qr-code.png"
                                        style={{ width: '100%', padding: '0.75rem', marginBottom: '1.5rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}
                                    />
                                    {qrCodeUrl && (
                                        <div style={{ marginBottom: '1.5rem', border: '1px dashed #ccc', padding: '1rem', display: 'inline-block', borderRadius: 'var(--radius-md)' }}>
                                            <p style={{ fontSize: '0.75rem', marginBottom: '0.5rem', color: '#666' }}>Preview Image:</p>
                                            <div style={{ width: '200px', height: '200px' }}>
                                                <SmartImage src={qrCodeUrl} alt="QR Preview" objectFit="contain" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                                    <button type="submit" className="btn-primary" disabled={uploading}>Save URL Mapping</button>
                                    {settingsSaveMsg && <span style={{ fontSize: '0.875rem', color: settingsSaveMsg.includes('Error') || settingsSaveMsg.includes('Failed') ? '#dc3545' : 'var(--color-primary)' }}>{settingsSaveMsg}</span>}
                                </div>
                            </form>

                            <div className="form-group" style={{ maxWidth: '600px', borderTop: '1px solid var(--color-border)', paddingTop: '2rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Or Upload a QR Code Image</label>
                                <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>Select an image file from your computer to securely upload it to the server and automatically set it as your active QR code.</p>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                    disabled={uploading}
                                    style={{ padding: '0.5rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', width: '100%', cursor: 'pointer' }}
                                />
                                {uploading && <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'var(--color-primary)' }}>Uploading file to server...</p>}
                            </div>
                        </div>
                    </div>
                ) : (<div className="admin-panel card">
                    <div className="panel-header">
                        <h2>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Management</h2>
                    </div>
                    <div className="placeholder-content text-center py-5 text-muted">
                        <p>This module is under construction.</p>
                    </div>
                </div>)}
            </main>
        </div>
    </div>);
}
