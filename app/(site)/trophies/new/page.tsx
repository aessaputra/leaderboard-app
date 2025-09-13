import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ShieldCheck, Trophy } from "lucide-react";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import SubmitButton from "./submit-button";

export default async function NewTrophyPage({ searchParams }: { searchParams: any }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const sp = await searchParams;

  async function submit(formData: FormData) {
    "use server";
    const s = await getServerSession(authOptions);
    if (!s) throw new Error("Unauthorized");

    const comp = String(formData.get("competition") ?? "");
    if (comp !== "UCL" && comp !== "EUROPA") {
      throw new Error("Kompetisi tidak valid");
    }

    await prisma.trophyAward.create({
      data: {
        userId: s.user.id,
        competition: comp as "UCL" | "EUROPA",
        approved: false,
        createdBy: s.user.id, // pengaju = pembuat
      },
    });

    // refresh data profil & leaderboard
    revalidatePath("/me");
    revalidatePath("/leaderboard");
    redirect("/trophies/new?submitted=1");
  }

  return (
    <main className="mx-auto w-full max-w-md p-5">
      <h1 className="mb-4 text-2xl font-semibold">Ajukan Trophy</h1>

      {sp?.submitted === "1" && (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800 shadow-sm dark:border-emerald-400/30 dark:bg-emerald-500/15 dark:text-emerald-200">
          Pengajuan trophy berhasil. Menunggu FIFA memberikan trophy.
        </div>
      )}

      <form action={submit} className="space-y-4">
        {/* Segmented toggle */}
        <div
          role="radiogroup"
          aria-label="Pilih kompetisi"
          className="grid grid-cols-2 gap-3"
        >
          <label className="relative overflow-hidden rounded-2xl border p-0.5 border-gray-200 bg-white dark:border-white/12 dark:bg-white/[0.04]">
            <input
              type="radio"
              name="competition"
              value="UCL"
              required
              className="peer sr-only"
            />
            <div
              className="flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-[15px] font-semibold transition border
                         border-transparent peer-checked:border-brand-300 peer-checked:bg-brand-50 peer-checked:text-brand-600
                         dark:peer-checked:border-blue-400/40 dark:peer-checked:bg-blue-500/15 dark:peer-checked:text-blue-200"
            >
              <Trophy className="h-4 w-4" />
              UCL
            </div>
          </label>

          <label className="relative overflow-hidden rounded-2xl border p-0.5 border-gray-200 bg-white dark:border-white/12 dark:bg-white/[0.04]">
            <input
              type="radio"
              name="competition"
              value="EUROPA"
              className="peer sr-only"
            />
            <div
              className="flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-[15px] font-semibold transition border
                         border-transparent peer-checked:border-amber-300 peer-checked:bg-amber-50 peer-checked:text-amber-700
                         dark:peer-checked:border-amber-400/40 dark:peer-checked:bg-amber-500/15 dark:peer-checked:text-amber-200"
            >
              <ShieldCheck className="h-4 w-4" />
              EUROPA
            </div>
          </label>
        </div>

        {/* Submit */}
        <SubmitButton label="Kirim Pengajuan" />

        {/* info note removed per request */}
      </form>
    </main>
  );
}
