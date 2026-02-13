from django.db import models
from django.conf import settings


class GlobalScore(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='global_scores')
    username = models.CharField(max_length=50)
    avatar = models.CharField(max_length=10, default='👤')
    wpm = models.IntegerField()
    accuracy = models.FloatField()
    difficulty = models.CharField(max_length=20)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-wpm']
