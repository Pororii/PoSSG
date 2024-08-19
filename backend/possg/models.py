from django.db import models
from .storage import CustomFileSystemStorage
from common.models import User
import os



class Image(models.Model):
    image = models.ImageField(upload_to='', storage=CustomFileSystemStorage())
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.image.name



class UploadedFile(models.Model):
    sector = models.CharField(max_length=255)
    title = models.CharField(max_length=255)
    file = models.FileField(upload_to='uploads/')

    def __str__(self):
        return self.title
    

class File(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    sector = models.CharField(max_length=255)
    title = models.CharField(max_length=255)
    file_type = models.CharField(max_length=50)
    file_name = models.CharField(max_length=255)
    thumbnail = models.CharField(max_length=255, null=True, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.nickname} - {self.sector}/{self.title}/{self.file_name}"
    
    

class Portfolio(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    sector = models.CharField(max_length=255)
    title = models.CharField(max_length=255)
    subject = models.CharField(max_length=255)
    summary = models.TextField()
    pdf_file = models.FileField(upload_to='portfolios/')
    result = models.TextField()

    def __str__(self):
        return f"{self.user.nickname} - {self.sector}/{self.title}"



class JobRecommendation(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    recommendation = models.TextField()

    def __str__(self):
        return f"{self.user.nickname}'s Recommendation"
