'use client';
import { useState } from 'react';

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: 'What is Vyapar TaxOne, and how does it help CAs?',
      answer: (
        <p>
          Vyapar TaxOne is an all-in-one practice management platform designed specifically for{' '}
          <span>Chartered Accountants and Tax Professionals</span> in India. It helps CAs by automating data entry,
          GST filing, and client communication processes. Vyapar TaxOne bridges the gap between government systems, tax
          professionals, and MSMEs to streamline accounting workflows and increase practice efficiency.
        </p>
      ),
    },
    {
      question: 'Is Vyapar TaxOne compatible with different accounting software?',
      answer: (
        <p>
          Yes, <span>Vyapar TaxOne (AI Accounting Automation platform)</span> is compatible with popular accounting
          softwares like Vyapar app and Tally. Our platform offers seamless{' '}
          <span>integration with Tally for data synchronization</span> and other accounting systems commonly used by
          accounting professionals. This allows you to work within your existing ecosystem while gaining the benefits of
          automation.
        </p>
      ),
    },
    {
      question: 'How secure is my client data with Vyapar TaxOne?',
      answer: (
        <p>
          Vyapar TaxOne implements bank-grade security measures including{' '}
          <span>end-to-end encryption, secure cloud storage, and compliance with data protection regulations</span>. We
          never share your data with third parties, and all information is stored in secure servers with regular backups
          to ensure complete data integrity and confidentiality.
        </p>
      ),
    },
    {
      question: 'What is the pricing structure for Vyapar TaxOne?',
      answer: (
        <p>
          Vyapar TaxOne offers subscription-based pricing plans designed to suit different practice sizes. Our annual
          plan is ₹30,000 per year, with special offers available various times a year. For detailed pricing information
          and current promotions, please contact our sales team or visit our pricing page.
        </p>
      ),
    },
    {
      question: 'Can multiple team members collaborate on Vyapar TaxOne?',
      answer: (
        <p>
          Yes, Vyapar TaxOne supports team collaboration with{' '}
          <span>multi-user access and role-based permissions</span>. Team members can work simultaneously on the
          platform, share client information, assign tasks, and track progress-all in real-time.
        </p>
      ),
    },
    {
      question: 'How long does it take to set up Vyapar TaxOne for my practice?',
      answer: (
        <p>
          Most CAs are able to set up and start using Vyapar TaxOne within <span>24-48 hours</span>. Our onboarding team
          provides personalized support including{' '}
          <span>account setup, data migration assistance, and training sessions</span> to ensure a smooth transition.
        </p>
      ),
    },
  ];

  return (
    <section className="s_faq" id="faq">
      <div className="s_container">
        <div className="s_section-title text-center">
          <h3>Frequently Asked Questions</h3>
          <p></p>
        </div>

        <div className="max-w-4xl mx-auto mt-8">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                className={`s_faq-accordion ${isOpen ? 's_active' : ''}`}
                key={idx}
                style={{
                  borderBottom: '1px solid #E3E5EB',
                  padding: '20px 0',
                }}
              >
                <div
                  className="s_faq-accordion-title s_cp cursor-pointer select-none"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                >
                  <div className="s_flex s_align-center s_content-between">
                    <h6 className="text-lg font-semibold text-gray-900 pr-4">{faq.question}</h6>
                    <svg
                      width="15"
                      height="8"
                      viewBox="0 0 15 8"
                      fill="#5E6782"
                      xmlns="http://www.w3.org/2000/svg"
                      className={`s_down-arrow transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                    >
                      <path
                        fill="#5E6782"
                        className="s_fill"
                        d="M7.504 8a2.272 2.272 0 0 1-1.608-.666L.463 1.9a.629.629 0 0 1 0-.884.629.629 0 0 1 .883 0l5.433 5.434c.4.4 1.05.4 1.45 0l5.434-5.434a.629.629 0 0 1 .883 0 .629.629 0 0 1 0 .884L9.113 7.334A2.272 2.272 0 0 1 7.504 8Z"
                      />
                    </svg>
                  </div>
                </div>
                {isOpen && (
                  <div className="s_faq-accordion-content pt-4 text-gray-600 leading-relaxed text-sm animate-fade-in">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

