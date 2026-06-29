import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Sora 2 Playground',
    description: "Generate and edit videos using OpenAI's Sora 2 model.",
    authors: [{ name: 'Sajid Nazeer', url: 'mailto:sajid.nazeer@gmail.com' }]
};

export default function RootLayout({
    children
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang='en' suppressHydrationWarning>
            <body className='font-sans antialiased'>
                <ThemeProvider attribute='class' forcedTheme='light' defaultTheme='light' disableTransitionOnChange>
                    {children}
                </ThemeProvider>
            </body>
        </html>
    );
}
