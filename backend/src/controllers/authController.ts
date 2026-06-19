import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createUser, findUserByEmail } from "../models/userModel";
import { JwtPayload } from "jsonwebtoken";

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password
    } = req.body;

    const existing = await findUserByEmail(email);
    if(existing) {
      res.status (400).json({ message: "Email already registered"});
      return;

    }

    const hashedPassword =await bcrypt.hash(password, 10);
    const user = await createUser(name, email, hashedPassword);

    res.status(201).json({
      message: "User registed successfully",
      user : {id : user.id, name: user.name, email: user.email }
    });
  } catch (err){
    console.log("Register error:" err);
    res.status(500).json({ message: "Server error" , error: (err as Error ).message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try{
    const { email, password } = req.body;
    const user = await findUserByEmail(email);
    if(!User) {
      res.status(401).json({ message: "Invalid credentials" });
      return;

    }

    const isMatch = await bcrypt.compare(password, user.password);

    if(!isMatch) {
      res.status(401).json({ message: "Invalid credentails" });
      return;
    }

    const payload: JwtPayload = { userId: user.id, email: user.email };

    const token = jwt.sign(payload, process.env.JWT_SECRET as string, {
      expiresIn: "7d"
    });

    res.status(200).json({
      message: "Login successful",
      token,
      user: { id : user.id, name: user.name, email: user.email }
    });
  } catch(err) {
    console.log("Login error : ", err);
    res.status(500).json({ message: "Server error", error: (err as Error).message });
  }
};