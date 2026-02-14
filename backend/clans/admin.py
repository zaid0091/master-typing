from django.contrib import admin
from .models import Clan, ClanMember


class ClanMemberInline(admin.TabularInline):
    model = ClanMember
    extra = 0


@admin.register(Clan)
class ClanAdmin(admin.ModelAdmin):
    list_display = ('name', 'banner', 'total_words', 'created_by', 'created_at')
    search_fields = ('name',)
    inlines = [ClanMemberInline]


@admin.register(ClanMember)
class ClanMemberAdmin(admin.ModelAdmin):
    list_display = ('user', 'clan', 'best_wpm', 'joined_at')
    search_fields = ('user__username', 'clan__name')
