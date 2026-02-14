import { createFileRoute } from "@tanstack/react-router";
import MyReviewsTemplate from "@/components/templates/store/accounts/my-reviews-template";
import { authMiddleware } from "@/lib/middleware/auth";

export const Route = createFileRoute("/(store)/_layout/my-reviews")({
  server: {
    middleware: [authMiddleware],
  },
  component: RouteComponent,
});

function RouteComponent() {
  return <MyReviewsTemplate />;
}
