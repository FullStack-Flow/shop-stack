import Collections from "@/components/templates/store/homepage/collections";
import FeatureGrid from "@/components/templates/store/homepage/feature-grid";
import Hero from "@/components/templates/store/homepage/heor";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(store)/_layout/")({ component: App });

function App() {
  return (
    <div className="min-h-screen">
      <Hero />
      <FeatureGrid />
      <Collections />
    </div>
  );
}
