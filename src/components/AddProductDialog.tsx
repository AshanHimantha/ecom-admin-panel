import { useState, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
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
import { Button } from "@/components/ui/button";
import { Loader2, X, Upload, ImagePlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ProductsAPI, CreateProductPayload } from "@/api/productsApi";
import { CategoriesAPI, Category } from "@/api/categoriesApi";

interface AddProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProductCreated: () => void;
}

export default function AddProductDialog({
  open,
  onOpenChange,
  onProductCreated,
}: AddProductDialogProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    categoryId: "",
    sellingPrice: "",
    unitCost: "",
    description: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    if (open && categories.length === 0) {
      fetchCategories();
    }
  }, [open]);

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      console.log('📡 Fetching categories');
      const response = await CategoriesAPI.getAllCategories();
      console.log('✅ Categories API response:', response);

      if (response.success && Array.isArray(response.data)) {
        setCategories(response.data);
      } else {
        console.warn('⚠️ Unexpected API response structure:', response);
        setCategories([]);
      }
    } catch (error: any) {
      console.error('❌ Error fetching categories:', error);
      const errorMessage = error.response?.data?.message
        || error.response?.data?.error
        || error.message
        || "Failed to fetch categories";

      toast({
        title: "Error Loading Categories",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const currentImageCount = selectedImages.length;
    const newFiles = Array.from(files);
    
    if (currentImageCount + newFiles.length > 6) {
      toast({
        title: "Validation Error",
        description: `You can only add ${6 - currentImageCount} more image(s). Maximum 6 images allowed.`,
        variant: "destructive",
      });
      return;
    }

    // Validate file types
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const invalidFiles = newFiles.filter(file => !validTypes.includes(file.type));
    
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
    const oversizedFiles = newFiles.filter(file => file.size > maxSize);
    
    if (oversizedFiles.length > 0) {
      toast({
        title: "File Too Large",
        description: "Each image must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    // Add files and create preview URLs
    setSelectedImages(prev => [...prev, ...newFiles]);
    
    // Create preview URLs
    newFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviewUrls(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });

    // Reset file input
    e.target.value = '';
  };

  const handleRemoveImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      categoryId: "",
      sellingPrice: "",
      unitCost: "",
      description: "",
    });
    setSelectedImages([]);
    setImagePreviewUrls([]);
  };

  const handleCreateProduct = async () => {
    // Validation
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Product name is required",
        variant: "destructive",
      });
      return;
    }

    if (!formData.categoryId) {
      toast({
        title: "Validation Error",
        description: "Please select a category",
        variant: "destructive",
      });
      return;
    }

    if (!formData.sellingPrice || parseFloat(formData.sellingPrice) <= 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid selling price",
        variant: "destructive",
      });
      return;
    }

    if (!formData.unitCost || parseFloat(formData.unitCost) <= 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid unit cost",
        variant: "destructive",
      });
      return;
    }

    if (!formData.description.trim() || formData.description === '<p><br></p>') {
      toast({
        title: "Validation Error",
        description: "Description is required",
        variant: "destructive",
      });
      return;
    }

    if (selectedImages.length === 0) {
      toast({
        title: "Validation Error",
        description: "At least 1 image is required",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsCreating(true);

      // For now, we'll use base64 strings from preview URLs as image URLs
      // In a real application, you would upload these to a file storage service first
      const payload: CreateProductPayload = {
        name: formData.name,
        categoryId: parseInt(formData.categoryId),
        sellingPrice: parseFloat(formData.sellingPrice),
        unitCost: parseFloat(formData.unitCost),
        stockCount: 0, // Default stock count to 0
        description: formData.description,
        producerInfo: "", // Empty string for producer info
        imageUrls: imagePreviewUrls, // Using base64 preview URLs
      };

      console.log('📤 Creating product with payload:', payload);

      const response = await ProductsAPI.createProduct(payload);

      console.log('✅ Product created:', response);

      toast({
        title: "Success",
        description: "Product created successfully",
      });

      resetForm();
      onOpenChange(false);
      onProductCreated();

    } catch (error: any) {
      console.error('❌ Error creating product:', error);
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
        || "Failed to create product";

      toast({
        title: "Error Creating Product",
        description: `${errorMessage}${error.response?.status ? ` (${error.response.status})` : ''}`,
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
          <DialogDescription>
            Create a new product. All fields are required.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">
              Product Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder="Enter product name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="category">
              Category <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.categoryId}
              onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {loadingCategories ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                ) : categories.length === 0 ? (
                  <div className="text-center py-4 text-sm text-muted-foreground">
                    No categories available
                  </div>
                ) : (
                  categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="sellingPrice">
                Selling Price <span className="text-red-500">*</span>
              </Label>
              <Input
                id="sellingPrice"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.sellingPrice}
                onChange={(e) => setFormData(prev => ({ ...prev, sellingPrice: e.target.value }))}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="unitCost">
                Unit Cost <span className="text-red-500">*</span>
              </Label>
              <Input
                id="unitCost"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.unitCost}
                onChange={(e) => setFormData(prev => ({ ...prev, unitCost: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">
              Description <span className="text-red-500">*</span>
              <span className="text-xs text-muted-foreground ml-2">
                (Supports formatting: bold, italic, lists, etc.)
              </span>
            </Label>
            <div className="border rounded-md">
              <ReactQuill
                theme="snow"
                value={formData.description}
                onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
                placeholder="Enter product description with rich formatting..."
                modules={{
                  toolbar: [
                    [{ 'header': [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline', 'strike'],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    [{ 'color': [] }, { 'background': [] }],
                    ['link'],
                    ['clean']
                  ],
                }}
                formats={[
                  'header',
                  'bold', 'italic', 'underline', 'strike',
                  'list', 'bullet',
                  'color', 'background',
                  'link'
                ]}
                style={{ minHeight: '150px' }}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label>
              Product Images <span className="text-red-500">*</span>
              <span className="text-xs text-muted-foreground ml-2">
                (Min: 1, Max: 6 | JPG, PNG, GIF, WebP | Max 5MB each)
              </span>
            </Label>
            
            <div className="relative">
              <input
                type="file"
                id="imageUpload"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                multiple
                onChange={handleImageSelect}
                disabled={selectedImages.length >= 6}
                className="hidden"
              />
              <label
                htmlFor="imageUpload"
                className={`
                  flex flex-col items-center justify-center w-full h-32 
                  border-2 border-dashed rounded-lg cursor-pointer
                  transition-all duration-200
                  ${selectedImages.length >= 6 
                    ? 'border-muted bg-muted/20 cursor-not-allowed opacity-50' 
                    : 'border-primary/50 bg-primary/5 hover:bg-primary/10 hover:border-primary'
                  }
                `}
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <div className="relative mb-3">
                    <ImagePlus className={`w-10 h-10 ${selectedImages.length >= 6 ? 'text-muted-foreground' : 'text-primary'}`} />
                    <Upload className={`w-4 h-4 absolute -top-1 -right-1 ${selectedImages.length >= 6 ? 'text-muted-foreground' : 'text-primary'}`} />
                  </div>
                  <p className="mb-2 text-sm font-medium text-foreground">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG, GIF or WebP (MAX. 5MB per file)
                  </p>
                  {selectedImages.length > 0 && (
                    <p className="mt-2 text-xs font-medium text-primary">
                      {selectedImages.length} of 6 images selected
                    </p>
                  )}
                </div>
              </label>
            </div>

            {imagePreviewUrls.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-2">
                {imagePreviewUrls.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`Product ${index + 1}`}
                      className="w-full h-24 object-cover rounded border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemoveImage(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <div className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-1 rounded">
                      {index + 1}
                    </div>
                    <div className="absolute bottom-1 right-1 bg-black/60 text-white text-xs px-1 rounded">
                      {(selectedImages[index].size / 1024).toFixed(0)}KB
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              resetForm();
            }}
            disabled={isCreating}
          >
            Cancel
          </Button>
          <Button onClick={handleCreateProduct} disabled={isCreating}>
            {isCreating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Product"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
