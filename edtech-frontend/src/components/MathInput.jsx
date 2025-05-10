// Enhanced MathInput.jsx
import { useState, useRef, useEffect } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

const MathInput = ({ 
  initialValue = '', 
  onSave, 
  problemType,
  showWorkings = true 
}) => {
  const [input, setInput] = useState(initialValue);
  const [workings, setWorkings] = useState([]);
  const [currentStep, setCurrentStep] = useState('');
  const [preview, setPreview] = useState(false);
  const previewRef = useRef(null);
  const workingsRef = useRef(null);

  // Add this new function
  const addWorkingStep = () => {
    if (currentStep.trim()) {
      setWorkings([...workings, currentStep]);
      setCurrentStep('');
    }
  };

  // Modified render function
  useEffect(() => {
    if (preview && previewRef.current) {
      try {
        let content = input;
        if (showWorkings && workings.length > 0) {
          content += `\\newline\\textbf{Workings:}\\newline${workings.join('\\newline')}`;
        }
        
        katex.render(content, previewRef.current, {
          displayMode: problemType === 'equation',
          throwOnError: false,
          macros: {
            "\\newline": "\\\\"
          }
        });
      } catch (error) {
        previewRef.current.innerHTML = 
          `<span class="text-red-500">Invalid equation: ${error.message}</span>`;
      }
    }
  }, [input, preview, problemType, workings, showWorkings]);

  const handleSubmit = () => {
    if (input.trim()) {
      onSave({
        finalAnswer: input,
        workings: showWorkings ? workings : null
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Main answer input */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Your Answer
        </label>
        <textarea
          className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-500"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            problemType === 'equation' 
              ? 'Enter your final answer (e.g., x = 5)' 
              : 'Enter your answer in LaTeX'
          }
          rows={3}
        />
      </div>

      {/* Workings area */}
      {showWorkings && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Show Your Work
          </label>
          <div className="space-y-2">
            {workings.map((step, index) => (
              <div key={index} className="flex items-start">
                <div className="flex-1 p-2 bg-gray-50 rounded">
                  <div 
                    dangerouslySetInnerHTML={{
                      __html: katex.renderToString(step, {
                        throwOnError: false,
                        displayMode: false
                      })
                    }} 
                  />
                </div>
                <button
                  onClick={() => setWorkings(workings.filter((_, i) => i !== index))}
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={currentStep}
              onChange={(e) => setCurrentStep(e.target.value)}
              placeholder="Add a step (e.g., 2x + 3 = 7)"
              className="flex-1 p-2 border rounded"
            />
            <button
              onClick={addWorkingStep}
              className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300"
              disabled={!currentStep.trim()}
            >
              Add Step
            </button>
          </div>
        </div>
      )}

      {/* Preview and submit */}
      {preview && (
        <div 
          ref={previewRef}
          className="p-3 border rounded bg-gray-50 min-h-[60px]" 
        />
      )}
      <div className="flex gap-3">
        <button
          onClick={() => setPreview(!preview)}
          className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
        >
          {preview ? 'Hide Preview' : 'Show Preview'}
        </button>
        <button
          onClick={handleSubmit}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          disabled={!input.trim()}
        >
          Submit Answer
        </button>
      </div>
    </div>
  );
};