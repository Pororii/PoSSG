from django.shortcuts import render

# Create your views here.
from rest_framework.views import APIView
from .serializers import *
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import status
from rest_framework.response import Response
from rest_framework.exceptions import AuthenticationFailed
from django.conf import settings


class RegisterAPIView(APIView):
    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            
            # jwt 토큰 접근
            token = TokenObtainPairSerializer.get_token(user)
            refresh_token = str(token)
            access_token = str(token.access_token)
            res = Response(
                {
                    #"user": serializer.data,
                    "message": "signup successs",
                    
                },
                status=status.HTTP_200_OK,
            )
            
            # jwt 토큰 => 쿠키에 저장
            res.set_cookie("access", access_token, httponly=True)
            res.set_cookie("refresh", refresh_token, httponly=True)
            
            return res
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    
import jwt
from rest_framework.views import APIView
from .serializers import *
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer, TokenRefreshSerializer
from rest_framework import status
from rest_framework.response import Response
from django.contrib.auth import authenticate
from django.shortcuts import render, get_object_or_404
from config.settings import SECRET_KEY

class AuthAPIView(APIView):
    # 유저 정보 확인
    def get(self, request):
        try:
            # access token을 decode 해서 유저 id 추출 => 유저 식별
            access = request.COOKIES['access']
            payload = jwt.decode(access, SECRET_KEY, algorithms=['HS256'])
            pk = payload.get('user_id')
            user = get_object_or_404(User, pk=pk)
            serializer = UserSerializer(instance=user)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except(jwt.exceptions.ExpiredSignatureError):
            # 토큰 만료 시 토큰 갱신
            data = {'refresh': request.COOKIES.get('refresh', None)}
            serializer = TokenRefreshSerializer(data=data)
            if serializer.is_valid(raise_exception=True):
                access = serializer.data.get('access', None)
                refresh = serializer.data.get('refresh', None)
                payload = jwt.decode(access, SECRET_KEY, algorithms=['HS256'])
                pk = payload.get('user_id')
                user = get_object_or_404(User, pk=pk)
                serializer = UserSerializer(instance=user)
                res = Response(serializer.data, status=status.HTTP_200_OK)
                res.set_cookie('access', access)
                res.set_cookie('refresh', refresh)
                return res
            raise jwt.exceptions.InvalidTokenError

        except(jwt.exceptions.InvalidTokenError):
            # 사용 불가능한 토큰일 때
            return Response(status=status.HTTP_400_BAD_REQUEST)

    # 로그인
    def post(self, request):
    	# 유저 인증
        user = authenticate(
            email=request.data.get("email"), password=request.data.get("password")
        )
        print("User:",user)
        # 이미 회원가입 된 유저일 때
        if user is not None:
            serializer = UserSerializer(user)
            # jwt 토큰 접근
            token = TokenObtainPairSerializer.get_token(user)
            refresh_token = str(token)
            access_token = str(token.access_token)
            res = Response(
                {
                    "token": access_token,
                },
                status=status.HTTP_200_OK,
            )
            # jwt 토큰 => 쿠키에 저장
            res.set_cookie("access", access_token, httponly=True)
            res.set_cookie("refresh", refresh_token, httponly=True)
            return res
        else:
            return Response(status=status.HTTP_400_BAD_REQUEST)

    # 로그아웃
    def delete(self, request):
        # 쿠키에 저장된 토큰 삭제 => 로그아웃 처리
        response = Response({
            "message": "Logout success"
            }, status=status.HTTP_202_ACCEPTED)
        response.delete_cookie("access")
        response.delete_cookie("refresh")
        return response
 
    
# views.py
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .serializers import *

# jwt 토근 인증 확인용 뷰셋
# Header - Authorization : Bearer <발급받은토큰>
class UserViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = User.objects.all()
    serializer_class = UserSerializer
    
    
# 이메일 중복체크용 뷰
class EmailCheckView(APIView):
    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({"error": "이메일 주소를 제공해주세요."}, status=status.HTTP_400_BAD_REQUEST)
        
        # 이메일 중복 검사
        data = {"isExist": User.objects.filter(email=email).exists()}
        return Response(data, status=status.HTTP_200_OK)
    

class UserListView(APIView):
    def get(self, request):
        users = User.objects.all()
        serializer = UserInfoSerializer(users, many=True)  # 여러 객체를 직렬화하기 위해 many=True 옵션 사용
        return Response(serializer.data, status=status.HTTP_200_OK)
    

class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserInfoSerializer(request.user)
        return Response(serializer.data)
    
class LogoutView(APIView):
    def post(self, request):
        # 클라이언트에 로그아웃 요청을 성공적으로 받았다고 응답
        # 쿠키에 저장된 토큰 삭제 => 로그아웃 처리
        response = Response({
            "message": "Logout success"
            }, status=status.HTTP_202_ACCEPTED)
        response.delete_cookie("access")
        response.delete_cookie("refresh")
        return response
    
    
class UserDetailView(APIView):
    def get(self, request):
        try:
            # 헤더에서 JWT 토큰 추출
            token = request.headers.get('Authorization', None)
            if token is None:
                raise AuthenticationFailed('Authorization token not provided')

            # "Bearer " 부분을 제거하여 실제 토큰 값만 추출
            if not token.startswith('Bearer '):
                raise AuthenticationFailed('Invalid token format')
            token = token.split('Bearer ')[1]

            # 토큰 디코딩
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])

            # 페이로드에서 유저 ID 추출 및 유저 객체 조회
            user_id = payload.get('user_id')
            if not user_id:
                raise AuthenticationFailed('Token payload invalid')

            user = get_object_or_404(User, pk=user_id)

            # 사용자 정보 시리얼라이즈 및 반환
            serializer = UserSerializer(user)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except jwt.ExpiredSignatureError:
            return Response({'error': 'Token has expired'}, status=status.HTTP_401_UNAUTHORIZED)
        except jwt.PyJWTError as e:
            return Response({'error': 'Error in token decoding: ' + str(e)}, status=status.HTTP_401_UNAUTHORIZED)
        except AuthenticationFailed as e:
            return Response({'error': str(e)}, status=status.HTTP_401_UNAUTHORIZED)
        
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

class ThumbnailUploadAPIView(APIView):
    def post(self, request):
        # 파일 업로드 처리 로직

        # 성공적으로 파일 업로드가 완료되면 해당 응답 반환
        image_url = "http://35.192.203.252:8000/media/community/thumbnail/filename.jpg"
        response_data = {
            "message": "이미지가 성공적으로 업로드되었습니다.",
            "image_url": image_url
        }
        return Response(response_data, status=status.HTTP_200_OK)


class UserEditView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # 헤더에서 JWT 토큰 추출
        token = request.headers.get('Authorization', None)
        if token is None:
            raise AuthenticationFailed('Authorization token not provided')

        # "Bearer " 부분을 제거하여 실제 토큰 값만 추출
        if not token.startswith('Bearer '):
            raise AuthenticationFailed('Invalid token format')
        token = token.split('Bearer ')[1]

        # 토큰 디코딩
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        except jwt.ExpiredSignatureError:
            return Response({'error': 'Token has expired'}, status=status.HTTP_401_UNAUTHORIZED)
        except jwt.PyJWTError as e:
            return Response({'error': 'Error in token decoding: ' + str(e)}, status=status.HTTP_401_UNAUTHORIZED)

        # 페이로드에서 유저 ID 추출 및 유저 객체 조회
        user_id = payload.get('user_id')
        if not user_id:
            raise AuthenticationFailed('Token payload invalid')

        user = get_object_or_404(User, pk=user_id)

        # 요청 데이터에서 nickname과 job 추출
        nickname = request.data.get('nickname')
        job = request.data.get('job')

        # 유효성 검사
        if not nickname or not job:
            return Response({"error": "Both nickname and job are required"}, status=status.HTTP_400_BAD_REQUEST)

        # 사용자 정보 업데이트
        user.nickname = nickname
        user.job = job
        user.save()

        # 업데이트된 사용자 정보 시리얼라이즈 및 반환
        serializer = UserSerializer(user)
        return Response({"message":"edit successs"}, status=status.HTTP_200_OK)