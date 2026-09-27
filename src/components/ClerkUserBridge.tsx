import React, { useEffect, useRef } from 'react';
import { useUser, useClerk } from '@clerk/clerk-react';
import { api, tokenStorage } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const ClerkUserBridge: React.FC = () => {
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const { refreshUser, setUserFromClerk, clearUserSession } = useAuth();
  const lastSyncedId = useRef<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn && user) {
      if (lastSyncedId.current === user.id) {
        return;
      }

      const email = user.primaryEmailAddress?.emailAddress || `${user.id}@intervexa.io`;
      const name = user.fullName || user.firstName || email.split('@')[0];
      const avatar = user.imageUrl;
      const initialRole = (user.publicMetadata?.role as any) || 'candidate';

      api.auth
        .clerkSync({
          clerkId: user.id,
          email,
          name,
          avatar,
          role: initialRole,
        })
        .then((res) => {
          tokenStorage.set(res.token);
          lastSyncedId.current = user.id;
          setUserFromClerk(res.user, res.profile);
        })
        .catch((err) => {
          console.error('[Clerk User Bridge] Sync error:', err);
        });
    } else if (!isSignedIn) {
      if (lastSyncedId.current) {
        lastSyncedId.current = null;
        clearUserSession();
      }
    }
  }, [isLoaded, isSignedIn, user, setUserFromClerk, clearUserSession]);

  return null;
};
