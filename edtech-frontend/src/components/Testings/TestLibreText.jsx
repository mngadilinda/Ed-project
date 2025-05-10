import { useState, useEffect } from 'react';
import MathDisplay from '../MathDisplay';

export default function LibreTextChapter({ bookId, chapter }) {
  const [state, setState] = useState({
    loading: true,
    error: null,
    content: null,
    exercises: []
  });

  useEffect(() => {
    const loadContent = async () => {
      try {
        const response = await fetch(`/libretext-content?book=${bookId}&chapter=${chapter}`);
        if (!response.ok) throw new Error('Failed to load content');
        
        const data = await response.json();
        setState({
          loading: false,
          error: null,
          content: data.content,
          exercises: data.exercises
        });
      } catch (err) {
        setState({
          loading: false,
          error: err.message,
          content: null,
          exercises: []
        });
      }
    };
    
    loadContent();
  }, [bookId, chapter]);

  if (state.loading) return <div className="p-4 text-center">Loading...</div>;
  if (state.error) return <div className="p-4 text-red-600">Error: {state.error}</div>;

  return (
    <div className="libretext-chapter">
      <h2 className="text-2xl font-bold mb-4">{state.title}</h2>
      <div 
        className="prose max-w-none" 
        dangerouslySetInnerHTML={{ __html: state.content }} 
      />
      {/* Exercise rendering would go here */}
    </div>
  );
}