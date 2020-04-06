from django.db import models
from mongoengine import *
from enum import Enum

class Permission(Enum):
    createPost = "1"
    deletePost = "2"
    #..........

    @classmethod
    def choices(cls):
        print(tuple((i.name, i.value) for i in cls))
        return tuple((i.name, i.value) for i in cls)

###################################################
# Users
###################################################
class User(Document):
    email = StringField(required=True)
    first_name = StringField(max_length=50)
    last_name = StringField(max_length=50)

    meta = {'allow_inheritance': True}

class Student(User):
    permissions = ListField(StringField, choices=Permission.choices)
    # more fields unique to students

class Lecturer(User):
    permissions = ListField(StringField, choices=Permission.choices)
    # more fields unique to Lecturers

class Admin(User):
    permissions = ListField(StringField, choices=Permission.choices)
    # more fields unique to Admins


###################################################
# Subject
# TCP, DFS, etc...
###################################################
class Subject(Document):
    name = StringField(required=True)


###################################################
# Course
# Algorithms, Object-Oriented Programming, etc...
###################################################
class Course(Document):
    name = StringField(required=True)
    # course subjects, for example: "Computer Networks" Course will have subjects: TCP, IP, DNS..
    subjects = ListField(ReferenceField(Subject)) 


###################################################
# School
# Computer Science, Law, etc...
###################################################
class School(Document):
    name = StringField(required=True)
    Courses = ListField(ReferenceField(Course))


###################################################
# Exam Question
# Including: 
#       subject (TCP, DFS, etc...)
#       answers (python list: [answer0, answer1, answer2, answer3, answer4])
#       correctAnswer (index of the correct answer in the python list)
###################################################
class Question(Document):
    name = StringField(required=True)
    subject = ReferenceField(Subject)
    course = ReferenceField(Course)
    body = StringField(required=True)
    answers = ListField(StringField, max_length=5)
    correctAnswer = IntField(required=True, min_value=0, max_value=4)


###################################################
# Exam
# Including:
#     writers (a list of the lectures/tutors who wrote the exam)
#     questions (a list of the exam questions)
#     subjects (a list of all the the exam's questions' subjects)
###################################################
class Exam(Document):
    name = StringField(required=True)
    date = StringField()
    writers = ListField(StringField) # who wrote the exam
    course = ReferenceField(Course)
    questions = ListField(ReferenceField(Question)) # the subjects specified in the exam
    subjects = ListField(ReferenceField(Subject))