import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RecentOrders } from "@/components/RecentOrders";

export default function Orders() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Orders</h1>
        <p className="text-muted-foreground">View and manage all orders</p>
      </div>

      <RecentOrders />
    </div>
  );
}
