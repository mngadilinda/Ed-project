// src/components/MathInput.jsx
import { useState } from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';

const MathInput = ({ initialValue, onSave, problemType }) => {
  const [input, setInput] = useState(initialValue || '');
  const [preview, setPreview] = useState(false);

  return (
    <div className="space-y-2">
      {preview ? (
        <div className="p-2 border rounded bg-gray-50">
          <InlineMath math={input} />
        </div>
      ) : (
        <textarea
          className="w-full p-2 border rounded"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={problemType === 'equation' ? 'e.g., x^2 + 3x = 5' : 'Enter your answer'}
        />
      )}
      
      <div className="flex space-x-2">
        <button
          onClick={() => setPreview(!preview)}
          className="px-3 py-1 bg-gray-200 rounded"
        >
          {preview ? 'Edit' : 'Preview'}
        </button>
        <button
          onClick={() => onSave(input)}
          className="px-3 py-1 bg-blue-600 text-white rounded"
        >
          Submit Answer
        </button>
      </div>
    </div>
  );
};

export default MathInput;