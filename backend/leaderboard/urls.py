from django.urls import path
from . import views

urlpatterns = [
    path('global/', views.global_leaderboard),
    path('submit/', views.submit_global_score),
]
