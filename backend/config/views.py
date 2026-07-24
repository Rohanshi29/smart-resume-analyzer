from django.http import JsonResponse
from django.http import HttpResponse

def home(request):
    return HttpResponse("✅ Backend is running successfully!")

def home(request):
    return JsonResponse({"status": "success", "message": "Backend is running successfully!"})