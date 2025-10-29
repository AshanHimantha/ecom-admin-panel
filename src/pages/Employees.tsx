import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Loader2, RefreshCw, Power } from "lucide-react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useState } from "react";
import { UsersAPI, User } from "@/api/usersApi";
import { useToast } from "@/hooks/use-toast";

export default function Employees() {
  const [employees, setEmployees] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingUserId, setTogglingUserId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      console.log('📡 Fetching employees');
      const response = await UsersAPI.getAllEmployees();
      console.log('✅ Employees API response:', response);

      if (response.success && Array.isArray(response.data)) {
        setEmployees(response.data);
      } else {
        console.warn('⚠️ Unexpected API response structure:', response);
        setEmployees([]);
        toast({
          title: "Warning",
          description: "API returned unexpected response format",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('❌ Error fetching employees:', error);
      setEmployees([]);
      toast({
        title: "Error",
        description: error.response?.data?.message || error.message || "Failed to fetch employees",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const getStatusBadgeVariant = (status: User['status']) => {
    switch (status) {
      case 'ENABLED':
        return 'default';
      case 'DISABLED':
        return 'secondary';
      case 'CONFIRMED':
        return 'default';
      case 'UNCONFIRMED':
        return 'secondary';
      case 'ARCHIVED':
        return 'outline';
      default:
        return 'destructive';
    }
  };

  const handleToggleUserStatus = async (user: User) => {
    try {
      setTogglingUserId(user.id);
      const newEnabled = user.status !== 'ENABLED';
      
      await UsersAPI.updateUserStatus(user.id, newEnabled);
      
      setEmployees(prevEmployees => 
        prevEmployees.map(u => 
          u.id === user.id ? { ...u, status: newEnabled ? 'ENABLED' : 'DISABLED' } : u
        )
      );
      
      toast({
        title: "Success",
        description: `Employee ${newEnabled ? 'enabled' : 'disabled'} successfully`,
      });
    } catch (error: any) {
      console.error('Error toggling employee status:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update employee status",
        variant: "destructive",
      });
    } finally {
      setTogglingUserId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Employees</h1>
          <p className="text-muted-foreground">
            Manage your employee base ({employees?.length || 0} employee{employees?.length !== 1 ? 's' : ''})
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => fetchEmployees()}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Employee
          </Button>
        </div>
      </div>

      <Card>
        <Table className="w-full">
          <TableCaption className="pb-5">
            {loading ? 'Loading employees...' : employees.length === 0 ? 'No employees found.' : `Showing ${employees.length} employee${employees.length !== 1 ? 's' : ''}`}
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Email Verified</TableHead>
              <TableHead>Groups</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && employees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  <p className="mt-2 text-muted-foreground">Loading employees...</p>
                </TableCell>
              </TableRow>
            ) : employees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <p className="text-muted-foreground">No employees found.</p>
                </TableCell>
              </TableRow>
            ) : (
              employees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell className="font-medium whitespace-nowrap">
                    {employee.firstName && employee.lastName
                      ? `${employee.firstName} ${employee.lastName}`
                      : employee.firstName || employee.lastName || '-'}
                  </TableCell>
                  <TableCell>{employee.email}</TableCell>
                  <TableCell>{employee.phone || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(employee.status)}>
                      {employee.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {employee.emailVerified ? (
                      <Badge variant="default" className="bg-green-500">
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        Not Verified
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {employee.userGroups && employee.userGroups.length > 0 ? (
                        employee.userGroups.map((group) => (
                          <Badge key={group} variant="outline" className="text-xs">
                            {group}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-muted-foreground text-sm">No groups</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant={employee.status === 'ENABLED' ? "destructive" : "default"}
                      size="sm"
                      onClick={() => handleToggleUserStatus(employee)}
                      disabled={togglingUserId === employee.id}
                    >
                      {togglingUserId === employee.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Power className="h-4 w-4 mr-1" />
                          {employee.status === 'ENABLED' ? 'Disable' : 'Enable'}
                        </>
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
