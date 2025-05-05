# your_app/tests/base.py
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from .models import ContentUpload

User = get_user_model()

class BaseAPITestCase(APITestCase):
    def setUp(self):
        # Create test users
        self.admin = User.objects.create_superuser(
            email='admin@example.com',
            password='adminpass'
        )
        self.admin.role = 'ADMIN'
        self.admin.save()
        
        self.educator = User.objects.create_user(
            email='educator@example.com',
            password='educatorpass'
        )
        self.educator.role = 'EDUCATOR'
        self.educator.is_approved = True
        self.educator.save()
        
        self.unapproved_educator = User.objects.create_user(
            email='unapproved@example.com',
            password='unapprovedpass'
        )
        self.unapproved_educator.role = 'EDUCATOR'
        self.unapproved_educator.is_approved = False
        self.unapproved_educator.save()
        
        self.student = User.objects.create_user(
            email='student@example.com',
            password='studentpass'
        )
        self.student.role = 'STUDENT'
        self.student.save()
        
        # Create some test content
        self.content = ContentUpload.objects.create(
            educator=self.educator,
            upload_type='TOPIC',
            text_file='dummy.txt',
            status='COMPLETED'
        )
        
        self.client = APIClient()