import { useForm } from "@tanstack/react-form";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { ReviewFormValues } from "@/types/review-form";

// Helper function to safely get string errors from field meta
function getFieldErrors(errors: any): string[] {
  if (!Array.isArray(errors)) return [];
  return errors.filter((error): error is string => typeof error === "string");
}

interface AddReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ReviewFormValues) => void;
}

const StarRatingInput = ({
  rating,
  onChange,
}: {
  rating: number;
  onChange: (rating: number) => void;
}) => {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className="focus:outline-none"
        >
          <Star
            className={`size-6 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            } transition-colors hover:fill-yellow-400 hover:text-yellow-400`}
          />
        </button>
      ))}
      <span className="ml-2 text-muted-foreground text-sm">({rating})</span>
    </div>
  );
};

export function AddReviewDialog({
  open,
  onOpenChange,
  onSubmit,
}: AddReviewDialogProps) {
  const form = useForm({
    defaultValues: {
      productName: "",
      customerName: "",
      rating: 5,
      comment: "",
      status: "pending" as "approved" | "pending" | "rejected",
      customerAvatar: null as FileList | null,
    },
    onSubmit: async ({ value }) => {
      onSubmit(value);
      onOpenChange(false);
      form.reset();
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-150">
        <DialogHeader>
          <DialogTitle>Add New Review</DialogTitle>
          <DialogDescription>
            Add a customer review for a product.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-6"
        >
          <FieldGroup>
            <div className="grid gap-4">
              {/* Product Name Field */}
              <form.Field name="productName">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>
                        Product Name*
                      </FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="e.g. Wireless Headphones"
                        aria-invalid={isInvalid}
                      />
                      {isInvalid && (
                        <FieldError
                          errors={getFieldErrors(field.state.meta.errors)}
                        />
                      )}
                    </Field>
                  );
                }}
              </form.Field>

              {/* Customer Name Field */}
              <form.Field name="customerName">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>
                        Customer Name*
                      </FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="e.g. John Doe"
                        aria-invalid={isInvalid}
                      />
                      {isInvalid && (
                        <FieldError
                          errors={getFieldErrors(field.state.meta.errors)}
                        />
                      )}
                    </Field>
                  );
                }}
              </form.Field>

              {/* Rating Field */}
              <form.Field name="rating">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Rating*</FieldLabel>
                      <StarRatingInput
                        rating={field.state.value}
                        onChange={field.handleChange}
                      />
                      {isInvalid && (
                        <FieldError
                          errors={getFieldErrors(field.state.meta.errors)}
                        />
                      )}
                    </Field>
                  );
                }}
              </form.Field>

              {/* Comment Field */}
              <form.Field name="comment">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Comment*</FieldLabel>
                      <Textarea
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="Write your review comment..."
                        aria-invalid={isInvalid}
                        className="resize-none"
                        rows={4}
                      />
                      {isInvalid && (
                        <FieldError
                          errors={getFieldErrors(field.state.meta.errors)}
                        />
                      )}
                    </Field>
                  );
                }}
              </form.Field>

              {/* Status Select */}
              <form.Field name="status">
                {(field) => {
                  return (
                    <Field>
                      <FieldLabel htmlFor={field.name}>Status</FieldLabel>
                      <Select
                        value={field.state.value}
                        onValueChange={(value) =>
                          field.handleChange(
                            value as "approved" | "pending" | "rejected",
                          )
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                  );
                }}
              </form.Field>

              {/* Customer Avatar Field */}
              <form.Field name="customerAvatar">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>
                        Customer Avatar (Optional)
                      </FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="file"
                        accept="image/*"
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.files)}
                        aria-invalid={isInvalid}
                        className="cursor-pointer"
                      />
                      {isInvalid && (
                        <FieldError
                          errors={getFieldErrors(field.state.meta.errors)}
                        />
                      )}
                    </Field>
                  );
                }}
              </form.Field>
            </div>
          </FieldGroup>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
            >
              {([canSubmit, isSubmitting]) => (
                <Button type="submit" disabled={!canSubmit || isSubmitting}>
                  {isSubmitting ? "Adding..." : "Add Review"}
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
