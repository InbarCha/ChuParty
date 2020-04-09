from django.shortcuts import render
from frontend.models import *
from django.views.decorators.csrf import csrf_exempt
import json
from django.http import JsonResponse
from django.forms.models import model_to_dict


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
        
        # get subjectName from request body
        subjectName = body['name']
        print(subjectName)

        try: #subject exists in DB, don't create it again
            subjectFromDb = Subject.objects.get(name=subjectName)
            print("subject already exists")
            return JsonResponse(
                {
                    "Status": "Subject already exists",
                }
            )
        except:  # save subject to DBng
            subject = Subject(name=subjectName)
            subject.save()

            return JsonResponse(
                {
                    "Status": "Added Subject",
                }
            )

    else: # request.method isn't POST
        return JsonResponse(
                    {
                        "Status": "setSubject() only accepts POST requests",
                    }
                )



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

        # get Subjects' names and course name from request body
        courseName = body['name']
        subjects = body['subjects']

        try:
            Course.objects.get(name=courseName)
            print(f"course {courseName} already exists")
            return JsonResponse(
                {
                    "Status": "Course Already Exists",
                }
            )
        except:
            subjectsList = []

            # iterate over subjects given in the request body
            # for each subject, if it doesn't exist in the db, create it
            for doc in subjects:
                subjectName = doc['name']
                try:  # subject exists in DB, only save it in subjectsList
                    subjectNameFromDb = Subject.objects.get(name=subjectName)
                    subjectsList.append(subjectNameFromDb)
                    print(f"subject {subjectName} exists in DB:")
                except: # subject doesn't exist in DB, create it and save it in subjectsList
                    print(f"subject {subjectName} doesn't exist in DB")
                    newSubject = Subject(name=subjectName)
                    newSubject.save()
                    subjectsList.append(newSubject)
            
            newCourse = Course(name=courseName, subjects=subjectsList)
            newCourse.save()
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


######################################################
# getCourses()
# method: GET
# Returns all the existing subjects in the DB
#####################################################
def getCourses(request):
    if request.method == "GET": 
        courses = Course.objects.all()
        coursesList = [course.as_json() for course in courses]

        return JsonResponse(list(coursesList), safe=False)

    else: # request.method isn't POST
        return JsonResponse(
                    {
                        "Status": "getCourses() only accepts GET requests",
                    }
                )