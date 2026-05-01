import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUsers, FiArrowLeft, FiSearch, FiDownload, FiCalendar, FiMapPin, FiClock, FiCheckCircle, FiXCircle, FiAlertCircle } from 'react-icons/fi';
import api from '../../utils/api';

const RegistrationsDetailPage = () => {
    const navigate = useNavigate();
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterEvent, setFilterEvent] = useState('all');
    const [events, setEvents] = useState([]);

    useEffect(() => {
        fetchRegistrations();
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const res = await api.get('/events');
            setEvents(res.data);
        } catch (error) {
            console.error('Failed to fetch events:', error);
        }
    };

    const fetchRegistrations = async () => {
        try {
            const res = await api.get('/admin/registrations');
            setRegistrations(res.data);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch registrations:', error);
            setLoading(false);
        }
    };

    const handleVerifyPayment = async (eventId, userId, status) => {
        try {
            await api.post('/admin/verify-payment', {
                eventId,
                userId,
                status
            });
            alert(`✅ Payment ${status === 'Verified' ? 'verified' : 'rejected'} successfully!`);
            fetchRegistrations(); // Refresh list
        } catch (error) {
            console.error('Failed to update payment status:', error);
            alert('❌ Failed to update payment status: ' + (error.response?.data?.msg || error.message));
        }
    };

    const filteredRegistrations = registrations.filter(reg => {
        const matchesSearch = reg.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            reg.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            reg.eventTitle?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesFilter = filterEvent === 'all' || reg.eventId === filterEvent;

        return matchesSearch && matchesFilter;
    });

    const statsCards = [
        {
            title: 'Total Registrations',
            value: registrations.length,
            icon: FiUsers,
            color: 'purple',
            bg: 'bg-purple-50',
            text: 'text-purple-600'
        },
        {
            title: 'Unique Events',
            value: [...new Set(registrations.map(r => r.eventId))].length,
            icon: FiCalendar,
            color: 'indigo',
            bg: 'bg-indigo-50',
            text: 'text-indigo-600'
        },
        {
            title: 'Unique Users',
            value: [...new Set(registrations.map(r => r.userId))].length,
            icon: FiUsers,
            color: 'blue',
            bg: 'bg-blue-50',
            text: 'text-blue-600'
        }
    ];

    const exportToCSV = () => {
        const csvContent = [
            ['Event', 'User Name', 'Email', 'User Type', 'Registration Date'].join(','),
            ...filteredRegistrations.map(r => [
                r.eventTitle,
                r.userName,
                r.userEmail,
                r.userRole || 'N/A',
                new Date(r.registeredAt).toLocaleDateString()
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'registrations_list.csv';
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
                            <span className="text-xs font-black uppercase tracking-widest text-purple-600">Registration Analytics</span>
                        </div>
                        <h1 className="text-5xl font-black text-slate-900 tracking-tighter">All Registrations</h1>
                        <p className="mt-4 text-slate-500 font-medium max-w-md leading-relaxed italic border-l-2 border-slate-100 pl-4">
                            Complete overview of all event registrations across the platform
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
                            placeholder="Search by event, user name, or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-slate-50"
                        />
                    </div>
                    <select
                        value={filterEvent}
                        onChange={(e) => setFilterEvent(e.target.value)}
                        className="px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-slate-50 font-medium"
                    >
                        <option value="all">All Events</option>
                        {events.map(event => (
                            <option key={event._id} value={event._id}>{event.title}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Registrations Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-black text-slate-700 uppercase tracking-wider">Event</th>
                                <th className="px-6 py-4 text-left text-xs font-black text-slate-700 uppercase tracking-wider">User</th>
                                <th className="px-6 py-4 text-left text-xs font-black text-slate-700 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-4 text-left text-xs font-black text-slate-700 uppercase tracking-wider">User Type</th>
                                <th className="px-6 py-4 text-left text-xs font-black text-slate-700 uppercase tracking-wider">Payment</th>
                                <th className="px-6 py-4 text-left text-xs font-black text-slate-700 uppercase tracking-wider">Registered On</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                                        Loading registrations...
                                    </td>
                                </tr>
                            ) : filteredRegistrations.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                                        No registrations found
                                    </td>
                                </tr>
                            ) : (
                                filteredRegistrations.map((reg, index) => (
                                    <motion.tr
                                        key={reg._id || index}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="hover:bg-slate-50 transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                                    <FiCalendar className="w-5 h-5 text-white" />
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-slate-900">{reg.eventTitle}</div>
                                                    <div className="text-xs text-slate-500">{reg.eventVenue || 'Venue TBA'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                                                    {reg.userName?.charAt(0).toUpperCase() || 'U'}
                                                </div>
                                                <span className="font-medium text-slate-900">{reg.userName || 'Unknown'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {reg.userEmail || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${reg.userRole === 'student' ? 'bg-blue-100 text-blue-700' :
                                                reg.userRole === 'faculty' ? 'bg-purple-100 text-purple-700' :
                                                    'bg-slate-100 text-slate-700'
                                                }`}>
                                                {reg.userRole?.toUpperCase() || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {reg.paymentRequired ? (
                                                <div className="flex flex-col gap-2">
                                                    {reg.paymentStatus === 'Verified' ? (
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 w-fit">
                                                            <FiCheckCircle className="w-3 h-3" />
                                                            Paid ₹{reg.paymentAmount}
                                                        </span>
                                                    ) : reg.paymentStatus === 'Pending' ? (
                                                        <>
                                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 w-fit">
                                                                <FiAlertCircle className="w-3 h-3" />
                                                                Pending ₹{reg.paymentAmount}
                                                            </span>
                                                            <div className="flex gap-1">
                                                                <button
                                                                    onClick={() => handleVerifyPayment(reg.eventId, reg.userId, 'Verified')}
                                                                    className="text-[10px] font-black uppercase tracking-tighter px-2 py-1 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors"
                                                                >
                                                                    Verify
                                                                </button>
                                                                <button
                                                                    onClick={() => handleVerifyPayment(reg.eventId, reg.userId, 'Rejected')}
                                                                    className="text-[10px] font-black uppercase tracking-tighter px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                                                                >
                                                                    Reject
                                                                </button>
                                                            </div>
                                                            {reg.transactionId && (
                                                                <span className="text-[10px] text-slate-400 font-mono">ID: {reg.transactionId}</span>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 w-fit">
                                                            <FiXCircle className="w-3 h-3" />
                                                            {reg.paymentStatus} ₹{reg.paymentAmount}
                                                        </span>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
                                                    Free Event
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            <div className="flex items-center gap-2">
                                                <FiClock className="w-4 h-4 text-slate-400" />
                                                {new Date(reg.registeredAt).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </div>
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
                Showing {filteredRegistrations.length} of {registrations.length} registrations
            </div>
        </div>
    );
};

export default RegistrationsDetailPage;
