import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { UserPlus, Loader2, RefreshCw, Power, Pencil } from "lucide-react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useEffect, useState } from "react";
import { UsersAPI, User } from "@/api/usersApi";
import { useToast } from "@/hooks/use-toast";
import { ROLES } from "@/constants/ROLES";

export default function Employees() {
  const [employees, setEmployees] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingUserId, setTogglingUserId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: [] as string[],
  });
  const [editFormData, setEditFormData] = useState({
    userGroups: [] as string[],
  });
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
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText,
      });
      setEmployees([]);
      
      const errorMessage = error.response?.data?.response?.message
        || error.response?.data?.message 
        || error.response?.data?.error 
        || error.message 
        || "Failed to fetch employees";
      
      toast({
        title: "Error Loading Employees",
        description: `${errorMessage}${error.response?.status ? ` (${error.response.status})` : ''}`,
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
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText,
      });
      
      const errorMessage = error.response?.data?.response?.message
        || error.response?.data?.message 
        || error.response?.data?.error 
        || error.message 
        || "Failed to update employee status";
      
      toast({
        title: "Error Updating Status",
        description: `${errorMessage}${error.response?.status ? ` (${error.response.status})` : ''}`,
        variant: "destructive",
      });
    } finally {
      setTogglingUserId(null);
    }
  };

  const handleRoleChange = (roleName: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      role: checked 
        ? [...prev.role, roleName]
        : prev.role.filter(r => r !== roleName)
    }));
  };

  const handleCreateEmployee = async () => {
    // Validation
    if (!formData.firstName.trim()) {
      toast({
        title: "Validation Error",
        description: "First name is required",
        variant: "destructive",
      });
      return;
    }

    if (!formData.lastName.trim()) {
      toast({
        title: "Validation Error",
        description: "Last name is required",
        variant: "destructive",
      });
      return;
    }

    if (!formData.email.trim()) {
      toast({
        title: "Validation Error",
        description: "Email is required",
        variant: "destructive",
      });
      return;
    }

    if (formData.role.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select at least one role",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsCreating(true);
      
      // Prepare payload - send only the first selected role as per API requirement
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        role: formData.role[0], // API expects a single role string
      };

      console.log('📤 Creating employee with payload:', payload);
      
      const response = await UsersAPI.createUser(payload as any);
      
      console.log('✅ Employee created:', response);
      
      toast({
        title: "Success",
        description: "Employee created successfully",
      });
      
      // Reset form and close dialog
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        role: [],
      });
      setIsDialogOpen(false);
      
      // Refresh the employee list
      await fetchEmployees();
      
    } catch (error: any) {
      console.error('❌ Error creating employee:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText,
      });
      
      const errorMessage = error.response?.data?.response?.message
        || error.response?.data?.message 
        || error.response?.data?.error 
        || error.message 
        || "Failed to create employee";
      
      toast({
        title: "Error Creating Employee",
        description: `${errorMessage}${error.response?.status ? ` (${error.response.status})` : ''}`,
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditEmployee = (employee: User) => {
    setSelectedEmployee(employee);
    setEditFormData({
      userGroups: employee.userGroups || [],
    });
    setIsEditDialogOpen(true);
  };

  const handleEditRoleChange = (roleName: string, checked: boolean) => {
    setEditFormData(prev => ({
      ...prev,
      userGroups: checked 
        ? [...prev.userGroups, roleName]
        : prev.userGroups.filter(r => r !== roleName)
    }));
  };

  const handleUpdateEmployee = async () => {
    if (!selectedEmployee) return;

    if (editFormData.userGroups.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select at least one role",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUpdating(true);
      
      const payload = {
        roles: editFormData.userGroups
      };
      
      console.log('📤 Updating employee roles:', {
        id: selectedEmployee.id,
        payload
      });
      
      await UsersAPI.updateUser(selectedEmployee.id, payload as any);
      
      toast({
        title: "Success",
        description: "Employee roles updated successfully",
      });
      
      setIsEditDialogOpen(false);
      setSelectedEmployee(null);
      
      // Refresh the employee list
      await fetchEmployees();
      
    } catch (error: any) {
      console.error('❌ Error updating employee:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText,
      });
      
      const errorMessage = error.response?.data?.response?.message
        || error.response?.data?.message 
        || error.response?.data?.error 
        || error.message 
        || "Failed to update employee roles";
      
      toast({
        title: "Error Updating Roles",
        description: `${errorMessage}${error.response?.status ? ` (${error.response.status})` : ''}`,
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
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
          <Button onClick={() => setIsDialogOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Employee
          </Button>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Employee</DialogTitle>
            <DialogDescription>
              Create a new employee account. Fill in the required information below.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="firstName">
                First Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="firstName"
                placeholder="Enter first name"
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="lastName">
                Last Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="lastName"
                placeholder="Enter last name"
                value={formData.lastName}
                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="email">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter email address"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            
            <div className="grid gap-3">
              <Label>
                Role <span className="text-red-500">*</span>
              </Label>
              <div className="space-y-3">
                {Object.entries(ROLES).map(([key, value]) => (
                  <div key={key} className="flex items-center space-x-2">
                    <Checkbox
                      id={key}
                      checked={formData.role.includes(value)}
                      onCheckedChange={(checked) => handleRoleChange(value, checked as boolean)}
                    />
                    <Label
                      htmlFor={key}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {value}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false);
                setFormData({
                  firstName: "",
                  lastName: "",
                  email: "",
                  role: [],
                });
              }}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateEmployee} disabled={isCreating}>
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Employee"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Employee Roles</DialogTitle>
            <DialogDescription>
              Update roles for {selectedEmployee?.firstName} {selectedEmployee?.lastName}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-3">
              <Label>
                Roles <span className="text-red-500">*</span>
              </Label>
              <div className="space-y-3">
                {Object.entries(ROLES).map(([key, value]) => (
                  <div key={key} className="flex items-center space-x-2">
                    <Checkbox
                      id={`edit-${key}`}
                      checked={editFormData.userGroups.includes(value)}
                      onCheckedChange={(checked) => handleEditRoleChange(value, checked as boolean)}
                    />
                    <Label
                      htmlFor={`edit-${key}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {value}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
                setSelectedEmployee(null);
              }}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateEmployee} disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Roles"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
              <TableHead>Groups</TableHead>
              <TableHead>Enabled</TableHead>
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
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={employee.status === 'ENABLED'}
                        onCheckedChange={() => handleToggleUserStatus(employee)}
                        disabled={togglingUserId === employee.id}
                      />
                      {togglingUserId === employee.id && (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditEmployee(employee)}
                      >
                        <Pencil className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </div>
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
