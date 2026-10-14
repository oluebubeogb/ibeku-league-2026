import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import {
  requirePrimaryAdmin,
  AuthError,
  hashPassword,
  normalizeUsername,
  normalizePhone,
  audit,
} from "@/lib/auth";

const schema = z.object({
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/),
  phone: z.string().min(7).max(20),
  password: z.string().min(8).max(128),
});

export async function POST(req: NextRequest) {
  try {
    const primary = await requirePrimaryAdmin();
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { username, phone, password } = parsed.data;
    const normalizedUsername = normalizeUsername(username);
    const normalizedPhone = normalizePhone(phone);

    const existing = await prisma.user.findFirst({
      where: { OR: [{ normalizedUsername }, { normalizedPhone }] },
    });
    if (existing) {
      return NextResponse.json({ error: "Username or phone already in use" }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const admin = await prisma.user.create({
      data: {
        username: username.trim(),
        normalizedUsername,
        phone: phone.trim(),
        normalizedPhone,
        passwordHash,
        role: "ADMIN",
        status: "ACTIVE",
      },
    });

    await audit(primary.id, "ADMIN_CREATE", "User", admin.id, { username: admin.username });

    return NextResponse.json({ ok: true, id: admin.id });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    console.error("create admin", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
