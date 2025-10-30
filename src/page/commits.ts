import { CellColor } from "./api";
import { repeat } from "./utils";

export function requiredCommitCount(currentColor: CellColor, targetColor: CellColor) {
	//////////////////////////////
	// CellColor to commits map
	// 0: 0
	// 1: 1-2
	// 2: 3-4
	// 3: 5-6
	// 4: 7+

	if (currentColor === 0)
		return Math.max(0, targetColor * 2 - 1);
	if (currentColor < 4)
		return (targetColor - currentColor) * 2;
	return 0;
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
