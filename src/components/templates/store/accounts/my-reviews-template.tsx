import AccountLayout from "@/components/containers/store/accounts/account-layout";
import MyReviewsList from "@/components/containers/store/accounts/my-reviews/my-reviews-list";

export default function MyReviewsTemplate() {
  return (
    <AccountLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-1">
          <h1 className="font-bold text-2xl tracking-tight">My Reviews</h1>
          <p className="text-muted-foreground">
            Manage your product reviews and ratings.
          </p>
        </div>

        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="p-6">
            <MyReviewsList />
          </div>
        </div>
      </div>
    </AccountLayout>
  );
}
