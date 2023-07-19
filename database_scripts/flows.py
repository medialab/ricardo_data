#!/usr/bin/python3
import os
import json
from datapackage import Package, exceptions as datapackage_exceptions
import csv
import argparse
from flows_deduplication_pipeline import deduplicate_flows


DATAPACKAGE_ROOT_DIR = "../"

# aggregate flows from datapckage


def aggregate_flows_from_datapackage():
    ricardo_package = Package(
        os.path.join(DATAPACKAGE_ROOT_DIR, "datapackage.json"),
        DATAPACKAGE_ROOT_DIR,
        strict=True,
    )
    flows_resource = ricardo_package.get_resource("flows")
    # data validation should be done elsewhere
    flows = flows_resource.iter(keyed=True, cast=False)
    flows_headers = [f["name"] for f in flows_resource.descriptor["schema"]["fields"]]
    with open(
        os.path.join(DATAPACKAGE_ROOT_DIR, "data", "flows.csv"), "w", encoding="utf8"
    ) as flows_f:
        flows_csv = csv.DictWriter(flows_f, fieldnames=flows_headers)
        flows_csv.writerows(flows)


# aggregate flows from csv files


def aggregate_flows_from_csv_files():
    with open(
        os.path.join(DATAPACKAGE_ROOT_DIR, "data", "flows.csv"), "w", encoding="utf8"
    ) as flow_one_f:
        headers_wrote = False
        for path, dirs, flow_files in os.walk(
            os.path.join(DATAPACKAGE_ROOT_DIR, "data", "flows")
        ):
            for flow_file in flow_files:
                with open(os.path.join(path, flow_file), "r", encoding="utf8") as f:
                    if headers_wrote:
                        # remove headers
                        f.readline()
                    data = f.read()
                    # missing last one newline
                    if len(data) > 0 and data[-1] != "\n":
                        data += "\n"
                    flow_one_f.write(data)
                    headers_wrote = True


# control flows file are in datapackage


def control_flow_files():
    ricardo_package = Package(
        os.path.join(DATAPACKAGE_ROOT_DIR, "datapackage.json"),
        DATAPACKAGE_ROOT_DIR,
        strict=True,
    )
    flows_resource = ricardo_package.get_resource("flows")

    for dirpath, dirnames, filenames in os.walk(
        os.path.join(DATAPACKAGE_ROOT_DIR, "data", "flows")
    ):
        missing_file_in_datapackage = [
            f
            for f in filenames
            if f"data/flows/{f}" not in flows_resource.descriptor["path"]
        ]
        print(missing_file_in_datapackage)
        print(f"missing {len(missing_file_in_datapackage)} on {len(filenames)}")


# MAIN: launch action from arg

ACTIONS = {
    "aggregate": aggregate_flows_from_csv_files,
    "aggregate_datapackage": aggregate_flows_from_datapackage,
    "deduplicate": deduplicate_flows,
    "control_flow_files": control_flow_files,
}

if __name__ == "__main__":
    # Create the parser and add arguments
    parser = argparse.ArgumentParser()
    # method
    parser.add_argument(
        dest="action",
        type=str,
        help="Which action to perform on flows",
        choices=ACTIONS.keys(),
    )
    # flag ex : parser.add_argument('aggregate', action="store_true", default=False)
    args = parser.parse_args()
    if args.action:
        ACTIONS[args.action]()
