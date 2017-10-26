import csvkit

with open('../../csv_data/sources.csv','r') as sf:
	sources = csvkit.DictReader(sf)
	with open('new_sources.csv', 'r') as nsf:
		new_sources = csvkit.DictReader(nsf)
		sourcesSlugs = set(s['slug'] for s in sources)
		newSourcesSlugs = set(s['slug'] for s in new_sources)
		inSourceNotInNew = sourcesSlugs - newSourcesSlugs
		inNewNotInSource = newSourcesSlugs - sourcesSlugs
		with open('sourceTroubles.csv' , 'w') as of:
			sourceTroubles = csvkit.DictWriter(of,['source','set'])
			sourceTroublesData = [{'source':s, 'set':'inSourceNotInNew'} for s in inSourceNotInNew]
			sourceTroublesData += [{'source':s, 'set':'inNewNotInSource'} for s in inNewNotInSource]
			sourceTroublesData = sorted(sourceTroublesData, key=lambda e : e['source'])
			sourceTroubles.writeheader()
			sourceTroubles.writerows(sourceTroublesData)