import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function PortfolioPage() {
  const portfolioItems = [
    {
      id: 1,
      title: "Modern Aluminum Door",
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
      description: "Sleek aluminum design with horizontal ribbing for a contemporary look."
    },
    {
      id: 2,
      title: "Classic Wooden Door",
      image: "https://images.unsplash.com/photo-1581578731548-c5a0c4c7c0d4?w=400&h=300&fit=crop",
      description: "Traditional wooden construction with horizontal planks and natural finish."
    },
    {
      id: 3,
      title: "Custom Glass Panel Door",
      image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop",
      description: "Modern glass panels with black frames for maximum light and style."
    },
    {
      id: 4,
      title: "Insulated Steel Door",
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
      description: "Durable steel construction with excellent insulation properties."
    },
    {
      id: 5,
      title: "Carriage Style Door",
      image: "https://images.unsplash.com/photo-1581578731548-c5a0c4c7c0d4?w=400&h=300&fit=crop",
      description: "Traditional carriage house design with decorative windows."
    },
    {
      id: 6,
      title: "Contemporary Design Door",
      image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop",
      description: "Modern minimalist design with clean lines and premium materials."
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
              <div key={item.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="aspect-w-4 aspect-h-3">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-64 object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-charcoal-blue mb-2">{item.title}</h3>
                  <p className="text-dark-charcoal text-sm">{item.description}</p>
                </div>
              </div>
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
