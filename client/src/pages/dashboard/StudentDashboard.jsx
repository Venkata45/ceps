import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { FiCalendar, FiCheckCircle, FiClock, FiMapPin, FiUsers, FiStar, FiFilter, FiDownload, FiUser } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import EventList from '../../components/EventList';
import FeedbackModal from '../../components/FeedbackModal';

const StudentDashboard = () => {
    const { user } = useAuth();
    const [registeredEvents, setRegisteredEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, upcoming, ongoing, completed
    const [attendance, setAttendance] = useState([]);
    const [feedbackEvent, setFeedbackEvent] = useState(null); // { _id, title } of event being reviewed

    const fetchRegisteredEvents = async () => {
        try {
            const res = await api.get('/events');

            // Filter events where student is registered
            const registered = res.data.filter(event =>
                event.registeredUsers?.includes(user.id)
            );

            setRegisteredEvents(registered);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch registered events:', error);
            setLoading(false);
        }
    };

    const fetchAttendance = async () => {
        try {
            const res = await api.get('/events/attendance/student');
            setAttendance(res.data);
        } catch (error) {
            console.error('Failed to fetch attendance:', error);
        }
    };

    useEffect(() => {
        fetchRegisteredEvents();
        fetchAttendance();
    }, []);

    const exportAttendance = () => {
        const csvContent = [
            ['Event Title', 'Date', 'Venue', 'Status', 'Attendance'].join(','),
            ...attendance.map(att => [
                att.eventTitle,
                new Date(att.eventDate).toLocaleDateString(),
                att.venue,
                att.status,
                att.present ? 'Present' : 'Absent'
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'attendance_report.csv';
        a.click();
    };

    const filteredEvents = registeredEvents.filter(event => {
        if (filter === 'all') return true;
        return event.status.toLowerCase() === filter;
    });

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Upcoming': return <FiClock className="w-4 h-4" />;
            case 'Ongoing': return <FiCalendar className="w-4 h-4" />;
            case 'Completed': return <FiCheckCircle className="w-4 h-4" />;
            default: return <FiClock className="w-4 h-4" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Upcoming': return 'text-amber-600 bg-amber-50 border-amber-100';
            case 'Ongoing': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
            case 'Completed': return 'text-slate-600 bg-slate-50 border-slate-100';
            default: return 'text-gray-600 bg-gray-50 border-gray-100';
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-slate-500 font-bold animate-pulse uppercase tracking-widest text-xs">Loading Your Events...</p>
            </div>
        );
    }

    return (
        <div className="pt-20 px-4 md:px-8 max-w-7xl mx-auto pb-20">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <div className="flex items-center gap-2 mb-2">
                    <span className="w-8 h-1 bg-purple-600 rounded-full" />
                    <span className="text-xs font-black uppercase tracking-widest text-purple-600">Student Portal</span>
                </div>
                <h1 className="text-5xl font-black text-slate-900 tracking-tighter">Digital Campus Life</h1>
                <p className="mt-4 text-slate-500 font-medium max-w-md leading-relaxed italic border-l-2 border-slate-100 pl-4">
                    View events, register digitally, track attendance, and provide feedback - all in one place.
                </p>
            </motion.div>

            {/* Stats Cards */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
            >
                <div className="bg-purple-50 border border-purple-100 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-3">
                        <FiCalendar className="w-8 h-8 text-purple-600" />
                        <span className="text-2xl font-black text-purple-600">
                            {registeredEvents.length}
                        </span>
                    </div>
                    <div className="text-sm font-bold text-purple-700">Total Registered</div>
                </div>

                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-3">
                        <FiClock className="w-8 h-8 text-amber-600" />
                        <span className="text-2xl font-black text-amber-600">
                            {registeredEvents.filter(e => e.status === 'Upcoming').length}
                        </span>
                    </div>
                    <div className="text-sm font-bold text-amber-700">Upcoming</div>
                </div>

                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-3">
                        <FiCheckCircle className="w-8 h-8 text-emerald-600" />
                        <span className="text-2xl font-black text-emerald-600">
                            {attendance.filter(a => a.present).length}
                        </span>
                    </div>
                    <div className="text-sm font-bold text-emerald-700">Events Attended</div>
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-3">
                        <FiStar className="w-8 h-8 text-slate-600" />
                        <span className="text-2xl font-black text-slate-600">
                            {attendance.filter(a => a.feedbackGiven).length}
                        </span>
                    </div>
                    <div className="text-sm font-bold text-slate-700">Feedback Given</div>
                </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex gap-3 mb-8"
            >
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={exportAttendance}
                    className="px-4 py-2.5 rounded-xl font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm"
                >
                    <FiDownload className="w-4 h-4" />
                    Export Attendance
                </motion.button>

                <Link to="/student/profile">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-4 py-2.5 rounded-xl font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-md shadow-indigo-600/20"
                    >
                        <FiUser className="w-4 h-4" />
                        Manage Profile
                    </motion.button>
                </Link>
            </motion.div>

            {/* Filter Tabs */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-8"
            >
                <div className="flex items-center gap-2 mb-6">
                    <FiFilter className="w-5 h-5 text-slate-500" />
                    <span className="text-sm font-bold text-slate-700 uppercase tracking-wider">Filter Your Events</span>
                </div>
                <div className="flex flex-wrap gap-2">
                    {['all', 'upcoming', 'ongoing', 'completed'].map((status) => (
                        <motion.button
                            key={status}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setFilter(status)}
                            className={`px-4 py-2 rounded-xl font-medium text-sm capitalize transition-all ${filter === status
                                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                                }`}
                        >
                            {status}
                        </motion.button>
                    ))}
                </div>
            </motion.div>

            {/* Registered Events List */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <div className="mb-6">
                    <h2 className="text-2xl font-black text-slate-900">Your Registered Events</h2>
                    <p className="text-slate-500 mt-1 font-medium">
                        {filter === 'all'
                            ? `Showing all ${registeredEvents.length} registered events`
                            : `Showing ${filteredEvents.length} ${filter} events`
                        }
                    </p>
                </div>

                {filteredEvents.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FiCalendar className="w-10 h-10 text-slate-400" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">No {filter === 'all' ? '' : filter} events found</h3>
                        <p className="text-slate-500">
                            {filter === 'all'
                                ? "You haven't registered for any events yet."
                                : `You don't have any ${filter} events.`
                            }
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                        {filteredEvents.map((event, index) => (
                            <motion.div
                                key={event._id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1, duration: 0.5 }}
                                whileHover={{ y: -8 }}
                                className="bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300"
                            >
                                {/* Status Header */}
                                <div className="p-6 pb-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusColor(event.status)}`}>
                                            {getStatusIcon(event.status)}
                                            <span className="ml-1">{event.status}</span>
                                        </span>
                                        <span className="text-xs font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded-full">
                                            {event.type}
                                        </span>
                                    </div>

                                    <h3 className="text-xl font-black text-slate-900 leading-tight mb-3">
                                        {event.title}
                                    </h3>
                                    <p className="text-slate-500 text-sm font-medium line-clamp-2 mb-4 leading-relaxed italic">
                                        "{event.description}"
                                    </p>
                                </div>

                                {/* Event Details */}
                                <div className="px-6 pb-4 space-y-3">
                                    <div className="flex items-center gap-3">
                                        <FiCalendar className="w-4 h-4 text-purple-600" />
                                        <span className="text-xs font-bold text-slate-800">
                                            {new Date(event.date).toLocaleDateString()} at {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <FiMapPin className="w-4 h-4 text-purple-600" />
                                        <span className="text-xs font-bold text-slate-800">{event.venue}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <FiUsers className="w-4 h-4 text-purple-600" />
                                        <span className="text-xs font-bold text-slate-800">
                                            {event.registeredUsers?.length || 0} / {event.capacity} registered
                                        </span>
                                    </div>
                                </div>

                                {/* Action Button */}
                                <div className="px-6 pb-6">
                                    {event.status === 'Completed' && (
                                        <div className="space-y-3">
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => setFeedbackEvent({ _id: event._id, title: event.title })}
                                                className="w-full py-3 rounded-xl font-bold text-sm uppercase tracking-widest bg-amber-500 text-white shadow-lg shadow-amber-500/20 hover:bg-amber-600 transition-all flex items-center justify-center gap-2"
                                            >
                                                <FiStar className="w-4 h-4" />
                                                Give Feedback
                                            </motion.button>

                                            {event.outcomes?.length > 0 && (
                                                <div className="pt-2 border-t border-slate-100">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Event Resources</p>
                                                    <div className="space-y-2">
                                                        {event.outcomes.map((outcome, idx) => (
                                                            <a
                                                                key={idx}
                                                                href={`${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5001'}/${outcome.filePath}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="flex items-center justify-between p-2 bg-slate-50 rounded-lg hover:bg-indigo-50 transition-colors group"
                                                            >
                                                                <span className="text-xs font-bold text-slate-700 group-hover:text-indigo-600 truncate max-w-[150px]">
                                                                    {outcome.originalName}
                                                                </span>
                                                                <FiDownload className="w-3 h-3 text-slate-400 group-hover:text-indigo-600" />
                                                            </a>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {event.status === 'Ongoing' && (
                                        <div className="w-full py-3 rounded-xl font-bold text-sm uppercase tracking-widest bg-emerald-100 text-emerald-700 text-center flex items-center justify-center gap-2">
                                            <FiActivity className="w-4 h-4" />
                                            Event in Progress
                                        </div>
                                    )}
                                    {event.status === 'Upcoming' && (
                                        <div className="space-y-2">
                                            <div className="w-full py-3 rounded-xl font-bold text-sm uppercase tracking-widest bg-purple-100 text-purple-700 text-center flex items-center justify-center gap-2">
                                                <FiCheckCircle className="w-4 h-4" />
                                                Registered
                                            </div>
                                            {event.paymentRequired && (
                                                <div className="text-center">
                                                    {event.payments?.find(p => p.userId.toString() === user.id)?.status === 'Verified' ? (
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                                                            Payment Verified
                                                        </span>
                                                    ) : event.payments?.find(p => p.userId.toString() === user.id)?.status === 'Rejected' ? (
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-red-600 bg-red-50 px-2 py-1 rounded-full">
                                                            Payment Issue - Contact Admin
                                                        </span>
                                                    ) : (
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 bg-amber-50 px-2 py-1 rounded-full animate-pulse">
                                                            Pending Verification
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </motion.div>

            {/* Available Events Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <div className="mb-6">
                    <h2 className="text-2xl font-black text-slate-900">Available Events</h2>
                    <p className="text-slate-500 mt-1 font-medium">Discover and register for upcoming events</p>
                </div>
                <EventList />
            </motion.div>

            {/* Feedback Modal */}
            {feedbackEvent && (
                <FeedbackModal
                    isOpen={!!feedbackEvent}
                    onClose={() => setFeedbackEvent(null)}
                    eventId={feedbackEvent._id}
                    eventTitle={feedbackEvent.title}
                />
            )}
        </div>
    );
};

export default StudentDashboard;
