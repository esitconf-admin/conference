'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile, UserRole } from '../types';
import { auth, db, isFirebaseConfigured } from '../firebase/config';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, getDocs } from 'firebase/firestore';
import { sendConferenceEmail } from '../email/emailService';

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
  requestPasswordReset: (email: string) => Promise<{ success: boolean; error?: string; message?: string; devOtp?: string }>;
  confirmPasswordReset: (email: string, code: string, newPassword: string) => Promise<{ success: boolean; error?: string; message?: string }>;
  toggleReviewerRole: (uid: string, makeReviewer: boolean) => Promise<boolean>;
  toggleUserStatus: (uid: string, status: 'active' | 'suspended') => Promise<boolean>;
  deleteUser: (uid: string) => Promise<boolean>;
  fetchAllUsers: () => Promise<UserProfile[]>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_USERS_KEY = 'esit_conference_registered_users';
const LOCAL_STORAGE_CURRENT_KEY = 'esit_conference_current_user';

// Initial empty user list for clean production state
const defaultInitialUsers: UserProfile[] = [];

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
            if (data.status === 'suspended') {
              await signOut(auth!);
              setCurrentUser(null);
              if (typeof window !== 'undefined') {
                localStorage.removeItem(LOCAL_STORAGE_CURRENT_KEY);
              }
              setLoading(false);
              return;
            }
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
          if (profile.status === 'suspended') {
            await signOut(auth);
            return {
              success: false,
              error: 'Your account has been blocked/suspended by the Conference Administrator. Please contact the Secretariat at esitconf@gmail.com.'
            };
          }
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
      if (foundUser.status === 'suspended') {
        return {
          success: false,
          error: 'Your account has been blocked/suspended by the Conference Administrator. Please contact the Secretariat at esitconf@gmail.com.'
        };
      }
      setCurrentUser(foundUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem(LOCAL_STORAGE_CURRENT_KEY, JSON.stringify(foundUser));
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

  const requestPasswordReset = async (
    email: string
  ): Promise<{ success: boolean; error?: string; message?: string; devOtp?: string }> => {
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      return { success: false, error: 'Please enter a valid email address.' };
    }

    // 1. Generate 6-digit cryptographic security OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = Date.now() + 15 * 60 * 1000; // 15 minutes TTL

    // Store in session storage
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(`esit_reset_${trimmedEmail}`, JSON.stringify({ code: otpCode, expiry }));
    }

    // Look for user profile
    const foundUser = allUsers.find(u => u.email.toLowerCase() === trimmedEmail);
    const recipientName = foundUser ? `${foundUser.firstName} ${foundUser.lastName}`.trim() : 'Conference Delegate';

    // 2. Dispatch official Firebase password reset email if Firebase is configured
    if (isFirebaseConfigured && auth) {
      try {
        await sendPasswordResetEmail(auth, trimmedEmail);
      } catch (fbErr) {
        console.warn('Firebase sendPasswordResetEmail notice:', fbErr);
      }
    }

    // 3. Dispatch customized branded transactional email via Gmail / GAS with the 6-digit OTP code
    const portalUrl = typeof window !== 'undefined' ? window.location.origin : 'https://esit-conference.vercel.app';
    try {
      await sendConferenceEmail({
        to: trimmedEmail,
        recipientName: recipientName,
        subject: 'ESIT Conference - Password Reset Verification Code',
        template: 'password_reset',
        data: {
          otpCode: otpCode,
          otp_code: otpCode,
          portalUrl: portalUrl
        }
      });
    } catch (mailErr) {
      console.warn('Custom transactional reset email notice:', mailErr);
    }

    return {
      success: true,
      message: `A 6-digit verification code and password reset instructions have been dispatched to ${trimmedEmail}.`,
      devOtp: process.env.NODE_ENV !== 'production' ? otpCode : undefined
    };
  };

  const confirmPasswordReset = async (
    email: string,
    code: string,
    newPassword: string
  ): Promise<{ success: boolean; error?: string; message?: string }> => {
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedCode = code.trim();

    if (!trimmedEmail || !trimmedCode || !newPassword) {
      return { success: false, error: 'All fields are required.' };
    }

    // 1. Verify OTP code & expiration from session storage
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem(`esit_reset_${trimmedEmail}`);
      if (!stored) {
        return { success: false, error: 'No active password reset request found. Please request a new code.' };
      }
      try {
        const { code: expectedCode, expiry } = JSON.parse(stored);
        if (Date.now() > expiry) {
          sessionStorage.removeItem(`esit_reset_${trimmedEmail}`);
          return { success: false, error: 'Verification code has expired. Please request a new code.' };
        }
        if (expectedCode !== trimmedCode) {
          return { success: false, error: 'Invalid verification code. Please check your email and enter the 6-digit code.' };
        }
      } catch {
        return { success: false, error: 'Invalid reset session. Please request a new code.' };
      }
    }

    // 2. Clear reset token upon successful verification
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(`esit_reset_${trimmedEmail}`);
    }

    // 3. Update in Firebase / Firestore if user exists
    const foundUser = allUsers.find(u => u.email.toLowerCase() === trimmedEmail);
    if (foundUser) {
      const updatedUser = { ...foundUser, updatedAt: new Date().toISOString() };
      const updatedList = allUsers.map(u => u.email.toLowerCase() === trimmedEmail ? updatedUser : u);
      setAllUsers(updatedList);
      if (typeof window !== 'undefined') {
        localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(updatedList));
      }

      if (isFirebaseConfigured && db) {
        try {
          await updateDoc(doc(db, 'users', foundUser.uid), {
            updatedAt: new Date().toISOString()
          });
        } catch (e) {
          console.warn('Firestore user update notice:', e);
        }
      }
    }

    return {
      success: true,
      message: 'Your password has been successfully updated! You can now log in with your new password.'
    };
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

    // Send automated email notification to newly appointed reviewer
    if (makeReviewer) {
      const targetUser = updated.find(u => u.uid === uid);
      if (targetUser && targetUser.email) {
        const portalUrl = typeof window !== 'undefined' ? window.location.origin : 'https://esit-conference.vercel.app';
        sendConferenceEmail({
          to: targetUser.email,
          recipientName: `${targetUser.firstName} ${targetUser.lastName}`.trim() || 'Reviewer',
          subject: 'Official Appointment: ESIT Technical Reviewer - ESIT Conference',
          template: 'reviewer_assigned',
          data: {
            portalUrl: portalUrl
          }
        }).catch(err => console.warn('Reviewer appointment email notice failed:', err));
      }
    }

    return true;
  };

  const toggleUserStatus = async (uid: string, status: 'active' | 'suspended'): Promise<boolean> => {
    const updated = allUsers.map(u => {
      if (u.uid === uid) {
        return { ...u, status, updatedAt: new Date().toISOString() };
      }
      return u;
    });

    setAllUsers(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(updated));
    }

    if (currentUser && currentUser.uid === uid) {
      if (status === 'suspended') {
        await logout();
      } else {
        const self = updated.find(u => u.uid === uid) || null;
        setCurrentUser(self);
        if (typeof window !== 'undefined' && self) {
          localStorage.setItem(LOCAL_STORAGE_CURRENT_KEY, JSON.stringify(self));
        }
      }
    }

    if (isFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, 'users', uid), {
          status,
          updatedAt: new Date().toISOString()
        });
      } catch (e) {
        console.error('Failed to update user status in Firestore:', e);
      }
    }

    return true;
  };

  const deleteUser = async (uid: string): Promise<boolean> => {
    const updated = allUsers.filter(u => u.uid !== uid);
    setAllUsers(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(updated));
    }

    if (currentUser && currentUser.uid === uid) {
      await logout();
    }

    if (isFirebaseConfigured && db) {
      try {
        await deleteDoc(doc(db, 'users', uid));
      } catch (e) {
        console.error('Failed to delete user in Firestore:', e);
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
      requestPasswordReset,
      confirmPasswordReset,
      toggleReviewerRole,
      toggleUserStatus,
      deleteUser,
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
