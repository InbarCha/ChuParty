from api.models import *
from api.HelpFuncs_Courses import *

########################################################
# createStudent
# help function
# Parameters:
#      requestBody: Student as a JSON
# Returns:
#      Tuple ret_tuple
#      if ret_tuple[0] == None: indicates Error, and ret_tuple[1] is a string describing the error
#      else, ret_tuple[0] is True if a new Student was created in the DB, and False otherwise
#            In both cases, ret_tuple[1] is the Student Object (either just created or pulled from DB)
########################################################
def createStudent(requestBody):
    if 'username' not in requestBody.keys():
        return (None, "Can't Create Student: 'username' field is not in request body")
    username = requestBody['username']

    try: 
        studentObj = Student.objects.get(username=username)
        return (False, studentObj)

    except: 
        coursesList = []

        if 'relevantCourses' in requestBody.keys():
            relevantCourses = requestBody['relevantCourses']

            # iterate over courses given in the request body
            # for each course, if it doesn't exist in the db, create it
            for doc in relevantCourses:
                ret_tuple = createCourseOrAddSubject(doc)
                isCourseReturned = ret_tuple[0]
                if isCourseReturned is None:
                    return (None, ret_tuple[1])
                course = ret_tuple[1]
                coursesList.append(course.name)

        examsGradesListFinal = []
        if 'examsGradesList' in requestBody.keys():
            examsGradesList = requestBody["examsGradesList"]

            for examsGradeJson in examsGradesList:
                examID = examsGradeJson["examID"]
                examGrade = examsGradeJson["examGrade"]

                examGradeObj = ExamGradesObj(examID=examID, examGrade=int(examGrade))
                print(ExamGradesObj)
                examsGradesListFinal.append(examGradeObj)
        
        school = ""
        if 'school' in requestBody.keys():
            school = requestBody["school"]

        newStudent = Student(username=username, relevantCourses=coursesList, school=school, examsGradesList=examsGradesListFinal)
        newStudent.save()

        return (True, newStudent)


########################################################
# createLecturer
# help function
# Parameters:
#      requestBody: Lecturer as a JSON
# Returns:
#      Tuple ret_tuple
#      if ret_tuple[0] == None: indicates Error, and ret_tuple[1] is a string describing the error
#      else, ret_tuple[0] is True if a new Lecturer was created in the DB, and False otherwise
#            In both cases, ret_tuple[1] is the Lecturer Object (either just created or pulled from DB)
########################################################
def createLecturer(requestBody):
    if 'username' not in requestBody.keys():
        return (None, "Can't Create Lecturer: 'username' field is not in request body")
    username = requestBody['username']

    try: 
        lecturerObj = Lecturer.objects.get(username=username)
        return (False, lecturerObj)

    except: 
        coursesList = []

        if 'coursesTeaching' in requestBody.keys():
            coursesTeaching = requestBody['coursesTeaching']

            # iterate over courses given in the request body
            # for each course, if it doesn't exist in the db, create it
            for doc in coursesTeaching:
                ret_tuple = createCourseOrAddSubject(doc)
                isCourseReturned = ret_tuple[0]
                if isCourseReturned is None:
                    return (None, ret_tuple[1])
                courseObj = ret_tuple[1]
                coursesList.append(courseObj.name)
        
        
        school = ""
        if 'school' in requestBody.keys():
            school = requestBody["school"]

        newLecturer = Lecturer(username=username, coursesTeaching=coursesList, school=school)
        newLecturer.save()

        return (True, newLecturer)