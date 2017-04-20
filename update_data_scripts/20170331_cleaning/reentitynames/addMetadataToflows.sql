UPDATE flows SET transport_type="Terre" WHERE partner IN ("Allemagne et Pologne - par terre",
	"Espagne - par terre",
	"Etats de l'Empereur, en Flandre et Allemagne - par terre",
	"Etats du Roi de Sardaigne - par terre");
UPDATE flows SET transport_type="Mer" WHERE partner IN ("Espagne - par mer",
"Etats de l'Empereur, en Flandre et Allemagne - par mer",
"Etats du Roi de Sardaigne - par mer",
"Prusse - par mer"
);
UPDATE flows SET partner_sum="1" WHERE partner IN (
"Total exempt de droits de douane",
"Total soumis aux droits de douane"
);