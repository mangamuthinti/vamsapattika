from django.db import models
from django.conf import settings

class FamilyTree(models.Model):
    """Family tree data storage - stores entire tree in JSONField"""
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='trees'
    )
    tree_id = models.CharField(max_length=100)
    name = models.CharField(max_length=255, default='My Vamsapattika')
    family_data = models.JSONField(default=dict)  # Entire tree structure as JSON
    next_id = models.IntegerField(default=2)
    
    created_at = models.DateTimeField(auto_now_add=True)
    last_updated = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'family_trees'
        unique_together = ['user', 'tree_id']
        ordering = ['-last_updated']
        verbose_name = 'Family Tree'
        verbose_name_plural = 'Family Trees'
        indexes = [
            models.Index(fields=['user', 'tree_id']),
            models.Index(fields=['user', '-last_updated']),
        ]
    
    def __str__(self):
        return f"{self.user.email} - {self.name}"
    
    def get_card_count(self):
        """Get number of family member cards in this tree"""
        return len(self.family_data) if self.family_data else 0
