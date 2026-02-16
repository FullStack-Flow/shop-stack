import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { getInvoiceUrl } from "@/lib/functions/store/invoice";

export const useDownloadInvoice = () => {
  const mutation = useMutation({
    mutationFn: async ({
      orderId,
      paymentIntentId,
      newWindow,
    }: {
      orderId: string;
      paymentIntentId?: string;
      newWindow?: Window | null;
    }) => {
      try {
        const { url } = await getInvoiceUrl({
          data: { orderId, paymentIntentId },
        });
        if (newWindow) {
          newWindow.location.href = url;
        } else {
          window.location.assign(url);
        }
        return url;
      } catch (error) {
        if (newWindow) newWindow.close();
        throw error;
      }
    },
    onSuccess: () => {
      toast.success("Invoice download started");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to download invoice",
      );
    },
  });

  return {
    ...mutation,
    download: (orderId: string, opts?: { paymentIntentId?: string }) => {
      const newWindow = window.open("", "_blank", "noopener,noreferrer");
      if (!newWindow) {
        toast.error("Pop-up blocked. Opening invoice in this tab.");
        mutation.mutate({
          orderId,
          paymentIntentId: opts?.paymentIntentId,
          newWindow: null,
        });
        return;
      }
      // Explicitly nullify opener for additional security
      newWindow.opener = null;
      mutation.mutate({
        orderId,
        paymentIntentId: opts?.paymentIntentId,
        newWindow,
      });
    },
  };
};
