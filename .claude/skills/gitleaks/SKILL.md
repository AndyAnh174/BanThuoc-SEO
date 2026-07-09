---
name: gitleaks
description: >
  Detect hardcoded secrets (passwords, API keys, tokens, credentials) in codebases using Gitleaks.
  Use this skill whenever the user mentions secret scanning, credential leaks, gitleaks setup,
  .gitleaks.toml configuration, CI/CD security scanning, pre-commit hooks for secrets,
  Jenkins security stage, or needs to audit a repo for exposed credentials.
  Also use when the user says "scan for secrets", "check for leaked keys", "add gitleaks",
  "setup secret detection", or asks about allowlisting false positives in security scans.
---

# Gitleaks — Secret Scanning

## What it does

Gitleaks scans your codebase for hardcoded secrets before they reach production. It detects 180+ types of credentials out of the box — AWS keys, GitHub tokens, JWT secrets, database passwords, Slack webhooks, and more. Running it in CI/CD catches leaks at the source; running it locally prevents them from ever being committed.

## When to reach for the reference file

This SKILL.md covers the common patterns you'll use 90% of the time. When you need the full config schema, all CLI flags, or custom rule authoring, read `references/gitleaks-config.md` — it has the complete reference with examples.

## Quick start

```bash
# Scan current directory (uses default rules, no config needed)
docker run --rm -v ${PWD}:/scan zricethezav/gitleaks:latest detect --source=/scan -v

# Scan with project config
docker run --rm -v ${PWD}:/scan zricethezav/gitleaks:latest \
    detect --source=/scan --config=/scan/.gitleaks.toml -v

# Generate JSON report for CI
docker run --rm -v ${PWD}:/scan zricethezav/gitleaks:latest \
    detect --source=/scan --config=/scan/.gitleaks.toml \
    --report-format=json --report-path=gitleaks-report.json
```

Pin the version in CI to avoid surprise breakage: `zricethezav/gitleaks:v8.25.0`

## Writing `.gitleaks.toml`

The config has two jobs: (1) extend the built-in rules so you don't miss anything, (2) allowlist false positives so CI doesn't fail on harmless patterns.

### Minimum viable config

```toml
title = "Project Gitleaks Config"

[extend]
  useDefault = true   # Keep all 180+ built-in detection rules

[allowlist]
  description = "Known safe patterns"
  paths = [
    '''Jenkinsfile''',              # CI/CD config may contain build args
    '''\.md$''',                    # Docs with example credentials
    '''(?i)\.(?:jpg|png|svg|ico)$''' # Binary/image files
  ]
  regexes = [
    '''(?i)(example|test|demo|placeholder|changeme)'''
  ]
```

### Allowlisting — the right way

**Skip a file** — use `paths` with glob patterns. Most common use: CI configs that contain build arguments, docs with example values, binary files that can't contain secrets.

**Skip a specific secret** — use `regexes` when you have a known rotated/test credential that keeps getting flagged. Add the exact secret string or a pattern matching it.

**Skip a commit** — use `commits` when a past commit contains a secret that's already been rotated. This is a last resort; prefer rotating the secret and allowlisting the file.

The most important thing to know about TOML format: **`paths` and `regexes` are plain arrays of strings, not arrays of objects.** Writing `[[allowlist.paths]]` with `path = "..."` will fail with a cryptic error. Always use `paths = ['''...''', '''...''']`.

## Jenkins integration

```groovy
stage('Gitleaks — Secret Scan') {
    steps {
        script {
            def result = sh(
                script: """
                    docker run --rm -v \${WORKSPACE}:/scan gitleaks/gitleaks:v8.25.0 \\
                        detect --source=/scan --config=/scan/.gitleaks.toml \\
                        --report-format=json --report-path=gitleaks-report.json -v
                """,
                returnStatus: true
            )
            if (result != 0) {
                error("Gitleaks found secrets! Check gitleaks-report.json")
            }
        }
    }
}
```

Key decisions in this snippet:
- **Pinned version** (`v8.25.0`) — avoids CI breaking when a new gitleaks release changes behavior
- **`returnStatus: true`** — lets you control the error message instead of a raw exit code
- **`--report-path`** — saves the report so Jenkins archives it for review

## Common pitfalls

1. **Forgot `[extend] useDefault = true`** → only your custom rules run, missing 180+ built-in detections
2. **TOML array-of-objects** → `[[allowlist.paths]]` with `path = "..."` silently fails; use `paths = ['''...''']`
3. **Scanning without config** → `--no-git` is needed for plain directories (default mode expects a git repo)
4. **`latest` tag in CI** → a new gitleaks release can add rules that flag things it didn't before, breaking your pipeline

## Email alerts via Jenkins

When gitleaks finds secrets in CI, you want to know immediately — not hours later when someone checks the build log. Jenkins Email Extension (`emailext`) can send the report directly to your inbox.

```groovy
// In environment block
GITLEAKS_ALERT_EMAIL = 'your-email@gmail.com'

// In Gitleaks stage — save summary to env vars
def report = readJSON file: 'gitleaks-report.json'
env.GITLEAKS_FOUND = report.size().toString()
env.GITLEAKS_SUMMARY = report.collect {
    "- ${it.RuleID}: ${it.File}:${it.StartLine}"
}.join('\n')

// In post block — send email only when secrets found
post {
    unsuccessful {
        script {
            if (env.GITLEAKS_FOUND?.toInteger() > 0) {
                emailext(
                    subject: "⚠️ [SECURITY] Gitleaks found secrets in ${env.JOB_NAME} #${BUILD_NUMBER}",
                    body: "Found ${env.GITLEAKS_FOUND} secrets:\n\n${env.GITLEAKS_SUMMARY}\n\n${BUILD_URL}",
                    to: env.GITLEAKS_ALERT_EMAIL
                )
            }
        }
    }
}
```

Requires Email Extension Plugin installed on Jenkins + SMTP configured (already set up on this project's Jenkins via Gmail).

## Resources
- Docs: https://github.com/gitleaks/gitleaks
- Full config reference: [gitleaks-config.md](./references/gitleaks-config.md)
- Default ruleset: https://github.com/gitleaks/gitleaks/blob/master/config/gitleaks.toml
