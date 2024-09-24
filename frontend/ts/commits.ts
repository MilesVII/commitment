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

export function generateCommand(date: string) {
	const timestamp = `${date}T10:00:00`;

	return [
		`set GIT_AUTHOR_DATE=${timestamp}`,
		`set GIT_COMMITTER_DATE=${timestamp}`,
		`git commit --allow-empty -m "Empty commit"`
	].join("\n")
}

export function generateCommandSequence(cells: {date: string, commitCount: number}[]){
	const commands = cells.map(
		cell =>
			repeat(cell.commitCount, generateCommand(cell.date)).join("\n\n")
	).join("\n\n");

	return `@echo off\n\n${commands}`;
}
