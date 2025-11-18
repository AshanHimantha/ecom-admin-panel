import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
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
import { useToast } from "@/hooks/use-toast";
import { ProductsAPI, Product, Category } from "@/api/productsApi";
import { CategoriesAPI } from "@/api/categoriesApi";
import { Loader2, X, Upload, Image as ImageIcon } from "lucide-react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface EditProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product;
  onProductUpdated: () => void;
}

export default function EditProductDialog({
  open,
  onOpenChange,
  product,
  onProductUpdated,
}: EditProductDialogProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [formData, setFormData] = useState({
    name: product.name,
    categoryId: product.category.id.toString(),
    description: product.description,
    status: product.status,
  });
  const [existingImages, setExistingImages] = useState<string[]>(
    product.imageUrls || []
  );
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);

  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchCategories();
      // Reset form data when dialog opens
      setFormData({
        name: product.name,
        categoryId: product.category.id.toString(),
        description: product.description,
        status: product.status,
      });
      setExistingImages(product.imageUrls || []);
      setNewImages([]);
      setNewImagePreviews([]);
    }
  }, [open, product]);

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await CategoriesAPI.getAllCategories();
      if (response.success && Array.isArray(response.data)) {
        setCategories(response.data);
      }
    } catch (error: any) {
      toast({
        title: "Error Loading Categories",
        description: error.response?.data?.message || "Failed to fetch categories",
        variant: "destructive",
      });
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const currentTotal = existingImages.length + newImages.length;
    const newFiles = Array.from(files);

    if (currentTotal + newFiles.length > 6) {
      toast({
        title: "Image Limit Exceeded",
        description: `You can only have a maximum of 6 images. Currently you have ${currentTotal}.`,
        variant: "destructive",
      });
      return;
    }

    // Validate file types
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    const invalidFiles = newFiles.filter((file) => !validTypes.includes(file.type));

    if (invalidFiles.length > 0) {
      toast({
        title: "Invalid File Type",
        description: "Only JPG, PNG, GIF, and WebP images are allowed",
        variant: "destructive",
      });
      return;
    }

    // Validate file sizes (5MB max per file)
    const maxSize = 5 * 1024 * 1024; // 5MB
    const oversizedFiles = newFiles.filter((file) => file.size > maxSize);

    if (oversizedFiles.length > 0) {
      toast({
        title: "File Too Large",
        description: "Each image must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    // Add files and create preview URLs
    setNewImages((prev) => [...prev, ...newFiles]);

    // Create preview URLs
    newFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewImagePreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });

    // Reset file input
    e.target.value = "";
  };

  const handleRemoveExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveNewImage = (index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
    setNewImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Product name is required",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.categoryId) {
      toast({
        title: "Validation Error",
        description: "Please select a category",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.description.trim() || formData.description === "<p><br></p>") {
      toast({
        title: "Validation Error",
        description: "Description is required",
        variant: "destructive",
      });
      return false;
    }

    const totalImages = existingImages.length + newImages.length;
    if (totalImages === 0) {
      toast({
        title: "Validation Error",
        description: "At least 1 image is required",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleUpdateProduct = async () => {
    if (!validateForm()) return;

    try {
      setIsUpdating(true);

      const formDataPayload = new FormData();

      formDataPayload.append("name", formData.name);
      formDataPayload.append("description", formData.description);
      formDataPayload.append("categoryId", formData.categoryId);
      formDataPayload.append("status", formData.status);

      // Add existing images that weren't removed
      existingImages.forEach((url) => {
        formDataPayload.append("existingImageUrls", url);
      });

      // Add new images
      newImages.forEach((file) => {
        formDataPayload.append("files", file);
      });

      console.log("📤 Updating product:", product.id);

      // Call update API
      const response = await ProductsAPI.updateProduct(product.id, formDataPayload);

      console.log("✅ Product updated:", response);

      toast({
        title: "Success",
        description: "Product updated successfully",
      });

      onOpenChange(false);
      onProductUpdated();
    } catch (error: any) {
      console.error("❌ Error updating product:", error);
      const errorMessage =
        error.response?.data?.response?.message ||
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to update product";

      toast({
        title: "Error Updating Product",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const totalImages = existingImages.length + newImages.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
          <DialogDescription>
            Update product information, images, and category
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Product Name */}
          <div>
            <Label htmlFor="edit-name">
              Product Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="edit-name"
              type="text"
              placeholder="Enter product name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="mt-2"
            />
          </div>

          {/* Category Selection */}
          <div>
            <Label htmlFor="edit-category">
              Category <span className="text-red-500">*</span>
            </Label>
            {loadingCategories ? (
              <div className="flex items-center gap-2 mt-2 p-3 border rounded-md">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">
                  Loading categories...
                </span>
              </div>
            ) : (
              <Select
                value={formData.categoryId}
                onValueChange={(value) =>
                  setFormData({ ...formData, categoryId: value })
                }
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      <div className="flex items-center gap-2">
                        <span>{category.name}</span>
                        {category.categoryType && (
                          <Badge variant="outline" className="text-xs">
                            {category.categoryType.name}
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Status */}
          <div>
            <Label htmlFor="edit-status">
              Status <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.status}
              onValueChange={(value) =>
                setFormData({ ...formData, status: value })
              }
            >
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div>
            <Label>
              Description <span className="text-red-500">*</span>
              <span className="text-xs text-muted-foreground ml-2">
                (Supports formatting: bold, italic, lists, etc.)
              </span>
            </Label>
            <div className="border rounded-md mt-2">
              <ReactQuill
                theme="snow"
                value={formData.description}
                onChange={(value) =>
                  setFormData({ ...formData, description: value })
                }
                placeholder="Enter product description with rich formatting..."
                modules={{
                  toolbar: [
                    [{ header: [1, 2, 3, false] }],
                    ["bold", "italic", "underline", "strike"],
                    [{ list: "ordered" }, { list: "bullet" }],
                    [{ color: [] }, { background: [] }],
                    ["link"],
                    ["clean"],
                  ],
                }}
                formats={[
                  "header",
                  "bold",
                  "italic",
                  "underline",
                  "strike",
                  "list",
                  "bullet",
                  "color",
                  "background",
                  "link",
                ]}
                style={{ minHeight: "150px" }}
              />
            </div>
          </div>

          {/* Images */}
          <div>
            <Label>
              Product Images <span className="text-red-500">*</span>
            </Label>
            <p className="text-xs text-muted-foreground mt-1 mb-3">
              You can upload up to 6 images (JPG, PNG, GIF, WebP - Max 5MB each).
              Currently: {totalImages}/6
            </p>

            {/* Existing Images */}
            {existingImages.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium mb-2">Current Images:</p>
                <div className="grid grid-cols-3 gap-3">
                  {existingImages.map((url, index) => (
                    <div
                      key={`existing-${index}`}
                      className="relative group aspect-square rounded-lg overflow-hidden border-2 border-border"
                    >
                      <img
                        src={url}
                        alt={`Product ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemoveExistingImage(index)}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Images Preview */}
            {newImagePreviews.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium mb-2 text-green-600">
                  New Images to Upload:
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {newImagePreviews.map((url, index) => (
                    <div
                      key={`new-${index}`}
                      className="relative group aspect-square rounded-lg overflow-hidden border-2 border-green-500"
                    >
                      <img
                        src={url}
                        alt={`New ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-1 right-1">
                        <Badge variant="secondary" className="text-xs">
                          New
                        </Badge>
                      </div>
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemoveNewImage(index)}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload Button */}
            {totalImages < 6 && (
              <div>
                <input
                  id="edit-images"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  multiple
                  onChange={handleImageSelect}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById("edit-images")?.click()}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Add More Images ({6 - totalImages} remaining)
                </Button>
              </div>
            )}

            {totalImages === 0 && (
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  No images selected. Click "Add More Images" to upload.
                </p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isUpdating}
          >
            Cancel
          </Button>
          <Button onClick={handleUpdateProduct} disabled={isUpdating}>
            {isUpdating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Product"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
