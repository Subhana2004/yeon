#!/usr/bin/env bash
set -u
destination="${1:-./external-design-skills}"
mkdir -p "$destination"
repos=(
  emilkowalski/skills
  anthropics/skills
  nextlevelbuilder/ui-ux-pro-max-skill
  hamen/material-3-skill
  multica-ai/andrej-karpathy-skills
  delphi-ai/animate-skill
  kylezantos/design-motion-principles
  AgentsORG/design-engineering
  elayadesign/ai-design-skills
  elayadesign/redesign-skill
  vercel-labs/agent-skills
  Gabriel-Dalton/digital-accessibility-skill
)
printf 'repository\tstatus\tcommit\n' > "$destination/manifest.tsv"
for repo in "${repos[@]}"; do
 target="$destination/${repo//\//__}"
 if test -d "$target/.git"; then
    printf '%s\tpresent\t%s\n' "$repo" "$(git -C "$target" rev-parse HEAD)" >> "$destination/manifest.tsv"
 elif git clone --depth 1 --quiet "https://github.com/$repo.git" "$target"; then
    printf '%s\tcloned\t%s\n' "$repo" "$(git -C "$target" rev-parse HEAD)" >> "$destination/manifest.tsv"
 else
    printf '%s\tfailed\tnetwork_or_access\n' "$repo" >> "$destination/manifest.tsv"
    rm -rf "$target"
 fi
done
echo "Written: $destination/manifest.tsv"
