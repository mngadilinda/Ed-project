import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function EducatorAnalytics() {
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [timeRange, setTimeRange] = useState('30days');
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data
  const courses = [
    { id: '1', title: 'Introduction to React' },
    { id: '2', title: 'Advanced JavaScript' },
    { id: '3', title: 'UI/UX Design Fundamentals' },
  ];

  const enrollmentData = [
    { name: 'Jan', students: 12 },
    { name: 'Feb', students: 19 },
    { name: 'Mar', students: 15 },
    { name: 'Apr', students: 28 },
    { name: 'May', students: 32 },
    { name: 'Jun', students: 24 },
  ];

  const completionData = [
    { name: 'Completed', value: 75 },
    { name: 'In Progress', value: 15 },
    { name: 'Not Started', value: 10 },
  ];

  const studentPerformance = [
    { student: 'Alex Johnson', progress: 92, lastActive: '2 days ago' },
    { student: 'Maria Garcia', progress: 85, lastActive: '1 day ago' },
    { student: 'James Wilson', progress: 78, lastActive: '5 days ago' },
    { student: 'Sarah Lee', progress: 65, lastActive: '1 week ago' },
    { student: 'David Kim', progress: 58, lastActive: '2 weeks ago' },
  ];

  // Custom tab component replacement
  const TabButton = ({ value, children }) => (
    <button
      onClick={() => setActiveTab(value)}
      className={`px-4 py-2 rounded-md font-medium ${
        activeTab === value ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h1 className="text-3xl font-bold">Course Analytics</h1>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="space-y-1">
            <Label htmlFor="course-select" className="text-sm">Select Course</Label>
            <select
              id="course-select"
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="all">All Courses</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>{course.title}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="time-range" className="text-sm">Time Range</Label>
            <select
              id="time-range"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="7days">Last 7 days</option>
              <option value="30days">Last 30 days</option>
              <option value="90days">Last 90 days</option>
              <option value="year">Last year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tab buttons */}
      <div className="flex gap-2">
        <TabButton value="overview">Overview</TabButton>
        <TabButton value="students">Student Insights</TabButton>
        <TabButton value="engagement">Engagement</TabButton>
      </div>

      {/* Tab content */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Total Students</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold">124</p>
                  <p className="text-sm text-muted-foreground">+12% from last month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Completion Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold">75%</p>
                  <p className="text-sm text-muted-foreground">+8% from last month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Avg. Time Spent</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold">3.2h</p>
                  <p className="text-sm text-muted-foreground">per student per week</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Enrollment Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={enrollmentData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="students" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Course Completion</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={completionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {completionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {activeTab === 'students' && (
          <Card>
            <CardHeader>
              <CardTitle>Student Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {studentPerformance.map((student, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-sm font-medium">
                          {student.student.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{student.student}</p>
                        <p className="text-sm text-muted-foreground">Last active: {student.lastActive}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 h-2 bg-gray-200 rounded-full">
                        <div 
                          className="h-full rounded-full bg-green-500" 
                          style={{ width: `${student.progress}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{student.progress}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'engagement' && (
          <Card>
            <CardHeader>
              <CardTitle>Engagement Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Coming soon - Detailed engagement analytics</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}