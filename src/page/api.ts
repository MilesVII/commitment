export async function fetchUser(username: string) {
	const response = await fetch("/api", {
		method: "POST",
		body: username
	});

	if (response.status !== 200) {
		return null;
	}

	return enrichResponse(await response.json());
}

export type CellColor = 0 | 1 | 2 | 3 | 4;

export type APICellData = {
	dateOriginal: string,
	unixtimeMS: number,
	weekday: number,
	cellColor: CellColor,
	// contributions GitHub reports for that day; -1 if the count could not be scraped
	count: number
};

function enrichResponse(rawCellData: {date: string, level: number | string, count?: number}[]): APICellData[] {
	return rawCellData.map(cell => {
		const [y, m, d] = cell.date.split("-").map(i => parseInt(i, 10));
		const date = new Date(y, m - 1, d);
		const cellColor = (typeof cell.level === "string" ? parseInt(cell.level, 10) : cell.level) as CellColor;
		return {
			dateOriginal: cell.date,
			unixtimeMS: date.getTime(),
			weekday: date.getDay(),
			cellColor,
			count: cell.count ?? (cellColor === 0 ? 0 : -1)
		}
	}).sort((a, b) => a.unixtimeMS - b.unixtimeMS);
}
