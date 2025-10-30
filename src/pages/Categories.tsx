import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import { CategoriesAPI, Category } from "@/api/categoriesApi";
import { useToast } from "@/hooks/use-toast";

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [editFormData, setEditFormData] = useState({
    name: "",
    description: "",
  });
  const { toast } = useToast();

  const fetchCategories = async () => {
    try {
      setLoading(true);
      console.log('📡 Fetching categories');
      const response = await CategoriesAPI.getAllCategories();
      console.log('✅ Categories API response:', response);

      if (response.success && Array.isArray(response.data)) {
        setCategories(response.data);
      } else {
        console.warn('⚠️ Unexpected API response structure:', response);
        setCategories([]);
        toast({
          title: "Warning",
          description: "API returned unexpected response format",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('❌ Error fetching categories:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText,
      });
      setCategories([]);

      const errorMessage = error.response?.data?.response?.message
        || error.response?.data?.message
        || error.response?.data?.error
        || error.message
        || "Failed to fetch categories";

      toast({
        title: "Error Loading Categories",
        description: `${errorMessage}${error.response?.status ? ` (${error.response.status})` : ''}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDeleteClick = (category: Category) => {
    setCategoryToDelete(category);
    setIsAlertOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return;

    try {
      setDeletingId(categoryToDelete.id);
      console.log('🗑️ Deleting category:', categoryToDelete.id);
      
      await CategoriesAPI.deleteCategory(categoryToDelete.id.toString());
      
      toast({
        title: "Success",
        description: `Category "${categoryToDelete.name}" deleted successfully`,
      });
      
      // Remove from local state
      setCategories(prev => prev.filter(cat => cat.id !== categoryToDelete.id));
      
    } catch (error: any) {
      console.error('❌ Error deleting category:', error);
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
        || "Failed to delete category";
      
      toast({
        title: "Error Deleting Category",
        description: `${errorMessage}${error.response?.status ? ` (${error.response.status})` : ''}`,
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
      setIsAlertOpen(false);
      setCategoryToDelete(null);
    }
  };

  const handleCreateCategory = async () => {
    // Validation
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Category name is required",
        variant: "destructive",
      });
      return;
    }

    if (!formData.description.trim()) {
      toast({
        title: "Validation Error",
        description: "Description is required",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsCreating(true);
      
      const payload = {
        name: formData.name,
        description: formData.description,
      };

      console.log('📤 Creating category with payload:', payload);
      
      const response = await CategoriesAPI.createCategory(payload);
      
      console.log('✅ Category created:', response);
      
      toast({
        title: "Success",
        description: "Category created successfully",
      });
      
      // Reset form and close dialog
      setFormData({
        name: "",
        description: "",
      });
      setIsDialogOpen(false);
      
      // Refresh the category list
      await fetchCategories();
      
    } catch (error: any) {
      console.error('❌ Error creating category:', error);
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
        || "Failed to create category";
      
      toast({
        title: "Error Creating Category",
        description: `${errorMessage}${error.response?.status ? ` (${error.response.status})` : ''}`,
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditClick = (category: Category) => {
    setSelectedCategory(category);
    setEditFormData({
      name: category.name,
      description: category.description || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateCategory = async () => {
    if (!selectedCategory) return;

    // Validation
    if (!editFormData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Category name is required",
        variant: "destructive",
      });
      return;
    }

    if (!editFormData.description.trim()) {
      toast({
        title: "Validation Error",
        description: "Description is required",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUpdating(true);
      
      const payload = {
        name: editFormData.name,
        description: editFormData.description,
      };

      console.log('📤 Updating category with payload:', {
        id: selectedCategory.id,
        payload
      });
      
      await CategoriesAPI.updateCategory(selectedCategory.id.toString(), payload);
      
      toast({
        title: "Success",
        description: "Category updated successfully",
      });
      
      setIsEditDialogOpen(false);
      setSelectedCategory(null);
      
      // Refresh the category list
      await fetchCategories();
      
    } catch (error: any) {
      console.error('❌ Error updating category:', error);
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
        || "Failed to update category";
      
      toast({
        title: "Error Updating Category",
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
          <h1 className="text-3xl font-semibold tracking-tight">Categories</h1>
          <p className="text-muted-foreground">
            Manage your product categories ({categories?.length || 0} categor{categories?.length !== 1 ? 'ies' : 'y'})
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => fetchCategories()}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
            <DialogDescription>
              Create a new product category. Fill in the required information below.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">
                Category Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Enter category name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">
                Description <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Enter category description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false);
                setFormData({
                  name: "",
                  description: "",
                });
              }}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateCategory} disabled={isCreating}>
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Category"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>
              Update the category information below.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">
                Category Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-name"
                placeholder="Enter category name"
                value={editFormData.name}
                onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-description">
                Description <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="edit-description"
                placeholder="Enter category description"
                value={editFormData.description}
                onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
                setSelectedCategory(null);
              }}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateCategory} disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Category"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card>
        <Table className="w-full">
          <TableCaption className="pb-5">
            {loading ? 'Loading categories...' : categories.length === 0 ? 'No categories found.' : `Showing ${categories.length} categor${categories.length !== 1 ? 'ies' : 'y'}`}
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  <p className="mt-2 text-muted-foreground">Loading categories...</p>
                </TableCell>
              </TableRow>
            ) : categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <p className="text-muted-foreground">No categories found.</p>
                </TableCell>
              </TableRow>
            ) : (
              categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">
                    {category.id}
                  </TableCell>
                  <TableCell className="font-medium">
                    {category.name}
                  </TableCell>
                  <TableCell className="max-w-md">
                    {category.description || '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={category.active ? "default" : "secondary"}>
                      {category.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditClick(category)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteClick(category)}
                        disabled={deletingId === category.id}
                      >
                        {deletingId === category.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the category <strong>"{categoryToDelete?.name}"</strong>.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
