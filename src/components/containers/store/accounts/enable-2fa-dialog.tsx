import { useState } from "react";
import { toast } from "sonner";
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
import { twoFactor } from "@/lib/auth/auth-client";

type Enable2FADialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (backupCodes: string[]) => void;
};

export function Enable2FADialog({
  open,
  onOpenChange,
  onSuccess,
}: Enable2FADialogProps) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEnable = async () => {
    if (!password) {
      toast.error("Please enter your password");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await twoFactor.enable({
        password,
      });

      if (error) {
        toast.error(error.message || "Failed to enable 2FA");
        return;
      }

      if (data?.backupCodes) {
        toast.success("Two-factor authentication enabled!");
        onSuccess?.(data.backupCodes);
        onOpenChange(false);
        setPassword("");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to enable 2FA");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Enable Two-Factor Authentication</DialogTitle>
          <DialogDescription>
            Enter your password to confirm and enable 2FA on your account.
            You'll receive backup codes after enabling.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="password">Current Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleEnable();
                }
              }}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              setPassword("");
            }}
          >
            Cancel
          </Button>
          <Button onClick={handleEnable} disabled={loading || !password}>
            {loading ? "Enabling…" : "Enable 2FA"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
type Disable2FADialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
};

export function Disable2FADialog({
  open,
  onOpenChange,
  onSuccess,
}: Disable2FADialogProps) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDisable = async () => {
    if (!password) {
      toast.error("Please enter your password");
      return;
    }

    setLoading(true);
    try {
      const { error } = await twoFactor.disable({
        password,
      });

      if (error) {
        toast.error(error.message || "Failed to disable 2FA");
        return;
      }

      toast.success("Two-factor authentication disabled");
      onSuccess?.();
      onOpenChange(false);
      setPassword("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to disable 2FA");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Disable Two-Factor Authentication</DialogTitle>
          <DialogDescription>
            Enter your password to confirm and disable 2FA on your account.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="disable-password">Current Password</Label>
            <Input
              id="disable-password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleDisable();
                }
              }}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              setPassword("");
            }}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDisable}
            disabled={loading || !password}
          >
            {loading ? "Disabling…" : "Disable 2FA"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

type BackupCodesDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  backupCodes: string[];
};

export function BackupCodesDialog({
  open,
  onOpenChange,
  backupCodes,
}: BackupCodesDialogProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText(backupCodes.join("\n"));
    toast.success("Backup codes copied to clipboard");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Save Your Backup Codes</DialogTitle>
          <DialogDescription>
            Save these backup codes in a secure place. You can use them to
            access your account if you lose access to your email.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-2 rounded-lg bg-muted p-4 font-mono text-sm">
            {backupCodes.map((code, index) => (
              <div key={index} className="text-center">
                {code}
              </div>
            ))}
          </div>
          <p className="font-medium text-destructive text-sm">
            ⚠️ These codes will only be shown once!
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCopy}>
            Copy Codes
          </Button>
          <Button onClick={() => onOpenChange(false)}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
