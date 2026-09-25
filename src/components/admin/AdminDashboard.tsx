'use client';

import React, { useState } from 'react';
import { 
  X, Shield, Edit3, Calendar, Bell, Users, Save, CheckCircle2, 
  Trash2, Plus, RefreshCw, Send, Mail, AlertCircle, FileText, Image as ImageIcon 
} from 'lucide-react';
import { useAuth } from '../../lib/context/AuthContext';
import { useConferenceData } from '../../lib/context/ConferenceDataContext';
import { ImportantDateItem, NewsItem, KeynoteSpeaker, UserProfile } from '../../lib/types';
import { sendConferenceEmail } from '../../lib/email/emailService';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  onRequireAuth: () => void;
}

export default function AdminDashboard({ isOpen, onClose, onRequireAuth }: AdminDashboardProps) {
  const { currentUser, isAdmin, allUsers, toggleReviewerRole, fetchAllUsers } = useAuth();
  const { 
    content, 
    updateHero, 
    updateImportantDates, 
    updateNewsList, 
    updateKeynotes, 
    resetToDefault 
  } = useConferenceData();

  const [activeTab, setActiveTab] = useState<'hero' | 'dates' | 'news' | 'keynotes' | 'users' | 'email'>('hero');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Local CMS editable copies
  const [heroForm, setHeroForm] = useState(content.hero);
  const [datesList, setDatesList] = useState<ImportantDateItem[]>(content.dates);
  const [newsList, setNewsList] = useState<NewsItem[]>(content.news);
  const [keynotesList, setKeynotesList] = useState<KeynoteSpeaker[]>(content.keynotes);

  // User search filter
  const [userSearch, setUserSearch] = useState('');

  // Email test form
  const [testEmailTo, setTestEmailTo] = useState('');
  const [testEmailSending, setTestEmailSending] = useState(false);
  const [testEmailStatus, setTestEmailStatus] = useState<string | null>(null);

  // Keep form synced when content loads
  React.useEffect(() => {
    setHeroForm(content.hero);
    setDatesList(content.dates);
    setNewsList(content.news);
    setKeynotesList(content.keynotes);
  }, [content]);

  React.useEffect(() => {
    if (isOpen && isAdmin) {
      fetchAllUsers();
    }
  }, [isOpen, isAdmin, fetchAllUsers]);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
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
            Only designated Conference Administrators can edit online landing page content, posters, news, and assign reviewer credentials.
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button onClick={onClose} className="btn btn-outline-primary btn-sm">
              Close
            </button>
            <button
              onClick={() => { onClose(); onRequireAuth(); }}
              className="btn btn-primary btn-sm"
            >
              Sign In as Admin (admin@conference.org)
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

  // Email test trigger
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
        maxWidth: '1050px',
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
          padding: '18px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              padding: '6px',
              backgroundColor: '#f59e0b',
              color: '#ffffff',
              borderRadius: '8px',
              display: 'flex'
            }}>
              <Shield size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#ffffff' }}>
                ESIT 2025 Admin CMS & Portal Control
              </h3>
              <span style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>
                Online Content Management, Reviewer Role Assignment & Firestore Sync
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={async () => {
                if (confirm('Reset landing page content back to default reference demo?')) {
                  await resetToDefault();
                  showSuccess('Reset to default conference data.');
                }
              }}
              style={{
                background: 'rgba(255, 255, 255, 0.12)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                color: '#ffffff',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <RefreshCw size={14} /> Reset Defaults
            </button>

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

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #e2e8f0',
          backgroundColor: '#f8fafc',
          overflowX: 'auto',
          flexShrink: 0
        }}>
          <button
            onClick={() => setActiveTab('hero')}
            style={getTabStyle(activeTab === 'hero')}
          >
            <Edit3 size={16} /> Hero & Poster
          </button>
          <button
            onClick={() => setActiveTab('dates')}
            style={getTabStyle(activeTab === 'dates')}
          >
            <Calendar size={16} /> Important Dates ({datesList.length})
          </button>
          <button
            onClick={() => setActiveTab('news')}
            style={getTabStyle(activeTab === 'news')}
          >
            <Bell size={16} /> News & Announcements ({newsList.length})
          </button>
          <button
            onClick={() => setActiveTab('keynotes')}
            style={getTabStyle(activeTab === 'keynotes')}
          >
            <Users size={16} /> Keynotes ({keynotesList.length})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            style={getTabStyle(activeTab === 'users')}
          >
            <Shield size={16} /> Users & Reviewer Roles ({allUsers.length})
          </button>
          <button
            onClick={() => setActiveTab('email')}
            style={getTabStyle(activeTab === 'email')}
          >
            <Mail size={16} /> Email API Tester
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
                  <label style={labelStyle}>Conference Edition</label>
                  <input
                    type="text"
                    value={heroForm.edition}
                    onChange={(e) => setHeroForm({ ...heroForm, edition: e.target.value })}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Top Badge Highlight</label>
                  <input
                    type="text"
                    value={heroForm.badgeText}
                    onChange={(e) => setHeroForm({ ...heroForm, badgeText: e.target.value })}
                    style={inputStyle}
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
                  />
                </div>
                <div>
                  <label style={labelStyle}>Venue Name & City</label>
                  <input
                    type="text"
                    value={heroForm.venueName + ', ' + heroForm.venueCityCountry}
                    onChange={(e) => setHeroForm({ ...heroForm, venueName: e.target.value.split(',')[0] || '', venueCityCountry: e.target.value.split(',')[1]?.trim() || '' })}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Conference Poster Image URL</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input
                    type="text"
                    value={heroForm.posterImageUrl}
                    onChange={(e) => setHeroForm({ ...heroForm, posterImageUrl: e.target.value })}
                    style={inputStyle}
                  />
                </div>
                <span style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
                  Image URL or Firebase Storage public URL for the main landing page poster.
                </span>
              </div>

              <div>
                <label style={labelStyle}>Deadline Highlight Alert</label>
                <input
                  type="text"
                  value={heroForm.submissionDeadlineBadge}
                  onChange={(e) => setHeroForm({ ...heroForm, submissionDeadlineBadge: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ justifySelf: 'start', marginTop: '8px' }}>
                <Save size={16} /> Save Hero Changes
              </button>
            </form>
          )}

          {/* TAB 2: IMPORTANT DATES */}
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

          {/* TAB 3: NEWS & ANNOUNCEMENTS */}
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

          {/* TAB 4: KEYNOTES */}
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

          {/* TAB 5: USER DIRECTORY & REVIEWER ROLE ASSIGNMENT */}
          {activeTab === 'users' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h4 style={{ margin: 0, color: '#0f3d3e', fontSize: '1.1rem' }}>
                    User Directory & Role Governance
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                    Registered users are Authors by default. Click the button to assign/revoke <strong>Reviewer</strong> role.
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
                      <th style={{ padding: '12px 16px', textAlign: 'right' }}>Reviewer Action</th>
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
                            {isAdm ? (
                              <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontStyle: 'italic' }}>
                                System Admin
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
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: EMAIL SERVICE & APPS SCRIPT TESTER */}
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
                  <strong>ℹ️ Configuration Status:</strong> If <code>GOOGLE_APPS_SCRIPT_EMAIL_URL</code> is not set in <code>.env</code>, dispatch is simulated and logged to the browser console. Full Google Apps Script deployment instructions are located in <code>scripts/google-apps-script-email.js</code>.
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

const getTabStyle = (active: boolean): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '14px 18px',
  border: 'none',
  borderBottom: active ? '3px solid #0f3d3e' : '3px solid transparent',
  backgroundColor: active ? '#ffffff' : 'transparent',
  fontWeight: active ? 700 : 500,
  color: active ? '#0f3d3e' : '#64748b',
  cursor: 'pointer',
  fontSize: '0.88rem',
  whiteSpace: 'nowrap'
});
