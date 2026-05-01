import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCheckCircle, FiUser, FiMail, FiPhone, FiHash, FiChevronRight } from 'react-icons/fi';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const RegistrationModal = ({ isOpen, onClose, event, onSuccess }) => {
    const { user } = useAuth();
    const [step, setStep] = useState(1); // 1: Fill Details, 2: Confirmation
    const [studentDetails, setStudentDetails] = useState({
        name: user?.name || '',
        email: user?.email || '',
        studentId: user?.studentId || user?.registrationNumber || '',
        phone: user?.phone || user?.phoneNumber || ''
    });
    const [submitting, setSubmitting] = useState(false);

    // Update details when user changes or modal opens
    useEffect(() => {
        if (isOpen && user) {
            setStudentDetails({
                name: user.name || '',
                email: user.email || '',
                studentId: user.studentId || user.registrationNumber || '',
                phone: user.phone || user.phoneNumber || ''
            });
        }
    }, [isOpen, user]);

    // Reset when modal opens/closes
    const handleClose = () => {
        setStep(1);
        onClose();
    };

    const handleNext = () => {
        if (!studentDetails.name || !studentDetails.email || !studentDetails.studentId || !studentDetails.phone) {
            alert('Please fill all details');
            return;
        }
        setStep(2);
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();

        setSubmitting(true);
        try {
            await api.post(`/events/${event._id}/register`, {
                studentDetails: studentDetails
            });
            alert('✅ Successfully registered for the event!');
            onSuccess();
            handleClose();
        } catch (error) {
            console.error(error);
            alert('❌ Failed to register: ' + (error.response?.data?.msg || error.message));
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen || !event) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col"
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-6 flex justify-between items-center text-white">
                        <div>
                            <span className="px-2 py-0.5 bg-white/20 rounded text-[10px] font-bold uppercase tracking-widest block w-fit mb-1">Free Event</span>
                            <h2 className="text-2xl font-black tracking-tight">Event Registration</h2>
                        </div>
                        <button
                            onClick={handleClose}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors"
                        >
                            <FiX className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="p-8 overflow-y-auto flex-1">
                        {/* Event Summary */}
                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 mb-6">
                            <h3 className="font-bold text-slate-900">{event.title}</h3>
                            <p className="text-slate-500 text-sm">Verify your details below to secure your spot.</p>
                        </div>

                        {step === 1 ? (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-4"
                            >
                                <div className="space-y-1">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                                    <div className="relative">
                                        <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="text"
                                            value={studentDetails.name}
                                            onChange={(e) => setStudentDetails({ ...studentDetails, name: e.target.value })}
                                            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-emerald-500 focus:bg-white outline-none transition-all font-bold text-slate-800"
                                            placeholder="Your Full Name"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                                    <div className="relative">
                                        <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="email"
                                            value={studentDetails.email}
                                            onChange={(e) => setStudentDetails({ ...studentDetails, email: e.target.value })}
                                            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-emerald-500 focus:bg-white outline-none transition-all font-bold text-slate-800"
                                            placeholder="your@email.com"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Student ID</label>
                                        <div className="relative">
                                            <FiHash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input
                                                type="text"
                                                value={studentDetails.studentId}
                                                onChange={(e) => setStudentDetails({ ...studentDetails, studentId: e.target.value })}
                                                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-emerald-500 focus:bg-white outline-none transition-all font-bold text-slate-800"
                                                placeholder="ID No."
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Phone</label>
                                        <div className="relative">
                                            <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input
                                                type="tel"
                                                value={studentDetails.phone}
                                                onChange={(e) => setStudentDetails({ ...studentDetails, phone: e.target.value })}
                                                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-emerald-500 focus:bg-white outline-none transition-all font-bold text-slate-800"
                                                placeholder="Phone No."
                                            />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-4 space-y-6"
                            >
                                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                                    <FiCheckCircle className="w-10 h-10" />
                                </div>
                                <div>
                                    <h4 className="text-xl font-black text-slate-900">Ready to Register?</h4>
                                    <p className="text-slate-500 font-medium px-4 mt-2">By clicking confirm, you agree to attend the event on {new Date(event.date).toLocaleDateString()}.</p>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-8 bg-slate-50 border-t border-slate-100 flex gap-4">
                        <button
                            onClick={handleClose}
                            className="flex-1 px-6 py-4 rounded-2xl font-black text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            Cancel
                        </button>
                        {step === 1 ? (
                            <button
                                onClick={handleNext}
                                className="flex-1 px-6 py-4 bg-emerald-600 text-white rounded-2xl font-black shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                            >
                                Continue <FiChevronRight />
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="flex-1 px-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl font-black shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/40 transition-all flex items-center justify-center gap-2"
                            >
                                {submitting ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    'Confirm Registration'
                                )}
                            </button>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default RegistrationModal;
