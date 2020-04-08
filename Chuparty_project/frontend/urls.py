from django.urls import path
from . import views


urlpatterns = [
    path('', views.index),
    path('getSubjects/', views.getSubjects),
    path('setSubject/', views.setSubject)
]