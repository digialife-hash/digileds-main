import defaultCompanyLogo from "../assets/dino_inspired_glossy_da_logo.png";

/* =========================================================
   FORMATTERS
========================================================= */

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const formatNumber = (value) =>
  new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

const formatDate = (value) => {
  if (!value) return "Not set";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not set";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

const formatTime = (value) => {
  if (!value) return "Not set";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not set";
  }

  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const formatDateTime = (value) => {
  if (!value) return "Not set";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not set";
  }

  return `${formatDate(value)} ${formatTime(value)}`;
};

const formatLabel = (value = "") =>
  String(value)
    .replaceAll("_", " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());

/* =========================================================
   SAFE HELPERS
========================================================= */

const toNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const getClientName = (client) => {
  if (!client) return "Client";

  if (typeof client === "string") {
    return client;
  }

  return client.companyName || client.clientName || "Client";
};

const getProjectName = (project) => {
  if (!project) return "Project";

  if (typeof project === "string") {
    return project;
  }

  return project.projectName || project.name || "Project";
};

const escapeHtml = (value = "") =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

/* =========================================================
   INDIAN NUMBER TO WORDS
========================================================= */

const numberToWordsSimple = (value) => {
  const amount = Math.round(toNumber(value));

  if (amount === 0) {
    return "Zero Only";
  }

  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];

  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  const belowHundred = (number) => {
    if (number < 20) {
      return ones[number];
    }

    return `${tens[Math.floor(number / 10)]} ${
      ones[number % 10]
    }`.trim();
  };

  const belowThousand = (number) => {
    if (number < 100) {
      return belowHundred(number);
    }

    return `${ones[Math.floor(number / 100)]} Hundred ${belowHundred(
      number % 100,
    )}`.trim();
  };

  let remaining = amount;
  let words = "";

  const crore = Math.floor(remaining / 10000000);

  if (crore > 0) {
    words += `${belowThousand(crore)} Crore `;
    remaining %= 10000000;
  }

  const lakh = Math.floor(remaining / 100000);

  if (lakh > 0) {
    words += `${belowThousand(lakh)} Lakh `;
    remaining %= 100000;
  }

  const thousand = Math.floor(remaining / 1000);

  if (thousand > 0) {
    words += `${belowThousand(thousand)} Thousand `;
    remaining %= 1000;
  }

  if (remaining > 0) {
    words += belowThousand(remaining);
  }

  return `${words.trim()} Only`;
};

/* =========================================================
   BANK HELPERS
========================================================= */

const getBankLine = (
  label,
  value,
  placeholder = "Not provided",
) => `
  <div class="bank-line">
    <span class="bank-label">${escapeHtml(label)}</span>
    <strong>${escapeHtml(value || placeholder)}</strong>
  </div>
`;

/* =========================================================
   COMPANY LINE
========================================================= */

const getCompanyLine = (value, className = "") =>
  value
    ? `<p class="${escapeHtml(className)}">${escapeHtml(value)}</p>`
    : "";

/* =========================================================
   ADDRESS FORMATTER
========================================================= */

const buildAddress = (...values) =>
  values
    .filter(Boolean)
    .map((value) => String(value).trim())
    .filter(Boolean)
    .join(", ");

/* =========================================================
   PAYMENT HELPERS
========================================================= */

const getAdvancePaymentsList = (invoice) => {
  if (!invoice) {
    return [];
  }

  if (Array.isArray(invoice.advancePayments)) {
    return invoice.advancePayments
      .map((payment, index) => ({
        id:
          payment?.id ||
          payment?._id ||
          index,

        amount: Math.max(
          0,
          toNumber(payment?.amount),
        ),

        mode:
          payment?.mode ||
          payment?.paymentMode ||
          "offline",

        receivedBy:
          payment?.receivedBy ||
          payment?.receivedByName ||
          payment?.receivedByUser ||
          "",

        recordedAt:
          payment?.recordedAt ||
          payment?.createdAt ||
          payment?.date ||
          payment?.paymentDate ||
          null,
      }))
      .filter(
        (payment) => payment.amount > 0,
      );
  }

  const legacyAmount = Math.max(
    0,
    toNumber(invoice.advancePayment),
  );

  if (legacyAmount > 0) {
    return [
      {
        id: "legacy-advance-payment",

        amount: legacyAmount,

        mode:
          invoice.advancePaymentMode ||
          invoice.paymentMode ||
          "offline",

        receivedBy:
          invoice.advancePaymentReceivedBy ||
          invoice.receivedBy ||
          "",

        recordedAt:
          invoice.advancePaymentRecordedAt ||
          invoice.advancePaymentDate ||
          invoice.paidDate ||
          invoice.updatedAt ||
          invoice.createdAt ||
          null,
      },
    ];
  }

  return [];
};

const getTotalAdvancePaid = (invoice) => {
  const payments = getAdvancePaymentsList(invoice);

  const calculatedTotal = payments.reduce(
    (total, payment) =>
      total +
      Math.max(
        0,
        toNumber(payment.amount),
      ),
    0,
  );

  if (calculatedTotal > 0) {
    return calculatedTotal;
  }

  if (
    invoice?.totalAdvancePaid !== undefined &&
    invoice?.totalAdvancePaid !== null
  ) {
    return Math.max(
      0,
      toNumber(invoice.totalAdvancePaid),
    );
  }

  return 0;
};

const normalizePaymentMode = (mode) => {
  if (!mode) return "Offline";

  return formatLabel(mode);
};

/* =========================================================
   ACTUAL PAYMENT STATUS
   OVERDUE REMOVED
========================================================= */

const getActualPaymentStatus = (
  invoice,
  grandTotal,
  advancePaid,
) => {
  const total = Math.max(
    0,
    toNumber(grandTotal),
  );

  const received = Math.min(
    total,
    Math.max(
      0,
      toNumber(advancePaid),
    ),
  );

  const balance = Math.max(
    0,
    total - received,
  );

  if (total <= 0) {
    return "Pending";
  }

  if (balance <= 0.01) {
    return "Paid";
  }

  if (received > 0) {
    return "Partially Paid";
  }

  return "Pending";
};

const getPaymentStatusClass = (status) => {
  const normalized = String(status || "")
    .toLowerCase()
    .replaceAll("_", "-");

  if (
    normalized === "paid" ||
    normalized === "completed" ||
    normalized === "success"
  ) {
    return "status-paid";
  }

  if (
    normalized === "partial" ||
    normalized === "partially-paid" ||
    normalized === "partially paid"
  ) {
    return "status-partial";
  }

  return "status-pending";
};

/* =========================================================
   ITEM NORMALIZATION
========================================================= */

const normalizeItem = (
  item = {},
  index = 0,
) => {
  const description =
    item.description ||
    item.serviceName ||
    item.name ||
    `Service ${index + 1}`;

  const quantity = Math.max(
    0,
    toNumber(
      item.quantity ??
        item.qty ??
        1,
    ),
  );

  const rate = Math.max(
    0,
    toNumber(
      item.rate ??
        item.unitPrice ??
        item.price ??
        item.amount,
    ),
  );

  const amount =
    item.amount !== undefined &&
    item.amount !== null
      ? Math.max(
          0,
          toNumber(item.amount),
        )
      : quantity * rate;

  return {
    description,
    quantity: quantity || 1,
    rate,
    amount,
  };
};

/* =========================================================
   WHATSAPP MESSAGE
========================================================= */

const buildWhatsAppMessage = ({
  companyName,
  invoiceNumber,
  clientName,
  projectName,
  invoiceDate,
  grandTotal,
  advancePaid,
  balanceAmount,
  paymentStatus,
  isTaxExempt,
}) => {
  const taxText = isTaxExempt
    ? "Tax: Exempt"
    : "";

  return [
    `Hello,`,
    ``,
    `Invoice from ${companyName}`,
    ``,
    `Invoice No: ${invoiceNumber}`,
    `Invoice Date: ${invoiceDate}`,
    `Client: ${clientName}`,
    `Project: ${projectName}`,
    ``,
    `Invoice Total: ${formatCurrency(grandTotal)}`,
    `Advance Received: ${formatCurrency(advancePaid)}`,
    `Balance Amount: ${formatCurrency(balanceAmount)}`,
    `Payment Status: ${paymentStatus}`,
    taxText,
    ``,
    `Thank you.`,
    ``,
    `WhatsApp: +91 98180 74558`,
  ]
    .filter((line) => line !== "")
    .join("\n");
};

/* =========================================================
   MAIN FUNCTION
========================================================= */

export const openInvoicePrintView = (
  invoice,
  mode = "print",
  bankDetails = {},
  companyDetails = {},
) => {
  if (!invoice) return;

  const printWindow = window.open(
    "",
    "_blank",
    "width=1000,height=1200,scrollbars=yes,resizable=yes",
  );

  if (!printWindow) {
    window.alert(
      "Unable to open invoice preview. Please allow pop-ups for this website.",
    );
    return;
  }

  /* =======================================================
     BASIC DATA
  ======================================================= */

  const bank = bankDetails || {};
  const company = companyDetails || {};

  const rawItems = Array.isArray(
    invoice.items,
  )
    ? invoice.items
    : [];

  const normalizedItems =
    rawItems.map(normalizeItem);

  const isTaxExempt =
    invoice.taxExempt === true ||
    invoice.taxExempt === "true";

  const taxRate = isTaxExempt
    ? 0
    : Math.max(
        0,
        toNumber(invoice.tax),
      );

  const invoiceAmount = toNumber(
    invoice.amount,
  );

  const itemsSubtotal =
    normalizedItems.reduce(
      (sum, item) =>
        sum + item.amount,
      0,
    );

  const subtotal =
    normalizedItems.length > 0
      ? itemsSubtotal
      : invoiceAmount ||
        toNumber(
          invoice.totalAmount,
        );

  const calculatedTax =
    isTaxExempt
      ? 0
      : (subtotal * taxRate) / 100;

  const calculatedGrandTotal =
    subtotal + calculatedTax;

  const grandTotal =
    invoice.totalAmount !==
      undefined &&
    invoice.totalAmount !== null
      ? Math.max(
          0,
          toNumber(
            invoice.totalAmount,
          ),
        )
      : calculatedGrandTotal;

  /* =======================================================
     ADVANCE PAYMENTS
  ======================================================= */

  const advancePayments =
    getAdvancePaymentsList(
      invoice,
    );

  const advancePaid = Math.min(
    grandTotal,
    Math.max(
      0,
      getTotalAdvancePaid(invoice),
    ),
  );

  const balanceAmount =
    Math.max(
      0,
      grandTotal - advancePaid,
    );

  /* =======================================================
     ACTUAL PAYMENT STATUS
  ======================================================= */

  const paymentStatus =
    getActualPaymentStatus(
      invoice,
      grandTotal,
      advancePaid,
    );

  const paymentStatusClass =
    getPaymentStatusClass(
      paymentStatus,
    );

  const invoiceTitle =
    isTaxExempt
      ? "INVOICE"
      : "TAX INVOICE";

  const actionLabel =
    mode === "pdf"
      ? "Save as PDF"
      : "Print Invoice";

  /* =======================================================
     COMPANY
  ======================================================= */

  const companyName =
    company.companyName ||
    company.name ||
    "Office Management";

  const logoUrl =
    company.companyLogo ||
    company.logo ||
    defaultCompanyLogo;

  const clientName =
    getClientName(
      invoice.clientId,
    );

  const projectName =
    getProjectName(
      invoice.projectId,
    );

  const invoiceNumber =
    invoice.invoiceNumber ||
    "INV-DRAFT";

  /* =======================================================
     CLIENT SNAPSHOT
  ======================================================= */

  const clientSnapshot =
    invoice.clientSnapshot ||
    {};

  const clientObject =
    invoice.clientId &&
    typeof invoice.clientId ===
      "object"
      ? invoice.clientId
      : {};

  const printClientName =
    clientSnapshot.clientName ||
    clientObject.clientName ||
    clientName;

  const printCompanyName =
    clientSnapshot.companyName ||
    clientObject.companyName ||
    clientName;

  const printPhone =
    clientSnapshot.phone ||
    clientObject.phone ||
    "";

  const printEmail =
    clientSnapshot.email ||
    clientObject.email ||
    "";

  const printAddress =
    clientSnapshot.address ||
    clientObject.address ||
    "";

  const printCity =
    clientSnapshot.city ||
    clientObject.city ||
    "";

  const printState =
    clientSnapshot.state ||
    clientObject.state ||
    "";

  const printPincode =
    clientSnapshot.pincode ||
    clientObject.pincode ||
    "";

  /* =======================================================
     CLIENT GSTIN
     ONLY CLIENT GST IS USED FOR TOP-RIGHT DISPLAY
  ======================================================= */

  const rawPrintGst =
    clientSnapshot.gstNumber ||
    clientSnapshot.gstin ||
    clientSnapshot.GSTIN ||
    clientSnapshot.GSTNumber ||
    clientSnapshot.gstIn ||
    clientObject.gstNumber ||
    clientObject.gstin ||
    clientObject.GSTIN ||
    clientObject.GSTNumber ||
    clientObject.gstIn ||
    invoice.gstNumber ||
    invoice.gstin ||
    invoice.GSTIN ||
    invoice.GSTNumber ||
    "";

  const printGst =
    String(
      rawPrintGst || "",
    ).trim();

  /*
   * GSTIN is shown ONLY when the current
   * client/invoice actually contains GSTIN.
   */
  const showClientGst =
    Boolean(printGst);

  const fullClientAddress =
    buildAddress(
      printAddress,
      printCity,
      printState,
      printPincode,
    );

  /* =======================================================
     DATE / TIME
  ======================================================= */

  const invoiceDate =
    invoice.invoiceDate ||
    formatDate(
      invoice.createdAt,
    );

  const invoiceTime =
    invoice.invoiceTime ||
    formatTime(
      invoice.createdAt,
    );

  /* =======================================================
     COMPANY DATA
  ======================================================= */

  const companyAddress =
    company.companyAddress ||
    company.address ||
    "";

  const companyEmail =
    company.companyEmail ||
    company.email ||
    "";

  const companyPhone =
    company.companyPhone ||
    company.phone ||
    "";

  const companyWhatsapp =
    company.whatsapp ||
    company.whatsappNumber ||
    "+91 98180 74558";

  const companyWebsite =
    "https://digitalalife.in";

  /*
   * Company GST is intentionally NOT used
   * for the top-right GST display.
   */
  const companyGst = "";

  const showCompanyGst = false;

  const companyCity =
    company.city || "";

  const companyState =
    company.state || "";

  const companyPincode =
    company.pincode || "";

  const companyFullAddress =
    "Add : Singhal Tower, Labour chowk, Sector 58, Noida, Uttar Pradesh 201309";

  /* =======================================================
     WHATSAPP MESSAGE
  ======================================================= */

  const whatsappMessage =
    buildWhatsAppMessage({
      companyName,
      invoiceNumber,
      clientName:
        printClientName ||
        printCompanyName ||
        clientName,
      projectName,
      invoiceDate,
      grandTotal,
      advancePaid,
      balanceAmount,
      paymentStatus,
      isTaxExempt,
    });

  const whatsappShareUrl =
    `https://wa.me/?text=${encodeURIComponent(
      whatsappMessage,
    )}`;

  /* =======================================================
     DISPLAY ITEMS
  ======================================================= */

  const displayItems =
    normalizedItems.length
      ? normalizedItems
      : [
          {
            description:
              projectName,
            quantity: 1,
            rate: subtotal,
            amount: subtotal,
          },
        ];

  const minimumRows = 6;

  const emptyRows = Math.max(
    0,
    minimumRows -
      displayItems.length,
  );

  /* =======================================================
     LOGO
  ======================================================= */

  const logoMarkup = `
    <img
      src="${escapeHtml(logoUrl)}"
      alt="${escapeHtml(companyName)} logo"
      onerror="this.style.display='none';"
    />
  `;

  /* =======================================================
     TERMS
  ======================================================= */

  const terms = Array.isArray(
    invoice.termsAndConditions,
  )
    ? invoice.termsAndConditions
    : [
        "This invoice is generated for the selected project/services.",
        "Payment status is maintained by the office management system.",
        "All amounts are in Indian Rupees (INR).",
        "Subject to mutually agreed service terms and conditions.",
      ];

  /* =======================================================
     NOTES
  ======================================================= */

  const notes =
    invoice.notes ||
    invoice.remarks ||
    "";

  /* =======================================================
     ADVANCE PAYMENT HTML
  ======================================================= */

  const advancePaymentsMarkup =
    advancePayments.length > 0
      ? advancePayments
          .map(
            (
              payment,
              index,
            ) => `
              <tr>

                <td class="center">
                  ${index + 1}
                </td>

                <td>
                  <strong>
                    ${escapeHtml(
                      formatDateTime(
                        payment.recordedAt,
                      ),
                    )}
                  </strong>
                </td>

                <td class="center">
                  ${escapeHtml(
                    normalizePaymentMode(
                      payment.mode,
                    ),
                  )}
                </td>

                <td>
                  ${escapeHtml(
                    payment.receivedBy ||
                      "Not specified",
                  )}
                </td>

                <td class="right">
                  <strong>
                    ${escapeHtml(
                      formatCurrency(
                        payment.amount,
                      ),
                    )}
                  </strong>
                </td>

              </tr>
            `,
          )
          .join("")
      : `
          <tr>
            <td
              colspan="5"
              class="no-payment-row"
            >
              No advance payment has been recorded.
            </td>
          </tr>
        `;

  /* =======================================================
     DOCUMENT HTML
  ======================================================= */

  printWindow.document.write(`
    <!doctype html>

    <html lang="en">

      <head>

        <meta charset="UTF-8" />

        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0"
        />

        <title>
          ${escapeHtml(
            invoiceNumber,
          )} - ${escapeHtml(
            companyName,
          )}
        </title>

        <style>

          * {
            box-sizing: border-box;
          }

          html,
          body {
            margin: 0;
            padding: 0;
          }

          body {
            background: #eef2f7;
            color: #111827;
            font-family:
              Inter,
              ui-sans-serif,
              -apple-system,
              BlinkMacSystemFont,
              "Segoe UI",
              Arial,
              sans-serif;
            font-size: 12px;
            line-height: 1.45;
          }

          h1,
          h2,
          h3,
          h4,
          p {
            margin: 0;
          }

          table {
            border-collapse: collapse;
            border-spacing: 0;
            width: 100%;
          }

          /* =================================================
             TOOLBAR
          ================================================= */

          .toolbar {
            display: flex;
            justify-content: center;
            align-items: center;
            flex-wrap: wrap;
            gap: 10px;
            max-width: 210mm;
            margin: 22px auto 12px;
          }

          .toolbar button {
            appearance: none;
            border: 0;
            border-radius: 10px;
            color: #ffffff;
            cursor: pointer;
            font-size: 13px;
            font-weight: 800;
            padding: 11px 18px;
            transition: 0.2s ease;
          }

          .print-btn {
            background: #111827;
          }

          .print-btn:hover {
            background: #2563eb;
            transform: translateY(-1px);
          }

          .whatsapp-btn {
            background: #25d366;
          }

          .whatsapp-btn:hover {
            background: #16a34a;
            transform: translateY(-1px);
          }

          .close-btn {
            background: #475569;
          }

          .close-btn:hover {
            background: #334155;
            transform: translateY(-1px);
          }

          .whatsapp-icon {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin-right: 6px;
            font-size: 15px;
          }

          /* =================================================
             PAGE
          ================================================= */

          .page {
            position: relative;
            width: 210mm;
            min-height: 297mm;
            margin: 0 auto 30px;
            background: #ffffff;
            box-shadow: 0 20px 60px rgba(15, 23, 42, 0.16);
            overflow: visible;
          }

          /* =================================================
             BACKGROUND WATERMARK
          ================================================= */

          .invoice-watermark {
            position: absolute;
            left: 50%;
            top: 50%;
            width: 115mm;
            height: 115mm;
            transform: translate(-50%, -50%);
            display: flex;
            align-items: center;
            justify-content: center;
            pointer-events: none;
            z-index: 0;
          }

          .invoice-watermark img {
            display: block;
            width: 100%;
            height: 100%;
            object-fit: contain;
            opacity: 0.055;
          }

          .page-inner {
            position: relative;
            z-index: 1;
            padding: 12mm;
            overflow: visible;
          }

          /* =================================================
             TOP ACCENT
          ================================================= */

          .top-accent {
            height: 5px;
            width: 100%;
            background:
              linear-gradient(
                90deg,
                #111827 0%,
                #2563eb 50%,
                #0f766e 100%
              );
          }

          /* =================================================
             COMPANY HEADER
          ================================================= */

          .company-header {
            display: grid;
            grid-template-columns: 30mm 1fr auto;
            align-items: stretch;
            min-height: 34mm;
            border: 1px solid #cbd5e1;
            border-top: 0;
            background: #ffffff;
          }

          .logo-box {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 34mm;
            padding: 5mm;
          }

          .logo-box img {
            display: block;
            width: 140px;
            height: 140px;
            margin-top: -30px;
            object-fit: contain;
          }

          .company-info {
            min-width: 0;
            padding: 4mm 5mm;
            text-align: center;
          }

          .company-name {
            color: black;
            font-size: 40px;
            font-weight: 900;
            letter-spacing: 0.02em;
            line-height: 1.15;
            text-transform: uppercase;
            text-align: center;
          }

          .company-address {
            margin-top: 4px;
            color: black;
            font-size: 16px;
            line-height: 1.45;
            font-weight: 600;
          }

          .company-contact {
            margin-top: 3px;
            color: black;
            font-size: 16px;
            font-weight: 600;
          }

          .company-meta {
            margin-top: 3px;
            color: black;
            font-size: 16px;
            font-weight: 600;
          }

          /* =================================================
             DOCUMENT TITLE
          ================================================= */

          .document-title {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 15px;
            margin-top: 4mm;
            padding: 3.5mm 4mm;
            border: 1px solid #cbd5e1;
            background: #f8fafc;
          }

          .document-title h1 {
            color: #0f172a;
            font-size: 18px;
            font-weight: 950;
            letter-spacing: 0.08em;
          }

          .document-title-subtitle {
            color: black;
            font-size: 9px;
            font-weight: 700;
            text-align: right;
            text-transform: uppercase;
          }

          /* =================================================
             CLIENT GSTIN
          ================================================= */

          .document-gstin {
            margin-top: 4px;
            color: #111827;
            font-size: 10px;
            font-weight: 900;
            letter-spacing: 0.025em;
            text-align: right;
            white-space: nowrap;
          }

          .document-gstin-label {
            font-weight: 900;
          }

          /* =================================================
             STATUS
          ================================================= */

          .status {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border-radius: 999px;
            font-size: 8.5px;
            font-weight: 900;
            letter-spacing: 0.04em;
            padding: 4px 9px;
            text-transform: uppercase;
            white-space: nowrap;
          }

          .status-paid {
            background: #dcfce7;
            color: #166534;
          }

          .status-partial {
            background: #fef3c7;
            color: #92400e;
          }

          .status-pending {
            background: #e0e7ff;
            color: #3730a3;
          }

          /* =================================================
             META GRID
          ================================================= */

          .meta-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            margin-top: 4mm;
            border: 1px solid #cbd5e1;
          }

          .meta-box {
            min-height: 28mm;
            padding: 3.5mm 4mm;
          }

          .meta-box + .meta-box {
            border-left: 1px solid #cbd5e1;
          }

          .section-heading {
            margin-bottom: 2.5mm;
            color: #0f172a;
            font-size: 9px;
            font-weight: 900;
            letter-spacing: 0.05em;
            text-transform: uppercase;
          }

          .info-line {
            display: grid;
            grid-template-columns: 34mm 1fr;
            gap: 4px;
            min-height: 17px;
            font-size: 9.5px;
          }

          .info-line-label {
            color: black;
          }

          .info-line-value {
            color: #111827;
            font-weight: 800;
            overflow-wrap: anywhere;
          }

          /* =================================================
             PARTY DETAILS
          ================================================= */

          .party-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            margin-top: 4mm;
            border: 1px solid #cbd5e1;
          }

          .party-box {
            min-height: 39mm;
            padding: 0;
          }

          .party-box + .party-box {
            border-left: 1px solid #cbd5e1;
          }

          .party-title {
            padding: 2.5mm 4mm;
            border-bottom: 1px solid #cbd5e1;
            background: #f8fafc;
            color: #0f172a;
            font-size: 9px;
            font-weight: 900;
            letter-spacing: 0.04em;
            text-transform: uppercase;
          }

          .party-content {
            padding: 3mm 4mm;
          }

          .party-line {
            display: grid;
            grid-template-columns: 31mm 1fr;
            gap: 4px;
            min-height: 17px;
            font-size: 9px;
          }

          .party-label {
            color: black;
          }

          .party-value {
            color: #111827;
            font-weight: 750;
            overflow-wrap: anywhere;
          }

          /* =================================================
             ITEMS TABLE
          ================================================= */

          .items-section {
            margin-top: 4mm;
          }

          .items-table {
            table-layout: fixed;
            border: 1px solid #94a3b8;
          }

          .items-table th {
            padding: 2.6mm 2mm;
            border-right: 1px solid #94a3b8;
            border-bottom: 1px solid #94a3b8;
            background: #0f172a;
            color: #ffffff;
            font-size: 8.5px;
            font-weight: 900;
            letter-spacing: 0.035em;
            text-align: center;
            text-transform: uppercase;
          }

          .items-table td {
            height: 10mm;
            padding: 2.2mm 2.5mm;
            border-right: 1px solid #cbd5e1;
            border-bottom: 1px solid #cbd5e1;
            color: #111827;
            font-size: 9px;
            vertical-align: middle;
          }

          .items-table th:last-child,
          .items-table td:last-child {
            border-right: 0;
          }

          .items-table tbody tr:last-child td {
            border-bottom: 0;
          }

          .items-table .sl-col {
            width: 10mm;
          }

          .items-table .description-col {
            width: auto;
          }

          .items-table .qty-col {
            width: 16mm;
          }

          .items-table .rate-col {
            width: 29mm;
          }

          .items-table .tax-col {
            width: 19mm;
          }

          .items-table .amount-col {
            width: 31mm;
          }

          .item-description {
            font-weight: 750;
            overflow-wrap: anywhere;
          }

          .center {
            text-align: center !important;
          }

          .right {
            text-align: right !important;
          }

          .empty-row td {
            color: transparent;
          }

          /* =================================================
             TOTALS
          ================================================= */

          .totals-wrap {
            display: grid;
            grid-template-columns: 1fr 75mm;
            border: 1px solid #94a3b8;
            border-top: 0;
          }

          .totals-left {
            min-height: 42mm;
            padding: 3.5mm;
            border-right: 1px solid #cbd5e1;
          }

          .totals-right {
            padding: 0;
          }

          .amount-words-label {
            color: black;
            font-size: 8px;
            font-weight: 900;
            letter-spacing: 0.05em;
            text-transform: uppercase;
          }

          .amount-words {
            margin-top: 2px;
            color: #111827;
            font-size: 10px;
            font-weight: 850;
            line-height: 1.5;
          }

          .amount-words-note {
            margin-top: 8px;
            color: black;
            font-size: 8px;
          }

          .total-line {
            display: grid;
            grid-template-columns: 1fr auto;
            gap: 10px;
            min-height: 9mm;
            align-items: center;
            padding: 2mm 3.5mm;
            border-bottom: 1px solid #e2e8f0;
            font-size: 9px;
          }

          .total-line:last-child {
            border-bottom: 0;
          }

          .total-label {
            color: black;
            font-weight: 700;
          }

          .total-value {
            color: #111827;
            font-weight: 850;
            text-align: right;
            white-space: nowrap;
          }

          .grand-total-line {
            background: #0f172a;
          }

          .grand-total-line .total-label,
          .grand-total-line .total-value {
            color: #ffffff;
            font-size: 11px;
            font-weight: 950;
          }

          .balance-line {
            background: #f8fafc;
          }

          .balance-line .total-label,
          .balance-line .total-value {
            color: #0f172a;
            font-weight: 950;
          }

          /* =================================================
             PAYMENT SUMMARY
          ================================================= */

          .payment-summary {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            margin-top: 4mm;
            border: 1px solid #cbd5e1;
          }

          .payment-summary-item {
            min-height: 20mm;
            padding: 3mm;
            text-align: center;
          }

          .payment-summary-item + .payment-summary-item {
            border-left: 1px solid #cbd5e1;
          }

          .payment-summary-label {
            color: black;
            font-size: 8px;
            font-weight: 900;
            letter-spacing: 0.04em;
            text-transform: uppercase;
          }

          .payment-summary-value {
            margin-top: 3px;
            color: #0f172a;
            font-size: 12px;
            font-weight: 950;
          }

          /* =================================================
             ADVANCE PAYMENT DETAILS
          ================================================= */

          .advance-section {
            margin-top: 4mm;
            border: 1px solid #cbd5e1;
          }

          .advance-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
            padding: 2.5mm 4mm;
            border-bottom: 1px solid #cbd5e1;
            background: #f8fafc;
          }

          .advance-header-title {
            color: #0f172a;
            font-size: 9px;
            font-weight: 900;
            letter-spacing: 0.05em;
            text-transform: uppercase;
          }

          .advance-header-total {
            color: #0f172a;
            font-size: 10px;
            font-weight: 950;
          }

          .advance-table {
            width: 100%;
            table-layout: fixed;
          }

          .advance-table th {
            padding: 2.4mm 2.5mm;
            border-right: 1px solid #cbd5e1;
            border-bottom: 1px solid #cbd5e1;
            background: #f8fafc;
            color: black;
            font-size: 8px;
            font-weight: 900;
            text-align: center;
            text-transform: uppercase;
          }

          .advance-table td {
            padding: 2.5mm;
            border-right: 1px solid #e2e8f0;
            border-bottom: 1px solid #e2e8f0;
            color: #111827;
            font-size: 8.5px;
            vertical-align: middle;
          }

          .advance-table th:last-child,
          .advance-table td:last-child {
            border-right: 0;
          }

          .advance-table tbody tr:last-child td {
            border-bottom: 0;
          }

          .advance-table th:nth-child(1) {
            width: 11mm;
          }

          .advance-table th:nth-child(2) {
            width: 48mm;
          }

          .advance-table th:nth-child(3) {
            width: 32mm;
          }

          .advance-table th:nth-child(4) {
            width: auto;
          }

          .advance-table th:nth-child(5) {
            width: 35mm;
          }

          .no-payment-row {
            padding: 4mm !important;
            color: black !important;
            text-align: center;
          }

          /* =================================================
             BANK DETAILS
          ================================================= */

          .bank-section {
            margin-top: 4mm;
            border: 1px solid #cbd5e1;
          }

          .bank-header {
            padding: 2.5mm 4mm;
            border-bottom: 1px solid #cbd5e1;
            background: #f8fafc;
            color: #0f172a;
            font-size: 9px;
            font-weight: 900;
            letter-spacing: 0.05em;
            text-transform: uppercase;
          }

          .bank-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
          }

          .bank-column {
            padding: 3mm 4mm;
          }

          .bank-column + .bank-column {
            border-left: 1px solid #cbd5e1;
          }

          .bank-line {
            display: grid;
            grid-template-columns: 30mm 1fr;
            gap: 4px;
            min-height: 17px;
            font-size: 9px;
          }

          .bank-label {
            color: black;
          }

          .bank-line strong {
            color: #111827;
            overflow-wrap: anywhere;
          }

          /* =================================================
             NOTES + TERMS + SIGNATURE
          ================================================= */

          .bottom-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            margin-top: 4mm;
            border: 1px solid #cbd5e1;
          }

          .bottom-box {
            min-height: 42mm;
            padding: 3.5mm 4mm;
          }

          .bottom-box + .bottom-box {
            border-left: 1px solid #cbd5e1;
          }

          .bottom-heading {
            margin-bottom: 2.5mm;
            color: #0f172a;
            font-size: 9px;
            font-weight: 900;
            letter-spacing: 0.04em;
            text-transform: uppercase;
          }

          .notes-text {
            color: black;
            font-size: 8.5px;
            line-height: 1.55;
            white-space: pre-line;
            overflow-wrap: anywhere;
          }

          .terms-list {
            margin: 0;
            padding-left: 15px;
            color: black;
            font-size: 8px;
            line-height: 1.6;
          }

          .terms-list li {
            margin-bottom: 2px;
          }

          .signature-box {
            text-align: center;
          }

          .signature-company {
            color: #0f172a;
            font-size: 10px;
            font-weight: 900;
          }

          .signature-space {
            height: 19mm;
          }

          .signature-line {
            width: 55mm;
            margin: 0 auto 2px;
            border-top: 1px solid #0f172a;
          }

          .signature-label {
            color: black;
            font-size: 8px;
            font-weight: 850;
          }

          /* =================================================
             FOOTER
          ================================================= */

          .document-footer {
            margin-top: 4mm;
            padding-top: 3mm;
            border-top: 1px solid #cbd5e1;
            color: black;
            font-size: 7.5px;
            text-align: center;
          }

          .document-footer strong {
            color: black;
          }

          /* =================================================
             PRINT
          ================================================= */

          @page {
            size: A4 portrait;
            margin: 8mm;
          }

          @media print {

            html,
            body {
              width: 100%;
              height: auto !important;
              margin: 0 !important;
              padding: 0 !important;
              background: #ffffff !important;
              overflow: visible !important;
            }

            body {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }

            .toolbar {
              display: none !important;
            }

            .page {
              width: 100% !important;
              min-height: 0 !important;
              height: auto !important;
              margin: 0 !important;
              padding: 0 !important;
              border: 0 !important;
              box-shadow: none !important;
              overflow: visible !important;
              break-after: auto !important;
              page-break-after: auto !important;
            }

            .invoice-watermark {
              position: fixed !important;
              left: 50% !important;
              top: 50% !important;
              transform: translate(-50%, -50%) !important;
              z-index: 0 !important;
            }

            .page-inner {
              width: 100% !important;
              min-height: 0 !important;
              height: auto !important;
              padding: 0 !important;
              overflow: visible !important;
              position: relative !important;
              z-index: 1 !important;
            }

            .top-accent {
              break-after: avoid;
              page-break-after: avoid;
            }

            .company-header,
            .document-title,
            .meta-grid,
            .party-grid,
            .totals-wrap,
            .payment-summary,
            .bank-section,
            .bottom-grid,
            .document-footer {
              break-inside: avoid;
              page-break-inside: avoid;
            }

            .items-section {
              break-inside: auto;
              page-break-inside: auto;
            }

            .advance-section {
              break-inside: auto;
              page-break-inside: auto;
            }

            .items-table,
            .advance-table {
              width: 100%;
            }

            .items-table thead,
            .advance-table thead {
              display: table-header-group;
            }

            .items-table tfoot,
            .advance-table tfoot {
              display: table-footer-group;
            }

            .items-table tr,
            .advance-table tr {
              break-inside: avoid;
              page-break-inside: avoid;
            }

            .items-table td,
            .items-table th,
            .advance-table td,
            .advance-table th {
              break-inside: avoid;
            }

            img {
              max-width: 100%;
            }
          }

          /* =================================================
             MOBILE PREVIEW
          ================================================= */

          @media screen and (max-width: 850px) {

            body {
              background: #e2e8f0;
            }

            .toolbar {
              margin: 12px;
            }

            .toolbar button {
              flex: 1 1 auto;
              min-width: 135px;
            }

            .page {
              width: calc(100% - 20px);
              min-height: auto;
              margin: 0 10px 20px;
            }

            .page-inner {
              padding: 15px;
            }

            .invoice-watermark {
              width: 80mm;
              height: 80mm;
            }

            .company-header,
            .meta-grid,
            .party-grid,
            .payment-summary,
            .bank-grid,
            .bottom-grid,
            .totals-wrap {
              grid-template-columns: 1fr;
            }

            .logo-box {
              border-right: 0;
              border-bottom: 1px solid #cbd5e1;
            }

            .company-header {
              grid-template-columns: 1fr;
            }

            .original-copy {
              border-left: 0;
              border-top: 1px solid #cbd5e1;
            }

            .meta-box + .meta-box,
            .party-box + .party-box,
            .payment-summary-item + .payment-summary-item,
            .bank-column + .bank-column,
            .bottom-box + .bottom-box {
              border-left: 0;
              border-top: 1px solid #cbd5e1;
            }

            .totals-left {
              border-right: 0;
              border-bottom: 1px solid #cbd5e1;
            }

            .items-table {
              min-width: 680px;
            }

            .items-section,
            .advance-section {
              overflow-x: auto;
            }

            .advance-table {
              min-width: 650px;
            }

            .document-title {
              flex-direction: column;
              align-items: flex-start;
            }

            .document-title-subtitle {
              width: 100%;
              text-align: left;
            }

            .document-gstin {
              text-align: left;
            }

            .advance-header {
              min-width: 650px;
            }
          }

        </style>

      </head>

      <body>

        <div class="toolbar">

          <button
            type="button"
            class="print-btn"
            onclick="window.print()"
          >
            ${escapeHtml(
              actionLabel,
            )}
          </button>

          <button
            type="button"
            class="whatsapp-btn"
            onclick="shareInvoiceOnWhatsApp()"
          >
            <span class="whatsapp-icon">☘</span>
            Share on WhatsApp
          </button>

          <button
            type="button"
            class="close-btn"
            onclick="window.close()"
          >
            Close
          </button>

        </div>

        <main class="page">

          <!-- =================================================
               BACKGROUND WATERMARK
          ================================================= -->

          <div
            class="invoice-watermark"
            aria-hidden="true"
          >
            <img
              src="${escapeHtml(logoUrl)}"
              alt=""
              crossorigin="anonymous"
              onerror="this.style.display='none';"
            />
          </div>

          <div class="top-accent"></div>

          <div class="page-inner">

            <!-- ============================================
                 COMPANY HEADER
            ============================================= -->

            <section class="company-header">

              <div class="logo-box">
                ${logoMarkup}
              </div>

              <div class="company-info">

                <h1 class="company-name">
                  ${escapeHtml(
                    companyName,
                  )}
                </h1>

                ${
                  companyPhone ||
                  companyWhatsapp
                    ? getCompanyLine(
                        [
                          companyPhone &&
                            `Phone: ${companyPhone}`,

                          companyWhatsapp &&
                            `WhatsApp: ${companyWhatsapp}`,
                        ]
                          .filter(Boolean)
                          .join(" | "),
                        "company-contact",
                      )
                    : ""
                }

                ${
                  companyEmail ||
                  companyWebsite
                    ? getCompanyLine(
                        [
                          companyEmail &&
                            `Email: ${companyEmail}`,

                          companyWebsite &&
                            `Website: ${companyWebsite}`,
                        ]
                          .filter(Boolean)
                          .join(" | "),
                        "company-meta",
                      )
                    : ""
                }

                ${
                  companyFullAddress
                    ? getCompanyLine(
                        companyFullAddress,
                        "company-address",
                      )
                    : ""
                }

              </div>

            </section>

            <!-- ============================================
                 DOCUMENT TITLE
            ============================================= -->

            <section class="document-title">

              <h1>
                ${escapeHtml(
                  invoiceTitle,
                )}
              </h1>

              <div class="document-title-subtitle">

                <div>
                  Invoice No:
                  ${escapeHtml(
                    invoiceNumber,
                  )}
                </div>

                ${
                  showClientGst
                    ? `
                      <div class="document-gstin">
                        <span class="document-gstin-label">
                          GSTIN:
                        </span>
                        ${escapeHtml(
                          printGst,
                        )}
                      </div>
                    `
                    : ""
                }

                <div style="margin-top: 4px;">

                  <span
                    class="status ${paymentStatusClass}"
                  >
                    ${escapeHtml(
                      paymentStatus,
                    )}
                  </span>

                </div>

              </div>

            </section>

            <!-- ============================================
                 INVOICE META
            ============================================= -->

            <section class="meta-grid">

              <div class="meta-box">

                <div class="section-heading">
                  Invoice Information
                </div>

                <div class="info-line">
                  <span class="info-line-label">
                    Invoice No.
                  </span>

                  <strong class="info-line-value">
                    ${escapeHtml(
                      invoiceNumber,
                    )}
                  </strong>
                </div>

                <div class="info-line">
                  <span class="info-line-label">
                    Invoice Date
                  </span>

                  <strong class="info-line-value">
                    ${escapeHtml(
                      invoiceDate,
                    )}
                  </strong>
                </div>

                <div class="info-line">
                  <span class="info-line-label">
                    Invoice Time
                  </span>

                  <strong class="info-line-value">
                    ${escapeHtml(
                      invoiceTime,
                    )}
                  </strong>
                </div>

                <div class="info-line">
                  <span class="info-line-label">
                    Due Date
                  </span>

                  <strong class="info-line-value">
                    ${escapeHtml(
                      formatDate(
                        invoice.dueDate,
                      ),
                    )}
                  </strong>
                </div>

              </div>

              <div class="meta-box">

                <div class="section-heading">
                  Transaction Information
                </div>

                <div class="info-line">

                  <span class="info-line-label">
                    Project
                  </span>

                  <strong class="info-line-value">
                    ${escapeHtml(
                      projectName,
                    )}
                  </strong>

                </div>

                <div class="info-line">

                  <span class="info-line-label">
                    Payment Status
                  </span>

                  <strong class="info-line-value">
                    ${escapeHtml(
                      paymentStatus,
                    )}
                  </strong>

                </div>

                <div class="info-line">

                  <span class="info-line-label">
                    Reverse Charge
                  </span>

                  <strong class="info-line-value">
                    No
                  </strong>

                </div>

                <div class="info-line">

                  <span class="info-line-label">
                    Currency
                  </span>

                  <strong class="info-line-value">
                    INR (₹)
                  </strong>

                </div>

              </div>

            </section>

            <!-- ============================================
                 BILL TO
            ============================================= -->

            <section class="party-grid">

              <div class="party-box">

                <div class="party-title">
                  Details of Receiver / Billed To
                </div>

                <div class="party-content">

                  <div class="party-line">

                    <span class="party-label">
                      Company Name
                    </span>

                    <strong class="party-value">
                      ${escapeHtml(
                        printCompanyName,
                      )}
                    </strong>

                  </div>

                  <div class="party-line">

                    <span class="party-label">
                      Client Name
                    </span>

                    <strong class="party-value">
                      ${escapeHtml(
                        printClientName,
                      )}
                    </strong>

                  </div>

                  <div class="party-line">

                    <span class="party-label">
                      Phone
                    </span>

                    <strong class="party-value">
                      ${escapeHtml(
                        printPhone ||
                          "N/A",
                      )}
                    </strong>

                  </div>

                  <div class="party-line">

                    <span class="party-label">
                      Email
                    </span>

                    <strong class="party-value">
                      ${escapeHtml(
                        printEmail ||
                          "N/A",
                      )}
                    </strong>

                  </div>

                </div>

              </div>

              <div class="party-box">

                <div class="party-title">
                  Billing / Location Details
                </div>

                <div class="party-content">

                  <div class="party-line">

                    <span class="party-label">
                      Address
                    </span>

                    <strong class="party-value">
                      ${escapeHtml(
                        fullClientAddress ||
                          "N/A",
                      )}
                    </strong>

                  </div>

                  <div class="party-line">

                    <span class="party-label">
                      City
                    </span>

                    <strong class="party-value">
                      ${escapeHtml(
                        printCity ||
                          "N/A",
                      )}
                    </strong>

                  </div>

                  <div class="party-line">

                    <span class="party-label">
                      State
                    </span>

                    <strong class="party-value">
                      ${escapeHtml(
                        printState ||
                          "N/A",
                      )}
                    </strong>

                  </div>

                  <div class="party-line">

                    <span class="party-label">
                      Pincode
                    </span>

                    <strong class="party-value">
                      ${escapeHtml(
                        printPincode ||
                          "N/A",
                      )}
                    </strong>

                  </div>

                  <div class="party-line">

                    <span class="party-label">
                      Project
                    </span>

                    <strong class="party-value">
                      ${escapeHtml(
                        projectName,
                      )}
                    </strong>

                  </div>

                </div>

              </div>

            </section>

            <!-- ============================================
                 ITEMS
            ============================================= -->

            <section class="items-section">

              <table class="items-table">

                <thead>

                  <tr>

                    <th class="sl-col">
                      #
                    </th>

                    <th class="description-col">
                      Description of Services
                    </th>

                    <th class="qty-col">
                      Qty
                    </th>

                    <th class="rate-col">
                      Rate
                    </th>

                    ${
                      isTaxExempt
                        ? ""
                        : `
                          <th class="tax-col">
                            Tax
                          </th>
                        `
                    }

                    <th class="amount-col">
                      Amount
                    </th>

                  </tr>

                </thead>

                <tbody>

                  ${displayItems
                    .map(
                      (
                        item,
                        index,
                      ) => `
                        <tr>

                          <td class="center">
                            ${index + 1}
                          </td>

                          <td>

                            <div class="item-description">
                              ${escapeHtml(
                                item.description,
                              )}
                            </div>

                          </td>

                          <td class="center">
                            ${escapeHtml(
                              formatNumber(
                                item.quantity,
                              ),
                            )}
                          </td>

                          <td class="right">
                            ${escapeHtml(
                              formatCurrency(
                                item.rate,
                              ),
                            )}
                          </td>

                          ${
                            isTaxExempt
                              ? ""
                              : `
                                <td class="center">
                                  ${escapeHtml(
                                    taxRate,
                                  )}%
                                </td>
                              `
                          }

                          <td class="right">
                            ${escapeHtml(
                              formatCurrency(
                                item.amount,
                              ),
                            )}
                          </td>

                        </tr>
                      `,
                    )
                    .join("")}

                  ${Array.from({
                    length: emptyRows,
                  })
                    .map(
                      () => `
                        <tr class="empty-row">

                          <td>&nbsp;</td>
                          <td>&nbsp;</td>
                          <td>&nbsp;</td>
                          <td>&nbsp;</td>

                          ${
                            isTaxExempt
                              ? ""
                              : "<td>&nbsp;</td>"
                          }

                          <td>&nbsp;</td>

                        </tr>
                      `,
                    )
                    .join("")}

                  <tr>

                    <td></td>

                    <td
                      colspan="${
                        isTaxExempt
                          ? 3
                          : 4
                      }"
                      class="right"
                    >

                      <strong>
                        Subtotal
                      </strong>

                    </td>

                    <td class="right">

                      <strong>
                        ${escapeHtml(
                          formatCurrency(
                            subtotal,
                          ),
                        )}
                      </strong>

                    </td>

                  </tr>

                  ${
                    isTaxExempt
                      ? ""
                      : `
                        <tr>

                          <td></td>

                          <td
                            colspan="4"
                            class="right"
                          >

                            <strong>
                              Tax @
                              ${escapeHtml(
                                taxRate,
                              )}%
                            </strong>

                          </td>

                          <td class="right">

                            <strong>
                              ${escapeHtml(
                                formatCurrency(
                                  calculatedTax,
                                ),
                              )}
                            </strong>

                          </td>

                        </tr>
                      `
                  }

                </tbody>

              </table>

            </section>

            <!-- ============================================
                 TOTALS
            ============================================= -->

            <section class="totals-wrap">

              <div class="totals-left">

                <div class="amount-words-label">
                  Amount in Words
                </div>

                <div class="amount-words">

                  Rupees
                  ${escapeHtml(
                    numberToWordsSimple(
                      grandTotal,
                    ),
                  )}

                </div>

                <div class="amount-words-note">
                  E. &amp; O.E. — Errors and omissions
                  excepted.
                </div>

                ${
                  notes
                    ? `
                      <div
                        class="amount-words-label"
                        style="margin-top: 14px;"
                      >
                        Invoice Notes
                      </div>

                      <div
                        class="notes-text"
                        style="margin-top: 3px;"
                      >
                        ${escapeHtml(
                          notes,
                        )}
                      </div>
                    `
                    : ""
                }

              </div>

              <div class="totals-right">

                <div class="total-line">

                  <span class="total-label">
                    Subtotal
                  </span>

                  <strong class="total-value">
                    ${escapeHtml(
                      formatCurrency(
                        subtotal,
                      ),
                    )}
                  </strong>

                </div>

                ${
                  isTaxExempt
                    ? ""
                    : `
                      <div class="total-line">

                        <span class="total-label">
                          Tax (${escapeHtml(
                            taxRate,
                          )}%)
                        </span>

                        <strong class="total-value">
                          ${escapeHtml(
                            formatCurrency(
                              calculatedTax,
                            ),
                          )}
                        </strong>

                      </div>
                    `
                }

                <div class="total-line grand-total-line">

                  <span class="total-label">
                    Grand Total
                  </span>

                  <strong class="total-value">
                    ${escapeHtml(
                      formatCurrency(
                        grandTotal,
                      ),
                    )}
                  </strong>

                </div>

                <div class="total-line">

                  <span class="total-label">
                    Advance Payment
                  </span>

                  <strong class="total-value">
                    ${escapeHtml(
                      formatCurrency(
                        advancePaid,
                      ),
                    )}
                  </strong>

                </div>

                <div class="total-line balance-line">

                  <span class="total-label">
                    Balance Amount
                  </span>

                  <strong class="total-value">
                    ${escapeHtml(
                      formatCurrency(
                        balanceAmount,
                      ),
                    )}
                  </strong>

                </div>

              </div>

            </section>

            <!-- ============================================
                 PAYMENT SUMMARY
            ============================================= -->

            <section class="payment-summary">

              <div class="payment-summary-item">

                <div class="payment-summary-label">
                  Invoice Total
                </div>

                <div class="payment-summary-value">
                  ${escapeHtml(
                    formatCurrency(
                      grandTotal,
                    ),
                  )}
                </div>

              </div>

              <div class="payment-summary-item">

                <div class="payment-summary-label">
                  Amount Received
                </div>

                <div class="payment-summary-value">
                  ${escapeHtml(
                    formatCurrency(
                      advancePaid,
                    ),
                  )}
                </div>

              </div>

              <div class="payment-summary-item">

                <div class="payment-summary-label">
                  Current Status
                </div>

                <div class="payment-summary-value">

                  <span
                    class="status ${paymentStatusClass}"
                  >
                    ${escapeHtml(
                      paymentStatus,
                    )}
                  </span>

                </div>

              </div>

            </section>

            <!-- ============================================
                 ADVANCE PAYMENT DETAILS
            ============================================= -->

            <section class="advance-section">

              <div class="advance-header">

                <div class="advance-header-title">
                  Advance Payment Details
                </div>

                <div class="advance-header-total">
                  Total Received:
                  ${escapeHtml(
                    formatCurrency(
                      advancePaid,
                    ),
                  )}
                </div>

              </div>

              <table class="advance-table">

                <thead>

                  <tr>

                    <th>
                      #
                    </th>

                    <th>
                      Date &amp; Time
                    </th>

                    <th>
                      Payment Mode
                    </th>

                    <th>
                      Received By
                    </th>

                    <th>
                      Amount
                    </th>

                  </tr>

                </thead>

                <tbody>

                  ${advancePaymentsMarkup}

                </tbody>

              </table>

            </section>

            <!-- ============================================
                 BANK DETAILS
            ============================================= -->

            <section class="bank-section">

              <div class="bank-header">
                Bank &amp; Payment Details
              </div>

              <div class="bank-grid">

                <div class="bank-column">

                  ${getBankLine(
                    "Bank",
                    bank.bankName,
                  )}

                  ${getBankLine(
                    "A/c No.",
                    bank.accountNumber,
                  )}

                  ${getBankLine(
                    "A/c Holder",
                    bank.accountHolderName,
                  )}

                </div>

                <div class="bank-column">

                  ${getBankLine(
                    "Branch",
                    bank.branchName,
                  )}

                  ${getBankLine(
                    "IFSC",
                    bank.ifscCode,
                  )}

                  ${getBankLine(
                    "UPI ID",
                    bank.upiId,
                  )}

                </div>

              </div>

            </section>

            <!-- ============================================
                 TERMS + SIGNATURE
            ============================================= -->

            <section class="bottom-grid">

              <div class="bottom-box">

                <div class="bottom-heading">
                  Terms &amp; Conditions
                </div>

                <ol class="terms-list">

                  ${terms
                    .map(
                      (term) => `
                        <li>
                          ${escapeHtml(
                            term,
                          )}
                        </li>
                      `,
                    )
                    .join("")}

                </ol>

              </div>

              <div class="bottom-box signature-box">

                <div class="bottom-heading">
                  Authorisation
                </div>

                <p class="notes-text">
                  Certified that the particulars given
                  above are true and correct.
                </p>

                <div
                  class="signature-company"
                  style="margin-top: 5px;"
                >
                  For ${escapeHtml(
                    companyName,
                  )}
                </div>

                <div class="signature-space"></div>

                <div class="signature-line"></div>

                <div class="signature-label">
                  Authorised Signatory
                </div>

              </div>

            </section>

            <!-- ============================================
                 FOOTER
            ============================================= -->

            <footer class="document-footer">

              <strong>
                ${escapeHtml(
                  companyName,
                )}
              </strong>

              &nbsp; • &nbsp;

              This is a computer-generated invoice and
              does not require a physical signature unless
              otherwise specified.

              <br />

              Invoice:
              ${escapeHtml(
                invoiceNumber,
              )}

              &nbsp; • &nbsp;

              Date:
              ${escapeHtml(
                invoiceDate,
              )}

            </footer>

          </div>

        </main>

        <script>

          /* =================================================
             WHATSAPP PDF SHARE
          ================================================= */

          async function loadHtml2Pdf() {

            if (window.html2pdf) {
              return window.html2pdf;
            }

            return new Promise(
              function (resolve, reject) {

                const existingScript =
                  document.querySelector(
                    'script[data-html2pdf="true"]'
                  );

                if (existingScript) {

                  existingScript.addEventListener(
                    "load",
                    function () {
                      resolve(
                        window.html2pdf
                      );
                    }
                  );

                  existingScript.addEventListener(
                    "error",
                    function () {
                      reject(
                        new Error(
                          "Unable to load PDF generator."
                        )
                      );
                    }
                  );

                  return;
                }

                const script =
                  document.createElement(
                    "script"
                  );

                script.src =
                  "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";

                script.async = true;

                script.setAttribute(
                  "data-html2pdf",
                  "true"
                );

                script.onload =
                  function () {

                    if (
                      window.html2pdf
                    ) {
                      resolve(
                        window.html2pdf
                      );
                    } else {
                      reject(
                        new Error(
                          "PDF generator is unavailable."
                        )
                      );
                    }

                  };

                script.onerror =
                  function () {
                    reject(
                      new Error(
                        "Unable to load PDF generator."
                      )
                    );
                  };

                document.head.appendChild(
                  script
                );

              }
            );

          }

          /* =================================================
             WAIT FOR IMAGES
          ================================================= */

          async function waitForInvoiceImages() {

            const images =
              Array.from(
                document.querySelectorAll(
                  ".page img"
                )
              );

            if (!images.length) {
              return;
            }

            await Promise.all(
              images.map(
                function (image) {

                  if (
                    image.complete &&
                    image.naturalWidth > 0
                  ) {
                    return Promise.resolve();
                  }

                  return new Promise(
                    function (resolve) {

                      image.addEventListener(
                        "load",
                        resolve,
                        {
                          once: true,
                        }
                      );

                      image.addEventListener(
                        "error",
                        resolve,
                        {
                          once: true,
                        }
                      );

                    }
                  );

                }
              )
            );

          }

          /* =================================================
             CREATE WATERMARK IMAGE
          ================================================= */

          async function createWatermarkDataUrl(
            imageUrl
          ) {

            return new Promise(
              function (resolve, reject) {

                const image =
                  new Image();

                image.crossOrigin =
                  "anonymous";

                image.onload =
                  function () {

                    try {

                      const canvas =
                        document.createElement(
                          "canvas"
                        );

                      const canvasSize =
                        1200;

                      canvas.width =
                        canvasSize;

                      canvas.height =
                        canvasSize;

                      const context =
                        canvas.getContext(
                          "2d"
                        );

                      if (!context) {
                        reject(
                          new Error(
                            "Canvas is unavailable."
                          )
                        );
                        return;
                      }

                      context.clearRect(
                        0,
                        0,
                        canvasSize,
                        canvasSize
                      );

                      const naturalWidth =
                        image.naturalWidth ||
                        image.width ||
                        1;

                      const naturalHeight =
                        image.naturalHeight ||
                        image.height ||
                        1;

                      const scale =
                        Math.min(
                          canvasSize /
                            naturalWidth,
                          canvasSize /
                            naturalHeight
                        ) * 0.82;

                      const width =
                        naturalWidth *
                        scale;

                      const height =
                        naturalHeight *
                        scale;

                      const x =
                        (
                          canvasSize -
                          width
                        ) / 2;

                      const y =
                        (
                          canvasSize -
                          height
                        ) / 2;

                      context.globalAlpha =
                        0.055;

                      context.drawImage(
                        image,
                        x,
                        y,
                        width,
                        height
                      );

                      context.globalAlpha =
                        1;

                      resolve(
                        canvas.toDataURL(
                          "image/png"
                        )
                      );

                    } catch (error) {

                      reject(error);

                    }

                  };

                image.onerror =
                  function () {

                    reject(
                      new Error(
                        "Unable to load watermark logo."
                      )
                    );

                  };

                image.src =
                  imageUrl;

              }
            );

          }

          /* =================================================
             ADD WATERMARK TO EVERY PDF PAGE
          ================================================= */

          async function addWatermarkToPdf(
            pdf,
            imageUrl
          ) {

            if (!pdf || !imageUrl) {
              return;
            }

            let watermarkDataUrl = null;

            try {

              watermarkDataUrl =
                await createWatermarkDataUrl(
                  imageUrl
                );

            } catch (error) {

              console.warn(
                "Watermark image could not be created:",
                error
              );

              return;
            }

            if (!watermarkDataUrl) {
              return;
            }

            const pageCount =
              pdf.getNumberOfPages();

            for (
              let pageNumber = 1;
              pageNumber <= pageCount;
              pageNumber += 1
            ) {

              pdf.setPage(
                pageNumber
              );

              const pageWidth =
                pdf.internal.pageSize.getWidth();

              const pageHeight =
                pdf.internal.pageSize.getHeight();

              const watermarkSize =
                Math.min(
                  pageWidth,
                  pageHeight
                ) * 0.55;

              const watermarkX =
                (
                  pageWidth -
                  watermarkSize
                ) / 2;

              const watermarkY =
                (
                  pageHeight -
                  watermarkSize
                ) / 2;

              try {

                pdf.addImage(
                  watermarkDataUrl,
                  "PNG",
                  watermarkX,
                  watermarkY,
                  watermarkSize,
                  watermarkSize,
                  undefined,
                  "FAST"
                );

              } catch (error) {

                console.warn(
                  "Unable to add watermark to PDF page:",
                  pageNumber,
                  error
                );

              }

            }

          }

          /* =================================================
             WHATSAPP SHARE
          ================================================= */

          async function shareInvoiceOnWhatsApp() {

            const invoiceElement =
              document.querySelector(
                ".page"
              );

            if (!invoiceElement) {

              alert(
                "Invoice content not found."
              );

              return;
            }

            const toolbar =
              document.querySelector(
                ".toolbar"
              );

            const whatsappButton =
              document.querySelector(
                ".whatsapp-btn"
              );

            try {

              if (whatsappButton) {

                whatsappButton.disabled =
                  true;

                whatsappButton.dataset.originalText =
                  whatsappButton.innerHTML;

                whatsappButton.innerHTML =
                  "Creating PDF...";

              }

              if (toolbar) {
                toolbar.style.display =
                  "none";
              }

              await waitForInvoiceImages();

              await new Promise(
                function (resolve) {
                  setTimeout(
                    resolve,
                    500
                  );
                }
              );

              if (
                document.fonts &&
                document.fonts.ready
              ) {
                try {
                  await document.fonts.ready;
                } catch {
                  // Ignore font readiness errors.
                }
              }

              const html2pdf =
                await loadHtml2Pdf();

              const pdf =
                await html2pdf()
                  .set({

                    margin: [
                      8,
                      8,
                      8,
                      8,
                    ],

                    filename:
                      ${JSON.stringify(
                        `${invoiceNumber}.pdf`
                      )},

                    image: {
                      type: "jpeg",
                      quality: 0.98,
                    },

                    html2canvas: {
                      scale: 2,
                      useCORS: true,
                      allowTaint: true,
                      backgroundColor:
                        "#ffffff",
                      logging: false,
                      scrollX: 0,
                      scrollY: 0,
                      windowWidth:
                        document.documentElement
                          .scrollWidth,
                      windowHeight:
                        document.documentElement
                          .scrollHeight,
                    },

                    jsPDF: {
                      unit: "mm",
                      format: "a4",
                      orientation:
                        "portrait",
                      compress: true,
                    },

                    pagebreak: {
                      mode: [
                        "css",
                        "legacy",
                      ],

                      avoid: [
                        ".company-header",
                        ".document-title",
                        ".meta-grid",
                        ".party-grid",
                        ".totals-wrap",
                        ".payment-summary",
                        ".advance-section",
                        ".bank-section",
                        ".bottom-grid",
                        ".document-footer",
                        "tr",
                      ],
                    },

                  })
                  .from(
                    invoiceElement
                  )
                  .toPdf()
                  .get("pdf");

              await addWatermarkToPdf(
                pdf,
                ${JSON.stringify(
                  logoUrl
                )}
              );

              const pdfBlob =
                pdf.output(
                  "blob"
                );

              if (toolbar) {
                toolbar.style.display =
                  "";
              }

              const pdfFileName =
                ${JSON.stringify(
                  `${invoiceNumber}.pdf`
                )};

              const pdfFile =
                new File(
                  [pdfBlob],
                  pdfFileName,
                  {
                    type:
                      "application/pdf",
                  }
                );

              const canShareFile =
                typeof navigator.share ===
                  "function" &&
                typeof navigator.canShare ===
                  "function" &&
                navigator.canShare({
                  files: [
                    pdfFile,
                  ],
                });

              if (canShareFile) {

                await navigator.share({

                  title:
                    ${JSON.stringify(
                      `Invoice ${invoiceNumber}`
                    )},

                  text:
                    ${JSON.stringify(
                      `Invoice ${invoiceNumber} from ${companyName}`
                    )},

                  files: [
                    pdfFile,
                  ],

                });

                return;
              }

              const downloadUrl =
                URL.createObjectURL(
                  pdfBlob
                );

              const downloadLink =
                document.createElement(
                  "a"
                );

              downloadLink.href =
                downloadUrl;

              downloadLink.download =
                pdfFileName;

              downloadLink.style.display =
                "none";

              document.body.appendChild(
                downloadLink
              );

              downloadLink.click();

              downloadLink.remove();

              setTimeout(
                function () {

                  URL.revokeObjectURL(
                    downloadUrl
                  );

                },
                5000
              );

              const whatsappUrl =
                ${JSON.stringify(
                  whatsappShareUrl
                )};

              const popup =
                window.open(
                  whatsappUrl,
                  "_blank",
                  "noopener,noreferrer"
                );

              if (!popup) {
                window.location.href =
                  whatsappUrl;
              }

            } catch (error) {

              console.error(
                "WhatsApp PDF share error:",
                error
              );

              if (toolbar) {
                toolbar.style.display =
                  "";
              }

              if (whatsappButton) {

                whatsappButton.disabled =
                  false;

                if (
                  whatsappButton.dataset
                    .originalText
                ) {
                  whatsappButton.innerHTML =
                    whatsappButton.dataset
                      .originalText;
                }

              }

              if (
                error &&
                error.name ===
                  "AbortError"
              ) {
                return;
              }

              try {

                const whatsappUrl =
                  ${JSON.stringify(
                    whatsappShareUrl
                  )};

                const popup =
                  window.open(
                    whatsappUrl,
                    "_blank",
                    "noopener,noreferrer"
                  );

                if (!popup) {
                  window.location.href =
                    whatsappUrl;
                }

              } catch {

                window.location.href =
                  ${JSON.stringify(
                    whatsappShareUrl
                  )};

              }

            } finally {

              if (whatsappButton) {

                whatsappButton.disabled =
                  false;

                if (
                  whatsappButton.dataset
                    .originalText
                ) {
                  whatsappButton.innerHTML =
                    whatsappButton.dataset
                      .originalText;
                }

              }

            }

          }

          /* =================================================
             AUTO PRINT
          ================================================= */

          window.addEventListener(
            "load",
            function () {

              setTimeout(
                function () {

                  if (
                    ${JSON.stringify(
                      mode,
                    )} === "print" ||
                    ${JSON.stringify(
                      mode,
                    )} === "pdf"
                  ) {

                    window.print();

                  }

                },
                350,
              );

            },
          );

          window.addEventListener(
            "afterprint",
            function () {}
          );

        </script>

      </body>

    </html>
  `);

  printWindow.document.close();

  try {
    printWindow.focus();
  } catch {
    // Ignore browser focus restrictions.
  }
};