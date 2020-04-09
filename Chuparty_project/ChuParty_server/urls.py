from django.contrib import admin
from django.views.generic import TemplateView
from django.contrib.auth.decorators import login_required
from django.urls import include, path, re_path


urlpatterns = [
    #TODO: handle login_required
    path('', TemplateView.as_view(template_name='index.html')),
    path('api/', include('api.urls')),
    re_path(r'^(?:.*)/?$', TemplateView.as_view(template_name="index.html")),# any path that is not '/'
    path('admin/', admin.site.urls)
]
