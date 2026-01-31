import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Store } from "@/types/store-types";

interface StoreAboutProps {
  store: Store;
  className?: string;
}

export function StoreAbout({ store, className }: StoreAboutProps) {
  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle>About {store.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Description */}
          <div>
            <h3 className="mb-2 font-semibold">Description</h3>
            <p className="text-muted-foreground leading-relaxed">
              {store.description}
            </p>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="mb-3 font-semibold">Contact Information</h3>
            <div className="space-y-3">
              {store.contactEmail && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                    <Mail className="size-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Email</p>
                    <a
                      href={`mailto:${store.contactEmail}`}
                      className="font-medium hover:text-primary"
                    >
                      {store.contactEmail}
                    </a>
                  </div>
                </div>
              )}

              {store.contactPhone && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                    <Phone className="size-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Phone</p>
                    <a
                      href={`tel:${store.contactPhone}`}
                      className="font-medium hover:text-primary"
                    >
                      {store.contactPhone}
                    </a>
                  </div>
                </div>
              )}

              {store.address && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                    <MapPin className="size-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Address</p>
                    <p className="font-medium">{store.address}</p>
                  </div>
                </div>
              )}

              {store.businessHours && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                    <Clock className="size-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">
                      Business Hours
                    </p>
                    <p className="font-medium">{store.businessHours}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
