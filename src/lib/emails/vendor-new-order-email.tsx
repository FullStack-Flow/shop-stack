import {
  Body,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from '@react-email/components';
import type * as React from 'react';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  image?: string | null;
}

interface VendorNewOrderEmailProps {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  orderDate: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  shopName: string;
  dashboardLink?: string;
}

export function VendorNewOrderEmail({
  orderNumber = 'ORD-ABC123',
  customerName = 'John Doe',
  customerEmail = 'john@example.com',
  orderDate = new Date().toLocaleDateString(),
  items = [{ name: 'Sample Product', quantity: 1, price: 29.99, image: null }],
  subtotal = 29.99,
  tax = 1.5,
  shipping = 0,
  total = 31.49,
  shippingAddress = {
    street: '123 Main St',
    city: 'San Francisco',
    state: 'CA',
    zip: '94102',
    country: 'USA',
  },
  shopName = 'My Shop',
  dashboardLink = '#',
}: VendorNewOrderEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        🎉 New order #{orderNumber} from {customerName} - ${total.toFixed(2)}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={headerSection}>
            <Heading style={logo}>Shop Stack</Heading>
            <Text style={headerSubtext}>Vendor Dashboard</Text>
          </Section>

          {/* Alert Banner */}
          <Section style={alertBanner}>
            <Text style={alertText}>🎉 New Order Received!</Text>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            <Heading as="h1" style={h1}>
              You have a new order!
            </Heading>
            <Text style={heroText}>
              Great news! {shopName} just received a new order.
            </Text>

            {/* Order Summary Box */}
            <Section style={orderBox}>
              <Row>
                <Column>
                  <Text style={orderLabel}>Order Number</Text>
                  <Text style={orderValue}>{orderNumber}</Text>
                </Column>
                <Column>
                  <Text style={orderLabel}>Order Total</Text>
                  <Text style={orderValueHighlight}>${total.toFixed(2)}</Text>
                </Column>
              </Row>
              <Hr style={hrBox} />
              <Row>
                <Column>
                  <Text style={orderLabel}>Customer</Text>
                  <Text style={orderValue}>{customerName}</Text>
                </Column>
                <Column>
                  <Text style={orderLabel}>Date</Text>
                  <Text style={orderValue}>{orderDate}</Text>
                </Column>
              </Row>
            </Section>

            {/* Customer Info */}
            <Heading as="h2" style={h2}>
              Customer Details
            </Heading>
            <Section style={infoBox}>
              <Text style={infoLabel}>Name</Text>
              <Text style={infoValue}>{customerName}</Text>
              <Text style={infoLabel}>Email</Text>
              <Text style={infoValue}>
                <Link href={`mailto:${customerEmail}`} style={link}>
                  {customerEmail}
                </Link>
              </Text>
            </Section>

            <Hr style={hr} />

            {/* Order Items */}
            <Heading as="h2" style={h2}>
              Order Items ({items.length})
            </Heading>

            {items.map((item, index) => (
              <Section key={index} style={itemRow}>
                <Row>
                  <Column style={itemImageCol}>
                    {item.image ? (
                      <Img
                        src={item.image}
                        alt={item.name}
                        width={56}
                        height={56}
                        style={itemImage}
                      />
                    ) : (
                      <div style={itemImagePlaceholder} />
                    )}
                  </Column>
                  <Column style={itemDetailsCol}>
                    <Text style={itemName}>{item.name}</Text>
                    <Text style={itemQty}>
                      ${item.price.toFixed(2)} × {item.quantity}
                    </Text>
                  </Column>
                  <Column style={itemPriceCol}>
                    <Text style={itemPrice}>
                      ${(item.price * item.quantity).toFixed(2)}
                    </Text>
                  </Column>
                </Row>
              </Section>
            ))}

            <Hr style={hr} />

            {/* Price Summary */}
            <Section style={summarySection}>
              <Row>
                <Column style={summaryLabelCol}>
                  <Text style={summaryLabel}>Subtotal</Text>
                </Column>
                <Column style={summaryValueCol}>
                  <Text style={summaryValue}>${subtotal.toFixed(2)}</Text>
                </Column>
              </Row>
              <Row>
                <Column style={summaryLabelCol}>
                  <Text style={summaryLabel}>Tax</Text>
                </Column>
                <Column style={summaryValueCol}>
                  <Text style={summaryValue}>${tax.toFixed(2)}</Text>
                </Column>
              </Row>
              <Row>
                <Column style={summaryLabelCol}>
                  <Text style={summaryLabel}>Shipping</Text>
                </Column>
                <Column style={summaryValueCol}>
                  <Text style={summaryValue}>
                    {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
                  </Text>
                </Column>
              </Row>
              <Hr style={hrLight} />
              <Row>
                <Column style={summaryLabelCol}>
                  <Text style={totalLabel}>Order Total</Text>
                </Column>
                <Column style={summaryValueCol}>
                  <Text style={totalValue}>${total.toFixed(2)}</Text>
                </Column>
              </Row>
            </Section>

            <Hr style={hr} />

            {/* Shipping Address */}
            <Heading as="h2" style={h2}>
              Ship To
            </Heading>
            <Section style={infoBox}>
              <Text style={addressText}>
                {customerName}
                <br />
                {shippingAddress.street}
                <br />
                {shippingAddress.city}, {shippingAddress.state}{' '}
                {shippingAddress.zip}
                <br />
                {shippingAddress.country}
              </Text>
            </Section>

            {/* CTA Button */}
            <Section style={ctaSection}>
              <Link href={dashboardLink} style={button}>
                View Order in Dashboard
              </Link>
            </Section>

            <Text style={tipText}>
              💡 Tip: Process orders quickly to maintain a high seller rating!
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              This notification was sent because you have a shop on Shop Stack.
            </Text>
            <Text style={footerCopyright}>
              © {new Date().getFullYear()} Shop Stack. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default VendorNewOrderEmail;

// ============================================================================
// Styles
// ============================================================================

const main: React.CSSProperties = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
};

const container: React.CSSProperties = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '0',
  marginBottom: '64px',
  maxWidth: '600px',
  borderRadius: '8px',
  overflow: 'hidden',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)',
};

const headerSection: React.CSSProperties = {
  backgroundColor: '#18181b',
  padding: '24px 40px',
  textAlign: 'center' as const,
};

const logo: React.CSSProperties = {
  color: '#ffffff',
  fontSize: '24px',
  fontWeight: '700',
  margin: '0',
  letterSpacing: '-0.5px',
};

const headerSubtext: React.CSSProperties = {
  color: '#a1a1aa',
  fontSize: '12px',
  fontWeight: '500',
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
  margin: '8px 0 0 0',
};

const alertBanner: React.CSSProperties = {
  backgroundColor: '#22c55e',
  padding: '16px 40px',
  textAlign: 'center' as const,
};

const alertText: React.CSSProperties = {
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0',
};

const content: React.CSSProperties = {
  padding: '32px 40px',
};

const h1: React.CSSProperties = {
  color: '#18181b',
  fontSize: '24px',
  fontWeight: '700',
  margin: '0 0 8px 0',
  lineHeight: '1.3',
};

const h2: React.CSSProperties = {
  color: '#18181b',
  fontSize: '16px',
  fontWeight: '600',
  margin: '20px 0 12px 0',
};

const heroText: React.CSSProperties = {
  color: '#52525b',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '0 0 24px 0',
};

const orderBox: React.CSSProperties = {
  backgroundColor: '#f4f4f5',
  borderRadius: '8px',
  padding: '20px 24px',
  margin: '0 0 24px 0',
};

const orderLabel: React.CSSProperties = {
  color: '#71717a',
  fontSize: '11px',
  fontWeight: '500',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  margin: '0 0 4px 0',
};

const orderValue: React.CSSProperties = {
  color: '#18181b',
  fontSize: '15px',
  fontWeight: '600',
  margin: '0',
};

const orderValueHighlight: React.CSSProperties = {
  color: '#22c55e',
  fontSize: '18px',
  fontWeight: '700',
  margin: '0',
};

const hrBox: React.CSSProperties = {
  borderColor: '#d4d4d8',
  margin: '16px 0',
};

const infoBox: React.CSSProperties = {
  backgroundColor: '#fafafa',
  borderRadius: '6px',
  padding: '16px 20px',
  margin: '0',
};

const infoLabel: React.CSSProperties = {
  color: '#71717a',
  fontSize: '11px',
  fontWeight: '500',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  margin: '0 0 2px 0',
};

const infoValue: React.CSSProperties = {
  color: '#18181b',
  fontSize: '14px',
  margin: '0 0 12px 0',
};

const hr: React.CSSProperties = {
  borderColor: '#e4e4e7',
  margin: '24px 0',
};

const hrLight: React.CSSProperties = {
  borderColor: '#e4e4e7',
  margin: '12px 0',
};

const itemRow: React.CSSProperties = {
  marginBottom: '12px',
};

const itemImageCol: React.CSSProperties = {
  width: '72px',
  verticalAlign: 'top',
};

const itemImage: React.CSSProperties = {
  borderRadius: '6px',
  objectFit: 'cover' as const,
};

const itemImagePlaceholder: React.CSSProperties = {
  width: '56px',
  height: '56px',
  backgroundColor: '#e4e4e7',
  borderRadius: '6px',
};

const itemDetailsCol: React.CSSProperties = {
  verticalAlign: 'top',
  paddingLeft: '12px',
};

const itemName: React.CSSProperties = {
  color: '#18181b',
  fontSize: '14px',
  fontWeight: '500',
  margin: '0 0 4px 0',
};

const itemQty: React.CSSProperties = {
  color: '#71717a',
  fontSize: '13px',
  margin: '0',
};

const itemPriceCol: React.CSSProperties = {
  textAlign: 'right' as const,
  verticalAlign: 'top',
};

const itemPrice: React.CSSProperties = {
  color: '#18181b',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0',
};

const summarySection: React.CSSProperties = {
  padding: '0',
};

const summaryLabelCol: React.CSSProperties = {
  width: '70%',
};

const summaryValueCol: React.CSSProperties = {
  width: '30%',
  textAlign: 'right' as const,
};

const summaryLabel: React.CSSProperties = {
  color: '#71717a',
  fontSize: '14px',
  margin: '4px 0',
};

const summaryValue: React.CSSProperties = {
  color: '#18181b',
  fontSize: '14px',
  margin: '4px 0',
};

const totalLabel: React.CSSProperties = {
  color: '#18181b',
  fontSize: '16px',
  fontWeight: '600',
  margin: '4px 0',
};

const totalValue: React.CSSProperties = {
  color: '#22c55e',
  fontSize: '20px',
  fontWeight: '700',
  margin: '4px 0',
};

const addressText: React.CSSProperties = {
  color: '#52525b',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0',
};

const ctaSection: React.CSSProperties = {
  textAlign: 'center' as const,
  marginTop: '28px',
};

const button: React.CSSProperties = {
  backgroundColor: '#18181b',
  borderRadius: '8px',
  color: '#ffffff',
  display: 'inline-block',
  fontSize: '14px',
  fontWeight: '600',
  padding: '14px 28px',
  textDecoration: 'none',
};

const tipText: React.CSSProperties = {
  backgroundColor: '#fef3c7',
  borderRadius: '6px',
  color: '#92400e',
  fontSize: '13px',
  padding: '12px 16px',
  marginTop: '24px',
  textAlign: 'center' as const,
};

const footer: React.CSSProperties = {
  backgroundColor: '#fafafa',
  borderTop: '1px solid #e4e4e7',
  padding: '20px 40px',
  textAlign: 'center' as const,
};

const footerText: React.CSSProperties = {
  color: '#71717a',
  fontSize: '12px',
  lineHeight: '20px',
  margin: '0 0 8px 0',
};

const footerCopyright: React.CSSProperties = {
  color: '#a1a1aa',
  fontSize: '11px',
  margin: '0',
};

const link: React.CSSProperties = {
  color: '#18181b',
  textDecoration: 'underline',
};
