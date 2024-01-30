#!/bin/sh

cd ./klips-sdi
echo "Pull latest repository changes for klips-sdi"
git stash
git pull origin main
echo "Pull latest images"
docker-compose pull
cd ../rabbitmq-worker/
echo "Pull latest repository changes for rabbitmq-worker"
git stash
git pull origin main
echo "Pull latest images"
docker-compose pull
cd ../klips-sdi
echo "Start containers" 
docker-compose down
docker-compose up -d
