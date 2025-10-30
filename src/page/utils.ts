export function range(from: number, to: number) {
	const r: number[] = [];
	for (let i = from; i < to; ++i) r.push(i);
	return r;
}

export function repeat<T>(count: number, item: T) {
	return Array.from({ length: count }).map(() => item);
}

export const WEEKDAY_NAMES = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;
