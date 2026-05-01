import { useState, useEffect } from 'react';
import { FiDatabase, FiUsers, FiCalendar, FiActivity, FiEye } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const DataViewer = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('events');
    const [events, setEvents] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (activeTab === 'events') {
            fetchEvents();
        } else if (activeTab === 'users') {
            fetchUsers();
        }
    }, [activeTab]);

    const fetchEvents = async () => {
        try {
            const res = await fetch(`${API_BASE}/events`);
            const data = await res.json();
            setEvents(data);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch events:', error);
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await fetch(`${API_BASE}/auth/test-users`);
            const data = await res.json();
            setUsers(data.users || []);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch users:', error);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-slate-900 mb-4">CEPS Data Viewer</h1>
                    <p className="text-slate-600">Debug and monitor application data in real-time</p>
                </div>

                {/* Tab Navigation */}
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setActiveTab('events')}
                        className={`px-4 py-2 rounded-lg font-medium ${
                            activeTab === 'events' 
                                ? 'bg-indigo-600 text-white' 
                                : 'bg-white text-slate-700 border border-slate-300'
                        }`}
                    >
                        <FiCalendar className="w-4 h-4 mr-2" />
                        Events
                    </button>
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`px-4 py-2 rounded-lg font-medium ${
                            activeTab === 'users' 
                                ? 'bg-indigo-600 text-white' 
                                : 'bg-white text-slate-700 border border-slate-300'
                        }`}
                    >
                        <FiUsers className="w-4 h-4 mr-2" />
                        Users
                    </button>
                </div>

                {/* Current User Info */}
                <div className="mb-6 p-4 bg-white rounded-lg border border-slate-200">
                    <h2 className="text-xl font-semibold text-slate-900 mb-2">Current User</h2>
                    {user ? (
                        <div className="space-y-2">
                            <p><strong>Name:</strong> {user.name}</p>
                            <p><strong>Email:</strong> {user.email}</p>
                            <p><strong>Role:</strong> {user.role}</p>
                            <p><strong>Department:</strong> {user.department || 'N/A'}</p>
                            <p><strong>Year:</strong> {user.year || 'N/A'}</p>
                        </div>
                    ) : (
                        <p className="text-slate-500">No user logged in</p>
                    )}
                </div>

                {/* Data Display */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Events Tab */}
                    {activeTab === 'events' && (
                        <div className="bg-white rounded-lg border border-slate-200 p-4">
                            <h3 className="text-lg font-semibold text-slate-900 mb-4">
                                <FiCalendar className="inline w-5 h-5 mr-2" />
                                Events Data ({events.length})
                            </h3>
                            
                            {loading ? (
                                <div className="text-center py-8">
                                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-200 border-t-indigo-600"></div>
                                    <p className="text-slate-500 mt-2">Loading events...</p>
                                </div>
                            ) : (
                                <div className="space-y-2 max-h-96 overflow-y-auto">
                                    {events.map((event, index) => (
                                        <div key={event._id} className="p-3 bg-slate-50 rounded border border-slate-200">
                                            <h4 className="font-semibold text-slate-900">{event.title}</h4>
                                            <p className="text-sm text-slate-600 mb-2">{event.description}</p>
                                            <div className="text-xs text-slate-500 space-y-1">
                                                <p><strong>Date:</strong> {new Date(event.date).toLocaleString()}</p>
                                                <p><strong>Venue:</strong> {event.venue}</p>
                                                <p><strong>Type:</strong> {event.type}</p>
                                                <p><strong>Status:</strong> {event.status}</p>
                                                <p><strong>Capacity:</strong> {event.capacity}</p>
                                                <p><strong>Registered:</strong> {event.registeredUsers?.length || 0}</p>
                                                <p><strong>Created By:</strong> {event.createdBy}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Users Tab */}
                    {activeTab === 'users' && (
                        <div className="bg-white rounded-lg border border-slate-200 p-4">
                            <h3 className="text-lg font-semibold text-slate-900 mb-4">
                                <FiUsers className="inline w-5 h-5 mr-2" />
                                Users Data ({users.length})
                            </h3>
                            
                            {loading ? (
                                <div className="text-center py-8">
                                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-200 border-t-indigo-600"></div>
                                    <p className="text-slate-500 mt-2">Loading users...</p>
                                </div>
                            ) : (
                                <div className="space-y-2 max-h-96 overflow-y-auto">
                                    {users.map((user, index) => (
                                        <div key={user._id} className="p-3 bg-slate-50 rounded border border-slate-200">
                                            <h4 className="font-semibold text-slate-900">{user.name}</h4>
                                            <div className="text-xs text-slate-500 space-y-1">
                                                <p><strong>Email:</strong> {user.email}</p>
                                                <p><strong>Role:</strong> {user.role}</p>
                                                <p><strong>Department:</strong> {user.department || 'N/A'}</p>
                                                <p><strong>Year:</strong> {user.year || 'N/A'}</p>
                                                <p><strong>Registration:</strong> {new Date(user.createdAt).toLocaleString()}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 mt-6">
                    <button
                        onClick={() => window.open('http://localhost:5173', '_blank')}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700"
                    >
                        <FiEye className="w-4 h-4 mr-2" />
                        Open Application
                    </button>
                    <button
                        onClick={() => { 
                            if (activeTab === 'events') fetchEvents();
                            if (activeTab === 'users') fetchUsers();
                        }}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700"
                    >
                        <FiActivity className="w-4 h-4 mr-2" />
                        Refresh Data
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DataViewer;
