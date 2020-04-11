from django.urls import path
from . import views

urlpatterns = [
    path('', views.index),
    path('getSubjects/', views.getSubjects),
    path('setSubject/', views.setSubject),
    path('setCourse/', views.setCourse),
    path('getCourses/', views.getCourses),
    path('setSchool/', views.setSchool),
    path('getSchools/', views.getSchools),
    path('setQuestion/', views.setQuestion),
    path('getQuestions/', views.getQuestions),
    path('setStudent/', views.setStudent),
    path('getStudents/', views.getStudents),
]