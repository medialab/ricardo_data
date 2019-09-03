# Mettre à jour RICentities avec les modifs (ok)
# ajouter les nouveux RICentities qui sont dans missing (ok)
# metre à jours les original (ok)
# ajouter les RICentities qui vont avec (ok)

# ajouter une ligne dans RICentities_links pour Macedonia (ok)
# enlever les ligens region des links (ok)
# renomer RICname en COW_name dans links (ok)

# ajouter les données FT

# tests sur les RICentities

- RICname doit être dans entity_names

- country :
	part_of_country doit être vide car les changements de contrôle politique sont dans links ()
	COW_code doit être renseigné ()
- city/part_of  et colonial_area :
	part_of_country doit être rempli par un RICname de type country (sauf cas d'attribution impossible)   (
	COW_code doit être vide ()
- group :
	part_of_country vide ()
	COW_code vide ()





- Kuwait Kuweit dans RICentities
- St. jan devient St. John 