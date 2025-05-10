import { useState } from 'react';
import { useParams } from 'react-router-dom';

export default function AssessmentForm({ data, onChange, onSubmit, error, loading }) {
  const { moduleId, topicId } = useParams();
  const [isProctored, setIsProctored] = useState(data.is_proctored || false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...data,
      moduleId: moduleId || data.moduleId,
      topicId: topicId || data.topicId,
      is_proctored: isProctored
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Title*</label>
          <input
            type="text"
            value={data.title}
            onChange={(e) => onChange({...data, title: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description*</label>
          <textarea
            rows={3}
            value={data.description}
            onChange={(e) => onChange({...data, description: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Passing Score*</label>
            <input
              type="number"
              value={data.passing_score}
              onChange={(e) => onChange({...data, passing_score: parseInt(e.target.value) || 70})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
              min="0"
              max="100"
              required
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_proctored"
              checked={isProctored}
              onChange={(e) => setIsProctored(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="is_proctored" className="ml-2 block text-sm text-gray-700">
              Proctored Assessment
            </label>
          </div>
        </div>
      </div>

      {error && (
        <div className="text-red-500 text-sm mt-2">{error.details?.message || 'Error submitting form'}</div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Assessment'}
        </button>
      </div>
    </form>
  );
}