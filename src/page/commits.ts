import { CellColor } from "./api";
import { repeat } from "./utils";

// Minimum contribution count a day needs to be painted with each level
export type LevelThresholds = Record<CellColor, number>;

//////////////////////////////////////////////////////////////////////////
// GitHub does not publish how a day's contribution count maps to a color,
// and the mapping is relative to the user. Observing real profiles shows a
// consistent picture: a per-user reference value M (roughly the busiest day
// of the year after GitHub drops a few outliers by an unpublished rule) is
// split into quarters, and a day with `count` contributions gets
//   level 4 if count > 3/4 M
//   level 3 if count > 1/2 M
//   level 2 if count > 1/4 M
//   level 1 if count > 0
// M itself is unknown, but every cell of the fetched graph constrains it,
// so we pin M down to an interval and pick thresholds that hold for every
// M inside that interval.
//////////////////////////////////////////////////////////////////////////
export function deriveThresholds(cells: { cellColor: CellColor, count: number }[]): LevelThresholds {
	// a cell at level L (1..3) means count <= L * M / 4, so M >= 4 * count / L (inclusive bound)
	// a cell at level L (2..4) means count > (L - 1) * M / 4, so M < 4 * count / (L - 1) (exclusive bound)
	// bounds are kept as fractions (4 * count / k) to avoid float rounding
	let lower: { count: number, k: number } | null = null;
	let upper: { count: number, k: number } | null = null;

	for (const { cellColor, count } of cells) {
		if (count < 0 || cellColor === 0) continue;
		if (cellColor <= 3) {
			if (lower === null || count * lower.k > lower.count * cellColor)
				lower = { count, k: cellColor };
		}
		if (cellColor >= 2) {
			const k = cellColor - 1;
			if (upper === null || count * upper.k < upper.count * k)
				upper = { count, k };
		}
	}

	const thresholdFor = (level: CellColor): number => {
		if (level <= 1) return level;
		const steps = level - 1;
		if (upper !== null) {
			// count > steps * M / 4 must hold for every M < upper, i.e. count >= steps * upper / 4
			return Math.max(level, ceilDiv(steps * upper.count, upper.k));
		}
		if (lower !== null) {
			// nothing above level 1 on the graph: assume M sits right at the lower bound
			return Math.max(level, Math.floor(steps * lower.count / lower.k) + 1);
		}
		// empty graph: the drawing itself will define M, so pick M = 4 and levels map to 1..4 commits
		return level;
	};

	return {
		0: 0,
		1: 1,
		2: thresholdFor(2),
		3: thresholdFor(3),
		4: thresholdFor(4)
	};
}

function ceilDiv(a: number, b: number) {
	return Math.floor((a + b - 1) / b);
}

export function requiredCommitCount(
	cell: { cellColor: CellColor, count: number },
	targetColor: CellColor,
	thresholds: LevelThresholds
) {
	if (targetColor <= cell.cellColor) return 0;
	// if the count could not be scraped, assume the least amount that gives the current level
	const current = cell.count >= 0 ? cell.count : thresholds[cell.cellColor];
	return Math.max(0, thresholds[targetColor] - current);
}

export type ScriptType = "bat" | "sh";

const gitCommand: Record<ScriptType, (timestamp: string) => string> = {
	sh: (timestamp) => [
		`GIT_AUTHOR_DATE==${timestamp}`,
		`GIT_COMMITTER_DATE=${timestamp}`,
		`git commit --allow-empty -m "Empty commit"`
	].join("\n"),
	bat: (timestamp) => [
		`set GIT_AUTHOR_DATE=${timestamp}`,
		`set GIT_COMMITTER_DATE=${timestamp}`,
		`git commit --allow-empty -m "Empty commit"`
	].join("\n")
}

export function generateCommand(type: ScriptType, date: string) {
	const timestamp = `${date}T10:00:00`;

	return (gitCommand[type](timestamp));
}

const prelude: Record<ScriptType, string> = {
	sh: [].join("\n"),
	bat: [
		`@echo off\n`,
		`git rev-parse --is-inside-work-tree >nul`,
		`if errorlevel 1 (`,
		`	echo "This is not a Git repository"`,
		`	exit /b 1`,
		`)`
	].join("\n")
};

export function generateCommandSequence(type: ScriptType, cells: {date: string, commitCount: number}[]){
	const commands = cells.map(
		cell =>
			repeat(cell.commitCount, generateCommand(type, cell.date)).join("\n\n")
	).join("\n\n");

	return `${prelude[type]}\n\n${commands}`;
}
