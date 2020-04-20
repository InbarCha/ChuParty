from api.models import *
from api.HelpFuncs_Subjects import *
from api.HelpFuncs_Courses import * 

########################################################
# changeSchoolsTemplateInList(schoolsList)
# Help Function
########################################################
def changeSchoolsTemplateInList(schoolsList):
    ret_schoolsList = list()

    for school in schoolsList:
        schoolJson = changeSchoolTemplate(school)
        ret_schoolsList.append(schoolJson)
    
    return ret_schoolsList

########################################################
# changeSchoolTemplate(school)
# Help Function
########################################################
def changeSchoolTemplate(school):
    schoolJson = dict()
    schoolJson[school.name] = dict()
    schoolJson[school.name]['courses'] = changeCoursesTemplateInList(school.courses)

    return schoolJson