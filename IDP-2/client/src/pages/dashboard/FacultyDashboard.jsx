import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import EventList from '../../components/EventList';
import api from '../../utils/api';
import { FiCalendar, FiUsers, FiClock, FiCheckCircle, FiRefreshCw, FiUpload, FiFileText, FiActivity } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const FacultyDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        total: 0,
        upcoming: 0,
        ongoing: 0,
        completed: 0,
        totalRegistrations: 0,
        todayEvents: 0,
        thisWeekEvents: 0
    });
    const [loading, setLoading] = useState(true);
    const [outcomes, setOutcomes] = useState([]);
    const [showOutcomes, setShowOutcomes] = useState(false);

    const fetchStats = async () => {
        try {
            const res = await api.get('/events/stats/overview');
            setStats(res.data);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
            setLoading(false);
        }
    };

    const fetchOutcomes = async () => {
        try {
            const res = await api.get('/events/outcomes');
            setOutcomes(res.data);
        } catch (error) {
            console.error('Failed to fetch outcomes:', error);
        }
    };

    useEffect(() => {
        fetchStats();
        fetchOutcomes();
    }, []);

    const handleOutcomeUpload = async (eventId, file) => {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('eventId', eventId);
            formData.append('facultyId', user.id);

            const res = await api.post('/events/outcomes/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            alert('✅ Outcome uploaded successfully!');
            fetchOutcomes();
        } catch (error) {
            alert('❌ Failed to upload outcome: ' + (error.response?.data?.msg || error.message));
        }
    };

    const statCards = [
        {
            title: 'Total Events',
            value: stats.total,
            icon: FiCalendar,
            color: 'emerald',
            bg: 'bg-emerald-50',
            text: 'text-emerald-600'
        },
        {
            title: 'Today',
            value: stats.todayEvents || 0,
            icon: FiActivity,
            color: 'red',
            bg: 'bg-red-50',
            text: 'text-red-600'
        },
        {
            title: 'This Week',
            value: stats.thisWeekEvents || 0,
            icon: FiClock,
            color: 'orange',
            bg: 'bg-orange-50',
            text: 'text-orange-600'
        },
        {
            title: 'Ongoing',
            value: stats.ongoing,
            icon: FiCalendar,
            color: 'blue',
            bg: 'bg-blue-50',
            text: 'text-blue-600'
        },
        {
            title: 'Completed',
            value: stats.completed,
            icon: FiCheckCircle,
            color: 'slate',
            bg: 'bg-slate-50',
            text: 'text-slate-600'
        },
        {
            title: 'Total Registrations',
            value: stats.totalRegistrations,
            icon: FiUsers,
            color: 'purple',
            bg: 'bg-purple-50',
            text: 'text-purple-600'
        }
    ];

    return (
        <div className="pt-20 px-4 md:px-8 max-w-7xl mx-auto pb-20">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="w-8 h-1 bg-emerald-500 rounded-full" />
                        <span className="text-xs font-black uppercase tracking-widest text-emerald-600">Faculty Hub</span>
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tighter">Session Management</h1>
                    <p className="mt-4 text-slate-500 font-medium max-w-md leading-relaxed italic border-l-2 border-slate-100 pl-4">
                        Manage your academic sessions, track attendance, and upload event outcomes digitally.
                    </p>
                </div>
                <div className="flex gap-3">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={fetchStats}
                        className="px-4 py-2.5 rounded-xl font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm"
                    >
                        <FiRefreshCw className="w-4 h-4" />
                        Refresh
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowOutcomes(!showOutcomes)}
                        className="px-4 py-2.5 rounded-xl font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm"
                    >
                        <FiFileText className="w-4 h-4" />
                        {showOutcomes ? 'Hide' : 'Show'} Outcomes
                    </motion.button>
                </div>
            </div>

            {/* Statistics Cards */}
            {!loading && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8"
                >
                    {statCards.map((stat, index) => (
                        <motion.div
                            key={stat.title}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1 + index * 0.05 }}
                            whileHover={{ y: -4, scale: 1.02 }}
                            className={`${stat.bg} border border-white/50 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer`}
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className={`w-8 h-8 ${stat.bg} rounded-lg flex items-center justify-center`}>
                                    <stat.icon className={`w-4 h-4 ${stat.text}`} />
                                </div>
                            </div>
                            <div className={`text-lg font-black ${stat.text}`}>
                                {stat.value.toLocaleString()}
                            </div>
                            <div className={`text-xs font-medium ${stat.text} opacity-70 mt-1`}>
                                {stat.title}
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            )}

            {/* Outcomes Section */}
            {showOutcomes && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6">
                        <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <FiFileText className="w-5 h-5 text-emerald-600" />
                            Event Outcomes & Reports
                        </h3>
                        <div className="space-y-3">
                            {outcomes.length === 0 ? (
                                <p className="text-slate-500 text-center py-8">No outcomes uploaded yet</p>
                            ) : (
                                outcomes.map((outcome) => (
                                    <div key={outcome._id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                        <div>
                                            <p className="font-medium text-slate-900">{outcome.eventTitle}</p>
                                            <p className="text-sm text-slate-500">Uploaded: {new Date(outcome.uploadDate).toLocaleDateString()}</p>
                                        </div>
                                        <a 
                                            href={outcome.fileUrl} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-emerald-600 hover:text-emerald-700 font-medium text-sm"
                                        >
                                            View Document
                                        </a>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </motion.div>
            )}

            <div className="relative">
                <div className="absolute top-0 left-0 w-full h-full bg-slate-50/50 -z-10 rounded-[3rem]" />
                <EventList />
            </div>
        </div>
    );
};
export default FacultyDashboard;
