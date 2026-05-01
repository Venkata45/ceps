import { useState } from 'react';
import api from '../utils/api';
import { FiX, FiMapPin, FiUsers, FiDollarSign, FiCreditCard } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const CreateEventModal = ({ isOpen, onClose }) => {
    const { user } = useAuth();

    // Only allow admin to create events
    if (user && user.role !== 'admin') {
        return null;
    }
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
        venue: '',
        type: 'Other',
        capacity: ''
    });

    const [trainer, setTrainer] = useState({
        name: '',
        organization: '',
        domain: '',
        contact: ''
    });

    const [paymentConfig, setPaymentConfig] = useState({
        paymentRequired: false,
        registrationFee: '',
        upiId: '',
        paymentMethod: 'UPI'
    });

    // Predefined venues with capacity suggestions
    const venues = [
        { name: 'Main Auditorium', capacity: 500 },
        { name: 'Conference Hall A', capacity: 100 },
        { name: 'Conference Hall B', capacity: 100 },
        { name: 'Seminar Room 1', capacity: 50 },
        { name: 'Seminar Room 2', capacity: 50 },
        { name: 'Computer Lab 1', capacity: 40 },
        { name: 'Computer Lab 2', capacity: 40 },
        { name: 'Sports Ground', capacity: 1000 },
        { name: 'Open Air Theatre', capacity: 300 },
        { name: 'Library Hall', capacity: 150 }
    ];

    const handleVenueChange = (venueName) => {
        const selectedVenue = venues.find(v => v.name === venueName);
        setFormData({
            ...formData,
            venue: venueName,
            capacity: selectedVenue?.capacity.toString() || ''
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Structured data for backend
            const data = {
                ...formData,
                trainer,
                paymentRequired: paymentConfig.paymentRequired === true,
                registrationFee: paymentConfig.paymentRequired ? (parseFloat(paymentConfig.registrationFee) || 0) : 0,
                upiId: paymentConfig.upiId,
                paymentMethod: paymentConfig.paymentRequired ? 'UPI' : 'Free'
            };

            console.log('🚀 Sending robust event data:', data);

            await api.post('/events', data);
            alert('🎉 Event created successfully!');
            onClose();
            // Reset form
            setFormData({ title: '', description: '', date: '', venue: '', type: 'Other', capacity: '' });
            setTrainer({ name: '', organization: '', domain: '', contact: '' });
            setPaymentConfig({ paymentRequired: false, registrationFee: '', upiId: '', paymentMethod: 'UPI' });
        } catch (error) {
            console.error(error);
            alert("❌ Failed to create event: " + (error.response?.data?.msg || error.message));
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
                >
                    <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-900">Create New Event</h2>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <FiX className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {/* Event Details */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Event Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                    <input type="text" required className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                    <select className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                                        value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                                        <option value="FDP">FDP</option>
                                        <option value="SDP">SDP</option>
                                        <option value="CRT">CRT</option>
                                        <option value="Seminar">Seminar</option>
                                        <option value="Sports">Sports</option>
                                        <option value="Cultural">Cultural</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none" rows="3"
                                        value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}></textarea>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
                                    <input type="datetime-local" required className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        <FiMapPin className="inline w-4 h-4 mr-1" />
                                        Venue
                                    </label>
                                    <select
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                                        value={formData.venue}
                                        onChange={e => handleVenueChange(e.target.value)}
                                        required
                                    >
                                        <option value="">Select a venue</option>
                                        {venues.map(venue => (
                                            <option key={venue.name} value={venue.name}>
                                                {venue.name} (Capacity: {venue.capacity})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        <FiUsers className="inline w-4 h-4 mr-1" />
                                        Capacity
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        max="1000"
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={formData.capacity}
                                        onChange={e => setFormData({ ...formData, capacity: e.target.value })}
                                        placeholder="Max participants"
                                    />
                                    {formData.venue && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            Suggested capacity for selected venue
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-gray-100 my-4" />

                        {/* Payment Configuration - MOVED HERE FOR VISIBILITY */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                                <FiDollarSign className="w-4 h-4" />
                                Payment Configuration
                            </h3>

                            {/* Payment Required Toggle */}
                            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border-2 border-dashed border-indigo-300">
                                <input
                                    type="checkbox"
                                    id="paymentRequired"
                                    checked={paymentConfig.paymentRequired}
                                    onChange={(e) => setPaymentConfig({ ...paymentConfig, paymentRequired: e.target.checked })}
                                    className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
                                />
                                <label htmlFor="paymentRequired" className="text-sm font-bold text-gray-900 cursor-pointer">
                                    ✅ Require payment for registration
                                </label>
                            </div>

                            {/* Payment Fields */}
                            {paymentConfig.paymentRequired && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                                >
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            <FiCreditCard className="inline w-4 h-4 mr-1" />
                                            Registration Fee (₹)
                                        </label>
                                        <input
                                            type="number"
                                            required={paymentConfig.paymentRequired}
                                            min="1"
                                            step="0.01"
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                                            value={paymentConfig.registrationFee}
                                            onChange={e => setPaymentConfig({ ...paymentConfig, registrationFee: e.target.value })}
                                            placeholder="Enter amount in rupees"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            UPI ID (PhonePe)
                                        </label>
                                        <input
                                            type="text"
                                            required={paymentConfig.paymentRequired}
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                                            value={paymentConfig.upiId}
                                            onChange={e => setPaymentConfig({ ...paymentConfig, upiId: e.target.value })}
                                            placeholder="your-upi@paytm"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            Students will use this UPI ID for payment
                                        </p>
                                    </div>
                                    <div className="col-span-2">
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                            <p className="text-sm text-blue-800">
                                                <strong>📱 Payment Process:</strong> Students will pay via UPI and upload payment proof. You'll need to verify payments manually.
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        <div className="border-t border-gray-100 my-4" />

                        {/* Trainer Details */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Trainer / Resource Person</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                    <input type="text" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={trainer.name} onChange={e => setTrainer({ ...trainer, name: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Organization</label>
                                    <input type="text" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={trainer.organization} onChange={e => setTrainer({ ...trainer, organization: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Domain</label>
                                    <input type="text" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={trainer.domain} onChange={e => setTrainer({ ...trainer, domain: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact</label>
                                    <input type="text" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={trainer.contact} onChange={e => setTrainer({ ...trainer, contact: e.target.value })} />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-colors">
                                Cancel
                            </button>
                            <button type="submit" className="px-5 py-2.5 rounded-lg font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/30">
                                Create Event
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default CreateEventModal;
