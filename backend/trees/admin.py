from django.contrib import admin
from django.utils.html import format_html
from django.utils.safestring import mark_safe
from django.http import HttpResponse
from django.urls import path
import base64
from .models import FamilyTree

@admin.register(FamilyTree)
class FamilyTreeAdmin(admin.ModelAdmin):
    list_display = ['user', 'tree_id', 'name', 'get_card_count', 'get_photo_count', 'created_at', 'last_updated']
    list_filter = ['created_at', 'last_updated']
    search_fields = ['user__email', 'tree_id', 'name']
    readonly_fields = ['created_at', 'last_updated', 'show_photos']

    fieldsets = (
        ('Tree Information', {
            'fields': ('user', 'tree_id', 'name', 'family_data', 'next_id')
        }),
        ('Photos', {
            'fields': ('show_photos',),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'last_updated')
        }),
    )

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path('<int:tree_id>/download-photo/<str:person_id>/',
                 self.admin_site.admin_view(self.download_photo_view),
                 name='trees-download-photo'),
        ]
        return custom_urls + urls

    def download_photo_view(self, request, tree_id, person_id):
        """Download individual photo"""
        try:
            tree = FamilyTree.objects.get(id=tree_id)
            person_data = tree.family_data.get(person_id, {})
            photo = person_data.get('photo', '')

            if photo and photo.startswith('data:image'):
                # Extract base64 data
                header, base64_data = photo.split(',', 1)
                image_data = base64.b64decode(base64_data)

                # Determine file extension from header
                if 'png' in header:
                    content_type = 'image/png'
                    ext = 'png'
                elif 'jpeg' in header or 'jpg' in header:
                    content_type = 'image/jpeg'
                    ext = 'jpg'
                else:
                    content_type = 'image/png'
                    ext = 'png'

                response = HttpResponse(image_data, content_type=content_type)
                response['Content-Disposition'] = f'attachment; filename="photo_{person_id}.{ext}"'
                return response
        except Exception as e:
            return HttpResponse(f'Error: {str(e)}', status=400)

    def get_card_count(self, obj):
        return obj.get_card_count()
    get_card_count.short_description = 'Cards'

    def get_photo_count(self, obj):
        """Count how many cards have photos"""
        count = 0
        if obj.family_data:
            for person_id, person_data in obj.family_data.items():
                if person_data.get('photo') and person_data.get('photo') != '':
                    count += 1
        return count
    get_photo_count.short_description = 'Photos'

    def show_photos(self, obj):
        """Display all photos side by side horizontally - photo only, downloadable"""
        if not obj.family_data:
            return "No photos available"

        html_parts = []
        html_parts.append('<style>')
        html_parts.append('.photo-admin-container { display: flex; gap: 15px; padding: 10px 0; overflow-x: auto; overflow-y: hidden; white-space: nowrap; }')
        html_parts.append('.photo-admin-item { position: relative; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); transition: all 0.3s ease; flex-shrink: 0; width: 180px; }')
        html_parts.append('.photo-admin-item:hover { transform: translateY(-3px); box-shadow: 0 6px 16px rgba(0,0,0,0.15); }')
        html_parts.append('.photo-admin-item img { width: 100%; height: auto; display: block; object-fit: contain; }')
        html_parts.append('.photo-download-btn { position: absolute; top: 8px; right: 8px; background: rgba(255, 255, 255, 0.95); border: none; border-radius: 50%; width: 32px; height: 32px; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.2); opacity: 0; transition: opacity 0.3s ease; font-size: 16px; display: flex; align-items: center; justify-content: center; text-decoration: none; }')
        html_parts.append('.photo-admin-item:hover .photo-download-btn { opacity: 1; }')
        html_parts.append('.photo-download-btn:hover { background: #667eea; transform: scale(1.1); }')
        html_parts.append('</style>')
        html_parts.append('<div class="photo-admin-container">')

        photo_count = 0
        for person_id, person_data in obj.family_data.items():
            photo = person_data.get('photo', '')

            if photo and photo != '':
                photo_count += 1
                download_url = f'/admin/trees/familytree/{obj.id}/download-photo/{person_id}/'
                html_parts.append('<div class="photo-admin-item">')
                html_parts.append(f'<img src="{photo}" alt="Photo {person_id}" />')
                html_parts.append(f'<a href="{download_url}" class="photo-download-btn" title="Download photo">📥</a>')
                html_parts.append('</div>')

        if photo_count == 0:
            return "No photos uploaded yet"

        html_parts.append('</div>')
        return mark_safe(''.join(html_parts))

    show_photos.short_description = 'Uploaded Photos'