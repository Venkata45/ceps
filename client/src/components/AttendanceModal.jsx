import { useState, useEffect } from 'react';
import { FiX, FiCheck, FiUsers, FiSearch } from 'react-icons/fi';
import { motion } from 'framer-motion';
import api from '../utils/api';

const AttendanceModal = ({ isOpen, onClose, eventId, eventTitle }) => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [markingAttendance, setMarkingAttendance] = useState(false);

    const fetchRegisteredStudents = async () => {
        try {
            setLoading(true);
            // Get event details with registered users
            const eventRes = await api.get(`/events/${eventId}`);
            const event = eventRes.data;
            
            // Create mock student data for demonstration
            const mockStudents = event.registeredUsers.map((studentId, index) => ({
                _id: studentId,
                name: `Student ${index + 1}`,
                registrationNumber: `21BCE${1000 + index}`,
                department: 'CSE',
                year: '3',
                email: `student${index + 1}@college.edu`
            }));
            
            setStudents(mockStudents);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch registered students:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen && eventId) {
            fetchRegisteredStudents();
        }
    }, [isOpen, eventId]);

    const handleStudentToggle = (studentId) => {
        setSelectedStudents(prev => 
            prev.includes(studentId) 
                ? prev.filter(id => id !== studentId)
                : [...prev, studentId]
        );
    };

    const handleMarkAttendance = async () => {
        if (selectedStudents.length === 0) {
            alert('Please select at least one student to mark attendance');
            return;
        }

        try {
            setMarkingAttendance(true);
            const res = await api.post(`/events/${eventId}/attendance`, {
                eventId,
                studentIds: selectedStudents
            });
            
            alert(`✅ Attendance marked for ${selectedStudents.length} students!`);
            onClose();
        } catch (error) {
            alert('❌ Failed to mark attendance: ' + (error.response?.data?.msg || error.message));
        } finally {
            setMarkingAttendance(false);
        }
    };

    const filteredStudents = students.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.registrationNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-2xl font-bold flex items-center gap-2">
                                <FiUsers className="w-6 h-6" />
                                Mark Attendance
                            </h3>
                            <p className="text-emerald-100 mt-1">{eventTitle}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white/80 hover:text-white transition-colors"
                        >
                            <FiX className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="p-6 border-b border-slate-200">
                    <div className="relative">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by name or registration number..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                        />
                    </div>
                </div>

                {/* Students List */}
                <div className="p-6 overflow-y-auto max-h-96">
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-200 border-t-emerald-600"></div>
                            <p className="text-slate-500 mt-2">Loading registered students...</p>
                        </div>
                    ) : filteredStudents.length === 0 ? (
                        <div className="text-center py-12">
                            <FiUsers className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-500">
                                {searchTerm ? 'No students found matching your search' : 'No students registered for this event'}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {filteredStudents.map((student) => (
                                <motion.div
                                    key={student._id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="checkbox"
                                            checked={selectedStudents.includes(student._id)}
                                            onChange={() => handleStudentToggle(student._id)}
                                            className="w-5 h-5 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
                                        />
                                        <div>
                                            <p className="font-semibold text-slate-900">{student.name}</p>
                                            <p className="text-sm text-slate-500">
                                                {student.registrationNumber} • {student.department} • Year {student.year}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-sm text-slate-500">
                                        {student.email}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-200 bg-slate-50">
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-slate-600">
                            {selectedStudents.length > 0 && (
                                <span className="font-medium text-emerald-600">
                                    {selectedStudents.length} student{selectedStudents.length > 1 ? 's' : ''} selected
                                </span>
                            )}
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleMarkAttendance}
                                disabled={markingAttendance || selectedStudents.length === 0}
                                className="px-6 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {markingAttendance ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Marking...
                                    </>
                                ) : (
                                    <>
                                        <FiCheck className="w-4 h-4" />
                                        Mark Attendance
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default AttendanceModal;
