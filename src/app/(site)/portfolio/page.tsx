import React from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function PortfolioPage() {
  const projects = [
    {
      id: "commercial-fleet-hq",
      title: "Logistics Hub: High-Speed Door Deployment",
      client: "Regional Distribution Center",
      location: "Industrial Park, Sector 4",
      imageClass: "garage-pattern-steel",
      stats: [
        { label: "Install Time", value: "6 Hours" },
        { label: "Efficiency Gain", value: "+40%" },
        { label: "Cycle Rating", value: "100k" }
      ],
      description: "Replaced failing chain-link gates with high-speed, insulated steel sectional doors. Integrated with facility management software for automated access control.",
      tags: ["Commercial", "Automation", "Security"]
    },
    {
      id: "residential-modern-glass",
      title: "Estate Modernization: Glass & Aluminum",
      client: "Private Residence",
      location: "Highland Estates",
      imageClass: "garage-pattern-glass",
      stats: [
        { label: "Curb Appeal", value: "Max" },
        { label: "R-Value", value: "12.9" },
        { label: "Warranty", value: "Lifetime" }
      ],
      description: "Custom-fabricated aluminum frame with tempered frosted glass. Complete tear-out of 1980s wood doors. Smart opener integration with geofencing.",
      tags: ["Residential", "Design", "Smart Home"]
    },
    {
      id: "carriage-house-retro",
      title: "Historic Preservation: Carriage House",
      client: "Heritage Trust",
      location: "Old Town District",
      imageClass: "garage-pattern-carriage",
      stats: [
        { label: "Style Match", value: "100%" },
        { label: "Noise Reduction", value: "-25dB" },
        { label: "Maintenance", value: "Zero" }
      ],
      description: "Synthetic composite overlay that mimics 100-year-old wood but requires zero staining. Silent belt-drive openers installed to protect fragile structure.",
      tags: ["Restoration", "Custom", "Quiet"]
    },
    {
      id: "emergency-spring-replacement",
      title: "Critical Failure: Torsion Spring Snap",
      client: "Emergency Call",
      location: "Suburban Multi-Car",
      imageClass: "garage-pattern-modern",
      stats: [
        { label: "Response", value: "45 Min" },
        { label: "Fix Time", value: "1 Hour" },
        { label: "Safety Rating", value: "Pass" }
      ],
      description: "Vehicle trapped inside. Rapid response team arrived within the hour. Converted hazardous extension springs to safe, high-cycle torsion system.",
      tags: ["Repair", "Emergency", "Safety"]
    }
  ];

  return (
    <div className="min-h-screen bg-cloudy-white font-work-sans">
      <Header />
      <main className="flex-grow">
        
        {/* HEADER: Minimal Industrial */}
        <section className="bg-charcoal-blue text-white py-24 px-6 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
            <div className="container mx-auto relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-end gap-8">
                    <div>
                        <div className="inline-flex items-center gap-2 border border-white/20 text-gray-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
                            Project Archive
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black leading-tight mb-4">
                            Proven <span className="text-golden-yellow">Results.</span>
                        </h1>
                        <p className="text-xl text-gray-400 max-w-2xl">
                            From emergency fixes to architectural transformations. See how we engineer value for our partners.
                        </p>
                    </div>
                     <div className="bg-white/5 border border-white/10 p-6 rounded-xl backdrop-blur-sm hidden md:block">
                        <div className="text-sm text-gray-400 font-bold uppercase tracking-wider mb-2">Total Installations</div>
                        <div className="text-4xl font-black text-white">1,240+</div>
                     </div>
                </div>
            </div>
        </section>

        {/* PROJECTS GRID */}
        <section className="py-20 px-6">
            <div className="container mx-auto">
                <div className="space-y-24">
                    {projects.map((project, index) => (
                        <div key={index} className="flex flex-col lg:flex-row gap-12 items-center group">
                            
                            {/* IMAGE CARD */}
                            <div className="w-full lg:w-3/5">
                                <Link href={`/portfolio/${project.id}`} className="block relative h-96 w-full rounded-2xl overflow-hidden shadow-2xl transition-transform duration-500 group-hover:scale-[1.01]">
                                    <div className={`absolute inset-0 ${project.imageClass} opacity-90`}></div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal-blue/80 to-transparent"></div>
                                    
                                    <div className="absolute bottom-8 left-8">
                                        <div className="flex gap-2 mb-4">
                                            {project.tags.map((tag, i) => (
                                                <span key={i} className="bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </Link>
                            </div>

                            {/* CONTENT CARD */}
                            <div className="w-full lg:w-2/5">
                                <div className="border-l-2 border-golden-yellow pl-6 mb-6">
                                    <h3 className="text-xs font-bold text-steel-gray uppercase tracking-widest mb-1">{project.client}</h3>
                                    <h2 className="text-3xl font-black text-charcoal-blue leading-tight group-hover:text-golden-yellow transition-colors">{project.title}</h2>
                                    <p className="text-sm text-gray-500 mt-1">{project.location}</p>
                                </div>

                                <p className="text-dark-charcoal text-lg leading-relaxed mb-8">
                                    {project.description}
                                </p>

                                <div className="grid grid-cols-3 gap-4 mb-8">
                                    {project.stats.map((stat, i) => (
                                        <div key={i} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 text-center">
                                            <div className="text-2xl font-black text-charcoal-blue">{stat.value}</div>
                                            <div className="text-xs font-bold text-gray-400 uppercase tracking-tight">{stat.label}</div>
                                        </div>
                                    ))}
                                </div>

                                <Link href={`/contact?project=${project.id}`} className="inline-flex items-center gap-2 font-bold text-charcoal-blue hover:text-golden-yellow transition-colors">
                                    View Production Details
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                                </Link>
                            </div>

                        </div>
                    ))}
                </div>
            </div>
        </section>

        {/* CTA */}
        <section className="bg-golden-yellow py-20">
            <div className="container mx-auto px-6 text-center">
                <h2 className="text-4xl font-black text-charcoal-blue mb-6">Ready to start your Case Study?</h2>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <a href="/contact" className="bg-charcoal-blue text-white font-bold py-4 px-8 rounded-xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all">
                        Schedule Consultation
                    </a>
                </div>
            </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
