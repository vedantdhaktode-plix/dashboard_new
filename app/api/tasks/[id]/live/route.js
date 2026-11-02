import { NextResponse } from "next/server";
import { GoLiveSchema } from "@/lib/workflow/contracts";
import { transitionTask } from "@/lib/workflow/engine";
import { mutateState } from "@/lib/store/unified-store";

export async function POST(_request, context) {
  try {
    const { id } = await context.params;
    const parsed = GoLiveSchema.safeParse({ taskId: id });

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid go-live submission" },
        { status: 400 }
      );
    }

    const { result } = await mutateState(async ({ tasks }) => {
      const index = tasks.findIndex((t) => t.id === id);
      if (index === -1) throw new Error(`Task ${id} not found`);

      const current = tasks[index];
      let updated = transitionTask(
        current,
        "published",
        "Performance Marketer",
        current.videoLink
          ? `Campaign pushed LIVE with approved video: ${current.videoLink}`
          : "Campaign pushed LIVE"
      );

      updated.publishedAt = new Date().toISOString();

      tasks[index] = updated;
      return updated;
    }, "Performance Marketer");

    return NextResponse.json({ task: result });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to push live" }, { status: 500 });
  }
}

