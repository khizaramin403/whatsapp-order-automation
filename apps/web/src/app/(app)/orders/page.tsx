import { OrderBoard } from "@/components/orders/order-board";
import { RoleGuard } from "@/components/layout/RoleGuard";

export default function OrdersPage() {
  return (
    <RoleGuard allowedRoles={["super_admin", "owner", "manager"]}>
      <OrderBoard />
    </RoleGuard>
  );
}
