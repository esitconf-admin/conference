'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { ConferenceContent, ImportantDateItem, NewsItem, CommitteeGroup, KeynoteSpeaker } from '../types';
import { initialConferenceData } from '../data/initialConferenceData';
import { db, isFirebaseConfigured } from '../firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface ConferenceDataContextType {
  content: ConferenceContent;
  loading: boolean;
  updateHero: (hero: Partial<ConferenceContent['hero']>) => Promise<boolean>;
  updateSEO: (seo: Partial<NonNullable<ConferenceContent['seo']>>) => Promise<boolean>;
  updateImportantDates: (dates: ImportantDateItem[]) => Promise<boolean>;
  updateNewsList: (news: NewsItem[]) => Promise<boolean>;
  updateKeynotes: (keynotes: KeynoteSpeaker[]) => Promise<boolean>;
  updateCommittees: (committees: CommitteeGroup[]) => Promise<boolean>;
  resetToDefault: () => Promise<boolean>;
}

const ConferenceDataContext = createContext<ConferenceDataContextType | undefined>(undefined);
const LOCAL_STORAGE_CMS_KEY = 'esit_conference_cms_content';

export function ConferenceDataProvider({ children }: { children: React.ReactNode }) {
  const [content, setContent] = useState<ConferenceContent>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(LOCAL_STORAGE_CMS_KEY);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          // fallback to initial
        }
      }
    }
    return initialConferenceData;
  });
  const [loading, setLoading] = useState<boolean>(false);

  // Initialize from LocalStorage or Firestore
  useEffect(() => {
    async function loadData() {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(LOCAL_STORAGE_CMS_KEY);
        if (stored) {
          try {
            setContent(JSON.parse(stored));
          } catch {
            setContent(initialConferenceData);
          }
        }
      }

      if (isFirebaseConfigured && db) {
        try {
          const docRef = doc(db, 'conference_content', 'main');
          const snap = await getDoc(docRef);
          if (snap.exists()) {
            const data = snap.data() as ConferenceContent;
            setContent(data);
            if (typeof window !== 'undefined') {
              localStorage.setItem(LOCAL_STORAGE_CMS_KEY, JSON.stringify(data));
            }
          } else {
            // Seed Firestore with initial data
            await setDoc(docRef, initialConferenceData);
          }
        } catch (e) {
          console.warn('Firestore load failed, using local content:', e);
        }
      }
      setLoading(false);
    }

    loadData();
  }, []);

  const saveContent = async (newContent: ConferenceContent): Promise<boolean> => {
    const updated = {
      ...newContent,
      updatedAt: new Date().toISOString()
    };
    setContent(updated);

    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_CMS_KEY, JSON.stringify(updated));
    }

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'conference_content', 'main'), updated);
      } catch (err) {
        console.error('Error writing to Firestore:', err);
      }
    }
    return true;
  };

  const updateHero = async (heroUpdates: Partial<ConferenceContent['hero']>): Promise<boolean> => {
    const newContent = {
      ...content,
      hero: { ...content.hero, ...heroUpdates }
    };
    return saveContent(newContent);
  };

  const updateSEO = async (seoUpdates: Partial<NonNullable<ConferenceContent['seo']>>): Promise<boolean> => {
    const currentSeo = content.seo || {
      pageTitle: content.hero.title,
      metaDescription: content.hero.fullTheme,
      keywords: 'ESIT, Conference, KMUTNB',
      ogImageUrl: content.hero.posterImageUrl,
      siteUrl: 'https://esit-conference.vercel.app',
      siteName: 'ESIT Conference'
    };

    const newContent = {
      ...content,
      seo: { ...currentSeo, ...seoUpdates }
    };

    // Update live browser title if in window
    if (typeof document !== 'undefined' && seoUpdates.pageTitle) {
      document.title = seoUpdates.pageTitle;
    }

    return saveContent(newContent);
  };

  const updateImportantDates = async (dates: ImportantDateItem[]): Promise<boolean> => {
    return saveContent({ ...content, dates });
  };

  const updateNewsList = async (news: NewsItem[]): Promise<boolean> => {
    return saveContent({ ...content, news });
  };

  const updateKeynotes = async (keynotes: KeynoteSpeaker[]): Promise<boolean> => {
    return saveContent({ ...content, keynotes });
  };

  const updateCommittees = async (committees: CommitteeGroup[]): Promise<boolean> => {
    return saveContent({ ...content, committees });
  };

  const resetToDefault = async (): Promise<boolean> => {
    return saveContent(initialConferenceData);
  };

  return (
    <ConferenceDataContext.Provider value={{
      content,
      loading,
      updateHero,
      updateSEO,
      updateImportantDates,
      updateNewsList,
      updateKeynotes,
      updateCommittees,
      resetToDefault
    }}>
      {children}
    </ConferenceDataContext.Provider>
  );
}

export function useConferenceData() {
  const context = useContext(ConferenceDataContext);
  if (!context) {
    throw new Error('useConferenceData must be used within ConferenceDataProvider');
  }
  return context;
}
