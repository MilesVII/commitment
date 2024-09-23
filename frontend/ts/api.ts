export async function fetchUser(username: string) {
	const param = encodeURIComponent(username);
	const response = await fetch(`https://gh-proxy.milesseventh.workers.dev/?name=${param}`);

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
	cellColor: CellColor
};

function enrichResponse(rawCellData: {date: string, level: string}[]): APICellData[] {
	return rawCellData.map(cell => {
		const [y, m, d] = cell.date.split("-").map(i => parseInt(i, 10));
		const date = new Date(y, m - 1, d);
		return {
			dateOriginal: cell.date,
			unixtimeMS: date.getTime(),
			weekday: date.getDay(),
			cellColor: parseInt(cell.level, 10) as CellColor
		}
	}).sort((a, b) => a.unixtimeMS - b.unixtimeMS);
}
