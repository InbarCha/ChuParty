# Final Year Project, B.Sc in Computer Science
College of Management - Academic Studies

Client: React Javascript <br/>
Server: Django (python 3.7) <br/>
DB: MongoDB 

## Django Commands
pip install Django

**start Django project:** <br/>
    django-admin startproject ChuParty_server

**start Django app (inside Django project):**<br/>
    cd {Chuparty_server directory}<br/>
    python manage.py startapp {app_name}

**When changing something in frontend:**<br/>
    cd frontend<br/>
    npm run dev

**To start server:**<br/>
    (from frontend folder)<br/>
    python .\..\manage.py runserver

## MongoDB Backup/Restore
**Backup:** <br/>
    mongodump --db chuparty_db --gzip -o C:\Users\Inbar\Desktop\Final_Year_Project\ChuPartyGit\Chuparty\DB

**Restore:** <br/>
    mongorestore --gzip --db --drop chuparty_db C:\Users\Inbar\Desktop\Final_Year_Project\ChuPartyGit\Chuparty\DB\chuparty_db
