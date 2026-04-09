"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

/**
 * Client-side trigger for the PDF report download.
 * Calls GET /api/assessment/:id/report, shows a Sonner loading toast during
 * generation, and kicks off a browser download from the returned blob.
 */
export function DownloadReportButton({
  assessmentId,
}: {
  assessmentId: string;
}) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    const toastId = toast.loading("Generating PDF report…");

    try {
      const res = await fetch(`/api/assessment/${assessmentId}/report`);

      if (!res.ok) {
        let message = "Failed to generate report";
        try {
          const body = await res.json();
          if (body?.error) message = body.error;
        } catch {
          // response wasn't JSON — fall through with the default message
        }
        throw new Error(message);
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      const disposition = res.headers.get("content-disposition") ?? "";
      const match = disposition.match(/filename="?([^";]+)"?/i);
      const filename =
        match?.[1] ?? `readystate-report-${assessmentId}.pdf`;

      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);

      toast.success("Report downloaded", { id: toastId });
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Failed to generate report",
        { id: toastId },
      );
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleDownload}
      disabled={downloading}
    >
      {downloading ? "Generating…" : "Download Report"}
    </Button>
  );
}
