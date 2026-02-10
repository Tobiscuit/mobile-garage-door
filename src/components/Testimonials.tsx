import React from 'react';

const Testimonials: React.FC = () => {
  const testimonials = [
    {
      quote: "Mobil Garage Solutions provided exceptional service. They were prompt, professional, and fixed my garage door quickly and efficiently. Highly recommend!",
      name: "Ethan Carter",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCVSo9B1J9QvKQTnNhUS17VHh6zNIB5abDr8e8n0OPHUIDiiveOej0kDbq87pwVivtkBfN4Vsmiy214Nw5Lq1_8rlh0PaIjI2UmB25PSkm8UyGZqIG9TdpFVq1m8XrGVwASEm74bGwQW6Av3IEm97xO9cCcvton_uY9G4NdtsqkZnjWgXlukuMwB-2zbeuLqDawF1KRNQyloczBNaxxIJEkGk3EgwIPs1F-0JzVJmxUqel9Q87_PgqoIgNcafDwdk3A7iUABq_--sUE"
    },
    {
      quote: "I had a new garage door installed by Mobil Garage Solutions, and the experience was seamless. The team was knowledgeable, and the installation was flawless. Very satisfied with their work.",
      name: "Sophia Bennett",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBF-4USAj9l2Z7yJDQq3XLeL-avApKgHZVdvx-fW21mlP_vLWVo1vCqLm1ewZh34dfSrBpHJI370AE3ptUuPmY74JKiYxvkxwqtspdIOs9XaEso5MJJkY7Khnr1KDcKk3a4TjvzjZgy6LXdXECGsdIgWWP1MMylVax5nkEmZE231IReyfRN1byLIwVYeQSqxlS1fMomqzI9b6oRbilgeEYcDyztXPW4UKPIkmIaNdb176KUTGIh9x17T7YY-4f1CdJcWX4clrrxt9gQ"
    }
  ];

  const StarIcon = () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"></path>
    </svg>
  );

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-12 text-charcoal-blue">What Our Customers Say</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-cloudy-white p-6 rounded-lg shadow-md border-l-4 border-golden-yellow">
              <p className="text-steel-gray italic mb-4">
                "{testimonial.quote}"
              </p>
              <div className="flex items-center">
                <img 
                  alt={testimonial.name} 
                  className="w-12 h-12 rounded-full mr-4" 
                  src={testimonial.image}
                />
                <div>
                  <p className="font-bold text-charcoal-blue">{testimonial.name}</p>
                  <div className="flex text-golden-yellow">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon key={i} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
