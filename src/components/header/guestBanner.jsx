import React from "react";
import { useAuth } from '../../contexts/authContext';

const GuestBanner = () => {
  const { isAnonymous } = useAuth();

  if (!isAnonymous) return null;

  return (
    <div className="w-full bg-yellow-500 text-white text-center py-2 z-10 relative top-12">
      ⚠️ You are a guest. Data will not be saved once you log out.
    </div>
  );
};

export default GuestBanner;
