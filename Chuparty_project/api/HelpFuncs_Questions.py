from api.models import *
from api.HelpFuncs_Subjects import *
from api.HelpFuncs_Courses import * 

#####################################
# createQuestion()
# help function
# Parameters:
#      requestBody: Question as a JSON
# Returns:
#      Tuple ret_tuple
#      if ret_tuple[0] == None: indicates Error, and ret_tuple[1] is a string describing the error
#      else, ret_tuple[0] is True if a new question was created in the DB, and False otherwise
#            In both cases, ret_tuple[1] is the Question Object (either just created or pulled from DB)
###################################
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
        ret_tuple = createCourseOrAddSubject(course)
        isCourseReturned = ret_tuple[0]
        if isCourseReturned is None:
            return (None, ret_tuple[1])
        courseObj = ret_tuple[1]
        print(courseObj)

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
    

#######################################################
# updateQuestionInExams(newQuestionObj, questionBody)
# help function
#######################################################
def updateQuestionInExams(newQuestionObj, questionBody):
    # get all exams from DB
    examsList = list(Exam.objects.all())

    # iterate over all exams
    # for every exam, iterate over all questions
    # if one of the questions' "body" field == questionBody parameter, 
    # change the questino to "newQuestionObj" parameter
    for exam in examsList:
        questionsList = exam.questions
        for i in range(len(questionsList)):
            if questionsList[i].body == questionBody:
                questionsList[i] = newQuestionObj

        Exam.objects.filter(examID=exam.examID).delete()
        exam.save()
    