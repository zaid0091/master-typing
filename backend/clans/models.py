from django.db import models
from django.conf import settings


class Clan(models.Model):
    name = models.CharField(max_length=12, unique=True)
    banner = models.CharField(max_length=10, default='🚩')
    total_words = models.FloatField(default=0)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='created_clans')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class ClanMember(models.Model):
    clan = models.ForeignKey(Clan, on_delete=models.CASCADE, related_name='members')
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='clan_membership')
    best_wpm = models.IntegerField(default=0)
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('clan', 'user')
