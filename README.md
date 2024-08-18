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
 

