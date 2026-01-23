'use client'

import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const [activeAccordion, setActiveAccordion] = useState<number | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted:', formData);
    alert('Thank you for your message! We will get back to you soon.');
  };

  const toggleAccordion = (index: number) => {
    setActiveAccordion(activeAccordion === index ? null : index);
  };

  const faqs = [
    {
      question: "What areas do you service?",
      answer: "We proudly serve the entire metropolitan area and surrounding suburbs. Contact us with your address to confirm if you are within our service range."
    },
    {
      question: "Do you offer emergency services?",
      answer: "Yes, we offer 24/7 emergency garage door repair services. If your door is stuck, off-track, or won't close, give us a call for immediate assistance."
    },
    {
      question: "How much does a typical repair cost?",
      answer: "Costs can vary depending on the nature of the repair. We provide a free, no-obligation quote before any work begins, so you'll know the exact price upfront."
    },
    {
      question: "What types of payment do you accept?",
      answer: "We accept all major credit cards, checks, and cash for your convenience. Payment is due upon completion of the service."
    }
  ];

  return (
    <div className="min-h-screen bg-cloudy-white">
      <Header />
      <main className="py-16 lg:py-24">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            {/* Contact Form */}
            <div className="space-y-8">
              <div>
                <h2 className="text-4xl lg:text-5xl font-bold text-charcoal-blue mb-4">Get In Touch</h2>
                <p className="text-lg text-dark-charcoal">
                  We're here to help with all your garage door needs. Fill out the form, and we'll get back to you as soon as possible.
                </p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-dark-charcoal" htmlFor="name">
                    Name
                  </label>
                  <div className="mt-1">
                    <input
                      className="block w-full rounded-md border-light-gray shadow-sm focus:border-golden-yellow focus-ring-golden-yellow sm:text-sm bg-white p-3 border"
                      id="name"
                      name="name"
                      placeholder="John Doe"
                      required
                      type="text"
                      value={formData.name}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-charcoal" htmlFor="email">
                    Email
                  </label>
                  <div className="mt-1">
                    <input
                      className="block w-full rounded-md border-light-gray shadow-sm focus:border-golden-yellow focus-ring-golden-yellow sm:text-sm bg-white p-3 border"
                      id="email"
                      name="email"
                      placeholder="you@example.com"
                      required
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-charcoal" htmlFor="phone">
                    Phone Number
                  </label>
                  <div className="mt-1">
                    <input
                      className="block w-full rounded-md border-light-gray shadow-sm focus:border-golden-yellow focus-ring-golden-yellow sm:text-sm bg-white p-3 border"
                      id="phone"
                      name="phone"
                      placeholder="(555) 123-4567"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-charcoal" htmlFor="message">
                    Message
                  </label>
                  <div className="mt-1">
                    <textarea
                      className="block w-full rounded-md border-light-gray shadow-sm focus:border-golden-yellow focus-ring-golden-yellow sm:text-sm bg-white p-3 border"
                      id="message"
                      name="message"
                      placeholder="How can we help you today?"
                      required
                      rows={4}
                      value={formData.message}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div>
                  <button
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-bold text-charcoal-blue bg-golden-yellow hover-bg-golden-yellow-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus-ring-golden-yellow transition-colors duration-300"
                    type="submit"
                  >
                    Submit
                  </button>
                </div>
              </form>
            </div>

            {/* Contact Info & FAQ */}
            <div className="space-y-8 lg:mt-0">
              {/* Contact Information */}
              <div className="bg-white p-8 rounded-lg shadow-md">
                <h3 className="text-2xl font-bold text-charcoal-blue mb-6">Contact Information</h3>
                <div className="space-y-4 text-dark-charcoal">
                  <p className="flex items-center">
                    <svg className="h-5 w-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                    </svg>
                    <span>(555) 123-4567</span>
                  </p>
                  <p className="flex items-center">
                    <svg className="h-5 w-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                    </svg>
                    <span>support@mobilegaragedoor.com</span>
                  </p>
                  <p className="flex items-center">
                    <svg className="h-5 w-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                    </svg>
                    <span>Monday - Friday, 8 AM - 6 PM</span>
                  </p>
                  <p className="flex items-start">
                    <svg className="h-5 w-5 mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                      <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                    </svg>
                    <span>We are a mobile service and come to you!</span>
                  </p>
                </div>
              </div>

              {/* FAQ Section */}
              <div className="bg-white p-8 rounded-lg shadow-md">
                <h3 className="text-2xl font-bold text-charcoal-blue mb-6">Frequently Asked Questions</h3>
                <div className="space-y-4">
                  {faqs.map((faq, index) => (
                    <div key={index} className="border-b border-light-gray">
                      <button
                        className={`accordion-button w-full flex justify-between items-center py-4 text-left text-dark-charcoal font-semibold ${activeAccordion === index ? 'active' : ''}`}
                        onClick={() => toggleAccordion(index)}
                      >
                        <span>{faq.question}</span>
                        <span className={`accordion-icon text-golden-yellow transform transition-transform duration-300 ${activeAccordion === index ? 'rotate-45' : ''}`}>
                          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 4v16m8-8H4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                          </svg>
                        </span>
                      </button>
                      <div 
                        className={`accordion-content ${activeAccordion === index ? 'max-h-96' : 'max-h-0'}`}
                        style={{ maxHeight: activeAccordion === index ? '200px' : '0' }}
                      >
                        <p className="pb-4 text-dark-charcoal">{faq.answer}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
