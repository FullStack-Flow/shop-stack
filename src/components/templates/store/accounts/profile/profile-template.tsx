import AccountLayout from "@/components/containers/store/accounts/account-layout";
import { SecuritySettings } from "@/components/containers/store/accounts/security-settings";
import ProfileForm from "./profile-form";

export default function ProfileTemplate() {
  return (
    <AccountLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-bold text-2xl tracking-tight">Profile</h1>
        </div>
        <ProfileForm />
        <SecuritySettings />
      </div>
    </AccountLayout>
  );
}
