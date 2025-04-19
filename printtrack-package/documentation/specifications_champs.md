# Spécifications Détaillées des Champs et Règles de Validation

## 1. En-tête commune

### Champs à saisir
| Champ | Type | Description |
|-------|------|-------------|
| Date | Date (JJ/MM/AAAA) | Date de création du bon de fabrication |
| Heure de démarrage | Heure (HH:MM) | Heure prévue ou effective de démarrage de la production |
| Quart de travail | Liste déroulante | Matin (6h-14h) / Après-midi (14h-22h) / Nuit (22h-6h) |
| Numéro de dossier | Texte formaté | Format: BF-AAAAMMJJ-XXX (où XXX est un numéro séquentiel) |

### Règles de validation
- **Date** : Obligatoire, ne peut pas être dans le futur de plus de 7 jours
- **Heure de démarrage** : Obligatoire, doit correspondre à l'horaire du quart sélectionné
- **Quart de travail** : Obligatoire, sélection unique
- **Numéro de dossier** : Généré automatiquement, non modifiable après création

### Workflows associés
- Création automatique du numéro de dossier lors de la validation de l'en-tête
- Notification aux équipes concernées lors de la création d'un nouveau bon
- Verrouillage des champs après validation de l'en-tête

## 2. Client & travail

### Champs à saisir
| Champ | Type | Description |
|-------|------|-------------|
| Nom du client | Liste déroulante + recherche | Sélection dans la base clients existante |
| Désignation du travail | Texte | Description du travail à réaliser |
| Référence client | Texte | Référence du travail chez le client |
| Quantité à imprimer | Nombre entier | Nombre d'exemplaires à produire |
| Quantité supplémentaire | Nombre entier | Marge supplémentaire pour déchets et contrôles |
| Nombre de couleurs | Nombre entier (1-8) | Nombre de couleurs d'impression |
| Type de support d'impression | Liste déroulante hiérarchique | Catégorie > Type > Grammage |
| Format (L×l) | Deux nombres décimaux | Dimensions en mm |
| Finitions requises | Cases à cocher multiples | Vernis, pelliculage, découpe, etc. |

### Règles de validation
- **Nom du client** : Obligatoire, doit exister dans la base de données
- **Désignation du travail** : Obligatoire, 10-100 caractères
- **Référence client** : Facultatif, format libre
- **Quantité à imprimer** : Obligatoire, > 0
- **Quantité supplémentaire** : Facultatif, valeur par défaut calculée (% de la quantité principale)
- **Nombre de couleurs** : Obligatoire, entre 1 et 8
- **Type de support** : Obligatoire, doit être compatible avec le procédé sélectionné
- **Format** : Obligatoire, doit être dans les limites de la machine sélectionnée
- **Finitions** : Facultatif, multiples sélections possibles

### Workflows associés
- Chargement automatique des informations client (contact, adresse) lors de la sélection
- Vérification de compatibilité entre support et procédé d'impression
- Calcul automatique du temps estimé de production basé sur quantité et nombre de couleurs
- Proposition automatique de machines compatibles avec le format et le type de travail

## 3. Procédé & équipement

### Champs à saisir
| Champ | Type | Description |
|-------|------|-------------|
| Procédé d'impression | Boutons radio | Offset / Héliogravure |
| Nom de la machine | Liste déroulante filtrée | Machines disponibles selon le procédé |
| Conducteur principal | Liste déroulante | Personnel qualifié disponible |
| Conducteurs secondaires | Liste déroulante multiple | Personnel supplémentaire |
| Contrôleur qualité | Liste déroulante | Personnel qualifié disponible |
| Configuration machine | Schéma interactif | Disposition des groupes d'impression |
| Vitesse cible | Nombre | Feuilles/h ou m/min selon procédé |

### Règles de validation
- **Procédé d'impression** : Obligatoire, sélection unique
- **Nom de la machine** : Obligatoire, filtré selon procédé sélectionné
- **Conducteur principal** : Obligatoire, doit avoir la qualification pour la machine sélectionnée
- **Conducteurs secondaires** : Facultatif, doivent avoir la qualification requise
- **Contrôleur qualité** : Obligatoire, doit avoir la qualification requise
- **Configuration machine** : Obligatoire pour les machines modulaires
- **Vitesse cible** : Obligatoire, doit être dans les limites de la machine (min-max)

### Workflows associés
- Adaptation dynamique du formulaire selon le procédé sélectionné
- Vérification de la disponibilité de la machine à la date/heure prévue
- Vérification des qualifications du personnel sélectionné
- Notification automatique au personnel assigné
- Chargement des paramètres standards pour la combinaison machine/support

## 4. Suivi temporel

### Champs à saisir
| Champ | Type | Description |
|-------|------|-------------|
| Heure de début effective | Horodatage | Début réel de la production |
| Heure de fin prévue | Horodatage calculé | Basé sur quantité et vitesse |
| Heure de fin effective | Horodatage | Fin réelle de la production |
| Temps de calage | Durée (HH:MM) | Temps de préparation machine |
| Temps de production | Durée calculée | Temps effectif d'impression |
| Temps d'arrêt | Tableau dynamique | Motif + Durée + Commentaire |
| Compteur début | Nombre | Relevé compteur machine au début |
| Compteur fin | Nombre | Relevé compteur machine à la fin |

### Règles de validation
- **Heure de début effective** : Obligatoire, ne peut pas être antérieure à la création du bon
- **Heure de fin prévue** : Calculée automatiquement, non modifiable
- **Heure de fin effective** : Obligatoire à la clôture, doit être postérieure à l'heure de début
- **Temps de calage** : Obligatoire, avec alerte si > 120% du temps standard
- **Temps de production** : Calculé automatiquement (fin - début - arrêts)
- **Temps d'arrêt** : Facultatif, mais motif obligatoire si durée saisie
- **Compteurs** : Obligatoires, compteur fin > compteur début

### Workflows associés
- Démarrage automatique du chronomètre à la saisie de l'heure de début
- Calcul en temps réel du temps restant estimé
- Notification en cas de dépassement du temps prévu
- Journal chronologique des événements de production
- Calcul automatique des indicateurs de performance (OEE, rendement)

## 5. Pré-presse

### Champs à saisir pour Offset
| Champ | Type | Description |
|-------|------|-------------|
| BAT (Bon à Tirer) | Case à cocher + Date | Validation du client |
| Fichier de référence | Upload fichier | PDF ou image de référence |
| Plaques | Tableau | Couleur + Linéature + Angle + Remarques |
| Imposition | Schéma visuel | Disposition sur la feuille |
| Fond de teinte | Valeurs CMJN | Pourcentages par couleur |
| Repérage | Nombre décimal | Tolérance en mm |

### Champs à saisir pour Héliogravure
| Champ | Type | Description |
|-------|------|-------------|
| Épreuve gravure | Case à cocher + Date | Validation de l'épreuve |
| Cylindre test | Texte + Date | Référence et date du test |
| Cylindres | Tableau | Couleur + Linéature + Volume + Remarques |
| Profondeur de gravure | Nombre décimal | En μm |
| Angle de raclage | Nombre décimal | En degrés |
| Pression de raclage | Nombre décimal | En N/cm |

### Règles de validation
- **BAT/Épreuve** : Obligatoire avant démarrage production
- **Fichier de référence** : Obligatoire, formats acceptés: PDF, TIFF, JPEG haute résolution
- **Plaques/Cylindres** : Obligatoire, nombre doit correspondre au nombre de couleurs
- **Imposition** : Obligatoire pour l'offset
- **Repérage/Profondeur** : Obligatoire, dans les limites de tolérance du procédé

### Workflows associés
- Verrouillage du démarrage production sans validation BAT/Épreuve
- Notification automatique au client pour validation BAT
- Archivage automatique des fichiers de référence
- Génération de fiche technique pour la fabrication des plaques/cylindres

## 6. Paramètres techniques

### Champs à saisir pour Offset
| Champ | Type | Description |
|-------|------|-------------|
| **Eau de mouillage** |  |  |
| pH | Nombre décimal | Valeur entre 4.5 et 5.5 |
| Conductivité | Nombre décimal | En μS/cm |
| Température | Nombre décimal | En °C |
| Dosage additif | Pourcentage | Concentration d'additif |
| Dosage biocide | Pourcentage | Concentration de biocide |
| **Encres** |  |  |
| Référence | Texte codifié | Code fabricant + lot |
| Viscosité | Nombre décimal | En Pa.s |
| Température | Nombre décimal | En °C |
| Densité optique | Tableau | Valeur par couleur |
| **Pression** |  |  |
| Pression blanchet-plaque | Nombre décimal | En bar |
| Pression blanchet-papier | Nombre décimal | En bar |
| **Séchage** |  |  |
| Température IR | Nombre décimal | En °C |
| Puissance UV | Pourcentage | Si applicable |

### Champs à saisir pour Héliogravure
| Champ | Type | Description |
|-------|------|-------------|
| **Solvant** |  |  |
| Type | Liste déroulante | Toluène, Éthanol, etc. |
| Concentration | Pourcentage | Taux de dilution |
| Température | Nombre décimal | En °C |
| Taux d'évaporation | Pourcentage | Mesure d'évaporation |
| **Tension** |  |  |
| Tension du cylindre | Nombre décimal | En N/cm |
| Tension du support | Nombre décimal | En N/cm |
| **Encrage** |  |  |
| Contrôle de trame | Nombre décimal | En μm |
| Densité de cellule | Nombre décimal | Cellules/cm² |
| Profondeur de cellule | Nombre décimal | En μm |
| **Séchage** |  |  |
| Température sécheur | Tableau | Valeur par zone en °C |
| Débit d'air | Nombre décimal | En m³/h |
| Récupération solvant | Pourcentage | Efficacité du système |

### Règles de validation
- **pH** : Obligatoire pour offset, alerte si hors plage 4.5-5.5
- **Conductivité** : Obligatoire pour offset, alerte si variation > 10% de la valeur initiale
- **Température** : Obligatoire, alerte si hors plages définies par procédé
- **Viscosité/Concentration** : Obligatoire, limites dépendantes du type d'encre/solvant
- **Densité optique** : Obligatoire, comparaison avec valeurs cibles du BAT
- **Tension** : Obligatoire pour héliogravure, alerte si hors plages de sécurité

### Workflows associés
- Relevés périodiques programmés (fréquence paramétrable)
- Calcul automatique des tendances et déviations
- Alerte en temps réel en cas de dépassement des seuils
- Recommandations automatiques d'actions correctives
- Traçabilité complète des lots d'encre et de solvant utilisés

## 7. Contrôle en cours d'impression

### Champs à saisir
| Champ | Type | Description |
|-------|------|-------------|
| Fréquence de contrôle | Durée ou Quantité | Intervalle entre contrôles |
| Points de contrôle | Tableau dynamique | Critère + Méthode + Valeur cible + Tolérance |
| Résultats de mesure | Tableau | Valeur + Heure + Conformité |
| Échantillon de référence | Upload image | Photo de l'échantillon validé |
| Incidents | Tableau extensible | Type + Description + Heure + Gravité |
| Actions correctives | Texte + Liste | Description + Responsable + Statut |
| Photos incidents | Upload multiple | Images des défauts constatés |

### Règles de validation
- **Fréquence** : Obligatoire, minimum selon type de travail
- **Points de contrôle** : Minimum 3 points obligatoires
- **Résultats** : Obligatoires à chaque contrôle planifié
- **Échantillon** : Obligatoire au démarrage de production
- **Incidents** : Description détaillée obligatoire si gravité > 2
- **Actions correctives** : Obligatoires pour tout incident enregistré
- **Photos** : Obligatoires pour incidents de gravité > 3

### Workflows associés
- Rappels automatiques des contrôles à effectuer
- Génération de fiches de contrôle spécifiques au travail
- Escalade automatique des incidents selon gravité
- Notification des responsables en cas d'incident critique
- Suivi des actions correctives jusqu'à résolution
- Analyse statistique des tendances de qualité

## 8. Fin de tirage

### Champs à saisir pour Offset
| Champ | Type | Description |
|-------|------|-------------|
| Nettoyage blanchets | Liste + Case | Type + Validation |
| Nettoyage plaques | Liste + Case | Type + Validation |
| Rinçage groupes | Case à cocher | Par groupe d'impression |
| Rinçage mouillage | Case + Durée | Validation + Temps |
| Produits utilisés | Liste multiple | Sélection produits |
| Quantité produits | Nombre | Par produit en L ou kg |
| Maintenance post-prod | Liste de contrôle | Points à vérifier |

### Champs à saisir pour Héliogravure
| Champ | Type | Description |
|-------|------|-------------|
| Rinçage tambour | Liste + Case | Type + Validation |
| Rinçage circuit solvant | Case + Durée | Validation + Temps |
| Nettoyage racleurs | Liste + Case | Type + Validation |
| Récupération solvant | Nombre | Volume en L |
| Stockage cylindres | Liste + Référence | Emplacement + Code |
| Produits utilisés | Liste multiple | Sélection produits |
| Maintenance post-prod | Liste de contrôle | Points à vérifier |

### Règles de validation
- **Nettoyage** : Tous les éléments obligatoires avant clôture
- **Rinçage** : Durée minimale selon type de travail
- **Produits** : Sélection obligatoire avec quantités
- **Maintenance** : Tous les points doivent être validés
- **Récupération solvant** : Obligatoire pour héliogravure, alerte si < 80% du volume théorique

### Workflows associés
- Génération automatique de check-list selon machine et travail
- Suivi de consommation des produits de nettoyage
- Mise à jour automatique du stock de consommables
- Planification de maintenance préventive si seuils atteints
- Notification au service maintenance en cas d'anomalie détectée

## 9. Clôture & passation

### Champs à saisir
| Champ | Type | Description |
|-------|------|-------------|
| Quantité produite | Nombre | Total d'exemplaires valides |
| Quantité rebutée | Nombre | Total d'exemplaires défectueux |
| Taux de rebut | Pourcentage calculé | (Rebuté / Total) × 100 |
| Causes de rebut | Tableau | Cause + Quantité + Commentaire |
| Réunion de fin | Case + Texte | Validation + Compte-rendu |
| Check-list passation | Liste de contrôle | Tâches à transmettre |
| Commentaires | Texte riche | Observations générales |
| Signature conducteur | Signature électronique | Validation conducteur |
| Signature contrôleur | Signature électronique | Validation contrôleur |
| Évaluation qualité | Note (1-5) | Appréciation globale |

### Règles de validation
- **Quantités** : Obligatoires, somme doit correspondre au compteur
- **Taux de rebut** : Alerte si > 5% (paramétrable)
- **Causes** : Obligatoires si rebut > 0
- **Réunion** : Obligatoire pour travaux complexes
- **Check-list** : Tous les points doivent être validés si passation
- **Signatures** : Les deux signatures obligatoires pour clôture
- **Évaluation** : Obligatoire, avec justification si < 3

### Workflows associés
- Calcul automatique des indicateurs de performance
- Comparaison avec objectifs et historique
- Génération de rapport de production complet
- Archivage structuré des données de production
- Transmission au système de facturation
- Planification automatique des travaux similaires futurs
- Analyse statistique pour amélioration continue
