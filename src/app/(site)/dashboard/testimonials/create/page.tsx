import React from 'react';
import Link from 'next/link';
import TestimonialForm from '@/features/admin/testimonials/TestimonialForm';
import { createTestimonial } from '../actions';

export default function CreateTestimonialPage() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
            <Link href="/dashboard/testimonials" className="text-[#7f8c8d] hover:text-[#f1c40f] text-sm font-bold uppercase tracking-widest transition-colors">
            Testimonials
            </Link>
            <span className="text-[#ffffff20]">/</span>
            <span className="text-[#f1c40f] text-sm font-bold uppercase tracking-widest">
            Create
            </span>
        </div>
        <h1 className="text-4xl font-black text-white">Add New Testimonial</h1>
      </div>

      <TestimonialForm 
        action={createTestimonial} 
        buttonLabel="Create Testimonial" 
      />
    </div>
  );
}
