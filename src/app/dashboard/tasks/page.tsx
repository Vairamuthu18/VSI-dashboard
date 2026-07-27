import { requireAgency } from "@/lib/auth";
import TasksView from "@/components/TasksView";

export const dynamic = "force-dynamic";

export default async function TasksPage() {
  await requireAgency();
  return <TasksView />;
}
