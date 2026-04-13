-- ReadyState v2: Update response CHECK constraint for compliance selectors
--
-- The v1 model used yes/no/partial/na per question. The v2 model uses
-- compliance-level selectors per statutory category:
--   effective, implemented, partial, not_compliant, na
--
-- "partial" and "na" carry over from v1. "yes" → "effective",
-- "no" → "not_compliant" conceptually, but existing v1 data (if any)
-- will remain as-is since old assessments aren't re-scored.

alter table public.assessment_responses
  drop constraint if exists assessment_responses_response_check;

alter table public.assessment_responses
  add constraint assessment_responses_response_check
  check (response in ('effective', 'implemented', 'partial', 'not_compliant', 'na',
                       'yes', 'no'));
-- Keeping 'yes' and 'no' in the constraint for backwards compatibility
-- with any existing v1 assessment data. New assessments only write the
-- v2 values (effective/implemented/partial/not_compliant/na).
