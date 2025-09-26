'use client'

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { portfolioItems, getProjectNavigation } from '@/data/projects';

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.id as string;

  const project = portfolioItems.find(item => item.id === projectId);

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col bg-cloudy-white text-charcoal-blue">
        <Header />
        <main className="flex-grow container mx-auto px-6 py-12 md:py-20 text-center">
          <h1 className="text-4xl font-bold mb-4">Project Not Found</h1>
          <p className="text-lg">The project you are looking for does not exist.</p>
          <Link href="/portfolio" className="mt-6 inline-block bg-golden-yellow text-charcoal-blue font-bold py-3 px-6 rounded-lg hover:bg-golden-yellow/90 transition-colors">
            Back to Projects
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const { previousProject, nextProject } = getProjectNavigation(projectId);

  return (
    <div className="flex flex-col min-h-screen bg-cloudy-white text-charcoal-blue font-display">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Link className="inline-flex items-center gap-2 text-charcoal-blue hover:text-golden-yellow font-bold transition-colors" href="/portfolio">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path clipRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" fillRule="evenodd"></path>
              </svg>
              <span>Back to Projects</span>
            </Link>
          </div>
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-charcoal-blue leading-tight">{project.title}</h1>
            <p className="mt-4 text-lg text-steel-gray">{project.subtitle}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white/50 p-8 rounded-xl shadow-lg">
              <h2 className="text-2xl font-bold text-golden-yellow mb-4">The Challenge</h2>
              <p className="text-charcoal-blue leading-relaxed">
                {project.challenge}
              </p>
            </div>
            <div className="bg-white/50 p-8 rounded-xl shadow-lg">
              <h2 className="text-2xl font-bold text-golden-yellow mb-4">Our Solution</h2>
              <p className="text-charcoal-blue leading-relaxed">
                {project.solution}
              </p>
            </div>
          </div>
          <div className="mb-12">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="md:col-span-3 rounded-xl overflow-hidden shadow-2xl">
                <img alt="After: New Garage Door" className="w-full h-full object-cover" src={project.imageAfter} />
              </div>
              <div className="md:col-span-2 rounded-xl overflow-hidden shadow-2xl">
                <img alt="Before: Old Garage Door" className="w-full h-full object-cover" src={project.imageBefore} />
              </div>
            </div>
            <div className="flex justify-center mt-4 gap-4">
              <span className="bg-golden-yellow/20 text-golden-yellow font-bold text-sm px-3 py-1 rounded-full">After</span>
              <span className="bg-gray-200 text-charcoal-blue font-bold text-sm px-3 py-1 rounded-full">Before</span>
            </div>
          </div>
          <div className="bg-white/50 p-8 rounded-xl shadow-lg mb-12">
            <h2 className="text-2xl font-bold text-golden-yellow mb-6 text-center">Key Benefits for Builders & Homeowners</h2>
            <ul className="space-y-4 text-lg text-charcoal-blue">
              {project.benefits.map((benefit, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-golden-yellow mr-3 mt-1">✓</span>
                  <span><strong>{benefit.split(':')[0]}:</strong> {benefit.split(':')[1]}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-charcoal-blue">Ready to Elevate Your Next Project?</h3>
            <p className="mt-2 mb-6 text-lg text-steel-gray">Let's discuss how our garage door solutions can benefit your builds.</p>
            <Link className="bg-golden-yellow text-charcoal-blue font-bold py-4 px-8 rounded-lg hover:bg-golden-yellow/90 transition-colors text-lg inline-block" href="/contact">
              Inquire About Similar Projects
            </Link>
          </div>
          <div className="flex justify-between items-center border-t border-gray-200 pt-8">
            {previousProject ? (
              <Link className="flex items-center gap-2 text-charcoal-blue hover:text-golden-yellow transition-colors" href={`/portfolio/${previousProject.id}`}>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path clipRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" fillRule="evenodd" transform="rotate(180 10 10)"></path>
                </svg>
                <span className="font-medium">Previous Project</span>
              </Link>
            ) : <div />}
            {nextProject ? (
              <Link className="flex items-center gap-2 text-charcoal-blue hover:text-golden-yellow transition-colors" href={`/portfolio/${nextProject.id}`}>
                <span className="font-medium">Next Project</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path clipRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" fillRule="evenodd"></path>
                </svg>
              </Link>
            ) : <div />}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
