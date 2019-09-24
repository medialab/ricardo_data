import re


# source slug generation
nonLetters = re.compile(r'\W', re.UNICODE)
source_fields_slug = lambda source : ['editor' if source['source_category'] == 'website' else 'author','name', 'country', 'volume_date', 'volume_number', 'pages']
source_fields_filename = lambda source : ['editor' if source['source_category'] == 'website' else 'author', 'name', 'country', 'volume_date', 'volume_number']    

def _generic_source_slugify(source, fields):
    slug = lambda s : ''.join([re.sub(nonLetters,'',w).capitalize() for w in s.split(' ')])
    return '_'.join(slug(source[f]) for f in fields if f in source and source[f] and slug(source[f]))

def source_slugify(source):
    return _generic_source_slugify(source, source_fields_slug(source))

def source_filename(source):
    return _generic_source_slugify(source, source_fields_filename(source))
