import django_filters
from .models import Listing


class ListingFilter(django_filters.FilterSet):
    category = django_filters.CharFilter(field_name="category", lookup_expr="iexact")
    location = django_filters.CharFilter(field_name="location", lookup_expr="iexact")

    class Meta:
        model = Listing
        fields = ["category", "location"]