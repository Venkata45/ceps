import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiX, FiCalendar, FiMapPin, FiUser, FiBook, FiClock } from 'react-icons/fi';
import api from '../utils/api';

const EditEventModal = ({ isOpen, onClose, event, onEventUpdated }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
        venue: '',
        type: 'Other',
        capacity: '',
        trainer: {
            name: '',
            organization: '',
            domain: '',
            contact: ''
        },
        paymentRequired: false,
        registrationFee: '',
        upiId: '',
        paymentMethod: 'UPI'
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (event && isOpen) {
            setFormData({
                title: event.title || '',
                description: event.description || '',
                date: event.date ? new Date(event.date).toISOString().slice(0, 16) : '',
                venue: event.venue || '',
                type: event.type || 'Other',
                capacity: event.capacity || '',
                trainer: {
                    name: event.trainer?.name || '',
                    organization: event.trainer?.organization || '',
                    domain: event.trainer?.domain || '',
                    contact: event.trainer?.contact || ''
                },
                paymentRequired: event.paymentRequired || false,
                registrationFee: event.registrationFee || '',
                upiId: event.upiId || '',
                paymentMethod: event.paymentMethod || 'UPI'
            });
        }
    }, [event, isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const updatedData = {
                ...formData,
                date: new Date(formData.date),
                registrationFee: formData.paymentRequired ? parseFloat(formData.registrationFee) || 0 : 0
            };

            const res = await api.put(`/events/${event._id}`, updatedData);

            alert('✅ Event updated successfully!');
            onEventUpdated(res.data);
            onClose();
        } catch (error) {
            alert('❌ Failed to update event: ' + (error.response?.data?.msg || error.message));
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field, value) => {
        if (field.includes('.')) {
            const [parent, child] = field.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [field]: value
            }));
        }
    };

    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ type: "spring", damping: 20 }}
                className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-2xl font-bold flex items-center gap-2">
                                <FiCalendar className="w-6 h-6" />
                                Edit Event
                            </h3>
                            <p className="text-indigo-100 mt-1">Update event details and scheduling</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white/80 hover:text-white transition-colors"
                        >
                            <FiX className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Basic Event Details */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                            <FiCalendar className="w-5 h-5" />
                            Event Details
                        </h4>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Event Title</label>
                            <input
                                type="text"
                                required
                                value={formData.title}
                                onChange={(e) => handleInputChange('title', e.target.value)}
                                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                placeholder="Enter event title"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
                                rows={3}
                                placeholder="Enter event description"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Date & Time</label>
                                <input
                                    type="datetime-local"
                                    required
                                    value={formData.date}
                                    onChange={(e) => handleInputChange('date', e.target.value)}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Type</label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => handleInputChange('type', e.target.value)}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                >
                                    <option value="FDP">Faculty Development Program</option>
                                    <option value="SDP">Skill Development Program</option>
                                    <option value="CRT">Campus Recruitment Training</option>
                                    <option value="Seminar">Seminar</option>
                                    <option value="Sports">Sports</option>
                                    <option value="Cultural">Cultural</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    <FiMapPin className="inline w-4 h-4 mr-1" />
                                    Venue
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.venue}
                                    onChange={(e) => handleInputChange('venue', e.target.value)}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                    placeholder="Event venue"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Capacity</label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    value={formData.capacity}
                                    onChange={(e) => handleInputChange('capacity', e.target.value)}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                    placeholder="Max participants"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Payment Configuration */}
                    <div className="space-y-4 pt-4 border-t border-slate-100">
                        <h4 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                            <FiBook className="w-5 h-5 text-indigo-600" />
                            Payment Configuration
                        </h4>

                        <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                            <input
                                type="checkbox"
                                id="editPaymentRequired"
                                checked={formData.paymentRequired}
                                onChange={(e) => handleInputChange('paymentRequired', e.target.checked)}
                                className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
                            />
                            <label htmlFor="editPaymentRequired" className="text-sm font-bold text-slate-900 cursor-pointer">
                                ✅ Require payment for registration
                            </label>
                        </div>

                        {formData.paymentRequired && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="grid grid-cols-1 md:grid-cols-2 gap-4"
                            >
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Registration Fee (₹)</label>
                                    <input
                                        type="number"
                                        required={formData.paymentRequired}
                                        value={formData.registrationFee}
                                        onChange={(e) => handleInputChange('registrationFee', e.target.value)}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                        placeholder="Amount in ₹"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">UPI ID</label>
                                    <input
                                        type="text"
                                        required={formData.paymentRequired}
                                        value={formData.upiId}
                                        onChange={(e) => handleInputChange('upiId', e.target.value)}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                        placeholder="your-upi@paytm"
                                    />
                                </div>
                            </motion.div>
                        )}
                    </div>

                    <div className="border-t border-slate-100 mt-6" />

                    {/* Trainer Details */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                            <FiUser className="w-5 h-5" />
                            Trainer Details
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Trainer Name</label>
                                <input
                                    type="text"
                                    value={formData.trainer.name}
                                    onChange={(e) => handleInputChange('trainer.name', e.target.value)}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                    placeholder="Trainer name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Organization</label>
                                <input
                                    type="text"
                                    value={formData.trainer.organization}
                                    onChange={(e) => handleInputChange('trainer.organization', e.target.value)}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                    placeholder="Organization name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Domain</label>
                                <input
                                    type="text"
                                    value={formData.trainer.domain}
                                    onChange={(e) => handleInputChange('trainer.domain', e.target.value)}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                    placeholder="Expertise domain"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Contact</label>
                                <input
                                    type="text"
                                    value={formData.trainer.contact}
                                    onChange={(e) => handleInputChange('trainer.contact', e.target.value)}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                    placeholder="Contact information"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex gap-3 pt-6 border-t border-slate-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Updating...
                                </>
                            ) : (
                                <>
                                    <FiCalendar className="w-4 h-4" />
                                    Update Event
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};

export default EditEventModal;
