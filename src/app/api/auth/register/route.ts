import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name, password } = body;

    if (!email || !email.includes('@') || !password || password.trim().length < 6) {
      return NextResponse.json(
        { message: 'Invalid input. Password must be at least 6 characters long.' },
        { status: 422 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'User exists already!' },
        { status: 422 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        name,
        password: hashedPassword,
      },
    });

    return NextResponse.json(
      { message: 'User created successfully!', user: { id: user.id, name: user.name, email: user.email } },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'Could not create user.' },
      { status: 500 }
    );
  }
}
