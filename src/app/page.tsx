'use client';

import React, { useState } from 'react';
import Navbar from '../components/layout/Navbar';
import HeroSection from '../components/landing/HeroSection';
import QuickInfoCards from '../components/landing/QuickInfoCards';
import ImportantNewsSection from '../components/landing/ImportantNewsSection';
import ImportantDatesSection from '../components/landing/ImportantDatesSection';
import KeynoteSpeakersSection from '../components/landing/KeynoteSpeakersSection';
import TracksTopicsSection from '../components/landing/TracksTopicsSection';
import RegistrationPricingSection from '../components/landing/RegistrationPricingSection';
import CommitteeSection from '../components/landing/CommitteeSection';
import VenueSection from '../components/landing/VenueSection';
import Footer from '../components/layout/Footer';
import FloatingScrollTop from '../components/common/FloatingScrollTop';
import AuthModal from '../components/modals/AuthModal';
import SubmitManuscriptModal from '../components/modals/SubmitManuscriptModal';
import PDPAPrivacyModal from '../components/modals/PDPAPrivacyModal';
import MySubmissionsModal from '../components/modals/MySubmissionsModal';
import ReviewerPortalModal from '../components/modals/ReviewerPortalModal';
import AdminDashboard from '../components/admin/AdminDashboard';
import { useConferenceData } from '../lib/context/ConferenceDataContext';

export default function HomePage() {
  const { content } = useConferenceData();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authDefaultMode, setAuthDefaultMode] = useState<'login' | 'register'>('login');
  const [submissionModalOpen, setSubmissionModalOpen] = useState(false);
  const [mySubmissionsModalOpen, setMySubmissionsModalOpen] = useState(false);
  const [reviewerPortalOpen, setReviewerPortalOpen] = useState(false);
  const [pdpaModalOpen, setPdpaModalOpen] = useState(false);
  const [adminDashboardOpen, setAdminDashboardOpen] = useState(false);

  React.useEffect(() => {
    if (content.seo?.pageTitle) {
      document.title = content.seo.pageTitle;
    } else if (content.hero?.edition) {
      document.title = `${content.hero.edition} | International Conference on Engineering Science & Innovative Technology`;
    }

    if (typeof document !== 'undefined' && content.seo) {
      const setMeta = (name: string, val: string, isProperty = false) => {
        if (!val) return;
        const attr = isProperty ? 'property' : 'name';
        let el = document.querySelector(`meta[${attr}="${name}"]`);
        if (!el) {
          el = document.createElement('meta');
          el.setAttribute(attr, name);
          document.head.appendChild(el);
        }
        el.setAttribute('content', val);
      };

      if (content.seo.metaDescription) {
        setMeta('description', content.seo.metaDescription);
        setMeta('og:description', content.seo.metaDescription, true);
        setMeta('twitter:description', content.seo.metaDescription);
      }
      if (content.seo.pageTitle) {
        setMeta('og:title', content.seo.pageTitle, true);
        setMeta('twitter:title', content.seo.pageTitle);
      }
      if (content.seo.keywords) {
        setMeta('keywords', content.seo.keywords);
      }
      if (content.seo.ogImageUrl) {
        setMeta('og:image', content.seo.ogImageUrl, true);
        setMeta('twitter:image', content.seo.ogImageUrl);
      }
    }
  }, [content.seo, content.hero?.edition]);

  const handleOpenAuth = (mode: 'login' | 'register') => {
    setAuthDefaultMode(mode);
    setAuthModalOpen(true);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* 1. Header & Sticky Nav */}
      <Navbar
        onOpenAuth={handleOpenAuth}
        onOpenSubmission={() => setSubmissionModalOpen(true)}
        onOpenAdmin={() => setAdminDashboardOpen(true)}
        onOpenMySubmissions={() => setMySubmissionsModalOpen(true)}
        onOpenReviewerPortal={() => setReviewerPortalOpen(true)}
      />

      {/* 2. Main One-Page Conference Landing */}
      <main style={{ flex: 1 }}>
        <HeroSection onOpenSubmission={() => setSubmissionModalOpen(true)} />
        <QuickInfoCards />
        <ImportantNewsSection />
        <ImportantDatesSection />
        <KeynoteSpeakersSection />
        <TracksTopicsSection />
        <RegistrationPricingSection />
        <CommitteeSection />
        <VenueSection />
      </main>

      {/* 3. Footer */}
      <Footer
        onOpenPDPA={() => setPdpaModalOpen(true)}
        onOpenAdmin={() => setAdminDashboardOpen(true)}
        onOpenAuth={handleOpenAuth}
      />

      {/* 4. Floating Elements */}
      <FloatingScrollTop />

      {/* 5. Modals & Dialogs */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultMode={authDefaultMode}
        onOpenPDPA={() => setPdpaModalOpen(true)}
      />

      <SubmitManuscriptModal
        isOpen={submissionModalOpen}
        onClose={() => setSubmissionModalOpen(false)}
        onRequireAuth={() => handleOpenAuth('login')}
      />

      <MySubmissionsModal
        isOpen={mySubmissionsModalOpen}
        onClose={() => setMySubmissionsModalOpen(false)}
        onOpenNewSubmission={() => setSubmissionModalOpen(true)}
        onRequireAuth={() => handleOpenAuth('login')}
      />

      <ReviewerPortalModal
        isOpen={reviewerPortalOpen}
        onClose={() => setReviewerPortalOpen(false)}
        onRequireAuth={() => handleOpenAuth('login')}
      />

      <PDPAPrivacyModal
        isOpen={pdpaModalOpen}
        onClose={() => setPdpaModalOpen(false)}
      />

      <AdminDashboard
        isOpen={adminDashboardOpen}
        onClose={() => setAdminDashboardOpen(false)}
        onRequireAuth={() => handleOpenAuth('login')}
      />
    </div>
  );
}
