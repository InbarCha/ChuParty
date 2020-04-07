from django.shortcuts import render
from frontend.models import *

# Create your views here.
def index(request):
    subject = Subject(name='DFS')
    subject.save()
    
    course = Course(name='Algorithms', subjects=[subject])
    course.save()

    return render(request, 'frontend/index.html')
