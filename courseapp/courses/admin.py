from django.contrib import admin
from django.template.response import TemplateResponse
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import Category, Course, Lesson, Tag, User, Comment, Like, Forum, Assignment, Book, Payment, Statistics
from django.utils.html import mark_safe
from ckeditor_uploader.widgets import CKEditorUploadingWidget
from django import forms
from django.urls import path
from courses import dao


class CourseAppAdminSite(admin.AdminSite):
    site_header = 'iSuccess'

    def get_urls(self):
        return [
            path('course-stats/', self.stats_view)
        ] + super().get_urls()

    def stats_view(self, request):
        return TemplateResponse(request, 'admin/stats.html', {
            'stats': dao.count_courses_by_cate()
        })


admin_site = CourseAppAdminSite(name='myapp')


class LessonAdmin(admin.ModelAdmin):
    list_display = ['pk', 'subject', 'course', 'created_date', 'user']
    list_filter = ['course', 'created_date']
    search_fields = ['subject']
    readonly_fields = ['img']

    def img(self, lesson):
        if lesson and lesson.image:
            return mark_safe(
                '<img src="/static/{url}" width="120" />'.format(url=lesson.image.name)
            )


class TagAdmin(admin.ModelAdmin):
    list_display = ['pk', 'name', 'created_date']
    search_fields = ['name']


class CategoryAdmin(admin.ModelAdmin):
    list_display = ['pk', 'name']
    search_fields = ['name']
    list_filter = ['id', 'name']


class CourseForm(forms.ModelForm):
    description = forms.CharField(widget=CKEditorUploadingWidget)

    class Meta:
        model = Course
        fields = '__all__'


class TagInlineAdmin(admin.StackedInline):
    model = Course.tags.through


class CourseAdmin(admin.ModelAdmin):
    list_display = ['pk', 'subject', 'created_date', 'updated_date', 'category', 'active']
    readonly_fields = ['img']
    inlines = [TagInlineAdmin]
    form = CourseForm

    def img(self, course):
        if course:
            return mark_safe(
                '<img src="/static/{url}" width="120" />'.format(url=course.image.name)
            )

    class Media:
        css = {
            'all': ('/static/css/style.css',)
        }


class CommentAdmin(admin.ModelAdmin):
    list_display = ['pk', 'lesson', 'user', 'content', 'created_date']
    search_fields = ['content']
    list_filter = ['lesson', 'user']


class LikeAdmin(admin.ModelAdmin):
    list_display = ['pk', 'lesson', 'user', 'active', 'created_date']
    list_filter = ['lesson', 'user', 'active']


class AssignmentAdmin(admin.ModelAdmin):
    list_display = ['pk', 'lesson', 'user', 'created_date']
    list_filter = ['lesson', 'user']


class BookAdmin(admin.ModelAdmin):
    list_display = ['pk', 'name', 'author', 'price', 'created_date']
    search_fields = ['name', 'author']
    list_filter = ['price']


class PaymentAdmin(admin.ModelAdmin):
    list_display = ['pk', 'user', 'book', 'created_date']
    list_filter = ['user', 'book']


class ForumAdmin(admin.ModelAdmin):
    list_display = ['pk', 'name', 'user', 'created_date']
    search_fields = ['name']
    list_filter = ['user']


class StatisticsAdmin(admin.ModelAdmin):
    list_display = ['pk', 'lesson', 'comment_count', 'like_count', 'created_date']
    list_filter = ['lesson']


# Quản lý User
class UserAdmin(BaseUserAdmin):
    list_display = ('id', 'username', 'email', 'first_name', 'last_name', 'avatar', 'is_staff', 'is_superuser', 'is_active')
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'groups')
    search_fields = ('username', 'email', 'first_name', 'last_name')
    ordering = ('username',)

    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Personal Info', {'fields': ('first_name', 'last_name', 'email', 'avatar')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important Dates', {'fields': ('last_login', 'date_joined')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'first_name', 'last_name', 'email', 'avatar', 'password1', 'password2', 'is_staff',
                       'is_superuser')}
         ),
    )


admin_site.register(User, UserAdmin)
admin_site.register(Category, CategoryAdmin)
admin_site.register(Course, CourseAdmin)
admin_site.register(Lesson, LessonAdmin)
admin_site.register(Tag, TagAdmin)
admin_site.register(Comment, CommentAdmin)
admin_site.register(Like, LikeAdmin)
admin_site.register(Assignment, AssignmentAdmin)
admin_site.register(Book, BookAdmin)
admin_site.register(Payment, PaymentAdmin)
admin_site.register(Forum, ForumAdmin)
admin_site.register(Statistics, StatisticsAdmin)

from oauth2_provider.models import AccessToken, RefreshToken, Application


# Registering models related to OAuth
class AccessTokenAdmin(admin.ModelAdmin):
    list_display = ['user', 'token', 'expires', 'application']


class RefreshTokenAdmin(admin.ModelAdmin):
    list_display = ['user', 'token', 'access_token', 'application']


class ApplicationAdmin(admin.ModelAdmin):
    list_display = ['name', 'client_id', 'client_type']


admin_site.register(AccessToken, AccessTokenAdmin)
admin_site.register(RefreshToken, RefreshTokenAdmin)
admin_site.register(Application, ApplicationAdmin)
