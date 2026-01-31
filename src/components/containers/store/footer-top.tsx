import SocialLinks from "@/components/base/common/social-links";

export default function FooterTop() {
  return (
    <div className="@4xl:px-12 @6xl:px-15 @7xl:px-20 px-5 py-10">
      <div className="flex @3xl:flex-row flex-col @3xl:items-center @3xl:justify-between gap-6">
        <h3 className="font-bold @6xl:text-[124px] text-6xl">
          Shop
          <span className="text-primary">.</span>
          Stack
        </h3>
        <SocialLinks />
      </div>
    </div>
  );
}
