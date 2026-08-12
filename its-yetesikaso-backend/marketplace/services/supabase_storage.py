import os
import uuid

from supabase import create_client


BUCKET_NAME = "listing-images"


def upload_listing_image(uploaded_file):
    supabase_url = os.environ["SUPABASE_URL"]
    supabase_key = os.environ["SUPABASE_SERVICE_ROLE_KEY"]

    supabase = create_client(
        supabase_url,
        supabase_key,
    )

    extension = os.path.splitext(uploaded_file.name)[1].lower()

    filename = f"{uuid.uuid4()}{extension}"
    path = f"listings/{filename}"

    file_bytes = uploaded_file.read()

    supabase.storage.from_(BUCKET_NAME).upload(
        path,
        file_bytes,
        {
            "content-type": uploaded_file.content_type,
            "upsert": False,
        },
    )

    return (
        f"{supabase_url}/storage/v1/object/public/"
        f"{BUCKET_NAME}/{path}"
    )