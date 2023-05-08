# stoping all runing service and ports in linux

# main UI
 fuser -k -n tcp 3000

# ecommerce UI
 fuser -k -n tcp 3002

# linktree e website
 fuser -k -n tcp 3006
 fuser -k -n tcp 3008
 
# Server
 fuser -k -n tcp 4000

#windows cmd to stop port process 
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
cd web
npm run build
pm2 start npm --name "gerenciador-react-app" -- start
cd ..
cd ecoomerce-web
npm run build
pm2 start npm --name "ecommerce-web" -- start
# pm2 start npm --name "app name" -- start
cd ..
pm2 list
pm2 save
cd ..
ls -l
echo "we are now going to start the Serve side"
export PATH=$PATH:/usr/local/go/bin
echo "Go is ready"
go run cmd/*
