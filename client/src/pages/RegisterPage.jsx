import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiMail, FiLock, FiBook, FiPhone, FiCreditCard, FiArrowRight } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'student',
        department: '',
        year: '',
        registrationNumber: '',
        phoneNumber: ''
    });
    const { register } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [step, setStep] = useState(1);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await register(formData);
        if (res.success) {
            navigate('/');
        } else {
            setError(res.message);
        }
    };

    const nextStep = () => setStep(step + 1);
    const prevStep = () => setStep(step - 1);

    const containerVariants = {
        hidden: { opacity: 0, rotateY: 90 },
        visible: {
            opacity: 1,
            rotateY: 0,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 20
            }
        },
        exit: { opacity: 0, rotateY: -90 }
    };

    return (
        <div className="min-h-screen pt-16 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center p-4 relative overflow-hidden perspective-2000">
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
                            key={`particle-${i}`}
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



            <motion.div
                className="w-full max-w-5xl h-auto md:h-[650px] bg-white rounded-[3rem] border-2 border-white/30 shadow-2xl flex relative z-10 overflow-hidden perspective-1000"
                initial={{ opacity: 0, y: 100, rotateX: 20 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ duration: 0.8 }}
            >
                {/* Left Side - 3D Visuals */}
                <div className="w-full md:w-5/12 bg-slate-900 relative hidden md:flex flex-col items-center justify-center p-12 overflow-hidden">
                    {/* Dynamic Grid Background */}
                    <div className="absolute inset-0 opacity-20 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:30px_30px]"></div>

                    <div className="relative z-10 text-center">
                        <motion.div
                            animate={{ rotateY: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            className="w-40 h-40 mx-auto mb-8 relative preserve-3d"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl opacity-80 backdrop-blur-xl transform rotate-12"></div>
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-600 rounded-3xl opacity-80 backdrop-blur-xl transform -rotate-12 translate-z-10"></div>
                            <div className="absolute inset-0 flex items-center justify-center transform translate-z-20">
                                <FiUser className="w-20 h-20 text-white" />
                            </div>
                        </motion.div>

                        <h2 className="text-3xl font-black text-white mb-4">Join the Ecosystem</h2>
                        <p className="text-slate-400">Experience the future of campus management with our 3D integrated platform.</p>
                    </div>

                    {/* Floating spheres */}
                    <motion.div
                        animate={{ y: [-20, 20, -20] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute bottom-10 right-10 w-20 h-20 bg-gradient-to-tr from-pink-500 to-indigo-500 rounded-full blur-xl opacity-60"
                    />
                </div>

                {/* Right Side - Multi-step Form */}
                <div className="w-full md:w-7/12 p-8 md:p-12 relative bg-white/90 backdrop-blur-xl overflow-y-auto">
                    <div className="max-w-md mx-auto">
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold text-slate-800">Create Account</h2>
                            <p className="text-slate-500">Step {step} of 2</p>
                            <div className="h-1 w-full bg-slate-100 mt-4 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${step * 50}%` }}
                                    className="h-full bg-indigo-600"
                                />
                            </div>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm font-bold border border-red-100"
                            >
                                {error}
                            </motion.div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <AnimatePresence mode="wait">
                                {step === 1 && (
                                    <motion.div
                                        key="step1"
                                        variants={containerVariants}
                                        initial="hidden"
                                        animate="visible"
                                        exit="exit"
                                        className="space-y-4"
                                    >
                                        <div className="group">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Full Name</label>
                                            <div className="relative mt-1">
                                                <FiUser className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-indigo-600" />
                                                <input
                                                    type="text" required
                                                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 transition-all font-medium"
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="group">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Email</label>
                                            <div className="relative mt-1">
                                                <FiMail className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-indigo-600" />
                                                <input
                                                    type="email" required
                                                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 transition-all font-medium"
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="group">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Password</label>
                                            <div className="relative mt-1">
                                                <FiLock className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-indigo-600" />
                                                <input
                                                    type="password" required
                                                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 transition-all font-medium"
                                                    value={formData.password}
                                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="pt-4">
                                            <button
                                                type="button"
                                                onClick={nextStep}
                                                className="w-full btn-primary py-3.5 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
                                            >
                                                Next Step <FiArrowRight />
                                            </button>
                                        </div>
                                    </motion.div>
                                )}

                                {step === 2 && (
                                    <motion.div
                                        key="step2"
                                        variants={containerVariants}
                                        initial="hidden"
                                        animate="visible"
                                        exit="exit"
                                        className="space-y-4"
                                    >
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="group col-span-2">
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Role</label>
                                                <select
                                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 transition-all font-medium appearance-none cursor-pointer"
                                                    value={formData.role}
                                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                                >
                                                    <option value="student">Student</option>
                                                </select>
                                            </div>

                                            {(formData.role === 'student' || formData.role === 'faculty') && (
                                                <div className="group col-span-2">
                                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Department</label>
                                                    <div className="relative mt-1">
                                                        <FiBook className="absolute left-4 top-3.5 text-slate-400" />
                                                        <select
                                                            required
                                                            className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 transition-all font-medium appearance-none cursor-pointer"
                                                            value={formData.department}
                                                            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                                        >
                                                            <option value="">Select Dept</option>
                                                            <option value="CSE">CSE</option>
                                                            <option value="ECE">ECE</option>
                                                            <option value="MECH">MECH</option>
                                                            <option value="CIVIL">CIVIL</option>
                                                            <option value="EEE">EEE</option>
                                                            <option value="IT">IT</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            )}

                                            {formData.role === 'student' && (
                                                <>
                                                    <div className="group">
                                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Year</label>
                                                        <select
                                                            required
                                                            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 transition-all font-medium appearance-none cursor-pointer"
                                                            value={formData.year}
                                                            onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                                                        >
                                                            <option value="">Year</option>
                                                            <option value="1">1st</option>
                                                            <option value="2">2nd</option>
                                                            <option value="3">3rd</option>
                                                            <option value="4">4th</option>
                                                        </select>
                                                    </div>

                                                    <div className="group">
                                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Reg No</label>
                                                        <div className="relative mt-1">
                                                            <FiCreditCard className="absolute left-4 top-3.5 text-slate-400" />
                                                            <input
                                                                type="text" required
                                                                className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 transition-all font-medium"
                                                                placeholder="ID"
                                                                value={formData.registrationNumber}
                                                                onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="group col-span-2">
                                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Phone</label>
                                                        <div className="relative mt-1">
                                                            <FiPhone className="absolute left-4 top-3.5 text-slate-400" />
                                                            <input
                                                                type="tel" required
                                                                className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 transition-all font-medium"
                                                                placeholder="+91..."
                                                                value={formData.phoneNumber}
                                                                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                                            />
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>

                                        <div className="flex gap-3 pt-4">
                                            <button
                                                type="button"
                                                onClick={prevStep}
                                                className="flex-1 py-3.5 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                                            >
                                                Back
                                            </button>
                                            <button
                                                type="submit"
                                                className="flex-[2] btn-primary py-3.5 shadow-lg shadow-indigo-500/20"
                                            >
                                                Complete Signup
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </form>

                        <div className="mt-8 text-center pt-6 border-t border-slate-100">
                            <p className="text-slate-500 font-medium text-sm">
                                Already have an account?{' '}
                                <Link to="/login" className="text-indigo-600 font-bold hover:underline">
                                    Sign In
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>

            <style>{`
                .perspective-2000 { perspective: 2000px; }
                .perspective-1000 { perspective: 1000px; }
                .preserve-3d { transform-style: preserve-3d; }
                .translate-z-10 { transform: translateZ(10px); }
                .translate-z-20 { transform: translateZ(20px); }
            `}</style>
        </div>
    );
};

export default RegisterPage;
