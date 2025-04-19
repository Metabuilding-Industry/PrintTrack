import mongoose, { Schema, Document } from 'mongoose';

export interface IParametreTechnique extends Document {
  bonFabrication: mongoose.Types.ObjectId;
  machine: mongoose.Types.ObjectId;
  personnel: mongoose.Types.ObjectId;
  type: string;
  valeur: number;
  unite: string;
  dateReleve: Date;
  commentaire?: string;
}

const ParametreTechniqueSchema: Schema = new Schema(
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
      required: [true, 'Le type de paramètre est requis'],
      trim: true
    },
    valeur: {
      type: Number,
      required: [true, 'La valeur est requise']
    },
    unite: {
      type: String,
      required: [true, 'L\'unité est requise'],
      trim: true
    },
    dateReleve: {
      type: Date,
      default: Date.now
    },
    commentaire: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

const ParametreTechnique = mongoose.model<IParametreTechnique>('ParametreTechnique', ParametreTechniqueSchema);

export default ParametreTechnique;
