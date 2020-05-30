from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.shortcuts import render
from api.models import Subject, Course, Question, Exam, School, Lecturer, Student, Admin
from django.views.decorators.csrf import csrf_exempt
from django.middleware.csrf import get_token
import json
from django.http import JsonResponse
import operator
from random import shuffle
from datetime import datetime
from urllib.parse import unquote
from api.HelpFuncs_Subjects import *
from api.HelpFuncs_Courses import *
from api.HelpFuncs_Questions import *
from api.HelpFuncs_Schools import *
from api.HelpFuncs_Exams import *
from api.HelpFuncs_General import *
from api.HelpFuncs_Users import *


# TODO: take care of case-senstitive issues (for example in MongoDB queries)

# TODO: Think of a better way to handle document IDs.
#      For example, two courses with the same name could exist (that belong to different schools),
#      so handling course name as its ID is not good enough
#      NEEDED? or will every school have its own DB?


##################################################
'''
deleteSubject()
method: GET
GET params: name of subject to delete
'''
##################################################
@csrf_exempt
def deleteSubject(request):
    if request.method == "GET":
        subjectName = request.GET.get("name")

        try:
            Subject.objects.filter(name=subjectName).delete()
            return JsonResponse({"Status": f"Deleted subject '{subjectName}'"})

        except Exception as e:
            return JsonResponse(
                {
                        "Exception": str(e),
                        "Status": f"Can't delete subject {subjectName}",
                    },
                status=500
            )

    else:
        return JsonResponse(
            {
                    "Status": "deleteSubject() only accepts GET requests",
                },
            status=500
        )


##################################################
'''
getSubjects()
method: GET
Returns all the existing subjects in the DB
'''
##################################################
@csrf_exempt
def getSubjects(request):
    if request.method == "GET":
        subjectsList = list(Subject.objects.values())
        return JsonResponse(subjectsList, safe=False)

    else:
        return JsonResponse(
            {
                        "Status": "getSubjects() only accepts GET requests",
                    },
            status=500
            )


##################################################
'''
getSubjectByName()
method: GET
Returns subject by name (if it exists in DB)
'''
##################################################
@csrf_exempt
def getSubjectByName(request):
    if request.method == "GET":
        subjectName = request.GET.get("name")

        try:
            subjectObj = Subject.objects.get(name=subjectName)
            return JsonResponse(subjectObj.as_json())

        except:
            return JsonResponse({"Status": f"Subject {subjectName} doesn't exist in DB"}, status=500)

    return JsonResponse(
        {
                        "Status": "getSubjectByName() only accepts GET requests",
                    },
        status=500
        )


##################################################
'''
setSubject()
method: POST
POST body example:
{
	"name" : "Stack"
}
'''
##################################################
@csrf_exempt
def setSubject(request):
    if request.method == "POST":
        # decode request body
        body = parseRequestBody(request)

        ret_tuple = createSubject(body)
        isNewSubjectCreated = ret_tuple[0]

        if isNewSubjectCreated is None:
            return JsonResponse({"Status": ret_tuple[1]}, status=500)

        elif isNewSubjectCreated == True:
            return JsonResponse(
                    {
                        "Status": "Created Subject",
                    }
            )
        else:
            return JsonResponse(
                    {
                        "Status": "Subject Already Exists",
                    },
                status=500
            )

    else:  # request.method isn't POST
        return JsonResponse(
            {
                        "Status": "setSubject() only accepts POST requests",
                    },
            status=500
            )


##################################################
'''
editSubject()
method: POST
POST body example:
{
	"name": "DFS",
  "ChangeName": "DFS - Search Algorithms"
}
'''
##################################################
@csrf_exempt
def editSubject(request):
    if request.method == "POST":
        changedNameFlg = False

        # decode request body
        body = parseRequestBody(request)

        if 'name' not in body.keys():
            return JsonResponse({"Status": "Can't Edit Subject: 'name' field in not in request body"}, status=500)
        name = body['name']

        try:
            Subject.objects.get(name=name)

            if 'ChangeName' in body.keys():
                newName = body['ChangeName']
                Subject.objects.filter(name=name).update(name=newName)
                changedNameFlg = True

                updateSubjectsInCourses(name, newName)
                updateSubjectsInSchools(name, newName)
                updateSubjectsInQuestions(name, newName)
                updateSubjectsInExams(name, newName)

            # create response
            ret_json = dict()

            if changedNameFlg == True:
                ret_json['Changed Name'] = "True"
            else:
                ret_json['Changed Name'] = "False"

            return JsonResponse(ret_json)

        except Exception as e:
            return JsonResponse(
                {
                        "Exception": str(e),
                        "Status": "Can't Edit Subject"
                    },
                status=500
            )

    else:
        return JsonResponse(
            {
                    "Status": "editSubject() only accepts POST requests",
                },
            status=500
        )


##################################################
'''
setCourse()
method: POST
POST body example:
{
	"name" : "Operating Systems",
    "school": "Computer Science",
	"subjects": [
		{
			"name": "processes"
		},
		{
			"name": "threads"
		}
	]
}
'''
##################################################
@csrf_exempt
def setCourse(request):
    if request.method == "POST":
        # decode request body
        body = parseRequestBody(request)

        ret_tuple = createCourseOrAddSubject(body)
        isNewCourseCreated = ret_tuple[0]

        if isNewCourseCreated is None:
            return JsonResponse({"Status": ret_tuple[1]}, status=500)

        elif isNewCourseCreated == False:
            user = request.user

            return JsonResponse(
                {
                    "Status": "Course Already Exists",
                },
                status=500
            )
        else:
            ret_json = { "Status": "Added Course" }
            ret_json["New Course"] = changeCourseTemplate(ret_tuple[1])
            return JsonResponse(ret_json)

    else:  # request.method isn't POST
        return JsonResponse(
            {
                        "Status": "setCourse() only accepts POST calls",
                    },
            status=500
            )


##################################################
'''
deleteCourse()
method: GET
GET params: name of course to delete
'''
##################################################
@csrf_exempt
def deleteCourse(request):
    if request.method == "GET":
        courseName = request.GET.get("name")

        try:
            Course.objects.filter(name=courseName).delete()
            schools = list(School.objects.all())
            for school in schools:
                coursesList = school.courses
                coursesList = [course for course in coursesList if course != courseName]
                School.objects.filter(name=school.name).update(courses=coursesList)
            
            # delete course from user courses, it it exists there
            username = request.user.username

            # check if user is Student, lecturer or admin
            if Student.objects.filter(username=username).count() > 0:
                student = Student.objects.get(username=username)
                courses = student.relevantCourses
                courses = [course for course in courses if course.name != courseName]
                Student.objects.filter(username=username).update(relevantCourses=courses)
            elif Lecturer.objects.filter(username=username).count() > 0:
                lecturer = Lecturer.objects.get(username=username)
                courses = lecturer.coursesTeaching
                scourses = [course for course in courses if course.name != courseName]
                Lecturer.objects.filter(username=username).update(coursesTeaching=courses)

            return JsonResponse({"Status": f"Deleted Course '{courseName}'"})

        except Exception as e:
            return JsonResponse(
                {
                        "Exception": str(e),
                        "Status": f"Can't delete course {courseName}",
                    },
                status=500
            )

    else:
        return JsonResponse(
            {
                    "Status": "deleteCourse() only accepts GET requests",
                },
            status=500
        )


##################################################
'''
editCourse()
method: POST
POST body example:
{
	"name": "OOP",
    "ChangeName": "Object-Oriented Programming"
	"AddToSubjects":[
            {
                "name": "C++"
            }
        ]
    "DeleteFromSubjects": [
            {
                "name": "c"
            }
        ]
	]
}
'''
##################################################
@csrf_exempt
def editCourse(request):
    if request.method == "POST":
        changedNameFlg = False
        addedToSubjectsFlg = False
        deletedFromSubjectsFlg = False

        # decode request body
        body = parseRequestBody(request)

        if 'name' not in body.keys():
            return JsonResponse({"Status": "Can't Edit Course: 'name' field in not in request body"}, status=500)
        name = body['name']

        try:
            courseObj = Course.objects.get(name=name)

            # add subjects to course
            if 'AddToSubjects' in body.keys():
                newSubjectsList = courseObj.subjects

                subjectsToAdd = list(body['AddToSubjects'])
                for subject in subjectsToAdd:
                    ret_tuple = createSubject(subject)
                    isSubjectReturned = ret_tuple[0]

                    if isSubjectReturned is None:
                        return JsonResponse({"Status": ret_tuple[1]}, status=500)

                    subjectObj = ret_tuple[1]
                    if subjectObj.name not in [subject.name for subject in newSubjectsList]:
                        newSubjectsList.append(subjectObj)
                        addedToSubjectsFlg = True

                        addSubjectToCourseInQuestions(name, subjectObj)
                        addSubjectToCourseInExams(name, subjectObj)

            # delete subjects from course
            if 'DeleteFromSubjects' in body.keys():
                newSubjectsList = courseObj.subjects

                subjectsToDelete = list(body['DeleteFromSubjects'])
                for subject in subjectsToDelete:
                    ret_tuple = createSubject(subject)
                    isSubjectReturned = ret_tuple[0]

                    if isSubjectReturned is None:
                        return JsonResponse({"Status": ret_tuple[1]}, status=500)

                    subjectObj = ret_tuple[1]
                    if subjectObj.name in [subject.name for subject in newSubjectsList]:
                        newSubjectsList = list(
                            filter(lambda subject: subject.name != subjectObj.name, newSubjectsList))
                        courseObj.subjects = newSubjectsList
                        deletedFromSubjectsFlg = True

                        deleteSubjectFromCourseInQuestions(name, subjectObj)
                        deleteSubjectFromCourseInExams(name, subjectObj)

            # update course's subjects list
            if addedToSubjectsFlg == True or deletedFromSubjectsFlg == True:
                Course.objects.filter(name=name).update(
                    subjects=newSubjectsList)
        

            # change course name
            if 'ChangeName' in body.keys():
                newName = body['ChangeName']
                Course.objects.filter(name=name).update(name=newName)
                courseObj.name = newName
                changedNameFlg = True


                updateCourseNameInSchools(name, newName)
                updateCourseNameInQuestions(name, newName)
                updateCourseNameInExams(name, newName)
                updateCourseNameInStudent(name, newName)
                updateCourseNameInLecturer(name, newName)

            # create response
            ret_json = dict()
            ret_json["Edited Course"] = changeCourseTemplate(courseObj);

            if changedNameFlg == True:
                ret_json['Changed Name'] = "True"
            else:
                ret_json['Changed Name'] = "False"

            if addedToSubjectsFlg == True:
                ret_json['Added Subject'] = "True"
            else:
                ret_json['Added Subject'] = "False"

            if deletedFromSubjectsFlg == True:
                ret_json['Deleted Subject'] = "True"
            else:
                ret_json['Deleted Subject'] = "False"

            return JsonResponse(ret_json)

        except Exception as e:
            return JsonResponse(
                {
                        "Exception": str(e),
                        "Status": "Can't Edit Course"
                    },
                status=500
            )

    else:
        return JsonResponse(
            {
                    "Status": "editCourse() only accepts POST requests",
                },
            status=500
        )


##################################################
'''
getCourses()
method: GET
Returns all the existing courses in the DB
'''
##################################################
@csrf_exempt
def getCourses(request):
    if request.method == "GET":
        courses = Course.objects.all()
        coursesList = changeCoursesTemplateInList(courses)

        return JsonResponse(list(coursesList), safe=False)

    else:  # request.method isn't GET
        return JsonResponse(
            {
                        "Status": "getCourses() only accepts GET requests",
                    },
            status=500
            )


##################################################
'''
getCoursesFromSchool()
method: GET
Returns all the existing courses in the DB with the specified school
'''
##################################################
@csrf_exempt
def getCoursesFromSchool(request):
    if request.method == "GET":
        school = request.GET.get("school")

        try:
            courses = Course.objects.filter(school=school)
            coursesList = changeCoursesTemplateInList(courses)

            return JsonResponse(list(coursesList), safe=False)
        
        except Exception as e:
            return JsonResponse({
                "Error": str(e),
                "Status": f"Can't get courses from school {school}"
            })


    else:  # request.method isn't GET
        return JsonResponse(
            {
                        "Status": "getCourses() only accepts GET requests",
                    },
            status=500
            )


##################################################
'''
getCourseByName()
method: GET
Returns course by name (if it exists in DB)
'''
##################################################
@csrf_exempt
def getCourseByName(request):
    if request.method == "GET":
        courseName = request.GET.get("name")
        print(courseName)

        try:
            courseObj = Course.objects.get(name=courseName)
            return JsonResponse(changeCourseTemplate(courseObj))

        except Exception as e:
            return JsonResponse(
                {
                        "Exception": str(e),
                        "Status": f"Course {courseName} doesn't exist in DB"
                    },
                status=500
            )

    return JsonResponse(
        {
                        "Status": "getCourseByName() only accepts GET requests",
                    },
        status=500
        )


##################################################
'''
setSchool()
method: POST
POST body example:
{
	"name": "Colman",
	"courses": [ {"name" : "Advanced Programming"}, {"name":"OOP"}]
}
'''
##################################################
@csrf_exempt
def setSchool(request):
    if request.method == "POST":
        # decode request body
        body = parseRequestBody(request)

        # get school name and courses' names from request body
        if 'name' not in body.keys():
            return JsonResponse({"Status": "Can't Create School: 'name' field in not in request body"}, status=500)
        schoolName = body['name']

        try:
            School.objects.get(name=schoolName)
            print(f"school {schoolName} already exists")
            return JsonResponse(
                {
                    "Status": "School Already Exists",
                },
                status=500
            )
        except:
            coursesList = []

            if 'courses' in body.keys():
                courses = body['courses']

                # iterate over courses given in the request body
                # for each course, if it doesn't exist in the db, create it
                for doc in courses:
                    if 'school' not in doc.keys():
                        doc["school"] = schoolName
                    ret_tuple = createCourseOrAddSubject(doc)
                    isCourseReturned = ret_tuple[0]

                    if isCourseReturned is None:
                        return JsonResponse({"Status": ret_tuple[1]}, status=500)

                    course = ret_tuple[1]
                    coursesList.append(course.name)

            newSchool = School(name=schoolName, courses=coursesList)
            newSchool.save()
            return JsonResponse(
                {
                    "New School": newSchool.as_json(),
                    "Status": "Added School",
                }
            )

    else:  # request.method isn't POST
        return JsonResponse(
            {
                "Status": "setSchool() only accepts POST requests",
            },
        status=500
        )


##################################################
'''
deleteSchool()
method: GET
GET params: name of school to delete
'''
##################################################
@csrf_exempt
def deleteSchool(request):
    if request.method == "GET":
        schoolName = request.GET.get("name")

        try:
            School.objects.filter(name=schoolName).delete()
            return JsonResponse({"Status": f"Deleted school '{schoolName}'"})

        except Exception as e:
            return JsonResponse(
                {
                        "Exception": str(e),
                        "Status": f"Can't delete school {schoolName}",
                    },
                status=500
            )

    else:
        return JsonResponse(
            {
                    "Status": "deleteSchool() only accepts GET requests",
                },
            status=500
        )


##################################################
'''
editSchool()
method: POST
POST body example:
{
	"name": "Colman",
	"ChangeName": "College of Management - Academic Studies",
	"AddToCourses":[
		{
			"name": "Computer Networks"
		}
	],
  "DeleteFromCourses": [
      {
          "name": "OOP"
      }
  ]
}
'''
##################################################
@csrf_exempt
def editSchool(request):
    if request.method == "POST":
        changedNameFlg = False
        addedToCoursesFlg = False
        deletedFromCoursesFlg = False

        # decode request body
        body = parseRequestBody(request)
        print(body)

        if 'name' not in body.keys():
            return JsonResponse({"Status": "Can't Edit School: 'name' field in not in request body"}, status=500)
        name = body['name']

        try:
            # check if School exists in DB
            schoolObj = School.objects.get(name=name)

            # add course to school courses
            if 'AddToCourses' in body.keys():
                newCoursesList = schoolObj.courses

                coursesToAdd = list(body['AddToCourses'])
                for course in coursesToAdd:
                    ret_tuple = createCourseOrAddSubject(course)
                    isCourseReturned = ret_tuple[0]

                    if isCourseReturned is None:
                        return JsonResponse({"Status": ret_tuple[1]}, status=500)

                    courseObj = ret_tuple[1]
                    if courseObj.name not in newCoursesList:
                        newCoursesList.append(courseObj.name)
                        addedToCoursesFlg = True

            # delete course from school courses
            if 'DeleteFromCourses' in body.keys():
                newCoursesList = schoolObj.courses

                coursesToDelete = list(body['DeleteFromCourses'])
                for course in coursesToDelete:
                    ret_tuple = createCourseOrAddSubject(course)
                    isCourseReturned = ret_tuple[0]

                    if isCourseReturned is None:
                        return JsonResponse({"Status": ret_tuple[1]}, status=500)

                    courseObj = ret_tuple[1]

                    if courseObj.name in newCoursesList:
                        newCoursesList = list(
                            filter(lambda course: course != courseObj.name, newCoursesList))
                        deletedFromCoursesFlg = True

            # update school's courses list
            if deletedFromCoursesFlg == True or addedToCoursesFlg == True:
                School.objects.filter(name=name).update(courses=newCoursesList)
                schoolObj.courses = newCoursesList

            # change school name
            if 'ChangeName' in body.keys():
                newName = body['ChangeName']
                School.objects.filter(name=name).update(name=newName)
                schoolObj.name = newName
                changedNameFlg = True

            # create response
            ret_json = dict()
            print(schoolObj)
            ret_json["Edited School"] = schoolObj.as_json()

            if changedNameFlg == True:
                ret_json['Changed Name'] = "True"
            else:
                ret_json['Changed Name'] = "False"

            if addedToCoursesFlg == True:
                ret_json['Added Courses'] = "True"
            else:
                ret_json['Added Courses'] = "False"

            if deletedFromCoursesFlg == True:
                ret_json['Deleted Courses'] = "True"
            else:
                ret_json['Deleted Courses'] = "False"

            return JsonResponse(ret_json)

        except Exception as e:
            return JsonResponse(
                {
                        "Exception": str(e),
                        "Status": "Can't Edit School"
                    },
                status=500
            )

    else:  # request.method isn't POST
        return JsonResponse(
            {
                    "Status": "editSchool() only accepts POST requests",
                },
            status=500
        )


##################################################
'''
getSchools()
method: GET
Returns all the existing schools in the DB
'''
##################################################
@csrf_exempt
def getSchools(request):
    if request.method == "GET":
        schools = School.objects.all()
        if schools is not None:
            schoolsList = changeSchoolsTemplateInList(schools)
            return JsonResponse(schoolsList, safe=False)

        else:
            return JsonResponse([], safe=False)

    else:  # request.method isn't GET
        return JsonResponse(
            {
                        "Status": "getSchools() only accepts GET requests",
                    },
            status=500
            )


##################################################
'''
getSchoolByName()
method: GET
Returns school by name (if it exists in DB)
'''
##################################################
@csrf_exempt
def getSchoolByName(request):
    if request.method == "GET":
        schoolName = request.GET.get("name")
        print(schoolName)

        try:
            schoolObj = School.objects.get(name=schoolName)
            return JsonResponse(changeSchoolTemplate(schoolObj))

        except Exception as e:
            return JsonResponse(
                {
                        "Exception": str(e),
                        "Status": f"School {schoolName} doesn't exist in DB"
                    },
                status=500
            )

    return JsonResponse(
        {
                        "Status": "getSchoolByName() only accepts GET requests",
                    },
        status=500
        )


##################################################
'''
setQuestion()
method: POST
POST body example:
{
  "subject":
      {
          "name": "UDP"    
      },          
	"course": 
		{
			"name" : "Computer Networks"
		},
   "body": "What is UDP?",
   "answers": [
          "bleh bel",
          "bbbb",
          "User Datagram Protocol",
          "Deformation of Name Servers"
      ],
    "correctAnswer": 3,
    "difficulty": 1
}
'''
##################################################
@csrf_exempt
def setQuestion(request):
    if request.method == "POST":
        # decode request body
        body = parseRequestBody(request)

        # create Question if it doesn't already exist in DB
        ret_tuple = createQuestion(body)
        isNewQuestionCreated = ret_tuple[0]

        if isNewQuestionCreated is None:
            return JsonResponse({"Status": ret_tuple[1]}, status=500)

        elif isNewQuestionCreated == True:
            return JsonResponse(
                {
                    "Returned Question" : changeQuestionTemplate(ret_tuple[1]),
                    "Status": "Question Created"
                }
            )

        else:
            return JsonResponse(
                {
                    "Returned Question" : changeQuestionTemplate(ret_tuple[1]),
                    "Status": "Question Already Exists"
                }
            )

    else:
        return JsonResponse(
            {
                "Status": "setQuestion() only accepts POST requests"
            },
            status=500
        )


##################################################
'''
setQuestion()
method: POST
POST body example:
[
    {
        "subject":
        {
            "name": "UDP"    
        },          
        "course": 
            {
                "name" : "Computer Networks"
            },
        "body": "What is UDP?",
        "answers": [
            "bleh bel",
            "bbbb",
            "User Datagram Protocol",
            "Deformation of Name Servers"
        ],
        "correctAnswer": 3,
        "difficulty": 1
    },
    {......}
]
'''
##################################################
@csrf_exempt
def setMultipleQuestions(request):
    if request.method == "POST":
        try:
            # decode request body
            requestBody = list(parseRequestBody(request))
            ret_json_list = list()

            for question in requestBody:
                # create Question if it doesn't already exist in DB
                ret_tuple = createQuestion(question)
                isNewQuestionCreated = ret_tuple[0]

                if isNewQuestionCreated is None:
                    ret_json = dict()
                    ret_json_list.append({"Status": changeQuestionTemplate(ret_tuple[1])});

                elif isNewQuestionCreated == True:
                    ret_json_list.append(
                        {
                            "Returned Question" : changeQuestionTemplate(ret_tuple[1]),
                            "Status": "Question Created"
                        }
                    )

                else:
                    ret_json_list.append(
                        {
                            "Returned Question" : changeQuestionTemplate(ret_tuple[1]),
                            "Status": "Question Already Exists"
                        }
                    )

            return JsonResponse(ret_json_list, safe=False)

        except Exception as e:
            return JsonResponse(
                {
                        "Exception": str(e),
                        "Status": "Can't Create Question in setMultipleQuestions"
                    },
                status=500
            )

    else:
        return JsonResponse(
            {
                "Status": "setMultipleQuestions() only accepts POST requests"
            },
            status=500
        )

##################################################
'''
deleteQuestion()
method: GET
GET params: body of question to delete
'''
##################################################
@csrf_exempt
def deleteQuestion(request):
    if request.method == "GET":
        questionBody = request.GET.get("body")

        try:
            Question.objects.filter(body=questionBody).delete()
            return JsonResponse({"Status": f"Deleted Question '{questionBody}'"})

        except Exception as e:
            return JsonResponse(
                {
                        "Exception": str(e),
                        "Status": f"Can't delete question {questionBody}",
                    },
                status=500
            )

    else:
        return JsonResponse(
            {
                    "Status": "deleteQuestion() only accepts GET requests",
                },
            status=500
        )


##################################################
'''
editQuestion()
method: POST
POST body example:
{
	"body": "What Is Encapsulation?",
	"ChangeCourse":
			{
				"name":"Computer Networks"
			},
	"ChangeSubject":
			{
				"name": "DNS"
			},
	"ChangeBody": "What Is DNS?",
	"ChangeAnswers":[
			"bundling of data with the methods that operate on that data",
			"blah blah",
            "bleh beh",
            "blu blue"
		],
	"ChangeCorrectAnswer": 2,
    "ChangeDifficulty: 4
}
'''
##################################################
@csrf_exempt
def editQuestion(request):
    if request.method == "POST":
        try:
            # decode request body
            requestBody = parseRequestBody(request)

            ret_json = editQuestion_helpFunc(requestBody)
            return JsonResponse(ret_json)

        except Exception as e:
            return JsonResponse(
                {
                        "Exception": str(e),
                        "Status": "Can't Edit Question"
                    },
                status=500
            )

    else:
        return JsonResponse(
            {
                "Status": "editQuestion() only accepts POST requests"
            },
            status=500
        )


##################################################
'''
editMultipleQuestions()
method: POST
POST body example:
[
    {
        "body": "What Is Encapsulation?",
        "ChangeCourse":
                {
                    "name":"Computer Networks"
                },
        "ChangeSubject":
                {
                    "name": "DNS"
                },
        "ChangeBody": "What Is DNS?",
        "ChangeAnswers":[
                "bundling of data with the methods that operate on that data",
                "blah blah",
                "bleh beh",
                "blu blue"
            ],
        "ChangeCorrectAnswer": 2,
        "ChangeDifficulty: 4
    },
    {
        ...............
    }
]
'''
##################################################
@csrf_exempt
def editMultipleQuestions(request):
    if request.method == "POST":
        try:
            # decode request body
            requestBody = list(parseRequestBody(request))
            ret_json_list = list()

            for question in requestBody:
                ret_json = editQuestion_helpFunc(question)
                ret_json_list.append(ret_json)

            return JsonResponse(ret_json_list, safe=False)

        except Exception as e:
            return JsonResponse(
                {
                        "Exception": str(e),
                        "Status": "Can't Edit Question"
                    },
                status=500
            )

    else:
        return JsonResponse(
            {
                "Status": "editQuestion() only accepts POST requests"
            },
            status=500
        )


##################################################
'''
getQuestions()
method: GET
Returns all the existing questions in the DB
'''
##################################################
@csrf_exempt
def getQuestions(request):
    if request.method == "GET":
        questions = Question.objects.all()
        questionsList = changeQuestionsTemplateInList(questions)

        return JsonResponse(list(questionsList), safe=False)

    else:  # request.method isn't GET
        return JsonResponse(
            {
                        "Status": "getQuestions() only accepts GET requests",
                    },
            status=500
            )


######################################################
'''
getQuestionByBody()
method: GET
Returns question by body (if it exists in DB)
'''
#####################################################
@csrf_exempt
def getQuestionByBody(request):
    if request.method == "GET":
        questionBody = request.GET.get("body")
        print(questionBody)

        try:
            questionObj = Question.objects.get(body=questionBody)
            return JsonResponse(changeQuestionTemplate(questionObj))

        except:
            return JsonResponse({"Status": f"Question {questionBody} doesn't exist in DB"}, status=500)

    return JsonResponse(
        {
                        "Status": "getQuestionByBody() only accepts GET requests",
                    },
        status=500
        )


######################################################
'''
setExam()
method: POST
POST body example:
{
    "name": "OOP Exam",
    "date": "2019-07-16",
    "writers": [
    "Eliyahu Khelsatzchi",
    "Haim Shafir"
    ],
    "course":
        {
        "name" : "OOP"
        },
    "questions": [
        {
            "subject":
                {
                    "name": "Object-Oriented Principles"
                },
            "body": "What is encapsulation?",
            "answers": [
                    "blah blah",
                    "bleh beh",
                    "bundling of data with the methods that operate on that data",
                    "blu blue"
                ],
            "correctAnswer": 2,
            "difficulty: 2
        }
    ],
    "subjects":[
        {
            "name": "Object-Oriented Principles"
        }
    ]
}

      no need to add 'subjects' to the request body,
      server parses exam questions and adds each question subject to the exam subjects array
'''
#####################################################
@csrf_exempt
def setExam(request):
    if request.method == "POST":
        # decode request body
        body = parseRequestBody(request)

        # name
        if 'name' not in body.keys():
            return JsonResponse({"Status": "Can't Create Exam - 'name' not specified"}, status=500)
        name = body['name']

        # date
        if 'date' not in body.keys():
            return JsonResponse({"Status": "Can't Create Exam - 'date' not specified"}, status=500)
        date = body['date']
        dateObj = datetime.strptime(date, "%Y-%m-%d").date()

        # id
        examID = str(name) + "_" + str(dateObj)

        try:
            Exam.objects.get(examID=examID)
            print(f"Exam {examID} already exists")
            return JsonResponse(
                {
                    "Status": "Exam Already Exists",
                },
                status=500
            )

        except:
            # writers
            if 'writers' not in body.keys():
                return JsonResponse({"Status": "Can't Create Exam - 'date' not specified"}, status=500)
            writers = list(body['writers'])

            # course
            if 'course' not in body.keys():
                return JsonResponse({"Status": "Can't Create Exam - 'course' not specified"}, status=500)
            course = body['course']

            if 'subjects' not in course.keys():
                course['subjects'] = list()

            ret_tuple = createCourseOrAddSubject(course)
            isCourseReturned = ret_tuple[0]
            if isCourseReturned is None:
                return JsonResponse({"Status": "Can't Create Exam - " + ret_tuple[1]}, status=500)
            courseObj = ret_tuple[1]

            # subjects
            subjectsObjList = []

            if 'subjects' in body.keys():
                subjects = body['subjects']

                # for every subject in the requestBody, check if it exists in the DB
                # if it doesn't, create it
                for subject in subjects:
                    ret_tuple = createSubject(subject)
                    isSubjectRetured = ret_tuple[0]
                    if isSubjectRetured is None:
                        return JsonResponse({"Status": "Can't Create Exam - " + ret_tuple[1]}, status=500)

                    subjectObj = ret_tuple[1]
                    subjectsObjList.append(subjectObj)

            # questions
            questionsObjList = []

            if 'questions' in body.keys():
                questions = body['questions']

                # for every question in the requestBody, check if it exists in the DB
                # if it doesn't, create it
                for question in questions:
                    if 'course' not in question.keys():
                        question['course'] = courseObj.as_json()

                    ret_tuple = createQuestion(question)
                    isQuestionReturned = ret_tuple[0]
                    if isQuestionReturned is None:
                        return JsonResponse({"Status": "Can't Create Exam - " + ret_tuple[1]}, status=500)

                    questionObj = ret_tuple[1]
                    questionsObjList.append(questionObj)

                    # for every question, if its subject is not in the exam subjects, add it
                    questionSubject = questionObj.subject
                    if questionSubject.name not in [subject.name for subject in subjectsObjList]:
                        subjectsObjList.append(questionSubject)
                    if questionSubject.name not in [subject for subject in courseObj.subjects]:
                        course['subjects'].append(questionSubject.as_json())

                ret_tuple = createCourseOrAddSubject(course)
                isCourseReturned = ret_tuple[0]
                if isCourseReturned is None:
                    return JsonResponse({"Status": "Can't Create Exam - " + ret_tuple[1]}, status=500)
                courseObj = ret_tuple[1]

            newExam = Exam(
                examID=examID,
                name=name,
                date=dateObj,
                writers=writers,
                course=courseObj,
                questions=questionsObjList,
                subjects=subjectsObjList
            )
            newExam.save()

            return JsonResponse(
                {
                    "New Exam" : changeExamTemplate(newExam),
                    "Status": "Created Exam",
                }
            )

    else:
        return JsonResponse(
            {
                "Status": "setExam() only accepts POST requests"
            },
            status=500
        )


##################################################
'''
generateExam()
method: POST

Picks the number of questions (as specified in the request body) from this course at random,
and generates an exam out of it.

POST body:
{
    "username": "inbarcha",
    "numberOfQuestions": 10,
    "course": "Computer Networks",
    "subjects": [
        "שכבת התעבורה", "תכנותי"
    ]
}
if "subjects" is not specified, the subjects will be chosen at random
the preference is given to questions that haven't already been solved by the student
'''
##################################################
@csrf_exempt
def generateExam(request):
    if request.method == "POST":
        # decode request body
        body = parseRequestBody(request)

        # name
        if 'username' not in body.keys() or 'numberOfQuestions' not in body.keys() or 'course' not in body.keys():
            return JsonResponse({"Status": "Can't Generate Exam - 'username' / 'numberOfQuestions' / 'course' not specified"}, status=500)
        username = body['username']
        numberOfQuestions = body['numberOfQuestions']
        course = body['course']

        if Course.objects.filter(name=course).count() > 0:
            courseObj = Course.objects.get(name=course)
        else:
            return JsonResponse({
                "Status": f"Course {course} Doesn't Exist"
            })
        
        if Student.objects.filter(username=username).count() > 0:
            studentObj = Student.objects.get(username=username)
        else:
            return JsonResponse({
                "Status": f"User {username} Is Not a Student"
            })
        
        if 'subjects' in body.keys():
            subjects = body["subjects"]
        else:
            subjects = [subject.name for subject in courseObj.subjects]

        studentLevelInSubjects = calculateStudentLevelInSubjects(subjects, courseObj, studentObj)
        questionsStudentSolved = getAllQuestionstTheStudentSolvedFromCourse(studentObj, courseObj)

        # pick the number of questions as specified, from the specified courses and subjects, 
        # choosing questions from every subject with difficulty level slightly higher than the level
        # of the student in that subject
        questionsFromCouresList = list(Question.objects.filter(course=courseObj))
        questionsFromCourseAndSubjectsList = [questionObj for questionObj in questionsFromCouresList if questionObj.subject.name in subjects]

        # how many questions from each subject?
        if len(studentLevelInSubjects) < numberOfQuestions:
            numQuestionsFromEachSubject = int(numberOfQuestions / len(studentLevelInSubjects))
        elif len(studentLevelInSubjects) >= numberOfQuestions:
            numQuestionsFromEachSubject = 1
        
        # pick the questions - giving preference to questions the user didn't already solve
        questionsListSlice = []
        for studentLevelPerSubject in studentLevelInSubjects:
            currQuestions = [question for question in questionsFromCourseAndSubjectsList if question.subject.name == studentLevelPerSubject[0] \
                               and question.difficulty > studentLevelPerSubject[1] and question.body not in [question.body for question in questionsStudentSolved]]

            # sort by difficulty - smaller difficulties (closer to the student's difficulty level) first
            currQuestions = sorted(currQuestions, key=operator.attrgetter('difficulty')) 

            questionsListSlice += currQuestions[:numQuestionsFromEachSubject]
        
        # if there aren't enough questions, pick more from questionsFromCourseAndSubjectsList (only chosen subjects)
        if len(questionsListSlice) < numberOfQuestions:
            for question in questionsFromCourseAndSubjectsList:
                if question.body not in questionsListSlice:
                    questionsListSlice.append(question)
                if (len(questionsListSlice) == numberOfQuestions):
                    break
        
        # if there aren't enough questions, pick more from questionsFromCouresList (all subjects)
        if len(questionsListSlice) < numberOfQuestions:
            for question in questionsFromCouresList:
                if question.body not in questionsListSlice:
                    questionsListSlice.append(question)
                if (len(questionsListSlice) == numberOfQuestions):
                    break

        # exam name and date
        now = datetime.now()
        hourFormatted = "{:02d}".format(now.hour)
        minutedFormatted = "{:02d}".format(now.minute)
        secondFormatted = "{:02d}".format(now.second)
        name = "מבחן מג'ונרט בקורס " + course  + " בשעה " + hourFormatted + ":" + minutedFormatted + ":" + secondFormatted
        dateObj = datetime.strptime(str(now.year) + "-" + str(now.month) + "-" + str(now.day), "%Y-%m-%d").date()
        examID = name + "_" + str(dateObj)

        # exam writers
        writers = ["ג'ונרט אוטומטית"]

        # exam subjects
        subjectsObjList = []
        for questionObj in questionsListSlice:
            questionSubject = questionObj.subject
            if questionSubject.name not in [subject.name for subject in subjectsObjList]:
                subjectsObjList.append(questionSubject)

        newExam = Exam(
                examID=examID,
                name=name,
                date=dateObj,
                writers=writers,
                course=courseObj,
                questions=questionsListSlice,
                subjects=subjectsObjList
            )
        newExam.save()

        return JsonResponse(
            {
                "Generated Exam": changeExamTemplate(newExam),
                "Status": "Generated an Exam"
            }
        )

    else:  # request.method isn't POST
        return JsonResponse(
            {
                        "Status": "generateExam() only accepts POST requests",
                    },
            status=500
            )


##################################################
'''
editExam()
method: POST
{
	"examID":"Computer Networks Exam_2019-07-15",
	"ChangeWriters":[
		"Eliav Menache"
		],
	"ChangeCourse":
		{
			"name":"Computer Networks"
		},
	"AddQuestions":[
			{
				"body":"What is HTTP?"
			},
			{
				"body":"What is UDP?"
			}
		],
	"DeleteQuestions":[
			{
				"body":"What is DNS?"
			}
		],
	"ChangeName": "Computer Networks Exam",
	"ChangeDate": "2019-07-16"
}
'''
##################################################
@csrf_exempt
def editExam(request):
    if request.method == "POST":
        changedNameFlg = False
        changedDateFlg = False
        changedWritersFlg = False
        changedCourseFlg = False
        addedQuestionsFlg = False
        deletedQuestionsFlg = False
        questionToDeleteNotExistFlg = False

        # decode request body
        body = parseRequestBody(request)

        if 'examID' not in body.keys():
            return JsonResponse({"Status": "Can't Edit Exam: 'examID' field in not in request body"}, status=500)
        examID = body['examID']

        try:
            examObj = Exam.objects.get(examID=examID)

            # change exam writers list
            if 'ChangeWriters' in body.keys():
                newWritersList = list(body['ChangeWriters'])
                oldWritersList = examObj.writers

                filteredListNew = [
                    writer for writer in newWritersList if writer not in oldWritersList]
                filteredListOld = [
                    writer for writer in oldWritersList if writer not in newWritersList]

                if filteredListNew or filteredListOld:
                    examObj.writers = newWritersList
                    changedWritersFlg = True

            # change exam course
            if 'ChangeCourse' in body.keys():
                newCourse = body['ChangeCourse']

                ret_tuple = createCourseOrAddSubject(newCourse)
                isCourseReturned = ret_tuple[0]

                if isCourseReturned is None:
                    return JsonResponse({"Status": ret_tuple[1]}, status=500)

                courseObj = ret_tuple[1]
                if examObj.course.name != courseObj.name:
                    examObj.course = courseObj
                    changedCourseFlg = True

            # add a new question
            if 'AddQuestions' in body.keys():
                newQuestionsList = list(body['AddQuestions'])

                for question in newQuestionsList:
                    ret_tuple = createQuestion(question)
                    isNewQuestionCreated = ret_tuple[0]

                    if isNewQuestionCreated is None:
                        return JsonResponse({"Status": ret_tuple[1]}, status=500)

                    questionObj = ret_tuple[1]

                    if questionObj.body not in [question.body for question in examObj.questions]:
                        examObj.questions.append(questionObj)
                        addedQuestionsFlg = True

                        # if the new question's subject is not in the exam subjects, add it
                        if questionObj.subject.name not in [subject.name for subject in examObj.subjects]:
                            print(questionObj.subject.name)
                            print([subject.name for subject in examObj.subjects])
                            examObj.subjects.append(questionObj.subject)

            # delete a question
            if 'DeleteQuestions' in body.keys():
                newQuestionsList = list(body['DeleteQuestions'])

                for question in newQuestionsList:
                    try:
                        questionObj = Question.objects.get(
                            body=question['body'])

                        if questionObj.body in [question.body for question in examObj.questions]:
                            examObj.questions = list(
                                filter(lambda question: question.body != questionObj.body, examObj.questions))
                            deletedQuestionsFlg = True

                            # if the deleted question's subject is in the exam subjects,
                            # and no other exam question is from this subject,
                            # delete the subject from the exam subjects
                            deletedQuestionSubject = questionObj.subject
                            if deletedQuestionSubject.name in [subject.name for subject in examObj.subjects] \
                                    and deletedQuestionSubject.name not in [question.subject.name for question in examObj.questions]:
                                examObj.subjects = list(filter(
                                    lambda subject: subject.name != deletedQuestionSubject.name, examObj.subjects))

                    except:
                        questionToDeleteNotExistFlg = True

            # change exam name
            if 'ChangeName' in body.keys():
                newName = body['ChangeName']
                if examObj.name != newName:
                    examObj.name = newName
                    changedNameFlg = True

            # change exam date
            if 'ChangeDate' in body.keys():
                newDate = body['ChangeDate']
                newDateObj = datetime.strptime(newDate, "%Y-%m-%d").date()
                if examObj.date != newDateObj:
                    examObj.date = newDateObj
                    changedDateFlg = True

            if changedNameFlg == True or changedDateFlg == True:
                newExamID = str(examObj.name) + "_" + str(examObj.date)
                examObj.examID = newExamID

            if changedNameFlg == True or changedDateFlg == True or changedCourseFlg == True \
                    or changedWritersFlg == True or addedQuestionsFlg == True or deletedQuestionsFlg == True:
                Exam.objects.filter(examID=examID).delete()
                examObj.save()

            ret_json = dict()
            ret_json["Edited Exam"] = changeExamTemplate(examObj);

            if changedNameFlg == True:
                ret_json['Changed Name'] = "True"
            else:
                ret_json['Changed Name'] = "False"

            if changedDateFlg == True:
                ret_json['Changed Date'] = "True"
            else:
                ret_json['Changed Date'] = "False"

            if changedWritersFlg == True:
                ret_json['Changed Writers'] = "True"
            else:
                ret_json['Changed Writers'] = "False"

            if changedCourseFlg == True:
                ret_json['Changed Course'] = "True"
            else:
                ret_json['Changed Course'] = "False"

            if addedQuestionsFlg == True:
                ret_json['Added Questions'] = "True"
            else:
                ret_json['Added Questions'] = "False"

            if deletedQuestionsFlg == True:
                ret_json['Deleted Questions'] = "True"
            else:
                ret_json['Deleted Questions'] = "False"

            if questionToDeleteNotExistFlg == True:
                ret_json['Error'] = "Can't delete one or more of the questions to delete, becuse they don't exist"

            return JsonResponse(ret_json)

        except Exception as e:
            return JsonResponse(
                {
                        "Exception": str(e),
                        "Status": "Can't Edit Question"
                    },
                status=500
            )

    else:  # request.method isn't POST
        return JsonResponse(
            {
                    "Status": "editExam() only accepts POST requests",
                },
            status=500
        )


######################################################
'''
getExams()
method: GET
Returns all the existing exams in the DB
'''
#####################################################
@csrf_exempt
def getExams(request):
    if request.method == "GET":
        exams = Exam.objects.all()
        examsList = changeExamsTemplateInList(exams)

        return JsonResponse(list(examsList), safe=False)

    else:  # request.method isn't GET
        return JsonResponse(
            {
                        "Status": "getExams() only accepts GET requests",
                    },
            status=500
            )


######################################################
'''
getExamsFromCourse()
method: GET
Returns all the existing exams in the DB
'''
#####################################################
@csrf_exempt
def getExamsFromCourse(request):
    if request.method == "GET":
        courseName = request.GET.get("courseName")
        try: 
            courseObj = Course.objects.get(name=courseName)

            exams = Exam.objects.filter(course=courseObj)
            examsOrdered = sorted(exams, key=operator.attrgetter('date'), reverse = True)
            examsList = changeExamsTemplateInList(examsOrdered)

            return JsonResponse(list(examsList), safe=False)
        
        except Exception as e:
            return JsonResponse({
                "Error": str(e),
                "Status": f"Can't get exams from course {courseName}"
            })

    else:  # request.method isn't GET
        return JsonResponse(
            {
                        "Status": "getExams() only accepts GET requests",
                    },
            status=500
            )


######################################################
'''
deleteExam()
method: GET
GET params: examID of exam to delete
'''
#####################################################
@csrf_exempt
def deleteExam(request):
    if request.method == "GET":
        examID = request.GET.get("examID")

        try:
            Exam.objects.filter(examID=examID).delete()
            return JsonResponse({"Status": f"Deleted Exam '{examID}'"})

        except Exception as e:
            return JsonResponse(
                {
                        "Exception": str(e),
                        "Status": f"Can't delete exam {examID}",
                    },
                status=500
            )

    else:
        return JsonResponse(
            {
                    "Status": "deleteExam() only accepts GET requests",
                },
            status=500
        )


######################################################
'''
getExamByID()
method: GET
Returns exam by its ID (if it exists in DB)
'''
#####################################################
@csrf_exempt
def getExamByID(request):
    if request.method == "GET":
        try:
            examID = request.GET.get("examID")
            examObj = Exam.objects.get(examID=examID)
            return JsonResponse(changeExamTemplate(examObj))

        except:
            return JsonResponse({"Status": f"Exam {examID} doesn't exist in DB"}, status=500)

    return JsonResponse(
        {
                        "Status": "getExamByID() only accepts GET requests",
                    },
        status=500
        )


######################################################
'''
setStudent()
method: POST
POST body example:
{
	"username": "inbar",
    "school": "Computer Science",
	"relevantCourses":[
        {
        	"name": "Computer Networks"
        },
        {
        	"name":"OOP"
        }
	],
    "examsGradesList": [
        {
            "examID": "מבחן ברשתות תקשורת מועד א' 2020-20-01",
            "examGrade": 100
        }
    ]
}
'''
#####################################################
@csrf_exempt
def setStudent(request):
    if request.method == "POST":
        # decode request body
        body = parseRequestBody(request)

        ret_tuple = createStudent(body)
        isNewStudentCreated = ret_tuple[0]

        if isNewStudentCreated is None:
            return JsonResponse({"Status": ret_tuple[1]}, status=500)

        elif isNewStudentCreated == True:
            return JsonResponse(
                {
                    "Status":"Created Student"
                }
            )
        
        else:
            return JsonResponse(
                {
                    "Status": "Student Already Exists"
                },
                status=500
            )

    else:
         return JsonResponse(
            {
                "Status": "setStudent() only accepts POST requests"
            },
            status=500
        )

######################################################
'''
 editStudent(request)
 Method: POST
 POST body example:
{
	"username":"inbarcha",
    "changeSchool": "Computer Science"
    "changeRelevantCourses": [ "Computer Networks", ...],
    "changeExamsGradesList": 
    [ 
         {
            "examID": "מבחן ברשתות תקשורת מועד א' 2020-20-01",
            "examGrade": 100
        },
         {
            "examID": "מבחן בתכנות מונחה עצמים מועד א' 2020-20-01",
            "examGrade": 90
        }
    ]
}
'''
######################################################
@csrf_exempt
def editStudent(request):
    if request.method == "POST":
        changedCoursesFlg = False
        changedSchoolFlg = False
        changedExamsGradesListFlg = False

        # decode request body
        body = parseRequestBody(request)

        if 'username' not in body.keys():
            return JsonResponse({"Status": "Can't Edit Student: 'username' field in not in request body"}, status=500)
        username = body['username']

        try:
            studentObj = Student.objects.get(username=username)
            
            # get students courses list. If it changed, change in DB
            if "changeRelevantCourses" in body.keys():
                newRelevantCourses = body["changeRelevantCourses"]
                oldRelevantCourses = studentObj.relevantCourses

                newCoursesFiltered = [course for course in newRelevantCourses if course not in oldRelevantCourses]
                oldCoursesFiltered = [course for course in oldRelevantCourses if course not in newRelevantCourses]

                if newCoursesFiltered or oldCoursesFiltered:
                    changedCoursesFlg = True

                    # iterate over courses given in the request body
                    # for each course, if it doesn't exist in the db, create it
                    for doc in newRelevantCourses:
                        ret_tuple = createCourseOrAddSubject({"name":doc})
                        isCourseReturned = ret_tuple[0]
                        if isCourseReturned is None:
                            return JsonResponse({"Status": ret_tuple[1]}, status=500)
                    
                    Student.objects.filter(username=username).update(relevantCourses=newRelevantCourses)
            
            if 'changeExamsGradesList' in body.keys():
                newExamsGradesList = body["changeExamsGradesList"]
                oldExamsGradesList = studentObj.examsGradesList

                newExamsGradesListFiltered = [examGrade for examGrade in newExamsGradesList if examGrade not in oldExamsGradesList]
                oldExamsGradesListFiltered = [examGrade for examGrade in oldExamsGradesList if examGrade not in newExamsGradesList]

                if newExamsGradesListFiltered or oldExamsGradesListFiltered:
                    changedExamsGradesListFlg = True

                    examsGradesListFinal = []
                    for examsGradeJson in newExamsGradesList:
                        examID = examsGradeJson["examID"]
                        examGrade = examsGradeJson["examGrade"]

                        examGradeObj = ExamGradesObj(examID=examID, examGrade=int(examGrade))
                        examsGradesListFinal.append(examGradeObj)

                    Student.objects.filter(username=username).update(examsGradesList=examsGradesListFinal)
            
            if "changeSchool" in body.keys():
                newSchool = body["changeSchool"]
                oldSchool = studentObj.school

                if newSchool != oldSchool:
                    changedSchoolFlg = True
                    Student.objects.filter(username=username).update(school=newSchool)

            ret_json = dict()

            if changedCoursesFlg == True:
                ret_json['Changed Courses'] = "True"
            else:
                ret_json['Changed Courses'] = "False"

            if changedSchoolFlg == True:
                ret_json['Changed School'] = "True"
            else:
                ret_json['Changed School'] = "False"
            
            if changedExamsGradesListFlg == True:
                ret_json['Changed Exams Grades List'] = "True"
            else:
                ret_json['Changed Exams Grades List'] = "False"

            return JsonResponse(ret_json)

        except Exception as e:
            return JsonResponse(
                {
                        "Exception": str(e),
                        "Status": "Can't Edit Student"
                    },
                status=500
            )

    else:
        return JsonResponse(
            {
                "Status": "editStudent() only accepts POST requests"
            },
            status=500
        )


######################################################
'''
getStudents()
method: GET
Returns all the existing students in the DB
'''
#####################################################
@csrf_exempt
def getStudents(request):
    if request.method == "GET":
        students = Student.objects.all()
        studentsList = [student.as_json() for student in students]

        return JsonResponse(list(studentsList), safe=False)

    else:  # request.method isn't GET
        return JsonResponse(
            {
                        "Status": "getStudents() only accepts GET requests",
                    },
            status=500
            )


######################################################
'''
deleteStudent()
method: GET
GET params: username of student to delete
'''
#####################################################
@csrf_exempt
def deleteStudent(request):
    if request.method == "GET":
        username = request.GET.get("username")

        try:
            Student.objects.get(username=username)
            Student.objects.filter(username=username).delete()
            return JsonResponse({"Status": f"Deleted Student '{username}'"})

        except Exception as e:
            return JsonResponse(
                {
                        "Exception": str(e),
                        "Status": f"Can't delete student {username}",
                    },
                status=500
            )

    else:
        return JsonResponse(
            {
                    "Status": "deleteStudent() only accepts GET requests",
                },
            status=500
        )


######################################################
'''
getStudentByUsername()
method: GET
Returns student by its username (if it exists in DB)
'''
#####################################################
@csrf_exempt
def getStudentByUsername(request):
    if request.method == "GET":
        username = request.GET.get("username")

        try:
            studentObj = Student.objects.get(username=username)
            return JsonResponse(studentObj.as_json())

        except:
            return JsonResponse({"Status": f"Student {username} doesn't exist in DB"}, status=500)

    return JsonResponse(
        {
                        "Status": "getStudentByUsername() only accepts GET requests",
                    },
        status=500
        )


######################################################
'''
setLecturer()
method: POST
POST body example:
{
    "username": "eliavme"
    "schools":["מדעי המחשב", "משפטים"]
	"coursesTeaching": [{"name": "Computer Networks", {"name": iOS"}]
}
'''
#####################################################
@csrf_exempt
def setLecturer(request):
    if request.method == "POST":
        # decode request body
        body = parseRequestBody(request)

        ret_tuple = createLecturer(body)
        isNewLecturerCreated = ret_tuple[0]

        if isNewLecturerCreated is None:
            return JsonResponse({"Status": ret_tuple[1]}, status=500)

        elif isNewLecturerCreated == True:
            return JsonResponse(
                {
                    "Status":"Created Lecturer"
                }
            )
        
        else:
            return JsonResponse(
                {
                    "Status": "Lecturer Already Exists"
                },
                status=500
            )

        
    else:
        return JsonResponse(
            {
                "Status": "setLecturer() only accepts POST requests"
            },
            status=500
        )


######################################################
'''
 editLecturer(request)
 Method: POST
 POST body example:
 {
    "username": "eliavme"
    "changeSchools": ["Computer Science", "law"]
	"changeCoursesTeaching": [ "Computer Networks", ...]
}
'''
########################################################
@csrf_exempt
def editLecturer(request):
    if request.method == "POST":
        changedCoursesFlg = False
        changedSchoolsFlg = False

        # decode request body
        body = parseRequestBody(request)

        if 'username' not in body.keys():
            return JsonResponse({"Status": "Can't Edit Lecturer: 'username' field in not in request body"}, status=500)
        username = body['username']

        try:
            lecturerObj = Lecturer.objects.get(username=username)

            if "changeCoursesTeaching" in body.keys():
                newCoursesTeaching = body["changeCoursesTeaching"]
                oldCoursesTeaching = lecturerObj.coursesTeaching

                newCoursesFiltered = [course for course in newCoursesTeaching if course not in oldCoursesTeaching]
                oldCoursesFiltered = [course for course in oldCoursesTeaching if course not in newCoursesTeaching]

                if newCoursesFiltered or oldCoursesFiltered:
                    changedCoursesFlg = True

                    # iterate over courses given in the request body
                    # for each course, if it doesn't exist in the db, create it
                    for doc in newCoursesTeaching:
                        ret_tuple = createCourseOrAddSubject({"name": doc})
                        isCourseReturned = ret_tuple[0]
                        if isCourseReturned is None:
                            return JsonResponse({"Status": ret_tuple[1]}, status=500)
                    
                    Lecturer.objects.filter(username=username).update(coursesTeaching=newCoursesTeaching)

            if "changeSchools" in body.keys():
                newSchools = body["changeSchools"]
                oldSchools = lecturerObj.school

                newSchoolsFiltered = [school for school in newSchools if school not in oldSchools]
                oldSchoolsFiltered = [school for school in oldSchools if school not in newSchools]
                
                if newSchoolsFiltered or oldSchoolsFiltered:
                    changedSchoolsFlg = True
                    Lecturer.objects.filter(username=username).update(schools=newSchools)

            ret_json = dict()

            if changedCoursesFlg == True:
                ret_json['Changed Courses'] = "True"
            else:
                ret_json['Changed Courses'] = "False"
            
            if changedSchoolsFlg == True:
                ret_json['Changed Schools'] = "True"
            else:
                ret_json['Changed Schools'] = "False"

            return JsonResponse(ret_json)

        except Exception as e:
            return JsonResponse(
                {
                        "Exception": str(e),
                        "Status": "Can't Edit Lecturer"
                    },
                status=500
            )

    else:
        return JsonResponse(
            {
                "Status": "editLecturer() only accepts POST requests"
            },
            status=500
        )


######################################################
'''
deleteLecturer()
method: GET
GET params: username of lecturer to delete
'''
#####################################################
@csrf_exempt
def deleteLecturer(request):
    if request.method == "GET":
        username = request.GET.get("username")

        try:
            Lecturer.objects.get(username=username)
            Lecturer.objects.filter(username=username).delete()
            return JsonResponse({"Status": f"Deleted Lecturer '{username}'"})

        except Exception as e:
            return JsonResponse(
                {
                        "Exception": str(e),
                        "Status": f"Can't delete lecturer {username}",
                    },
                status=500
            )

    else:
        return JsonResponse(
            {
                    "Status": "deleteLecturer() only accepts GET requests",
                },
            status=500
        )


######################################################
'''
getLecturers()
method: GET
Returns all the existing lecturers in the DB
'''
#####################################################
@csrf_exempt
def getLecturers(request):
    if request.method == "GET":
        lecturers = Lecturer.objects.all()
        lecturersList = [lecturer.as_json() for lecturer in lecturers]

        return JsonResponse(list(lecturersList), safe=False)

    else:  # request.method isn't GET
        return JsonResponse(
            {
                        "Status": "getLecturers() only accepts GET requests",
                    },
            status=500
            )


######################################################
'''
getLecturerByUsername()
method: GET
Returns lecturer by its username (if it exists in DB)
'''
#####################################################
@csrf_exempt
def getLecturerByUsername(request):
    if request.method == "GET":
        username = request.GET.get("username")

        try:
            lecturerObj = Lecturer.objects.get(username=username)
            return JsonResponse(lecturerObj.as_json())

        except:
            return JsonResponse({"Status": f"Lecturer {username} doesn't exist in DB"}, status=500)

    return JsonResponse(
        {
                        "Status": "getLecturerByUsername() only accepts GET requests",
                    },
        status=500
        )


###################################################
'''
setAdmin()
method: POST
POST body example:
{
	"username" : "David",
}
'''
###################################################
@csrf_exempt
def setAdmin(request):
    if request.method == "POST":
        # decode request body
        body = parseRequestBody(request)

        username = body["username"]

        try:
            Admin.objects.get(username=username)
            print(f"Admin {username} already exists")
            return JsonResponse(
                {
                    "Status": "Admin Already Exists",
                },
                status=500
            )

        except:
            newAdmin = Admin(username=username)
            newAdmin.save()

            return JsonResponse(
                {
                    "Status": "Added Admin",
                }
            )

    else:
        return JsonResponse(
            {
                "Status": "setAdmin() only accepts POST requests"
            },
            status=500
        )


# ######################################################
# '''
#  editAdmin(request)
#  Method: POST
#  POST body example:
# {
# 	"email":"inbarcha1@gmail.com",
# 	"ChangeFirstName": "Inbarrrr",
# 	"ChangeLastName":"Hachmonnn",
# 	"ChangePermissions":[
# 			"Create Exam"
# 		]
# }
# '''
# ######################################################
# @csrf_exempt
# def editAdmin(request):
#     if request.method == "POST":
#         # decode request body
#         body = parseRequestBody(request)

#         if 'email' not in body.keys():
#             return JsonResponse({"Status": "Can't Edit Admin: 'email' field in not in request body"}, status=500)
#         email = body['email']

#         try:
#             adminObj = Admin.objects.get(email=email)
#             ret_list = editUser(adminObj, body)

#             if ret_list[0] is None:
#                 return JsonResponse({"Status": ret_list[1]})

#             newAdminObj = ret_list[0]
#             changedEmailFlg = ret_list[1]
#             changedFirstNameFlg = ret_list[2]
#             changedLastNameFlg = ret_list[3]
#             changedPermissionsFlag = ret_list[4]

#             ret_json = dict()
#             if changedFirstNameFlg == True:
#                 Admin.objects.filter(email=email).update(
#                     first_name=newAdminObj.first_name)
#                 ret_json['Changed First Name'] = "True"
#             else:
#                 ret_json['Changed First Name'] = "False"

#             if changedLastNameFlg == True:
#                 Admin.objects.filter(email=email).update(
#                     last_name=newAdminObj.last_name)
#                 ret_json['Changed Last Name'] = "True"
#             else:
#                 ret_json['Changed Last Name'] = "False"

#             if changedPermissionsFlag == True:
#                 Admin.objects.filter(email=email).update(
#                     permissions=newAdminObj.permissions)
#                 ret_json['Changed Permissions'] = "True"
#             else:
#                 ret_json['Changed Permissions'] = "False"

#             if changedEmailFlg == True:
#                 Admin.objects.filter(email=email).update(
#                     email=newAdminObj.email)
#                 ret_json['Changed Email'] = "True"
#             else:
#                 ret_json['Changed Email'] = "False"

#             return JsonResponse(ret_json)

#         except Exception as e:
#             return JsonResponse(
#                 {
#                         "Exception": str(e),
#                         "Status": "Can't Edit Admin"
#                     },
#                 status=500
#             )

#     else:
#         return JsonResponse(
#             {
#                 "Status": "editAdmin() only accepts POST requests"
#             },
#             status=500
#         )


##################################################
'''
getAdmins()
method: GET
Returns all the existing admins in the DB
'''
##################################################
@csrf_exempt
def getAdmins(request):
    if request.method == "GET":
        admins = Admin.objects.all()
        adminsList = [admin.as_json() for admin in admins]

        return JsonResponse(list(adminsList), safe=False)

    else:  # request.method isn't GET
        return JsonResponse(
            {
                        "Status": "getAdmins() only accepts GET requests",
                    },
            status=500
            )


######################################################
'''
deleteAdmin()
method: GET
GET params: username of admin to delete
'''
#####################################################
@csrf_exempt
def deleteAdmin(request):
    if request.method == "GET":
        username = request.GET.get("username")

        try:
            Admin.objects.filter(username=username).delete()
            return JsonResponse({"Status": f"Deleted Admin '{username}'"})

        except Exception as e:
            return JsonResponse(
                {
                        "Exception": str(e),
                        "Status": f"Can't delete admin {username}",
                    },
                status=500
            )

    else:
        return JsonResponse(
            {
                    "Status": "deleteAdmin() only accepts GET requests",
                },
            status=500
        )


######################################################
'''
getAdminByUsername()
method: GET
Returns admin by its username (if it exists in DB)
'''
#####################################################
@csrf_exempt
def getAdminByUsername(request):
    if request.method == "GET":
        username = request.GET.get("username")

        try:
            adminObj = Admin.objects.get(username=username)
            return JsonResponse(adminObj.as_json())

        except:
            return JsonResponse({"Status": f"Admin {username} doesn't exist in DB"}, status=500)

    return JsonResponse(
        {
                        "Status": "getAdminByUsername() only accepts GET requests",
                    },
        status=500
        )

######################################################
'''
isLoggedIn()
'''
#####################################################
@csrf_exempt
def isLoggedIn(request):
    if request.method == "GET":
        if not request.user.is_authenticated:
            return JsonResponse(
                {
                    "isLoggedIn": False,
                },
            )
        else:
            return JsonResponse(
                {
                    "isLoggedIn": True,
                    "user": request.user.username
                }
            )


    return JsonResponse(
            {
                "Status": "isLoggedIn() only accepts GET requests",
            },
            status=500
        )


######################################################
'''
logIn()
POST request body:
{
	"username": "inbar",
	"password": "12345678"
}
'''
#####################################################
@csrf_exempt
def logIn(request):
    if request.method == "POST":
        body = parseRequestBody(request)

        if 'username' not in body.keys() or 'password' not in body.keys():
            return JsonResponse(
                {
                    "isLoggedIn": False,
                    "reason": "'username' or 'password' not in request body"
                }
            )
        username = body["username"]
        password = body["password"]
        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)

            # check if user is Student, lecturer or admin
            if Student.objects.filter(username=username).count() > 0:
                student = Student.objects.get(username=username)
                courses = student.relevantCourses
                schools = [student.school]

                examsSolved = student.as_json()["examsGradesList"]

                userType = "Student"
            elif Lecturer.objects.filter(username=username).count() > 0:
                lecturer = Lecturer.objects.get(username=username)
                courses = lecturer.coursesTeaching
                schools = lecturer.schools
                examsSolved = "None"
                userType = "Lecturer"
            elif Admin.objects.filter(username=username).count() > 0:
                userType = "Admin"
                schools = "None"
                courses = "None"
                examsSolved = "None"
            else: 
                userType = "No User Type"

            return JsonResponse(
                {
                    "isLoggedIn": True,
                    "username": user.username,
                    "email": user.email,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "type": userType,
                    "courses": courses,
                    "schools": schools,
                    "examsSolved": examsSolved
                }
            )

        else:
            return JsonResponse(
                {
                    "isLoggedIn": False,
                }
            )


    return JsonResponse(
            {
                "Status": "logIn() only accepts POST requests",
            },
            status=500
        )


######################################################
'''
register()
POST request body:
{
	"username": "david",
	"password": "12345678",
	"first_name": "david",
	"last_name": "shaulov",
	"email": "david@gmail.com".
    "type": "Student",
    "school": "Computer Science" //if user is student
    "schools": ["Computer Science", "Law"] //if user is lecturer
}
'''
#####################################################
@csrf_exempt
def register(request):
    if request.method == "POST":
        body = parseRequestBody(request)

        if 'username' not in body.keys() or 'first_name' not in body.keys() or 'last_name' not in body.keys() \
             or 'password' not in body.keys() or 'email' not in body.keys() or 'type' not in body.keys(): 
            return JsonResponse(
                {
                    "isRegistered": False,
                    "reason": "'username' or 'first_name' or 'last_name' or 'password' not in request body"
                }
            )

        username = body["username"]
        if User.objects.filter(username=username).exists():
            return JsonResponse(
                {
                    "isRegistered": False,
                    "reason": "User already exists"
                }
            )

        first_name = body["first_name"]
        last_name = body["last_name"]
        password = body["password"]
        email = body['email']
        accountType = body['type']
        school = body["school"]
        schools = body["schools"]

        user = User(username=username, first_name=first_name, last_name=last_name, email=email)
        user.set_password(password)
        user.save()

        ret_json = {
                "isRegistered": True,
                "username": user.username,
                "first_name": user.first_name,
                "last_name" : user.last_name,
                "email": user.email,
                "type": accountType,
                "courses": []
            }
        
        if accountType == "Student":
            ret_json["schools"] = [school]
            ret_tuple = createStudent({"username": username, "school": school})
            isNewStudentCreated = ret_tuple[0]

            if isNewStudentCreated is None:
                ret_json["Status"] =  ret_tuple[1]

            elif isNewStudentCreated == True:
                ret_json["Status"] =  "Created Student"
            
            else:
                ret_json["Status"] =  "Student Already Exists"

        elif accountType == "Lecturer":
            ret_json["schools"] = schools
            ret_tuple = createLecturer({"username": username, "schools": schools})
            isNewLecturerCreated = ret_tuple[0]

            if isNewLecturerCreated is None:
                ret_json["Status"] =  ret_tuple[1]

            elif isNewLecturerCreated == True:
                ret_json["Status"] =  "Created Lecturer"
            
            else:
                ret_json["Status"] =  "Lecturer Already Exists"

        elif accountType == "Admin":
            try:
                Admin.objects.get(username=username)
                ret_json["Status"] = "Admin Already Exists"
            except:
                newAdmin = Admin(username=username)
                newAdmin.save()
                ret_json["Status"] = "Created Admin"


        return JsonResponse(
            ret_json
        )
  


    return JsonResponse(
            {
                "Status": "register() only accepts POST requests",
            },
            status=500
        )

######################################################
'''
logOut()
'''
#####################################################
@csrf_exempt
def logOut(request):
    if request.method == "GET":
        logout(request)
        return JsonResponse(
            {
                "isLoggedOut": True,
            }
        )

    else:
        return JsonResponse(
                {
                    "Status": "logout() only accepts GET requests",
                },
                status=500
            )

######################################################
'''
editUser()
POST Body request:
{
	"username": "david",
    "change_username": "davidsh",
	"change_password": "12345678",
	"change_first_name": "david",
	"change_last_name": "shaulov",
	"change_email": "david@gmail.com".
}
'''
#####################################################
@csrf_exempt
def editUser(request):
    if request.method == "POST":
        changedUserNameFlg = False
        changedPasswordFlg = False
        changedFirstNameFlg = False
        changedLastNameFlg = False
        changedEmailFlg = False

        # decode request body
        body = parseRequestBody(request)

        if 'username' not in body.keys():
            return JsonResponse({"Status": "Can't Edit User: 'username' field in not in request body"}, status=500)
        username = body['username']

        try:
            userObj = User.objects.get(username=username)

            if 'change_first_name' in body.keys():
                newFirstName = body['change_first_name']
                if newFirstName != userObj.last_name:
                    userObj.first_name = newFirstName
                    changedFirstNameFlg = True
            
            if 'change_last_name' in body.keys():
                newLastName = body['change_last_name']
                
                if newLastName != userObj.last_name:
                    userObj.last_name = newLastName
                    changedLastNameFlg = True
            
            if 'change_email' in body.keys():
                newEmail = body['change_email']
                if newEmail != userObj.email:
                    userObj.email = newEmail
                    changedEmailFlg = True

            if 'change_password' in body.keys():
                newPassword = body['change_password']
                userObj.set_password(newPassword)
                changedPasswordFlg = True
            
            if 'change_username' in body.keys():
                newUsername = body['change_username']
                if newUsername != userObj.username:
                    userObj.username = newUsername
                    changedUserNameFlg = True

                # change the username in the matching Student / Lecturer / Admin object
                if Student.objects.filter(username=username).count() > 0:
                    Student.objects.filter(username=username).update(username=newUsername)
                elif Lecturer.objects.filter(username=username).count() > 0:
                    Lecturer.objects.filter(username=username).update(username=newUsername)
                elif Admin.objects.filter(username=username).count() > 0:
                    Admin.objects.filter(username=username).update(username=newUsername)
            
            if changedUserNameFlg == True or changedPasswordFlg == True or changedFirstNameFlg == True or changedLastNameFlg == True or changedEmailFlg == True:
                User.objects.filter(username=username).delete()
                userObj.save()

            # create response
            ret_json = dict()

            if changedFirstNameFlg == True:
                ret_json['Changed First Name'] = "True"
            else:
                ret_json['Changed First Name'] = "False"
            
            if changedLastNameFlg == True:
                ret_json['Changed Last Name'] = "True"
            else:
                ret_json['Changed Last Name'] = "False"

            if changedEmailFlg == True:
                ret_json['Changed Email'] = "True"
            else:
                ret_json['Changed Email'] = "False"

            if changedUserNameFlg == True:
                ret_json['Changed Username'] = "True"
            else:
                ret_json['Changed Username'] = "False"

            if changedPasswordFlg == True:
                ret_json['Changed Password'] = "True"
            else:
                ret_json['Changed Password'] = "False"

            return JsonResponse(ret_json)

        except Exception as e:
            return JsonResponse(
                {
                        "Exception": str(e),
                        "Status": "Can't Edit User"
                    },
                status=500
            )

    else:
        return JsonResponse(
            {
                    "Status": "editUser() only accepts POST requests",
                },
            status=500
        )

######################################################
'''
getAllUsers()
GET
'''
#####################################################
def getAllUsers(request):
    if request.method == "GET":
        users = User.objects.all()

        completeUsersList = []
        for user in users:
            username = user.username
            first_name = user.first_name
            last_name = user.last_name
            email = user.email

            # check if user is Student, lecturer or admin
            if Student.objects.filter(username=username).count() > 0:
                student = Student.objects.get(username=username)
                permissions = "Student"
                school =student.school
            elif Lecturer.objects.filter(username=username).count() > 0:
                lecturer = Lecturer.objects.get(username=username)
                permissions = "Lecturer"
                school = lecturer.schools
            elif Admin.objects.filter(username=username).count() > 0:
                permissions = "Admin"
                school = "None"

            userFinal = dict(
                username = username, 
                first_name = first_name,
                last_name = last_name,
                email = email,
                school = school,
                permissions = permissions
            )

            completeUsersList.append(userFinal)

        return JsonResponse(completeUsersList, safe=False)

    else:  # request.method isn't GET
        return JsonResponse(
            {
                        "Status": "getAllUsers() only accepts GET requests",
                    },
            status=500
            )

######################################################
'''
deleteUser()
GET
'''
#####################################################
def deleteUser(request):
    if request.method == "GET":
        username = request.GET.get("username")

        try:
            User.objects.get(username=username)
            User.objects.filter(username=username).delete()

            ret_json = dict()
            ret_json["Status"] = f"Deleted User {username}"

            # check if user is Student, lecturer or admin
            if Student.objects.filter(username=username).count() > 0:
                Student.objects.filter(username=username).delete()
                ret_json["UserType"] = "Student"
            elif Lecturer.objects.filter(username=username).count() > 0:
                Lecturer.objects.filter(username=username).delete()
                ret_json["UserType"] = "Lecturer"
            elif Admin.objects.filter(username=username).count() > 0:
                Admin.objects.filter(username=username).delete()
                ret_json["UserType"] = "Admin"
            
            return JsonResponse({"Status": f"Deleted User '{username}'"})

        except Exception as e:
            return JsonResponse(
                {
                        "Exception": str(e),
                        "Status": f"Can't delete user {username}",
                    },
                status=500
            )

    else:
        return JsonResponse(
            {
                    "Status": "deleteStudent() only accepts GET requests",
                },
            status=500
        )
######################################################
'''
submitResults()
POST Body request:
{
	"username": inbarcha,
    "examGrade": 30,
    "examID": examID,
    "items":[
        {
            answers: (5) ["132.13.168.0/22", "132.13.160.0/21", "132.13.168.0/21", "132.13.175.0/26", "0.0.0.0/0"]
            correctAnswer: 3
            difficulty: 2
            question: "לנתב בעל טבלת הניתוב המצוינת הגיעה הודעה עם כתובת היעד: 132.133.175.90 ציין לאיזה רגל בנתב תועבר ההודעה?"
            selectedAnswers: [4]
            subject: "שכבת הרשת"
        }
    ]
}
'''
#####################################################
@csrf_exempt
def submitResults(request):
    if request.method == "POST":
        # decode request body
        body = parseRequestBody(request)

        if 'items' not in body.keys() or 'username' not in body.keys():
            return JsonResponse({"Status": "Can't Submit Results: 'items' or 'username' fields in not in request body"}, status=500)
        items = body['items']
        examID = body["examID"]
        examGrade = body["grade"]
        username = body['username']

        try:
            studentObj = Student.objects.get(username=username)
        except Exception as e:
               return JsonResponse(
                {
                        "Exception": str(e),
                        "Status": f"Can't Submit Resuls: username {username} isn't a student",
                    },
                status=500
            ) 

        # handle saving of questions answered correctly and incorrectly
        questionsSubmitted = []

        for item in items:
            answers = item["answers"]
            correctAnswer = item["correctAnswer"]
            difficulty = item["difficulty"]
            questionBody = item["question"]
            selectedAnswer = item["selectedAnswers"][0]
            subject = item["subject"]

            currQuestionSubmitted = QuestionSubmitted(answers = answers, correctAnswer = correctAnswer, difficulty = difficulty,
                    body = questionBody, selectedAnswers=item["selectedAnswers"], subject=subject)
            questionsSubmitted.append(currQuestionSubmitted)

            answeredCorretFlg = (correctAnswer == selectedAnswer)

            # get the questionObj from DB
            try:
                questionObj = Question.objects.get(body=questionBody)
                courseObj = questionObj.course
                questionsAnsweredPerCourse = studentObj.questionsAnsweredPerCourse

                foundCourseFlg = False
                for i in range(len(questionsAnsweredPerCourse)):
                    currQuestionsAnsweredPerCourse = questionsAnsweredPerCourse[i]

                    if currQuestionsAnsweredPerCourse.courseName == courseObj.name:
                        foundCourseFlg = True

                        questionsAnsweredPerSubject = currQuestionsAnsweredPerCourse.questionsAnsweredPerSubject
                        foundSubjectFlg = False;
                        for j in range(len(questionsAnsweredPerSubject)):
                            currQuestionsAnsweredPerSubject = questionsAnsweredPerSubject[j]

                            if currQuestionsAnsweredPerSubject.subjectName == subject:
                                foundSubjectFlg = True

                                answeredCorrectList = currQuestionsAnsweredPerSubject.answeredCorrect
                                answeredWrongList = currQuestionsAnsweredPerSubject.answeredWrong

                                if questionObj.body in [question.body for question in answeredCorrectList]:
                                    if answeredCorretFlg == False:
                                        answeredCorrectList = [question for question in answeredCorrectList if question.body != questionObj.body]
                                if questionObj.body in [question.body for question in answeredWrongList]:
                                    if answeredCorretFlg == True:
                                        answeredWrongList = [question for question in answeredWrongList if question.body != questionObj.body]

                                if answeredCorretFlg == True:
                                    if questionObj.body not in [question.body for question in answeredCorrectList]: 
                                        answeredCorrectList.append(questionObj)
                                else:
                                    if questionObj.body not in [question.body for question in answeredWrongList]: 
                                        answeredWrongList.append(questionObj)

                                currQuestionsAnsweredPerSubject.answeredCorrect = answeredCorrectList
                                currQuestionsAnsweredPerSubject.answeredWrong = answeredWrongList
                                questionsAnsweredPerSubject[j] = currQuestionsAnsweredPerSubject
                                questionsAnsweredPerCourse[i].questionsAnsweredPerSubject = questionsAnsweredPerSubject

                                break
                        
                        if foundSubjectFlg == False:
                            subjectName = subject
                            answeredCorrect = []
                            answeredWrong = []
                            if answeredCorretFlg == True:
                                answeredCorrect.append(questionObj)
                            else:
                                answeredWrong.append(questionObj)
                            
                            newQuestionsAnsweredPerSubject = QuestionsAnsweredPerSubject(subjectName=subjectName, answeredCorrect = answeredCorrect, answeredWrong = answeredWrong)
                            questionsAnsweredPerCourse[i].questionsAnsweredPerSubject.append(newQuestionsAnsweredPerSubject)
                    
                        break
                
                if foundCourseFlg == False:
                    subjectName = subject
                    answeredCorrect = []
                    answeredWrong = []
                    if answeredCorretFlg == True:
                        answeredCorrect.append(questionObj)
                    else:
                        answeredWrong.append(questionObj)

                    newQuestionsAnsweredPerSubject = QuestionsAnsweredPerSubject(subjectName=subjectName, answeredCorrect = answeredCorrect, answeredWrong = answeredWrong)
                    questionsAnsweredPerSubject = [newQuestionsAnsweredPerSubject]
                    courseName = courseObj.name

                    newQuestionsAnsweredPerCourse = QuestionsAnsweredPerCourse(courseName = courseName, questionsAnsweredPerSubject = questionsAnsweredPerSubject)
                    questionsAnsweredPerCourse.append(newQuestionsAnsweredPerCourse)

            except Exception as e:
               return JsonResponse(
                {
                        "Exception": str(e)
                    },
                status=500
            ) 

        # handle saving of examID and examGrade
        now = datetime.now()
        dateObj = datetime.strptime(str(now.year) + "-" + str(now.month) + "-" + str(now.day) + " " + str(now.hour) + ":" + str(now.minute), "%Y-%m-%d %H:%M").date()
        
        currExamGradesObj = ExamGradesObj(examID=examID, examGrade = examGrade, dateSolved=dateObj, questionsSubmitted=questionsSubmitted)
        studentExamsGradesList = studentObj.examsGradesList
        studentExamsGradesList.append(currExamGradesObj)
        
        Student.objects.filter(username=username).update(questionsAnsweredPerCourse=questionsAnsweredPerCourse, examsGradesList=studentExamsGradesList)

        return JsonResponse(
            { 
                "Exams Solved": [examGrade.as_json() for examGrade in studentExamsGradesList],
                "Status": "results submitted" 
            },
            status=200
        )
    else:
        return JsonResponse(
            {
                    "Status": "submitResults() only accepts POST requests",
                },
            status=500
        )
   
