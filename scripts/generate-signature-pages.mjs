import { createClient } from '@supabase/supabase-js';
import { writeFileSync } from 'fs';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const docs = [
  { id: 'b58a5c01-a71c-43cc-8754-fa6b6cc24185', filename: 'Signature_TAG_Helicopter.pdf' },
  { id: 'c98143ae-0ddb-4890-8976-08fcc4d37c2a', filename: 'Signature_Skywalker_PC12.pdf' },
  { id: '2caf9906-7742-46bc-af69-748dbf127d72', filename: 'Signature_MYBA_Venere.pdf' },
];

// We can't easily use @react-pdf/renderer in a script, so generate simple HTML-based signature pages
for (const doc of docs) {
  const { data: docData } = await supabase
    .from('payment_documents')
    .select('id, title, payment_item_id')
    .eq('id', doc.id)
    .single();

  const { data: sig } = await supabase
    .from('document_signatures')
    .select('signed_by_name, signed_by_email, signed_at, ip_address, signature_data')
    .eq('payment_document_id', doc.id)
    .order('signed_at', { ascending: false })
    .limit(1)
    .single();

  const { data: payment } = await supabase
    .from('payment_items')
    .select('service_name, supplier_name')
    .eq('id', docData.payment_item_id)
    .single();

  const signedDate = new Date(sig.signed_at).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric'
  });
  const signedTime = new Date(sig.signed_at).toLocaleTimeString('en-GB', {
    hour: '2-digit', minute: '2-digit', timeZoneName: 'short'
  });

  // Save signature image as PNG
  if (sig.signature_data) {
    const base64 = sig.signature_data.replace(/^data:image\/\w+;base64,/, '');
    const sigBuffer = Buffer.from(base64, 'base64');
    writeFileSync(`/tmp/signed-contracts/${doc.filename.replace('.pdf', '')}_sig.png`, sigBuffer);
  }

  console.log(`\n=== ${docData.title} ===`);
  console.log(`Service: ${payment.service_name}`);
  console.log(`Supplier: ${payment.supplier_name}`);
  console.log(`Signed by: ${sig.signed_by_name} (${sig.signed_by_email})`);
  console.log(`Signed at: ${signedDate} at ${signedTime}`);
  console.log(`IP: ${sig.ip_address || 'Not recorded'}`);
  console.log(`Signature image: /tmp/signed-contracts/${doc.filename.replace('.pdf', '')}_sig.png`);
}

console.log('\nDone. Signature images saved as PNGs.');
