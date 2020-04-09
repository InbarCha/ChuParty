from djongo import models
from django import forms
from enum import Enum
from django.core.exceptions import ValidationError

class PermissionEnum(Enum):
    createExam = "Create Exam"
    deleteExam = "Delete Exam"

    @classmethod
    def choices(cls):
        return [var.value for var in cls]


def checkIfPermissionValid(permission):
    if permission not in PermissionEnum.choices():
        raise ValidationError(f"Permission parameter can only be one of \
                                     the following enum values: {PermissionEnum.choices()}")

class Permission(models.Model):
    _p = models.CharField(max_length=20, validators=[checkIfPermissionValid])

    class Meta:
        managed = False # don't create a collection in the database


###################################################
# Users - abstract
###################################################
class User(models.Model):
    email = models.EmailField()
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)

    class Meta:
        abstract = True

###################################################
# Student
# To add new student:
#       student = Student(first_name="David", last_name="Shaulov", email="david@gmail.com", permissions = [ Permission(_p = PermissionEnum.deleteExam.value) ])
#       student.save()
###################################################
class Student(User):
    name = models.CharField(max_length=50)
    permissions = models.ArrayField(
        model_container=Permission
    )
    objects = models.DjongoManager()
    # more fields unique to students

class Lecturer(User):
    name = models.CharField(max_length=50)
    permissions = models.ArrayField(
        model_container=Permission
    )
    objects = models.DjongoManager()
    # more fields unique to lecturers

class Admin(User):
    name = models.CharField(max_length=50)
    permissions = models.ArrayField(
        model_container=Permission
    )
    objects = models.DjongoManager()
    # more fields unique to admins


###################################################
# Subject
# TCP, DFS, etc...
###################################################
class Subject(models.Model):
    name = models.CharField(max_length=50)
    objects = models.DjongoManager()

    def __str__(self):
        return f"{self.name}"

    def as_json(self):
        return dict(
            name = self.name
        )

###################################################
# Course
# Algorithms, Object-Oriented Programming, etc...
# To add new course:
#       course = Course(name='Algorithms', subjects=[Subject(name="DFS"), Subject(name="BFS")])
#       course.save()
###################################################
class Course(models.Model):
    name = models.CharField(max_length=50)
    # course subjects, for example: "Computer Networks" Course will have subjects: TCP, IP, DNS..
    subjects = models.ArrayField(
        model_container=Subject,
    )
    objects = models.DjongoManager()

    def as_json(self):
        json_dict = dict (
            name = self.name,
            subjects=list ()
        )

        for subject in list(self.subjects):
            json_dict['subjects'].append(subject.as_json())
        return json_dict

# ###################################################
# # School
# # Computer Science, Law, etc...
# ###################################################
# class School(Document):
#     name = StringField(required=True)
#     Courses = ListField(ReferenceField(Course))


# ###################################################
# # Exam Question
# # Including: 
# #       subject (TCP, DFS, etc...)
# #       answers (python list: [answer0, answer1, answer2, answer3, answer4])
# #       correctAnswer (index of the correct answer in the python list)
# ###################################################
# class Question(Document):
#     name = StringField(required=True)
#     subject = ReferenceField(Subject)
#     course = ReferenceField(Course)
#     body = StringField(required=True)
#     answers = ListField(StringField, max_length=5)
#     correctAnswer = IntField(required=True, min_value=0, max_value=4)


# ###################################################
# # Exam
# # Including:
# #     writers (a list of the lectures/tutors who wrote the exam)
# #     questions (a list of the exam questions)
# #     subjects (a list of all the the exam's questions' subjects)
# ###################################################
# class Exam(Document):
#     name = StringField(required=True)
#     date = StringField()
#     writers = ListField(StringField) # who wrote the exam
#     course = ReferenceField(Course)
#     questions = ListField(ReferenceField(Question)) # the subjects specified in the exam
#     subjects = ListField(ReferenceField(Subject))