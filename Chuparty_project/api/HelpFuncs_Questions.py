from api.models import *
from api.HelpFuncs_Subjects import *
from api.HelpFuncs_Courses import * 
from api.HelpFuncs_General import *
from django.http import JsonResponse

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

        # difficulty
        if 'difficulty' not in requestBody.keys():
            return (None, "Can't Create Question: 'difficulty' field in not in request body")
        difficulty = requestBody['difficulty']
    
        questionObj = Question(
            subject=subjectObj,
            course=courseObj, 
            body=questionBody,
            answers=answers,
            correctAnswer=correctAnswer,
            difficulty=difficulty
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
                # if question's subject changed, change the matching exam's subject name
                if questionsList[i].subject.name != newQuestionObj.subject.name:
                    for subject in exam.subjects:
                         if subject.name == questionsList[i].subject.name:
                             subject.name = newQuestionObj.subject.name

                # change the exam's question to the new questionObj
                questionsList[i] = newQuestionObj

        Exam.objects.filter(examID=exam.examID).delete()
        exam.save()
    


########################################################
# changeQuestionsTemplateInList(questionsList)
# Help Function
########################################################
def changeQuestionsTemplateInList(questionsList):
    ret_questionsList = list()

    for question in questionsList:
        questionJson = changeQuestionTemplate(question)
        ret_questionsList.append(questionJson)
    
    return ret_questionsList


########################################################
# changeQuestionTemplate(question)
# Help Function
########################################################
def changeQuestionTemplate(question):
    questionJson = dict()
    questionJson[question.body] = dict()
    questionJson[question.body]['subject'] = question.subject.name
    questionJson[question.body]['course'] = changeCourseTemplate(question.course)
    questionJson[question.body]['answers'] = question.answers
    questionJson[question.body]['correctAnswer'] = question.correctAnswer
    questionJson[question.body]['difficulty'] = question.difficulty

    return questionJson


########################################################
# editQuestion(request)
# Help Function
########################################################
def editQuestion_helpFunc(requestBody):
    changedCourseFlg = False
    changedSubjectFlg = False
    changedAnswersFlg = False
    changedCorrectAnswerFlg = False
    changedBodyFlg = False
    changeDifficultyFlg = False

    if 'body' not in requestBody.keys():
        return JsonResponse({"Status": "Can't Edit Question: 'body' field in not in request body"}, status=500)
    body = requestBody['body']

    questionObj = Question.objects.get(body=body)

    # change the question's course
    if 'ChangeCourse' in requestBody.keys():
        newCourse = requestBody['ChangeCourse']

        ret_tuple = createCourseOrAddSubject(newCourse)
        isCourseReturned = ret_tuple[0]

        if isCourseReturned is None:
            return JsonResponse({"Status": ret_tuple[1]}, status=500)

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
            return JsonResponse({"Status": ret_tuple[1]}, status=500)

        subjectObj = ret_tuple[1]
        if subjectObj.name != questionObj.subject.name:
            questionObj.subject = subjectObj
            changedSubjectFlg = True

    # change the question's answers list
    if 'ChangeAnswers' in requestBody.keys():
        oldAnswersList = questionObj.answers
        newAnswersList = requestBody['ChangeAnswers']

        filteredListNew = [
            string for string in newAnswersList if string not in oldAnswersList]
        filteredListOld = [
            string for string in oldAnswersList if string not in newAnswersList]
        if filteredListNew or filteredListOld:
            questionObj.answers = newAnswersList
            changedAnswersFlg = True

    # change the question's correct answer
    if 'ChangeCorrectAnswer' in requestBody.keys():
        newCorrectAnswer = int(requestBody['ChangeCorrectAnswer'])
        if questionObj.correctAnswer != newCorrectAnswer:
            questionObj.correctAnswer = newCorrectAnswer
            changedCorrectAnswerFlg = True

    if 'ChangeDifficulty' in requestBody.keys():
        newDifficulty = int(requestBody['ChangeDifficulty'])
        if questionObj.difficulty != newDifficulty:
            questionObj.difficulty = newDifficulty
            changeDifficultyFlg = True

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
            changedCorrectAnswerFlg == True or changedBodyFlg == True or changeDifficultyFlg == True:

        Question.objects.filter(body=body).delete()
        questionObj.save()

    ret_json = dict()
    ret_json["Edited Question"] = changeQuestionTemplate(questionObj)

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

    if changeDifficultyFlg == True:
        ret_json['Changed Difficulty'] = "True"
    else:
        ret_json['Changed Difficulty'] = "False"

    if changedBodyFlg == True:
        ret_json['Changed Body'] = "True"
    else:
        ret_json['Changed Body'] = "False"

    updateQuestionInExams(questionObj, body)

    return ret_json