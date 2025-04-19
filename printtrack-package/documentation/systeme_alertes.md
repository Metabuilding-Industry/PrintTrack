# Système d'Alertes et Notifications

## 1. Types d'Alertes

### Alertes de Paramètres Techniques
| Type d'Alerte | Description | Niveau de Priorité |
|---------------|-------------|-------------------|
| **Déviation Critique** | Paramètre hors des limites de sécurité ou qualité critiques | Urgent (Rouge) |
| **Déviation Importante** | Paramètre proche des limites ou tendance négative rapide | Élevé (Orange) |
| **Déviation Mineure** | Paramètre hors de la plage optimale mais dans les tolérances | Moyen (Jaune) |
| **Tendance Anormale** | Évolution inhabituelle d'un paramètre dans le temps | Bas (Bleu) |

### Alertes de Production
| Type d'Alerte | Description | Niveau de Priorité |
|---------------|-------------|-------------------|
| **Arrêt Machine** | Arrêt non planifié de la machine | Urgent (Rouge) |
| **Ralentissement** | Vitesse de production inférieure à l'objectif | Moyen (Jaune) |
| **Rebut Excessif** | Taux de rebut supérieur au seuil acceptable | Élevé (Orange) |
| **Fin de Consommable** | Niveau bas d'encre, solvant, support, etc. | Moyen (Jaune) |

### Alertes de Qualité
| Type d'Alerte | Description | Niveau de Priorité |
|---------------|-------------|-------------------|
| **Non-Conformité Critique** | Défaut majeur affectant la fonctionnalité du produit | Urgent (Rouge) |
| **Non-Conformité Esthétique** | Défaut visuel mais n'affectant pas la fonctionnalité | Élevé (Orange) |
| **Variation Couleur** | Écart colorimétrique par rapport à la référence | Moyen (Jaune) |
| **Défaut Récurrent** | Même défaut apparaissant à intervalles réguliers | Élevé (Orange) |

### Alertes de Planification
| Type d'Alerte | Description | Niveau de Priorité |
|---------------|-------------|-------------------|
| **Retard Production** | Temps de production dépassant l'estimation | Moyen (Jaune) |
| **Conflit Ressources** | Ressource requise déjà assignée à un autre travail | Élevé (Orange) |
| **Maintenance Requise** | Seuil de maintenance préventive atteint | Moyen (Jaune) |
| **Expiration Validation** | BAT ou validation client proche de l'expiration | Bas (Bleu) |

### Alertes Système
| Type d'Alerte | Description | Niveau de Priorité |
|---------------|-------------|-------------------|
| **Erreur Application** | Dysfonctionnement technique de l'application | Urgent (Rouge) |
| **Synchronisation Échouée** | Échec de synchronisation des données | Élevé (Orange) |
| **Espace Stockage Faible** | Espace disque insuffisant pour les données | Moyen (Jaune) |
| **Mise à Jour Disponible** | Nouvelle version de l'application disponible | Bas (Bleu) |

## 2. Seuils de Déclenchement

### Paramètres Offset
| Paramètre | Seuil Alerte Mineure | Seuil Alerte Majeure | Seuil Alerte Critique |
|-----------|----------------------|----------------------|------------------------|
| **pH Mouillage** | 4.8-5.2 | 4.6-4.8 ou 5.2-5.4 | <4.6 ou >5.4 |
| **Conductivité** | ±10% valeur cible | ±15% valeur cible | ±20% valeur cible |
| **Température Encre** | ±2°C valeur cible | ±4°C valeur cible | ±6°C valeur cible |
| **Densité Optique** | ±0.05 valeur cible | ±0.1 valeur cible | ±0.15 valeur cible |
| **Pression Blanchet** | ±5% valeur cible | ±10% valeur cible | ±15% valeur cible |

### Paramètres Héliogravure
| Paramètre | Seuil Alerte Mineure | Seuil Alerte Majeure | Seuil Alerte Critique |
|-----------|----------------------|----------------------|------------------------|
| **Concentration Solvant** | ±3% valeur cible | ±5% valeur cible | ±8% valeur cible |
| **Température Solvant** | ±3°C valeur cible | ±5°C valeur cible | ±8°C valeur cible |
| **Tension Cylindre** | ±5% valeur cible | ±10% valeur cible | ±15% valeur cible |
| **Température Sécheur** | ±5°C valeur cible | ±10°C valeur cible | ±15°C valeur cible |
| **Pression Raclage** | ±5% valeur cible | ±10% valeur cible | ±15% valeur cible |

### Paramètres de Production
| Paramètre | Seuil Alerte Mineure | Seuil Alerte Majeure | Seuil Alerte Critique |
|-----------|----------------------|----------------------|------------------------|
| **Vitesse Production** | <90% objectif | <80% objectif | <70% objectif |
| **Taux de Rebut** | >3% | >5% | >8% |
| **Temps d'Arrêt** | >10% temps total | >15% temps total | >20% temps total |
| **Temps de Calage** | >110% standard | >125% standard | >150% standard |
| **Niveau Consommables** | <20% restant | <10% restant | <5% restant |

### Paramètres de Qualité
| Paramètre | Seuil Alerte Mineure | Seuil Alerte Majeure | Seuil Alerte Critique |
|-----------|----------------------|----------------------|------------------------|
| **Écart Colorimétrique (ΔE)** | >2 | >3.5 | >5 |
| **Repérage** | >0.1mm | >0.15mm | >0.2mm |
| **Défauts Visuels** | >1 par 1000 | >3 par 1000 | >5 par 1000 |
| **Contraste d'Impression** | <90% référence | <85% référence | <80% référence |

## 3. Système de Notification

### Canaux de Notification
| Canal | Description | Cas d'Utilisation |
|-------|-------------|-------------------|
| **Notification In-App** | Alerte visuelle dans l'interface utilisateur | Toutes les alertes |
| **Email** | Message envoyé aux adresses configurées | Alertes de priorité moyenne à urgente |
| **SMS** | Message texte aux numéros configurés | Alertes de priorité élevée à urgente |
| **Notification Push** | Alerte sur appareil mobile | Toutes les alertes pour utilisateurs mobiles |
| **Alarme Sonore** | Signal sonore sur le poste de travail | Alertes urgentes uniquement |
| **Tableau d'Affichage** | Écran de supervision en atelier | Toutes les alertes visibles par l'équipe |

### Configuration des Destinataires
| Rôle | Types d'Alertes Reçues | Canaux |
|------|------------------------|--------|
| **Conducteur Machine** | Paramètres techniques, Production, Qualité | In-App, Push, Alarme |
| **Contrôleur Qualité** | Qualité, Paramètres critiques | In-App, Push, Email |
| **Responsable Production** | Production, Planification, Résumés | In-App, Email, SMS (urgentes) |
| **Responsable Maintenance** | Maintenance, Arrêts machine | In-App, Email, SMS |
| **Direction** | Résumés quotidiens, Alertes critiques | Email, Tableau de bord |
| **Service Client** | Retards significatifs, Qualité critique | Email |

### Temporalité des Notifications
| Type d'Alerte | Fréquence | Répétition | Escalade |
|---------------|-----------|------------|----------|
| **Urgent (Rouge)** | Immédiate | Toutes les 15 min jusqu'à acquittement | Après 30 min sans acquittement |
| **Élevé (Orange)** | Immédiate | Toutes les 30 min jusqu'à acquittement | Après 1h sans acquittement |
| **Moyen (Jaune)** | Immédiate | Une fois | Non |
| **Bas (Bleu)** | Groupée (toutes les 2h) | Non | Non |
| **Résumé Quotidien** | Fin de journée | Non | Non |

### Mécanisme d'Acquittement
| Action | Description | Effet |
|--------|-------------|-------|
| **Visualisation** | L'alerte a été vue par l'utilisateur | Marquée comme "vue" |
| **Acquittement Simple** | L'utilisateur reconnaît l'alerte | Arrêt des répétitions |
| **Acquittement avec Action** | L'utilisateur indique l'action corrective | Arrêt des répétitions et enregistrement de l'action |
| **Transfert** | L'utilisateur transfère l'alerte à un autre rôle | Changement de destinataire |
| **Clôture** | L'utilisateur résout le problème | Alerte archivée |

### Escalade Automatique
| Condition | Action d'Escalade |
|-----------|-------------------|
| **Alerte urgente sans acquittement après 30 min** | Notification au niveau hiérarchique supérieur |
| **Multiple alertes similaires en 24h** | Création d'un incident de niveau supérieur |
| **Dépassement critique persistant >1h** | Notification au responsable production et maintenance |
| **Arrêt machine >30 min** | Notification à la direction et planification |

## 4. Interface Utilisateur des Alertes

### Tableau de Bord des Alertes
- Vue consolidée de toutes les alertes actives
- Filtrage par type, priorité, machine, travail
- Tri par heure, priorité, statut
- Indicateurs visuels de gravité (code couleur)
- Compteurs d'alertes par catégorie

### Détail d'Alerte
- Description complète du problème
- Valeurs actuelles et valeurs cibles
- Historique des occurrences similaires
- Actions recommandées
- Boutons d'action rapide (acquitter, transférer, clôturer)
- Champ de commentaire pour documentation

### Historique et Analyse
- Journal complet des alertes passées
- Graphiques de tendance par type d'alerte
- Analyse de corrélation entre alertes
- Temps moyen de résolution par type
- Identification des problèmes récurrents

## 5. Intégration avec les Autres Modules

### Module de Production
- Déclenchement automatique d'alertes basé sur les relevés de paramètres
- Affichage contextuel des alertes dans l'interface de suivi de production
- Suggestion d'actions correctives basées sur l'historique

### Module de Qualité
- Liaison entre alertes et points de contrôle qualité
- Déclenchement d'inspections supplémentaires en cas d'alerte
- Traçabilité des lots potentiellement affectés par une alerte

### Module de Maintenance
- Génération automatique de demandes d'intervention
- Priorisation des interventions selon la gravité des alertes
- Planification préventive basée sur les tendances d'alertes

### Module de Reporting
- Inclusion des statistiques d'alertes dans les rapports de production
- Analyse de l'impact des alertes sur les KPIs
- Identification des opportunités d'amélioration

## 6. Personnalisation et Configuration

### Paramètres Configurables par l'Administrateur
- Seuils de déclenchement par machine et type de travail
- Destinataires des notifications par type d'alerte
- Canaux de communication activés
- Fréquence des notifications et résumés
- Règles d'escalade automatique

### Paramètres Configurables par l'Utilisateur
- Préférences de notification personnelles
- Filtres de vue du tableau de bord
- Délégation temporaire (absences, congés)
- Mode "Ne pas déranger" avec exceptions

## 7. Exemples de Scénarios d'Alertes

### Scénario 1: Déviation pH en Offset
1. Le système détecte un pH de 5.3 (seuil d'alerte mineure)
2. Notification in-app au conducteur
3. Si non corrigé et atteignant 5.5 (seuil critique):
   - Notification push et alarme au conducteur
   - Email au contrôleur qualité
   - Suggestion d'action corrective affichée

### Scénario 2: Arrêt Machine Non Planifié
1. Le système détecte un arrêt de production
2. Notification immédiate au conducteur et responsable production
3. Après 15 minutes sans reprise:
   - Notification au service maintenance
   - Mise à jour du planning de production
   - Alerte au responsable client si impact sur délai

### Scénario 3: Problème Qualité Récurrent
1. Le système détecte un même défaut pour la 3ème fois
2. Notification au contrôleur qualité et conducteur
3. Création automatique d'un incident qualité
4. Suggestion d'analyse approfondie
5. Notification au responsable production si non résolu après 3 occurrences
