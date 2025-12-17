import FooterMiddle from "@/components/containers/store/footer-middle";
import FooterTop from "@/components/containers/store/footer-top";

export default function Footer() {
  return (
    <footer className="@container">
      {/* Top */}
      <FooterTop />

      {/* Middle */}
      <FooterMiddle />
      {/* Bottom */}
    </footer>
  );
}
