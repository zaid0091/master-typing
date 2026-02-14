from django.contrib import admin
from .models import GlobalScore


@admin.register(GlobalScore)
class GlobalScoreAdmin(admin.ModelAdmin):
    list_display = ('username', 'wpm', 'accuracy', 'difficulty', 'created_at')
    list_filter = ('difficulty',)
    search_fields = ('username',)
