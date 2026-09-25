'use client';

import React, { useState, useEffect } from 'react';
import {
  X, Shield, Edit3, Calendar, Bell, Users, Save, CheckCircle2,
  Trash2, Plus, RefreshCw, Send, Mail, AlertCircle, FileText,
  Sparkles, UserCheck, Eye, MessageSquare, LayoutTemplate, ArrowRight,
  Globe, Share2, Copy, CheckCheck, ExternalLink
} from 'lucide-react';
import { useAuth } from '../../lib/context/AuthContext';
import { useConferenceData } from '../../lib/context/ConferenceDataContext';
import {
  ImportantDateItem, NewsItem, KeynoteSpeaker, UserProfile,
  EmailTemplateConfig, ConferenceSEOMetadata
} from '../../lib/types';
import { sendConferenceEmail } from '../../lib/email/emailService';
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

  const [activeTab, setActiveTab] = useState<'hero' | 'dates' | 'news' | 'keynotes' | 'users' | 'templates' | 'seo' | 'email'>('hero');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

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
    showSuccess('Email template customized and saved successfully!');
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

          {/* TAB 6: USER DIRECTORY & REVIEWER ROLES + DIRECT EMAIL BUTTON */}
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
                    Customize email subjects, header titles, body text, and signatures sent automatically via Gmail API.
                  </p>
                </div>
                <button onClick={handleSaveEmailTemplates} className="btn btn-primary btn-sm">
                  <Save size={16} /> Save All Templates
                </button>
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
