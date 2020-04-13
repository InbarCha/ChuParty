from django.shortcuts import render
from api.models import *
from django.views.decorators.csrf import csrf_exempt
import json
from django.http import JsonResponse
from datetime import datetime
from urllib.parse import unquote

#TODO: take care of case-senstitive issues (for example in MongoDB queries)

#TODO: Think of a better way to handle document IDs.
#      For example, two courses with the same name could exist (that belong to different schools), 
#      so handling course name as its ID is not good enough
#      NEEDED? or will every school have its own DB?

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
@csrf_exempt
def getSubjects(request):
    if request.method == "GET": 
        subjectsList = list(Subject.objects.values())
        return JsonResponse(subjectsList, safe=False)

    return JsonResponse(
                    {
                        "Status": "getSubjects() only accepts GET requests",
                    },
                    status=500
                )


######################################################
# getSubjectByName()
# method: GET
# Returns subject by name (if it exists in DB)
#####################################################
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
        
        if isNewSubjectCreated is None:
            return JsonResponse({ "Status": ret_tuple[1] }, status=500)

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

    else: # request.method isn't POST
        return JsonResponse(
                    {
                        "Status": "setSubject() only accepts POST requests",
                    },
                    status=500
                )

#####################################
# createSubject
# help function
###################################
def createSubject(requestBody):
    # get subjectName from request body
    if 'name' not in requestBody.keys():
        return (None, "Can't Create Subject: 'name' field is not in request body")
    subjectName = requestBody['name']

    try: # subject exists in DB, don't create it again
        subjectFromDb = Subject.objects.get(name=subjectName)
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

        ret_tuple = createOrUpdateCourse(body)
        isNewCourseCreated = ret_tuple[0]

        if isNewCourseCreated is None:
             return JsonResponse({ "Status": ret_tuple[1] }, status=500)

        elif isNewCourseCreated == False:
            return JsonResponse(
                {
                    "Status": "Course Already Exists",
                }, 
                status=500
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
                    },
                    status=500
                )

#######################################
# createOrUpdateCourse(courseJson)
# help function
######################################
def createOrUpdateCourse(courseJson):
    # get Subjects' names and course name from request body
    if 'name' not in courseJson.keys():
        return (None, "Can't Create Course: 'name' field in not in request body")
    courseName = courseJson['name']

    try:
        courseFromDB = Course.objects.get(name=courseName)

        # create subjectsList from requestBody
        subjectsList = appendSubjectsToList(courseJson, courseFromDB)

        # update the course object in the DB with the new subjectsList
        Course.objects.filter(name=courseName).update(subjects=subjectsList)

        # get the updated course object from DB and return it
        courseFromDB = Course.objects.get(name=courseName)
        return (False, courseFromDB)
        
    except:
        subjectsList = appendSubjectsToList(courseJson, None)
        newCourse = Course(name=courseName, subjects=subjectsList)

        newCourse.save()
        return (True, newCourse)

#######################################
# appendSubjectsToList(requestBody, courseFromDB)
# help function
######################################
def appendSubjectsToList(requestBody, courseFromDB):
    if (courseFromDB is None) or (not courseFromDB.subjects):
        subjectsList = []
    else:
        subjectsList = courseFromDB.subjects
    
    if 'subjects' in requestBody.keys():
        subjects = requestBody['subjects']

        # iterate over subjects given in the request body
        # for each subject, if it doesn't exist in the db, create it
        for doc in subjects:
            subject = createSubject(doc)[1]

            if subject.name not in [currentSubject.name for currentSubject in subjectsList]:
                subjectsList.append(subject)

    return subjectsList
    
    

######################################################
# getCourses()
# method: GET
# Returns all the existing courses in the DB
#####################################################
@csrf_exempt
def getCourses(request):
    if request.method == "GET": 
        courses = Course.objects.all()
        coursesList = [course.as_json() for course in courses]

        return JsonResponse(list(coursesList), safe=False)

    else: # request.method isn't GET
        return JsonResponse(
                    {
                        "Status": "getCourses() only accepts GET requests",
                    },
                    status=500
                )

######################################################
# getCourseByName()
# method: GET
# Returns course by name (if it exists in DB)
#####################################################
@csrf_exempt
def getCourseByName(request):
    if request.method == "GET": 
        courseName = request.GET.get("name")    
        print(courseName)

        try:
            courseObj = Course.objects.get(name=courseName)
            return JsonResponse(courseObj.as_json())

        except:
            return JsonResponse({"Status": f"Course {courseName} doesn't exist in DB"}, status=500)

    return JsonResponse(
                    {
                        "Status": "getCourseByName() only accepts GET requests",
                    },
                    status=500
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
        if 'name' not in body.keys():
            return JsonResponse({"Status":"Can't Create School: 'name' field in not in request body"}, status=500)
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
                    ret_tuple = createOrUpdateCourse(doc)
                    isCourseReturned = ret_tuple[0]
                    
                    if isCourseReturned is None:
                        return JsonResponse({ "Status": ret_tuple[1] }, status=500)

                    course = ret_tuple[1]
                    coursesList.append(course)

            
            newShool = School(name=schoolName, courses=coursesList)
            newShool.save()
            return JsonResponse(
                    {
                        "Status": "Added School",
                    }
                )
                
    else: # request.method isn't POST
        return JsonResponse(
                    {
                        "Status": "setSchool() only accepts POST requests",
                    },
                    status=500
                )

#############################################################
# editSchool()
# method: POST
# POST body example:
# {
# 	"name": "Colman",
# 	"ChangeName": "College of Management - Academic Studies",
# 	"AddToCourses":[
# 		{
# 			"name": "Computer Networks"
# 		}
# 	]	
# }
#############################################################
@csrf_exempt
def editSchool(request):
    if request.method == "POST":
        changedNameFlg = False
        addedToCoursesFlg = False

        # decode request body
        body = parseRequestBody(request)
        
        if 'name' not in body.keys():
            return JsonResponse({"Status":"Can't Edit School: 'name' field in not in request body"}, status=500)
        name = body['name']

        try:
            schoolObj = School.objects.get(name=name) # check if School exists in DB
            
            # add course to school courses
            if 'AddToCourses' in body.keys():
                newCoursesList = schoolObj.courses

                coursesToAdd = list(body['AddToCourses'])
                for course in coursesToAdd:
                    ret_tuple = createOrUpdateCourse(course)
                    isCourseReturned = ret_tuple[0]
                    
                    if isCourseReturned is None:
                        return JsonResponse({ "Status": ret_tuple[1] }, status=500)

                    courseObj = ret_tuple[1]
                    if courseObj.name not in [course.name for course in newCoursesList]:
                        newCoursesList.append(courseObj)
                        addedToCoursesFlg = True
                
                if addedToCoursesFlg == True:
                    School.objects.filter(name=name).update(courses=newCoursesList)
            
            # change school name
            if 'ChangeName' in body.keys():
                newName = body['ChangeName']
                School.objects.filter(name=name).update(name=newName)
                changedNameFlg = True

            # create response
            ret_json = dict(
                Status = str()
            )

            if changedNameFlg == True:
                ret_json['Status'] = ret_json['Status'] + f"Changed school name from '{name}' to '{newName}'"
            if addedToCoursesFlg == True:
                ret_json['Status'] = ret_json['Status'] + " and added to school's courses"
            return JsonResponse(ret_json)

        except Exception as e:
            return JsonResponse(
                    {
                        "Exception": str(e),
                        "Status": "Can't Edit School"
                    }
                )
           

    else: # request.method isn't POST
        return JsonResponse(
                {
                    "Status": "editSchool() only accepts POST requests",
                },
                status=500
            )


######################################################
# getSchools()
# method: GET
# Returns all the existing schools in the DB
#####################################################
@csrf_exempt
def getSchools(request):
    if request.method == "GET": 
        schools = School.objects.all()
        schoolsList = [school.as_json() for school in schools]

        return JsonResponse(list(schoolsList), safe=False)

    else: # request.method isn't GET
        return JsonResponse(
                    {
                        "Status": "getSchools() only accepts GET requests",
                    },
                    status=500
                )


######################################################
# getSchoolByName()
# method: GET
# Returns school by name (if it exists in DB)
#####################################################
@csrf_exempt
def getSchoolByName(request):
    if request.method == "GET": 
        schoolName = request.GET.get("name")    
        print(schoolName)

        try:
            schoolObj = School.objects.get(name=schoolName)
            return JsonResponse(schoolObj.as_json())

        except:
            return JsonResponse({"Status": f"School {schoolName} doesn't exist in DB"}, status=500)

    return JsonResponse(
                    {
                        "Status": "getSchoolByName() only accepts GET requests",
                    },
                    status=500
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
#     "correctAnswer": 1
# }
#####################################################
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
                "Status": "Question Created"
            }
        )

        else:
            return JsonResponse(
            {
                "Status": "Question Already Exists"
            },
            status=500
        )
    
    else:
        return JsonResponse(
            {
                "Status": "setQuestion() only accepts POST requests"
            }, 
            status=500
        )


def createQuestion(requestBody):
    # get Question parans
    # questionBody
    questionBody = requestBody['body']

    try:
        questionFromDB = Question.objects.get(body=questionBody)
        print(f"question {questionBody} already exists")
        return (False, questionFromDB)
    except:
        # subject
        if 'subject' not in requestBody.keys():
            return (None, "Can't Create Question: 'subject' field in not in request body")
        subject = requestBody['subject']
        subjectObj = createSubject(subject)[1]

        # course
        if 'course' not in requestBody.keys():
            return (None, "Can't Create Question: 'course' field in not in request body")
        course = requestBody['course']
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
        ret_tuple = createOrUpdateCourse(course)
        isCourseReturned = ret_tuple[0]
        if isCourseReturned is None:
            return JsonResponse({ "Status": ret_tuple[1] }, status=500)
        courseObj = ret_tuple[1]

        # answers
        if 'answers' not in requestBody.keys():
            return (None, "Can't Create Question: 'answers' field in not in request body")
        answers = list(requestBody['answers'])

        # correntAnswer
        if 'correctAnswer' not in requestBody.keys():
            return (None, "Can't Create Question: 'correctAnswer' field in not in request body")
        correctAnswer = requestBody['correctAnswer']
        if correctAnswer > 5 or correctAnswer < 1:
            return (None, "Can't Create Question: 'correctAnswer' field value must be between 1 and 5")
    
        questionObj = Question(
            subject=subjectObj,
            course=courseObj, 
            body=questionBody,
            answers=answers,
            correctAnswer=correctAnswer
        )

        questionObj.save()

        return (True, questionObj)
    
######################################################
# getQuestions()
# method: GET
# Returns all the existing questions in the DB
#####################################################
@csrf_exempt
def getQuestions(request):
    if request.method == "GET": 
        questions = Question.objects.all()
        questionsList = [questions.as_json() for questions in questions]

        return JsonResponse(list(questionsList), safe=False)

    else: # request.method isn't GET
        return JsonResponse(
                    {
                        "Status": "getSchools() only accepts GET requests",
                    },
                    status=500
                )


######################################################
# getQuestionByBody()
# method: GET
# Returns question by body (if it exists in DB)
#####################################################
@csrf_exempt
def getQuestionByBody(request):
    if request.method == "GET": 
        questionBody = request.GET.get("body")    
        print(questionBody)

        try:
            questionObj = Question.objects.get(body=questionBody)
            return JsonResponse(questionObj.as_json())

        except:
            return JsonResponse({"Status": f"Question {questionBody} doesn't exist in DB"}, status=500)

    return JsonResponse(
                    {
                        "Status": "getQuestionByBody() only accepts GET requests",
                    },
                    status=500
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
# 	],
# 	"relevantCourses":[
# 		{
# 			"name": "Advanced Programming"
# 		},
# 		{
# 			"name": "OOP"
# 		}
# 	]
# }
#####################################################
@csrf_exempt
def setStudent(request):
    if request.method == "POST":
        # decode request body
        body = parseRequestBody(request)

        ret_list = getUserFields(body)
        if ret_list[0] is None:
            return JsonResponse({"Status": "Can't Create Student, " + str(ret_list[1])}, status=500)
        
        first_name = ret_list[0]
        last_name = ret_list[1]
        email = ret_list[2]
        permissions = ret_list[3]

        try:
            Student.objects.get(email=email)
            print(f"Student {email} already exists")
            return JsonResponse(
                {
                    "Status": "Student Already Exists",
                }, 
                status=500
            )

        except:
            coursesList = []

            if 'relevantCourses' in body.keys():
                relevantCourses = body['relevantCourses']

                # iterate over courses given in the request body
                # for each course, if it doesn't exist in the db, create it
                for doc in relevantCourses:
                    ret_tuple = createOrUpdateCourse(doc)
                    isCourseReturned = ret_tuple[0]
                    if isCourseReturned is None:
                        return JsonResponse({ "Status": ret_tuple[1] }, status=500)
                    course = ret_tuple[1]
                    coursesList.append(course)
            
            for permission in permissions:
                if permission not in PermissionEnum.choices():
                    status = f"Can't create student, permission {permission} is not allowed. Choose from PermissionEnum values"
                    return JsonResponse({"Status": status}, status=500)

            newStudent = Student(first_name=first_name, last_name=last_name, email=email, permissions=permissions, relevantCourses=coursesList)
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
            }, 
            status=500
        )


######################################################
# getStudents()
# method: GET
# Returns all the existing students in the DB
#####################################################
@csrf_exempt
def getStudents(request):
    if request.method == "GET": 
        students = Student.objects.all()
        studentsList = [student.as_json() for student in students]

        return JsonResponse(list(studentsList), safe=False)

    else: # request.method isn't GET
        return JsonResponse(
                    {
                        "Status": "getStudents() only accepts GET requests",
                    }, 
                    status=500
                )


######################################################
# getStudentByEmail()
# method: GET
# Returns student by its email (if it exists in DB)
#####################################################
@csrf_exempt
def getStudentByEmail(request):
    if request.method == "GET": 
        email = request.GET.get("email")

        try:
            studentObj = Student.objects.get(email=email)
            return JsonResponse(studentObj.as_json())

        except:
            return JsonResponse({"Status": f"Student {email} doesn't exist in DB"}, status=500)

    return JsonResponse(
                    {
                        "Status": "getStudentByEmail() only accepts GET requests",
                    },
                    status=500
                )

######################################################
# setLecturer()
# method: POST
# POST body example:
# {
# 	"first_name" : "Eliav",
# 	"last_name" : "Menache",
# 	"email": "Eliav@gmail.com",
# 	"permissions": [
# 		"Create Exam",
# 		"Delete Exam"
# 	],
# 	"coursesTeaching":[
# 		{
# 			"name": "Computer Networks"
# 		},
# 		{
# 			"name": "iOS"
# 		}
# 	]
# }
#####################################################
@csrf_exempt
def setLecturer(request):
    if request.method == "POST":
        # decode request body
        body = parseRequestBody(request)

        ret_list = getUserFields(body)
        if ret_list[0] is None:
            return JsonResponse({"Status": "Can't Create Lecturer, " + str(ret_list[1])}, status=500)
        
        first_name = ret_list[0]
        last_name = ret_list[1]
        email = ret_list[2]
        permissions = ret_list[3]

        try:
            Lecturer.objects.get(email=email)
            print(f"Lecturer {email} already exists")
            return JsonResponse(
                {
                    "Status": "Lecturer Already Exists",
                }, 
                status=500
            )

        except:
            coursesList = []

            if 'coursesTeaching' in body.keys():
                coursesTeaching = body['coursesTeaching']

                # iterate over courses given in the request body
                # for each course, if it doesn't exist in the db, create it
                for doc in coursesTeaching:
                    ret_tuple = createOrUpdateCourse(doc)
                    isCourseReturned = ret_tuple[0]
                    if isCourseReturned is None:
                        return JsonResponse({ "Status": ret_tuple[1] }, status=500)
                    courseObj = ret_tuple[1]
                    coursesList.append(courseObj)

            for permission in permissions:
                if permission not in PermissionEnum.choices():
                    status = f"Can't create Lecturer, permission {permission} is not allowed. Choose from PermissionEnum values"
                    return JsonResponse({"Status": status}, status=500)

            newLecturer = Lecturer(first_name=first_name, last_name=last_name, email=email, permissions=permissions, coursesTeaching=coursesList)
            newLecturer.save()

            return JsonResponse(
                {
                    "Status": "Added Lecturer",
                }
            )

    else:
        return JsonResponse(
            {
                "Status": "setLecturer() only accepts POST requests"
            }, 
            status=500
        )


######################################################
# getLecturers()
# method: GET
# Returns all the existing lecturers in the DB
#####################################################
@csrf_exempt
def getLecturers(request):
    if request.method == "GET": 
        lecturers = Lecturer.objects.all()
        lecturersList = [lecturer.as_json() for lecturer in lecturers]

        return JsonResponse(list(lecturersList), safe=False)

    else: # request.method isn't GET
        return JsonResponse(
                    {
                        "Status": "getLecturers() only accepts GET requests",
                    }, 
                    status=500
                )


######################################################
# getLecturerByEmail()
# method: GET
# Returns lecturer by its email (if it exists in DB)
#####################################################
@csrf_exempt
def getLecturerByEmail(request):
    if request.method == "GET": 
        email = request.GET.get("email")

        try:
            lecturerObj = Lecturer.objects.get(email=email)
            return JsonResponse(lecturerObj.as_json())

        except:
            return JsonResponse({"Status": f"Lecturer {email} doesn't exist in DB"}, status=500)

    return JsonResponse(
                    {
                        "Status": "getLecturerByEmail() only accepts GET requests",
                    },
                    status=500
                )


######################################################
# setAdmin()
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
def setAdmin(request):
    if request.method == "POST":
        # decode request body
        body = parseRequestBody(request)

        ret_list = getUserFields(body)
        if ret_list[0] is None:
            return JsonResponse({"Status": "Can't Create Admin, " + str(ret_list[1])}, status=500)
        
        first_name = ret_list[0]
        last_name = ret_list[1]
        email = ret_list[2]
        permissions = ret_list[3]

        try:
            Admin.objects.get(email=email)
            print(f"Admin {email} already exists")
            return JsonResponse(
                {
                    "Status": "Admin Already Exists",
                }, 
                status=500
            )

        except:
            for permission in permissions:
                if permission not in PermissionEnum.choices():
                    status = f"Can't create Admin, permission {permission} is not allowed. Choose from PermissionEnum values"
                    return JsonResponse({"Status": status}, status=500)

            newAdmin = Admin(first_name=first_name, last_name=last_name, email=email, permissions=permissions)
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


def getUserFields(requestBody):
    if 'first_name' not in requestBody.keys():
        return [None, "'first_name' field doesn't exist in request body"]
    first_name = requestBody['first_name']

    if 'last_name' not in requestBody.keys():
        return [None, "'last_name' field doesn't exist in request body"]
    last_name = requestBody['last_name']

    if 'email' not in requestBody.keys():
        return [None, "'email' field doesn't exist in request body"]
    email = requestBody['email']

    if 'permissions' not in requestBody.keys():
        return [None, "'permissions' field doesn't exist in request body"]
    permissions = list(requestBody['permissions'])

    return [first_name, last_name, email, permissions]

######################################################
# getAdmins()
# method: GET
# Returns all the existing admins in the DB
#####################################################
@csrf_exempt
def getAdmins(request):
    if request.method == "GET": 
        admins = Admin.objects.all()
        adminsList = [admin.as_json() for admin in admins]

        return JsonResponse(list(adminsList), safe=False)

    else: # request.method isn't GET
        return JsonResponse(
                    {
                        "Status": "getAdmins() only accepts GET requests",
                    }, 
                    status=500
                )

######################################################
# getAdminByEmail()
# method: GET
# Returns admin by its email (if it exists in DB)
#####################################################
@csrf_exempt
def getAdminByEmail(request):
    if request.method == "GET": 
        email = request.GET.get("email")

        try:
            adminObj = Admin.objects.get(email=email)
            return JsonResponse(adminObj.as_json())

        except:
            return JsonResponse({"Status": f"Admin {email} doesn't exist in DB"}, status=500)

    return JsonResponse(
                    {
                        "Status": "getAdminByEmail() only accepts GET requests",
                    },
                    status=500
                )


######################################################
# setExam()
# method: POST
# POST body example:
# {
#     "name": "OOP Exam",
#     "date": "15/07/19",
#     "writers": [
#     "Eliyahu Khelsatzchi",
#     "Haim Shafir"
#     ],
#     "course": 
#         {
#         "name" : "OOP"
#         },
#     "questions": [
#         {
#             "subject":
#                 {
#                     "name": "Object-Oriented Principles"
#                 },          
#             "body": "What is encapsulation?",
#             "answers": [
#                     "blah blah",
#                     "bleh beh",
#                     "bundling of data with the methods that operate on that data",
#                     "blu blue"
#                 ],
#             "correctAnswer": 2
#         }
#     ],
#     "subjects":[ 
#         {
#             "name": "Object-Oriented Principles"
#         }
#     ]
# }
#       
#       no need to add 'subjects' to the request body,
#       server parses exam questions and adds each question subject to the exam subjects array 
#####################################################
@csrf_exempt
def setExam(request):
    if request.method == "POST":
        # decode request body
        body = parseRequestBody(request)

        # name
        if 'name' not in body.keys():
             return JsonResponse({ "Status": "Can't Create Exam - 'name' not specified"}, status=500)
        name = body['name']

        # date
        if 'date' not in body.keys():
             return JsonResponse({ "Status": "Can't Create Exam - 'date' not specified"}, status=500)
        date = body['date']
        dateObj = datetime.strptime(date, "%d/%m/%y")

        # id
        examID = str(name) + "_" + str(date)

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
            if 'date' not in body.keys():
                return JsonResponse({ "Status": "Can't Create Exam - 'date' not specified"}, status=500)
            writers = list(body['writers'])

            # course
            if 'course' not in body.keys():
                return JsonResponse({ "Status": "Can't Create Exam - 'course' not specified"},status=500)

            course = body['course'] 
            if 'subjects' not in course.keys():
                course['subjects'] = list()

            ret_tuple = createOrUpdateCourse(course)
            isCourseReturned = ret_tuple[0]
            if isCourseReturned is None:
                return JsonResponse({ "Status": ret_tuple[1] }, status=500)
            courseObj = ret_tuple[1]

            # subjects
            subjectsObjList = []
            
            if 'subjects' in body.keys():
                subjects = body['subjects']
                
                # for every subject in the requestBody, check if it exists in the DB
                # if it doesn't, create it
                for subject in subjects:
                    subjectObj = createSubject(subject)[1]
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

                    questionObj = createQuestion(question)[1]
                    questionsObjList.append(questionObj)

                    # for every question, if its subject is not in the exam subjects, add it
                    questionSubject = questionObj.subject
                    if questionSubject.name not in [subject.name for subject in subjectsObjList]:
                        subjectsObjList.append(questionSubject)
                    if questionSubject.name not in [subject for subject in courseObj.subjects]:
                        course['subjects'].append(questionSubject.as_json())
                
                ret_tuple = createOrUpdateCourse(course)
                isCourseReturned = ret_tuple[0]
                if isCourseReturned is None:
                    return JsonResponse({ "Status": ret_tuple[1] }, status=500)
                courseObj = ret_tuple[1]

            
            newExam = Exam(
                examID=examID,
                name=name,
                date=dateObj, 
                writers = writers,
                course = courseObj,
                questions = questionsObjList,
                subjects = subjectsObjList
            )
            newExam.save()

            return JsonResponse(
                {
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

######################################################
# getExams()
# method: GET
# Returns all the existing exams in the DB
#####################################################
@csrf_exempt
def getExams(request):
    if request.method == "GET": 
        exams = Exam.objects.all()
        examsList = [exam.as_json() for exam in exams]

        return JsonResponse(list(examsList), safe=False)

    else: # request.method isn't GET
        return JsonResponse(
                    {
                        "Status": "getExams() only accepts GET requests",
                    },
                    status=500
                )

######################################################
# getExamByID()
# method: GET
# Returns exam by its ID (if it exists in DB)
#####################################################
@csrf_exempt
def getExamByID(request):
    if request.method == "GET": 
        examID = request.GET.get("examID")

        try:
            examObj = Exam.objects.get(examID=examID)
            return JsonResponse(examObj.as_json())

        except:
            return JsonResponse({"Status": f"Exam {examID} doesn't exist in DB"}, status=500)

    return JsonResponse(
                    {
                        "Status": "getExamByID() only accepts GET requests",
                    },
                    status=500
                )