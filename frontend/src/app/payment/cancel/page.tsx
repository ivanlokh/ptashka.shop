'use client';

import Link from 'next/link';

export default function PaymentCancelPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md mx-auto text-center">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="text-yellow-600 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-yellow-800 mb-2">Payment Cancelled</h1>
          <p className="text-yellow-600 mb-6">
            Your payment was cancelled. No charges have been made to your account.
          </p>
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
              Back to Cart
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
