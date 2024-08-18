from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Spacer, Paragraph
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_LEFT, TA_JUSTIFY
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.graphics.shapes import Drawing, Line
from reportlab.lib.colors import HexColor  # HexColor를 임포트


import os
from django.http import FileResponse
import shutil
import jwt
import json
from datetime import datetime
from django.conf import settings
from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import AuthenticationFailed
from django.utils.text import slugify
from django.core.files.storage import default_storage
from .models import File, Portfolio, JobRecommendation
from .serializers import *
import boto3
from botocore.exceptions import NoCredentialsError
from pdf2image import convert_from_path
from common.models import User
from .utils import get_user_folders_info
import PyPDF2  # PdfMerger 모듈 임포트
import sys
sys.path.append('/home/honglee0317/possg/backend/possg')
sys.path.append('/home/honglee0317/possg/backend/config')
import tp
from config.my_settings import *
from possg import upstage_utils
from PIL import Image  # 올바르게 임포트
from pathlib import Path
from fpdf import FPDF
from io import BytesIO
from django.core.files.base import ContentFile
import requests


class CreateUserFolder(APIView):
    def post(self, request):
        token = request.headers.get('Authorization', None)
        if token is None:
            raise AuthenticationFailed('Authorization token not provided')

        if not token.startswith('Bearer '):
            raise AuthenticationFailed('Invalid token format')
        token = token.split('Bearer ')[1]

        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        user_id = payload.get('user_id')
        if not user_id:
            raise AuthenticationFailed('Token payload invalid')

        user = get_object_or_404(User, pk=user_id)
        
        sector = request.data.get('sector')
        title = request.data.get('title')
        new_title = request.data.get('new_title')
        is_exist = request.data.get('is_Exist')
        user_name = user.nickname.lower()
        
        base_path = settings.MEDIA_ROOT
        current_path = os.path.join(base_path, user_name, sector, title)
        new_path = os.path.join(base_path, user_name, sector, new_title)

        if is_exist == 0:
            if not os.path.exists(current_path):
                os.makedirs(current_path)
                return JsonResponse({"message": "Folder created"})
            else:
                return JsonResponse({"message": "Folder already exists"}, status=400)
        elif is_exist == 1:
            if os.path.exists(current_path):
                if os.path.exists(new_path):
                    return JsonResponse({'message': 'same'})
                else:
                    os.rename(current_path, new_path)
                    # 경로가 변경되었으므로 데이터베이스의 파일 정보도 갱신해야 합니다.
                    File.objects.filter(user=user, sector=sector, title=title).update(title=new_title)
                    Portfolio.objects.filter(user=user, sector=sector, title=title).update(title=new_title)
                    return JsonResponse({'success': f'Folder renamed from {title} to {new_title}'})
            else:
                return JsonResponse({'error': 'Original folder does not exist'}, status=404)
        elif is_exist == 2:
            if os.path.exists(current_path):
                shutil.rmtree(current_path)
                # 해당 폴더와 관련된 데이터베이스의 파일 정보를 삭제합니다.
                File.objects.filter(user=user, sector=sector, title=title).delete()
                Portfolio.objects.filter(user=user, sector=sector, title=title).delete()
                return JsonResponse({"message": "Folder and associated files deleted"})
            else:
                return JsonResponse({"message": "Folder does not exist"}, status=404)
        else:
            return JsonResponse({"message": "Invalid is_Exist value"}, status=400)


def upload_to_aws(file_obj, bucket, s3_file_name):
    print("aws_id:", aws_key)
    session = boto3.Session(
        aws_access_key_id=aws_id,
        aws_secret_access_key=aws_key,
        region_name='us-east-2'
    )
    s3 = session.client('s3')

    try:
        s3.upload_fileobj(file_obj, bucket, s3_file_name)
        url = f"https://{bucket}.s3.{s3.meta.region_name}.amazonaws.com/{s3_file_name}"
        return url
    except NoCredentialsError:
        print("Credentials not available")
        return None

class ImageUploadView(APIView):
    def post(self, request, *args, **kwargs):
        token = request.headers.get('Authorization').split()[1]
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        user_id = payload.get('user_id')
        if not user_id:
            raise AuthenticationFailed('Token payload invalid')

        user = get_object_or_404(User, pk=user_id)
        user_name = user.nickname
        
        sector = request.data.get('sector')
        folder_name = request.data.get('folderName')
        file = request.FILES['file']

        print("uploaded_file:", file)

        if not sector or not folder_name or not file:
            return Response({"error": "Missing required fields."}, status=status.HTTP_400_BAD_REQUEST)
        
        new_filename = "thumbnail.jpg"
        s3_file_path = os.path.join("user_uploads", user_name, sector, folder_name, "thumbnails", new_filename)

        s3_url = upload_to_aws(file, 'possg', s3_file_path)

        print("s3_url:", s3_url)
        if not s3_url:
            return Response({"error": "File upload failed."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        image_instance = File(
            user=user,
            sector=sector,
            title=folder_name,
            file_type='image',
            file_name=new_filename,
            thumbnail=s3_url
        )
        image_instance.save()
        
        return Response({"message": "Upload success", "url": s3_url}, status=status.HTTP_201_CREATED)


class UserFoldersInfoView(APIView):
    def get(self, request, *args, **kwargs):
        token = request.headers.get('Authorization').split()[1]
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        user_id = payload.get('user_id')
        if not user_id:
            raise AuthenticationFailed('Token payload invalid')

        user = get_object_or_404(User, pk=user_id)
        user_name = user.nickname
        
        bucket_name = 'possg'
        folders_info = get_user_folders_info(bucket_name, user_name)
        
        print("folders:", folders_info)
        
        return Response({"folders": folders_info}, status=status.HTTP_200_OK)


'''
class FileUploadView(APIView):
    def post(self, request, *args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            raise AuthenticationFailed('Authorization header missing or invalid')

        token = auth_header.split()[1]

        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Token has expired')
        except jwt.InvalidTokenError:
            raise AuthenticationFailed('Invalid token')

        user_id = payload.get('user_id')
        if not user_id:
            raise AuthenticationFailed('Token payload invalid')

        user = get_object_or_404(User, pk=user_id)
        user_name = slugify(user.nickname)

        serializer = MultiFileUploadSerializer(data=request.data)
        if serializer.is_valid():
            sector = serializer.validated_data['sector']
            title = serializer.validated_data['title']
            files = serializer.validated_data['files']
            response_files = []

            print(files)
            for file in files:
                print("file:", file)
                upload_serializer = FileUploadSerializer(data={
                    'sector': sector,
                    'title': title,
                    'file': file
                })
                if upload_serializer.is_valid():
                    instance = upload_serializer.save()
                    # 수정된 경로 설정
                    new_path = os.path.join(settings.MEDIA_ROOT, user_name, sector, title, os.path.basename(instance.file.name))
                    os.makedirs(os.path.dirname(new_path), exist_ok=True)
                    os.rename(instance.file.path, new_path)
                    instance.file.name = os.path.join(user_name, sector, title, os.path.basename(instance.file.name))
                    instance.save()

                    file_type = 'image' if instance.file.name.lower().endswith(('.png', '.jpg', '.jpeg')) else 'pdf'
                    thumbnail = None
                    if file_type == 'pdf':
                        print("pdf upload mode....")
                        images = convert_from_path(new_path, first_page=1, last_page=1)
                        if images:
                            pdf_image_path = f"{new_path}.png"
                            print("pimage:", pdf_image_path)
                            images[0].save(pdf_image_path, 'PNG')
                            thumbnail_path = os.path.join("user_uploads", user_name, sector, title, pdf_image_path.split('/')[-1])
                            print("thumb:", thumbnail_path)
                            with open(pdf_image_path, 'rb') as file_obj:
                                thumbnail = upload_to_aws(file_obj, 'possg', thumbnail_path)
                            print("aws_thumb:", thumbnail)
                    elif file_type == 'image':
                        print("image upload mode...")
                        thumbnail_path = os.path.join("user_uploads", user_name, sector, title, file.name)
                        thumbnail = upload_to_aws(file, 'possg', thumbnail_path)
                        print("aws_thumb:", thumbnail)

                    File.objects.create(
                        user=user,
                        sector=sector,
                        title=title,
                        file_type=file_type,
                        file_name=os.path.basename(instance.file.name),
                        thumbnail=thumbnail
                    )

                    response_files.append({
                        "file": thumbnail,
                        "src": thumbnail
                    })
                else:
                    return Response(upload_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            return Response({
                "sector": sector,
                "title": title,
                "files": response_files
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
'''

class FileUploadView(APIView):
    def post(self, request, *args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            raise AuthenticationFailed('Authorization header missing or invalid')

        token = auth_header.split()[1]

        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Token has expired')
        except jwt.InvalidTokenError:
            raise AuthenticationFailed('Invalid token')

        user_id = payload.get('user_id')
        if not user_id:
            raise AuthenticationFailed('Token payload invalid')

        user = get_object_or_404(User, pk=user_id)
        user_name = slugify(user.nickname)
        
        sector = request.data.get('sector')
        title = request.data.get('title')
        files = request.FILES.getlist('files')
        response_files = []

        if not sector or not title or not files:
            return Response({"error": "Sector, title, and files are required."}, status=status.HTTP_400_BAD_REQUEST)

        for file in files:
            local_file_path = os.path.join(settings.MEDIA_ROOT, user_name, sector, title, file.name)
            os.makedirs(os.path.dirname(local_file_path), exist_ok=True)
            
            with open(local_file_path, 'wb+') as destination:
                for chunk in file.chunks():
                    destination.write(chunk)
            
            file_type = 'image' if file.name.lower().endswith(('.png', '.jpg', '.jpeg')) else 'pdf'
            thumbnail = None

            print("file_type:", file_type)

            if file_type == 'pdf':
                try:
                    print(f"Attempting to convert PDF to image: {local_file_path}")
                    images = convert_from_path(local_file_path, first_page=1, last_page=1)
                    if images:
                        pdf_image_path = f"{local_file_path}.png"
                        images[0].save(pdf_image_path, 'PNG')
                        thumbnail_path = os.path.join("user_uploads", user_name, sector, title, os.path.basename(pdf_image_path))
                        
                        print(f"Saving PDF thumbnail to S3: {thumbnail_path}")
                        with open(pdf_image_path, 'rb') as file_obj:
                            thumbnail = upload_to_aws(file_obj, 'possg', thumbnail_path)
                            print(f"Thumbnail URL: {thumbnail}")
                    else:
                        print("No images were generated from the PDF.")
                except Exception as e:
                    print(f"Error converting PDF to image: {e}")
            elif file_type == 'image':
                thumbnail_path = os.path.join("user_uploads", user_name, sector, title, file.name)
                file.seek(0)
                thumbnail = upload_to_aws(file, 'possg', thumbnail_path)
            
            File.objects.create(
                user=user,
                sector=sector,
                title=title,
                file_type=file_type,
                file_name=os.path.basename(file.name),
                thumbnail=thumbnail
            )

            response_files.append({
                "file": thumbnail,
                "src": thumbnail
            })

        return Response({
            "sector": sector,
            "title": title,
            "files": response_files
        }, status=status.HTTP_201_CREATED)



    
class SearchFilesView(APIView):
    def post(self, request, *args, **kwargs):
        token = request.headers.get('Authorization', None)
        if not token or not token.startswith('Bearer '):
            raise AuthenticationFailed('Authorization token not provided or invalid format')

        token = token.split('Bearer ')[1]
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Token has expired')
        except jwt.InvalidTokenError:
            raise AuthenticationFailed('Invalid token')

        user_id = payload.get('user_id')
        if not user_id:
            raise AuthenticationFailed('Token payload invalid')

        user = get_object_or_404(User, pk=user_id)
        user_name = user.nickname.lower()

        sector = request.data.get('sector')
        title = request.data.get('title')

        if not sector or not title:
            return Response({"error": "Sector and title are required"}, status=status.HTTP_400_BAD_REQUEST)

        base_path = os.path.join(settings.MEDIA_ROOT, user_name, sector, title)
        response_files = []

        print("base_path:", base_path)

        if os.path.exists(base_path):
            print(base_path)
            for root, dirs, files in os.walk(base_path):
                print("roots:", root)
                for file in files:
                    print(file)
                    
                    
                    try:
                        file_obj = File.objects.get(user=user, sector=sector, title=title, file_name=file)
                    
                    except File.DoesNotExist:
                        print(f"File {file} does not exist in the database.")
                        continue
                    
                    except File.MultipleObjectsReturned:
                        print(f"Multiple entries found for {file} in the database.")
                        continue
                    
                    
                    relative_path = os.path.relpath(os.path.join(root, file), settings.MEDIA_ROOT)
                    file_url = os.path.join(settings.MEDIA_URL, relative_path).replace('\\', '/')
                    src_url = file_obj.thumbnail
                    #src_url = os.path.join("https://possg.s3.us-east-2.amazonaws.com/user_uploads", file_obj.thumbnail)

                    print("file_url:", file_url, "src_url:", src_url)

                    if upstage_utils.is_valid_image_url(src_url):
                        print("유효한 이미지 URL입니다.")
                    else:
                        src_url = "https://possg.s3.us-east-2.amazonaws.com/default_thumbnails/"+ sector +"/thumbnail_default.png"

                    
                    if file.lower().endswith('.pdf'):
                        src_url = file_url + '.png'
                        '''
                        try:
                            temp_path = os.path.join(root, file)
                            if temp_path.endswith('.PDF'):
                                new_path = temp_path.replace('.PDF', '.pdf')
                                os.rename(temp_path, new_path)
                            else:
                                new_path = temp_path

                            images = convert_from_path(new_path, first_page=1, last_page=1)
                            if images:
                                pdf_image_path = os.path.join(settings.MEDIA_ROOT, 'pdf_thumbnails')
                                os.makedirs(pdf_image_path, exist_ok=True)
                                #image_path = os.path.join(pdf_image_path, file).replace('.pdf', '.png')
                                image_path = os.path.join(pdf_image_path, file)+'.png'
                                images[0].save(image_path, 'PNG')
                                
                                image_relative_path = os.path.relpath(image_path, settings.MEDIA_ROOT)
                                
                                src_url = os.path.join(settings.MEDIA_URL, image_relative_path).replace('\\', '/')
                                print("srcurl:",src_url)
                        except Exception as e:
                            print(f"Error converting PDF to image: {e}")
                        '''
                            
                    elif file.lower().endswith(('.png', '.jpg', '.jpeg')):
                        src_url = file_url
                        print("fileurl:", file_url)

                    
                    src_url = "https://possg.s3.us-east-2.amazonaws.com/user_uploads" + src_url
                    print("total_url:", src_url)
                    response_files.append({
                        "file": file,
                        "src": src_url
                    })
            print(response_files)

            portfolio_instance = Portfolio.objects.filter(user=user, sector=sector, title=title).first()
            if portfolio_instance:
                portfolio_summary = portfolio_instance.summary
                return Response({
                    "sector": sector,
                    "title": title,
                    "files": response_files,
                    "folder_portfolio": portfolio_summary
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    "sector": sector,
                    "title": title,
                    "files": response_files,
                    "folder_portfolio": ''
                }, status=status.HTTP_200_OK)
        else:
            return Response({
                "sector": sector,
                "title": title,
                "files": [],
                "folder_portfolio": ''
            }, status=status.HTTP_200_OK)

            
    

class DeleteUserFileView(APIView):
    def post(self, request):
        print("Delete View...")
        token = request.headers.get('Authorization', None)
        if token is None:
            raise AuthenticationFailed('Authorization token not provided')

        if not token.startswith('Bearer '):
            raise AuthenticationFailed('Invalid token format')
        token = token.split('Bearer ')[1]

        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Token has expired')
        except jwt.InvalidTokenError:
            raise AuthenticationFailed('Invalid token')

        user_id = payload.get('user_id')
        if not user_id:
            raise AuthenticationFailed('Token payload invalid') 

        print("user...")
        user = get_object_or_404(User, pk=user_id)
        print("user success")
        
        sector = request.data.get('sector')
        title = request.data.get('title')
        print(request.data)
        file_name = request.data.get('file_name')
        file_name = file_name
        user_name = user.nickname.lower()

        print("name:", user_name)
        # 각 값이 None인지 확인
        if not sector:
            print("Sector is required")
            return JsonResponse({"message": "Sector is required"}, status=400)
        if not title:
            print("Title is required")
            return JsonResponse({"message": "Title is required"}, status=400)
        if not file_name:
            print("File name is required")
            return JsonResponse({"message": "File name is required"}, status=400)

        base_path = settings.MEDIA_ROOT
        file_path = os.path.join(base_path, user_name, sector, title, file_name).replace(" ","_")

        print("file path:", file_path)
        if os.path.exists(file_path):
            os.remove(file_path)
            File.objects.filter(user=user, sector=sector, title=title, file_name=file_name).delete()
            return JsonResponse({"message": "File deleted"})
        else:
            print("file not exist...")
            return JsonResponse({"message": "File does not exist"}, status=404)



class PortfolioByFolderView(APIView):
    def post(self, request, *args, **kwargs):
        token = request.headers.get('Authorization', None)
        if token is None:
            raise AuthenticationFailed('Authorization token not provided')

        if not token.startswith('Bearer '):
            raise AuthenticationFailed('Invalid token format')
        token = token.split('Bearer ')[1]

        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Token has expired')
        except jwt.InvalidTokenError:
            raise AuthenticationFailed('Invalid token')

        user_id = payload.get('user_id')
        if not user_id:
            raise AuthenticationFailed('Token payload invalid')

        user = get_object_or_404(User, pk=user_id)
        print("User:", user)
        user_name = user.nickname.lower()
        job = user.job
        sector = request.data.get('sector')
        title = request.data.get('title')

        if not sector or not title:
            return Response({"error": "Sector and title are required"}, status=status.HTTP_400_BAD_REQUEST)

        
        folder_paths = os.path.join("/home/honglee0317/upstage/backend/media/folders", user_name, sector, title)
        
        print("folder_paths:", folder_paths)
        
        
        print("upstage:")
        summary, result = upstage_utils.summary(folder_paths, user_name, sector, title, job)
        print("full:", type(result))
        summary = eval(result)["subject"]
        
        print("summary:", summary, "result:", result)
        
        portfolio_folder = os.path.join(settings.MEDIA_ROOT, 'portfolios')
        os.makedirs(portfolio_folder, exist_ok=True)
        #portfolio_filename = f"{user_name}_{sector}_{title}.pdf"
        portfolio_filepath = f"""/home/honglee0317/upstage/backend/media/folders/portfolio/{user_name}_{sector}_{title}.pdf"""

        # Assuming the PDF is created and saved at portfolio_filepath
        '''
        if not os.path.exists(portfolio_filepath):
            return Response({"error": "Portfolio file not found"}, status=status.HTTP_404_NOT_FOUND)
        '''

        # 저장 또는 업데이트 로직
        portfolio, created = Portfolio.objects.update_or_create(
            user=user,
            sector=sector,
            title=title,
            defaults={
                'summary': summary,
                'pdf_file': portfolio_filepath,
                'result': str(result)
            }
        )
        print("portfolio created:", portfolio)
        response_data = { 
            "summary": portfolio.summary
        }

        return Response(response_data, status=status.HTTP_200_OK)

# PDF 파일들을 병합하는 함수
def merge_pdfs_from_folder(folder_path, output_path):
    # PdfMerger 객체 생성
    merger = PyPDF2.PdfMerger()
    
    # 폴더 내의 모든 파일을 확인
    for item in os.listdir(folder_path):
        item_path = os.path.join(folder_path, item)
        if os.path.isfile(item_path) and item.lower().endswith('.pdf'):
            merger.append(item_path)
    
    # 병합된 PDF를 출력 경로에 저장
    merger.write(output_path)
    merger.close()


class PortfolioMakeView(APIView):
    def get(self, request, *args, **kwargs):
        token = request.headers.get('Authorization', None)
        if token is None:
            raise AuthenticationFailed('Authorization token not provided')

        if not token.startswith('Bearer '):
            raise AuthenticationFailed('Invalid token format')
        token = token.split('Bearer ')[1]

        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Token has expired')
        except jwt.InvalidTokenError:
            raise AuthenticationFailed('Invalid token')

        user_id = payload.get('user_id')
        if not user_id:
            raise AuthenticationFailed('Token payload invalid')

        user = get_object_or_404(User, pk=user_id)
        user_name = user.nickname.lower()

        portfolio_folder = os.path.join(settings.MEDIA_ROOT, user_name, 'portfolio')
        portfolio_filename = f"{user_name}_total.pdf"
        portfolio_filepath = os.path.join(portfolio_folder, portfolio_filename)
        print("portfolio_filepath:", portfolio_filepath)

        portfolios = Portfolio.objects.filter(user=user)

        results = [{"sector": portfolio.sector, "folderName": portfolio.title, "subject": "", "content": "", "results": portfolio.result, "overall": ""} for portfolio in portfolios if portfolio.result]

        # 포트폴리오 폴더가 존재하지 않는 경우 폴더 생성
        if not os.path.exists(portfolio_folder):
            os.makedirs(portfolio_folder)

        # 포트폴리오 파일 병합
        merge_pdfs_from_folder(portfolio_folder, portfolio_filepath)

        if os.path.exists(portfolio_filepath):
            print("File exists")
            return Response({"result": results}, status=status.HTTP_200_OK)
        else:
            return Response({
                "error": "Portfolio file not found"
            }, status=status.HTTP_404_NOT_FOUND)
'''
class PortfolioMakeView(APIView):
    def get(self, request, *args, **kwargs):
        # Authorization 헤더에서 JWT 토큰 추출 및 검증
        token = request.headers.get('Authorization', None)
        if token is None:
            raise AuthenticationFailed('Authorization token not provided')

        if not token.startswith('Bearer '):
            raise AuthenticationFailed('Invalid token format')
        token = token.split('Bearer ')[1]

        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Token has expired')
        except jwt.InvalidTokenError:
            raise AuthenticationFailed('Invalid token')

        user_id = payload.get('user_id')
        if not user_id:
            raise AuthenticationFailed('Token payload invalid')

        # 사용자 정보 가져오기
        user = get_object_or_404(User, pk=user_id)
        user_name = user.nickname.lower()
        job = user.job

        sector = request.data.get('sector')
        title = request.data.get('title')

        if not sector or not title:
            return Response({"error": "Sector and title are required"}, status=status.HTTP_400_BAD_REQUEST)

        # 폴더 경로 설정 및 확인
        folder_paths = os.path.join(settings.MEDIA_ROOT, 'folders', user_name, sector, title)
        if not os.path.exists(folder_paths):
            return Response({"error": f"Folder {folder_paths} not found"}, status=status.HTTP_404_NOT_FOUND)

        # 포트폴리오 요약 및 결과 생성 (여기서는 upstage_utils의 summary 함수 사용)
        summary, result = upstage_utils.summary(folder_paths, user_name, sector, title, job)
        result = eval(result)

        portfolio_folder = os.path.join(settings.MEDIA_ROOT, 'portfolios')
        os.makedirs(portfolio_folder, exist_ok=True)

        portfolio_filepath = os.path.join(portfolio_folder, f"{user_name}_{sector}_{title}.pdf")

        # 포트폴리오 업데이트 또는 생성
        portfolio, created = Portfolio.objects.update_or_create(
            user=user,
            sector=sector,
            title=title,
            defaults={
                'summary': result.get('subject', ''),
                'pdf_file': portfolio_filepath,
                'result': str(result)
            }
        )

        response_data = {
            "sector": portfolio.sector,
            "folderName": portfolio.title,
            "subject": result.get("subject", ""),
            "content": result.get("content", ""),
            "results": result.get("results", ""),
            "overall": result.get("overall", "")
        }

        return Response(response_data, status=status.HTTP_200_OK)
'''

class UserPortfolioView(APIView):
    def get(self, request, *args, **kwargs):
        # Authorization 헤더에서 JWT 토큰 추출
        token = request.headers.get('Authorization', None)
        if token is None:
            raise AuthenticationFailed('Authorization token not provided')

        if not token.startswith('Bearer '):
            raise AuthenticationFailed('Invalid token format')
        token = token.split('Bearer ')[1]

        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Token has expired')
        except jwt.InvalidTokenError:
            raise AuthenticationFailed('Invalid token')

        user_id = payload.get('user_id')
        if not user_id:
            raise AuthenticationFailed('Token payload invalid')

        # 사용자 객체 가져오기
        user = get_object_or_404(User, pk=user_id)
        user_name = user.nickname.lower()
        portfolios = Portfolio.objects.filter(user=user)
        
        results = []
        for portfolio in portfolios:
            results.append(portfolio.result)
        #results = [portfolio.result for portfolio in portfolios if portfolio.result]
        print("userresult:", results)




        response_data = []
        print("n_result:", len(results))
        for i in range(len(results)):
            
            sector = portfolios[i].sector
            title = portfolios[i].title
            
            #result = json.loads(results[i])
            result = eval(results[i])
            print("result:", result)
            
            response_data.append({
                    "sector": sector,
                    "folderName": title,
                    "subject": result["subject"],
                    "content": result["content"],
                    "results": result["results"],
                    "overall": result["overall"]
                    })
        
        
        #print("total portfolio:", response_data)
        return Response(response_data, status=status.HTTP_200_OK)

        

            
class AskRecommendView(APIView):
    def post(self, request, *args, **kwargs):
        print("askrecommendview....")
        # Authorization 헤더에서 JWT 토큰 추출
        token = request.headers.get('Authorization', None)
        if token is None:
            raise AuthenticationFailed('Authorization token not provided')

        if not token.startswith('Bearer '):
            raise AuthenticationFailed('Invalid token format')
        token = token.split('Bearer ')[1]

        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Token has expired')
        except jwt.InvalidTokenError:
            raise AuthenticationFailed('Invalid token')

        user_id = payload.get('user_id')
        if not user_id:
            raise AuthenticationFailed('Token payload invalid')

        # 사용자 객체 가져오기
        user = get_object_or_404(User, pk=user_id)
        user_name = user.nickname.lower()

        # 사용자의 포트폴리오 데이터 가져오기
        portfolios = Portfolio.objects.filter(user=user)
        results = [portfolio.result for portfolio in portfolios if portfolio.result]

        if not results:
            return Response({"error": "No portfolio results found for this user"}, status=status.HTTP_404_NOT_FOUND)

        # 새로운 직무 추천 생성
        recommendation_msg = upstage_utils.Recommend(results)
        print("Recommendation Message:", recommendation_msg)

        # 직무 추천 정보를 저장 또는 업데이트
        recommendation, created = JobRecommendation.objects.update_or_create(
            user=user,
            defaults={'recommendation': recommendation_msg}
        )

        # 결과 반환
        return Response({"message": recommendation.recommendation}, status=status.HTTP_200_OK)

            
            
class RecommendView(APIView):
    def get(self, request, *args, **kwargs):
        print("recommendview....")
        # Authorization 헤더에서 JWT 토큰 추출
        token = request.headers.get('Authorization', None)
        if token is None:
            raise AuthenticationFailed('Authorization token not provided')

        if not token.startswith('Bearer '):
            raise AuthenticationFailed('Invalid token format')
        token = token.split('Bearer ')[1]

        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Token has expired')
        except jwt.InvalidTokenError:
            raise AuthenticationFailed('Invalid token')

        user_id = payload.get('user_id')
        if not user_id:
            raise AuthenticationFailed('Token payload invalid')

        # 사용자 객체 가져오기
        user = get_object_or_404(User, pk=user_id)
        user_name = user.nickname.lower()

        # 사용자의 포트폴리오 데이터 가져오기
        portfolios = Portfolio.objects.filter(user=user)
        results = [portfolio.result for portfolio in portfolios if portfolio.result]

        # 직무 추천 생성
        msg = upstage_utils.Recommend(results)
        print("msg:", msg)

        # 직무 추천 정보를 데이터베이스에 저장 또는 업데이트
        recommendation, created = JobRecommendation.objects.update_or_create(
            user=user,
            defaults={'recommendation': msg}
        )

        # 직무 추천 메시지 반환
        return Response({"message": recommendation.recommendation}, status=status.HTTP_200_OK)

    

class EditPortfolioView(APIView):
    def post(self, request, *args, **kwargs):
        # Authorization 헤더에서 JWT 토큰 추출
        token = request.headers.get('Authorization', None)
        if token is None:
            raise AuthenticationFailed('Authorization token not provided')

        if not token.startswith('Bearer '):
            raise AuthenticationFailed('Invalid token format')
        token = token.split('Bearer ')[1]

        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Token has expired')
        except jwt.InvalidTokenError:
            raise AuthenticationFailed('Invalid token')

        user_id = payload.get('user_id')
        if not user_id:
            raise AuthenticationFailed('Token payload invalid')

        # 사용자 객체 가져오기
        user = get_object_or_404(User, pk=user_id)

        # 요청 데이터 파싱
        portfolio_data = request.data

        for item in portfolio_data:
            sector = item.get('sector')
            folder_name = item.get('folderName')
            subject = item.get('subject')
            content = item.get('content')
            results = item.get('results')
            overall = item.get('overall')

            if not sector or not subject:
                return Response({
                    "error": "Missing 'sector' or 'subject' in the portfolio data"
                }, status=status.HTTP_400_BAD_REQUEST)



            # 기존 포트폴리오가 있는지 확인
            portfolio, created = Portfolio.objects.get_or_create(
                user=user, 
                sector=sector, 
                title=folder_name
            )

            # 포트폴리오 업데이트
            portfolio.subject = subject
            portfolio.content = content
            portfolio.result = json.dumps({
                "subject": subject,
                "content": content,
                "results": results,
                "overall": overall
            })
            print("portfolio:", portfolio)
            portfolio.save()

        return Response({"message": "Portfolio updated successfully"}, status=status.HTTP_200_OK)
    
'''
class PortfolioDownloadView(APIView):
    def get(self, request, *args, **kwargs):
        # JWT 토큰 추출 및 검증
        token = request.headers.get('Authorization', None)
        if token is None:
            raise AuthenticationFailed('Authorization token not provided')

        if not token.startswith('Bearer '):
            raise AuthenticationFailed('Invalid token format')
        token = token.split('Bearer ')[1]

        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Token has expired')
        except jwt.InvalidTokenError:
            raise AuthenticationFailed('Invalid token')

        user_id = payload.get('user_id')
        if not user_id:
            raise AuthenticationFailed('Token payload invalid')

        # 사용자 정보 가져오기
        user = get_object_or_404(User, pk=user_id)
        user_name = user.nickname
        portfolios = Portfolio.objects.filter(user=user)

        if not portfolios.exists():
            return Response({"error": "No portfolios found for this user"}, status=404)

        # PDF 파일 경로 설정
        portfolio_folder = os.path.join(settings.MEDIA_ROOT, 'portfolios')
        if not os.path.exists(portfolio_folder):
            os.makedirs(portfolio_folder)

        portfolio_filename = f"{user_name}_portfolio.pdf"
        portfolio_filepath = os.path.join(portfolio_folder, portfolio_filename)

        # PDF 파일 생성
        doc = SimpleDocTemplate(portfolio_filepath, pagesize=A4)

        # 한글 폰트 설정
        font_path = os.path.join(settings.BASE_DIR, 'fonts', 'PretendardVariable.ttf')
        bold_font_path = os.path.join(settings.BASE_DIR, 'fonts', 'Pretendard-Bold.ttf')
        pdfmetrics.registerFont(TTFont('PretendardVariable', font_path))
        pdfmetrics.registerFont(TTFont('Pretendard-Bold', bold_font_path))

        elements = []
        styles = getSampleStyleSheet()

        # 스타일 정의
        title_style = ParagraphStyle(
            name='Title',
            fontName='Pretendard-Bold',
            fontSize=14,
            spaceAfter=12,
            alignment=TA_LEFT,
        )

        sector_style = ParagraphStyle(
            name='Sector',
            fontName='Pretendard-Bold',
            fontSize=14,
            spaceAfter=6,
            alignment=TA_LEFT,
        )

        section_title_style = ParagraphStyle(
            name='SectionTitle',
            fontName='Pretendard-Bold',
            fontSize=12,
            spaceAfter=6,
            alignment=TA_LEFT,
        )

        content_style = ParagraphStyle(
            name='Content',
            fontName='PretendardVariable',
            fontSize=12,
            spaceAfter=12,
            alignment=TA_LEFT,
        )

        for portfolio in portfolios:
            result = eval(portfolio.result)

            # Sector, Title 및 구분선을 포함한 첫 번째 테이블
            data = [
                [Paragraph(portfolio.sector, sector_style)],
                ['', '']  # 빈 행 추가
            ]

            table = Table(data, colWidths=[1.5 * inch, 4.5 * inch])
            table.setStyle(TableStyle([
                ('FONTNAME', (0, 0), (-1, -1), 'PretendardVariable'),  # 기본 폰트 설정
                ('FONTSIZE', (0, 0), (-1, -1), 12),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),  # 왼쪽 정렬
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 24),  # 글자와 줄 사이의 여백 설정
                ('LINEBELOW', (0, 0), (1, 0), 0.5, colors.grey),  # Sector 아래에 가로줄 추가 및 색상 회색으로 설정
                ('SPAN', (0, 1), (1, 1)),  # 빈 행을 하나의 셀로 병합
            ]))

            elements.append(table)
            elements.append(Spacer(1, 12))

            # 포트폴리오 제목
            elements.append(Paragraph(portfolio.summary, title_style))

            # Content 섹션
            elements.append(Paragraph('Content:', section_title_style))
            elements.append(Paragraph(result['content'], content_style))

            # Results 섹션
            elements.append(Paragraph('Results:', section_title_style))
            elements.append(Paragraph(result['results'], content_style))

            # Overall 섹션
            elements.append(Paragraph('Overall:', section_title_style))
            elements.append(Paragraph(result['overall'], content_style))

            # 섹션 간격
            elements.append(Spacer(1, 24))  # 다음 포트폴리오 항목과 간격을 줌

        doc.build(elements)

        # PDF 파일 다운로드 응답
        return FileResponse(open(portfolio_filepath, 'rb'), as_attachment=True, filename=portfolio_filename)
'''

class PortfolioDownloadView(APIView):
    def get(self, request, *args, **kwargs):
        # JWT 토큰 추출 및 검증
        token = request.headers.get('Authorization', None)
        if token is None:
            raise AuthenticationFailed('Authorization token not provided')

        if not token.startswith('Bearer '):
            raise AuthenticationFailed('Invalid token format')
        token = token.split('Bearer ')[1]

        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Token has expired')
        except jwt.InvalidTokenError:
            raise AuthenticationFailed('Invalid token')

        user_id = payload.get('user_id')
        if not user_id:
            raise AuthenticationFailed('Token payload invalid')

        # 사용자 정보 가져오기
        user = get_object_or_404(User, pk=user_id)
        user_name = user.nickname
        portfolios = Portfolio.objects.filter(user=user)

        if not portfolios.exists():
            return Response({"error": "No portfolios found for this user"}, status=404)

        # PDF 파일 경로 설정
        portfolio_folder = os.path.join(settings.MEDIA_ROOT, 'portfolios')
        if not os.path.exists(portfolio_folder):
            os.makedirs(portfolio_folder)

        portfolio_filename = f"{user_name}_portfolio.pdf"
        portfolio_filepath = os.path.join(portfolio_folder, portfolio_filename)

        # PDF 파일 생성
        doc = SimpleDocTemplate(portfolio_filepath, pagesize=A4)

        # 한글 폰트 설정
        font_path = os.path.join(settings.BASE_DIR, 'fonts', 'PretendardVariable.ttf')
        bold_font_path = os.path.join(settings.BASE_DIR, 'fonts', 'Pretendard-Bold.ttf')
        pdfmetrics.registerFont(TTFont('PretendardVariable', font_path))
        pdfmetrics.registerFont(TTFont('Pretendard-Bold', bold_font_path))

        elements = []
        styles = getSampleStyleSheet()

        # 스타일 정의
        title_style = ParagraphStyle(
            name='Title',
            fontName='Pretendard-Bold',
            fontSize=13,
            spaceAfter=12,
            alignment=TA_LEFT,
        )

        sector_style = ParagraphStyle(
            name='Sector',
            fontName='Pretendard-Bold',
            fontSize=13,
            textColor=HexColor('#1C64F2'), # 파란색 글자색 설정
            spaceAfter=12,
            alignment=TA_LEFT,
        )

        section_title_style = ParagraphStyle(
            name='SectionTitle',
            fontName='Pretendard-Bold',
            fontSize=12,
            spaceAfter=12,
            alignment=TA_LEFT,
        )

        content_style = ParagraphStyle(
            name='Content',
            fontName='PretendardVariable',
            fontSize=12,
            spaceAfter=12,
            leading=15,
            alignment=TA_JUSTIFY,
        )

        def add_horizontal_line(width=450, thickness=0.5, color=colors.grey):
            """가로줄을 추가하는 함수"""
            d = Drawing(width, thickness)
            d.add(Line(0, 0, width, 0, strokeWidth=thickness, strokeColor=color))
            return d

        for portfolio in portfolios:
            result = eval(portfolio.result)

            # Sector를 텍스트로 추가
            elements.append(Paragraph(portfolio.sector, sector_style))
            
            # 가로줄 추가
            elements.append(Spacer(1, 5))

            # 포트폴리오 제목
            elements.append(Paragraph(portfolio.summary, title_style))

            # Content 섹션
            elements.append(Paragraph('Content:', section_title_style))
            elements.append(Paragraph(result['content'], content_style))
            elements.append(Spacer(1, 12))

            # Results 섹션
            elements.append(Paragraph('Results:', section_title_style))
            elements.append(Paragraph(result['results'], content_style))
            elements.append(Spacer(1, 12))

            # Overall 섹션
            elements.append(Paragraph('Overall:', section_title_style))
            elements.append(Paragraph(result['overall'], content_style))
            elements.append(add_horizontal_line())
            elements.append(Spacer(1, 24))  # 다음 포트폴리오 항목과 간격을 줌

        doc.build(elements)

        # PDF 파일 다운로드 응답
        return FileResponse(open(portfolio_filepath, 'rb'), as_attachment=True, filename=portfolio_filename)
