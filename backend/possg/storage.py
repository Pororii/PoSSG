import os
from django.core.files.storage import FileSystemStorage
from storages.backends.s3boto3 import S3Boto3Storage

class CustomFileSystemStorage(FileSystemStorage):
    def get_available_name(self, name, max_length=None):
        return name

    def _save(self, name, content):
        return super()._save(name, content)

class MediaStorage(S3Boto3Storage):
    bucket_name = 'your_bucket_name'
    custom_domain = f'{bucket_name}.s3.amazonaws.com'