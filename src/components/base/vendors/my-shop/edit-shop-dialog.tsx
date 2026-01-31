import { zodResolver } from "@hookform/resolvers/zod";
import { FileUploaderMinimal } from "@uploadcare/react-uploader";
import "@uploadcare/react-uploader/core.css";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Shop } from "@/lib/db/schema/shop-schema";
import { type UpdateShopInput, updateShopSchema } from "@/lib/validators/shop";

interface EditShopDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shop: Shop;
  onSubmit: (data: UpdateShopInput) => Promise<void>;
  isSubmitting: boolean;
}

export function EditShopDialog({
  open,
  onOpenChange,
  shop,
  onSubmit,
  isSubmitting,
}: EditShopDialogProps) {
  const form = useForm<UpdateShopInput>({
    resolver: zodResolver(updateShopSchema),
    defaultValues: {
      id: shop.id,
      name: shop.name || "",
      description: shop.description || "",
      logo: shop.logo || "",
      banner: shop.banner || "",
      category: shop.category || "",
    },
  });

  const handleSubmit = (data: UpdateShopInput) => {
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-150">
        <DialogHeader>
          <DialogTitle>Edit Shop Profile</DialogTitle>
          <DialogDescription>
            Update your shop's appearance and details.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Shop Name</FormLabel>
                  <FormControl>
                    <Input placeholder="My Awesome Shop" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Electronics, Fashion, etc."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us about your shop..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="logo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Logo</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        <FileUploaderMinimal
                          pubkey={import.meta.env.VITE_UPLOADCARE_PUB_KEY!}
                          classNameUploader="uc-auto uc-purple"
                          sourceList="local, gdrive"
                          className="uc-auto uc-purple"
                          imgOnly
                          multiple={false}
                          onFileUploadSuccess={(e: any) => {
                            if (e?.cdnUrl) {
                              field.onChange(e.cdnUrl);
                            }
                          }}
                        />
                        {field.value && (
                          <div className="relative size-20 overflow-hidden rounded-md border">
                            <img
                              src={field.value}
                              alt="Logo"
                              className="h-full w-full object-cover"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-0 right-0 h-5 w-5 rounded-tr-none rounded-bl-md px-0"
                              onClick={() => field.onChange("")}
                            >
                              <span className="sr-only">Remove</span>
                              &times;
                            </Button>
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="banner"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Banner Image</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        <FileUploaderMinimal
                          pubkey={import.meta.env.VITE_UPLOADCARE_PUB_KEY!}
                          classNameUploader="uc-auto uc-purple"
                          sourceList="local, gdrive"
                          className="uc-auto uc-purple"
                          imgOnly
                          multiple={false}
                          onFileUploadSuccess={(e: any) => {
                            if (e?.cdnUrl) {
                              field.onChange(e.cdnUrl);
                            }
                          }}
                        />
                        {field.value && (
                          <div className="relative aspect-video w-full overflow-hidden rounded-md border">
                            <img
                              src={field.value}
                              alt="Banner"
                              className="h-full w-full object-cover"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-0 right-0 h-5 w-5 rounded-tr-none rounded-bl-md px-0"
                              onClick={() => field.onChange("")}
                            >
                              <span className="sr-only">Remove</span>
                              &times;
                            </Button>
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                )}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
