"use client";

import type { ReactNode } from "react";
import { NotificationProvider } from "./notifaction-context";

interface AppWrapperProps {
  children: ReactNode;
}

export function AppWrapper({ children }: AppWrapperProps) {
  return <NotificationProvider>{children}</NotificationProvider>;
}
