import { DeliveryView } from "@/components/delivery/delivery-view";
import { RoleGuard } from "@/components/layout/RoleGuard";

export default function DeliveryPage() {
  return (
    <RoleGuard allowedRoles={["super_admin", "owner", "manager", "rider"]}>
      <DeliveryView />
    </RoleGuard>
  );
}
