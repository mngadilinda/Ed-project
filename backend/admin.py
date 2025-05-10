from django.contrib import admin
from .models import (
    Program, Module, Topic,
    TopicResource, Assessment, Question,
    UserProgress, TestResult,
    UserProfile
)
from django.utils.html import format_html
import markdown


# Register your models here.
admin.site.register(Program)
admin.site.register(Module)
admin.site.register(Topic)
class TopicAdmin(admin.ModelAdmin):
    readonly_fields = ('preview_content',)

    def preview_content(self, obj):
        return format_html(
            '<div style="border: 1px solid #ddd; padding: 10px;">'
            f'{markdown.markdown(obj.formatted_content)}'
            '</div>'
        )
admin.site.register(TopicResource)
admin.site.register(Assessment)
admin.site.register(Question)
admin.site.register(UserProfile)
admin.site.register(UserProgress)
admin.site.register(TestResult)