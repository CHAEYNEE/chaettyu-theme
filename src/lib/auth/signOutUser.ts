"use client";

import { supabaseClient } from "@/lib/supabase/client";
import { clearStoredAuthUser } from "@/lib/auth/authStorage";

export async function signOutUser() {
  const { error } = await supabaseClient.auth.signOut();

  clearStoredAuthUser();

  if (error) {
    throw error;
  }
}
