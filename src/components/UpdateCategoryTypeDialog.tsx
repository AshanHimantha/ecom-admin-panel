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
import { Badge } from "@/components/ui/badge";
import { Loader2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CategoryTypesAPI, CategoryType } from "@/api/categoryTypesApi";

interface UpdateCategoryTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  categoryType: CategoryType | null;
}

export default function UpdateCategoryTypeDialog({
  open,
  onOpenChange,
  onSuccess,
  categoryType,
}: UpdateCategoryTypeDialogProps) {
  const [name, setName] = useState("");
  const [sizeOptions, setSizeOptions] = useState<string[]>([]);
  const [currentSize, setCurrentSize] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Initialize form with category type data when dialog opens
  useEffect(() => {
    if (categoryType && open) {
      setName(categoryType.name);
      setSizeOptions(categoryType.sizeOptions || []);
      setCurrentSize("");
  
    }
  }, [categoryType, open]);

  const handleAddSize = () => {
    const trimmedSize = currentSize.trim();
    if (trimmedSize && !sizeOptions.includes(trimmedSize)) {
      setSizeOptions([...sizeOptions, trimmedSize]);
      setCurrentSize("");
    }
  };

  const handleRemoveSize = (sizeToRemove: string) => {
    setSizeOptions(sizeOptions.filter((size) => size !== sizeToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddSize();
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", index.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData("text/html"));
    
    if (dragIndex === dropIndex) return;

    const newSizeOptions = [...sizeOptions];
    const [draggedItem] = newSizeOptions.splice(dragIndex, 1);
    newSizeOptions.splice(dropIndex, 0, draggedItem);
    
    setSizeOptions(newSizeOptions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!categoryType) {
      toast({
        title: "Error",
        description: "No category type selected",
        variant: "destructive",
      });
      return;
    }

    // Validation
    if (!name.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a name",
        variant: "destructive",
      });
      return;
    }

    if (sizeOptions.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please add at least one size option",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const payload = {
        name: name.trim(),
        sizeOptions,
        status: categoryType.status, // Keep the existing status
      };

      console.log("📤 Updating category type:", categoryType.id, payload);
      
      await CategoryTypesAPI.updateCategoryType(
        categoryType.id.toString(),
        payload
      );
      
      console.log("✅ Category type updated successfully");

      toast({
        title: "Success",
        description: "Category type updated successfully",
      });

      // Reset form
      setName("");
      setSizeOptions([]);
      setCurrentSize("");

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error("❌ Error updating category type:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to update category type";

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setName("");
      setSizeOptions([]);
      setCurrentSize("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Update Category Type</DialogTitle>
          <DialogDescription>
            Edit the category type and sizing options
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Name Field */}
            <div className="grid gap-2">
              <Label htmlFor="name">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Pants Sizes - Waist"
                disabled={loading}
              />
            </div>

            {/* Size Options Field */}
            <div className="grid gap-2">
              <Label htmlFor="sizeOption">
                Size Options <span className="text-red-500">*</span>
              </Label>
              <p className="text-xs text-muted-foreground">
                Add size options and drag them to set the correct order
              </p>
              <div className="flex gap-2">
                <Input
                  id="sizeOption"
                  value={currentSize}
                  onChange={(e) => setCurrentSize(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="e.g., 28, 30, 32..."
                  disabled={loading}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddSize}
                  disabled={loading || !currentSize.trim()}
                >
                  Add
                </Button>
              </div>
              {sizeOptions.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {sizeOptions.map((size, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="text-sm pl-3 pr-1 py-1 cursor-move hover:bg-secondary/80 transition-colors"
                      draggable={!loading}
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, index)}
                    >
                      {size}
                      <button
                        type="button"
                        onClick={() => handleRemoveSize(size)}
                        className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                        disabled={loading}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
              <p className="text-sm text-muted-foreground">
                {sizeOptions.length} size option{sizeOptions.length !== 1 ? "s" : ""}{" "}
                added {sizeOptions.length > 1 && "(drag to reorder)"}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Update Category Type
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
