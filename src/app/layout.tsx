import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '../context/CartContext';
import { AuthProvider } from '../context/AuthContext';
import { FirebaseAuthProvider } from '../context/FirebaseAuthContext';

export const metadata: Metadata = {
  title: "Govinda's Pure Veg Restaurant & Dining | QR Table Service",
  description: "Exquisite Vegetarian Dining Experience with Instant QR Code Table Ordering & Real-Time Kitchen Tracking at Govinda's",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-amber-500 selection:text-slate-950">
        <FirebaseAuthProvider>
          <AuthProvider>
            <CartProvider>
              {children}
            </CartProvider>
          </AuthProvider>
        </FirebaseAuthProvider>
      </body>
    </html>
  );
}
