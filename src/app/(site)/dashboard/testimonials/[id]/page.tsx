import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTestimonialById, updateTestimonial } from '../actions';
import TestimonialForm from '@/features/admin/testimonials/TestimonialForm';

export default async function EditTestimonialPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const testimonial = await getTestimonialById(id);

  if (!testimonial) {
    notFound();
  }

  const updateAction = updateTestimonial.bind(null, id);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
            <Link href="/dashboard/testimonials" className="text-[#7f8c8d] hover:text-[#f1c40f] text-sm font-bold uppercase tracking-widest transition-colors">
            Testimonials
            </Link>
            <span className="text-[#ffffff20]">/</span>
            <span className="text-[#f1c40f] text-sm font-bold uppercase tracking-widest">
            Edit
            </span>
        </div>
        <h1 className="text-4xl font-black text-white">Edit Testimonial</h1>
      </div>

      <TestimonialForm 
        action={updateAction} 
        initialData={testimonial}
        buttonLabel="Save Changes" 
      />
    </div>
  );
}
