import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Loader2,
  RefreshCw,
  Pencil,
  Trash2,
  ImageIcon,
  Eye,
  Settings,
} from "lucide-react";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { ProductsAPI, Product } from "@/api/productsApi";
import { useToast } from "@/hooks/use-toast";
import AddProductDialog from "@/components/AddProductDialog";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 0,
    pageSize: 20,
    totalElements: 0,
    totalPages: 0,
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      console.log("📡 Fetching products");
      const response = await ProductsAPI.getAllProducts();
      console.log("✅ Products API response:", response);

      if (response.success && response.data?.content) {
        setProducts(response.data.content);
        setPagination({
          currentPage: response.data.currentPage,
          pageSize: response.data.pageSize,
          totalElements: response.data.totalElements,
          totalPages: response.data.totalPages,
        });
      } else {
        console.warn("⚠️ Unexpected API response structure:", response);
        setProducts([]);
        toast({
          title: "Warning",
          description: "API returned unexpected response format",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("❌ Error fetching products:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText,
      });
      setProducts([]);

      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to fetch products";

      toast({
        title: "Error Loading Products",
        description: `${errorMessage}${
          error.response?.status ? ` (${error.response.status})` : ""
        }`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "default";
      case "PENDING":
        return "secondary";
      case "REJECTED":
        return "destructive";
      default:
        return "outline";
    }
  };

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsViewDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Products</h1>
          <p className="text-muted-foreground">
            Manage your product inventory ({pagination.totalElements} product
            {pagination.totalElements !== 1 ? "s" : ""})
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => fetchProducts()}
            disabled={loading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      <AddProductDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onProductCreated={fetchProducts}
      />

      <Card>
        <Table className="w-full">
          <TableCaption className="pb-5">
            {loading
              ? "Loading products..."
              : products.length === 0
              ? "No products found."
              : `Showing ${products.length} of ${
                  pagination.totalElements
                } product${pagination.totalElements !== 1 ? "s" : ""}`}
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  <p className="mt-2 text-muted-foreground">
                    Loading products...
                  </p>
                </TableCell>
              </TableRow>
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <p className="text-muted-foreground">No products found.</p>
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    {product.imageUrls && product.imageUrls.length > 0 ? (
                      <img
                        src={product.imageUrls[0]}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                        <ImageIcon className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">
                    <div>
                      <div>{product.name}</div>
                      {product.description && (
                        <div className="text-xs text-muted-foreground truncate max-w-xs">
                          {product.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{product.category.name}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(product.status)}>
                      {product.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm">
                    {formatDate(product.createdAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewProduct(product)}
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          navigate(`/products/${product.id}/variants`)
                        }
                        title="Manage Variants"
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="sm">
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

      {/* View Product Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Product Details</DialogTitle>
            <DialogDescription>
              Complete information about the selected product
            </DialogDescription>
          </DialogHeader>

          {selectedProduct && (
            <div className="space-y-6">
              {/* Product Images */}
              {selectedProduct.imageUrls &&
                selectedProduct.imageUrls.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium mb-2 block">
                      Product Images
                    </Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {selectedProduct.imageUrls.map((url, index) => (
                        <div
                          key={index}
                          className="relative aspect-square rounded-lg overflow-hidden border"
                        >
                          <img
                            src={url}
                            alt={`${selectedProduct.name} - Image ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              <Separator />

              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Product Name
                  </Label>
                  <p className="text-base mt-1">{selectedProduct.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Product Type
                  </Label>
                  <div className="mt-1">
                    <Badge
                      variant={
                        selectedProduct.productType === "STOCK"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {selectedProduct.productType}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Status
                  </Label>
                  <div className="mt-1">
                    <Badge
                      variant={getStatusBadgeVariant(selectedProduct.status)}
                    >
                      {selectedProduct.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Created Date
                  </Label>
                  <p className="text-base mt-1">
                    {formatDate(selectedProduct.createdAt)}
                  </p>
                </div>
              </div>

              {/* Description */}
              {selectedProduct.description && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Description
                  </Label>
                  <div
                    className="mt-1 text-sm prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: selectedProduct.description,
                    }}
                  />
                </div>
              )}

              <Separator />

              {/* Category Information */}
              <div>
                <Label className="text-sm font-medium mb-3 block">
                  Category Information
                </Label>
                <Card className="p-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Category
                      </Label>
                      <p className="text-sm font-medium mt-1">
                        {selectedProduct.category.name}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Category Type
                      </Label>
                      <p className="text-sm font-medium mt-1">
                        {selectedProduct.category.categoryType.name}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Available Sizes
                      </Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedProduct.category.categoryType.sizeOptions.map(
                          (size, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs"
                            >
                              {size}
                            </Badge>
                          )
                        )}
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Category Status
                      </Label>
                      <div className="mt-1">
                        <Badge variant="outline" className="text-xs">
                          {selectedProduct.category.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              <Separator />

              {/* Variants */}
              <div>
                <Label className="text-sm font-medium mb-3 block">
                  Product Variants ({selectedProduct.variants.length})
                </Label>
                <div className="space-y-3">
                  {selectedProduct.variants.map((variant, index) => (
                    <Card key={variant.id} className="p-4">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div>
                          <Label className="text-xs text-muted-foreground">
                            Color
                          </Label>
                          <div className="flex items-center gap-2 mt-1">
                            {variant.color === "NONE" ? (
                              <div className="w-6 h-6 rounded border-2 border-dashed border-border flex items-center justify-center bg-muted/50">
                                <span className="text-[8px] font-bold text-muted-foreground">
                                  N/A
                                </span>
                              </div>
                            ) : (
                              <div
                                className="w-6 h-6 rounded border border-border"
                                style={{ backgroundColor: variant.color }}
                                title={variant.color}
                              />
                            )}
                            <span className="text-sm font-medium">
                              {variant.color === "NONE"
                                ? "None"
                                : variant.color}
                            </span>
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">
                            Size
                          </Label>
                          <p className="text-sm font-medium mt-1">
                            <Badge variant="secondary">{variant.size}</Badge>
                          </p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">
                            Price
                          </Label>
                          <p className="text-sm font-medium mt-1">
                            {formatPrice(variant.price)}
                          </p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">
                            {selectedProduct.productType === "STOCK"
                              ? "Available Stock"
                              : "Stock Status"}
                          </Label>
                          <p className="text-sm font-medium mt-1">
                            {variant.availableStock !== null &&
                            variant.availableStock !== undefined
                              ? variant.availableStock
                              : "N/A"}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
