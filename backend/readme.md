### How to run

First setup docker.

`docker compose build`

`docker compose up -d`

Next, run init scripts for databases.

(backend-mongo-1, backend-postgres-1, backend-cassandra-1)

`docker exec CONTAINERNAME bash /root/data/init.sh`

To start backend:

`npm install`

`npm run dev`
or
`npm run watch`


