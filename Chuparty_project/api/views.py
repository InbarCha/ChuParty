from django.shortcuts import render
from api.models import *
from django.views.decorators.csrf import csrf_exempt
import json
from django.http import JsonResponse


def parseRequestBody(request):
    body_unicode = request.body.decode('utf-8')
    return json.loads(body_unicode)


def index(request):                
    return render(request, 'frontend/index.html')

######################################################
# getSubjects()
# method: GET
# Returns all the existing subjects in the DB
#####################################################
def getSubjects(request):
    if request.method == "GET": 
        subjectsList = list(Subject.objects.values())
        return JsonResponse(subjectsList, safe=False)

    return JsonResponse(
                    {
                        "Status": "getSubjects() only accepts GET requests",
                    }
                )


######################################################
# setSubject()
# method: POST
# POST body example:
# {
# 	"name" : "Stack"
# }
#####################################################
@csrf_exempt
def setSubject(request):
    if request.method == "POST": 
        # decode request body
        body = parseRequestBody(request)

        ret_tuple = createSubject(body)
        isNewSubjectCreated = ret_tuple[0]
        
        if isNewSubjectCreated == True:
            return JsonResponse(
                    { 
                        "Status": "Created Subject",
                    }
                )
        else:
            return JsonResponse(
                    {
                        "Status": "Subject Already Exists",
                    }
                )

    else: # request.method isn't POST
        return JsonResponse(
                    {
                        "Status": "setSubject() only accepts POST requests",
                    }
                )

#####################################
# createSubject
# help function
###################################
def createSubject(requestBody):
    # get subjectName from request body
    subjectName = requestBody['name']
    print(subjectName)

    try: # subject exists in DB, don't create it again
        subjectFromDb = Subject.objects.get(name=subjectName)
        print("subject already exists")
        return (False, subjectFromDb)

    except: # subject doesn't exist in the db, save it
        subject = Subject(name=subjectName)
        subject.save()
        return (True, subject)


######################################################
# setCourse()
# method: POST
# POST body example:
# {
# 	"name" : "Operating Systems",
# 	"subjects": [
# 		{
# 			"name": "processes"
# 		},
# 		{
# 			"name": "threads"
# 		}
# 	]
# }
#####################################################
@csrf_exempt
def setCourse(request):
    if request.method == "POST":
        # decode request body
        body = parseRequestBody(request)

        isNewCourseCreated = createCourse(body)[0]
        if isNewCourseCreated == False:
            return JsonResponse(
                {
                    "Status": "Course Already Exists",
                }
            )
        else:
            return JsonResponse(
                    {
                        "Status": "Added Course",
                    }
                )

    else: # request.method isn't POST
        return JsonResponse(
                    {
                        "Status": "setCourse() only accepts POST calls",
                    }
                )

#######################################
# createCourse(requestBody)
# help function
######################################
def createCourse(requestBody):
    # get Subjects' names and course name from request body
    courseName = requestBody['name']
    
    try:
        courseFromDB = Course.objects.get(name=courseName)
        print(f"course {courseName} already exists, checking if subjects needs to be updated")

        # create subjectsList from requestBody
        subjectsList = appendSubjectsToList(requestBody)

        # update the course object in the DB with the new subjectsList
        Course.objects.filter(name=courseName).update(subjects=subjectsList)

        # get the updated course object from DB and return it
        courseFromDB = Course.objects.get(name=courseName)
        return (False, courseFromDB)
        
    except:
        subjectsList = appendSubjectsToList(requestBody)
        newCourse = Course(name=courseName, subjects=subjectsList)

        newCourse.save()
        return (True, newCourse)

#######################################
# appendSubjectsToList(requestBody)
# help function
######################################
def appendSubjectsToList(requestBody):
    subjectsList = []

    if 'subjects' in requestBody.keys():
        subjects = requestBody['subjects']

        # iterate over subjects given in the request body
        # for each subject, if it doesn't exist in the db, create it
        for doc in subjects:
            subject = createSubject(doc)[1]
            subjectsList.append(subject)
    
    return subjectsList

######################################################
# getCourses()
# method: GET
# Returns all the existing courses in the DB
#####################################################
def getCourses(request):
    if request.method == "GET": 
        courses = Course.objects.all()
        coursesList = [course.as_json() for course in courses]

        return JsonResponse(list(coursesList), safe=False)

    else: # request.method isn't GET
        return JsonResponse(
                    {
                        "Status": "getCourses() only accepts GET requests",
                    }
                )


######################################################
# setSchool()
# method: POST
# POST body example:
# {
# 	"name": "Colman",
# 	"courses": [
# 		{
# 			"name" : "Advanced Programming",
# 			"subjects": [
# 				{
# 					"name": "Java"
# 				},
# 				{
# 					"name": "Design Patterns"
# 				}
# 			]
# 		},
# 		{
# 			"name" : "OOP",
# 			"subjects": [
# 				{
# 					"name": "C++"
# 				},
# 				{
# 					"name": "Polymorphism"
# 				}
# 			]
# 		}
# 	]
# }
#####################################################
@csrf_exempt
def setSchool(request):
    if request.method == "POST":
        # decode request body
        body = parseRequestBody(request)

        # get school name and courses' names from request body
        schoolName = body['name']

        try:
            School.objects.get(name=schoolName)
            print(f"school {schoolName} already exists")
            return JsonResponse(
                {
                    "Status": "School Already Exists",
                }
            )
        except:
            coursesList = []

            if 'courses' in body.keys():
                courses = body['courses']

                # iterate over courses given in the request body
                # for each course, if it doesn't exist in the db, create it
                for doc in courses:
                    ret_tuple = createCourse(doc)
                    isNewCourseCreated = ret_tuple[0]
                    course = ret_tuple[1]

                    if isNewCourseCreated == False:
                        print(f"course {doc} already exists in DB")
                    else:
                        print(f"course {doc} created in DB")
                    
                    coursesList.append(course)

            
            newShool = School(name=schoolName, courses=coursesList)
            newShool.save()
            return JsonResponse(
                    {
                        "Status": "Added School",
                    }
                )


######################################################
# getSchools()
# method: GET
# Returns all the existing schools in the DB
#####################################################
def getSchools(request):
    if request.method == "GET": 
        schools = School.objects.all()
        schoolsList = [school.as_json() for school in schools]

        return JsonResponse(list(schoolsList), safe=False)

    else: # request.method isn't GET
        return JsonResponse(
                    {
                        "Status": "getSchools() only accepts GET requests",
                    }
                )


######################################################
# setQuestion()
# method: POST
# POST body example:
# {
#   "subject":
#       {
#           "name": "DNS"    
#       },          
# 	"course": 
# 		{
# 			"name" : "Computer Networks",
# 			"subjects": [
# 				{
# 					"name":"HTTP"
# 				},
# 				{
# 					"name":"UDP"
# 				}
# 			]
# 		},
#    "body": "What is DNS?",
#    "answers": [
#           "Domain Name Server",
#           "Desturction of Name Servers",
#           "Deduction of Native Services",
#           "Deformation of Name Servers"
#       ],
#     "correctAnswer": 0
# }
#####################################################
@csrf_exempt
def setQuestion(request):
    if request.method == "POST":
        # decode request body
        body = parseRequestBody(request)

        # get Question parans
        # questionBody
        questionBody = body['body']

        try:
            Question.objects.get(body=questionBody)
            print(f"question {questionBody} already exists")
            return JsonResponse(
                {
                    "Status": "Question Already Exists",
                }
            )
        except:
            # subject
            subject = body['subject']
            subjectObj = createSubject(subject)[1]

            # course
            course = body['course']
            appendSubjectToCourse = False
            if 'subjects' not in course.keys():
                course['subjects'] = list()
                appendSubjectToCourse = True
            elif subject not in course['subjects']:
                appendSubjectToCourse = True
            #--------------------------------------
            if appendSubjectToCourse == True:
                course['subjects'].append(subjectObj.as_json())
            #--------------------------------------
            courseObj = createCourse(course)[1]

            # answers
            answers = list(body['answers'])

            # correntAnswer
            correctAnswer = int(body['correctAnswer'])

            questionObj = Question(
                subject=subjectObj,
                course=courseObj, 
                body=questionBody,
                answers=answers,
                correctAnswer=correctAnswer
            )
            questionObj.save()

            return JsonResponse(
                {
                    "Status": "Added Question"
                }
            )
    
    else:
        return JsonResponse(
            {
                "Status": "setQuestion() only accepts POST requests"
            }
        )

    
######################################################
# getQuestions()
# method: GET
# Returns all the existing questions in the DB
#####################################################
def getQuestions(request):
    if request.method == "GET": 
        questions = Question.objects.all()
        questionsList = [questions.as_json() for questions in questions]

        return JsonResponse(list(questionsList), safe=False)

    else: # request.method isn't GET
        return JsonResponse(
                    {
                        "Status": "getSchools() only accepts GET requests",
                    }
                )


######################################################
# setStudent()
# method: POST
# POST body example:
# {
# 	"first_name" : "David",
# 	"last_name" : "Shaulov",
# 	"email": "david@gmail.com",
# 	"permissions": [
# 		"Create Exam",
# 		"Delete Exam"
# 	]
# }
#####################################################
@csrf_exempt
def setStudent(request):
    if request.method == "POST":
        # decode request body
        body = parseRequestBody(request)

        first_name = body['first_name']
        last_name = body['last_name']
        email = body['email']
        permissions = list(body['permissions'])

        try:
            Student.objects.get(email=email)
            print(f"Student {email} already exists")
            return JsonResponse(
                {
                    "Status": "Student Already Exists",
                }
            )

        except:
            newStudent = Student(first_name=first_name, last_name=last_name, email=email, permissions=permissions)
            newStudent.save()

            return JsonResponse(
                {
                    "Status": "Added Student",
                }
            )

    else:
        return JsonResponse(
            {
                "Status": "setStudent() only accepts POST requests"
            }
        )


######################################################
# getStudents()
# method: GET
# Returns all the existing students in the DB
#####################################################
def getStudents(request):
    if request.method == "GET": 
        students = Student.objects.all()
        studentsList = [student.as_json() for student in students]

        return JsonResponse(list(studentsList), safe=False)

    else: # request.method isn't GET
        return JsonResponse(
                    {
                        "Status": "getStudents() only accepts GET requests",
                    }
                )
