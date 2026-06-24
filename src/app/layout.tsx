import React from 'react';

export const metadata = {
  title: 'AbJ Tech Marketplace',
  description: 'Plateforme moderne créée par AbJ Tech',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
