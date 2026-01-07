import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AdminTenantDetailsProps } from "@/types/tenant";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export default function TenantTabs({ tenant }: AdminTenantDetailsProps) {
  return (
    <Tabs defaultValue="overview" className="space-y-4">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="owner">Owner Info</TabsTrigger>
        <TabsTrigger value="subscription">Subscription</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Store Details</CardTitle>
            <CardDescription>Basic information about the store</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="font-medium text-muted-foreground text-sm">
                  Description
                </span>
                <p>{tenant.description}</p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground text-sm">
                  Store URL
                </span>
                <p className="cursor-pointer text-blue-600 underline">
                  https://shopstack.com/{tenant.slug}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="owner" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Owner Information</CardTitle>
            <CardDescription>Details about the account owner</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage
                  src={tenant.owner.avatar}
                  alt={tenant.owner.name}
                />
                <AvatarFallback>
                  {tenant.owner.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium text-lg">{tenant.owner.name}</h3>
                <p className="text-muted-foreground">{tenant.owner.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="subscription" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
            <CardDescription>Subscription details and billing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-lg capitalize">
                  {tenant.plan} Plan
                </h3>
                <p className="text-muted-foreground">Billed monthly</p>
              </div>
              <Button variant="outline">Manage Subscription</Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
