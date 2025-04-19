export interface BonFabrication {
  _id: string;
  numero: string;
  date: string;
  etat: 'en_attente' | 'en_cours' | 'termine' | 'annule';
  dateCreation: string;
  dateModification: string;
  dateCloture?: string;
  
  // Informations client
  client: {
    _id: string;
    nom: string;
    contact: string;
    email: string;
    telephone: string;
  };
  
  // Informations travail
  travail: {
    designation: string;
    quantite: number;
    format: string;
    support: string;
    couleurs: string[];
    finitions: string[];
    commentaires?: string;
  };
  
  // Informations machine
  machine: {
    _id: string;
    nom: string;
    type: 'offset' | 'heliogravure';
    caracteristiques: string;
  };
  
  // Paramètres techniques
  parametres: {
    _id: string;
    type: string;
    valeur: number;
    unite: string;
    dateReleve: string;
    commentaire?: string;
  }[];
  
  // Contrôles qualité
  controles: {
    _id: string;
    pointControle: string;
    valeurMesuree: number;
    conforme: boolean;
    dateControle: string;
    commentaire?: string;
  }[];
  
  // Incidents
  incidents: {
    _id: string;
    type: string;
    description: string;
    gravite: 'faible' | 'moyenne' | 'elevee' | 'critique';
    dateDebut: string;
    dateFin?: string;
    actionCorrective?: string;
    statut: 'ouvert' | 'en_cours' | 'resolu';
  }[];
  
  // Temps de production
  tempsProduction: {
    _id: string;
    type: 'preparation' | 'production' | 'arret' | 'maintenance';
    debut: string;
    fin?: string;
    duree?: number;
    motif?: string;
    commentaire?: string;
  }[];
  
  // Documents associés
  documents: {
    _id: string;
    type: string;
    nom: string;
    chemin: string;
    dateCreation: string;
    taille: number;
    format: string;
  }[];
  
  // Personnel assigné
  personnel: {
    _id: string;
    nom: string;
    prenom: string;
    fonction: string;
  }[];
}

export interface BonFabricationInput {
  numero?: string;
  date: string;
  etat: 'en_attente' | 'en_cours' | 'termine' | 'annule';
  
  // Informations client
  client: string | {
    _id: string;
    nom: string;
    contact: string;
    email: string;
    telephone: string;
  };
  
  // Informations travail
  travail: {
    designation: string;
    quantite: number;
    format: string;
    support: string;
    couleurs: string[];
    finitions: string[];
    commentaires?: string;
  };
  
  // Informations machine
  machine: string | {
    _id: string;
    nom: string;
    type: 'offset' | 'heliogravure';
    caracteristiques: string;
  };
  
  // Personnel assigné
  personnel: string[] | {
    _id: string;
    nom: string;
    prenom: string;
    fonction: string;
  }[];
}
