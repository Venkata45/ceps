import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiUser, FiMail, FiPhone, FiHash, FiBookOpen, FiLock } from 'react-icons/fi';
import api from '../utils/api';

const AddFacultyModal = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        department: '',
        registrationNumber: '',
        phoneNumber: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess(null);
        setLoading(true);

        try {
            const dataToSubmit = {
                ...formData,
                email: formData.email.trim()
            };
            const res = await api.post('/admin/faculty', dataToSubmit);
            setSuccess(res.data);

            // Reset form
            setFormData({
                name: '',
                email: '',
                department: '',
                registrationNumber: '',
                phoneNumber: '',
                password: ''
            });

            // Show success for 3 seconds then close
            setTimeout(() => {
                onSuccess?.();
                onClose();
                setSuccess(null);
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to add faculty');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
                    >
                        <div className="p-6 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900">Add Faculty Member</h2>
                                <p className="text-sm text-slate-500 mt-1">Create account & send credentials</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center"
                            >
                                <FiX className="w-5 h-5 text-slate-600" />
                            </button>
                        </div>

                        {success ? (
                            <div className="p-6">
                                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center">
                                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <FiUser className="w-8 h-8 text-emerald-600" />
                                    </div>
                                    <h3 className="text-xl font-bold text-emerald-900 mb-2">Faculty Added Successfully!</h3>
                                    <p className="text-sm text-emerald-700 mb-4">
                                        Account created for: <strong>{success.faculty.email}</strong>
                                    </p>
                                    <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-5 text-center shadow-inner">
                                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
                                            <FiMail className="w-6 h-6 text-indigo-600" />
                                        </div>
                                        <h4 className="text-indigo-900 font-bold mb-1">Email Sent!</h4>
                                        <p className="text-xs text-indigo-700 leading-relaxed">
                                            The login credentials have been securely emailed to <br />
                                            <span className="font-black underline">{success.faculty.email}</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                {error && (
                                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-800">
                                        {error}
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        <FiUser className="inline w-4 h-4 mr-1" />
                                        Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 outline-none transition-all"
                                        placeholder="Dr. John Smith"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        <FiMail className="inline w-4 h-4 mr-1" />
                                        Email *
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 outline-none transition-all"
                                        placeholder="john.smith@college.edu"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        <FiBookOpen className="inline w-4 h-4 mr-1" />
                                        Department *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.department}
                                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 outline-none transition-all"
                                        placeholder="Computer Science"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        <FiHash className="inline w-4 h-4 mr-1" />
                                        Registration Number *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.registrationNumber}
                                        onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 outline-none transition-all"
                                        placeholder="FAC2024001"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        <FiPhone className="inline w-4 h-4 mr-1" />
                                        Phone Number *
                                    </label>
                                    <input
                                        type="tel"
                                        required
                                        value={formData.phoneNumber}
                                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 outline-none transition-all"
                                        placeholder="9876543210"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        <FiLock className="inline w-4 h-4 mr-1" />
                                        Password *
                                    </label>
                                    <input
                                        type="password"
                                        required
                                        minLength={6}
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 outline-none transition-all"
                                        placeholder="Enter password (min 6 characters)"
                                    />
                                    <p className="text-xs text-indigo-600 mt-1 font-medium italic">
                                        ✨ The system will automatically handle the email delivery.
                                    </p>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="flex-1 px-4 py-3 rounded-xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 px-4 py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 transition-all"
                                    >
                                        {loading ? 'Creating...' : 'Create Account'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default AddFacultyModal;
