import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { OrderSummary, ProfileRecord, SaveProfileInput, WebAuthSession } from '../account/types';
import { clearWebCheckoutDraft } from '../../lib/webCheckoutDraft';
import { getSupabaseConfigError, isSupabaseConfigured } from '../../lib/supabaseConfig';

type WebAuthContextValue = {
  authReady: boolean;
  isConfigured: boolean;
  configError: string | null;
  isDialogOpen: boolean;
  session: WebAuthSession | null;
  profile: ProfileRecord | null;
  orders: OrderSummary[];
  openAccountDialog: () => void;
  closeAccountDialog: () => void;
  requestEmailOtp: (email: string) => Promise<void>;
  confirmEmailOtp: (email: string, token: string) => Promise<void>;
  saveProfile: (input: Omit<SaveProfileInput, 'userId' | 'email'>) => Promise<ProfileRecord>;
  refreshOrders: () => Promise<void>;
  signOut: () => Promise<void>;
};

const WebAuthContext = createContext<WebAuthContextValue | undefined>(undefined);
const loadWebAccountService = () => import('../../services/webAccount');

export function WebAuthProvider({ children }: { children: ReactNode }) {
  const configured = isSupabaseConfigured();
  const configError = configured ? null : getSupabaseConfigError();
  const [authReady, setAuthReady] = useState(!configured);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [session, setSession] = useState<WebAuthSession | null>(null);
  const [profile, setProfile] = useState<ProfileRecord | null>(null);
  const [orders, setOrders] = useState<OrderSummary[]>([]);

  const loadAccountData = useCallback(async (activeSession: WebAuthSession | null) => {
    if (!activeSession?.userId) {
      setProfile(null);
      setOrders([]);
      return;
    }

    const { listUserOrders, loadUserProfile } = await loadWebAccountService();
    const [profileData, orderData] = await Promise.all([
      loadUserProfile(activeSession.userId),
      listUserOrders(activeSession.userId),
    ]);

    setProfile(profileData);
    setOrders(orderData);
  }, []);

  useEffect(() => {
    if (!configured) {
      return undefined;
    }

    let isActive = true;
    let unsubscribe: (() => void) | undefined;

    void loadWebAccountService()
      .then(async ({ getCurrentWebSession, subscribeToWebAuthChanges }) => {
        const currentSession = await getCurrentWebSession();
        if (!isActive) {
          return;
        }

        setSession(currentSession);
        await loadAccountData(currentSession);

        if (!isActive) {
          return;
        }

        unsubscribe = subscribeToWebAuthChanges((_, nextSession) => {
          if (!isActive) {
            return;
          }

          setSession(nextSession);
          void loadAccountData(nextSession);
          setAuthReady(true);
        });
      })
      .catch(() => {
        if (!isActive) {
          return;
        }

        setSession(null);
        setProfile(null);
        setOrders([]);
      })
      .finally(() => {
        if (isActive) {
          setAuthReady(true);
        }
      });

    return () => {
      isActive = false;
      unsubscribe?.();
    };
  }, [configured, loadAccountData]);

  const value = useMemo<WebAuthContextValue>(() => ({
    authReady,
    isConfigured: configured,
    configError,
    isDialogOpen,
    session,
    profile,
    orders,
    openAccountDialog() {
      if (!configured) {
        return;
      }

      setIsDialogOpen(true);
    },
    closeAccountDialog() {
      setIsDialogOpen(false);
    },
    async requestEmailOtp(email: string) {
      const { sendWebEmailOtp } = await loadWebAccountService();
      await sendWebEmailOtp(email.trim().toLowerCase());
    },
    async confirmEmailOtp(email: string, token: string) {
      const { getCurrentWebSession, verifyWebEmailOtp } = await loadWebAccountService();
      await verifyWebEmailOtp(email.trim().toLowerCase(), token.trim());
      const currentSession = await getCurrentWebSession();
      setSession(currentSession);
      await loadAccountData(currentSession);
    },
    async saveProfile(input: Omit<SaveProfileInput, 'userId' | 'email'>) {
      if (!session?.userId || !session.email) {
        throw new Error('No authenticated account is available.');
      }

      const { upsertUserProfile } = await loadWebAccountService();
      const nextProfile = await upsertUserProfile({
        ...input,
        userId: session.userId,
        email: session.email,
      });

      setProfile(nextProfile);
      return nextProfile;
    },
    async refreshOrders() {
      if (!session?.userId) {
        setOrders([]);
        return;
      }

      const { listUserOrders } = await loadWebAccountService();
      setOrders(await listUserOrders(session.userId));
    },
    async signOut() {
      const { signOutWebAccount } = await loadWebAccountService();
      await signOutWebAccount();
      clearWebCheckoutDraft();
      setSession(null);
      setProfile(null);
      setOrders([]);
      setIsDialogOpen(false);
    },
  }), [authReady, configured, configError, isDialogOpen, loadAccountData, orders, profile, session]);

  return (
    <WebAuthContext.Provider value={value}>
      {children}
    </WebAuthContext.Provider>
  );
}

export function useWebAuth() {
  const context = useContext(WebAuthContext);
  if (!context) {
    throw new Error('useWebAuth must be used within a WebAuthProvider.');
  }

  return context;
}
