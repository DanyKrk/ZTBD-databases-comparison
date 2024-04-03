echo "Init database script"

echo "Waiting for MySQL to start ..."
while ! mysqladmin ping -hmysql --silent; do
    echo "Retry in 10"
    sleep 10
done

echo "MySQL online"

echo "Preparing data ..."

declare -a tables=("breeds" "dogs")
index_num=1
for table in "${tables[@]}"; do
    awk -F "\r" 'NR==FNR { line=$1; next } { print "\""index_num"\",\"" $1 "\",\"" line "\"" }' \
    /root/data/xgarbage.bytes /root/data/${table}_d.csv > /root/data/mysql_${table}_d.csv
    index_num=$((index_num + 1))
done

echo "Loading data ..."

mysql -uroot -ppassword < /root/data/setup.sql
mysql -uroot -ppassword < /root/data/load.sql

echo "End"
