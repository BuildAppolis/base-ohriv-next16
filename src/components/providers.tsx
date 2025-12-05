"use client"

// import { AuthUIProvider } from "@daveyplate/better-auth-ui"
// import Link from "next/link"
// import { useRouter, usePathname } from "next/navigation"
import type { ReactNode } from "react"
// import { client } from "@/lib/auth/client"
import { ThemeProvider } from "next-themes"
// import { Wrapper, WrapperWithQuery } from "./wrapper"
import { Toaster } from "@/components/ui/sonner"
// React DevTools - only imported in development
// import dynamic from "next/dynamic";

// const ReactDevTools = dynamic(
//     () => import("@tanstack/react-query-devtools").then(mod => ({ default: mod.ReactQueryDevtools })),
//     {
//         ssr: false,
//         // Only load in development
//         loading: () => null
//     }
// )
// import { ImageKitProvider } from "./imagekit/imagekit-provider"
// import { AuthContextProvider } from "@/providers/auth-context-provider"
// import { TRPCProvider } from "@/lib/trpc/provider"
// import { Provider as JotaiProvider } from "jotai"

export function Providers({ children }: { children: ReactNode }) {
    // const router = useRouter()
    // const pathname = usePathname()
    // Exclude both admin and dashboard routes from the wrapper
    // const isExcludedRoute = pathname?.startsWith('/admin') || pathname?.startsWith('/dashboard')

    // return (
    //     <JotaiProvider>
    //         <ThemeProvider
    //             attribute="class"
    //             defaultTheme="system"
    //             enableSystem
    //             disableTransitionOnChange
    //         >
    //             <TRPCProvider>
    //                 <AuthUIProvider
    //                     authClient={client}
    //                     navigate={router.push}
    //                     replace={router.replace}
    //                     onSessionChange={() => {
    //                         // Clear router cache (protected routes)
    //                         router.refresh()
    //                     }}
    //                     Link={Link}
    //                 >
    //                     <AuthContextProvider>
    //                         <ImageKitProvider urlEndpoint={process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || ''}>
    //                             <WrapperWithQuery>{children}</WrapperWithQuery>
    //                         </ImageKitProvider>
    //                         <Toaster richColors closeButton />
    //                         {/* {process.env.NODE_ENV === 'development' && <ReactDevTools initialIsOpen={false} />} */}
    //                     </AuthContextProvider>
    //                 </AuthUIProvider>
    //             </TRPCProvider>
    //         </ThemeProvider>
    //     </JotaiProvider>
    // )
    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >{children}
            <Toaster richColors closeButton />
        </ThemeProvider>)
}