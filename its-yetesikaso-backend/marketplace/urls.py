from django.urls import path
from .views import my_listings
from marketplace.api.views.listing_views import listings, create_listing
from marketplace.api.views.auth_views import register

urlpatterns = [
    # listings
    path("listings/", listings),
    path("listings/create/", create_listing),
    path("listings/me/", my_listings),

    # auth
    path("auth/register/", register),
    
]