git log --pretty=format:'%H' 5888a42^..HEAD -- ./data/flows/GowaJRHicks20132017.csv > hicks_commits_to_merge.csv
minet fetch --url-template 'https://raw.githubusercontent.com/medialab/ricardo_data/{value}/data/flows/GowaJRHicks20132017.csv' --filename-template '{line["hash"]}.csv' hash ./hicks_commits_to_merge.csv
xsv cat rows content/* > ./GowaJRHicks20132017.csv