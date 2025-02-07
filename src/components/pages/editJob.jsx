import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/authContext';
import { firestore } from '../../firebase/firebase';

const EditJob = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { currentUser } = useAuth();

  // Form state
  const [companyName, setCompanyName] = useState('');
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState('');
  const [dateApplied, setDateApplied] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (currentUser) {
        try {
          const appDocRef = doc(firestore, 'userApplicationData', currentUser.uid, 'applications', id);
          const docSnap = await getDoc(appDocRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            setCompanyName(data.companyName || '');
            setUrl(data.url || '');
            setStatus(data.status || '');
            setDateApplied(data.dateApplied?.toDate().toISOString().slice(0, 16) || '');
          } else {
            setError('Job application not found.');
          }
        } catch (error) {
          console.error('Error fetching job data:', error);
          setError('Failed to fetch job data.');
        }
      }
    };
    fetchData();
  }, [id, currentUser]);

  // Validate form before submission
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
  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    if (!validateForm()) return;

    setLoading(true);
    try {
      const appDocRef = doc(firestore, 'userApplicationData', currentUser.uid, 'applications', id);
      await updateDoc(appDocRef, {
        companyName: companyName.trim(),
        url: url.trim(),
        status: status.trim(),
        dateApplied: Timestamp.fromDate(new Date(dateApplied))
      });
      navigate('/');
    } catch (error) {
      console.error('Error updating job:', error);
      setError('Failed to update job application. Please try again.');
    }
    setLoading(false);
  };

  if (!currentUser) {
    return <Navigate to='/login' replace={true} />;
  }

  return (
    <div className='max-w-md mx-auto pt-14'>
      <h1 className='text-2xl font-bold mb-6'>Edit Job Application</h1>
      {error && <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4'>{error}</div>}
      <form onSubmit={handleSave} className='bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4'>
        <div className='mb-4'>
          <label className='block text-gray-700 text-sm font-bold mb-2'>Company Name</label>
          <input type='text' value={companyName} onChange={(e) => setCompanyName(e.target.value)} className='shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline' required />
        </div>

        <div className='mb-4'>
          <label className='block text-gray-700 text-sm font-bold mb-2'>Job Posting URL</label>
          <input type='url' value={url} onChange={(e) => setUrl(e.target.value)} className='shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline' required />
        </div>

        <div className='mb-4'>
          <label className='block text-gray-700 text-sm font-bold mb-2'>Date Applied</label>
          <input type='datetime-local' value={dateApplied} onChange={(e) => setDateApplied(e.target.value)} className='shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline' required />
        </div>

        <div className='mb-4'>
          <label className='block text-gray-700 text-sm font-bold mb-2'>Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className='shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline' required>
            <option value='' disabled>Select status</option>
            <option value='Pending'>Pending</option>
            <option value='Interview Scheduled'>Interview Scheduled</option>
            <option value='Offer Received'>Offer Received</option>
            <option value='Rejected'>Rejected</option>
          </select>
        </div>

        <div className='flex items-center justify-between'>
          <button type='submit' disabled={loading} className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50'>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
          <button type='button' onClick={() => navigate('/')} className='bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline'>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditJob;
