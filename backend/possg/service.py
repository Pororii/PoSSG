import os
import base64
import json
import httpx
import fitz  # PyMuPDF
import io
from PIL import Image as PILImage
from config.my_settings import *
# 이미지들이 담긴 여러 폴더 경로
IMAGE_FOLDER_PATHS = [
    "/home/honglee0317/possg/backend/media/folders/대외활동/ssssaa"
    # 추가 폴더 경로 계속 추가
]

# Anthropc API 키 설정
ANTHROPIC_API_KEY = antrhopic_api_key

# 이미지를 base64로 변환하는 함수
def encode_image_to_base64(file_path):
    with open(file_path, 'rb') as file:
        encoded_string = base64.b64encode(file.read()).decode('utf-8')
    return encoded_string

# PDF 파일의 이미지를 추출하여 base64로 변환하는 함수
def extract_images_from_pdf(pdf_path):
    images = []
    doc = fitz.open(pdf_path)
    num_pages = len(doc)
    
    for page_num in range(num_pages):
        page = doc.load_page(page_num)
        pix = page.get_pixmap()
        img = PILImage.frombytes("RGB", [pix.width, pix.height], pix.samples)
        img_buffer = io.BytesIO()
        img.save(img_buffer, format="PNG")
        img_buffer.seek(0)
        image_data = img_buffer.read()
        media_type = "image/png"
        encoded_image = base64.b64encode(image_data).decode("utf-8")
        images.append({
            "type": "image",
            "source": {
                "type": "base64",
                "media_type": media_type,
                "data": encoded_image
            }
        })
    
    return images

# Anthropc API에 요청 보내기
def send_to_anthropic(messages):
    headers = {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json"
    }

    data = {
        "model": "claude-3-opus-20240229",
        "max_tokens": 1024,
        "messages": messages
    }

    response = httpx.post("https://api.anthropic.com/v1/messages", headers=headers, json=data, timeout=50)
    return response.json()

# 각 이미지와 PDF에 대한 핵심 요약을 요청하는 질문 생성 (한 줄 요약)
def create_summary_question(filename):
    return f"""파일 '{filename}'에 대한 핵심 요약을 한 줄로 작성해주세요."""

def create_pdf_summary_question(filename):
    return f"""PDF 파일 '{filename}'에 포함된 이미지에 대한 핵심 요약을 한 줄로 작성해주세요."""

# 모든 폴더의 파일들에 대해 메시지 생성 및 API 요청
image_results = []

for folder_path in IMAGE_FOLDER_PATHS:
    for filename in os.listdir(folder_path):
        file_path = os.path.join(folder_path, filename)
        if os.path.isfile(file_path):  # 파일인 경우에만 처리
            messages = []  # messages 리스트 초기화
            if filename.lower().endswith(('.png', '.jpg', '.jpeg')):
                # 이미지 파일 처리
                media_type = "image/jpeg" if filename.lower().endswith(('.jpg', '.jpeg')) else "image/png"
                encoded_image = encode_image_to_base64(file_path)
                messages.append({
                    "role": "user",
                    "content": [
                        {
                            "type": "image",
                            "source": {
                                "type": "base64",
                                "media_type": media_type,
                                "data": encoded_image
                            }
                        },
                        {
                            "type": "text",
                            "text": create_summary_question(filename)
                        }
                    ]
                })
                # API 요청 보내기 및 결과 저장
                if messages:
                    result = send_to_anthropic(messages)
                    image_results.append(result)

            elif filename.lower().endswith('.pdf'):
                # PDF 파일 처리
                pdf_images = extract_images_from_pdf(file_path)
                for image in pdf_images:
                    messages.append({
                        "role": "user",
                        "content": [
                            image,
                            {
                                "type": "text",
                                "text": create_pdf_summary_question(filename)
                            }
                        ]
                    })
                    # API 요청 보내기 및 결과 저장
                    if messages:
                        result = send_to_anthropic(messages)
                        image_results.append(result)

# 결과 출력
for result in image_results:
    print(json.dumps(result, indent=2, ensure_ascii=False))

# 포트폴리오 형식으로 정리
portfolio = []

# 결과에서 텍스트 추출 및 포트폴리오 작성
for result in image_results:
    if 'content' in result:
        content = result['content']
        if isinstance(content, list):
            for item in content:
                if 'text' in item:
                    text = item['text']
                    filename = item.get('filename', "Unknown File")
                    portfolio.append(f"**{filename}**:\n{text}\n\n")
                    break  

#  마크다운 파일로 저장
portfolio_file_path = os.path.join(os.path.dirname(IMAGE_FOLDER_PATHS[0]), "portfolio.md")

with open(portfolio_file_path, "w", encoding="utf-8") as file:
    file.write("# 포트폴리오\n\n")
    for idx, entry in enumerate(portfolio, 1):
        file.write(f"{idx}. {entry}")

print(f"포트폴리오가 {portfolio_file_path}에 저장되었습니다.")
