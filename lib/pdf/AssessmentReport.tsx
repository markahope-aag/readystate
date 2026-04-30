/**
 * Kestralis — ReadyState Assessment Report PDF (v3)
 *
 * Four thematic sections (Plan / People / Process / Proof). Each gap is a
 * specific question rated below Yes; remediation is a per-question or
 * per-section recommendation.
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
import type {
  Question,
  ResponseValue,
  Section,
} from "@/lib/assessment/questions";
import {
  recommendations,
  sectionRecommendations,
} from "@/lib/assessment/recommendations";
import {
  getRiskLabel,
  type RiskLevel,
  type SectionScore,
} from "@/lib/assessment/scoring";

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
  question: Question;
  section: Section;
  response: ResponseValue;
}

export interface AssessmentReportProps {
  assessment: ReportAssessment;
  organization: ReportOrganization | null;
  scores: ReportScores;
  sectionScores: SectionScore[];
  sectionNotes: Record<string, string>;
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
    case "yes":
      return "#059669";
    case "partial":
      return "#D97706";
    case "no":
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

function toneForScore(score: number): string {
  if (score >= 80) return "#059669";
  if (score >= 60) return p.forestSoft;
  if (score >= 40) return "#D97706";
  return p.riskRed;
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

function ScorecardPage({
  scores,
  sectionScores,
  sectionNotes,
}: {
  scores: ReportScores;
  sectionScores: SectionScore[];
  sectionNotes: Record<string, string>;
}) {
  const riskTone = toneForRisk(scores.riskLevel);
  const riskMeta = getRiskLabel(scores.riskLevel);
  return (
    <Page size="LETTER" style={s.page} wrap>
      <Header />
      <View style={s.sectionIntro}>
        <View style={s.sectionLeft}>
          <Text style={s.eyebrow}>Section scorecard</Text>
          <Text style={s.h1}>
            The <Text style={{ fontStyle: "italic", color: p.forest }}>scorecard</Text>
            <Text style={{ color: p.warmMuted }}>.</Text>
          </Text>
        </View>
        <View style={s.sectionRight}>
          <Text style={s.body}>
            Your SB 553 prevention program scored {scores.overallScore} out of 100,
            placing it in the {riskMeta.label.toLowerCase()} band. Section
            scores show where to focus first.
          </Text>
        </View>
      </View>

      {/* Per-section rows */}
      {sectionScores.map((ss, idx) => {
        const note = sectionNotes[ss.sectionId];
        return (
          <View
            key={ss.sectionId}
            wrap={false}
            style={{
              flexDirection: "row",
              borderTopWidth: 0.5,
              borderTopColor: p.ink,
              paddingVertical: 18,
            }}
          >
            <Text
              style={{
                width: "6%",
                fontWeight: 300,
                fontStyle: "italic",
                fontSize: 18,
                color: p.forest,
                lineHeight: 1,
              }}
            >
              {String(idx + 1).padStart(2, "0")}
            </Text>
            <View style={{ width: "60%", paddingRight: 16 }}>
              <Text style={{ fontSize: 16, fontWeight: 400, lineHeight: 1.2, color: p.ink }}>
                {ss.title}
              </Text>
              <Text style={{ marginTop: 4, fontSize: 8, fontStyle: "italic", color: p.warmMutedSoft }}>
                {ss.answeredCount} of {ss.totalQuestions} answered
              </Text>
              {note && (
                <Text
                  style={{
                    marginTop: 8,
                    paddingLeft: 8,
                    borderLeftWidth: 1,
                    borderLeftColor: p.sand,
                    fontSize: 9,
                    fontStyle: "italic",
                    color: p.warmMuted,
                    lineHeight: 1.5,
                  }}
                >
                  {note}
                </Text>
              )}
            </View>
            <View style={{ width: "34%", alignItems: "flex-end" }}>
              {ss.score === null ? (
                <Text style={{ fontSize: 24, fontStyle: "italic", color: p.warmMutedSoft }}>—</Text>
              ) : (
                <Text
                  style={{
                    fontWeight: 300,
                    fontSize: 48,
                    lineHeight: 1,
                    color: toneForScore(ss.score),
                  }}
                >
                  {ss.score}
                </Text>
              )}
            </View>
          </View>
        );
      })}

      {/* Overall score block */}
      <View style={{ marginTop: 28, paddingTop: 24, borderTopWidth: 1.5, borderTopColor: p.ink, flexDirection: "row" }}>
        <View style={{ flex: 6, paddingRight: 20 }}>
          <Text style={s.eyebrow}>Overall program rating</Text>
          <Text style={{ marginTop: 12, fontWeight: 300, fontSize: 140, lineHeight: 0.82, letterSpacing: -5, color: riskTone }}>
            {scores.overallScore}
          </Text>
        </View>
        <View style={{ flex: 5, paddingLeft: 12, paddingTop: 16 }}>
          <Text style={{ fontWeight: 300, fontStyle: "italic", fontSize: 28, lineHeight: 0.95, color: riskTone }}>
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
              ? "No gaps identified. Every question rated Yes or N/A."
              : `${gaps.length} ${gaps.length === 1 ? "question" : "questions"} below Yes, sorted by severity.`}
          </Text>
        </View>
      </View>

      {gaps.map((gap, idx) => {
        const tone = toneForResponse(gap.response);
        const priority = gap.question.weight === 3 ? "Critical" : gap.question.weight === 2 ? "Important" : "Informational";
        const responseLabel =
          gap.response === "yes"
            ? "Yes"
            : gap.response === "no"
              ? "No"
              : gap.response === "partial"
                ? "Partial"
                : "N/A";
        return (
          <View
            key={gap.question.id}
            wrap={false}
            style={{ flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: p.ink, paddingVertical: 14 }}
          >
            <Text style={{ width: "6%", fontWeight: 300, fontStyle: "italic", fontSize: 16, color: p.forest, lineHeight: 1 }}>
              {String(idx + 1).padStart(2, "0")}
            </Text>
            <View style={{ width: "62%", paddingRight: 12 }}>
              <Text style={{ fontSize: 7.5, fontWeight: 500, color: gap.question.weight === 3 ? p.riskRed : p.warmMuted, textTransform: "uppercase", letterSpacing: 1.4, marginBottom: 4 }}>
                {gap.section.title} · {priority}
              </Text>
              <Text style={{ fontSize: 11, fontWeight: 400, lineHeight: 1.3, color: p.ink }}>
                {gap.question.prompt}
              </Text>
              {gap.question.statuteRef && (
                <Text style={{ marginTop: 4, fontSize: 7.5, fontStyle: "italic", color: p.warmMutedSoft }}>
                  {gap.question.statuteRef}
                </Text>
              )}
            </View>
            <View style={{ width: "32%", alignItems: "flex-end" }}>
              <Text style={{ fontSize: 12, fontStyle: "italic", color: tone }}>{responseLabel}</Text>
            </View>
          </View>
        );
      })}

      <Footer />
    </Page>
  );
}

function RecommendationsPage({ gaps }: { gaps: ReportGap[] }) {
  const critical = gaps.filter((g) => g.question.weight === 3 && g.response === "no");
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
            {critical.length === 0
              ? "No critical questions are rated No. Review the gap analysis for areas to improve."
              : `${critical.length} critical ${critical.length === 1 ? "question is" : "questions are"} rated No. These carry direct citation risk.`}
          </Text>
        </View>
      </View>

      {gaps.map((gap, idx) => {
        const rec =
          recommendations[gap.question.id] ??
          sectionRecommendations[gap.section.id];
        if (!rec) return null;
        return (
          <View
            key={gap.question.id}
            wrap={false}
            style={{ flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: p.ink, paddingVertical: 18 }}
          >
            <Text style={{ width: "6%", fontWeight: 300, fontStyle: "italic", fontSize: 16, color: gap.question.weight === 3 ? p.riskRed : p.forest, lineHeight: 1 }}>
              {String(idx + 1).padStart(2, "0")}
            </Text>
            <View style={{ width: "40%", paddingRight: 12 }}>
              <Text style={{ fontSize: 7.5, fontWeight: 500, color: gap.question.weight === 3 ? p.riskRed : p.warmMuted, textTransform: "uppercase", letterSpacing: 1.4, marginBottom: 6 }}>
                {gap.section.title} · {gap.question.weight === 3 ? "Critical" : "Important"}
              </Text>
              <Text style={{ fontSize: 11, fontWeight: 400, lineHeight: 1.3, color: p.ink }}>
                {gap.question.prompt}
              </Text>
            </View>
            <View style={{ width: "54%" }}>
              <Text style={{ fontSize: 7.5, fontWeight: 500, color: p.warmMuted, textTransform: "uppercase", letterSpacing: 1.6, marginBottom: 6 }}>Remediation</Text>
              <Text style={{ fontSize: 9.5, lineHeight: 1.6, color: p.ink, borderLeftWidth: 1, borderLeftColor: p.forest, paddingLeft: 10 }}>
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
  sectionScores,
  sectionNotes,
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
      <ScorecardPage
        scores={scores}
        sectionScores={sectionScores}
        sectionNotes={sectionNotes}
      />
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
