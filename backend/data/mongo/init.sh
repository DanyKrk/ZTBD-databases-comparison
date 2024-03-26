
echo "Init dabase script - Albert"

echo "Waiting for mongo to start ..."
while ! mongosh --quiet --eval 'db' ztbd; do
    echo "Retry in 10"
    sleep 10
done

echo "mongo online"

echo "preparing data ..."
indexes=("nvda_us" "aapl_us" "akam_us" "amd_us" "amzn_us" "ibm_us" "intc_us")
for index in ${indexes[@]}; do
    awk -F "\r" "NR==FNR { line=\$1; next } { print \$1 \",\" line }" \
     /root/data/xgarbage.bytes /root/data/$index"_d.csv" > /root/data/mg_$index"_d.csv"
done

awk -F "\r" "{ print \$1 \",cafe\" }" \
 /root/data/spx_d.csv > /root/data/mg_spx_d.csv

echo "loading data ..."

mongosh --quiet -u root -p example --authenticationDatabase admin -f /root/data/load.js ztbd

for index in ${indexes[@]}; do
    mongoimport --collection=$index"_data" --db='ztbd' \
     --columnsHaveTypes --fieldFile=/root/data/fields --file=/root/data/mg_$index"_d.csv" --type=csv \
     -u root -p example --authenticationDatabase=admin
done

mongoimport --collection=spx_data --db='ztbd' \
 --columnsHaveTypes --fieldFile=/root/data/fields --file=/root/data/mg_spx_d.csv --type=csv \
 -u root -p example --authenticationDatabase=admin

echo "Probably loaded :P"
