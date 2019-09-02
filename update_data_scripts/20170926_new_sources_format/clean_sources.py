from csvkit import DictReader
from csvkit import DictWriter
import itertools

def export_report():
    sources_by_slug={}

    new_slug=lambda line:"_".join(_ for _ in [line["acronym"],line["country"],line["dates"],line["edition_date"],line["volume"],line["pages"]] if _ !="")

    with open("../csv_data/sources.csv","r") as f:
        sources=DictReader(f)
        for s in sources:
            ns=new_slug(s)
            s["new_slug"]=ns
            sources_by_slug[ns]=[s] if ns not in sources_by_slug else sources_by_slug[ns]+[s]

        with open("new_slug_colisions.csv","w") as f:
            new_slug_colisions=DictWriter(f,["keep","new_slug"]+sources.fieldnames)
            new_slug_colisions.writeheader()
            for k,dups in sources_by_slug.iteritems():
                if len(dups)>1 :
                    new_slug_colisions.writerows(dups)

        #print "\n".join(["%s\t:%s"%(k,[d["slug"] for d in dups]) )

def import_correction():
    with open("out_data/new_slug_colisions.csv","r") as f:
        corrections_file=DictReader(f)
        sort_newslug=lambda e:e["new_slug"]
        corrections=[c for c in corrections_file]
        corrections.sort(key=sort_newslug)
        
        correction_lines=[]
        slugs_to_keep=[]
        for new_slug,lines in itertools.groupby(corrections,sort_newslug):
            correction_lines = list(lines)
            # keep
            index_to_keep=[i for i,l in enumerate(correction_lines) if l["keep"]=="x"]
            if len(index_to_keep)>1:
                print "WARNING: multiple keep order for group %s"%new_slug
            elif len(index_to_keep)==1:
                print "correcting group %s"%new_slug
                slug_to_keep=correction_lines[index_to_keep[0]]["slug"]
                slugs_to_replace=[{"Source":line["slug"],"Target":slug_to_keep} for line in correction_lines if line["keep"]!="x"]
                # add correction_lines in patch_sources.csv
                with open("in_data/patchs/patch_sources.csv","a") as psf:
                    psfw=DictWriter(psf,["Source","Target"])
                    psfw.writerows(slugs_to_replace)
                    print "added %s in patch to be removed"%" | ".join(s["Source"] for s in slugs_to_replace)
                slugs_to_keep.append((slug_to_keep,index_to_keep[0]))
            # check if index_to_keep not empty

            
            # output a SQL script patch
            # by copy_notes lines
            notes_to_copy=[{"Source":line["slug"],"Target":line["notes"]} for line in correction_lines if line["copy_notes_to_rate"]=="x"]
            # add correction_lines in patch_sources.csv
            with open("in_data/patchs/patch_sources_copy.csv","a") as psfc:
                psfcw=DictWriter(psfc,["Source","Target"])
                psfcw.writerows(notes_to_copy)
                print "added %s in patch to be copied"%" | ".join(s["Source"] for s in notes_to_copy)
            ## UPDATE ON flows/echange_rates SET notes=%notes% WHERE source=%slug% 
            ## UPDATE ON sourcse SET notes="" WHERE slug=%slug%
            # by remove notes
            notes_to_remove=[{"Source":line["slug"],"Target":line["notes"]} for line in correction_lines if line["remove_notes_from_source"]=="x"]
            # add correction_lines in patch_sources.csv
            with open("in_data/patchs/patch_sources_remove.csv","a") as psfr:
                psfrw=DictWriter(psfr,["Source","Target"])
                psfrw.writerows(notes_to_remove)
                print "added %s in patch to be removed"%" | ".join(s["Source"] for s in notes_to_remove)
            ## UPDATE ON sourcse SET notes="" WHERE slug=%slug%
            


export_report()
#import_correction()