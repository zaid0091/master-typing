from rest_framework import serializers
from .models import TestResult, Achievement, Title


class TestResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestResult
        fields = ['id', 'wpm', 'cpm', 'accuracy', 'errors', 'time', 'difficulty', 'language', 'mode', 'created_at']
        read_only_fields = ['id', 'created_at']


class AchievementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Achievement
        fields = ['achievement_id', 'unlocked_at']


class TitleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Title
        fields = ['title_id', 'unlocked_at']
