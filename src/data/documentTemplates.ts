/**
 * Legal India - Document Engine Templates
 * Full legal formatting compliant with Indian courts and statutory guidelines.
 */

export interface DocumentField {
  id: string;
  label: string;
  labelHi: string;
  placeholder: string;
  type: 'text' | 'textarea' | 'date' | 'number';
  required: boolean;
  helpText: string;
}

export interface DocumentTemplate {
  id: string;
  title: string;
  titleHi: string;
  category: string;
  applicableLaw: string;
  description: string;
  fields: DocumentField[];
  generateDoc: (data: Record<string, string>, lang?: 'en' | 'hi') => {
    subject: string;
    body: string;
    instructions: string[];
  };
}

export const DOCUMENT_TEMPLATES: DocumentTemplate[] = [
  {
    id: 'cheque-bounce-notice',
    title: 'Legal Notice: Cheque Bounce (Section 138 NI Act)',
    titleHi: 'कानूनी नोटिस: चेक बाउंस (धारा 138 एनआई एक्ट)',
    category: 'Banking & Criminal',
    applicableLaw: 'Section 138, Negotiable Instruments Act, 1881',
    description: 'Mandatory statutory demand notice to be sent within 30 days of receiving the cheque return memo from the bank.',
    fields: [
      { id: 'senderName', label: 'Your Full Name (Payee)', labelHi: 'आपका पूरा नाम', placeholder: 'e.g. Ramesh Kumar', type: 'text', required: true, helpText: 'The legal holder of the cheque.' },
      { id: 'senderAddress', label: 'Your Full Address with PIN', labelHi: 'आपका पूरा पता पिन कोड सहित', placeholder: 'e.g. Flat 402, Green Enclave, Sector 12, Dwarka, New Delhi - 110075', type: 'textarea', required: true, helpText: 'Your postal address for reply.' },
      { id: 'receiverName', label: 'Drawer Full Name (Who issued cheque)', labelHi: 'चेक जारी करने वाले का नाम', placeholder: 'e.g. Sunil Verma, Prop. Verma Enterprises', type: 'text', required: true, helpText: 'The person/entity whose cheque bounced.' },
      { id: 'receiverAddress', label: 'Drawer Address with PIN', labelHi: 'चेक जारी करने वाले का पता', placeholder: 'e.g. Plot 15, Industrial Area, Okhla, New Delhi - 110020', type: 'textarea', required: true, helpText: 'Send via Registered Post with A/D or Speed Post.' },
      { id: 'chequeNumber', label: 'Cheque Number', labelHi: 'चेक नंबर', placeholder: 'e.g. 004521', type: 'text', required: true, helpText: '6-digit number on cheque bottom.' },
      { id: 'chequeDate', label: 'Cheque Date', labelHi: 'चेक की तारीख', placeholder: 'DD/MM/YYYY', type: 'date', required: true, helpText: 'Date written on cheque face.' },
      { id: 'chequeAmount', label: 'Cheque Amount (in ₹)', labelHi: 'चेक की राशि (रुपये में)', placeholder: 'e.g. 150000', type: 'number', required: true, helpText: 'Exact numerical amount.' },
      { id: 'drawnBank', label: 'Drawn Bank & Branch', labelHi: 'बैंक और शाखा का नाम', placeholder: 'e.g. HDFC Bank, Connaught Place Branch', type: 'text', required: true, helpText: 'Bank mentioned on cheque.' },
      { id: 'memoDate', label: 'Date of Return Memo', labelHi: 'बैंक रिटर्न मेमो की तारीख', placeholder: 'DD/MM/YYYY', type: 'date', required: true, helpText: 'Crucial: Notice MUST be sent within 30 days of this date.' },
      { id: 'bounceReason', label: 'Reason for Dishonour', labelHi: 'बाउंस का कारण', placeholder: 'e.g. Funds Insufficient / Account Closed', type: 'text', required: true, helpText: 'Reason stated in the return memo.' },
      { id: 'considerationReason', label: 'Why was this cheque given?', labelHi: 'चेक किस कारण दिया गया था?', placeholder: 'e.g. In discharge of legally enforceable debt against supplied goods vide Invoice No. 102', type: 'textarea', required: true, helpText: 'Proves legally enforceable debt.' },
    ],
    generateDoc: (data, lang = 'en') => {
      const isHi = lang === 'hi';
      const subject = isHi
        ? `कानूनी मांग नोटिस अंतर्गत धारा 138, निगोशिएबल इंस्ट्रूमेंट्स एक्ट 1881 - चेक नं. ${data.chequeNumber || '___'} हेतु`
        : `LEGAL DEMAND NOTICE UNDER SECTION 138 OF THE NEGOTIABLE INSTRUMENTS ACT, 1881 FOR DISHONOUR OF CHEQUE NO. ${data.chequeNumber || '___'}`;

      const bodyEn = `REGISTERED POST WITH A.D. / SPEED POST

Date: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}

To,
${data.receiverName || '[Receiver Name]'}
${data.receiverAddress || '[Receiver Address]'}

SUBJECT: ${subject}

Sir/Madam,

Under instructions from and on behalf of my client / the undersigned, ${data.senderName || '[Sender Name]'}, residing at ${data.senderAddress || '[Sender Address]'}, this formal Legal Notice is hereby served upon you as under:

1. That in discharge of your legally enforceable debt and liability towards the undersigned (${data.considerationReason || 'in discharge of lawful commercial obligations'}), you had issued in favour of the undersigned a Cheque bearing No. ${data.chequeNumber || '[Cheque No]'} dated ${data.chequeDate || '[Date]'} for an amount of ₹${data.chequeAmount || '[Amount]'} drawn on ${data.drawnBank || '[Bank Name]'}.

2. That while issuing the aforesaid Cheque, you had expressly assured and represented to the undersigned that the said Cheque would be honoured upon presentation on its due date.

3. That relying upon your bona fide representation, the undersigned presented the aforesaid Cheque for encashment through bank; however, to the utter shock of the undersigned, the said Cheque was returned unpaid and dishonoured by the bank vide Cheque Return Memo dated ${data.memoDate || '[Memo Date]'} with the remarks "${data.bounceReason || 'Funds Insufficient'}".

4. That by issuing the said Cheque without maintaining sufficient balance in your bank account, you have committed an offence punishable under Section 138 of the Negotiable Instruments Act, 1881, as well as offences under Section 318(4) of the Bharatiya Nyaya Sanhita, 2023 (formerly Section 420 IPC) for cheating and dishonest inducement.

5. THEREFORE, by means of this Statutory Legal Notice, you are hereby called upon to pay the aforesaid cheque amount of ₹${data.chequeAmount || '[Amount]'} to the undersigned within FIFTEEN (15) DAYS from the date of receipt of this notice, failing which the undersigned shall be constrained to initiate criminal proceedings against you under Section 138 and Section 142 of the Negotiable Instruments Act, 1881, before the competent Court of Judicial Magistrate, entirely at your own risk, cost, and consequence.

Take further notice that in event of criminal prosecution, you shall also be liable for imprisonment up to two years and/or fine extending up to twice the amount of the cheque, alongside interest and litigation costs.

Yours faithfully,

___________________________
${data.senderName || '[Sender Signature]'}
Address: ${data.senderAddress || '[Address]'}
Phone / Email: ___________________________`;

      const bodyHi = `रजिस्टर्ड डाक / स्पीड पोस्ट द्वारा

दिनांक: ${new Date().toLocaleDateString('hi-IN', { day: 'numeric', month: 'long', year: 'numeric' })}

सेवा में,
${data.receiverName || '[प्राप्तकर्ता का नाम]'}
${data.receiverAddress || '[प्राप्तकर्ता का पता]'}

विषय: ${subject}

महोदय / महोदया,

अधोहस्ताक्षरी ${data.senderName || '[प्रेषक का नाम]'}, निवासी ${data.senderAddress || '[प्रेषक का पता]'} की ओर से आपको यह कानूनी नोटिस निम्नलिखित तथ्यों पर प्रेषित किया जाता है:

1. यह कि अपने वैध ऋण और दायित्व के निर्वहन हेतु (${data.considerationReason || 'व्यावसायिक दायित्व के तहत'}), आपने अधोहस्ताक्षरी के पक्ष में चेक संख्या ${data.chequeNumber || '[चेक नं]'} दिनांक ${data.chequeDate || '[तारीख]'} राशि ₹${data.chequeAmount || '[राशि]'} बैंक ${data.drawnBank || '[बैंक]'} जारी किया था।

2. यह कि उक्त चेक जारी करते समय आपने पूर्ण विश्वास दिलाया था कि प्रस्तुति पर चेक का पूर्ण भुगतान हो जाएगा।

3. यह कि अधोहस्ताक्षरी ने जब उक्त चेक अपने बैंक में भुगतान हेतु लगाया, तो बैंक द्वारा रिटर्न मेमो दिनांक ${data.memoDate || '[मेमो तारीख]'} द्वारा चेक "${data.bounceReason || 'खाते में अपर्याप्त राशि'}" के कारण अनादृत (बाउंस) कर वापस कर दिया गया।

4. यह कि पर्याप्त राशि न रखते हुए चेक जारी करके आपने निगोशिएबल इंस्ट्रूमेंट्स एक्ट 1881 की धारा 138 तथा भारतीय न्याय संहिता 2023 की धारा 318(4) (पूर्व धारा 420 आईपीसी) के अंतर्गत दंडनीय अपराध किया है।

5. अतः इस कानूनी नोटिस के माध्यम से आपको निर्देशित किया जाता है कि इस नोटिस की प्राप्ति के 15 (पंद्रह) दिनों के भीतर उक्त राशि ₹${data.chequeAmount || '[राशि]'} का भुगतान अधोहस्ताक्षरी को सुनिश्चित करें। अन्यथा नियत समय समाप्ति के पश्चात सक्षम न्यायालय में धारा 138 एनआई एक्ट के अंतर्गत आपके विरुद्ध आपराधिक परिवाद प्रस्तुत किया जाएगा, जिसके समस्त हर्जा-खर्चा के आप स्वयं उत्तरदायी होंगे।

भवदीय,

___________________________
${data.senderName || '[हस्ताक्षर]'}
पता: ${data.senderAddress || '[पता]'}
दूरभाष / ईमेल: ___________________________`;

      return {
        subject,
        body: isHi ? bodyHi : bodyEn,
        instructions: [
          'Send this notice via Speed Post or Registered Post with Acknowledgment Due (RPAD) within 30 days of receiving the bank memo.',
          'Retain the original postal receipt and download the India Post tracking delivery report showing "Item Delivered".',
          'The drawer gets 15 days from delivery to pay. If they fail, file a criminal complaint before Judicial Magistrate within the next 30 days.',
        ],
      };
    },
  },
  {
    id: 'security-deposit-notice',
    title: 'Legal Notice: Refund of Tenant Security Deposit',
    titleHi: 'कानूनी नोटिस: किरायेदार की सिक्योरिटी डिपॉजिट वापसी हेतु',
    category: 'Tenancy & Housing',
    applicableLaw: 'Transfer of Property Act, 1882 / Model Tenancy Act',
    description: 'Demand notice to landlord who is unlawfully withholding security deposit after peaceful handover of rented premises.',
    fields: [
      { id: 'tenantName', label: 'Your Full Name (Tenant)', labelHi: 'किरायेदार का पूरा नाम', placeholder: 'e.g. Priya Sharma', type: 'text', required: true, helpText: 'Name as written in rent agreement.' },
      { id: 'tenantAddress', label: 'Your Current Address for Communication', labelHi: 'आपका वर्तमान पता', placeholder: 'e.g. House 12, Rose Villa, Bengaluru - 560034', type: 'textarea', required: true, helpText: 'Where the reply or cheque should be sent.' },
      { id: 'landlordName', label: 'Landlord Full Name', labelHi: 'मकान मालिक का नाम', placeholder: 'e.g. Anil Mehra', type: 'text', required: true, helpText: 'Owner of the rented premises.' },
      { id: 'landlordAddress', label: 'Landlord Address', labelHi: 'मकान मालिक का पता', placeholder: 'e.g. 54, Richmond Road, Bengaluru - 560025', type: 'textarea', required: true, helpText: 'Landlord postal address.' },
      { id: 'propertyAddress', label: 'Rented Premises Address', labelHi: 'किराये के मकान का पता', placeholder: 'e.g. Flat 204, Alpine Heights, Koramangala, Bengaluru', type: 'textarea', required: true, helpText: 'The property you vacated.' },
      { id: 'depositAmount', label: 'Security Deposit Amount (in ₹)', labelHi: 'जमा सिक्योरिटी राशि (₹)', placeholder: 'e.g. 80000', type: 'number', required: true, helpText: 'Total deposit amount paid at start.' },
      { id: 'vacateDate', label: 'Date You Handed Over Keys / Vacated', labelHi: 'मकान खाली करने की तारीख', placeholder: 'DD/MM/YYYY', type: 'date', required: true, helpText: 'Date keys were handed over peacefully.' },
      { id: 'handoverProof', label: 'Proof of Handover', labelHi: 'खाली करने का साक्ष्य', placeholder: 'e.g. WhatsApp confirmation / Handover sheet / Video inspection', type: 'text', required: true, helpText: 'Evidence premises was in good condition.' },
    ],
    generateDoc: (data, lang = 'en') => {
      const isHi = lang === 'hi';
      const subject = isHi
        ? `कानूनी नोटिस: किरायेदार की सिक्योरिटी डिपॉजिट राशि ₹${data.depositAmount || '___'} की तत्काल वापसी हेतु`
        : `LEGAL NOTICE DEMANDING REFUND OF INTEREST-FREE SECURITY DEPOSIT OF ₹${data.depositAmount || '___'}`;

      const bodyEn = `SPEED POST / REGISTERED POST A.D.

Date: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}

To,
${data.landlordName || '[Landlord Name]'}
${data.landlordAddress || '[Landlord Address]'}

SUBJECT: ${subject}
REGARDING PREMISES: ${data.propertyAddress || '[Rented Property]'}

Sir/Madam,

This Legal Notice is served upon you on behalf of the undersigned, ${data.tenantName || '[Tenant Name]'}, now residing at ${data.tenantAddress || '[Tenant Address]'}, regarding the unlawful withholding of security deposit:

1. That the undersigned occupied the premises situated at ${data.propertyAddress || '[Property Address]'} as a lawful tenant, having deposited a refundable security deposit of ₹${data.depositAmount || '[Deposit Amount]'} with you at the inception of tenancy.

2. That the undersigned peacefully vacated the aforesaid premises on ${data.vacateDate || '[Vacate Date]'} after giving due notice and clearing all applicable electricity and utility dues up to date.

3. That the vacant and peaceful possession of the premises along with keys was duly handed over to you on ${data.vacateDate || '[Vacate Date]'} in clean, tenantable condition, verified through ${data.handoverProof || 'mutual inspection'}.

4. That as per the terms of tenancy and established principles of Indian tenancy jurisprudence, the landlord is duty-bound to refund the entire security deposit upon receiving peaceful possession, barring lawful deductions for unpaid rent or proven willful structural damage (excluding normal wear and tear).

5. That despite repeated oral requests and written reminders via WhatsApp/Email, you have failed and refused to refund the said deposit of ₹${data.depositAmount || '[Deposit Amount]'}, which constitutes criminal breach of trust under Section 316 of Bharatiya Nyaya Sanhita, 2023, and unlawful enrichment.

6. THEREFORE, you are hereby called upon to refund the entire security deposit of ₹${data.depositAmount || '[Deposit Amount]'} along with 18% per annum interest to the undersigned within FIFTEEN (15) DAYS from the receipt of this notice, failing which the undersigned shall be constrained to initiate appropriate civil proceedings for recovery with damages, as well as a consumer complaint before the District Consumer Disputes Redressal Commission for deficiency of service, entirely at your cost and consequence.

Yours faithfully,

___________________________
${data.tenantName || '[Tenant Name]'}
Address: ${data.tenantAddress || '[Address]'}
Bank Account / UPI for Transfer: ___________________________`;

      const bodyHi = `स्पीड पोस्ट / रजिस्टर्ड डाक द्वारा

दिनांक: ${new Date().toLocaleDateString('hi-IN', { day: 'numeric', month: 'long', year: 'numeric' })}

सेवा में,
${data.landlordName || '[मकान मालिक का नाम]'}
${data.landlordAddress || '[मकान मालिक का पता]'}

विषय: ${subject}
परिसर संदर्भ: ${data.propertyAddress || '[किराये का मकान]'}

महोदय / महोदया,

अधोहस्ताक्षरी ${data.tenantName || '[किरायेदार का नाम]'}, वर्तमान निवासी ${data.tenantAddress || '[वर्तमान पता]'} द्वारा आपको यह कानूनी मांग नोटिस प्रेषित किया जाता है:

1. यह कि अधोहस्ताक्षरी आपके मकान स्थित ${data.propertyAddress || '[मकान पता]'} में वैध किरायेदार के रूप में निवासरत था तथा किरायेदारी के प्रारंभ में ₹${data.depositAmount || '[जमा राशि]'} की रिफंडेबल सिक्योरिटी राशि आपको जमा कराई गई थी।

2. यह कि अधोहस्ताक्षरी ने नियमानुसार सूचना देकर दिनांक ${data.vacateDate || '[खाली करने की तारीख]'} को समस्त बिजली एवं अन्य बिलों का चुकता भुगतान कर परिसर को शांतिपूर्ण ढंग से रिक्त कर दिया।

3. यह कि चाबी व परिसर का कब्जा आपको ${data.handoverProof || 'निरीक्षण उपरांत'} अच्छी व साफ स्थिति में सुपुर्द कर दिया गया था।

4. यह कि स्थापित विधि अनुसार परिसर खाली होने पर सिक्योरिटी डिपॉजिट तत्काल वापस करना मकान मालिक का वैधानिक दायित्व है। सामान्य टूट-फूट (Ordinary wear & tear) की आड़ में राशि रोकना गैरकानूनी है।

5. यह कि बार-बार अनुरोध के बावजूद आपने उक्त राशि ₹${data.depositAmount || '[राशि]'} वापस नहीं की है, जो कि भारतीय न्याय संहिता 2023 की धारा 316 (आपराधिक विश्वासघात) एवं अनुचित लाभ का स्पष्ट मामला है।

6. अतः आपको निर्देशित किया जाता है कि इस नोटिस की प्राप्ति के 15 दिनों के भीतर पूरी सिक्योरिटी राशि ₹${data.depositAmount || '[राशि]'} अधोहस्ताक्षरी के बैंक खाते में वापस करें, अन्यथा सक्षम न्यायालय/उपभोक्ता आयोग में वसूली एवं हर्जाने हेतु वाद दायर किया जाएगा।

भवदीय,

___________________________
${data.tenantName || '[हस्ताक्षर]'}
पता: ${data.tenantAddress || '[पता]'}
बैंक खाता विवरण / UPI: ___________________________`;

      return {
        subject,
        body: isHi ? bodyHi : bodyEn,
        instructions: [
          'Send via Speed Post to the landlord’s residential address and also email / WhatsApp a copy.',
          'If no refund is received within 15 days, you can file a case in the Small Causes Court or Consumer Forum for deficiency of service.',
        ],
      };
    },
  },
  {
    id: 'rti-application',
    title: 'RTI Application (Form A - Right to Information Act 2005)',
    titleHi: 'आरटीआई आवेदन (फॉर्म ए - सूचना का अधिकार अधिनियम 2005)',
    category: 'Governance & Citizen Rights',
    applicableLaw: 'Section 6(1), Right to Information Act, 2005',
    description: 'Statutory application to obtain government records, tender copies, marks sheets, road repair bills, or police action reports within 30 days.',
    fields: [
      { id: 'applicantName', label: 'Applicant Full Name', labelHi: 'आवेदक का पूरा नाम', placeholder: 'e.g. Rajesh Kumar', type: 'text', required: true, helpText: 'Must be an Indian Citizen under Section 3 RTI Act.' },
      { id: 'applicantAddress', label: 'Postal Address with PIN', labelHi: 'पत्राचार का पूरा पता', placeholder: 'e.g. House No. 45, Gandhi Nagar, Jaipur - 302015', type: 'textarea', required: true, helpText: 'Where the certified information will be posted.' },
      { id: 'publicAuthority', label: 'Public Authority / Department', labelHi: 'सार्वजनिक प्राधिकरण / विभाग', placeholder: 'e.g. Public Works Department (PWD) / Municipal Corporation of Delhi', type: 'text', required: true, helpText: 'The government agency holding the records.' },
      { id: 'pioDesignation', label: 'PIO Designation & Office Address', labelHi: 'जन सूचना अधिकारी (PIO) का पद व पता', placeholder: 'The Central / State Public Information Officer, [Department Name, City]', type: 'textarea', required: true, helpText: 'Usually addressed to CPIO or SPIO.' },
      { id: 'subjectMatter', label: 'Subject Matter of Information', labelHi: 'मांगी गई सूचना का संक्षिप्त विषय', placeholder: 'e.g. Certified copies of road construction bills and contractor inspection log for MG Road repair in 2024', type: 'text', required: true, helpText: 'One clear sentence describing topic.' },
      { id: 'questions', label: 'Specific Information Questions (Numbered)', labelHi: 'विशिष्ट प्रश्न (संख्या 1, 2, 3...)', placeholder: '1. Please provide certified copies of work orders issued for...\n2. Please specify the total amount sanctioned and paid to...\n3. Name and designation of the inspecting engineer who approved...', type: 'textarea', required: true, helpText: 'Keep questions objective, precise, and ask for certified copies.' },
      { id: 'paymentMode', label: 'RTI Fee Payment Details (₹10)', labelHi: 'आवेदन शुल्क विवरण (₹10)', placeholder: 'e.g. Indian Postal Order (IPO) No. 45F 890123 of ₹10 attached', type: 'text', required: true, helpText: 'IPO / Demand Draft / Court Fee Stamp of ₹10 (BPL category exempt).' },
    ],
    generateDoc: (data, lang = 'en') => {
      const isHi = lang === 'hi';
      const subject = isHi
        ? `आवेदन अंतर्गत धारा 6(1), सूचना का अधिकार अधिनियम, 2005 - ${data.subjectMatter || 'सूचना प्राप्ति बाबत'}`
        : `APPLICATION UNDER SECTION 6(1) OF THE RIGHT TO INFORMATION ACT, 2005`;

      const bodyEn = `APPLICATION FOR OBTAINING INFORMATION UNDER RIGHT TO INFORMATION ACT, 2005

To,
The Central / State Public Information Officer (CPIO / SPIO),
${data.publicAuthority || '[Department / Ministry Name]'}
${data.pioDesignation || '[Office Address]'}

1. Full Name of the Applicant: ${data.applicantName || '[Applicant Name]'}
2. Address for Correspondence: ${data.applicantAddress || '[Applicant Address]'}
3. Citizenship: Indian Citizen (as required under Section 3 of RTI Act, 2005)
4. Contact Details: Phone: __________________ | Email: __________________

5. Particulars of Information Required:
   a. Subject: ${data.subjectMatter || '[Subject Matter]'}
   b. Period to which information relates: Recent / Current Financial Year
   c. Specific details of information required:

${data.questions || '1. Certified copy of ...\n2. Daily progress report ...'}

6. Mode of Delivery:
   Please supply the certified copies of the information / documents by Speed Post / Registered Post at the postal address mentioned above.

7. Application Fee Details:
   An application fee of ₹10/- (Rupees Ten only) has been deposited vide:
   ${data.paymentMode || 'Indian Postal Order (IPO) No. __________ dated __________ drawn in favour of the Accounts Officer.'}

8. Mandatory Declaration:
   I hereby state that the information sought above falls within the purview of the RTI Act, 2005 and is not exempted under Section 8 or Section 9 of the Act. As per Section 7(1) of the Act, the requested information should be supplied within thirty (30) days of receipt.

Place: __________________
Date: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}

____________________________________
Signature of the Applicant
(${data.applicantName || 'Applicant'})`;

      const bodyHi = `सूचना का अधिकार अधिनियम, 2005 की धारा 6(1) के तहत आवेदन पत्र

सेवा में,
केंद्रीय / राज्य लोक सूचना अधिकारी (CPIO / SPIO),
${data.publicAuthority || '[विभाग / प्राधिकरण का नाम]'}
${data.pioDesignation || '[कार्यालय का पता]'}

1. आवेदक का पूरा नाम: ${data.applicantName || '[आवेदक का नाम]'}
2. पत्राचार का पूरा पता: ${data.applicantAddress || '[पता]'}
3. नागरिकता: भारतीय नागरिक (अधिनियम की धारा 3 अनुसार)
4. संपर्क सूत्र: दूरभाष: __________________ | ईमेल: __________________

5. चाही गई सूचना का विवरण:
   क. विषय: ${data.subjectMatter || '[विषय]'}
   ख. विशिष्ट सूचना/दस्तावेज के बिंदु:

${data.questions || '1. कृपया प्रमाणित प्रतिलिपि उपलब्ध कराएं...\n2. कुल व्यय का विवरण...'}

6. सूचना प्राप्ति का माध्यम:
   कृपया चाही गई सूचना की प्रमाणित प्रतियां स्पीड पोस्ट द्वारा उपरोक्त पते पर प्रेषित करें।

7. आवेदन शुल्क का विवरण:
   आवेदन शुल्क ₹10/- (दस रुपये मात्र) निम्नानुसार संलग्न है:
   ${data.paymentMode || 'पोस्टल आर्डर (IPO) संख्या __________'}

8. घोषणा:
   मैं घोषणा करता/करती हूँ कि मैं भारत का नागरिक हूँ तथा मांगी गई सूचना अधिनियम की धारा 8 या 9 से मुक्त नहीं है। धारा 7(1) अनुसार 30 दिनों में सूचना उपलब्ध कराई जावे।

स्थान: __________________
दिनांक: ${new Date().toLocaleDateString('hi-IN', { day: 'numeric', month: 'long', year: 'numeric' })}

____________________________________
आवेदक के हस्ताक्षर
(${data.applicantName || 'आवेदक'})`;

      return {
        subject,
        body: isHi ? bodyHi : bodyEn,
        instructions: [
          'Affix a ₹10 Indian Postal Order (IPO) or Court Fee Stamp payable to "Accounts Officer, [Department]".',
          'Send via Speed Post and keep the receipt. PIO must reply within 30 days (or 48 hours if it concerns life & liberty).',
          'If no reply or incomplete reply is received in 30 days, file First Appeal under Section 19(1) to the First Appellate Authority (FAA).',
        ],
      };
    },
  },
  {
    id: 'consumer-complaint',
    title: 'Consumer Complaint Draft (District Commission / e-Daakhil)',
    titleHi: 'उपभोक्ता परिवाद प्रारूप (जिला उपभोक्ता आयोग / ई-दाखिल)',
    category: 'Consumer Redressal',
    applicableLaw: 'Section 35, Consumer Protection Act, 2019',
    description: 'Formal complaint against defective goods, deficiency of service, unfair trade practices, or unfulfilled refunds for submission on e-Daakhil or District Forum.',
    fields: [
      { id: 'complainantName', label: 'Complainant Full Name', labelHi: 'परिवादी का नाम', placeholder: 'e.g. Dr. Kavita Nair', type: 'text', required: true, helpText: 'Person who purchased product/service.' },
      { id: 'complainantAddress', label: 'Complainant Address', labelHi: 'परिवादी का पता', placeholder: 'e.g. 78, Marine Lines, Mumbai - 400020', type: 'textarea', required: true, helpText: 'Address determines territorial jurisdiction under s.34 CPA 2019.' },
      { id: 'oppositePartyName', label: 'Opposite Party (Company / Seller)', labelHi: 'विपक्षी (कंपनी / विक्रेता का नाम)', placeholder: 'e.g. QuickElectro India Pvt Ltd & SmartLogistics Ltd', type: 'text', required: true, helpText: 'Name of the e-commerce platform / seller.' },
      { id: 'oppositePartyAddress', label: 'Opposite Party Office Address', labelHi: 'विपक्षी का पंजीकृत कार्यालय पता', placeholder: 'e.g. Registered Office: 12th Floor, Cyber City, Gurugram, Haryana - 122002', type: 'textarea', required: true, helpText: 'Corporate or branch address.' },
      { id: 'productDetails', label: 'Product / Service Description & Invoice No.', labelHi: 'उत्पाद/सेवा विवरण एवं इनवॉइस संख्या', placeholder: 'e.g. UltraHD Smart LED TV 55 Inch, Order ID: ORD-998234, Invoice No: INV-4412', type: 'text', required: true, helpText: 'Include invoice number and model name.' },
      { id: 'transactionAmount', label: 'Total Amount Paid (in ₹)', labelHi: 'भुगतान की गई कुल राशि (₹)', placeholder: 'e.g. 48999', type: 'number', required: true, helpText: 'Exact amount paid via card/UPI.' },
      { id: 'grievanceSummary', label: 'Chronology of Defect / Deficiency', labelHi: 'शिकायत का संक्षिप्त विवरण', placeholder: 'e.g. Television delivered with shattered display on 12/08/2024. Return request raised within 2 hours; customer support refused replacement citing arbitrary policy.', type: 'textarea', required: true, helpText: 'List dates, defect description, and customer care responses.' },
      { id: 'reliefClaimed', label: 'Relief & Compensation Claimed (in ₹)', labelHi: 'मांगी गई राहत व क्षतिपूर्ति राशि', placeholder: 'e.g. Full refund of ₹48,999 + ₹25,000 compensation for mental harassment + ₹10,000 litigation costs', type: 'textarea', required: true, helpText: 'Specify refund, replacement, damages, and legal costs.' },
    ],
    generateDoc: (data, lang = 'en') => {
      const isHi = lang === 'hi';
      const subject = `COMPLAINT UNDER SECTION 35 OF THE CONSUMER PROTECTION ACT, 2019`;

      const bodyEn = `BEFORE THE HON'BLE DISTRICT CONSUMER DISPUTES REDRESSAL COMMISSION AT __________________

COMPLAINT PETITION NO. _________ OF 202__

IN THE MATTER OF:
${data.complainantName || '[Complainant Name]'}
R/o ${data.complainantAddress || '[Complainant Address]'}
... COMPLAINANT

VERSUS

${data.oppositePartyName || '[Opposite Party Name]'}
Having office at:
${data.oppositePartyAddress || '[Opposite Party Address]'}
... OPPOSITE PARTY

COMPLAINT UNDER SECTION 35 OF THE CONSUMER PROTECTION ACT, 2019 FOR DEFICIENCY IN SERVICE, UNFAIR TRADE PRACTICE AND PRODUCT LIABILITY

MOST RESPECTFULLY SHOWETH:

1. That the Complainant is a consumer within the definition of Section 2(7) of the Consumer Protection Act, 2019, having purchased for consideration ${data.productDetails || '[Product/Service]'} for an amount of ₹${data.transactionAmount || '[Amount]'} vide Invoice/Order dated ____________.

2. That the Opposite Party is a commercial enterprise engaged in selling goods and providing services to consumers and is subject to the provisions of the Consumer Protection Act, 2019.

3. JURISDICTION: That this Hon'ble Commission has territorial jurisdiction under Section 34(2)(d) of the Act as the Complainant resides and works for gain within the territorial limits of this Commission. Furthermore, the pecuniary value of goods and compensation claimed falls within the jurisdiction of this District Commission (under ₹50 Lakhs).

4. FACTS OF THE CASE:
${data.grievanceSummary || 'The Complainant purchased goods which turned out to be completely defective...'}

5. DEFICIENCY IN SERVICE: That the aforesaid acts of the Opposite Party constitute gross "deficiency" as defined under Section 2(11) and "unfair trade practice" as defined under Section 2(47) of the Consumer Protection Act, 2019, having caused grave financial loss and acute mental agony to the Complainant.

6. PRAYER:
In view of the facts and circumstances stated above, the Complainant most respectfully prays that this Hon'ble Commission may be pleased to:
   a. Direct the Opposite Party to provide: ${data.reliefClaimed || 'Full refund of the amount along with 12% interest per annum;'}\n   b. Direct the Opposite Party to pay appropriate compensation for mental agony, harassment, and litigation expenses;\n   c. Pass such other and further orders as this Hon'ble Commission may deem fit and proper in the interest of justice.

Complainant: ${data.complainantName || '[Complainant]'}
Through: Self / Authorized Representative

VERIFICATION:
I, the Complainant above-named, do hereby solemnly declare and verify that the contents of paragraphs 1 to 6 above are true and correct to my personal knowledge and belief. No part of it is false and nothing material has been concealed therein.
Verified at ____________ on this ____ day of ____________, 202__.

____________________________________
DEPONENT / COMPLAINANT`;

      const bodyHi = `माननीय जिला उपभोक्ता विवाद प्रतितोष आयोग, ____________ के समक्ष

परिवाद संख्या: ____________ / 202__

पक्षकार:
${data.complainantName || '[परिवादी का नाम]'}
निवासी: ${data.complainantAddress || '[परिवादी का पता]'}
... परिवादी

विरुद्ध

${data.oppositePartyName || '[विपक्षी का नाम]'}
कार्यालय: ${data.oppositePartyAddress || '[विपक्षी का पता]'}
... विपक्षी

उपभोक्ता संरक्षण अधिनियम 2019 की धारा 35 के अंतर्गत सेवा में कमी एवं अनुचित व्यापार व्यवहार हेतु परिवाद

माननीय आयोग के समक्ष सविनय निवेदन है:

1. यह कि परिवादी उपभोक्ता संरक्षण अधिनियम 2019 की धारा 2(7) के अनुसार उपभोक्ता है, जिसने सशुल्क ${data.productDetails || '[उत्पाद]'} राशि ₹${data.transactionAmount || '[राशि]'} में क्रय किया था।

2. यह कि धारा 34(2)(d) अनुसार परिवादी के निवास स्थान पर होने के कारण इस माननीय आयोग को इस परिवाद के श्रवण का पूर्ण क्षेत्राधिकार प्राप्त है।

3. प्रकरण के संक्षिप्त तथ्य:
${data.grievanceSummary || 'विपक्षी द्वारा प्रदाय किया गया उत्पाद अत्यंत दोषपूर्ण था...'}

4. सेवा में कमी: विपक्षी का उक्त कृत्य अधिनियम की धारा 2(11) में परिभाषित सेवा में घोर कमी एवं धारा 2(47) में परिभाषित अनुचित व्यापार व्यवहार की श्रेणी में आता है।

5. प्रार्थना:
अतः परिवादी प्रार्थना करता है कि:
   क. विपक्षी को निर्देशित किया जाए कि वह ${data.reliefClaimed || 'पूरी राशि मय ब्याज वापस करे;'}\n   ख. मानसिक संताप एवं वाद व्यय हेतु उचित क्षतिपूर्ति दिलाई जावे।

सत्यापन:
मैं, परिवादी, सत्यनिष्ठापूर्वक सत्यापित करता/करती हूँ कि उक्त परिवाद के समस्त प्रस्तर मेरे निजी ज्ञान में सत्य एवं सही हैं। कोई तथ्य छिपाया नहीं गया है।

____________________________________
परिवादी के हस्ताक्षर`;

      return {
        subject,
        body: isHi ? bodyHi : bodyEn,
        instructions: [
          'Can be filed physically at the District Consumer Commission or filed online completely paperless at edaakhil.nic.in.',
          'Attach copy of Tax Invoice, bank debit proof, emails/WhatsApp messages exchanged with customer care, and photographs of defect.',
          'Statutory limitation period is 2 years from the date of grievance under Section 69 CPA 2019.',
        ],
      };
    },
  },
  {
    id: 'police-complaint-letter',
    title: 'Police Complaint Letter (Zero FIR / Cyber Crime)',
    titleHi: 'पुलिस शिकायत पत्र (जीरो एफआईआर / साइबर अपराध)',
    category: 'Criminal & Cyber',
    applicableLaw: 'Section 173(1), Bharatiya Nagarik Suraksha Sanhita (BNSS), 2023 / IT Act',
    description: 'Formal written complaint letter to Station House Officer (SHO) or Cyber Crime Cell for registration of FIR under BNS 2023 and IT Act 2000.',
    fields: [
      { id: 'complainantName', label: 'Victim / Complainant Full Name', labelHi: 'शिकायतकर्ता का नाम', placeholder: 'e.g. Amit Sengupta', type: 'text', required: true, helpText: 'Person lodging the complaint.' },
      { id: 'complainantPhone', label: 'Phone Number & Email', labelHi: 'फोन नंबर व ईमेल', placeholder: 'e.g. 9876543210, amit@example.com', type: 'text', required: true, helpText: 'For official police tracking and NCR acknowledgment.' },
      { id: 'complainantAddress', label: 'Permanent / Present Address', labelHi: 'वर्तमान पता', placeholder: 'e.g. Flat 101, Lake View Apts, Salt Lake Sector 5, Kolkata', type: 'textarea', required: true, helpText: 'Address of complainant.' },
      { id: 'policeStation', label: 'Police Station / Cyber Cell Name', labelHi: 'थाना / साइबर सेल का नाम', placeholder: 'e.g. The Station House Officer (SHO), Cyber Crime Police Station / Local PS', type: 'text', required: true, helpText: 'Any police station in India under Zero FIR BNSS s.173(1).' },
      { id: 'incidentDate', label: 'Date & Time of Incident', labelHi: 'घटना की तारीख व समय', placeholder: 'DD/MM/YYYY at approximately HH:MM AM/PM', type: 'text', required: true, helpText: 'When the offense occurred.' },
      { id: 'accusedDetails', label: 'Known Details of Accused / Phone / UPI ID', labelHi: 'आरोपी/संदिग्ध का विवरण', placeholder: 'e.g. Unknown caller claiming to be CBI Officer on +91-98xxxxxx, WhatsApp DP showing police insignia, UPI ID: transfer@okaxis', type: 'textarea', required: true, helpText: 'Phone numbers, bank accounts, email addresses used by scammer.' },
      { id: 'incidentFacts', label: 'Chronological Description of Incident', labelHi: 'घटना का क्रमबद्ध संपूर्ण विवरण', placeholder: 'e.g. Received a video call threatening arrest under false money laundering allegations... Coerced into transferring ₹1,20,000 via RTGS to safe verification account...', type: 'textarea', required: true, helpText: 'Clear factual sequence from start to finish.' },
      { id: 'lossAmount', label: 'Financial Loss (if any, in ₹)', labelHi: 'वित्तीय नुकसान (यदि कोई हो, ₹ में)', placeholder: 'e.g. 120000', type: 'number', required: false, helpText: 'Amount extorted or defrauded.' },
      { id: 'acknowledgmentId', label: '1930 / cybercrime.gov.in Ack No. (if filed)', labelHi: '1930 या साइबर पोर्टल शिकायत संख्या (यदि हो)', placeholder: 'e.g. 2024100412345678', type: 'text', required: false, helpText: 'Helps police tag to existing NCRP ticket.' },
    ],
    generateDoc: (data, lang = 'en') => {
      const isHi = lang === 'hi';
      const subject = isHi
        ? `प्रथम सूचना रिपोर्ट (FIR) दर्ज करने बाबत - अंतर्गत धारा 173(1) BNSS, BNS धारा 318, 308 एवं आईटी एक्ट`
        : `COMPLAINT FOR REGISTRATION OF FIR UNDER SECTION 173(1) BNSS, 2023 READ WITH SECTIONS 318, 308 BNS & SECTION 66D IT ACT`;

      const bodyEn = `To,
The Station House Officer (SHO) / Officer-in-Charge,
${data.policeStation || '[Police Station / Cyber Crime Cell]'}

SUBJECT: ${subject}
INCIDENT DATE & TIME: ${data.incidentDate || '[Date & Time]'}
NCRP 1930 ACKNOWLEDGMENT NO. (IF ANY): ${data.acknowledgmentId || 'Reported on Portal'}

Sir / Madam,

I, ${data.complainantName || '[Complainant Name]'}, residing at ${data.complainantAddress || '[Address]'}, Contact: ${data.complainantPhone || '[Phone]'}, hereby lodge this formal written complaint regarding cognizable criminal offenses committed against me:

1. PARTICULARS OF THE ACCUSED / PERPETRATORS:
${data.accusedDetails || 'Unknown individuals impersonating government authorities via phone numbers...'}

2. DETAILED FACTS OF THE INCIDENT:
${data.incidentFacts || 'The complainant was contacted and unlawfully coerced...'}

3. FINANCIAL LOSS INCURRED:
The Complainant has suffered an unlawful pecuniary loss of ₹${data.lossAmount || '0'} dishonestly induced and extorted by the accused persons.

4. STATUTORY VIOLATIONS:
The acts of the accused clearly constitute cognizable offences under:
   a. Section 318 (Cheating by personation and dishonestly inducing delivery of property) of Bharatiya Nyaya Sanhita, 2023 (formerly s.420 IPC);
   b. Section 308 (Extortion through coercion and threat) of BNS, 2023;
   c. Section 66C and Section 66D (Identity theft and cheating by personation using computer resource) of Information Technology Act, 2000;
   d. Section 204 BNS (Impersonating a public servant).

5. PRAYER:
In view of the above facts, I urgently pray that:
   a. A formal First Information Report (FIR) be registered forthwith under Section 173(1) BNSS, 2023 (including Zero FIR if applicable);
   b. Necessary preservation requests under Section 94 BNSS / Section 91 CrPC be issued to concerned banks and telecom service providers to freeze fraudulent accounts;
   c. Culprits be apprehended and stolen funds recovered.

A stamped copy / acknowledgment receipt of this complaint with Daily Diary (GD) number may kindly be provided to me as per law.

Place: __________________
Date: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}

____________________________________
Complainant Signature:
Name: ${data.complainantName || '[Name]'}
Phone: ${data.complainantPhone || '[Phone]'}`;

      const bodyHi = `सेवा में,
थाना प्रभारी महोदय (SHO) / साइबर क्राइम सेल,
${data.policeStation || '[थाना / साइबर सेल का नाम]'}

विषय: ${subject}
घटना का समय व दिनांक: ${data.incidentDate || '[दिनांक]'}

महोदय,

निवेदन है कि मैं प्रार्थी ${data.complainantName || '[शिकायतकर्ता का नाम]'}, निवासी ${data.complainantAddress || '[पता]'}, मो. ${data.complainantPhone || '[फोन]'}, निम्न संज्ञेय अपराध के विरुद्ध प्राथमिकी दर्ज कराने हेतु आवेदन प्रस्तुत करता/करती हूँ:

1. आरोपी/संदिग्ध का विवरण:
${data.accusedDetails || 'अज्ञात व्यक्ति/कॉल करने वाले का विवरण...'}

2. घटना का संपूर्ण विवरण:
${data.incidentFacts || 'प्रार्थी के साथ छलपूर्वक घटना घटित की गई...'}

3. वित्तीय नुकसान:
उक्त आपराधिक कृत्य से प्रार्थी को ₹${data.lossAmount || '0'} की आर्थिक हानि हुई है।

4. कानून की धाराएं:
उक्त कृत्य भारतीय न्याय संहिता 2023 की धारा 318 (धोखाधड़ी), 308 (जबरन वसूली), एवं सूचना प्रौद्योगिकी अधिनियम की धारा 66D (कंप्यूटर संसाधन द्वारा प्रतिरूपण कर धोखाधड़ी) के तहत गंभीर संज्ञेय अपराध है।

5. प्रार्थना:
अतः श्रीमान से निवेदन है कि मामले की गंभीरता को देखते हुए भारतीय नागरिक सुरक्षा संहिता 2023 की धारा 173(1) अनुसार तत्काल एफआईआर (FIR) दर्ज कर कानूनी कार्रवाई करने एवं बैंक खातों को फ्रीज करने की कृपा करें। आवेदन की रसीद/जीडी नंबर प्रार्थी को प्रदान करें।

दिनांक: ${new Date().toLocaleDateString('hi-IN', { day: 'numeric', month: 'long', year: 'numeric' })}

____________________________________
हस्ताक्षर प्रार्थी
नाम: ${data.complainantName || '[नाम]'}
मो.: ${data.complainantPhone || '[फोन]'}`;

      return {
        subject,
        body: isHi ? bodyHi : bodyEn,
        instructions: [
          'Take 2 printed copies to the Police Station. Get the second copy signed and stamped with a Daily Diary (GD) entry number.',
          'Under Section 173(1) BNSS, police cannot refuse registration on grounds of jurisdiction (Zero FIR).',
          'For cyber crimes, also submit on the national portal cybercrime.gov.in or call 1930 to trigger the banking freeze protocol.',
        ],
      };
    },
  },
];
