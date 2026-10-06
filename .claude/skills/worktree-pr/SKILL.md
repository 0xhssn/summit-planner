---
name: worktree-pr
description: Start a piece of work in its own git worktree beside the main checkout and finish it as a GitHub pull request into main. Use when starting a feature, fix or docs change that should land through a PR, or when asked to work in a worktree or open a PR.
---

# Worktree to PR

Each branch gets a sibling checkout next to the main one. For example, `../summit-planner-tour` holds `feature/product-tour`. The main checkout at `../summit-planner` stays on `main`.

## Start

Run `git worktree list` first so you don't reuse a name or a branch. Then, from the main checkout:

```bash
git fetch origin
git worktree add --no-track -b <type>/<topic> ../summit-planner-<topic> origin/main
cd ../summit-planner-<topic>
npm ci
cp ../summit-planner/.env.local .   # gitignored, so a new worktree doesn't have it
npx next typegen                    # route types, so the editor and tsc work
```

Branch prefixes in use: `feature/`, `ux/`, `docs/`, `fix/`. `--no-track` stops the branch from tracking `origin/main`, so a bare `git push` can't target `main`.

If you need a dev server, use a free port such as `npm run dev -- --port 3001`, because other worktrees may be holding 3000.

## Finish

1. Run the `verify` skill.
2. Stage paths explicitly and never `.env.local`. Commit with a short, imperative, sentence-case subject, for example "Add outcome tracking, landing page, and empty/loading/not-found states". README-only commits start with `README:`.
3. `git push -u origin <type>/<topic>`
4. `gh pr create --base main` with a body that covers:
   - what changed and why
   - how you verified it: the commands you ran and what you clicked
   - anything the reviewer must do by hand, such as running a new migration in the SQL editor
   - what's deliberately left out
5. Leave the worktree in place until the PR merges. Afterwards, from the main checkout, run `git worktree remove ../summit-planner-<topic>` and delete the branch.
