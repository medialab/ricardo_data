from datapackage import Package
from datapackage import exceptions
import os

ROOT = '/home/paul/dev/ricardo_data'
SKIP_RESOURCES = []

p = Package(os.path.join(ROOT, 'datapackage.json'), ROOT)
if not p.valid:
    for error in p.errors:
        print(error)

for resource in p.resources:
    # print(resource.name)
    if not resource.valid:
        for error in resource.errors:
            print(error)
    try:
        print("%s relations" % resource.name)
        resource.read()
        resource.check_relations()
        # relations are kept in the resource object => memory leak
        resource.drop_relations()
    except exceptions.DataPackageException as exception:
        if exception.multiple:
            for error in exception.errors:
                print(error)
        else:
            print(exception)
