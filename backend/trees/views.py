from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import FamilyTree
from .serializers import FamilyTreeSerializer, FamilyTreeListSerializer


class FamilyTreeViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing family trees
    - list: Get all trees for current user
    - retrieve: Get specific tree with full data
    - create: Create new tree
    - update/partial_update: Update tree
    - destroy: Delete tree
    """
    permission_classes = [IsAuthenticated]
    lookup_field = 'tree_id'  # Use tree_id instead of database id for lookups

    def get_serializer_class(self):
        """Use lightweight serializer for list, full serializer for detail"""
        if self.action == 'list':
            return FamilyTreeListSerializer
        return FamilyTreeSerializer

    def get_queryset(self):
        """Return trees only for current user"""
        return FamilyTree.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        """Auto-assign current user when creating tree"""
        serializer.save(user=self.request.user)

    def create(self, request, *args, **kwargs):
        """Create a new family tree"""
        # Check card limit
        family_data = request.data.get('family_data', {})
        card_count = len(family_data) if family_data else 0

        # Get user's max cards
        subscription = getattr(request.user, 'subscription', None)
        max_cards = subscription.plan.max_cards if subscription else 4

        if card_count > max_cards:
            return Response({
                'error': f'Card limit exceeded. Your plan allows {max_cards} cards, but tree has {card_count} cards.',
                'max_cards': max_cards,
                'current_cards': card_count
            }, status=status.HTTP_400_BAD_REQUEST)

        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        """Update existing family tree"""
        # Check card limit
        family_data = request.data.get('family_data', {})
        card_count = len(family_data) if family_data else 0

        # Get user's max cards
        subscription = getattr(request.user, 'subscription', None)
        max_cards = subscription.plan.max_cards if subscription else 4

        if card_count > max_cards:
            return Response({
                'error': f'Card limit exceeded. Your plan allows {max_cards} cards, but tree has {card_count} cards.',
                'max_cards': max_cards,
                'current_cards': card_count
            }, status=status.HTTP_400_BAD_REQUEST)

        return super().update(request, *args, **kwargs)

    @action(detail=True, methods=['get'])
    def check_limit(self, request, pk=None):
        """Check if tree is within card limit"""
        tree = self.get_object()
        card_count = tree.get_card_count()

        subscription = getattr(request.user, 'subscription', None)
        max_cards = subscription.plan.max_cards if subscription else 4

        return Response({
            'current_cards': card_count,
            'max_cards': max_cards,
            'is_within_limit': card_count <= max_cards,
            'remaining_cards': max(0, max_cards - card_count)
        })
