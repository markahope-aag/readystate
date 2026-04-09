/**
 * Kestralis — ReadyState Assessment Report PDF
 *
 * Server-rendered (@react-pdf/renderer) multi-page document. Consumed by
 * /app/api/assessment/[id]/report/route.ts via renderToBuffer. Not a
 * traditional React component — uses @react-pdf's own primitive set
 * (Document/Page/View/Text), not HTML elements.
 *
 * Layout:
 *   1. Cover page        — brand, org, site, date, risk badge
 *   2. Executive summary — 3 score cards + overall block + top 3 findings
 *   3. Gap analysis      — table of all no/partial responses
 *   4. Recommendations   — one card per weight-3 "no" finding with remediation
 *
 * Footer (fixed on every page): "Prepared by Kestralis · Powered by
 * Sentinel Ridge Security" on the left, page number on the right.
 */

/* eslint-disable react/no-unknown-property */
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import type { Question } from "@/lib/assessment/questions";
import { sectionMeta } from "@/lib/assessment/questions";
import {
  getRiskLabel,
  type RiskLevel,
} from "@/lib/assessment/scoring";
import { recommendations } from "@/lib/assessment/recommendations";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ReportOrganization {
  name: string;
  industry: string | null;
  employee_count: number | null;
  california_locations: number | null;
}

export interface ReportAssessment {
  id: string;
  site_name: string | null;
  site_address: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface ReportScores {
  sb553Score: number;
  asisScore: number;
  hazardScore: number;
  overallScore: number;
  riskLevel: RiskLevel;
}

export interface ReportGap {
  question: Question;
  response: "no" | "partial";
  notes: string | null;
}

export interface AssessmentReportProps {
  assessment: ReportAssessment;
  organization: ReportOrganization | null;
  scores: ReportScores;
  gaps: ReportGap[];
  generatedAt: Date;
}

// ─── Colors ──────────────────────────────────────────────────────────────────

// Hex equivalents of our Tailwind risk palette. react-pdf doesn't accept
// Tailwind classes — needs literal hex/rgb values.
interface PdfColors {
  bg: string;
  text: string;
  border: string;
  accent: string;
}

function riskPdfColors(level: RiskLevel): PdfColors {
  switch (level) {
    case "low":
      return {
        bg: "#ECFDF5",
        text: "#064E3B",
        border: "#A7F3D0",
        accent: "#059669",
      };
    case "moderate":
      return {
        bg: "#F0F9FF",
        text: "#0C4A6E",
        border: "#BAE6FD",
        accent: "#0284C7",
      };
    case "high":
      return {
        bg: "#FFFBEB",
        text: "#78350F",
        border: "#FDE68A",
        accent: "#D97706",
      };
    case "critical":
      return {
        bg: "#FEF2F2",
        text: "#7F1D1D",
        border: "#FECACA",
        accent: "#DC2626",
      };
  }
}

function scoreToRiskLevel(score: number): RiskLevel {
  if (score >= 85) return "low";
  if (score >= 70) return "moderate";
  if (score >= 50) return "high";
  return "critical";
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const colors = {
  text: "#0f172a",
  textMuted: "#64748b",
  textSoft: "#94a3b8",
  border: "#e2e8f0",
  surface: "#f8fafc",
  brand: "#0f172a",
  brandAccent: "#1e293b",
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 56,
    paddingBottom: 64,
    paddingHorizontal: 48,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: colors.text,
  },

  // ─── Footer (fixed on every page) ─────────────────────────────────────
  footer: {
    position: "absolute",
    bottom: 28,
    left: 48,
    right: 48,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 0.5,
    borderTopColor: colors.border,
    paddingTop: 10,
  },
  footerText: {
    fontSize: 8,
    color: colors.textMuted,
  },

  // ─── Cover page ───────────────────────────────────────────────────────
  coverWrap: {
    flex: 1,
    justifyContent: "space-between",
  },
  coverTop: {
    marginTop: 24,
  },
  brandMark: {
    fontSize: 24,
    fontFamily: "Helvetica-Bold",
    color: colors.brand,
    letterSpacing: 4,
  },
  brandTag: {
    marginTop: 6,
    fontSize: 9,
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
  coverTitleBlock: {
    marginTop: 120,
  },
  coverLabel: {
    fontSize: 8,
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  coverValue: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    marginBottom: 20,
  },
  coverSubValue: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: -16,
    marginBottom: 20,
  },
  coverRiskBadge: {
    marginTop: 28,
    alignSelf: "flex-start",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderWidth: 1.5,
    borderRadius: 999,
  },
  coverRiskBadgeText: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1.5,
  },
  coverDocType: {
    marginBottom: 4,
    fontSize: 9,
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
  coverDocTitle: {
    fontSize: 34,
    fontFamily: "Helvetica-Bold",
    lineHeight: 1.15,
    marginBottom: 12,
  },

  // ─── Section headings ─────────────────────────────────────────────────
  h1: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    marginBottom: 6,
  },
  h1Sub: {
    fontSize: 10,
    color: colors.textMuted,
    marginBottom: 20,
  },
  h2: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    marginBottom: 8,
    marginTop: 16,
  },

  // ─── Score cards (exec summary) ───────────────────────────────────────
  scoreRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  scoreCard: {
    flex: 1,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
  },
  scoreCardLabel: {
    fontSize: 8,
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  scoreCardValue: {
    fontSize: 26,
    fontFamily: "Helvetica-Bold",
    lineHeight: 1,
  },
  scoreCardRisk: {
    fontSize: 9,
    marginTop: 6,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  overallBlock: {
    marginTop: 4,
    padding: 18,
    borderWidth: 1.5,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  overallScoreBubble: {
    width: 86,
    height: 86,
    borderRadius: 43,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  overallScoreNumber: {
    fontSize: 30,
    fontFamily: "Helvetica-Bold",
    lineHeight: 1,
  },
  overallScoreLabel: {
    fontSize: 7,
    marginTop: 2,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  overallTextBlock: {
    flex: 1,
  },
  overallRatingLabel: {
    fontSize: 8,
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  overallRatingTitle: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    marginBottom: 6,
  },
  overallDescription: {
    fontSize: 9.5,
    lineHeight: 1.55,
    color: colors.textMuted,
  },

  // ─── Finding summary (exec summary) ───────────────────────────────────
  findingItem: {
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 0.5,
    borderTopColor: colors.border,
  },
  findingTopLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 3,
  },
  findingBadge: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: "#991B1B",
    backgroundColor: "#FEE2E2",
    paddingVertical: 2,
    paddingHorizontal: 5,
    borderRadius: 3,
  },
  findingId: {
    fontSize: 8,
    color: colors.textSoft,
    fontFamily: "Courier",
  },
  findingText: {
    fontSize: 10,
    lineHeight: 1.4,
    marginBottom: 3,
  },

  // ─── Gap analysis table ───────────────────────────────────────────────
  table: {
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: 4,
  },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
    paddingVertical: 7,
    paddingHorizontal: 6,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
    paddingVertical: 7,
    paddingHorizontal: 6,
  },
  tableRowLast: {
    borderBottomWidth: 0,
  },
  th: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    color: colors.textMuted,
  },
  td: {
    fontSize: 8.5,
    lineHeight: 1.4,
  },
  tdMono: {
    fontSize: 7,
    fontFamily: "Courier",
    color: colors.textMuted,
  },
  pill: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 999,
    borderWidth: 0.5,
    alignSelf: "flex-start",
  },

  // ─── Recommendation cards ─────────────────────────────────────────────
  recCard: {
    borderWidth: 0.8,
    borderColor: "#FCA5A5",
    borderRadius: 6,
    padding: 12,
    marginBottom: 10,
  },
  recTopRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    gap: 6,
  },
  recBadge: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: "#991B1B",
    backgroundColor: "#FEE2E2",
    paddingVertical: 2,
    paddingHorizontal: 5,
    borderRadius: 3,
  },
  recId: {
    fontSize: 7,
    fontFamily: "Courier",
    color: colors.textSoft,
  },
  recQuestion: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    marginBottom: 6,
    lineHeight: 1.3,
  },
  recGuidance: {
    fontSize: 9,
    lineHeight: 1.55,
    color: colors.text,
    borderLeftWidth: 1.5,
    borderLeftColor: colors.brandAccent,
    paddingLeft: 8,
  },
});

// ─── Sub-components ───────────────────────────────────────────────────────────

const Footer = () => (
  <View style={styles.footer} fixed>
    <Text style={styles.footerText}>
      Prepared by Kestralis · Powered by Sentinel Ridge Security
    </Text>
    <Text
      style={styles.footerText}
      render={({ pageNumber, totalPages }) =>
        `Page ${pageNumber} of ${totalPages}`
      }
    />
  </View>
);

function ScoreCard({
  label,
  score,
}: {
  label: string;
  score: number;
}) {
  const riskColors = riskPdfColors(scoreToRiskLevel(score));
  const { label: riskLabel } = getRiskLabel(scoreToRiskLevel(score));
  return (
    <View style={styles.scoreCard}>
      <Text style={styles.scoreCardLabel}>{label}</Text>
      <Text style={styles.scoreCardValue}>{score}%</Text>
      <Text style={[styles.scoreCardRisk, { color: riskColors.accent }]}>
        {riskLabel}
      </Text>
    </View>
  );
}

// ─── Pages ────────────────────────────────────────────────────────────────────

function CoverPage({
  assessment,
  organization,
  scores,
  generatedAt,
}: {
  assessment: ReportAssessment;
  organization: ReportOrganization | null;
  scores: ReportScores;
  generatedAt: Date;
}) {
  const risk = riskPdfColors(scores.riskLevel);
  const { label: riskLabel } = getRiskLabel(scores.riskLevel);
  return (
    <Page size="LETTER" style={styles.page}>
      <View style={styles.coverWrap}>
        <View style={styles.coverTop}>
          <Text style={styles.brandMark}>KESTRALIS</Text>
          <Text style={styles.brandTag}>ReadyState · SB 553 Assessment</Text>
        </View>

        <View>
          <Text style={styles.coverDocType}>Assessment Report</Text>
          <Text style={styles.coverDocTitle}>
            Workplace Violence{"\n"}Prevention Assessment
          </Text>

          <View style={styles.coverTitleBlock}>
            <Text style={styles.coverLabel}>Organization</Text>
            <Text style={styles.coverValue}>
              {organization?.name ?? "—"}
            </Text>

            <Text style={styles.coverLabel}>Site</Text>
            <Text style={styles.coverValue}>
              {assessment.site_name ?? "—"}
            </Text>
            {assessment.site_address && (
              <Text style={styles.coverSubValue}>
                {assessment.site_address}
              </Text>
            )}

            <Text style={styles.coverLabel}>Assessed</Text>
            <Text style={styles.coverValue}>{formatDate(generatedAt)}</Text>

            <View
              style={[
                styles.coverRiskBadge,
                {
                  backgroundColor: risk.bg,
                  borderColor: risk.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.coverRiskBadgeText,
                  { color: risk.text },
                ]}
              >
                {riskLabel.toUpperCase()}
              </Text>
            </View>
          </View>
        </View>

        <View />
      </View>
      <Footer />
    </Page>
  );
}

function ExecutiveSummaryPage({
  scores,
  gaps,
}: {
  scores: ReportScores;
  gaps: ReportGap[];
}) {
  const risk = riskPdfColors(scores.riskLevel);
  const { label: riskLabel, description } = getRiskLabel(scores.riskLevel);
  const topFindings = gaps
    .filter((g) => g.question.weight === 3 && g.response === "no")
    .slice(0, 3);

  return (
    <Page size="LETTER" style={styles.page}>
      <Text style={styles.h1}>Executive Summary</Text>
      <Text style={styles.h1Sub}>
        Scores, risk level, and the highest-priority findings.
      </Text>

      <View style={styles.scoreRow}>
        <ScoreCard label="SB 553 Compliance" score={scores.sb553Score} />
        <ScoreCard label="ASIS Standard" score={scores.asisScore} />
        <ScoreCard label="Site Hazard" score={scores.hazardScore} />
      </View>

      <View style={[styles.overallBlock, { borderColor: risk.border }]}>
        <View
          style={[
            styles.overallScoreBubble,
            {
              backgroundColor: risk.bg,
              borderColor: risk.border,
            },
          ]}
        >
          <Text
            style={[styles.overallScoreNumber, { color: risk.text }]}
          >
            {scores.overallScore}
          </Text>
          <Text
            style={[styles.overallScoreLabel, { color: risk.text }]}
          >
            Overall
          </Text>
        </View>
        <View style={styles.overallTextBlock}>
          <Text style={styles.overallRatingLabel}>
            Overall Program Rating
          </Text>
          <Text style={styles.overallRatingTitle}>{riskLabel}</Text>
          <Text style={styles.overallDescription}>{description}</Text>
        </View>
      </View>

      {topFindings.length > 0 && (
        <>
          <Text style={styles.h2}>Top Critical Findings</Text>
          {topFindings.map((g) => (
            <View key={g.question.id} style={styles.findingItem}>
              <View style={styles.findingTopLine}>
                <Text style={styles.findingBadge}>CRITICAL</Text>
                <Text style={styles.findingId}>{g.question.id}</Text>
              </View>
              <Text style={styles.findingText}>{g.question.question}</Text>
            </View>
          ))}
        </>
      )}

      <Footer />
    </Page>
  );
}

function GapAnalysisPage({ gaps }: { gaps: ReportGap[] }) {
  return (
    <Page size="LETTER" style={styles.page} wrap>
      <Text style={styles.h1}>Gap Analysis</Text>
      <Text style={styles.h1Sub}>
        {gaps.length === 0
          ? "No gaps identified. All questions answered yes or n/a."
          : `${gaps.length} finding${
              gaps.length === 1 ? "" : "s"
            } requiring attention, sorted by severity.`}
      </Text>

      {gaps.length > 0 && (
        <View style={styles.table}>
          <View style={styles.tableHeaderRow} fixed>
            <Text style={[styles.th, { width: "12%" }]}>SECTION</Text>
            <Text style={[styles.th, { width: "52%" }]}>FINDING</Text>
            <Text style={[styles.th, { width: "16%" }]}>RESPONSE</Text>
            <Text style={[styles.th, { width: "20%" }]}>PRIORITY</Text>
          </View>

          {gaps.map((gap, idx) => {
            const q = gap.question;
            const priority =
              q.weight === 3 ? "Critical" : q.weight === 2 ? "High" : "Medium";
            const priorityColor =
              q.weight === 3
                ? riskPdfColors("critical")
                : q.weight === 2
                  ? riskPdfColors("high")
                  : { bg: "#F1F5F9", text: "#475569", border: "#CBD5E1", accent: "#475569" };
            const responseColor =
              gap.response === "no"
                ? riskPdfColors("critical")
                : riskPdfColors("high");
            return (
              <View
                key={q.id}
                style={[
                  styles.tableRow,
                  idx === gaps.length - 1 ? styles.tableRowLast : {},
                ]}
                wrap={false}
              >
                <View style={{ width: "12%" }}>
                  <Text style={styles.tdMono}>
                    {sectionMeta[q.section].label.split(" ")[0]}
                  </Text>
                </View>
                <View style={{ width: "52%", paddingRight: 6 }}>
                  <Text style={styles.tdMono}>{q.id}</Text>
                  <Text style={styles.td}>{q.question}</Text>
                </View>
                <View style={{ width: "16%" }}>
                  <Text
                    style={[
                      styles.pill,
                      {
                        backgroundColor: responseColor.bg,
                        borderColor: responseColor.border,
                        color: responseColor.text,
                      },
                    ]}
                  >
                    {gap.response === "no" ? "No" : "Partial"}
                  </Text>
                </View>
                <View style={{ width: "20%" }}>
                  <Text
                    style={[
                      styles.pill,
                      {
                        backgroundColor: priorityColor.bg,
                        borderColor: priorityColor.border,
                        color: priorityColor.text,
                      },
                    ]}
                  >
                    {priority}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      )}

      <Footer />
    </Page>
  );
}

function RecommendationsPage({ gaps }: { gaps: ReportGap[] }) {
  const criticalFailures = gaps.filter(
    (g) => g.question.weight === 3 && g.response === "no",
  );

  if (criticalFailures.length === 0) {
    return (
      <Page size="LETTER" style={styles.page}>
        <Text style={styles.h1}>Recommended Remediation</Text>
        <Text style={styles.h1Sub}>
          No critical (weight 3) findings require immediate remediation.
          Review the Gap Analysis for lower-priority improvements.
        </Text>
        <Footer />
      </Page>
    );
  }

  return (
    <Page size="LETTER" style={styles.page} wrap>
      <Text style={styles.h1}>Recommended Remediation</Text>
      <Text style={styles.h1Sub}>
        {criticalFailures.length} critical finding
        {criticalFailures.length === 1 ? "" : "s"} with concrete next steps.
      </Text>

      {criticalFailures.map((gap) => {
        const rec = recommendations[gap.question.id];
        return (
          <View key={gap.question.id} style={styles.recCard} wrap={false}>
            <View style={styles.recTopRow}>
              <Text style={styles.recBadge}>CRITICAL</Text>
              <Text style={styles.recId}>{gap.question.id}</Text>
            </View>
            <Text style={styles.recQuestion}>{gap.question.question}</Text>
            <Text style={styles.recGuidance}>
              {rec ?? "Remediation guidance for this item is pending."}
            </Text>
          </View>
        );
      })}

      <Footer />
    </Page>
  );
}

// ─── Document ────────────────────────────────────────────────────────────────

export function AssessmentReport({
  assessment,
  organization,
  scores,
  gaps,
  generatedAt,
}: AssessmentReportProps) {
  return (
    <Document
      title={`ReadyState Assessment — ${organization?.name ?? "Report"}`}
      author="Kestralis"
      subject="Workplace Violence Prevention Assessment"
      creator="ReadyState by Kestralis"
      producer="ReadyState / @react-pdf/renderer"
    >
      <CoverPage
        assessment={assessment}
        organization={organization}
        scores={scores}
        generatedAt={generatedAt}
      />
      <ExecutiveSummaryPage scores={scores} gaps={gaps} />
      <GapAnalysisPage gaps={gaps} />
      <RecommendationsPage gaps={gaps} />
    </Document>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
