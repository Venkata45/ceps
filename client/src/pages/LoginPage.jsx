import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMail, FiLock, FiUser, FiBook, FiShield, FiArrowRight } from 'react-icons/fi';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import Navbar from '../components/Navbar';

const LoginPage = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [selectedRole, setSelectedRole] = useState('student');
    const { login } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 3D Tilt Effect
    const cardRef = useRef(null);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const rotateX = useSpring(useTransform(mouseY, [-300, 300], [15, -15]), {
        stiffness: 150,
        damping: 30
    });
    const rotateY = useSpring(useTransform(mouseX, [-300, 300], [-15, 15]), {
        stiffness: 150,
        damping: 30
    });

    const handleMouseMove = (e) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        mouseX.set(e.clientX - centerX);
        mouseY.set(e.clientY - centerY);
    };

    const handleMouseLeave = () => {
        mouseX.set(0);
        mouseY.set(0);
    };

    const roleConfigs = {
        student: {
            title: 'Student Login',
            subtitle: 'Access your courses and assignments',
            icon: FiUser,
            gradient: 'from-purple-600 via-purple-500 to-pink-600',
            glowColor: 'rgba(168, 85, 247, 0.4)',
            particleColor: '#c084fc'
        },
        faculty: {
            title: 'Faculty Login',
            subtitle: 'Manage your classes and students',
            icon: FiBook,
            gradient: 'from-emerald-600 via-emerald-500 to-teal-600',
            glowColor: 'rgba(16, 185, 129, 0.4)',
            particleColor: '#10b981'
        },
        admin: {
            title: 'Admin Login',
            subtitle: 'System administration and oversight',
            icon: FiShield,
            gradient: 'from-red-600 via-red-500 to-orange-600',
            glowColor: 'rgba(239, 68, 68, 0.4)',
            particleColor: '#ef4444'
        }
    };

    const currentConfig = roleConfigs[selectedRole];
    const Icon = currentConfig.icon;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        if (!formData.email || !formData.password) {
            setError('Please enter both email and password');
            setIsSubmitting(false);
            return;
        }

        try {
            const res = await login(formData.email, formData.password, selectedRole);
            if (res.success) {
                navigate('/');
            } else {
                setError(res.message || 'Invalid credentials');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputChange = (field, value) => {
        if (error) setError('');
        setFormData({ ...formData, [field]: value });
    };

    const handleRoleChange = (role) => {
        setSelectedRole(role);
        setError('');
    };

    return (
        <div className={`min-h-screen bg-gradient-to-br ${currentConfig.gradient} perspective-container overflow-hidden relative`}>
            <Navbar />

            {/* Enhanced Animated Background */}
            <div className="absolute inset-0 overflow-hidden">
                {/* Animated Wave Layers */}
                <motion.div
                    className="absolute inset-0 opacity-40"
                    style={{
                        background: 'radial-gradient(circle at 30% 50%, rgba(255,255,255,0.15) 0%, transparent 50%)'
                    }}
                    animate={{
                        scale: [1, 1.2, 1],
                        x: [0, 100, 0],
                        y: [0, -50, 0]
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: 'easeInOut'
                    }}
                />
                <motion.div
                    className="absolute inset-0 opacity-30"
                    style={{
                        background: 'radial-gradient(circle at 70% 50%, rgba(255,255,255,0.2) 0%, transparent 60%)'
                    }}
                    animate={{
                        scale: [1.2, 1, 1.2],
                        x: [-100, 0, -100],
                        y: [50, 0, 50]
                    }}
                    transition={{
                        duration: 12,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: 1
                    }}
                />

                {/* Large Glowing Bubbles */}
                {[...Array(6)].map((_, i) => (
                    <motion.div
                        key={`bubble-${i}`}
                        className="absolute rounded-full"
                        style={{
                            width: `${150 + Math.random() * 200}px`,
                            height: `${150 + Math.random() * 200}px`,
                            background: `radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.6), transparent 70%)`,
                            filter: 'blur(40px)',
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`
                        }}
                        animate={{
                            x: [0, Math.random() * 200 - 100, 0],
                            y: [0, Math.random() * 200 - 100, 0],
                            scale: [1, 1.3, 1],
                            opacity: [0.3, 0.6, 0.3]
                        }}
                        transition={{
                            duration: 8 + Math.random() * 6,
                            repeat: Infinity,
                            ease: 'easeInOut',
                            delay: i * 0.8
                        }}
                    />
                ))}

                {/* Starfield Effect */}
                {[...Array(40)].map((_, i) => (
                    <motion.div
                        key={`star-${i}`}
                        className="absolute rounded-full bg-white"
                        style={{
                            width: `${2 + Math.random() * 4}px`,
                            height: `${2 + Math.random() * 4}px`,
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            boxShadow: '0 0 10px rgba(255,255,255,0.8)'
                        }}
                        animate={{
                            opacity: [0.2, 1, 0.2],
                            scale: [1, 1.5, 1]
                        }}
                        transition={{
                            duration: 2 + Math.random() * 3,
                            repeat: Infinity,
                            ease: 'easeInOut',
                            delay: Math.random() * 5
                        }}
                    />
                ))}

                {/* Floating Geometric Shapes */}
                {[...Array(8)].map((_, i) => (
                    <motion.div
                        key={`shape-${i}`}
                        className="absolute"
                        style={{
                            width: `${80 + Math.random() * 120}px`,
                            height: `${80 + Math.random() * 120}px`,
                            border: '3px solid rgba(255,255,255,0.3)',
                            borderRadius: i % 2 === 0 ? '50%' : '20%',
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`
                        }}
                        animate={{
                            rotate: [0, 360],
                            scale: [1, 1.2, 1],
                            x: [0, Math.random() * 100 - 50, 0],
                            y: [0, Math.random() * 100 - 50, 0]
                        }}
                        transition={{
                            duration: 15 + Math.random() * 10,
                            repeat: Infinity,
                            ease: 'linear'
                        }}
                    />
                ))}

                {/* Animated Gradient Rings */}
                {[...Array(3)].map((_, i) => (
                    <motion.div
                        key={`ring-${i}`}
                        className="absolute rounded-full"
                        style={{
                            width: `${300 + i * 150}px`,
                            height: `${300 + i * 150}px`,
                            border: '2px solid rgba(255,255,255,0.2)',
                            left: '50%',
                            top: '50%',
                            marginLeft: `-${150 + i * 75}px`,
                            marginTop: `-${150 + i * 75}px`
                        }}
                        animate={{
                            scale: [1, 1.1, 1],
                            opacity: [0.2, 0.5, 0.2],
                            rotate: [0, 180, 360]
                        }}
                        transition={{
                            duration: 10 + i * 2,
                            repeat: Infinity,
                            ease: 'easeInOut',
                            delay: i * 1.5
                        }}
                    />
                ))}

                {/* Flowing Particles */}
                <AnimatePresence>
                    {[...Array(25)].map((_, i) => (
                        <motion.div
                            key={`particle-${selectedRole}-${i}`}
                            className="absolute rounded-full bg-white"
                            initial={{
                                x: Math.random() * window.innerWidth,
                                y: window.innerHeight + 50,
                                scale: 0,
                                opacity: 0
                            }}
                            animate={{
                                y: -100,
                                scale: [0, Math.random() + 0.5, 0],
                                opacity: [0, 0.8, 0]
                            }}
                            transition={{
                                duration: Math.random() * 5 + 8,
                                delay: i * 0.3,
                                repeat: Infinity,
                                ease: 'linear'
                            }}
                            style={{
                                width: `${8 + Math.random() * 12}px`,
                                height: `${8 + Math.random() * 12}px`,
                                boxShadow: '0 0 20px rgba(255,255,255,0.6)'
                            }}
                        />
                    ))}
                </AnimatePresence>

                {/* Diagonal Flowing Lines */}
                {[...Array(6)].map((_, i) => (
                    <motion.div
                        key={`line-${i}`}
                        className="absolute"
                        style={{
                            height: '2px',
                            width: '100%',
                            top: `${15 + i * 15}%`,
                            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                            transformOrigin: 'center'
                        }}
                        animate={{
                            scaleX: [0, 1, 0],
                            x: ['-100%', '0%', '100%'],
                            opacity: [0, 0.7, 0]
                        }}
                        transition={{
                            duration: 4,
                            repeat: Infinity,
                            delay: i * 0.7,
                            ease: 'easeInOut'
                        }}
                    />
                ))}
            </div>

            {/* Main Login Container */}
            <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8 pt-16 sm:pt-18 relative z-10">
                <motion.div
                    ref={cardRef}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    style={{
                        rotateX,
                        rotateY,
                        transformStyle: 'preserve-3d'
                    }}
                    className="w-full max-w-md relative"
                >
                    {/* Main Card */}
                    <motion.div
                        className="relative bg-slate-900/80 backdrop-blur-2xl rounded-[2.5rem] border-2 border-white/30 shadow-2xl overflow-hidden"
                        style={{
                            transformStyle: 'preserve-3d',
                            transform: 'translateZ(0)'
                        }}
                    >

                        <div className="relative p-8" style={{ transform: 'translateZ(20px)' }}>
                            {/* Role Selection */}
                            <motion.div
                                initial={{ y: -20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="mb-8"
                            >
                                <div className="flex gap-2 bg-slate-800/80 rounded-2xl p-1.5 backdrop-blur-sm border border-white/10 shadow-lg">
                                    {Object.entries(roleConfigs).map(([role, config]) => (
                                        <motion.button
                                            key={role}
                                            onClick={() => handleRoleChange(role)}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-sm transition-all relative overflow-hidden ${selectedRole === role
                                                ? 'text-white shadow-lg'
                                                : 'text-slate-400 hover:text-slate-200'
                                                }`}
                                        >
                                            {selectedRole === role && (
                                                <motion.div
                                                    layoutId="activeRole"
                                                    className={`absolute inset-0 bg-gradient-to-r ${config.gradient} rounded-xl`}
                                                    transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
                                                />
                                            )}
                                            <span className="relative z-10 flex items-center justify-center gap-2">
                                                <config.icon className="w-4 h-4" />
                                                {role.charAt(0).toUpperCase() + role.slice(1)}
                                            </span>
                                        </motion.button>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Header with 3D Icon */}
                            <motion.div
                                key={selectedRole}
                                initial={{ opacity: 0, scale: 0.8, rotateY: -90 }}
                                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                                className="text-center mb-8"
                                style={{ transform: 'translateZ(30px)' }}
                            >
                                <div
                                    className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${currentConfig.gradient} flex items-center justify-center shadow-xl`}
                                    style={{ transformStyle: 'preserve-3d' }}
                                >
                                    <Icon className="w-10 h-10 text-white" style={{ transform: 'translateZ(10px)' }} />
                                </div>

                                <h2 className="text-3xl font-black text-white mb-2">
                                    {currentConfig.title}
                                </h2>
                                <p className="text-slate-400 font-medium">
                                    {currentConfig.subtitle}
                                </p>
                            </motion.div>

                            {/* Error Message */}
                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, height: 'auto', scale: 1 }}
                                        exit={{ opacity: 0, height: 0, scale: 0.8 }}
                                        className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-bold flex items-center gap-2"
                                        style={{ transform: 'translateZ(15px)' }}
                                    >
                                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                        {error}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Login Form */}
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <motion.div
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.1 }}
                                    style={{ transform: 'translateZ(25px)' }}
                                >
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">
                                        Email Address
                                    </label>
                                    <div className="relative group">
                                        <FiMail className="absolute left-4 top-3.5 text-slate-500 transition-colors group-focus-within:text-purple-400" />
                                        <input
                                            type="email"
                                            required
                                            className="w-full pl-12 pr-4 py-3.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 outline-none focus:border-purple-500/50 focus:bg-slate-800 focus:ring-4 focus:ring-purple-500/10 transition-all"
                                            placeholder="your@email.com"
                                            value={formData.email}
                                            onChange={(e) => handleInputChange('email', e.target.value)}
                                        />
                                    </div>
                                </motion.div>

                                <motion.div
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                    style={{ transform: 'translateZ(25px)' }}
                                >
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                            Password
                                        </label>
                                        {selectedRole !== 'admin' && (
                                            <Link
                                                to={`/forgot-password?role=${selectedRole}`}
                                                className="text-xs font-bold text-purple-400 hover:text-purple-300 transition-colors"
                                            >
                                                Forgot?
                                            </Link>
                                        )}
                                    </div>
                                    <div className="relative group">
                                        <FiLock className="absolute left-4 top-3.5 text-slate-500 transition-colors group-focus-within:text-purple-400" />
                                        <input
                                            type="password"
                                            required
                                            className="w-full pl-12 pr-4 py-3.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 outline-none focus:border-purple-500/50 focus:bg-slate-800 focus:ring-4 focus:ring-purple-500/10 transition-all"
                                            placeholder="••••••••"
                                            value={formData.password}
                                            onChange={(e) => handleInputChange('password', e.target.value)}
                                        />
                                    </div>
                                </motion.div>

                                <motion.button
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                    whileHover={{ scale: 1.02, z: 20 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`w-full py-4 rounded-xl font-bold text-white shadow-xl relative overflow-hidden group bg-gradient-to-r ${currentConfig.gradient}`}
                                    style={{ transform: 'translateZ(30px)' }}
                                >
                                    <span className="relative z-10 flex items-center justify-center gap-2">
                                        {isSubmitting ? 'Signing In...' : 'Sign In'}
                                        {!isSubmitting && <FiArrowRight className="group-hover:translate-x-1 transition-transform" />}
                                    </span>
                                    <motion.div
                                        className="absolute inset-0 bg-white/20"
                                        initial={{ x: '-100%', skewX: -20 }}
                                        whileHover={{ x: '200%' }}
                                        transition={{ duration: 0.6 }}
                                    />
                                </motion.button>
                            </form>

                            {/* Footer */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="mt-8 pt-6 border-t border-slate-700/50 text-center"
                                style={{ transform: 'translateZ(15px)' }}
                            >
                                <p className="text-slate-400 text-sm">
                                    Don't have an account?{' '}
                                    <Link
                                        to="/register"
                                        className={`font-bold bg-gradient-to-r ${currentConfig.gradient} bg-clip-text text-transparent hover:opacity-80 transition-opacity`}
                                    >
                                        Sign up
                                    </Link>
                                </p>
                            </motion.div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>

            <style>{`
                .perspective-container {
                    perspective: 2000px;
                }
            `}</style>
        </div>
    );
};

export default LoginPage;
