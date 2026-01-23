import { Info, Shield, ShieldCheck, ShieldOff } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSession } from "@/lib/auth/auth-client";
import {
  BackupCodesDialog,
  Disable2FADialog,
  Enable2FADialog,
} from "./enable-2fa-dialog";

export function SecuritySettings() {
  const { data: session, refetch } = useSession();
  const [enable2FAOpen, setEnable2FAOpen] = useState(false);
  const [disable2FAOpen, setDisable2FAOpen] = useState(false);
  const [backupCodesOpen, setBackupCodesOpen] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);

  // Check if current user has 2FA enabled
  const userHas2FA = session?.user?.twoFactorEnabled ?? false;

  const handleEnable2FASuccess = async (codes: string[]) => {
    setBackupCodes(codes);
    setBackupCodesOpen(true);
    // Refetch session to update the 2FA status in UI
    await refetch();
  };

  const handleDisable2FASuccess = async () => {
    // Refetch session to update the 2FA status in UI
    await refetch();
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle>Security Settings</CardTitle>
          </div>
          <CardDescription>
            Configure security options for your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                {userHas2FA ? (
                  <ShieldCheck className="h-5 w-5 text-green-500" />
                ) : (
                  <ShieldOff className="h-5 w-5 text-muted-foreground" />
                )}
                <Label className="font-medium text-base">
                  Two-Factor Authentication
                </Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 cursor-help text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>
                        2FA adds an extra layer of security by requiring a
                        verification code sent to your email during login.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <p className="text-muted-foreground text-sm">
                {userHas2FA
                  ? "Your account is protected with 2FA"
                  : "Add an extra layer of security to your account"}
              </p>
            </div>
            {userHas2FA ? (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setDisable2FAOpen(true)}
              >
                Disable 2FA
              </Button>
            ) : (
              <Button size="sm" onClick={() => setEnable2FAOpen(true)}>
                Enable 2FA
              </Button>
            )}
          </div>

          <div className="rounded-lg bg-muted/50 p-4">
            <p className="text-muted-foreground text-sm">
              <strong className="text-foreground">Note:</strong> Two-factor
              authentication protects your account by requiring a verification
              code sent to your email when signing in. This applies only to
              email/password accounts — social logins use provider-level
              security.
            </p>
          </div>
        </CardContent>
      </Card>

      <Enable2FADialog
        open={enable2FAOpen}
        onOpenChange={setEnable2FAOpen}
        onSuccess={handleEnable2FASuccess}
      />

      <Disable2FADialog
        open={disable2FAOpen}
        onOpenChange={setDisable2FAOpen}
        onSuccess={handleDisable2FASuccess}
      />

      <BackupCodesDialog
        open={backupCodesOpen}
        onOpenChange={setBackupCodesOpen}
        backupCodes={backupCodes}
      />
    </>
  );
}
