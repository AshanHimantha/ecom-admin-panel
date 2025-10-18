import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { SalesChart } from "@/components/SalesChart";
import { RecentOrders } from "@/components/RecentOrders";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ShoppingCart, Users, Package } from "lucide-react";
import { QuickActions } from "@/components/QuickActions";

const Index = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here's what's happening with your store today.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Revenue"
            value="$45,231"
            change="+20.1% from last month"
            changeType="positive"
            icon={DollarSign}
            iconColor="bg-gradient-to-br from-primary to-purple-600"
          />
          <StatCard
            title="Orders"
            value="1,234"
            change="+15% from last month"
            changeType="positive"
            icon={ShoppingCart}
            iconColor="bg-gradient-to-br from-blue-500 to-cyan-500"
          />
          <StatCard
            title="Customers"
            value="2,345"
            change="+8% from last month"
            changeType="positive"
            icon={Users}
            iconColor="bg-gradient-to-br from-green-500 to-emerald-500"
          />
          <StatCard
            title="Products"
            value="567"
            change="+12 new products"
            changeType="neutral"
            icon={Package}
            iconColor="bg-gradient-to-br from-orange-500 to-red-500"
          />
        </div>

        <QuickActions />

        <div className="grid gap-6 lg:grid-cols-7">
          <div className="lg:col-span-4">
            <SalesChart />
          </div>
          <div className="lg:col-span-3">
            <Card className="border-border h-full">
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Conversion Rate
                  </span>
                  <span className="text-sm font-medium">3.2%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Avg. Order Value
                  </span>
                  <span className="text-sm font-medium">$89.45</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Pending Orders
                  </span>
                  <span className="text-sm font-medium">24</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Low Stock Items
                  </span>
                  <span className="text-sm font-medium text-red-600">8</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <RecentOrders />
      </div>
    </DashboardLayout>
  );
};

export default Index;
