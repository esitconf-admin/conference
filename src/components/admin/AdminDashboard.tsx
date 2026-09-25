'use client';

import React, { useState, useEffect } from 'react';
import {
  X, Shield, Edit3, Calendar, Bell, Users, Save, CheckCircle2,
  Trash2, Plus, RefreshCw, Send, Mail, AlertCircle, FileText,
  Sparkles, UserCheck, Eye, MessageSquare, LayoutTemplate, ArrowRight,
  Globe, Share2, Copy, CheckCheck, ExternalLink, BarChart3, Activity,
  ArrowUpRight, CheckCircle, Clock, Folder
} from 'lucide-react';
import { useAuth } from '../../lib/context/AuthContext';
import { useConferenceData } from '../../lib/context/ConferenceDataContext';
import {
  ImportantDateItem, NewsItem, KeynoteSpeaker, UserProfile,
  EmailTemplateConfig, ConferenceSEOMetadata, ManuscriptSubmission
} from '../../lib/types';
import { sendConferenceEmail } from '../../lib/email/emailService';
import { getAllSubmissions, updateSubmissionStatus } from '../../lib/submission/submissionService';
import { defaultEmailTemplates } from '../../lib/data/initialEmailTemplates';
import { db, isFirebaseConfigured } from '../../lib/firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import Image from 'next/image';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  onRequireAuth: () => void;
}

const LOCAL_STORAGE_TEMPLATES_KEY = 'esit_conference_email_templates';
const ESIT_DRIVE_FOLDER_URL = 'https://drive.google.com/drive/folders/1A7BPBWVm812p34MAwF06r5G-g-YRP9Od';

export default function AdminDashboard({ isOpen, onClose, onRequireAuth }: AdminDashboardProps) {
  const { currentUser, isAdmin, allUsers, toggleReviewerRole, fetchAllUsers } = useAuth();
  const {
    content,
    updateHero,
    updateSEO,
    updateImportantDates,
    updateNewsList,
    updateKeynotes
  } = useConferenceData();

  const [activeTab, setActiveTab] = useState<'overview' | 'hero' | 'dates' | 'news' | 'keynotes' | 'submissions' | 'users' | 'templates' | 'seo' | 'email'>('overview');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Submissions State (Firestore & Google Drive)
  const [submissionsList, setSubmissionsList] = useState<ManuscriptSubmission[]>([]);
  const [submissionSearch, setSubmissionSearch] = useState('');
  const [submissionTrackFilter, setSubmissionTrackFilter] = useState('All Tracks');
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);

  // Local CMS editable copies
  const [heroForm, setHeroForm] = useState(content.hero);
  const [datesList, setDatesList] = useState<ImportantDateItem[]>(content.dates);
  const [newsList, setNewsList] = useState<NewsItem[]>(content.news);
  const [keynotesList, setKeynotesList] = useState<KeynoteSpeaker[]>(content.keynotes);

  // SEO & Social Preview Form
  const [seoForm, setSeoForm] = useState<ConferenceSEOMetadata>(
    content.seo || {
      pageTitle: 'ESIT 2025 | International Conference on Engineering Science & Innovative Technology',
      metaDescription: 'The 5th International Conference on Engineering Science and Innovative Technology (ESIT 2025), Pattaya, Thailand. Fostering Smart Innovation, Sustainable Green Energy & Industrial AI.',
      keywords: 'ESIT 2025, Conference, Engineering Science, KMUTNB, Pattaya, Call for Papers, Scopus, IEEE',
      ogImageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
      siteUrl: 'https://esit-conference.vercel.app',
      siteName: 'ESIT 2025 International Conference'
    }
  );

  // Email Templates State
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplateConfig[]>(defaultEmailTemplates);
  const [selectedTemplateIndex, setSelectedTemplateIndex] = useState<number>(0);
  const [templateTestEmail, setTemplateTestEmail] = useState<string>('');
  const [templateSending, setTemplateSending] = useState<boolean>(false);

  // Individual Email Modal state for Users tab
  const [emailingUser, setEmailingUser] = useState<UserProfile | null>(null);
  const [individualSubject, setIndividualSubject] = useState('');
  const [individualMessage, setIndividualMessage] = useState('');
  const [individualSending, setIndividualSending] = useState(false);
  const [individualSelectedTemplate, setIndividualSelectedTemplate] = useState<string>('custom_message');

  // User search filter
  const [userSearch, setUserSearch] = useState('');

  // Email test form in tester tab
  const [testEmailTo, setTestEmailTo] = useState('');
  const [testEmailSending, setTestEmailSending] = useState(false);
  const [testEmailStatus, setTestEmailStatus] = useState<string | null>(null);

  // Copy helper
  const [copiedLink, setCopiedLink] = useState(false);

  const loadSubmissions = async () => {
    setLoadingSubmissions(true);
    const list = await getAllSubmissions();
    setSubmissionsList(list);
    setLoadingSubmissions(false);
  };

  // Keep form synced when content loads
  useEffect(() => {
    setHeroForm(content.hero);
    setDatesList(content.dates);
    setNewsList(content.news);
    setKeynotesList(content.keynotes);
    if (content.seo) {
      setSeoForm(content.seo);
    }
  }, [content]);

  // Load email templates
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(LOCAL_STORAGE_TEMPLATES_KEY);
      if (stored) {
        try {
          setEmailTemplates(JSON.parse(stored));
        } catch {
          setEmailTemplates(defaultEmailTemplates);
        }
      } else {
        localStorage.setItem(LOCAL_STORAGE_TEMPLATES_KEY, JSON.stringify(defaultEmailTemplates));
      }
    }

    async function loadFirestoreTemplates() {
      if (isFirebaseConfigured && db) {
        try {
          const snap = await getDoc(doc(db, 'conference_content', 'email_templates'));
          if (snap.exists()) {
            const data = snap.data();
            if (data && data.templates) {
              setEmailTemplates(data.templates);
            }
          }
        } catch (e) {
          console.warn('Could not load templates from Firestore:', e);
        }
      }
    }
    loadFirestoreTemplates();
  }, []);

  useEffect(() => {
    if (isOpen && isAdmin) {
      fetchAllUsers();
      loadSubmissions();
    }
  }, [isOpen, isAdmin, fetchAllUsers]);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  if (!isOpen) return null;

  // Non-admin guard screen
  if (!isAdmin) {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          maxWidth: '480px',
          width: '100%',
          padding: '32px',
          textAlign: 'center',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: '#fef2f2',
            color: '#dc2626',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto'
          }}>
            <Shield size={32} />
          </div>
          <h3 style={{ fontSize: '1.3rem', color: '#0f3d3e', marginBottom: '8px' }}>
            Administrator Access Required
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.92rem', marginBottom: '24px', lineHeight: '1.6' }}>
            Only designated Conference Administrators can edit online landing page content, posters, news, SEO metadata, and assign reviewer credentials.
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button onClick={onClose} className="btn btn-outline-primary btn-sm">
              Close
            </button>
            <button
              onClick={() => { onClose(); onRequireAuth(); }}
              className="btn btn-primary btn-sm"
            >
              Sign In as Admin
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Handle Saves
  const handleSaveHero = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateHero(heroForm);
    showSuccess('Hero banner and conference details updated successfully!');
  };

  const handleSaveSEO = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSEO(seoForm);
    showSuccess('SEO & Social Share Preview metadata updated successfully!');
  };

  const handleSaveDates = async () => {
    await updateImportantDates(datesList);
    showSuccess('Important dates timeline updated successfully!');
  };

  const handleSaveNews = async () => {
    await updateNewsList(newsList);
    showSuccess('News and announcements updated successfully!');
  };

  const handleSaveKeynotes = async () => {
    await updateKeynotes(keynotesList);
    showSuccess('Keynote speakers updated successfully!');
  };

  // Date handlers
  const handleAddDate = () => {
    const newItem: ImportantDateItem = {
      id: 'd_' + Date.now(),
      title: 'New Milestone Deadline',
      originalDate: '15 January 2025',
      extendedDate: '',
      isExtended: false,
      isPassed: false,
      note: 'Enter submission requirements or notes',
      sortOrder: datesList.length + 1
    };
    setDatesList([...datesList, newItem]);
  };

  const handleDeleteDate = (id: string) => {
    setDatesList(datesList.filter(d => d.id !== id));
  };

  // News handlers
  const handleAddNews = () => {
    const newItem: NewsItem = {
      id: 'n_' + Date.now(),
      title: 'New Conference Announcement',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      category: 'General',
      summary: 'Brief summary of the announcement for the landing page card...',
      fullContent: 'Comprehensive details and full instructions...'
    };
    setNewsList([newItem, ...newsList]);
  };

  const handleDeleteNews = (id: string) => {
    setNewsList(newsList.filter(n => n.id !== id));
  };

  // Keynote handlers
  const handleAddKeynote = () => {
    const newK: KeynoteSpeaker = {
      id: 'k_' + Date.now(),
      name: 'Prof. Dr. Jane Doe',
      title: 'Professor & Chair',
      affiliation: 'Global Institute of Technology',
      country: 'Germany',
      topic: 'Next-Generation Clean Energy Systems',
      abstract: 'Abstract summary of the keynote address...',
      imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
    };
    setKeynotesList([...keynotesList, newK]);
  };

  const handleDeleteKeynote = (id: string) => {
    setKeynotesList(keynotesList.filter(k => k.id !== id));
  };

  // Reviewer role toggler
  const handleRoleToggle = async (uid: string, currentRoles: string[]) => {
    const isNowReviewer = !currentRoles.includes('reviewer');
    await toggleReviewerRole(uid, isNowReviewer);
    showSuccess(`Updated user role. Reviewer role is now ${isNowReviewer ? 'ASSIGNED' : 'REVOKED'}.`);
  };

  // Save Email Templates
  const handleSaveEmailTemplates = async () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_TEMPLATES_KEY, JSON.stringify(emailTemplates));
    }
    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'conference_content', 'email_templates'), {
          templates: emailTemplates,
          updatedAt: new Date().toISOString()
        });
      } catch (err) {
        console.error('Error saving email templates to Firestore:', err);
      }
    }
    showSuccess('Email templates saved successfully!');
  };

  // Add New Template Handler
  const handleAddNewTemplate = () => {
    const newId = 'tpl_' + Date.now();
    const newTpl: EmailTemplateConfig = {
      id: newId,
      name: `Custom Template ${emailTemplates.length + 1}`,
      templateKey: 'custom_message',
      subject: `[${content.hero.edition}] Official Notice`,
      headerTitle: `${content.hero.edition} Official Notification`,
      bodyText: `Dear {name},\n\nWe are pleased to inform you regarding your participation in ${content.hero.edition}...\n\nBest regards,\n${content.hero.edition} Secretariat`,
      buttonLabel: 'Access Conference Portal',
      footerNote: `${content.hero.edition} Secretariat, ${content.hero.venueCityCountry}`
    };
    const updated = [...emailTemplates, newTpl];
    setEmailTemplates(updated);
    setSelectedTemplateIndex(updated.length - 1);
    showSuccess('New template created! You can now customize and save it.');
  };

  // Delete Template Handler
  const handleDeleteTemplate = (idx: number) => {
    if (emailTemplates.length <= 1) {
      alert('You must keep at least one template.');
      return;
    }
    const templateName = emailTemplates[idx]?.name;
    const updated = emailTemplates.filter((_, i) => i !== idx);
    setEmailTemplates(updated);
    setSelectedTemplateIndex(Math.max(0, idx - 1));
    showSuccess(`Deleted template "${templateName}".`);
  };

  // Send Test for Current Selected Template
  const handleSendTemplateTest = async () => {
    const tmpl = emailTemplates[selectedTemplateIndex];
    if (!tmpl || !templateTestEmail.trim()) {
      alert('Please enter a recipient email address to send test.');
      return;
    }
    setTemplateSending(true);
    const res = await sendConferenceEmail({
      to: templateTestEmail.trim(),
      recipientName: 'Test Recipient (Author/Reviewer)',
      subject: tmpl.subject,
      template: tmpl.templateKey,
      data: {
        message: tmpl.bodyText.replace('{name}', 'Dr. Test Recipient'),
        portalUrl: 'https://conference.vercel.app'
      }
    });
    setTemplateSending(false);
    showSuccess(`Test of template "${tmpl.name}" dispatched to ${templateTestEmail}!`);
  };

  // Open Individual User Email Modal
  const openEmailUserModal = (user: UserProfile) => {
    setEmailingUser(user);
    const userFullName = `${user.firstName} ${user.lastName}`.trim();
    const defaultTmpl = emailTemplates.find(t => t.templateKey === 'custom_message') || emailTemplates[0];
    setIndividualSelectedTemplate(defaultTmpl.templateKey);
    setIndividualSubject(defaultTmpl.subject);
    setIndividualMessage(defaultTmpl.bodyText.replace(/{name}/g, userFullName));
  };

  // Change template in Individual User Email Modal and update subject & body
  const handleIndividualTemplateChange = (templateKey: string) => {
    setIndividualSelectedTemplate(templateKey);
    if (!emailingUser) return;
    const userFullName = `${emailingUser.firstName} ${emailingUser.lastName}`.trim();
    const found = emailTemplates.find(t => t.templateKey === templateKey);
    if (found) {
      setIndividualSubject(found.subject);
      setIndividualMessage(found.bodyText.replace(/{name}/g, userFullName));
    }
  };

  // Send Individual User Email
  const handleSendIndividualEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailingUser) return;
    setIndividualSending(true);

    const res = await sendConferenceEmail({
      to: emailingUser.email,
      recipientName: `${emailingUser.firstName} ${emailingUser.lastName}`,
      subject: individualSubject,
      template: individualSelectedTemplate as any,
      data: {
        message: individualMessage,
        portalUrl: 'https://conference.vercel.app'
      }
    });

    setIndividualSending(false);
    setEmailingUser(null);
    showSuccess(`Direct email successfully dispatched to ${emailingUser.email}!`);
  };

  // Email tester tab trigger
  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmailTo) return;
    setTestEmailSending(true);
    setTestEmailStatus(null);

    const res = await sendConferenceEmail({
      to: testEmailTo,
      recipientName: 'Conference Delegate',
      subject: 'ESIT 2025 - Test Notification from Secretariat',
      template: 'reviewer_assigned',
      data: {
        message: 'This is an official test notification dispatched from the ESIT 2025 Admin CMS.'
      }
    });

    setTestEmailSending(false);
    setTestEmailStatus(res.message || 'Email sent successfully.');
  };

  const filteredUsers = allUsers.filter(u =>
    u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.firstName.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.lastName.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.organization.toLowerCase().includes(userSearch.toLowerCase())
  );

  const currentTemplate = emailTemplates[selectedTemplateIndex] || emailTemplates[0];

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 1000,
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      animation: 'fadeIn 0.2s ease'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        maxWidth: '1200px',
        width: '100%',
        height: '92vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        border: '1px solid #e2e8f0',
        overflow: 'hidden'
      }}>
        {/* Top Header */}
        <div style={{
          backgroundColor: '#0f3d3e',
          color: '#ffffff',
          padding: '16px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              padding: '8px',
              backgroundColor: '#f59e0b',
              color: '#ffffff',
              borderRadius: '10px',
              display: 'flex'
            }}>
              <Shield size={22} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#ffffff' }}>
                ESIT Admin CMS & Portal Control
              </h3>
              <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
                Online Content Management, SEO & Social Share Preview, and Email Notification System
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: '#ffffff',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '6px',
                display: 'flex'
              }}
            >
              <X size={22} />
            </button>
          </div>
        </div>

        {/* PROMINENT BUTTON-STYLE TAB NAVIGATION BAR */}
        <div style={{
          display: 'flex',
          gap: '8px',
          padding: '12px 20px',
          backgroundColor: '#f1f5f9',
          borderBottom: '1px solid #cbd5e1',
          overflowX: 'auto',
          flexShrink: 0,
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => setActiveTab('overview')}
            style={getButtonTabStyle(activeTab === 'overview')}
          >
            <BarChart3 size={15} />
            <span>Overview & Summary</span>
          </button>

          <button
            onClick={() => setActiveTab('hero')}
            style={getButtonTabStyle(activeTab === 'hero')}
          >
            <Edit3 size={15} />
            <span>Hero & Poster</span>
          </button>

          <button
            onClick={() => setActiveTab('seo')}
            style={getButtonTabStyle(activeTab === 'seo', true)}
          >
            <Globe size={15} />
            <span>SEO & Social Share Preview</span>
            <span style={{
              backgroundColor: activeTab === 'seo' ? '#ffffff' : '#059669',
              color: activeTab === 'seo' ? '#047857' : '#ffffff',
              padding: '1px 6px',
              borderRadius: '9999px',
              fontSize: '0.72rem',
              fontWeight: 800
            }}>NEW</span>
          </button>

          <button
            onClick={() => setActiveTab('dates')}
            style={getButtonTabStyle(activeTab === 'dates')}
          >
            <Calendar size={15} />
            <span>Important Dates</span>
            <span style={getTabBadgeStyle(activeTab === 'dates')}>{datesList.length}</span>
          </button>

          <button
            onClick={() => setActiveTab('news')}
            style={getButtonTabStyle(activeTab === 'news')}
          >
            <Bell size={15} />
            <span>News & Updates</span>
            <span style={getTabBadgeStyle(activeTab === 'news')}>{newsList.length}</span>
          </button>

          <button
            onClick={() => setActiveTab('keynotes')}
            style={getButtonTabStyle(activeTab === 'keynotes')}
          >
            <Users size={15} />
            <span>Keynotes</span>
            <span style={getTabBadgeStyle(activeTab === 'keynotes')}>{keynotesList.length}</span>
          </button>

          <button
            onClick={() => { setActiveTab('submissions'); loadSubmissions(); }}
            style={getButtonTabStyle(activeTab === 'submissions')}
          >
            <FileText size={15} />
            <span>Submissions</span>
            <span style={getTabBadgeStyle(activeTab === 'submissions')}>{submissionsList.length}</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            style={getButtonTabStyle(activeTab === 'users')}
          >
            <UserCheck size={15} />
            <span>User & Reviewer Roles</span>
            <span style={getTabBadgeStyle(activeTab === 'users')}>{allUsers.length}</span>
          </button>

          <button
            onClick={() => setActiveTab('templates')}
            style={getButtonTabStyle(activeTab === 'templates')}
          >
            <LayoutTemplate size={15} />
            <span>Email Templates</span>
          </button>

          <button
            onClick={() => setActiveTab('email')}
            style={getButtonTabStyle(activeTab === 'email')}
          >
            <Mail size={15} />
            <span>Email API Tester</span>
          </button>
        </div>

        {/* Success Alert Banner */}
        {successMsg && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 24px',
            backgroundColor: '#ecfdf5',
            color: '#047857',
            borderBottom: '1px solid #a7f3d0',
            fontSize: '0.88rem',
            fontWeight: 600,
            flexShrink: 0
          }}>
            <CheckCircle2 size={18} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Main Tab Content */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>

          {/* TAB 0: EXECUTIVE OVERVIEW & SUMMARY (MINIMAL & CLEAN FOR ADMIN) */}
          {activeTab === 'overview' && (
            <div style={{ display: 'grid', gap: '24px', maxWidth: '1100px' }}>
              
              {/* Header Title & Refresh */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h3 style={{ margin: 0, color: '#0f3d3e', fontSize: '1.35rem', fontWeight: 800 }}>
                    Conference Executive Overview
                  </h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.86rem', color: '#64748b' }}>
                    Real-time summary of manuscript submissions, registered participants, and cloud services for {content.hero.edition}.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button
                    onClick={() => { fetchAllUsers(); loadSubmissions(); }}
                    className="btn btn-outline-primary btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <RefreshCw size={14} className={loadingSubmissions ? 'animate-spin' : ''} />
                    <span>Refresh Stats</span>
                  </button>
                  <button
                    onClick={() => { setActiveTab('submissions'); loadSubmissions(); }}
                    className="btn btn-primary btn-sm"
                  >
                    <FileText size={14} />
                    <span>View All Submissions</span>
                  </button>
                </div>
              </div>

              {/* 4 Metric Summary Cards */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
                gap: '16px'
              }}>
                {/* 1. Submissions Card */}
                <div style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  padding: '20px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                  borderLeft: '4px solid #0f3d3e'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                      Total Submissions
                    </span>
                    <FileText size={20} color="#0f3d3e" />
                  </div>
                  <div style={{ fontSize: '2.1rem', fontWeight: 800, color: '#0f3d3e', lineHeight: 1.1 }}>
                    {submissionsList.length}
                  </div>
                  <div style={{ display: 'flex', gap: '6px', marginTop: '10px', flexWrap: 'wrap', fontSize: '0.72rem' }}>
                    <span style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                      {submissionsList.filter(s => s.status === 'under_review').length} In Review
                    </span>
                    <span style={{ backgroundColor: '#ecfdf5', color: '#059669', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                      {submissionsList.filter(s => s.status === 'accepted').length} Accepted
                    </span>
                    <span style={{ backgroundColor: '#f1f5f9', color: '#475569', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                      {submissionsList.filter(s => s.status === 'submitted').length} New
                    </span>
                  </div>
                </div>

                {/* 2. Registered Users Card */}
                <div style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  padding: '20px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                  borderLeft: '4px solid #0284c7'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                      Registered Users
                    </span>
                    <Users size={20} color="#0284c7" />
                  </div>
                  <div style={{ fontSize: '2.1rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>
                    {allUsers.length}
                  </div>
                  <div style={{ display: 'flex', gap: '6px', marginTop: '10px', flexWrap: 'wrap', fontSize: '0.72rem' }}>
                    <span style={{ backgroundColor: '#ecfdf5', color: '#047857', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                      {allUsers.filter(u => u.roles.includes('author')).length} Authors
                    </span>
                    <span style={{ backgroundColor: '#e0f2fe', color: '#0369a1', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                      {allUsers.filter(u => u.roles.includes('reviewer')).length} Reviewers
                    </span>
                    <span style={{ backgroundColor: '#fef3c7', color: '#b45309', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                      {allUsers.filter(u => u.roles.includes('admin')).length} Admins
                    </span>
                  </div>
                </div>

                {/* 3. Next Milestone Card */}
                <div style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  padding: '20px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                  borderLeft: '4px solid #f59e0b'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                      Next Key Deadline
                    </span>
                    <Calendar size={20} color="#f59e0b" />
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f3d3e', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {datesList[0]?.title || 'Manuscript Submission'}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#d97706', fontWeight: 600 }}>
                    📅 {datesList[0]?.isExtended && datesList[0]?.extendedDate ? datesList[0].extendedDate : datesList[0]?.originalDate || '30 Nov 2024'}
                  </div>
                </div>

                {/* 4. Cloud Service Health Card */}
                <div style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  padding: '20px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                  borderLeft: '4px solid #10b981'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                      Cloud Infrastructure
                    </span>
                    <CheckCircle size={20} color="#10b981" />
                  </div>
                  <div style={{ display: 'grid', gap: '4px', fontSize: '0.78rem', color: '#334155' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                      <span>Google Drive: <strong>Active</strong></span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                      <span>Gmail Transactional API: <strong>Ready</strong></span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                      <span>Firebase Database: <strong>Synced</strong></span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Two-Column Activity & Action Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '20px',
                alignItems: 'start'
              }}>
                
                {/* Left Column: Recent Manuscript Submissions */}
                <div style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  padding: '20px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <h4 style={{ margin: 0, color: '#0f3d3e', fontSize: '1.05rem', fontWeight: 700 }}>
                      Recent Manuscript Submissions
                    </h4>
                    <button
                      onClick={() => { setActiveTab('submissions'); loadSubmissions(); }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#0f3d3e',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <span>All Papers ({submissionsList.length})</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>

                  {submissionsList.length === 0 ? (
                    <div style={{ padding: '30px 10px', textAlign: 'center', color: '#94a3b8', fontSize: '0.88rem' }}>
                      <FileText size={28} style={{ margin: '0 auto 8px auto', opacity: 0.5, display: 'block' }} />
                      No manuscripts submitted yet. When authors upload papers, they will appear here.
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gap: '10px' }}>
                      {submissionsList.slice(0, 5).map(sub => (
                        <div
                          key={sub.id}
                          style={{
                            padding: '12px',
                            backgroundColor: '#f8fafc',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: '10px'
                          }}
                        >
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                              <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#0f3d3e', backgroundColor: '#e2e8f0', padding: '1px 6px', borderRadius: '4px' }}>
                                {sub.id}
                              </span>
                              <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                                {sub.authorName} ({sub.organization})
                              </span>
                            </div>
                            <div style={{ fontSize: '0.86rem', fontWeight: 600, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {sub.title}
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                            <a
                              href={sub.pdfUrl || ESIT_DRIVE_FOLDER_URL}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Open Manuscript in Google Drive"
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '4px 8px',
                                backgroundColor: '#f0fdf9',
                                color: '#0f3d3e',
                                borderRadius: '6px',
                                fontSize: '0.74rem',
                                fontWeight: 600,
                                textDecoration: 'none',
                                border: '1px solid #a7f3d0'
                              }}
                            >
                              <FileText size={12} style={{ marginRight: '3px' }} />
                              Manuscript
                            </a>
                            <span style={{
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              padding: '3px 8px',
                              borderRadius: '9999px',
                              backgroundColor: sub.status === 'accepted' ? '#ecfdf5' : sub.status === 'under_review' ? '#eff6ff' : '#f1f5f9',
                              color: sub.status === 'accepted' ? '#059669' : sub.status === 'under_review' ? '#2563eb' : '#475569',
                              textTransform: 'capitalize'
                            }}>
                              {sub.status.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right Column: Administrative Quick-Action Hub */}
                <div style={{ display: 'grid', gap: '16px' }}>
                  
                  {/* Quick Shortcuts */}
                  <div style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    padding: '20px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
                  }}>
                    <h4 style={{ margin: '0 0 14px 0', color: '#0f3d3e', fontSize: '1.05rem', fontWeight: 700 }}>
                      Quick Administrative Actions
                    </h4>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <button
                        onClick={() => { setActiveTab('submissions'); loadSubmissions(); }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '12px',
                          backgroundColor: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          color: '#0f3d3e',
                          fontWeight: 600,
                          fontSize: '0.84rem',
                          cursor: 'pointer',
                          textAlign: 'left'
                        }}
                      >
                        <FileText size={16} color="#0f3d3e" />
                        <span>Submissions Hub</span>
                      </button>

                      <button
                        onClick={() => setActiveTab('users')}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '12px',
                          backgroundColor: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          color: '#0f3d3e',
                          fontWeight: 600,
                          fontSize: '0.84rem',
                          cursor: 'pointer',
                          textAlign: 'left'
                        }}
                      >
                        <UserCheck size={16} color="#0284c7" />
                        <span>Appoint Reviewers</span>
                      </button>

                      <button
                        onClick={() => setActiveTab('templates')}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '12px',
                          backgroundColor: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          color: '#0f3d3e',
                          fontWeight: 600,
                          fontSize: '0.84rem',
                          cursor: 'pointer',
                          textAlign: 'left'
                        }}
                      >
                        <Mail size={16} color="#059669" />
                        <span>Email Broadcasts</span>
                      </button>

                      <button
                        onClick={() => setActiveTab('seo')}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '12px',
                          backgroundColor: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          color: '#0f3d3e',
                          fontWeight: 600,
                          fontSize: '0.84rem',
                          cursor: 'pointer',
                          textAlign: 'left'
                        }}
                      >
                        <Globe size={16} color="#f59e0b" />
                        <span>SEO & Social Preview</span>
                      </button>

                      <a
                        href={ESIT_DRIVE_FOLDER_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '12px',
                          backgroundColor: '#f0fdf9',
                          border: '1px solid #99f6e4',
                          borderRadius: '8px',
                          color: '#0f3d3e',
                          fontWeight: 600,
                          fontSize: '0.84rem',
                          textDecoration: 'none',
                          textAlign: 'left'
                        }}
                      >
                        <Folder size={16} color="#059669" />
                        <span>Drive Submissions Folder</span>
                      </a>
                    </div>
                  </div>

                  {/* Conference Timeline Preview */}
                  <div style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    padding: '20px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <h4 style={{ margin: 0, color: '#0f3d3e', fontSize: '1.02rem', fontWeight: 700 }}>
                        Milestones Timeline
                      </h4>
                      <button
                        onClick={() => setActiveTab('dates')}
                        style={{ background: 'none', border: 'none', color: '#0f3d3e', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
                      >
                        Edit Dates ➔
                      </button>
                    </div>

                    <div style={{ display: 'grid', gap: '8px', fontSize: '0.82rem' }}>
                      {datesList.slice(0, 4).map((d) => (
                        <div
                          key={d.id}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '8px 10px',
                            backgroundColor: '#f8fafc',
                            borderRadius: '6px'
                          }}
                        >
                          <span style={{ color: '#334155', fontWeight: 600 }}>{d.title}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ color: '#64748b' }}>
                              {d.isExtended && d.extendedDate ? d.extendedDate : d.originalDate}
                            </span>
                            {d.isExtended && (
                              <span style={{ fontSize: '0.68rem', backgroundColor: '#fef3c7', color: '#b45309', padding: '1px 5px', borderRadius: '4px', fontWeight: 700 }}>
                                EXTENDED
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>

            </div>
          )}

          {/* TAB 1: HERO & POSTER */}
          {activeTab === 'hero' && (
            <form onSubmit={handleSaveHero} style={{ display: 'grid', gap: '18px', maxWidth: '800px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '14px' }}>
                <div>
                  <label style={labelStyle}>Conference Edition (e.g. ESIT 2027)</label>
                  <input
                    type="text"
                    value={heroForm.edition}
                    onChange={(e) => setHeroForm({ ...heroForm, edition: e.target.value })}
                    style={inputStyle}
                    placeholder="e.g. ESIT 2027"
                  />
                  <span style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '3px', display: 'block' }}>
                    Updates the Navbar Logo & Footer Badge
                  </span>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label style={{ ...labelStyle, marginBottom: 0 }}>Top Badge Highlight</label>
                    <button
                      type="button"
                      onClick={() => setHeroForm({ ...heroForm, badgeText: `${heroForm.edition} · ${heroForm.venueCityCountry}` })}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#0f3d3e',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        textDecoration: 'underline'
                      }}
                    >
                      ⚡ Auto-Sync with Edition & City
                    </button>
                  </div>
                  <input
                    type="text"
                    value={heroForm.badgeText}
                    onChange={(e) => setHeroForm({ ...heroForm, badgeText: e.target.value })}
                    style={inputStyle}
                    placeholder="e.g. ESIT 2027 · Danang, Vietnam"
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Conference Main Title</label>
                <input
                  type="text"
                  value={heroForm.title}
                  onChange={(e) => setHeroForm({ ...heroForm, title: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Theme & Subtitle</label>
                <textarea
                  rows={3}
                  value={heroForm.fullTheme}
                  onChange={(e) => setHeroForm({ ...heroForm, fullTheme: e.target.value })}
                  style={{ ...inputStyle, fontFamily: 'inherit' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={labelStyle}>Conference Dates</label>
                  <input
                    type="text"
                    value={heroForm.dateRange}
                    onChange={(e) => setHeroForm({ ...heroForm, dateRange: e.target.value })}
                    style={inputStyle}
                    placeholder="e.g. February 18-21, 2027"
                  />
                </div>
                <div>
                  <label style={labelStyle}>Venue / Hotel Name</label>
                  <input
                    type="text"
                    value={heroForm.venueName}
                    onChange={(e) => setHeroForm({ ...heroForm, venueName: e.target.value })}
                    style={inputStyle}
                    placeholder="e.g. Furama Resort Danang"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={labelStyle}>Venue City & Country</label>
                  <input
                    type="text"
                    value={heroForm.venueCityCountry}
                    onChange={(e) => setHeroForm({ ...heroForm, venueCityCountry: e.target.value })}
                    style={inputStyle}
                    placeholder="e.g. Danang, Vietnam"
                  />
                  <span style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '3px', display: 'block' }}>
                    Displays in Navbar & Footer sub-location
                  </span>
                </div>
                <div>
                  <label style={labelStyle}>Deadline Highlight Alert</label>
                  <input
                    type="text"
                    value={heroForm.submissionDeadlineBadge}
                    onChange={(e) => setHeroForm({ ...heroForm, submissionDeadlineBadge: e.target.value })}
                    style={inputStyle}
                    placeholder="e.g. Full Paper Submission: Nov 30 (Extended)"
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Conference Poster Image URL</label>
                <input
                  type="text"
                  value={heroForm.posterImageUrl}
                  onChange={(e) => setHeroForm({ ...heroForm, posterImageUrl: e.target.value })}
                  style={inputStyle}
                />
                <span style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
                  Image URL or public image link for the main landing page poster.
                </span>
              </div>

              <button type="submit" className="btn btn-primary" style={{ justifySelf: 'start', marginTop: '8px' }}>
                <Save size={16} /> Save Hero Changes
              </button>
            </form>
          )}

          {/* TAB 2: SEO & SOCIAL SHARE PREVIEW (NEW MODULE REQUESTED) */}
          {activeTab === 'seo' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <h4 style={{ margin: 0, color: '#0f3d3e', fontSize: '1.15rem' }}>
                    SEO Metadata & Social Share Preview Manager
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                    Customize how your conference link looks when shared on <strong>LINE, WhatsApp, Facebook, LinkedIn, Twitter</strong>, and Google search.
                  </p>
                </div>
                <button onClick={handleSaveSEO} className="btn btn-primary btn-sm">
                  <Save size={16} /> Save SEO & Social Metadata
                </button>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: '24px'
              }} className="template-grid">

                {/* Left: SEO Editor Form */}
                <form onSubmit={handleSaveSEO} style={{
                  backgroundColor: '#f8fafc',
                  borderRadius: '12px',
                  padding: '20px',
                  border: '1px solid #e2e8f0',
                  display: 'grid',
                  gap: '14px'
                }}>
                  <div>
                    <label style={labelStyle}>
                      Browser Tab & Social Share Title (`title`) *
                    </label>
                    <input
                      type="text"
                      required
                      value={seoForm.pageTitle}
                      onChange={(e) => setSeoForm({ ...seoForm, pageTitle: e.target.value })}
                      style={inputStyle}
                    />
                    <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px', display: 'block' }}>
                      Recommended length: 50-60 characters (shown in LINE/WhatsApp cards).
                    </span>
                  </div>

                  <div>
                    <label style={labelStyle}>
                      Social Preview Description (`meta description` / `og:description`) *
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={seoForm.metaDescription}
                      onChange={(e) => setSeoForm({ ...seoForm, metaDescription: e.target.value })}
                      style={{ ...inputStyle, fontFamily: 'inherit', lineHeight: '1.5' }}
                    />
                    <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px', display: 'block' }}>
                      Shown below the title in chat share previews and Google search snippets.
                    </span>
                  </div>

                  <div>
                    <label style={labelStyle}>
                      Social Share Card Banner Image URL (`og:image`) *
                    </label>
                    <input
                      type="text"
                      required
                      value={seoForm.ogImageUrl}
                      onChange={(e) => setSeoForm({ ...seoForm, ogImageUrl: e.target.value })}
                      style={inputStyle}
                    />
                    <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px', display: 'block' }}>
                      Image shown in link preview bubbles (Recommended: 1200x630px JPG/PNG).
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={labelStyle}>Canonical Website URL (`og:url`)</label>
                      <input
                        type="text"
                        value={seoForm.siteUrl}
                        onChange={(e) => setSeoForm({ ...seoForm, siteUrl: e.target.value })}
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Site Brand Name (`og:site_name`)</label>
                      <input
                        type="text"
                        value={seoForm.siteName}
                        onChange={(e) => setSeoForm({ ...seoForm, siteName: e.target.value })}
                        style={inputStyle}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={labelStyle}>SEO Search Keywords (Comma separated)</label>
                    <input
                      type="text"
                      value={seoForm.keywords}
                      onChange={(e) => setSeoForm({ ...seoForm, keywords: e.target.value })}
                      style={inputStyle}
                    />
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ justifySelf: 'start', marginTop: '6px' }}>
                    <Save size={16} /> Save Changes
                  </button>
                </form>

                {/* Right: Live Chat Bubble Mockup Preview (LINE / WhatsApp Style) */}
                <div style={{
                  backgroundColor: '#e6f4f1',
                  borderRadius: '12px',
                  padding: '20px',
                  border: '1px solid rgba(15, 61, 62, 0.15)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f3d3e', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Share2 size={16} color="#f59e0b" />
                      Live LINE / WhatsApp / Social Share Preview
                    </span>
                    <span style={{ fontSize: '0.72rem', backgroundColor: '#0f3d3e', color: '#fff', padding: '2px 8px', borderRadius: '4px' }}>
                      Auto-Rendering
                    </span>
                  </div>

                  {/* Chat Message Bubble Preview */}
                  <div style={{
                    backgroundColor: '#dcf8c6',
                    borderRadius: '14px',
                    padding: '12px 14px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                    maxWidth: '440px',
                    border: '1px solid #c7e8b0'
                  }}>
                    {/* Share Link */}
                    <a
                      href={seoForm.siteUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        color: '#0284c7',
                        textDecoration: 'underline',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        display: 'block',
                        marginBottom: '8px',
                        wordBreak: 'break-all'
                      }}
                    >
                      {seoForm.siteUrl}
                    </a>

                    {/* Rich Link Card inside Bubble */}
                    <div style={{
                      backgroundColor: '#ffffff',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      border: '1px solid #d1d5db',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
                    }}>
                      {/* Thumbnail Image */}
                      {seoForm.ogImageUrl && (
                        <div style={{ position: 'relative', width: '100%', height: '180px', backgroundColor: '#092c2c' }}>
                          <Image
                            src={seoForm.ogImageUrl}
                            alt="Social Share Thumbnail"
                            fill
                            style={{ objectFit: 'cover' }}
                            unoptimized
                          />
                        </div>
                      )}

                      {/* Content Details */}
                      <div style={{ padding: '12px 14px', borderLeft: '4px solid #10b981' }}>
                        <div style={{
                          fontSize: '0.95rem',
                          fontWeight: 700,
                          color: '#0f172a',
                          marginBottom: '4px',
                          lineHeight: '1.3'
                        }}>
                          {seoForm.pageTitle}
                        </div>

                        <div style={{
                          fontSize: '0.82rem',
                          color: '#475569',
                          lineHeight: '1.4',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {seoForm.metaDescription}
                        </div>

                        <div style={{
                          fontSize: '0.72rem',
                          color: '#94a3b8',
                          marginTop: '6px',
                          textTransform: 'lowercase'
                        }}>
                          {seoForm.siteUrl.replace(/^https?:\/\//, '')}
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', fontSize: '0.68rem', color: '#64748b', marginTop: '6px' }}>
                      Just now · Read ✓✓
                    </div>
                  </div>

                  <div style={{
                    fontSize: '0.78rem',
                    color: '#0f3d3e',
                    backgroundColor: '#ffffff',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid rgba(15, 61, 62, 0.15)'
                  }}>
                    💡 <em>Tip: When you save these details, they automatically update your conference website&apos;s <code>&lt;title&gt;</code> and <code>&lt;meta property=&quot;og:...&quot;&gt;</code> tags.</em>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 3: IMPORTANT DATES */}
          {activeTab === 'dates' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
                  Manage deadline milestones. Check &ldquo;Is Extended&rdquo; to display strike-through and extended badges.
                </p>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={handleAddDate} className="btn btn-outline-primary btn-sm">
                    <Plus size={16} /> Add Milestone
                  </button>
                  <button onClick={handleSaveDates} className="btn btn-primary btn-sm">
                    <Save size={16} /> Save All Dates
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gap: '16px' }}>
                {datesList.map((item, idx) => (
                  <div
                    key={item.id}
                    style={{
                      padding: '16px 20px',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      backgroundColor: '#f8fafc',
                      display: 'grid',
                      gridTemplateColumns: '2fr 1.5fr 1.5fr auto auto',
                      gap: '12px',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>Milestone Title</label>
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => {
                          const updated = [...datesList];
                          updated[idx].title = e.target.value;
                          setDatesList(updated);
                        }}
                        style={inputStyle}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>Original Date</label>
                      <input
                        type="text"
                        value={item.originalDate}
                        onChange={(e) => {
                          const updated = [...datesList];
                          updated[idx].originalDate = e.target.value;
                          setDatesList(updated);
                        }}
                        style={inputStyle}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>Extended Date (Optional)</label>
                      <input
                        type="text"
                        value={item.extendedDate || ''}
                        placeholder="e.g. 20 December 2024"
                        onChange={(e) => {
                          const updated = [...datesList];
                          updated[idx].extendedDate = e.target.value;
                          setDatesList(updated);
                        }}
                        style={inputStyle}
                      />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>Extended?</label>
                      <input
                        type="checkbox"
                        checked={item.isExtended || false}
                        onChange={(e) => {
                          const updated = [...datesList];
                          updated[idx].isExtended = e.target.checked;
                          setDatesList(updated);
                        }}
                        style={{ marginTop: '6px', cursor: 'pointer' }}
                      />
                    </div>

                    <button
                      onClick={() => handleDeleteDate(item.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#ef4444',
                        cursor: 'pointer',
                        padding: '6px',
                        marginTop: '14px'
                      }}
                      title="Delete Date"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: NEWS & ANNOUNCEMENTS */}
          {activeTab === 'news' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
                  Publish conference announcements, payment notices, and program updates shown on the landing page.
                </p>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={handleAddNews} className="btn btn-outline-primary btn-sm">
                    <Plus size={16} /> New Announcement
                  </button>
                  <button onClick={handleSaveNews} className="btn btn-primary btn-sm">
                    <Save size={16} /> Save News
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gap: '20px' }}>
                {newsList.map((item, idx) => (
                  <div
                    key={item.id}
                    style={{
                      padding: '20px',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      backgroundColor: '#f8fafc',
                      display: 'grid',
                      gap: '12px'
                    }}
                  >
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '12px', alignItems: 'center' }}>
                      <div>
                        <label style={labelStyle}>Announcement Title</label>
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => {
                            const updated = [...newsList];
                            updated[idx].title = e.target.value;
                            setNewsList(updated);
                          }}
                          style={inputStyle}
                        />
                      </div>

                      <div>
                        <label style={labelStyle}>Publication Date</label>
                        <input
                          type="text"
                          value={item.date}
                          onChange={(e) => {
                            const updated = [...newsList];
                            updated[idx].date = e.target.value;
                            setNewsList(updated);
                          }}
                          style={inputStyle}
                        />
                      </div>

                      <div>
                        <label style={labelStyle}>Category</label>
                        <select
                          value={item.category}
                          onChange={(e) => {
                            const updated = [...newsList];
                            updated[idx].category = e.target.value as NewsItem['category'];
                            setNewsList(updated);
                          }}
                          style={inputStyle}
                        >
                          <option value="General">General</option>
                          <option value="Program">Program</option>
                          <option value="Payment">Payment</option>
                          <option value="Keynote">Keynote</option>
                          <option value="Submission">Submission</option>
                        </select>
                      </div>

                      <button
                        onClick={() => handleDeleteNews(item.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#ef4444',
                          cursor: 'pointer',
                          padding: '6px',
                          marginTop: '14px'
                        }}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <div>
                      <label style={labelStyle}>Summary Description (Card Preview)</label>
                      <textarea
                        rows={2}
                        value={item.summary}
                        onChange={(e) => {
                          const updated = [...newsList];
                          updated[idx].summary = e.target.value;
                          setNewsList(updated);
                        }}
                        style={{ ...inputStyle, fontFamily: 'inherit' }}
                      />
                    </div>

                    <div>
                      <label style={labelStyle}>Full Content & Instructions (Modal Details)</label>
                      <textarea
                        rows={3}
                        value={item.fullContent || ''}
                        onChange={(e) => {
                          const updated = [...newsList];
                          updated[idx].fullContent = e.target.value;
                          setNewsList(updated);
                        }}
                        style={{ ...inputStyle, fontFamily: 'inherit' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: KEYNOTES */}
          {activeTab === 'keynotes' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
                  Manage keynote speakers, affiliations, research topics, and photos.
                </p>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={handleAddKeynote} className="btn btn-outline-primary btn-sm">
                    <Plus size={16} /> Add Speaker
                  </button>
                  <button onClick={handleSaveKeynotes} className="btn btn-primary btn-sm">
                    <Save size={16} /> Save Keynotes
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gap: '20px' }}>
                {keynotesList.map((speaker, idx) => (
                  <div
                    key={speaker.id}
                    style={{
                      padding: '20px',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      backgroundColor: '#f8fafc',
                      display: 'grid',
                      gap: '12px'
                    }}
                  >
                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1.5fr 1fr auto', gap: '12px' }}>
                      <div>
                        <label style={labelStyle}>Speaker Name</label>
                        <input
                          type="text"
                          value={speaker.name}
                          onChange={(e) => {
                            const updated = [...keynotesList];
                            updated[idx].name = e.target.value;
                            setKeynotesList(updated);
                          }}
                          style={inputStyle}
                        />
                      </div>

                      <div>
                        <label style={labelStyle}>Affiliation / University</label>
                        <input
                          type="text"
                          value={speaker.affiliation}
                          onChange={(e) => {
                            const updated = [...keynotesList];
                            updated[idx].affiliation = e.target.value;
                            setKeynotesList(updated);
                          }}
                          style={inputStyle}
                        />
                      </div>

                      <div>
                        <label style={labelStyle}>Country</label>
                        <input
                          type="text"
                          value={speaker.country}
                          onChange={(e) => {
                            const updated = [...keynotesList];
                            updated[idx].country = e.target.value;
                            setKeynotesList(updated);
                          }}
                          style={inputStyle}
                        />
                      </div>

                      <button
                        onClick={() => handleDeleteKeynote(speaker.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#ef4444',
                          cursor: 'pointer',
                          padding: '6px',
                          marginTop: '14px'
                        }}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <div>
                      <label style={labelStyle}>Presentation Topic / Title</label>
                      <input
                        type="text"
                        value={speaker.topic}
                        onChange={(e) => {
                          const updated = [...keynotesList];
                          updated[idx].topic = e.target.value;
                          setKeynotesList(updated);
                        }}
                        style={inputStyle}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: MANUSCRIPT SUBMISSIONS (GOOGLE DRIVE & FIRESTORE) */}
          {activeTab === 'submissions' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h4 style={{ margin: 0, color: '#0f3d3e', fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileText size={18} color="#0f3d3e" /> Manuscript Submissions Repository
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                    All submitted author papers stored in Google Drive and indexed in Firebase Firestore.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <a
                    href={ESIT_DRIVE_FOLDER_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline-primary btn-sm"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}
                    title="Open ESIT_Manuscript_Submissions Google Drive Folder"
                  >
                    <Folder size={14} color="#0f3d3e" />
                    <span>Drive Folder</span>
                  </a>

                  <button
                    onClick={loadSubmissions}
                    disabled={loadingSubmissions}
                    className="btn btn-outline-primary btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <RefreshCw size={14} className={loadingSubmissions ? 'animate-spin' : ''} />
                    <span>Refresh</span>
                  </button>

                  <select
                    value={submissionTrackFilter}
                    onChange={(e) => setSubmissionTrackFilter(e.target.value)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.85rem',
                      backgroundColor: '#ffffff'
                    }}
                  >
                    <option value="All Tracks">All Tracks</option>
                    {content.tracks.map((t, idx) => (
                      <option key={idx} value={t.category}>{t.category}</option>
                    ))}
                  </select>

                  <input
                    type="text"
                    placeholder="Search by Title, ID, Author..."
                    value={submissionSearch}
                    onChange={(e) => setSubmissionSearch(e.target.value)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.88rem',
                      width: '240px'
                    }}
                  />
                </div>
              </div>

              {/* Submissions List Table */}
              <div style={{
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                overflow: 'hidden',
                backgroundColor: '#ffffff',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#475569' }}>
                      <th style={{ padding: '12px 16px', width: '150px' }}>Tracking ID</th>
                      <th style={{ padding: '12px 16px' }}>Manuscript Title & Track</th>
                      <th style={{ padding: '12px 16px' }}>Author / Submitter</th>
                      <th style={{ padding: '12px 16px' }}>Date</th>
                      <th style={{ padding: '12px 16px' }}>Review Status</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const filtered = submissionsList.filter(sub => {
                        const matchesTrack = submissionTrackFilter === 'All Tracks' || sub.track === submissionTrackFilter;
                        const q = submissionSearch.toLowerCase().trim();
                        const matchesSearch = !q || 
                          sub.id.toLowerCase().includes(q) ||
                          sub.title.toLowerCase().includes(q) ||
                          sub.authorName.toLowerCase().includes(q) ||
                          sub.authorEmail.toLowerCase().includes(q) ||
                          sub.organization.toLowerCase().includes(q);
                        return matchesTrack && matchesSearch;
                      });

                      if (filtered.length === 0) {
                        return (
                          <tr>
                            <td colSpan={6} style={{ padding: '40px 16px', textAlign: 'center', color: '#94a3b8' }}>
                              <FileText size={32} style={{ margin: '0 auto 8px auto', opacity: 0.5, display: 'block' }} />
                              {submissionsList.length === 0 ? 'No manuscripts submitted yet. When authors submit papers, they will appear here.' : 'No submissions match your search query.'}
                            </td>
                          </tr>
                        );
                      }

                      return filtered.map((sub) => {
                        const getStatusBadge = (status: string) => {
                          switch (status) {
                            case 'accepted':
                              return { bg: '#ecfdf5', text: '#059669', label: 'Accepted' };
                            case 'revision_requested':
                              return { bg: '#fffbeb', text: '#d97706', label: 'Revision Required' };
                            case 'rejected':
                              return { bg: '#fef2f2', text: '#dc2626', label: 'Rejected' };
                            case 'under_review':
                              return { bg: '#eff6ff', text: '#2563eb', label: 'Under Review' };
                            default:
                              return { bg: '#f1f5f9', text: '#475569', label: 'Submitted' };
                          }
                        };

                        const badge = getStatusBadge(sub.status);

                        return (
                          <tr key={sub.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '14px 16px', verticalAlign: 'top' }}>
                              <span style={{
                                backgroundColor: '#0f3d3e',
                                color: '#ffffff',
                                padding: '3px 8px',
                                borderRadius: '4px',
                                fontWeight: 700,
                                fontSize: '0.78rem',
                                letterSpacing: '0.5px',
                                display: 'inline-block'
                              }}>
                                {sub.id}
                              </span>
                            </td>

                            <td style={{ padding: '14px 16px', verticalAlign: 'top' }}>
                              <strong style={{ color: '#0f3d3e', fontSize: '0.92rem', display: 'block', marginBottom: '4px' }}>
                                {sub.title}
                              </strong>
                              <span style={{ fontSize: '0.78rem', color: '#64748b', display: 'block' }}>
                                🏷️ {sub.track}
                              </span>
                              {sub.coAuthors && (
                                <span style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block', marginTop: '2px' }}>
                                  Co-authors: {sub.coAuthors}
                                </span>
                              )}
                            </td>

                            <td style={{ padding: '14px 16px', verticalAlign: 'top' }}>
                              <div style={{ fontWeight: 600, color: '#334155' }}>{sub.authorName}</div>
                              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{sub.organization}</div>
                              <div style={{ fontSize: '0.78rem', color: '#0284c7' }}>{sub.authorEmail}</div>
                            </td>

                            <td style={{ padding: '14px 16px', verticalAlign: 'top', color: '#64748b', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                              {new Date(sub.submittedAt).toLocaleDateString('en-GB', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </td>

                            <td style={{ padding: '14px 16px', verticalAlign: 'top' }}>
                              <select
                                value={sub.status}
                                onChange={async (e) => {
                                  const newStatus = e.target.value as ManuscriptSubmission['status'];
                                  await updateSubmissionStatus(sub.id, { status: newStatus });
                                  setSubmissionsList(prev => prev.map(item => item.id === sub.id ? { ...item, status: newStatus } : item));
                                  showSuccess(`Updated status for paper ${sub.id} to "${newStatus}"`);
                                }}
                                style={{
                                  padding: '4px 8px',
                                  borderRadius: '6px',
                                  fontSize: '0.78rem',
                                  fontWeight: 600,
                                  backgroundColor: badge.bg,
                                  color: badge.text,
                                  border: `1px solid ${badge.text}40`,
                                  cursor: 'pointer'
                                }}
                              >
                                <option value="submitted">Submitted</option>
                                <option value="under_review">Under Review</option>
                                <option value="revision_requested">Revision Required</option>
                                <option value="accepted">Accepted</option>
                                <option value="rejected">Rejected</option>
                              </select>
                            </td>

                            <td style={{ padding: '14px 16px', textAlign: 'right', verticalAlign: 'top' }}>
                              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                                <a
                                  href={sub.pdfUrl || ESIT_DRIVE_FOLDER_URL}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="Open Manuscript in Google Drive"
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    padding: '5px 10px',
                                    backgroundColor: '#f0fdf9',
                                    color: '#0f3d3e',
                                    border: '1px solid #99f6e4',
                                    borderRadius: '6px',
                                    fontSize: '0.78rem',
                                    fontWeight: 600,
                                    textDecoration: 'none'
                                  }}
                                >
                                  <FileText size={13} />
                                  <span>Manuscript</span>
                                </a>

                                <button
                                  type="button"
                                  onClick={() => {
                                    const authorProfile: UserProfile = {
                                      uid: sub.authorUid,
                                      email: sub.authorEmail,
                                      firstName: sub.authorName.split(' ')[0] || sub.authorName,
                                      lastName: sub.authorName.split(' ').slice(1).join(' ') || '',
                                      organization: sub.organization,
                                      country: 'Thailand',
                                      roles: ['author'],
                                      pdpaConsent: true,
                                      pdpaConsentDate: new Date().toISOString(),
                                      createdAt: sub.submittedAt,
                                      updatedAt: new Date().toISOString(),
                                      status: 'active'
                                    };
                                    setEmailingUser(authorProfile);
                                    setIndividualSubject(`[${sub.id}] Manuscript Review Update - ${sub.title.substring(0, 40)}...`);
                                    setIndividualMessage(`Dear ${sub.authorName},\n\nWe are writing to provide an update regarding your manuscript submission (ID: ${sub.id}) titled "${sub.title}".\n\nStatus: ${sub.status.toUpperCase()}\n\nBest regards,\nESIT Conference Secretariat`);
                                  }}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    padding: '5px 10px',
                                    backgroundColor: '#eff6ff',
                                    color: '#1d4ed8',
                                    border: '1px solid #bfdbfe',
                                    borderRadius: '6px',
                                    fontSize: '0.78rem',
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                  }}
                                >
                                  <Mail size={13} />
                                  <span>Email Author</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 7: USER DIRECTORY & REVIEWER ROLES + DIRECT EMAIL BUTTON */}
          {activeTab === 'users' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h4 style={{ margin: 0, color: '#0f3d3e', fontSize: '1.1rem' }}>
                    User Directory & Role Governance
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                    Manage author registrations, appoint Reviewers with 1-click, and send direct individual emails.
                  </p>
                </div>

                <input
                  type="text"
                  placeholder="Search user by name, email, university..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem',
                    width: '280px'
                  }}
                />
              </div>

              <div style={{
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                overflow: 'hidden',
                backgroundColor: '#ffffff'
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#475569' }}>
                      <th style={{ padding: '12px 16px' }}>User Details</th>
                      <th style={{ padding: '12px 16px' }}>Organization & Country</th>
                      <th style={{ padding: '12px 16px' }}>Current Roles</th>
                      <th style={{ padding: '12px 16px' }}>PDPA Consent</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions & Communication</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => {
                      const isRev = user.roles.includes('reviewer');
                      const isAdm = user.roles.includes('admin');

                      return (
                        <tr key={user.uid} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ fontWeight: 700, color: '#0f172a' }}>
                              {user.firstName} {user.lastName}
                            </div>
                            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                              {user.email}
                            </div>
                          </td>

                          <td style={{ padding: '12px 16px', color: '#334155' }}>
                            <div>{user.organization}</div>
                            <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{user.country}</span>
                          </td>

                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                              {user.roles.map(r => (
                                <span key={r} style={{
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                  fontSize: '0.72rem',
                                  fontWeight: 700,
                                  textTransform: 'uppercase',
                                  backgroundColor: r === 'admin' ? '#fef3c7' : r === 'reviewer' ? '#e0f2fe' : '#ecfdf5',
                                  color: r === 'admin' ? '#b45309' : r === 'reviewer' ? '#0369a1' : '#047857'
                                }}>
                                  {r}
                                </span>
                              ))}
                            </div>
                          </td>

                          <td style={{ padding: '12px 16px' }}>
                            {user.pdpaConsent ? (
                              <span style={{ color: '#059669', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <CheckCircle2 size={14} /> Consented
                              </span>
                            ) : (
                              <span style={{ color: '#dc2626', fontSize: '0.8rem' }}>Pending</span>
                            )}
                          </td>

                          <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                              {/* Direct Email Button */}
                              <button
                                onClick={() => openEmailUserModal(user)}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '5px',
                                  padding: '6px 12px',
                                  borderRadius: '6px',
                                  fontSize: '0.8rem',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  border: '1px solid #cbd5e1',
                                  backgroundColor: '#ffffff',
                                  color: '#0f3d3e'
                                }}
                                title={`Send Email to ${user.email}`}
                              >
                                <Mail size={13} color="#f59e0b" />
                                <span>Email User</span>
                              </button>

                              {isAdm ? (
                                <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontStyle: 'italic' }}>
                                  Admin
                                </span>
                              ) : (
                                <button
                                  onClick={() => handleRoleToggle(user.uid, user.roles)}
                                  style={{
                                    padding: '6px 12px',
                                    borderRadius: '6px',
                                    fontSize: '0.8rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    border: isRev ? '1px solid #ef4444' : '1px solid #0f3d3e',
                                    backgroundColor: isRev ? '#fef2f2' : '#0f3d3e',
                                    color: isRev ? '#dc2626' : '#ffffff'
                                  }}
                                >
                                  {isRev ? 'Revoke Reviewer' : 'Appoint Reviewer'}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 7: EMAIL TEMPLATES MANAGER */}
          {activeTab === 'templates' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <h4 style={{ margin: 0, color: '#0f3d3e', fontSize: '1.15rem' }}>
                    Email Notification Templates Manager
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                    Create custom email templates and customize subjects, header titles, body text, and signatures sent via Gmail API.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={handleAddNewTemplate} className="btn btn-outline-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Plus size={15} />
                    <span>Create New Template</span>
                  </button>
                  <button onClick={handleSaveEmailTemplates} className="btn btn-primary btn-sm">
                    <Save size={16} /> Save All Templates
                  </button>
                </div>
              </div>

              {/* Template selector pills */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
                {emailTemplates.map((t, idx) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTemplateIndex(idx)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      fontWeight: selectedTemplateIndex === idx ? 700 : 500,
                      cursor: 'pointer',
                      border: selectedTemplateIndex === idx ? '2px solid #0f3d3e' : '1px solid #cbd5e1',
                      backgroundColor: selectedTemplateIndex === idx ? '#0f3d3e' : '#ffffff',
                      color: selectedTemplateIndex === idx ? '#ffffff' : '#334155',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <Mail size={14} color={selectedTemplateIndex === idx ? '#f59e0b' : '#64748b'} />
                    <span>{t.name}</span>
                  </button>
                ))}
              </div>

              {/* Dual Column: Editor on Left, Live HTML Email Preview on Right */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: '24px'
              }} className="template-grid">

                {/* Left: Editor Form */}
                <div style={{
                  backgroundColor: '#f8fafc',
                  borderRadius: '12px',
                  padding: '20px',
                  border: '1px solid #e2e8f0',
                  display: 'grid',
                  gap: '14px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={labelStyle}>Template Display Name (for selector dropdowns)</label>
                      <input
                        type="text"
                        value={currentTemplate.name}
                        onChange={(e) => {
                          const updated = [...emailTemplates];
                          updated[selectedTemplateIndex].name = e.target.value;
                          setEmailTemplates(updated);
                        }}
                        style={inputStyle}
                        placeholder="e.g. Acceptance Notice / Payment Reminder"
                      />
                    </div>
                    {emailTemplates.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleDeleteTemplate(selectedTemplateIndex)}
                        title="Delete this template"
                        style={{
                          background: 'none',
                          border: '1px solid #fecaca',
                          backgroundColor: '#fef2f2',
                          color: '#dc2626',
                          cursor: 'pointer',
                          padding: '9px 12px',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          marginTop: '20px'
                        }}
                      >
                        <Trash2 size={14} />
                        <span>Delete</span>
                      </button>
                    )}
                  </div>

                  <div>
                    <label style={labelStyle}>Email Subject Line</label>
                    <input
                      type="text"
                      value={currentTemplate.subject}
                      onChange={(e) => {
                        const updated = [...emailTemplates];
                        updated[selectedTemplateIndex].subject = e.target.value;
                        setEmailTemplates(updated);
                      }}
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>Header Banner Title (Inside Email)</label>
                    <input
                      type="text"
                      value={currentTemplate.headerTitle}
                      onChange={(e) => {
                        const updated = [...emailTemplates];
                        updated[selectedTemplateIndex].headerTitle = e.target.value;
                        setEmailTemplates(updated);
                      }}
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>Email Body Message</label>
                    <textarea
                      rows={7}
                      value={currentTemplate.bodyText}
                      onChange={(e) => {
                        const updated = [...emailTemplates];
                        updated[selectedTemplateIndex].bodyText = e.target.value;
                        setEmailTemplates(updated);
                      }}
                      style={{ ...inputStyle, fontFamily: 'inherit', lineHeight: '1.5' }}
                    />
                    <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px', display: 'block' }}>
                      💡 Use <code>{'{name}'}</code> to automatically insert the recipient&apos;s full name.
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={labelStyle}>Call-to-Action Button Label</label>
                      <input
                        type="text"
                        value={currentTemplate.buttonLabel || ''}
                        onChange={(e) => {
                          const updated = [...emailTemplates];
                          updated[selectedTemplateIndex].buttonLabel = e.target.value;
                          setEmailTemplates(updated);
                        }}
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Footer Note / Secretariat Signature</label>
                      <input
                        type="text"
                        value={currentTemplate.footerNote || ''}
                        onChange={(e) => {
                          const updated = [...emailTemplates];
                          updated[selectedTemplateIndex].footerNote = e.target.value;
                          setEmailTemplates(updated);
                        }}
                        style={inputStyle}
                      />
                    </div>
                  </div>

                  {/* Send Test of This Template */}
                  <div style={{
                    marginTop: '10px',
                    paddingTop: '14px',
                    borderTop: '1px dashed #cbd5e1',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    <input
                      type="email"
                      placeholder="Enter test recipient email..."
                      value={templateTestEmail}
                      onChange={(e) => setTemplateTestEmail(e.target.value)}
                      style={{ ...inputStyle, flex: 1 }}
                    />
                    <button
                      type="button"
                      disabled={templateSending}
                      onClick={handleSendTemplateTest}
                      className="btn btn-secondary btn-sm"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      <Send size={14} /> {templateSending ? 'Sending...' : 'Test This Template'}
                    </button>
                  </div>
                </div>

                {/* Right: Live HTML Email Client Mockup Preview */}
                <div style={{
                  backgroundColor: '#f1f5f9',
                  borderRadius: '12px',
                  padding: '20px',
                  border: '1px solid #cbd5e1'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    color: '#0f3d3e',
                    marginBottom: '12px'
                  }}>
                    <Eye size={16} color="#f59e0b" />
                    <span>Live Recipient Inbox Email Preview:</span>
                  </div>

                  {/* Mock Email Window */}
                  <div style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
                    overflow: 'hidden'
                  }}>
                    {/* Mock subject line header */}
                    <div style={{
                      padding: '12px 16px',
                      backgroundColor: '#f8fafc',
                      borderBottom: '1px solid #e2e8f0',
                      fontSize: '0.85rem'
                    }}>
                      <div style={{ color: '#64748b', fontSize: '0.75rem' }}>Subject:</div>
                      <strong style={{ color: '#0f172a' }}>{currentTemplate.subject}</strong>
                    </div>

                    {/* Email Body */}
                    <div style={{ padding: '24px' }}>
                      {/* Email Brand Top */}
                      <div style={{
                        backgroundColor: '#0f3d3e',
                        color: '#ffffff',
                        padding: '16px',
                        borderRadius: '6px',
                        textAlign: 'center',
                        marginBottom: '20px'
                      }}>
                        <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#ffffff' }}>
                          {currentTemplate.headerTitle}
                        </h3>
                        <span style={{ fontSize: '0.75rem', color: '#fef3c7' }}>
                          ESIT 2025 · Pattaya, Thailand
                        </span>
                      </div>

                      {/* Text Body */}
                      <div style={{
                        fontSize: '0.9rem',
                        color: '#334155',
                        lineHeight: '1.6',
                        whiteSpace: 'pre-line',
                        marginBottom: '24px'
                      }}>
                        {currentTemplate.bodyText.replace('{name}', 'Dr. John Doe')}
                      </div>

                      {/* CTA Button */}
                      {currentTemplate.buttonLabel && (
                        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                          <span style={{
                            display: 'inline-block',
                            backgroundColor: '#f59e0b',
                            color: '#ffffff',
                            fontWeight: 'bold',
                            fontSize: '0.9rem',
                            padding: '10px 24px',
                            borderRadius: '6px'
                          }}>
                            {currentTemplate.buttonLabel}
                          </span>
                        </div>
                      )}

                      <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '20px 0' }} />

                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', textAlign: 'center' }}>
                        {currentTemplate.footerNote || 'ESIT 2025 Secretariat, KMUTNB & Amari Pattaya, Thailand.'}
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 8: EMAIL API TESTER */}
          {activeTab === 'email' && (
            <div style={{ maxWidth: '650px' }}>
              <h4 style={{ color: '#0f3d3e', marginBottom: '8px' }}>Google Email API / Apps Script Tester</h4>
              <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: '1.6', marginBottom: '20px' }}>
                Test your Google Apps Script webhook integration. When configured in <code>.env</code>, official emails will be sent from your Gmail account to the recipient.
              </p>

              <form onSubmit={handleSendTestEmail} style={{ display: 'grid', gap: '14px' }}>
                <div>
                  <label style={labelStyle}>Recipient Email Address</label>
                  <input
                    type="email"
                    required
                    value={testEmailTo}
                    onChange={(e) => setTestEmailTo(e.target.value)}
                    placeholder="e.g. your_email@domain.com"
                    style={inputStyle}
                  />
                </div>

                <div style={{
                  padding: '14px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  fontSize: '0.82rem',
                  color: '#475569'
                }}>
                  <strong>ℹ️ Configuration Status:</strong> Webhook active at:
                  <code style={{ display: 'block', wordBreak: 'break-all', marginTop: '4px', color: '#0f3d3e' }}>
                    https://script.google.com/macros/s/AKfycbwa0aSvk0VBHls6RSAJ-G1aZfykaBDU8TzFDfnDo9A42Kk5nepBTjZ9GpdOvPGWxQ1P/exec
                  </code>
                </div>

                {testEmailStatus && (
                  <div style={{
                    padding: '12px',
                    borderRadius: '8px',
                    backgroundColor: '#ecfdf5',
                    color: '#059669',
                    fontSize: '0.85rem'
                  }}>
                    {testEmailStatus}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={testEmailSending}
                  className="btn btn-primary"
                  style={{ justifySelf: 'start' }}
                >
                  <Send size={16} /> {testEmailSending ? 'Dispatching Email...' : 'Send Test Notification'}
                </button>
              </form>
            </div>
          )}

        </div>
      </div>

      {/* INDIVIDUAL SEND EMAIL MODAL (When clicking 'Email User') */}
      {emailingUser && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1100,
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          animation: 'fadeIn 0.2s ease'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            maxWidth: '600px',
            width: '100%',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid #e2e8f0',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '18px 24px',
              backgroundColor: '#0f3d3e',
              color: '#ffffff',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={18} color="#f59e0b" />
                <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#ffffff' }}>
                  Send Email to {emailingUser.firstName} {emailingUser.lastName}
                </h3>
              </div>
              <button
                onClick={() => setEmailingUser(null)}
                style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSendIndividualEmail} style={{ padding: '24px', display: 'grid', gap: '14px' }}>
              <div style={{
                padding: '10px 14px',
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                fontSize: '0.85rem'
              }}>
                <strong>Recipient:</strong> {emailingUser.email} ({emailingUser.organization})
              </div>

              <div>
                <label style={labelStyle}>Choose Template Format</label>
                <select
                  value={individualSelectedTemplate}
                  onChange={(e) => handleIndividualTemplateChange(e.target.value)}
                  style={inputStyle}
                >
                  {emailTemplates.map(t => (
                    <option key={t.id} value={t.templateKey}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Email Subject *</label>
                <input
                  type="text"
                  required
                  value={individualSubject}
                  onChange={(e) => setIndividualSubject(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Message Body *</label>
                <textarea
                  required
                  rows={6}
                  value={individualMessage}
                  onChange={(e) => setIndividualMessage(e.target.value)}
                  style={{ ...inputStyle, fontFamily: 'inherit', lineHeight: '1.5' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setEmailingUser(null)}
                  className="btn btn-outline-primary btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={individualSending}
                  className="btn btn-primary btn-sm"
                >
                  <Send size={14} /> {individualSending ? 'Dispatching...' : 'Send Email Now'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        @media (min-width: 900px) {
          .template-grid {
            grid-template-columns: 1.1fr 0.9fr !important;
          }
        }
      `}</style>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.82rem',
  fontWeight: 600,
  color: '#334155',
  marginBottom: '4px'
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 12px',
  borderRadius: '8px',
  border: '1px solid #cbd5e1',
  fontSize: '0.9rem'
};

const getButtonTabStyle = (active: boolean, highlight?: boolean): React.CSSProperties => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  padding: '9px 16px',
  borderRadius: '8px',
  border: active
    ? '2px solid #0f3d3e'
    : highlight
      ? '1px solid #10b981'
      : '1px solid #cbd5e1',
  backgroundColor: active ? '#0f3d3e' : '#ffffff',
  color: active ? '#ffffff' : highlight ? '#047857' : '#334155',
  fontWeight: active ? 700 : 600,
  cursor: 'pointer',
  fontSize: '0.88rem',
  whiteSpace: 'nowrap',
  transition: 'all 0.15s ease',
  boxShadow: active ? '0 4px 10px rgba(15, 61, 62, 0.25)' : '0 1px 3px rgba(0,0,0,0.05)'
});

const getTabBadgeStyle = (active: boolean): React.CSSProperties => ({
  backgroundColor: active ? '#f59e0b' : '#f1f5f9',
  color: active ? '#ffffff' : '#64748b',
  padding: '1px 6px',
  borderRadius: '9999px',
  fontSize: '0.72rem',
  fontWeight: 700
});
