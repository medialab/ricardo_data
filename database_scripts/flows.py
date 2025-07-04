#!/usr/bin/python3
import os
import csv
import argparse
import subprocess
from desaggregate_groups_blur_ratio_method import flow_disaggregate_groups
from flows_deduplication_pipeline import deduplicate_flows
from utils import source_filename

DATAPACKAGE_ROOT_DIR = "../"

# aggregate flows from datapckage


def aggregate_flows_from_datapackage():
    from datapackage import Package

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
    with open("../data/sources.csv", "r") as sf:
        from datapackage import Package

        sources = csv.DictReader(sf)
        sources_filenames = [f"{source_filename(s)}.csv" for s in sources]

        ricardo_package = Package(
            os.path.join(DATAPACKAGE_ROOT_DIR, "datapackage.json"),
            DATAPACKAGE_ROOT_DIR,
            strict=True,
        )
        flows_resource = ricardo_package.get_resource("flows")

        for dirpath, dirnames, filenames in os.walk(
            os.path.join(DATAPACKAGE_ROOT_DIR, "data", "flows")
        ):
            filenames = list(filenames)
            missing_file_in_datapackage = [
                f
                for f in filenames
                if f"data/flows/{f}" not in flows_resource.descriptor["path"]
            ]
            missing_file_in_sources = [
                f for f in filenames if f not in sources_filenames
            ]
            deprecated_file_in_datapackage = [f for f in flows_resource.descriptor["path"] if f.split('/')[-1] not in filenames]
            print("missing in datapackage")
            print(len(missing_file_in_datapackage))
            print("missing in sources")
            print(len(missing_file_in_sources))
            print(f"missing {len(missing_file_in_datapackage)} on {len(filenames)}")
            print(f"{len(deprecated_file_in_datapackage)} deprecated file in datapackage")
            print(deprecated_file_in_datapackage)


def homogenize_partners():
    print("Disaggregate trade flows to groups")
    flow_disaggregate_groups()
    print("Aggregate trade flows to city/part of")
    cityPartOfSqlScript = "cat city_part_of.sql | sqlite3"
    subprocess.call(cityPartOfSqlScript, shell=True)


# MAIN: launch action from arg

ACTIONS = {
    "aggregate": aggregate_flows_from_csv_files,
    "aggregate_datapackage": aggregate_flows_from_datapackage,
    "deduplicate": deduplicate_flows,
    "control_flow_files": control_flow_files,
    "homogenize_partners": homogenize_partners,
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
