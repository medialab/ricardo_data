20170601_séance_toflit18.md


# données TOFLIT

## nouvelles source toflit en partant de simplification

=> résoudre les problèmes de nom de partenaires

=> reporting = France
=> etats de l'empereur, en flandre et allemagne - par mer   None    Habsburgs' estate (in Germany and Flanders) vérifier terre/mer
etats de l'empereur, en flandre et allemagne - par terre    None    Habsburgs' estate (in Germany and Flanders) vérifier terre/mer

DONE


## on considère les données toflit comme prioritaire comparé à la source SF-1838

=> passer source toflit en primaire
=> passer SF-1838 en secondaire

DONE

# doublons

# intégrer nouvelles versions des fichiers

- Doublons Bulgarie   
Pour Bulgarian Lev : j'ai pris les données de Giovanni => fichiers corrigés Source_type, sources, exchange_rates.
=> intégrer les modifications de Source_type, sources, exchange_rates 

DONE

- Entité : 
- RICEntities et entity_name ajout de neu pommern, caroline islands, west indies, german solomon islands, french east africa, Serbia, mésopotamie

DONE


# Doublons argentine totaux

Pour Argentine total_reporting : c'était un problème d'unité.
reporting = Argentina
year in [1910-1938]
total_reporting = 1
**unit => 1**

DONE

reporting = Argentina
total_reporting = 1
year IN [1880,1881,1882]
Note = "Valor oficial"
**supprimer ces 6 lignes**

DONE


# Algérie

- modif à la main pour récupérer les virgules : **régler le problème des virgules exporter par openoffice**

DONE

- **importer 1851-1899**

## suppression des doublons valeurs officielles France est cassé


#australia
id = 2531215 and partner = "east indies" => partner = 'east indies (other)'

DONE

## brésil

2539549 partner = 'possessions britanniques en Amer. Nord et Centre'
2539558 partner = 'possessions britanniques en Amer. Sud'

DONE


