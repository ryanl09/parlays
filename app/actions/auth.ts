"use server";

import { hash } from "bcrypt";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import prisma from "@/lib/prisma";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters.")
    .max(30, "Username cannot exceed 30 characters.")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores."),
  email: z.string().email("Please enter a valid email address."),
  password: z
    .string()
    .min(3, "Password must be at least 3 characters."),
});

type RegisterInput = z.infer<typeof registerSchema>;

export async function registerUser(data: RegisterInput) {
  try {
    const validatedData = registerSchema.parse(data);

    const existingEmail = await prisma.users.findUnique({
      where: { email: validatedData.email },
    });

    if (existingEmail) {
      return { success: false, message: "Email already in use" };
    }

    const existingUsername = await prisma.users.findUnique({
      where: { username: validatedData.username },
    });

    if (existingUsername) {
      return { success: false, message: "Username already taken" };
    }

    // Generate UUID
    const id = uuidv4();

    // Hash password
    const hashedPassword = await hash(validatedData.password, 10);

    // Create user
    await prisma.users.create({
      data: {
        id,
        name: validatedData.name,
        username: validatedData.username,
        email: validatedData.email,
        password: hashedPassword,
      },
    });

    return { success: true, message: "Registration successful" };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: error.errors[0].message,
      };
    }
    
    return {
      success: false,
      message: "An error occurred during registration",
    };
  }
} 