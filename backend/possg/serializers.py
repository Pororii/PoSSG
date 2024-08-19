from rest_framework import serializers
from .models import Image, UploadedFile, File, Portfolio

class ImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Image
        fields = ['id', 'image', 'uploaded_at']

class FileUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = UploadedFile
        fields = ['sector', 'title', 'file']

class FileSerializer(serializers.ModelSerializer):
    class Meta:
        model = File
        fields = '__all__'

        
class MultiFileUploadSerializer(serializers.Serializer):
    sector = serializers.CharField(max_length=255)
    title = serializers.CharField(max_length=255)
    files = serializers.ListField(
        child=serializers.FileField()
    )
    

class PortfolioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Portfolio
        fields = '__all__'