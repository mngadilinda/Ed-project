// src/components/admin/ContentUploadForm.jsx
import { useState } from 'react'
import { 
  ArrowUpTrayIcon,
  DocumentTextIcon,
  PhotoIcon,
  VideoCameraIcon,
  XMarkIcon,
  XCircleIcon,
  CheckCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'



export default function ContentUploadForm({ onSuccess }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [subject, setSubject] = useState('math')
  const [gradeLevel, setGradeLevel] = useState('8')
  const [files, setFiles] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const handleFileChange = (e) => {
    const validTypes = ['application/pdf', 'image/*', 'video/*'];
    const selectedFiles = Array.from(e.target.files);
    
    const invalidFiles = selectedFiles.filter(
      file => !validTypes.some(type => file.type.match(type))
    );
  
    if (invalidFiles.length > 0) {
      setError(`Invalid file type: ${invalidFiles.map(f => f.type).join(', ')}`);
      return;
    }
  
    setFiles(selectedFiles);
  }

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('title', title)
      formData.append('description', description)
      formData.append('subject', subject)
      formData.append('gradeLevel', gradeLevel)
      files.forEach(file => formData.append('files', file))

      const response = await api.post('/content-uploads/', {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      if (!response.ok) {
        throw new Error(await response.text())
      }

      // Reset form on success
      setTitle('')
      setDescription('')
      setFiles([])
      onSuccess()
    } catch (err) {
      setError(err.message || 'Failed to upload content')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Title */}
        <div className="sm:col-span-2">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Content Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
            required
          />
        </div>

        {/* Description */}
        <div className="sm:col-span-2">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
          />
        </div>

        {/* Subject */}
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
            Subject
          </label>
          <select
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
          >
            <option value="math">Mathematics</option>
            <option value="science">Science</option>
            <option value="physics">Physics</option>
            <option value="chemistry">Chemistry</option>
            <option value="biology">Biology</option>
          </select>
        </div>

        {/* Grade Level */}
        <div>
          <label htmlFor="gradeLevel" className="block text-sm font-medium text-gray-700">
            Grade Level
          </label>
          <select
            id="gradeLevel"
            value={gradeLevel}
            onChange={(e) => setGradeLevel(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map(grade => (
              <option key={grade} value={grade.toString()}>
                Grade {grade}
              </option>
            ))}
            <option value="college">College</option>
          </select>
        </div>

        {/* File Upload */}
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Attachments</label>
          <div className="mt-1 flex justify-center rounded-md border-2 border-dashed border-gray-300 px-6 pt-5 pb-6">
            <div className="space-y-1 text-center">
              <ArrowUpTrayIcon className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer rounded-md bg-white font-medium text-indigo-600 focus-within:outline-none hover:text-indigo-500"
                >
                  <span>Upload files</span>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    multiple
                    onChange={handleFileChange}
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">
                PDF, PPT, DOCX, images, or videos up to 10MB
              </p>
            </div>
          </div>

          {/* Preview uploaded files */}
          {files.length > 0 && (
            <div className="mt-4 space-y-2">
              <h4 className="text-sm font-medium text-gray-700">Selected files:</h4>
              <ul className="divide-y divide-gray-200 rounded-md border border-gray-200">
                {files.map((file, index) => (
                  <li key={index} className="flex items-center justify-between py-3 pl-3 pr-4 text-sm">
                    <div className="flex items-center">
                      {file.type.startsWith('image/') ? (
                        <PhotoIcon className="h-5 w-5 flex-shrink-0 text-gray-400" />
                      ) : file.type.startsWith('video/') ? (
                        <VideoCameraIcon className="h-5 w-5 flex-shrink-0 text-gray-400" />
                      ) : (
                        <DocumentTextIcon className="h-5 w-5 flex-shrink-0 text-gray-400" />
                      )}
                      <span className="ml-2 w-0 flex-1 truncate">{file.name}</span>
                      <span className="ml-2 flex-shrink-0 text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)}MB
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="ml-4 flex-shrink-0 rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <XCircleIcon className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submit button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <ArrowPathIcon className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            'Upload Content'
          )}
        </button>
      </div>
    </form>
  )
}