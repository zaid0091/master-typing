from django.urls import path
from . import views

urlpatterns = [
    path('submit/', views.submit_test),
    path('history/', views.history_view),
    path('history/clear/', views.clear_history),
    path('stats/', views.stats_view),
    path('achievements/', views.achievements_view),
    path('titles/', views.titles_view),
]
