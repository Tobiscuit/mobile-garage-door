import React from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function PortfolioPage() {
  const portfolioItems = [
    {
      id: "suburban-residence-new-garage-door-installation",
      title: "Suburban Residence - New Garage Door",
      image: "garage-pattern-modern",
      description: "Complete garage door replacement with modern design, enhanced security features, and improved energy efficiency for suburban homes."
    },
    {
      id: "modern-aluminum-door-installation",
      title: "Modern Aluminum Door",
      image: "garage-pattern-modern",
      description: "Sleek aluminum construction with horizontal ribbing patterns, offering durability and contemporary aesthetic appeal."
    },
    {
      id: "classic-wooden-door-replacement",
      title: "Classic Wooden Door",
      image: "garage-pattern-wooden",
      description: "Traditional wooden construction featuring horizontal planks, natural wood finish, and classic architectural charm."
    },
    {
      id: "custom-glass-panel-door-installation",
      title: "Custom Glass Panel Door",
      image: "garage-pattern-glass",
      description: "Modern glass panel design with sleek black frames, maximizing natural light and creating striking visual impact."
    },
    {
      id: "sectional-steel-door-upgrade",
      title: "Sectional Steel Door",
      image: "garage-pattern-steel",
      description: "Heavy-duty steel construction featuring excellent insulation properties and superior security for commercial applications."
    },
    {
      id: "carriage-house-door-installation",
      title: "Carriage House Door",
      image: "garage-pattern-carriage",
      description: "Traditional carriage house aesthetic combined with modern overhead functionality and decorative hardware elements."
    }
  ];

  return (
    <div className="min-h-screen bg-cloudy-white">
      <Header />
      <main className="py-16 lg:py-24">
        <div className="container mx-auto px-6">
          {/* Page Title */}
          <div className="text-center mb-16">
            <h1 className="text-4xl lg:text-5xl font-bold text-charcoal-blue mb-4">Our Portfolio</h1>
            <p className="text-lg text-dark-charcoal max-w-2xl mx-auto">
              Explore our gallery of garage door installations and designs. Each project is tailored to enhance your home's curb appeal and functionality.
            </p>
          </div>

          {/* Portfolio Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {portfolioItems.map((item) => (
              <Link key={item.id} href={`/portfolio/${item.id}`} className="group">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 h-full flex flex-col">
                  <div className="aspect-w-4 aspect-h-3">
                    <div className={`w-full h-64 ${item.image} group-hover:scale-105 transition-transform duration-300`}></div>
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-xl font-bold text-charcoal-blue mb-3 group-hover:text-golden-yellow transition-colors" style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>{item.title}</h3>
                    <p className="text-dark-charcoal text-sm flex-grow" style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>{item.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Call to Action */}
          <div className="text-center mt-16">
            <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-charcoal-blue mb-4">Ready to Transform Your Garage?</h2>
              <p className="text-dark-charcoal mb-6">
                Let us help you choose the perfect garage door for your home. Get a free consultation and estimate today.
              </p>
              <a
                href="/contact"
                className="btn-primary inline-block px-8 py-3 text-lg font-bold"
              >
                Get Free Quote
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
