from rest_framework import serializers
from .models import Clan, ClanMember


class ClanMemberSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = ClanMember
        fields = ['username', 'best_wpm']


class ClanSerializer(serializers.ModelSerializer):
    members = ClanMemberSerializer(many=True, read_only=True)
    member_count = serializers.IntegerField(source='members.count', read_only=True)

    class Meta:
        model = Clan
        fields = ['id', 'name', 'banner', 'total_words', 'members', 'member_count']
