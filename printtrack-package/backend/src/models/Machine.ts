import mongoose, { Schema, Document } from 'mongoose';

export interface IMachine extends Document {
  nom: string;
  type: 'offset' | 'heliogravure';
  procede: string;
  caracteristiques: string;
  dateInstallation: Date;
  dateDerniereRevision?: Date;
  statut: 'disponible' | 'en_production' | 'en_maintenance' | 'hors_service';
  capaciteProduction: {
    vitesseMax: number;
    formatMax: string;
    formatMin: string;
  };
  maintenancePlanifiee?: Date;
}

const MachineSchema: Schema = new Schema(
  {
    nom: {
      type: String,
      required: [true, 'Le nom de la machine est requis'],
      trim: true,
      unique: true
    },
    type: {
      type: String,
      enum: ['offset', 'heliogravure'],
      required: [true, 'Le type de machine est requis']
    },
    procede: {
      type: String,
      required: [true, 'Le procédé est requis'],
      trim: true
    },
    caracteristiques: {
      type: String,
      required: [true, 'Les caractéristiques sont requises']
    },
    dateInstallation: {
      type: Date,
      required: [true, 'La date d\'installation est requise']
    },
    dateDerniereRevision: {
      type: Date
    },
    statut: {
      type: String,
      enum: ['disponible', 'en_production', 'en_maintenance', 'hors_service'],
      default: 'disponible'
    },
    capaciteProduction: {
      vitesseMax: {
        type: Number,
        required: [true, 'La vitesse maximale est requise']
      },
      formatMax: {
        type: String,
        required: [true, 'Le format maximal est requis']
      },
      formatMin: {
        type: String,
        required: [true, 'Le format minimal est requis']
      }
    },
    maintenancePlanifiee: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

const Machine = mongoose.model<IMachine>('Machine', MachineSchema);

export default Machine;
