import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, ListOrdered, UserPlus } from "lucide-react";

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Button variant="outline">
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Product
        </Button>
        <Button variant="outline">
          <ListOrdered className="mr-2 h-4 w-4" />
          View All Orders
        </Button>
        <Button variant="outline">
          <UserPlus className="mr-2 h-4 w-4" />
          Add New Customer
        </Button>
      </CardContent>
    </Card>
  );
}
