-- Atomic slot assignment under concurrent student submits.
CREATE OR REPLACE FUNCTION public.claim_next_submission_slot(p_event_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  next_slot integer;
BEGIN
  -- Serialize claims per event (two-key advisory lock)
  PERFORM pg_advisory_xact_lock(87263411, hashtext(p_event_id::text));

  SELECT COALESCE(MAX(slot_index), -1) + 1
  INTO next_slot
  FROM public.submissions
  WHERE event_id = p_event_id;

  RETURN next_slot;
END;
$$;

REVOKE ALL ON FUNCTION public.claim_next_submission_slot(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.claim_next_submission_slot(uuid) TO service_role;
