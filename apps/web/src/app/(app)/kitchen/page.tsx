import { KitchenView } from "@/components/kitchen/kitchen-view";
import { RoleGuard } from "@/components/layout/RoleGuard";

export default function KitchenPage() {
  return (
    <RoleGuard allowedRoles={["super_admin", "owner", "manager", "chef"]}>
      <KitchenView />
    </RoleGuard>
  );
}
