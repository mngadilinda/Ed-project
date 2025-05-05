// src/components/admin/ContentStats.jsx
import { useEffect, useState } from 'react'
import {
  ChartBarIcon,
  BookOpenIcon,
  UsersIcon,
  ClockIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'

export default function ContentStats() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/educator/content/stats')
        if (!response.ok) {
          throw new Error('Failed to fetch stats')
        }
        const data = await response.json()
        setStats(data)
      } catch (err) {
        setError(err.message || 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

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
            <h3 className="text-sm font-medium text-red-800">Error loading stats</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                <BookOpenIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">Total Content</dt>
                <dd className="flex items-baseline">
                  <div className="text-2xl font-semibold text-gray-900">
                    {stats.totalContent}
                  </div>
                </dd>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                <UsersIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">Subjects Covered</dt>
                <dd className="flex items-baseline">
                  <div className="text-2xl font-semibold text-gray-900">
                    {stats.totalSubjects}
                  </div>
                </dd>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                <ClockIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">Recent Activity</dt>
                <dd className="flex items-baseline">
                  <div className="text-2xl font-semibold text-gray-900">
                    {stats.recentUploads.length} new
                  </div>
                </dd>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content by Subject */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
          <ChartBarIcon className="h-5 w-5 text-indigo-500" />
          Content Distribution by Subject
        </h3>
        <div className="space-y-4">
          {stats.contentBySubject.map((subject) => (
            <div key={subject.subject} className="flex items-center">
              <div className="w-32 flex-shrink-0">
                <span className="text-sm font-medium text-gray-900 capitalize">
                  {subject.subject}
                </span>
              </div>
              <div className="flex-1">
                <div className="relative h-4 rounded-full bg-gray-200 overflow-hidden">
                  <div
                    className="absolute top-0 left-0 h-full bg-indigo-500"
                    style={{
                      width: `${(subject.count / Math.max(...stats.contentBySubject.map(s => s.count))) * 100}%`
                    }}
                  />
                </div>
              </div>
              <div className="ml-4 w-12 flex-shrink-0 text-right">
                <span className="text-sm font-medium text-gray-900">
                  {subject.count}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Uploads */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Uploads</h3>
        <ul className="divide-y divide-gray-200">
          {stats.recentUploads.map((content) => (
            <li key={content.id} className="py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-indigo-600 truncate">
                      {content.title}
                    </p>
                    <p className="text-sm text-gray-500">
                      Uploaded {new Date(content.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <a
                  href={`/content/${content.id}`}
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                >
                  View
                </a>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}