from django.urls import path
from . import views

urlpatterns = [
    path('', views.index),

    path('getSubjects', views.getSubjects), 
    path('editSubject', views.editSubject),
    path('setSubject', views.setSubject),
    path('getSubjectByName', views.getSubjectByName),

    path('setCourse', views.setCourse), 
    path('editCourse', views.editCourse),
    path('getCourses', views.getCourses), 
    path('getCourseByName', views.getCourseByName),

    path('setSchool', views.setSchool), 
    path('editSchool', views.editSchool), 
    path('getSchools', views.getSchools),
    path('getSchoolByName', views.getSchoolByName),

    path('setQuestion', views.setQuestion),
    path('editQuestion', views.editQuestion),
    path('getQuestions', views.getQuestions),
    path('getQuestionByBody', views.getQuestionByBody),

    path('setStudent', views.setStudent),
    path('getStudents', views.getStudents),
    path('getStudentByEmail', views.getStudentByEmail),

    path('setLecturer', views.setLecturer),
    path('getLecturers', views.getLecturers),
    path('getLecturerByEmail', views.getLecturerByEmail),

    path('setAdmin', views.setAdmin),
    path('getAdmins', views.getAdmins),
    path('getAdminByEmail', views.getAdminByEmail),

    path('setExam', views.setExam),
    path('getExams', views.getExams),
    path('getExamByID', views.getExamByID),

]