from api.models import *
from api.HelpFuncs_Subjects import *
from api.HelpFuncs_Courses import * 
from api.HelpFuncs_Questions import *

########################################################
# changeExamsTemplateInList(examsList)
# Help Function
########################################################
def changeExamsTemplateInList(examsList):
    ret_examsList = list()

    for exam in examsList:
        examJson = changeExamTemplate(exam)
        ret_examsList.append(examJson)
    
    return ret_examsList


########################################################
# changeExamTemplate(exam)
# Help Function
########################################################
def changeExamTemplate(exam):
    examJson = dict()
    examJson[exam.examID] = dict()

    examJson[exam.examID]['name'] = exam.name
    examJson[exam.examID]['date'] = exam.date
    examJson[exam.examID]['writers'] = exam.writers
    examJson[exam.examID]['course'] = changeCourseTemplate(exam.course)
    examJson[exam.examID]['questions'] = changeQuestionsTemplateInList(exam.questions)

    examJson[exam.examID]['subjects'] = list()
    for subject in exam.subjects:
        examJson[exam.examID]['subjects'].append(subject.name)

    return examJson