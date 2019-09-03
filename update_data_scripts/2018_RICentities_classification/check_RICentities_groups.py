import csvkit


with open('../../data/RICentities.csv','r') as f:
	csv = csvkit.DictReader(f)
	RICnames = {}
	missingRICinGroup = []
	groups = []
	partofcountries = []
	for line in csv:
		if line['type'] != 'group':
			RICnames[line['RICname']] = line
		else: 
			groups.append(line['RICname'])
		partofcountries.append(line['part_of_country'])
	for g in groups:
		missingRICinGroup += [ric.strip() for ric in g.split('&') if ric.strip() not in RICnames]

	print "missing RICnames in groups"
	print "\n".join([m for m in set(missingRICinGroup)])
	print "missing RICnames in 'part_of_country'"
	print "\n".join([m for m in set(r for r in partofcountries if r not in RICnames)])