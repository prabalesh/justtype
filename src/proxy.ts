import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export default function proxy(_req: NextRequest) {
    // For Phase 2C, we do not enforce any auth here.
    // Just pass all requests through.
    return NextResponse.next();
}

export const config = {
    // Pass through matching rules
    matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
