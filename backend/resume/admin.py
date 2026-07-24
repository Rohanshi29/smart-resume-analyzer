# resume/admin.py
import os
from django.contrib import admin
from django.utils.html import format_html
from .models import Resume


@admin.register(Resume)
class ResumeAdmin(admin.ModelAdmin):
    list_display = ("user_email", "resume_link", "uploaded_at")

    def user_email(self, obj):
        if obj.user:
            return obj.user.email or obj.user.username
        return "—"
    user_email.short_description = "User"
    user_email.admin_order_field = "user__email"

    def resume_link(self, obj):
        if obj.resume_file:
            filename = os.path.basename(obj.resume_file.name)
            return format_html(
                '<a href="{}" target="_blank" rel="noopener noreferrer">{}</a>',
                obj.resume_file.url,
                filename,
            )
        return "—"
    resume_link.short_description = "Resume File"
    resume_link.admin_order_field = "resume_file"