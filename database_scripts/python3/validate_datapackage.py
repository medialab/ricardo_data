from datapackage import Package
from datapackage import exceptions
import os

ROOT = '/home/pgi/dev/ricardo_data'
SKIP_RESOURCES = []

p = Package(os.path.join(ROOT, 'datapackage.json'), ROOT)
if not p.valid:
    for error in p.errors:
        print(error)
resources_outside_group = (r.name for r in p.resources if not r.group)
for resource in p.resources:
    #print(resource.name)
    if not resource.valid:
        for error in resource.errors:
            print(error)
    try:
        if resource.name in resources_outside_group:
            print("%s relations"%resource.name)
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

flows_group = p.get_group('flows')
try:
    print("flows group relations")
    flows_group.check_relations()
except exceptions.DataPackageException as exception:
    if exception.multiple:
        for error in exception.errors:
            print(error)