import React, { useEffect, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/authContext';
import { collection, getDocs, doc } from 'firebase/firestore';
import { firestore } from '../../firebase/firebase';
import { Briefcase, ExternalLink } from 'lucide-react';

const Home = () => {
    const { currentUser, userLoggedIn } = useAuth();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    // Function to determine hover color based on application date
    const getHoverColor = (dateApplied) => {
        const appliedDate = new Date(dateApplied);
        const currentDate = new Date();
        const daysDifference = Math.floor((currentDate - appliedDate) / (1000 * 60 * 60 * 24));

        if (daysDifference >= 14) {
            return 'hover:bg-red-100 border-red-100';
        } else if (daysDifference >= 7) {
            return 'hover:bg-orange-100 border-orange-100';
        } else if (daysDifference >= 0) {
            return 'hover:bg-green-100 border-green-100';
        }
        return 'hover:bg-gray-50 border-gray-100';
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

    if (currentUser == null){
        return <Navigate to="/login" replace={true} />;
    }
    else{
        return (
            <div className="w-full min-h-screen p-6 bg-gray-50">
                <div className="max-w-6xl mx-auto text-gray-600 space-y-5 p-6 bg-white shadow-xl border rounded-xl">
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
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto">
                            {applications.map(app => {
                                const hoverColorClass = getHoverColor(app.dateApplied);
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
                                        <button>
                                            <Link to={`/editJob/${app.id}`}>Edit Job</Link>
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center space-y-3">
                            <p className="text-gray-600">No job applications found.</p>
                            <Link 
                                to="/addJob" 
                                className="w-full inline-block px-4 py-2 text-white font-medium rounded-lg bg-indigo-600 hover:bg-indigo-700 transition duration-300"
                            >
                                Add Your First Application
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        );
    }
};

export default Home;
