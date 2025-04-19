import mongoose, { Schema, Document } from 'mongoose';

export interface IIncident extends Document {
  bonFabrication: mongoose.Types.ObjectId;
  machine: mongoose.Types.ObjectId;
  personnel: mongoose.Types.ObjectId;
  type: string;
  description: string;
  gravite: 'faible' | 'moyenne' | 'elevee' | 'critique';
  dateDebut: Date;
  dateFin?: Date;
  actionCorrective?: string;
  statut: 'ouvert' | 'en_cours' | 'resolu';
  impactProduction?: string;
  tempsArret?: number;
}

const IncidentSchema: Schema = new Schema(
  {
    bonFabrication: {
      type: Schema.Types.ObjectId,
      ref: 'BonFabrication',
      required: true
    },
    machine: {
      type: Schema.Types.ObjectId,
      ref: 'Machine',
      required: true
    },
    personnel: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    type: {
      type: String,
      required: [true, 'Le type d\'incident est requis'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'La description est requise'],
      trim: true
    },
    gravite: {
      type: String,
      enum: ['faible', 'moyenne', 'elevee', 'critique'],
      required: [true, 'La gravité est requise']
    },
    dateDebut: {
      type: Date,
      default: Date.now
    },
    dateFin: {
      type: Date
    },
    actionCorrective: {
      type: String,
      trim: true
    },
    statut: {
      type: String,
      enum: ['ouvert', 'en_cours', 'resolu'],
      default: 'ouvert'
    },
    impactProduction: {
      type: String,
      trim: true
    },
    tempsArret: {
      type: Number
    }
  },
  {
    timestamps: true
  }
);

// Middleware pour calculer le temps d'arrêt
IncidentSchema.pre('save', function(next) {
  if (this.dateFin && this.dateDebut) {
    this.tempsArret = Math.round((this.dateFin.getTime() - this.dateDebut.getTime()) / (1000 * 60)); // en minutes
  }
  
  if (this.dateFin && this.statut !== 'resolu') {
    this.statut = 'resolu';
  }
  
  next();
});

const Incident = mongoose.model<IIncident>('Incident', IncidentSchema);

export default Incident;
