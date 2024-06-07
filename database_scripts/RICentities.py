import csv
import json
from flows import aggregate_flows_from_csv_files
import time
import os
from typing import no_type_check_decorator
import requests
import re
import argparse
from utils import ricslug

GEOPOLHIST_FOLDER = "../../GeoPolHist"


def geolocalize_RICentities(datadir="../../data", group=False, replace=True):
    from shapely.geometry import MultiPoint
    from pyproj import Proj

    wgs84 = Proj("epsg:4326")
    with open(
        os.path.join(datadir, "RICentities.csv"), "r", encoding="UTF8"
    ) as f, open("RICentities_geoloc.csv", "w", encoding="UTF8") as of:
        entities = csv.DictReader(f)
        entities_geoloc = csv.DictWriter(of, fieldnames=entities.fieldnames)
        entities_geoloc.writeheader()
        group_entities = []
        entities_index = {}
        for entity in entities:
            if entity["wikidata"] and entity["wikidata"] != "" and entity["lat"] == "":
                req = requests.get(
                    "https://www.wikidata.org/wiki/Special:EntityData/%s.json"
                    % entity["wikidata"]
                )
                if req.status_code == 200:
                    wikidata = req.json()
                    # geoloc
                    try:
                        geoloc = wikidata["entities"][entity["wikidata"]]["claims"][
                            "P625"
                        ][0]["mainsnak"]["datavalue"]["value"]
                        lat = geoloc["latitude"]
                        lng = geoloc["longitude"]
                        entity["lat"] = lat
                        entity["lng"] = lng
                        print(
                            "ok, %s,%s,%s/%s"
                            % (entity["RICname"], entity["wikidata"], lat, lng)
                        )
                    except KeyError as e:
                        print(
                            "error,%s,%s,%s"
                            % (entity["RICname"], entity["wikidata"], e)
                        )
                    # throttle
                    time.sleep(0.6)
            if entity["type"] == "group":
                # group to be geolocalized
                group_entities.append(entity)
            entities_index[entity["RICname"]] = entity
        if group:
            for entity in group_entities:
                # decompose group
                subentities = entity["RICname"].split(" & ")
                # filter only those which has coordinates
                try:
                    geoloc_subentities = [
                        (
                            wgs84(
                                float(entities_index[s]["lng"]),
                                float(entities_index[s]["lat"]),
                                errcheck=True,
                            )
                        )
                        for s in subentities
                        if s in entities_index and entities_index[s]["lat"] != ""
                    ]
                    if len(geoloc_subentities) > 0:
                        # calculate centroid of subentities polygon
                        centroid = MultiPoint(geoloc_subentities).convex_hull.centroid
                        entity["lng"], entity["lat"] = wgs84(
                            centroid.x, centroid.y, inverse=True
                        )
                        print(
                            "ok,%s,,%s/%s from %s on %s subs"
                            % (
                                entity["RICname"],
                                entity["lat"],
                                entity["lng"],
                                len(geoloc_subentities),
                                len(subentities),
                            )
                        )
                    else:
                        print(
                            "error,%s,,%s geoloc on %s subs"
                            % (
                                entity["RICname"],
                                len(geoloc_subentities),
                                len(subentities),
                            )
                        )
                except Exception as e:
                    print(entity["RICname"])
                    print(e)
                    print(
                        [
                            (
                                float(entities_index[s]["lat"]),
                                float(entities_index[s]["lng"]),
                            )
                            for s in subentities
                            if s in entities_index and entities_index[s]["lat"] != ""
                        ]
                    )
        # write to output file
        entities_geoloc.writerows(entities_index.values())
    # replace file
    if replace:
        os.remove(os.path.join(datadir, "RICentities.csv"))
        os.rename("RICentities_geoloc.csv", os.path.join(datadir, "RICentities.csv"))


def load_GeoPolHist():
    GPH_entities_file = f"{GEOPOLHIST_FOLDER}/data/GeoPolHist_entities.csv"
    if os.path.exists(GPH_entities_file):
        with open(GPH_entities_file, "r") as f:
            GPH_entities_reader = csv.DictReader(f)
            # consume
            return list(GPH_entities_reader)
    else:
        print("Can't open GPH entities CSV file!")
        print(
            "You must retrieve GeoPolHist from http://github.com/medialab/GeoPolHist/master/data/GeoPolHist_entities.csv first and indicate path to it in the script"
        )
        exit(1)


def align_GPH_RIC_entities(apply=False):
    GPH_entities = load_GeoPolHist()

    # test RICentities Political_entities_in_time crossings
    with open("../data/RICentities.csv", "r", encoding="utf8") as o:
        RICentities = list(csv.DictReader(o))

        RICname_to_change = []
        missing_RICentities_in_GPH = []
        RIC_by_gph_code = dict(
            [(r["GPH_code"], dict(r)) for r in RICentities if r["GPH_code"] != ""]
        )
        GPH_by_gph_code = dict([(g["GPH_code"], dict(g)) for g in GPH_entities])
        for GPH_code, entity in RIC_by_gph_code.items():
            if GPH_code in GPH_by_gph_code:
                if GPH_by_gph_code[GPH_code]["GPH_name"] != entity["RICname"]:
                    RICname_to_change.append(
                        dict(
                            [("GPH_name", GPH_by_gph_code[GPH_code]["GPH_name"])]
                            + list(entity.items())
                        )
                    )
            else:
                missing_RICentities_in_GPH.append(entity)
                print(f"missing {entity['RICname']} {GPH_code}")

        print(f"GPH not in RIC: {len(GPH_by_gph_code.keys() - RIC_by_gph_code.keys())}")

        if len(RICname_to_change) > 0:
            RICname_modifications = {
                c["RICname"]: c["GPH_name"] for c in RICname_to_change
            }
            # modify groups
            existing_RICnames_groups = set(
                [r["RICname"] for r in RICentities if r["type"] == "group"]
            )
            for group in existing_RICnames_groups:
                new_group = " & ".join(
                    sorted(
                        [
                            (
                                RICname_modifications[part]
                                if part in RICname_modifications
                                else part
                            )
                            for part in group.split(" & ")
                        ]
                    )
                )
                if group != new_group:
                    RICname_modifications[group] = new_group
            # merge case management
            existing_RICnames = set([r["RICname"] for r in RICentities])
            for r in set(RICname_modifications.values()).intersection(
                existing_RICnames
            ):
                # to avoid duplicated RICentities we remove new_ricnames which already exists
                # it's a merge so on top of changing one we remove one.
                RICname_modifications[r] = None

            with open("RICname_to_modify_from_GPH.csv", "w", encoding="utf8") as f:
                output = csv.DictWriter(
                    f, fieldnames=["old_RICname", "new_RICname", "to_delete"]
                )
                output.writeheader()
                output.writerows(
                    (
                        {
                            "old_RICname": old_RICname,
                            "new_RICname": new_RICname,
                            "to_delete": new_RICname is None,
                        }
                        for old_RICname, new_RICname in RICname_modifications.items()
                    )
                )
            if apply:
                change_RICnames(RICname_modifications)


def change_RICnames(RICname_modifications):
    def _update_RICdatafile(
        filename, RICname_field, remove_dups=False, update_slugs=False
    ):
        modifications = 0
        new_lines = []
        fields = []
        with open(filename, "r", encoding="utf8") as f:
            lines = csv.DictReader(f)
            fields = list(lines.fieldnames)
            modifications = 0
            for line in lines:
                new_line = dict(line)
                keep_line = True
                if line[RICname_field] in RICname_modifications:
                    if RICname_modifications[line[RICname_field]] is not None:
                        new_line[RICname_field] = RICname_modifications[
                            line[RICname_field]
                        ]
                        if update_slugs and "slug" in line:
                            new_line["slug"] = ricslug(
                                RICname_modifications[line[RICname_field]]
                            )
                    else:
                        if remove_dups:
                            # it's a merge case => don't keep this line
                            keep_line = False
                    modifications += 1
                if keep_line:
                    new_lines.append(new_line)
        with open(filename, "w", encoding="utf8") as f:
            lines = csv.DictWriter(f, fields)
            lines.writeheader()
            lines.writerows(new_lines)
        return modifications

    # RICentities

    modified = _update_RICdatafile("../data/RICentities.csv", "RICname", True, True)
    print(f"{modified} lines modified in RICname from RICentities.csv")
    modified = _update_RICdatafile(
        "../data/RICentities.csv", "part_of_GPH_entity", True, True
    )
    print(f"{modified} lines modified in part_of_GPH_entity from RICentities.csv")
    # entity name
    modified = _update_RICdatafile("../data/entity_names.csv", "RICname")
    print(f"{modified} lines modified in entity_names.csv")
    # RICgroups
    modified = _update_RICdatafile("../data/RICentities_groups.csv", "RICname_group")
    print(f"{modified} lines modified in RICname_group RICentities_groups.csv")
    modified = _update_RICdatafile("../data/RICentities_groups.csv", "RICname_part")
    print(f"{modified} lines modified in RIcname_part RICentities_groups.csv")


def sanitize_RICentities_groups(apply=False):
    # check RIcentities group coherence
    with open("../data/RICentities.csv", "r", encoding="utf8") as r:
        RICentities = list(csv.DictReader(r))
        RICnames = [r["RICname"] for r in RICentities]
        groups_in_RICentities = {
            l["RICname"]: l for l in RICentities if l["type"] == "group"
        }
        with open("../data/RICentities_groups.csv", "r", encoding="utf8") as g:
            RICentities_groups = list(csv.DictReader(g))
            groups_IN_RICgroups = set((g["RICname_group"] for g in RICentities_groups))
            missing_groups_in_RIC_groups = (
                set(groups_in_RICentities.keys()) - groups_IN_RICgroups
            )
            deprecated_groups_in_RIC_groups = groups_IN_RICgroups - set(
                groups_in_RICentities.keys()
            )
            print(
                f"missing groups in RICentities_groups {len(missing_groups_in_RIC_groups)}/{len(groups_in_RICentities.keys())}"
            )
            print(
                f"deprecated groups in RICentities_groups {len(deprecated_groups_in_RIC_groups)}/{len(groups_IN_RICgroups)}"
            )

            missing_parts = set()
            for g in missing_groups_in_RIC_groups:
                for part in re.split(" &(?![^(]*\)) ", g):
                    if part not in RICnames:
                        missing_parts.add((g, part))
            
            if len(missing_parts) > 0:
                print(f"missing {len(missing_parts)} parts in groups. Stopping.")
                for g, p in missing_parts:
                    print(f"{p} found in '{g}'")
                exit(1)

        # reset RICentities_groups
        if apply:
            with open("../data/RICentities_groups.csv", "w", encoding="utf8") as g:
                groups = csv.DictWriter(g, ["id", "RICname_group", "RICname_part"])
                id = 0
                groups.writeheader()
                for group in groups_in_RICentities.keys():
                    for part in re.split(" &(?![^(]*\)) ", group):
                        id += 1
                        groups.writerow(
                            {"id": id, "RICname_group": group, "RICname_part": part}
                        )


def remove_unused_entity_names(apply=False):
    # aggregate flows
    flows_csv_filename = "../data/flows.csv"
    if not os.path.exists(flows_csv_filename):
        aggregate_flows_from_csv_files()
    entity_names_to_keep = []
    entity_names_fields = []
    with open(flows_csv_filename, "r") as f:
        entity_names_in_flows = set(
            (e for l in csv.DictReader(f) for e in (l["reporting"], l["partner"]))
        )
        print(f"{len(entity_names_in_flows)} entity names in flows")
        with open("../data/entity_names.csv", "r") as ent_f:
            entity_names = csv.DictReader(ent_f)
            entity_names_fields = list(entity_names.fieldnames or [])
            entity_names = list(entity_names)
            print(f"{len(entity_names)} entity names")
        entity_names_to_keep = [
            e for e in entity_names if e["original_name"] in entity_names_in_flows
        ]
        entity_names_to_delete = [
            e for e in entity_names if e["original_name"] not in entity_names_in_flows
        ]
        print(f"{len(entity_names) - len(entity_names_to_keep)} entity names to remove")
        with open("./unused_entity_names.json", "w") as f:
            json.dump(entity_names_to_delete, f, indent=2)
        if (
            apply
            and len(entity_names_to_keep) > 0
            and len(entity_names_to_keep) - len(entity_names) != 0
        ):
            with open("../data/entity_names.csv", "w") as ent_f:
                e = csv.DictWriter(ent_f, entity_names_fields)
                e.writeheader()
                e.writerows(entity_names_to_keep)


def remove_unused_RICentities(apply=False):
    # aggregate flows
    entity_name_csv_filename = "../data/entity_names.csv"
    RICentities_to_keep = []
    RICentities_fields = []
    with open(entity_name_csv_filename, "r") as f, open(
        "../data/RICentities_groups.csv", "r"
    ) as fg:
        with open("../data/RICentities.csv", "r") as ent_f:
            RICentities = csv.DictReader(ent_f)
            RICentities_fields = list(RICentities.fieldnames or [])
            RICentities = list(RICentities)
            print(f"{len(RICentities)} RICentities")
        existing_RICnames = set((e["RICname"] for e in csv.DictReader(f)))
        RICnames_in_groups = set((e["RICname_part"] for e in csv.DictReader(fg)))
        existing_RICnames.update(RICnames_in_groups)
        existing_RICnames.update(set(r["part_of_GPH_entity"] for r in RICentities))
        existing_RICnames.discard("")
        print(
            f"{len(existing_RICnames)} existing RICentities in entity_names, RICentity_groups or part_of_GPH_entity"
        )
        RICentities_to_keep = [
            e for e in RICentities if e["RICname"] in existing_RICnames
        ]
        RICentities_to_delete = [
            e for e in RICentities if e["RICname"] not in existing_RICnames
        ]
        missing_RICentities = [
            er
            for er in existing_RICnames
            if er not in set(e["RICname"] for e in RICentities)
        ]
        print(f"{len(missing_RICentities)} missing RICentity")
        print(f"{len(RICentities) - len(RICentities_to_keep)} entity names to remove")
        print()
        with open("./unused_RICentities.json", "w") as f:
            json.dump(RICentities_to_delete, f, indent=2)
        if (
            apply
            and len(RICentities_to_keep) > 0
            and len(RICentities_to_keep) - len(RICentities) != 0
        ):
            with open("../data/RICentities.csv", "w") as ent_f:
                e = csv.DictWriter(ent_f, RICentities_fields)
                e.writeheader()
                e.writerows(RICentities_to_keep)


#  TODO : argparse
# align_GPH_RIC_entities(True)
# sanitize_RICentities_groups()
# geolocalize_RICentities(datadir='../../data/', group=True, replace=False)

# MAIN: launch action from arg


ACTIONS = {
    "align_GPH_RIC_entities": align_GPH_RIC_entities,
    "remove_unused_entity_names": remove_unused_entity_names,
    "remove_unused_RICentities": remove_unused_RICentities,
    "sanitize_RICentities_groups": sanitize_RICentities_groups,
    "remove_unused_entity_names": remove_unused_entity_names,
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
    parser.add_argument("--apply", action="store_true", default=False)
    args = parser.parse_args()
    if args.action:
        ACTIONS[args.action](apply=args.apply)
