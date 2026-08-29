from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'trees'

router = DefaultRouter()
router.register(r'', views.FamilyTreeViewSet, basename='familytree')

urlpatterns = [
    path('', include(router.urls)),
]
