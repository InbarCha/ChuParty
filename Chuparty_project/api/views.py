from django.shortcuts import render
from api.models import *
from django.views.decorators.csrf import csrf_exempt
import json
from django.http import JsonResponse
from datetime import datetime
from urllib.parse import unquote
from api.HelpFuncs_Subjects import *
from api.HelpFuncs_Courses import *
from api.HelpFuncs_Questions import *
from api.HelpFuncs_User import *

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
            return JsonResponse({"Status":"Can't Edit Subject: 'name' field in not in request body"}, status=500)
        name = body['name']

        try:
            Subject.objects.get(name=name)

            if 'ChangeName' in body.keys():
                newName = body['ChangeName']
                Subject.objects.filter(name=name).update(name=newName)
                changedNameFlg = True

                updateSubjectsInCourses(name, newName)
                updateSubjectsInSchools(name, newName)
                updateSubjectsInQuestions(name,newName)
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
            return JsonResponse({"Status":"Can't Edit Course: 'name' field in not in request body"}, status=500)
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
                        return JsonResponse({ "Status": ret_tuple[1] }, status=500)

                    subjectObj = ret_tuple[1]
                    if subjectObj.name not in [subject.name for subject in newSubjectsList]:
                        newSubjectsList.append(subjectObj)
                        addedToSubjectsFlg = True

                        addSubjectToCoursesInSchools(name, subjectObj)
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
                        return JsonResponse({ "Status": ret_tuple[1] }, status=500)

                    subjectObj = ret_tuple[1]
                    if subjectObj.name in [subject.name for subject in newSubjectsList]:
                        newSubjectsList = list(filter(lambda subject:subject.name != subjectObj.name, newSubjectsList))
                        deletedFromSubjectsFlg = True

                        deleteSubjectFromCoursesInSchools(name, subjectObj)
                        deleteSubjectFromCourseInQuestions(name, subjectObj)
                        deleteSubjectFromCourseInExams(name, subjectObj)
            
            # update course's subjects list 
            if addedToSubjectsFlg == True or deletedFromSubjectsFlg == True:
                Course.objects.filter(name=name).update(subjects=newSubjectsList)

            # change course name
            if 'ChangeName' in body.keys():
                newName = body['ChangeName']
                Course.objects.filter(name=name).update(name=newName)
                changedNameFlg = True

                updateCourseNameInSchools(name, newName)
                updateCourseNameInQuestions(name, newName)
                updateCourseNameInExams(name, newName)
            
            # create response
            ret_json = dict()

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
        coursesList = [course.as_json() for course in courses]

        return JsonResponse(list(coursesList), safe=False)

    else: # request.method isn't GET
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
            return JsonResponse(courseObj.as_json())

        except:
            return JsonResponse({"Status": f"Course {courseName} doesn't exist in DB"}, status=500)

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
	"courses": [
		{
			"name" : "Advanced Programming",
			"subjects": [
				{
					"name": "Java"
				},
				{
					"name": "Design Patterns"
				}
			]
		},
		{
			"name" : "OOP",
			"subjects": [
				{
					"name": "C++"
				},
				{
					"name": "Polymorphism"
				}
			]
		}
	]
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
                    ret_tuple = createCourseOrAddSubject(doc)
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
                    ret_tuple = createCourseOrAddSubject(course)
                    isCourseReturned = ret_tuple[0]
                    
                    if isCourseReturned is None:
                        return JsonResponse({ "Status": ret_tuple[1] }, status=500)

                    courseObj = ret_tuple[1]
                    if courseObj.name not in [course.name for course in newCoursesList]:
                        newCoursesList.append(courseObj)
                        addedToCoursesFlg = True
            
            # delete course from school courses
            if 'DeleteFromCourses' in body.keys():
                newCoursesList = schoolObj.courses

                coursesToDelete = list(body['DeleteFromCourses'])
                for course in coursesToDelete:
                    ret_tuple = createCourseOrAddSubject(course)
                    isCourseReturned = ret_tuple[0]
                    
                    if isCourseReturned is None:
                        return JsonResponse({ "Status": ret_tuple[1] }, status=500)

                    courseObj = ret_tuple[1]

                    if courseObj.name in [course.name for course in newCoursesList]:
                        newCoursesList = list(filter(lambda course:course.name != courseObj.name, newCoursesList))
                        deletedFromCoursesFlg = True
                
            # update school's courses list 
            if deletedFromCoursesFlg == True or addedToCoursesFlg == True:
                School.objects.filter(name=name).update(courses=newCoursesList)


            # change school name
            if 'ChangeName' in body.keys():
                newName = body['ChangeName']
                School.objects.filter(name=name).update(name=newName)
                changedNameFlg = True

            # create response
            ret_json = dict()

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
           

    else: # request.method isn't POST
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
        schoolsList = [school.as_json() for school in schools]

        return JsonResponse(list(schoolsList), safe=False)

    else: # request.method isn't GET
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
            return JsonResponse(schoolObj.as_json())

        except:
            return JsonResponse({"Status": f"School {schoolName} doesn't exist in DB"}, status=500)

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
          "name": "DNS"    
      },          
	"course": 
		{
			"name" : "Computer Networks",
		},
   "body": "What is DNS?",
   "answers": [
          "Domain Name Server",
          "Desturction of Name Servers",
          "Deduction of Native Services",
          "Deformation of Name Servers"
      ],
    "correctAnswer": 1
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
	"ChangeCorrectAnswer": 2
}
'''
##################################################
@csrf_exempt
def editQuestion(request):
    if request.method == "POST":
        changedCourseFlg = False
        changedSubjectFlg = False
        changedAnswersFlg = False
        changedCorrectAnswerFlg = False
        changedBodyFlg = False

        # decode request body
        requestBody = parseRequestBody(request)

        if 'body' not in requestBody.keys():
            return JsonResponse({"Status":"Can't Edit Question: 'body' field in not in request body"}, status=500)
        body = requestBody['body']

        try:
            questionObj = Question.objects.get(body=body)

            # change the question's course
            if 'ChangeCourse' in requestBody.keys():
                newCourse = requestBody['ChangeCourse']

                ret_tuple = createCourseOrAddSubject(newCourse)
                isCourseReturned = ret_tuple[0]
                
                if isCourseReturned is None:
                    return JsonResponse({ "Status": ret_tuple[1] }, status=500)

                courseObj = ret_tuple[1]
                if courseObj.name != questionObj.course.name:
                    questionObj.course = courseObj
                    changedCourseFlg = True
            
            # change the question's subject
            if 'ChangeSubject' in requestBody.keys():
                newSubject = requestBody['ChangeSubject']

                ret_tuple = createSubject(newSubject)
                isSubjectReturned = ret_tuple[0]
                
                if isSubjectReturned is None:
                    return JsonResponse({ "Status": ret_tuple[1] }, status=500)

                subjectObj = ret_tuple[1]
                if subjectObj.name != questionObj.subject.name:
                    questionObj.subject = subjectObj
                    changedSubjectFlg = True
        
            # change the question's answers list
            if 'ChangeAnswers' in requestBody.keys():
                oldAnswersList = questionObj.answers
                newAnswersList = requestBody['ChangeAnswers']

                filteredListNew = [string for string in newAnswersList if string not in oldAnswersList]
                filteredListOld = [string for string in oldAnswersList if string not in newAnswersList]
                if filteredListNew or filteredListOld:
                    questionObj.answers = newAnswersList
                    changedAnswersFlg = True

            # change the question's correct answer
            if 'ChangeCorrectAnswer' in requestBody.keys():
                newCorrectAnswer = int(requestBody['ChangeCorrectAnswer'])
                if questionObj.correctAnswer != newCorrectAnswer:
                    questionObj.correctAnswer = newCorrectAnswer
                    changedCorrectAnswerFlg = True

            # change the question's body
            if 'ChangeBody' in requestBody.keys():
                newBody = requestBody['ChangeBody']
                if newBody != questionObj.body:
                    questionObj.body = newBody
                    changedBodyFlg = True
            
            # if one of the question's fileds has been changed:
            # delete the old question from db 
            # try to create the new question
            # if successful, return
            # if not successful, save the old question back to the DB and return
            if changedCourseFlg == True or changedSubjectFlg == True or changedAnswersFlg == True or \
                changedCorrectAnswerFlg == True or changedBodyFlg == True:

                Question.objects.filter(body=body).delete()
                questionObj.save()

            ret_json = dict()

            if changedCourseFlg == True:
                ret_json['Changed Course'] = "True"
            else:
                ret_json['Changed Course'] = "False"

            if changedSubjectFlg == True:
                ret_json['Changed Subject'] = "True"
            else:
                ret_json['Changed Subject'] = "False"

            if changedAnswersFlg == True:
                ret_json['Changed Answers'] = "True"
            else:
                ret_json['Changed Answers'] = "False"

            if changedCorrectAnswerFlg == True:
                ret_json['Changed Correct Answer'] = "True"
            else:
                ret_json['Changed Correct Answer'] = "False"

            if changedBodyFlg == True:
                ret_json['Changed Body'] = "True"
            else:
                ret_json['Changed Body'] = "False"

            updateQuestionInExams(questionObj, body)

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
getQuestions()
method: GET
Returns all the existing questions in the DB
'''
##################################################
@csrf_exempt
def getQuestions(request):
    if request.method == "GET": 
        questions = Question.objects.all()
        questionsList = [question.as_json() for question in questions]

        return JsonResponse(list(questionsList), safe=False)

    else: # request.method isn't GET
        return JsonResponse(
                    {
                        "Status": "getSchools() only accepts GET requests",
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
'''
setStudent()
method: POST
POST body example:
{
	"first_name" : "David",
	"last_name" : "Shaulov",
	"email": "david@gmail.com",
	"permissions": [
		"Create Exam",
		"Delete Exam"
	],
	"relevantCourses":[
		{
			"name": "Advanced Programming"
		},
		{
			"name": "OOP"
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
                    ret_tuple = createCourseOrAddSubject(doc)
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
'''
 editStudent(request)
 Method: POST
 POST body example:
{
	"email":"inbarcha1@gmail.com",
	"ChangeFirstName": "Inbarrrr",
	"ChangeLastName":"Hachmonnn",
	"ChangePermissions":[
			"Create Exam"
		]
}
'''
######################################################
@csrf_exempt
def editStudent(request):
    if request.method == "POST":
        # decode request body
        body = parseRequestBody(request)
        
        if 'email' not in body.keys():
            return JsonResponse({"Status":"Can't Edit Student: 'email' field in not in request body"}, status=500)
        email = body['email']

        try:
            studentObj = Student.objects.get(email=email)
            ret_list = editUser(studentObj, body)

            if ret_list[0] is None:
                return JsonResponse({"Status": ret_list[1]})
            
            newStudentObj = ret_list[0]
            changedEmailFlg = ret_list[1]
            changedFirstNameFlg = ret_list[2]
            changedLastNameFlg = ret_list[3]
            changedPermissionsFlag = ret_list[4]

            ret_json = dict()

            if changedFirstNameFlg == True:
                Student.objects.filter(email=email).update(first_name=newStudentObj.first_name)
                ret_json['Changed First Name'] = "True"
            else:
                ret_json['Changed First Name'] = "False"
                
            if changedLastNameFlg == True:
                Student.objects.filter(email=email).update(last_name=newStudentObj.last_name)
                ret_json['Changed Last Name'] = "True"
            else:
                ret_json['Changed Last Name'] = "False"
            
            if changedPermissionsFlag == True:
                Student.objects.filter(email=email).update(permissions=newStudentObj.permissions)
                ret_json['Changed Permissions'] = "True"
            else:
                ret_json['Changed Permissions'] = "False"

            if changedEmailFlg == True:
                Student.objects.filter(email=email).update(email=newStudentObj.email)
                ret_json['Changed Email'] = "True"
            else:
                ret_json['Changed Email'] = "False"

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

    else: # request.method isn't GET
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
GET params: email of student to delete
'''
#####################################################
@csrf_exempt
def deleteStudent(request):
    if request.method == "GET": 
        email = request.GET.get("email")
    
        try:
            Student.objects.filter(email=email).delete()
            return JsonResponse({"Status": f"Deleted Student '{email}'"})

        except Exception as e:
            return JsonResponse(
                    {
                        "Exception": str(e),
                        "Status": f"Can't delete student {email}",
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
getStudentByEmail()
method: GET
Returns student by its email (if it exists in DB)
'''
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
'''
setLecturer()
method: POST
POST body example:
{
	"first_name" : "Eliav",
	"last_name" : "Menache",
	"email": "Eliav@gmail.com",
	"permissions": [
		"Create Exam",
		"Delete Exam"
	],
	"coursesTeaching":[
		{
			"name": "Computer Networks"
		},
		{
			"name": "iOS"
		}
	]
}
'''
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
                    ret_tuple = createCourseOrAddSubject(doc)
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
'''
 editLecturer(request)
 Method: POST
 POST body example:
 {
	"email":"inbarcha1@gmail.com",
	"ChangeFirstName": "Inbarrrr",
	"ChangeLastName":"Hachmonnn",
	"ChangePermissions":[
			"Create Exam"
		]
}
'''
######################################################
@csrf_exempt
def editLecturer(request):
    if request.method == "POST":
        # decode request body
        body = parseRequestBody(request)
        
        if 'email' not in body.keys():
            return JsonResponse({"Status":"Can't Edit Lecturer: 'email' field in not in request body"}, status=500)
        email = body['email']

        try:
            lecturerObj = Lecturer.objects.get(email=email)
            ret_list = editUser(lecturerObj, body)

            if ret_list[0] is None:
                return JsonResponse({"Status": ret_list[1]})
            
            newLecturerObj = ret_list[0]
            changedEmailFlg = ret_list[1]
            changedFirstNameFlg = ret_list[2]
            changedLastNameFlg = ret_list[3]
            changedPermissionsFlag = ret_list[4]

            ret_json = dict()

            if changedFirstNameFlg == True:
                Lecturer.objects.filter(email=email).update(first_name=newLecturerObj.first_name)
                ret_json['Changed First Name'] = "True"
            else:
                ret_json['Changed First Name'] = "False"
                
            if changedLastNameFlg == True:
                Lecturer.objects.filter(email=email).update(last_name=newLecturerObj.last_name)
                ret_json['Changed Last Name'] = "True"
            else:
                ret_json['Changed Last Name'] = "False"
            
            if changedPermissionsFlag == True:
                Lecturer.objects.filter(email=email).update(permissions=newLecturerObj.permissions)
                ret_json['Changed Permissions'] = "True"
            else:
                ret_json['Changed Permissions'] = "False"

            if changedEmailFlg == True:
                Lecturer.objects.filter(email=email).update(email=newLecturerObj.email)
                ret_json['Changed Email'] = "True"
            else:
                ret_json['Changed Email'] = "False"

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
GET params: email of lecturer to delete
'''
#####################################################
@csrf_exempt
def deleteLecturer(request):
    if request.method == "GET": 
        email = request.GET.get("email")
    
        try:
            Lecturer.objects.filter(email=email).delete()
            return JsonResponse({"Status": f"Deleted Lecturer '{email}'"})

        except Exception as e:
            return JsonResponse(
                    {
                        "Exception": str(e),
                        "Status": f"Can't delete lecturer {email}",
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

    else: # request.method isn't GET
        return JsonResponse(
                    {
                        "Status": "getLecturers() only accepts GET requests",
                    }, 
                    status=500
                )


######################################################
'''
getLecturerByEmail()
method: GET
Returns lecturer by its email (if it exists in DB)
'''
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


###################################################
'''
setAdmin()
method: POST
POST body example:
{
	"first_name" : "David",
	"last_name" : "Shaulov",
	"email": "david@gmail.com",
	"permissions": [
		"Create Exam",
		"Delete Exam"
	]
}
'''
####################################################3
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


######################################################
'''
 editAdmin(request)
 Method: POST
 POST body example:
{
	"email":"inbarcha1@gmail.com",
	"ChangeFirstName": "Inbarrrr",
	"ChangeLastName":"Hachmonnn",
	"ChangePermissions":[
			"Create Exam"
		]
}
'''
######################################################
@csrf_exempt
def editAdmin(request):
    if request.method == "POST":
        # decode request body
        body = parseRequestBody(request)
        
        if 'email' not in body.keys():
            return JsonResponse({"Status":"Can't Edit Admin: 'email' field in not in request body"}, status=500)
        email = body['email']

        try:
            adminObj = Admin.objects.get(email=email)
            ret_list = editUser(adminObj, body)

            if ret_list[0] is None:
                return JsonResponse({"Status": ret_list[1]})
            
            newAdminObj = ret_list[0]
            changedEmailFlg = ret_list[1]
            changedFirstNameFlg = ret_list[2]
            changedLastNameFlg = ret_list[3]
            changedPermissionsFlag = ret_list[4]

            ret_json = dict()

            if changedFirstNameFlg == True:
                Admin.objects.filter(email=email).update(first_name=newAdminObj.first_name)
                ret_json['Changed First Name'] = "True"
            else:
                ret_json['Changed First Name'] = "False"
                
            if changedLastNameFlg == True:
                Admin.objects.filter(email=email).update(last_name=newAdminObj.last_name)
                ret_json['Changed Last Name'] = "True"
            else:
                ret_json['Changed Last Name'] = "False"
            
            if changedPermissionsFlag == True:
                Admin.objects.filter(email=email).update(permissions=newAdminObj.permissions)
                ret_json['Changed Permissions'] = "True"
            else:
                ret_json['Changed Permissions'] = "False"

            if changedEmailFlg == True:
                Admin.objects.filter(email=email).update(email=newAdminObj.email)
                ret_json['Changed Email'] = "True"
            else:
                ret_json['Changed Email'] = "False"

            return JsonResponse(ret_json)

        except Exception as e:
            return JsonResponse(
                    {
                        "Exception": str(e),
                        "Status": "Can't Edit Admin"
                    },
                    status=500
                )
    
    else:
        return JsonResponse(
            {
                "Status": "editAdmin() only accepts POST requests"
            },
            status=500
        )


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

    else: # request.method isn't GET
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
GET params: email of admin to delete
'''
#####################################################
@csrf_exempt
def deleteAdmin(request):
    if request.method == "GET": 
        email = request.GET.get("email")
    
        try:
            Admin.objects.filter(email=email).delete()
            return JsonResponse({"Status": f"Deleted Admin '{email}'"})

        except Exception as e:
            return JsonResponse(
                    {
                        "Exception": str(e),
                        "Status": f"Can't delete admin {email}",
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
getAdminByEmail()
method: GET
Returns admin by its email (if it exists in DB)
'''
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
'''
setExam()
method: POST
POST body example:
{
    "name": "OOP Exam",
    "date": "15/07/19",
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
            "correctAnswer": 2
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

            ret_tuple = createCourseOrAddSubject(course)
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
                
                ret_tuple = createCourseOrAddSubject(course)
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
        print(exams)
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