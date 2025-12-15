import { Logo } from '@/components/logo'

import { Button } from '@/components/ui/button'
import { SITE_CONFIG } from '@/lib/constants/site'
import { StackHandler } from '@stackframe/stack'
import Link from 'next/link'
import React, { ReactNode } from 'react'

export default function AuthLayout({ children }: { children: ReactNode }) {
    return <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className='flex flex-col items-center'>
            <Logo href="/" withText size='lg' />
        </div>
        <div className='flex flex-col items-center w-full max-w-md'>
            <main className="container flex grow flex-col items-center justify-center self-center p-4 md:p-6">

                <StackHandler fullPage={false} />
            </main>
        </div>
        <footer className='flex flex-col items-center w-full max-w-md gap-2'>
            <p className='text-muted-foreground text-sm'>Copyright © 2025 - {SITE_CONFIG.appName} All rights reserved.</p>
            <Link href="/">
                <Button variant="dim">Back to {SITE_CONFIG.appName}</Button>
            </Link>
        </footer>
    </div>
}