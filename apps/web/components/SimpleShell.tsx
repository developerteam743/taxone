'use client';
import { ReactNode } from 'react';
import Shell from '@/components/Shell';

export default function SimpleShell({ title, children }: { title: string; children: ReactNode }) {
  return <Shell title={title}>{children}</Shell>;
}
