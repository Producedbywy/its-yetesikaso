from django.shortcuts import get_object_or_404

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from marketplace.models import Application, Job, SellerProfile
from marketplace.serializers import ApplicationSerializer


def get_employer_profile(user):
    try:
        profile = user.seller_profile
    except SellerProfile.DoesNotExist:
        return None

    if profile.role != "employer":
        return None

    return profile


# =========================
# APPLY TO JOB
# =========================

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def apply_to_job(request, job_id):
    job = get_object_or_404(
        Job,
        id=job_id,
        status="active",
    )

    if job.employer == request.user:
        return Response(
            {
                "error": "You cannot apply to your own job"
            },
            status=status.HTTP_403_FORBIDDEN,
        )

    if Application.objects.filter(
        job=job,
        applicant=request.user,
    ).exists():
        return Response(
            {
                "error": "You have already applied to this job"
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    cover_note = str(
        request.data.get("cover_note", "")
    ).strip()

    cv = request.FILES.get("cv")

    if not cover_note and not cv:
        return Response(
            {
                "error": (
                    "Please provide a cover note "
                    "or upload a CV"
                )
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    if cv:
        allowed_types = {
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        }

        if cv.content_type not in allowed_types:
            return Response(
                {
                    "error": (
                        "CV must be a PDF, DOC, "
                        "or DOCX file"
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if cv.size > 5 * 1024 * 1024:
            return Response(
                {
                    "error": "CV must be smaller than 5MB"
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

    application = Application.objects.create(
        job=job,
        applicant=request.user,
        cover_note=cover_note,
        cv=cv,
    )

    return Response(
        {
            "message": "Application submitted successfully",
            "application": ApplicationSerializer(
                application
            ).data,
        },
        status=status.HTTP_201_CREATED,
    )


# =========================
# MY APPLICATIONS
# =========================

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_applications(request):
    applications = Application.objects.filter(
        applicant=request.user
    ).select_related(
        "job",
        "job__employer",
        "job__employer__seller_profile",
    )

    serializer = ApplicationSerializer(
        applications,
        many=True,
    )

    return Response(
        {
            "results": serializer.data,
            "total": applications.count(),
        }
    )


# =========================
# EMPLOYER APPLICATIONS
# =========================

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def employer_applications(request):
    profile = get_employer_profile(
        request.user
    )

    if profile is None:
        return Response(
            {
                "error": (
                    "Only employers can access "
                    "job applications"
                )
            },
            status=status.HTTP_403_FORBIDDEN,
        )

    applications = Application.objects.filter(
        job__employer=request.user
    ).select_related(
        "job",
        "applicant",
        "applicant__seller_profile",
    )

    serializer = ApplicationSerializer(
        applications,
        many=True,
    )

    return Response(
        {
            "results": serializer.data,
            "total": applications.count(),
        }
    )


# =========================
# APPLICATION DETAIL / STATUS
# =========================

@api_view(["GET", "PATCH"])
@permission_classes([IsAuthenticated])
def application_detail(
    request,
    application_id,
):
    application = get_object_or_404(
        Application.objects.select_related(
            "job",
            "job__employer",
            "applicant",
            "applicant__seller_profile",
        ),
        id=application_id,
    )

    is_applicant = (
        application.applicant == request.user
    )

    is_employer = (
        application.job.employer == request.user
    )

    if not is_applicant and not is_employer:
        return Response(
            {
                "error": "You do not have permission to access this application"
            },
            status=status.HTTP_403_FORBIDDEN,
        )

    if request.method == "GET":
        return Response(
            ApplicationSerializer(
                application
            ).data
        )

    # Only the employer can change application status.
    if not is_employer:
        return Response(
            {
                "error": (
                    "Only the employer can update "
                    "application status"
                )
            },
            status=status.HTTP_403_FORBIDDEN,
        )

    status_value = request.data.get("status")

    valid_statuses = {
        choice[0]
        for choice in Application.STATUS_CHOICES
    }

    if status_value not in valid_statuses:
        return Response(
            {
                "error": "Invalid application status"
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    application.status = status_value
    application.save(
        update_fields=[
            "status",
            "updated_at",
        ]
    )

    return Response(
        {
            "message": "Application status updated successfully",
            "application": ApplicationSerializer(
                application
            ).data,
        }
    )