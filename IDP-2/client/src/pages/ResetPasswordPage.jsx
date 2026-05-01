import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { FiLock, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';

const ResetPasswordPage = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const role = searchParams.get('role') || 'student';

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const navigate = useNavigate();

    const roleConfig = {
        student: {
            gradient: 'from-purple-600 to-pink-600',
            buttonGradient: 'bg-gradient-to-r from-purple-600 to-pink-600',
            accentColor: 'text-purple-600'
        },
        faculty: {
            gradient: 'from-emerald-600 to-teal-600',
            buttonGradient: 'bg-gradient-to-r from-emerald-600 to-teal-600',
            accentColor: 'text-emerald-600'
        }
    };

    const currentConfig = roleConfig[role] || roleConfig.student;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            alert("Passwords don't match!");
            return;
        }
        if (password.length < 6) {
            alert("Password must be at least 6 characters long");
            return;
        }

        setIsLoading(true);
        try {
            await api.post('/auth/reset-password', {
                token,
                role,
                password
            });
            setIsSuccess(true);
            setTimeout(() => navigate('/login'), 3000);
        } catch (error) {
            console.error('Reset password failed:', error);
            alert(error.response?.data?.msg || 'Failed to reset password. The link may have expired.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={`min-h-screen bg-gradient-to-br ${currentConfig.gradient} flex items-center justify-center relative overflow-hidden`}>
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
                    className="absolute -top-1/4 -right-1/4 w-1/2 h-1/2 bg-white/10 rounded-full blur-3xl"
                />
                <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
                    className="absolute -bottom-1/4 -left-1/4 w-1/2 h-1/2 bg-white/10 rounded-full blur-3xl"
                />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="w-full max-w-md p-6 relative z-10"
            >
                <div className="bg-white/90 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-white/40 p-10 overflow-hidden relative">
                    <AnimatePresence mode="wait">
                        {!isSuccess ? (
                            <motion.div
                                key="reset-form"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <div className="text-center mb-8">
                                    <div className={`w-20 h-20 rounded-2xl ${currentConfig.buttonGradient} p-0.5 shadow-lg mx-auto mb-6 transform rotate-3`}>
                                        <div className="w-full h-full bg-white rounded-xl flex items-center justify-center">
                                            <FiLock className={`w-10 h-10 ${currentConfig.accentColor}`} />
                                        </div>
                                    </div>
                                    <h2 className="text-3xl font-black text-slate-800 mb-2">Create New Password</h2>
                                    <p className="text-slate-500 font-medium">Please enter your new security credentials below.</p>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 ml-1">New Password</label>
                                        <div className="relative group">
                                            <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors z-10" />
                                            <input
                                                type="password"
                                                required
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-medium"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 ml-1">Confirm Password</label>
                                        <div className="relative group">
                                            <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors z-10" />
                                            <input
                                                type="password"
                                                required
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-medium"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                    </div>

                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        disabled={isLoading}
                                        className={`w-full py-4 rounded-2xl font-bold text-white shadow-xl ${currentConfig.buttonGradient} relative overflow-hidden flex items-center justify-center gap-3`}
                                    >
                                        {isLoading ? (
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ repeat: Infinity, duration: 1 }}
                                                className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full"
                                            />
                                        ) : (
                                            "Update Password"
                                        )}
                                    </motion.button>
                                </form>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="success-msg"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-6"
                            >
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", damping: 12 }}
                                    className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner"
                                >
                                    <FiCheckCircle className="w-12 h-12 text-emerald-600" />
                                </motion.div>
                                <h3 className="text-3xl font-black text-slate-900 mb-3">Password Updated!</h3>
                                <p className="text-slate-500 font-medium mb-8 leading-relaxed">
                                    Your security credentials have been successfully reset. Redirecting you to login...
                                </p>
                                <Link
                                    to="/login"
                                    className={`inline-flex items-center gap-2 font-bold ${currentConfig.accentColor} hover:underline`}
                                >
                                    <FiArrowLeft />
                                    Go to Login now
                                </Link>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};

export default ResetPasswordPage;
