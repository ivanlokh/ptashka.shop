'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams?.get('session_id');
  const [paymentStatus, setPaymentStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sessionId) {
      verifyPayment();
    } else {
      setPaymentStatus('error');
      setError('No session ID provided');
    }
  }, [sessionId]);

  const verifyPayment = async () => {
    try {
      const response = await fetch('/api/payment/verify-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ sessionId }),
      });

      const data = await response.json();

      if (data.success && data.paymentStatus === 'succeeded') {
        setPaymentStatus('success');
      } else {
        setPaymentStatus('error');
        setError('Payment verification failed');
      }
    } catch (error) {
      setPaymentStatus('error');
      setError('Failed to verify payment');
    }
  };

  if (paymentStatus === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  if (paymentStatus === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="text-red-600 text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-red-800 mb-2">Payment Failed</h1>
            <p className="text-red-600 mb-6">{error}</p>
            <div className="space-y-3">
              <Link
                href="/"
                className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
              >
                Return to Home
              </Link>
              <Link
                href="/cart"
                className="inline-block bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700 ml-3"
              >
                Try Again
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md mx-auto text-center">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="text-green-600 text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-green-800 mb-2">Payment Successful!</h1>
          <p className="text-green-600 mb-6">
            Thank you for your purchase. You will receive a confirmation email shortly.
          </p>
          <div className="space-y-3">
            <Link
              href="/"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
            >
              Continue Shopping
            </Link>
            <Link
              href="/orders"
              className="inline-block bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700 ml-3"
            >
              View Orders
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
