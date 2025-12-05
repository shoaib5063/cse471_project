import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRecipe extends Document {
  userId?: string; // Optional: for user-created recipes
  name: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  prepTime: number; // in minutes
  cookTime: number; // in minutes
  servings: number;
  calories: number;
  protein?: number;
  carbs?: number;
  fats?: number;
  imageUrl?: string;
  category: string[];
  dietaryTags: string[]; // e.g., ['vegetarian', 'gluten-free']
  difficulty: 'easy' | 'medium' | 'hard';
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RecipeSchema: Schema = new Schema(
  {
    userId: {
      type: String,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Recipe name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    ingredients: {
      type: [String],
      required: [true, 'Ingredients are required'],
      validate: {
        validator: (v: string[]) => v.length > 0,
        message: 'At least one ingredient is required',
      },
    },
    instructions: {
      type: [String],
      required: [true, 'Instructions are required'],
      validate: {
        validator: (v: string[]) => v.length > 0,
        message: 'At least one instruction is required',
      },
    },
    prepTime: {
      type: Number,
      required: [true, 'Prep time is required'],
      min: [0, 'Prep time cannot be negative'],
    },
    cookTime: {
      type: Number,
      required: [true, 'Cook time is required'],
      min: [0, 'Cook time cannot be negative'],
    },
    servings: {
      type: Number,
      required: [true, 'Servings are required'],
      min: [1, 'Servings must be at least 1'],
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
    category: {
      type: [String],
      default: [],
    },
    dietaryTags: {
      type: [String],
      default: [],
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes
RecipeSchema.index({ name: 'text', description: 'text' });
RecipeSchema.index({ category: 1 });
RecipeSchema.index({ dietaryTags: 1 });
RecipeSchema.index({ userId: 1, isPublic: 1 });

const Recipe: Model<IRecipe> = 
  mongoose.models.Recipe || mongoose.model<IRecipe>('Recipe', RecipeSchema);

export default Recipe;
