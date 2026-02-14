from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    path('register/', views.register_view),
    path('login/', views.login_view),
    path('logout/', views.logout_view),
    path('profile/', views.profile_view),
    path('session/', views.session_view),
    path('token/refresh/', TokenRefreshView.as_view()),
]
