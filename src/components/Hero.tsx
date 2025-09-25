import React from 'react';

const Hero: React.FC = () => {
  return (
    <section 
      className="relative bg-cover bg-center h-[60vh] text-white flex items-center justify-center text-center" 
      style={{
        backgroundImage: `linear-gradient(rgba(44, 62, 80, 0.7), rgba(44, 62, 80, 0.7)), url("https://lh3.googleusercontent.com/aida-public/AB6AXuDeGUXi5LLhWVK5HM83idFlilqRf3fUuXcHtIoPlVooIfg9D0v8bh_wuDAkwILXipeT9TdStSdlr7QIDzpIBZ-yfczYflZmCM1oYZIvPuWX3QI-8ZUi7oW9Jr9Zcq7VxcJrVZtJGYb5UvWuiTHBDLE5gAjHMYn2b2XppO6ydfkABesVLgKiZM6e4gSigzS-FYzJ_21Ay1TIgzVvxSHkUODxzturPNrihxnewbaz_X8EvrE3Wo1ph8uMF9A1IAggR0DnVR-JDYYfkLjp")`
      }}
    >
      <div className="container mx-auto px-6">
        <h2 className="text-5xl font-extrabold mb-4 drop-shadow-lg">Your Trusted Partner for Garage Doors</h2>
        <p className="text-xl mb-8 drop-shadow-md">Reliability and Professionalism, Guaranteed.</p>
        <a className="btn-primary text-lg px-8 py-3" href="#services">Schedule a Service</a>
      </div>
    </section>
  );
};

export default Hero;
