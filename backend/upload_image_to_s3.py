import boto3
from botocore.exceptions import NoCredentialsError
from config.my_settings import *


def upload_to_aws(local_file, bucket, s3_file):
    session = boto3.Session(
        aws_access_key_id=aws_access_key_id,
        aws_secret_access_key=aws_secret_access_key,
        region_name='us-east-2'
    )
    s3 = session.client('s3')

    try:
        s3.upload_file(local_file, bucket, s3_file)
        print("Upload Successful")
        url = f"https://{bucket}.s3.{s3.meta.region_name}.amazonaws.com/{s3_file}"
        return url
    except FileNotFoundError:
        print("The file was not found")
        return None
    except NoCredentialsError:
        print("Credentials not available")
        return None

# 로컬 파일 경로
local_file = r"C:\Users\LG\OneDrive\사진\입구.JPG"

# S3 버킷 이름과 저장할 파일 이름
bucket_name = 'possg'
s3_file_name = '입구.JPG'

# 파일을 S3에 업로드하고 URL 반환
s3_url = upload_to_aws(local_file, bucket_name, s3_file_name)
if s3_url:
    print(f'File uploaded to S3. URL: {s3_url}')
else:
    print('File upload failed.')
