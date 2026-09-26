export type UserRole = 'author' | 'reviewer' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  title?: string; // Prof., Assoc. Prof., Dr., Mr., Ms.
  firstName: string;
  lastName: string;
  organization: string; // University / Institute / Company
  country: string;
  department?: string;
  roles: UserRole[];
  phone?: string;
  pdpaConsent: boolean;
  pdpaConsentDate: string; // ISO 8601 string
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'suspended';
}

export interface ImportantDateItem {
  id: string;
  title: string;
  originalDate: string;
  extendedDate?: string;
  isExtended?: boolean;
  isPassed?: boolean;
  note?: string;
  sortOrder: number;
}

export interface NewsItem {
  id: string;
  title: string;
  date: string;
  category: 'General' | 'Submission' | 'Program' | 'Payment' | 'Keynote';
  summary: string;
  fullContent?: string;
  downloadUrl?: string;
  downloadLabel?: string;
  badge?: string;
}

export interface CommitteeMember {
  name: string;
  affiliation: string;
  role?: string;
}

export interface CommitteeGroup {
  id: string;
  title: string;
  subtitle?: string;
  members: CommitteeMember[];
}

export interface KeynoteSpeaker {
  id: string;
  name: string;
  title: string;
  affiliation: string;
  country: string;
  topic: string;
  abstract?: string;
  imageUrl?: string;
}

export interface PricingTier {
  id: string;
  category: string;
  earlyBirdFee: string;
  regularFee: string;
  currency: string;
  features: string[];
}

export interface BankPaymentInfo {
  bankName: string;
  branch: string;
  accountNameEn: string;
  accountNameTh?: string;
  accountNumber: string;
  swiftCode: string;
  address: string;
  beneficiaryName?: string;
}

export interface ConferenceHeroData {
  edition: string;
  title: string;
  fullTheme: string;
  dateRange: string;
  venueName: string;
  venueCityCountry: string;
  badgeText: string;
  posterImageUrl: string;
  submissionDeadlineBadge: string;
  cfpDownloadUrl?: string;
}

export interface ConferenceSEOMetadata {
  pageTitle: string;
  metaDescription: string;
  keywords: string;
  ogImageUrl: string;
  siteUrl: string;
  siteName: string;
}

export interface GuidelineItem {
  id?: string;
  text: string;
  linkUrl?: string;
  linkLabel?: string;
}

export interface ConferenceContent {
  id: string;
  updatedAt: string;
  updatedBy?: string;
  seo?: ConferenceSEOMetadata;
  hero: ConferenceHeroData;
  dates: ImportantDateItem[];
  news: NewsItem[];
  keynotes: KeynoteSpeaker[];
  committees: CommitteeGroup[];
  pricing: PricingTier[];
  bankInfo: BankPaymentInfo;
  tracks: {
    category: string;
    topics: string[];
  }[];
  authorGuidelines?: (string | GuidelineItem)[];
  reviewerGuidelines?: (string | GuidelineItem)[];
  contactInfo: {
    chairperson: string;
    chairpersonEmail: string;
    secretariatEmail: string;
    phone?: string;
    address: string;
  };
}

export interface EmailTemplateConfig {
  id: string;
  name: string;
  templateKey: 'welcome_author' | 'reviewer_assigned' | 'password_reset' | 'manuscript_submitted' | 'custom_message';
  subject: string;
  headerTitle: string;
  bodyText: string;
  buttonLabel?: string;
  footerNote?: string;
}

export interface ReviewEvaluation {
  id: string;
  submissionId: string;
  reviewerUid: string;
  reviewerName: string;
  reviewerEmail: string;
  originalityScore: number; // 1 - 5
  technicalScore: number; // 1 - 5
  methodologyScore: number; // 1 - 5
  clarityScore: number; // 1 - 5
  relevanceScore: number; // 1 - 5
  overallScore: number; // Calculated average score (1.0 - 5.0)
  recommendation: 'accept' | 'minor_revision' | 'major_revision' | 'reject';
  commentsForAuthor: string;
  confidentialCommentsForAdmin?: string;
  submittedAt: string;
}

export interface ManuscriptSubmission {
  id: string;
  title: string;
  abstract: string;
  track: string;
  authorUid: string;
  authorName: string;
  authorEmail: string;
  organization: string;
  coAuthors?: string;
  pdfUrl?: string;
  fileName?: string;
  status: 'submitted' | 'under_review' | 'revision_requested' | 'accepted' | 'rejected';
  submittedAt: string;
  updatedAt?: string;
  assignedReviewers?: string[];
  evaluations?: ReviewEvaluation[];
}

