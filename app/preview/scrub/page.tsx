import { notFound } from "next/navigation";

import LandingMockup from "@/components/preview/LandingMockup";
import { ScrubLayer } from "@/components/preview/ScrubLayer";

export const dynamic = "force-dynamic";

const PREVIEW_KEY = "741407";

interface Props {
  searchParams: Promise<{ [k: string]: string | string[] | undefined }>;
}

export default async function ScrubPreviewPage({ searchParams }: Props) {
  const params = await searchParams;
  if (params.key !== PREVIEW_KEY) notFound();
  return (
    <div style={{ position: "relative" }}>
      <ScrubLayer />
      <LandingMockup />
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          bottom: 12,
          left: 12,
          zIndex: 9999,
          fontFamily: "var(--mono, 'Space Mono', monospace)",
          fontSize: 9,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "rgba(26, 26, 26, 0.45)",
          background: "rgba(250, 247, 242, 0.85)",
          backdropFilter: "blur(4px)",
          padding: "6px 10px",
          border: "1px solid rgba(26, 26, 26, 0.08)",
          pointerEvents: "none",
        }}
      >
        Sandbox · /preview/scrub · not live
      </div>
    </div>
  );
}
