echo "Init database script"

echo "Waiting for MySQL to start ..."
while ! mysqladmin ping -hmysql --silent; do
    echo "Retry in 10"
    sleep 10
done

echo "MySQL online"

echo "Loading data ..."

mysql -uroot -ppassword --local-infile=1< /root/data/setup.sql
mysql -uroot -ppassword --local-infile=1< /root/data/load.sql

echo "End"
