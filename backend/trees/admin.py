from django.contrib import admin
from .models import FamilyTree

@admin.register(FamilyTree)
class FamilyTreeAdmin(admin.ModelAdmin):
    list_display = ['user', 'tree_id', 'name', 'get_card_count', 'created_at', 'last_updated']
    list_filter = ['created_at', 'last_updated']
    search_fields = ['user__email', 'tree_id', 'name']
    readonly_fields = ['created_at', 'last_updated']
    
    def get_card_count(self, obj):
        return obj.get_card_count()
    get_card_count.short_description = 'Cards'
