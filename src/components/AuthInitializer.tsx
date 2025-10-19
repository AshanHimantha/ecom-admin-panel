// src/components/AuthInitializer.tsx
// --- NEW FILE: Solves the refresh problem.

import { useEffect, useState, ReactNode } from "react";
import { useDispatch } from "react-redux";
import { getCurrentUser, fetchUserAttributes, fetchAuthSession } from "@aws-amplify/auth";
import { setAuthSession } from "@/store/slices/authSlice";

const FullScreenLoader = () => (
  <div className="w-full h-screen flex items-center justify-center bg-background">
    <p>Loading session...</p>
  </div>
);

export function AuthInitializer({ children }: { children: ReactNode }) {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const currentUser = await getCurrentUser();
        const attributes = await fetchUserAttributes();
        const session = await fetchAuthSession();
        const accessToken = session.tokens?.accessToken;
        let roles: string[] = [];
        if (accessToken?.payload) {
          roles = (accessToken.payload['cognito:groups'] as string[]) || [];
        }

        dispatch(setAuthSession({ user: currentUser, userAttributes: attributes, roles }));
      } catch (error) {
        console.log("No active session found.");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, [dispatch]);

  return isLoading ? <FullScreenLoader /> : <>{children}</>;
}