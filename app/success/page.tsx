'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function SuccessPage() {
  
  useEffect(() => {
    // Fire the Reddit Purchase event when this page loads
    if (typeof window !== 'undefined' && (window as any).rdt) {
      (window as any).rdt('track', 'Purchase');
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-6">
      <h1 className="text-4xl font-bold mb-4">Welcome to AESDR!</h1>
      <p className="text-xl mb-8">Your purchase was successful. We are thrilled to have you.</p>
      
      <Link 
        href="/dashboard" 
        className="px-6 py-3 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition"
      >
        Go to Your Dashboard
      </Link>
    </div>
  );
}