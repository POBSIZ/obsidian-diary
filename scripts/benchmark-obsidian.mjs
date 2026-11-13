import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { randomUUID } from "node:crypto";

// Re-render existing views, loading deferred leaves first. No notes, settings or tabs are created.
const runId = randomUUID();
const code = `(async () => {
  const results = [];
  const hash = (value) => require('crypto').createHash('sha256').update(value).digest('hex');
  window.__diaryBenchmarkResult = {runId: ${JSON.stringify(runId)}, phase: 'running', results};
  for (const type of ['monthly-planner-view', 'monthly-sidebar-planner-view', 'three-day-planner-view']) {
    const leaf = app.workspace.getLeavesOfType(type)[0];
    if (!leaf) continue;
    await leaf.loadIfDeferred();
    if (typeof leaf.view.render !== 'function') throw new Error('Planner view did not load: ' + type);
    const view = leaf.view;
    view.render();
    // Plan-note Markdown rendering is asynchronous and must settle before timing reuse.
    await new Promise(resolve => window.setTimeout(resolve, 250));
    const times = [];
    for (let i = 0; i < 31; i++) {
      const start = performance.now();
      view.render();
      times.push(performance.now() - start);
    }
    times.sort((a, b) => a - b);
    results.push({type, samples: 31, medianMs: times[15], p95Ms: times[29],
      elements: view.contentEl.querySelectorAll('*').length,
      chips: view.contentEl.querySelectorAll('.planner-chip').length,
      contentHash: hash(JSON.stringify(view.getVisibleDays ? view.getVisibleDays().map(day =>
        [day.dateString, day.entries.map(entry => [entry.id, entry.title, entry.startMinutes, entry.endMinutes])]) :
        Array.from(view.contentEl.querySelectorAll('td[data-year]')).map(cell =>
          [cell.dataset.year, cell.dataset.month, cell.dataset.day, cell.textContent])))});
  }
  const plugin = app.plugins.plugins.diary;
  window.__diaryBenchmarkResult = {runId: ${JSON.stringify(runId)}, version: plugin.manifest.version,
    mainHash: hash(require('fs').readFileSync(app.vault.adapter.getBasePath() + '/' + plugin.manifest.dir + '/main.js')),
    loadedRefreshHash: hash(plugin.refreshMonthlyPlannerViews.toString()), results};
  return JSON.stringify(window.__diaryBenchmarkResult);
})()`;
const directory = mkdtempSync(join(tmpdir(), "diary-ui-benchmark-"));
try {
	const path = join(directory, "benchmark.js");
	writeFileSync(path, code);
	const result = execFileSync("obsidian", ["vault=NOTE", "eval", `code=eval(require('fs').readFileSync(${JSON.stringify(path)}, 'utf8'))`], { encoding: "utf8" });
	let collected = result.trim();
	for (let attempt = 0; attempt < 30; attempt++) {
		await delay(100);
		collected = execFileSync("obsidian", ["vault=NOTE", "eval", "code=JSON.stringify(window.__diaryBenchmarkResult)"], { encoding: "utf8" }).trim();
		if (collected.includes(runId) && collected.includes('"version"')) break;
	}
	if (!collected.includes(runId) || !collected.includes('"version"')) throw new Error("Obsidian did not return benchmark results");
	console.log(collected);
} finally {
	rmSync(directory, { recursive: true, force: true });
}
