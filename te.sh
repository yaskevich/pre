n=$(node -v)

if [ ${n:0:1} == "v" ]
then
	echo ok	
else
	echo "NodeJS is not installed, cancelling commit"
	exit 1
fi	

m=$(node min.js)

echo $m

if [ "$m" == "ok" ]
then
	echo "minified ok"	
else
	echo "error with minification, cancelling commit"
	exit 1
fi	

exit 0