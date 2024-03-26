
echo "Init dabase script - Albert"

echo "Waiting for postgres to start ..."
while ! psql -c "show server_version;" -U postgres; do
    echo "Retry in 10"
    sleep 10
done

echo "postgres online"

echo "preparing data ..."
indexes=("nvda_us" "aapl_us" "akam_us" "amd_us" "amzn_us" "ibm_us" "intc_us")
index_num=1
for index in ${indexes[@]}; do
    awk -F "\r" "NR==FNR { line=\$1; next } { print \"$index_num,\" \$1 \",\\x\" line }" \
     /root/data/xgarbage.bytes /root/data/$index"_d.csv" > /root/data/pg_$index"_d.csv"
    index_num=$((index_num + 1))
done

awk -F "\r" '{ print "10," $1 ",\\xcafe" }' \
 /root/data/spx_d.csv > /root/data/pg_spx_d.csv

echo "loading data ..."

psql -f /root/data/setup.sql -U postgres
psql -f /root/data/load.sql -U postgres

echo "Probably loaded :P"
