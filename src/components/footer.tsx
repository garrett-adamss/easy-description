import { Package } from "lucide-react";
import Link from "next/link";

export default function Footer() {
    return (
        < footer className = "border-t py-6 md:py-8" >
            <div className="container flex flex-col items-center justify-between gap-4 px-4 md:flex-row md:px-6">
                <div className="flex items-center gap-2 text-sm">
                    <Package className="h-5 w-5" />
                    <span className="font-semibold">SaaS Starter</span>
                </div>
                <p className="text-center text-sm text-muted-foreground md:text-left">
                    &copy; {new Date().getFullYear()} Your Company. All rights reserved.
                </p>
                <div className="flex gap-4">
                    <Link href="/doc" className="text-sm text-muted-foreground hover:underline">
                        Documentation
                    </Link>
                    <Link href="/pricing" className="text-sm text-muted-foreground hover:underline">
                        Pricing
                    </Link>
                    <Link href="/dashboard" className="text-sm text-muted-foreground hover:underline">
                        Dashboard
                    </Link>
                </div>
            </div>
    </footer >
    )
}