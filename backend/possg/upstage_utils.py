import os
import requests
import openai
from bs4 import BeautifulSoup
import pdfkit

from config.my_settings import *
from openai import OpenAI
import json
from PIL import Image  # 올바르게 임포트
# OpenAI API 키 설정
openai_api_key = openai_key

# Upstage API 키 설정
upstage_api_key = upstage_api_key

aws_key = aws_key
client = OpenAI(
    api_key = openai_api_key,
)


# Upstage API를 통해 이미지에서 텍스트를 추출하는 함수
def extract_text_from_image(image_path):
    url = "https://api.upstage.ai/v1/document-ai/layout-analysis"
    headers = {"Authorization": f"Bearer {upstage_api_key}"}
    files = {"document": open(image_path, "rb")}
    data = {"ocr": True}

    response = requests.post(url, headers=headers, files=files, data=data).json()
    html_content = response.get('html', '')

    soup = BeautifulSoup(html_content, 'html.parser')
    important_tags = soup.find_all(['p', 'h1'])
    important_texts = [tag.get_text(separator=" ", strip=True) for tag in important_tags]
    important_text_content = "\n".join(important_texts)
    
    return important_text_content

# OpenAI GPT API를 사용하여 포트폴리오 내용 생성
def generate_portfolio_content(text, job=""):
    print("text:", text)
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {
                "role": "system",
                "content": "You are a professional portfolio writer."
            },
            {
                "role": "user",
                "content": (job + "직군 취업을 위해 포트폴리오를 작성 중입니다. "
                            "다음 텍스트를 바탕으로 어떤 활동을 했으며 어떤 능력을 키웠는지 강조하여 포트폴리오에 넣을 수 있는 형식으로 작성해 주세요. "
                            "주어 없이 간결하게 작성해 주세요. JSON형식의 응답을 제공하고, 백틱과 json 같은 설명은 쓰지마세요. \n\n"
                            
                            
                            "예시:\n"
                            
                            '''
                            {{{
                                "subject": "", 
                                "content": "", 
                                "results": "", 
                                "overall": "",
                            }}}
                            '''
                            "subject: 활동을 요약할 수 있는 적절한 명사 형태의 제목입니다.\n"
                            "content: 이 활동에서 무엇을 했고, 어떤 책임을 맡았으며, 어떤 성과를 거두었는지 설명합니다. 리스트 형태가 아닙니다.\n"
                            "results: 이 활동을 통해 무엇을 배웠고, 어떤 능력을 키웠는지 설명합니다.\n\n"
                            "overall: 종합적인 활동 내용을 적는 부분입니다.\n\n"
                            "다음은 문서에서 추출한 텍스트입니다:\n\n"
                            "답은 리스트가 아닌 json으로 나와야 합니다. 모든 정보를 읽고 하나의 json으로 압축하세요." 
                            "모든 응답은 영어로 작성하세요.\n"
                            
                            + text
                            )
            }
        ],
        max_tokens=1020,
        n=1,
        stop=None,
        temperature=0.7,
    )
    answer = response.choices[0].message.content.strip() 
    print("answer:", type(answer))
    #parsed_answer = json.loads(answer)
    #print("type:", type(parsed_answer))
    return answer

# OpenAI GPT API를 사용하여 포트폴리오 내용 생성
def generate_job_recommendation(text, job=""):
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {
                "role": "system",
                "content": "You are a professional portfolio writer."
            },
            {
                "role": "user",
                "content": (job + "직군 취업을 위해 포트폴리오를 작성 중입니다. "
                            
                            + text
                            )
            }
        ],
        max_tokens=1020,
        n=1,
        stop=None,
        temperature=0.7,
    )
    answer = response.choices[0].message.content.strip() 
    print("answer:", type(answer))
    #parsed_answer = json.loads(answer)
    #print("type:", type(parsed_answer))
    return answer



# HTML 텍스트를 저장하고 PDF로 변환하는 함수
def save_text_as_html(response, html_file_path='output.html'):
    html_content = response
    head_index = html_content.find('<head>')

    if head_index == -1:
        html_content = '<html><head><meta charset="UTF-8"></head>' + html_content
    else:
        head_index += len('<head>')
        html_content = html_content[:head_index] + '<meta charset="UTF-8">' + html_content[head_index:]
    
    with open(html_file_path, 'w', encoding='utf-8') as html_file:
        html_file.write(html_content)


def convert_html_to_pdf(html_file_path, pdf_file_path):
    options = {
        'encoding': "UTF-8",
        'custom-header': [
            ('Accept-Encoding', 'gzip')
        ],
        'no-outline': None
    }
    pdfkit.from_file(html_file_path, pdf_file_path, options)

# 전체 요약 및 포트폴리오 생성 함수
def summary(IMAGE_FOLDER_PATHS, user_name, sector, title, job):
    portfolio_contents = []
    folder_path = IMAGE_FOLDER_PATHS
    #for folder_path in (IMAGE_FOLDER_PATHS + "/"):
    print("folder:", folder_path)
    print(os.listdir(folder_path))
    for filename in os.listdir(folder_path):
        print("file:", filename)
        file_path = os.path.join(folder_path, filename)
        if os.path.isfile(file_path) and filename.lower().endswith(('.png', '.jpg', '.jpeg')):
            extracted_text = extract_text_from_image(file_path)
            portfolio_content = generate_portfolio_content(extracted_text, job)
            portfolio_contents.append(portfolio_content)
            print(f"Processed {filename}:\n{portfolio_content}\n")
    print("pp:", portfolio_content)
    result = generate_portfolio_content(str(portfolio_contents), job)

    
    total_portfolio = result
    # Save the portfolio content to HTML and convert to PDF
    #save_text_as_html(total_portfolio)
    #output_path = f"/home/honglee0317/upstage/backend/media/folders/portfolio/{user_name}_{sector}_{title}.pdf"
    #convert_html_to_pdf('output.html', output_path)
    
    #print(f"포트폴리오가 {output_path}에 저장되었습니다.")


    # 요약 생성
    summary_prompt = f"""다음 문서를 한 문장으로 요약하되, 'OO을 OO~한 프로젝트.'의 형식으로 끝나게 해 줘. '네 알겠습니다'와 같은 불필요한 말은 답변에서 제외해 줘. ex)Style Transfer룰 활용한 음원 추출 프로젝트. '{total_portfolio}'"""
    summary = generate_portfolio_content(summary_prompt, job)
    
    return summary, result




def Recommend(sentence):
    prompt = f"""다음 제공하는 사용자의 이력을 바탕으로 적합한 직무와 이유를 "직무:이유" 형식으로 추천해 줘. '네 알겠습니다'와 같은 불필요한 말은 답변에서 제외해 줘. '직무:, 이유:'라는 키값은 한글로 적고 나머지 답변을 반드시 영어로 제공해 줘. 전체를 통틀어서 하나의 직무와 이유만 출력해 줘.'{sentence}'"""
    result = generate_job_recommendation(prompt)
    return result

def is_valid_image_url(url):
    try:
        response = requests.get(url, stream=True)
        response.raise_for_status()

        # Content-Type이 이미지인 경우에만 유효한 이미지 URL로 판단
        if 'image' not in response.headers.get('Content-Type', ''):
            return False

        # 이미지 파일을 메모리에 로드하여 열기
        image_data = BytesIO(response.content)
        image = Image.open(image_data)

        # 이미지를 검증하기 위해 load() 호출 (이미지가 깨졌다면 이 과정에서 예외 발생)
        image.verify()

        # 이미지 파일이 비어있는지 확인
        if image.size == (0, 0):
            return False

        return True

    except (requests.exceptions.RequestException, Image.UnidentifiedImageError) as e:
        print(f"Error occurred: {e}")
        return False