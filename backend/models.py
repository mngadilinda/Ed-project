from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils.translation import gettext_lazy as _
import json
from django.conf import settings
from django.contrib.auth.models import AbstractUser, BaseUserManager


class UserProfileManager(BaseUserManager):
    def _create_user(self, email, password, **extra_fields):
        if not email:
            raise ValueError('The Email must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', False)
        extra_fields.setdefault('is_superuser', False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self._create_user(email, password, **extra_fields)

class UserProfile(AbstractUser):
    ROLES = (
        ('STUDENT', 'Student'),
        ('EDUCATOR', 'Educator'),
        ('ADMIN', 'Admin'),
    )
    username = None
    email = models.EmailField(_('email address'), unique=True, null=True)
    
    role = models.CharField(max_length=10, choices=ROLES, default='STUDENT')
    is_approved = models.BooleanField(default=False)
    
    # UserProfile fields
    rating = models.FloatField(default=0)
    current_module = models.ForeignKey('Module', null=True, blank=True, on_delete=models.SET_NULL)
    subscription_type = models.CharField(max_length=50, null=True, blank=True)
    subscription_expiry = models.DateField(null=True, blank=True)
    weaknesses = models.JSONField(default=dict)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []
    
    objects = UserProfileManager()

    # Add these to resolve the reverse accessor clashes
    groups = models.ManyToManyField(
        'auth.Group',
        verbose_name='groups',
        blank=True,
        help_text='The groups this user belongs to.',
        related_name='custom_user_set',  # Changed from default
        related_query_name='user',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        verbose_name='user permissions',
        blank=True,
        help_text='Specific permissions for this user.',
        related_name='custom_user_set',  # Changed from default
        related_query_name='user',
    )

    def get_overall_progress(self):
        """Calculate overall completion percentage"""
        completed = self.user_progress.filter(is_completed=True).count()
        total = Topic.objects.filter(module__program__enrollments__user=self).count()
        return round((completed / total) * 100) if total > 0 else 0
    
    @property
    def total_learning_hours(self):
        """Sum all learning sessions duration"""
        return self.learning_sessions.aggregate(
            total=sum('duration_hours')
        )['total'] or 0
    
    def get_recent_activities(self, limit=5):
        """Get recent user activities"""
        return list(self.activities.order_by('-timestamp')[:limit].values(
            'id', 'activity_type', 'timestamp', 'details'
        ))


    @property
    def is_educator(self):
        return self.role == 'EDUCATOR' and self.is_approved

    def update_rating(self):
        results = self.test_results.all()
        if not results.exists():
            self.rating = 0
            self.save()
            return
        
        total_score = sum([r.score for r in results])
        avg_score = total_score / results.count()
        
        recent_results = results.order_by('-timestamp')[:5]
        if recent_results.exists():
            recent_avg = sum([r.score for r in recent_results]) / recent_results.count()
            weighted_avg = (avg_score * 0.6) + (recent_avg * 0.4)
        else:
            weighted_avg = avg_score
            
        self.rating = min(100, weighted_avg)
        self.save()

    def __str__(self):
        return self.email


class Program(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    thumbnail = models.ImageField(upload_to='program_thumbnails/')
    price_monthly = models.DecimalField(max_digits=6, decimal_places=2)
    price_yearly = models.DecimalField(max_digits=6, decimal_places=2)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def get_user_progress(self, user):
        """Calculate user's progress in this program"""
        completed_topics = UserProgress.objects.filter(
            user=user,
            topic__module__program=self,
            is_completed=True
        ).count()
        total_topics = Topic.objects.filter(module__program=self).count()
        return round((completed_topics / total_topics) * 100) if total_topics > 0 else 0

    def __str__(self):
        return self.title

class Module(models.Model):
    program = models.ForeignKey(Program, related_name='modules', on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    description = models.TextField()
    thumbnail = models.ImageField(upload_to='module_thumbnails/')
    order = models.PositiveIntegerField()
    is_unlocked = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.program.title} - {self.title}"

class Topic(models.Model):
    module = models.ForeignKey(Module, related_name='topics', on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    order = models.PositiveIntegerField()
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.module.title} - {self.title}"

class TopicResource(models.Model):
    RESOURCE_TYPES = (
        ('VIDEO', 'Video'),
        ('PDF', 'PDF'),
        ('AUDIO', 'Audio'),
        ('LINK', 'External Link'),
    )
    topic = models.ForeignKey(Topic, related_name='resources', on_delete=models.CASCADE)
    resource_type = models.CharField(max_length=5, choices=RESOURCE_TYPES)
    url = models.URLField()
    title = models.CharField(max_length=200)
    duration = models.PositiveIntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.topic.title} - {self.get_resource_type_display()}"

class Assessment(models.Model):
    topic = models.ForeignKey(Topic, related_name='assessments', on_delete=models.CASCADE, null=True, blank=True)
    module = models.ForeignKey(Module, related_name='assessments', on_delete=models.CASCADE, null=True, blank=True)
    title = models.CharField(max_length=200)
    description = models.TextField()
    passing_score = models.PositiveIntegerField(default=70)
    is_proctored = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

class Question(models.Model):
    QUESTION_TYPES = (
        ('MCQ', 'Multiple Choice'),
        ('TF', 'True/False'),
        ('FIB', 'Fill in Blank'),
        ('SA', 'Short Answer'),
    )
    assessment = models.ForeignKey(Assessment, related_name='questions', on_delete=models.CASCADE)
    question_type = models.CharField(max_length=3, choices=QUESTION_TYPES)
    text = models.TextField()
    options = models.JSONField(default=list)
    correct_answer = models.TextField()
    difficulty = models.PositiveIntegerField(default=1)
    concept_tags = models.CharField(max_length=200)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.assessment.title} - {self.text[:50]}..."



class UserProgress(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='user_progress', on_delete=models.CASCADE)
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE)
    is_completed = models.BooleanField(default=False)
    last_accessed = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'topic')
        verbose_name_plural = 'User Progress'

    def __str__(self):
        return f"{self.user.username} - {self.topic.title}"
    

class LearningSession(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE,
        related_name='learning_sessions'
    )
    module = models.ForeignKey('Module', on_delete=models.SET_NULL, null=True)
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(null=True, blank=True)
    duration_hours = models.FloatField(default=0)

    @property
    def duration_minutes(self):
        return self.duration_hours * 60
    

class Activity(models.Model):
    ACTIVITY_TYPES = (
        ('LOGIN', 'User Login'),
        ('MODULE_START', 'Module Started'),
        ('MODULE_COMPLETE', 'Module Completed'),
        ('ASSESSMENT_TAKEN', 'Assessment Taken'),
    )
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE,
        related_name='activities'
    )
    activity_type = models.CharField(max_length=20, choices=ACTIVITY_TYPES)
    timestamp = models.DateTimeField(auto_now_add=True)
    details = models.JSONField(default=dict)


class TestResult(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='test_results', on_delete=models.CASCADE)
    assessment = models.ForeignKey(Assessment, on_delete=models.CASCADE)
    score = models.FloatField()
    timestamp = models.DateTimeField(auto_now_add=True)
    detailed_results = models.JSONField()
    weak_areas = models.JSONField(default=list)

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        self.user.update_rating()
        from .views import analyze_user_weaknesses  # Import inside method to avoid circular imports
        analyze_user_weaknesses(self.user)

    def __str__(self):
        return f"{self.user.username} - {self.assessment.title} - {self.score}%"
    


class ContentUpload(models.Model):
    UPLOAD_TYPES = (
        ('PROGRAM', 'Program Structure'),
        ('MODULE', 'Module Content'),
        ('TOPIC', 'Topic Content'),
        ('ASSESSMENT', 'Assessment Questions'),
    )
    
    content_id = models.PositiveIntegerField(null=True, blank=True)
    content_type = models.CharField(max_length=50, null=True, blank=True)
    educator = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    upload_type = models.CharField(max_length=10, choices=UPLOAD_TYPES)
    text_file = models.FileField(upload_to='content_uploads/')
    status = models.CharField(max_length=20, default='PENDING', choices=(
        ('PENDING', 'Pending Processing'),
        ('PROCESSING', 'Processing'),
        ('COMPLETED', 'Completed'),
        ('FAILED', 'Failed'),
    ))
    created_at = models.DateTimeField(auto_now_add=True)
    processed_at = models.DateTimeField(null=True, blank=True)
    log = models.TextField(blank=True)

    def __str__(self):
        return f"{self.educator.username} - {self.get_upload_type_display()} - {self.created_at}"
    

# In models.py
class Enrollment(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='enrollments'
    )
    program = models.ForeignKey(
        'Program',
        on_delete=models.CASCADE,
        related_name='enrollments'
    )
    enrolled_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    is_completed = models.BooleanField(default=False)

    class Meta:
        unique_together = ('user', 'program')