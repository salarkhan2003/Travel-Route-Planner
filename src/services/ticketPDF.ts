/**
 * ticketPDF.ts — Real PDF ticket generator using expo-print + expo-sharing
 * Generates a styled HTML ticket and shares as PDF via native share sheet
 */
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';

export interface TicketData {
  type: 'TRAIN' | 'FLIGHT' | 'BUS' | 'MOVIE';
  ref: string;
  from?: string;
  to?: string;
  dep?: string;
  arr?: string;
  date?: string;
  passenger: string;
  seat?: string;
  price: number;
  operator: string;
  subInfo?: string;
  // Train
  trainNo?: string;
  class?: string;
  pnr?: string;
  // Flight
  flightNo?: string;
  gate?: string;
  terminal?: string;
  // Bus
  busType?: string;
  // Movie
  cinema?: string;
  movie?: string;
  showtime?: string;
  seats?: string;
  screen?: string;
}

const ACCENT: Record<string, string> = {
  TRAIN:  '#059669',
  FLIGHT: '#2563EB',
  BUS:    '#D97706',
  MOVIE:  '#DB2777',
};

const TYPE_LABEL: Record<string, string> = {
  TRAIN:  'TRAIN E-TICKET',
  FLIGHT: 'BOARDING PASS',
  BUS:    'BUS E-TICKET',
  MOVIE:  'M-TICKET',
};

function buildHTML(t: TicketData): string {
  const accent = ACCENT[t.type] || '#059669';
  const label  = TYPE_LABEL[t.type] || 'E-TICKET';
  const seat   = t.seat || t.seats || 'N/A';

  // Extra rows based on type
  const extraRows = [
    t.pnr     && `<tr><td class="k">PNR NUMBER</td><td class="v">${t.pnr}</td></tr>`,
    t.class   && `<tr><td class="k">CLASS</td><td class="v">${t.class}</td></tr>`,
    t.trainNo && `<tr><td class="k">TRAIN NO.</td><td class="v">${t.trainNo}</td></tr>`,
    t.gate    && `<tr><td class="k">GATE / TERMINAL</td><td class="v">${t.gate} / T${t.terminal || '1'}</td></tr>`,
    t.flightNo && `<tr><td class="k">FLIGHT</td><td class="v">${t.flightNo}</td></tr>`,
    t.movie   && `<tr><td class="k">MOVIE</td><td class="v">${t.movie}</td></tr>`,
    t.cinema  && `<tr><td class="k">CINEMA</td><td class="v">${t.cinema}</td></tr>`,
    t.screen  && `<tr><td class="k">SCREEN</td><td class="v">${t.screen}</td></tr>`,
    t.showtime && `<tr><td class="k">SHOW TIME</td><td class="v">${t.showtime}</td></tr>`,
  ].filter(Boolean).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=400, initial-scale=1"/>
<title>Roamio Ticket</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: -apple-system, 'Helvetica Neue', Arial, sans-serif;
    background: #F0F4F8;
    padding: 20px;
    min-height: 100vh;
  }
  .card {
    background: #fff;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 10px 50px rgba(0,0,0,0.15);
    max-width: 400px;
    margin: 0 auto;
  }

  /* Header strip */
  .strip {
    background: ${accent};
    padding: 22px 26px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .strip-left { display: flex; flex-direction: column; }
  .strip-app { color: rgba(255,255,255,0.75); font-size: 9px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 4px; }
  .strip-label { color: #fff; font-size: 20px; font-weight: 900; letter-spacing: 1.5px; }
  .strip-check { width: 36px; height: 36px; background: rgba(255,255,255,0.25); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px; color: #fff; }

  /* Ref box */
  .refbox {
    margin: 20px 24px;
    padding: 18px;
    background: ${accent}12;
    border: 1.5px solid ${accent}35;
    border-radius: 16px;
    text-align: center;
  }
  .ref-label { color: #888; font-size: 8px; font-weight: 800; letter-spacing: 2.5px; text-transform: uppercase; margin-bottom: 8px; }
  .ref-val   { color: ${accent}; font-size: 30px; font-weight: 900; letter-spacing: 5px; font-variant-numeric: tabular-nums; }

  /* Route block */
  .route {
    margin: 0 24px 16px;
    padding: 16px 20px;
    background: ${accent}08;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .stn       { font-size: 24px; font-weight: 900; color: #111; }
  .stn-label { font-size: 10px; color: #888; margin-top: 4px; }
  .arrow-box { font-size: 18px; color: ${accent}; font-weight: 900; }

  /* Info table */
  .body { padding: 0 24px 8px; }
  table { width: 100%; border-collapse: collapse; }
  .k {
    color: #999;
    font-size: 8px;
    font-weight: 800;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    padding: 10px 0 3px;
    width: 44%;
    vertical-align: top;
  }
  .v {
    color: #111;
    font-size: 13px;
    font-weight: 800;
    padding: 6px 0 6px;
    border-bottom: 1px solid #F5F5F5;
    vertical-align: bottom;
  }

  /* Divider tear line */
  .tear {
    margin: 18px 0;
    border: none;
    border-top: 2px dashed ${accent}25;
    position: relative;
  }

  /* QR placeholder */
  .qr-section {
    margin: 0 24px 20px;
    padding: 22px;
    background: #FAFAFA;
    border: 1.5px solid #EBEBEB;
    border-radius: 16px;
    text-align: center;
  }
  .qr-grid {
    width: 110px;
    height: 110px;
    background: repeating-conic-gradient(#2D2D2D 0% 25%, #FFFFFF 0% 50%) 0 0 / 9px 9px;
    margin: 0 auto 12px;
    border-radius: 6px;
  }
  .qr-label { color: #888; font-size: 10px; font-weight: 700; }

  /* Footer */
  .footer {
    background: ${accent};
    padding: 16px 26px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .footer-note  { color: rgba(255,255,255,0.8); font-size: 9px; line-height: 1.6; }
  .footer-price { color: #fff; font-size: 22px; font-weight: 900; }
</style>
</head>
<body>
<div class="card">

  <div class="strip">
    <div class="strip-left">
      <span class="strip-app">ROAMIO TRAVEL</span>
      <span class="strip-label">${label}</span>
    </div>
    <div class="strip-check">&#10003;</div>
  </div>

  <div class="refbox">
    <div class="ref-label">Booking Reference</div>
    <div class="ref-val">${t.ref}</div>
  </div>

  <div class="route">
    <div>
      <div class="stn">${t.dep || t.showtime || '--'}</div>
      <div class="stn-label">${t.from || t.cinema || '--'}</div>
    </div>
    <div class="arrow-box">&#8594;</div>
    <div style="text-align:right">
      <div class="stn">${t.arr || ''}</div>
      <div class="stn-label">${t.to || ''}</div>
    </div>
  </div>

  <div class="body">
    <table>
      <tr><td class="k">PASSENGER</td><td class="v">${t.passenger}</td></tr>
      <tr><td class="k">DATE</td><td class="v">${t.date || '--'}</td></tr>
      <tr><td class="k">OPERATOR</td><td class="v">${t.operator}</td></tr>
      <tr><td class="k">SEAT</td><td class="v">${seat}</td></tr>
      ${extraRows}
    </table>
    <hr class="tear"/>
  </div>

  <div class="qr-section">
    <div class="qr-grid"></div>
    <div class="qr-label">Show QR at boarding / entry gate</div>
  </div>

  <div class="footer">
    <span class="footer-note">Valid on travel date only<br/>Issued via Roamio</span>
    <span class="footer-price">&#8377;${t.price.toLocaleString('en-IN')}</span>
  </div>

</div>
</body>
</html>`;
}

export async function downloadTicketPDF(ticket: TicketData): Promise<void> {
  try {
    // Step 1: Generate PDF from HTML using expo-print
    const { uri } = await Print.printToFileAsync({
      html: buildHTML(ticket),
      base64: false,
      width: 400,
      height: 700,
    });

    // Step 2: Share the PDF — uses native share sheet (save to Files, Drive, WhatsApp, etc.)
    const sharingAvailable = await Sharing.isAvailableAsync();

    if (sharingAvailable) {
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: `Roamio ${ticket.type} Ticket — ${ticket.ref}`,
        UTI: 'com.adobe.pdf',
      });
    } else {
      Alert.alert(
        'Ticket Generated',
        `Your ${ticket.type} ticket (Ref: ${ticket.ref}) has been generated.\n\nFile location:\n${uri}`,
        [{ text: 'OK' }]
      );
    }
  } catch (err: any) {
    console.error('[ticketPDF] Error:', err);
    Alert.alert(
      'Download Failed',
      err?.message ?? 'Could not generate PDF ticket. Please try again.',
      [{ text: 'OK' }]
    );
  }
}
