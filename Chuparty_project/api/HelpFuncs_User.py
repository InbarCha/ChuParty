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