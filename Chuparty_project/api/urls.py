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
    path('setLecturer/', views.setLecturer),
    path('getLecturers/', views.getLecturers),
    path('setAdmin/', views.setAdmin),
    path('getAdmins/', views.getAdmins),
    path('setExam/', views.setExam),
    path('getExams/', views.getExams),
    path('getSubjectByName/', views.getSubjectByName),
    path('getCourseByName/', views.getCourseByName),
]