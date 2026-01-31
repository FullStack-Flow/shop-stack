import FooterNav from "@/components/base/common/footer-nav";
import SubscribeForm from "@/components/base/forms/subscribe-form";

const homeMenu = [
  { label: "Why Us", to: "/#why-us" },
  { label: "About Us", to: "/#about" },
  { label: "Testimonials", to: "/#testimonials" },
  { label: "FAQ’s", to: "/#faqs" },
];

const productsMenu = [
  { label: "Menswear", to: "/products?category=mens" },
  { label: "Womenswear", to: "/products?category=womens" },
  { label: "Kidswear", to: "/products?category=kids" },
];

export default function FooterMiddle() {
  return (
    <div className="border-body-15 border-y-2 border-dashed">
      <div className="@4xl:px-12 @6xl:px-15 @7xl:px-20 px-4 @5xl:py-16 @7xl:py-20 py-10">
        <div className="grid @4xl:grid-cols-2 @6xl:grid-cols-3 grid-cols-1 gap-10">
          {/* Home Menu */}
          <div className="font-mono text-body-70 text-sm tracking-wide">
            <FooterNav title="Home" links={homeMenu} />
          </div>

          {/* Products Menu */}
          <div className="font-mono text-body-70 text-sm tracking-wide">
            <FooterNav title="Products" links={productsMenu} />
          </div>

          {/* Subscribe Form */}
          <div className="@4xl:col-span-2 @6xl:col-span-1 space-y-4">
            <h4 className="font-medium text-foreground text-lg">
              Subscribe to Newsletter
            </h4>
            <SubscribeForm />
          </div>
        </div>
      </div>
    </div>
  );
}
