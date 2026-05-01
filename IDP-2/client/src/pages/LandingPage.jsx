import { Link } from 'react-router-dom';
import { FiCalendar, FiUsers, FiAward, FiArrowRight, FiCheck, FiLayers, FiZap } from 'react-icons/fi';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useRef } from 'react';

const LandingPage = () => {
    const { scrollYProgress } = useScroll();
    const scale = useTransform(scrollYProgress, [0, 1], [1, 0.8]);
    const rotate = useTransform(scrollYProgress, [0, 1], [0, -10]);

    // 3D Card effect for Hero
    const heroRef = useRef(null);
    const heroRotateX = useSpring(0, { stiffness: 100, damping: 30 });
    const heroRotateY = useSpring(0, { stiffness: 100, damping: 30 });

    const handleHeroMouseMove = (e) => {
        if (!heroRef.current) return;
        const rect = heroRef.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const rX = -((mouseY / height) - 0.5) * 20; // Reverse X axis for correct tilt
        const rY = ((mouseX / width) - 0.5) * 20;
        heroRotateX.set(rX);
        heroRotateY.set(rY);
    };

    const handleHeroMouseLeave = () => {
        heroRotateX.set(0);
        heroRotateY.set(0);
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans overflow-x-hidden perspective-wrapper">
            {/* 3D Progress Bar */}
            <motion.div
                className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 origin-left z-50"
                style={{ scaleX: scrollYProgress }}
            />

            {/* Hero Section */}
            <section className="relative min-h-[90vh] flex items-center justify-center pt-20 overflow-hidden perspective-2000">
                {/* 3D Background Grid */}
                <div className="absolute inset-0 z-0 opacity-20 transform-gpu perspective-1000 rotate-x-12 scale-150">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                </div>

                {/* Floating 3D Shapes */}
                {[...Array(5)].map((_, i) => (
                    <motion.div
                        key={i}
                        className={`absolute rounded-2xl backdrop-blur-3xl opacity-40 animate-blob-float`}
                        style={{
                            width: Math.random() * 300 + 100,
                            height: Math.random() * 300 + 100,
                            background: `linear-gradient(${Math.random() * 360}deg, ${['#818cf8', '#c084fc', '#f472b6'][i % 3]} 0%, transparent 70%)`,
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${i * 2}s`,
                            z: Math.random() * -500
                        }}
                    />
                ))}

                <div className="max-w-7xl mx-auto px-4 z-10 w-full">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        {/* Text Content */}
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="flex-1 text-center lg:text-left"
                        >
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-white/50 border border-indigo-100 backdrop-blur-sm shadow-sm"
                            >
                                <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></span>
                                <span className="text-sm font-semibold text-indigo-900 tracking-wide uppercase">Next-Gen Campus System</span>
                            </motion.div>

                            <h1 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tight leading-[0.9] mb-8 relative">
                                <span className="relative inline-block transform transition-transform hover:scale-105 duration-300 cursor-default">
                                    Campus
                                    <div className="absolute -inset-1 bg-indigo-100 blur-xl -z-10 opacity-50"></div>
                                </span> <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 animate-gradient-x">
                                    Evolution
                                </span>
                            </h1>

                            <p className="text-xl text-slate-600 leading-relaxed mb-10 max-w-2xl mx-auto lg:mx-0">
                                Experience a fully immersive 3D digital ecosystem for university management.
                                Secure, fast, and beautifully designed.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                                <Link to="/register">
                                    <motion.button
                                        whileHover={{ scale: 1.05, z: 20 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="btn-primary px-8 py-4 text-lg shadow-2xl shadow-indigo-500/30 flex items-center gap-2 group"
                                    >
                                        Get Started
                                        <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                                    </motion.button>
                                </Link>
                                <Link to="/login">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="px-8 py-4 rounded-xl font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-all shadow-lg shadow-slate-200/50 flex items-center gap-2"
                                    >
                                        <FiUsers /> Member Login
                                    </motion.button>
                                </Link>
                            </div>
                        </motion.div>

                        {/* 3D Hero Visual */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, rotateY: 30 }}
                            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="flex-1 w-full perspective-1000"
                        >
                            <motion.div
                                ref={heroRef}
                                onMouseMove={handleHeroMouseMove}
                                onMouseLeave={handleHeroMouseLeave}
                                style={{
                                    rotateX: heroRotateX,
                                    rotateY: heroRotateY,
                                    transformStyle: "preserve-3d"
                                }}
                                className="relative w-full aspect-square max-w-[500px] mx-auto"
                            >
                                {/* Main Card Base */}
                                <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-xl rounded-[3rem] border border-white/60 shadow-2xl shadow-indigo-500/20" style={{ transform: "translateZ(0px)" }}></div>

                                {/* Floating Layers */}
                                <motion.div
                                    className="absolute top-10 left-10 right-10 bottom-32 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl opacity-10 blur-2xl"
                                    style={{ transform: "translateZ(-20px)" }}
                                />

                                <motion.div
                                    className="absolute top-1/4 left-1/4 w-1/2 h-1/2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full blur-3xl opacity-20 mix-blend-multiply"
                                    animate={{
                                        scale: [1, 1.2, 1],
                                        opacity: [0.2, 0.4, 0.2]
                                    }}
                                    transition={{ duration: 4, repeat: Infinity }}
                                    style={{ transform: "translateZ(-40px)" }}
                                />

                                {/* 3D Elements Content */}
                                <div className="absolute inset-0 flex items-center justify-center" style={{ transform: "translateZ(50px)" }}>
                                    <div className="grid grid-cols-2 gap-4 p-8 w-full h-full">
                                        <div className="col-span-2 bg-white/50 rounded-2xl p-4 shadow-lg backdrop-blur-sm border border-white/50 flex items-center gap-4 hover:scale-105 transition-transform">
                                            <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                                                <FiCalendar className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <div className="h-2 w-24 bg-slate-200 rounded mb-2"></div>
                                                <div className="h-2 w-16 bg-slate-100 rounded"></div>
                                            </div>
                                        </div>
                                        <div className="bg-white/50 rounded-2xl p-4 shadow-lg backdrop-blur-sm border border-white/50 flex flex-col items-center justify-center gap-2 hover:scale-105 transition-transform" style={{ transform: "translateZ(20px)" }}>
                                            <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center text-pink-600">
                                                <FiUsers className="w-6 h-6" />
                                            </div>
                                            <div className="h-2 w-12 bg-slate-200 rounded"></div>
                                        </div>
                                        <div className="bg-white/50 rounded-2xl p-4 shadow-lg backdrop-blur-sm border border-white/50 flex flex-col items-center justify-center gap-2 hover:scale-105 transition-transform" style={{ transform: "translateZ(30px)" }}>
                                            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                                <FiAward className="w-6 h-6" />
                                            </div>
                                            <div className="h-2 w-12 bg-slate-200 rounded"></div>
                                        </div>
                                        <div className="col-span-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-4 shadow-xl text-white flex items-center justify-between" style={{ transform: "translateZ(40px)" }}>
                                            <span className="font-bold">Join Now</span>
                                            <FiArrowRight />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Features Section with Scroll Animation */}
            <motion.section
                style={{ scale, rotateX: rotate, transformStyle: "preserve-3d" }}
                className="py-32 relative z-20"
            >
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-24">
                        <motion.span
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            className="text-indigo-600 font-bold tracking-wider uppercase"
                        >
                            Why Choose Us
                        </motion.span>
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 mt-4 mb-6">
                            Constructed for <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                                Digital Excellence
                            </span>
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 perspective-1000">
                        {[
                            {
                                icon: FiLayers,
                                title: 'Deep Analytics',
                                desc: 'Multi-layer data visualization in real-time 3D dashboards.',
                                gradient: 'from-blue-500 to-cyan-500'
                            },
                            {
                                icon: FiZap,
                                title: 'Instant Sync',
                                desc: 'Lightning fast state updates across all client devices.',
                                gradient: 'from-amber-500 to-orange-500'
                            },
                            {
                                icon: FiAward,
                                title: 'Smart Certification',
                                desc: 'Automated blockchain-style certificate verifications.',
                                gradient: 'from-pink-500 to-rose-500'
                            },
                        ].map((feature, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 50, rotateX: -10 }}
                                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                                transition={{ delay: i * 0.2, duration: 0.6 }}
                                whileHover={{
                                    y: -20,
                                    rotateX: 5,
                                    rotateY: 5,
                                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)"
                                }}
                                className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl relative overflow-hidden group transform-style-3d transition-all duration-300"
                            >
                                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${feature.gradient} opacity-10 rounded-bl-[100px] transition-all group-hover:scale-110`} />

                                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-white shadow-lg mb-8 transform transition-transform group-hover:rotate-12`}>
                                    <feature.icon className="w-8 h-8" />
                                </div>

                                <h3 className="text-2xl font-bold text-slate-800 mb-4 group-hover:text-indigo-900 transition-colors">
                                    {feature.title}
                                </h3>
                                <p className="text-slate-500 leading-relaxed font-medium">
                                    {feature.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </motion.section>

            <style>{`
                .perspective-wrapper {
                    perspective: 3000px;
                }
                .perspective-1000 {
                    perspective: 1000px;
                }
                .perspective-2000 {
                    perspective: 2000px;
                }
            `}</style>
        </div>
    );
};

export default LandingPage;
