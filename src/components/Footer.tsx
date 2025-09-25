import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-charcoal-blue text-cloudy-white">
      <div className="container mx-auto py-8 px-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="text-xl font-bold">Mobile Garage Solutions</h3>
            <p className="text-steel-gray">Your reliable partner for garage door services.</p>
          </div>
          <div className="flex gap-6 mb-4 md:mb-0">
            <a className="hover:text-golden-yellow transition-colors" href="#contact">Contact Us</a>
            <a className="hover:text-golden-yellow transition-colors" href="#privacy">Privacy Policy</a>
            <a className="hover:text-golden-yellow transition-colors" href="#terms">Terms of Service</a>
          </div>
          <div>
            <p className="text-steel-gray text-sm">© 2024 Mobile Garage Solutions. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
