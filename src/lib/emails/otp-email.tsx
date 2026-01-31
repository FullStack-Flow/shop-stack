import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import type * as React from "react";

type OtpEmailProps = {
  otp: string;
  userName?: string;
  expiresInMinutes?: number;
};

export function OtpEmail({
  otp,
  userName = "there",
  expiresInMinutes = 5,
}: OtpEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your verification code: {otp}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoSection}>
            <Heading style={logo}>Shop Stack</Heading>
          </Section>

          <Section style={contentSection}>
            <Heading as="h2" style={heading}>
              Verification Code
            </Heading>
            <Text style={paragraph}>Hi {userName},</Text>
            <Text style={paragraph}>
              Use the following code to verify your identity. This code will
              expire in {expiresInMinutes} minutes.
            </Text>

            <Section style={codeContainer}>
              <Text style={code}>{otp}</Text>
            </Section>

            <Text style={paragraph}>
              If you didn't request this code, you can safely ignore this email.
              Someone may have entered your email address by mistake.
            </Text>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>
              © {new Date().getFullYear()} Shop Stack. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default OtpEmail;

// Styles
const main: React.CSSProperties = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  padding: "40px 0",
};

const container: React.CSSProperties = {
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
  margin: "0 auto",
  maxWidth: "480px",
  overflow: "hidden",
};

const logoSection: React.CSSProperties = {
  backgroundColor: "#18181b",
  padding: "24px",
  textAlign: "center" as const,
};

const logo: React.CSSProperties = {
  color: "#ffffff",
  fontSize: "24px",
  fontWeight: "700",
  margin: "0",
};

const contentSection: React.CSSProperties = {
  padding: "32px 40px",
};

const heading: React.CSSProperties = {
  color: "#18181b",
  fontSize: "22px",
  fontWeight: "600",
  margin: "0 0 16px 0",
};

const paragraph: React.CSSProperties = {
  color: "#52525b",
  fontSize: "16px",
  lineHeight: "26px",
  margin: "0 0 16px 0",
};

const codeContainer: React.CSSProperties = {
  backgroundColor: "#f4f4f5",
  borderRadius: "8px",
  margin: "24px 0",
  padding: "24px",
  textAlign: "center" as const,
};

const code: React.CSSProperties = {
  color: "#18181b",
  fontSize: "36px",
  fontWeight: "700",
  letterSpacing: "8px",
  margin: "0",
};

const footer: React.CSSProperties = {
  backgroundColor: "#fafafa",
  borderTop: "1px solid #e4e4e7",
  padding: "16px 24px",
  textAlign: "center" as const,
};

const footerText: React.CSSProperties = {
  color: "#a1a1aa",
  fontSize: "12px",
  margin: "0",
};
