cd /home/golosbot/habreplicator
while true
do
	echo start node $(date)
	node --trace-warnings --trace-deprecation . -v broadcast
	echo killed $(date)	
	sleep 1800
done
