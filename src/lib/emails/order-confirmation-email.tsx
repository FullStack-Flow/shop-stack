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

interface OrderConfirmationEmailProps {
  orderNumber: string;
  customerName: string;
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
  orderLink?: string;
  estimatedDeliveryTimeframe?: string;
  supportEmail?: string;
  supportPhone?: string;
  trackingUrl?: string;
}

export function OrderConfirmationEmail({
  orderNumber = 'ORD-ABC123',
  customerName = 'John',
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
  shopName = 'Shop Stack Store',
  orderLink = '#',
  estimatedDeliveryTimeframe,
  supportEmail = 'support@shopstack.com',
  supportPhone,
  trackingUrl,
}: OrderConfirmationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your order {orderNumber} has been confirmed!</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={headerSection}>
            <Heading style={logo}>Shop Stack</Heading>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            <Heading as="h1" style={h1}>
              Order Confirmed! 🎉
            </Heading>
            <Text style={heroText}>
              Hi {customerName}, thank you for your order from {shopName}!
            </Text>
            <Text style={text}>
              Your order <strong>{orderNumber}</strong> has been confirmed and
              will be processed soon. We&apos;ll send you another email when it
              ships.
            </Text>

            {/* Order Summary Box */}
            <Section style={orderBox}>
              <Row>
                <Column>
                  <Text style={orderLabel}>Order Number</Text>
                  <Text style={orderValue}>{orderNumber}</Text>
                </Column>
                <Column>
                  <Text style={orderLabel}>Order Date</Text>
                  <Text style={orderValue}>{orderDate}</Text>
                </Column>
              </Row>
            </Section>

            <Hr style={hr} />

            {/* Order Items */}
            <Heading as="h2" style={h2}>
              Order Items
            </Heading>

            {items.map((item, index) => (
              <Section key={index} style={itemRow}>
                <Row>
                  <Column style={itemImageCol}>
                    {item.image ? (
                      <Img
                        src={item.image}
                        alt={item.name}
                        width={64}
                        height={64}
                        style={itemImage}
                      />
                    ) : (
                      <div style={itemImagePlaceholder} />
                    )}
                  </Column>
                  <Column style={itemDetailsCol}>
                    <Text style={itemName}>{item.name}</Text>
                    <Text style={itemQty}>Qty: {item.quantity}</Text>
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
                  <Text style={totalLabel}>Total</Text>
                </Column>
                <Column style={summaryValueCol}>
                  <Text style={totalValue}>${total.toFixed(2)}</Text>
                </Column>
              </Row>
            </Section>

            <Hr style={hr} />

            {/* Shipping Address */}
            <Heading as="h2" style={h2}>
              Shipping Address
            </Heading>
            <Text style={addressText}>
              {shippingAddress.street}
              <br />
              {shippingAddress.city}, {shippingAddress.state}{' '}
              {shippingAddress.zip}
              <br />
              {shippingAddress.country}
            </Text>

            <Hr style={hr} />

            <Heading as="h2" style={h2}>
              Estimated Delivery
            </Heading>
            <Text style={text}>
              {estimatedDeliveryTimeframe
                ? `Estimated delivery: ${estimatedDeliveryTimeframe}.`
                : "We'll share an estimated delivery timeframe once your order ships."}
            </Text>

            <Heading as="h2" style={h2}>
              Tracking
            </Heading>
            <Text style={text}>
              {trackingUrl
                ? 'Track your order status using the link below.'
                : "When your order ships, we'll email you tracking details."}
            </Text>

            {/* CTA Button */}
            <Section style={ctaSection}>
              <Link href={trackingUrl || orderLink} style={button}>
                {trackingUrl ? 'Track Order' : 'View Order Details'}
              </Link>
            </Section>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              If you have any questions, reply to this email or contact us at{' '}
              <Link href={`mailto:${supportEmail}`} style={link}>
                {supportEmail}
              </Link>
              {supportPhone ? ` or call ${supportPhone}.` : '.'}
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

export default OrderConfirmationEmail;

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
  padding: '32px 40px',
  textAlign: 'center' as const,
};

const logo: React.CSSProperties = {
  color: '#ffffff',
  fontSize: '28px',
  fontWeight: '700',
  margin: '0',
  letterSpacing: '-0.5px',
};

const content: React.CSSProperties = {
  padding: '40px 40px 32px',
};

const h1: React.CSSProperties = {
  color: '#18181b',
  fontSize: '28px',
  fontWeight: '700',
  margin: '0 0 12px 0',
  lineHeight: '1.3',
};

const h2: React.CSSProperties = {
  color: '#18181b',
  fontSize: '18px',
  fontWeight: '600',
  margin: '24px 0 16px 0',
};

const heroText: React.CSSProperties = {
  color: '#52525b',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '0 0 8px 0',
};

const text: React.CSSProperties = {
  color: '#71717a',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '0 0 24px 0',
};

const orderBox: React.CSSProperties = {
  backgroundColor: '#f4f4f5',
  borderRadius: '8px',
  padding: '20px 24px',
  margin: '24px 0',
};

const orderLabel: React.CSSProperties = {
  color: '#71717a',
  fontSize: '12px',
  fontWeight: '500',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  margin: '0 0 4px 0',
};

const orderValue: React.CSSProperties = {
  color: '#18181b',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0',
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
  marginBottom: '16px',
};

const itemImageCol: React.CSSProperties = {
  width: '80px',
  verticalAlign: 'top',
};

const itemImage: React.CSSProperties = {
  borderRadius: '8px',
  objectFit: 'cover' as const,
};

const itemImagePlaceholder: React.CSSProperties = {
  width: '64px',
  height: '64px',
  backgroundColor: '#e4e4e7',
  borderRadius: '8px',
};

const itemDetailsCol: React.CSSProperties = {
  verticalAlign: 'top',
  paddingLeft: '16px',
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
  color: '#18181b',
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
  marginTop: '32px',
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

const footer: React.CSSProperties = {
  backgroundColor: '#fafafa',
  borderTop: '1px solid #e4e4e7',
  padding: '24px 40px',
  textAlign: 'center' as const,
};

const footerText: React.CSSProperties = {
  color: '#71717a',
  fontSize: '13px',
  lineHeight: '22px',
  margin: '0 0 12px 0',
};

const footerCopyright: React.CSSProperties = {
  color: '#a1a1aa',
  fontSize: '12px',
  margin: '0',
};

const link: React.CSSProperties = {
  color: '#18181b',
  textDecoration: 'underline',
};
