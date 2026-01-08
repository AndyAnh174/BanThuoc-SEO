from django.urls import path
from .views import RegisterB2BView

urlpatterns = [
    path('auth/register', RegisterB2BView.as_view(), name='register-b2b'),
]
