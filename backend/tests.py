from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from django.core.cache import cache
from .models import (
    UserProfile,
    Program,
    Module,
    Topic,
    Enrollment,
    UserProgress,
    LearningSession,
    Activity
)
import logging
from unittest.mock import patch

User = get_user_model()

class DashboardViewTests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        """Create test data once for all tests"""
        # Create test users
        cls.student = UserProfile.objects.create_user(
            email='student@example.com',
            password='testpass123',
            role='STUDENT'
        )
        
        # Create test program structure
        cls.program = Program.objects.create(
            title="Test Program",
            description="Test Description",
            price_monthly=10.00,
            price_yearly=100.00,
            is_active=True
        )
        
        cls.module = Module.objects.create(
            program=cls.program,
            title="Test Module",
            description="Module Description",
            order=1
        )
        
        # Create topics
        cls.topic1 = Topic.objects.create(
            module=cls.module,
            title="Topic 1",
            content="Content 1",
            order=1
        )
        
        cls.topic2 = Topic.objects.create(
            module=cls.module,
            title="Topic 2",
            content="Content 2",
            order=2
        )
        
        cls.url = reverse('dashboard')

    def setUp(self):
        """Reset state before each test"""
        cache.clear()
        self.client.force_authenticate(user=self.student)
        # Clear any test-created data
        UserProgress.objects.all().delete()
        Enrollment.objects.all().delete()
        LearningSession.objects.all().delete()
        Activity.objects.all().delete()

    def test_unauthenticated_access(self):
        """Should reject unauthorized requests"""
        self.client.logout()
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_empty_dashboard(self):
        """New user with no activity should see empty dashboard"""
        response = self.client.get(self.url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data
        self.assertEqual(data['current_progress'], 0)
        self.assertEqual(data['stats']['total_topics'], 0)
        self.assertEqual(data['stats']['completed_topics'], 0)
        self.assertEqual(data['learning_hours'], 0.0)
        self.assertEqual(data['completed_programs'], 0)
        self.assertEqual(len(data['progress_data']), 0)
        self.assertEqual(len(data['recent_activities']), 0)

    def test_progress_calculation(self):
        """Should correctly calculate learning progress"""
        # Setup enrollment and progress
        Enrollment.objects.create(user=self.student, program=self.program)
        UserProgress.objects.create(
            user=self.student,
            topic=self.topic1,
            is_completed=True
        )
        
        response = self.client.get(self.url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['current_progress'], 50)  # 1 of 2 topics
        self.assertEqual(response.data['stats']['completed_topics'], 1)
        self.assertEqual(response.data['stats']['total_topics'], 2)

    def test_completed_program(self):
        """Should detect fully completed programs"""
        # Create enrollment and mark as completed
        enrollment = Enrollment.objects.create(
            user=self.student, 
            program=self.program,
            is_completed=True  # Explicitly mark as completed
        )
        
        # Complete all topics
        for topic in [self.topic1, self.topic2]:
            UserProgress.objects.create(
                user=self.student,
                topic=topic,
                is_completed=True
            )
        
        response = self.client.get(self.url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['current_progress'], 100)
        self.assertEqual(response.data['completed_programs'], 1,
                       f"Expected 1 completed program. Got: {response.data}")


    def test_learning_hours_tracking(self):
        """Should sum all learning sessions"""
        Enrollment.objects.create(user=self.student, program=self.program)
        LearningSession.objects.create(user=self.student, duration_hours=1.5)
        LearningSession.objects.create(user=self.student, duration_hours=0.75)
        
        response = self.client.get(self.url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['learning_hours'], 2.25)

    def test_recent_activities(self):
        """Should show recent user activities"""
        Activity.objects.bulk_create([
            Activity(
                user=self.student,
                activity_type='COMPLETED_TOPIC',
                details={'topic_id': self.topic1.id}
            ),
            Activity(
                user=self.student,
                activity_type='STARTED_PROGRAM',
                details={'program_id': self.program.id}
            )
        ])
        
        response = self.client.get(self.url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['recent_activities']), 2)
        self.assertEqual(
            response.data['recent_activities'][0]['activity_type'],
            'COMPLETED_TOPIC'
        )

    def test_cache_behavior(self):
        """Should cache dashboard results"""
        # Initial request (uncached)
        Enrollment.objects.create(user=self.student, program=self.program)
        response1 = self.client.get(self.url)
        
        # Add new topic (shouldn't appear yet)
        Topic.objects.create(
            module=self.module,
            title="New Topic",
            content="New Content",
            order=3
        )
        
        # Second request (cached)
        response2 = self.client.get(self.url)
        self.assertEqual(response2.data['stats']['total_topics'], 2)
        
        # Clear cache and verify update
        cache.clear()
        response3 = self.client.get(self.url)
        self.assertEqual(response3.data['stats']['total_topics'], 3)

    def test_error_handling(self):
        """Should gracefully handle errors"""
        # Create test data first
        Enrollment.objects.create(user=self.student, program=self.program)
        
        # Mock the cache.get() method which is definitely called first in the view
        with patch('django.core.cache.cache.get', side_effect=Exception("Cache error")):
            with self.assertLogs(level=logging.ERROR):
                response = self.client.get(self.url)
                
                self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR,
                              f"Expected 500 error but got {response.status_code}. Response: {response.data}")
                self.assertIn('error', response.data)