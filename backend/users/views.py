from django.contrib.auth import get_user_model, authenticate
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from rest_framework.authtoken.models import Token
import json

User = get_user_model()


@csrf_exempt
def login_user(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST required"}, status=405)

    data = json.loads(request.body)
    email = data.get("email")
    password = data.get("password")

    existing = User.objects.filter(email=email).first()
    if existing is None:
        return JsonResponse({"error": "User not found"}, status=404)

    user = authenticate(username=existing.username, password=password)
    if user is None:
        return JsonResponse({"error": "Incorrect password"}, status=401)

    token, _ = Token.objects.get_or_create(user=user)
    return JsonResponse({
        "message": "Login Successful",
        "token": token.key,
        "user": {"id": user.pk, "username": user.username, "email": user.email},
    })


@csrf_exempt
def register_user(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST required"}, status=405)

    data = json.loads(request.body)
    password = data.get("password")
    email = data.get("email", "")
    username = data.get("username") or (email.split("@")[0] if email else None)

    if not username or not password:
        return JsonResponse({"error": "email/username and password required"}, status=400)
    if email and User.objects.filter(email=email).exists():
        return JsonResponse({"error": "Email already registered"}, status=400)

    # If the auto-derived username is taken, make it unique
    base_username = username
    suffix = 1
    while User.objects.filter(username=username).exists():
        username = f"{base_username}{suffix}"
        suffix += 1

    user = User.objects.create_user(username=username, password=password, email=email)
    token, _ = Token.objects.get_or_create(user=user)
    return JsonResponse({
        "message": "Registration Successful",
        "token": token.key,
        "username": user.username,
        "user_id": user.pk,
    })


def profile(request):
    return JsonResponse({"message": "User Profile API"})