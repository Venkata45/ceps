import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { FiLock, FiUnlock, FiRefreshCw, FiUsers, FiTrash2 } from 'react-icons/fi';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const UserManagementPanel = () => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [updatingUserId, setUpdatingUserId] = useState(null);
    const [deletingUserId, setDeletingUserId] = useState(null);

    const canManage = currentUser?.role === 'admin';

    const sortedUsers = useMemo(() => {
        return [...users].sort((a, b) => {
            const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return bTime - aTime;
        });
    }, [users]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError('');
            const res = await api.get('/users');
            setUsers(res.data || []);
        } catch (e) {
            setError(e.response?.data?.msg || e.message || 'Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (canManage) {
            fetchUsers();
        } else {
            setLoading(false);
        }
    }, [canManage]);

    const setLockState = async (targetUserId, nextLocked) => {
        try {
            setUpdatingUserId(targetUserId);
            await api.put(`/users/${targetUserId}/lock`, { isLocked: nextLocked });
            setUsers(prev => prev.map(u => (u.id === targetUserId ? { ...u, isLocked: nextLocked } : u)));
        } catch (e) {
            setError(e.response?.data?.msg || e.message || 'Failed to update user');
        } finally {
            setUpdatingUserId(null);
        }
    };

    const deleteFaculty = async (facultyId, facultyName) => {
        if (!window.confirm(`Are you sure you want to delete ${facultyName}? This action cannot be undone.`)) {
            return;
        }

        try {
            setDeletingUserId(facultyId);
            await api.delete(`/admin/faculty/${facultyId}`);
            setUsers(prev => prev.filter(u => u.id !== facultyId));
        } catch (e) {
            setError(e.response?.data?.msg || e.message || 'Failed to delete faculty');
        } finally {
            setDeletingUserId(null);
        }
    };

    if (!canManage) {
        return null;
    }

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6">
            <div className="flex items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                        <FiUsers className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-900">User Management</h3>
                        <p className="text-sm text-slate-500">Lock/unlock accounts and review registrations</p>
                    </div>
                </div>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={fetchUsers}
                    className="px-4 py-2.5 rounded-xl font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm"
                >
                    <FiRefreshCw className="w-4 h-4" />
                    Refresh
                </motion.button>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl mb-4 text-sm font-semibold">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="text-center py-10">
                    <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-t-indigo-600" />
                    <div className="text-slate-500 mt-3 font-bold uppercase tracking-widest text-xs">Loading users...</div>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="text-left text-slate-500 uppercase tracking-wider text-xs">
                                <th className="py-3 pr-4">Name</th>
                                <th className="py-3 pr-4">Email</th>
                                <th className="py-3 pr-4">Role</th>
                                <th className="py-3 pr-4">Department</th>
                                <th className="py-3 pr-4">Year</th>
                                <th className="py-3 pr-4">Status</th>
                                <th className="py-3">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {sortedUsers.map(u => {
                                const isSelf = currentUser?.id && u.id === currentUser.id;
                                const isBusy = updatingUserId === u.id;
                                const locked = Boolean(u.isLocked);
                                return (
                                    <tr key={u.id} className="text-slate-800">
                                        <td className="py-4 pr-4 font-semibold whitespace-nowrap">{u.name}</td>
                                        <td className="py-4 pr-4 whitespace-nowrap">{u.email}</td>
                                        <td className="py-4 pr-4 whitespace-nowrap">
                                            <span className="px-2 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs">
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="py-4 pr-4 whitespace-nowrap">{u.department || '—'}</td>
                                        <td className="py-4 pr-4 whitespace-nowrap">{u.year || '—'}</td>
                                        <td className="py-4 pr-4 whitespace-nowrap">
                                            {locked ? (
                                                <span className="px-2 py-1 rounded-full bg-red-50 border border-red-200 text-red-700 font-bold text-xs">Locked</span>
                                            ) : (
                                                <span className="px-2 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-xs">Active</span>
                                            )}
                                        </td>
                                        <td className="py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <motion.button
                                                    whileHover={{ scale: isSelf || isBusy ? 1 : 1.05 }}
                                                    whileTap={{ scale: isSelf || isBusy ? 1 : 0.95 }}
                                                    disabled={isSelf || isBusy}
                                                    onClick={() => setLockState(u.id, !locked)}
                                                    className={`px-3 py-2 rounded-xl font-bold text-xs uppercase tracking-widest border transition-all inline-flex items-center gap-2 ${isSelf || isBusy
                                                        ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                                                        : locked
                                                            ? 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                                            : 'bg-red-600 text-white border-red-600 hover:bg-red-700'
                                                        }`}
                                                >
                                                    {locked ? <FiUnlock className="w-4 h-4" /> : <FiLock className="w-4 h-4" />}
                                                    {locked ? 'Unlock' : 'Lock'}
                                                </motion.button>

                                                {/* Delete button - only show for faculty */}
                                                {u.role === 'faculty' && (
                                                    <motion.button
                                                        whileHover={{ scale: deletingUserId === u.id ? 1 : 1.05 }}
                                                        whileTap={{ scale: deletingUserId === u.id ? 1 : 0.95 }}
                                                        disabled={deletingUserId === u.id}
                                                        onClick={() => deleteFaculty(u.id, u.name)}
                                                        className={`px-3 py-2 rounded-xl font-bold text-xs uppercase tracking-widest border transition-all inline-flex items-center gap-2 ${deletingUserId === u.id
                                                                ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                                                                : 'bg-rose-600 text-white border-rose-600 hover:bg-rose-700'
                                                            }`}
                                                    >
                                                        <FiTrash2 className="w-4 h-4" />
                                                        {deletingUserId === u.id ? 'Deleting...' : 'Delete'}
                                                    </motion.button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    {sortedUsers.length === 0 && (
                        <div className="text-center py-10 text-slate-500 font-medium">No users found.</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default UserManagementPanel;
