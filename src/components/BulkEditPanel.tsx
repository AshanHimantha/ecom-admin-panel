import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save, X } from "lucide-react";

interface EditingVariant {
  quantity?: string;
  unitCost?: string;
  sellingPrice?: string;
  isActive?: boolean;
}

interface BulkEditPanelProps {
  bulkEditData: Partial<EditingVariant>;
  selectedVariantsCount: number;
  saving: boolean;
  onBulkEditDataChange: (data: Partial<EditingVariant>) => void;
  onCancel: () => void;
  onSave: () => void;
}

export function BulkEditPanel({
  bulkEditData,
  selectedVariantsCount,
  saving,
  onBulkEditDataChange,
  onCancel,
  onSave,
}: BulkEditPanelProps) {
  return (
    <Card className="p-4 bg-gray-50 dark:bg-gray-950/20 border-gray-200">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <h3 className="font-semibold text-gray-900 dark:text-blue-100">
              Bulk Edit Mode
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onCancel}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={onSave}
              disabled={saving || selectedVariantsCount === 0}
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Update ({selectedVariantsCount})
                </>
              )}
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="bulk-quantity" className="text-sm">
              Quantity (Optional)
            </Label>
            <Input
              id="bulk-quantity"
              type="number"
              min="0"
              placeholder="Leave empty to skip"
              value={bulkEditData.quantity || ""}
              onChange={(e) =>
                onBulkEditDataChange({
                  ...bulkEditData,
                  quantity: e.target.value,
                })
              }
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="bulk-unitCost" className="text-sm">
              Unit Cost ($) (Optional)
            </Label>
            <Input
              id="bulk-unitCost"
              type="number"
              step="0.01"
              min="0"
              placeholder="Leave empty to skip"
              value={bulkEditData.unitCost || ""}
              onChange={(e) =>
                onBulkEditDataChange({
                  ...bulkEditData,
                  unitCost: e.target.value,
                })
              }
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="bulk-sellingPrice" className="text-sm">
              Selling Price ($) (Optional)
            </Label>
            <Input
              id="bulk-sellingPrice"
              type="number"
              step="0.01"
              min="0"
              placeholder="Leave empty to skip"
              value={bulkEditData.sellingPrice || ""}
              onChange={(e) =>
                onBulkEditDataChange({
                  ...bulkEditData,
                  sellingPrice: e.target.value,
                })
              }
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="bulk-isActive" className="text-sm">
              Status (Optional)
            </Label>
            <select
              id="bulk-isActive"
              value={
                bulkEditData.isActive === undefined
                  ? ""
                  : bulkEditData.isActive
                  ? "true"
                  : "false"
              }
              onChange={(e) =>
                onBulkEditDataChange({
                  ...bulkEditData,
                  isActive:
                    e.target.value === ""
                      ? undefined
                      : e.target.value === "true",
                })
              }
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background mt-1"
            >
              <option value="">Leave unchanged</option>
              <option value="true">ACTIVE</option>
              <option value="false">INACTIVE</option>
            </select>
          </div>
        </div>
      </div>
    </Card>
  );
}