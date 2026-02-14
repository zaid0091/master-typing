from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'avatar', 'xp', 'bits', 'total_words_typed', 'is_staff')
    list_filter = ('is_staff', 'is_active')
    search_fields = ('username',)
    fieldsets = UserAdmin.fieldsets + (
        ('Game Data', {'fields': ('avatar', 'xp', 'bits', 'equipped_theme', 'equipped_aura', 'equipped_pet', 'equipped_title', 'total_words_typed')}),
    )
