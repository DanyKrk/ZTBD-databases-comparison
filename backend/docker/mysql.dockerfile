FROM mysql

# copy data to docker
COPY data/mysql /root/data
COPY data/*.csv /root/data
COPY data/xgarbage.bytes /root/data

# set as executable
RUN chmod +x /root/data/init.sh
RUN chmod -R u+r /root/data

