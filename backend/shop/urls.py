from django.urls import path
from . import views

urlpatterns = [
    path('items/', views.items_view),
    path('buy/', views.buy_item),
    path('equip/', views.equip_item),
]
