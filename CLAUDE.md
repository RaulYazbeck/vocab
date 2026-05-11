# Claude Instructions

## Git
- Before attempting any push, check if it will work. If there is any doubt or a previous attempt failed, stop and ask the user instead of retrying repeatedly.
- Never burn tokens on repeated failed push attempts.
- Do not assume a branch name or push target — ask the user if unclear.
- Always push ALL changed files together, not just some of them.
- Confirm what was actually pushed vs what was only changed locally — do not conflate the two.
