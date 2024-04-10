
echo "Init database script"

echo "Waiting for MongoDB to start ..."
while ! mongosh --quiet --eval 'db' ztbd; do
    echo "Retry in 10"
    sleep 10
done

echo "MongoDB online"

echo "Preparing data ..."
indexes=("dogs" "breeds" "owners" "adoptions")
for index in ${indexes[@]}; do
    cp /root/data/${index}_d.csv /root/data/mg_${index}_d.csv
done

echo "Loading data ..."

mongosh --quiet -u root -p example --authenticationDatabase admin -f /root/data/load.js ztbd

for index in ${indexes[@]}; do
    mongoimport --collection=${index} --db='ztbd' \
     --type=csv --headerline --file=/root/data/mg_${index}_d.csv \
     -u root -p example --authenticationDatabase=admin
done

echo "Probably loaded :P"

