# Gitleaks Configuration Reference

## File: `.gitleaks.toml`

### Full Schema

```toml
title = "Config Title"

# Extend default rules (recommended: keep all built-in detection)
[extend]
  useDefault = true
  # Or extend specific config file:
  # path = "/path/to/base.toml"

# Global allowlist
[allowlist]
  description = "Allowlist description"
  # Skip specific commits
  commits = ["abc123", "def456"]
  # Skip files matching glob patterns
  paths = [
    '''file-to-skip\.txt''',
    '''(?i)\.(?:jpg|png|svg)$'''
  ]
  # Skip secrets matching regex
  regexes = [
    '''219-09-9999''',
    '''(?i)(example|test|demo)'''
  ]
  # Skip secrets containing stopwords (v8.8+)
  stopwords = ["client", "endpoint"]
  # Target "match" (the extracted secret) or "line" (full line)
  # regexTarget = "match"

# Custom detection rules
[[rules]]
  id = "my-custom-rule"
  description = "Detect custom pattern"
  regex = '''my-secret-pattern-\w{32}'''
  tags = ["custom", "myapp"]

  # Rule-level allowlist
  [rules.allowlist]
    paths = ['''test/''']
    regexes = ['''false-positive-pattern''']
```

### Built-in Rule Categories

| Category | Examples |
|----------|----------|
| **API Keys** | AWS, GCP, GitHub, GitLab, Slack, Stripe |
| **Tokens** | JWT, OAuth, PAT |
| **Passwords** | Database URLs, connection strings |
| **Private Keys** | SSH, PGP, RSA |
| **Cloud** | Azure, AWS ARN, GCP service accounts |

### CLI Reference

```
gitleaks detect [flags]

Flags:
  -s, --source string         Path to scan (dir, file, git repo)
  -c, --config string         Config file path
  -f, --report-format string  json | csv | sarif
  -r, --report-path string    Output file path
      --no-git                Scan plain directory (no git)
      --redact                Redact secrets in output
      --exit-code int         Exit code on leak found (default: 1)
      --log-level string      debug | info | warn | error | fatal
  -v, --verbose               Verbose output
```

### Docker Usage

```bash
# Basic scan
docker run --rm -v $(pwd):/scan zricethezav/gitleaks:latest \
    detect --source=/scan

# With config
docker run --rm -v $(pwd):/scan zricethezav/gitleaks:latest \
    detect --source=/scan --config=/scan/.gitleaks.toml

# Pin version (recommended for CI)
docker run --rm -v $(pwd):/scan zricethezav/gitleaks:v8.25.0 \
    detect --source=/scan --config=/scan/.gitleaks.toml
```

### TOML Gotchas

1. `paths` and `regexes` must be **arrays of strings**, not arrays of objects:
   ```toml
   # ✅ CORRECT
   paths = ['''pattern1''', '''pattern2''']

   # ❌ WRONG
   [[allowlist.paths]]
     path = '''pattern1'''
   ```

2. Regex in TOML: use `'''triple quotes'''` to avoid escaping backslashes

3. `[extend] useDefault = true` loads gitleaks' built-in config. Without it, only your custom rules run.
