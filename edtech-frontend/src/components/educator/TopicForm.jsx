import { useState } from 'react';
import { useParams } from 'react-router-dom';

export default function TopicForm({ data, onChange, onSubmit, error, loading }) {
  const { moduleId } = useParams();
  const [resources, setResources] = useState([]);
  const [newResource, setNewResource] = useState({
    type: 'VIDEO',
    url: '',
    title: '',
    duration: ''
  });

  const resourceTypes = [
    { value: 'VIDEO', label: 'Video' },
    { value: 'PDF', label: 'PDF' },
    { value: 'AUDIO', label: 'Audio' },
    { value: 'LINK', label: 'External Link' }
  ];

  const handleResourceAdd = () => {
    if (newResource.url && newResource.title) {
      setResources([...resources, newResource]);
      setNewResource({
        type: 'VIDEO',
        url: '',
        title: '',
        duration: ''
      });
    }
  };

  const handleResourceRemove = (index) => {
    setResources(resources.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...data,
      moduleId: moduleId || data.moduleId,
      resources
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
          <label className="block text-sm font-medium text-gray-700">Order*</label>
          <input
            type="number"
            value={data.order}
            onChange={(e) => onChange({...data, order: parseInt(e.target.value) || 0})}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
            required
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Content*</label>
          <textarea
            rows={6}
            value={data.content}
            onChange={(e) => onChange({...data, content: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
            required
          />
        </div>

        <div className="border-t pt-4">
          <h3 className="text-lg font-medium mb-4">Resources</h3>
          
          <div className="space-y-4 mb-4">
            {resources.map((resource, index) => (
              <div key={index} className="p-3 border rounded-md flex justify-between items-center">
                <div>
                  <span className="font-medium">{resource.title}</span> ({resource.type})
                  <div className="text-sm text-gray-500">{resource.url}</div>
                </div>
                <button
                  type="button"
                  onClick={() => handleResourceRemove(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Type*</label>
              <select
                value={newResource.type}
                onChange={(e) => setNewResource({...newResource, type: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
              >
                {resourceTypes.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">URL*</label>
              <input
                type="url"
                value={newResource.url}
                onChange={(e) => setNewResource({...newResource, url: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                placeholder="https://example.com/resource"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Title*</label>
              <input
                type="text"
                value={newResource.title}
                onChange={(e) => setNewResource({...newResource, title: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
              />
            </div>
          </div>

          <div className="mt-2">
            <label className="block text-sm font-medium text-gray-700">Duration (minutes)</label>
            <input
              type="number"
              value={newResource.duration}
              onChange={(e) => setNewResource({...newResource, duration: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
              min="0"
              placeholder="Optional"
            />
          </div>

          <button
            type="button"
            onClick={handleResourceAdd}
            className="mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm"
            disabled={!newResource.url || !newResource.title}
          >
            Add Resource
          </button>
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
          {loading ? 'Saving...' : 'Save Topic'}
        </button>
      </div>
    </form>
  );
}