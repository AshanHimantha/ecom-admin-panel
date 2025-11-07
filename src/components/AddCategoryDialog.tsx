import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Loader2, Upload, X, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CategoriesAPI } from "@/api/categoriesApi";
import { CategoryType } from "@/api/categoryTypesApi";
import AddCategoryTypeDialog from "@/components/AddCategoryTypeDialog";

interface AddCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  categoryTypes: CategoryType[];
  onCategoryTypesRefresh: () => void;
}

export default function AddCategoryDialog({
  open,
  onOpenChange,
  onSuccess,
  categoryTypes,
  onCategoryTypesRefresh,
}: AddCategoryDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    categoryTypeId: "",
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isCreating, setIsCreating] = useState(false);
  const [isAddCategoryTypeOpen, setIsAddCategoryTypeOpen] = useState(false);
  const { toast } = useToast();

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
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

      setSelectedImage(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Category name is required (min 3, max 100 characters)",
        variant: "destructive",
      });
      return;
    }

    if (formData.name.trim().length < 3 || formData.name.trim().length > 100) {
      toast({
        title: "Validation Error",
        description: "Category name must be between 3 and 100 characters",
        variant: "destructive",
      });
      return;
    }

    if (formData.description && formData.description.length > 255) {
      toast({
        title: "Validation Error",
        description: "Description must be less than 255 characters",
        variant: "destructive",
      });
      return;
    }

    if (!formData.categoryTypeId) {
      toast({
        title: "Validation Error",
        description: "Category type is required",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsCreating(true);

      const payload: any = {
        name: formData.name.trim(),
        categoryTypeId: parseInt(formData.categoryTypeId),
      };

      if (formData.description?.trim()) {
        payload.description = formData.description.trim();
      }

      if (selectedImage) {
        payload.image = selectedImage;
      }

      console.log("📤 Creating category with payload:", {
        name: payload.name,
        description: payload.description,
        categoryTypeId: payload.categoryTypeId,
        image: selectedImage
          ? `${selectedImage.name} (${(selectedImage.size / 1024).toFixed(2)} KB)`
          : "No image",
      });

      const response = await CategoriesAPI.createCategory(payload);



      toast({
        title: "Success",
        description: "Category created successfully",
      });

      // Reset form
      setFormData({
        name: "",
        description: "",
        categoryTypeId: "",
      });
      setSelectedImage(null);
      setImagePreview("");

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error("❌ Error creating category:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText,
      });

      const errorMessage =
        error.response?.data?.response?.message ||
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to create category";

      toast({
        title: "Error Creating Category",
        description: `${errorMessage}${error.response?.status ? ` (${error.response.status})` : ""}`,
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    if (!isCreating) {
      setFormData({
        name: "",
        description: "",
        categoryTypeId: "",
      });
      setSelectedImage(null);
      setImagePreview("");
      onOpenChange(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
            <DialogDescription>
              Create a new product category. Fill in the required information below.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">
                Category Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Enter category name (3-100 characters)"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                disabled={isCreating}
              />
              <p className="text-xs text-muted-foreground">
                {formData.name.length}/100 characters
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">
                Description{" "}
                <span className="text-muted-foreground">(Optional, max 255 chars)</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Enter category description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
                rows={3}
                disabled={isCreating}
              />
              <p className="text-xs text-muted-foreground">
                {formData.description.length}/255 characters
              </p>
            </div>

            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="categoryType">
                  Category Type <span className="text-red-500">*</span>
                </Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 gap-1"
                  onClick={() => setIsAddCategoryTypeOpen(true)}
                  disabled={isCreating}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add
                </Button>
              </div>
              <Select
                value={formData.categoryTypeId}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, categoryTypeId: value }))
                }
                disabled={isCreating}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category type" />
                </SelectTrigger>
                <SelectContent>
                  {categoryTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id.toString()} className="w-full flex">
                      <div className="flex w-full   gap-5  ">
                        <span className="font-medium">{type.name}</span>
                        <div className="flex flex-wrap gap-1">
                          {type.sizeOptions.slice(0, 5).map((size, index) => (
                            <Badge key={index} variant="outline" className="text-xs px-1.5 py-0">
                              {size}
                            </Badge>
                          ))}
                          {type.sizeOptions.length > 5 && (
                            <Badge variant="secondary" className="text-xs px-1.5 py-0">
                              +{type.sizeOptions.length - 5}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="image">
                Category Image{" "}
                <span className="text-muted-foreground">(Optional, max 5MB)</span>
              </Label>

              {!imagePreview ? (
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center hover:border-gray-400 dark:hover:border-gray-600 transition-colors">
                  <input
                    type="file"
                    id="image"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                    disabled={isCreating}
                  />
                  <label
                    htmlFor="image"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <Upload className="h-8 w-8 text-gray-400" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Click to upload category image
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      PNG, JPG, GIF up to 5MB
                    </p>
                  </label>
                </div>
              ) : (
                <div className="relative border rounded-lg p-2">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-3 right-3"
                    onClick={handleRemoveImage}
                    disabled={isCreating}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  {selectedImage && (
                    <p className="text-xs text-muted-foreground mt-2">
                      {selectedImage.name} ({(selectedImage.size / 1024).toFixed(2)} KB)
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating}>
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
        </form>
      </DialogContent>
    </Dialog>

    <AddCategoryTypeDialog
      open={isAddCategoryTypeOpen}
      onOpenChange={setIsAddCategoryTypeOpen}
      onSuccess={onCategoryTypesRefresh}
    />
    </>
  );
}
