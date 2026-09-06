'use client';
import { useState } from 'react';

interface FreeTrialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FreeTrialModal({ isOpen, onClose }: FreeTrialModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [firmName, setFirmName] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 2500);
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center transition"
          aria-label="Close"
        >
          ✕
        </button>

        <div className="p-8">
          <div className="text-center mb-6">
            <img
              src="https://static.taxone.vyapar.com/images/taxone/logo/s_logo.svg"
              alt="Vyapar TaxOne"
              className="h-8 mx-auto mb-3"
            />
            <h3 className="text-2xl font-bold text-gray-900">Start Your Free Trial</h3>
            <p className="text-gray-500 text-sm mt-1">
              Automate data entry, GST filing, and client documents with AI
            </p>
          </div>

          {submitted ? (
            <div className="py-8 text-center">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">Thank you!</h4>
              <p className="text-gray-600 text-sm">
                Our product expert will connect with you within 30 minutes to set up your practice workspace.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="CA Rahul Mehta"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#ED1A3B]/20 focus:border-[#ED1A3B]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                  Phone Number
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 border border-r-0 border-gray-200 rounded-l-xl bg-gray-50 text-gray-500 text-sm">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    placeholder="98765 43210"
                    pattern="[0-9]{10}"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-r-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#ED1A3B]/20 focus:border-[#ED1A3B]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="rahul@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#ED1A3B]/20 focus:border-[#ED1A3B]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                  Firm / Practice Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Mehta & Associates"
                  value={firmName}
                  onChange={(e) => setFirmName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#ED1A3B]/20 focus:border-[#ED1A3B]"
                />
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3 px-6 text-white font-semibold rounded-xl bg-gradient-to-r from-[#ED1A3B] to-[#ff4757] hover:opacity-95 shadow-md shadow-red-500/20 transition cursor-pointer"
              >
                Claim Free 14-Day Trial
              </button>

              <p className="text-center text-xs text-gray-400 mt-2">
                No credit card required · Instant access · Free CA onboarding
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

