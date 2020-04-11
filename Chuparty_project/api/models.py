from djongo import models
from django import forms
from enum import Enum
from django.core.exceptions import ValidationError
from django.core.validators import *

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
class School(models.Model):
    name = models.CharField(max_length=30)
    courses = models.ArrayField(
        model_container=Course,
    )
    objects = models.DjongoManager()

    def as_json(self):
        json_dict = dict(
            name = self.name,
            courses = list()
        )

        for course in list(self.courses):
            json_dict['courses'].append(course.as_json())
        return json_dict


###################################################
# Exam Question
# Including: 
#       subject (TCP, DFS, etc...)
#       answers (python list: [answer0, answer1, answer2, answer3, answer4])
#       correctAnswer (index of the correct answer in the python list)
# TODO: change minVal to 1 and maxval to 5
# TODO: check if validations (minVal and maxVal) work
###################################################
class Question(models.Model):
    subject = models.EmbeddedField(
        model_container = Subject
    )
    course = models.EmbeddedField(
        model_container = Course
    )
    body = models.CharField(max_length=100)
    answers = models.ListField(
        models.CharField(max_length=50),
        max_length = 5
    )
    correctAnswer = models.IntegerField(validators=[MinValueValidator(limit_value=0), MaxValueValidator(limit_value=4)])

    objects = models.DjongoManager()

    def as_json(self):
        json_dict = dict(
            subject = self.subject.as_json(), # pylint: disable=maybe-no-member
            course = self.course.as_json(), # pylint: disable=maybe-no-member
            body = self.body,
            answers = self.answers,
            correctAnswer = self.correctAnswer
        )

        return json_dict

###################################################
# Exam
# Including:
#     writers (a list of the lectures/tutors who wrote the exam)
#     questions (a list of the exam questions)
#     subjects (a list of all the the exam's questions' subjects)
###################################################
class Exam(models.Model):
    name = models.CharField(max_length=50)
    date = models.DateField()

     # who wrote the exam
    writers = models.ListField(
        models.CharField(max_length=30)
    )

    course = models.EmbeddedField(
        model_container=Course
    )

    # the subjects specified in the exam
    questions = models.ArrayField(
        model_container=Question
    ) 

    subjects = models.ArrayField(
        model_container=Subject
    ) 

    objects = models.DjongoManager()

    def as_json(self):
        json_dict = dict(
            name = self.name,
            date = self.date,
            writers = self.writers,
            course = self.course.as_json(),  # pylint: disable=maybe-no-member
            questions = list(),
            subjects = list()
        )

        for question in list(self.questions):
            json_dict['questions'].append(question.as_json())
        for subject in list(self.subjects):
            json_dict['subjects'].append(subject.as_json())

        return json_dict


##################################################
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



###################################################
# Users - abstract
###################################################
class User(models.Model):
    email = models.EmailField()
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    permissions = models.ListField(
        models.CharField(max_length=20, validators=[checkIfPermissionValid])
    )

    def as_json(self):
        json_dict = dict(
            first_name = self.first_name,
            last_name = self.last_name,
            email = self.email,
            permissions = self.permissions
        )

        return json_dict

    class Meta:
        abstract = True

###################################################
# Student
# To add new student:
#       student = Student(first_name="David", last_name="Shaulov", email="david@gmail.com", permissions = [ "Create Exam", "Delete Exam" ])
#       student.save()
###################################################
class Student(User):
    objects = models.DjongoManager() 
    
    # more fields unique to students
    relevantCourses = models.ArrayField(
        model_container=Course,
    )

    def as_json(self):
        json_dict = super().as_json()
        json_dict['relevantCourses'] = list()

        for course in list(self.relevantCourses):
            json_dict['relevantCourses'].append(course.as_json())

        return json_dict


class Lecturer(User):
    objects = models.DjongoManager()

    # more fields unique to lecturers
    coursesTeaching = models.ArrayField(
        model_container=Course,
    )

    def as_json(self):
        json_dict = super().as_json()
        json_dict['coursesTeaching'] = list()
        
        for course in list(self.coursesTeaching):
            json_dict['coursesTeaching'].append(course.as_json())

        return json_dict

class Admin(User):
    objects = models.DjongoManager()

    # more fields unique to admins

    def as_json(self):
        json_dict = super().as_json()

        return json_dict

