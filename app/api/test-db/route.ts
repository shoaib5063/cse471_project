import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb/connection';

export async function GET() {
  try {
    await connectDB();
    
    return NextResponse.json({
      success: true,
      message: 'MongoDB connection successful!',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('MongoDB connection error:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'MongoDB connection failed',
        error: error.message,
      },
      { status: 500 }
    );
  }
}
