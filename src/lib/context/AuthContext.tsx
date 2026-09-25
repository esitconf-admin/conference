'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile, UserRole } from '../types';
import { auth, db, isFirebaseConfigured } from '../firebase/config';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, collection, getDocs } from 'firebase/firestore';

interface AuthContextType {
  currentUser: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  isAdmin: boolean;
  isReviewer: boolean;
  isAuthor: boolean;
  allUsers: UserProfile[];
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: {
    firstName: string;
    lastName: string;
    email: string;
    organization: string;
    country: string;
    password: string;
    pdpaConsent: boolean;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  toggleReviewerRole: (uid: string, makeReviewer: boolean) => Promise<boolean>;
  fetchAllUsers: () => Promise<UserProfile[]>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_USERS_KEY = 'esit_conference_registered_users';
const LOCAL_STORAGE_CURRENT_KEY = 'esit_conference_current_user';

// Mock initial users for instant preview and testing
const defaultInitialUsers: UserProfile[] = [
  {
    uid: 'admin-001',
    email: 'admin@conference.org',
    title: 'Prof. Dr.',
    firstName: 'Conference',
    lastName: 'Admin',
    organization: 'ESIT 2025 Secretariat & KMUTNB',
    country: 'Thailand',
    roles: ['admin', 'author', 'reviewer'],
    pdpaConsent: true,
    pdpaConsentDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'active'
  },
  {
    uid: 'user-002',
    email: 'author.reviewer@university.edu',
    title: 'Dr.',
    firstName: 'Somchai',
    lastName: 'Prasert',
    organization: 'Faculty of Engineering, KMUTNB',
    country: 'Thailand',
    roles: ['author', 'reviewer'],
    pdpaConsent: true,
    pdpaConsentDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'active'
  },
  {
    uid: 'user-003',
    email: 'john.author@mit.edu',
    title: 'Dr.',
    firstName: 'John',
    lastName: 'Smith',
    organization: 'MIT Research Lab',
    country: 'United States',
    roles: ['author'],
    pdpaConsent: true,
    pdpaConsentDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'active'
  }
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);

  // Load registered users from local cache or Firestore
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(LOCAL_STORAGE_USERS_KEY);
      if (stored) {
        try {
          setAllUsers(JSON.parse(stored));
        } catch {
          setAllUsers(defaultInitialUsers);
        }
      } else {
        localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(defaultInitialUsers));
        setAllUsers(defaultInitialUsers);
      }

      const activeUser = localStorage.getItem(LOCAL_STORAGE_CURRENT_KEY);
      if (activeUser) {
        try {
          setCurrentUser(JSON.parse(activeUser));
        } catch {
          setCurrentUser(null);
        }
      }
    }
  }, []);

  // Firebase Auth Listener
  useEffect(() => {
    if (!isFirebaseConfigured || !auth || !db) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        try {
          const userDoc = await getDoc(doc(db!, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data() as UserProfile;
            setCurrentUser(data);
            if (typeof window !== 'undefined') {
              localStorage.setItem(LOCAL_STORAGE_CURRENT_KEY, JSON.stringify(data));
            }
          }
        } catch (e) {
          console.error('Error fetching Firestore user profile:', e);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const fetchAllUsers = async (): Promise<UserProfile[]> => {
    if (isFirebaseConfigured && db) {
      try {
        const snap = await getDocs(collection(db, 'users'));
        const users = snap.docs.map(d => d.data() as UserProfile);
        setAllUsers(users);
        return users;
      } catch (err) {
        console.warn('Firestore fetch failed, returning stored users:', err);
      }
    }
    return allUsers;
  };

  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    const trimmedEmail = email.trim().toLowerCase();

    // 1. Firebase live auth if available
    if (isFirebaseConfigured && auth && db) {
      try {
        const cred = await signInWithEmailAndPassword(auth, trimmedEmail, pass);
        const userDoc = await getDoc(doc(db, 'users', cred.user.uid));
        if (userDoc.exists()) {
          const profile = userDoc.data() as UserProfile;
          setCurrentUser(profile);
          if (typeof window !== 'undefined') {
            localStorage.setItem(LOCAL_STORAGE_CURRENT_KEY, JSON.stringify(profile));
          }
          return { success: true };
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Invalid credentials';
        return { success: false, error: message };
      }
    }

    // 2. Fallback local auth simulation
    const foundUser = allUsers.find(u => u.email.toLowerCase() === trimmedEmail);
    if (foundUser) {
      setCurrentUser(foundUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem(LOCAL_STORAGE_CURRENT_KEY, JSON.stringify(foundUser));
      }
      return { success: true };
    }

    // Quick demo admin login convenience
    if (trimmedEmail === 'admin@conference.org') {
      const adminProfile = defaultInitialUsers[0];
      setCurrentUser(adminProfile);
      if (typeof window !== 'undefined') {
        localStorage.setItem(LOCAL_STORAGE_CURRENT_KEY, JSON.stringify(adminProfile));
      }
      return { success: true };
    }

    return { success: false, error: 'User not found. Please register first.' };
  };

  const register = async (data: {
    firstName: string;
    lastName: string;
    email: string;
    organization: string;
    country: string;
    password: string;
    pdpaConsent: boolean;
  }): Promise<{ success: boolean; error?: string }> => {
    const trimmedEmail = data.email.trim().toLowerCase();

    if (!data.pdpaConsent) {
      return { success: false, error: 'You must consent to the PDPA Data Privacy Policy to register.' };
    }

    const isSeedAdmin = trimmedEmail === 'admin@conference.org' || trimmedEmail.includes('admin@');
    const roles: UserRole[] = isSeedAdmin ? ['admin', 'author'] : ['author'];

    const newProfile: UserProfile = {
      uid: 'u_' + Math.random().toString(36).substring(2, 9),
      email: trimmedEmail,
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      organization: data.organization.trim(),
      country: data.country.trim(),
      roles,
      pdpaConsent: true,
      pdpaConsentDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'active'
    };

    if (isFirebaseConfigured && auth && db) {
      try {
        const cred = await createUserWithEmailAndPassword(auth, trimmedEmail, data.password);
        newProfile.uid = cred.user.uid;
        await setDoc(doc(db, 'users', cred.user.uid), newProfile);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Registration failed in Firebase';
        return { success: false, error: message };
      }
    }

    // Update local lists
    const updatedUsers = [...allUsers.filter(u => u.email.toLowerCase() !== trimmedEmail), newProfile];
    setAllUsers(updatedUsers);
    setCurrentUser(newProfile);
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(updatedUsers));
      localStorage.setItem(LOCAL_STORAGE_CURRENT_KEY, JSON.stringify(newProfile));
    }

    return { success: true };
  };

  const logout = async () => {
    if (isFirebaseConfigured && auth) {
      try {
        await signOut(auth);
      } catch (e) {
        console.warn('Signout error:', e);
      }
    }
    setCurrentUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(LOCAL_STORAGE_CURRENT_KEY);
    }
  };

  const toggleReviewerRole = async (uid: string, makeReviewer: boolean): Promise<boolean> => {
    const updated = allUsers.map(u => {
      if (u.uid === uid) {
        let newRoles = [...u.roles];
        if (makeReviewer) {
          if (!newRoles.includes('reviewer')) newRoles.push('reviewer');
        } else {
          newRoles = newRoles.filter(r => r !== 'reviewer');
        }
        return { ...u, roles: newRoles, updatedAt: new Date().toISOString() };
      }
      return u;
    });

    setAllUsers(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(updated));
    }

    if (currentUser && currentUser.uid === uid) {
      const self = updated.find(u => u.uid === uid) || null;
      setCurrentUser(self);
      if (typeof window !== 'undefined' && self) {
        localStorage.setItem(LOCAL_STORAGE_CURRENT_KEY, JSON.stringify(self));
      }
    }

    if (isFirebaseConfigured && db) {
      try {
        const target = updated.find(u => u.uid === uid);
        if (target) {
          await updateDoc(doc(db, 'users', uid), {
            roles: target.roles,
            updatedAt: target.updatedAt
          });
        }
      } catch (e) {
        console.error('Failed to update reviewer role in Firestore:', e);
      }
    }

    return true;
  };

  const isAdmin = currentUser ? currentUser.roles.includes('admin') : false;
  const isReviewer = currentUser ? currentUser.roles.includes('reviewer') : false;
  const isAuthor = currentUser ? currentUser.roles.includes('author') : false;

  return (
    <AuthContext.Provider value={{
      currentUser,
      firebaseUser,
      loading,
      isAdmin,
      isReviewer,
      isAuthor,
      allUsers,
      login,
      register,
      logout,
      toggleReviewerRole,
      fetchAllUsers
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
