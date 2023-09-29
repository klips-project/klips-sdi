#!/bin/sh

cd ./klips-sdi
echo "Pull latest repository changes"
git stash
git pull origin main
echo "Pull latest images"
docker-compose pull
cp .env.examples .env
echo "Start containers" 
docker-compose down
docker-compose up -d
