
echo "Init dabase script"

echo "Waiting for postgres to start ..."
while ! psql -c "show server_version;" -U postgres; do
    echo "Retry in 10"
    sleep 10
done

echo "postgres online"

echo "loading data ..."

psql -f /root/data/setup.sql -U postgres
psql -f /root/data/load.sql -U postgres

echo "End"
