import React, { useEffect, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/authContext';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { firestore } from '../../firebase/firebase';
import { Briefcase, ExternalLink, Trash2 } from 'lucide-react';

const Home = () => {
    const { currentUser, userLoggedIn } = useAuth();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    const getHoverColor = (status, dateApplied) => {
        // Check for status first
        if (status === 'Rejected') {
            return 'hover:bg-red-100 border-2 border-red-500';
        } else if (status === 'Offer Received') {
            return 'hover:bg-green-100 border-2 border-green-500';
        } else if (status === 'Interview Scheduled') {
            return 'hover:bg-orange-100 border-2 border-orange-500';
        }
    
        // If no status match, fall back to time-based color
        const appliedDate = new Date(dateApplied);
        const currentDate = new Date();
        const daysDifference = Math.floor((currentDate - appliedDate) / (1000 * 60 * 60 * 24));
    
        if (daysDifference >= 14) {
            return 'hover:bg-red-100 border-2 border-red-500';
        } else if (daysDifference >= 7) {
            return 'hover:bg-orange-100 border-2 border-orange-500';
        } else if (daysDifference >= 0) {
            return 'hover:bg-green-100 border-2 border-green-500';
        }
    
        return 'hover:bg-gray-50 border-2 border-gray-300';
    };
    

    useEffect(() => {
        const fetchApplications = async () => {
            if (currentUser) {
                try {
                    const userDocRef = doc(firestore, 'userApplicationData', currentUser.uid);
                    const userAppsRef = collection(userDocRef, 'applications');
                    const snapshot = await getDocs(userAppsRef);

                    const apps = snapshot.docs.map(doc => {
                        const data = doc.data();
                        return {
                            id: doc.id,
                            ...data,
                            dateApplied: data.dateApplied ? data.dateApplied.toDate() : new Date(),
                            formattedDate: data.dateApplied ? data.dateApplied.toDate().toLocaleDateString() : 'N/A'
                        };
                    });

                    apps.sort((a, b) => a.dateApplied - b.dateApplied);

                    setApplications(apps);
                } catch (error) {
                    console.error('Error fetching applications:', error);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchApplications();
    }, [currentUser]);

    const handleDelete = async (appId) => {
        if (window.confirm("Are you sure you want to delete this job?")) {
            try {
                const userDocRef = doc(firestore, 'userApplicationData', currentUser.uid);
                const appDocRef = doc(userDocRef, 'applications', appId);
                await deleteDoc(appDocRef);

                setApplications(prevApps => prevApps.filter(app => app.id !== appId));
            } catch (error) {
                console.error("Error deleting application:", error);
            }
        }
    };

    if (currentUser == null) {
        return <Navigate to="/login" replace={true} />;
    }

    const offerReceivedApplications = applications.filter(app => app.status === 'Offer Received');
    const interviewScheduledApplications = applications.filter(app => app.status === 'Interview Scheduled');
    const rejectedApplications = applications.filter(app => app.status === 'Rejected');
    const otherApplications = applications.filter(app => app.status !== 'Offer Received' && app.status !== 'Interview Scheduled' && app.status !== 'Rejected');

    return (
        // <div className="w-full min-h-screen p-6">
            // <div className="max-w-6xl mx-auto text-gray-600 space-y-5 p-6 bg-white shadow-xl border rounded-xl">
            <div className=" text-gray-600  p-6 rounded-xl">
                <div className="text-center">
                    <div className="mt-2">
                        <h3 className="text-gray-800 text-xl font-semibold sm:text-2xl flex items-center justify-center">
                            <Briefcase className="mr-3 text-indigo-600" size={28} />
                            Your Job Applications
                        </h3>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-600"></div>
                    </div>
                ) : applications.length > 0 ? (
                    <div className="space-y-6">

                        {/* Offer Received Section */}
                        {offerReceivedApplications.length > 0 && (
                            <div>
                                <h3 className="text-lg font-semibold text-green-500">Offer Received</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {offerReceivedApplications.map(app => {
                                        const hoverColorClass = getHoverColor(app.status, app.dateApplied);
                                        return (
                                            <div
                                                key={app.id}
                                                className={`w-full border rounded-lg p-3 ${hoverColorClass} transition duration-300`}
                                            >
                                                <div className="flex justify-between items-center mb-2">
                                                    <h4 className="text-gray-800 font-semibold">{app.companyName}</h4>
                                                    <span className="text-sm text-gray-500">{app.formattedDate}</span>
                                                </div>
                                                <div className="flex items-center text-sm text-gray-600 mb-1">
                                                    <ExternalLink className="mr-2 text-indigo-600" size={16} />
                                                    <a
                                                        href={app.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="hover:underline truncate max-w-[280px]"
                                                    >
                                                        {app.url}
                                                    </a>
                                                </div>
                                                {app.status && (
                                                    <div className="text-sm text-gray-600">
                                                        <span className="font-medium">Status:</span> {app.status}
                                                    </div>
                                                )}
                                                <div className="flex space-x-3 mt-2">
                                                    <Link
                                                        to={`/editJob/${app.id}`}
                                                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
                                                    >
                                                        Edit
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(app.id)}
                                                        className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition flex items-center"
                                                    >
                                                        <Trash2 size={16} className="mr-1" />
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Other Applications Section */}
                        {otherApplications.length > 0 && (
                            <div>
                                <h3 className="text-lg font-semibold text-gray-700">Your Applications</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {otherApplications.map(app => {
                                        const hoverColorClass = getHoverColor(app.status, app.dateApplied);
                                        return (
                                            <div
                                                key={app.id}
                                                className={`w-full border rounded-lg p-3 ${hoverColorClass} transition duration-300`}
                                            >
                                                <div className="flex justify-between items-center mb-2">
                                                    <h4 className="text-gray-800 font-semibold">{app.companyName}</h4>
                                                    <span className="text-sm text-gray-500">{app.formattedDate}</span>
                                                </div>
                                                <div className="flex items-center text-sm text-gray-600 mb-1">
                                                    <ExternalLink className="mr-2 text-indigo-600" size={16} />
                                                    <a
                                                        href={app.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="hover:underline truncate max-w-[280px]"
                                                    >
                                                        {app.url}
                                                    </a>
                                                </div>
                                                {app.status && (
                                                    <div className="text-sm text-gray-600">
                                                        <span className="font-medium">Status:</span> {app.status}
                                                    </div>
                                                )}
                                                <div className="flex space-x-3 mt-2">
                                                    <Link
                                                        to={`/editJob/${app.id}`}
                                                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
                                                    >
                                                        Edit
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(app.id)}
                                                        className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition flex items-center"
                                                    >
                                                        <Trash2 size={16} className="mr-1" />
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Interview Scheduled Section */}
                        {interviewScheduledApplications.length > 0 && (
                            <div>
                                <h3 className="text-lg font-semibold text-yellow-500">Interview Scheduled</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {interviewScheduledApplications.map(app => {
                                        const hoverColorClass = getHoverColor(app.status, app.dateApplied);
                                        return (
                                            <div
                                                key={app.id}
                                                className={`w-full border rounded-lg p-3 ${hoverColorClass} transition duration-300`}
                                            >
                                                <div className="flex justify-between items-center mb-2">
                                                    <h4 className="text-gray-800 font-semibold">{app.companyName}</h4>
                                                    <span className="text-sm text-gray-500">{app.formattedDate}</span>
                                                </div>
                                                <div className="flex items-center text-sm text-gray-600 mb-1">
                                                    <ExternalLink className="mr-2 text-indigo-600" size={16} />
                                                    <a
                                                        href={app.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="hover:underline truncate max-w-[280px]"
                                                    >
                                                        {app.url}
                                                    </a>
                                                </div>
                                                {app.status && (
                                                    <div className="text-sm text-gray-600">
                                                        <span className="font-medium">Status:</span> {app.status}
                                                    </div>
                                                )}
                                                <div className="flex space-x-3 mt-2">
                                                    <Link
                                                        to={`/editJob/${app.id}`}
                                                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
                                                    >
                                                        Edit
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(app.id)}
                                                        className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition flex items-center"
                                                    >
                                                        <Trash2 size={16} className="mr-1" />
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Rejected Applications Section */}
                        {rejectedApplications.length > 0 && (
                            <div>
                                <h3 className="text-lg font-semibold text-red-500">Rejected</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {rejectedApplications.map(app => {
                                        const hoverColorClass = getHoverColor(app.status, app.dateApplied);
                                        return (
                                            <div
                                                key={app.id}
                                                className={`w-full border rounded-lg p-3 ${hoverColorClass} transition duration-300`}
                                            >
                                                <div className="flex justify-between items-center mb-2">
                                                    <h4 className="text-gray-800 font-semibold">{app.companyName}</h4>
                                                    <span className="text-sm text-gray-500">{app.formattedDate}</span>
                                                </div>
                                                <div className="flex items-center text-sm text-gray-600 mb-1">
                                                    <ExternalLink className="mr-2 text-indigo-600" size={16} />
                                                    <a
                                                        href={app.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="hover:underline truncate max-w-[280px]"
                                                    >
                                                        {app.url}
                                                    </a>
                                                </div>
                                                {app.status && (
                                                    <div className="text-sm text-gray-600">
                                                        <span className="font-medium">Status:</span> {app.status}
                                                    </div>
                                                )}
                                                <div className="flex space-x-3 mt-2">
                                                    <Link
                                                        to={`/editJob/${app.id}`}
                                                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
                                                    >
                                                        Edit
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(app.id)}
                                                        className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition flex items-center"
                                                    >
                                                        <Trash2 size={16} className="mr-1" />
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center text-gray-500">
                        No job applications found.
                    </div>
                )}
            </div>
        // </div>
    );
};

export default Home;
