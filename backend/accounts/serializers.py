from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    level = serializers.IntegerField(read_only=True)
    xp_in_current_level = serializers.IntegerField(read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'avatar', 'xp', 'bits', 'level',
            'xp_in_current_level', 'equipped_theme', 'equipped_aura',
            'equipped_pet', 'equipped_title', 'total_words_typed',
        ]
        read_only_fields = ['id', 'xp', 'bits']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ['username', 'password']

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()
