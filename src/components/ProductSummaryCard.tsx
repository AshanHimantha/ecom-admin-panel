import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Product } from "@/api/productsApi";
import { Pencil } from "lucide-react";

interface ProductSummaryCardProps {
  product: Product;
  sizeOptions: string[];
  totalVariants: number;
  onEditClick: () => void;
}

export function ProductSummaryCard({ product, sizeOptions, totalVariants, onEditClick }: ProductSummaryCardProps) {
  const mainImage = product.imageUrls && product.imageUrls.length > 0 ? product.imageUrls[0] : null;

  return (
    <Card className="p-6">
      <div className="flex gap-6">
        {/* Product Image */}
        {mainImage && (
          <div className="flex-shrink-0">
            <div className="relative w-40 h-40 rounded-lg overflow-hidden border-2 border-border shadow-md">
              <img
                src={mainImage}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}

        {/* Product Details */}
        <div className="flex-1 space-y-6">
          {/* Product Name - Full Width */}
          <div className="border-b pb-3 flex items-center justify-between">
			<div><Label className="text-xs text-muted-foreground uppercase tracking-wide">Product Name</Label>
            <h2 className="text-2xl font-bold mt-1 text-foreground">{product.name}</h2></div>
            <div>
				{/* edit product */}
				<Button variant="outline" size="icon" onClick={onEditClick}>
					<Pencil className="h-4 w-4" />
				</Button>
			</div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Status</Label>
              <div className="mt-2">
                <Badge variant="outline" className="font-semibold">{product.status}</Badge>
              </div>
            </div>
            
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Category</Label>
              <p className="text-sm font-semibold mt-2">{product.category.name}</p>
            </div>
            
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Category Type</Label>
              <p className="text-sm font-semibold mt-2">
                {product.category.categoryType?.name || "N/A"}
              </p>
            </div>
            
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Available Sizes</Label>
              <div className="flex flex-wrap gap-1 mt-2">
                {sizeOptions.length > 0 ? (
                  sizeOptions.map((size) => (
                    <Badge key={size} variant="secondary" className="text-xs font-medium">
                      {size}
                    </Badge>
                  ))
                ) : (
                  <span className="text-xs text-muted-foreground">None</span>
                )}
              </div>
            </div>
            
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Total Variants</Label>
              <p className="text-3xl font-bold mt-1 text-primary">{totalVariants}</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}