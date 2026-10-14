import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { CreateAdminForm } from "@/components/CreateAdminForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin · Admins" };

export default async function AdminAdminsPage() {
  const user = await getSessionUser();
  if (!user || user.role !== "PRIMARY_ADMIN") redirect("/admin");

  const admins = await prisma.user.findMany({
    where: { role: { in: ["ADMIN", "PRIMARY_ADMIN"] } },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      username: true,
      phone: true,
      role: true,
      status: true,
      createdAt: true,
    },
  });

  return (
    <div className="container-app space-y-6 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Admin accounts</h1>
          <p className="text-sm text-slate-500">Primary admin only</p>
        </div>
        <a href="/admin" className="btn-secondary text-sm">
          ← Dashboard
        </a>
      </div>

      <div className="card divide-y divide-slate-100">
        {admins.map((a) => (
          <div key={a.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
            <div>
              <p className="font-medium">{a.username}</p>
              <p className="text-xs text-slate-500">
                {a.role} · {a.phone} · {a.status}
              </p>
            </div>
            <span className="text-xs text-slate-400">{a.createdAt.toISOString().slice(0, 10)}</span>
          </div>
        ))}
      </div>

      <section>
        <h2 className="mb-3 text-lg font-bold">Create secondary admin</h2>
        <CreateAdminForm />
      </section>
    </div>
  );
}
