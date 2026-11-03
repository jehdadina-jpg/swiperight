import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { User } from "../models/User.js";
import { HttpError, parse, wrap } from "../middleware/error.js";
import { requireAuth, signToken } from "../middleware/auth.js";

const router = Router();

const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").max(72),
  fullName: z.string().trim().max(80).optional().default(""),
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

router.post(
  "/register",
  wrap(async (req, res) => {
    const { email, password, fullName } = parse(registerSchema, req.body);
    if (await User.exists({ email })) throw new HttpError(409, "An account with this email already exists");
    const user = await User.create({ email, fullName, passwordHash: await bcrypt.hash(password, 10) });
    res.status(201).json({ token: signToken(user), user });
  })
);

router.post(
  "/login",
  wrap(async (req, res) => {
    const { email, password } = parse(loginSchema, req.body);
    const user = await User.findOne({ email });
    // Same message for unknown email and wrong password so accounts can't be probed
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new HttpError(401, "Incorrect email or password");
    }
    res.json({ token: signToken(user), user });
  })
);

router.get("/me", requireAuth, (req, res) => res.json({ user: req.user }));

export default router;
