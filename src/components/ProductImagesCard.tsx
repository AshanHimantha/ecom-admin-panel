import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

interface ProductImagesCardProps {
  imageUrls: string[];
  productName: string;
}

export function ProductImagesCard({ imageUrls, productName }: ProductImagesCardProps) {
  // Show only the first image if available
  const mainImage = imageUrls && imageUrls.length > 0 ? imageUrls[0] : null;

  if (!mainImage) {
    return null;
  }

  return (
    <Card className="p-6">
      <Label className="text-sm font-medium mb-3 block">
        Product Image
      </Label>
      <div className="flex justify-center">
        <div className="relative w-48 h-48 rounded-lg overflow-hidden border">
          <img
            src={mainImage}
            alt={`${productName} - Main Image`}
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </Card>
  );
}