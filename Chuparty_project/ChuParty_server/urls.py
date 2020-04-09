from django.contrib import admin
from django.views.generic import TemplateView
from django.contrib.auth.decorators import login_required
from django.urls import include, path, re_path


urlpatterns = [
    # path('', include('frontend.urls')),
    #TODO: handle login_required
    #TODO: add apis path
    path('', TemplateView.as_view(template_name='index.html')),
    re_path(r'^(?:.*)/?$', TemplateView.as_view(template_name="index.html")),# any path that is not '/'
    path('admin/', admin.site.urls)
]
