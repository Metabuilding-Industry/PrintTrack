import mongoose, { Schema, Document } from 'mongoose';

export interface IClient extends Document {
  nom: string;
  contact: string;
  adresse: string;
  telephone: string;
  email: string;
  preferences?: {
    procede?: 'offset' | 'heliogravure' | 'les_deux';
    delaiLivraison?: number;
    formatPreference?: string[];
    supportPreference?: string[];
  };
  actif: boolean;
  dateCreation: Date;
  dateModification: Date;
}

const ClientSchema: Schema = new Schema(
  {
    nom: {
      type: String,
      required: [true, 'Le nom du client est requis'],
      trim: true,
      unique: true
    },
    contact: {
      type: String,
      required: [true, 'Le nom du contact est requis'],
      trim: true
    },
    adresse: {
      type: String,
      required: [true, 'L\'adresse est requise'],
      trim: true
    },
    telephone: {
      type: String,
      required: [true, 'Le numéro de téléphone est requis'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'L\'email est requis'],
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Veuillez fournir un email valide']
    },
    preferences: {
      procede: {
        type: String,
        enum: ['offset', 'heliogravure', 'les_deux'],
        default: 'les_deux'
      },
      delaiLivraison: {
        type: Number
      },
      formatPreference: [{
        type: String
      }],
      supportPreference: [{
        type: String
      }]
    },
    actif: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: {
      createdAt: 'dateCreation',
      updatedAt: 'dateModification'
    }
  }
);

const Client = mongoose.model<IClient>('Client', ClientSchema);

export default Client;
