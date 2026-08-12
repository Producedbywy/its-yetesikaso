from django.urls import path

from .views import my_listings

from marketplace.api.views.listing_views import (
    listings,
    create_listing,
)

from marketplace.api.views.auth_views import (
    register,
    get_profile,
    update_profile,
)

from marketplace.api.views.message_views import (
    create_conversation,
    conversations,
    conversation_messages,
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
        "listings/me/",
        my_listings,
        name="my-listings",
    ),


    # =========================
    # Auth
    # =========================

    path(
        "auth/register/",
        register,
        name="register",
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