from api.models import *
from api.HelpFuncs_Subjects import *

#######################################
# createCourseOrAddSubject(courseJson)
# help function
# Parameters:
#      courseJson: Course as a JSON
# Returns:
#      Tuple ret_tuple
#      if ret_tuple[0] == None: indicates Error, and ret_tuple[1] is a string describing the error
#      else, ret_tuple[0] is True if a new course was created in the DB, and False otherwise
#            In both cases, ret_tuple[1] is the Course Object (either just created or pulled from DB)
######################################
def createCourseOrAddSubject(courseJson):
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
        school = ""
        if "school" in courseJson.keys():
            school = courseJson["school"]
        newCourse = Course(name=courseName, subjects=subjectsList, school=school)
        newCourse.save()

        if School.objects.filter(name=school).count() > 0:
            schoolObj = School.objects.get(name=school)
        else: 
            schoolObj = School(name=school,courses=[])
        coursesList = schoolObj.courses
        coursesList.append(courseName)
        School.objects.filter(name=school).update(courses=coursesList)

        return (True, newCourse)


#####################################
# updateCourseNameInSchools(name, newName)
# help function
#####################################
def updateCourseNameInSchools(name, newName):
    # get all schools from DB
    schoolsList = list(School.objects.all())

    # iterate over all schools
    # for every school, look as its course and change its name if necessary
    for school in schoolsList:
        coursesList = school.courses
        for course in coursesList:
            if course == name:
                course = newName

        School.objects.filter(name=school.name).delete()
        school.save()

def updateCourseNameInStudent(name, newName):
    # get all students from DB
    studentsList = list(Student.objects.all())

    # iterate over all students
    # for every student, look as his courses and change its name if necessary
    for student in studentsList:
        for i in range(len(student.relevantCourses)):
            if student.relevantCourses[i] == name:
                student.relevantCourses[i] = newName

        Student.objects.filter(username=student.username).delete()
        student.save()

def updateCourseNameInLecturer(name, newName):
    # get all lecturers from DB
    lecturersList = list(Lecturer.objects.all())

    # iterate over all lecturers
    # for every lecturer, look as his courses and change its name if necessary
    for lecturer in lecturersList:
        for i in range(len(lecturer.coursesTeaching)):
            if lecturer.coursesTeaching[i] == name:
                lecturer.coursesTeaching[i] = newName

        Lecturer.objects.filter(username=lecturer.username).delete()
        lecturer.save()

#####################################
# deleteSubjectFromCoursesInSchools(courseName, subjectObj)
# help function
#####################################
def deleteSubjectFromCoursesInSchools(courseName, subjectObj):
    # get all schools from DB
    schoolsList = list(School.objects.all())

    # iterate over all schools
    # for every school, look as its course and delete subject if necessary
    for school in schoolsList:
        coursesList = school.courses
        for course in coursesList:
            if course.name == courseName:
                course.subjects = list(filter(lambda subject:subject.name != subjectObj.name, course.subjects))
        
        School.objects.filter(name=school.name).delete()
        school.save()

##########################################
# updateCourseNameInQuestions(name, newName)
# help function
##########################################
def updateCourseNameInQuestions(name, newName):
    # get all questions from DB
    questionsList = list(Question.objects.all())

    # iterate over all questions
    # for every question, look as its course and change its name if necessary
    for question in questionsList:
        course = question.course
        if course.name == name:
            course.name = newName

        Question.objects.filter(body=question.body).delete()
        question.save()

#####################################
# addSubjectToCourseInQuestions(courseName, subjectObj):
# help function
#####################################
def addSubjectToCourseInQuestions(courseName, subjectObj):
    # get all questions from DB
    questionsList = list(Question.objects.all())

    # iterate over all questions
    # for every question, look as its course and add subject if necessary
    for question in questionsList:
        course = question.course
        if course.name == courseName and subjectObj.name not in [subject.name for subject in course.subjects]:
            course.subjects.append(subjectObj)
        
        Question.objects.filter(body=question.body).delete()
        question.save()

#####################################
# deleteSubjectFromCourseInQuestions(courseName, subjectObj):
# help function
#####################################
def deleteSubjectFromCourseInQuestions(courseName, subjectObj):
    # get all questions from DB
    questionsList = list(Question.objects.all())

    # iterate over all questions
    # for every question, look as its course and delete subject if necessary
    for question in questionsList:
        course = question.course
        if course.name == courseName:
            course.subjects = list(filter(lambda subject:subject.name != subjectObj.name, course.subjects))
        
        Question.objects.filter(body=question.body).delete()
        question.save()

##########################################
# updateCourseNameInExams(name, newName)
# help function
##########################################
def updateCourseNameInExams(name, newName):
    # get all exams from DB
    examsList = list(Exam.objects.all())

    # iterate over all exams
    # for every exam, look as its course and change its name if necessary
    # for every question, update its course name if necessary
    for exam in examsList:
        course = exam.course
        if course.name == name:
            course.name = newName
        
        questionsList = list(exam.questions)
        for question in questionsList:
            course = question.course
            if course.name == name:
                course.name = newName

        Exam.objects.filter(examID=exam.examID).delete()
        exam.save()

##########################################
# addSubjectToCourseInExams(courseName, subjectObj)
# help function
##########################################
def addSubjectToCourseInExams(courseName, subjectObj):
    # get all exams from DB
    examsList = list(Exam.objects.all())

    # iterate over all exams
    # for every exam, look as its course and add subject if necessary
    # for every question, add subject to its course if necessary
    for exam in examsList:
        course = exam.course
        if course.name == courseName and subjectObj.name not in [subject.name for subject in course.subjects]:
            course.subjects.append(subjectObj)
        
        questionsList = list(exam.questions)
        for question in questionsList:
            course = question.course
            if course.name == courseName and subjectObj.name not in [subject.name for subject in course.subjects]:
                course.subjects.append(subjectObj)
        
        Exam.objects.filter(examID=exam.examID).delete()
        exam.save()


#####################################
# deleteSubjectFromCourseInExams(courseName, subjectObj)
# help function
#####################################
def deleteSubjectFromCourseInExams(courseName, subjectObj):
     # get all exams from DB
    examsList = list(Exam.objects.all())

    # iterate over all exams
    # for every exam, look as its course and add subject if necessary
    # for every question, add subject to its course if necessary
    for exam in examsList:
        course = exam.course
        if course.name == courseName:
            course.subjects = list(filter(lambda subject:subject.name != subjectObj.name, course.subjects))

        questionsList = list(exam.questions)
        for question in questionsList:
            course = question.course
            if course.name == courseName:
                course.subjects = list(filter(lambda subject:subject.name != subjectObj.name, course.subjects))

        Exam.objects.filter(examID=exam.examID).delete()
        exam.save()
    


########################################################
# changeCoursesTemplateInList(coursesList)
# Help Function
########################################################
def changeCoursesTemplateInList(coursesList):
    ret_coursesList = list()

    for course in coursesList:
        courseJson = changeCourseTemplate(course)
        ret_coursesList.append(courseJson)
    
    return ret_coursesList


########################################################
# changeCourseTemplate(course)
# Help Function
########################################################
def changeCourseTemplate(course):
    courseJson = dict()
    courseJson[course.name] = dict()
    courseJson[course.name]["school"] = course.school
    courseJson[course.name]['subjects'] = [subject.name for subject in course.subjects]

    return courseJson