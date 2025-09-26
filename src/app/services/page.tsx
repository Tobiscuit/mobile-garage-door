import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function ServicesPage() {
  const services = [
    {
      icon: (
        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
        </svg>
      ),
      title: "Garage Door Repair",
      description: "From broken springs to faulty openers, our technicians can diagnose and fix any issue, ensuring your door is safe and functional.",
      features: [
        "Spring & Cable Replacement",
        "Opener & Sensor Repair",
        "Track & Roller Alignment"
      ],
      testimonial: "They fixed my garage door the same day I called. Fast, professional, and affordable. Highly recommend!",
      author: "Mark T."
    },
    {
      icon: (
        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
        </svg>
      ),
      title: "Garage Door Installation",
      description: "Enhance your home's curb appeal and security with a brand new, professionally installed garage door.",
      features: [
        "Wide Selection of Styles",
        "New Door & Opener Installation",
        "Custom Design Consultations"
      ],
      testimonial: "The new door looks amazing! The installation was seamless and the team was incredibly professional.",
      author: "Sarah M."
    },
    {
      icon: (
        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
        </svg>
      ),
      title: "Garage Door Maintenance",
      description: "Extend the life of your garage door and prevent unexpected breakdowns with our regular maintenance plans.",
      features: [
        "Comprehensive Safety Checks",
        "Lubrication of Moving Parts",
        "Balance & Tension Adjustments"
      ],
      testimonial: "Their annual check-up service gives me peace of mind. A small price for knowing my door is safe.",
      author: "David L."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-cloudy-white">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="text-center py-16 md:py-24 px-6 bg-white">
          <div className="container mx-auto">
            <h1 className="text-4xl md:text-5xl font-extrabold text-charcoal-blue leading-tight">Expert Garage Door Services</h1>
            <p className="mt-4 text-lg md:text-xl text-steel-gray max-w-3xl mx-auto">
              Your one-stop solution for reliable garage door repair, professional installation, and preventative maintenance. We come to you!
            </p>
          </div>
        </section>

        {/* Services Section */}
        <section className="py-20 md:py-28" id="services">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {services.map((service, index) => (
                <div key={index} className="bg-white p-8 rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl flex flex-col items-center text-center">
                  <div className="flex items-center justify-center h-16 w-16 rounded-full bg-golden-yellow text-white mb-6">
                    {service.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-charcoal-blue mb-4">{service.title}</h3>
                  <p className="text-steel-gray mb-6">{service.description}</p>
                  <ul className="space-y-3 text-left w-full">
                    {service.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <span className="text-golden-yellow mr-3 mt-1">✓</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <blockquote className="mt-8 border-l-4 border-golden-yellow pl-4 italic text-steel-gray text-left w-full">
                    "{service.testimonial}" - {service.author}
                  </blockquote>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="bg-cloudy-white py-16 md:py-24">
          <div className="container mx-auto text-center px-6">
            <h2 className="text-3xl md:text-4xl font-bold text-charcoal-blue mb-4">Ready for a Free Estimate?</h2>
            <p className="text-lg text-steel-gray mb-8 max-w-2xl mx-auto">
              We provide transparent pricing and detailed estimates. Contact us today to discuss your garage door needs with one of our friendly experts.
            </p>
            <a 
              className="bg-golden-yellow text-charcoal-blue font-bold py-3 px-8 rounded-lg transition-transform transform hover:scale-105 hover:bg-[#d4ac0d] inline-block text-lg" 
              href="/contact"
            >
              Contact Us Now
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
