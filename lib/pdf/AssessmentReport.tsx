/**
 * Kestralis — ReadyState Assessment Report PDF (v2)
 *
 * SB 553 category-based scoring model. Ten statutory categories, each
 * evaluated as Effective / Implemented / Partial / Not Compliant / N/A.
 */

/* eslint-disable react/no-unknown-property */
import {
  Document,
  Font,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import type { Category, ResponseValue } from "@/lib/assessment/questions";
import { RESPONSE_OPTIONS } from "@/lib/assessment/questions";
import { getRiskLabel, type RiskLevel } from "@/lib/assessment/scoring";
import { recommendations } from "@/lib/assessment/recommendations";

// ─── Font registration ──────────────────────────────────────────────────────

Font.register({
  family: "Fraunces",
  fonts: [
    {
      src: "https://cdn.jsdelivr.net/gh/undercasetype/Fraunces@main/fonts/static/OTF/Fraunces_9pt-Light.otf",
      fontWeight: 300,
      fontStyle: "normal",
    },
    {
      src: "https://cdn.jsdelivr.net/gh/undercasetype/Fraunces@main/fonts/static/OTF/Fraunces_9pt-Regular.otf",
      fontWeight: 400,
      fontStyle: "normal",
    },
    {
      src: "https://cdn.jsdelivr.net/gh/undercasetype/Fraunces@main/fonts/static/OTF/Fraunces_9pt-Medium.otf",
      fontWeight: 500,
      fontStyle: "normal",
    },
    {
      src: "https://cdn.jsdelivr.net/gh/undercasetype/Fraunces@main/fonts/static/OTF/Fraunces_9pt-Italic.otf",
      fontWeight: 400,
      fontStyle: "italic",
    },
    {
      src: "https://cdn.jsdelivr.net/gh/undercasetype/Fraunces@main/fonts/static/OTF/Fraunces_9pt-LightItalic.otf",
      fontWeight: 300,
      fontStyle: "italic",
    },
  ],
});

Font.registerHyphenationCallback((word) => [word]);

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
  overallScore: number;
  riskLevel: RiskLevel;
}

export interface ReportGap {
  category: Category;
  response: ResponseValue;
}

export interface AssessmentReportProps {
  assessment: ReportAssessment;
  organization: ReportOrganization | null;
  scores: ReportScores;
  gaps: ReportGap[];
  generatedAt: Date;
}

// ─── Palette ──────────────────────────────────────────────────────────────────

const p = {
  paper: "#f5f4ed",
  ink: "#0c0c0a",
  forest: "#0D1B2E",
  forestSoft: "#2A3A55",
  sand: "#c9bd9c",
  sandSoft: "#e4dcc2",
  warmMuted: "#6b6758",
  warmMutedSoft: "#9a9688",
  riskRed: "#a02020",
  amber: "#F5A623",
};

function toneForResponse(r: ResponseValue): string {
  switch (r) {
    case "effective":
      return "#059669";
    case "implemented":
      return p.forestSoft;
    case "partial":
      return "#D97706";
    case "not_compliant":
      return p.riskRed;
    case "na":
      return p.warmMuted;
  }
}

function toneForRisk(level: RiskLevel): string {
  switch (level) {
    case "low":
      return "#059669";
    case "moderate":
      return p.forestSoft;
    case "high":
      return "#D97706";
    case "critical":
      return p.riskRed;
  }
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  page: {
    paddingTop: 56,
    paddingBottom: 72,
    paddingHorizontal: 56,
    fontSize: 10,
    fontFamily: "Fraunces",
    fontWeight: 400,
    color: p.ink,
    backgroundColor: p.paper,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    paddingBottom: 12,
    marginBottom: 32,
    borderBottomWidth: 1,
    borderBottomColor: p.ink,
  },
  headerMark: { fontWeight: 500, fontSize: 14, color: p.ink },
  headerLabel: {
    fontSize: 8,
    color: p.warmMuted,
    textTransform: "uppercase",
    letterSpacing: 1.6,
  },
  footer: {
    position: "absolute",
    bottom: 32,
    left: 56,
    right: 56,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 0.5,
    borderTopColor: p.sand,
    paddingTop: 10,
  },
  footerText: { fontSize: 7, color: p.warmMuted, fontStyle: "italic" },
  eyebrow: {
    fontSize: 7.5,
    fontWeight: 500,
    color: p.warmMuted,
    textTransform: "uppercase",
    letterSpacing: 1.6,
  },
  h1: {
    fontWeight: 300,
    fontSize: 40,
    lineHeight: 0.96,
    letterSpacing: -0.9,
    color: p.ink,
    marginTop: 4,
  },
  body: { fontSize: 11, lineHeight: 1.7, color: p.ink },
  sectionIntro: { flexDirection: "row", marginBottom: 32 },
  sectionLeft: { flex: 4, paddingRight: 24 },
  sectionRight: { flex: 6 },
});

// ─── Chrome ──────────────────────────────────────────────────────────────────

const Header = () => (
  <View style={s.header} fixed>
    <Text style={s.headerMark}>
      Kestralis <Text style={{ color: p.warmMuted }}> · </Text> ReadyState
    </Text>
    <Text style={s.headerLabel}>SB 553 Assessment Report</Text>
  </View>
);

const Footer = () => (
  <View style={s.footer} fixed>
    <Text style={s.footerText}>
      A product of Kestralis Group, LLC · Powered by Asymmetric Marketing
    </Text>
    <Text
      style={s.footerText}
      render={({ pageNumber, totalPages }) =>
        `Folio ${String(pageNumber).padStart(2, "0")} / ${String(totalPages).padStart(2, "0")}`
      }
    />
  </View>
);

// ─── Pages ────────────────────────────────────────────────────────────────────

function CoverPage({
  organization,
  assessment,
  scores,
  generatedAt,
}: {
  organization: ReportOrganization | null;
  assessment: ReportAssessment;
  scores: ReportScores;
  generatedAt: Date;
}) {
  const riskMeta = getRiskLabel(scores.riskLevel);
  const riskTone = toneForRisk(scores.riskLevel);

  return (
    <Page size="LETTER" style={s.page}>
      <Header />
      <View style={{ flex: 1, paddingTop: 40, justifyContent: "space-between" }}>
        <View>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 56 }}>
            <Text style={s.eyebrow}>Assessment report</Text>
            <Text style={s.eyebrow}>Issued · {fmt(generatedAt)}</Text>
          </View>

          <Text style={{ fontWeight: 300, fontSize: 72, lineHeight: 0.98, letterSpacing: -1.8, color: p.ink }}>
            {organization?.name ?? "Unknown organization"}
            <Text style={{ color: p.warmMuted }}>.</Text>
          </Text>

          {(assessment.site_name || assessment.site_address) && (
            <Text style={{ marginTop: 24, fontWeight: 300, fontStyle: "italic", fontSize: 16, color: p.warmMuted, lineHeight: 1.4 }}>
              {[assessment.site_name, assessment.site_address].filter(Boolean).join(" · ")}
            </Text>
          )}

          <View style={{ marginTop: 60, paddingTop: 20, borderTopWidth: 1, borderTopColor: p.ink }}>
            <Text style={s.eyebrow}>Overall rating</Text>
            <Text style={{ marginTop: 8, fontWeight: 300, fontStyle: "italic", fontSize: 44, lineHeight: 1, color: riskTone }}>
              {riskMeta.label}<Text style={{ color: p.warmMuted }}>.</Text>
            </Text>
            <Text style={{ marginTop: 14, fontSize: 10, lineHeight: 1.6, color: p.ink, maxWidth: "75%" }}>
              {riskMeta.description}
            </Text>
          </View>
        </View>

        <View style={{ paddingTop: 16, borderTopWidth: 0.5, borderTopColor: p.sand }}>
          <Text style={s.eyebrow}>California SB 553 · Workplace Violence Prevention</Text>
        </View>
      </View>
      <Footer />
    </Page>
  );
}

function ScorecardPage({ scores }: { scores: ReportScores }) {
  const riskTone = toneForRisk(scores.riskLevel);
  const riskMeta = getRiskLabel(scores.riskLevel);
  return (
    <Page size="LETTER" style={s.page}>
      <Header />
      <View style={s.sectionIntro}>
        <View style={s.sectionLeft}>
          <Text style={s.eyebrow}>Overall score</Text>
          <Text style={s.h1}>
            The <Text style={{ fontStyle: "italic", color: p.forest }}>scorecard</Text>
            <Text style={{ color: p.warmMuted }}>.</Text>
          </Text>
        </View>
        <View style={s.sectionRight}>
          <Text style={s.body}>
            Your SB 553 prevention program scored{" "}
            {scores.overallScore} out of 100, placing it in the{" "}
            {riskMeta.label.toLowerCase()} band.
          </Text>
        </View>
      </View>

      <View style={{ marginTop: 24, paddingTop: 28, borderTopWidth: 1.5, borderTopColor: p.ink, flexDirection: "row" }}>
        <View style={{ flex: 6, paddingRight: 20 }}>
          <Text style={s.eyebrow}>Overall program rating</Text>
          <Text style={{ marginTop: 12, fontWeight: 300, fontSize: 160, lineHeight: 0.82, letterSpacing: -5, color: riskTone }}>
            {scores.overallScore}
          </Text>
        </View>
        <View style={{ flex: 5, paddingLeft: 12, paddingTop: 16 }}>
          <Text style={{ fontWeight: 300, fontStyle: "italic", fontSize: 32, lineHeight: 0.95, color: riskTone }}>
            {riskMeta.label}<Text style={{ color: p.warmMuted }}>.</Text>
          </Text>
          <Text style={{ marginTop: 14, fontSize: 10, lineHeight: 1.65, color: p.ink }}>
            {riskMeta.description}
          </Text>
        </View>
      </View>

      <Footer />
    </Page>
  );
}

function GapAnalysisPage({ gaps }: { gaps: ReportGap[] }) {
  return (
    <Page size="LETTER" style={s.page} wrap>
      <Header />
      <View style={s.sectionIntro}>
        <View style={s.sectionLeft}>
          <Text style={s.eyebrow}>Compliance gaps</Text>
          <Text style={s.h1}>
            Gap <Text style={{ fontStyle: "italic", color: p.forest }}>analysis</Text>
            <Text style={{ color: p.warmMuted }}>.</Text>
          </Text>
        </View>
        <View style={s.sectionRight}>
          <Text style={s.body}>
            {gaps.length === 0
              ? "No gaps identified. Every category rated Effective or N/A."
              : `${gaps.length} ${gaps.length === 1 ? "category" : "categories"} below full compliance, sorted by severity.`}
          </Text>
        </View>
      </View>

      {gaps.map((gap, idx) => {
        const opt = RESPONSE_OPTIONS.find((o) => o.value === gap.response);
        const tone = toneForResponse(gap.response);
        const priority = gap.category.weight === 3 ? "Critical" : gap.category.weight === 2 ? "Important" : "Informational";
        return (
          <View key={gap.category.id} wrap={false} style={{ flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: p.ink, paddingVertical: 16 }}>
            <Text style={{ width: "6%", fontWeight: 300, fontStyle: "italic", fontSize: 18, color: p.forest, lineHeight: 1 }}>
              {String(idx + 1).padStart(2, "0")}
            </Text>
            <View style={{ width: "50%", paddingRight: 12 }}>
              <Text style={{ fontSize: 14, fontWeight: 400, lineHeight: 1.25, color: p.ink }}>{gap.category.title}</Text>
              <Text style={{ marginTop: 4, fontSize: 8, fontStyle: "italic", color: p.warmMutedSoft }}>{gap.category.statuteRef}</Text>
            </View>
            <Text style={{ width: "22%", fontSize: 12, fontStyle: "italic", color: tone }}>{opt?.label ?? gap.response}</Text>
            <Text style={{ width: "22%", fontSize: 12, fontStyle: "italic", textAlign: "right", color: gap.category.weight === 3 ? p.riskRed : p.warmMuted }}>{priority}</Text>
          </View>
        );
      })}

      <Footer />
    </Page>
  );
}

function RecommendationsPage({ gaps }: { gaps: ReportGap[] }) {
  const criticalGaps = gaps.filter(
    (g) => g.category.weight === 3 && g.response === "not_compliant",
  );

  return (
    <Page size="LETTER" style={s.page} wrap>
      <Header />
      <View style={s.sectionIntro}>
        <View style={s.sectionLeft}>
          <Text style={s.eyebrow}>Remediation</Text>
          <Text style={s.h1}>
            Where to{" "}
            <Text style={{ fontStyle: "italic", color: p.riskRed }}>start</Text>
            <Text style={{ color: p.warmMuted }}>.</Text>
          </Text>
        </View>
        <View style={s.sectionRight}>
          <Text style={s.body}>
            {criticalGaps.length === 0
              ? "No critical categories are rated Non-Compliant. Review the Gap Analysis for areas to improve."
              : `${criticalGaps.length} critical ${criticalGaps.length === 1 ? "category" : "categories"} rated Non-Compliant. These carry direct citation risk.`}
          </Text>
        </View>
      </View>

      {gaps.filter((g) => g.response !== "na").map((gap, idx) => {
        const rec = recommendations[gap.category.id];
        if (!rec) return null;
        return (
          <View key={gap.category.id} wrap={false} style={{ flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: p.ink, paddingVertical: 20 }}>
            <Text style={{ width: "6%", fontWeight: 300, fontStyle: "italic", fontSize: 18, color: gap.category.weight === 3 ? p.riskRed : p.forest, lineHeight: 1 }}>
              {String(idx + 1).padStart(2, "0")}
            </Text>
            <View style={{ width: "40%", paddingRight: 12 }}>
              <Text style={{ fontSize: 7.5, fontWeight: 500, color: gap.category.weight === 3 ? p.riskRed : p.warmMuted, textTransform: "uppercase", letterSpacing: 1.4, marginBottom: 6 }}>
                {gap.category.weight === 3 ? "Critical" : "Important"} · {gap.category.id}
              </Text>
              <Text style={{ fontSize: 12, fontWeight: 400, lineHeight: 1.25, color: p.ink }}>{gap.category.title}</Text>
            </View>
            <View style={{ width: "54%" }}>
              <Text style={{ fontSize: 7.5, fontWeight: 500, color: p.warmMuted, textTransform: "uppercase", letterSpacing: 1.6, marginBottom: 6 }}>Remediation</Text>
              <Text style={{ fontSize: 10, lineHeight: 1.65, color: p.ink, borderLeftWidth: 1, borderLeftColor: p.forest, paddingLeft: 10 }}>
                {rec}
              </Text>
            </View>
          </View>
        );
      })}

      <Footer />
    </Page>
  );
}

// ─── Document ─────────────────────────────────────────────────────────────────

export function AssessmentReport({
  assessment,
  organization,
  scores,
  gaps,
  generatedAt,
}: AssessmentReportProps) {
  return (
    <Document
      title={`ReadyState SB 553 Assessment — ${organization?.name ?? "Report"}`}
      author="Kestralis Group, LLC"
      subject="SB 553 Workplace Violence Prevention Assessment"
      creator="ReadyState by Kestralis"
      producer="ReadyState · @react-pdf/renderer"
    >
      <CoverPage
        assessment={assessment}
        organization={organization}
        scores={scores}
        generatedAt={generatedAt}
      />
      <ScorecardPage scores={scores} />
      <GapAnalysisPage gaps={gaps} />
      <RecommendationsPage gaps={gaps} />
    </Document>
  );
}

function fmt(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
