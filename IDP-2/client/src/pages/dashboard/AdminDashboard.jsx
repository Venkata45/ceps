import { motion } from 'framer-motion';
import EventList from '../../components/EventList';
import { FiPlus, FiCalendar, FiUsers, FiTrendingUp, FiClock, FiCheckCircle, FiRefreshCw, FiFilter, FiDownload, FiActivity, FiUserPlus, FiPieChart, FiBarChart2 } from 'react-icons/fi';
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import CreateEventModal from '../../components/CreateEventModal';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import UserManagementPanel from '../../components/UserManagementPanel';
import AddFacultyModal from '../../components/AddFacultyModal';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';

const AdminDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isFacultyModalOpen, setIsFacultyModalOpen] = useState(false);
    const [stats, setStats] = useState({
        total: 0,
        upcoming: 0,
        ongoing: 0,
        completed: 0,
        totalRegistrations: 0,
        totalCapacity: 0,
        todayEvents: 0,
        thisWeekEvents: 0
    });
    const [adminStats, setAdminStats] = useState({
        students: { total: 0, active: 0, locked: 0 },
        faculty: { total: 0, active: 0, locked: 0 }
    });
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [events, setEvents] = useState([]);

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

    const fetchAdminStats = async () => {
        try {
            const res = await api.get('/admin/stats');
            setAdminStats(res.data);
        } catch (error) {
            console.error('Failed to fetch admin stats:', error);
        }
    };

    const fetchEvents = async () => {
        try {
            const res = await api.get('/events');
            setEvents(res.data);
        } catch (error) {
            console.error('Failed to fetch events:', error);
        }
    };

    useEffect(() => {
        fetchStats();
        fetchEvents();
        fetchAdminStats();
    }, []);

    // Chart Data Calculations
    const eventTypeData = useMemo(() => {
        const counts = events.reduce((acc, event) => {
            acc[event.type] = (acc[event.type] || 0) + 1;
            return acc;
        }, {});
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [events]);

    const registrationData = useMemo(() => {
        return events.slice(-5).map(event => ({
            name: event.title.length > 10 ? event.title.slice(0, 10) + '...' : event.title,
            registrations: event.registeredUsers?.length || 0,
            capacity: event.capacity
        }));
    }, [events]);

    const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

    const exportEvents = () => {
        const csvContent = [
            ['Title', 'Date', 'Venue', 'Type', 'Status', 'Registrations', 'Capacity'].join(','),
            ...events.map(event => [
                event.title,
                new Date(event.date).toLocaleDateString(),
                event.venue,
                event.type,
                event.status,
                event.registeredUsers?.length || 0,
                event.capacity
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'events_report.csv';
        a.click();
    };

    const handleStatCardClick = (stat) => {
        if (stat.action === 'navigate' && stat.route) {
            // Navigate to dedicated page
            navigate(stat.route);
        } else if (stat.action === 'filter' && stat.filterValue) {
            // Apply filter and scroll to event list
            setFilter(stat.filterValue);
            // Scroll to event list smoothly
            setTimeout(() => {
                const eventListElement = document.querySelector('.event-list-section');
                if (eventListElement) {
                    eventListElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 100);
        }
    };

    const statCards = [
        {
            title: 'Total Events',
            value: stats.total,
            icon: FiCalendar,
            color: 'indigo',
            bg: 'bg-indigo-50',
            text: 'text-indigo-600',
            action: 'filter',
            filterValue: 'all'
        },
        {
            title: 'Today',
            value: stats.todayEvents || 0,
            icon: FiActivity,
            color: 'red',
            bg: 'bg-red-50',
            text: 'text-red-600',
            action: 'filter',
            filterValue: 'today'
        },
        {
            title: 'This Week',
            value: stats.thisWeekEvents || 0,
            icon: FiTrendingUp,
            color: 'orange',
            bg: 'bg-orange-50',
            text: 'text-orange-600',
            action: 'filter',
            filterValue: 'all' // Will show all events
        },
        {
            title: 'Upcoming',
            value: stats.upcoming,
            icon: FiClock,
            color: 'amber',
            bg: 'bg-amber-50',
            text: 'text-amber-600',
            action: 'filter',
            filterValue: 'upcoming'
        },
        {
            title: 'Ongoing',
            value: stats.ongoing,
            icon: FiCalendar,
            color: 'emerald',
            bg: 'bg-emerald-50',
            text: 'text-emerald-600',
            action: 'filter',
            filterValue: 'ongoing'
        },
        {
            title: 'Completed',
            value: stats.completed,
            icon: FiCheckCircle,
            color: 'slate',
            bg: 'bg-slate-50',
            text: 'text-slate-600',
            action: 'filter',
            filterValue: 'completed'
        },
        {
            title: 'Registrations',
            value: stats.totalRegistrations,
            icon: FiUsers,
            color: 'purple',
            bg: 'bg-purple-50',
            text: 'text-purple-600',
            action: 'navigate',
            route: '/admin/registrations'
        },
        {
            title: 'Total Capacity',
            value: stats.totalCapacity,
            icon: FiUsers,
            color: 'blue',
            bg: 'bg-blue-50',
            text: 'text-blue-600',
            action: 'filter',
            filterValue: 'all'
        }
    ];

    const adminStatCards = [
        {
            title: 'Total Students',
            value: adminStats.students.total,
            subtitle: `${adminStats.students.active} Active`,
            icon: FiUsers,
            color: 'blue',
            bg: 'bg-blue-50',
            text: 'text-blue-600',
            route: '/admin/students'
        },
        {
            title: 'Total Faculty',
            value: adminStats.faculty.total,
            subtitle: `${adminStats.faculty.active} Active`,
            icon: FiUserPlus,
            color: 'purple',
            bg: 'bg-purple-50',
            text: 'text-purple-600',
            route: '/admin/faculty'
        }
    ];

    return (
        <div className="pt-20 px-4 md:px-8 max-w-7xl mx-auto pb-20">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="w-8 h-1 bg-indigo-600 rounded-full" />
                        <span className="text-xs font-black uppercase tracking-widest text-indigo-600">Administrative Central</span>
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tighter">Event Command Center</h1>
                    <p className="mt-4 text-slate-500 font-medium max-w-md leading-relaxed italic border-l-2 border-slate-100 pl-4">
                        Schedule, monitor, and manage every college event with comprehensive digital oversight.
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
                        onClick={exportEvents}
                        className="px-4 py-2.5 rounded-xl font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm"
                    >
                        <FiDownload className="w-4 h-4" />
                        Export
                    </motion.button>
                    {user && user.role === 'admin' && (
                        <>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setIsFacultyModalOpen(true)}
                                className="px-4 py-2.5 rounded-xl font-medium text-white bg-purple-600 hover:bg-purple-700 transition-all flex items-center gap-2 shadow-sm"
                            >
                                <FiUserPlus className="w-4 h-4" />
                                Add Faculty
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setIsModalOpen(true)}
                                className="btn-primary flex items-center gap-3 !px-8 !py-4 shadow-indigo-600/30"
                            >
                                <FiPlus className="w-5 h-5" />
                                <span className="font-bold uppercase tracking-widest text-sm">Schedule Event</span>
                            </motion.button>
                        </>
                    )}
                </div>
            </div>

            {/* Statistics Cards */}
            {!loading && (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-8">
                    {statCards.map((stat, index) => (
                        <motion.div
                            key={stat.title}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1 + index * 0.05 }}
                            whileHover={{ y: -4, scale: 1.02 }}
                            onClick={() => handleStatCardClick(stat)}
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
                </div>
            )}

            {/* Visual Analytics Section */}
            {!loading && events.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
                    {/* Pie Chart: Event Distribution */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                                <FiPieChart className="w-5 h-5 text-indigo-600" />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 tracking-tight">Session Distribution</h3>
                        </div>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={eventTypeData}
                                        cx="50%"
                                        cy="45%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {eventTypeData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                    />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* Bar Chart: Registration Trends */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                                <FiBarChart2 className="w-5 h-5 text-emerald-600" />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 tracking-tight">Recent Registration Trends</h3>
                        </div>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={registrationData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                                    <Tooltip
                                        cursor={{ fill: '#f8fafc' }}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                    />
                                    <Bar dataKey="registrations" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={30} />
                                    <Bar dataKey="capacity" fill="#e2e8f0" radius={[4, 4, 0, 0]} barSize={30} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Admin Statistics - Students & Faculty */}
            {!loading && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="mb-8"
                >
                    <div className="flex items-center gap-2 mb-4">
                        <FiUsers className="w-5 h-5 text-slate-500" />
                        <span className="text-sm font-bold text-slate-700 uppercase tracking-wider">User Statistics</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        {adminStatCards.map((stat, index) => (
                            <motion.div
                                key={stat.title}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.1 + index * 0.05 }}
                                whileHover={{ y: -4, scale: 1.02 }}
                                onClick={() => navigate(stat.route)}
                                className={`${stat.bg} border border-white/50 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer`}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center`}>
                                        <stat.icon className={`w-6 h-6 ${stat.text}`} />
                                    </div>
                                </div>
                                <div className={`text-3xl font-black ${stat.text} mb-1`}>
                                    {stat.value.toLocaleString()}
                                </div>
                                <div className={`text-xs font-medium ${stat.text} opacity-70`}>
                                    {stat.title}
                                </div>
                                <div className={`text-xs font-bold ${stat.text} mt-2`}>
                                    {stat.subtitle}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Filter Tabs */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="mb-8"
            >
                <div className="flex items-center gap-2 mb-6">
                    <FiFilter className="w-5 h-5 text-slate-500" />
                    <span className="text-sm font-bold text-slate-700 uppercase tracking-wider">Event Filters</span>
                </div>
                <div className="flex flex-wrap gap-2">
                    {['all', 'today', 'upcoming', 'ongoing', 'completed'].map((status) => (
                        <motion.button
                            key={status}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setFilter(status)}
                            className={`px-4 py-2 rounded-xl font-medium text-sm capitalize transition-all ${filter === status
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                                }`}
                        >
                            {status}
                        </motion.button>
                    ))}
                </div>
            </motion.div>

            <div className="relative event-list-section">
                <div className="absolute top-0 left-0 w-full h-full bg-slate-50/50 -z-10 rounded-[3rem]" />
                <EventList filters={{ status: filter }} />
            </div>

            <div className="mt-10">
                <UserManagementPanel />
            </div>

            {user && user.role === 'admin' && (
                <>
                    <CreateEventModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
                    <AddFacultyModal
                        isOpen={isFacultyModalOpen}
                        onClose={() => setIsFacultyModalOpen(false)}
                        onSuccess={() => {
                            fetchAdminStats();
                            // Optionally refresh user management panel
                        }}
                    />
                </>
            )}
        </div>
    );
};

export default AdminDashboard;
