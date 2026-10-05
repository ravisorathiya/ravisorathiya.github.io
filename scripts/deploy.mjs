// One-command publish: `npm run deploy -- "what changed"`  (or double-click publish.cmd)
//
//  1. npm run check          → validates content + registries + secrets (stops on error)
//  2. npm run build          → only with --build (CI builds anyway; use it to catch errors locally)
//  3. git add -A + commit    → skipped if there's nothing new
//  4. git push origin main   → triggers .github/workflows/deploy.yml
//  5. waits for the GitHub Actions run and reports success/failure
//  6. confirms the live site answers 200
//
// Flags: --build (build locally first) · --no-wait (push and exit)
import { execSync } from 'node:child_process'

const REPO = 'ravisorathiya/ravisorathiya.github.io'
const SITE = 'https://ravisorathiya.github.io/'
const args = process.argv.slice(2)
const flags = new Set(args.filter((a) => a.startsWith('--')))
const message = args.filter((a) => !a.startsWith('--')).join(' ').trim() || `Update site (${new Date().toISOString().slice(0, 10)})`

const run = (cmd, opts = {}) => execSync(cmd, { stdio: 'inherit', ...opts })
const out = (cmd) => execSync(cmd, { encoding: 'utf8' }).trim()
const step = (n, text) => console.log(`\n\x1b[32m[${n}]\x1b[0m ${text}`)
const fail = (text) => {
  console.error(`\n\x1b[31m✗ ${text}\x1b[0m`)
  process.exit(1)
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// ── 1. Validate ──────────────────────────────────────────
step(1, 'Checking content (npm run check)')
try {
  run('npm run check --silent')
} catch {
  fail('Content check failed. Fix the ✗ lines above, then run this again.')
}

// ── 2. Optional local build ──────────────────────────────
if (flags.has('--build')) {
  step(2, 'Building locally (npm run build)')
  try {
    run('npm run build --silent')
  } catch {
    fail('Local build failed. Nothing was pushed.')
  }
}

// ── 3. Commit ────────────────────────────────────────────
step(3, 'Committing changes')
if (out('git rev-parse --abbrev-ref HEAD') !== 'main') fail('Not on the main branch. Switch with: git checkout main')
run('git add -A')
const pending = out('git status --porcelain')
if (pending) {
  console.log(pending.split('\n').map((l) => `   ${l}`).join('\n'))
  execSync('git commit -q -F -', { input: `${message}\n`, stdio: ['pipe', 'inherit', 'inherit'] })
  console.log(`   ✓ committed: "${message}"`)
} else {
  console.log('   (no file changes)')
}

// ── 4. Push ──────────────────────────────────────────────
step(4, 'Pushing to GitHub')
run('git fetch -q origin main')
const ahead = Number(out('git rev-list --count origin/main..HEAD'))
if (!ahead) {
  console.log('   Nothing new to publish. The live site is already up to date.')
  process.exit(0)
}
try {
  run('git push origin main')
} catch {
  fail('Push failed (are you signed in to GitHub? If someone else changed the repo, run: git pull --rebase).')
}
const sha = out('git rev-parse HEAD')

if (flags.has('--no-wait')) {
  console.log(`\nPushed. Deploy progress: https://github.com/${REPO}/actions`)
  process.exit(0)
}

// ── 5. Wait for the deploy ───────────────────────────────
step(5, 'Waiting for the GitHub Actions deploy (usually 1–3 minutes)')
const api = `https://api.github.com/repos/${REPO}/actions/runs?head_sha=${sha}&per_page=1`
let runInfo
const deadline = Date.now() + 15 * 60 * 1000
while (Date.now() < deadline) {
  runInfo = await fetch(api, { headers: { Accept: 'application/vnd.github+json' } })
    .then((r) => r.json())
    .then((j) => j.workflow_runs?.[0])
    .catch(() => null)
  if (runInfo?.status === 'completed') break
  process.stdout.write(runInfo ? `   ${runInfo.status}…\r` : '   waiting for the run to start…\r')
  await sleep(15000)
}
if (!runInfo || runInfo.status !== 'completed') fail(`Timed out waiting. Check: https://github.com/${REPO}/actions`)
if (runInfo.conclusion !== 'success') fail(`Deploy ${runInfo.conclusion}. Details: ${runInfo.html_url}`)
console.log('   ✓ deploy succeeded            ')

// ── 6. Verify the live site ──────────────────────────────
step(6, 'Checking the live site')
const status = await fetch(SITE, { cache: 'no-store' }).then((r) => r.status).catch(() => 0)
if (status !== 200) fail(`Live site answered ${status}.`)
console.log(`   ✓ ${SITE} is live (HTTP 200)`)
console.log('\n\x1b[32m✓ Published.\x1b[0m Hard-refresh your browser (Ctrl+F5) if you still see the old version.\n')
