'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { ConferenceContent, ImportantDateItem, NewsItem, CommitteeGroup, KeynoteSpeaker, GuidelineItem } from '../types';
import { initialConferenceData } from '../data/initialConferenceData';
import { db, isFirebaseConfigured } from '../firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface ConferenceDataContextType {
  content: ConferenceContent;
  loading: boolean;
  updateHero: (hero: Partial<ConferenceContent['hero']>, contactInfo?: Partial<ConferenceContent['contactInfo']>) => Promise<boolean>;
  updateSEO: (seo: Partial<NonNullable<ConferenceContent['seo']>>) => Promise<boolean>;
  updateImportantDates: (dates: ImportantDateItem[]) => Promise<boolean>;
  updateNewsList: (news: NewsItem[]) => Promise<boolean>;
  updateKeynotes: (keynotes: KeynoteSpeaker[]) => Promise<boolean>;
  updateCommittees: (committees: CommitteeGroup[]) => Promise<boolean>;
  updatePricing: (pricing: ConferenceContent['pricing']) => Promise<boolean>;
  updateBankInfo: (bankInfo: Partial<ConferenceContent['bankInfo']>) => Promise<boolean>;
  updateVenue: (venue: Partial<NonNullable<ConferenceContent['venue']>>) => Promise<boolean>;
  updateTracks: (tracks: ConferenceContent['tracks']) => Promise<boolean>;
  updateGuidelines: (guidelines: { authorGuidelines?: (string | GuidelineItem)[]; reviewerGuidelines?: (string | GuidelineItem)[] }) => Promise<boolean>;
  updateTracksAndGuidelines: (tracks: ConferenceContent['tracks'], guidelines: { authorGuidelines?: (string | GuidelineItem)[]; reviewerGuidelines?: (string | GuidelineItem)[] }) => Promise<boolean>;
  updateContactInfo: (contactInfo: Partial<ConferenceContent['contactInfo']>) => Promise<boolean>;
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

  const saveContent = async (
    updater: ConferenceContent | ((prev: ConferenceContent) => ConferenceContent)
  ): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      setContent(prev => {
        const next = typeof updater === 'function' ? updater(prev) : updater;
        const updated: ConferenceContent = {
          ...next,
          updatedAt: new Date().toISOString()
        };

        if (typeof window !== 'undefined') {
          localStorage.setItem(LOCAL_STORAGE_CMS_KEY, JSON.stringify(updated));
        }

        if (isFirebaseConfigured && db) {
          setDoc(doc(db, 'conference_content', 'main'), updated, { merge: true })
            .catch(err => console.error('Error writing to Firestore:', err));
        }

        resolve(true);
        return updated;
      });
    });
  };

  const updateHero = async (
    heroUpdates: Partial<ConferenceContent['hero']>,
    contactUpdates?: Partial<ConferenceContent['contactInfo']>
  ): Promise<boolean> => {
    return saveContent(prev => ({
      ...prev,
      hero: { ...prev.hero, ...heroUpdates },
      contactInfo: contactUpdates ? { ...prev.contactInfo, ...contactUpdates } : prev.contactInfo
    }));
  };

  const updateSEO = async (seoUpdates: Partial<NonNullable<ConferenceContent['seo']>>): Promise<boolean> => {
    return saveContent(prev => {
      const currentSeo = prev.seo || {
        pageTitle: prev.hero.title,
        metaDescription: prev.hero.fullTheme,
        keywords: 'ESIT, Conference, KMUTNB',
        ogImageUrl: prev.hero.posterImageUrl,
        siteUrl: 'https://esit-conference.vercel.app',
        siteName: 'ESIT Conference'
      };

      if (typeof document !== 'undefined' && seoUpdates.pageTitle) {
        document.title = seoUpdates.pageTitle;
      }

      return {
        ...prev,
        seo: { ...currentSeo, ...seoUpdates }
      };
    });
  };

  const updateImportantDates = async (dates: ImportantDateItem[]): Promise<boolean> => {
    return saveContent(prev => ({ ...prev, dates }));
  };

  const updateNewsList = async (news: NewsItem[]): Promise<boolean> => {
    return saveContent(prev => ({ ...prev, news }));
  };

  const updateKeynotes = async (keynotes: KeynoteSpeaker[]): Promise<boolean> => {
    return saveContent(prev => ({ ...prev, keynotes }));
  };

  const updateCommittees = async (committees: CommitteeGroup[]): Promise<boolean> => {
    return saveContent(prev => ({ ...prev, committees }));
  };

  const updatePricing = async (pricing: ConferenceContent['pricing']): Promise<boolean> => {
    return saveContent(prev => ({ ...prev, pricing }));
  };

  const updateBankInfo = async (bankUpdates: Partial<ConferenceContent['bankInfo']>): Promise<boolean> => {
    return saveContent(prev => ({
      ...prev,
      bankInfo: {
        ...prev.bankInfo,
        ...bankUpdates
      }
    }));
  };

  const updateVenue = async (venueUpdates: Partial<NonNullable<ConferenceContent['venue']>>): Promise<boolean> => {
    return saveContent(prev => {
      const currentVenue = prev.venue || {
        venueName: prev.hero.venueName,
        venueCityCountry: prev.hero.venueCityCountry,
        subLocation: `${prev.hero.venueName}, ${prev.hero.venueCityCountry}`,
        badge: '5-Star Beachfront Luxury & International Convention Center',
        address: '240 Beach Road, Pattaya City, Bang Lamung District, Chon Buri 20150, Thailand',
        imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=80',
        airportInfo: 'Convenient access from international airports with direct shuttle options.',
        accommodationInfo: 'Exclusive negotiated room rates available for conference delegates.',
        mapUrl: `https://maps.google.com/?q=${encodeURIComponent(prev.hero.venueName)}`
      };

      const newVenue = {
        ...currentVenue,
        ...venueUpdates
      };

      const newHero = {
        ...prev.hero,
        venueName: venueUpdates.venueName || prev.hero.venueName,
        venueCityCountry: venueUpdates.venueCityCountry || prev.hero.venueCityCountry
      };

      return {
        ...prev,
        hero: newHero,
        venue: newVenue
      };
    });
  };

  const updateTracks = async (tracks: ConferenceContent['tracks']): Promise<boolean> => {
    return saveContent(prev => ({ ...prev, tracks }));
  };

  const updateGuidelines = async (guidelines: { authorGuidelines?: (string | GuidelineItem)[]; reviewerGuidelines?: (string | GuidelineItem)[] }): Promise<boolean> => {
    return saveContent(prev => ({
      ...prev,
      authorGuidelines: guidelines.authorGuidelines ?? prev.authorGuidelines,
      reviewerGuidelines: guidelines.reviewerGuidelines ?? prev.reviewerGuidelines
    }));
  };

  const updateTracksAndGuidelines = async (
    tracks: ConferenceContent['tracks'],
    guidelines: { authorGuidelines?: (string | GuidelineItem)[]; reviewerGuidelines?: (string | GuidelineItem)[] }
  ): Promise<boolean> => {
    return saveContent(prev => ({
      ...prev,
      tracks,
      authorGuidelines: guidelines.authorGuidelines ?? prev.authorGuidelines,
      reviewerGuidelines: guidelines.reviewerGuidelines ?? prev.reviewerGuidelines
    }));
  };

  const updateContactInfo = async (contactUpdates: Partial<ConferenceContent['contactInfo']>): Promise<boolean> => {
    return saveContent(prev => ({
      ...prev,
      contactInfo: {
        ...prev.contactInfo,
        ...contactUpdates
      }
    }));
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
      updatePricing,
      updateBankInfo,
      updateVenue,
      updateTracks,
      updateGuidelines,
      updateTracksAndGuidelines,
      updateContactInfo,
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
