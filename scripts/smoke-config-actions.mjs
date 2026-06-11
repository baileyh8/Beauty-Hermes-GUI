import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { homedir, tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const hermesAgentRepo = process.env.HERMES_AGENT_REPO || join(homedir(), '.hermes', 'hermes-agent');
const python = process.env.HERMES_PYTHON
  || join(hermesAgentRepo, 'venv', 'bin', 'python');
const hermesHome = mkdtempSync(join(tmpdir(), 'beauty-hermes-config-smoke.'));

mkdirSync(join(hermesHome, 'skills', 'demo'), { recursive: true });
writeFileSync(
  join(hermesHome, 'config.yaml'),
  [
    'model:',
    '  provider: smoke',
    '  default: smoke-model',
    'skills:',
    '  disabled: []',
    'platforms:',
    '  telegram:',
    '    enabled: false',
    '',
  ].join('\n'),
);
writeFileSync(
  join(hermesHome, 'skills', 'demo', 'SKILL.md'),
  [
    '---',
    'name: demo-skill',
    'description: Demo skill',
    '---',
    '# Demo',
    '',
  ].join('\n'),
);

const script = String.raw`
import json
import os
from hermes_cli import profiles as profiles_mod
from hermes_cli.config import load_config, save_config
from hermes_cli.skills_config import get_disabled_skills, save_disabled_skills
from cron import jobs as cron_jobs

created = profiles_mod.create_profile(
    name="ui-smoke",
    clone_from=None,
    clone_all=False,
    clone_config=False,
    no_skills=True,
    description="smoke",
)
profiles_mod.set_active_profile("ui-smoke")

job = cron_jobs.create_job(
    prompt="say hi",
    schedule="0 9 * * *",
    name="ui cron",
    deliver="local",
    profile="default",
)
paused = cron_jobs.pause_job(job["id"])
resumed = cron_jobs.resume_job(job["id"])

config = load_config()
disabled = get_disabled_skills(config)
disabled.add("demo-skill")
save_disabled_skills(config, disabled)

config = load_config()
platforms = config.setdefault("platforms", {})
platforms.setdefault("telegram", {})["enabled"] = True
save_config(config)

state = {
    "active": profiles_mod.get_active_profile(),
    "profiles": [p.name for p in profiles_mod.list_profiles()],
    "cron": {
        "id": job["id"],
        "paused": paused["state"],
        "resumed": resumed["state"],
    },
    "disabled_skills": sorted(get_disabled_skills(load_config())),
    "telegram_enabled": load_config().get("platforms", {}).get("telegram", {}).get("enabled"),
}
print(json.dumps(state, ensure_ascii=False))
`;

const result = spawnSync(python, ['-c', script], {
  cwd: hermesAgentRepo,
  env: {
    ...process.env,
    HERMES_HOME: hermesHome,
    PYTHONPATH: [hermesAgentRepo, process.env.PYTHONPATH].filter(Boolean).join(':'),
  },
  encoding: 'utf8',
  maxBuffer: 1024 * 1024,
});

if (result.status !== 0) {
  console.error('Config action smoke failed.');
  console.error((result.stderr || result.stdout || '').slice(-4000));
  process.exit(1);
}

const state = JSON.parse(result.stdout.trim().split('\n').at(-1));
const failures = [];
if (state.active !== 'ui-smoke') failures.push('profile active switch failed');
if (!state.profiles.includes('ui-smoke')) failures.push('profile create/list failed');
if (!state.cron?.id || state.cron.paused !== 'paused' || state.cron.resumed !== 'scheduled') failures.push('cron lifecycle failed');
if (!state.disabled_skills.includes('demo-skill')) failures.push('skill toggle persistence failed');
if (state.telegram_enabled !== true) failures.push('messaging platform toggle failed');

if (failures.length) {
  console.error('Config action smoke failed.');
  console.error(failures.join('\n'));
  console.error(JSON.stringify(state, null, 2));
  process.exit(1);
}

console.log('Config action smoke passed.');
console.log(`hermesHome=${hermesHome}`);
