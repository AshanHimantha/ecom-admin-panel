import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const orders = [
  {
    id: "#ORD-001",
    customer: "John Doe",
    product: "Wireless Headphones",
    amount: "$89.99",
    status: "completed",
  },
  {
    id: "#ORD-002",
    customer: "Jane Smith",
    product: "Smart Watch",
    amount: "$249.99",
    status: "processing",
  },
  {
    id: "#ORD-003",
    customer: "Mike Johnson",
    product: "Laptop Stand",
    amount: "$45.99",
    status: "completed",
  },
  {
    id: "#ORD-004",
    customer: "Sarah Williams",
    product: "USB-C Cable",
    amount: "$12.99",
    status: "pending",
  },
  {
    id: "#ORD-005",
    customer: "Tom Brown",
    product: "Mechanical Keyboard",
    amount: "$129.99",
    status: "completed",
  },
];

export function RecentOrders() {
  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle>Recent Orders</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.id}</TableCell>
                <TableCell>{order.customer}</TableCell>
                <TableCell>{order.product}</TableCell>
                <TableCell>{order.amount}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      order.status === "completed"
                        ? "default"
                        : order.status === "processing"
                        ? "secondary"
                        : "outline"
                    }
                  >
                    {order.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
