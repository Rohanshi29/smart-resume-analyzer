# resume/views.py
import logging
import traceback

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import get_user_model
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import Resume
from .serializers import ResumeSerializer
from .parser import parse_resume
from .ats import calculate_ats
from .recommendation import recommend_jobs

logger = logging.getLogger(__name__)


def _run_analysis(resume):
    """Parse the resume file, score it, and recommend jobs. Raises on failure."""
    data = parse_resume(resume.resume_file.path)
    score = calculate_ats(data)
    jobs = recommend_jobs(data["skills"], data.get("raw_text", ""))
    return {
        "resume_id": resume.pk,
        "resume_data": data,
        "ats_score": score,
        "recommended_jobs": jobs,
    }

from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated

@api_view(["POST"])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def upload_resume(request):
    logger.info("upload_resume called; method=%s", request.method)
    logger.info("FILES keys: %s", list(request.FILES.keys()))
    logger.info("POST keys: %s", request.POST.dict())

    try:
        uploaded = request.FILES.get("resume")
        if not uploaded:
            return Response({"error": "No file under key 'resume' in request.FILES"}, status=400)

        user = request.user  # now correctly populated by TokenAuthentication

        resume = Resume.objects.create(user=user, resume_file=uploaded)
        logger.info("Created Resume id=%s file=%s", resume.pk, resume.resume_file.name)

        try:
            analysis = _run_analysis(resume)
        except Exception as analysis_exc:
            logger.exception("analysis failed for resume id=%s", resume.pk)
            return Response({
                "message": "Uploaded, but analysis failed",
                "resume_id": resume.pk,
                "file": resume.resume_file.name,
                "analysis_error": str(analysis_exc),
            }, status=207)

        return Response({
            "message": "Uploaded and analyzed",
            "file": resume.resume_file.name,
            **analysis,
        })
    except Exception as exc:
        logger.exception("upload error")
        return Response({
            "error": "server error",
            "exception": str(exc),
        }, status=500)


@api_view(["GET"])
def analyze_resume(request):
    """
    Re-run analysis for a specific resume.
    Pass ?resume_id=<id>. Falls back to the most recent resume if omitted
    (kept for backwards compatibility, but you should always pass resume_id).
    """
    resume_id = request.GET.get("resume_id")

    if resume_id:
        try:
            resume = Resume.objects.get(pk=resume_id)
        except Resume.DoesNotExist:
            return Response({"error": f"Resume id {resume_id} not found"}, status=404)
    else:
        resume = Resume.objects.last()
        if resume is None:
            return Response({"error": "No resumes uploaded yet"}, status=404)

    try:
        analysis = _run_analysis(resume)
    except Exception as exc:
        logger.exception("analyze error for resume id=%s", resume.pk)
        return Response({"error": "Could not analyze this resume", "detail": str(exc)}, status=422)

    return Response(analysis)
