# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.shortcuts import render

# Create your views here.
def index(request):
    """ return the front page """
    context = {
        "pizzas" : ["pepperoni", "cheese", "sausage"]
    }
    return render(request, 'index.html', context=context)