from api.models import *

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


#####################################
# updateSubjectsInCourses(name, newName)
# help function
#####################################
def updateSubjectsInCourses(name, newName):
    # get all courses from DB
    coursesList = list(Course.objects.all())
    
    # iterate over all courses
    # for every course, look as its subjects
    # if one of its subjects' name in 'name', change it to new Name
    # update Course
    for course in coursesList:
        subjectsList = updateSubjectNamesInCoursesList(course, name, newName)
        Course.objects.filter(name=course.name).update(subjects=subjectsList)

#####################################
# updateSubjectNamesInCoursesList(name, newName)
# help function
#####################################
def updateSubjectNamesInCoursesList(course, name, newName):
    subjectsList = list(course.subjects)

    for subject in subjectsList:
        if subject.name == name:
            subject.name = newName
    
    return subjectsList


#####################################
# updateSubjectsInSchools(name, newName)
# help function
#####################################
def updateSubjectsInSchools(name, newName):
    # get all schools from DB
    schoolsList = list(School.objects.all())
    
    # iterate over all schools
    # for every school, look as its courses
    # for every course, update its subjects name accordingly
    for school in schoolsList:
        coursesList = list(school.courses)

        for course in coursesList:
            course.subjects = updateSubjectNamesInCoursesList(course, name, newName)
        
        School.objects.filter(name=school.name).update(courses=coursesList)


#####################################
# updateSubjectsInQuestions(name, newName)
# help function
#####################################
def updateSubjectsInQuestions(name, newName):
    # get all schools from DB
    questionsList = list(Question.objects.all())

    # iterate over all questions
    # for every question, look as its subject and courses
    # change its subject name if necessary
    # for every course, update its subjects name accordingly
    for question in questionsList:
        question = editQuestionWithNewSubjectName(question, name, newName)
        Question.objects.filter(body=question.body).delete()
        question.save()

############################################
# editQuestionWithNewSubjectName(question, name, newName)
# help function
############################################
def editQuestionWithNewSubjectName(question, name, newName):
    subject = question.subject
    if subject.name == name:
        subject.name = newName

    course = question.course
    for subject in course.subjects:
        if subject.name == name:
            subject.name = newName

    return question

#####################################
# updateSubjectsInExams(name, newName)
# help function
#####################################
def updateSubjectsInExams(name, newName):
    # get all exams from DB
    examsList = list(Exam.objects.all())

    # iterate over all exams
    # for every exam, look as its course and change its subject name if necessary
    for exam in examsList:
        course = exam.course
        for subject in course.subjects:
            if subject.name == name:
                subject.name = newName

        questionsList = list(exam.questions)
        for question in questionsList:
            question = editQuestionWithNewSubjectName(question, name, newName)
        
        subjectsList = list(exam.subjects)
        for subject in subjectsList:
            if subject.name == name:
                subject.name = newName

        Exam.objects.filter(examID=exam.examID).delete()
        exam.save()


#####################################
# createSubject
# help function
# Parameters:
#      requestBody: Question as a JSON
# Returns:
#      Tuple ret_tuple
#      if ret_tuple[0] == None: indicates Error, and ret_tuple[1] is a string describing the error
#      else, ret_tuple[0] is True if a new subject was created in the DB, and False otherwise
#            In both cases, ret_tuple[1] is the Subject Object (either just created or pulled from DB)
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