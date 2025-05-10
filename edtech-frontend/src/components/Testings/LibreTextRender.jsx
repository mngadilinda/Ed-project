// src/components/Test/LibreTextRenderer.jsx
import { useState, useEffect } from 'react';
import MarkdownContent from '../Learn/MarkdownContent';
import { MathDisplay } from '../MathDisplay';

const LibreTextRenderer = ({ topicUrl }) => {
  const [content, setContent] = useState({ title: '', html: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLibreTextContent = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // We'll use a proxy to avoid CORS issues
        const proxyUrl = `/api/libretext-proxy?url=${encodeURIComponent(topicUrl)}`;
        const response = await fetch(proxyUrl);
        
        if (!response.ok) {
          throw new Error('Failed to fetch LibreText content');
        }

        const htmlContent = await response.text();
        
        // Extract the main content - this will need adjustment based on actual LibreText structure
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, 'text/html');
        const mainContent = doc.querySelector('.ltx_page_main') || doc.body;
        
        setContent({
          title: doc.title || 'LibreText Content',
          html: mainContent.innerHTML
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (topicUrl) {
      fetchLibreTextContent();
    }
  }, [topicUrl]);

  if (loading) {
    return <div className="text-center py-8">Loading LibreText content...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <p className="text-red-700">Error: {error}</p>
        <p className="mt-2 text-sm">
          Try a different LibreText URL or check the console for details.
        </p>
      </div>
    );
  }

  return (
    <div className="prose max-w-none">
      <h1 className="text-3xl font-bold mb-6">{content.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: content.html }} />
    </div>
  );
};

export default LibreTextRenderer;