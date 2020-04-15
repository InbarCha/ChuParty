from api.models import *

def getUserFields(requestBody):
    if 'first_name' not in requestBody.keys():
        return [None, "'first_name' field doesn't exist in request body"]
    first_name = requestBody['first_name']

    if 'last_name' not in requestBody.keys():
        return [None, "'last_name' field doesn't exist in request body"]
    last_name = requestBody['last_name']

    if 'email' not in requestBody.keys():
        return [None, "'email' field doesn't exist in request body"]
    email = requestBody['email']

    if 'permissions' not in requestBody.keys():
        return [None, "'permissions' field doesn't exist in request body"]
    permissions = list(requestBody['permissions'])

    return [first_name, last_name, email, permissions]


def editUser(userObj, requestBody):
    changedEmailFlg = False
    changedFirstNameFlg = False
    changedLastNameFlg = False
    changedPermissionsFlag = False

    # change first name
    if 'ChangeFirstName' in requestBody.keys():
        newFirstName = requestBody['ChangeFirstName']
        
        if newFirstName != userObj.first_name:
            userObj.first_name = newFirstName
            changedFirstNameFlg = True
    
    # change last name
    if 'ChangeLastName' in requestBody.keys():
        newLastName = requestBody['ChangeLastName']
        
        if newLastName != userObj.last_name:
            userObj.last_name = newLastName
            changedLastNameFlg = True
    
    # change permissins
    if 'ChangePermissions' in requestBody.keys():
        newPermissions = list(requestBody['ChangePermissions'])
        oldPermissions = userObj.permissions

        for permission in newPermissions:
            if permission not in PermissionEnum.choices():
                status = f"Can't edit user, permission {permission} is not allowed. Choose from PermissionEnum values"
                return [None, status]
        
        filteredPermissionsNew = [permission for permission in newPermissions if permission not in oldPermissions]
        filteredPermissionsOld = [permission for permission in oldPermissions if permission not in newPermissions]
        if filteredPermissionsNew or filteredPermissionsOld:
            userObj.permissions = newPermissions
            changedPermissionsFlag = True
    
    # change email
    if 'ChangeEmail' in requestBody.keys():
        newEmail = requestBody['ChangeEmail']

        if newEmail != userObj.email:
            userObj.email = newEmail
            changedEmailFlg = True
    
    return [userObj, changedEmailFlg, changedFirstNameFlg, changedLastNameFlg, changedPermissionsFlag]