for i in *.xlsx;
 do
  filename=$(basename "$i" .xlsx);
  outext=".csv" 
  in2csv -f xlsx -v "$i" > "$filename$outext"
done