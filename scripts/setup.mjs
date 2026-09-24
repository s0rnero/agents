#!/usr/bin/env node
/**
 * setup.mjs - Installs or updates the agent harness in a repository.
 *
 * Commands:
 *   install (default)  -> copies the core, creates the per-repo files, generates
 *                         the root compatibility layer and runs autoskills.
 *   update             -> syncs the core from the registered origin (or --from)
 *                         without touching plans, decisions, skills or local adaptations.
 *
 * Usage (Node >= 18; autoskills requires >= 22):
 *   node scripts/setup.mjs <repo>                      # install from this repo
 *   node scripts/setup.mjs <repo> --from <path|git-url># install from another origin
 *   node scripts/setup.mjs <repo> update               # bring harness changes
 *   node scripts/setup.mjs <repo> update --from <url>  # update from another source
 *   node scripts/setup.mjs <repo> --dry-run            # show what it would do without writing
 *   node scripts/setup.mjs <repo> --skip-skills        # skip autoskills
 *   node scripts/setup.mjs <repo> --skills             # install skills (not only preview)
 *   node scripts/setup.mjs <repo> --no-fill            # do not touch .agents/AGENTS.md
 *   node scripts/setup.mjs <repo> --no-compat          # do not generate root files
 *   node scripts/setup.mjs                             # uses the current directory
 *
 * Environment: AGENTS_SETUP_SKIP_SKILLS=1 skips autoskills (CI/tests).
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HARNESS_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SKIP_SKILLS_ENV = process.env.AGENTS_SETUP_SKIP_SKILLS === '1';

// ---------------------------------------------------------------------------
// Arguments
// ---------------------------------------------------------------------------
const args = process.argv.slice(2);
const flags = new Set(args.filter((a) => a.startsWith('--')));
const positional = args.filter((a) => !a.startsWith('--'));

let cmd = 'install';
const rest = [];
for (const a of positional) {
  if (a === 'install' || a === 'update') cmd = a;
  else rest.push(a);
}
const TARGET = path.resolve(rest[0] || process.cwd());

const DRY_RUN = flags.has('--dry-run');
const NO_FILL = flags.has('--no-fill');
const NO_COMPAT = flags.has('--no-compat');
const SKIP_SKILLS = flags.has('--skip-skills');
const SKILLS = flags.has('--skills');
const FROM = flagValue('--from');

function flagValue(name) {
  const i = args.indexOf(name);
  if (i === -1) return null;
  const v = args[i + 1];
  return v && !v.startsWith('--') ? v : null;
}

if (!fs.existsSync(TARGET) || !fs.statSync(TARGET).isDirectory()) {
  console.error(`Error: target does not exist or is not a directory: ${TARGET}`);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function readJson(p) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; }
}
function writeJson(p, obj) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(obj, null, 2) + '\n');
}
function sameFile(a, b) {
  if (!fs.existsSync(a) || !fs.existsSync(b)) return false;
  return fs.readFileSync(a).equals(fs.readFileSync(b));
}
function gitRemote(dir) {
  const r = spawnSync('git', ['-C', dir, 'remote', 'get-url', 'origin'], { encoding: 'utf8' });
  return r.status === 0 && r.stdout.trim() ? r.stdout.trim() : null;
}
function isGitUrl(s) {
  return /^(https?|git|ssh):\/\/|^git@/.test(s);
}

let cleanupDir = null;
function resolveSource(from) {
  if (from) {
    if (fs.existsSync(from) && fs.statSync(from).isDirectory()) {
      return { dir: path.resolve(from), origin: path.resolve(from) };
    }
    if (isGitUrl(from)) {
      const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'harness-src-'));
      console.log(`  (cloning source: ${from})`);
      const r = spawnSync('git', ['clone', '--depth', '1', '--quiet', from, tmp], { encoding: 'utf8' });
      if (r.status !== 0) {
        fs.rmSync(tmp, { recursive: true, force: true });
        console.error(`Error: could not clone ${from}`);
        if (r.stderr) console.error(r.stderr.trim());
        process.exit(1);
      }
      cleanupDir = tmp;
      return { dir: tmp, origin: from };
    }
    console.error(`Error: --from must be a local directory or a git URL: ${from}`);
    process.exit(1);
  }
  // Without --from: local origin (this repo, or the installed package via npx/bunx).
  // Si no hay .git (paquete), usar el defaultOrigin del manifest (URL git del harness).
  const dir = HARNESS_DIR;
  const localRemote = gitRemote(dir);
  const pkgDefault = readJson(path.join(dir, '.agents', 'manifest.json'))?.defaultOrigin || null;
  const origin = localRemote || pkgDefault || dir;
  return { dir, origin };
}

// ---------------------------------------------------------------------------
// Manifest-based sync
// ---------------------------------------------------------------------------
function syncCore(srcDir, targetDir, manifest, dry) {
  const changed = [], same = [];
  for (const rel of manifest.core || []) {
    const s = path.join(srcDir, rel);
    const d = path.join(targetDir, rel);
    if (!fs.existsSync(s)) { console.warn(`  ! missing in source: ${rel}`); continue; }
    if (fs.existsSync(d) && sameFile(s, d)) { same.push(rel); continue; }
    changed.push(rel);
    if (!dry) { fs.mkdirSync(path.dirname(d), { recursive: true }); fs.copyFileSync(s, d); }
  }
  return { changed, same };
}

function syncPerRepo(srcDir, targetDir, manifest, dry) {
  const created = [], kept = [];
  for (const rel of manifest.perRepo || []) {
    const s = path.join(srcDir, rel);
    const d = path.join(targetDir, rel);
    if (fs.existsSync(d)) { kept.push(rel); continue; }
    created.push(rel);
    if (!dry && fs.existsSync(s)) { fs.mkdirSync(path.dirname(d), { recursive: true }); fs.copyFileSync(s, d); }
  }
  return { created, kept };
}

// Root compatibility layer: thin files pointing to .agents/.
// They are regenerated on install and update so the harness works with any agent
// (Codex, Copilot, Cursor, Claude Code, etc.).
function rootAgentsContent() {
  return `# AGENTS.md

> Automatically generated by the harness (.agents). Do not edit by hand: it is
> regenerated with \`node scripts/setup.mjs <repo> update\`. All normative content
> lives in \`.agents/\`.

This project uses the generic agent harness. Entry point for any agent:

- Central index and project profile: \`.agents/AGENTS.md\`
- Flow and gates: \`.agents/WORKFLOW.md\`
- Operating rules: \`.agents/RULES.md\`
- Code conventions: \`.agents/CODING_STANDARDS.md\`
- Architecture and design: \`.agents/DESIGN.md\`
- Plans (persistent memory): \`.agents/plans/\`
- Architecture decisions: \`.agents/decisions/\`

The real commands (build/test/dev/preview) are listed in the "Project Real
Scripts" section of \`.agents/AGENTS.md\`.
`;
}

function pointerContent(name) {
  return `# ${name}

> File generated by the harness (.agents). Do not edit by hand: it is
> regenerated with \`node scripts/setup.mjs <repo> update\`.

This project uses the generic agent harness. Read first \`.agents/AGENTS.md\`
(central index and profile), then \`.agents/WORKFLOW.md\` (flow and gates) and
\`.agents/RULES.md\` (operating rules).
`;
}

function syncGenerated(targetDir, dry) {
  const files = [
    ['AGENTS.md', rootAgentsContent()],
    ['CLAUDE.md', pointerContent('CLAUDE.md')],
    ['.cursorrules', pointerContent('.cursorrules')],
    ['.github/copilot-instructions.md', pointerContent('GitHub Copilot Instructions')],
  ];
  const written = [];
  for (const [rel, content] of files) {
    const d = path.join(targetDir, rel);
    const same = fs.existsSync(d) && fs.readFileSync(d, 'utf8') === content;
    if (same) continue;
    written.push(rel);
    if (!dry) { fs.mkdirSync(path.dirname(d), { recursive: true }); fs.writeFileSync(d, content); }
  }
  return written;
}

function writeTargetManifest(targetDir, srcManifest, origin) {
  const m = { ...srcManifest, origin };
  writeJson(path.join(targetDir, '.agents', 'manifest.json'), m);
}

// ---------------------------------------------------------------------------
// Stack detection + profile fill
// ---------------------------------------------------------------------------
function detectStackAndFill(targetDir, dry) {
  const packageJsonPath = path.join(targetDir, 'package.json');
  let pkg = null;
  if (fs.existsSync(packageJsonPath)) {
    try { pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8')); } catch { pkg = null; }
  }

  const STACK_MAP = [
    [/^vue$/, 'Vue 3 (Composition API)'],
    [/^@vue\//, 'Vue 3 (Composition API)'],
    [/^nuxt/, 'Nuxt'],
    [/^react$|^react-dom$/, 'React'],
    [/^next$/, 'Next.js'],
    [/^svelte$/, 'Svelte'],
    [/^astro$/, 'Astro'],
    [/^solid-js$/, 'SolidJS'],
    [/^tailwindcss$/, 'Tailwind CSS'],
    [/^vite$/, 'Vite'],
    [/^typescript$/, 'TypeScript'],
    [/^bun$|^bun-types$/, 'Bun'],
    [/^vitest$/, 'Vitest'],
    [/^playwright/, 'Playwright'],
    [/^jest$/, 'Jest'],
    [/^express$/, 'Express'],
    [/^fastify$/, 'Fastify'],
    [/^hono$/, 'Hono'],
    [/^@nestjs\//, 'NestJS'],
    [/^prisma$/, 'Prisma'],
    [/^drizzle-orm$/, 'Drizzle ORM'],
    [/^zod$/, 'Zod'],
    [/^supabase/, 'Supabase'],
    [/^electron$/, 'Electron'],
    [/^tauri$/, 'Tauri'],
    [/^expo$/, 'Expo'],
    [/^react-native$/, 'React Native'],
    [/^three$/, 'Three.js'],
    [/^gsap$/, 'GSAP'],
    [/^@tanstack\/query/, 'TanStack Query'],
    [/^@tanstack\/table/, 'TanStack Table'],
    [/^pino$/, 'Pino'],
  ];

  const stack = new Set();
  const scripts = [];

  if (pkg) {
    const deps = Object.keys({ ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}), ...(pkg.peerDependencies || {}) });
    for (const [re, label] of STACK_MAP) if (deps.some((d) => re.test(d))) stack.add(label);
    const locks = [['bun.lock', 'bun'], ['bun.lockb', 'bun'], ['pnpm-lock.yaml', 'pnpm'], ['yarn.lock', 'yarn'], ['package-lock.json', 'npm']];
    const mgr = pkg.packageManager ? pkg.packageManager.split('@')[0] : locks.find(([l]) => fs.existsSync(path.join(targetDir, l)))?.[1];
    if (mgr) stack.add(`Package manager: ${mgr}`);
    if (pkg.engines?.node) stack.add(`Node ${pkg.engines.node}`);
    for (const [name, cmd] of Object.entries(pkg.scripts || {})) scripts.push({ name, cmd });
  } else {
    const gradleFiles = ['settings.gradle.kts', 'build.gradle.kts', 'build.gradle'];
    const hasGradle = gradleFiles.some((f) => fs.existsSync(path.join(targetDir, f)));
    const hasMaven = fs.existsSync(path.join(targetDir, 'pom.xml'));
    if (hasGradle || hasMaven) {
      stack.add('Java');
      stack.add(hasGradle ? 'Gradle' : 'Maven');
      for (const f of [...gradleFiles, 'pom.xml']) {
        const p = path.join(targetDir, f);
        if (!fs.existsSync(p)) continue;
        const c = fs.readFileSync(p, 'utf8');
        if (/org\.springframework\.boot|spring-boot/.test(c)) stack.add('Spring Boot');
        if (/webflux|spring-boot-starter-webflux/.test(c)) stack.add('Spring WebFlux');
      }
    }
    if (fs.existsSync(path.join(targetDir, 'go.mod'))) stack.add('Go');
    if (fs.existsSync(path.join(targetDir, 'Cargo.toml'))) stack.add('Rust');
    if (fs.existsSync(path.join(targetDir, 'pyproject.toml')) || fs.existsSync(path.join(targetDir, 'requirements.txt'))) stack.add('Python');
  }

  const SCRIPT_LABELS = {
    dev: 'Dev server', serve: 'Dev server', start: 'Start', preview: 'Preview',
    build: 'Build', 'build:packages': 'Build library', 'build:apps': 'Build apps',
    test: 'Tests', 'test:ui': 'Tests UI', 'test:debug': 'Tests debug',
    lint: 'Lint', typecheck: 'Typecheck', 'type-check': 'Typecheck',
    publish: 'Publish', release: 'Release', check: 'Checks',
  };

  const agentsPath = path.join(targetDir, '.agents', 'AGENTS.md');
  if (dry || !fs.existsSync(agentsPath)) return { stack, scripts };
  let content = fs.readFileSync(agentsPath, 'utf8');
  const today = new Date().toISOString().slice(0, 10);
  const repoName = pkg?.name || path.basename(targetDir);
  const changed = [];

  const replaceOnce = (from, to, label) => {
    if (!content.includes(from)) return false;
    content = content.replace(from, to);
    changed.push(label);
    return true;
  };

  replaceOnce(
    'project: [PROJECT NAME] - generic agent harness',
    `project: ${repoName} - generic agent harness`,
    'frontmatter (project)',
  );
  replaceOnce(
    '> [STACK] Fill per repo. Describe the project, its real stack and structure. Example stack table:',
    `> Profile generated automatically on ${today}. Review and fill in what is missing. Example stack table:`,
    'profile note',
  );
  if (stack.size > 0) {
    replaceOnce(
      '- [Fill in: languages, frameworks, package manager, build/test tools]',
      [...stack].map((t) => `- ${t}`).join('\n'),
      'detected stack',
    );
  }
  if (scripts.length > 0) {
    const rows = scripts.slice(0, 10).map(({ name, cmd }) => `| ${SCRIPT_LABELS[name] || name} | \`${cmd}\` |`).join('\n');
    replaceOnce(
      `> [STACK] List the real build/dev/test/preview scripts. Do not invent commands that do not exist.\n\n| Purpose | Command |\n| --- | --- |\n| [Build] | [real command] |\n| [Test] | [real command] |\n| [Dev/Preview] | [real command] |`,
      `> Scripts detected automatically from package.json on ${today}. Verify against the repo.\n\n| Purpose | Command |\n| --- | --- |\n${rows}`,
      'scripts table',
    );
  }

  fs.writeFileSync(agentsPath, content);
  console.log(changed.length
    ? `\nAGENTS.md updated: ${changed.join(', ')}`
    : '\nAGENTS.md was already adapted or there were no placeholders to fill.');
  return { stack, scripts };
}

// ---------------------------------------------------------------------------
// autoskills
// ---------------------------------------------------------------------------
function runAutoskills(dir, mode) {
  const install = SKILLS;
  const bin = process.platform === 'win32' ? 'npx.cmd' : 'npx';
  const cmdArgs = install ? ['--yes', 'autoskills', '-y'] : ['--yes', 'autoskills', '--dry-run'];
  console.log(`\n==> autoskills (${install ? 'installs the stack skills' : 'preview, installs nothing'}) in ${dir} ...\n`);
  const res = spawnSync(bin, cmdArgs, { cwd: dir, stdio: 'inherit', shell: process.platform === 'win32' });
  if (res.error) {
    console.error(`\nCould not run autoskills: ${res.error.message}`);
    console.error('Make sure you have Node >= 22 and run manually: cd <repo> && npx autoskills');
  } else if (res.status !== 0) {
    console.error(`\nautoskills exited with code ${res.status}. Review the error and try manually: cd <repo> && npx autoskills`);
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
const targetManifest = readJson(path.join(TARGET, '.agents', 'manifest.json'));  // Resolve the origin: --from wins; on update the registered origin is used.
let from = FROM;
if (cmd === 'update' && !from && targetManifest?.origin) from = targetManifest.origin;

console.log(`\n==> Harness ${cmd} at: ${TARGET}`);
if (DRY_RUN) console.log('    (--dry-run: only showing what I would do, writing nothing)');

const src = resolveSource(from);
try {
  const srcManifest = readJson(path.join(src.dir, '.agents', 'manifest.json'));
  if (!srcManifest) {
    console.error(`Error: source ${src.dir} has no .agents/manifest.json (it is not the harness).`);
    process.exit(1);
  }

  const oldVer = targetManifest?.version || null;
  const newVer = srcManifest.version || '?';
  console.log(`    Source: ${src.origin}`);
  console.log(oldVer && oldVer !== newVer ? `    Version: ${oldVer} -> ${newVer}` : `    Version: ${newVer}`);

  const core = syncCore(src.dir, TARGET, srcManifest, DRY_RUN);
  const per = syncPerRepo(src.dir, TARGET, srcManifest, DRY_RUN);
  const generated = NO_COMPAT ? [] : syncGenerated(TARGET, DRY_RUN);

  if (!DRY_RUN) writeTargetManifest(TARGET, srcManifest, src.origin);

  const { stack } = detectStackAndFill(TARGET, DRY_RUN || NO_FILL);

  // autoskills: install -> preview (o --skills); update -> solo con --skills.
  let skillsSkipped = '';
  if (DRY_RUN) {
    skillsSkipped = ' (skipped by --dry-run)';
  } else if (SKIP_SKILLS_ENV || SKIP_SKILLS) {
    skillsSkipped = ' (skipped by flag/env)';
  } else if (cmd === 'update' && !SKILLS) {
    skillsSkipped = ' (update: skills are not reinstalled; use --skills)';
  } else {
    runAutoskills(TARGET, cmd);
  }
  if (skillsSkipped) console.log(`\n==> autoskills ${skillsSkipped.trim()}`);

  console.log('\n==> Summary');
  console.log(`    Core: ${core.changed.length} updated, ${core.same.length} unchanged`);
  for (const f of core.changed) console.log(`      + ${f}`);
  console.log(`    Per repo: ${per.created.length} created, ${per.kept.length} kept`);
  if (!NO_COMPAT) console.log(`    Root compat: ${generated.length} generated${generated.length ? ' (' + generated.join(', ') + ')' : ''}`);
  console.log('    Always preserved: .agents/plans/, .agents/decisions/, .agents/skills/ and every file not listed in the manifest.');
  console.log(`    Detected stack: ${stack.size ? [...stack].join(', ') : '(no detection, fill in by hand)'}`);
  if (cmd === 'update') {
    console.log('\nUpdate done. The core is in sync with the source; your plans, decisions, skills and local adaptations were not touched.');
  } else {
    console.log('\nDone. To bring harness changes later:');
    console.log(`  node scripts/setup.mjs ${TARGET} update`);
    console.log('To verify integrity:');
    console.log(`  node scripts/verify.mjs ${TARGET}`);
  }
} finally {
  if (cleanupDir) fs.rmSync(cleanupDir, { recursive: true, force: true });
}
