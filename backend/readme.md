### How to run

First setup docker.

`docker compose build`

`docker compose up -d`

Next, run init scripts for databases.

(backend-mongo-1, backend-postgres-1, backend-redis-1, backend-mysql-1)

`docker exec CONTAINERNAME bash /root/data/init.sh`

`docker exec backend-mongo-1 bash /root/data/init.sh`
`docker exec backend-postgres-1 bash /root/data/init.sh`
`docker exec backend-redis-1 bash /root/data/init.sh`
`docker exec backend-mysql-1 bash /root/data/init.sh`


To start backend:

`npm install`

`npm run dev`
or
`npm run watch`


