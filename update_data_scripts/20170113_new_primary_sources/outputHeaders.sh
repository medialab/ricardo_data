for i in *.csv;
 do
 	echo $i
  csvstat -n "$i"
 done