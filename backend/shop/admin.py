from django.contrib import admin
from .models import Purchase


@admin.register(Purchase)
class PurchaseAdmin(admin.ModelAdmin):
    list_display = ('user', 'item_id', 'purchased_at')
    search_fields = ('user__username', 'item_id')
