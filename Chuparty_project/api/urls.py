from django.urls import path
from . import views

urlpatterns = [
    path('', views.index),

    # subject
    path('getSubjects', views.getSubjects), 
    path('editSubject', views.editSubject),
    path('setSubject', views.setSubject),
    path('getSubjectByName', views.getSubjectByName),
    path('deleteSubject', views.deleteSubject),

    # course
    path('setCourse', views.setCourse), 
    path('editCourse', views.editCourse),
    path('getCourses', views.getCourses), 
    path('getCourseByName', views.getCourseByName),
    path('deleteCourse', views.deleteCourse),

    # school
    path('setSchool', views.setSchool), 
    path('editSchool', views.editSchool), 
    path('getSchools', views.getSchools),
    path('getSchoolByName', views.getSchoolByName),
    path('deleteSchool', views.deleteSchool),

    # question
    path('setQuestion', views.setQuestion),
    path('editQuestion', views.editQuestion),
    path('getQuestions', views.getQuestions),
    path('getQuestionByBody', views.getQuestionByBody),
    path('deleteQuestion', views.deleteQuestion),

    # exam
    path('setExam', views.setExam),
    path('editExam', views.editExam),
    path('getExams', views.getExams),
    path('getExamByID', views.getExamByID),
    path('deleteExam', views.deleteExam),

    # student
    path('setStudent', views.setStudent),
    path('editStudent', views.editStudent),
    path('getStudents', views.getStudents),
    path('getStudentByEmail', views.getStudentByEmail),
    path('deleteStudent', views.deleteStudent),

    # lecturer
    path('setLecturer', views.setLecturer),
    path('editLecturer', views.editLecturer),
    path('getLecturers', views.getLecturers),
    path('getLecturerByEmail', views.getLecturerByEmail),
    path('deleteLecturer', views.deleteLecturer),

    # admin
    path('setAdmin', views.setAdmin),
    path('editAdmin', views.editAdmin),
    path('getAdmins', views.getAdmins),
    path('getAdminByEmail', views.getAdminByEmail),
    path('deleteAdmin', views.deleteAdmin),

]