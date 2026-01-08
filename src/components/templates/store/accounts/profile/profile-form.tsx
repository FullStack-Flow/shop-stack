import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AddressBook } from './address-book';

export default function ProfileForm() {
  //   const { data } = useSession();
  //   const user = data?.user;

  //   if (!user) return null;

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-4">
          {/* <Avatar className="h-20 w-20">
            <AvatarImage src={user.image || ''} alt={user.name} />
            <AvatarFallback className="text-lg">
              {user.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()}
            </AvatarFallback>
          </Avatar> */}
          <div className="space-y-1">
            <h3 className="font-semibold text-lg">Profile Name</h3>
            <p className="text-muted-foreground text-sm">Member since Date</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="Enter your name"
              defaultValue="Name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                defaultValue="Email@email.com"
                disabled
                className="pr-10"
              />
              <div className="-translate-y-1/2 absolute top-1/2 right-3">
                {/* {user.emailVerified ? (
                  <CheckCircle2 className="size-4 text-emerald-500" />
                ) : (
                  <XCircle className="size-4 text-destructive" />
                )} */}
                Check Icon
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-xs">
                {/* {user.emailVerified ? 'Email verified' : 'Email not verified'} */}
                Email not verified
              </span>
            </div>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="image">Profile Image URL</Label>
            <Input
              id="image"
              placeholder="https://example.com/avatar.jpg"
              defaultValue={''}
            />
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
