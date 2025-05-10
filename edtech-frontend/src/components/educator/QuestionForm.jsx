import { useState, useEffect } from 'react';

const questionTypes = [
  { value: 'MCQ', label: 'Multiple Choice' },
  { value: 'TF', label: 'True/False' },
  { value: 'FIB', label: 'Fill in Blank' },
  { value: 'SA', label: 'Short Answer' }
];

export default function QuestionForm({ data, onChange, onSubmit, error, loading }) {
  const [options, setOptions] = useState(data.options || ['', '']);
  const [newOption, setNewOption] = useState('');

  useEffect(() => {
    // Update options when question type changes
    if (data.question_type === 'TF') {
      setOptions(['True', 'False']);
      onChange({...data, options: ['True', 'False'], correct_answer: 'True'});
    } else if (data.question_type === 'MCQ' && options.length < 2) {
      setOptions(['', '']);
    }
  }, [data.question_type]);

  const handleOptionAdd = () => {
    if (newOption.trim()) {
      const updatedOptions = [...options, newOption.trim()];
      setOptions(updatedOptions);
      onChange({...data, options: updatedOptions});
      setNewOption('');
    }
  };

  const handleOptionRemove = (index) => {
    const updatedOptions = options.filter((_, i) => i !== index);
    setOptions(updatedOptions);
    onChange({...data, options: updatedOptions});
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Question Type*</label>
          <select
            value={data.question_type}
            onChange={(e) => onChange({...data, question_type: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
            required
          >
            <option value="">Select a question type</option>
            {questionTypes.map((type) => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Question Text*</label>
          <textarea
            rows={3}
            value={data.text}
            onChange={(e) => onChange({...data, text: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
            required
          />
        </div>

        {data.question_type === 'MCQ' && (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">Options* (Minimum 2)</label>
            {options.map((option, index) => (
              <div key={index} className="flex items-center">
                <input
                  type="radio"
                  name="correct_option"
                  checked={data.correct_answer === option}
                  onChange={() => onChange({...data, correct_answer: option})}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  required={data.question_type === 'MCQ'}
                />
                <input
                  type="text"
                  value={option}
                  onChange={(e) => {
                    const updatedOptions = [...options];
                    updatedOptions[index] = e.target.value;
                    setOptions(updatedOptions);
                    onChange({...data, options: updatedOptions});
                  }}
                  className="ml-2 flex-1 rounded-md border-gray-300 shadow-sm p-2 border"
                  required
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => handleOptionRemove(index)}
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}

            <div className="flex items-center">
              <input
                type="text"
                value={newOption}
                onChange={(e) => setNewOption(e.target.value)}
                placeholder="Add new option"
                className="flex-1 rounded-md border-gray-300 shadow-sm p-2 border"
              />
              <button
                type="button"
                onClick={handleOptionAdd}
                className="ml-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm"
                disabled={!newOption.trim()}
              >
                Add
              </button>
            </div>
          </div>
        )}

        {(data.question_type === 'FIB' || data.question_type === 'SA' || data.question_type === 'TF') && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Correct Answer*</label>
            {data.question_type === 'TF' ? (
              <select
                value={data.correct_answer}
                onChange={(e) => onChange({...data, correct_answer: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                required
              >
                <option value="True">True</option>
                <option value="False">False</option>
              </select>
            ) : (
              <input
                type="text"
                value={data.correct_answer}
                onChange={(e) => onChange({...data, correct_answer: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                required
              />
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Difficulty (1-5)*</label>
            <select
              value={data.difficulty}
              onChange={(e) => onChange({...data, difficulty: parseInt(e.target.value)})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
              required
            >
              {[1, 2, 3, 4, 5].map((level) => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Concept Tags</label>
            <input
              type="text"
              value={data.concept_tags}
              onChange={(e) => onChange({...data, concept_tags: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
              placeholder="Comma separated tags"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="text-red-500 text-sm mt-2">{error.details?.message || 'Error submitting form'}</div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading || (data.question_type === 'MCQ' && options.length < 2)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Question'}
        </button>
      </div>
    </form>
  );
}