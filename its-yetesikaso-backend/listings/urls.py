from django.urls import path
from .views import ListingListAPIView

urlpatterns = [
    path("", ListingListAPIView.as_view(), name="listing-list"),
]