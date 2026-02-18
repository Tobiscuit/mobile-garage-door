import React from 'react';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import SmartLink from '@/shared/ui/SmartLink';

export const dynamic = 'force-dynamic';

// Basic Rich Text Renderer for Lexical
const RichTextRenderer = ({ content }: { content: any }) => {
    if (!content || !content.root || !content.root.children) return null;

    const renderNode = (node: any, index: number) => {
        switch (node.type) {
            case 'paragraph':
                return (
                    <p key={index} className="mb-6 text-gray-600 leading-relaxed text-lg">
                        {node.children?.map((child: any, i: number) => renderChild(child, i))}
                    </p>
                );
            case 'heading':
                const headingTag = node.tag as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
                const Tag = headingTag;
                const sizeClasses: Record<string, string> = {
                    h1: 'text-4xl font-black text-charcoal-blue mt-12 mb-6',
                    h2: 'text-3xl font-bold text-charcoal-blue mt-10 mb-5 border-l-4 border-golden-yellow pl-4',
                    h3: 'text-2xl font-bold text-charcoal-blue mt-8 mb-4',
                    h4: 'text-xl font-bold text-charcoal-blue mt-6 mb-3',
                    h5: 'text-lg font-bold text-charcoal-blue mt-4 mb-2',
                    h6: 'text-base font-bold text-charcoal-blue mt-4 mb-2',
                };
                return (
                    <Tag key={index} className={sizeClasses[headingTag] || sizeClasses.h2}>
                        {node.children?.map((child: any, i: number) => renderChild(child, i))}
                    </Tag>
                );
            case 'list':
                const ListTag = node.listType === 'number' ? 'ol' : 'ul';
                return (
                    <ListTag key={index} className={`mb-6 pl-6 ${node.listType === 'number' ? 'list-decimal' : 'list-disc'} text-gray-600 space-y-2 marker:text-golden-yellow`}>
                        {node.children?.map((child: any, i: number) => (
                            <li key={i} className="pl-2">
                                {child.children?.map((c: any, j: number) => renderChild(c, j))}
                            </li>
                        ))}
                    </ListTag>
                );
            case 'quote':
                return (
                    <blockquote key={index} className="border-l-4 border-golden-yellow bg-white p-6 rounded-r-lg italic text-xl text-charcoal-blue my-8 shadow-md">
                        {node.children?.map((child: any, i: number) => renderChild(child, i))}
                    </blockquote>
                );
             case 'link':
                return (
                    <a key={index} href={node.fields?.url || '#'} target={node.fields?.newTab ? '_blank' : undefined} className="text-golden-yellow hover:underline font-bold transition-colors">
                        {node.children?.map((child: any, i: number) => renderChild(child, i))}
                    </a>
                );
            default:
                // Fallback for unhandled types, just try to render children
                 if (node.children) {
                    return <div key={index}>{node.children.map((child: any, i: number) => renderChild(child, i))}</div>;
                 }
                return null;
        }
    };

    const renderChild = (node: any, index: number) => {
        if (node.type === 'text') {
            let text = <span key={index}>{node.text}</span>;
            if (node.format & 1) text = <strong key={index} className="text-charcoal-blue font-bold">{node.text}</strong>;
            if (node.format & 2) text = <em key={index} className="italic">{node.text}</em>;
            if (node.format & 8) text = <u key={index} className="underline decoration-golden-yellow decoration-2 underline-offset-4">{node.text}</u>;
            if (node.format & 16) text = <code key={index} className="bg-gray-100 px-1 py-0.5 rounded font-mono text-sm text-charcoal-blue border border-gray-200">{node.text}</code>;
            return text;
        }
        if (node.type === 'link') {
             return (
                    <a key={index} href={node.fields?.url || '#'} target={node.fields?.newTab ? '_blank' : undefined} className="text-golden-yellow hover:underline font-bold transition-colors">
                        {node.children?.map((child: any, i: number) => renderChild(child, i))}
                    </a>
                );
        }
        return renderNode(node, index);
    };

    return (
        <div className="rich-text-content">
            {content.root.children.map((node: any, index: number) => renderNode(node, index))}
        </div>
    );
};

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const payload = await getPayload({ config: configPromise });

    const posts = await payload.find({
        collection: 'posts',
        where: {
            slug: {
                equals: slug,
            },
        },
    });

    if (!posts.docs.length) {
        notFound();
    }

    const post = posts.docs[0];

    return (
        <div className="bg-cloudy-white min-h-screen pb-24 font-work-sans">
            {/* Hero Section */}
            <div className="relative h-[60vh] min-h-[400px] w-full overflow-hidden">
                {post.featuredImage && typeof post.featuredImage !== 'string' && typeof post.featuredImage !== 'number' && post.featuredImage.url ? (
                    <Image
                        src={post.featuredImage.url}
                        alt={post.featuredImage.alt || post.title}
                        fill
                        className="object-cover"
                        priority
                    />
                ) : (
                     <div className="absolute inset-0 bg-charcoal-blue"></div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal-blue via-charcoal-blue/60 to-transparent"></div>
                
                <div className="absolute bottom-0 left-0 w-full p-8 md:p-16">
                    <div className="container mx-auto max-w-5xl">
                        <SmartLink href="/blog" className="inline-flex items-center text-golden-yellow hover:text-white mb-6 font-bold uppercase tracking-wider text-sm transition-colors group">
                            <svg className="w-4 h-4 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                            Back to Intel
                        </SmartLink>
                        
                        <div className="flex flex-wrap items-center gap-4 mb-4">
                            <span className="bg-golden-yellow text-charcoal-blue px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-sm">
                                {post.category?.replace(/-/g, ' ')}
                            </span>
                            <span className="text-gray-300 text-sm font-mono border-l border-white/20 pl-4">
                                {new Date(post.publishedAt || post.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                            </span>
                        </div>
                        
                        <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-6 max-w-4xl">
                            {post.title}
                        </h1>

                         <p className="text-xl text-gray-200 max-w-3xl leading-relaxed font-light border-l-4 border-golden-yellow/50 pl-6">
                            {post.excerpt}
                        </p>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="container mx-auto px-4 py-16">
                <div className="flex flex-col lg:flex-row gap-12 max-w-6xl mx-auto">
                    {/* Main Content */}
                    <article className="flex-1 max-w-3xl">
                        <RichTextRenderer content={post.content} />
                        
                        {/* Author Bio / Footer */}
                        <div className="mt-16 pt-8 border-t border-gray-200 flex items-center gap-4">
                            <div className="w-12 h-12 bg-charcoal-blue rounded-full flex items-center justify-center text-golden-yellow font-bold text-xl">
                                MG
                            </div>
                            <div>
                                <p className="text-charcoal-blue font-bold">Mobil Garage Team</p>
                                <p className="text-gray-500 text-sm">Expert Technicians & Door Specialists</p>
                            </div>
                        </div>
                    </article>

                    {/* Sidebar */}
                    <aside className="lg:w-80 space-y-8">
                        {/* CTA Card */}
                        <div className="bg-charcoal-blue border border-white/10 rounded-2xl p-8 sticky top-32 shadow-2xl">
                            <div className="w-16 h-16 bg-golden-yellow/10 rounded-full flex items-center justify-center mb-6 mx-auto">
                                <svg className="w-8 h-8 text-golden-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                            </div>
                            <h3 className="text-xl font-bold text-white text-center mb-2">Need Expert Help?</h3>
                            <p className="text-gray-400 text-center text-sm mb-6">
                                Don't let a broken door slow you down. Our techs are ready to deploy.
                            </p>
                            <Link href="/book" className="block w-full bg-golden-yellow hover:bg-yellow-400 text-charcoal-blue font-bold text-center py-3 rounded-lg transition-colors uppercase tracking-wider text-sm">
                                Book Service Now
                            </Link>
                            <div className="mt-4 text-center">
                                <a href="tel:8324191293" className="text-gray-400 hover:text-white text-sm font-mono transition-colors">
                                    or call 832-419-1293
                                </a>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}
