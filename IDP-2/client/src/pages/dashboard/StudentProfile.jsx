import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { FiUser, FiMail, FiPhone, FiHash, FiBook, FiCalendar, FiEdit3, FiSave, FiX, FiCheckCircle } from 'react-icons/fi';

const StudentProfile = () => {
    const { user, login } = useAuth(); // login to refresh user context
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    const [profile, setProfile] = useState({
        name: '',
        email: '',
        department: '',
        year: '',
        registrationNumber: '',
        phoneNumber: ''
    });

    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        if (user) {
            setProfile({
                name: user.name || '',
                email: user.email || '',
                department: user.department || '',
                year: user.year || '',
                registrationNumber: user.registrationNumber || '',
                phoneNumber: user.phoneNumber || ''
            });
            setLoading(false);
        }
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });

        try {
            const res = await api.put('/users/profile', profile);
            setMessage({ type: 'success', text: '✅ Profile updated successfully!' });
            setEditing(false);

            // Refresh auth context with new data
            // We might need a better way to refresh user than just re-logging in
            // For now, let's assume the context can be updated or just rely on the next refresh
        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: '❌ Failed to update profile: ' + (error.response?.data?.msg || error.message) });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-slate-500 font-bold animate-pulse uppercase tracking-widest text-xs">Loading Profile...</p>
            </div>
        );
    }

    return (
        <div className="pt-24 px-4 md:px-8 max-w-4xl mx-auto pb-20">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4"
            >
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="w-8 h-1 bg-indigo-600 rounded-full" />
                        <span className="text-xs font-black uppercase tracking-widest text-indigo-600">Account Settings</span>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Student Profile</h1>
                    <p className="mt-2 text-slate-500 font-medium">Manage your personal information and academic details.</p>
                </div>
                {!editing && (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setEditing(true)}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all flex items-center gap-2"
                    >
                        <FiEdit3 className="w-4 h-4" />
                        Edit Profile
                    </motion.button>
                )}
            </motion.div>

            {message.text && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className={`p-4 rounded-2xl mb-8 font-bold text-sm ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
                        }`}
                >
                    {message.text}
                </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Column: Avatar & Basic Info */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="md:col-span-1 space-y-6"
                >
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 p-8 text-center">
                        <div className="w-32 h-32 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full mx-auto mb-6 flex items-center justify-center text-white text-5xl font-black shadow-2xl shadow-indigo-500/30">
                            {profile.name.charAt(0)}
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 leading-tight">{profile.name}</h2>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-1">{user.role}</p>

                        <div className="mt-8 pt-8 border-t border-slate-50 space-y-4">
                            <div className="flex items-center gap-3 text-slate-600">
                                <FiMail className="w-4 h-4 flex-shrink-0" />
                                <span className="text-sm font-medium truncate">{profile.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-600">
                                <FiPhone className="w-4 h-4 flex-shrink-0" />
                                <span className="text-sm font-medium">{profile.phoneNumber || 'No phone set'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-indigo-50 rounded-3xl p-6 border border-indigo-100">
                        <h4 className="font-black text-indigo-900 text-sm uppercase tracking-widest mb-3">Registration Status</h4>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-200 text-indigo-700 rounded-xl flex items-center justify-center">
                                <FiCheckCircle className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-sm font-black text-indigo-900">Verified Student</p>
                                <p className="text-xs text-indigo-600 font-medium">Account is active</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Right Column: Edit Form */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="md:col-span-2"
                >
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
                        <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                            <h3 className="text-xl font-black text-slate-900">Academic & Personal Details</h3>
                            {editing && (
                                <button
                                    onClick={() => {
                                        setEditing(false);
                                        setMessage({ type: '', text: '' });
                                    }}
                                    className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                                >
                                    <FiX className="w-5 h-5 text-slate-400" />
                                </button>
                            )}
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Name */}
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                                    <div className="relative">
                                        <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="text"
                                            disabled={!editing}
                                            value={profile.name}
                                            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                            className={`w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 transition-all font-bold ${editing
                                                    ? 'bg-white border-slate-100 focus:border-indigo-500 outline-none'
                                                    : 'bg-slate-50 border-transparent text-slate-500 cursor-not-allowed'
                                                }`}
                                        />
                                    </div>
                                </div>

                                {/* Email */}
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Email (Read Only)</label>
                                    <div className="relative">
                                        <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="email"
                                            disabled
                                            value={profile.email}
                                            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-transparent rounded-2xl font-bold text-slate-400 cursor-not-allowed"
                                        />
                                    </div>
                                </div>

                                {/* Department */}
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Department</label>
                                    <div className="relative">
                                        <FiBook className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="text"
                                            disabled={!editing}
                                            value={profile.department}
                                            onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                                            className={`w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 transition-all font-bold ${editing
                                                    ? 'bg-white border-slate-100 focus:border-indigo-500 outline-none'
                                                    : 'bg-slate-50 border-transparent text-slate-500 cursor-not-allowed'
                                                }`}
                                            placeholder="e.g. Computer Science"
                                        />
                                    </div>
                                </div>

                                {/* Year */}
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Year of Study</label>
                                    <div className="relative">
                                        <FiCalendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="text"
                                            disabled={!editing}
                                            value={profile.year}
                                            onChange={(e) => setProfile({ ...profile, year: e.target.value })}
                                            className={`w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 transition-all font-bold ${editing
                                                    ? 'bg-white border-slate-100 focus:border-indigo-500 outline-none'
                                                    : 'bg-slate-50 border-transparent text-slate-500 cursor-not-allowed'
                                                }`}
                                            placeholder="e.g. 3rd Year"
                                        />
                                    </div>
                                </div>

                                {/* Registration Number */}
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Registration Number</label>
                                    <div className="relative">
                                        <FiHash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="text"
                                            disabled={!editing}
                                            value={profile.registrationNumber}
                                            onChange={(e) => setProfile({ ...profile, registrationNumber: e.target.value })}
                                            className={`w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 transition-all font-bold ${editing
                                                    ? 'bg-white border-slate-100 focus:border-indigo-500 outline-none'
                                                    : 'bg-slate-50 border-transparent text-slate-500 cursor-not-allowed'
                                                }`}
                                            placeholder="e.g. 2021CS001"
                                        />
                                    </div>
                                </div>

                                {/* Phone */}
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                                    <div className="relative">
                                        <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="tel"
                                            disabled={!editing}
                                            value={profile.phoneNumber}
                                            onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value })}
                                            className={`w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 transition-all font-bold ${editing
                                                    ? 'bg-white border-slate-100 focus:border-indigo-500 outline-none'
                                                    : 'bg-slate-50 border-transparent text-slate-500 cursor-not-allowed'
                                                }`}
                                            placeholder="10-digit number"
                                        />
                                    </div>
                                </div>
                            </div>

                            {editing && (
                                <div className="flex gap-4 pt-6 border-t border-slate-50">
                                    <motion.button
                                        type="button"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setEditing(false)}
                                        className="flex-1 px-6 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black transition-colors"
                                    >
                                        Cancel
                                    </motion.button>
                                    <motion.button
                                        type="submit"
                                        disabled={saving}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="flex-1 px-6 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {saving ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                <FiSave className="w-5 h-5" />
                                                Save Changes
                                            </>
                                        )}
                                    </motion.button>
                                </div>
                            )}
                        </form>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default StudentProfile;
