# PoSSG
AI 기반 포트폴리오 아카이브 서비스

## project overview

This project is designed to make portfolio easily. It uses the Upstage API to extract text, tables clearly from pdf, image files. 
The project aims to summarize various types of files
for same project, and find meaningful factors such as research result, thoughts during project, etc.


## installation method
With backend/requirements.txt,
You can install libraries for running django server code by executing following command.

```

pip install -r requirements.txt

```

## usage instructions

### Run 
You can easily run server on 8050 port by running 

```

python manage.py runserver 0.0.0.0:8050

```

### Prompt engineering
 You can modify core prompts at possg/upstage_utils.py.
 - Document summarization

```

### job + "직군 취업을 위해 포트폴리오를 작성 중입니다. "
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

```
  
 - Recommendation
   " 사용자의 이력을 바탕으로 적합한 직무와 이유를 "직무:이유" 형식으로 추천해 줘."
 

