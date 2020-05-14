from django.urls import path
from . import views

urlpatterns = [
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
    path('editMultipleQuestions', views.editMultipleQuestions),
    path('getQuestions', views.getQuestions),
    path('getQuestionByBody', views.getQuestionByBody),
    path('deleteQuestion', views.deleteQuestion),
    path('setMultipleQuestions', views.setMultipleQuestions),

    # exam
    path('setExam', views.setExam),
    path('editExam', views.editExam),
    path('getExams', views.getExams),
    path('getExamsFromCourse', views.getExamsFromCourse),
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

    # auth
    path('isLoggedIn', views.isLoggedIn),
    path('logIn', views.logIn),
    path('logOut', views.logOut),
    path('register', views.register)

]