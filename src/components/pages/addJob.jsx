import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/authContext';
import { collection, doc, addDoc, Timestamp } from 'firebase/firestore';
import { firestore } from '../../firebase/firebase';
import { useNavigate } from 'react-router-dom';

const AddJob = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Form state
  const [companyName, setCompanyName] = useState('');
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState('');
  const [dateApplied, setDateApplied] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Validation function
  const validateForm = () => {
    if (!companyName.trim()) {
      setError('Company name is required');
      return false;
    }
    if (!url.trim()) {
      setError('Job URL is required');
      return false;
    }
    if (!dateApplied) {
      setError('Date applied is required');
      return false;
    }
    if (!status) {
      setError('Status is required');
      return false;
    }
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate form
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      
      // Reference to the user's applications collection
      const userDocRef = doc(firestore, 'userApplicationData', currentUser.uid);
      const userAppsRef = collection(userDocRef, 'applications');
      const selectedDate = new Date(dateApplied);

      // Add new application
      await addDoc(userAppsRef, {
        companyName: companyName.trim(),
        url: url.trim(),
        // dateApplied: Timestamp.fromDate(new Date(dateApplied)),
        dateApplied: Timestamp.fromDate(new Date(selectedDate.toISOString())), // Ensures correct time
        createdAt: Timestamp.now(),
        status: status.trim()
      });

      // Reset form and navigate back to home
      setCompanyName('');
      setUrl('');
      setDateApplied('');
      setStatus('');
      navigate('/'); // Redirect to home
    } catch (error) {
      console.error('Error adding application:', error);
      setError('Failed to add job application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (currentUser == null) {
    return <Navigate to='/login' replace={true} />;
  }

  return (
    <div className='max-w-md mx-auto pt-14'>
      <h1 className='text-2xl font-bold mb-6'>Add Job Application</h1>
      
      {error && (
        <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4'>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className='bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4'>
        <div className='mb-4'>
          <label 
            htmlFor='companyName' 
            className='block text-gray-700 text-sm font-bold mb-2'
          >
            Company Name
          </label>
          <input 
            type='text'
            id='companyName'
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder='e.g., Google, Microsoft'
            className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
            required
          />
        </div>

        <div className='mb-4'>
          <label 
            htmlFor='url' 
            className='block text-gray-700 text-sm font-bold mb-2'
          >
            Job Posting URL
          </label>
          <input 
            type='url'
            id='url'
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder='e.g., https://company.com/jobs'
            className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
            required
          />
        </div>

        <div className='mb-6'>
          <label 
            htmlFor='dateApplied' 
            className='block text-gray-700 text-sm font-bold mb-2'
          >
            Date Applied
          </label>
          <input 
            type='datetime-local'
            id='dateApplied'
            value={dateApplied}
            onChange={(e) => setDateApplied(e.target.value)}
            className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
            required
          />
        </div>
        
        <div className='mb-4'>
          <label 
            htmlFor='status' 
            className='block text-gray-700 text-sm font-bold mb-2'
          >
            Status
          </label>
          <select
            id='status'
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className='shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
            required
          >
            <option value='' disabled>
              Select status
            </option>
            <option value='Pending'>Pending</option>
            <option value='Interview Scheduled'>Interview Scheduled</option>
            <option value='Offer Received'>Offer Received</option>
            <option value='Rejected'>Rejected</option>
          </select>
        </div>

        <div className='flex items-center justify-between'>
          <button 
            type='submit' 
            disabled={loading}
            className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50'
          >
            {loading ? 'Adding...' : 'Add Application'}
          </button>
          <button
            type='button'
            onClick={() => navigate('/home')}
            className='bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline'
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddJob;
