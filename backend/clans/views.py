from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Clan, ClanMember
from .serializers import ClanSerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_clans(request):
    clans = Clan.objects.all()[:20]
    return Response(ClanSerializer(clans, many=True).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_clan(request):
    try:
        membership = ClanMember.objects.get(user=request.user)
        return Response(ClanSerializer(membership.clan).data)
    except ClanMember.DoesNotExist:
        return Response(None, status=status.HTTP_204_NO_CONTENT)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_clan(request):
    name = request.data.get('name', '').strip()
    if len(name) < 3 or len(name) > 12:
        return Response({'error': 'Name must be 3-12 characters'}, status=status.HTTP_400_BAD_REQUEST)

    if ClanMember.objects.filter(user=request.user).exists():
        return Response({'error': 'Already in a clan'}, status=status.HTTP_400_BAD_REQUEST)

    user = request.user
    if not user.spend_bits(1000):
        return Response({'error': 'Not enough bits (1000 required)'}, status=status.HTTP_400_BAD_REQUEST)

    clan = Clan.objects.create(name=name, created_by=user)
    ClanMember.objects.create(clan=clan, user=user)
    return Response(ClanSerializer(clan).data, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def join_clan(request):
    clan_id = request.data.get('clan_id')
    if ClanMember.objects.filter(user=request.user).exists():
        return Response({'error': 'Already in a clan'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        clan = Clan.objects.get(id=clan_id)
    except Clan.DoesNotExist:
        return Response({'error': 'Clan not found'}, status=status.HTTP_404_NOT_FOUND)

    ClanMember.objects.create(clan=clan, user=request.user)
    return Response(ClanSerializer(clan).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def leave_clan(request):
    try:
        membership = ClanMember.objects.get(user=request.user)
        membership.delete()
        return Response({'message': 'Left clan'})
    except ClanMember.DoesNotExist:
        return Response({'error': 'Not in a clan'}, status=status.HTTP_400_BAD_REQUEST)
