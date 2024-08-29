# PoSSG

### AI-powered personalized portfolio creation service

<br>

## 🖥️ project overview

`PoSSG` is designed to make portfolio easily. It uses the Upstage API to extract text, tables clearly from pdf, image files. 
The project aims to summarize various types of files for same project, and find meaningful factors such as research result, thoughts during project, etc.

<br>

![슬라이드1](https://github.com/user-attachments/assets/c1c69bd7-d163-430d-845b-8e8688f10925)
![슬라이드2](https://github.com/user-attachments/assets/54917c01-02fc-400d-a327-9d8080558b83)
![슬라이드3](https://github.com/user-attachments/assets/a384b074-eec6-4b61-96f6-d8d2950725c4)
![슬라이드4](https://github.com/user-attachments/assets/8a6d1746-a0cd-4133-a7af-6e2fcae84344)
![슬라이드5](https://github.com/user-attachments/assets/9a43ab3f-8333-4b02-b740-e5baf705d77a)
![슬라이드6](https://github.com/user-attachments/assets/f91ac5c4-53c5-4d3e-b0bf-2787dc3c438c)
![슬라이드7](https://github.com/user-attachments/assets/9fb95833-c069-43c6-9ee5-fb34936abd32)
![슬라이드8](https://github.com/user-attachments/assets/980adcb2-a224-4b03-82e1-836eabc3a2e2)
![슬라이드9](https://github.com/user-attachments/assets/95b50e67-03e7-4b50-8cf6-d0369ed268f3)
![herosection_final](https://github.com/user-attachments/assets/40d7410b-b2a4-438f-8e35-3e4bec2c4b2b)
<br>

## ⚙️ installation method
With backend/requirements.txt,
You can install libraries for running django server code by executing following command.

```

pip install -r requirements.txt

```

<br>

## 📄 usage instructions

### Run 
You can easily run server on 8050 port by running 

```

python manage.py runserver 0.0.0.0:8050

```

### Prompt engineering
 You can modify core prompts at possg/upstage_utils.py.
 - Document summarization

```

### job + "I'm currently creating a portfolio to apply for a job in my desired field. "
                            "Based on the following text, write a portfolio entry that highlights the activities undertaken and the skills developed. "
                            "Provide a concise response without using a subject. Deliver the answer in JSON format without using explanations like backticks or 'json'. \n\n"
                            
                            
                            "Example:\n"
                            
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
```
   "Recommend suitable roles based on the user's experience in the 'Job: Reason' format"
```

<br>

## 🛠️ Tech Stacks
<div>
  <img src="https://img.shields.io/badge/react-61DAFB?style=for-the-badge&logo=react&logoColor=white">
  <img src="https://img.shields.io/badge/typescript-3178C6?style=for-the-badge&logo=typescript&logoColor=white">
  <img src="https://img.shields.io/badge/django-092E20?style=for-the-badge&logo=django&logoColor=white">
</div>
<br><br><br>

## 👨‍👩‍👧‍👦 Team Member

<table>
<tbody>
<tr>
<td align="center"><img src="https://avatars.githubusercontent.com/u/80433455?v=4" width="120" /></td>
<td align="center"><img src="https://avatars.githubusercontent.com/u/52267586?v=4" width="120" /></td>
<td align="center"><img src="https://avatars.githubusercontent.com/u/127101670?v=4" width="120" /></td>
<td align="center"><img src="https://avatars.githubusercontent.com/u/128471076?v=4" width="120" /></td>
</tr>
<tr>
<th align="center">Jiheun Kim</th>
<th align="center">Hongseok Lee</th>
<th align="center">Yeeun Kim</th>
<th align="center">Myunghee Jeong</th>
</tr>
<tr>
<td align="center" width="150"><a href="https://github.com/jiheunkim">@jiheunkim</a></td>
<td align="center" width="150"><a href="https://github.com/Leehongseok-code">@Leehongseok-code</a></td>
<td align="center" width="150"><a href="https://github.com/katekim512">@katekim512</a></td>
<td align="center" width="150"><a href="https://github.com/jeongmyunghee">@jeongmyunghee</a></td>
</tr>
</tbody>
</table>

## 💡 Demo Video
[![Video Lable](http://img.youtube.com/vi/I6k5Pi3Q_Jg/0.jpg)](https://youtu.be/I6k5Pi3Q_Jg?si=4I3QFJ5D3gPAK9NF)
