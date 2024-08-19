import os
import base64
import json
import httpx
import fitz  # PyMuPDF
import io
from PIL import Image as PILImage
import openai
from openai import OpenAI
from config.my_settings import *



# 이미지들이 담긴 여러 폴더 경로
IMAGE_FOLDER_PATHS = [
    "/home/honglee0317/possg/backend/media/folders/종설"
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
    return f"""파일 '{filename}'에 대한 핵심 요약을 300자 내외로 작성해주세요."""

def create_pdf_summary_question(filename):
    return f"""PDF 파일 '{filename}'에 포함된 이미지에 대한 핵심 요약을 300자 내외로 작성해주세요."""

def create_total_portfolio(portfolio):
    return f"""{portfolio} 위 문서는 내가 취업을 위한 활동을 하기 위해 노력한 흔적들을 나열한 것이야. 내가 취업을 위해 한 해당 활동을 유추하고, 여기서 활동 제목, 활동 내용, 활동 성과를 추출 및 추론해서 총 600자 정도로 작성해줘. """


api_key = openai_api_key

def get_response(prompt):
    client = OpenAI(
        api_key = api_key
    )

    
    response = client.chat.completions.create(
    model="gpt-4-turbo",
    messages= [ {
            "role": "user",
            "content": prompt,
        }]
    )
    
    answer = response.choices[0].message.content

    return answer

def save_to_markdown(prompt, response, filename="response.md"):
    with open(filename, "w") as file:
        file.write(f"# Prompt\n\n{prompt}\n\n")
        file.write(f"# Response\n\n{response}\n")

def save_text_as_html(response, html_file_path = 'output.html'):
    # HTML 문서 템플릿 생성
    html_file_path = 'output.html'
    html_content = response

    # HTML 파일로 저장
    with open(html_file_path, 'w', encoding='utf-8') as html_file:
        html_file.write(html_content)

import pdfkit

def make_portfolio(prompt):
    response = get_response(prompt)
    save_text_as_html(response)
    print(f"Response saved to response.md")

def convert_html_to_pdf(html_file_path, pdf_file_path):
    # HTML 파일을 PDF로 변환
    options = {
        'encoding': "UTF-8",
        'custom-header': [
            ('Accept-Encoding', 'gzip')
        ],
        'no-outline': None
    }
    pdfkit.from_file(html_file_path, pdf_file_path, options)



def main():
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
    total_portfolio = ""
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

    print("result:", portfolio)
    total_prompt = create_total_portfolio(portfolio)

    messages = []  
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

    total_portfolio = send_to_anthropic(messages)['content'][0]['text']

    print("total:", total_portfolio)



    # OpenAI API 키 설정


    prompt = f"""{portfolio} 위 문서는 내가 취업을 위한 활동을 하기 위해 노력한 흔적들을 나열한 것이야. 내가 취업을 위해 한 해당 활동을 유추하고, 여기서 활동 제목, 활동 내용, 활동 성과를 추출 및 추론해서 총 600자 정도로 작성해줘. 
    단, 표 형태로 정리해 주고, html로 작성해서 정리해 줘. 응답은 순수 html문서만이 제공되어야 해. ```html 이런 거 다 빼. """
    
    
    
    make_portfolio(prompt)
    convert_html_to_pdf('output.html', 'output.pdf')


    print(f"포트폴리오가  저장되었습니다.")
 
main()