import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Loader2, RefreshCw, Pencil, Trash2, Upload, X, Info } from "lucide-react";
import { useRef } from "react";
import AddCategoryDialog from "@/components/AddCategoryDialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import { CategoriesAPI, Category } from "@/api/categoriesApi";
import { CategoryTypesAPI, CategoryType } from "@/api/categoryTypesApi";
import { useToast } from "@/hooks/use-toast";

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryTypes, setCategoryTypes] = useState<CategoryType[]>([]);
  const [loading, setLoading] = useState(true);
  const hasFetched = useRef(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<number | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [editSelectedImage, setEditSelectedImage] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string>("");
  const [editFormData, setEditFormData] = useState({
    name: "",
    description: "",
    categoryTypeId: "",
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

  const fetchCategoryTypes = async () => {
    try {
      
      const response = await CategoryTypesAPI.getAllCategoryTypes();


      if (response.success && Array.isArray(response.data)) {
        setCategoryTypes(response.data);
      }
    } catch (error: any) {
    }
  };

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchCategories();
      fetchCategoryTypes();
    }
  }, []);

  const handleDeleteClick = (category: Category) => {
    setCategoryToDelete(category);
    setIsAlertOpen(true);
  };

  const handleEditImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid File",
          description: "Please select an image file",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Image must be less than 5MB",
          variant: "destructive",
        });
        return;
      }

      setEditSelectedImage(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveEditImage = () => {
    setEditSelectedImage(null);
    setEditImagePreview("");
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

  const handleEditClick = (category: Category) => {
    setSelectedCategory(category);
    setEditFormData({
      name: category.name,
      description: category.description || "",
      categoryTypeId: category.categoryType?.id.toString() || "",
    });
    setEditSelectedImage(null);
    setEditImagePreview(category.imageUrl || "");
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

    try {
      setIsUpdating(true);
      
      const payload: any = {
        name: editFormData.name.trim(),
      };

      if (editFormData.description?.trim()) {
        payload.description = editFormData.description.trim();
      }

      if (editFormData.categoryTypeId) {
        payload.categoryTypeId = parseInt(editFormData.categoryTypeId);
      }

      if (editSelectedImage) {
        payload.image = editSelectedImage;
      }

      console.log('📤 Updating category with payload:', {
        id: selectedCategory.id,
        name: payload.name,
        description: payload.description,
        categoryTypeId: payload.categoryTypeId,
        image: editSelectedImage ? `${editSelectedImage.name} (${(editSelectedImage.size / 1024).toFixed(2)} KB)` : 'No new image'
      });
      
      const response = await CategoriesAPI.updateCategory(selectedCategory.id.toString(), payload);
      
  
      
      toast({
        title: "Success",
        description: "Category updated successfully",
      });
      
      setIsEditDialogOpen(false);
      setSelectedCategory(null);
      setEditSelectedImage(null);
      setEditImagePreview("");
      
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

  const handleStatusToggle = async (category: Category) => {
    const newStatus = category.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const originalStatus = category.status;
    
    try {
      setUpdatingStatusId(category.id);
      console.log(`🔄 PATCH request - Toggling category status:`, {
        id: category.id,
        name: category.name,
        currentStatus: category.status,
        newStatus
      });
      
      // Optimistic UI update
      setCategories(prev => 
        prev.map(cat => 
          cat.id === category.id 
            ? { ...cat, status: newStatus }
            : cat
        )
      );

      // Call the PATCH API with only ID and status
      await CategoriesAPI.updateCategoryStatus(category.id.toString(), newStatus);
      
      
      toast({
        title: "Success",
        description: `Category "${category.name}" is now ${newStatus.toLowerCase()}`,
      });
      
      // Refetch to ensure UI is in sync with server
      await fetchCategories();
      
    } catch (error: any) {
      console.error('❌ Error updating category status:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText,
      });

      // Rollback UI on failure
      setCategories(prev =>
        prev.map(cat =>
          cat.id === category.id ? { ...cat, status: originalStatus } : cat
        )
      );
      
      const errorMessage = error.response?.data?.response?.message
        || error.response?.data?.message
        || error.response?.data?.error
        || error.message
        || "Failed to update category status";
      
      toast({
        title: "Error Updating Status",
        description: `${errorMessage}${error.response?.status ? ` (${error.response.status})` : ''}`,
        variant: "destructive",
      });
    } finally {
      setUpdatingStatusId(null);
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

      <AddCategoryDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSuccess={fetchCategories}
        categoryTypes={categoryTypes}
        onCategoryTypesRefresh={fetchCategoryTypes}
      />

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
                disabled={isUpdating}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-description">
                Description <span className="text-muted-foreground">(Optional)</span>
              </Label>
              <Textarea
                id="edit-description"
                placeholder="Enter category description"
                value={editFormData.description}
                onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                disabled={isUpdating}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-categoryType">
                Category Type <span className="text-red-500">*</span>
              </Label>
              <Select
                value={editFormData.categoryTypeId}
                onValueChange={(value) => setEditFormData(prev => ({ ...prev, categoryTypeId: value }))}
                disabled={isUpdating}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category type" />
                </SelectTrigger>
                <SelectContent>
                  {categoryTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id.toString()}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-image">
                Category Image <span className="text-muted-foreground">(Optional, max 5MB)</span>
              </Label>
              
              {!editImagePreview ? (
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center hover:border-gray-400 dark:hover:border-gray-600 transition-colors">
                  <input
                    type="file"
                    id="edit-image"
                    accept="image/*"
                    onChange={handleEditImageSelect}
                    className="hidden"
                    disabled={isUpdating}
                  />
                  <label htmlFor="edit-image" className="cursor-pointer flex flex-col items-center gap-2">
                    <Upload className="h-8 w-8 text-gray-400" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Click to upload new image
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      PNG, JPG, GIF up to 5MB
                    </p>
                  </label>
                </div>
              ) : (
                <div className="relative border rounded-lg p-2">
                  <img
                    src={editImagePreview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-3 right-3"
                    onClick={handleRemoveEditImage}
                    disabled={isUpdating}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  {editSelectedImage && (
                    <p className="text-xs text-muted-foreground mt-2">
                      {editSelectedImage.name} ({(editSelectedImage.size / 1024).toFixed(2)} KB)
                    </p>
                  )}
                  {!editSelectedImage && selectedCategory?.imageUrl && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Current image (click X to upload new)
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
                setSelectedCategory(null);
                setEditSelectedImage(null);
                setEditImagePreview("");
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
              <TableHead>Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Category Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  <p className="mt-2 text-muted-foreground">Loading categories...</p>
                </TableCell>
              </TableRow>
            ) : categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <p className="text-muted-foreground">No categories found.</p>
                </TableCell>
              </TableRow>
            ) : (
              categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">
                    {category.id}
                  </TableCell>
                  <TableCell>
                    {category.imageUrl ? (
                      <img 
                        src={category.imageUrl} 
                        alt={category.name}
                        className="h-12 w-12 object-cover rounded"
                      />
                    ) : (
                      <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center text-xs text-gray-500">
                        No Image
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">
                    {category.name}
                  </TableCell>
                  <TableCell className="max-w-md">
                    {category.description || '-'}
                  </TableCell>
                  <TableCell>
                    {category.categoryType ? (
                      <div className="space-y-2">
                        <p className="font-medium text-sm">{category.categoryType.name}</p>
                        <div className="flex flex-wrap gap-1 items-center">
                          {category.categoryType.sizeOptions.slice(0, 4).map((size, index) => (
                            <Badge key={index} variant="outline" className="text-xs px-2 py-0.5">
                              {size}
                            </Badge>
                          ))}
                          {category.categoryType.sizeOptions.length > 4 && (
                            <Popover>
                              <PopoverTrigger asChild>
                                <Badge 
                                  variant="secondary" 
                                  className="text-xs px-2 py-0.5 cursor-pointer hover:bg-secondary/80 transition-colors"
                                >
                                  +{category.categoryType.sizeOptions.length - 4} more
                                </Badge>
                              </PopoverTrigger>
                              <PopoverContent className="w-80" align="start">
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <Info className="h-4 w-4 text-muted-foreground" />
                                    <h4 className="font-semibold text-sm">All Size Options</h4>
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    {category.categoryType.name} - {category.categoryType.sizeOptions.length} sizes
                                  </p>
                                  <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
                                    {category.categoryType.sizeOptions.map((size, index) => (
                                      <Badge 
                                        key={index} 
                                        variant="outline" 
                                        className="text-xs px-2.5 py-1"
                                      >
                                        {size}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              </PopoverContent>
                            </Popover>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {category.categoryType.sizeOptions.length} size{category.categoryType.sizeOptions.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={category.status === 'ACTIVE'}
                        onCheckedChange={() => handleStatusToggle(category)}
                        disabled={updatingStatusId === category.id}
                      />
                     
                    </div>
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
