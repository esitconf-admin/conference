import { ConferenceContent } from '../types';

export const initialConferenceData: ConferenceContent = {
  id: 'current_conference',
  updatedAt: new Date().toISOString(),
  hero: {
    edition: 'ESIT 2025',
    title: 'The 5th International Conference on Engineering Science and Innovative Technology',
    fullTheme: 'Fostering Smart Innovation, Sustainable Green Energy & Industrial AI Technologies for the Global Future',
    dateRange: 'February 18-21, 2025',
    venueName: 'Amari Pattaya',
    venueCityCountry: 'Pattaya, Thailand',
    badgeText: 'ESIT 2025 · Pattaya, Thailand',
    posterImageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
    submissionDeadlineBadge: 'Full Paper Submission Deadline: November 30 (Extended to Dec 20)',
    cfpDownloadUrl: '#'
  },
  dates: [
    {
      id: 'd1',
      title: 'Full Manuscript Submission',
      originalDate: '30 November 2024',
      extendedDate: '20 December 2024',
      isExtended: true,
      isPassed: false,
      note: 'Authors must upload IEEE format PDF',
      sortOrder: 1
    },
    {
      id: 'd2',
      title: 'Accepted Full Manuscript Notification',
      originalDate: '15 December 2024',
      extendedDate: '5 January 2025',
      isExtended: true,
      isPassed: false,
      note: 'Review results sent via registered email',
      sortOrder: 2
    },
    {
      id: 'd3',
      title: 'Camera-ready Full Manuscript',
      originalDate: '31 December 2024',
      extendedDate: '15 January 2025',
      isExtended: true,
      isPassed: false,
      note: 'Include copyright form and final PDF',
      sortOrder: 3
    },
    {
      id: 'd4',
      title: 'Early-bird Registration Deadline',
      originalDate: '15 January 2025',
      extendedDate: '2 February 2025',
      isExtended: true,
      isPassed: false,
      note: 'Discounted rate for early registrations',
      sortOrder: 4
    },
    {
      id: 'd5',
      title: 'Conference Event Dates',
      originalDate: 'February 18-21, 2025',
      isExtended: false,
      isPassed: false,
      note: 'Keynote speeches, parallel technical sessions & gala dinner',
      sortOrder: 5
    }
  ],
  news: [
    {
      id: 'n1',
      title: 'ESIT CONFERENCE PROGRAM OVERVIEW – Updated!',
      date: 'Feb 7, 2025',
      category: 'Program',
      summary: 'The comprehensive technical sessions, keynote lectures, and workshop schedule has been officially published. Click to view or download the complete PDF program handbook.',
      fullContent: `We are pleased to announce the full conference schedule for ESIT 2025. Over 120 papers across 6 specialized technical tracks will be presented over 3 days, featuring distinguished keynote addresses from top engineering professors worldwide.`,
      downloadLabel: 'Download Full Program (PDF)',
      downloadUrl: '#'
    },
    {
      id: 'n2',
      title: 'Registration & Payment Details – Bank Account Info',
      date: 'Jan 19, 2025',
      category: 'Payment',
      summary: 'You can pay your registration fee through direct bank transfer to Bangkok Bank Public Company Limited (BBL), KMUTNB Branch. Please upload the payment slip after transferring.',
      fullContent: `Payment Detail: You can pay your registration fee through bank transfer as given below:
Bank Name: Bangkok Bank Public Company Limited (BBL)
Branch: King Mongkut's University of Technology North Bangkok
Account Name: College of Industrial Technology Student SWIFT / Conference Fund
Account No: 907-7-54865-0`,
      badge: 'Important Payment Notice'
    },
    {
      id: 'n3',
      title: 'Keynote Speakers Announced – International Experts',
      date: 'Dec 7, 2024',
      category: 'Keynote',
      summary: 'Distinguished speakers from Esslingen University of Applied Sciences (Germany), CESI Engineering School (France), and National University of Tainan (Taiwan) will present pioneering topics.',
      fullContent: `Prof. Dr.-Ing. Peter Häfele (Esslingen University of Applied Sciences, Germany) – Theoretical and Experimental Proof of Operational Strength of Rotors in Electric Vehicles.
Dr. Ilyass ABOUELAZIZ (CESI Engineering School, France) – Energy Forecasting and Sustainable Urban Infrastructure.
Prof. Dr. David T.W. Lin (National University of Tainan, Taiwan) – Low Grade Waste Heat Recovery.`,
      badge: 'Featured Keynotes'
    }
  ],
  keynotes: [
    {
      id: 'k1',
      name: 'Prof. Dr.-Ing. Peter Häfele',
      title: 'Professor & Dean of Engineering',
      affiliation: 'Esslingen University of Applied Sciences',
      country: 'Germany',
      topic: 'Theoretical & Experimental Proof of Operational Strength of Rotors in Modern Electric Vehicles',
      abstract: 'Investigating high-speed rotor structural integrity, advanced lightweight composite materials, and fatigue life under extreme electromagnetic-thermal cycling in next-generation electric drivetrains.',
      imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 'k2',
      name: 'Dr. Ilyass Abouelaziz',
      title: 'Senior Research Scientist',
      affiliation: 'CESI Engineering School',
      country: 'France',
      topic: 'Energy Forecasting and Sustainable Urban Infrastructure: AI for Building-Integrated Decarbonization',
      abstract: 'Harnessing machine learning and IoT telemetry for real-time load balancing, microgrid optimization, and net-zero energy architectural ecosystems in smart cities.',
      imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 'k3',
      name: 'Prof. Dr. David T.W. Lin',
      title: 'Distinguished Professor',
      affiliation: 'National University of Tainan',
      country: 'Taiwan',
      topic: 'Low Grade Waste Heat Recovery and Thermoelectric Power Harvesting in Sustainable Manufacturing',
      abstract: 'Novel organic Rankine cycle configurations and hybrid nanostructured thermoelectric generators for capturing low-temperature industrial thermal waste.',
      imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80'
    }
  ],
  committees: [
    {
      id: 'c1',
      title: 'Advisory Chair',
      subtitle: 'Executive Leadership & Institutional Guidance',
      members: [
        { name: 'Prof. Dr.-Ing. Habil. Suchart Shiengchin', affiliation: 'President of KMUTNB, Thailand' },
        { name: 'Prof. Dr. Teravuti Boonyasopon', affiliation: 'KMUTNB, Thailand' },
        { name: 'Asst. Prof. Preecha Ong-Aree', affiliation: 'KMUTNB, Thailand' },
        { name: 'Prof. Dr. Juergen van der List', affiliation: 'Esslingen University of Applied Sciences, Germany' },
        { name: 'Asst. Prof. Dr. Preecha Salaemae', affiliation: 'KMUTNB, Thailand' },
        { name: 'Assoc. Prof. Dr. Wasan Palasai', affiliation: 'KMUTNB, Thailand' },
        { name: 'Assoc. Prof. Dr. Smith Songpiriyakij', affiliation: 'KMUTNB, Thailand' },
        { name: 'Dr. Yunyong Surat', affiliation: 'KMUTNB, Thailand' }
      ]
    },
    {
      id: 'c2',
      title: 'International Advisory Board',
      subtitle: 'Global Academic & Research Partners',
      members: [
        { name: 'Prof. Christof Wolfmaier', affiliation: 'Esslingen University of Applied Sciences, Germany' },
        { name: 'Prof. Dr. Peter Haefele', affiliation: 'Esslingen University of Applied Sciences, Germany' },
        { name: 'Prof. Dr. Schmidt Ralph', affiliation: 'Esslingen University of Applied Sciences, Germany' },
        { name: 'Prof. Dr. Juergen Haag', affiliation: 'Esslingen University of Applied Sciences, Germany' },
        { name: 'Prof. Dr. Stefan Schwarz', affiliation: 'Esslingen University of Applied Sciences, Germany' },
        { name: 'Prof. Dr. David T.W. Lin', affiliation: 'National University of Tainan, Taiwan' }
      ]
    },
    {
      id: 'c3',
      title: 'General Scientific Committee',
      subtitle: 'Peer-Review & Track Editorial Leadership',
      members: [
        { name: 'Assoc. Prof. Dr. Rattanakorn Phadungthin', affiliation: 'KMUTNB, Thailand (Chair)' },
        { name: 'Assoc. Prof. Dr. Chedthawut Poompipatpong', affiliation: 'KMUTNB, Thailand' },
        { name: 'Assoc. Prof. Dr. Sageemas Na WiChian', affiliation: 'KMUTNB, Thailand' },
        { name: 'Asst. Prof. Dr. Sumol Sae-Heng Pisitsungkakarn', affiliation: 'KMUTNB, Thailand' },
        { name: 'Asst. Prof. Dr. Supitcha Cheevapruk', affiliation: 'KMUTNB, Thailand' }
      ]
    },
    {
      id: 'c4',
      title: 'Organizing Committee',
      subtitle: 'Operations, Logistics & Secretariat (KMUTNB, Thailand)',
      members: [
        { name: 'Assoc. Prof. Dr. Smith Songpiriyakij', affiliation: 'KMUTNB, Thailand' },
        { name: 'Assoc. Prof. Dr. Rattanakorn Phadungthin', affiliation: 'KMUTNB, Thailand' },
        { name: 'Assoc. Prof. Dr. Chedthawut Poompipatpong', affiliation: 'KMUTNB, Thailand' },
        { name: 'Assoc. Prof. Dr. Sageemas Na WiChian', affiliation: 'KMUTNB, Thailand' },
        { name: 'Asst. Prof. Dr. Sumol Sae-Heng Pisitsungkakarn', affiliation: 'KMUTNB, Thailand' },
        { name: 'Asst. Prof. Dr. Supitcha Cheevapruk', affiliation: 'KMUTNB, Thailand' },
        { name: 'Asst. Prof. Dr. Wannalok Boonprakong', affiliation: 'KMUTNB, Thailand' }
      ]
    }
  ],
  pricing: [
    {
      id: 'p1',
      category: 'Regular Author (International)',
      earlyBirdFee: '450 USD',
      regularFee: '500 USD',
      currency: 'USD',
      features: [
        'Presentation of 1 Accepted Manuscript',
        'Inclusion in Conference Proceedings',
        'Conference Kit, Program Booklet & Bag',
        'Lunch, Coffee Breaks & Gala Dinner Access',
        'Official Certificate of Presentation'
      ]
    },
    {
      id: 'p2',
      category: 'Student Author (International / Local)',
      earlyBirdFee: '350 USD / 10,000 THB',
      regularFee: '400 USD / 12,000 THB',
      currency: 'USD / THB',
      features: [
        'Presentation of 1 Student Paper',
        'Requires Valid Student ID Card',
        'Full Conference Proceedings & Bag',
        'Access to all Keynote & Technical Tracks',
        'Official Student Presenter Certificate'
      ]
    },
    {
      id: 'p3',
      category: 'Regular Author (Thai Domestic)',
      earlyBirdFee: '12,000 THB',
      regularFee: '14,000 THB',
      currency: 'THB',
      features: [
        'Presentation of 1 Accepted Manuscript',
        'Inclusion in Scopus / TCI Indexed Proceedings',
        'Conference Banquet & Refreshments',
        'Access to All Workshops & Sessions'
      ]
    },
    {
      id: 'p4',
      category: 'General Attendee / Listener',
      earlyBirdFee: '200 USD / 6,000 THB',
      regularFee: '250 USD / 7,500 THB',
      currency: 'USD / THB',
      features: [
        'Full Access to all 4-Day Sessions',
        'Conference Booklet & Name Tag',
        'Daily Lunches & Networking Coffee Breaks',
        'Certificate of Attendance'
      ]
    }
  ],
  bankInfo: {
    bankName: 'Bangkok Bank Public Company Limited (BBL)',
    branch: "King Mongkut's University of Technology North Bangkok (KMUTNB)",
    accountNameEn: 'College of Industrial Technology Student Conference Fund',
    accountNameTh: 'สมาคมนักศึกษาเก่าวิทยาลัยเทคโนโลยีอุตสาหกรรม',
    accountNumber: '907-7-54865-0',
    swiftCode: 'BKKBTHBK',
    address: '1518 Pracharat 1 Road, Wongsawang, Bangsue, Bangkok 10800 Thailand',
    beneficiaryName: 'KMUTNB CIT ESIT Conference'
  },
  tracks: [
    {
      category: 'Track 1: Energy Management & Green Technologies',
      topics: [
        'Renewable Energy & Photovoltaic Systems',
        'Smart Grid & Distributed Power Generation',
        'Energy Storage, Batteries & Fuel Cells',
        'Waste Heat Recovery & Thermal Systems'
      ]
    },
    {
      category: 'Track 2: Industrial Application, AI & Robotics',
      topics: [
        'Artificial Intelligence & Deep Learning in Manufacturing',
        'Industrial Internet of Things (IIoT) & Cyber-Physical Systems',
        'Robotics, Autonomous Systems & Mechatronics',
        'Predictive Maintenance & Computer Vision'
      ]
    },
    {
      category: 'Track 3: Material Science & Advanced Engineering',
      topics: [
        'Lightweight Composites & Nanomaterials',
        'Operational Strength, Fatigue & Structural Integrity',
        'Additive Manufacturing & 3D Precision Printing',
        'Sustainable Polymers and Bio-composites'
      ]
    },
    {
      category: 'Track 4: Sustainable Urban Infrastructure & Environment',
      topics: [
        'Decarbonization in Smart Buildings',
        'Environmental Monitoring & Carbon Accounting',
        'Intelligent Transportation & Electric Vehicles (EV)',
        'Water & Waste Environmental Engineering'
      ]
    }
  ],
  contactInfo: {
    chairperson: 'Assoc. Prof. Dr. Rattanakorn Phadungthin',
    chairpersonEmail: 'esit@cit.kmutnb.ac.th',
    secretariatEmail: 'secretariat.esit@cit.kmutnb.ac.th',
    phone: '+66 2 555 2000 ext 6221',
    address: 'College of Industrial Technology, KMUTNB, 1518 Pracharat 1 Rd, Bangkok 10800, Thailand'
  }
};
