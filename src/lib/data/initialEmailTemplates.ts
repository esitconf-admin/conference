import { EmailTemplateConfig } from '../types';

export const defaultEmailTemplates: EmailTemplateConfig[] = [
  {
    id: 'tmpl_welcome',
    name: 'Author Welcome & Registration',
    templateKey: 'welcome_author',
    subject: 'Welcome to ESIT 2025 - Account Registration Confirmation',
    headerTitle: 'ESIT 2025 Conference Registration',
    bodyText: `Dear {name},

Thank you for registering an account on the ESIT 2025 International Conference Portal.

Your Author account is now active. You may log in to submit manuscripts, track paper review status, and view the conference program.

We look forward to your research contributions.`,
    buttonLabel: 'Go to Conference Portal',
    footerNote: 'ESIT 2025 Secretariat, KMUTNB & Amari Pattaya, Thailand.'
  },
  {
    id: 'tmpl_reviewer',
    name: 'Reviewer Role Appointment',
    templateKey: 'reviewer_assigned',
    subject: 'ESIT 2025 - Official Reviewer Role Appointment Notice',
    headerTitle: 'Reviewer Appointment Notice',
    bodyText: `Dear {name},

We are honored to inform you that you have been officially appointed as a Technical Reviewer for the ESIT 2025 International Conference by the Scientific Committee.

You can now log in to access the Reviewer Workspace, review assigned manuscripts, and submit evaluation scores.`,
    buttonLabel: 'Access Reviewer Portal',
    footerNote: 'ESIT 2025 Scientific Peer-Review Committee.'
  },
  {
    id: 'tmpl_submission',
    name: 'Manuscript Received Confirmation',
    templateKey: 'manuscript_submitted',
    subject: 'ESIT 2025 - Manuscript Submission Confirmation',
    headerTitle: 'Manuscript Submission Received',
    bodyText: `Dear {name},

Your manuscript has been successfully received by the ESIT 2025 Conference Secretariat.

Your submission has entered the double-blind peer review process. You will receive notification regarding acceptance or revision according to the milestone schedule.`,
    buttonLabel: 'View Submission Status',
    footerNote: 'ESIT 2025 Technical Program Chairs.'
  },
  {
    id: 'tmpl_custom',
    name: 'Individual / Custom Message to Delegate',
    templateKey: 'custom_message',
    subject: 'Notice from ESIT 2025 Conference Secretariat',
    headerTitle: 'Official Secretariat Communication',
    bodyText: `Dear {name},

Please be informed of the following update regarding your participation in the ESIT 2025 International Conference:

{custom_message}

If you have any questions, please reply directly to this email.`,
    buttonLabel: 'Visit Conference Portal',
    footerNote: 'ESIT 2025 Conference Organizing Committee.'
  }
];
