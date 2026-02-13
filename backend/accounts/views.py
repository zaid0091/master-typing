from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.contrib.auth import authenticate, login, logout, get_user_model
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_exempt
from .serializers import UserSerializer, RegisterSerializer, LoginSerializer

User = get_user_model()


@api_view(['POST'])
@permission_classes([AllowAny])
@ensure_csrf_cookie
def register_view(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        login(request, user)
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
@ensure_csrf_cookie
def login_view(request):
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user = authenticate(
            username=serializer.validated_data['username'],
            password=serializer.validated_data['password'],
        )
        if user:
            login(request, user)
            return Response(UserSerializer(user).data)
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def logout_view(request):
    logout(request)
    return Response({'message': 'Logged out'})


@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def profile_view(request):
    user = request.user
    if request.method == 'PATCH':
        allowed = ['avatar', 'equipped_theme', 'equipped_aura', 'equipped_pet', 'equipped_title']
        for field in allowed:
            if field in request.data:
                setattr(user, field, request.data[field])
        user.save()
    return Response(UserSerializer(user).data)


@api_view(['GET'])
@permission_classes([AllowAny])
@ensure_csrf_cookie
def session_view(request):
    if request.user.is_authenticated:
        return Response(UserSerializer(request.user).data)
    return Response(None, status=status.HTTP_204_NO_CONTENT)
