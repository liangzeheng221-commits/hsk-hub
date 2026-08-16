# HSK Course Hub

Interactive HSK 1–4 course site for Vietnamese learners.

## Current deployment model

- **Production content is deployed from `gh-pages`.** This branch currently contains the complete five-course site and its QA tooling.
- `main` and `gh-pages` have substantially diverged. Do **not** overwrite `gh-pages` from `main` or force-merge the histories without a dedicated reconciliation migration and a verified backup.
- Product changes should be made on a branch created from `gh-pages`, reviewed by the full Site QA workflow, and merged only after all checks pass.

## Content architecture rules

1. Course source data must be correct on its own. Runtime `audit`, `canonical`, `fix`, or `final` layers must not be the only place where a teaching rule is correct.
2. HSK4 Upper and Lower canonical grammar layers are validators: semantic corrections belong in the lesson source files.
3. Official textbook/workbook alignment is enforced by the existing 236-point grammar audit plus level-specific locked-textbook audits.
4. Shared student-facing UX/accessibility behavior lives in `assets/site-shell.js` and `assets/site-polish.css`; do not duplicate the same UI fix separately in every level.
5. Heavy optional features should load on demand where practical. Hanzi Writer is lazy-loaded by the shared shell on HSK1/2 lessons.

## Required QA before production

The `.github/workflows/site-qa.yml` workflow validates:

- JavaScript syntax
- session/password and Hanzi regressions
- shared-shell DOM/accessibility/progress behavior
- source-level HSK4 canonical grammar integrity
- course/link integrity
- HSK1/2 content and locked-textbook baselines
- HSK3 and HSK4 locked-textbook baselines
- all 236 formal grammar points
- HSK4 grammar UI
- reviewed practice banks
- HSK4 vocabulary/stroke-order panels

A production change is not ready until this workflow passes.
