import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUsers, FiArrowLeft, FiSearch, FiDownload, FiLock, FiUnlock, FiMail, FiBriefcase } from 'react-icons/fi';
import api from '../../utils/api';

const FacultyDetailPage = () => {
    const navigate = useNavigate();
    const [faculty, setFaculty] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all'); // all, active, locked

    useEffect(() => {
        fetchFaculty();
    }, []);

    const fetchFaculty = async () => {
        try {
            const res = await api.get('/admin/faculty');
            setFaculty(res.data);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch faculty:', error);
            setLoading(false);
        }
    };

    const filteredFaculty = faculty.filter(member => {
        const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.employeeId?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesFilter = filterStatus === 'all' ||
            (filterStatus === 'active' && !member.isLocked) ||
            (filterStatus === 'locked' && member.isLocked);

        return matchesSearch && matchesFilter;
    });

    const statsCards = [
        {
            title: 'Total Faculty',
            value: faculty.length,
            icon: FiUsers,
            color: 'purple',
            bg: 'bg-purple-50',
            text: 'text-purple-600'
        },
        {
            title: 'Active Faculty',
            value: faculty.filter(f => !f.isLocked).length,
            icon: FiUnlock,
            color: 'green',
            bg: 'bg-emerald-50',
            text: 'text-emerald-600'
        },
        {
            title: 'Locked Accounts',
            value: faculty.filter(f => f.isLocked).length,
            icon: FiLock,
            color: 'red',
            bg: 'bg-red-50',
            text: 'text-red-600'
        }
    ];

    const exportToCSV = () => {
        const csvContent = [
            ['Name', 'Email', 'Employee ID', 'Department', 'Status', 'Joined Date'].join(','),
            ...filteredFaculty.map(f => [
                f.name,
                f.email,
                f.employeeId || 'N/A',
                f.department || 'N/A',
                f.isLocked ? 'Locked' : 'Active',
                new Date(f.createdAt).toLocaleDateString()
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'faculty_list.csv';
        a.click();
    };

    return (
        <div className="pt-20 px-4 md:px-8 max-w-7xl mx-auto pb-20">
            {/* Header */}
            <div className="mb-8">
                <button
                    onClick={() => navigate('/admin')}
                    className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 font-medium mb-4 transition-colors"
                >
                    <FiArrowLeft className="w-5 h-5" />
                    Back to Dashboard
                </button>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="w-8 h-1 bg-purple-600 rounded-full" />
                            <span className="text-xs font-black uppercase tracking-widest text-purple-600">Faculty Management</span>
                        </div>
                        <h1 className="text-5xl font-black text-slate-900 tracking-tighter">All Faculty</h1>
                        <p className="mt-4 text-slate-500 font-medium max-w-md leading-relaxed italic border-l-2 border-slate-100 pl-4">
                            Complete overview of all faculty members in the system
                        </p>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={exportToCSV}
                        className="px-6 py-3 rounded-xl font-bold text-white bg-purple-600 hover:bg-purple-700 transition-all flex items-center gap-2 shadow-lg shadow-purple-600/30"
                    >
                        <FiDownload className="w-5 h-5" />
                        Export CSV
                    </motion.button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {statsCards.map((stat, index) => (
                    <motion.div
                        key={stat.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`${stat.bg} border border-white/50 rounded-2xl p-6 shadow-sm`}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center`}>
                                <stat.icon className={`w-6 h-6 ${stat.text}`} />
                            </div>
                        </div>
                        <div className={`text-3xl font-black ${stat.text} mb-1`}>
                            {stat.value.toLocaleString()}
                        </div>
                        <div className={`text-sm font-medium ${stat.text} opacity-70`}>
                            {stat.title}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Search and Filter */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6 shadow-sm">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by name, email, or employee ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-slate-50"
                        />
                    </div>
                    <div className="flex gap-2">
                        {['all', 'active', 'locked'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`px-4 py-3 rounded-xl font-medium text-sm capitalize transition-all ${filterStatus === status
                                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Faculty Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-black text-slate-700 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-4 text-left text-xs font-black text-slate-700 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-4 text-left text-xs font-black text-slate-700 uppercase tracking-wider">Employee ID</th>
                                <th className="px-6 py-4 text-left text-xs font-black text-slate-700 uppercase tracking-wider">Department</th>
                                <th className="px-6 py-4 text-left text-xs font-black text-slate-700 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-black text-slate-700 uppercase tracking-wider">Joined</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                                        Loading faculty...
                                    </td>
                                </tr>
                            ) : filteredFaculty.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                                        No faculty members found
                                    </td>
                                </tr>
                            ) : (
                                filteredFaculty.map((member) => (
                                    <motion.tr
                                        key={member._id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="hover:bg-slate-50 transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                                                    {member.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="font-semibold text-slate-900">{member.name}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <FiMail className="w-4 h-4 text-slate-400" />
                                                <span className="text-slate-600">{member.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-sm text-slate-600">
                                            <div className="flex items-center gap-2">
                                                <FiBriefcase className="w-4 h-4 text-slate-400" />
                                                {member.employeeId || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {member.department || 'Not specified'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${member.isLocked
                                                ? 'bg-red-100 text-red-700'
                                                : 'bg-emerald-100 text-emerald-700'
                                                }`}>
                                                {member.isLocked ? (
                                                    <>
                                                        <FiLock className="w-3 h-3" />
                                                        Locked
                                                    </>
                                                ) : (
                                                    <>
                                                        <FiUnlock className="w-3 h-3" />
                                                        Active
                                                    </>
                                                )}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {new Date(member.createdAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Results counter */}
            <div className="mt-4 text-center text-sm text-slate-500 font-medium">
                Showing {filteredFaculty.length} of {faculty.length} faculty members
            </div>
        </div>
    );
};

export default FacultyDetailPage;
