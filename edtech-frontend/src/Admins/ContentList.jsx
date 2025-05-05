// src/components/admin/ContentList.jsx
import { useState, useEffect } from 'react'
import {
  PencilIcon,
  TrashIcon,
  EyeIcon,
  DocumentTextIcon,
  PhotoIcon,
  VideoCameraIcon,
  AcademicCapIcon,
  MagnifyingGlassIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'

export default function ContentList() {
  const [content, setContent] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterSubject, setFilterSubject] = useState('all')

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await api.get('/content-uploads/')
        if (!response.ok) {
          throw new Error('Failed to fetch content')
        }
        const data = await response.json()
        setContent(data)
      } catch (err) {
        setError(err.message || 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchContent()
  }, [])

  const filteredContent = content.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         item.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSubject = filterSubject === 'all' || item.subject === filterSubject
    return matchesSearch && matchesSubject
  })

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this content?')) return
    
    try {
      const response = await fetch(`/api/educator/content/${id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete content')
      }
      
      setContent(content.filter(item => item.id !== id))
    } catch (err) {
      setError(err.message || 'Failed to delete content')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <XCircleIcon className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading content</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div className="w-full sm:max-w-xs">
          <label htmlFor="search" className="sr-only">Search</label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="search"
              placeholder="Search content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full rounded-md border-gray-300 pl-10 pr-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
        </div>
        
        <div className="mt-3 sm:mt-0">
          <label htmlFor="subject-filter" className="sr-only">Filter by subject</label>
          <select
            id="subject-filter"
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="all">All Subjects</option>
            <option value="math">Mathematics</option>
            <option value="science">Science</option>
            <option value="physics">Physics</option>
            <option value="chemistry">Chemistry</option>
            <option value="biology">Biology</option>
          </select>
        </div>
      </div>

      {/* Content List */}
      {filteredContent.length === 0 ? (
        <div className="text-center py-12">
          <AcademicCapIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No content found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {content.length === 0 ? 'You haven\'t uploaded any content yet.' : 'No content matches your filters.'}
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {filteredContent.map((item) => (
            <li key={item.id} className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-medium text-indigo-600 truncate">
                        {item.title}
                      </h3>
                      <span className="inline-flex items-center rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-800">
                        Grade {item.gradeLevel}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                      {item.description}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {item.files.map((file) => (
                        <span key={file.id} className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                          {file.type.startsWith('image/') ? (
                            <PhotoIcon className="h-3 w-3 mr-1" />
                          ) : file.type.startsWith('video/') ? (
                            <VideoCameraIcon className="h-3 w-3 mr-1" />
                          ) : (
                            <DocumentTextIcon className="h-3 w-3 mr-1" />
                          )}
                          {file.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="ml-4 flex-shrink-0 flex space-x-2">
                  <a
                    href={`/content/${item.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    title="Preview"
                  >
                    <EyeIcon className="h-5 w-5" />
                  </a>
                  <button
                    onClick={() => {/* Implement edit functionality */}}
                    className="rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    title="Edit"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="rounded-full bg-white p-1 text-red-400 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    title="Delete"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}