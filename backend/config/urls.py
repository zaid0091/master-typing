import os
from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic import TemplateView
from django.conf import settings
from django.http import FileResponse

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/tests/', include('typing_tests.urls')),
    path('api/shop/', include('shop.urls')),
    path('api/clans/', include('clans.urls')),
    path('api/leaderboard/', include('leaderboard.urls')),
]

# Serve React frontend in production
if not settings.DEBUG:
    def serve_frontend(request):
        index_path = settings.FRONTEND_DIR / 'index.html'
        return FileResponse(open(index_path, 'rb'), content_type='text/html')

    urlpatterns += [
        re_path(r'^(?!api/|admin/|static/).*$', serve_frontend),
    ]
