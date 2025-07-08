# python script to build sqlite for visualization
# coding=utf8
import subprocess
import sqlite3
import os
import json
import itertools
import utils
import re
import custom_exports
import shutil


def deduplicate_flows():
    try:
        with open("config.json", "r") as f_conf:
            conf = json.load(f_conf)
            database_filename = os.path.join("../sqlite_data", conf["sqlite_viz"])
    except:
        print("couldn't load config.json database")
        exit(1)

    try:
        if os.path.isfile(database_filename):
            os.remove(database_filename)
    except:
        print("couldn't delete target sqlite database file")
        exit(1)

    print("building sqlite database from CSV")
    utils.csv2sqlite("../data/*.csv", database_filename, conf["sqlite_schema"])

    conn = sqlite3.connect(database_filename)
    c = conn.cursor()

    ################################################################################
    # UPDATE OR CREATE RICentities slug
    ################################################################################
    ricnames = c.execute("""SELECT RICname FROM RICentities""")
    newricslugs = [(utils.ricslug(ricname[0]), ricname[0]) for ricname in ricnames]
    c.executemany("""UPDATE RICentities SET slug = ? WHERE RICname = ? """, newricslugs)

    ################################################################################
    # Update every table with uniformed attributes
    # ################################################################################
    # c.execute("""UPDATE flows SET source= UPPER(SUBSTR(source, 1, 1)) || SUBSTR(source, 2) """)
    # c.execute("""UPDATE sources SET slug = UPPER(SUBSTR(slug, 1, 1)) || SUBSTR(slug, 2) """)
    # c.execute("""UPDATE exchange_rates SET source= UPPER(SUBSTR(source, 1, 1)) || SUBSTR(source, 2) """)

    ################################################################################
    # Remove dup in entities_name table
    ################################################################################
    # c.execute("""delete from entity_names
    # 	   		 where original_name in ("Dutch new Guinea","Ionian islands","United states");
    # 			""")
    ################################################################################
    # Create table flow_joined
    ################################################################################

    print("Create table flow_joined")
    print("-------------------------------------------------------------------------")

    c.execute("""DROP TABLE IF EXISTS flow_joined;""")
    c.execute(
        """CREATE TABLE IF NOT EXISTS flow_joined AS
        SELECT f.id, f.source, s.type, f.flow, f.year,
            f.unit as unit,
            eisg.modified_export_import as expimp,
            eisg.modified_special_general as spegen,
            rate.rate_to_pounds as rate,
            c.modified_currency as currency,
            r1.RICname as reporting,
            f.reporting as original_reporting,
            r2.slug as reporting_slug,
            CASE
                WHEN p2.RICname="World" and world_trade_type="total_estimated" THEN "Worldestimated"
                WHEN p2.RICname="World" and world_trade_type="total_reporting" THEN "Worldasreported"
                WHEN p2.RICname="World" and world_trade_type="total_subreporting" THEN "Worldasreported2"
                WHEN p2.RICname="World" and world_trade_type is null THEN "Worldundefined"
                ELSE p2.slug
            END as partner_slug,
            CASE
                WHEN p2.RICname="World" and world_trade_type="total_estimated" THEN "World estimated"
                WHEN p2.RICname="World" and world_trade_type="total_reporting" THEN "World as reported"
                WHEN p2.RICname="World" and world_trade_type="total_subreporting" THEN "World as reported2"
                WHEN p2.RICname="World" and world_trade_type is null THEN "World undefined"
                ELSE p2.RICname
            END as partner,
            f.partner as original_partner,
            r2.type as reporting_type,
            r2.continent as reporting_continent,
            r2.parent_entity as reporting_parent_entity,
            r2.GPH_code as reporting_GPH_code,
            p2.type as partner_type,
            p2.continent as partner_continent,
            p2.parent_entity as partner_parent_entity,
            p2.GPH_code as partner_GPH_code,
            transport_type,
            f.notes,
            species_bullions,
            ifnull(s.author,s.name) || ifnull(' ('||s.edition_date||')','') as source_label,
            partner_sum,
            world_trade_type,
            statistical_period
            from flows as f
            LEFT OUTER JOIN currencies as c
                ON f.currency=c.currency
                    AND f.year=c.year
                    AND f.reporting = c.reporting
            LEFT OUTER JOIN exchange_rates as rate
                ON c.modified_currency=rate.modified_currency
                    AND c.year=rate.year
            LEFT OUTER JOIN entity_names as r1
                    ON r1.original_name=f.reporting COLLATE NOCASE
            LEFT OUTER JOIN entity_names as p1
                    ON p1.original_name=f.partner COLLATE NOCASE
            LEFT OUTER JOIN RICentities as p2
                    ON p2.RICname=p1.RICname
            LEFT OUTER JOIN RICentities as r2
                    ON r2.RICname=r1.RICname
            LEFT OUTER JOIN expimp_spegen as eisg
                    ON f.export_import IS eisg.export_import AND f.special_general IS eisg.special_general
            LEFT OUTER JOIN sources as s
                    ON s.slug=f.source
            WHERE expimp != "Re-exp"
                and partner is not null
                and partner != "***NA"
                and partner_sum is null
                and f.flow is not null
                and NOT(r1.RICname = "French Equatorial Africa" and f.source IN ("StatisticalAbstractForThePrincipalAndOtherForeignCountries_19071918", "StatisticalAbstractForThePrincipalAndOtherForeignCountries_19071918"))
                and NOT(f.source="GowaJRHicks20132017" and f.partner = "british south africa (union)")
                and NOT(f.source="AnuarioEstadísticoDeChileComercioExterior_1933_250" and f.partner= "islas holandesas")
        """
        # duplicated source, removing english source in favor of the french one
        # duplications linked to unclear entities
    )

    print("flow_joined created")
    print("-------------------------------------------------------------------------")

    # taking care of Total_type flag to define the world partner
    # and ((`Total Trade Estimation` is null and partner != "World" )or(`Total Trade Estimation`=1 and partner = "World"))

    c.execute(
        """INSERT INTO RICentities (`RICname`,`type`,`continent`, `slug`)
        VALUES ("World estimated","geographical_area","World", "Worldestimated")"""
    )

    print("World estimated added to RICentities")

    c.execute(
        """INSERT INTO RICentities (`RICname`,`type`,`continent`, `slug`)
        VALUES ("World as reported","geographical_area","World", "Worldasreported")"""
    )

    print("World as reported added to RICentities")

    c.execute(
        """INSERT INTO RICentities (`RICname`,`type`,`continent`, `slug`)
        VALUES ("World as reported2","geographical_area","World", "Worldasreported2")"""
    )

    print("World as reported2 added to RICentities")

    c.execute(
        """INSERT INTO RICentities (`RICname`,`type`,`continent`, `slug`)
        VALUES ("World undefined","geographical_area","World", "Worldundefined")"""
    )

    print("World undefined added to RICentities")
    print("-------------------------------------------------------------------------")

    ################################################################################
    # remove duplicates from double source primary and secondary
    ################################################################################
    # Y a t'il pour une même année deux sources primaires et secondaires pour un même reporting
    # Si oui il faut supprimer les flux de la source secondaire pour ce reporting pour cette année

    print(
        "Filtering duplicated sources which describes same reportings on same years..."
    )
    # the first query gets all sources duplications by reporting and year
    # but duplications on total (World%) trade

    c.execute(
        """
    SELECT reporting, year, group_concat(DISTINCT type)
    from flow_joined
    WHERE partner not LIKE 'World%' AND type != 'FedericoTena'
    GROUP by reporting, year
    HAVING count(DISTINCT source) >1 and count(DISTINCT type) > 1
    """
    )

    sub_c = conn.cursor()
    primarysecondaryestimation_duplicates = {}
    for reporting, year, gtypes in c:
        types = sorted(gtypes.split(","))
        removed = False
        # when a primary_yearbook source cooccurres with a primary
        if "primary_yearbook" in types and "primary" in types:
            # remove the secondary
            sub_c.execute(
                """DELETE FROM flow_joined WHERE type='primary_yearbook' AND reporting=? AND year=?""",
                (reporting, year),
            )
            removed = True
            if reporting in primarysecondaryestimation_duplicates:
                primarysecondaryestimation_duplicates[reporting].append(
                    (year, sub_c.rowcount, "primary_yearbook")
                )
            else:
                primarysecondaryestimation_duplicates[reporting] = [
                    (year, sub_c.rowcount, "primary_yearbook")
                ]
        # when a secondary source cooccurres with a primary
        if "secondary" in types and ("primary_yearbook" in types or "primary" in types):
            # remove the secondary
            sub_c.execute(
                """DELETE FROM flow_joined WHERE type='secondary' AND reporting=? AND year=?""",
                (reporting, year),
            )
            removed = True
            if reporting in primarysecondaryestimation_duplicates:
                primarysecondaryestimation_duplicates[reporting].append(
                    (year, sub_c.rowcount, "secondary")
                )
            else:
                primarysecondaryestimation_duplicates[reporting] = [
                    (year, sub_c.rowcount, "secondary")
                ]
        # when an estimation source cooccurres with a primary
        if "estimation" in types and (
            "secondary" in types or "primary_yearbook" in types or "primary" in types
        ):
            # remove the estimation
            sub_c.execute(
                """DELETE FROM flow_joined WHERE type='estimation' AND partner!='World estimated' AND reporting=? AND year=?""",
                (reporting, year),
            )
            removed = True
            if reporting in primarysecondaryestimation_duplicates:
                primarysecondaryestimation_duplicates[reporting].append(
                    (year, sub_c.rowcount, "estimation")
                )
            else:
                primarysecondaryestimation_duplicates[reporting] = [
                    (year, sub_c.rowcount, "estimation")
                ]
        if not removed:
            print("/!\ duplicates on more types %s %s %s" % (types, reporting, year))
    # logging what was done
    for reporting, years in primarysecondaryestimation_duplicates.items():
        for type in ["primary_yearbook", "secondary", "estimation"]:
            nb_flows_dups = sum(n for (y, n, t) in years if t == type)
            years_dups = (y for (y, n, t) in years if t == type)
            years_dups = ",".join(
                "-".join(str(e) for e in p)
                for p in custom_exports.reduce_years_list_into_periods(years_dups)
            )
            if nb_flows_dups > 0:
                print(
                    "%s: %s %s flows %s" % (reporting, nb_flows_dups, type, years_dups)
                )

    # this second query gets duplicated 'World as reported' flows due to
    # different sources for the same reportingg / year.
    # Those are not targeted by the first select because some secondary sources only reports total trade.

    print(
        "\nFiltering duplicated sources which describes 'World as reported' for same reportings on same years..."
    )

    c.execute(
        """
    SELECT reporting, year, group_concat(DISTINCT type)
    from flow_joined
    WHERE partner = 'World as reported'
    GROUP by reporting, year
    HAVING count(DISTINCT source) >1 and count(DISTINCT type) > 1"""
    )
    sub_c = conn.cursor()
    primarysecondaryestimation_duplicates = {}
    for reporting, year, gtypes in c:
        types = sorted(gtypes.split(","))
        removed = False
        if "primary_yearbook" in types and "primary" in types:
            # remove the secondary
            sub_c.execute(
                """DELETE FROM flow_joined WHERE type='primary_yearbook' AND partner = 'World as reported' AND reporting=? AND year=?""",
                (reporting, year),
            )
            removed = True
            if reporting in primarysecondaryestimation_duplicates:
                primarysecondaryestimation_duplicates[reporting].append(
                    (year, sub_c.rowcount, "primary_yearbook")
                )
            else:
                primarysecondaryestimation_duplicates[reporting] = [
                    (year, sub_c.rowcount, "primary_yearbook")
                ]
        # when a secondary source cooccurres with a primary or primary_yearbook
        if "secondary" in types and ("primary_yearbook" in types or "primary" in types):
            # remove the secondary
            sub_c.execute(
                """DELETE FROM flow_joined WHERE type='secondary' AND partner = 'World as reported' AND reporting=? AND year=?""",
                (reporting, year),
            )
            removed = True
            if reporting in primarysecondaryestimation_duplicates:
                primarysecondaryestimation_duplicates[reporting].append(
                    (year, sub_c.rowcount, "secondary")
                )
            else:
                primarysecondaryestimation_duplicates[reporting] = [
                    (year, sub_c.rowcount, "secondary")
                ]
        # when an estimation source cooccurres with a primary
        if "estimation" in types and (
            "secondary" in types or "primary_yearbook" in types or "primary" in types
        ):
            # remove the estimation
            sub_c.execute(
                """DELETE FROM flow_joined WHERE type='estimation' AND partner = 'World as reported' AND reporting=? AND year=?""",
                (reporting, year),
            )
            removed = True
            if reporting in primarysecondaryestimation_duplicates:
                primarysecondaryestimation_duplicates[reporting].append(
                    (year, sub_c.rowcount, "estimation")
                )
            else:
                primarysecondaryestimation_duplicates[reporting] = [
                    (year, sub_c.rowcount, "estimation")
                ]
        if not removed:
            print("/!\ duplicates on more types %s %s %s" % (types, reporting, year))
    # logging what was done
    for reporting, years in primarysecondaryestimation_duplicates.items():
        for type in ["primary_yearbook", "secondary", "estimation"]:
            nb_flows_dups = sum(n for (y, n, t) in years if t == type)
            years_dups = (y for (y, n, t) in years if t == type)
            years_dups = ",".join(
                "-".join(str(e) for e in p)
                for p in custom_exports.reduce_years_list_into_periods(years_dups)
            )
            if nb_flows_dups > 0:
                print(
                    "%s: %s %s World as reported flows %s"
                    % (reporting, nb_flows_dups, type, years_dups)
                )

    sub_c.close()

    ################################################################################
    # merge duplicates from land and sea
    ################################################################################

    c.execute(
        """SELECT count(*) as nb,group_concat(`flow`,'|'),group_concat(ID,'|'),
        group_concat(transport_type,'|')
        FROM `flow_joined`
        WHERE transport_type is not null
        GROUP BY year, expimp, reporting, partner HAVING count(*)>1
        """
    )
    sub_c = conn.cursor()
    rows_grouped = 0
    for n, flows, ids, land_seas in c:
        land_sea = ", ".join(set(land_seas.split("|")))
        if len(set(land_seas.split("|"))) > 1:
            # if notes :
            # 	notes=", ".join(set(notes.split("|")))
            sub_c.execute(
                """UPDATE `flow_joined` SET flow=%.1f,transport_type="%s"
                WHERE ID=%s"""
                % (
                    sum(float(_) for _ in flows.split("|")),
                    land_sea,
                    ids.split("|")[0],
                )
            )
            sub_c.execute(
                """DELETE FROM `flow_joined` WHERE ID IN (%s)"""
                % ",".join(ids.split("|")[1:])
            )
            rows_grouped += n
    if rows_grouped > 0:
        print("removing %s land/seas duplicates by suming them" % rows_grouped)
    sub_c.close()
    print("merge duplicates from land and sea done")
    print("-------------------------------------------------------------------------")
    ################################################################################
    # remove 'valeurs officielles' when duplicates with 'Valeurs actuelles'
    # for France between 1847 and 1856 both included
    ################################################################################

    c.execute(
        """SELECT count(*) as nb,group_concat(notes,'|'),group_concat(ID,'|'),
        group_concat(Source,'|') as notes_group
        FROM `flow_joined`
        WHERE `reporting`="France"
            and year >= 1847 AND year <= 1856
            GROUP BY year,expimp,reporting,partner HAVING count(*)>1
        """
    )

    ids_to_remove = []
    for n, notes, ids, sources in c:
        if n == 2 and notes:
            i = notes.split("|").index("Valeur officielle")
            id = ids.split("|")[i]
            # print(sources.split("|")[i].encode("UTF8"))
            if (
                sources.split("|")[i]
                == """TableauDécennalDuCommerceDeLaFranceAvecSesColoniesEtLesPuissancesÉtrangères_18471856_Vol1"""
            ):
                ids_to_remove.append(id)
            else:
                raise Exception("missing source Tableau décennal")
        # else:
        # 	raise Exception("exception --->  ", n)
    if len(ids_to_remove) > 0:
        print(
            "removing %s 'Valeur officielle' noted duplicates for France between 1847 1856"
            % len(ids_to_remove)
        )
        c.execute("DELETE FROM flow_joined WHERE id IN (%s)" % ",".join(ids_to_remove))

    print("remove 'valeurs officielles' when duplicates with 'Valeurs actuelles' done")
    print("-------------------------------------------------------------------------")
    ################################################################################
    # remove "species and billions" remove species flows when exists
    ################################################################################

    c.execute(
        """SELECT count(*) as nb,
        group_concat(species_bullions,'|') as sb, group_concat(ID,'|'),
        reporting, partner
        FROM `flow_joined`
        WHERE species_bullions IN ('S', 'NS')
        GROUP BY year,expimp,reporting,partner HAVING count(*)>1 AND (sb="NS|S" or sb="S|NS")
        """
    )
    ids_to_remove = []
    rps = []
    for n, sb, ids, r, p in c:
        if n == 2:
            i = sb.split("|").index("S")
            id = ids.split("|")[i]
            ids_to_remove.append(id)
            rps.append('"%s"' % "|".join((r, p)))
    rps = set(rps)

    if len(ids_to_remove) > 0:
        print(
            """removing %s flows S duplicated with NS for reporting|partner 
        couples %s"""
            % (len(ids_to_remove), ",".join(rps))
        )
        c.execute(
            "DELETE FROM flow_joined WHERE id IN (%s)" % (",".join(ids_to_remove))
        )

    print("remove duplicates from double source primary and secondary")
    print("-------------------------------------------------------------------------")

    ################################################################################
    # remove GEN flows when duplicates with SPE flows
    ################################################################################

    c.execute(
        """SELECT count(*) as nb, group_concat(spegen,'|'),
        group_concat(species_bullions,'|') as sb, group_concat(ID,'|'),
        reporting, partner, year, expimp, group_concat(flow,'|')
        FROM `flow_joined`
        GROUP BY year,`expimp`,`reporting`,`partner` HAVING count(*)>1
        """
    )
    lines = c.fetchall()
    ids_to_remove = {}
    gen_remove = 0
    for n, spe_gens, sb, ids, reporting, partner, year, e_i, f in lines:
        local_ids_to_remove = []
        dup_found = True
        if spe_gens and "Gen" in spe_gens.split("|") and "Spe" in spe_gens.split("|"):
            spe_indeces = [k for k, v in enumerate(spe_gens.split("|")) if v == "Spe"]
            if len(spe_indeces) > 1 and sb != None:
                # if we have more than 1 Spe as dups
                speNS_indeces = [
                    k
                    for k, v in enumerate(sb.split("|"))
                    if v == "NS" and k in spe_indeces
                ]
                if len(speNS_indeces) > 1:
                    # if we have more than 1 NS in Spe dups
                    dup_found = False
                elif (
                    len(ids.split("|")) == len(sb.split("|")) and len(speNS_indeces) > 1
                ):
                    # keep only the Spe & NS flow when duplicate and if no nulls in sb
                    # otherwise we can't figure out which ID to remove
                    local_ids_to_remove = [
                        v for k, v in enumerate(ids.split("|")) if k != speNS_indeces[0]
                    ]
                else:
                    dup_found = False
            elif len(ids.split("|")) == len(spe_gens.split("|")):
                # remove the Gen flows which dups with one Spe flow and if no nulls in
                # spe_gens other wise we can't figure out which ID to remove
                local_ids_to_remove = [
                    v for k, v in enumerate(ids.split("|")) if k != spe_indeces[0]
                ]
            else:
                dup_found = False
            if len(local_ids_to_remove) > 0:
                if reporting in ids_to_remove.keys():
                    ids_to_remove[reporting] += local_ids_to_remove
                else:
                    ids_to_remove[reporting] = local_ids_to_remove
        else:
            dup_found = False

        if not dup_found:
            # flows are dups but not on GEN/SPE distinction or some null values in the groupings
            gen_remove += 1
            # print(gen_remove, ("duplicate found :%s flows for %s,%s,%s,%s,%s,%s"%(n,year,reporting,)
            # 	partner,e_i,spe_gens,sb)).encode("utf8")
    print("-------------------------------------------------------------------------")

    if gen_remove > 0:
        print(
            "We found %s duplicate flows but not on GEN/SPE distinction..." % gen_remove
        )

    if ids_to_remove:
        for r, ids in ids_to_remove.items():
            print(
                (
                    "removing %s General or Special duplicates for %s" % (r, len(ids))
                ).encode("utf8")
            )
            c.execute("DELETE FROM flow_joined WHERE id IN (%s)" % ",".join(ids))

    print("-------------------------------------------------------------------------")

    ################################################################################
    # Create the partner World as sum of partners
    ################################################################################
    c.execute(
        """INSERT INTO RICentities (`RICname`, `type`, `continent`, `slug`)
        VALUES ("World sum partners", "geographical_area", "World", "Worldsumpartners")"""
    )

    print("World sum partners added to RICentities")

    c.execute(
        """INSERT INTO flow_joined (flow, unit, reporting, reporting_slug, year, 
        expimp, currency, partner, partner_slug, rate, source, source_label, type, reporting_type, reporting_continent, reporting_GPH_code)
                SELECT sum(flow*unit) as flow,
                    1 as unit,
                    reporting,
                    reporting_slug,
                    year,
                    expimp,
                    currency,
                    'World sum partners' as partner,
                    'Worldsumpartners' as partner_slug,
                    rate,
                    source,
                    source_label,
                    type,
                    reporting_type, 
                    reporting_continent,
                    reporting_GPH_code
                    from flow_joined
                WHERE partner not like 'world%'
                group by reporting, expimp, year """
    )

    print("World sum partners added to flow_joined")
    print("-------------------------------------------------------------------------")

    # ################################################################################
    # ##			Create the partner World as best guess
    # ################################################################################
    c.execute(
        """INSERT INTO RICentities (`RICname`,`type`,`continent`, `slug`)
        VALUES ("World best guess", "geographical_area", "World", "Worldbestguess")"""
    )

    print("World as best guess added to RICentities")
    print("-------------------------------------------------------------------------")

    c.execute(
        """SELECT year, expimp, partner, reporting, partner_slug, reporting_slug, 
        flow, unit, currency, rate, source, source_label, type, reporting_type, reporting_continent, reporting_GPH_code
        from flow_joined
        WHERE partner LIKE "world%"  """
    )
    data = list(c)

    def sortByReportingYearExpImp(_):
        return (
            _[3] if _[3] is not None else "",
            _[0] if _[0] is not None else "",
            _[1] if _[1] is not None else "",
        )

    data.sort(key=sortByReportingYearExpImp)

    world_best_guess_added = 0
    for g, d in itertools.groupby(data, key=sortByReportingYearExpImp):
        dd = list(d)

        world_best_guess = [sd for sd in dd if sd[4] == "Worldestimated"]
        if len(world_best_guess) == 0:
            world_best_guess = [sd for sd in dd if sd[4] == "Worldasreported"]
        if len(world_best_guess) == 0:
            world_best_guess = [sd for sd in dd if sd[4] == "Worldsumpartners"]
        if len(world_best_guess) == 0:
            pass
        else:
            world_best_guess = list(world_best_guess[0])
            world_best_guess[2] = "World_best_guess"
            world_best_guess[4] = "Worldbestguess"
            c.execute(
                """INSERT INTO flow_joined (year, expimp, partner, reporting, 
                partner_slug, reporting_slug, flow, unit, currency, rate, source, source_label, type,
                reporting_type, reporting_continent, reporting_GPH_code)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
                world_best_guess,
            )
            world_best_guess_added += 1

    print("World best guess added to flow_joined", world_best_guess_added)
    print("-------------------------------------------------------------------------")

    #    CREATE WORLD FLOWS SUM
    # We need to prepare the world view by preparing the sum of wolrd flows
    #  """SELECT SUM(flow*Unit/ifnull(rate,1)), partner_slug,year, COUNT(*), expimp, Source
    #                   FROM flow_joined
    #                   WHERE (
    #                    partner_slug like 'Worldasreported'
    #                    OR partner_slug like 'Worldbestguess'
    #                    OR partner_slug like 'Worldsumpartners'
    #                    OR partner_slug like 'WorldFedericoTena')
    #                   %s
    #                   GROUP BY year, expimp,partner_slug
    #                   ORDER B
    # But we need to filter reporting which are part of other existing reporters. See https://github.com/medialab/ricardo_data/issues/81
    


    ################################################################################
    # Create table metadata bilateral
    ################################################################################

    # print("Create table metadata_bilateral")
    # print("-------------------------------------------------------------------------")

    c.execute("""DROP TABLE IF EXISTS metadata_bilateral;""")
    c.execute(
        """CREATE TABLE IF NOT EXISTS metadata_bilateral AS
                SELECT tot.reporting_id as reporting_id, tot.reporting as reporting, group_concat(tot.flow,"|") as flow,  group_concat(tot.expimp,"|") as expimp,
                group_concat(tot.partner,"|") as partner, tot.year as year,
                group_concat(tot.type,"|") as sourcetype,  group_concat(tot.source,"|")  as source,count(distinct tot.source) as source_count,
                tot.reporting_continent as reporting_continent, tot.reporting_type as reporting_type,group_concat(mirror_partner,"|") as mirror_partner
                from
                (
                    SELECT reporting_id, reporting, flow, r.expimp as expimp,
                    partner as partner, r.year as year, type, source, reporting_continent, reporting_type,(t1.reportings ||"+"|| t1.expimp) as mirror_partner
                    FROM
                    (
                        select t.reporting_slug as reporting_id,t.reporting as reporting, sum(t.flow) as flow, t.expimp as expimp, group_concat(t.partner_slug) as partner,
                        t.year as year, t.reporting_continent as reporting_continent, t.reporting_type as reporting_type,group_concat(distinct t.type) as type,group_concat(distinct t.source)  as source
                        FROM
                        (
                            SELECT reporting, reporting_slug, flow*Unit/ifnull(rate,1) as flow, (replace(partner_slug,",","")||"+"||partner_continent) as partner_slug, year, source_label as source, type,reporting_continent,reporting_type, expimp
                            FROM flow_joined
                            WHERE partner_slug NOT LIKE 'world%' 
                                AND flow*Unit/rate is not NULL
                                AND partner_continent is not NULL
                            GROUP BY  reporting_slug, partner_slug,year,expimp
                        ) t
                        Group by t.reporting_slug, t.year, t.expimp
                    ) r
                    LEFT JOIN
                    (
                        SELECT group_concat(distinct replace(reporting_slug,",","")) as reportings,partner_slug,year,expimp
                        FROM flow_joined
                        Where flow is not NULL
                        GROUP BY  partner_slug, year,expimp
                    ) t1
                    ON r.reporting_id=t1.partner_slug and r.year =t1.year and r.expimp!=t1.expimp
                ) tot
                GROUP BY  tot.reporting_id, tot.year
                """
    )

    print("metadata_bilateral created")
    print("-------------------------------------------------------------------------")

    ################################################################################
    # Create table metadata world
    ################################################################################

    # print("Create table metadata_world")
    # print("-------------------------------------------------------------------------")

    c.execute("""DROP TABLE IF EXISTS metadata_world;""")
    c.execute(
        """CREATE TABLE IF NOT EXISTS metadata_world AS
                SELECT reporting_slug,reporting as reporting, group_concat(flow,"|") as flow, group_concat(expimp,"|") as expimp, group_concat(partner,"|") as partner,
                year,group_concat(type,"|") as type,group_concat(source,"|")as source, count(distinct source)as source_count,
                reporting_continent, reporting_type
                From
                (SELECT reporting, reporting_slug, flow*Unit/ifnull(rate,1) as flow, group_concat(partner,"+") as partner, year,group_concat(source_label,"+") as source, group_concat(type,"+") as type, reporting_continent,reporting_type, expimp
                FROM flow_joined
                WHERE flow is not NULL
                AND(partner_slug like 'Worldestimated'
                OR partner_slug like 'Worldasreported'
                OR partner_slug like 'Worldsumpartners'
                OR partner_slug like 'WorldFedericoTena')
                GROUP BY  reporting_slug,year,expimp)
                Group by reporting_slug, year
                """
    )

    print("metadata_world created")
    print("-------------------------------------------------------------------------")
    conn.commit()

    print("Creating CSV exports")
    print("source.csv (...)")
    custom_exports.export_sources_csv(c, conf["sources_export_filename"])
    print("done")
    print("RICentities.csv (...)")
    custom_exports.export_RICentities_csv(c, conf["RICentities_export_filename"])
    print("done")
    print("flows_deduplicated.csv (...)")
    custom_exports.export_sql_query_csv(
        c,
        "SELECT * FROM flow_joined",
        conf["deduplicated_flows"],
    )
    print("done")
    print("flows_duplicated.csv (...)")
    custom_exports.export_sql_query_csv(
        c,
        """
        SELECT  year, reporting, partner, expimp,GROUP_CONCAT(original_partner),GROUP_CONCAT(source), GROUP_CONCAT(spegen), GROUP_CONCAT(species_bullions),GROUP_CONCAT(transport_type), count(*) as nb_dup 
        FROM flow_joined
        WHERE partner NOT IN ('Unknown', '***NA', 'World undefined')
        GROUP BY year, reporting, partner, expimp
        HAVING nb_dup > 1;""",
        conf["duplicated_flows"],
    )
    print("done")
