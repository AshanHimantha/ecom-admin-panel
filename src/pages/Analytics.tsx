import { SalesChart } from "@/components/SalesChart";
import { StatCard } from "@/components/StatCard";
import { TrendingUp, DollarSign, Users, ShoppingCart } from "lucide-react";

export default function Analytics() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">Track your business performance</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value="$45,231.89"
          change="+20.1% from last month"
          changeType="positive"
          icon={DollarSign}
        />
        <StatCard
          title="Sales"
          value="+2350"
          change="+180.1% from last month"
          changeType="positive"
          icon={TrendingUp}
        />
        <StatCard
          title="Customers"
          value="+12,234"
          change="+19% from last month"
          changeType="positive"
          icon={Users}
        />
        <StatCard
          title="Active Orders"
          value="+573"
          change="+201 since last hour"
          changeType="positive"
          icon={ShoppingCart}
        />
      </div>

      <SalesChart />
    </div>
  );
}
