import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMeal extends Document {
  userId: string;
  mealName: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  calories: number;
  protein?: number;
  carbs?: number;
  fats?: number;
  imageUrl?: string;
  notes?: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MealSchema: Schema = new Schema(
  {
    userId: {
      type: String,
      required: [true, 'User ID is required'],
      index: true,
    },
    mealName: {
      type: String,
      required: [true, 'Meal name is required'],
      trim: true,
    },
    mealType: {
      type: String,
      enum: ['breakfast', 'lunch', 'dinner', 'snack'],
      required: [true, 'Meal type is required'],
    },
    calories: {
      type: Number,
      required: [true, 'Calories are required'],
      min: [0, 'Calories cannot be negative'],
    },
    protein: {
      type: Number,
      min: [0, 'Protein cannot be negative'],
    },
    carbs: {
      type: Number,
      min: [0, 'Carbs cannot be negative'],
    },
    fats: {
      type: Number,
      min: [0, 'Fats cannot be negative'],
    },
    imageUrl: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for better query performance
MealSchema.index({ userId: 1, date: -1 });
MealSchema.index({ userId: 1, mealType: 1 });

// Prevent model recompilation in development
const Meal: Model<IMeal> = 
  mongoose.models.Meal || mongoose.model<IMeal>('Meal', MealSchema);

export default Meal;
