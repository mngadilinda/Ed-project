import { useState } from 'react';
import api from '../services/api';

export default function useContentUpload() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Generic upload function
  const uploadContent = async (contentType, data) => {
    setIsLoading(true);
    setError(null);
    
    try {
      let formData = new FormData();
      let endpoint = '';
      let options = {};

      // Model-specific formData construction
      switch(contentType) {
        case 'module':
          endpoint = '/modules/';
          formData.append('program', data.programId);
          formData.append('title', data.title);
          formData.append('description', data.description);
          formData.append('order', data.order);
          if (data.thumbnail) formData.append('thumbnail', data.thumbnail);
          formData.append('is_unlocked', data.is_unlocked || false);
          options = { headers: { 'Content-Type': 'multipart/form-data' }};
          break;

        case 'topic':
          endpoint = '/topics/';
          formData.append('module', data.moduleId);
          formData.append('title', data.title);
          formData.append('description', data.description);
          formData.append('order', data.order);
          if (data.thumbnail) formData.append('thumbnail', data.thumbnail);
          if (data.content) formData.append('content', data.content);
          options = { headers: { 'Content-Type': 'multipart/form-data' }};
          break;

        case 'assessment':
          endpoint = '/assessments/';
          formData.append('module', data.moduleId);
          formData.append('title', data.title);
          formData.append('assessment_type', data.type);
          formData.append('description', data.description);
          if (data.due_date) formData.append('due_date', data.due_date);
          options = { headers: { 'Content-Type': 'multipart/form-data' }};
          break;

        case 'question':
          endpoint = '/questions/';
          formData.append('assessment', data.assessmentId);
          formData.append('text', data.text);
          formData.append('question_type', data.type);
          formData.append('points', data.points);
          if (data.image) formData.append('image', data.image);
          options = { headers: { 'Content-Type': 'multipart/form-data' }};
          break;

        default:
          throw new Error(`Unknown content type: ${contentType}`);
      }

      const response = await api.post(endpoint, formData, options);
      return true;

    } catch (err) {
      setError({
        type: contentType,
        details: err.response?.data || { message: err.message }
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Batch upload topics with resources
  const uploadTopics = async (moduleId, topics) => {
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('module', moduleId);
      
      topics.forEach((topic, index) => {
        formData.append(`topics[${index}][title]`, topic.title);
        formData.append(`topics[${index}][order]`, topic.order);
        if (topic.description) formData.append(`topics[${index}][description]`, topic.description);
        if (topic.content) formData.append(`topics[${index}][content]`, topic.content);
        if (topic.thumbnail) formData.append(`topics[${index}][thumbnail]`, topic.thumbnail);
        
        if (topic.resources) {
          topic.resources.forEach((file, fileIndex) => {
            formData.append(`topics[${index}][resources][${fileIndex}]`, file);
          });
        }
      });

      const response = await api.post('/topics/batch/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (err) {
      setError({
        type: 'batch-topics',
        details: err.response?.data || { message: err.message }
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Publish module
  const completeUpload = async (moduleId) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.patch(`/modules/${moduleId}/`, {
        is_published: true
      });
      return response.data;
    } catch (err) {
      setError({
        type: 'publish-module',
        details: err.response?.data || { message: err.message }
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Convenience methods
  const uploadModule = (data) => uploadContent('module', data);
  const uploadTopic = (data) => uploadContent('topic', data);
  const uploadAssessment = (data) => uploadContent('assessment', data);
  const uploadQuestion = (data) => uploadContent('question', data);

  return {
    // Single upload methods
    uploadModule,
    uploadTopic,
    uploadAssessment,
    uploadQuestion,
    
    // Batch operations
    uploadTopics,
    completeUpload,
    
    // State
    isLoading,
    error
  };
}