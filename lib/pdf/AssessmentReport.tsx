/**
 * Kestralis — ReadyState Assessment Report PDF
 *
 * Server-rendered editorial report via @react-pdf/renderer. Matches the
 * live web surfaces: warm cream paper, deep forest accent, Fraunces
 * display serif paired with Geist Sans body, rule-line layouts,
 * oversized typographic scores.
 *
 * Four pages:
 *   1. Cover        — masthead, org name as masthead title, risk label
 *   2. Scorecard    — editorial score entries + massive overall numeral
 *   3. Gap analysis — rule-lined editorial table
 *   4. Remediation  — numbered cards with forest left rule
 *
 * Fixed footer on every page: Kestralis colophon + folio pagination.
 *
 * Fonts are registered at module load from jsDelivr CDN mirrors of the
 * official Google Fonts / Vercel font repos. Network is required at
 * first render; subsequent renders use react-pdf's in-memory cache.
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
import type { Question } from "@/lib/assessment/questions";
import {
  getRiskLabel,
  type RiskLevel,
} from "@/lib/assessment/scoring";
import { recommendations } from "@/lib/assessment/recommendations";

// ─── Font registration ──────────────────────────────────────────────────────

// Fraunces — display serif. Variable font but react-pdf needs static files,
// so we pull specific weights. Italic is the star here.
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

// Suppress Fraunces word-break warnings for long italic headlines
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

// ─── Palette — hex literals mirroring the web tokens ─────────────────────

const palette = {
  paper: "#f5f4ed",
  paperDeep: "#eeece2",
  ink: "#0c0c0a",
  inkSoft: "#1a1915",
  // "forest" kept as the key name for parity with the web tokens, but
  // these are the ReadyState brand navy values.
  forest: "#0D1B2E",
  forestDeep: "#081221",
  forestSoft: "#2A3A55",
  sand: "#c9bd9c",
  sandSoft: "#e4dcc2",
  sandDeep: "#a89a6e",
  // Brand amber accent — used sparingly.
  amber: "#F5A623",
  amberSoft: "#FFE0A8",
  amberDeep: "#C88418",
  warmMuted: "#6b6758",
  warmMutedSoft: "#9a9688",
  riskRed: "#a02020",
  riskRedSoft: "#f4e7e7",
};

function toneForRisk(level: RiskLevel): string {
  switch (level) {
    case "low":
      return palette.forest;
    case "moderate":
      return palette.forestSoft;
    case "high":
      return palette.sandDeep;
    case "critical":
      return palette.riskRed;
  }
}

function scoreToRiskLevel(score: number): RiskLevel {
  if (score >= 85) return "low";
  if (score >= 70) return "moderate";
  if (score >= 50) return "high";
  return "critical";
}

const SECTION_ROMANS: Record<"sb553" | "asis" | "hazard", string> = {
  sb553: "I",
  asis: "II",
  hazard: "III",
};

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  page: {
    paddingTop: 56,
    paddingBottom: 72,
    paddingHorizontal: 56,
    fontSize: 10,
    fontFamily: "Fraunces",
    fontWeight: 400,
    color: palette.ink,
    backgroundColor: palette.paper,
  },

  // ─── Running chrome ─────────────────────────────────────────────────
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    paddingBottom: 12,
    marginBottom: 32,
    borderBottomWidth: 1,
    borderBottomColor: palette.ink,
  },
  headerMark: {
    fontFamily: "Fraunces",
    fontWeight: 500,
    fontSize: 14,
    color: palette.ink,
    letterSpacing: 0.2,
  },
  headerLabel: {
    fontFamily: "Fraunces",
    fontWeight: 400,
    fontSize: 8,
    color: palette.warmMuted,
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
    alignItems: "center",
    borderTopWidth: 0.5,
    borderTopColor: palette.sand,
    paddingTop: 10,
  },
  footerText: {
    fontFamily: "Fraunces",
    fontSize: 7,
    color: palette.warmMuted,
    fontStyle: "italic",
  },

  // ─── Eyebrow (small caps letter-spaced label) ────────────────────────
  eyebrow: {
    fontFamily: "Fraunces",
    fontSize: 7.5,
    fontWeight: 500,
    color: palette.warmMuted,
    textTransform: "uppercase",
    letterSpacing: 1.6,
  },

  // ─── Cover page ──────────────────────────────────────────────────────
  coverWrap: {
    flex: 1,
    paddingTop: 40,
    justifyContent: "space-between",
  },
  coverMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 56,
  },
  coverTitle: {
    fontFamily: "Fraunces",
    fontWeight: 300,
    fontSize: 72,
    lineHeight: 0.98,
    letterSpacing: -1.8,
    color: palette.ink,
  },
  coverItalic: {
    fontFamily: "Fraunces",
    fontWeight: 300,
    fontStyle: "italic",
    color: palette.forest,
  },
  coverPunctuation: {
    color: palette.warmMuted,
  },
  coverSiteLine: {
    marginTop: 24,
    fontFamily: "Fraunces",
    fontWeight: 300,
    fontStyle: "italic",
    fontSize: 16,
    color: palette.warmMuted,
    lineHeight: 1.4,
  },
  coverRiskBlock: {
    marginTop: 60,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: palette.ink,
  },
  coverRiskLabel: {
    fontFamily: "Fraunces",
    fontWeight: 300,
    fontStyle: "italic",
    fontSize: 44,
    lineHeight: 1,
    letterSpacing: -0.6,
  },
  coverRiskDescription: {
    marginTop: 14,
    fontFamily: "Fraunces",
    fontSize: 10,
    lineHeight: 1.6,
    color: palette.ink,
    maxWidth: "75%",
  },
  coverColophon: {
    marginTop: 48,
    paddingTop: 16,
    borderTopWidth: 0.5,
    borderTopColor: palette.sand,
  },
  coverColophonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  coverColophonValue: {
    fontFamily: "Fraunces",
    fontSize: 10,
    color: palette.ink,
  },

  // ─── Section heads ──────────────────────────────────────────────────
  sectionIntro: {
    flexDirection: "row",
    marginBottom: 32,
  },
  sectionIntroLeft: {
    flex: 4,
    paddingRight: 24,
  },
  sectionIntroRight: {
    flex: 6,
  },
  sectionH1: {
    fontFamily: "Fraunces",
    fontWeight: 300,
    fontSize: 40,
    lineHeight: 0.96,
    letterSpacing: -0.9,
    color: palette.ink,
    marginTop: 4,
  },
  sectionBody: {
    fontFamily: "Fraunces",
    fontSize: 11,
    lineHeight: 1.7,
    color: palette.ink,
  },

  // ─── Scorecard entries ──────────────────────────────────────────────
  scoreEntry: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: palette.ink,
    paddingVertical: 24,
  },
  scoreEntryRoman: {
    width: "8%",
    fontFamily: "Fraunces",
    fontWeight: 300,
    fontStyle: "italic",
    fontSize: 24,
    color: palette.forest,
    lineHeight: 1,
  },
  scoreEntryMeta: {
    width: "44%",
    paddingRight: 16,
  },
  scoreEntryLabel: {
    fontFamily: "Fraunces",
    fontWeight: 400,
    fontSize: 22,
    lineHeight: 1.05,
    letterSpacing: -0.3,
    color: palette.ink,
    marginTop: 2,
  },
  scoreEntryWeight: {
    marginTop: 6,
    fontFamily: "Fraunces",
    fontSize: 8,
    color: palette.warmMuted,
    letterSpacing: 0.5,
  },
  scoreEntryValueWrap: {
    width: "48%",
  },
  scoreEntryValueLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    borderBottomWidth: 0.5,
    borderBottomColor: palette.sand,
    paddingBottom: 4,
  },
  scoreEntryValue: {
    fontFamily: "Fraunces",
    fontWeight: 300,
    fontSize: 48,
    lineHeight: 0.9,
    letterSpacing: -1.5,
  },
  scoreEntryPct: {
    color: palette.warmMuted,
  },
  scoreEntryRisk: {
    marginTop: 8,
    fontFamily: "Fraunces",
    fontStyle: "italic",
    fontSize: 11,
  },

  // ─── Overall score ───────────────────────────────────────────────────
  overallWrap: {
    marginTop: 40,
    paddingTop: 28,
    borderTopWidth: 1.2,
    borderTopColor: palette.ink,
    flexDirection: "row",
  },
  overallNumberColumn: {
    flex: 6,
    paddingRight: 20,
  },
  overallEyebrow: {
    marginBottom: 12,
  },
  overallNumber: {
    fontFamily: "Fraunces",
    fontWeight: 300,
    fontSize: 160,
    lineHeight: 0.82,
    letterSpacing: -5,
  },
  overallRight: {
    flex: 5,
    paddingLeft: 12,
    paddingTop: 16,
  },
  overallLabel: {
    fontFamily: "Fraunces",
    fontWeight: 300,
    fontStyle: "italic",
    fontSize: 32,
    lineHeight: 0.95,
    letterSpacing: -0.4,
  },
  overallDescription: {
    marginTop: 14,
    fontFamily: "Fraunces",
    fontSize: 10,
    lineHeight: 1.65,
    color: palette.ink,
  },

  // ─── Table ───────────────────────────────────────────────────────────
  tableHeader: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderBottomWidth: 0.5,
    borderColor: palette.ink,
    paddingVertical: 7,
  },
  th: {
    fontFamily: "Fraunces",
    fontStyle: "italic",
    fontSize: 9,
    color: palette.forest,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: palette.ink,
    paddingVertical: 10,
  },
  tdRoman: {
    width: "6%",
    fontFamily: "Courier",
    fontSize: 7,
    color: palette.warmMuted,
    paddingTop: 3,
  },
  tdId: {
    width: "10%",
    fontFamily: "Courier",
    fontSize: 7,
    color: palette.warmMutedSoft,
    paddingTop: 3,
  },
  tdFinding: {
    width: "56%",
    paddingRight: 12,
  },
  tdFindingText: {
    fontFamily: "Fraunces",
    fontWeight: 300,
    fontSize: 11,
    lineHeight: 1.35,
    color: palette.ink,
  },
  tdFindingCategory: {
    marginTop: 3,
    fontFamily: "Fraunces",
    fontStyle: "italic",
    fontSize: 8,
    color: palette.warmMutedSoft,
  },
  tdResponse: {
    width: "14%",
    paddingTop: 3,
    fontFamily: "Fraunces",
    fontStyle: "italic",
    fontSize: 10,
  },
  tdPriority: {
    width: "14%",
    paddingTop: 3,
    fontFamily: "Fraunces",
    fontStyle: "italic",
    fontSize: 10,
    textAlign: "right",
  },

  // ─── Recommendation entries ──────────────────────────────────────────
  recEntry: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: palette.ink,
    paddingVertical: 22,
  },
  recNumber: {
    width: "8%",
    fontFamily: "Fraunces",
    fontWeight: 300,
    fontStyle: "italic",
    fontSize: 24,
    color: palette.riskRed,
    lineHeight: 1,
  },
  recTitleColumn: {
    width: "42%",
    paddingRight: 16,
  },
  recEyebrow: {
    fontFamily: "Fraunces",
    fontSize: 7.5,
    fontWeight: 500,
    color: palette.riskRed,
    textTransform: "uppercase",
    letterSpacing: 1.4,
    marginBottom: 6,
  },
  recTitle: {
    fontFamily: "Fraunces",
    fontWeight: 400,
    fontSize: 14,
    lineHeight: 1.25,
    color: palette.ink,
  },
  recBodyColumn: {
    width: "50%",
  },
  recBodyLabel: {
    fontFamily: "Fraunces",
    fontSize: 7.5,
    fontWeight: 500,
    color: palette.warmMuted,
    textTransform: "uppercase",
    letterSpacing: 1.6,
    marginBottom: 6,
  },
  recBody: {
    fontFamily: "Fraunces",
    fontSize: 10,
    lineHeight: 1.65,
    color: palette.ink,
    borderLeftWidth: 1,
    borderLeftColor: palette.forest,
    paddingLeft: 10,
  },
  recEmpty: {
    fontFamily: "Fraunces",
    fontSize: 11,
    fontStyle: "italic",
    color: palette.forestSoft,
    marginTop: 24,
  },
});

// ─── Running chrome ──────────────────────────────────────────────────────────

const RunningHeader = () => (
  <View style={styles.header} fixed>
    <Text style={styles.headerMark}>
      Kestralis
      <Text style={{ color: palette.warmMuted }}> · </Text>
      ReadyState
    </Text>
    <Text style={styles.headerLabel}>Assessment report</Text>
  </View>
);

const RunningFooter = () => (
  <View style={styles.footer} fixed>
    <Text style={styles.footerText}>
      A product of Kestralis Group, LLC · Powered by Asymmetric Marketing
    </Text>
    <Text
      style={styles.footerText}
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
  const orgName = organization?.name ?? "Unknown organization";

  return (
    <Page size="LETTER" style={styles.page}>
      <RunningHeader />

      <View style={styles.coverWrap}>
        <View>
          <View style={styles.coverMeta}>
            <Text style={styles.eyebrow}>Assessment report</Text>
            <Text style={styles.eyebrow}>
              Issued · {formatDate(generatedAt)}
            </Text>
          </View>

          <Text style={styles.coverTitle}>
            {orgName}
            <Text style={styles.coverPunctuation}>.</Text>
          </Text>

          {(assessment.site_name || assessment.site_address) && (
            <Text style={styles.coverSiteLine}>
              {[assessment.site_name, assessment.site_address]
                .filter(Boolean)
                .join(" · ")}
            </Text>
          )}

          {/* Risk band */}
          <View style={styles.coverRiskBlock}>
            <Text style={styles.eyebrow}>Overall rating</Text>
            <Text
              style={[styles.coverRiskLabel, { color: riskTone, marginTop: 8 }]}
            >
              {riskMeta.label}
              <Text style={styles.coverPunctuation}>.</Text>
            </Text>
            <Text style={styles.coverRiskDescription}>
              {riskMeta.description}
            </Text>
          </View>
        </View>

        {/* Colophon */}
        <View style={styles.coverColophon}>
          <Text style={styles.eyebrow}>Colophon</Text>
          <View style={styles.coverColophonRow}>
            <Text style={styles.coverColophonValue}>
              California Labor Code §6401.9
            </Text>
            <Text style={styles.coverColophonValue}>ASIS WVPI AA-2020</Text>
          </View>
          <View style={[styles.coverColophonRow, { marginTop: 2 }]}>
            <Text
              style={[
                styles.coverColophonValue,
                { fontStyle: "italic", color: palette.warmMuted, fontSize: 9 },
              ]}
            >
              The three standards
            </Text>
            <Text
              style={[
                styles.coverColophonValue,
                { fontStyle: "italic", color: palette.warmMuted, fontSize: 9 },
              ]}
            >
              Site Hazard Profile
            </Text>
          </View>
        </View>
      </View>

      <RunningFooter />
    </Page>
  );
}

function ScorecardPage({
  scores,
}: {
  scores: ReportScores;
}) {
  const overallTone = toneForRisk(scores.riskLevel);
  const riskMeta = getRiskLabel(scores.riskLevel);

  return (
    <Page size="LETTER" style={styles.page}>
      <RunningHeader />

      <View style={styles.sectionIntro}>
        <View style={styles.sectionIntroLeft}>
          <Text style={styles.eyebrow}>Section I</Text>
          <Text style={styles.sectionH1}>
            The <Text style={styles.coverItalic}>scorecard</Text>
            <Text style={styles.coverPunctuation}>.</Text>
          </Text>
        </View>
        <View style={styles.sectionIntroRight}>
          <Text style={styles.sectionBody}>
            Three weighted sections combined into one overall rating.
            SB 553 is weighted at 50%, ASIS at 30%, and the site hazard
            profile at 20% of the final score.
          </Text>
        </View>
      </View>

      {/* Section score entries */}
      <ScoreEntry
        section="sb553"
        label="SB 553 Compliance"
        sub="Statutory"
        score={scores.sb553Score}
        weight={50}
      />
      <ScoreEntry
        section="asis"
        label="ASIS WVPI AA-2020"
        sub="Professional standard"
        score={scores.asisScore}
        weight={30}
      />
      <ScoreEntry
        section="hazard"
        label="Site Hazard Profile"
        sub="Site profile"
        score={scores.hazardScore}
        weight={20}
      />

      {/* Overall — massive display numeral */}
      <View style={styles.overallWrap}>
        <View style={styles.overallNumberColumn}>
          <Text style={[styles.eyebrow, styles.overallEyebrow]}>
            Overall program rating
          </Text>
          <Text style={[styles.overallNumber, { color: overallTone }]}>
            {scores.overallScore}
          </Text>
        </View>
        <View style={styles.overallRight}>
          <Text style={[styles.overallLabel, { color: overallTone }]}>
            {riskMeta.label}
            <Text style={styles.coverPunctuation}>.</Text>
          </Text>
          <Text style={styles.overallDescription}>{riskMeta.description}</Text>
        </View>
      </View>

      <RunningFooter />
    </Page>
  );
}

function ScoreEntry({
  section,
  label,
  sub,
  score,
  weight,
}: {
  section: "sb553" | "asis" | "hazard";
  label: string;
  sub: string;
  score: number;
  weight: number;
}) {
  const level = scoreToRiskLevel(score);
  const tone = toneForRisk(level);
  const riskLabel = getRiskLabel(level).label;

  return (
    <View style={styles.scoreEntry} wrap={false}>
      <Text style={styles.scoreEntryRoman}>{SECTION_ROMANS[section]}</Text>
      <View style={styles.scoreEntryMeta}>
        <Text style={styles.eyebrow}>{sub}</Text>
        <Text style={styles.scoreEntryLabel}>{label}</Text>
        <Text style={styles.scoreEntryWeight}>
          Weighted {weight}% of overall score
        </Text>
      </View>
      <View style={styles.scoreEntryValueWrap}>
        <View style={styles.scoreEntryValueLine}>
          <Text style={styles.eyebrow}>Score</Text>
          <Text style={[styles.scoreEntryValue, { color: tone }]}>
            {score}
            <Text style={styles.scoreEntryPct}>%</Text>
          </Text>
        </View>
        <Text style={[styles.scoreEntryRisk, { color: tone }]}>
          {riskLabel}
        </Text>
      </View>
    </View>
  );
}

function GapAnalysisPage({ gaps }: { gaps: ReportGap[] }) {
  return (
    <Page size="LETTER" style={styles.page} wrap>
      <RunningHeader />

      <View style={styles.sectionIntro}>
        <View style={styles.sectionIntroLeft}>
          <Text style={styles.eyebrow}>Section II</Text>
          <Text style={styles.sectionH1}>
            The <Text style={styles.coverItalic}>gap</Text> analysis
            <Text style={styles.coverPunctuation}>.</Text>
          </Text>
        </View>
        <View style={styles.sectionIntroRight}>
          <Text style={styles.sectionBody}>
            {gaps.length === 0
              ? "No gaps identified. Every question answered yes or n/a — review for honesty before relying on this posture."
              : `${gaps.length} finding${gaps.length === 1 ? "" : "s"} requiring attention. Sorted by weight, then by response severity.`}
          </Text>
        </View>
      </View>

      {gaps.length > 0 && (
        <>
          <View style={styles.tableHeader} fixed>
            <Text style={[styles.th, { width: "6%" }]}>§</Text>
            <Text style={[styles.th, { width: "10%" }]}>Item</Text>
            <Text style={[styles.th, { width: "56%" }]}>Finding</Text>
            <Text style={[styles.th, { width: "14%" }]}>Response</Text>
            <Text style={[styles.th, { width: "14%", textAlign: "right" }]}>
              Priority
            </Text>
          </View>

          {gaps.map((gap) => (
            <GapRow key={gap.question.id} gap={gap} />
          ))}
        </>
      )}

      <RunningFooter />
    </Page>
  );
}

function GapRow({ gap }: { gap: ReportGap }) {
  const q = gap.question;
  const priorityLabel =
    q.weight === 3 ? "Critical" : q.weight === 2 ? "High" : "Medium";
  const priorityTone =
    q.weight === 3
      ? palette.riskRed
      : q.weight === 2
        ? palette.warmMuted
        : palette.warmMutedSoft;
  const responseTone =
    gap.response === "no" ? palette.riskRed : palette.warmMuted;

  return (
    <View style={styles.tableRow} wrap={false}>
      <Text style={styles.tdRoman}>{SECTION_ROMANS[q.section]}</Text>
      <Text style={styles.tdId}>{q.id}</Text>
      <View style={styles.tdFinding}>
        <Text style={styles.tdFindingText}>{q.question}</Text>
        <Text style={styles.tdFindingCategory}>{q.category}</Text>
      </View>
      <Text style={[styles.tdResponse, { color: responseTone }]}>
        {gap.response === "no" ? "No" : "Partial"}
      </Text>
      <Text style={[styles.tdPriority, { color: priorityTone }]}>
        {priorityLabel}
      </Text>
    </View>
  );
}

function RecommendationsPage({ gaps }: { gaps: ReportGap[] }) {
  const criticalFailures = gaps.filter(
    (g) => g.question.weight === 3 && g.response === "no",
  );

  return (
    <Page size="LETTER" style={styles.page} wrap>
      <RunningHeader />

      <View style={styles.sectionIntro}>
        <View style={styles.sectionIntroLeft}>
          <Text style={styles.eyebrow}>Section III</Text>
          <Text style={styles.sectionH1}>
            Where to{" "}
            <Text style={[styles.coverItalic, { color: palette.riskRed }]}>
              start
            </Text>
            <Text style={styles.coverPunctuation}>.</Text>
          </Text>
        </View>
        <View style={styles.sectionIntroRight}>
          <Text style={styles.sectionBody}>
            {criticalFailures.length === 0
              ? "No critical failures. Review the Gap Analysis for lower-priority items that still deserve attention."
              : `${criticalFailures.length} critical finding${criticalFailures.length === 1 ? "" : "s"} with concrete remediation guidance. Each carries direct statutory or high-consequence risk exposure.`}
          </Text>
        </View>
      </View>

      {criticalFailures.length === 0 ? (
        <Text style={styles.recEmpty}>
          No critical (weight 3) findings require immediate remediation.
        </Text>
      ) : (
        criticalFailures.map((gap, idx) => (
          <RecommendationEntry
            key={gap.question.id}
            gap={gap}
            number={idx + 1}
          />
        ))
      )}

      <RunningFooter />
    </Page>
  );
}

function RecommendationEntry({
  gap,
  number,
}: {
  gap: ReportGap;
  number: number;
}) {
  const rec = recommendations[gap.question.id];
  return (
    <View style={styles.recEntry} wrap={false}>
      <Text style={styles.recNumber}>
        {String(number).padStart(2, "0")}
      </Text>
      <View style={styles.recTitleColumn}>
        <Text style={styles.recEyebrow}>Critical · {gap.question.id}</Text>
        <Text style={styles.recTitle}>{gap.question.question}</Text>
      </View>
      <View style={styles.recBodyColumn}>
        <Text style={styles.recBodyLabel}>Remediation</Text>
        <Text style={styles.recBody}>
          {rec ?? "Remediation guidance is being prepared for this item."}
        </Text>
      </View>
    </View>
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
      title={`ReadyState Assessment — ${organization?.name ?? "Report"}`}
      author="Kestralis Group, LLC"
      subject="Workplace Violence Prevention Assessment"
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
