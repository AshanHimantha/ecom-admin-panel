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
import { Loader2, X, Upload, ImagePlus, Plus, ArrowLeft, ArrowRight, Package, PackageOpen, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ProductsAPI } from "@/api/productsApi";
import { CategoriesAPI, Category } from "@/api/categoriesApi";
import { CategoryTypesAPI, CategoryType } from "@/api/categoryTypesApi";
import AddCategoryDialog from "./AddCategoryDialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface AddProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProductCreated: () => void;
}

interface ProductVariant {
  color: string;
  size: string;
  unitCost: string;
  sellingPrice: string;
  quantity: string;
  sku?: string;
}

interface ColorOption {
  hex: string;
  name: string;
}

const PREDEFINED_COLORS: ColorOption[] = [
  { hex: "NONE", name: "None" },
  { hex: "#FF0000", name: "Red" },
  { hex: "#0000FF", name: "Blue" },
  { hex: "#008000", name: "Green" },
  { hex: "#FFFF00", name: "Yellow" },
  { hex: "#000000", name: "Black" },
  { hex: "#FFFFFF", name: "White" },
  { hex: "#808080", name: "Gray" },
  { hex: "#800080", name: "Purple" },
  { hex: "#FFA500", name: "Orange" },
  { hex: "#FFC0CB", name: "Pink" },
  { hex: "#A52A2A", name: "Brown" },
  { hex: "#000080", name: "Navy" },
  { hex: "#F5F5DC", name: "Beige" },
  { hex: "#008080", name: "Teal" },

];

export default function AddProductDialog({
  open,
  onOpenChange,
  onProductCreated,
}: AddProductDialogProps) {
  const [step, setStep] = useState(1);
  const [productType, setProductType] = useState<"STOCK" | "NON_STOCK" | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryTypes, setCategoryTypes] = useState<CategoryType[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<ColorOption[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [newColor, setNewColor] = useState("#000000");
  const [colorName, setColorName] = useState("");
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [showAddCategoryDialog, setShowAddCategoryDialog] = useState(false);
  const [bulkEdit, setBulkEdit] = useState({
    unitCost: "",
    sellingPrice: "",
    quantity: "",
  });
  
  const [formData, setFormData] = useState({
    name: "",
    categoryId: "",
    description: "",
  });
  const { toast } = useToast();

  // Get available sizes from selected category
  const selectedCategory = categories.find(c => c.id.toString() === formData.categoryId);
  const availableSizes = selectedCategory?.categoryType?.sizeOptions || [];

  useEffect(() => {
    if (open) {
      fetchCategories();
      fetchCategoryTypes();
    } else {
      // Reset everything when dialog closes
      resetForm();
    }
  }, [open]);

  // Generate variants when colors or category changes
  useEffect(() => {
    if (selectedColors.length > 0 && selectedSizes.length > 0) {
      const newVariants: ProductVariant[] = [];
      selectedColors.forEach(colorOption => {
        selectedSizes.forEach(size => {
          // Check if variant already exists
          const existingVariant = variants.find(v => v.color === colorOption.hex && v.size === size);
          if (existingVariant) {
            // Update quantity to 0 if product type is NON_STOCK
            if (productType === "NON_STOCK") {
              newVariants.push({ ...existingVariant, quantity: "0" });
            } else {
              newVariants.push(existingVariant);
            }
          } else {
            newVariants.push({
              color: colorOption.hex,
              size,
              unitCost: "",
              sellingPrice: "",
              quantity: productType === "NON_STOCK" ? "0" : "",
              sku: generateSKU(formData.name, colorOption.name, size),
            });
          }
        });
      });
      setVariants(newVariants);
    } else {
      setVariants([]);
    }
  }, [selectedColors, selectedSizes, formData.name, productType]);

  const generateSKU = (productName: string, color: string, size: string) => {
    const namePrefix = productName.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 3) || 'PRD';
    const colorCode = color.slice(0, 3).toUpperCase();
    const sizeCode = size.toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${namePrefix}-${colorCode}-${sizeCode}-${random}`;
  };

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

  const fetchCategoryTypes = async () => {
    try {
      console.log('📡 Fetching category types');
      const response = await CategoryTypesAPI.getAllCategoryTypes();
      console.log('✅ Category types API response:', response);

      if (response.success && Array.isArray(response.data)) {
        setCategoryTypes(response.data);
      } else {
        console.warn('⚠️ Unexpected API response structure:', response);
        setCategoryTypes([]);
      }
    } catch (error: any) {
      console.error('❌ Error fetching category types:', error);
      const errorMessage = error.response?.data?.message
        || error.response?.data?.error
        || error.message
        || "Failed to fetch category types";

      toast({
        title: "Error Loading Category Types",
        description: errorMessage,
        variant: "destructive",
      });
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

  const handleAddColor = () => {
    if (!colorName.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a color name",
        variant: "destructive",
      });
      return;
    }

    const hasNone = selectedColors.some(c => c.hex === "NONE");
    if (hasNone) {
      toast({
        title: "Cannot Add Color",
        description: "'None' is selected. Please remove 'None' first to add other colors.",
        variant: "destructive",
      });
      return;
    }

    // Check if color already exists
    if (selectedColors.some(c => c.hex.toLowerCase() === newColor.toLowerCase())) {
      toast({
        title: "Duplicate Color",
        description: "This color has already been added",
        variant: "destructive",
      });
      return;
    }

    setSelectedColors(prev => [...prev, { hex: newColor, name: colorName.trim() }]);
    setColorName("");
    setNewColor("#000000");
  };

  const handleTogglePredefinedColor = (colorOption: ColorOption) => {
    const isSelected = selectedColors.some(c => c.hex.toLowerCase() === colorOption.hex.toLowerCase());
    const isNone = colorOption.hex === "NONE";
    const hasNone = selectedColors.some(c => c.hex === "NONE");
    
    if (isSelected) {
      // Remove the color
      setSelectedColors(prev => prev.filter(c => c.hex.toLowerCase() !== colorOption.hex.toLowerCase()));
    } else {
      // Adding a color
      if (isNone) {
        // If selecting "None", clear all other colors and set only "None"
        setSelectedColors([colorOption]);
        toast({
          title: "None Selected",
          description: "Only 'None' can be selected. Other colors have been cleared.",
        });
      } else if (hasNone) {
        // If "None" is already selected and trying to add another color, replace "None"
        setSelectedColors([colorOption]);
        toast({
          title: "Color Selected",
          description: "'None' has been replaced with the selected color.",
        });
      } else {
        // Normal color addition
        setSelectedColors(prev => [...prev, colorOption]);
      }
    }
  };

  const handleRemoveColor = (hex: string) => {
    setSelectedColors(prev => prev.filter(c => c.hex !== hex));
  };

  const handleToggleSize = (size: string) => {
    setSelectedSizes(prev => 
      prev.includes(size)
        ? prev.filter(s => s !== size)
        : [...prev, size]
    );
  };

  const updateVariant = (index: number, field: keyof ProductVariant, value: string) => {
    setVariants(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const applyBulkEdit = () => {
    if (!bulkEdit.unitCost && !bulkEdit.sellingPrice && !bulkEdit.quantity) {
      toast({
        title: "No Values",
        description: "Please enter at least one value to apply to all variants",
        variant: "destructive",
      });
      return;
    }

    setVariants(prev => prev.map(variant => ({
      ...variant,
      ...(bulkEdit.unitCost && { unitCost: bulkEdit.unitCost }),
      ...(bulkEdit.sellingPrice && { sellingPrice: bulkEdit.sellingPrice }),
      ...(productType === "STOCK" && bulkEdit.quantity && { quantity: bulkEdit.quantity }),
    })));

    toast({
      title: "Bulk Edit Applied",
      description: `Updated ${variants.length} variant${variants.length !== 1 ? 's' : ''}`,
    });

    // Reset bulk edit form
    setBulkEdit({
      unitCost: "",
      sellingPrice: "",
      quantity: "",
    });
  };

  const resetForm = () => {
    setStep(1);
    setProductType(null);
    setFormData({
      name: "",
      categoryId: "",
      description: "",
    });
    setSelectedImages([]);
    setImagePreviewUrls([]);
    setSelectedColors([]);
    setSelectedSizes([]);
    setVariants([]);
  };

  const canProceedToStep2 = () => {
    return productType !== null;
  };

  const canProceedToStep3 = () => {
    return formData.categoryId !== "";
  };

  const canProceedToStep4 = () => {
    return selectedColors.length > 0;
  };

  const canProceedToStep5 = () => {
    return selectedSizes.length > 0;
  };

  const canProceedToStep6 = () => {
    // Check if all variants have required fields
    if (variants.length === 0) return false;
    return variants.every(v => 
      v.unitCost && parseFloat(v.unitCost) > 0 &&
      v.sellingPrice && parseFloat(v.sellingPrice) > 0 &&
      (productType === "NON_STOCK" || (v.quantity && parseInt(v.quantity) >= 0))
    );
  };

  const validateStep6 = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Product name is required",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.description.trim() || formData.description === '<p><br></p>') {
      toast({
        title: "Validation Error",
        description: "Description is required",
        variant: "destructive",
      });
      return false;
    }

    if (selectedImages.length === 0) {
      toast({
        title: "Validation Error",
        description: "At least 1 image is required",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };


  const handleCreateProduct = async () => {
    if (!validateStep6()) return;

    try {
      setIsCreating(true);

      // Create FormData for multipart/form-data
      const formDataPayload = new FormData();
      
      formDataPayload.append('name', formData.name);
      formDataPayload.append('description', formData.description);
      formDataPayload.append('productType', productType!);
      formDataPayload.append('categoryId', formData.categoryId);

      // Add variants
      variants.forEach((variant, index) => {
        formDataPayload.append(`variants[${index}].color`, variant.color);
        formDataPayload.append(`variants[${index}].size`, variant.size);
        formDataPayload.append(`variants[${index}].unitCost`, variant.unitCost);
        formDataPayload.append(`variants[${index}].sellingPrice`, variant.sellingPrice);
        if (productType === "STOCK") {
          formDataPayload.append(`variants[${index}].quantity`, variant.quantity);
        }
        if (variant.sku) {
          formDataPayload.append(`variants[${index}].sku`, variant.sku);
        }
      });

      // Add images
      selectedImages.forEach((file) => {
        formDataPayload.append('files', file);
      });

      console.log('📤 Creating product with FormData');
      console.log('Product Type:', productType);
      console.log('Category ID:', formData.categoryId);
      console.log('Variants Count:', variants.length);
      console.log('Images Count:', selectedImages.length);

      // Send FormData to API
      const response = await ProductsAPI.createProduct(formDataPayload);

      console.log('✅ Product created:', response);

      toast({
        title: "Success",
        description: "Product created successfully with all variants",
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

  const renderStepIndicator = () => {
    const steps = [
      { num: 1, label: "Type" },
      { num: 2, label: "Category" },
      { num: 3, label: "Colors" },
      { num: 4, label: "Sizes" },
      { num: 5, label: "Variants" },
      { num: 6, label: "Details" },
    ];

    return (
      <div className="flex items-center justify-between mb-6">
        {steps.map((s, index) => (
          <div key={s.num} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  step > s.num
                    ? "bg-green-500 text-white"
                    : step === s.num
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {step > s.num ? <Check className="h-4 w-4" /> : s.num}
              </div>
              <span className={`text-xs mt-1 ${step === s.num ? "font-medium" : "text-muted-foreground"}`}>
                {s.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={`h-[2px] flex-1 mx-2 ${step > s.num ? "bg-green-500" : "bg-muted"}`} />
            )}
          </div>
        ))}
      </div>
    );
  };


  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
            <DialogDescription>
              Create a new product with variants. Follow the steps to complete.
            </DialogDescription>
          </DialogHeader>

          {renderStepIndicator()}

          <div className="py-4">
            {/* Step 1: Product Type Selection */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <Label className="text-base">Select Product Type</Label>
                  <p className="text-sm text-muted-foreground mb-4">
                    Choose whether this product will have stock tracking or not
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <Card
                    className={`p-6 cursor-pointer transition-all hover:shadow-md ${
                      productType === "STOCK" ? "border-primary border-2 bg-primary/5" : ""
                    }`}
                    onClick={() => setProductType("STOCK")}
                  >
                    <div className="flex flex-col items-center text-center space-y-3">
                      <div className={`p-3 rounded-full ${productType === "STOCK" ? "bg-primary/10" : "bg-muted"}`}>
                        <Package className={`h-8 w-8 ${productType === "STOCK" ? "text-primary" : "text-muted-foreground"}`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">Stock Product</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Track inventory quantities for this product
                        </p>
                      </div>
                      {productType === "STOCK" && (
                        <Badge variant="default">Selected</Badge>
                      )}
                    </div>
                  </Card>

                  <Card
                    className={`p-6 cursor-pointer transition-all hover:shadow-md ${
                      productType === "NON_STOCK" ? "border-primary border-2 bg-primary/5" : ""
                    }`}
                    onClick={() => setProductType("NON_STOCK")}
                  >
                    <div className="flex flex-col items-center text-center space-y-3">
                      <div className={`p-3 rounded-full ${productType === "NON_STOCK" ? "bg-primary/10" : "bg-muted"}`}>
                        <PackageOpen className={`h-8 w-8 ${productType === "NON_STOCK" ? "text-primary" : "text-muted-foreground"}`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">Non-Stock Product</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          No inventory tracking needed
                        </p>
                      </div>
                      {productType === "NON_STOCK" && (
                        <Badge variant="default">Selected</Badge>
                      )}
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {/* Step 2: Category Selection */}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="category" className="text-base">
                    Select Category <span className="text-red-500">*</span>
                  </Label>
                  <p className="text-sm text-muted-foreground mb-4">
                    Choose a category for your product. Size options will be based on this category.
                  </p>
                </div>

                <div className="flex gap-2">
                  <Select
                    value={formData.categoryId}
                    onValueChange={(value) => {
                      setFormData(prev => ({ ...prev, categoryId: value }));
                      // Reset colors, sizes and variants when category changes
                      setSelectedColors([]);
                      setSelectedSizes([]);
                      setVariants([]);
                    }}
                  >
                    <SelectTrigger id="category" className="flex-1">
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
                            <div className="flex items-center gap-2">
                              <span>{category.name}</span>
                              {category.categoryType && (
                                <Badge variant="outline" className="text-xs">
                                  {category.categoryType.sizeOptions.length} sizes
                                </Badge>
                              )}
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddCategoryDialog(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add New
                  </Button>
                </div>

                {formData.categoryId && selectedCategory && (
                  <Card className="p-4 bg-muted/50">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Selected Category:</span>
                        <Badge>{selectedCategory.name}</Badge>
                      </div>
                      {selectedCategory.categoryType && (
                        <>
                          <Separator />
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium">Available Sizes:</span>
                              <span className="text-xs text-muted-foreground">
                                {selectedCategory.categoryType.sizeOptions.length} size{selectedCategory.categoryType.sizeOptions.length !== 1 ? 's' : ''}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {selectedCategory.categoryType.sizeOptions.map(size => (
                                <Badge key={size} variant="secondary">{size}</Badge>
                              ))}
                            </div>
                            <p className="text-xs text-muted-foreground mt-2 italic">
                              You'll be able to select which sizes you want in the next steps
                            </p>
                          </div>
                        </>
                      )}
                      {!selectedCategory.categoryType && (
                        <p className="text-sm text-amber-600">
                          ⚠️ This category has no size options defined
                        </p>
                      )}
                    </div>
                  </Card>
                )}
              </div>
            )}

            {/* Step 3: Color Selection */}
            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <Label className="text-base">
                    Select Colors <span className="text-red-500">*</span>
                  </Label>
                  <p className="text-sm text-muted-foreground mb-4">
                    Choose from common colors or add custom colors for your product variants
                  </p>
                </div>

                {/* Predefined Colors */}
                <div>
                  <Label className="text-sm font-medium mb-3 block">Quick Select - Common Colors</Label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                    {PREDEFINED_COLORS.map(colorOption => {
                      const isSelected = selectedColors.some(c => c.hex.toLowerCase() === colorOption.hex.toLowerCase());
                      const isNone = colorOption.hex === "NONE";
                      const hasNone = selectedColors.some(c => c.hex === "NONE");
                      const isDisabled = (hasNone && !isNone) || (!hasNone && isNone && selectedColors.length > 0);
                      
                      return (
                        <div
                          key={colorOption.hex}
                          onClick={() => !isDisabled && handleTogglePredefinedColor(colorOption)}
                          className={`
                            p-3 rounded-lg border-2 transition-all
                            flex flex-col items-center gap-2
                            ${isDisabled 
                              ? "opacity-50 cursor-not-allowed border-muted" 
                              : "cursor-pointer"
                            }
                            ${isSelected 
                              ? "border-primary bg-primary/10 shadow-md" 
                              : "border-muted hover:border-primary/50 hover:shadow-sm"
                            }
                          `}
                        >
                          {isNone ? (
                            <div className="w-10 h-10 rounded-lg border-2 border-dashed border-border shadow-sm flex items-center justify-center bg-muted/50">
                              <span className="text-xs font-bold text-muted-foreground">N/A</span>
                            </div>
                          ) : (
                            <div
                              className="w-10 h-10 rounded-lg border-2 border-border shadow-sm"
                              style={{ backgroundColor: colorOption.hex }}
                              title={colorOption.hex}
                            />
                          )}
                          <span className="text-xs font-medium text-center">{colorOption.name}</span>
                          {isSelected && (
                            <Check className="h-4 w-4 text-primary" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <Separator className="my-6" />

                {/* Custom Color Picker */}
                <div>
                  <Label className="text-sm font-medium mb-3 block">Add Custom Color</Label>
                  <Card className={`p-4 ${selectedColors.some(c => c.hex === "NONE") ? "opacity-50" : ""}`}>
                    <div className="space-y-3">
                      {selectedColors.some(c => c.hex === "NONE") ? (
                        <p className="text-xs text-muted-foreground">
                          Custom colors are disabled when 'None' is selected. Remove 'None' to add custom colors.
                        </p>
                      ) : (
                        <>
                          <p className="text-xs text-muted-foreground">
                            Can't find the color you need? Create a custom color with any shade.
                          </p>
                          <div className="flex gap-3">
                            <div className="flex flex-col gap-2">
                              <Label htmlFor="colorPicker" className="text-xs text-muted-foreground">
                                Pick Color
                              </Label>
                              <div className="relative h-10">
                                <input
                                  id="colorPicker"
                                  type="color"
                                  value={newColor}
                                  onChange={(e) => setNewColor(e.target.value)}
                                  className="w-20 h-30 rounded-lg cursor-pointer border-2 border-border"
                                  style={{ backgroundColor: newColor }}
                                />
                              </div>
                            </div>
                            
                            <div className="flex-1 flex flex-col gap-2">
                              <Label htmlFor="colorName" className="text-xs text-muted-foreground">
                                Color Name
                              </Label>
                              <Input
                                id="colorName"
                                placeholder="e.g., Midnight Blue, Forest Green"
                                value={colorName}
                                onChange={(e) => setColorName(e.target.value)}
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleAddColor();
                                  }
                                }}
                              />
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>Hex Code:</span>
                                <code className="px-2 py-1 bg-muted rounded font-mono">{newColor.toUpperCase()}</code>
                              </div>
                            </div>

                            <div className="flex items-center -mt-2">
                              <Button
                                type="button"
                                onClick={handleAddColor}
                                variant="default"
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Add
                              </Button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </Card>
                </div>

                {/* Selected Colors Display */}
                {selectedColors.length > 0 ? (
                  <Card className="p-4 bg-muted/50">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium">Selected Colors:</span>
                      <Badge variant="default">{selectedColors.length} color{selectedColors.length !== 1 ? 's' : ''}</Badge>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {selectedColors.map((colorOption) => {
                        const isNone = colorOption.hex === "NONE";
                        return (
                          <div
                            key={colorOption.hex}
                            className="flex items-center gap-2 p-2 rounded-lg border bg-background"
                          >
                            {isNone ? (
                              <div className="w-10 h-10 rounded border-2 border-dashed border-border flex-shrink-0 flex items-center justify-center bg-muted/50">
                                <span className="text-xs font-bold text-muted-foreground">N/A</span>
                              </div>
                            ) : (
                              <div
                                className="w-10 h-10 rounded border-2 border-border flex-shrink-0"
                                style={{ backgroundColor: colorOption.hex }}
                                title={colorOption.hex}
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{colorOption.name}</p>
                              <p className="text-xs text-muted-foreground font-mono">{colorOption.hex.toUpperCase()}</p>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 flex-shrink-0"
                              onClick={() => handleRemoveColor(colorOption.hex)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                ) : (
                  <Card className="p-8 text-center border-dashed">
                    <p className="text-sm text-muted-foreground">
                      No colors selected yet. Choose from common colors above or add a custom color.
                    </p>
                  </Card>
                )}
              </div>
            )}

            {/* Step 4: Size Selection */}
            {step === 4 && (
              <div className="space-y-4">
                <div>
                  <Label className="text-base">
                    Select Sizes <span className="text-red-500">*</span>
                  </Label>
                  <p className="text-sm text-muted-foreground mb-4">
                    Choose which sizes you want for this product from the available sizes in the category
                  </p>
                </div>

                {availableSizes.length === 0 ? (
                  <Card className="p-8 text-center border-dashed">
                    <p className="text-muted-foreground">
                      No sizes available for the selected category. Please select a category with size options.
                    </p>
                  </Card>
                ) : (
                  <>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                      {availableSizes.map(size => {
                        const isSelected = selectedSizes.includes(size);
                        return (
                          <div
                            key={size}
                            onClick={() => handleToggleSize(size)}
                            className={`
                              p-4 rounded-lg border-2 cursor-pointer transition-all
                              flex flex-col items-center justify-center gap-2
                              min-h-[80px]
                              ${isSelected 
                                ? "border-primary bg-primary/10 shadow-md" 
                                : "border-muted hover:border-primary/50 hover:shadow-sm"
                              }
                            `}
                          >
                            <span className="text-lg font-bold">{size}</span>
                            {isSelected && (
                              <Check className="h-5 w-5 text-primary" />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {selectedSizes.length > 0 && (
                      <Card className="p-4 bg-muted/50">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium">Selected Sizes:</span>
                          <Badge variant="default">{selectedSizes.length} size{selectedSizes.length !== 1 ? 's' : ''}</Badge>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {selectedSizes.map(size => (
                            <Badge key={size} variant="secondary" className="text-sm px-3 py-1">
                              {size}
                            </Badge>
                          ))}
                        </div>
                        <Separator className="my-3" />
                        <div className="text-xs text-muted-foreground">
                          <p>Total variants that will be created: <span className="font-semibold">{selectedColors.length} colors × {selectedSizes.length} sizes = {selectedColors.length * selectedSizes.length} variants</span></p>
                        </div>
                      </Card>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Step 5: Variants Configuration */}
            {step === 5 && (
              <div className="space-y-4">
                <div>
                  <Label className="text-base">
                    Configure Product Variants <span className="text-red-500">*</span>
                  </Label>
                  <p className="text-sm text-muted-foreground mb-4">
                    Set pricing and {productType === "STOCK" ? "quantities" : "details"} for each color-size combination
                  </p>
                </div>

                {variants.length === 0 ? (
                  <Card className="p-8 text-center">
                    <p className="text-muted-foreground">No variants to configure</p>
                  </Card>
                ) : (
                  <>
                    {/* Bulk Edit Section */}
                    <Card className="p-4 bg-primary/5 border-primary/20">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-sm font-semibold">Bulk Edit - Apply to All Variants</Label>
                            <p className="text-xs text-muted-foreground mt-1">
                              Set values here to apply them to all {variants.length} variants at once
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div>
                            <Label htmlFor="bulk-unitCost" className="text-xs">
                              Unit Cost ($)
                            </Label>
                            <Input
                              id="bulk-unitCost"
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0.00"
                              value={bulkEdit.unitCost}
                              onChange={(e) => setBulkEdit(prev => ({ ...prev, unitCost: e.target.value }))}
                              className="mt-1"
                            />
                          </div>

                          <div>
                            <Label htmlFor="bulk-sellingPrice" className="text-xs">
                              Selling Price ($)
                            </Label>
                            <Input
                              id="bulk-sellingPrice"
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0.00"
                              value={bulkEdit.sellingPrice}
                              onChange={(e) => setBulkEdit(prev => ({ ...prev, sellingPrice: e.target.value }))}
                              className="mt-1"
                            />
                          </div>

                          {productType === "STOCK" && (
                            <div>
                              <Label htmlFor="bulk-quantity" className="text-xs">
                                Quantity
                              </Label>
                              <Input
                                id="bulk-quantity"
                                type="number"
                                min="0"
                                placeholder="0"
                                value={bulkEdit.quantity}
                                onChange={(e) => setBulkEdit(prev => ({ ...prev, quantity: e.target.value }))}
                                className="mt-1"
                              />
                            </div>
                          )}

                          <div className="flex items-end">
                            <Button
                              type="button"
                              onClick={applyBulkEdit}
                              className="w-full"
                              variant="default"
                            >
                              Apply to All
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>

                    <Separator />

                    {/* Individual Variants */}
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                    {variants.map((variant, index) => {
                      const colorOption = selectedColors.find(c => c.hex === variant.color);
                      const isNone = variant.color === "NONE";
                      return (
                        <Card key={`${variant.color}-${variant.size}`} className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="flex items-center gap-2 px-2 py-1 rounded border bg-background">
                                {isNone ? (
                                  <div className="w-5 h-5 rounded border border-dashed border-border flex items-center justify-center bg-muted/50">
                                    <span className="text-[8px] font-bold text-muted-foreground">N/A</span>
                                  </div>
                                ) : (
                                  <div
                                    className="w-5 h-5 rounded border border-border"
                                    style={{ backgroundColor: variant.color }}
                                    title={variant.color}
                                  />
                                )}
                                <span className="text-sm font-medium">{colorOption?.name || variant.color}</span>
                              </div>
                              <Badge variant="secondary">{variant.size}</Badge>
                              {variant.sku && (
                                <Badge variant="outline" className="text-xs font-mono">
                                  {variant.sku}
                                </Badge>
                              )}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <Label htmlFor={`unitCost-${index}`} className="text-xs">
                                  Unit Cost ($) <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                  id={`unitCost-${index}`}
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  placeholder="0.00"
                                  value={variant.unitCost}
                                  onChange={(e) => updateVariant(index, 'unitCost', e.target.value)}
                                  className="mt-1"
                                />
                              </div>

                              <div>
                                <Label htmlFor={`sellingPrice-${index}`} className="text-xs">
                                  Selling Price ($) <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                  id={`sellingPrice-${index}`}
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  placeholder="0.00"
                                  value={variant.sellingPrice}
                                  onChange={(e) => updateVariant(index, 'sellingPrice', e.target.value)}
                                  className="mt-1"
                                />
                              </div>

                              {productType === "STOCK" && (
                                <div className="col-span-2">
                                  <Label htmlFor={`quantity-${index}`} className="text-xs">
                                    Quantity <span className="text-red-500">*</span>
                                  </Label>
                                  <Input
                                    id={`quantity-${index}`}
                                    type="number"
                                    min="0"
                                    placeholder="0"
                                    value={variant.quantity}
                                    onChange={(e) => updateVariant(index, 'quantity', e.target.value)}
                                    className="mt-1"
                                  />
                                </div>
                              )}
                              
                              {productType === "NON_STOCK" && (
                                <div className="col-span-2">
                                  <Label className="text-xs text-muted-foreground">
                                    Quantity (Non-Stock Product)
                                  </Label>
                                  <div className="mt-1 px-3 py-2 bg-muted rounded-md text-sm text-muted-foreground border border-dashed">
                                    Automatically set to 0 (Non-stock product)
                                  </div>
                                </div>
                              )}
                            </div>

                            {variant.unitCost && variant.sellingPrice && (
                              <div className="text-xs text-muted-foreground pt-2 border-t">
                                Profit Margin: {
                                  ((parseFloat(variant.sellingPrice) - parseFloat(variant.unitCost)) / parseFloat(variant.sellingPrice) * 100).toFixed(1)
                                }%
                              </div>
                            )}
                          </div>
                        </Card>
                      );
                    })}
                  </div>

                  {variants.length > 0 && (
                    <Card className="p-4 bg-muted/50">
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span className="font-medium">Total Variants:</span>
                          <span>{variants.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Colors:</span>
                          <span>{selectedColors.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Sizes:</span>
                          <span>{selectedSizes.length}</span>
                        </div>
                      </div>
                    </Card>
                  )}
                  </>
                )}
              </div>
            )}

            {/* Step 6: Product Details */}
            {step === 6 && (
              <div className="space-y-4">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">
                      Product Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      placeholder="Enter product name"
                      value={formData.name}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, name: e.target.value }));
                        // Regenerate SKUs when name changes
                        setVariants(prev => prev.map(v => {
                          const colorOption = selectedColors.find(c => c.hex === v.color);
                          return {
                            ...v,
                            sku: generateSKU(e.target.value, colorOption?.name || v.color, v.size)
                          };
                        }));
                      }}
                    />
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
                           
                            <Upload className={`w-4 h-4 absolute  -top-3 -right-1 ${selectedImages.length >= 6 ? 'text-muted-foreground' : 'text-primary'}`} />
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

                {/* Summary */}
                <Card className="p-4 bg-muted/50">
                  <h4 className="font-semibold mb-3">Product Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type:</span>
                      <Badge variant="default">{productType}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Category:</span>
                      <span className="font-medium">{selectedCategory?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Variants:</span>
                      <span className="font-medium">{variants.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Images:</span>
                      <span className="font-medium">{selectedImages.length}</span>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            {step > 1 && (
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
                disabled={isCreating}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            )}
            
            {step < 6 ? (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={
                  (step === 1 && !canProceedToStep2()) ||
                  (step === 2 && !canProceedToStep3()) ||
                  (step === 3 && !canProceedToStep4()) ||
                  (step === 4 && !canProceedToStep5()) ||
                  (step === 5 && !canProceedToStep6())
                }
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <>
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
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Category Dialog */}
      <AddCategoryDialog
        open={showAddCategoryDialog}
        onOpenChange={setShowAddCategoryDialog}
        onSuccess={() => {
          fetchCategories();
          toast({
            title: "Category Added",
            description: "The new category has been added successfully",
          });
        }}
        categoryTypes={categoryTypes}
        onCategoryTypesRefresh={fetchCategoryTypes}
      />
    </>
  );
}
