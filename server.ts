import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Shared server-side Gemini client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const SYSTEM_LEGAL_INSTRUCTION = `You are "Legal India", an expert senior Indian advocate, legal scholar, and access-to-justice guide built to empower India's 1.4 billion people.

CORE ETHICAL & ACCURACY PRINCIPLES:
1. TRUST OVER CLEVERNESS: NEVER invent a section, statute, court case, fee, or limitation period. If retrieval finds nothing solid, say "I am not completely certain; here is how to verify at eCourts or India Code" instead of guessing.
2. CURRENT LAW ONLY (CRITICAL):
   - For all criminal matters arising on or after 1 July 2024, use:
     * Bharatiya Nyaya Sanhita, 2023 (BNS) [NOT Indian Penal Code, 1860]
     * Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS) [NOT Code of Criminal Procedure, 1973]
     * Bharatiya Sakshya Adhiniyam, 2023 (BSA) [NOT Indian Evidence Act, 1872]
   - ALWAYS provide the corresponding old section (IPC / CrPC / IEA) in the \`oldLawMapping\` for historic comparison, clarity, and older pending matters.
   - For other domains:
     * Consumer: Consumer Protection Act, 2019 (CPA 2019) & CCPA 2023 Dark Patterns guidelines.
     * Information Technology: IT Act, 2000 (s.66C, 66D, 43A) & RBI 2017 Zero Liability Circular.
     * Negotiable Instruments: NI Act, 1881 (s.138, 142 - 30 day demand notice, 15 day payment window).
     * Women Safety: BNS s.85/86 (cruelty), s.74-78, Protection of Women from Domestic Violence Act 2005 (PWDVA), POSH Act 2013.
     * Housing: Transfer of Property Act 1882 (s.106) & Model Tenancy Act principles.
     * RTI: Right to Information Act, 2005 (s.6 application, s.7 30 days timeline, s.19 appeals).
     * Labour: Payment of Wages Act, Payment of Gratuity Act, Industrial Disputes Act & new Labour Codes.
     * Motor Vehicles: Motor Vehicles Act 1988 (2019 amendments, DigiLocker validity).
3. SAFETY FIRST (EMERGENCY DETECTION):
   - Detect if this is an urgent emergency: physical assault, ongoing domestic violence, suicide / self-harm, cyber fraud in progress ("Golden Hour"), unlawful detention / imminent arrest.
   - Flag \`isEmergency: true\` and recommend calling:
     * 112 (Police / Emergency)
     * 181 (Women Helpline)
     * 1930 (Citizen Financial Cyber Fraud Helpline - Golden Hour)
     * 15100 (NALSA Free Legal Aid Helpline)
     * 1915 (National Consumer Helpline)
4. STRUCTURED ANSWER:
   - Provide plain language explanation first (jargon-free so any citizen can understand).
   - Exact act, section, and official citation.
   - Prioritized immediate steps.
   - Where to file (Forum, court or online portal like e-Daakhil / cybercrime.gov.in / NALSA).
   - Time limits (Limitation period).
   - Documents needed.
   - Risks and common traps.
   - Appropriate ready-to-use document template id if relevant.
5. LANGUAGE FIDELITY:
   - If user asks in Hindi, respond in Hindi (or English with Hindi transliteration). If requested in Marathi, Tamil, Bengali, Telugu, Gujarati, Kannada, Malayalam, Punjabi, Urdu, adapt the summary and steps directly into that language while keeping statutory section names precise.`;

// 1. Interactive Legal Chatbot Endpoint with Memory
app.post('/api/legal/chat', async (req: Request, res: Response) => {
  try {
    const { messages, language = 'en' } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: 'Messages array is required.' });
      return;
    }

    const CHATBOT_INSTRUCTION = `You are "Legal India Bot" (लीगल इंडिया एआई), an empathetic, knowledgeable, and reliable senior Indian advocate and legal assistant.
You are helping a citizen of India understand their rights and solve their legal problems.

YOUR CORE CONVERSATIONAL INSTRUCTIONS:
1. MEMORY & CONTEXT:
   - You have memory of the entire chat history. Always remember details the citizen shared earlier (e.g. names, amounts, dates, cities, landlords, employers, banks, whether notice was sent).
   - If a citizen asks follow-up questions like "what should I do next?", "draft that notice for me", or "what if they refuse?", refer back to their specific case details.
2. CURRENT INDIAN LAW (2024+):
   - Criminal law: Always use Bharatiya Nyaya Sanhita (BNS 2023), BNSS 2023, and BSA 2023 for offenses from 1 July 2024. Mention old IPC / CrPC sections in parentheses for familiarity (e.g. "Section 318 BNS (formerly Section 420 IPC)").
   - Consumer issues: Consumer Protection Act 2019 (CPA 2019) and e-Daakhil filing.
   - Cheque bounce: Section 138 Negotiable Instruments Act (strict 30-day notice requirement).
   - Tenancy: Transfer of Property Act 1882 (s.106) & Model Tenancy principles (deposit cannot be withheld for ordinary wear and tear).
   - Cyber fraud / Digital Arrest: IT Act s.66D, BNS s.308 (extortion). Mention 1930 Golden hour immediately if financial loss occurred.
   - Free Legal Aid: Article 39A & NALSA helpline 15100 for women, children, workers, custody, low income.
3. CONVERSATIONAL TONE:
   - Calm, reassuring, respectful, easy to understand. Avoid legal jargon without explaining it.
   - Format responses cleanly with bullet points, bold key terms, and clear next steps.
4. EMERGENCY DETECTION:
   - If physical danger, domestic violence, cyber fraud within last 2 hours, or imminent arrest is mentioned, highlight emergency helplines:
     * 112 (Police)
     * 1930 (Cyber Fraud)
     * 181 (Women in Distress)
     * 15100 (NALSA Free Lawyer)
5. MULTILINGUAL:
   - If user asks in Hindi, respond in Hindi (or Hinglish if appropriate). If asked in Marathi, Tamil, Bengali, Telugu, Gujarati, etc., converse naturally in that language while keeping statutory citations accurate.`;

    // Map messages to GenAI contents structure
    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'model' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: contents,
      config: {
        systemInstruction: CHATBOT_INSTRUCTION,
      },
    });

    const reply = response.text || "I understand your legal concern. Could you provide a few more details so I can guide you under the exact Indian statute?";
    res.json({ success: true, reply });
  } catch (err: any) {
    console.error('Error in /api/legal/chat, using fallback bot response:', err);
    const { messages = [] } = req.body;
    const lastUserMsg = messages.filter((m: any) => m.role === 'user').pop()?.content || '';
    const fallbackReply = getFallbackChatResponse(lastUserMsg, messages);
    res.json({ success: true, reply: fallbackReply });
  }
});

// 2. Legal Consultation Endpoint
app.post('/api/legal/consult', async (req: Request, res: Response) => {
  try {
    const { query, language = 'en', category, lawyerMode = false, followUpContext } = req.body;

    if (!query || typeof query !== 'string') {
      res.status(400).json({ error: 'Query is required.' });
      return;
    }

    const promptText = `User Legal Query: "${query}"
Selected Language: ${language}
Category hint: ${category || 'Auto-detect'}
Lawyer Mode: ${lawyerMode ? 'ON (Provide deeper statutory analysis, relevant landmark Supreme Court / High Court precedents, ratio decidendi, and procedural technicalities)' : 'OFF (Focus on plain, accessible citizen language with precise statutory grounding)'}
${followUpContext ? `Prior Context: ${JSON.stringify(followUpContext)}` : ''}

Analyze this legal issue according to current Indian law (BNS 2023, BNSS 2023, BSA 2023, CPA 2019, RTI 2005, IT Act 2000, etc.). Return a clean JSON response adhering to the response schema.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptText,
      config: {
        systemInstruction: SYSTEM_LEGAL_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: {
              type: Type.STRING,
              description: 'Clear, empathetic, jargon-free explanation of what this legal situation means for the citizen in the requested language.',
            },
            isEmergency: {
              type: Type.BOOLEAN,
              description: 'True if immediate physical danger, cyber fraud within last 24h, domestic abuse, or imminent arrest is detected.',
            },
            emergencyType: {
              type: Type.STRING,
              description: 'e.g. CYBER_FRAUD_GOLDEN_HOUR, DOMESTIC_VIOLENCE, IMMINENT_ARREST, PHYSICAL_THREAT, NONE',
            },
            emergencyHelplines: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Emergency numbers to call immediately (e.g. ["1930 (Cyber Fraud)", "112 (Police)"])',
            },
            applicableLaws: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  act: { type: Type.STRING },
                  section: { type: Type.STRING },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  officialUrl: { type: Type.STRING },
                  oldLawMapping: {
                    type: Type.OBJECT,
                    properties: {
                      act: { type: Type.STRING },
                      section: { type: Type.STRING },
                      notes: { type: Type.STRING },
                    },
                  },
                },
                required: ['act', 'section', 'title', 'description'],
              },
            },
            stepsNow: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Step-by-step checklist of what the citizen must do right now, in chronological order.',
            },
            whereToFile: {
              type: Type.OBJECT,
              properties: {
                forum: { type: Type.STRING, description: 'e.g. District Consumer Commission, Cyber Crime Cell, Magistrate Court' },
                jurisdiction: { type: Type.STRING, description: 'How territorial and pecuniary jurisdiction applies.' },
                portalUrl: { type: Type.STRING, description: 'Official government portal url if available, e.g. https://edaakhil.nic.in, https://cybercrime.gov.in, https://nalsa.gov.in' },
                procedure: { type: Type.STRING, description: 'Brief filing procedure or documentation route.' },
              },
              required: ['forum', 'jurisdiction', 'procedure'],
            },
            timeLimits: {
              type: Type.STRING,
              description: 'Limitation period or crucial deadlines under Limitation Act or specific act (e.g. 30 days for s.138 notice, 2 years for CPA 2019 complaint).',
            },
            documentsNeeded: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  document: { type: Type.STRING },
                  why: { type: Type.STRING },
                  optional: { type: Type.BOOLEAN },
                },
                required: ['document', 'why'],
              },
            },
            risksAndCautions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Pitfalls, traps, actions NOT to take, and procedural hazards.',
            },
            suggestedFollowUps: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'At most 2 to 3 targeted follow-up questions to clarify facts if needed.',
            },
            readyDocumentTemplateId: {
              type: Type.STRING,
              description: 'Match with: cheque-bounce-notice, security-deposit-notice, consumer-complaint, police-complaint-letter, rti-application, or none.',
            },
            lawyerAnalysis: {
              type: Type.OBJECT,
              properties: {
                jurisprudence: { type: Type.STRING },
                landmarkPrecedents: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      caseTitle: { type: Type.STRING },
                      citation: { type: Type.STRING },
                      holding: { type: Type.STRING },
                    },
                    required: ['caseTitle', 'holding'],
                  },
                },
                proceduralTechnicalities: { type: Type.STRING },
              },
            },
          },
          required: [
            'summary',
            'isEmergency',
            'applicableLaws',
            'stepsNow',
            'whereToFile',
            'timeLimits',
            'documentsNeeded',
            'risksAndCautions',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, data: parsed });
  } catch (err: any) {
    console.error('Error in /api/legal/consult, using statutory fallback:', err);
    const { query, language = 'en' } = req.body;
    const fallbackData = getFallbackConsultation(query || '', language);
    res.json({ success: true, data: fallbackData });
  }
});

// 2. Scam and Fraud Shield Endpoint
app.post('/api/legal/scam-shield', async (req: Request, res: Response) => {
  try {
    const { suspectText, contextType = 'message' } = req.body;

    if (!suspectText || typeof suspectText !== 'string') {
      res.status(400).json({ error: 'Suspect text is required.' });
      return;
    }

    const promptText = `Analyze the following communication (SMS, WhatsApp message, email, fake arrest warrant, or payment demand) reported by an Indian citizen:

Content to evaluate:
"""
${suspectText}
"""
Context Type: ${contextType}

Perform a forensic legal and behavioral fraud scan under Indian laws:
1. Detect common Indian scam typologies:
   - Digital Arrest Scam (CBI / Mumbai / Delhi Police video call extortion)
   - Electricity Bill / Power cut cutoff warning APK scam
   - Customs / FedEx / DHL Narcotics package scam
   - Part-time Telegram / YouTube video liking task investment scam
   - Illegal Instant Loan App (harassment with morphed photos, unauthorized contact access)
   - Fake Court / Traffic e-Challan payment link
   - Aadhaar / PAN KYC deactivation phishing
2. Identify exact red flags (impersonating officials, coercive timers, APK files, unofficial banking accounts).
3. State exact Indian statutory violations (BNS 2023 s.308 Extortion, s.318 Cheating, s.204 Impersonating public servant, IT Act s.66C/66D).
4. Provide immediate defensive steps and reporting helpline (1930 / cybercrime.gov.in).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptText,
      config: {
        systemInstruction: SYSTEM_LEGAL_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            verdict: {
              type: Type.STRING,
              description: 'CONFIRMED_SCAM, HIGH_RISK_SUSPICIOUS, LIKELY_LEGITIMATE, or UNVERIFIABLE',
            },
            scamCategory: {
              type: Type.STRING,
              description: 'e.g. Digital Arrest Scam, Power Bill Phishing, FedEx Customs Extortion, Loan App Harassment, Fake Challan',
            },
            riskScore: {
              type: Type.INTEGER,
              description: '0 to 100 risk score where 100 is definite fraudulent cyber attack',
            },
            summary: {
              type: Type.STRING,
              description: 'Direct plain-language verdict for the citizen.',
            },
            detectedRedFlags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'List of specific telltale signs in the message.',
            },
            lawsViolatedByPerpetrators: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  statute: { type: Type.STRING },
                  section: { type: Type.STRING },
                  offense: { type: Type.STRING },
                },
                required: ['statute', 'section', 'offense'],
              },
            },
            immediateProtectiveSteps: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Step 1: Do not click / pay; Step 2: Call 1930; etc.',
            },
            emergencyHelplines: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            howGovernmentActuallyWorks: {
              type: Type.STRING,
              description: 'e.g. "Police never arrests citizens via WhatsApp or Skype video call; court summons are served physically by process servers."',
            },
          },
          required: [
            'verdict',
            'riskScore',
            'summary',
            'detectedRedFlags',
            'immediateProtectiveSteps',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, data: parsed });
  } catch (err: any) {
    console.error('Error in /api/legal/scam-shield, using fallback scan:', err);
    const { suspectText } = req.body;
    res.json({ success: true, data: getFallbackScam(suspectText || '') });
  }
});

// 3. Document Analyzer Endpoint
app.post('/api/legal/analyze-doc', async (req: Request, res: Response) => {
  try {
    const { documentText, docType = 'contract_or_notice' } = req.body;

    if (!documentText || typeof documentText !== 'string') {
      res.status(400).json({ error: 'Document text is required.' });
      return;
    }

    const promptText = `Analyze the following Indian legal document / contract / notice / FIR:

Document text:
"""
${documentText}
"""
Document Type: ${docType}

Perform an in-depth review under current Indian law:
1. Executive Summary in plain language (What is this document trying to do to the citizen?)
2. Identified Red Flags and One-Sided Clauses (e.g. Unfair forfeiture, unilateral termination, hidden penalty interest, arbitration in distant state, waiver of consumer rights).
3. Statutory validity and enforceability under Indian law (e.g. Indian Contract Act s.23 & s.28 agreements in restraint of legal proceedings are void).
4. Citizen's rights and recommended counter-strategy / reply.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptText,
      config: {
        systemInstruction: SYSTEM_LEGAL_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            documentTitle: { type: Type.STRING },
            plainLanguageSummary: { type: Type.STRING },
            riskLevel: { type: Type.STRING, description: 'LOW, MEDIUM, HIGH, CRITICAL' },
            oneSidedClauses: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  clauseText: { type: Type.STRING },
                  whyItIsUnfair: { type: Type.STRING },
                  applicableLaw: { type: Type.STRING },
                },
                required: ['clauseText', 'whyItIsUnfair'],
              },
            },
            keyDeadlinesFound: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Deadlines mentioned in notice (e.g. "15 days to respond", "30 days cure period").',
            },
            recommendedActionPlan: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            recommendedReplyStrategy: { type: Type.STRING },
          },
          required: [
            'documentTitle',
            'plainLanguageSummary',
            'riskLevel',
            'oneSidedClauses',
            'recommendedActionPlan',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, data: parsed });
  } catch (err: any) {
    console.error('Error in /api/legal/analyze-doc:', err);
    res.status(500).json({
      error: 'Failed to analyze document.',
      details: err.message || String(err),
    });
  }
});

// 4. Document Engine Auto-Fill Assistant
app.post('/api/legal/autofill-doc', async (req: Request, res: Response) => {
  try {
    const { templateId, userStory } = req.body;

    if (!userStory) {
      res.status(400).json({ error: 'User story is required.' });
      return;
    }

    const promptText = `Template ID: ${templateId}
User's story / situation: "${userStory}"

Extract and infer as many fields as possible for this Indian legal document template. If specific details like dates or addresses are missing, provide clean realistic placeholders or leave empty for user editing.

Return a JSON object of key-value pairs matching standard field IDs (e.g. senderName, receiverName, chequeNumber, chequeAmount, depositAmount, etc.).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptText,
      config: {
        systemInstruction: SYSTEM_LEGAL_INSTRUCTION,
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, data: parsed });
  } catch (err: any) {
    console.error('Error in /api/legal/autofill-doc:', err);
    res.status(500).json({
      error: 'Failed to autofill document.',
      details: err.message || String(err),
    });
  }
});

// Robust Statutory Fallbacks
function getFallbackConsultation(query: string, language: string = 'en') {
  const q = query.toLowerCase();

  if (q.includes('cheque') || q.includes('check') || q.includes('bounce') || q.includes('चेक')) {
    return {
      summary: language === 'hi'
        ? "चेक बाउंस होना एनआई एक्ट की धारा 138 के तहत एक संज्ञेय आपराधिक अपराध है। बैंक से रिटर्न मेमो मिलने के 30 दिनों के भीतर कानूनी मांग नोटिस भेजना अनिवार्य है। यदि चेक जारीकर्ता 15 दिनों में भुगतान नहीं करता, तो सक्षम मजिस्ट्रेट के समक्ष परिवाद दायर किया जा सकता है।"
        : "A bounced cheque is a criminal offence under Section 138 of the Negotiable Instruments Act, 1881. You have a strict 30-day statutory window from the date you received the bank return memo to issue a formal Legal Demand Notice. If the drawer fails to pay within 15 days of receiving your notice, you can file a criminal complaint before the Judicial Magistrate.",
      isEmergency: false,
      emergencyType: "NONE",
      applicableLaws: [
        {
          act: "Negotiable Instruments Act, 1881",
          section: "Section 138 & 142",
          title: "Dishonour of Cheque for Insufficiency of Funds",
          description: "Provides for imprisonment up to 2 years or fine extending up to twice the amount of the cheque, or both.",
          officialUrl: "https://www.indiacode.nic.in/handle/123456789/2189"
        },
        {
          act: "Bharatiya Nyaya Sanhita, 2023",
          section: "Section 318(4)",
          title: "Cheating and dishonestly inducing delivery of property",
          description: "Criminal prosecution for dishonest inducement to deliver goods or money.",
          oldLawMapping: {
            act: "Indian Penal Code, 1860",
            section: "Section 420",
            notes: "Replaced by BNS s.318(4) on 1 July 2024"
          }
        }
      ],
      stepsNow: [
        "Collect the original bounced cheque and the Bank Cheque Return Memo immediately.",
        "Verify the exact date on the Return Memo (your 30-day notice limitation starts from this date).",
        "Issue a statutory Legal Demand Notice via Speed Post or Registered Post A.D. giving 15 days to pay.",
        "Retain the postal receipt and track the delivery acknowledgment online.",
        "If payment is not made within 15 days from delivery, file a complaint before the Judicial Magistrate within the next 30 days."
      ],
      whereToFile: {
        forum: "Court of Judicial Magistrate First Class (JMFC) / Metropolitan Magistrate",
        jurisdiction: "Court having jurisdiction over the branch where your bank account is maintained (where you presented the cheque).",
        procedure: "File criminal complaint under Section 142 NI Act accompanied by affidavit of evidence, original cheque, return memo, and postal delivery report."
      },
      timeLimits: "Notice must be sent within 30 days of receiving bank memo. 15-day payment cure period. Criminal case must be filed within 30 days thereafter.",
      documentsNeeded: [
        { document: "Original Cheque", why: "Primary negotiable instrument evidence", optional: false },
        { document: "Bank Return Memo", why: "Proves date and statutory reason for dishonour", optional: false },
        { document: "Invoice / Debt Agreement", why: "Proves legally enforceable debt or liability", optional: false },
        { document: "Postal Receipt & Delivery Report", why: "Proves service of statutory demand notice", optional: false }
      ],
      risksAndCautions: [
        "Do NOT miss the 30-day notice deadline; limitation delay under s.138 is fatal and cannot be condoned without exceptional grounds.",
        "Ensure the cheque was issued for a legally enforceable debt (not a gift, illegal wager, or unaccounted cash).",
        "Never present the cheque again if notice is already issued."
      ],
      readyDocumentTemplateId: "cheque-bounce-notice"
    };
  }

  if (q.includes('deposit') || q.includes('rent') || q.includes('landlord') || q.includes('tenant') || q.includes('मकान मालिक') || q.includes('किराया')) {
    return {
      summary: language === 'hi'
        ? "मकान खाली करने और शांतिपूर्ण कब्जा सौंपने के बाद मकान मालिक द्वारा सिक्योरिटी डिपॉजिट रोकना गैरकानूनी है। सामान्य टूट-फूट (Ordinary wear & tear) के लिए कटौती नहीं की जा सकती। आप 15 दिनों का कानूनी नोटिस भेजकर पूरी राशि मय ब्याज मांग सकते हैं।"
        : "Your landlord cannot arbitrarily withhold or forfeit your security deposit once you have peacefully vacated the premises and cleared applicable utility dues. Landlords cannot deduct deposit for normal wear and tear (such as ordinary wall fading or minor aging). You have the legal right to demand an itemized repair bill and immediate refund.",
      isEmergency: false,
      emergencyType: "NONE",
      applicableLaws: [
        {
          act: "Model Tenancy Act / State Rent Control Acts",
          section: "Deposit Refund Provisions",
          title: "Protection Against Unlawful Deposit Forfeiture",
          description: "Mandates security deposit refund upon handover of keys, with strict cap on deduction for ordinary wear and tear."
        },
        {
          act: "Bharatiya Nyaya Sanhita, 2023",
          section: "Section 316",
          title: "Criminal Breach of Trust",
          description: "Dishonest misappropriation of property or entrustment by landlord.",
          oldLawMapping: {
            act: "Indian Penal Code, 1860",
            section: "Section 405 / 406",
            notes: "Replaced by BNS s.316 on 1 July 2024"
          }
        }
      ],
      stepsNow: [
        "Gather proof of peaceful handover (WhatsApp chat, email, inspection video, key return acknowledgment).",
        "Compile electricity, water, and maintenance clearance receipts showing zero pending dues.",
        "Send a formal 15-day Legal Demand Notice demanding refund of the deposit via Speed Post and Email.",
        "If no refund is issued, file a grievance before the local Rent Authority or District Consumer Commission for deficiency in service."
      ],
      whereToFile: {
        forum: "Rent Authority / Rent Court or District Consumer Commission",
        jurisdiction: "District where the rented residential premises is located.",
        portalUrl: "https://edaakhil.nic.in",
        procedure: "Issue a 15-day statutory notice; if unresolved, file petition for recovery along with 18% interest and compensation."
      },
      timeLimits: "Limitation period for civil recovery of money is 3 years from the date of vacating the premises (Limitation Act 1963).",
      documentsNeeded: [
        { document: "Registered Rent Agreement", why: "Proves agreed tenancy terms and deposit amount", optional: false },
        { document: "Bank Statement / UPI Receipt", why: "Proves actual payment of security deposit", optional: false },
        { document: "Key Handover Proof / WhatsApp Chat", why: "Proves date of vacating and premises condition", optional: false },
        { document: "Utility Bill Clearance Receipts", why: "Proves no pending bills left by tenant", optional: false }
      ],
      risksAndCautions: [
        "Do not leave the premises without written or electronic acknowledgment of key handover.",
        "Always record a walkthrough video of the flat on the day you vacate to refute false damage claims.",
        "Landlords cannot cut electricity or water to force settlement; doing so is an offense."
      ],
      readyDocumentTemplateId: "security-deposit-notice"
    };
  }

  if (q.includes('digital arrest') || q.includes('cbi') || q.includes('customs') || q.includes('parcel') || q.includes('fedex') || q.includes('apk') || q.includes('cyber')) {
    return {
      summary: language === 'hi'
        ? "यह 100% फर्जी 'डिजिटल अरेस्ट' या साइबर फ्रॉड है। भारत में कोई भी पुलिस, सीबीआई या अदालत स्काइप या व्हाट्सएप वीडियो कॉल पर गिरफ्तारी नहीं करती। किसी भी 'वेरिफिकेशन खाते' में पैसे ट्रांसफर न करें। तुरंत 1930 पर कॉल करें।"
        : "This is a 100% fraudulent 'Digital Arrest' cyber extortion scam. In India, no police officer, CBI official, ED agent, or judicial magistrate ever conducts arrests or trials via WhatsApp or Skype video calls. Government agencies never ask citizens to transfer money to a 'safe verification account'.",
      isEmergency: true,
      emergencyType: "CYBER_FRAUD_GOLDEN_HOUR",
      emergencyHelplines: ["1930 (National Cyber Crime Helpline)", "112 (Police Dispatch)"],
      applicableLaws: [
        {
          act: "Information Technology Act, 2000",
          section: "Section 66D",
          title: "Cheating by personation by using computer resource",
          description: "Punishable with imprisonment up to 3 years and fine."
        },
        {
          act: "Bharatiya Nyaya Sanhita, 2023",
          section: "Section 308 & 318",
          title: "Extortion and Cheating",
          description: "Putting person in fear of injury to extort money, and dishonest deception.",
          oldLawMapping: {
            act: "Indian Penal Code, 1860",
            section: "Section 384 & 420",
            notes: "Replaced by BNS s.308 and s.318"
          }
        }
      ],
      stepsNow: [
        "Immediately disconnect the video call or block the sender. Do NOT transfer any money.",
        "If you already transferred money, call helpline 1930 immediately to trigger the banking Golden Hour account freeze.",
        "Preserve screenshots of the video call, caller phone number, fake badge/letter, and transaction IDs.",
        "Lodge a formal cybercrime complaint at https://cybercrime.gov.in."
      ],
      whereToFile: {
        forum: "National Cyber Crime Reporting Portal (NCRP) & District Cyber Police Station",
        jurisdiction: "Jurisdiction across all India through the I4C Citizen Portal.",
        portalUrl: "https://cybercrime.gov.in",
        procedure: "Report on 1930 helpline within 2 hours; provide bank account number and UPI transaction reference for lien marking."
      },
      timeLimits: "Report within the 'Golden Hour' (first 2-3 hours) for highest chances of freezing stolen funds in recipient bank accounts.",
      documentsNeeded: [
        { document: "Transaction Reference Number (UTR / UPI ID)", why: "Enables banks to freeze the destination account", optional: false },
        { document: "Caller Phone Number & WhatsApp/Skype Handle", why: "Crucial for police CDR and IP tracking", optional: false },
        { document: "Screenshots of Fake Letters / Badges", why: "Physical evidence under BSA Section 63", optional: false }
      ],
      risksAndCautions: [
        "Never obey their demand to 'stay on call in a closed room and tell no one'. This is psychological coercion.",
        "Do not download any APK files or remote desktop apps (AnyDesk, TeamViewer) sent by callers.",
        "Remember: Police arrest warrants are never served over social media."
      ],
      readyDocumentTemplateId: "police-complaint-letter"
    };
  }

  // Default General Advice
  return {
    summary: language === 'hi'
      ? "आपकी स्थिति में भारतीय कानून आपके अधिकारों की रक्षा करता है। आपके पास कानूनी नोटिस भेजने, संबंधित फोरम या उपभोक्ता आयोग में शिकायत करने तथा निःशुल्क सरकारी वकील (NALSA 15100) प्राप्त करने का अधिकार है।"
      : "Under Indian law, you are entitled to statutory legal protection, clear procedural remedies, and the right to seek compensation or restitution before the appropriate judicial authority or commission.",
    isEmergency: false,
    emergencyType: "NONE",
    applicableLaws: [
      {
        act: "Constitution of India",
        section: "Article 39A & Article 21",
        title: "Right to Free Legal Aid and Due Process",
        description: "Guarantees equal justice and free advocate assistance through DLSA for citizens."
      },
      {
        act: "Consumer Protection Act, 2019 / Bharatiya Nyaya Sanhita, 2023",
        section: "Applicable Statutory Remedy",
        title: "Protection of Citizen Rights & Redressal",
        description: "Provides for civil remedies, compensation for deficiency, and criminal accountability."
      }
    ],
    stepsNow: [
      "Document and preserve all communications, invoices, messages, and bank records.",
      "Send a formal written Legal Notice giving 15 to 30 days to resolve the grievance peacefully.",
      "If unheeded, approach the competent District Forum, Police Cyber Cell, or DLSA (call 15100).",
      "Track deadlines: Most civil claims have a 3-year limitation clock; consumer complaints have 2 years."
    ],
    whereToFile: {
      forum: "District Consumer Disputes Redressal Commission / Civil Court / DLSA",
      jurisdiction: "Forum having territorial jurisdiction where cause of action arose or where opponent resides.",
      portalUrl: "https://edaakhil.nic.in",
      procedure: "Submit formal complaint with supporting evidence and affidavit."
    },
    timeLimits: "Standard limitation period is 2 years for consumer complaints and 3 years for civil claims from the date cause of action arose.",
    documentsNeeded: [
      { document: "Proof of Transaction / Agreement", why: "Establishes legal relationship and consideration", optional: false },
      { document: "Written Communications / Reminders", why: "Proves bona fide attempts to resolve dispute", optional: false }
    ],
    risksAndCautions: [
      "Do not agree to verbal compromises without written, signed confirmation.",
      "Watch the statutory limitation calendar carefully.",
      "Seek free legal aid from DLSA if you cannot afford a private advocate."
    ],
    readyDocumentTemplateId: "consumer-complaint"
  };
}

function getFallbackScam(text: string) {
  const t = text.toLowerCase();
  const isHighScam = t.includes('digital arrest') || t.includes('cbi') || t.includes('skype') || t.includes('apk') || t.includes('customs') || t.includes('narcotics') || t.includes('power cut') || t.includes('disconnected') || t.includes('part-time');

  return {
    verdict: isHighScam ? "CONFIRMED_SCAM" : "HIGH_RISK_SUSPICIOUS",
    scamCategory: t.includes('arrest') ? "Digital Arrest Impersonation Scam" : t.includes('power') || t.includes('bill') ? "Electricity Bill Phishing APK Scam" : "Cyber Extortion & Phishing",
    riskScore: isHighScam ? 95 : 75,
    summary: isHighScam
      ? "This message is a confirmed cyber scam. Government agencies, police, electricity boards, and courts never demand immediate fund transfers or threaten video-call arrests."
      : "This message exhibits strong red flags typical of phishing attacks and financial extortion under Indian cybercrime typologies.",
    detectedRedFlags: [
      "Urgent fear-inducing countdown or threat of immediate arrest / power disconnection",
      "Demands payment or verification to an unverified private bank account or UPI ID",
      "Unofficial communication channels (WhatsApp, Skype, personal mobile numbers instead of official government domains)",
      "Requests to install unknown third-party APK files or remote sharing apps"
    ],
    lawsViolatedByPerpetrators: [
      { statute: "Information Technology Act, 2000", section: "Section 66D", offense: "Cheating by personation using computer resource" },
      { statute: "Bharatiya Nyaya Sanhita, 2023", section: "Section 308", offense: "Extortion by putting person in fear of injury" },
      { statute: "Bharatiya Nyaya Sanhita, 2023", section: "Section 204", offense: "Impersonating a public servant" }
    ],
    immediateProtectiveSteps: [
      "Do NOT click any link, do not transfer any money, and do not download APK files.",
      "Block the sender on WhatsApp, phone, and email immediately.",
      "If money was transferred, call 1930 immediately to freeze recipient accounts in the Golden Hour.",
      "Report the scam on the national portal at https://cybercrime.gov.in."
    ],
    emergencyHelplines: ["1930 (National Cyber Crime Helpline)", "112 (Police Dispatch)"],
    howGovernmentActuallyWorks: "Police and investigating agencies never arrest citizens or record statements over video calls. All legitimate legal notices are served physically by authorized process servers with court stamps."
  };
}

function getFallbackChatResponse(currentMessage: string, history: Array<{ role: string; content: string }>): string {
  const fullText = (history.map(m => m.content).join(' ') + ' ' + currentMessage).toLowerCase();

  if (fullText.includes('cheque') || fullText.includes('check') || fullText.includes('bounce') || fullText.includes('138')) {
    return `Regarding your bounced cheque matter under **Section 138 of the Negotiable Instruments Act, 1881**:

1. **Strict 30-Day Notice Clock:** You must issue a formal Legal Demand Notice within 30 days of receiving the bank memo.
2. **15-Day Payment Window:** The drawer has 15 days from delivery of your notice to pay the full amount.
3. **Court Complaint:** If they fail to pay, you have 30 days after the 15-day window to file a criminal complaint before the Judicial Magistrate.
4. **Punishment:** Up to 2 years imprisonment, or fine up to twice the cheque amount, or both.

You can use our **Draft Legal Notices** section to generate a court-compliant Section 138 Notice in 1 click! Would you like me to guide you on how to serve it via Speed Post?`;
  }

  if (fullText.includes('deposit') || fullText.includes('rent') || fullText.includes('landlord') || fullText.includes('tenant')) {
    return `Regarding your tenancy and security deposit dispute:

1. **Lawful Right to Refund:** Under the **Model Tenancy Act** and state tenancy laws, the landlord cannot forfeit your security deposit once you have handed over keys and cleared electricity/utility bills.
2. **No Deduction for Wear & Tear:** Landlords cannot charge you for normal wall fading, aging, or routine repainting.
3. **Immediate Step:** Send a formal 15-day Legal Demand Notice demanding refund of the deposit amount along with 18% per annum interest.
4. **Remedy Forum:** If they fail to pay, you can approach the local Rent Authority or file a consumer petition for deficiency in service on the **e-Daakhil** portal.

Would you like me to prepare the legal demand notice for your landlord with your specific deposit amount?`;
  }

  if (fullText.includes('digital arrest') || fullText.includes('cbi') || fullText.includes('customs') || fullText.includes('parcel') || fullText.includes('skype')) {
    return `⚠️ **CRITICAL WARNING:** This is a **100% fake "Digital Arrest" extortion scam**.

1. **No Police or CBI Official arrests over Skype or WhatsApp:** In India, police never issue warrants or interrogate citizens over video calls.
2. **Never Transfer Any Money:** Government agencies never ask you to transfer funds to any "safe RBI verification account".
3. **If you already sent money:** Immediately call **1930** (Citizen Cyber Fraud Helpline) within the Golden Hour so banks can freeze the scammer's account.
4. **Report:** File a complaint at **cybercrime.gov.in**.

Hang up the call immediately. You have committed no crime!`;
  }

  if (fullText.includes('fir') || fullText.includes('police refuse') || fullText.includes('station')) {
    return `If the police station is refusing to register your FIR:

1. **Zero FIR Right (Section 173(1) BNSS):** Under the new **Bharatiya Nagarik Suraksha Sanhita (BNSS 2023)**, police **must** register a Zero FIR regardless of where the crime took place. They cannot turn you away citing territorial jurisdiction.
2. **Penalty on Police:** Refusing to record an FIR for cognizable crimes is a punishable offense under **Section 199 BNS (formerly Section 166A IPC)**.
3. **Next Step:** You can send your written complaint to the Superintendent of Police (SP) by Registered Post under Section 173(3) BNSS or file an application directly before the Judicial Magistrate under Section 175(3) BNSS.

Would you like me to draft a formal Police Complaint Letter for you?`;
  }

  return `I am here to assist you with your legal query under Indian law.

To give you the most accurate advice:
1. **What type of issue is this?** (e.g. money dispute, tenancy/deposit, cyber fraud, defective goods, criminal matter)
2. **When did this happen?** (Important for checking limitation deadlines)
3. **Do you have written proof?** (Invoices, WhatsApp chats, agreements, or bank memos)

Tell me the details in your own words, and I will outline your rights under current statutes like the **Bharatiya Nyaya Sanhita (BNS 2023)**, **Consumer Protection Act**, or **NI Act**, and tell you what steps to take right now.`;
}

// Setup Vite in Dev or Static in Production
async function setupServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Legal India Server running on port ${PORT}`);
  });
}

setupServer();
