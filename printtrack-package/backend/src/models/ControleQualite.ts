import mongoose, { Schema, Document } from 'mongoose';

export interface IControleQualite extends Document {
  bonFabrication: mongoose.Types.ObjectId;
  personnel: mongoose.Types.ObjectId;
  pointControle: string;
  valeurMesuree: number;
  valeurReference?: number;
  toleranceMin?: number;
  toleranceMax?: number;
  unite: string;
  conforme: boolean;
  dateControle: Date;
  commentaire?: string;
  actionCorrective?: string;
}

const ControleQualiteSchema: Schema = new Schema(
  {
    bonFabrication: {
      type: Schema.Types.ObjectId,
      ref: 'BonFabrication',
      required: true
    },
    personnel: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    pointControle: {
      type: String,
      required: [true, 'Le point de contrôle est requis'],
      trim: true
    },
    valeurMesuree: {
      type: Number,
      required: [true, 'La valeur mesurée est requise']
    },
    valeurReference: {
      type: Number
    },
    toleranceMin: {
      type: Number
    },
    toleranceMax: {
      type: Number
    },
    unite: {
      type: String,
      required: [true, 'L\'unité est requise'],
      trim: true
    },
    conforme: {
      type: Boolean,
      required: true
    },
    dateControle: {
      type: Date,
      default: Date.now
    },
    commentaire: {
      type: String,
      trim: true
    },
    actionCorrective: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

// Middleware pour déterminer automatiquement la conformité
ControleQualiteSchema.pre('save', function(next) {
  if (this.valeurReference !== undefined && (this.toleranceMin !== undefined || this.toleranceMax !== undefined)) {
    const min = this.toleranceMin !== undefined ? this.valeurReference - this.toleranceMin : Number.NEGATIVE_INFINITY;
    const max = this.toleranceMax !== undefined ? this.valeurReference + this.toleranceMax : Number.POSITIVE_INFINITY;
    
    this.conforme = this.valeurMesuree >= min && this.valeurMesuree <= max;
  }
  
  next();
});

const ControleQualite = mongoose.model<IControleQualite>('ControleQualite', ControleQualiteSchema);

export default ControleQualite;
