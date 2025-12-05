import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb/connection';
import Meal from '../../../lib/mongodb/models/Meal';

// GET all meals for a user
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      );
    }
    
    const meals = await Meal.find({ userId })
      .sort({ date: -1 })
      .limit(100);
    
    return NextResponse.json({
      success: true,
      data: meals,
      count: meals.length,
    });
  } catch (error: any) {
    console.error('Error fetching meals:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// POST create a new meal
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { userId, mealName, mealType, calories, protein, carbs, fats, imageUrl, notes, date } = body;
    
    if (!userId || !mealName || !mealType || !calories) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const meal = await Meal.create({
      userId,
      mealName,
      mealType,
      calories,
      protein,
      carbs,
      fats,
      imageUrl,
      notes,
      date: date || new Date(),
    });
    
    return NextResponse.json({
      success: true,
      data: meal,
      message: 'Meal created successfully',
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating meal:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
