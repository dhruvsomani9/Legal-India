/**
 * Legal India - Authoritative Indian Statutory Corpus & Data Mapping
 * Includes BNS (2023), BNSS (2023), BSA (2023), IPC, CrPC, CPA 2019,
 * RTI 2005, NI Act s.138, IT Act 2000, PWDVA 2005, POSH 2013, Limitation Act.
 */

export interface EmergencyHelpline {
  number: string;
  name: string;
  description: string;
  category: 'police' | 'women' | 'cyber' | 'legal_aid' | 'consumer' | 'children' | 'seniors';
  whenToCall: string;
  actionTip: string;
}

export const EMERGENCY_HELPLINES: EmergencyHelpline[] = [
  {
    number: '112',
    name: 'National Emergency Helpline',
    description: 'Police, fire, ambulance all-in-one emergency dispatch across all States & UTs.',
    category: 'police',
    whenToCall: 'Immediate physical danger, domestic violence, assault, unlawful detention.',
    actionTip: 'State your exact GPS location, nearby landmarks, and whether the perpetrator is armed.',
  },
  {
    number: '1930',
    name: 'Citizen Financial Cyber Fraud Helpline',
    description: 'MHA National Cyber Crime Reporting Portal helpline (I4C).',
    category: 'cyber',
    whenToCall: 'Financial cyber fraud, unauthorized UPI/bank debit, OTP fraud, digital arrest scam.',
    actionTip: 'Call within the "Golden Hour" (first 2-3 hours) so nodal banks can freeze fraudulent beneficiary accounts.',
  },
  {
    number: '181',
    name: 'Women Helpline (Domestic Abuse & Distress)',
    description: '24/7 dedicated helpline for women facing violence, harassment, or dowry torture.',
    category: 'women',
    whenToCall: 'Domestic violence, sexual harassment, stalking, dowry demands, forced confinement.',
    actionTip: 'Provides emergency rescue, shelter referrals, medical aid, and Protection Officer contact.',
  },
  {
    number: '15100',
    name: 'NALSA Free Legal Aid Helpline',
    description: 'National Legal Services Authority (DLSA / TLSC) round-the-clock legal assistance.',
    category: 'legal_aid',
    whenToCall: 'Arrested or facing prosecution and cannot afford a lawyer, or eligible under s.12 LSA Act.',
    actionTip: 'Free legal aid is a statutory right under Article 39A for women, children, SC/ST, and custody detainees.',
  },
  {
    number: '1915',
    name: 'National Consumer Helpline (NCH)',
    description: 'Ministry of Consumer Affairs portal for consumer dispute grievance registration.',
    category: 'consumer',
    whenToCall: 'Defective products, refusal of refund, deceptive billing, airline/e-commerce refusal.',
    actionTip: 'Keep invoice number, transaction ID, seller email, and grievance docket number ready.',
  },
  {
    number: '1098',
    name: 'Childline India',
    description: '24/7 emergency outreach service for children in need of care and protection.',
    category: 'children',
    whenToCall: 'Child abuse, child labour, missing child, runaway child.',
    actionTip: 'Confidential reporting with emergency rehabilitation intervention.',
  },
  {
    number: '14567',
    name: 'Elderline (Senior Citizens Helpline)',
    description: 'Ministry of Social Justice helpline for elderly care, abuse, and legal maintenance.',
    category: 'seniors',
    whenToCall: 'Senior citizen abandonment, physical abuse, eviction by children, pension harassment.',
    actionTip: 'Connects directly with Maintenance Tribunals under the Senior Citizens Act 2007.',
  },
];

export interface CriminalSectionMap {
  offense: string;
  category: string;
  bnsSection: string;
  bnsTitle: string;
  oldIpcSection: string;
  oldIpcTitle: string;
  punishment: string;
  bailable: boolean;
  cognizable: boolean;
  keyChanges: string;
  sourceUrl: string;
}

export const CRIMINAL_LAW_MAPPINGS: CriminalSectionMap[] = [
  {
    offense: 'Theft',
    category: 'Property Crimes',
    bnsSection: 'Section 303',
    bnsTitle: 'Theft',
    oldIpcSection: 'Section 378 / 379',
    oldIpcTitle: 'Theft / Punishment for Theft',
    punishment: 'Up to 3 years imprisonment or fine or both. Community service added for petty theft under Rs 5,000 upon return of property.',
    bailable: false,
    cognizable: true,
    keyChanges: 'Introduced community service as an alternative punishment for first-time petty theft under Rs 5,000 if property restored.',
    sourceUrl: 'https://www.indiacode.nic.in/handle/123456789/21825',
  },
  {
    offense: 'Cheating and Dishonestly Inducing Delivery of Property',
    category: 'Fraud & Financial Crimes',
    bnsSection: 'Section 318',
    bnsTitle: 'Cheating',
    oldIpcSection: 'Section 415 / 420',
    oldIpcTitle: 'Cheating / Cheating and dishonestly inducing delivery of property',
    punishment: 'Up to 7 years imprisonment and fine (s.318(4) for aggravated cheating).',
    bailable: false,
    cognizable: true,
    keyChanges: 'Streamlined old IPC 415, 417, 419, 420 into Section 318 subsections; clear digital deception inclusion.',
    sourceUrl: 'https://www.indiacode.nic.in/handle/123456789/21825',
  },
  {
    offense: 'Criminal Breach of Trust',
    category: 'Fraud & Financial Crimes',
    bnsSection: 'Section 316',
    bnsTitle: 'Criminal Breach of Trust',
    oldIpcSection: 'Section 405 / 406',
    oldIpcTitle: 'Criminal Breach of Trust / Punishment',
    punishment: 'Up to 5 years imprisonment or fine or both.',
    bailable: false,
    cognizable: true,
    keyChanges: 'Reorganized subsections with increased threshold and clarity for directors, bankers, and agents.',
    sourceUrl: 'https://www.indiacode.nic.in/handle/123456789/21825',
  },
  {
    offense: 'Extortion and Blackmail',
    category: 'Coercion & Cyber Harassment',
    bnsSection: 'Section 308',
    bnsTitle: 'Extortion',
    oldIpcSection: 'Section 383 / 384',
    oldIpcTitle: 'Extortion / Punishment for Extortion',
    punishment: 'Up to 7 years imprisonment or fine or both.',
    bailable: false,
    cognizable: true,
    keyChanges: 'Covers electronic threats, digital extortion, and coerced digital financial transfers.',
    sourceUrl: 'https://www.indiacode.nic.in/handle/123456789/21825',
  },
  {
    offense: 'Cruelty by Husband or Relatives (Dowry Harassment)',
    category: 'Women Safety',
    bnsSection: 'Section 85 & 86',
    bnsTitle: 'Cruelty to a woman by husband or relatives of husband',
    oldIpcSection: 'Section 498A',
    oldIpcTitle: 'Husband or relative of husband subjecting woman to cruelty',
    punishment: 'Up to 3 years imprisonment and fine.',
    bailable: false,
    cognizable: true,
    keyChanges: 'Split into Section 85 (punishment) and Section 86 (statutory definition of cruelty including mental and physical torture).',
    sourceUrl: 'https://www.indiacode.nic.in/handle/123456789/21825',
  },
  {
    offense: 'Dowry Death',
    category: 'Women Safety',
    bnsSection: 'Section 80',
    bnsTitle: 'Dowry Death',
    oldIpcSection: 'Section 304B',
    oldIpcTitle: 'Dowry death',
    punishment: 'Imprisonment not less than 7 years, extending to imprisonment for life.',
    bailable: false,
    cognizable: true,
    keyChanges: 'Strict evidentiary presumption maintained; linked with BSA section 84 (formerly 113B IEA).',
    sourceUrl: 'https://www.indiacode.nic.in/handle/123456789/21825',
  },
  {
    offense: 'Assault or Criminal Force to Woman with Intent to Outrage Modesty',
    category: 'Women Safety',
    bnsSection: 'Section 74',
    bnsTitle: 'Assault or criminal force to woman with intent to outrage her modesty',
    oldIpcSection: 'Section 354',
    oldIpcTitle: 'Assault or criminal force to woman with intent to outrage modesty',
    punishment: 'Imprisonment 1 to 5 years, and fine.',
    bailable: false,
    cognizable: true,
    keyChanges: 'Includes specific provisions for digital stalking (s.78) and voyeurism (s.77).',
    sourceUrl: 'https://www.indiacode.nic.in/handle/123456789/21825',
  },
  {
    offense: 'Voluntarily Causing Hurt / Grievous Hurt',
    category: 'Bodily Harm',
    bnsSection: 'Section 115 / 117',
    bnsTitle: 'Voluntarily Causing Hurt / Grievous Hurt',
    oldIpcSection: 'Section 323 / 325',
    oldIpcTitle: 'Voluntarily causing hurt / Grievous hurt',
    punishment: 'Hurt: up to 1 year or Rs 10,000 fine. Grievous Hurt: up to 7 years and fine.',
    bailable: true, // Simple hurt is bailable
    cognizable: false, // Simple hurt is non-cognizable
    keyChanges: 'Enhanced monetary fines; medical certification timelines reinforced under BNSS.',
    sourceUrl: 'https://www.indiacode.nic.in/handle/123456789/21825',
  },
  {
    offense: 'Murder',
    category: 'Bodily Harm',
    bnsSection: 'Section 103',
    bnsTitle: 'Punishment for Murder',
    oldIpcSection: 'Section 302',
    oldIpcTitle: 'Punishment for murder',
    punishment: 'Death or imprisonment for life, and fine. Specific clause (s.103(2)) for mob lynching based on race, caste, sex, language.',
    bailable: false,
    cognizable: true,
    keyChanges: 'Explicit standalone penalty for mob lynching / hate crimes (Section 103(2)).',
    sourceUrl: 'https://www.indiacode.nic.in/handle/123456789/21825',
  },
  {
    offense: 'Criminal Intimidation and Threatening',
    category: 'Public Order & Harassment',
    bnsSection: 'Section 351',
    bnsTitle: 'Criminal Intimidation',
    oldIpcSection: 'Section 503 / 506',
    oldIpcTitle: 'Criminal intimidation / Punishment',
    punishment: 'Up to 2 years, or up to 7 years if threat to cause death or grievous hurt.',
    bailable: true,
    cognizable: false,
    keyChanges: 'Consolidates threat provisions with explicit mention of electronic communications.',
    sourceUrl: 'https://www.indiacode.nic.in/handle/123456789/21825',
  },
  {
    offense: 'Defamation',
    category: 'Reputation & Civil-Criminal',
    bnsSection: 'Section 356',
    bnsTitle: 'Defamation',
    oldIpcSection: 'Section 499 / 500',
    oldIpcTitle: 'Defamation / Punishment for defamation',
    punishment: 'Simple imprisonment up to 2 years, or fine, or both, or community service.',
    bailable: true,
    cognizable: false,
    keyChanges: 'Community service introduced as a statutory alternative to incarceration.',
    sourceUrl: 'https://www.indiacode.nic.in/handle/123456789/21825',
  },
  {
    offense: 'Forgery & Making False Electronic Record',
    category: 'Fraud & Financial Crimes',
    bnsSection: 'Section 336 / 338',
    bnsTitle: 'Forgery / Forgery for purpose of cheating',
    oldIpcSection: 'Section 463 / 468',
    oldIpcTitle: 'Forgery / Forgery for purpose of cheating',
    punishment: 'Up to 7 years imprisonment and fine.',
    bailable: false,
    cognizable: true,
    keyChanges: 'Integrates electronic seals, digital signatures, and metadata manipulation into primary definitions.',
    sourceUrl: 'https://www.indiacode.nic.in/handle/123456789/21825',
  },
];

export interface ProcedureMap {
  topic: string;
  bnssSection: string;
  crpcSection: string;
  ruleExplanation: string;
  practicalRight: string;
}

export const PROCEDURAL_LAW_MAPPINGS: ProcedureMap[] = [
  {
    topic: 'Zero FIR (Registration at ANY Police Station)',
    bnssSection: 'Section 173(1) BNSS',
    crpcSection: 'Section 154 CrPC (via judicial guidelines)',
    ruleExplanation: 'Police MUST register an FIR regardless of territorial jurisdiction where the crime occurred. It is then transferred to the jurisdictional police station.',
    practicalRight: 'If an SHO refuses to lodge your FIR saying "it happened in another area", cite Section 173(1) BNSS. Refusal is punishable under Section 199 BNS (old 166A IPC).',
  },
  {
    topic: 'Arrest Safeguards & Right to Inform Relative',
    bnssSection: 'Section 35 to 37 BNSS',
    crpcSection: 'Section 41 to 41D CrPC / D.K. Basu Guidelines',
    ruleExplanation: 'Police must prepare an arrest memo signed by at least one family or community witness, allow immediate call to family/lawyer, and conduct medical exam every 48 hours.',
    practicalRight: 'Arrest without warrant for offenses punishable under 7 years requires written reasons by IO (Arnesh Kumar rule codified). For senior citizens/infirm persons, prior SP permission is mandatory.',
  },
  {
    topic: 'Arrest of Women',
    bnssSection: 'Section 43(1) proviso BNSS',
    crpcSection: 'Section 46(4) CrPC',
    ruleExplanation: 'No woman shall be arrested after sunset and before sunrise except under exceptional circumstances and only with prior written permission of Judicial Magistrate.',
    practicalRight: 'Female police officer MUST be present for any search or arrest of a woman.',
  },
  {
    topic: 'Mandatory Audio-Video Recording of Search & Seizure',
    bnssSection: 'Section 105 BNSS',
    crpcSection: 'New provision in BNSS (formerly informal)',
    ruleExplanation: 'Search of premises, seizure of property, and preparation of seizure list MUST be recorded through audio-video electronic means (e.g. body cam / mobile).',
    practicalRight: 'Any seizure conducted without digital recording can be challenged in trial for violation of statutory procedural safeguards.',
  },
  {
    topic: 'Default Bail (Incomplete Investigation)',
    bnssSection: 'Section 187 BNSS',
    crpcSection: 'Section 167(2) CrPC',
    ruleExplanation: 'Police custody can be taken in tranches across 40 or 60 days. Default bail rights apply if chargesheet is not filed within 60 or 90 days.',
    practicalRight: 'Accused has an indefeasible right to statutory bail on the 61st or 91st day if police fail to file the final chargesheet.',
  },
  {
    topic: 'Anticipatory Bail & Regular Bail',
    bnssSection: 'Section 482 & Section 480 BNSS',
    crpcSection: 'Section 438 & Section 437 CrPC',
    ruleExplanation: 'Application for bail in anticipation of arrest can be made directly before Court of Session or High Court.',
    practicalRight: 'Court may impose conditions but cannot arbitrarily deny anticipatory bail if applicant cooperates with probe.',
  },
  {
    topic: 'First-Time Offender Undertrial Relief',
    bnssSection: 'Section 479 BNSS',
    crpcSection: 'Section 436A CrPC',
    ruleExplanation: 'A first-time undertrial offender (not facing death/life imprisonment) who has undergone one-third of the maximum sentence MUST be released on bail.',
    practicalRight: 'Jail Superintendent must submit an application directly to the court upon completion of 1/3rd detention period.',
  },
];

export interface RightsCardData {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  badge: string;
  icon: string;
  keyRule: string;
  rights: { title: string; detail: string; statute: string }[];
  emergencyContact: string;
  proTip: string;
}

export const RIGHTS_CARDS: RightsCardData[] = [
  {
    id: 'arrest-rights',
    title: 'Your Rights When Detained or Arrested',
    subtitle: 'Constitutional & BNSS Protections for Every Citizen',
    category: 'Criminal Procedure',
    badge: 'Crucial Freedom',
    icon: 'ShieldAlert',
    keyRule: 'Article 22(1) Constitution & BNSS s.35-37 guarantee right to know grounds and consult an advocate immediately.',
    rights: [
      {
        title: 'Right to Know Reasons of Arrest',
        detail: 'Police must show identification, state exact offenses, and inform if the offense is bailable or non-bailable.',
        statute: 'BNSS Section 47',
      },
      {
        title: 'Right to Inform a Relative or Friend',
        detail: 'Police station designated officer must immediately allow you to call one family member or trusted friend.',
        statute: 'BNSS Section 37',
      },
      {
        title: 'Right to Free Legal Aid (NALSA)',
        detail: 'If you cannot afford a lawyer, the state must appoint a Legal Aid Defence Counsel at no cost.',
        statute: 'Article 39A & NALSA 15100',
      },
      {
        title: 'Mandatory Medical Examination',
        detail: 'Must be examined by a registered medical officer immediately upon arrest and every 48 hours to prevent torture.',
        statute: 'BNSS Section 53',
      },
      {
        title: '24-Hour Magistrate Production',
        detail: 'Must be produced before the nearest Judicial Magistrate within 24 hours (excluding journey time).',
        statute: 'Article 22(2) & BNSS s.58',
      },
      {
        title: 'Arrest of Women Protection',
        detail: 'Cannot be arrested between sunset and sunrise without special Magistrate order; female officer mandatory.',
        statute: 'BNSS Section 43(1)',
      },
    ],
    emergencyContact: 'NALSA Legal Aid: 15100 | Police: 112',
    proTip: 'Do not sign any blank paper or unread confession. Police confessions are inadmissible in court under BSA s.23.',
  },
  {
    id: 'tenancy-rights',
    title: 'Your Rights as a Tenant in India',
    subtitle: 'Protection Against Arbitrary Eviction & Deposit Forfeiture',
    category: 'Tenancy & Housing',
    badge: 'Housing Law',
    icon: 'Home',
    keyRule: 'Landlord cannot evict without formal notice or cut water/electricity as coercive tactics.',
    rights: [
      {
        title: 'Security Deposit Deduction Limits',
        detail: 'Deposit cannot be deducted for ordinary wear and tear. Itemized invoice of actual repairs is mandatory.',
        statute: 'Model Tenancy Act / State Rent Control',
      },
      {
        title: 'Notice Period Before Eviction',
        detail: 'Landlord must give at least 30 days written notice (or period stated in registered agreement) before demanding possession.',
        statute: 'Transfer of Property Act s.106',
      },
      {
        title: 'Protection from Essential Service Cutoffs',
        detail: 'Cutting water, power, or lift access to force eviction is illegal and punishable; Rent Authority can impose heavy penalties.',
        statute: 'Model Tenancy Act s.20',
      },
      {
        title: 'Right to 24-Hour Entry Notice',
        detail: 'Landlord cannot enter your rented premises unannounced; minimum 24 hours written/electronic notice required.',
        statute: 'Model Tenancy Act s.15',
      },
      {
        title: 'Rent Receipt Entitlement',
        detail: 'Tenant is legally entitled to signed receipt / digital acknowledgment for every monthly rent payment.',
        statute: 'State Rent Control Acts',
      },
    ],
    emergencyContact: 'District Legal Services Authority: 15100',
    proTip: 'Always send rent via UPI/bank transfer with description "Rent for [Month, Year]". Never pay in cash without signed receipt.',
  },
  {
    id: 'cyber-fraud-rights',
    title: 'Your Rights Against Cyber Scams & Bank Fraud',
    subtitle: 'Golden Hour Protocol & RBI Zero Liability Protection',
    category: 'Cyber & Banking',
    badge: 'Money Recovery',
    icon: 'Laptop',
    keyRule: 'Report fraud within 3 days to get 100% RBI Zero Liability refund for unauthorized bank debits.',
    rights: [
      {
        title: 'Golden Hour Freeze (1930 / cybercrime.gov.in)',
        detail: 'Calling 1930 immediately triggers automated hold on beneficiary accounts through Indian Cyber Crime Coordination Centre (I4C).',
        statute: 'IT Act s.66D & I4C Framework',
      },
      {
        title: 'RBI Zero Liability Circular',
        detail: 'If you notify your bank within 3 working days of unauthorized electronic transaction where you did not share credentials, bank must reverse the amount.',
        statute: 'RBI Circular DBR.No.Leg.BC.78/2017-18',
      },
      {
        title: 'Right to Digital Evidence Preservation',
        detail: 'Police/Bank cannot dismiss cyber fraud complaint; banks must credit shadow balance within 10 working days.',
        statute: 'RBI Banking Ombudsman Scheme',
      },
      {
        title: 'Digital Arrest Scam Protection',
        detail: 'No police, CBI, ED, or court ever conducts arrests or demands money over WhatsApp / Skype video calls. Such calls are 100% fake.',
        statute: 'BNS s.308 (Extortion) & s.318 (Cheating)',
      },
    ],
    emergencyContact: 'National Cyber Fraud Helpline: 1930 | cybercrime.gov.in',
    proTip: 'Never delete WhatsApp chat, transaction SMS, or fake notice screenshots. They serve as primary evidence under BSA Section 63.',
  },
  {
    id: 'consumer-rights',
    title: 'Your Rights as a Consumer (CPA 2019)',
    subtitle: 'Defective Goods, Online Shopping Refusals & Unfair Practices',
    category: 'Consumer Protection',
    badge: 'Refund & Compensation',
    icon: 'ShoppingBag',
    keyRule: 'Consumer Protection Act 2019 covers e-commerce, dark patterns, and establishes product liability on manufacturers.',
    rights: [
      {
        title: 'Right to Full Refund or Replacement',
        detail: 'If product is defective or service is deficient, seller/manufacturer cannot refuse remedy through "no return" disclaimer.',
        statute: 'Consumer Protection Act 2019 s.2(11)',
      },
      {
        title: 'File Case Online Anywhere (e-Daakhil)',
        detail: 'You can file a consumer complaint from your home district regardless of where the company has its office.',
        statute: 'CPA 2019 Section 34(2)(d)',
      },
      {
        title: 'Ban on Dark Patterns & Hidden Charges',
        detail: 'Pre-ticked checkboxes, hidden convenience fees, disguised ads, and bait-and-switch pricing are illegal.',
        statute: 'CCPA Guidelines 2023',
      },
      {
        title: 'Product Liability for Harm Caused',
        detail: 'Manufacturer and seller are liable to pay compensation if defective product causes physical injury or property damage.',
        statute: 'CPA 2019 Section 82-87',
      },
      {
        title: 'Limitation Period: 2 Years',
        detail: 'You have 2 full years from the date of grievance / cause of action to file a consumer complaint.',
        statute: 'CPA 2019 Section 69',
      },
    ],
    emergencyContact: 'National Consumer Helpline: 1915 | consumerhelpline.gov.in',
    proTip: 'Sending a formal 15-day Legal Notice before filing in Consumer Court resolves over 60% of disputes without a trial.',
  },
  {
    id: 'women-safety-rights',
    title: 'Special Legal Rights for Women in India',
    subtitle: 'Protection Against Violence, Workplace Harassment & Abandonment',
    category: 'Women Rights',
    badge: 'Safe & Protected',
    icon: 'HeartHandshake',
    keyRule: 'Zero FIR, confidential statement recording, and free legal aid are guaranteed by statute.',
    rights: [
      {
        title: 'Right to Zero FIR Anywhere',
        detail: 'Any police station in India must register an FIR for sexual assault, domestic violence, or harassment without jurisdiction dispute.',
        statute: 'BNSS Section 173(1)',
      },
      {
        title: 'In-Camera Statement Recording',
        detail: 'Victim statement under Section 183 BNSS (old 164 CrPC) must be recorded by a female Magistrate in privacy.',
        statute: 'BNSS Section 183',
      },
      {
        title: 'Protection of Residence (PWDVA)',
        detail: 'Wife/partner cannot be thrown out of the shared household, even if property is registered in in-laws name.',
        statute: 'Domestic Violence Act 2005 s.19',
      },
      {
        title: 'POSH Act Internal Committee (Workplace)',
        detail: 'Every workplace with 10+ employees must have an ICC headed by a senior woman. 90-day time-bound inquiry mandated.',
        statute: 'POSH Act 2013 Section 4 & 11',
      },
      {
        title: 'Right Against Sunset-to-Sunrise Arrest',
        detail: 'No female can be arrested or called to police station after sunset or before sunrise without special Magistrate order.',
        statute: 'BNSS Section 43(1)',
      },
    ],
    emergencyContact: 'Women Helpline: 181 | Police Emergency: 112',
    proTip: 'Under PWDVA Section 12, you can obtain emergency protection orders and interim monetary maintenance within 3 days.',
  },
  {
    id: 'traffic-rights',
    title: 'Your Rights with Traffic Police & Challans',
    subtitle: 'Motor Vehicles Act 2019 & DigiLocker Guidelines',
    category: 'Citizens & Police',
    badge: 'On-Road Protections',
    icon: 'Car',
    keyRule: 'Digital documents in DigiLocker or mParivahan are legally equivalent to physical originals under IT Act s.4.',
    rights: [
      {
        title: 'DigiLocker / mParivahan Document Validity',
        detail: 'Police cannot demand physical RC, Driving License, or Insurance if shown inside official DigiLocker app.',
        statute: 'MoRTH Notification RT-11036/64/2017-MVL',
      },
      {
        title: 'Who Can Collect Cash Fines',
        detail: 'Only officers of the rank of Assistant Sub-Inspector (ASI) or above can issue compounding fines on the spot.',
        statute: 'Motor Vehicles Act s.200',
      },
      {
        title: 'Seizure of Keys is Unlawful',
        detail: 'Traffic constables have no legal authority to snatch keys from the vehicle ignition or deflate tyres.',
        statute: 'MVA 1988 & High Court directives',
      },
      {
        title: 'Right to Government Receipt',
        detail: 'Every fine collected must be accompanied by an official printed e-Challan receipt or Treasury cash receipt.',
        statute: 'Motor Vehicles Act s.130',
      },
      {
        title: 'Challan Virtual Court Contest',
        detail: 'If issued an unfair e-challan, you can contest it online via the Virtual Courts portal (vcourts.gov.in).',
        statute: 'Supreme Court e-Committee Framework',
      },
    ],
    emergencyContact: 'National Emergency: 112 | Traffic Helpline: 1095',
    proTip: 'Always speak respectfully, keep dashcam/phone recording visible if police misbehave; you have the legal right to record public servants in discharge of duty.',
  },
];

export interface LimitationGuide {
  caseType: string;
  actName: string;
  limitationPeriod: string;
  triggerEvent: string;
  riskOfDelay: string;
}

export const LIMITATION_PERIODS: LimitationGuide[] = [
  {
    caseType: 'Cheque Bounce (Dishonour)',
    actName: 'Negotiable Instruments Act 1881 s.138 & s.142',
    limitationPeriod: 'Notice within 30 days; Complaint within 30 days after 15-day notice expiry.',
    triggerEvent: 'Date bank return memo received.',
    riskOfDelay: 'Strict statutory bar. If notice is delayed beyond 30 days, criminal complaint under s.138 is dismissed.',
  },
  {
    caseType: 'Consumer Complaint (Defective goods/service)',
    actName: 'Consumer Protection Act 2019 Section 69',
    limitationPeriod: '2 Years',
    triggerEvent: 'Date on which cause of action arose (e.g. delivery date or refund refusal).',
    riskOfDelay: 'Complaint barred unless applicant establishes sufficient cause for delay with condonation petition.',
  },
  {
    caseType: 'RTI First Appeal',
    actName: 'Right to Information Act 2005 Section 19(1)',
    limitationPeriod: '30 Days',
    triggerEvent: 'Expiry of 30-day response period or date of receiving PIO rejection order.',
    riskOfDelay: 'First Appellate Authority may reject time-barred appeal without sufficient cause.',
  },
  {
    caseType: 'Recovery of Money / Unpaid Salary / Debt',
    actName: 'Limitation Act 1963 Schedule Article 14 to 22',
    limitationPeriod: '3 Years',
    triggerEvent: 'Date money became due or date of last payment acknowledgment.',
    riskOfDelay: 'Debt becomes legally unrecoverable through civil suit after 3 years.',
  },
  {
    caseType: 'Tenant Security Deposit Recovery',
    actName: 'Limitation Act 1963 Article 47 / 113',
    limitationPeriod: '3 Years',
    triggerEvent: 'Date of vacating premises and handing over keys.',
    riskOfDelay: 'Delay diminishes recovery chances; send formal 15-day demand notice immediately.',
  },
  {
    caseType: 'Breach of Contract Damages',
    actName: 'Limitation Act 1963 Article 55',
    limitationPeriod: '3 Years',
    triggerEvent: 'Date when contract is broken or successive breach occurs.',
    riskOfDelay: 'Civil court cannot entertain suit after 3-year limitation clock expires.',
  },
];

export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  speechCode: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', speechCode: 'en-IN' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', speechCode: 'hi-IN' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', speechCode: 'mr-IN' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', speechCode: 'ta-IN' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', speechCode: 'te-IN' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', speechCode: 'bn-IN' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', speechCode: 'gu-IN' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', speechCode: 'kn-IN' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', speechCode: 'ml-IN' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', speechCode: 'pa-IN' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', speechCode: 'ur-IN' },
];
