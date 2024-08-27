export function range(from: number, to: number) {
	const r: number[] = [];
	for (let i = from; i < to; ++i) r.push(i);
	return r;
}