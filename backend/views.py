from rest_framework import viewsets, status
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.response import Response
from .serializers import CustomTokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import action, authentication_classes,api_view
from django.utils import timezone
from django.db import transaction
from django.middleware.csrf import get_token
from .models import (
    Program, Module, Topic, TopicResource,
    Assessment, Question, UserProfile,
    UserProgress, TestResult, ContentUpload
)
from .serializers import (
    ProgramSerializer, ModuleSerializer, TopicSerializer,
    TopicResourceSerializer, AssessmentSerializer,
    QuestionSerializer, UserProfileSerializer,
    UserProgressSerializer, TestResultSerializer, ContentUploadSerializer,
    EducatorListSerializer, EducatorProfileSerializer,
    UserRegisterSerializer, UserLoginSerializer
)
from django.contrib.auth.models import User
from django.db.models import Sum, FloatField, F, Count, Q
from django.db.models.functions import Cast
from django.shortcuts import get_object_or_404
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.cluster import KMeans
from collections import defaultdict
from django.contrib.auth import get_user_model, authenticate, logout
import threading
from django.http import JsonResponse
from sympy import sympify, simplify, Eq, symbols
from sympy.parsing.sympy_parser import parse_expr
from rest_framework.decorators import permission_classes
import os
from django.conf import settings
from pathlib import Path
from firebase_admin import auth
from django.contrib.auth import login
import re
from rest_framework.views import APIView
from rest_framework.permissions import BasePermission
from .permissions import IsApprovedEducator, IsAdminUser
from rest_framework_simplejwt.tokens import RefreshToken
import logging
from rest_framework import serializers
from django.core.exceptions import ValidationError
from django.core.exceptions import ValidationError as DjangoValidationError
from .services import process_content_upload, update_upload_status
from django.core.cache import cache
from concurrent.futures import ThreadPoolExecutor



logger = logging.getLogger(__name__)

User = get_user_model()

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserRegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            
            # Generate tokens for immediate login after registration
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'user': UserProfileSerializer(user).data,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            password = serializer.validated_data['password']
            
            user = authenticate(request, email=email, password=password)
            
            if user:
                # Generate tokens
                refresh = RefreshToken.for_user(user)
                token_serializer = CustomTokenObtainPairSerializer()
                token_data = token_serializer.get_token(user)
                
                return Response({
                    'user': UserProfileSerializer(user).data,
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                })
            
            return Response(
                {'error': 'Invalid credentials'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response(
                {'error': 'Invalid token or already blacklisted'},
                status=status.HTTP_400_BAD_REQUEST
            )

    
def get_csrf(request):
    return JsonResponse({'csrfToken': get_token(request)})

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
def check_auth(request):
    return Response({
        'isAuthenticated': request.user.is_authenticated,
        'user': UserProfileSerializer(request.user).data 
        # if request.user.is_authenticated else None
    })


class ProgramViewSet(viewsets.ModelViewSet):
    queryset = Program.objects.filter(is_active=True)
    serializer_class = ProgramSerializer

    @action(detail=True, methods=['get'])
    def modules(self, request, pk=None):
        program = self.get_object()
        modules = program.modules.all().order_by('order')
        serializer = ModuleSerializer(modules, many=True)
        return Response(serializer.data)

class ModuleViewSet(viewsets.ModelViewSet):
    queryset = Module.objects.all()
    serializer_class = ModuleSerializer

    @action(detail=True, methods=['get'])
    def topics(self, request, pk=None):
        module = self.get_object()
        topics = module.topics.all().order_by('order')
        serializer = TopicSerializer(topics, many=True)
        return Response(serializer.data)

class TopicViewSet(viewsets.ModelViewSet):
    queryset = Topic.objects.all()
    serializer_class = TopicSerializer

    @action(detail=True, methods=['get'])
    def resources(self, request, pk=None):
        topic = self.get_object()
        resources = topic.resources.all()
        serializer = TopicResourceSerializer(resources, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def mark_completed(self, request, pk=None):
        topic = self.get_object()
        progress, created = UserProgress.objects.get_or_create(
            user=request.user,
            topic=topic,
            defaults={'is_completed': True}
        )
        if not created:
            progress.is_completed = True
            progress.save()
        return Response({'status': 'topic marked as completed'})

class TopicResourceViewSet(viewsets.ModelViewSet):
    queryset = TopicResource.objects.all()
    serializer_class = TopicResourceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        topic_id = self.request.query_params.get('topic_id')
        if topic_id:
            queryset = queryset.filter(topic_id=topic_id)
        return queryset

class AssessmentViewSet(viewsets.ModelViewSet):
    queryset = Assessment.objects.all()
    serializer_class = AssessmentSerializer

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def submit(self, request, pk=None):
        assessment = self.get_object()
        answers = request.data.get('answers', [])
        
        # Calculate score
        questions = assessment.questions.all()
        total_questions = questions.count()
        correct = 0
        
        detailed_results = []
        for question in questions:
            user_answer = next((a for a in answers if a['question_id'] == question.id), None)
            is_correct = user_answer and str(user_answer['answer']).lower() == str(question.correct_answer).lower()
            if is_correct:
                correct += 1
                
            detailed_results.append({
                'question_id': question.id,
                'question_text': question.text,
                'correct_answer': question.correct_answer,
                'user_answer': user_answer['answer'] if user_answer else None,
                'is_correct': is_correct,
                'concept': question.concept_tags
            })
        
        score = (correct / total_questions) * 100 if total_questions > 0 else 0
        
        # Create test result
        test_result = TestResult.objects.create(
            user=request.user,
            assessment=assessment,
            score=score,
            detailed_results=detailed_results
        )
        
        serializer = TestResultSerializer(test_result)
        return Response(serializer.data)

class UserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)

    @action(detail=False, methods=['get'])
    def progress(self, request):
        progress = UserProgress.objects.filter(user=request.user)
        serializer = UserProgressSerializer(progress, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def test_results(self, request):
        results = TestResult.objects.filter(user=request.user)
        serializer = TestResultSerializer(results, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def weaknesses(self, request):
        weaknesses = analyze_user_weaknesses(request.user)
        return Response(weaknesses)

def analyze_user_weaknesses(user):
    # Get all test results for the user
    test_results = TestResult.objects.filter(user=user)
    
    if not test_results.exists():
        return {}
    
    # Collect all wrong answers with their concepts
    wrong_answers = []
    for result in test_results:
        for item in result.detailed_results:
            if not item['is_correct']:
                wrong_answers.append({
                    'concept': item['concept'],
                    'question': item['question_text']
                })
    
    if not wrong_answers:
        return {}
    
    # Simple frequency analysis of wrong concepts
    concept_counts = defaultdict(int)
    for answer in wrong_answers:
        concepts = [c.strip() for c in answer['concept'].split(',') if c.strip()]
        for concept in concepts:
            concept_counts[concept] += 1
    
    # Normalize counts to 0-1 range
    max_count = max(concept_counts.values()) if concept_counts else 1
    weaknesses = {
        concept: count / max_count
        for concept, count in concept_counts.items()
    }
    
    # Sort by severity
    sorted_weaknesses = sorted(weaknesses.items(), key=lambda x: x[1], reverse=True)
    
    # Prepare weakness data
    weakness_data = {
        'primary_weakness': sorted_weaknesses[0][0] if sorted_weaknesses else None,
        'all_weaknesses': dict(sorted_weaknesses[:5]),  # Top 5 weaknesses
        'detailed_breakdown': [
            {
                'concept': concept,
                'frequency': count,
                'normalized_score': weaknesses[concept],
                'example_questions': [
                    a['question'] for a in wrong_answers 
                    if concept in [c.strip() for c in a['concept'].split(',')]
                ][:3]  # Show 3 example questions
            }
            for concept, count in concept_counts.items()
        ]
    }
    
    # Update user directly (no profile attribute needed)
    user.weaknesses = weakness_data
    user.save()
    
    return weakness_data


# Add to views.py
class QuestionViewSet(viewsets.ModelViewSet):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        assessment_id = self.request.query_params.get('assessment_id')
        concept = self.request.query_params.get('concept')
        
        if assessment_id:
            queryset = queryset.filter(assessment_id=assessment_id)
        if concept:
            queryset = queryset.filter(concept_tags__icontains=concept)
        return queryset
    

# views.py
class ContentUploadViewSet(viewsets.ModelViewSet):
    """
    ViewSet for handling content uploads with status tracking and retry functionality.
    Production Note: Replace threads with Celery tasks in production.
    """
    queryset = ContentUpload.objects.all()
    serializer_class = ContentUploadSerializer
    permission_classes = [IsAuthenticated, IsApprovedEducator]

    def get_queryset(self):
        """Educators can only see their own uploads, ordered by most recent"""
        return super().get_queryset().filter(
            educator=self.request.user
        ).order_by('-created_at')

    def perform_create(self, serializer):
        """Handles upload creation and initiates background processing"""
        try:
            with transaction.atomic():
                instance = serializer.save(educator=self.request.user)
                self._validate_upload_file(instance.text_file)
                update_upload_status(
                    instance, 
                    'PENDING', 
                    'Upload received, queued for processing'
                )
            
            # Production recommendation: Use Celery instead of threads
            transaction.on_commit(
                lambda: threading.Thread(
                    target=process_content_upload,
                    args=(instance.id,),
                    daemon=True
                ).start()
            )
            
        except (ValidationError, DjangoValidationError) as e:
            self._handle_upload_error(instance, str(e))
            raise
        except Exception as e:
            self._handle_upload_error(
                instance, 
                f"System error: {str(e)}",
                log_error=True
            )
            raise ValidationError("Upload processing failed to initialize")

    @action(detail=True, methods=['post'])
    def retry(self, request, pk=None):
        """Retry a failed or pending upload"""
        with transaction.atomic():
            upload = self.get_object()
            
            if upload.status not in ['FAILED', 'PENDING']:
                return Response(
                    {
                        'error': 'Only failed or pending uploads can be retried',
                        'current_status': upload.status
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
                
            update_upload_status(
                upload,
                'PENDING',
                'Retry initiated by user'
            )
        
        # Production recommendation: Use Celery instead
        threading.Thread(
            target=process_content_upload,
            args=(upload.id,),
            daemon=True
        ).start()
        
        return Response({
            'status': 'retry_started',
            'upload_id': upload.id,
            'new_status': 'PENDING'
        })

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get upload statistics for the current educator"""
        uploads = self.get_queryset()
        
        return Response({
            'total': uploads.count(),
            'by_status': dict(
                uploads.values_list('status')
                .annotate(count=Count('status'))
                .order_by()
            ),
            'recent_completed': ContentUploadSerializer(
                uploads.filter(status='COMPLETED')[:5],
                many=True,
                context={'request': request}
            ).data
        })

    def _validate_upload_file(self, file):
        """Internal validation for upload files"""
        max_size = 10 * 1024 * 1024  # 10MB
        valid_extensions = ['.json', '.txt']
        
        if not file:
            raise ValidationError("No file provided")
            
        if file.size > max_size:
            raise ValidationError(
                f"File size exceeds {max_size/1024/1024}MB limit"
            )
            
        if not any(file.name.lower().endswith(ext) for ext in valid_extensions):
            raise ValidationError(
                f"Invalid file type. Allowed: {', '.join(valid_extensions)}"
            )

    def _handle_upload_error(self, instance, message, log_error=False):
        """Centralized error handling"""
        if instance and instance.pk:
            update_upload_status(instance, 'FAILED', message)
        if log_error:
            logger.error(
                f"Upload failed for user {self.request.user.id}: {message}",
                exc_info=True
            )


@api_view(['POST'])
@permission_classes([AllowAny])
def check_math_answer(request):
    try:
        data = request.data
        user_answer = data.get('user_answer', '').strip()
        problem_type = data.get('problem_type', '').lower()
        correct_answer = data.get('correct_answer', '').strip()
        variables = data.get('variables', {})  # Allow variable values from frontend
        
        if not user_answer or not correct_answer:
            return Response({'error': 'Missing required fields'}, status=400)

        # Initialize symbols with provided variable values
        sympy_vars = {}
        for var_name, var_value in variables.items():
            sympy_vars[var_name] = symbols(var_name)
            if var_value is not None:
                sympy_vars[var_name] = var_value

        # Pre-process answers
        def preprocess_answer(answer):
            # Handle common alternative representations
            answer = answer.replace('^', '**')  # Handle caret exponentiation
            answer = answer.replace('÷', '/').replace('×', '*')  # Alternative math symbols
            return answer.strip()
        
        user_answer = preprocess_answer(user_answer)
        correct_answer = preprocess_answer(correct_answer)

        # Different checking methods with enhanced logic
        if problem_type == 'expression':
            user_expr = parse_expr(user_answer, local_dict=sympy_vars, transformations='all')
            correct_expr = parse_expr(correct_answer, local_dict=sympy_vars, transformations='all')
            
            # Check equivalence with multiple methods for robustness
            is_correct = (
                simplify(user_expr - correct_expr) == 0 or
                user_expr.equals(correct_expr) or
                str(user_expr) == str(correct_expr)
            )
            
        elif problem_type == 'equation':
            try:
                # Handle both sides of equation
                user_lhs, user_rhs = [parse_expr(part, local_dict=sympy_vars) 
                                    for part in user_answer.split('=', 1)]
                correct_lhs, correct_rhs = [parse_expr(part, local_dict=sympy_vars) 
                                         for part in correct_answer.split('=', 1)]
                
                # Check equation equivalence
                is_correct = (
                    simplify(user_lhs - user_rhs) == simplify(correct_lhs - correct_rhs) or
                    Eq(user_lhs, user_rhs).equals(Eq(correct_lhs, correct_rhs))
                )
            except ValueError:
                return Response({'error': 'Equation must contain exactly one = sign'}, status=400)
                
        elif problem_type == 'numeric':
            tolerance = float(data.get('tolerance', 0.01))
            try:
                user_num = float(parse_expr(user_answer, local_dict=sympy_vars).evalf())
                correct_num = float(parse_expr(correct_answer, local_dict=sympy_vars).evalf())
                is_correct = abs(user_num - correct_num) <= tolerance
            except Exception as e:
                return Response({'error': f'Numeric evaluation error: {str(e)}'}, status=400)
                
        else:
            return Response({'error': 'Invalid problem type'}, status=400)
            
        # Provide detailed feedback
        response_data = {
            'correct': is_correct,
            'user_answer': user_answer,
            'expected_answer': correct_answer,
            'problem_type': problem_type,
            'evaluation_method': 'sympy'
        }
        
        # Add symbolic form if different from input
        if problem_type in ['expression', 'equation']:
            try:
                user_sym = str(parse_expr(user_answer, local_dict=sympy_vars))
                correct_sym = str(parse_expr(correct_answer, local_dict=sympy_vars))
                if user_sym != user_answer or correct_sym != correct_answer:
                    response_data.update({
                        'user_answer_symbolic': user_sym,
                        'expected_answer_symbolic': correct_sym
                    })
            except:
                pass
                
        return Response(response_data)
        
    except Exception as e:
        return Response({
            'error': str(e),
            'type': type(e).__name__
        }, status=400)
    

class IsApprovedEducator(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_educator

# Apply to your views
class EducatorAdminViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsApprovedEducator]
    # ... your view code ...



class EducatorProfileAPIView(APIView):
    permission_classes = [IsAuthenticated, IsApprovedEducator]

    def get(self, request):
        serializer = EducatorProfileSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request):
        educator = request.user
        serializer = EducatorProfileSerializer(
            educator, 
            data=request.data, 
            partial=True
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class EducatorContentAPIView(APIView):
    permission_classes = [IsAuthenticated, IsApprovedEducator]

    def get(self, request):
        content = ContentUpload.objects.filter(educator=request.user)
        serializer = ContentUploadSerializer(content, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = ContentUploadSerializer(
            data=request.data,
            context={'request': request}
        )
        if serializer.is_valid():
            serializer.save(educator=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class EducatorContentDetailAPIView(APIView):
    permission_classes = [IsAuthenticated, IsApprovedEducator]

    def get_object(self, pk):
        return get_object_or_404(
            ContentUpload, 
            pk=pk, 
            educator=self.request.user
        )

    def get(self, request, pk):
        content = self.get_object(pk)
        serializer = ContentUploadSerializer(content)
        return Response(serializer.data)

    def patch(self, request, pk):
        content = self.get_object(pk)
        serializer = ContentUploadSerializer(
            content, 
            data=request.data, 
            partial=True,
            context={'request': request}
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        content = self.get_object(pk)
        content.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# Admin-only views
class EducatorListAPIView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        educators = User.objects.filter(role='EDUCATOR')
        serializer = EducatorListSerializer(educators, many=True)
        return Response(serializer.data)


class EducatorApprovalAPIView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def post(self, request, pk):
        educator = get_object_or_404(User, pk=pk, role='EDUCATOR')
        educator.is_approved = True
        educator.save()
        serializer = EducatorListSerializer(educator)
        return Response(serializer.data)

    def delete(self, request, pk):
        educator = get_object_or_404(User, pk=pk, role='EDUCATOR')
        educator.is_approved = False
        educator.save()
        return Response(status=status.HTTP_204_NO_CONTENT)



class UserManagementAPIView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def get(self, request):
        users = User.objects.all().order_by('-date_joined')
        page = self.paginate_queryset(users)
        if page is not None:
            serializer = UserProfileSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = UserProfileSerializer(users, many=True)
        return Response(serializer.data)
    
    def paginate_queryset(self, queryset):
        page_size = int(self.request.query_params.get('page_size', 10))
        paginator = self.pagination_class(page_size)
        page_number = self.request.query_params.get('page', 1)
        return paginator.paginate_queryset(queryset, self.request, page=page_number)

class UserDetailAPIView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def patch(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
            action = request.data.get('action')
            
            if action == 'approve':
                if user.role == 'EDUCATOR':
                    user.is_approved = True
                    user.save()
                    return Response({'status': 'educator approved'})
                return Response({'error': 'User is not an educator'}, status=400)
                
            elif action == 'ban':
                user.is_banned = not user.is_banned
                user.save()
                return Response({'status': 'user banned' if user.is_banned else 'user unbanned'})
                
            return Response({'error': 'Invalid action'}, status=400)
            
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)



class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        profile = request.user.profile
        serializer = UserProfileSerializer(profile)
        return Response(serializer.data)
    
    def patch(self, request):
        profile = request.user.profile
        serializer = UserProfileSerializer(
            profile, 
            data=request.data, 
            partial=True
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_view(request):
    try:
        user = request.user
        cache_key = f"user_{user.id}_dashboard"
        
        # Check cache inside try block to catch any cache-related errors
        if cached := cache.get(cache_key):
            logger.debug(f"Returning cached dashboard for user {user.id}")
            return Response(cached)

        logger.debug(f"Generating dashboard for user {user.id}")
        
        # Get enrollments with related data
        enrollments = user.enrollments.select_related('program').prefetch_related(
            'program__modules__topics'
        )
        
        # Calculate all metrics
        results = {
            'completed_programs': enrollments.filter(is_completed=True).count(),
            'completed_topics': user.user_progress.filter(is_completed=True).count(),
            'total_topics': Topic.objects.filter(
                module__program__enrollments__user=user
            ).count(),
            'learning_hours': user.learning_sessions.aggregate(
                total=Sum(Cast('duration_hours', FloatField()))
            )['total'] or 0.0,
            'activities': list(user.activities.order_by('-timestamp')[:5].values(
                'id', 'activity_type', 'timestamp', 'details'
            ))
        }

        logger.debug(f"Raw results: {results}")
        
        # Calculate overall progress
        current_progress = 0
        if results['total_topics'] > 0:
            current_progress = int((results['completed_topics'] / results['total_topics']) * 100)
            if current_progress > 100:
                logger.warning(f"Progress >100% for user {user.id}")
                current_progress = 100

        # Build progress data per program
        progress_data = []
        for enrollment in enrollments:
            completed = user.user_progress.filter(
                is_completed=True,
                topic__module__program=enrollment.program
            ).count()
            total = Topic.objects.filter(
                module__program=enrollment.program
            ).count()
            progress = int((completed / total * 100)) if total else 0
            progress_data.append({
                'program_id': enrollment.program.id,
                'title': enrollment.program.title,
                'progress': progress
            })

        # Prepare final response data
        data = {
            'completed_programs': results['completed_programs'],
            'current_progress': current_progress,
            'learning_hours': float(results['learning_hours']),
            'recent_activities': results['activities'],
            'progress_data': progress_data,
            'stats': {
                'completed_topics': results['completed_topics'],
                'total_topics': results['total_topics']
            }
        }

        # Add current program info if available
        if hasattr(user, 'current_module') and user.current_module:
            try:
                data['current_program'] = {
                    'title': user.current_module.program.title,
                    'thumbnail': request.build_absolute_uri(
                        user.current_module.program.thumbnail.url
                    ) if user.current_module.program.thumbnail else None
                }
            except Exception as e:
                logger.warning(f"Couldn't add current program info: {str(e)}")

        logger.debug(f"Final dashboard data: {data}")
        
        # Cache the results only after successful calculation
        try:
            cache.set(cache_key, data, 300)  # Cache for 5 minutes
        except Exception as e:
            logger.warning(f"Could not cache dashboard data: {str(e)}")
            # Continue anyway - caching failure shouldn't break the response

        return Response(data)

    except Exception as e:
        logger.error(f"Dashboard error for user {request.user.id}", exc_info=True)
        if settings.DEBUG:
            return Response({
                'error': str(e),
                'type': type(e).__name__
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response(
            {'error': 'Could not load dashboard data'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )