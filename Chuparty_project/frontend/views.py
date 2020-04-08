from django.shortcuts import render
from frontend.models import *
from django.views.decorators.csrf import csrf_exempt
import json
from django.http import JsonResponse

# Create your views here.
def index(request):                
    return render(request, 'frontend/index.html')

def getSubjects(request):
    if request.method == "GET": 
        subjectsList = list(Subject.objects.values())
        return JsonResponse(subjectsList, safe=False)

    return render(request, 'frontend/index.html')

@csrf_exempt
def setSubject(request):
    if request.method == "POST": 
        # decode request body
        body = parseRequestBody(request)
        
        # get subjectName from request body
        subjectName = body['name']
        print(subjectName)

        # save subject to DB
        subject = Subject(name=subjectName)
        subject.save()

        return JsonResponse(
            {
                "Status": "Added Subject",
            }
        )

    return render(request, 'frontend/index.html')

def parseRequestBody(request):
    body_unicode = request.body.decode('utf-8')
    return json.loads(body_unicode)