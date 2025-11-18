import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Loader2,
  RefreshCw,
  Edit,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ProductsAPI, Product } from "@/api/productsApi";
import { ProductVariantsAPI, ProductVariant } from "@/api/productVariantsApi";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
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
import { ProfitMarginDisplay } from "@/components/ProfitMarginDisplay";
import { ProductSummaryCard } from "@/components/ProductSummaryCard";
import { BulkEditPanel } from "@/components/BulkEditPanel";
import { DeleteVariantDialog } from "@/components/DeleteVariantDialog";
import EditProductDialog from "@/components/EditProductDialog";

interface VariantEdit {
  id: number;
  sku: string;
  variantName: string;
  color: string;
  size: string;
  quantity: string;
  unitCost: string;
  sellingPrice: string;
  isActive: boolean;
  isModified: boolean;
}

interface EditingVariant {
  id: number;
  quantity: string;
  unitCost: string;
  sellingPrice: string;
  isActive: boolean;
}

export default function ManageVariants() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<VariantEdit[]>([]);
  const [sizeOptions, setSizeOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [variantToDelete, setVariantToDelete] = useState<number | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<EditingVariant | null>(
    null
  );
  const [editingVariantInfo, setEditingVariantInfo] =
    useState<VariantEdit | null>(null);
  const [bulkEditMode, setBulkEditMode] = useState(false);
  const [selectedVariants, setSelectedVariants] = useState<Set<number>>(
    new Set()
  );
  const [bulkEditData, setBulkEditData] = useState<Partial<EditingVariant>>({});
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newVariant, setNewVariant] = useState({
    color: "#000000",
    size: "",
    unitCost: "",
    sellingPrice: "",
    quantity: "",
    sku: "",
  });
  const [editProductDialogOpen, setEditProductDialogOpen] = useState(false);

  // Generate SKU automatically based on product, color, and size
  const generateSKU = (color: string, size: string) => {
    if (!product || !size) return "";

    // Handle "NONE" color case
    const colorPart = color === "NONE" || color.toUpperCase() === "NONE"
      ? "NONE"
      : color.startsWith("#")
      ? color.substring(1, 4).toUpperCase()
      : color.substring(0, 3).toUpperCase();

    // Product name part (first 3 chars)
    const productPart = product.name
      .substring(0, 3)
      .toUpperCase()
      .replace(/\s/g, "");

    // Size part
    const sizePart = size.toUpperCase().replace(/\s/g, "-");

    // Random suffix for uniqueness
    const randomSuffix = Math.random()
      .toString(36)
      .substring(2, 5)
      .toUpperCase();

    return `${productPart}-${colorPart}-${sizePart}-${randomSuffix}`;
  };

  useEffect(() => {
    if (productId) {
      fetchProductDetails();
    }
  }, [productId]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      console.log("📡 Fetching product details for ID:", productId);

      // Fetch product details directly from /api/products/:id
      const productResponse = await ProductsAPI.getProductById(
        Number(productId)
      );
      console.log("✅ Product API response:", productResponse);

      if (productResponse.success && productResponse.data) {
        const productData = productResponse.data;
        setProduct(productData);
        console.log("📊 Found product:", productData);

        // Extract size options from category type
        if (productData.category?.categoryType?.sizeOptions) {
          setSizeOptions(productData.category.categoryType.sizeOptions);
          console.log(
            "📏 Size options:",
            productData.category.categoryType.sizeOptions
          );
        }

        // Fetch variants for this product
        const variantsResponse =
          await ProductVariantsAPI.getVariantsByProductId(Number(productId));
        console.log("📦 Variants API response:", variantsResponse);

        if (variantsResponse.success && variantsResponse.data) {
          const variantsArray = Array.isArray(variantsResponse.data)
            ? variantsResponse.data
            : variantsResponse.data.content || [];

          setVariants(
            variantsArray.map((v: ProductVariant) => ({
              id: v.id,
              sku: v.sku,
              variantName: v.variantName,
              color: v.color,
              size: v.size,
              quantity: v.quantity.toString(),
              unitCost: v.unitCost.toString(),
              sellingPrice: v.sellingPrice.toString(),
              isActive: v.isActive,
              isModified: false,
            }))
          );
          console.log("✅ Loaded variants:", variantsArray);
        }
      } else {
        console.warn("⚠️ Unexpected response structure:", productResponse);
      }
    } catch (error: any) {
      console.error("❌ Error fetching product:", error);
      console.error("❌ Error response:", error.response);
      console.error("❌ Error data:", error.response?.data);
      toast({
        title: "Error",
        description:
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch product details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

 // Auto-generate SKU when color or size changes
  useEffect(() => {
    if (newVariant.color && newVariant.size) {
      setNewVariant(prev => ({
        ...prev,
        sku: generateSKU(prev.color, prev.size)
      }));
    }
  }, [newVariant.color, newVariant.size]);

  const updateVariant = (
    index: number,
    field: keyof VariantEdit,
    value: string | boolean
  ) => {
    setVariants((prev) => {
      const updated = [...prev];
      // Handle boolean conversion for isActive field
      const finalValue =
        field === "isActive" ? value === "true" || value === true : value;

      updated[index] = {
        ...updated[index],
        [field]: finalValue,
        isModified: true,
      };
      return updated;
    });
  };

  const openEditDialog = (variant: VariantEdit) => {
    setEditingVariantInfo(variant);
    setEditingVariant({
      id: variant.id,
      quantity: variant.quantity,
      unitCost: variant.unitCost,
      sellingPrice: variant.sellingPrice,
      isActive: variant.isActive,
    });
    setEditDialogOpen(true);
  };

  const closeEditDialog = () => {
    setEditDialogOpen(false);
    setEditingVariant(null);
    setEditingVariantInfo(null);
  };

  const handleSaveEdit = async () => {
    if (!editingVariant) return;

    // Validate
    if (
      !editingVariant.sellingPrice ||
      parseFloat(editingVariant.sellingPrice) <= 0 ||
      !editingVariant.quantity ||
      parseInt(editingVariant.quantity) < 0 ||
      !editingVariant.unitCost ||
      parseFloat(editingVariant.unitCost) <= 0
    ) {
      toast({
        title: "Validation Error",
        description: "Please ensure all fields have valid values",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);

      await ProductVariantsAPI.updateVariant(editingVariant.id, {
        unitCost: parseFloat(editingVariant.unitCost),
        sellingPrice: parseFloat(editingVariant.sellingPrice),
        quantity: parseInt(editingVariant.quantity),
        isActive: editingVariant.isActive,
      });

      toast({
        title: "Success",
        description: "Variant updated successfully",
      });

      closeEditDialog();
      await fetchProductDetails();
    } catch (error: any) {
      console.error("❌ Error saving variant:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to save changes",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleVariantSelection = (id: number) => {
    setSelectedVariants((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedVariants.size === variants.length) {
      setSelectedVariants(new Set());
    } else {
      setSelectedVariants(new Set(variants.map((v) => v.id)));
    }
  };

  const handleBulkEdit = async () => {
    if (selectedVariants.size === 0) {
      toast({
        title: "No Selection",
        description: "Please select at least one variant to edit",
        variant: "destructive",
      });
      return;
    }

    // Validate bulk edit data
    if (
      bulkEditData.sellingPrice &&
      parseFloat(bulkEditData.sellingPrice) <= 0
    ) {
      toast({
        title: "Validation Error",
        description: "Selling price must be greater than 0",
        variant: "destructive",
      });
      return;
    }

    if (bulkEditData.quantity && parseInt(bulkEditData.quantity) < 0) {
      toast({
        title: "Validation Error",
        description: "Quantity cannot be negative",
        variant: "destructive",
      });
      return;
    }

    if (bulkEditData.unitCost && parseFloat(bulkEditData.unitCost) <= 0) {
      toast({
        title: "Validation Error",
        description: "Unit cost must be greater than 0",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);

      const updatePayload: any = {};
      if (bulkEditData.unitCost)
        updatePayload.unitCost = parseFloat(bulkEditData.unitCost);
      if (bulkEditData.sellingPrice)
        updatePayload.sellingPrice = parseFloat(bulkEditData.sellingPrice);
      if (bulkEditData.quantity)
        updatePayload.quantity = parseInt(bulkEditData.quantity);
      if (bulkEditData.isActive !== undefined)
        updatePayload.isActive = bulkEditData.isActive;

      const updatePromises = Array.from(selectedVariants).map((id) =>
        ProductVariantsAPI.updateVariant(id, updatePayload)
      );

      await Promise.all(updatePromises);

      toast({
        title: "Success",
        description: `${selectedVariants.size} variant${
          selectedVariants.size !== 1 ? "s" : ""
        } updated successfully`,
      });

      setBulkEditMode(false);
      setSelectedVariants(new Set());
      setBulkEditData({});
      await fetchProductDetails();
    } catch (error: any) {
      console.error("❌ Error bulk updating variants:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to bulk update variants",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteVariant = async () => {
    if (!variantToDelete) return;

    try {
      console.log("🗑️ Deleting variant:", variantToDelete);

      await ProductVariantsAPI.deleteVariant(variantToDelete);

      setVariants((prev) => prev.filter((v) => v.id !== variantToDelete));

      toast({
        title: "Success",
        description: "Variant deleted successfully",
      });
    } catch (error: any) {
      console.error("❌ Error deleting variant:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to delete variant",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setVariantToDelete(null);
    }
  };

  const handleAddVariant = async () => {
    // Validate
    if (!newVariant.color || !newVariant.size) {
      toast({
        title: "Validation Error",
        description: "Color and Size are required",
        variant: "destructive",
      });
      return;
    }

    // Validate color format (hex or NONE)
    const isValidColor = 
      newVariant.color.toUpperCase() === "NONE" || 
      /^#[0-9A-F]{6}$/i.test(newVariant.color);
    
    if (!isValidColor) {
      toast({
        title: "Validation Error",
        description: "Color must be a valid hex code (e.g., #FF0000) or 'NONE'",
        variant: "destructive",
      });
      return;
    }

    if (
      !newVariant.sellingPrice ||
      parseFloat(newVariant.sellingPrice) <= 0 ||
      !newVariant.quantity ||
      parseInt(newVariant.quantity) < 0 ||
      !newVariant.unitCost ||
      parseFloat(newVariant.unitCost) <= 0
    ) {
      toast({
        title: "Validation Error",
        description: "Please ensure all fields have valid values",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);

      await ProductVariantsAPI.createVariant(Number(productId), {
        color: newVariant.color,
        size: newVariant.size,
        unitCost: parseFloat(newVariant.unitCost),
        sellingPrice: parseFloat(newVariant.sellingPrice),
        quantity: parseInt(newVariant.quantity),
        sku: newVariant.sku,
      });

      toast({
        title: "Success",
        description: "Variant added successfully",
      });

      setAddDialogOpen(false);
      setNewVariant({
        color: "#000000",
        size: "",
        unitCost: "",
        sellingPrice: "",
        quantity: "",
        sku: "",
      });
      await fetchProductDetails();
    } catch (error: any) {
      console.error("❌ Error adding variant:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to add variant",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const calculateProfit = (price: string, unitCost?: number) => {
    if (!unitCost || !price) return null;
    const priceNum = parseFloat(price);
    if (isNaN(priceNum)) return null;
    return (((priceNum - unitCost) / priceNum) * 100).toFixed(1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-center">
          <p className="text-muted-foreground">Product not found</p>
          <Button onClick={() => navigate("/products")} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate("/products")}
            className="hover:bg-muted"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              Edit Product & Manage Stock
            </h1>
            <p className="text-muted-foreground">
              Edit product details and manage variant stocks for:{" "}
              <span className="font-medium">{product.name}</span>
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={fetchProductDetails}
            disabled={loading || saving}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Product Summary */}
      <ProductSummaryCard
        product={product}
        sizeOptions={sizeOptions}
        totalVariants={variants.length}
        onEditClick={() => setEditProductDialogOpen(true)}
      />

      <Separator />

      {/* Variants List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            Variant Stock Management ({variants.length})
          </h2>
          <div className="flex items-center gap-2">
            {bulkEditMode && selectedVariants.size > 0 && (
              <Badge variant="secondary">
                {selectedVariants.size} selected
              </Badge>
            )}
            {!bulkEditMode && variants.length > 0 && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAddDialogOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Variant
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setBulkEditMode(true)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Bulk Edit
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Bulk Edit Panel */}
        {bulkEditMode && (
          <BulkEditPanel
            bulkEditData={bulkEditData}
            selectedVariantsCount={selectedVariants.size}
            saving={saving}
            onBulkEditDataChange={setBulkEditData}
            onCancel={() => {
              setBulkEditMode(false);
              setSelectedVariants(new Set());
              setBulkEditData({});
            }}
            onSave={handleBulkEdit}
          />
        )}

        {variants.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground mb-4">
              No variants found for this product
            </p>
            <Button variant="outline" onClick={() => setAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Variant
            </Button>
          </Card>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  {bulkEditMode && (
                    <TableHead className="w-[50px]">
                      <input
                        type="checkbox"
                        checked={selectedVariants.size === variants.length}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 cursor-pointer"
                      />
                    </TableHead>
                  )}
                  <TableHead className="w-[60px]">Color</TableHead>
                  <TableHead>Variant</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Unit Cost</TableHead>
                  <TableHead className="text-right">Selling Price</TableHead>
                  <TableHead className="text-right">Profit</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  {!bulkEditMode && (
                    <TableHead className="text-right">Actions</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {variants.map((variant) => {
                  const profitMargin = calculateProfit(
                    variant.sellingPrice,
                    parseFloat(variant.unitCost)
                  );
                  return (
                    <TableRow key={variant.id}>
                      {bulkEditMode && (
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selectedVariants.has(variant.id)}
                            onChange={() => toggleVariantSelection(variant.id)}
                            className="w-4 h-4 cursor-pointer"
                          />
                        </TableCell>
                      )}
                      <TableCell>
                        {variant.color.toUpperCase() === "NONE" ? (
                          <div className="w-8 h-8 rounded border-2 border-dashed border-border shadow-sm flex items-center justify-center bg-muted/50">
                            <span className="text-[8px] font-bold text-muted-foreground">N/A</span>
                          </div>
                        ) : (
                          <div
                            className="w-8 h-8 rounded border-2 border-border shadow-sm"
                            style={{ backgroundColor: variant.color }}
                            title={variant.color}
                          />
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        {variant.variantName}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{variant.size}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {variant.sku}
                      </TableCell>
                      <TableCell className="text-right">
                        {variant.quantity}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatPrice(parseFloat(variant.unitCost))}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatPrice(parseFloat(variant.sellingPrice))}
                      </TableCell>
                      <TableCell className="text-right">
                        <span
                          className={`font-medium ${
                            parseFloat(profitMargin || "0") > 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {profitMargin}%
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={variant.isActive ? "default" : "secondary"}
                        >
                          {variant.isActive ? "ACTIVE" : "INACTIVE"}
                        </Badge>
                      </TableCell>
                      {!bulkEditMode && (
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(variant)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setVariantToDelete(variant.id);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>

      {/* Edit Variant Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Variant</DialogTitle>
            <DialogDescription>
              Update variant pricing and inventory details
            </DialogDescription>
          </DialogHeader>

          {editingVariantInfo && editingVariant && (
            <div className="space-y-6 py-4">
              {/* Variant Info */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
                <div>
                  <Label className="text-xs text-muted-foreground">Color</Label>
                  <div className="flex items-center gap-2 mt-1">
                    {editingVariantInfo.color.toUpperCase() === "NONE" ? (
                      <div className="w-6 h-6 rounded border-2 border-dashed border-border flex items-center justify-center bg-muted/50">
                        <span className="text-[7px] font-bold text-muted-foreground">N/A</span>
                      </div>
                    ) : (
                      <div
                        className="w-6 h-6 rounded border-2 border-border"
                        style={{ backgroundColor: editingVariantInfo.color }}
                      />
                    )}
                    <p className="text-sm font-medium">
                      {editingVariantInfo.color.toUpperCase() === "NONE" 
                        ? "None" 
                        : editingVariantInfo.color}
                    </p>
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Size</Label>
                  <p className="text-sm font-medium mt-1">
                    {editingVariantInfo.size}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">SKU</Label>
                  <p className="text-xs font-medium mt-1 font-mono">
                    {editingVariantInfo.sku}
                  </p>
                </div>
              </div>

              {/* Editable Fields */}
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="edit-quantity" className="text-sm">
                    Quantity <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="edit-quantity"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={editingVariant.quantity}
                    onChange={(e) =>
                      setEditingVariant({
                        ...editingVariant,
                        quantity: e.target.value,
                      })
                    }
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-unitCost" className="text-sm">
                      Unit Cost ($) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="edit-unitCost"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={editingVariant.unitCost}
                      onChange={(e) =>
                        setEditingVariant({
                          ...editingVariant,
                          unitCost: e.target.value,
                        })
                      }
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-sellingPrice" className="text-sm">
                      Selling Price ($) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="edit-sellingPrice"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={editingVariant.sellingPrice}
                      onChange={(e) =>
                        setEditingVariant({
                          ...editingVariant,
                          sellingPrice: e.target.value,
                        })
                      }
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* Profit Calculation */}
                <ProfitMarginDisplay
                  profitMargin={calculateProfit(
                    editingVariant.sellingPrice,
                    parseFloat(editingVariant.unitCost)
                  )}
                />

                {/* Status Switch */}
                <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                  <Label
                    htmlFor="edit-isActive"
                    className="text-sm font-medium cursor-pointer"
                  >
                    Active Status
                  </Label>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">
                      {editingVariant.isActive ? "Active" : "Inactive"}
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        id="edit-isActive"
                        type="checkbox"
                        checked={editingVariant.isActive}
                        onChange={(e) =>
                          setEditingVariant({
                            ...editingVariant,
                            isActive: e.target.checked,
                          })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={closeEditDialog}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Variant Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Variant</DialogTitle>
            <DialogDescription>
              Create a new variant for this product
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid gap-4">
              <div>
                <Label htmlFor="new-color" className="text-sm">
                  Color <span className="text-red-500">*</span>
                </Label>
                <div className="flex gap-2 mt-1">
                  {newVariant.color.toUpperCase() === "NONE" ? (
                    <div className="flex-1 flex items-center gap-2 p-2 border-2 rounded-md bg-muted/50 h-10">
                      <div className="w-8 h-8 rounded border-2 border-dashed border-border flex items-center justify-center bg-background">
                        <span className="text-[10px] font-bold text-muted-foreground">N/A</span>
                      </div>
                      <span className="text-sm font-medium">None</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="ml-auto h-8 w-8 p-0"
                        onClick={() => {
                          setNewVariant({
                            ...newVariant,
                            color: "#000000",
                            sku: generateSKU("#000000", newVariant.size),
                          });
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="relative w-12 h-10">
                        <Input
                          id="new-color"
                          type="color"
                          value={
                            newVariant.color.match(/^#[0-9A-F]{6}$/i)
                              ? newVariant.color
                              : "#000000"
                          }
                          onChange={(e) => {
                            const newColor = e.target.value;
                            setNewVariant({
                              ...newVariant,
                              color: newColor,
                              sku: generateSKU(newColor, newVariant.size),
                            });
                          }}
                          className="w-full h-full p-1 cursor-pointer"
                        />
                      </div>
                      <Input
                        type="text"
                        value={newVariant.color}
                        onChange={(e) => {
                          const newColor = e.target.value.trim();
                          setNewVariant({
                            ...newVariant,
                            color: newColor,
                            sku: generateSKU(newColor, newVariant.size),
                          });
                        }}
                        placeholder="#000000"
                        className="flex-1 h-10"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setNewVariant({
                            ...newVariant,
                            color: "NONE",
                            sku: generateSKU("NONE", newVariant.size),
                          });
                        }}
                        className="h-10 px-4 whitespace-nowrap shrink-0"
                        title="Set to None (no color)"
                      >
                        N/A
                      </Button>
                    </>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Pick a color, enter hex code, or click "N/A" for no color
                </p>
              </div>

              <div>
                <Label htmlFor="new-size" className="text-sm">
                  Size <span className="text-red-500">*</span>
                </Label>
                {sizeOptions.length > 0 ? (
                  <select
                    id="new-size"
                    value={newVariant.size}
                    onChange={(e) => {
                      const newSize = e.target.value;
                      setNewVariant({
                        ...newVariant,
                        size: newSize,
                        sku: generateSKU(newVariant.color, newSize),
                      });
                    }}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background mt-1 cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Select Size</option>
                    {sizeOptions.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                ) : (
                  <Input
                    id="new-size"
                    type="text"
                    placeholder="e.g., S, M, L, XL"
                    value={newVariant.size}
                    onChange={(e) => {
                      const newSize = e.target.value;
                      setNewVariant({
                        ...newVariant,
                        size: newSize,
                        sku: generateSKU(newVariant.color, newSize),
                      });
                    }}
                    className="mt-1"
                  />
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Available sizes: {sizeOptions.length > 0 ? sizeOptions.join(", ") : "None"}
                </p>
              </div>
            </div>

            <div>
              <Label htmlFor="new-sku" className="text-sm">
                SKU{" "}
                <span className="text-muted-foreground text-xs">
                  (Auto-generated)
                </span>
              </Label>
              <Input
                id="new-sku"
                type="text"
                placeholder="Auto-generated from product, color, and size"
                value={newVariant.sku}
                disabled
                className="mt-1 font-mono bg-muted"
              />
            </div>

            <div>
              <Label htmlFor="new-quantity" className="text-sm">
                Quantity <span className="text-red-500">*</span>
              </Label>
              <Input
                id="new-quantity"
                type="number"
                min="0"
                placeholder="0"
                value={newVariant.quantity}
                onChange={(e) =>
                  setNewVariant({ ...newVariant, quantity: e.target.value })
                }
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="new-unitCost" className="text-sm">
                  Unit Cost ($) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="new-unitCost"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={newVariant.unitCost}
                  onChange={(e) =>
                    setNewVariant({ ...newVariant, unitCost: e.target.value })
                  }
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="new-sellingPrice" className="text-sm">
                  Selling Price ($) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="new-sellingPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={newVariant.sellingPrice}
                  onChange={(e) =>
                    setNewVariant({
                      ...newVariant,
                      sellingPrice: e.target.value,
                    })
                  }
                  className="mt-1"
                />
              </div>
            </div>

            {/* Profit Preview */}
            {newVariant.unitCost && newVariant.sellingPrice && (
              <ProfitMarginDisplay
                profitMargin={calculateProfit(
                  newVariant.sellingPrice,
                  parseFloat(newVariant.unitCost)
                )}
              />
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAddDialogOpen(false);
                setNewVariant({
                  color: "#000000",
                  size: "",
                  unitCost: "",
                  sellingPrice: "",
                  quantity: "",
                  sku: "",
                });
              }}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button onClick={handleAddVariant} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Variant
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <DeleteVariantDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteVariant}
      />

      {/* Edit Product Dialog */}
      {product && (
        <EditProductDialog
          open={editProductDialogOpen}
          onOpenChange={setEditProductDialogOpen}
          product={product}
          onProductUpdated={fetchProductDetails}
        />
      )}
    </div>
  );
}
