from django.shortcuts import render
from frontend.models import *

# Create your views here.
def index(request):
    # ross = User(email='ross@example.com', first_name='Ross', last_name='Lawley')
    # ross.switch_collection('Users')
    # ross.save()

    subject = Subject(name='TCP/IP')
    subject.switch_collection('Subjects')
    subject.save()
    
    course = Course(name='Computer Networks', subjects=[subject])
    course.switch_collection('Courses')
    course.save()

    return render(request, 'frontend/index.html')
