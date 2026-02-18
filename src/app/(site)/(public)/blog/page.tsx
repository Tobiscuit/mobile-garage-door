import React from 'react';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import Link from 'next/link';
import Image from 'next/image';
import SmartLink from '@/shared/ui/SmartLink';

export const dynamic = 'force-dynamic';

export default async function BlogIndex() {
    const payload = await getPayload({ config: configPromise });

    const posts = await payload.find({
        collection: 'posts',
        where: {
            status: {
                equals: 'published',
            },
        },
        sort: '-publishedAt',
    });

    return (
        <div className="bg-cloudy-white min-h-screen pb-24 font-work-sans">
            {/* Hero Section - Keeps the Dark Industrial Look for Contrast */}
            <div className="relative bg-charcoal-blue border-b border-white/10 overflow-hidden">
                <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>
                <div className="container mx-auto px-4 py-24 relative z-10">
                    <div className="max-w-3xl">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="h-1 w-12 bg-golden-yellow"></div>
                            <span className="text-golden-yellow font-mono uppercase tracking-widest text-sm font-bold">
                                Knowledge Base & Updates
                            </span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter mb-8 leading-none">
                            Garage <span className="text-transparent bg-clip-text bg-gradient-to-r from-golden-yellow to-yellow-600">Intel</span>
                        </h1>
                        <p className="text-xl text-gray-400 max-w-2xl leading-relaxed">
                            Expert advice, maintenance tips, and industry news from the pros who know garage doors inside and out.
                        </p>
                    </div>
                </div>
                
                {/* Decorative Elements */}
                <div className="absolute bottom-0 right-0 w-1/3 h-full bg-gradient-to-l from-charcoal-blue to-transparent pointer-events-none"></div>
            </div>

            {/* Content Grid */}
            <div className="container mx-auto px-4 py-16">
                {posts.docs.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-gray-200 shadow-xl">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path></svg>
                        </div>
                        <h3 className="text-2xl font-bold text-charcoal-blue mb-2">No Articles Yet</h3>
                        <p className="text-gray-500">Check back soon for the latest updates and guides.</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {posts.docs.map((post) => (
                            <SmartLink 
                                key={post.id} 
                                href={`/blog/${post.slug}`}
                                className="group bg-white border border-gray-100 hover:border-golden-yellow/50 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl flex flex-col h-full"
                            >
                                {/* Image Container */}
                                <div className="aspect-video relative bg-charcoal-blue overflow-hidden">
                                    {post.featuredImage && typeof post.featuredImage !== 'string' && typeof post.featuredImage !== 'number' && post.featuredImage.url ? (
                                        <Image
                                            src={post.featuredImage.url}
                                            alt={post.featuredImage.alt || post.title}
                                            fill
                                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center bg-charcoal-blue">
                                            <svg className="w-12 h-12 text-white/10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal-blue/80 via-transparent to-transparent opacity-60"></div>
                                    
                                    {/* Category Badge */}
                                    <div className="absolute top-4 left-4">
                                        <span className="bg-golden-yellow text-charcoal-blue text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-sm shadow-md">
                                            {post.category?.replace(/-/g, ' ')}
                                        </span>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-8 flex flex-col flex-grow">
                                    <div className="flex items-center gap-3 mb-4 text-xs font-mono text-gray-400">
                                        <span>{new Date(post.publishedAt || post.createdAt).toLocaleDateString()}</span>
                                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                        <span>5 MIN READ</span>
                                    </div>

                                    <h2 className="text-2xl font-bold text-charcoal-blue mb-4 leading-tight group-hover:text-golden-yellow transition-colors">
                                        {post.title}
                                    </h2>
                                    
                                    <p className="text-gray-600 text-sm leading-relaxed mb-6 flex-grow line-clamp-3">
                                        {post.excerpt}
                                    </p>

                                    <div className="flex items-center text-golden-yellow font-bold text-sm uppercase tracking-wider group-hover:translate-x-2 transition-transform duration-300">
                                        Read Article
                                        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                                    </div>
                                </div>
                            </SmartLink>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
