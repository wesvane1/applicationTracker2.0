import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/authContext';
import { doSignOut } from '../../firebase/auth';

const Header = () => {
    const navigate = useNavigate();
    const { userLoggedIn } = useAuth();

    return (
        <nav
            className='flex flex-row gap-x-2 w-full z-20 fixed top-0 left-0 h-12 border-b place-content-center items-center bg-gray-200'
            style={{ '--header-height': '3rem' }} // CSS variable for header height
        >
            <p>Application Tracker App</p>
            {userLoggedIn ? (
                <>
                    <button
                        onClick={() => {
                            doSignOut().then(() => {
                                navigate('/login');
                            });
                        }}
                        className='text-sm text-blue-600 underline'
                    >
                        Logout
                    </button>
                    <button
                        onClick={() => {
                            navigate('/addJob');
                        }}
                        className='text-sm text-blue-600 underline'
                    >
                        Add New Job
                    </button>
                </>
            ) : (
                <>
                    <Link className='text-sm text-blue-600 underline' to={'/login'}>
                        Login
                    </Link>
                    <Link className='text-sm text-blue-600 underline' to={'/register'}>
                        Register New Account
                    </Link>
                </>
            )}
        </nav>
    );
};

export default Header;
