import { useState } from 'react';
import LibreTextChapter from '../components/Testings/TestLibreText';
import MathInput from '../components/MathInput';
import { useParams, useNavigate } from 'react-router-dom';


const CONTENT_OPTIONS = {
  'elementary-algebra': {
    title: 'Elementary Algebra',
    chapters: {
      1: 'Foundations',
      2: 'Solving Linear Equations',
      // ... other chapters
    }
  }
};

export default function LessonPage() {
  const [book, setBook] = useState('elementary-algebra');
  const [chapter, setChapter] = useState(1);

  return (
    <div className="lesson-container max-w-4xl mx-auto p-4">
      <div className="content-controls mb-6 flex gap-4">
        <select
          value={book}
          onChange={(e) => setBook(e.target.value)}
          className="flex-1 p-2 border rounded"
        >
          {Object.entries(CONTENT_OPTIONS).map(([id, config]) => (
            <option key={id} value={id}>{config.title}</option>
          ))}
        </select>
        
        <select
          value={chapter}
          onChange={(e) => setChapter(parseInt(e.target.value))}
          className="flex-1 p-2 border rounded"
        >
          {Object.entries(CONTENT_OPTIONS[book].chapters).map(([num, title]) => (
            <option key={num} value={num}>Ch. {num}: {title}</option>
          ))}
        </select>
      </div>

      <LibreTextChapter bookId={book} chapter={chapter} />

      <div className="practice-section mt-8 p-6 bg-gray-50 rounded-lg">
        <h3 className="text-xl font-bold mb-4">Practice Problem</h3>
        <MathInput 
          problem="Solve for x: 2x + 5 = 11" 
          onSolve={(answer) => console.log('Submitted:', answer)} 
        />
      </div>
    </div>
  );
}