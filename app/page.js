import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth/session";
import UnifiedDashboard from "@/components/UnifiedDashboard";
import MasterAdminDashboard from "@/components/MasterAdminDashboard";
import { getState } from "@/lib/store/unified-store";
import { filterTasksForUser } from "@/lib/workflow/engine";

export const dynamic = "force-dynamic";

export default async function Page() {
  const sessionUser = await getServerSession();
  if (!sessionUser) {
    redirect("/login");
  }

  if (sessionUser.role === "master_admin") {
    return <MasterAdminDashboard />;
  }

  const state = await getState();
  const allocatedTasks = filterTasksForUser(state.tasks || [], sessionUser);

  return (
    <UnifiedDashboard
      initialTasks={allocatedTasks}
      initialUsers={state.users || []}
      initialNotifications={state.notifications || []}
      sessionUser={sessionUser}
    />
  );
}
