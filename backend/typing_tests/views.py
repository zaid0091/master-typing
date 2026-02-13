import math
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.db.models import Max, Avg, Count, Sum
from .models import TestResult, Achievement, Title
from .serializers import TestResultSerializer, AchievementSerializer, TitleSerializer


ACHIEVEMENTS = [
    {'id': 'speed-100', 'condition': lambda r: r['wpm'] >= 100},
    {'id': 'accuracy-99', 'condition': lambda r: r['accuracy'] >= 99},
    {'id': 'marathon', 'condition': lambda r: r['time'] >= 120},
    {'id': 'speedster', 'condition': lambda r: r['wpm'] >= 120},
    {'id': 'first-test', 'condition': lambda r: True},
]

TITLES_CONFIG = [
    {'id': 'novice', 'condition': lambda stats, level: level >= 2},
    {'id': 'enthusiast', 'condition': lambda stats, level: stats['total_tests'] >= 10},
    {'id': 'precision', 'condition': lambda stats, level: stats.get('avg_acc', 0) >= 98},
    {'id': 'speed-demon', 'condition': lambda stats, level: stats.get('best_wpm', 0) >= 100},
    {'id': 'zen-master', 'condition': lambda stats, level: stats['total_tests'] >= 50},
    {'id': 'epic-typer', 'condition': lambda stats, level: level >= 10},
    {'id': 'ghost-king', 'condition': lambda stats, level: stats.get('best_wpm', 0) >= 120},
    {'id': 'typing-legend', 'condition': lambda stats, level: level >= 20},
]


def calculate_xp(result_data):
    difficulty_bonus = {'easy': 1, 'medium': 1.5, 'hard': 2}
    base_xp = (result_data['wpm'] * result_data['accuracy']) / 10
    return round(base_xp * difficulty_bonus.get(result_data['difficulty'].lower(), 1))


def calculate_bits(result_data, mode, time_seconds):
    bits = math.floor(result_data['wpm'] * (result_data['accuracy'] / 100))
    if mode == 'gauntlet':
        survival_bonus = math.floor(time_seconds / 30) * 50
        bits += survival_bonus
    return bits


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_test(request):
    serializer = TestResultSerializer(data=request.data)
    if serializer.is_valid():
        result = serializer.save(user=request.user)
        user = request.user
        data = serializer.validated_data

        # XP & Bits
        xp_gained = calculate_xp(data)
        bits_earned = calculate_bits(data, data.get('mode', 'normal'), data['time'])
        user.xp += xp_gained
        user.bits += bits_earned
        words = data.get('cpm', 0) / 5 if data.get('cpm') else data['wpm'] * (data['time'] / 60) / 5
        user.total_words_typed += words
        user.save(update_fields=['xp', 'bits', 'total_words_typed'])

        # Check achievements
        new_achievements = []
        for ach in ACHIEVEMENTS:
            if not Achievement.objects.filter(user=user, achievement_id=ach['id']).exists():
                if ach['condition'](data):
                    Achievement.objects.create(user=user, achievement_id=ach['id'])
                    new_achievements.append(ach['id'])

        # Check titles
        stats = get_user_stats(user)
        level = user.level
        new_titles = []
        for title in TITLES_CONFIG:
            if not Title.objects.filter(user=user, title_id=title['id']).exists():
                if title['condition'](stats, level):
                    Title.objects.create(user=user, title_id=title['id'])
                    new_titles.append(title['id'])

        return Response({
            'result': TestResultSerializer(result).data,
            'xp_gained': xp_gained,
            'bits_earned': bits_earned,
            'new_achievements': new_achievements,
            'new_titles': new_titles,
            'user': {
                'xp': user.xp,
                'bits': user.bits,
                'level': user.level,
                'xp_in_current_level': user.xp_in_current_level,
            }
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


def get_user_stats(user):
    results = TestResult.objects.filter(user=user)
    agg = results.aggregate(
        total_tests=Count('id'),
        avg_wpm=Avg('wpm'),
        avg_acc=Avg('accuracy'),
        best_wpm=Max('wpm'),
        total_time=Sum('time'),
    )
    return {
        'total_tests': agg['total_tests'] or 0,
        'avg_wpm': round(agg['avg_wpm'] or 0),
        'avg_acc': round(agg['avg_acc'] or 0),
        'best_wpm': agg['best_wpm'] or 0,
        'total_time': agg['total_time'] or 0,
    }


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def history_view(request):
    results = TestResult.objects.filter(user=request.user)[:100]
    return Response(TestResultSerializer(results, many=True).data)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def clear_history(request):
    TestResult.objects.filter(user=request.user).delete()
    return Response({'message': 'History cleared'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def stats_view(request):
    user = request.user
    stats = get_user_stats(user)

    # Personal bests by difficulty
    for diff in ['easy', 'medium', 'hard']:
        pb = TestResult.objects.filter(user=user, difficulty=diff).aggregate(Max('wpm'))
        stats[f'pb_{diff}'] = pb['wpm__max'] or 0

    # Streak
    from django.utils import timezone
    from datetime import timedelta
    today = timezone.now().date()
    streak = 0
    for i in range(365):
        check_date = today - timedelta(days=i)
        if TestResult.objects.filter(user=user, created_at__date=check_date).exists():
            streak += 1
        elif i == 0:
            continue
        else:
            break

    stats['streak'] = streak
    stats['total_words_typed'] = user.total_words_typed
    return Response(stats)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def achievements_view(request):
    achievements = Achievement.objects.filter(user=request.user)
    return Response(AchievementSerializer(achievements, many=True).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def titles_view(request):
    titles = Title.objects.filter(user=request.user)
    return Response(TitleSerializer(titles, many=True).data)
