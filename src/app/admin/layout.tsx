import type { Metadata } from 'next';
import '../globals.css';

export const metadata: Metadata = {
  title: 'Admin — lanrae.co.uk',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
