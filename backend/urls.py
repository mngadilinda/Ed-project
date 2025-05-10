from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ProgramViewSet, ModuleViewSet, TopicViewSet,
    TopicResourceViewSet, AssessmentViewSet,
    UserViewSet, QuestionViewSet, ContentUploadViewSet, check_math_answer,
    RegisterView, LoginView, LogoutView, check_auth, get_csrf,
    CustomTokenObtainPairView,UserProfileView,
    UserManagementAPIView, UserDetailAPIView, dashboard_view,
    MathWorkingsViewSet, MathProblemViewSet,
    SubmitAnswerView
)
from rest_framework_simplejwt.views import (
    TokenRefreshView,TokenVerifyView
)

router = DefaultRouter()
router.register(r'programs', ProgramViewSet)
router.register(r'modules', ModuleViewSet)
router.register(r'topics', TopicViewSet)
router.register(r'resources', TopicResourceViewSet)
router.register(r'assessments', AssessmentViewSet)
router.register(r'users', UserViewSet)
router.register(r'math-problems', MathProblemViewSet)
router.register(r'math-workings', MathWorkingsViewSet)
router.register(r'questions', QuestionViewSet)
router.register(r'content-uploads', ContentUploadViewSet, basename='content-upload')

urlpatterns = [
    path('auth/csrf/', get_csrf, name='get-csrf'),
    path('', include(router.urls)),
    path('auth/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/check-math/', check_math_answer, name='check_math'),
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    path('auth/check/', check_auth, name='check-auth'),
    path('auth/verify/', TokenVerifyView.as_view(), name='token_verify'),
    path('users/', UserManagementAPIView.as_view(), name='user-management'),
    path('users/<int:pk>/', UserDetailAPIView.as_view(), name='user-detail'),
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('user/dashboard/', dashboard_view, name='dashboard'),
    path('submit-answer/<int:question_id>/', SubmitAnswerView.as_view(), name='submit-answer'),

]