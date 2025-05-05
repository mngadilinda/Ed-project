from rest_framework import serializers
from .models import (
    Program, Module, Topic, TopicResource,
    Assessment, Question, UserProfile,
    UserProgress, TestResult, ContentUpload
)
from django.contrib.auth import get_user_model
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.utils import timezone
from django.urls import reverse


User = get_user_model()


class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True, 
        required=True, 
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    password2 = serializers.CharField(
        write_only=True, 
        required=True,
        style={'input_type': 'password'}
    )

    class Meta:
        model = UserProfile
        fields = ['email', 'password', 'password2', 'first_name', 'last_name', 'role']
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name': {'required': True},
        }

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields don't match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        user = UserProfile.objects.create_user(**validated_data)
        return user


class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )



class ProgramSerializer(serializers.ModelSerializer):
    class Meta:
        model = Program
        fields = '__all__'

    def get_progress(self, obj):
        # Calculate progress for the current user
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return request.user.get_program_progress(obj)
        return 0

class ModuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Module
        fields = '__all__'

class TopicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Topic
        fields = '__all__'

class TopicResourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = TopicResource
        fields = '__all__'

class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = '__all__'

class AssessmentSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)
    
    class Meta:
        model = Assessment
        fields = '__all__'

class UserProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProgress
        fields = '__all__'

class TestResultSerializer(serializers.ModelSerializer):
    assessment = AssessmentSerializer(read_only=True)
    
    class Meta:
        model = TestResult
        fields = '__all__'

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        
        # Add custom claims
        token['email'] = user.email
        token['role'] = user.role
        token['is_approved'] = user.is_approved
        token['first_name'] = user.first_name
        token['last_name'] = user.last_name
        
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        
        # Add additional user data to the response
        user = self.user
        data.update({
            'user': {
                'id': user.id,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'role': user.role,
                'is_approved': user.is_approved
            }
        })
        return data
    


class ContentUploadSerializer(serializers.ModelSerializer):
    # Read-only fields
    status_display = serializers.CharField(
        source='get_status_display',
        read_only=True
    )
    educator_name = serializers.SerializerMethodField()
    content_link = serializers.SerializerMethodField()
    processing_time = serializers.SerializerMethodField()
    file_name = serializers.SerializerMethodField()
    
    # For write operations
    upload_type = serializers.ChoiceField(
        choices=ContentUpload.UPLOAD_TYPES,
        write_only=True
    )
    text_file = serializers.FileField(write_only=True)

    class Meta:
        model = ContentUpload
        fields = [
            # Core fields
            'id', 'upload_type', 'status',
            
            # Read-only display fields
            'status_display', 'educator_name', 'content_link',
            'processing_time', 'file_name',
            
            # Write-only fields
            'text_file',
            
            # Timestamps
            'created_at', 'processed_at',
            
            # Logging
            'log'
        ]
        read_only_fields = [
            'id', 'status', 'status_display', 'educator_name',
            'content_link', 'processing_time', 'created_at',
            'processed_at', 'log', 'file_name'
        ]

    def get_educator_name(self, obj):
        """Return formatted educator name"""
        return f"{obj.educator.first_name} {obj.educator.last_name}"

    def get_content_link(self, obj):
        """
        Generate link to the created content if available
        """
        if not obj.content_id or not obj.content_type:
            return None
            
        # Map content types to view names
        view_name_map = {
            'program': 'program-detail',
            'module': 'module-detail',
            'topic': 'topic-detail',
            'assessment': 'assessment-detail'
        }
        
        view_name = view_name_map.get(obj.content_type.lower())
        if not view_name:
            return None
            
        request = self.context.get('request')
        if not request:
            return None
            
        return request.build_absolute_uri(
            reverse(view_name, kwargs={'pk': obj.content_id})
        )

    def get_processing_time(self, obj):
        """
        Calculate processing duration in seconds
        """
        if not obj.processed_at or not obj.created_at:
            return None
        return (obj.processed_at - obj.created_at).total_seconds()

    def get_file_name(self, obj):
        """Extract the original filename"""
        return obj.text_file.name.split('/')[-1] if obj.text_file else None

    def validate_upload_type(self, value):
        """Ensure valid upload type"""
        valid_types = [choice[0] for choice in ContentUpload.UPLOAD_TYPES]
        if value not in valid_types:
            raise serializers.ValidationError(
                f"Invalid upload type. Must be one of: {', '.join(valid_types)}"
            )
        return value

    def validate(self, data):
        """Additional validation for the entire payload"""
        # Ensure educator isn't changing after creation
        if self.instance and 'educator' in data:
            raise serializers.ValidationError(
                "Educator cannot be modified after creation"
            )
            
        # For new uploads, ensure file is provided
        if not self.instance and not data.get('text_file'):
            raise serializers.ValidationError(
                "A file must be provided for new uploads"
            )
            
        return data

    def create(self, validated_data):
        """Handle creation with educator assignment"""
        # Educator comes from the request, not the input data
        validated_data['educator'] = self.context['request'].user
        return super().create(validated_data)



class EducatorProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name',
            'date_joined', 'rating', 'current_module'
        ]
        read_only_fields = ['id', 'email', 'date_joined']


class EducatorListSerializer(serializers.ModelSerializer):
    content_count = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name',
            'is_approved', 'date_joined', 'content_count'
        ]
    
    def get_content_count(self, obj):
        return obj.content_uploads.count()
    

class UserProfileSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    current_module = ModuleSerializer(read_only=True)  # Assuming you have ModuleSerializer
    
    class Meta:
        model = UserProfile
        fields = [
            'id', 'email', 'first_name', 'last_name', 'full_name', 'role',
            'is_approved', 'rating', 'current_module', 'weaknesses',
            'subscription_type', 'subscription_expiry'
        ]
        read_only_fields = [
            'id', 'email', 'role', 'is_approved', 'rating', 
            'full_name', 'weaknesses'
        ]
    
    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}"
    
    def validate_subscription_type(self, value):
        valid_types = [None, '', 'BASIC', 'PREMIUM', 'ENTERPRISE']  # Add your valid types
        if value not in valid_types:
            raise serializers.ValidationError("Invalid subscription type")
        return value
    
    def validate_subscription_expiry(self, value):
        if value and value < timezone.now().date():
            raise serializers.ValidationError("Expiry date cannot be in the past")
        return value
    
