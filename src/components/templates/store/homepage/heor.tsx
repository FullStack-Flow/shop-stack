import Heading from "@/components/base/common/heading";
import Tags from "@/components/base/common/tags";
import CounterBox from "@/components/containers/store/counter-box";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function Hero() {
  const counters = [
    { value: "1,500 +", label: "Fashion Products" },
    { value: "50 +", label: "New arrivals every month" },
    { value: "30%", label: "OFF on select items" },
    { value: "95%", label: "Customer Satisfaction Rate" },
  ];
  return (
    <section className="@container container mx-auto space-y-8 px-4 pt-[60px]">
      <div className="relative rounded-2xl border border-dashed">
        <div className="relative">
          <img
            src="https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=1974&auto=format&fit=crop"
            alt="Hero"
            className="h-[420px] w-full rounded-2xl rounded-b-none object-cover"
          />

          <div className="-translate-x-1/2 -bottom-12 absolute left-1/2">
            <div className="relative flex h-[94px] w-[198px] items-center justify-center rounded-2xl bg-background">
              <div className="flex items-center justify-center">
                <Button
                  variant="secondary"
                  size="lg"
                  type="button"
                  className="h-16 gap-0.5 px-7! text-lg"
                >
                  Shop now
                  <ArrowRight className="size-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid @4xl:grid-cols-2 grid-cols-1 gap-8">
          <div className="space-y-8 @4xl:p-12 @6xl:p-[60px] @7xl:p-20 p-3 pt-14">
            <Tags items={["All", "Mens", "Womens", "Kids"]} />
            <Heading
              title="ELEVATE YOUR STYLE WITH SHOPSTACK"
              subtitle="Explore a world of fashion at Shop.Stack, where trends meet affordability. Immerse yourself in the latest styles and seize exclusive promotions."
            />
          </div>
          <CounterBox items={counters} />
        </div>
      </div>
    </section>
  );
}
