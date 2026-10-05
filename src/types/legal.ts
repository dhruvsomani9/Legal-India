export interface LawCitation {
  act: string;
  section: string;
  title: string;
  description: string;
  officialUrl?: string;
  oldLawMapping?: {
    act: string;
    section: string;
    notes?: string;
  };
}

export interface DocumentNeeded {
  document: string;
  why: string;
  optional?: boolean;
}

export interface LandmarkPrecedent {
  caseTitle: string;
  citation?: string;
  holding: string;
}

export interface LawyerAnalysis {
  jurisprudence?: string;
  landmarkPrecedents?: LandmarkPrecedent[];
  proceduralTechnicalities?: string;
}

export interface LegalConsultationResponse {
  summary: string;
  isEmergency: boolean;
  emergencyType?: string;
  emergencyHelplines?: string[];
  applicableLaws: LawCitation[];
  stepsNow: string[];
  whereToFile: {
    forum: string;
    jurisdiction: string;
    portalUrl?: string;
    procedure: string;
  };
  timeLimits: string;
  documentsNeeded: DocumentNeeded[];
  risksAndCautions: string[];
  suggestedFollowUps?: string[];
  readyDocumentTemplateId?: string;
  lawyerAnalysis?: LawyerAnalysis;
}

export interface ScamShieldResponse {
  verdict: 'CONFIRMED_SCAM' | 'HIGH_RISK_SUSPICIOUS' | 'LIKELY_LEGITIMATE' | 'UNVERIFIABLE' | string;
  scamCategory?: string;
  riskScore: number;
  summary: string;
  detectedRedFlags: string[];
  lawsViolatedByPerpetrators?: {
    statute: string;
    section: string;
    offense: string;
  }[];
  immediateProtectiveSteps: string[];
  emergencyHelplines?: string[];
  howGovernmentActuallyWorks?: string;
}

export interface DocAnalysisResponse {
  documentTitle: string;
  plainLanguageSummary: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | string;
  oneSidedClauses: {
    clauseText: string;
    whyItIsUnfair: string;
    applicableLaw?: string;
  }[];
  keyDeadlinesFound?: string[];
  recommendedActionPlan: string[];
  recommendedReplyStrategy?: string;
}
