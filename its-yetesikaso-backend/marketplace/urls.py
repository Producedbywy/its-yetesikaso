from django.urls import path

from .views import my_listings

from marketplace.api.views.listing_views import (
    listings,
    create_listing,
    listing_detail,
    mark_listing_sold,
    create_transaction,
    confirm_transaction,
    complete_transaction,
    cancel_transaction,
    my_transactions,
    transaction_detail,
    create_review,
)

from marketplace.api.views.auth_views import (
    register,
    password_reset_request,
    password_reset_confirm,
    get_profile,
    update_profile,
    upgrade_profile,
    public_seller_profile,
)

from marketplace.api.views.message_views import (
    create_conversation,
    conversations,
    conversation_messages,
)

from marketplace.api.views.job_views import (
    jobs,
    job_detail,
    my_jobs,
    create_job,
    employer_job_detail,
)

from marketplace.api.views.application_views import (
    apply_to_job,
    my_applications,
    employer_applications,
    application_detail,
)

from marketplace.api.views.favourite_views import (
    my_favourites,
    favourite_listing,
)

from marketplace.api.views.report_views import (
    report_listing,
)


urlpatterns = [

    # =========================
    # Listings
    # =========================

    path(
        "listings/",
        listings,
        name="listings",
    ),

    path(
        "listings/create/",
        create_listing,
        name="create-listing",
    ),

    path(
        "listings/<int:listing_id>/",
        listing_detail,
        name="listing-detail",
    ),

    path(
        "listings/<int:listing_id>/sold/",
        mark_listing_sold,
        name="mark-listing-sold",
    ),

    path(
        "listings/<int:listing_id>/report/",
        report_listing,
        name="report-listing",
    ),

    path(
        "listings/me/",
        my_listings,
        name="my-listings",
    ),

    path(
        "transactions/create/",
        create_transaction,
        name="create-transaction",
    ),

    path(
        "transactions/<int:transaction_id>/confirm/",
        confirm_transaction,
        name="confirm-transaction",
    ),

    path(
        "transactions/<int:transaction_id>/complete/",
        complete_transaction,
        name="complete-transaction",
    ),

    path(
        "transactions/<int:transaction_id>/cancel/",
        cancel_transaction,
        name="cancel-transaction",
    ),

    path(
        "transactions/",
        my_transactions,
        name="my-transactions",
    ),

    path(
        "transactions/<int:transaction_id>/",
        transaction_detail,
        name="transaction-detail",
    ),

    path(
        "transactions/<int:transaction_id>/review/",
        create_review,
        name="create-review",
    ),

    # =========================
    # Favourites
    # =========================

    path(
        "favourites/",
        my_favourites,
        name="my-favourites",
    ),

    path(
        "listings/<int:listing_id>/favourite/",
        favourite_listing,
        name="favourite-listing",
    ),

    # =========================
    # Jobs
    # =========================

    path(
        "jobs/",
        jobs,
        name="jobs",
    ),

    path(
        "jobs/create/",
        create_job,
        name="create-job",
    ),

    path(
        "jobs/me/",
        my_jobs,
        name="my-jobs",
    ),

    path(
        "jobs/<int:job_id>/",
        job_detail,
        name="job-detail",
    ),

    path(
        "jobs/<int:job_id>/manage/",
        employer_job_detail,
        name="employer-job-detail",
    ),

    # =========================
    # Applications
    # =========================

    path(
        "jobs/<int:job_id>/apply/",
        apply_to_job,
        name="apply-to-job",
    ),

    path(
        "applications/me/",
        my_applications,
        name="my-applications",
    ),

    path(
        "applications/employer/",
        employer_applications,
        name="employer-applications",
    ),

    path(
        "applications/<int:application_id>/",
        application_detail,
        name="application-detail",
    ),

    # =========================
    # Auth
    # =========================

    path(
        "auth/register/",
        register,
        name="register",
    ),

    path(
        "auth/password-reset/",
        password_reset_request,
        name="password-reset-request",
    ),

    path(
        "auth/password-reset/confirm/",
        password_reset_confirm,
        name="password-reset-confirm",
    ),

    # =========================
    # Seller Profile
    # =========================

    path(
        "auth/profile/",
        get_profile,
        name="get-profile",
    ),

    path(
        "auth/profile/update/",
        update_profile,
        name="update-profile",
    ),

    path(
        "auth/profile/upgrade/",
        upgrade_profile,
        name="upgrade-profile",
    ),

    path(
        "sellers/<str:username>/",
        public_seller_profile,
        name="public-seller-profile",
    ),

    # =========================
    # Messages
    # =========================

    path(
        "messages/conversations/",
        conversations,
        name="conversations",
    ),

    path(
        "messages/conversations/create/",
        create_conversation,
        name="create-conversation",
    ),

    path(
        "messages/conversations/<int:conversation_id>/messages/",
        conversation_messages,
        name="conversation-messages",
    ),
]