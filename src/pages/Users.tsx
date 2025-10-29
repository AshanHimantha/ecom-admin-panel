import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [nextToken, setNextToken] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [togglingUserId, setTogglingUserId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchUsers = async (token?: string, isNewSearch: boolean = false) => {
    try {
      if (token) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      let response;

      console.log('📡 Fetching all users');
      response = await UsersAPI.getAllUsers();

      console.log('✅ Users API response:', response);

      if (response.success && response.data && Array.isArray(response.data.users)) {
        if (token && !isNewSearch) {
          // Append to existing users for pagination
          setUsers(prev => [...prev, ...response.data.users]);
        } else {
          // Replace users for initial load, refresh, or new search
          setUsers(response.data.users);
        }
        setNextToken(response.data.nextToken);
      } else {
        console.warn('⚠️ Unexpected API response structure:', response);
        setUsers([]);
        toast({
          title: "Warning",
          description: "API returned unexpected response format",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('❌ Error fetching users:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: {
          url: error.config?.url,
          baseURL: error.config?.baseURL,
          method: error.config?.method
        }
      });
      
      // Set empty array on error to prevent undefined
      setUsers([]);
      
      toast({
        title: "Error",
        description: error.response?.data?.message || error.message || "Failed to fetch users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchUsers();
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleToggleUserStatus = async (user: User) => {
    try {
      setTogglingUserId(user.id);
      const newEnabled = user.status !== 'ENABLED';
      
      await UsersAPI.updateUserStatus(user.id, newEnabled);
      
      // Update the user in the local state
      setUsers(prevUsers => 
        prevUsers.map(u => 
          u.id === user.id ? { ...u, status: newEnabled ? 'ENABLED' : 'DISABLED' } : u
        )
      );
      
      toast({
        title: "Success",
        description: `User ${newEnabled ? 'enabled' : 'disabled'} successfully`,
      });
    } catch (error: any) {
      console.error('Error toggling user status:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update user status",
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
          <h1 className="text-3xl font-semibold tracking-tight">Users</h1>
          <p className="text-muted-foreground">
            Manage your user accounts ({users?.length || 0} user{users?.length !== 1 ? 's' : ''})
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => fetchUsers()}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      <Card>
        <Table className="w-full">
          <TableCaption className="pb-5">
            {loading ? 'Loading users...' : users.length === 0 ? 'No users found.' : `Showing ${users.length} user${users.length !== 1 ? 's' : ''}`}
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Email Verified</TableHead>
              <TableHead>Created Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  <p className="mt-2 text-muted-foreground">Loading users...</p>
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <p className="text-muted-foreground">No users found.</p>
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium whitespace-nowrap">
                    {user.firstName && user.lastName
                      ? `${user.firstName} ${user.lastName}`
                      : user.firstName || user.lastName || '-'}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(user.status)}>
                      {user.status}
                    </Badge>
                  </TableCell>
                 
                  <TableCell>
                    {user.emailVerified ? (
                      <Badge variant="default" className="bg-green-500">
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        Not Verified
                      </Badge>
                    )}
                  </TableCell>
                    <TableCell className="whitespace-nowrap">{formatDate(user.createdDate)}</TableCell>
                    <TableCell>
                      <Button
                        variant={user.status === 'ENABLED' ? "destructive" : "default"}
                        size="sm"
                        onClick={() => handleToggleUserStatus(user)}
                        disabled={togglingUserId === user.id}
                      >
                        {togglingUserId === user.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Power className="h-4 w-4 mr-1" />
                            {user.status === 'ENABLED' ? 'Disable' : 'Enable'}
                          </>
                        )}
                      </Button>
                    </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination - Load More Button */}
        {nextToken && !loading && (
          <div className="flex justify-center py-4 border-t">
            <Button
              variant="outline"
              onClick={() => fetchUsers(nextToken)}
              disabled={loadingMore}
            >
              {loadingMore ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                'Load More'
              )}
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
