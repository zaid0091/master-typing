from django.urls import path
from . import views

urlpatterns = [
    path('list/', views.list_clans),
    path('my/', views.my_clan),
    path('create/', views.create_clan),
    path('join/', views.join_clan),
    path('leave/', views.leave_clan),
]
