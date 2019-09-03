Re

Voici mes commentaires :

- source_category (nouvelle) : distingue 5 catégories de sources article, book, database (1 source), statistical series, website

OK
 
- type : source primaire, secondaire, estimation

OK
 
- reference : titre générique de la source

Vu mais du coup ne faut il pas supprimer le name dans source quand c'est la même chose que reference dans source_types ?
 
- author : auteur d'article ou d'ouvrage.
- author_editor : éditeur de série stat ou site internet
  => dans le fichier sources, les deux types d'auteurs ne sont pas distingués, il n'y a qu'une colonne author

Je propose qu'on utilise author dans source et que l'on ne garde que author_editor dans source_types.
Comme poue reference on isole les infos de type éditeur / générique dans source_types et au contraire les infos précises que dans sources.

Qu'en dis tu ? 

Mais en fait je me demande si on ne pourrait pas se passer de source_types du coup.
On met toutes les infos dans source en distinguant comme tu l'a fait les deux types d'auteur.
Et pour les titres on distingue.
 
- name : titre de la source

ok
 
- country : précise le titre de la source, zone géographique

ok
 
- volume_number : numéro du volume quand la source est une série stat ou un article de revue

Je vois que tu as indiqués "vol." dans cette colonne quand c'était pertinent.
Tu as indiqué Part ou rien pour les FC*.

Du coup je ne rajouterai pas vol. automatiquement pour la construction des références bibliographiques.
 
- volume_date : année du volume quand la source est une série stat ou période indiquée dans le titre quand la source est un ouvrage

Ok parfait.
 
- edition_date : année d'édition de la source
ok
 
- pages : pages de la source

Ok mais il y a les cas où est indiqué : 
serie Ee612
serie Ee618

Comme ce ne sont pas des numéros de pages si j'ajoute pp. automatiquement dans les ref ça fera "pp. serie Ee612"... 
Donc soit on ajoute pp. dans la colonne dans les autres cas où l'on a des numéros de pages.
Ou alors on ajoute "serie Ee612" dans la colonne volume "Part 5, serie Ee612"

Je te laisse décider en fonction de ce que ce "serie Ee612" signifie.

 
- shelf number
ok
- notes
ok
- url
ok

- flow_date : année du flux
  => cette info apparaît dans le slug des derniers fichiers de données. Elle paraît inutile puisque la source est associée au flux bilatéral d'une année. flow_date surcharge alors inutilement le fichier sources (plusieurs occurrences d'une même source).
=> je n'y ai pas touché, dis-moi si je dois revoir toutes ces lignes.

En effet je vois le problème.
N'y touche pas.
Je vais le faire.
En gros je vais changer le slug (et donc réduire le nombre de lignes dans source) mais en prenant soin de modifier les lignes correspondantes dans flows.
J'en profiterai pour changer aussi les anciens slugs et donc de tout normer correctement.
Je supprimerai aussi les sources qui ne sont plus utilisées.


Pour la référence bibliographique telle qu'elle doit apparaître, je ne suis pas sûre d'avoir bien compris. Est-ce qu'il s'agit de ce que l'utilisateur verra comme source d'un flux dans la metadata ? 
Dans ce cas, je serais d'avis de ne pas trop surcharger la référence et de laisser l'utilisateur aller chercher les détails dans le fichier sources sous Corpus. 'author_name' suffirait.
Si j'ai mal compris, l'ordre d'inscription de toutes les infos concernant la source serait le suivant :
author/name/country/vol_number/vol_date/edition_date/author_editor/pages/source_category/type

En gros l'idée de la référence biblio en texte c'est de proposer aux utilisateurs un texte unique qui pointe correctement sur la source.
J'utiliserai l'ordre que tu m'indiques pour le faire dans le fichier sources.csv dispo depuis le menu corpus.
Pour la vue métadata on pourra indiquer une version simplifiée par exemple que sur author en effet.



Dis-moi s'il y a des choses à revoir.

Amitiés
Béatrice



Le 18 septembre 2017 à 15:04, Paul GIRARD <paul.girard@sciencespo.fr> a écrit :
Hello

Je te réponds point par point :

Le 15 septembre 2017 à 13:41, Beatrice DEDINGER <beatrice.dedinger@sciencespo.fr> a écrit :
Trois points :

- pour l'acronym WdW, il y a deux 'author' différents qui ont été regroupés ensemble. Ce n'est pas très clair. Ne pourrait-on pas créer deux WdW : WdW1, WDW2 ?

Mm oui il y a un problème.
C'est quoi "Währungen der Welt" ? Une revue, une collection ? 
Pourquoi y a t'il deux lites d'auteurs ? 

J'ai l'impression qu'il devrait n'y avoir qu'une source type WdW mais sans auteur (ou alors un éditeur commun) mais de répartir les deux listes d'auteurs par source en fonction ? 
Mais ça dépends du cas.
 
- problème avec les derniers slugs créés (derniers fichiers de données).
 Dans le fichier flows, le slug = acronym,date,volume,pages,year
 Dans le fichier sources, ce slug a été converti en = acronym,edition_date,country,pages,date

Là je ne comprends pas.
Appelle moi pour m'expliquer ce cas de vive voix.
A ta disposition aujourd'hui jusque 17h30 au 0678974849
Sinon Mercredi matin.
 
- je dois ajouter pp. dans toute la colonne pages ?

Non du tout. J'ajoute le pp. automatiquement.
Au contraire, si il y a qq chose qui ressemble à pp dans la colonne page il faut l'enlever.

à tout à l'heure ?


Paul



 
...

Le 15 septembre 2017 à 12:11, Paul GIRARD <paul.girard@sciencespo.fr> a écrit :
exactement

Le 15 septembre 2017 à 12:09, Beatrice DEDINGER <beatrice.dedinger@sciencespo.fr> a écrit :
Donc, s'il y a une erreur dans une source, je ne corrige pas le slug mais je peux corriger les autres colonnes ?

Le 15 septembre 2017 à 12:07, Paul GIRARD <paul.girard@sciencespo.fr> a écrit :
Hello

L'éditeur, on peut le mettre comme author dans sourceType.
Idéalement ça suffit à gérer tous les cas et on ajoute pas de colonne.
On pourrait la renommer en revanche à terme.

Après si dans certains cas tu aimerais préciser un auteur et un éditeur dans sourceType alors il faudra créer une colonne.

Non ne pas modifier le slug. Je remplacerai ce slug par une valeur automatique quand on aura fini de nettoyer.
Le slug contient des données qui ont l'air d'être faite pour être lues par un humain mais en fait elle ne sert que de colle technique. Pas besoin de modifier mais surtout si on modifie il faut propager la modification dans flow et exchange_rate.

Paul



Le 15 septembre 2017 à 11:33, Beatrice DEDINGER <beatrice.dedinger@sciencespo.fr> a écrit :
Autre question : je peux corriger le slug si je vois une erreur ? 

Le 15 septembre 2017 à 10:23, Beatrice DEDINGER <beatrice.dedinger@sciencespo.fr> a écrit :
Du coup, où on met l'éditeur ? 
Dans Sources et SourceType, author est bien le même ? 
Faut-il créer une colonne edition_author ?

Le 14 septembre 2017 à 13:40, Paul GIRARD <paul.girard@sciencespo.fr> a écrit :
Chère Béatrice, 

Je t'envoie les fichiers pour le nettoyage des sources.
RICardo_bibliographie.cv : le tableau des sources qui sera sur le site
C'est ton point d'entrée.
La première colonne propose une référence bibliographique complète.
Tu peux partir de cette colonne pour vérifier.

En cas de corrections utilise les deux fichiers suivant :
sources.xlsx
sourceTypes.xlsx

Pour info voici les corrections que l'on avait identifiées et dont je me souviens : 
- enlever les auteurs au niveau sources qui sont en fait des éditeurs (vérifier que l'auteur est bien renseigné dans sourceType
- vérifier les nunéros de volume et enlever "part" ou autre qui gêne le formatage systématique en "vol."
- pareil avec les pages
- relire tout attentivement il reste parfois des caractères incongrus ( | et autre.

N'hésite pas à me faire signe en cas de doute.
Je dois encore finir de relier les contenus du site. Je t'envoie ça rapidement.

Bien à toi,
Paul




-- 
Paul Girard
directeur technique médialab


27 rue Saint-Guillaume 75337 Paris cedex 07 France
paul.girard@sciencespo.fr
medialab.sciences-po.fr 





-- 
Paul Girard
directeur technique médialab


27 rue Saint-Guillaume 75337 Paris cedex 07 France
paul.girard@sciencespo.fr
medialab.sciences-po.fr 




-- 
Paul Girard
directeur technique médialab


27 rue Saint-Guillaume 75337 Paris cedex 07 France
paul.girard@sciencespo.fr
medialab.sciences-po.fr 




-- 
Paul Girard
directeur technique médialab


27 rue Saint-Guillaume 75337 Paris cedex 07 France
paul.girard@sciencespo.fr
medialab.sciences-po.fr 




-- 
Paul Girard
directeur technique médialab


27 rue Saint-Guillaume 75337 Paris cedex 07 France
paul.girard@sciencespo.fr
medialab.sciences-po.fr 



-- 
Paul Girard
directeur technique médialab


27 rue Saint-Guillaume 75337 Paris cedex 07 France
paul.girard@sciencespo.fr
medialab.sciences-po.fr 