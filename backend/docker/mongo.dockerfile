FROM mongo

# copy data to docker
COPY data/mongo /root/data
COPY data/*.csv /root/data
COPY data/xgarbage.bytes /root/data

# set as executable
RUN chmod +x /root/data/init.sh
