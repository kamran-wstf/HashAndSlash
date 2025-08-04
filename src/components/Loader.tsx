import React from 'react';

const Loader: React.FC = () => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
    <span className="ml-4 text-xl font-semibold text-blue-700">Loading...</span>
  </div>
);

export default Loader;
