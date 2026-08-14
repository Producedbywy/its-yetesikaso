from django.shortcuts import get_object_or_404

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from marketplace.models import Job, SellerProfile
from marketplace.serializers import JobSerializer


def get_employer_profile(user):
    try:
        profile = user.seller_profile
    except SellerProfile.DoesNotExist:
        return None

    if profile.role != "employer":
        return None

    return profile


# =========================
# PUBLIC JOBS
# =========================

@api_view(["GET"])
@permission_classes([AllowAny])
def jobs(request):
    qs = Job.objects.filter(
        status="active"
    ).select_related(
        "employer",
        "employer__seller_profile",
    )

    search = request.GET.get("search")
    if search:
        qs = qs.filter(
            title__icontains=search
        )

    category = request.GET.get("category")
    if category and category != "all":
        qs = qs.filter(
            category__iexact=category
        )

    location = request.GET.get("location")
    if location and location != "all":
        qs = qs.filter(
            location__icontains=location
        )

    employment_type = request.GET.get(
        "employment_type"
    )
    if (
        employment_type
        and employment_type != "all"
    ):
        qs = qs.filter(
            employment_type__iexact=employment_type
        )

    workplace_type = request.GET.get(
        "workplace_type"
    )
    if (
        workplace_type
        and workplace_type != "all"
    ):
        qs = qs.filter(
            workplace_type__iexact=workplace_type
        )

    slug = request.GET.get("slug")
    if slug:
        qs = qs.filter(slug=slug)

    qs = qs.order_by("-created_at")

    page = max(
        int(request.GET.get("page", 1)),
        1,
    )

    page_size = min(
        max(
            int(
                request.GET.get(
                    "page_size",
                    12,
                )
            ),
            1,
        ),
        50,
    )

    start = (page - 1) * page_size
    end = start + page_size

    total = qs.count()
    results = qs[start:end]

    serializer = JobSerializer(
        results,
        many=True,
    )

    return Response(
        {
            "results": serializer.data,
            "total": total,
            "page": page,
            "page_size": page_size,
            "has_next": end < total,
            "has_prev": page > 1,
        }
    )


# =========================
# JOB DETAIL
# =========================

@api_view(["GET"])
@permission_classes([AllowAny])
def job_detail(request, job_id):
    job = get_object_or_404(
        Job.objects.select_related(
            "employer",
            "employer__seller_profile",
        ),
        id=job_id,
        status="active",
    )

    return Response(
        JobSerializer(job).data
    )


# =========================
# EMPLOYER JOBS
# =========================

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_jobs(request):
    profile = get_employer_profile(
        request.user
    )

    if profile is None:
        return Response(
            {
                "error": (
                    "Only employers can access "
                    "employer jobs"
                )
            },
            status=status.HTTP_403_FORBIDDEN,
        )

    qs = Job.objects.filter(
        employer=request.user
    ).select_related(
        "employer",
        "employer__seller_profile",
    )

    serializer = JobSerializer(
        qs,
        many=True,
    )

    return Response(
        {
            "results": serializer.data,
            "total": qs.count(),
        }
    )


# =========================
# CREATE JOB
# =========================

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_job(request):
    profile = get_employer_profile(
        request.user
    )

    if profile is None:
        return Response(
            {
                "error": (
                    "Only employers can create jobs"
                )
            },
            status=status.HTTP_403_FORBIDDEN,
        )

    data = request.data.copy()

    salary_min = data.get("salary_min")
    salary_max = data.get("salary_max")

    if (
        salary_min not in (None, "")
        and salary_max not in (None, "")
    ):
        try:
            if float(salary_min) > float(salary_max):
                return Response(
                    {
                        "error": (
                            "Minimum salary cannot "
                            "be greater than maximum salary"
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )
        except (TypeError, ValueError):
            return Response(
                {
                    "error": (
                        "Salary values must be valid numbers"
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

    serializer = JobSerializer(
        data=data
    )

    serializer.is_valid(
        raise_exception=True
    )

    job = serializer.save(
        employer=request.user
    )

    return Response(
        {
            "message": "Job created successfully",
            "job": JobSerializer(job).data,
        },
        status=status.HTTP_201_CREATED,
    )


# =========================
# UPDATE / DELETE JOB
# =========================

@api_view(["GET", "PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
def employer_job_detail(
    request,
    job_id,
):
    profile = get_employer_profile(
        request.user
    )

    if profile is None:
        return Response(
            {
                "error": (
                    "Only employers can manage jobs"
                )
            },
            status=status.HTTP_403_FORBIDDEN,
        )

    job = get_object_or_404(
        Job,
        id=job_id,
        employer=request.user,
    )

    if request.method == "GET":
        return Response(
            JobSerializer(job).data
        )

    if request.method == "DELETE":
        job.delete()

        return Response(
            {
                "message": (
                    "Job deleted successfully"
                )
            },
            status=status.HTTP_200_OK,
        )

    data = request.data.copy()

    salary_min = data.get(
        "salary_min",
        job.salary_min,
    )

    salary_max = data.get(
        "salary_max",
        job.salary_max,
    )

    if (
        salary_min not in (None, "")
        and salary_max not in (None, "")
    ):
        try:
            if float(salary_min) > float(salary_max):
                return Response(
                    {
                        "error": (
                            "Minimum salary cannot "
                            "be greater than maximum salary"
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )
        except (TypeError, ValueError):
            return Response(
                {
                    "error": (
                        "Salary values must be valid numbers"
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

    serializer = JobSerializer(
        job,
        data=data,
        partial=True,
    )

    serializer.is_valid(
        raise_exception=True
    )

    serializer.save()

    return Response(
        {
            "message": "Job updated successfully",
            "job": JobSerializer(job).data,
        }
    )