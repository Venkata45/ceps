import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCreditCard, FiCheckCircle, FiUpload, FiUser, FiMail, FiPhone, FiHash, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const PaymentModal = ({ isOpen, onClose, event, onSuccess }) => {
    const { user } = useAuth();
    const [step, setStep] = useState(1); // 1: Details, 2: Payment Options, 3: Transaction ID
    const [studentDetails, setStudentDetails] = useState({
        name: user?.name || '',
        email: user?.email || '',
        studentId: user?.studentId || '',
        phone: user?.phone || ''
    });
    const [transactionId, setTransactionId] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Update details when user changes or modal opens
    useEffect(() => {
        if (isOpen && user) {
            setStudentDetails({
                name: user.name || '',
                email: user.email || '',
                studentId: user.studentId || '',
                phone: user.phone || ''
            });
        }
    }, [isOpen, user]);

    // Reset when modal opens/closes
    const handleClose = () => {
        setStep(1);
        setTransactionId('');
        onClose();
    };

    const [selectedProvider, setSelectedProvider] = useState(null);

    // Generate UPI Payment URL
    const generateUPIUrl = (provider = 'generic') => {
        const { upiId, registrationFee, title } = event;
        // Use the requested UPI ID as fallback
        const targetUpiId = upiId || '9491741210@ybl';
        const base = `pa=${targetUpiId}&pn=CEPS Event&am=${registrationFee}&tn=${encodeURIComponent(title)}&cu=INR`;

        if (provider === 'phonepe') {
            return `phonepe://pay?${base}`;
        }
        if (provider === 'googlepay') {
            return `tez://upi/pay?${base}`;
        }
        if (provider === 'paytm') {
            return `paytmmp://pay?${base}`;
        }
        return `upi://pay?${base}`;
    };

    const handleNextStep = () => {
        if (step === 1) {
            if (!studentDetails.name || !studentDetails.email || !studentDetails.studentId || !studentDetails.phone) {
                alert('Please fill all student details');
                return;
            }
        }
        setStep(step + 1);
    };

    const handlePrevStep = () => {
        setStep(step - 1);
    };

    const handlePaymentRedirect = (provider) => {
        setSelectedProvider(provider);
        const url = generateUPIUrl(provider);

        // Store selected provider name for display
        const providerName = provider === 'generic' ? 'UPI App' : provider.charAt(0).toUpperCase() + provider.slice(1);
        setSelectedProvider(providerName);

        // Attempt mobile redirect
        window.location.href = url;

        // Move to Step 3 to show QR and Transaction ID input
        setStep(3);
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();

        // Validate transaction ID
        if (!transactionId.trim()) {
            alert('Please enter transaction ID');
            return;
        }

        setSubmitting(true);
        try {
            await api.post(`/events/${event._id}/payment`, {
                transactionId: transactionId.trim(),
                amount: event.registrationFee,
                studentDetails: studentDetails
            });
            alert('✅ Payment submitted! You will be registered once payment is verified.');
            onSuccess();
            handleClose();
        } catch (error) {
            console.error(error);
            alert('❌ Failed to submit payment: ' + (error.response?.data?.msg || error.message));
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
                    className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6 flex justify-between items-center text-white relative">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="px-2 py-0.5 bg-white/20 rounded text-[10px] font-bold uppercase tracking-widest">Step {step} of 3</span>
                            </div>
                            <h2 className="text-2xl font-black tracking-tight">
                                {step === 1 && "Confirm Details"}
                                {step === 2 && "Choose Payment Method"}
                                {step === 3 && "Finalize Payment"}
                            </h2>
                        </div>
                        <button
                            onClick={handleClose}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors"
                        >
                            <FiX className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-1.5 w-full bg-slate-100 flex">
                        <motion.div
                            className="h-full bg-emerald-500"
                            initial={{ width: "33.33%" }}
                            animate={{ width: `${(step / 3) * 100}%` }}
                        />
                    </div>

                    <div className="p-8 overflow-y-auto flex-1">
                        {/* Event Summary Card */}
                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 mb-8 flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-slate-900">{event.title}</h3>
                                <p className="text-slate-500 text-sm">Event Registration</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Fee</p>
                                <p className="text-3xl font-black text-indigo-600">₹{event.registrationFee}</p>
                            </div>
                        </div>

                        {/* STEP 1: Details */}
                        {step === 1 && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-4"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                                        <div className="relative">
                                            <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input
                                                type="text"
                                                value={studentDetails.name}
                                                onChange={(e) => setStudentDetails({ ...studentDetails, name: e.target.value })}
                                                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-slate-800"
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
                                                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-slate-800"
                                                placeholder="your@email.com"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Student ID</label>
                                        <div className="relative">
                                            <FiHash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input
                                                type="text"
                                                value={studentDetails.studentId}
                                                onChange={(e) => setStudentDetails({ ...studentDetails, studentId: e.target.value })}
                                                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-slate-800"
                                                placeholder="ID Number"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                                        <div className="relative">
                                            <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input
                                                type="tel"
                                                value={studentDetails.phone}
                                                onChange={(e) => setStudentDetails({ ...studentDetails, phone: e.target.value })}
                                                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-slate-800"
                                                placeholder="10-digit number"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 mt-4">
                                    <p className="text-indigo-700 text-sm font-medium">Please review your details before proceeding to payment. This information will be used for your event certificate.</p>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 2: Payment Options */}
                        {step === 2 && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-6"
                            >
                                <p className="text-slate-500 font-medium text-center mb-4">Select your preferred payment app to continue</p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <motion.button
                                        whileHover={{ scale: 1.02, y: -4 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handlePaymentRedirect('phonepe')}
                                        className="flex items-center gap-4 p-5 bg-white border-2 border-slate-100 rounded-2xl hover:border-purple-500 hover:shadow-xl hover:shadow-purple-500/10 transition-all group lg:col-span-1"
                                    >
                                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                            <img src="https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/phonepe-logo-icon.png" alt="PhonePe" className="w-8 h-8 object-contain" />
                                        </div>
                                        <div className="text-left">
                                            <h4 className="font-black text-slate-900 leading-none">PhonePe</h4>
                                            <p className="text-xs text-slate-400 mt-1 font-bold uppercase tracking-widest">Pay via App</p>
                                        </div>
                                    </motion.button>

                                    <motion.button
                                        whileHover={{ scale: 1.02, y: -4 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handlePaymentRedirect('googlepay')}
                                        className="flex items-center gap-4 p-5 bg-white border-2 border-slate-100 rounded-2xl hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/10 transition-all lg:col-span-1"
                                    >
                                        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                                            <img src="https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/google-pay-icon.png" alt="GPay" className="w-8 h-8 object-contain" />
                                        </div>
                                        <div className="text-left">
                                            <h4 className="font-black text-slate-900 leading-none">Google Pay</h4>
                                            <p className="text-xs text-slate-400 mt-1 font-bold uppercase tracking-widest">Pay via App</p>
                                        </div>
                                    </motion.button>

                                    <motion.button
                                        whileHover={{ scale: 1.02, y: -4 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handlePaymentRedirect('paytm')}
                                        className="flex items-center gap-4 p-5 bg-white border-2 border-slate-100 rounded-2xl hover:border-cyan-500 hover:shadow-xl hover:shadow-cyan-500/10 transition-all lg:col-span-1"
                                    >
                                        <div className="w-12 h-12 bg-cyan-50 rounded-xl flex items-center justify-center">
                                            <img src="https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/paytm-icon.png" alt="Paytm" className="w-8 h-8 object-contain" />
                                        </div>
                                        <div className="text-left">
                                            <h4 className="font-black text-slate-900 leading-none">Paytm</h4>
                                            <p className="text-xs text-slate-400 mt-1 font-bold uppercase tracking-widest">Pay via App</p>
                                        </div>
                                    </motion.button>

                                    <motion.button
                                        whileHover={{ scale: 1.02, y: -4 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handlePaymentRedirect('generic')}
                                        className="flex items-center gap-4 p-5 bg-indigo-600 rounded-2xl hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all lg:col-span-1"
                                    >
                                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-white">
                                            <FiCreditCard className="w-6 h-6" />
                                        </div>
                                        <div className="text-left">
                                            <h4 className="font-black text-white leading-none">Other UPI</h4>
                                            <p className="text-xs text-white/60 mt-1 font-bold uppercase tracking-widest">Select App</p>
                                        </div>
                                    </motion.button>
                                </div>

                                <div className="text-center pt-4">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Or scan QR Code directly</p>
                                    <div className="inline-block p-4 bg-white border-4 border-slate-100 rounded-3xl shadow-sm">
                                        <img
                                            src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(generateUPIUrl('generic'))}&margin=10`}
                                            alt="UPI QR"
                                            className="w-40 h-40"
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 3: QR Code & Transaction ID */}
                        {step === 3 && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-6"
                            >
                                <div className="flex flex-col md:flex-row gap-6 items-center bg-slate-50 border border-slate-100 rounded-2xl p-6">
                                    <div className="flex-shrink-0 p-4 bg-white border-4 border-white rounded-3xl shadow-lg">
                                        <img
                                            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(generateUPIUrl('generic'))}&margin=10`}
                                            alt="UPI QR"
                                            className="w-32 h-32"
                                        />
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center mt-2">Scan to Pay</p>
                                    </div>
                                    <div className="flex-1 text-center md:text-left">
                                        <h4 className="text-xl font-black text-slate-900 mb-2">Complete Payment</h4>
                                        <p className="text-slate-500 text-sm font-medium leading-relaxed">
                                            If the {selectedProvider || 'UPI app'} didn't open automatically, please scan the QR code above to pay <b>₹{event.registrationFee}</b>.
                                        </p>
                                        <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-[10px] font-black uppercase tracking-wider">
                                            <FiHash className="w-3 h-3" />
                                            UPI ID: {event.upiId || '9491741210@ybl'}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">UPI Transaction ID / UTR Number</label>
                                    <div className="relative">
                                        <FiHash className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                        <input
                                            type="text"
                                            value={transactionId}
                                            onChange={(e) => setTransactionId(e.target.value)}
                                            className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none transition-all font-mono text-lg font-bold tracking-widest text-slate-800 placeholder:text-slate-300"
                                            placeholder="Enter 12-digit UTR"
                                            required
                                        />
                                    </div>
                                    <p className="text-xs text-slate-400 italic ml-1 flex items-center gap-1">
                                        <FiCheckCircle className="w-3 h-3 text-emerald-500" /> Usually 12 digits, found in payment receipt
                                    </p>
                                </div>

                                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                                    <p className="text-emerald-800 text-xs font-medium leading-relaxed">
                                        <b>Tip:</b> After successful payment, copy the UTR/Transaction ID from your bank statement or app and paste it here.
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="p-8 bg-slate-50 border-t border-slate-100 flex gap-4">
                        {step > 1 && (
                            <button
                                onClick={handlePrevStep}
                                className="px-6 py-4 rounded-2xl font-black text-slate-500 hover:bg-slate-200 transition-colors flex items-center gap-2"
                            >
                                <FiChevronLeft /> Back
                            </button>
                        )}

                        <div className="flex-1 flex gap-3">
                            <button
                                onClick={handleClose}
                                className="flex-1 px-6 py-4 rounded-2xl font-black text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                Cancel
                            </button>

                            {step < 3 ? (
                                <button
                                    onClick={handleNextStep}
                                    className="flex-1 px-6 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                                >
                                    Proceed <FiChevronRight />
                                </button>
                            ) : (
                                <button
                                    onClick={handleSubmit}
                                    disabled={submitting}
                                    className="flex-1 px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/40 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {submitting ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Verifying...
                                        </>
                                    ) : (
                                        <>
                                            <FiUpload className="w-5 h-5" />
                                            Complete Registration
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default PaymentModal;

