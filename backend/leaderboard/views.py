from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from .models import GlobalScore


@api_view(['GET'])
@permission_classes([AllowAny])
def global_leaderboard(request):
    scores = GlobalScore.objects.all()[:50]
    data = [{
        'username': s.username,
        'avatar': s.avatar,
        'wpm': s.wpm,
        'accuracy': s.accuracy,
        'difficulty': s.difficulty,
        'created_at': s.created_at.isoformat(),
    } for s in scores]
    return Response(data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_global_score(request):
    user = request.user
    GlobalScore.objects.create(
        user=user,
        username=user.username,
        avatar=user.avatar,
        wpm=request.data.get('wpm', 0),
        accuracy=request.data.get('accuracy', 0),
        difficulty=request.data.get('difficulty', 'medium'),
    )
    return Response({'message': 'Score submitted'}, status=status.HTTP_201_CREATED)
