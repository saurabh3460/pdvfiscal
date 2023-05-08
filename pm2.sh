cat pm2.sh
echo "Starting the process ... "

# stoping all runing service and ports
# main UI
 fuser -k -n tcp 3000
# ecommerce UI
 fuser -k -n tcp 3002
# linktree e website
 fuser -k -n tcp 3006
 fuser -k -n tcp 3008
# Server
 fuser -k -n tcp 4000
# netstat -ano | findstr 4000
# taskkill /F /PID 
# netstat -ano | findstr 3000
# taskkill /F /PID 

#Managing pm2
# pm2 stop ecomerce-web
# pm2 stop gerenciador-react-app
# pm2 stop react-scripts
# pm2 list
# pm2 save
# pm2 delete react-scripts
# pm2 delete gerenciador-react-app
# pm2 delete ecommerce-web
pm2 stop all
pm2 delete all
pm2 list
pm2 save

echo "pm2 list is now refreshed"

#Starting Servers with new changes
# cd web
# echo "We are at Web directory to start GR UI"

cd web-admin
npm run build
pm2 start npm --name "gerenciador-react-app" -- start
cd ..
cd web-cliente
npm run build
pm2 start npm --name "ecommerce-web" -- start
# pm2 start npm --name "app name" -- start
cd ..
pm2 list
pm2 save

# pm2 start npm --name "linktree-clone-rm" -- start
# pm2 start npm --name "saas-theme" -- start
# pm2 start npm --name "gerenciador-react-app" -- start
# pm2 list
# pm2 save
# echo  "GR UI is now runing"
# cd ..

# cd ecommerce-web
# echo " We ae now at ecommerce-web directory"
# pm2 start npm --name "react-scripts" -- start
# pm2 list
# pm2 save
# echo " Ecommerce UI is now ready"
# cd ..
# git pull
# fuser -k -n tcp 4000
# echo " Ports 4000 is now stoped "

export PATH=$PATH:/usr/local/go/bin
echo "we are now going to start the Serve side"
echo "Go is ready"
go run cmd/*
#

