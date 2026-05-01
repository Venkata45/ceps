import { motion } from 'framer-motion';
import { FiCalendar, FiUsers, FiAward } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const LoadingScreen = () => {
    const { user } = useAuth();
    
    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-indigo-100/50 rounded-full blur-3xl animate-blob" />
            <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-purple-100/50 rounded-full blur-3xl animate-blob animation-delay-2000" />
            
            <div className="relative z-10 text-center">
                {/* CEPS Logo/Branding */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    className="mb-8"
                >
                    <div className="flex items-center justify-center mb-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl">
                            <FiCalendar className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 tracking-tighter mb-2">
                        CEPS
                    </h1>
                    <p className="text-slate-600 font-medium text-lg mb-4">
                        College Event Management System
                    </p>
                    
                    {/* Personalized Welcome */}
                    {user && (
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                            className="text-indigo-600 font-semibold text-lg"
                        >
                            Welcome back, {user.name}!
                        </motion.p>
                    )}
                </motion.div>

                {/* Loading Animation */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="space-y-6"
                >
                    {/* Loading Dots */}
                    <div className="flex items-center justify-center space-x-2">
                        {[0, 1, 2].map((index) => (
                            <motion.div
                                key={index}
                                initial={{ scale: 0 }}
                                animate={{ scale: [0, 1, 0] }}
                                transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                    delay: index * 0.2
                                }}
                                className="w-3 h-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full"
                            />
                        ))}
                    </div>

                    {/* Loading Text */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 1, 0.5] }}
                        transition={{
                            duration: 2,
                            repeat: Infinity
                        }}
                        className="text-slate-500 font-medium"
                    >
                        Preparing your dashboard...
                    </motion.p>

                    {/* Feature Icons */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8, duration: 0.8 }}
                        className="flex items-center justify-center space-x-8 mt-8"
                    >
                        <motion.div
                            whileHover={{ scale: 1.1 }}
                            className="text-center"
                        >
                            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-2">
                                <FiCalendar className="w-6 h-6 text-indigo-600" />
                            </div>
                            <p className="text-xs text-slate-600 font-medium">Events</p>
                        </motion.div>
                        
                        <motion.div
                            whileHover={{ scale: 1.1 }}
                            className="text-center"
                        >
                            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-2">
                                <FiUsers className="w-6 h-6 text-purple-600" />
                            </div>
                            <p className="text-xs text-slate-600 font-medium">Attendance</p>
                        </motion.div>
                        
                        <motion.div
                            whileHover={{ scale: 1.1 }}
                            className="text-center"
                        >
                            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-2">
                                <FiAward className="w-6 h-6 text-emerald-600" />
                            </div>
                            <p className="text-xs text-slate-600 font-medium">Outcomes</p>
                        </motion.div>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
};

export default LoadingScreen;
