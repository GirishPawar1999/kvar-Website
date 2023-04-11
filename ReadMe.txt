====Server miles web commands====
1.to copy the env file
cp ~/kvar_website/.env ~/kvar_website_g/.env
2.copy the directory
cp -R ~/kvar_website/public/imgs/* ~/kvar_website_g/public/img/
3. to make directory
mkdir

==after changes on to local host
1. git add .
2. git commit -m "message"
3. git push

==Server End
1.pull to server 
2.pm2 stop app
3.git pull origin main
4.copy the env file 
5.go to folder & pm2 start app.js

**when ever doing any changes add the non usable files to .git ignore  

yash ===

Points to remember in server:
A) Mongodb
1) If mongodb sevice gives error after server restart try this commands:
   - chown mongod:mongod /tmp/mongodb-27017.sock
2) mongodb configuration file is stored in /etc/mongod.conf
3) mongodb lock file is located at /var/lib/mongo/mongod.lock
4) mongodb log file is located at /var/log/mongodb/mongod.log
5) port number is 27017
6) to start mongodb service - systemctl start mongod
7) to view/edit databases - mongo

B) file location for kvar website - from root(~) cd kvar_website

C) To start server - go to location then - pm2 start app.js

D) nginx config file in /etc/nginx/nginx.conf

E) To edit a file use command vi->in vi press i to edit,:wq to save 
   and exit,:q to exit

F) To renew lets encrypt certificate - certbot --force-renewal -d www.kvartech.in,kvartech.in

G) Let encrypt SSL certificate set to auto renew every month using cron job
  ,use following command to edit the cron jon: crontab -e