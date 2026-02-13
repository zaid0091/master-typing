from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Purchase

SHOP_ITEMS = [
    {'id': 'theme-nord', 'name': 'Nordic Chill', 'type': 'theme', 'price': 500, 'icon': '❄️', 'desc': 'A cool, frost-blue theme.', 'tag': 'New'},
    {'id': 'theme-sunset', 'name': 'Desert Sunset', 'type': 'theme', 'price': 500, 'icon': '🌅', 'desc': 'Warm gradients.', 'tag': 'Exclusive'},
    {'id': 'aura-gold', 'name': 'Gold Aura', 'type': 'aura', 'price': 1000, 'icon': '✨', 'desc': 'Radiant golden glow.', 'tag': 'Premium'},
    {'id': 'pet-owl', 'name': 'Wise Owl', 'type': 'pet', 'price': 2000, 'icon': '🦉', 'desc': 'Watches your accuracy.', 'tag': 'Companion'},
    {'id': 'pet-dragon', 'name': 'Fire Drake', 'type': 'pet', 'price': 5000, 'icon': '🐉', 'desc': 'Loves high speed.', 'tag': 'Legendary'},
]


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def items_view(request):
    purchased = list(Purchase.objects.filter(user=request.user).values_list('item_id', flat=True))
    items = []
    for item in SHOP_ITEMS:
        items.append({**item, 'owned': item['id'] in purchased})
    return Response(items)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def buy_item(request):
    item_id = request.data.get('item_id')
    item = next((i for i in SHOP_ITEMS if i['id'] == item_id), None)
    if not item:
        return Response({'error': 'Item not found'}, status=status.HTTP_404_NOT_FOUND)

    if Purchase.objects.filter(user=request.user, item_id=item_id).exists():
        return Response({'error': 'Already owned'}, status=status.HTTP_400_BAD_REQUEST)

    user = request.user
    if not user.spend_bits(item['price']):
        return Response({'error': 'Not enough bits'}, status=status.HTTP_400_BAD_REQUEST)

    Purchase.objects.create(user=user, item_id=item_id)
    from accounts.serializers import UserSerializer
    return Response({'message': f"Purchased {item['name']}", 'bits': user.bits, 'user': UserSerializer(user).data})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def equip_item(request):
    item_id = request.data.get('item_id')
    item = next((i for i in SHOP_ITEMS if i['id'] == item_id), None)
    if not item:
        return Response({'error': 'Item not found'}, status=status.HTTP_404_NOT_FOUND)

    if not Purchase.objects.filter(user=request.user, item_id=item_id).exists():
        return Response({'error': 'Not owned'}, status=status.HTTP_400_BAD_REQUEST)

    user = request.user
    field_map = {'theme': 'equipped_theme', 'aura': 'equipped_aura', 'pet': 'equipped_pet'}
    field = field_map.get(item['type'])
    if field:
        setattr(user, field, item_id)
        user.save(update_fields=[field])
        user.refresh_from_db()

    from accounts.serializers import UserSerializer
    return Response({'message': f"Equipped {item['name']}", 'user': UserSerializer(user).data})
