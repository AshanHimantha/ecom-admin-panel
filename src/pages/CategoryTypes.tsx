import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Loader2, RefreshCw, Pencil, Trash2 } from "lucide-react";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { CategoryTypesAPI, CategoryType } from "@/api/categoryTypesApi";
import AddCategoryTypeDialog from "@/components/AddCategoryTypeDialog";
import UpdateCategoryTypeDialog from "@/components/UpdateCategoryTypeDialog";

export default function CategoryTypes() {
  const [categoryTypes, setCategoryTypes] = useState<CategoryType[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatusId, setUpdatingStatusId] = useState<number | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCategoryType, setSelectedCategoryType] = useState<CategoryType | null>(null);
  const [categoryTypeToDelete, setCategoryTypeToDelete] = useState<CategoryType | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const fetchCategoryTypes = async () => {
    try {
      setLoading(true);
      const response = await CategoryTypesAPI.getAllCategoryTypes();

      if (response.success && Array.isArray(response.data)) {
        setCategoryTypes(response.data);
      } else {
        setCategoryTypes([]);
        toast({
          title: "Warning",
          description: "API returned unexpected response format",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        "Failed to fetch category sizes";

      toast({
        title: "Error Loading Category Sizes",
        description: `${errorMessage}${error.response?.status ? ` (${error.response.status})` : ''}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoryTypes();
  }, []);

  const handleStatusChange = async (categoryType: CategoryType, checked: boolean) => {
    const newStatus = checked ? 'ACTIVE' : 'INACTIVE';
    const originalStatus = categoryType.status;
    const categoryId = categoryType.id;
    const categoryName = categoryType.name;

    setUpdatingStatusId(categoryId);

    // Optimistic UI update
    setCategoryTypes(prev =>
      prev.map(ct =>
        ct.id === categoryId ? { ...ct, status: newStatus } : ct
      )
    );

    try {
      console.log('🔄 PATCH request - Updating category type:', categoryId, 'to status:', newStatus);

      // Call the PATCH API with only ID and status
      await CategoryTypesAPI.updateCategoryTypeStatus(categoryId.toString(), newStatus);
      
      console.log('✅ Status update successful');

      // Refetch to ensure UI is in sync with server
      await fetchCategoryTypes();
      
      toast({
        title: "Success",
        description: `${categoryName} status updated to ${newStatus}.`,
      });
    } catch (error: any) {
      console.error('❌ Error updating status:', error);

      // Rollback UI on failure
      setCategoryTypes(prev =>
        prev.map(ct =>
          ct.id === categoryId ? { ...ct, status: originalStatus } : ct
        )
      );
      
      const errorMessage = error.response?.data?.message 
        || error.message 
        || "Could not update status.";
      
      toast({
        title: "Update Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const handleEditClick = (categoryType: CategoryType) => {
    setSelectedCategoryType(categoryType);
    setIsUpdateDialogOpen(true);
  };

  const handleDeleteClick = (categoryType: CategoryType) => {
    setCategoryTypeToDelete(categoryType);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!categoryTypeToDelete) return;

    setIsDeleting(true);
    try {
      await CategoryTypesAPI.deleteCategoryType(categoryTypeToDelete.id.toString());
      toast({
        title: "Success",
        description: `"${categoryTypeToDelete.name}" has been deleted successfully`,
      });
      fetchCategoryTypes(); // Refetch to update the list
      setIsDeleteDialogOpen(false);
      setCategoryTypeToDelete(null);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        "Failed to delete category type";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Category Sizes</h1>
          <p className="text-muted-foreground">
            Manage category sizes options ({categoryTypes.length} size{categoryTypes.length !== 1 ? 's' : ''})
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchCategoryTypes} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Category Size
          </Button>
        </div>
      </div>

      <Card>
        <Table className="w-full">
          <TableCaption className="pb-5">
            {loading ? 'Loading category Sizes...' : `Showing ${categoryTypes.length} category size${categoryTypes.length !== 1 ? 's' : ''}`}
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Size Options</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && categoryTypes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  <p className="mt-2 text-muted-foreground">Loading category Sizes...</p>
                </TableCell>
              </TableRow>
            ) : categoryTypes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <p className="text-muted-foreground">No category Sizes found.</p>
                </TableCell>
              </TableRow>
            ) : (
              categoryTypes.map((categoryType) => (
                <TableRow key={categoryType.id}>
                  <TableCell className="font-medium">{categoryType.id}</TableCell>
                  <TableCell className="font-medium">{categoryType.name}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 whitespace-nowrap">
                      {categoryType.sizeOptions?.length > 0 ? (
                        categoryType.sizeOptions.map((size, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {size}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-muted-foreground text-sm">No sizes</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={categoryType.status === 'ACTIVE'}
                      onCheckedChange={(checked) => handleStatusChange(categoryType, checked)}
                      disabled={updatingStatusId === categoryType.id}
                      aria-label={`Toggle status for ${categoryType.name}`}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditClick(categoryType)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(categoryType)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <AddCategoryTypeDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} onSuccess={fetchCategoryTypes} />
      <UpdateCategoryTypeDialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen} onSuccess={fetchCategoryTypes} categoryType={selectedCategoryType} />
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this category type?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <span className="font-semibold text-foreground">"{categoryTypeToDelete?.name}"</span>.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}