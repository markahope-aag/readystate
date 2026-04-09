-- ReadyState: Response uniqueness for idempotent auto-save
--
-- The wizard saves each response the moment a user clicks a pill button.
-- For the save to be idempotent (user can re-click the same answer, or
-- change their answer, without creating a second row), we need a unique
-- constraint on (assessment_id, question_id) so the client can upsert
-- via ON CONFLICT.
--
-- Also tightens `response` to NOT NULL — the wizard UX is response-first
-- (notes textarea is only revealed after a response is selected), so
-- there is no legitimate path to a notes-only row.

alter table public.assessment_responses
  alter column response set not null;

alter table public.assessment_responses
  add constraint assessment_responses_assessment_question_unique
  unique (assessment_id, question_id);
