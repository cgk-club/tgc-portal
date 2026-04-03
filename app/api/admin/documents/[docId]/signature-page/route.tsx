export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 60,
    fontFamily: "Helvetica",
    backgroundColor: "#FFFFFF",
  },
  header: {
    marginBottom: 40,
    textAlign: "center",
  },
  brand: {
    fontSize: 10,
    letterSpacing: 3,
    color: "#c8aa4a",
    marginBottom: 8,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    color: "#0e4f51",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 11,
    color: "#666666",
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "#c8aa4a",
    borderBottomStyle: "solid",
    marginVertical: 30,
    opacity: 0.4,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 8,
    letterSpacing: 2,
    color: "#999999",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  value: {
    fontSize: 12,
    color: "#1a1a1a",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  col: {
    width: "48%",
  },
  signatureSection: {
    marginTop: 30,
    alignItems: "center",
  },
  signatureImage: {
    width: 250,
    height: 100,
    marginBottom: 12,
  },
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: "#333333",
    borderBottomStyle: "solid",
    width: 250,
    marginBottom: 8,
  },
  signatureName: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: "#1a1a1a",
    textAlign: "center",
  },
  footer: {
    position: "absolute",
    bottom: 40,
    left: 60,
    right: 60,
    borderTopWidth: 1,
    borderTopColor: "#eeeeee",
    borderTopStyle: "solid",
    paddingTop: 12,
  },
  footerText: {
    fontSize: 7,
    color: "#aaaaaa",
    textAlign: "center",
    lineHeight: 1.6,
  },
  legalNote: {
    marginTop: 30,
    padding: 16,
    backgroundColor: "#f9f8f5",
    borderRadius: 4,
  },
  legalText: {
    fontSize: 8,
    color: "#888888",
    lineHeight: 1.5,
  },
});

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }) + " at " + d.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

interface SignaturePageProps {
  documentTitle: string;
  serviceName: string;
  supplierName: string;
  signedByName: string;
  signedByEmail: string;
  signedAt: string;
  ipAddress: string | null;
  signatureDataUri: string | null;
}

function SignaturePagePDF({
  documentTitle,
  serviceName,
  supplierName,
  signedByName,
  signedByEmail,
  signedAt,
  ipAddress,
  signatureDataUri,
}: SignaturePageProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.brand}>The Gatekeepers Club</Text>
          <Text style={styles.title}>Signature Confirmation</Text>
          <Text style={styles.subtitle}>Digital Signature Record</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.label}>Document</Text>
          <Text style={styles.value}>{documentTitle}</Text>
        </View>

        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>Service</Text>
            <Text style={styles.value}>{serviceName}</Text>
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>Supplier</Text>
            <Text style={styles.value}>{supplierName}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>Signed By</Text>
            <Text style={styles.value}>{signedByName}</Text>
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{signedByEmail}</Text>
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>Date and Time</Text>
            <Text style={styles.value}>{formatDateTime(signedAt)}</Text>
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>IP Address</Text>
            <Text style={styles.value}>{ipAddress || "Not recorded"}</Text>
          </View>
        </View>

        <View style={styles.signatureSection}>
          {signatureDataUri && (
            <Image src={signatureDataUri} style={styles.signatureImage} />
          )}
          <View style={styles.signatureLine} />
          <Text style={styles.signatureName}>{signedByName}</Text>
        </View>

        <View style={styles.legalNote}>
          <Text style={styles.legalText}>
            This document confirms that the above-named individual has applied their digital signature to the referenced document via The Gatekeepers Club client portal. The signature was captured electronically with timestamp, email verification, and IP address logging. This digital signature record is maintained by The Gatekeepers Club as part of its secure document management system.
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            The Gatekeepers Club | christian@thegatekeepers.club | +33 7 73 77 90 71 | thegatekeepers.club
          </Text>
        </View>
      </Page>
    </Document>
  );
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ docId: string }> }
) {
  try {
    const { docId } = await params;
    const supabase = getSupabaseAdmin();

    // Fetch document with signature and payment item
    const { data: doc, error: docError } = await supabase
      .from("payment_documents")
      .select("id, title, payment_item_id")
      .eq("id", docId)
      .single();

    if (docError || !doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    const { data: sig, error: sigError } = await supabase
      .from("document_signatures")
      .select("signed_by_name, signed_by_email, signed_at, ip_address, signature_data")
      .eq("payment_document_id", docId)
      .order("signed_at", { ascending: false })
      .limit(1)
      .single();

    if (sigError || !sig) {
      return NextResponse.json({ error: "No signature found for this document" }, { status: 404 });
    }

    const { data: payment } = await supabase
      .from("payment_items")
      .select("service_name, supplier_name")
      .eq("id", doc.payment_item_id)
      .single();

    const buffer = await renderToBuffer(
      <SignaturePagePDF
        documentTitle={doc.title}
        serviceName={payment?.service_name || ""}
        supplierName={payment?.supplier_name || ""}
        signedByName={sig.signed_by_name}
        signedByEmail={sig.signed_by_email}
        signedAt={sig.signed_at}
        ipAddress={sig.ip_address}
        signatureDataUri={sig.signature_data}
      />
    );

    const uint8 = new Uint8Array(buffer);
    return new NextResponse(uint8, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Signature_Confirmation_${doc.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Signature page generation error:", error);
    return NextResponse.json({ error: "Failed to generate signature page" }, { status: 500 });
  }
}
