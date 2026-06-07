import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { supabase } from "../config/supabase";
import { env } from "../config/env";

function normalizeEmail(email: unknown) {
  return typeof email === "string" ? email.trim().toLowerCase() : "";
}

function cleanString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function createToken(user: { id: string; email: string }) {
  if (!env.jwtSecret) {
    throw new Error("JWT_SECRET is missing from backend/.env");
  }

  return jwt.sign(
    { userId: user.id, email: user.email },
    env.jwtSecret,
    { expiresIn: "7d" }
  );
}

export const signup = async (req: Request, res: Response) => {
  try {
    const fullName = cleanString(req.body?.full_name);
    const email = normalizeEmail(req.body?.email);
    const password = cleanString(req.body?.password);

    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Full name, email, and password are required",
      });
    }

    if (!email.includes("@")) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid email",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const { data: existingUser, error: lookupError } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (lookupError) {
      console.log("Signup lookup error:", lookupError);
      return res.status(500).json({
        success: false,
        message: "Could not check existing user. Confirm Supabase env and schema.",
      });
    }

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { data: user, error } = await supabase
      .from("users")
      .insert([{ full_name: fullName, email, password: hashedPassword }])
      .select("id,full_name,email")
      .single();

    if (error || !user) {
      console.log("Signup insert error:", error);
      return res.status(500).json({
        success: false,
        message: "Error creating user. Confirm the users table exists in Supabase.",
      });
    }

    const token = createToken(user);

    return res.status(201).json({
      success: true,
      token,
      user,
    });
  } catch (error) {
    console.log("Signup error:", error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Server error",
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const password = cleanString(req.body?.password);

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const { data: user, error } = await supabase
      .from("users")
      .select("id,full_name,email,password")
      .eq("email", email)
      .maybeSingle();

    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = createToken(user);

    return res.json({
      success: true,
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
      },
    });
  } catch (error) {
    console.log("Login error:", error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Server error",
    });
  }
};