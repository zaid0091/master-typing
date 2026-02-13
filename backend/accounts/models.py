from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    avatar = models.CharField(max_length=10, default='👤')
    xp = models.IntegerField(default=0)
    bits = models.IntegerField(default=0)
    equipped_theme = models.CharField(max_length=50, blank=True, default='')
    equipped_aura = models.CharField(max_length=50, blank=True, default='')
    equipped_pet = models.CharField(max_length=50, blank=True, default='')
    equipped_title = models.CharField(max_length=50, blank=True, default='')
    total_words_typed = models.FloatField(default=0)

    @property
    def level(self):
        return (self.xp // 1000) + 1

    @property
    def xp_in_current_level(self):
        return self.xp % 1000

    def add_xp(self, amount):
        self.xp += amount
        self.save(update_fields=['xp'])

    def add_bits(self, amount):
        self.bits += amount
        self.save(update_fields=['bits'])

    def spend_bits(self, amount):
        if self.bits >= amount:
            self.bits -= amount
            self.save(update_fields=['bits'])
            return True
        return False
