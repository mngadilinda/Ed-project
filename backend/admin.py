from django.contrib import admin
from .models import (
    Program, Module, Topic,
    TopicResource, Assessment, Question,
    UserProgress, TestResult,
    UserProfile
)

# Register your models here.
admin.site.register(Program)
admin.site.register(Module)
admin.site.register(Topic)
admin.site.register(TopicResource)
admin.site.register(Assessment)
admin.site.register(Question)
admin.site.register(UserProfile)
admin.site.register(UserProgress)
admin.site.register(TestResult)