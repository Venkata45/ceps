import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { FiMail, FiArrowLeft, FiUser, FiBook, FiLock, FiEye, FiEyeOff, FiShield } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';

const ForgotPasswordPage = () => {
    const [searchParams] = useSearchParams();
    const initialRole = searchParams.get('role') || 'student';
    const [role, setRole] = useState(initialRole);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [step, setStep] = useState(1); // 1: email, 2: otp, 3: new password, 4: success
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [countdown, setCountdown] = useState(0);
    const otpRefs = useRef([]);
    const navigate = useNavigate();

    useEffect(() => {
        if (role === 'admin') navigate('/login');
    }, [role, navigate]);

    // Countdown timer for resend OTP
    useEffect(() => {
        if (countdown <= 0) return;
        const timer = setInterval(() => setCountdown(c => c - 1), 1000);
        return () => clearInterval(timer);
    }, [countdown]);

    const roleConfig = {
        student: {
            title: 'Student Recovery',
            icon: FiUser,
            gradient: 'from-purple-600 to-pink-600',
            buttonGradient: 'bg-gradient-to-r from-purple-600 to-pink-600',
            accentColor: 'text-purple-600',
            ringColor: 'focus:ring-purple-100 focus:border-purple-500',
            otpBorder: 'border-purple-300 focus:border-purple-500 focus:ring-purple-100',
        },
        faculty: {
            title: 'Faculty Recovery',
            icon: FiBook,
            gradient: 'from-emerald-600 to-teal-600',
            buttonGradient: 'bg-gradient-to-r from-emerald-600 to-teal-600',
            accentColor: 'text-emerald-600',
            ringColor: 'focus:ring-emerald-100 focus:border-emerald-500',
            otpBorder: 'border-emerald-300 focus:border-emerald-500 focus:ring-emerald-100',
        }
    };

    const cfg = roleConfig[role] || roleConfig.student;
    const Icon = cfg.icon;

    // ─── Step 1: Send OTP ────────────────────────────────────────────────────
    const handleSendOtp = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await api.post('/auth/send-otp', { email: email.trim(), role });
            setStep(2);
            setCountdown(60);
            // Focus first OTP box
            setTimeout(() => otpRefs.current[0]?.focus(), 300);
        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to send OTP. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // ─── OTP input handling ──────────────────────────────────────────────────
    const handleOtpChange = (index, value) => {
        if (!/^\d*$/.test(value)) return; // digits only
        const next = [...otp];
        next[index] = value.slice(-1);
        setOtp(next);
        if (value && index < 5) otpRefs.current[index + 1]?.focus();
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    const handleOtpPaste = (e) => {
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (pasted.length === 6) {
            setOtp(pasted.split(''));
            otpRefs.current[5]?.focus();
        }
    };

    // ─── Step 2: Verify OTP ──────────────────────────────────────────────────
    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError('');
        const code = otp.join('');
        if (code.length < 6) { setError('Please enter the complete 6-digit OTP.'); return; }
        setIsLoading(true);
        try {
            await api.post('/auth/verify-otp', { email: email.trim(), role, otp: code });
            setStep(3);
        } catch (err) {
            setError(err.response?.data?.msg || 'Invalid OTP. Please try again.');
            setOtp(['', '', '', '', '', '']);
            setTimeout(() => otpRefs.current[0]?.focus(), 100);
        } finally {
            setIsLoading(false);
        }
    };

    // ─── Step 3: Reset Password ──────────────────────────────────────────────
    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');
        if (newPassword.length < 6) { setError('Password must be at least 6 characters.'); return; }
        if (newPassword !== confirmPassword) { setError('Passwords do not match.'); return; }
        setIsLoading(true);
        try {
            await api.post('/auth/reset-password-otp', { email: email.trim(), role, password: newPassword });
            setStep(4);
        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to reset password. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // ─── Resend OTP ──────────────────────────────────────────────────────────
    const handleResend = async () => {
        if (countdown > 0) return;
        setError('');
        setIsLoading(true);
        try {
            await api.post('/auth/send-otp', { email: email.trim(), role });
            setOtp(['', '', '', '', '', '']);
            setCountdown(60);
            setTimeout(() => otpRefs.current[0]?.focus(), 100);
        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to resend OTP.');
        } finally {
            setIsLoading(false);
        }
    };

    const stepTitles = ['', 'Forgot Password?', 'Enter OTP', 'New Password', 'All Done!'];
    const stepSubtitles = [
        '',
        `Enter your ${role} email to receive an OTP`,
        `We sent a 6-digit code to ${email}`,
        'Create your new secure password',
        'Your password has been reset'
    ];

    return (
        <div className={`min-h-screen bg-gradient-to-br ${cfg.gradient} flex items-center justify-center relative overflow-hidden perspective-1000`}>
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden">
                <motion.div
                    className="absolute inset-0 opacity-40"
                    style={{ background: 'radial-gradient(circle at 30% 50%, rgba(255,255,255,0.15) 0%, transparent 50%)' }}
                    animate={{ scale: [1, 1.2, 1], x: [0, 100, 0], y: [0, -50, 0] }}
                    transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
                />
                {[...Array(6)].map((_, i) => (
                    <motion.div key={`bubble-${i}`} className="absolute rounded-full"
                        style={{ width: `${150 + i * 30}px`, height: `${150 + i * 30}px`, background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.5), transparent 70%)', filter: 'blur(40px)', left: `${(i * 17) % 100}%`, top: `${(i * 19) % 100}%` }}
                        animate={{ x: [0, (i % 2 === 0 ? 80 : -80), 0], y: [0, (i % 3 === 0 ? -60 : 60), 0], opacity: [0.3, 0.6, 0.3] }}
                        transition={{ duration: 8 + i * 1.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.8 }}
                    />
                ))}
                {[...Array(30)].map((_, i) => (
                    <motion.div key={`star-${i}`} className="absolute rounded-full bg-white"
                        style={{ width: `${2 + (i % 3)}px`, height: `${2 + (i % 3)}px`, left: `${(i * 3.3) % 100}%`, top: `${(i * 7.7) % 100}%`, boxShadow: '0 0 8px rgba(255,255,255,0.8)' }}
                        animate={{ opacity: [0.2, 1, 0.2], scale: [1, 1.5, 1] }}
                        transition={{ duration: 2 + (i % 3), repeat: Infinity, ease: 'easeInOut', delay: (i % 5) * 0.5 }}
                    />
                ))}
                {[...Array(3)].map((_, i) => (
                    <motion.div key={`ring-${i}`} className="absolute rounded-full"
                        style={{ width: `${300 + i * 150}px`, height: `${300 + i * 150}px`, border: '2px solid rgba(255,255,255,0.2)', left: '50%', top: '50%', marginLeft: `-${150 + i * 75}px`, marginTop: `-${150 + i * 75}px` }}
                        animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.5, 0.2], rotate: [0, 360] }}
                        transition={{ duration: 10 + i * 3, repeat: Infinity, ease: 'easeInOut', delay: i * 1.5 }}
                    />
                ))}
            </div>

            {/* Main Card */}
            <motion.div
                initial={{ opacity: 0, rotateX: 20, scale: 0.85 }}
                animate={{ opacity: 1, rotateX: 0, scale: 1 }}
                transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                className="w-full max-w-md p-6 relative z-10"
            >
                <div className="relative group">
                    <motion.div
                        className={`absolute -inset-4 bg-gradient-to-r ${cfg.gradient} rounded-[2rem] blur-xl opacity-30 group-hover:opacity-50 transition duration-1000`}
                    />
                    <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-2xl border-2 border-white/40 p-8 relative overflow-hidden">

                        {/* Step Progress Dots */}
                        <div className="flex justify-center gap-2 mb-6">
                            {[1, 2, 3].map(s => (
                                <motion.div
                                    key={s}
                                    animate={{ scale: step === s ? 1.3 : 1, opacity: step >= s ? 1 : 0.3 }}
                                    className={`h-2 rounded-full ${cfg.buttonGradient} transition-all duration-300`}
                                    style={{ width: step === s ? '24px' : '8px' }}
                                />
                            ))}
                        </div>

                        {/* Icon */}
                        <div className="flex justify-center mb-6">
                            <div className={`w-16 h-16 rounded-2xl ${cfg.buttonGradient} p-0.5 shadow-lg`}>
                                <div className="w-full h-full bg-white rounded-xl flex items-center justify-center">
                                    {step === 2 ? <FiShield className={`w-8 h-8 ${cfg.accentColor}`} />
                                        : step === 3 ? <FiLock className={`w-8 h-8 ${cfg.accentColor}`} />
                                            : <Icon className={`w-8 h-8 ${cfg.accentColor}`} />}
                                </div>
                            </div>
                        </div>

                        <AnimatePresence mode="wait">

                            {/* ─── STEP 1: Email ──────────────────────────── */}
                            {step === 1 && (
                                <motion.div key="step1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                                    <div className="text-center mb-6">
                                        <h2 className="text-2xl font-black text-slate-800 mb-1">{stepTitles[1]}</h2>
                                        <p className="text-slate-500 text-sm">{stepSubtitles[1]}</p>
                                    </div>

                                    <form onSubmit={handleSendOtp} className="space-y-4">
                                        <div className="space-y-1">
                                            <label className="text-sm font-bold text-slate-700 ml-1">Email Address</label>
                                            <div className="relative">
                                                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input
                                                    type="email" required value={email}
                                                    onChange={e => { setEmail(e.target.value); setError(''); }}
                                                    className={`w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 ${cfg.ringColor} focus:ring-4 outline-none transition-all font-medium text-sm`}
                                                    placeholder={role === 'student' ? 'student@college.edu' : 'faculty@college.edu'}
                                                />
                                            </div>
                                        </div>

                                        {error && (
                                            <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                                                className="text-red-500 text-sm text-center font-medium bg-red-50 py-2 px-3 rounded-lg">
                                                {error}
                                            </motion.p>
                                        )}

                                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                            className={`w-full py-3 rounded-xl font-bold text-white shadow-lg ${cfg.buttonGradient}`}
                                            disabled={isLoading}>
                                            {isLoading ? (
                                                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}
                                                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full mx-auto" />
                                            ) : 'Send OTP'}
                                        </motion.button>
                                    </form>
                                </motion.div>
                            )}

                            {/* ─── STEP 2: OTP ────────────────────────────── */}
                            {step === 2 && (
                                <motion.div key="step2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                                    <div className="text-center mb-6">
                                        <h2 className="text-2xl font-black text-slate-800 mb-1">{stepTitles[2]}</h2>
                                        <p className="text-slate-500 text-sm">{stepSubtitles[2]}</p>
                                        <p className="text-xs text-slate-400 mt-1">Valid for 10 minutes</p>
                                    </div>

                                    <form onSubmit={handleVerifyOtp} className="space-y-5">
                                        {/* OTP boxes */}
                                        <div className="flex justify-center gap-2" onPaste={handleOtpPaste}>
                                            {otp.map((digit, i) => (
                                                <motion.input
                                                    key={i}
                                                    ref={el => otpRefs.current[i] = el}
                                                    type="text" inputMode="numeric" maxLength={1}
                                                    value={digit}
                                                    onChange={e => handleOtpChange(i, e.target.value)}
                                                    onKeyDown={e => handleOtpKeyDown(i, e)}
                                                    whileFocus={{ scale: 1.08 }}
                                                    className={`w-11 h-12 text-center text-xl font-black rounded-xl border-2 bg-slate-50 outline-none focus:ring-4 transition-all ${cfg.otpBorder} ${digit ? 'text-slate-800 bg-white shadow-md' : 'text-slate-400'}`}
                                                />
                                            ))}
                                        </div>

                                        {error && (
                                            <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                                                className="text-red-500 text-sm text-center font-medium bg-red-50 py-2 px-3 rounded-lg">
                                                {error}
                                            </motion.p>
                                        )}

                                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                            className={`w-full py-3 rounded-xl font-bold text-white shadow-lg ${cfg.buttonGradient}`}
                                            disabled={isLoading || otp.join('').length < 6}>
                                            {isLoading ? (
                                                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}
                                                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full mx-auto" />
                                            ) : 'Verify OTP'}
                                        </motion.button>

                                        <div className="text-center">
                                            {countdown > 0 ? (
                                                <p className="text-slate-400 text-sm">Resend OTP in <span className={`font-bold ${cfg.accentColor}`}>{countdown}s</span></p>
                                            ) : (
                                                <button type="button" onClick={handleResend}
                                                    className={`text-sm font-bold ${cfg.accentColor} hover:underline`} disabled={isLoading}>
                                                    Resend OTP
                                                </button>
                                            )}
                                        </div>

                                        <button type="button" onClick={() => { setStep(1); setOtp(['','','','','','']); setError(''); }}
                                            className="w-full text-xs text-slate-400 hover:text-slate-600 transition-colors">
                                            ← Change email
                                        </button>
                                    </form>
                                </motion.div>
                            )}

                            {/* ─── STEP 3: New Password ────────────────────── */}
                            {step === 3 && (
                                <motion.div key="step3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                                    <div className="text-center mb-6">
                                        <h2 className="text-2xl font-black text-slate-800 mb-1">{stepTitles[3]}</h2>
                                        <p className="text-slate-500 text-sm">{stepSubtitles[3]}</p>
                                    </div>

                                    <form onSubmit={handleResetPassword} className="space-y-4">
                                        {/* New Password */}
                                        <div className="space-y-1">
                                            <label className="text-sm font-bold text-slate-700 ml-1">New Password</label>
                                            <div className="relative">
                                                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input
                                                    type={showPassword ? 'text' : 'password'} required minLength={6}
                                                    value={newPassword} onChange={e => { setNewPassword(e.target.value); setError(''); }}
                                                    className={`w-full pl-11 pr-11 py-3 rounded-xl bg-slate-50 border border-slate-200 ${cfg.ringColor} focus:ring-4 outline-none transition-all font-medium text-sm`}
                                                    placeholder="Minimum 6 characters"
                                                />
                                                <button type="button" onClick={() => setShowPassword(v => !v)}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                                    {showPassword ? <FiEyeOff /> : <FiEye />}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Confirm Password */}
                                        <div className="space-y-1">
                                            <label className="text-sm font-bold text-slate-700 ml-1">Confirm Password</label>
                                            <div className="relative">
                                                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input
                                                    type={showConfirm ? 'text' : 'password'} required
                                                    value={confirmPassword} onChange={e => { setConfirmPassword(e.target.value); setError(''); }}
                                                    className={`w-full pl-11 pr-11 py-3 rounded-xl bg-slate-50 border border-slate-200 ${cfg.ringColor} focus:ring-4 outline-none transition-all font-medium text-sm ${confirmPassword && confirmPassword !== newPassword ? 'border-red-400' : ''}`}
                                                    placeholder="Repeat your password"
                                                />
                                                <button type="button" onClick={() => setShowConfirm(v => !v)}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                                    {showConfirm ? <FiEyeOff /> : <FiEye />}
                                                </button>
                                            </div>
                                        </div>

                                        {error && (
                                            <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                                                className="text-red-500 text-sm text-center font-medium bg-red-50 py-2 px-3 rounded-lg">
                                                {error}
                                            </motion.p>
                                        )}

                                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                            className={`w-full py-3 rounded-xl font-bold text-white shadow-lg ${cfg.buttonGradient}`}
                                            disabled={isLoading}>
                                            {isLoading ? (
                                                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}
                                                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full mx-auto" />
                                            ) : 'Reset Password'}
                                        </motion.button>
                                    </form>
                                </motion.div>
                            )}

                            {/* ─── STEP 4: Success ─────────────────────────── */}
                            {step === 4 && (
                                <motion.div key="step4"
                                    initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                                    transition={{ type: 'spring', bounce: 0.5 }}
                                    className="text-center py-4">
                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                                        transition={{ type: 'spring', delay: 0.2 }}
                                        className={`w-20 h-20 mx-auto rounded-full ${cfg.buttonGradient} flex items-center justify-center mb-6 shadow-xl`}>
                                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                                            <motion.path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"
                                                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                                                transition={{ duration: 0.6, delay: 0.4 }} />
                                        </svg>
                                    </motion.div>
                                    <h3 className="text-2xl font-bold text-slate-800 mb-2">Password Reset!</h3>
                                    <p className="text-slate-500 mb-6 text-sm">Your password has been successfully updated. You can now log in with your new password.</p>
                                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                        onClick={() => navigate('/login')}
                                        className={`px-8 py-3 rounded-xl font-bold text-white shadow-lg ${cfg.buttonGradient}`}>
                                        Go to Login
                                    </motion.button>
                                </motion.div>
                            )}

                        </AnimatePresence>

                        {/* Back to login */}
                        {step !== 4 && (
                            <div className="mt-6 pt-5 border-t border-slate-100 text-center">
                                <Link to="/login" className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-slate-700 transition-colors">
                                    <motion.span animate={{ x: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 1.5, repeatDelay: 3 }}>
                                        <FiArrowLeft />
                                    </motion.span>
                                    Back to Login
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>

            <style>{`.perspective-1000 { perspective: 1000px; }`}</style>
        </div>
    );
};

export default ForgotPasswordPage;
