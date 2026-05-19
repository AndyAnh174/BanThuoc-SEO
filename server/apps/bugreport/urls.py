from django.urls import path
from .views import SubmitBugReportView, UploadBugImageView

app_name = 'bugreport'

urlpatterns = [
    path('admin/bug-reports/submit/', SubmitBugReportView.as_view(), name='bug-report-submit'),
    path('admin/bug-reports/upload-image/', UploadBugImageView.as_view(), name='bug-report-upload-image'),
]
