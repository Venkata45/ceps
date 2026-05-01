import { useEffect, useState } from 'react';
import api from '../utils/api';
import { io } from 'socket.io-client';
import { FiCalendar, FiMapPin, FiUser, FiClock, FiCheckCircle, FiClipboard, FiStar, FiDollarSign } from 'react-icons/fi';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import AttendanceModal from './AttendanceModal';
import FeedbackModal from './FeedbackModal';
import EditEventModal from './EditEventModal';
import PaymentModal from './PaymentModal';
import RegistrationModal from './RegistrationModal';

const SOCKET_URL = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace('/api', '')
    : 'http://localhost:5001';
const socket = io(SOCKET_URL, {
    transports: ['polling', 'websocket'],
    upgrade: false,
    reconnectionAttempts: 3,
    timeout: 10000,
});

const EventList = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    // Modals State
    const [attendanceModalOpen, setAttendanceModalOpen] = useState(false);
    const [selectedEventForAttendance, setSelectedEventForAttendance] = useState(null);
    const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
    const [selectedEventForFeedback, setSelectedEventForFeedback] = useState(null);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedEventForEdit, setSelectedEventForEdit] = useState(null);
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [selectedEventForPayment, setSelectedEventForPayment] = useState(null);
    const [registrationModalOpen, setRegistrationModalOpen] = useState(false);
    const [selectedEventForRegistration, setSelectedEventForRegistration] = useState(null);

    const fetchEvents = async () => {
        try {
            const res = await api.get('/events');
            setEvents(res.data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const handleOutcomeUpload = (event) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.pdf,.doc,.docx,.ppt,.pptx';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (file) {
                try {
                    const formData = new FormData();
                    formData.append('file', file);
                    formData.append('eventId', event._id);
                    formData.append('facultyId', user.id);

                    const res = await api.post('/events/outcomes/upload', formData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    });

                    alert('✅ Outcome uploaded successfully!');
                } catch (error) {
                    alert('❌ Failed to upload outcome: ' + (error.response?.data?.msg || error.message));
                }
            }
        };
        input.click();
    };

    const handleRegister = async (event) => {
        if (!user) {
            alert("Please login to register");
            return;
        }

        // If payment required, open payment modal (2-step: details + payment)
        if (event.paymentRequired) {
            setSelectedEventForPayment(event);
            setPaymentModalOpen(true);
            return;
        }

        // Free event - open registration modal (collect details first)
        setSelectedEventForRegistration(event);
        setRegistrationModalOpen(true);
    };

    const handlePaymentSuccess = () => {
        fetchEvents(); // Refresh events after payment
        setPaymentModalOpen(false);
        setSelectedEventForPayment(null);
    };

    const handleRegistrationSuccess = () => {
        fetchEvents(); // Refresh events after registration
        setRegistrationModalOpen(false);
        setSelectedEventForRegistration(null);
    };

    const openAttendance = (event) => {
        setSelectedEventForAttendance(event);
        setAttendanceModalOpen(true);
    };

    const openFeedback = (event) => {
        setSelectedEventForFeedback(event);
        setFeedbackModalOpen(true);
    };

    const openEdit = (event) => {
        setSelectedEventForEdit(event);
        setEditModalOpen(true);
    };

    const handleEventUpdated = (updatedEvent) => {
        setEvents(prev => prev.map(event =>
            event._id === updatedEvent._id ? updatedEvent : event
        ));
    };

    useEffect(() => {
        fetchEvents();

        socket.on('newEvent', (event) => {
            setEvents((prev) => [event, ...prev]);
        });

        socket.on('updateEvent', (updatedEvent) => {
            setEvents((prev) => prev.map(evt => evt._id === updatedEvent._id ? updatedEvent : evt));
        });

        return () => {
            socket.off('newEvent');
            socket.off('updateEvent');
        };
    }, []);

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-500 font-bold animate-pulse uppercase tracking-widest text-xs">Loading Events...</p>
        </div>
    );

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {events.map((event, index) => {
                    const isRegistered = user && event.registeredUsers?.includes(user.id);
                    const capacity = parseInt(event.capacity);
                    const registeredCount = event.registeredUsers?.length || 0;
                    const isFull = registeredCount >= capacity;

                    return (
                        <motion.div
                            key={event._id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1, duration: 0.5 }}
                            whileHover={{ y: -8 }}
                            className="group flex flex-col bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300"
                        >
                            {/* Status/Type Header */}
                            <div className="relative h-32 overflow-hidden">
                                <div className={clsx("absolute inset-0 opacity-10 font-black flex items-center justify-center text-7xl select-none", {
                                    'text-blue-500': event.type === 'FDP',
                                    'text-green-500': event.type === 'SDP',
                                    'text-purple-500': event.type === 'Cultural',
                                    'text-slate-500': !['FDP', 'SDP', 'Cultural'].includes(event.type)
                                })}>
                                    {event.type}
                                </div>
                                <div className={clsx("absolute inset-x-0 bottom-0 h-1", {
                                    'bg-indigo-600': event.type === 'FDP',
                                    'bg-emerald-500': event.type === 'SDP',
                                    'bg-purple-600': event.type === 'Cultural',
                                    'bg-slate-400': !['FDP', 'SDP', 'Cultural'].includes(event.type)
                                })} />

                                <div className="absolute top-6 left-6 right-6 flex justify-between items-center">
                                    <span className="px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-sm shadow-sm text-[10px] font-black uppercase tracking-widest text-slate-800 border border-slate-100">
                                        {event.type}
                                    </span>
                                    <span className={clsx("px-4 py-1.5 rounded-full shadow-sm text-[10px] font-black uppercase tracking-widest border", {
                                        'bg-emerald-50 text-emerald-600 border-emerald-100': event.status === 'Upcoming',
                                        'bg-amber-50 text-amber-600 border-amber-100': event.status === 'Ongoing',
                                        'bg-slate-50 text-slate-600 border-slate-100': event.status === 'Completed',
                                    })}>
                                        {event.status}
                                    </span>
                                </div>
                            </div>

                            <div className="p-8 flex-1 flex flex-col">
                                {console.log(`Event ${event.title} debug:`, {
                                    payReq: event.paymentRequired,
                                    fee: event.registrationFee,
                                    upi: event.upiId
                                })}
                                <h3 className="text-2xl font-black text-slate-900 leading-tight mb-4 group-hover:text-indigo-600 transition-colors tracking-tight">
                                    {event.title}
                                </h3>
                                <p className="text-slate-500 text-sm font-medium line-clamp-2 mb-8 leading-relaxed italic">
                                    "{event.description}"
                                </p>

                                <div className="mt-auto space-y-4 pt-6 border-t border-slate-50">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                                                <FiCalendar className="w-4 h-4" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] uppercase font-black text-slate-400">Date</span>
                                                <span className="text-xs font-bold text-slate-800">{new Date(event.date).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
                                                <FiClock className="w-4 h-4" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] uppercase font-black text-slate-400">Time</span>
                                                <span className="text-xs font-bold text-slate-800">{new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                                            <FiMapPin className="w-4 h-4" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] uppercase font-black text-slate-400">Venue</span>
                                            <span className="text-xs font-bold text-slate-800">{event.venue}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                                            <FiUser className="w-4 h-4" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] uppercase font-black text-slate-400">Speaker</span>
                                            <span className="text-xs font-bold text-slate-800">{event.trainer?.name}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Enhanced Capacity Bar */}
                            <div className="px-8 mt-2">
                                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className={clsx("h-full transition-all duration-1000", {
                                            'bg-emerald-500': (registeredCount / capacity) < 0.5,
                                            'bg-amber-500': (registeredCount / capacity) >= 0.5 && (registeredCount / capacity) < 0.8,
                                            'bg-orange-500': (registeredCount / capacity) >= 0.8 && (registeredCount / capacity) < 0.95,
                                            'bg-red-500': (registeredCount / capacity) >= 0.95,
                                        })}
                                        style={{ width: `${Math.min((registeredCount / capacity) * 100, 100)}%` }}
                                    />
                                </div>
                                <div className="flex justify-between items-center mt-3 px-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Seats</span>
                                        <span className={clsx("text-xs font-bold px-2 py-1 rounded-full", {
                                            'bg-emerald-50 text-emerald-700': (registeredCount / capacity) < 0.5,
                                            'bg-amber-50 text-amber-700': (registeredCount / capacity) >= 0.5 && (registeredCount / capacity) < 0.8,
                                            'bg-orange-50 text-orange-700': (registeredCount / capacity) >= 0.8 && (registeredCount / capacity) < 0.95,
                                            'bg-red-50 text-red-700': (registeredCount / capacity) >= 0.95,
                                        })}>
                                            {registeredCount} / {capacity}
                                        </span>
                                    </div>
                                    <span className="text-[10px] font-medium text-slate-500">
                                        {capacity - registeredCount} left
                                    </span>
                                </div>
                                {isFull && (
                                    <div className="mt-2 text-center">
                                        <span className="text-xs font-bold text-red-600 bg-red-50 px-3 py-1 rounded-full">
                                            🔒 Event Full
                                        </span>
                                    </div>
                                )}
                                {registeredCount > 0 && registeredCount < capacity && (registeredCount / capacity) >= 0.8 && (
                                    <div className="mt-2 text-center">
                                        <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
                                            ⚠️ Filling Fast
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="p-8 space-y-3">
                                {/* Student Registration Button */}
                                {user && user.role === 'student' && event.status === 'Upcoming' && (
                                    <motion.button
                                        whileHover={!isRegistered && !isFull ? { scale: 1.02 } : {}}
                                        whileTap={!isRegistered && !isFull ? { scale: 0.98 } : {}}
                                        onClick={() => handleRegister(event)}
                                        disabled={isRegistered || isFull}
                                        className={clsx("w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2", {
                                            'bg-emerald-100 text-emerald-700 cursor-default': isRegistered,
                                            'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30 hover:from-indigo-700 hover:to-purple-700': !isRegistered && !isFull && event.paymentRequired,
                                            'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-700': !isRegistered && !isFull && !event.paymentRequired,
                                            'bg-slate-100 text-slate-400 cursor-not-allowed': !isRegistered && isFull
                                        })}
                                    >
                                        {isRegistered ? (
                                            <>
                                                <FiCheckCircle className="w-5 h-5" /> Registered
                                            </>
                                        ) : isFull ? (
                                            'Capacity Reached'
                                        ) : event.paymentRequired ? (
                                            <>
                                                <FiDollarSign className="w-5 h-5" />
                                                Register & Pay ₹{event.registrationFee}
                                            </>
                                        ) : (
                                            'Register Now'
                                        )}
                                    </motion.button>
                                )}

                                {/* Student Feedback Button */}
                                {user && user.role === 'student' && event.status === 'Completed' && isRegistered && (
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => openFeedback(event)}
                                        className="w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest bg-amber-500 text-white shadow-lg shadow-amber-500/20 hover:bg-amber-600 transition-all flex items-center justify-center gap-2"
                                    >
                                        <FiStar className="w-5 h-5" /> Experience Survey
                                    </motion.button>
                                )}

                                {/* Admin Edit Button */}
                                {user && user.role === 'admin' && (
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => openEdit(event)}
                                        className="w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                                    >
                                        <FiCalendar className="w-5 h-5" /> Edit Event
                                    </motion.button>
                                )}

                                {/* Faculty Attendance Button */}
                                {user && user.role === 'faculty' && (
                                    <div className="mt-2">
                                        {event.status === 'Ongoing' && (
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => openAttendance(event)}
                                                className="w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest bg-slate-900 text-white shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                                            >
                                                <FiClipboard className="w-5 h-5" /> Manage Attendance
                                            </motion.button>
                                        )}
                                        {event.status !== 'Ongoing' && (
                                            <div className="w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest bg-slate-200 text-slate-500 flex items-center justify-center gap-2 cursor-not-allowed">
                                                <FiClipboard className="w-5 h-5" /> Attendance (Event {event.status})
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Faculty Outcome Upload Button */}
                                {user && user.role === 'faculty' && event.status === 'Completed' && (
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleOutcomeUpload(event)}
                                        className="w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                                    >
                                        <FiStar className="w-5 h-5" /> Upload Outcome
                                    </motion.button>
                                )}
                            </div>
                        </motion.div>
                    )
                })}
            </div>

            <AttendanceModal
                isOpen={attendanceModalOpen}
                onClose={() => setAttendanceModalOpen(false)}
                eventId={selectedEventForAttendance?._id}
                eventTitle={selectedEventForAttendance?.title}
            />

            <FeedbackModal
                isOpen={feedbackModalOpen}
                onClose={() => setFeedbackModalOpen(false)}
                eventId={selectedEventForFeedback?._id}
                eventTitle={selectedEventForFeedback?.title}
            />

            <EditEventModal
                isOpen={editModalOpen}
                onClose={() => setEditModalOpen(false)}
                event={selectedEventForEdit}
                onEventUpdated={handleEventUpdated}
            />

            <PaymentModal
                isOpen={paymentModalOpen}
                onClose={() => setPaymentModalOpen(false)}
                event={selectedEventForPayment}
                onSuccess={handlePaymentSuccess}
            />

            <RegistrationModal
                isOpen={registrationModalOpen}
                onClose={() => setRegistrationModalOpen(false)}
                event={selectedEventForRegistration}
                onSuccess={handleRegistrationSuccess}
            />
        </>
    );
};

export default EventList;
