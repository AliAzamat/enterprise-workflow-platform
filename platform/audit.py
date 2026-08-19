import json
import time
from db_async import execute   # thin async DB helper

# The AUDIT LOG: an append-only record of WHO did WHAT, WHEN. In an enterprise
# platform this is non-negotiable — every privileged action (an approval, an
# integration change) must be attributable for compliance and incident review.
async def audit(actor_id: str, action: str, target: str, detail: dict) -> None:
    await execute(
        "INSERT INTO audit_log (actor_id, action, target, detail, at) "
        "VALUES ($1, $2, $3, $4, now())",
        [actor_id, action, target, json.dumps(detail)],
    )


# Audit entries are NEVER updated or deleted — the log is immutable. A grant at
# the database enforces this: the app role may INSERT and SELECT, never UPDATE.
AUDIT_GRANT = """
GRANT INSERT, SELECT ON audit_log TO ROLE app_role;
-- deliberately NO update/delete: the audit trail cannot be rewritten.
"""
