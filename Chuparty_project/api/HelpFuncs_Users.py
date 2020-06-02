from api.models import *
from api.HelpFuncs_Courses import *
import statistics, math

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

        newStudent = Student(username=username, relevantCourses=coursesList, school=school, examsGradesList=examsGradesListFinal, questionsAnsweredPerCourse = [])
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
        
        
        schools = list()
        if 'schools' in requestBody.keys():
            schools = requestBody["schools"]

        newLecturer = Lecturer(username=username, coursesTeaching=coursesList, schools=schools)
        newLecturer.save()

        return (True, newLecturer)


########################################################
'''
calculateStudentLevelInSubjects
help function
Parameters:
    subjectsArr: the array of subjects for which the student level needs to be calculated
    studentObj: the student objects as pulled from the DB
Returns:
    an array of tuples holding the student level in each subject: [("DNS", 2), ("TCP", 5)]
Algorithm:
    the studentObj holds an array which holds the level of the student in every subject, in every course.
    for example:
        studentObj.questionsAnsweredPerCourse = [
            {
                courseName: "Computer Networks",
                questionsAnsweredPerSubject: [
                    {
                        "subjectName": "DNS",
                        "answeredCorrect": [{...}, {...}] //questions objects
                        "answeredWrong": [{...}, {...}] //questions objects
                    },
                    {
                        "subjectName": "TCP",
                        "answeredCorrect": [{...}, {...}] //questions objects
                        "answeredWrong": [{...}, {...}] //questions objects
                    }
                ]
            },
            {
                ...... //another course
            }
        ]

    The algorithm pulls the relevent document for the currect course.
    Then, for every relevant subject (from the subjectsArr parameters):
        it creates a list of the difficulty levels of all the questions the student answered correctly.
        it creates a list of the difficulty levels of all the questions the student answered wrongly.
        ----------------
        it calculates the mean of all the easy quetions answered correctly (difficulty < 5),
        and the mean of all the hard questions answered correctly (difficulty >=5)
        then calculates the weighted mean between those two means (==> correctMean variable)
        giving more weight to the mean of the hard questions answered correctly.
        ---------------
        it calculates the mean of all the easy quetions answered wrongly (difficulty < 5),
        and the mean of all the hard questions answered wrongly (difficulty >=5)
        then calculates the weighted mean between those two means (==> wrongMean variable)
        giving more weight to the mean of hard questions answered wrongly
        ----------------
        the total mean is calculated as max(0, correctMean - wrongMean)
        ----------------
        it pushes to the return array a tuple: (relevant subject, student level in that subject)
'''
########################################################
def calculateStudentLevelInSubjects(subjectsArr, courseObj, studentObj):
    resArr = []

    releventCourseAnsweredList = [questionsAnsweredPerCourse for questionsAnsweredPerCourse in studentObj.questionsAnsweredPerCourse \
                            if questionsAnsweredPerCourse.courseName == courseObj.name]

    if releventCourseAnsweredList: # not empty
        questionsAnsweredPerCourse_curr = releventCourseAnsweredList[0]

        relevantSubjectsAnsweredList = [questionsAnsweredPerSubject for questionsAnsweredPerSubject in questionsAnsweredPerCourse_curr.questionsAnsweredPerSubject \
                                    if questionsAnsweredPerSubject.subjectName in subjectsArr]

        if relevantSubjectsAnsweredList: # not empty
            for subjectQuestionsAnswered in relevantSubjectsAnsweredList:
                # answered correct
                easyDiffLvlQuestionsAnsweredCorrect = [question.difficulty for question in subjectQuestionsAnswered.answeredCorrect if question.difficulty < 5]
                if len(easyDiffLvlQuestionsAnsweredCorrect) == 0:
                    easyDiffLvlQuestionsAnsweredCorrect.append(0)
                hardDiffLvlQuestionsAnsweredCorrect = [question.difficulty for question in subjectQuestionsAnswered.answeredCorrect if question.difficulty >= 5]
                if len(hardDiffLvlQuestionsAnsweredCorrect) == 0:
                    hardDiffLvlQuestionsAnsweredCorrect.append(0)

                meanEasyCorrect = statistics.mean(easyDiffLvlQuestionsAnsweredCorrect)
                meanHardCorrect = statistics.mean(hardDiffLvlQuestionsAnsweredCorrect)

                meanCorrect = (0.4 * meanEasyCorrect) + (0.6 * meanHardCorrect) 

                # answered wrong
                easyDiffLvlQuestionsAnsweredWrong = [question.difficulty for question in subjectQuestionsAnswered.answeredWrong if question.difficulty < 5]
                if len(easyDiffLvlQuestionsAnsweredWrong) == 0:
                    easyDiffLvlQuestionsAnsweredWrong.append(0)
                hardDiffLvlQuestionsAnsweredWrong = [question.difficulty for question in subjectQuestionsAnswered.answeredWrong if question.difficulty >= 5]
                if len(hardDiffLvlQuestionsAnsweredWrong) == 0:
                    hardDiffLvlQuestionsAnsweredWrong.append(0)

                meanEasyWrong = statistics.mean(easyDiffLvlQuestionsAnsweredWrong)
                meanHardWrong = statistics.mean(hardDiffLvlQuestionsAnsweredWrong)

                meanWrong = (0.4 * meanEasyWrong) + (0.6 * meanHardWrong)

                # total mean
                totalMean = max(0, round(meanCorrect - meanWrong))

                resArr.append((subjectQuestionsAnswered.subjectName, totalMean))

    return resArr


########################################################
# getAllQuestionstTheStudentSolved(username)
# help function
########################################################
def getAllQuestionstTheStudentSolvedFromCourse(studentObj, courseObj):
    retList = []

    releventCourseAnsweredList = [questionsAnsweredPerCourse for questionsAnsweredPerCourse in studentObj.questionsAnsweredPerCourse \
                            if questionsAnsweredPerCourse.courseName == courseObj.name]
    
    if releventCourseAnsweredList: # not empty
        questionsAnsweredPerCourse_curr = releventCourseAnsweredList[0]

        for obj in questionsAnsweredPerCourse_curr.questionsAnsweredPerSubject:
            retList += obj.answeredCorrect + obj.answeredWrong

    return retList

########################################################
# calculateSuccessNumsPerSubject(questionsAnsweredPerCourse)
# help function
########################################################
def calculateSuccessNumsPerSubject(questionsAnsweredPerCourse): 
    ret_list = []

    for questionsAnsweredPerSubject in questionsAnsweredPerCourse.questionsAnsweredPerSubject:
        numAnsweredCorrect = len(questionsAnsweredPerSubject.answeredCorrect)
        numAnsweredWrong = len(questionsAnsweredPerSubject.answeredWrong)
        ret_list.append((questionsAnsweredPerSubject.subjectName, numAnsweredCorrect / (numAnsweredWrong + numAnsweredCorrect)))
    
    return ret_list

########################################################
# calculateSuccessRatesForCourse(courseName)
# help function
'''
{
    "courseName": "רשתות תקשורת",
    "successRatesPerSubject": {
        "DNS": 2, 
        "TCP": 4
    }
}
'''
########################################################
def calculateSuccessRatesForCourse(courseName):
    allStudents = Student.objects.all()

    # python dict
    # ("DNS":
    #     [
    #       (2, 3), // 2 - correct, 3 - wrong for 1st student
    #       (3, 4) // 3 - correct, 4 - wrong for 2nd student
    #     ],
    #  "TCP": [
    #   ....
    #   ]
    # )
    temp_dict = dict()

    for student in allStudents:
        studentQuestionsAnsweredPerCourse = student.questionsAnsweredPerCourse

        for course in studentQuestionsAnsweredPerCourse:
            if course.courseName == courseName:
                studentQuestionsAnsweredPerSubject = course.questionsAnsweredPerSubject

                for subject in studentQuestionsAnsweredPerSubject:
                    numCorrect = len(subject.answeredCorrect)
                    numWrong = len(subject.answeredWrong)

                    if subject.subjectName in temp_dict.keys():
                        temp_dict[subject.subjectName].append((numCorrect, numWrong))
                    else:
                        temp_dict[subject.subjectName] = [(numCorrect, numWrong)]
        
    for key in temp_dict.keys():
        currentTuplesList = temp_dict[key]
        tempList = [int((tuple[0] / (tuple[0] + tuple[1])) * 100) for tuple in currentTuplesList] # turn tuple into success rate
        finalVal = sum(tempList) / len(tempList) # average success rate
        temp_dict[key] = int(finalVal)
                
    return temp_dict

