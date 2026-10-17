import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/Toast";
import { Tracker, type StageKey, type TrackerItem } from "@/components/ui/Tracker";
import { requireUser } from "@/lib/supabase/server";
import { setStage } from "./actions";

export const metadata = { title: "Tracker" };

type Row = { stage: StageKey; updated_at: string; jobs: { id: string; title: string; company: string } };

export default async function TrackerPage() {
  const { supabase, user } = await requireUser();
  const { data } = await supabase
    .from("applications")
    .select("stage, updated_at, jobs(id, title, company)")
    .eq("user_id", user!.id)
    .order("updated_at", { ascending: false });
  const items: TrackerItem[] = ((data ?? []) as unknown as Row[]).map((r) => ({
    jobId: r.jobs.id,
    title: r.jobs.title,
    company: r.jobs.company,
    stage: r.stage,
    updatedAt: r.updated_at,
  }));

  async function move(jobId: string, stage: StageKey) {
    "use server";
    await setStage(jobId, stage);
  }

  return (
    <>
      <h1 className="mb-1 text-h1 font-bold md:text-h1-lg">Applications</h1>
      <p className="mb-6 text-body text-ink-2">Jobs you save, apply to or email HR about land here. Drag to update the stage.</p>
      {items.length === 0 ? (
        <EmptyState text="Nothing tracked yet. Save a job from your matches to start." action={<ButtonLink href="/dashboard" variant="secondary">See matches</ButtonLink>} />
      ) : (
        <Tracker items={items} onMove={move} />
      )}
    </>
  );
}
