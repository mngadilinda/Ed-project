import { useState, useEffect } from "react";
import api from "../../services/api";
import axios from 'axios';

export default function ModuleForm({ data, onChange, onSubmit, error, loading }) {
    const subjects = ['Algebra', 'Calculus', 'Geometry', 'Statistics', 'Trigonometry'];
    const [thumbnail, setThumbnail] = useState(null);
    const [programs, setPrograms] = useState([]);
    const [isLoadingPrograms, setIsLoadingPrograms] = useState(true);
    const [programsError, setProgramsError] = useState(null);

    useEffect(() => {
      const fetchPrograms = async () => {
        try {
          // Bypass any potential axios instance issues temporarily
          const response = await axios.get('http://localhost:8000/programs/', {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`
            }
          });
          
          console.log('RAW PROGRAMS DATA:', response.data); // Critical debug log
          
          // Handle both direct array and wrapped responses
          const programsData = Array.isArray(response.data) 
            ? response.data 
            : response.data?.data || response.data?.results || [];
          
          setPrograms(programsData);
          
          if (programsData.length > 0 && !data.programId) {
            onChange({ ...data, programId: programsData[0].id });
          }
          
        } catch (err) {
          console.error('DIRECT FETCH ERROR:', err);
          setProgramsError(err.response?.data || 'Failed to load programs');
        } finally {
          setIsLoadingPrograms(false);
        }
      };
    
      fetchPrograms();
    }, []);
  
    
    const renderProgramSelector = () => {
      // Only log when programs actually change
      useEffect(() => {
        if (programs && programs.length > 0) {
          console.log('Programs loaded:', programs);
        }
      }, [programs]);
    
      if (isLoadingPrograms) {
        return <div className="h-10 bg-gray-200 rounded animate-pulse"></div>;
      }
    
      if (programsError) {
        return <div className="text-red-500 text-sm">{programsError}</div>;
      }
    
      if (!programs || programs.length === 0) {
        return <div className="text-yellow-600 text-sm">No programs available</div>;
      }
    
      return (
        <select
          value={data.programId ?? ''}
          onChange={(e) => onChange({ ...data, programId: Number(e.target.value) })}
          className="w-full p-2 border border-gray-300 rounded-md"
          required
        >
          <option value="" disabled>Select a program</option>
          {programs.map(program => (
            <option key={program.id} value={program.id}>
              {program.title} 
            </option>
          ))}
        </select>
      );
    };
  
    const handleFileChange = (e) => {
      setThumbnail(e.target.files[0]);
    };
  
    // const handleSubmit = (e) => {
    //   e.preventDefault();
    //   onSubmit({ ...data, thumbnail });
    // };

  
    return (
      <form onSubmit={(e) => {
      e.preventDefault();
      onSubmit({ ...data, thumbnail });
    }} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Program*
            </label>
            {renderProgramSelector()}
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Module Title*
            </label>
            <input
              type="text"
              value={data.title}
              onChange={(e) => onChange({...data, title: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
              required
            />
          </div>

          {/* Add thumbnail upload field */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Thumbnail Image
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              accept="image/*"
              className="mt-1 block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"/>
          </div>

          {/* Add program ID field (should be a select from available programs) */}
          {/* Add order field */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Order*
            </label>
            <input
              type="number"
              value={data.order}
              onChange={(e) => onChange({...data, order: parseInt(e.target.value)})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
              required/>
          </div>
  
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Subject*
            </label>
            <select
              value={data.subject}
              onChange={(e) => onChange({...data, subject: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
            >
              {subjects.map(subject => (
                <option key={subject} value={subject.toLowerCase()}>{subject}</option>
              ))}
            </select>
          </div>
  
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Grade Level*
            </label>
            <select
              value={data.gradeLevel}
              onChange={(e) => onChange({...data, gradeLevel: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
            >
              {[...Array(12)].map((_, i) => (
                <option key={i} value={i+1}>Grade {i+1}</option>
              ))}
              <option value="college">College</option>
            </select>
          </div>
  
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              rows={3}
              value={data.description}
              onChange={(e) => onChange({...data, description: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
            />
          </div>
        </div>
  
        {error && (
          <div className="text-red-500 text-sm mt-2">{error}</div>
        )}
  
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Continue to Topics'}
          </button>
        </div>
      </form>
    );
  }