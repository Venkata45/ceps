import { useState } from 'react';
import api from '../utils/api';
import { FiX, FiStar } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const FeedbackModal = ({ isOpen, onClose, eventId, eventTitle }) => {
    const [rating, setRating] = useState(0);
    const [comments, setComments] = useState('');
    const [hoveredRating, setHoveredRating] = useState(0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) {
            alert("Please select a rating");
            return;
        }

        try {
            await api.post('/feedback', {
                eventId,
                rating,
                comments
            });
            alert("Feedback submitted successfully!");
            onClose();
            setRating(0);
            setComments('');
        } catch (error) {
            alert(error.response?.data?.msg || "Failed to submit feedback");
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
                    className="bg-white rounded-2xl w-full max-w-lg shadow-2xl p-6"
                >
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Event Feedback</h2>
                            <p className="text-sm text-gray-500">{eventTitle}</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <FiX className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="flex flex-col items-center gap-2">
                            <label className="text-sm font-medium text-gray-700">How would you rate this event?</label>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onMouseEnter={() => setHoveredRating(star)}
                                        onMouseLeave={() => setHoveredRating(0)}
                                        onClick={() => setRating(star)}
                                        className="focus:outline-none transition-transform hover:scale-110"
                                    >
                                        <FiStar
                                            className={`w-8 h-8 ${star <= (hoveredRating || rating)
                                                ? 'text-yellow-400 fill-yellow-400'
                                                : 'text-gray-300'
                                                }`}
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Additional Comments</label>
                            <textarea
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                                rows="4"
                                placeholder="Share your experience..."
                                value={comments}
                                onChange={(e) => setComments(e.target.value)}
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/30"
                        >
                            Submit Feedback
                        </button>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default FeedbackModal;
