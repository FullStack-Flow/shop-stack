import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { twoFactor } from "@/lib/auth/auth-client";

type TwoFactorFormProps = {
  onSuccess?: () => void;
  onCancel?: () => void;
};

export function TwoFactorForm({ onSuccess, onCancel }: TwoFactorFormProps) {
  const [otp, setOtp] = useState("");
  const [trustDevice, setTrustDevice] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);

  const handleVerify = async () => {
    if (otp.length !== 6) {
      toast.error("Please enter a valid 6-digit code");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await twoFactor.verifyOtp({
        code: otp,
        trustDevice,
      });

      if (error) {
        toast.error(error.message || "Verification failed");
        setOtp("");
        return;
      }

      if (data) {
        toast.success("Verification successful!");
        onSuccess?.();
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Verification failed");
      setOtp("");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setSendingOtp(true);
    try {
      const { error } = await twoFactor.sendOtp({});

      if (error) {
        // If unauthorized, tell user to try signing in again
        if (error.status === 401) {
          toast.error(
            "Session expired. Please cancel and try signing in again."
          );
        } else {
          toast.error(error.message || "Failed to send code");
        }
        return;
      }

      toast.success("A new code has been sent to your email");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send code");
    } finally {
      setSendingOtp(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="font-semibold text-2xl tracking-tight">
          Two-Factor Authentication
        </h2>
        <p className="text-muted-foreground text-sm">
          A 6-digit code has been sent to your email. Enter it below to
          continue.
        </p>
      </div>

      <div className="flex justify-center">
        <InputOTP
          maxLength={6}
          value={otp}
          onChange={setOtp}
          onComplete={handleVerify}
        >
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id="trustDevice"
          checked={trustDevice}
          onCheckedChange={(checked) => setTrustDevice(checked === true)}
        />
        <Label htmlFor="trustDevice" className="text-sm">
          Trust this device for 30 days
        </Label>
      </div>

      <div className="flex flex-col gap-3">
        <Button
          type="button"
          onClick={handleVerify}
          disabled={loading || otp.length !== 6}
          className="w-full"
          size="lg"
        >
          {loading ? "Verifying…" : "Verify Code"}
        </Button>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleResendOtp}
            disabled={sendingOtp}
            className="flex-1"
            size="lg"
          >
            {sendingOtp ? "Sending…" : "Resend Code"}
          </Button>

          {onCancel && (
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              className="flex-1"
              size="lg"
            >
              Cancel
            </Button>
          )}
        </div>
      </div>

      <p className="text-center text-muted-foreground text-xs">
        Didn't receive the code? Check your spam folder or request a new code.
      </p>
    </div>
  );
}
