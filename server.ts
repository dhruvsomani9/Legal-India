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

// 1. Streaming Legal Chatbot Endpoint (ChatGPT / Gemini style)
app.post('/api/legal/chat/stream', async (req: Request, res: Response) => {
  const { messages = [], language = 'en' } = req.body;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const sendEvent = (data: any) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  try {
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      sendEvent({ error: 'Messages array is required.' });
      res.write('data: [DONE]\n\n');
      res.end();
      return;
    }

    const CHATBOT_INSTRUCTION = `You are "Legal India AI" (लीगल इंडिया एआई), an exceptionally knowledgeable, empathetic, and sharp senior Indian advocate and legal intelligence companion — operating with the natural conversational fluency of Gemini and ChatGPT.

HOW YOU ENGAGE & ASSIST:
1. NATURAL CONVERSATION FIRST:
   - Talk to the citizen with warm empathy, clarity, and authority. Acknowledge the emotional and financial strain of their specific situation.
   - Do NOT sound like an inflexible robot. Write naturally, referencing the specific names, amounts (e.g. ₹50,000, 1.5 Lakhs), cities, and dates they shared.
   - If you need additional facts to give pinpoint legal advice, ask clarifying questions while providing the immediate statutory remedies.

2. SUBSTANTIVE ACCURACY UNDER INDIAN LAW (2024+):
   - Ground your advice firmly in current Indian law:
     * Criminal: Bharatiya Nyaya Sanhita (BNS 2023), BNSS 2023, BSA 2023 (mention former IPC/CrPC in parentheses when helpful, e.g. "Section 318 BNS (formerly Section 420 IPC)").
     * Tenancy: Model Tenancy Act, Transfer of Property Act (s.106) — security deposits cannot be deducted for normal wear and tear.
     * Cheque Bounce: Section 138 Negotiable Instruments Act — strict 30-day notice clock, 15-day payment window, Section 142 complaint before JMFC.
     * Consumer Protection: CPA 2019, e-Daakhil filing, National Consumer Helpline (1915).
     * Cyber Fraud / Digital Arrest: IT Act s.66D, BNS s.308/204. State clearly that Digital Arrest does not exist in Indian law and urge calling 1930 within the Golden Hour.
     * Free Legal Aid: Article 39A & NALSA helpline 15100.

3. STRUCTURED ACTIONABLE ADVICE:
   - Use clean Markdown formatting with clear headings, bold statutory terms, and numbered step-by-step action plans.
   - Include immediate remedies, limitation periods, and notice requirements.

4. MULTILINGUAL:
   - If the user writes in Hindi, Hinglish, Marathi, Tamil, etc., reply warmly and fluently in their language.`;

    // Sanitize message turns for Gemini SDK
    const validMessages = messages.filter(
      (m: any) => m && typeof m.content === 'string' && m.content.trim().length > 0
    );

    const firstUserIdx = validMessages.findIndex((m: any) => m.role === 'user');
    const messagesForAi = firstUserIdx !== -1 ? validMessages.slice(firstUserIdx) : validMessages;

    const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];
    for (const msg of messagesForAi) {
      const role = msg.role === 'model' ? 'model' : 'user';
      if (contents.length > 0 && contents[contents.length - 1].role === role) {
        contents[contents.length - 1].parts[0].text += '\n\n' + msg.content;
      } else {
        contents.push({ role, parts: [{ text: msg.content }] });
      }
    }

    if (contents.length === 0) {
      const fallback = getFallbackChatResponse('', messages, language);
      sendEvent({ text: fallback });
      res.write('data: [DONE]\n\n');
      res.end();
      return;
    }

    // Use gemini-3.1-flash-lite as primary high-performance model with active quota
    const stream = await ai.models.generateContentStream({
      model: 'gemini-3.1-flash-lite',
      contents: contents,
      config: {
        systemInstruction: CHATBOT_INSTRUCTION,
      },
    });

    for await (const chunk of stream) {
      if (chunk.text) {
        sendEvent({ text: chunk.text });
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err: any) {
    console.warn('Streaming error, falling back to comprehensive legal engine:', err?.message || err);
    const lastUserMsg = messages.filter((m: any) => m.role === 'user').pop()?.content || '';
    const fallbackText = getFallbackChatResponse(lastUserMsg, messages, language);

    // Stream fallback smoothly in tokens
    const words = fallbackText.split(' ');
    for (let i = 0; i < words.length; i += 4) {
      const chunk = words.slice(i, i + 4).join(' ') + ' ';
      sendEvent({ text: chunk });
      await new Promise((r) => setTimeout(r, 20));
    }

    res.write('data: [DONE]\n\n');
    res.end();
  }
});

// Standard Legal Chatbot Endpoint (Non-streaming fallback)
app.post('/api/legal/chat', async (req: Request, res: Response) => {
  const { messages = [], language = 'en' } = req.body;
  try {
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: 'Messages array is required.' });
      return;
    }

    const CHATBOT_INSTRUCTION = `You are "Legal India AI" (लीगल इंडिया एआई), an empathetic, knowledgeable, and authoritative senior Indian advocate and access-to-justice guide. Converse naturally and helpfully under current Indian law.`;

    const validMessages = messages.filter(
      (m: any) => m && typeof m.content === 'string' && m.content.trim().length > 0
    );

    const firstUserIdx = validMessages.findIndex((m: any) => m.role === 'user');
    const messagesForAi = firstUserIdx !== -1 ? validMessages.slice(firstUserIdx) : validMessages;

    const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];
    for (const msg of messagesForAi) {
      const role = msg.role === 'model' ? 'model' : 'user';
      if (contents.length > 0 && contents[contents.length - 1].role === role) {
        contents[contents.length - 1].parts[0].text += '\n\n' + msg.content;
      } else {
        contents.push({ role, parts: [{ text: msg.content }] });
      }
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: contents,
      config: {
        systemInstruction: CHATBOT_INSTRUCTION,
      },
    });

    const reply = response.text || getFallbackChatResponse(messages[messages.length - 1]?.content || '', messages, language);
    res.json({ success: true, reply });
  } catch (err: any) {
    console.warn('Gemini chat API fallback activated:', err?.message || err);
    const lastUserMsg = messages.filter((m: any) => m.role === 'user').pop()?.content || '';
    const fallbackReply = getFallbackChatResponse(lastUserMsg, messages, language);
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

function getFallbackChatResponse(
  currentMessage: string,
  history: Array<{ role: string; content: string }>,
  language: string = 'en'
): string {
  const fullConversation = history.map((m) => m.content).join('\n') + '\n' + currentMessage;
  const fullText = fullConversation.toLowerCase();
  const latestText = currentMessage.toLowerCase();

  // 1. Context & Entity Extraction
  const amountMatch = fullConversation.match(/(?:₹|rs\.?|inr)\s?([\d,]+(?:\.\d+)?)|([\d,]+)\s?(?:rupees|lakh|crore|k)/i);
  const detectedAmount = amountMatch ? amountMatch[0] : null;

  const isHindi = language === 'hi' || /[\u0900-\u097F]/.test(currentMessage) || latestText.includes('hindi') || latestText.includes('हिंदी');

  // 2. Specific Follow-Up Intention Handling
  const isAskingToDraft =
    latestText.includes('draft') ||
    latestText.includes('notice') ||
    latestText.includes('format') ||
    latestText.includes('write letter') ||
    latestText.includes('तैयार') ||
    latestText.includes('प्रारूप');

  const isAskingWhatIfRefuses =
    latestText.includes('refuse') ||
    latestText.includes("doesn't pay") ||
    latestText.includes('ignore') ||
    latestText.includes('not pay') ||
    latestText.includes('ना दे') ||
    latestText.includes('मना कर दे');

  const isAskingNextSteps =
    latestText.includes('next') ||
    latestText.includes('what should i do') ||
    latestText.includes('steps') ||
    latestText.includes('आगे क्या');

  // --- Scenario 1: Cheque Bounce (Section 138 NI Act) ---
  if (fullText.includes('cheque') || fullText.includes('check') || fullText.includes('bounce') || fullText.includes('138') || fullText.includes('dishonor')) {
    if (isAskingToDraft) {
      return `### Formal Demand Notice Draft under Section 138 of Negotiable Instruments Act, 1881

**BY REGISTERED POST A.D. / SPEED POST**

**Date:** ${new Date().toLocaleDateString('en-IN')}

**To:**
[Drawer Name]
[Drawer Full Address]

**Subject:** Legal Demand Notice under Section 138 of the Negotiable Instruments Act, 1881 for dishonour of Cheque ${detectedAmount ? `amounting to ${detectedAmount}` : ''}.

**Sir / Madam,**

Under instructions from my client, I hereby serve you with this formal statutory notice:

1. That towards discharge of your legally enforceable debt/liability, you issued Cheque No. [Cheque Number] dated [Cheque Date] drawn on [Bank Name] for ${detectedAmount ? detectedAmount : '₹[Amount]'}.
2. That on presentation, the said cheque was returned unpaid by the bank with the memo dated [Memo Date] endorsing reason: **"Funds Insufficient"**.
3. You are hereby called upon to pay the said sum of ${detectedAmount ? detectedAmount : '₹[Amount]'} within **15 (fifteen) days** from the receipt of this notice.
4. Take notice that failing payment within 15 days, my client shall initiate criminal prosecution against you under Section 138 of the Negotiable Instruments Act before the competent Judicial Magistrate, wherein you shall be liable for imprisonment up to 2 years, fine up to twice the cheque amount, and costs.

Yours faithfully,  
**[Your Name / Advocate]**

---
💡 *You can click **"Draft Notice"** in the top bar to edit, customize, and print this notice instantly!*`;
    }

    if (isAskingWhatIfRefuses) {
      return `### Action If Drawer Refuses or Fails to Pay within 15 Days:

1. **Calculate the 30-Day Court Window:**
   - Once the 15-day statutory payment window expires, you have exactly **30 days** to file a Criminal Complaint under **Section 142(1)(b) of the Negotiable Instruments Act**.
2. **Where to File (Jurisdiction):**
   - Under the 2015 amendment to Section 142(2), file the complaint before the **Metropolitan Magistrate / Judicial Magistrate First Class (JMFC)** in whose jurisdiction **your bank branch** (where you deposited the cheque) is located.
3. **Documents Required for Court:**
   - Original Bounced Cheque
   - Original Bank Return Memo
   - Copy of Statutory Demand Notice served
   - Speed Post Receipt & Online Delivery Tracking Report (proof of service)
4. **Interim Compensation (Section 143A NI Act):**
   - The court can order the accused to deposit up to **20% of the cheque amount** as interim compensation to you during trial!`;
    }

    return `### Legal Remedy for Bounced Cheque (${detectedAmount || 'Section 138 NI Act'})

Under **Section 138 of the Negotiable Instruments Act, 1881**, cheque dishonour is a serious criminal offense punishable with **up to 2 years imprisonment**, or a fine of **twice the cheque amount**, or both.

#### 1. Strict Statutory Timelines:
* **Step 1 (30 Days Clock):** You must dispatch a written **Legal Demand Notice** to the drawer within **30 days** of receiving the bank dishonour memo.
* **Step 2 (15 Days Payment Window):** The drawer gets 15 days from delivery to pay the full amount (${detectedAmount || 'cheque sum'}).
* **Step 3 (30 Days Court Filing):** If they fail to pay within 15 days, you must file a criminal complaint before the Judicial Magistrate within 30 days.

#### 2. Key Procedural Requirements:
* Always send the notice via **Registered Post A.D. or Speed Post** and retain the postal tracking receipt.
* Notice via WhatsApp or Email is also accepted by the Supreme Court as supplementary proof (*In Re: Cognizance for Extension of Limitation*).

Would you like me to draft the formal Section 138 Legal Notice for you right now?`;
  }

  // --- Scenario 2: Tenancy & Security Deposit Refund Dispute ---
  if (fullText.includes('deposit') || fullText.includes('rent') || fullText.includes('landlord') || fullText.includes('tenant') || fullText.includes('flat') || fullText.includes('makan malik')) {
    if (isAskingToDraft) {
      return `### Legal Demand Notice for Refund of Security Deposit

**Date:** ${new Date().toLocaleDateString('en-IN')}

**To:**
[Landlord Name]
[Landlord Address]

**Subject:** Final Legal Demand Notice for Refund of Security Deposit ${detectedAmount ? `amounting to ${detectedAmount}` : ''} for Flat/Premises [Address].

**Sir / Madam,**

1. That I was a tenant in respect of premises situated at [Premises Address] under the Rental Agreement dated [Agreement Date], having deposited a refundable security deposit of ${detectedAmount || '₹[Amount]'}.
2. That I peacefully handed over vacant possession of the premises to you on [Vacating Date] with all electricity, maintenance, and utility bills cleared up to date.
3. That under the **Model Tenancy Act** and settled law, normal wear and tear (including aging paint and minor scuffs) cannot be deducted from a tenant's security deposit.
4. I hereby call upon you to refund the full security deposit sum of ${detectedAmount || '₹[Amount]'} into my bank account within **15 days** from receipt of this notice, failing which I shall initiate:
   - Proceedings before the Rent Court / Rent Authority;
   - A consumer petition on the **e-Daakhil** portal for deficiency in service and unfair trade practice, claiming the principal amount with **18% interest per annum** and litigation damages.

Yours sincerely,  
**[Your Full Name & Contact]**`;
    }

    return `### Tenancy Rights: Refund of Security Deposit (${detectedAmount || 'Dispute'})

Under the **Model Tenancy Act** and settled Supreme Court precedents, security deposit withholding is strictly regulated:

#### 1. Your Statutory Rights:
* **No Deductions for Normal Wear & Tear:** Landlords cannot lawfully deduct money for routine wall repaint, natural aging, or general maintenance.
* **Immediate Refund Requirement:** Once you handover keys and clear electricity/water receipts, the landlord is obligated to return the deposit immediately.
* **Interest on Delayed Refund:** You are entitled to claim **12% to 18% per annum statutory interest** on withheld funds.

#### 2. Immediate Recommended Steps:
1. **Send a 15-Day Legal Demand Notice:** Demanding transfer of ${detectedAmount || 'the security deposit'} to your bank account.
2. **File on e-Daakhil (Consumer Forum):** Withholding tenant deposit constitutes a "deficiency of service" under the **Consumer Protection Act, 2019**. You can file online without hiring an expensive lawyer.
3. **Approach the Rent Authority:** Under state tenancy laws (e.g. Karnataka Rent Act, Delhi Rent Control Act, Maharashtra Rent Control Act).

Would you like me to prepare the formal legal demand notice to send your landlord?`;
  }

  // --- Scenario 3: Cyber Fraud & "Digital Arrest" Scams ---
  if (fullText.includes('digital arrest') || fullText.includes('cbi') || fullText.includes('customs') || fullText.includes('fedex') || fullText.includes('skype') || fullText.includes('video call') || fullText.includes('cyber')) {
    return `🚨 **CRITICAL SAFETY ADVISORY: THIS IS A 100% FAKE "DIGITAL ARREST" SCAM**

Under Indian Law, there is **NO concept of "Digital Arrest"**. This is a transnational extortion syndicate.

#### 1. How Indian Law Actually Operates:
* **No Video Call Arrests:** Under the **Bharatiya Nagarik Suraksha Sanhita (BNSS 2023)**, police, CBI, ED, and customs officials NEVER interrogate, record official statements, or arrest citizens over Skype, WhatsApp, or video calls.
* **No RBI "Verification" Accounts:** No government agency ever directs a citizen to transfer money into any "safe reserve account" for clearance.
* **Offenses Committed Against You:** The scammers are committing criminal impersonation (**Section 204 BNS**), extortion (**Section 308 BNS**), and cyber fraud (**Section 66D IT Act, 2000**).

#### 2. Immediate Emergency Protocol:
1. **Hang Up and Block:** Terminate the call immediately. You face zero legal jeopardy.
2. **If You Already Transferred Money (${detectedAmount || 'funds'}):**
   - **CALL 1930 IMMEDIATELY:** This is the National Cyber Crime Helpline. If reported within the **Golden Hour (first 2 hours)**, nodal officers can freeze the scammer's bank account before withdrawal.
3. **Report Online:** File a complaint at **https://cybercrime.gov.in**.

Do NOT send a single rupee. You have committed no crime!`;
  }

  // --- Scenario 4: Consumer Protection & Defective Goods ---
  if (fullText.includes('amazon') || fullText.includes('flipkart') || fullText.includes('defective') || fullText.includes('damaged') || fullText.includes('refund') || fullText.includes('broken') || fullText.includes('warranty') || fullText.includes('tv') || fullText.includes('phone')) {
    return `### Consumer Rights: Refund & Replacement (${detectedAmount || 'Defective Goods'})

Under the **Consumer Protection Act, 2019 (CPA 2019)** and the **Consumer Protection (E-Commerce) Rules, 2020**:

#### 1. Your Statutory Entitlements:
* **Product Liability (Section 84 CPA 2019):** E-commerce platforms and manufacturers cannot escape liability by pointing to "return window expired" if the product arrived broken, counterfeit, or substandard.
* **Unfair Trade Practice (Section 2(47)):** Refusing return for damaged goods or imposing arbitrary cancellation charges violates CCPA guidelines.
* **Dark Patterns Prohibition:** The Central Consumer Protection Authority (CCPA) 2023 rules prohibit deceptive cancellation traps.

#### 2. Step-by-Step Resolution Roadmap:
1. **National Consumer Helpline (NCH):** Call toll-free **1915** or WhatsApp **8800001915**. Nearly 85% of e-commerce grievances are resolved here within 7 days.
2. **Pre-Litigation Legal Notice:** Give the company a 15-day deadline to replace the item or refund ${detectedAmount || 'the purchase price'}.
3. **File on e-Daakhil Portal (edaakhil.nic.in):**
   - Filing fee is ₹0 for claims up to ₹5 Lakhs!
   - You can attend hearings virtually from home.

Would you like me to draft a Consumer Grievance Notice for you?`;
  }

  // --- Scenario 5: Police Refusing to File FIR / Criminal Complaint ---
  if (fullText.includes('fir') || fullText.includes('police refuse') || fullText.includes('thana') || fullText.includes('station') || fullText.includes('snatch') || fullText.includes('theft')) {
    return `### Rights When Police Refuse to Register an FIR

Under the new **Bharatiya Nagarik Suraksha Sanhita (BNSS 2023)** and the landmark Supreme Court ruling in *Lalita Kumari v. Govt of UP*:

#### 1. Mandatory Statutory Duty:
* **Zero FIR Mandate (Section 173(1) BNSS):** The police MUST register an FIR immediately for any cognizable offense, regardless of where the crime occurred. They cannot dismiss you citing "jurisdiction".
* **Free Copy of FIR (Section 173(2) BNSS):** You have a legal right to receive a copy of the FIR **free of cost** immediately.
* **Criminal Penalty on Errant Officers:** A police officer who refuses to register an FIR commits an offense under **Section 199 BNS (formerly Section 166A IPC)**, punishable with up to **2 years imprisonment**.

#### 2. What To Do Next:
1. **Written Complaint to SP (Section 173(3) BNSS):** Send your complaint by Registered Post to the Superintendent of Police / DCP. The SP is legally mandated to investigate or order registration.
2. **Application to Judicial Magistrate (Section 175(3) BNSS):** Formerly known as Section 156(3) CrPC, a Magistrate can order the police station to register an FIR and submit a status report within 14 days.

Would you like me to draft the Police Complaint letter for you?`;
  }

  // --- Scenario 6: Employment & Unpaid Salary ---
  if (fullText.includes('salary') || fullText.includes('employer') || fullText.includes('job') || fullText.includes('fired') || fullText.includes('resigned') || fullText.includes('pf') || fullText.includes('wages')) {
    return `### Legal Protections for Unpaid Salary & Unlawful Termination

Under the **Payment of Wages Act, 1936**, the **Industrial Disputes Act, 1947**, and Indian Contract Act:

#### 1. Your Rights:
* **Statutory Obligation to Pay:** An employer cannot withhold earned salary, notice pay, or accrued leave balance, even if you resigned without serving complete notice.
* **Illegal Withholding of Documents:** Employers have no legal lien over your relieving letter, experience certificate, or PF dues.
* **Recovery Forum:** You can file a recovery application under **Section 33C(2) of the Industrial Disputes Act** or before the **Labour Commissioner**.

#### 2. Action Steps:
1. Issue a formal **15-day Legal Notice for Recovery of Dues** (${detectedAmount || 'unpaid salary'}) with 18% interest.
2. File an online grievance on the Ministry of Labour portal (**SAMADHAN / Shram Suvidha**).

Would you like a formal Legal Notice to send to your HR / Employer?`;
  }

  // --- Scenario 7: Domestic Violence & Maintenance ---
  if (fullText.includes('wife') || fullText.includes('husband') || fullText.includes('domestic violence') || fullText.includes('maintenance') || fullText.includes('divorce') || fullText.includes('in-laws')) {
    return `### Legal Rights under Domestic Violence & Family Laws

Under the **Protection of Women from Domestic Violence Act, 2005 (PWDVA)** and the **Bharatiya Nagarik Suraksha Sanhita (BNSS 2023)**:

#### 1. Available Protections:
* **Right to Reside in Shared Household (Section 19 PWDVA):** A woman cannot be evicted or excluded from the matrimonial home.
* **Monthly Maintenance (Section 144 BNSS / Section 20 PWDVA):** Right to interim and final financial maintenance for self and children.
* **Protection Orders (Section 18):** Restraining orders preventing the respondent from contacting or committing acts of violence.
* **Cruelty (Section 85 & 86 BNS):** Criminal protection against mental or physical harassment.

#### 2. Immediate Free Assistance:
* **National Women Helpline:** Call **181** (24/7 Toll-Free).
* **Free Government Legal Aid:** Call **15100** (National Legal Services Authority - NALSA) for an assigned free court advocate.`;
  }

  // --- Scenario 8: Right to Information (RTI) ---
  if (fullText.includes('rti') || fullText.includes('information') || fullText.includes('pio') || fullText.includes('government record')) {
    return `### Right to Information (RTI Act, 2005)

Under **Section 6 of the RTI Act, 2005**, every Indian citizen has the statutory right to inspect government records, tenders, road works, and fund disbursements:

1. **Filing Method:** File online at **https://rtionline.gov.in** for Central ministries, or submit physically to the Public Information Officer (PIO) with a ₹10 Postal Order.
2. **Timelines:** The PIO must furnish information within **30 days** (or 48 hours if life and liberty is involved).
3. **Penalties:** Under **Section 20**, a delay without reasonable cause attracts a penalty of **₹250 per day up to ₹25,000** deducted directly from the PIO's salary.`;
  }

  // --- Hindi Response Adaptation ---
  if (isHindi) {
    return `नमस्ते। मैं **लीगल इंडिया एआई (Legal India AI)** हूँ।

मैंने आपके मामले का संज्ञान लिया है${detectedAmount ? ` (राशि: ${detectedAmount})` : ''}। भारतीय कानून के तहत आपके अधिकारों की पूरी सुरक्षा उपलब्ध है:

1. **कानूनी स्थिति:** आपके मामले में उचित कानूनी प्रक्रिया और समय सीमा (Limitation Period) का पालन आवश्यक है।
2. **तत्काल कदम:** संबंधित पक्ष को 15 दिनों का औपचारिक **लीगल डिमांड नोटिस (Legal Demand Notice)** भेजें।
3. **उपाय और मंच:** यदि वे समाधान नहीं करते हैं, तो आप सक्षम न्यायालय, उपभोक्ता फोरम (**e-Daakhil**), या संबंधित प्राधिकरण में वाद प्रस्तुत कर सकते हैं।

आप शीर्ष बार में **"Court Notices"** पर क्लिक करके तुरंत न्यायालयीन प्रारूप तैयार कर सकते हैं। क्या आप चाहते हैं कि मैं आपके लिए यह नोटिस तैयार करूँ?`;
  }

  // --- Default Comprehensive Advisory ---
  return `### Legal Assessment & Guidance under Indian Law

I have noted the details of your legal matter${detectedAmount ? ` involving ${detectedAmount}` : ''}.

Under current Indian statutes (including the **Bharatiya Nyaya Sanhita 2023**, **Consumer Protection Act 2019**, and **Civil Procedure Code**):

#### 1. Key Legal Principles:
* **Limitation Period:** Civil and criminal actions have strict statutory limitation clocks (typically 30 days for cheque bounce notices, 2 years for consumer complaints, 3 years for debt recovery).
* **Documentary Proof:** Preserve all communications (WhatsApp chats, bank statements, invoices, email trails). Under **Section 63 of the Bharatiya Sakshya Adhiniyam, 2023 (BSA)**, electronic records are admissible evidence.

#### 2. Immediate Recommended Steps:
1. **Issue a Formal Legal Demand Notice:** Give the opposing party 15 days to remedy the grievance before initiating litigation.
2. **Free Legal Assistance:** If you need an assigned court advocate, you can dial the NALSA helpline at **15100** (Free Legal Aid under Article 39A).

Could you share a few more specifics (e.g., the city/state where this took place, or the approximate timeline) so I can tailor the exact section and court jurisdiction for you?`;
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
