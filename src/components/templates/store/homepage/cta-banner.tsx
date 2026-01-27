import Section from "@/components/base/common/section";
import CtaContainer from "@/components/containers/store/cta-container";
import BallCircleIcon from "@/components/ui/icons/ball-circle";

export default function CtaBanner() {
  return (
    <Section
      title="Elevate Your Wardrobe"
      description="Don't miss out – experience the epitome of fashion by clicking 'Buy Now' and embrace a world of chic elegance delivered to your doorstep. Your style journey begins here."
      containerClassName="bg-primary-70 border-transparent"
      rightAsset={
        <BallCircleIcon className="@5xl:h-[316px] @6xl:h-[386px] h-24 @5xl:w-[301px] @6xl:w-[506px] opacity-30" />
      }
      rightAssetClassName="@5xl:translate-x-4 @6xl:translate-x-10"
      rightAction={<CtaContainer inline />}
      headingClassName="text-background"
      descriptionClassName="text-dark-12"
    >
      <div />
    </Section>
  );
}
