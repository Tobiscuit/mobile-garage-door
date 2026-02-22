'use client';

import React, { useState } from 'react';
import { useForm } from '@payloadcms/ui';
import { generatePostContent } from '@/actions/ai';
import { AIPostResponse } from '@/lib/ai-contract';

export const AIWriter: React.FC<any> = () => {
  const { dispatchFields } = useForm();
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!prompt) return;
    
    setIsLoading(true);
    setError('');

    try {
      console.log('Generating content for Payload Admin...');
      const result = await generatePostContent(prompt) as AIPostResponse;
      console.log('AI Result:', result);

      // Update Form Fields
      if (result.title) {
        dispatchFields({ type: 'UPDATE', path: 'title', value: result.title });
        // Also auto-generate slug from title
        const slug = result.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
        dispatchFields({ type: 'UPDATE', path: 'slug', value: slug });
      }
      if (result.excerpt) {
        dispatchFields({ type: 'UPDATE', path: 'excerpt', value: result.excerpt });
      }
      if (result.category) {
        dispatchFields({ type: 'UPDATE', path: 'category', value: result.category });
      }
      if (result.content) {
        dispatchFields({ type: 'UPDATE', path: 'content', value: result.content });
      }
      if (result.keywords && Array.isArray(result.keywords)) {
         dispatchFields({ 
             type: 'UPDATE', 
             path: 'keywords', 
             value: result.keywords.map((k: string) => ({ keyword: k })) 
         });
      }

      setIsOpen(false);
      setPrompt('');
    } catch (e: any) {
      console.error('AI Generation Error:', e);
      setError(e.message || 'Failed to generate content');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="ai-writer-component" style={{ marginBottom: '20px' }}>
      {!isOpen ? (
        <button 
          type="button"
          onClick={() => setIsOpen(true)}
          className="btn btn--style-primary btn--icon-style-without-border btn--size-small"
          style={{ 
            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
            border: 'none',
            color: 'white',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          <span style={{ fontSize: '1.2em' }}>✨</span> AI Magic Writer
        </button>
      ) : (
        <div style={{ 
          background: 'var(--theme-elevation-100)', 
          padding: '20px', 
          borderRadius: '8px',
          border: '1px solid var(--theme-elevation-200)'
        }}>
          <h4 style={{ margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>✨</span> Generate Blog Post
          </h4>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9em' }}>
              What should this post be about?
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., Top 5 signs your garage door spring is broken..."
              style={{
                width: '100%',
                minHeight: '80px',
                padding: '10px',
                borderRadius: '4px',
                border: '1px solid var(--theme-elevation-200)',
                background: 'var(--theme-input-bg)',
                color: 'var(--theme-text)',
                fontFamily: 'inherit'
              }}
            />
          </div>

          {error && (
            <div style={{ color: '#ef4444', marginBottom: '10px', fontSize: '0.9em' }}>
              Error: {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
              style={{
                background: 'transparent',
                border: '1px solid var(--theme-elevation-400)',
                color: 'var(--theme-text)',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isLoading || !prompt.trim()}
              style={{
                background: isLoading ? '#ccc' : 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                border: 'none',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontWeight: 'bold'
              }}
            >
              {isLoading ? 'Generating...' : 'Generate Content'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
