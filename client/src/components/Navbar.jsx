import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMenu, FiX, FiLogOut, FiUser } from 'react-icons/fi';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="fixed w-full z-50 bg-white/70 backdrop-blur-xl border-b border-white/20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-14 items-center">
                    <Link to="/" className="flex-shrink-0 flex items-center gap-2 group">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-indigo-500/30 group-hover:scale-110 transition-transform">
                            C
                        </div>
                        <span className="font-black text-xl text-slate-900 tracking-tighter uppercase">CEPS</span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-10">
                        <Link to="/" className="text-slate-600 hover:text-indigo-600 font-bold text-sm uppercase tracking-widest transition-colors">Home</Link>
                        {user ? (
                            <>
                                <Link to={`/${user.role}`} className="text-slate-600 hover:text-indigo-600 font-bold text-sm uppercase tracking-widest transition-colors">Dashboard</Link>
                                <div className="flex items-center gap-6 pl-6 border-l border-slate-200">
                                    <div className="flex flex-col items-end">
                                        <span className="text-sm font-bold text-slate-900">{user.name}</span>
                                        <span className="text-[10px] font-black text-indigo-500 uppercase tracking-tighter">{user.role}</span>
                                    </div>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleLogout}
                                        className="btn-primary !px-5 !py-2 !text-xs !bg-slate-900 shadow-none hover:!bg-slate-800"
                                    >
                                        Logout
                                    </motion.button>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center gap-6">
                                <Link to="/login" className="text-slate-600 hover:text-indigo-600 font-bold text-sm uppercase tracking-widest transition-colors">Login</Link>
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Link to="/register" className="btn-primary shadow-indigo-600/30 text-sm">
                                        Join Now
                                    </Link>
                                </motion.div>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        <button onClick={() => setIsOpen(!isOpen)} className="text-slate-600 hover:text-slate-900 transition-colors p-2 glass rounded-xl">
                            {isOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden glass border-t border-slate-100 overflow-hidden"
                    >
                        <div className="px-4 py-8 space-y-4">
                            <Link to="/" className="block text-xl font-bold text-slate-800" onClick={() => setIsOpen(false)}>Home</Link>
                            {user ? (
                                <>
                                    <Link to={`/${user.role}`} className="block text-xl font-bold text-slate-800" onClick={() => setIsOpen(false)}>Dashboard</Link>
                                    <button onClick={handleLogout} className="w-full btn-primary !bg-red-600">Logout</button>
                                </>
                            ) : (
                                <>
                                    <Link to="/login" className="block text-xl font-bold text-slate-800" onClick={() => setIsOpen(false)}>Login</Link>
                                    <Link to="/register" className="block btn-primary text-center" onClick={() => setIsOpen(false)}>Join CEPS</Link>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
