from django.contrib import admin
from django.utils.html import format_html
from django.utils.safestring import mark_safe
from django.http import HttpResponse
from django.urls import path
import base64
import zipfile
import io
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
            path('<int:tree_id>/download-all-photos/',
                 self.admin_site.admin_view(self.download_all_photos_view),
                 name='trees-download-all-photos'),
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

    def download_all_photos_view(self, request, tree_id):
        """Download all photos as a zip file"""
        try:
            tree = FamilyTree.objects.get(id=tree_id)

            # Create a BytesIO buffer for the zip file
            zip_buffer = io.BytesIO()

            with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
                photo_count = 0

                for person_id, person_data in tree.family_data.items():
                    photo = person_data.get('photo', '')
                    person_name = person_data.get('name', person_id)

                    if photo and photo.startswith('data:image'):
                        photo_count += 1
                        # Extract base64 data
                        header, base64_data = photo.split(',', 1)
                        image_data = base64.b64decode(base64_data)

                        # Determine file extension
                        if 'png' in header:
                            ext = 'png'
                        elif 'jpeg' in header or 'jpg' in header:
                            ext = 'jpg'
                        else:
                            ext = 'png'

                        # Add to zip with sanitized filename
                        safe_name = "".join(c for c in person_name if c.isalnum() or c in (' ', '-', '_')).strip()
                        filename = f"{safe_name}_{person_id}.{ext}"
                        zip_file.writestr(filename, image_data)

                if photo_count == 0:
                    return HttpResponse('No photos to download', status=404)

            # Prepare the response
            zip_buffer.seek(0)
            response = HttpResponse(zip_buffer.getvalue(), content_type='application/zip')
            response['Content-Disposition'] = f'attachment; filename="vamsapattika_photos_{tree.tree_id}.zip"'
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
        """Display all photos in grid - 4 per row with vertical scroll"""
        if not obj.family_data:
            return "No photos available"

        html_parts = []
        html_parts.append('<style>')
        html_parts.append('.field-show_photos .readonly { width: 100% !important; max-width: 100% !important; }')
        html_parts.append('.photo-admin-wrapper { margin-top: 10px; width: 100%; }')
        html_parts.append('.download-all-header-btn { display: inline-flex; align-items: center; gap: 4px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white !important; border: none; padding: 4px 10px; border-radius: 4px; font-size: 11px; font-weight: 600; cursor: pointer; text-decoration: none !important; transition: all 0.3s ease; box-shadow: 0 2px 6px rgba(102, 126, 234, 0.4); float: right; margin-left: 15px; margin-top: -2px; line-height: 1; position: relative; top: -1px; }')
        html_parts.append('.download-all-header-btn:hover { transform: translateY(-1px); box-shadow: 0 3px 10px rgba(102, 126, 234, 0.6); color: white !important; }')
        html_parts.append('.photo-admin-container { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; padding: 15px; max-height: 300px; overflow-y: auto; overflow-x: hidden; border: 1px solid #e0e0e0; border-radius: 8px; background: #f9f9f9; width: 100%; box-sizing: border-box; }')
        html_parts.append('.photo-admin-item { position: relative; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); transition: all 0.3s ease; width: 100%; aspect-ratio: 1; }')
        html_parts.append('.photo-admin-item:hover { transform: translateY(-3px); box-shadow: 0 6px 16px rgba(0,0,0,0.15); }')
        html_parts.append('.photo-admin-item img { width: 100%; height: 100%; display: block; object-fit: cover; }')
        html_parts.append('.photo-download-btn { position: absolute; top: 8px; right: 8px; background: rgba(255, 255, 255, 0.95); border: none; border-radius: 50%; width: 32px; height: 32px; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.2); opacity: 0; transition: opacity 0.3s ease; font-size: 16px; display: flex; align-items: center; justify-content: center; text-decoration: none; }')
        html_parts.append('.photo-admin-item:hover .photo-download-btn { opacity: 1; }')
        html_parts.append('.photo-download-btn:hover { background: #667eea; transform: scale(1.1); }')
        html_parts.append('</style>')

        # Count photos first
        photo_count = 0
        for person_id, person_data in obj.family_data.items():
            photo = person_data.get('photo', '')
            if photo and photo != '':
                photo_count += 1

        if photo_count == 0:
            return "No photos uploaded yet"

        # JavaScript to inject Download All button into the Photos fieldset header
        download_all_url = f'/admin/trees/familytree/{obj.id}/download-all-photos/'
        html_parts.append('<script>')
        html_parts.append('(function() {')
        html_parts.append('  if (document.querySelector(".download-all-header-btn")) return;')
        html_parts.append('  var photoFieldset = document.querySelector(".field-show_photos").closest("fieldset");')
        html_parts.append('  if (photoFieldset) {')
        html_parts.append('    var h2 = photoFieldset.querySelector("h2");')
        html_parts.append('    if (h2) {')
        html_parts.append(f'      var btn = document.createElement("a");')
        html_parts.append(f'      btn.href = "{download_all_url}";')
        html_parts.append(f'      btn.className = "download-all-header-btn";')
        html_parts.append(f'      btn.innerHTML = "<span>📥</span><span>Download All ({photo_count})</span>";')
        html_parts.append('      h2.appendChild(btn);')
        html_parts.append('    }')
        html_parts.append('  }')
        html_parts.append('})();')
        html_parts.append('</script>')

        html_parts.append('<div class="photo-admin-wrapper">')

        # Add photos grid
        html_parts.append('<div class="photo-admin-container">')

        for person_id, person_data in obj.family_data.items():
            photo = person_data.get('photo', '')

            if photo and photo != '':
                download_url = f'/admin/trees/familytree/{obj.id}/download-photo/{person_id}/'
                html_parts.append('<div class="photo-admin-item">')
                html_parts.append(f'<img src="{photo}" alt="Photo {person_id}" />')
                html_parts.append(f'<a href="{download_url}" class="photo-download-btn" title="Download photo">📥</a>')
                html_parts.append('</div>')

        html_parts.append('</div>')
        html_parts.append('</div>')  # Close wrapper
        return mark_safe(''.join(html_parts))

    show_photos.short_description = 'Uploaded Photos'