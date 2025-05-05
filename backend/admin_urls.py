# backend/urls/educator_admin.py
from django.urls import path
from .views import (
    EducatorProfileAPIView,
    EducatorContentAPIView,
    EducatorContentDetailAPIView,
    EducatorListAPIView,
    EducatorApprovalAPIView
)

urlpatterns = [
    # Educator endpoints
    path('educator-profile/', EducatorProfileAPIView.as_view(), name='educator-profile'),
    path('content/', EducatorContentAPIView.as_view(), name='educator-content'),
    path('content/<int:pk>/', EducatorContentDetailAPIView.as_view(), name='educator-content-detail'),
    
    # Admin endpoints
    path('educators/', EducatorListAPIView.as_view(), name='educator-list'),
    path('educators/<int:pk>/approve/', EducatorApprovalAPIView.as_view(), name='educator-approve'),
]