from rest_framework import serializers
from .models import FamilyTree


class FamilyTreeSerializer(serializers.ModelSerializer):
    """Family tree serializer"""

    card_count = serializers.SerializerMethodField()
    max_cards = serializers.SerializerMethodField()

    class Meta:
        model = FamilyTree
        fields = ['id', 'tree_id', 'name', 'family_data', 'next_id', 'card_count', 'max_cards', 'created_at', 'last_updated']
        read_only_fields = ['id', 'tree_id', 'card_count', 'max_cards', 'created_at', 'last_updated']

    def update(self, instance, validated_data):
        """Update tree - tree_id cannot be changed"""
        instance.name = validated_data.get('name', instance.name)
        instance.family_data = validated_data.get('family_data', instance.family_data)
        instance.next_id = validated_data.get('next_id', instance.next_id)
        instance.save()
        return instance

    def get_card_count(self, obj):
        """Get current card count from family_data"""
        return obj.get_card_count()

    def get_max_cards(self, obj):
        """Get max cards allowed from user's subscription"""
        subscription = getattr(obj.user, 'subscription', None)
        if subscription:
            return subscription.plan.max_cards
        return 4  # Default FREE plan


class FamilyTreeListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing trees (excludes family_data)"""

    card_count = serializers.SerializerMethodField()

    class Meta:
        model = FamilyTree
        fields = ['id', 'tree_id', 'name', 'card_count', 'created_at', 'last_updated']
        read_only_fields = ['id', 'card_count', 'created_at', 'last_updated']

    def get_card_count(self, obj):
        return obj.get_card_count()
