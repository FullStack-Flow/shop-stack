import { CheckCircle2, XCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { useSession } from "@/lib/auth/auth-client";
import { AddressBook } from "./address-book";

export default function ProfileForm() {
  const { data } = useSession();
  const user = data?.user;

  if (!user) return null;

  return (
    <div className="rounded-lg border bg-input/10 text-card-foreground shadow-sm">
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={user.image || ""} alt={user.name} />
            <AvatarFallback className="text-lg">
              {user.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h3 className="font-semibold text-lg">{user.name}</h3>
            <p className="text-muted-foreground text-sm">
              Member since {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <InputGroup>
              <InputGroupInput
                id="name"
                placeholder="Enter your name"
                defaultValue={user.name}
              />
            </InputGroup>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <InputGroup>
              <InputGroupInput
                id="email"
                type="email"
                placeholder="Enter your email"
                defaultValue={user.email}
                disabled
              />
              <InputGroupAddon align="inline-end">
                {user.emailVerified ? (
                  <CheckCircle2 className="size-4 text-emerald-500" />
                ) : (
                  <XCircle className="size-4 text-destructive" />
                )}
              </InputGroupAddon>
            </InputGroup>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-xs">
                {user.emailVerified ? "Email verified" : "Email not verified"}
              </span>
            </div>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="image">Profile Image URL</Label>
            <InputGroup>
              <InputGroupInput
                id="image"
                placeholder="https://example.com/avatar.jpg"
                defaultValue={user.image || ""}
              />
            </InputGroup>
          </div>
        </div>

        <div className="flex justify-end">
          <Button>Save Changes</Button>
        </div>
      </div>

      <div className="border-t p-6">
        <AddressBook />
      </div>
    </div>
  );
}
