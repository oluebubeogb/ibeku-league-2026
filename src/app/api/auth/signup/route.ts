import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import {
  hashPassword,
  createSession,
  setSessionCookie,
  normalizeUsername,
  normalizePhone,
} from "@/lib/auth";

const schema = z.object({
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_]+$/, "Letters, numbers and underscore only"),
  phone: z.string().min(7).max(20),
  password: z.string().min(8).max(128),
  birthYear: z.number().int().min(1940).max(2015),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { username, phone, password, birthYear } = parsed.data;
    const normalizedUsername = normalizeUsername(username);
    const normalizedPhone = normalizePhone(phone);

    if (normalizedPhone.length < 7) {
      return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });
    }

    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ normalizedUsername }, { normalizedPhone }],
      },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Username or phone number already registered" },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        username: username.trim(),
        normalizedUsername,
        phone: phone.trim(),
        normalizedPhone,
        passwordHash,
        birthYear,
        role: "FAN",
      },
    });

    const token = await createSession(user.id);
    await setSessionCookie(token);

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("signup error", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
