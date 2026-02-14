from django.contrib import admin
from .models import TestResult, Achievement, Title


@admin.register(TestResult)
class TestResultAdmin(admin.ModelAdmin):
    list_display = ('user', 'wpm', 'accuracy', 'time', 'difficulty', 'mode', 'created_at')
    list_filter = ('difficulty', 'mode', 'language')
    search_fields = ('user__username',)


@admin.register(Achievement)
class AchievementAdmin(admin.ModelAdmin):
    list_display = ('user', 'achievement_id', 'unlocked_at')
    search_fields = ('user__username',)


@admin.register(Title)
class TitleAdmin(admin.ModelAdmin):
    list_display = ('user', 'title_id', 'unlocked_at')
    search_fields = ('user__username',)
