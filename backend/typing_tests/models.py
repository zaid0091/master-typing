from django.db import models
from django.conf import settings


class TestResult(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='test_results')
    wpm = models.IntegerField()
    cpm = models.IntegerField(default=0)
    accuracy = models.FloatField()
    errors = models.IntegerField(default=0)
    time = models.IntegerField()  # seconds
    difficulty = models.CharField(max_length=20)
    language = models.CharField(max_length=30, default='english')
    mode = models.CharField(max_length=20, default='normal')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.wpm} WPM"


class Achievement(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='achievements')
    achievement_id = models.CharField(max_length=50)
    unlocked_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'achievement_id')


class Title(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='titles')
    title_id = models.CharField(max_length=50)
    unlocked_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'title_id')
