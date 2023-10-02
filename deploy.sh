#!/bin/sh

cd ./klips-sdi
echo "Pull latest repository changes"
git stash
git pull origin main
echo "Pull latest images"
docker-compose pull
echo "Start containers" 
docker-compose up -d
