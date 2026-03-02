"use client";

import { useEffect } from "react";
import { requestForToken, onMessageListener } from "@/lib/firebase/config";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase Client (For saving FCM tokens to the database)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // 1. Check existing permission
    if ("Notification" in window) {
      if (Notification.permission === "granted") {
        initializeFCM();
      } else if (Notification.permission !== "denied") {
        // Automatically request permission on mount
        Notification.requestPermission().then((permission) => {
          if (permission === 'granted') {
            initializeFCM();
          }
        });
      }
    }
  }, []);

  const initializeFCM = async () => {
    const token = await requestForToken();
    if (token) {
      // 2. Fetch active Supabase user session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
         // 3. Upsert token into user preferences or dedicated tokens table
         console.log("[NotificationProvider] Tying FCM Token to Supabase User:", session.user.id);
         // Example DB Call (Assuming 'user_devices' or similar exists, using 'users' as placeholder metadata here)
         await supabase.auth.updateUser({
           data: { fcm_token: token }
         });
      }
    }

    // 4. Foreground message listener
    onMessageListener().then((payload: unknown) => {
      console.log("[NotificationProvider] Foreground Message Received:", payload);
      // Optional: Display custom in-app Toast or Modal here
    }).catch(err => console.log('failed: ', err));
  };

  return <>{children}</>;
}
