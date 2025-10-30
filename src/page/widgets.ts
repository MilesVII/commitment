import { mudcrack, rampike } from "rampike";
import type { APICellData, CellColor } from "./api";
import { requiredCommitCount } from "./commits";
import { range, repeat, WEEKDAY_NAMES } from "./utils";

const globalState = {
	selectedColor: 0 as CellColor,
	username: null as (null | string)
}

export function buildPalette() {
	function buildColorOption(color: CellColor, onSelect: () => void) {
		return rampike(
			mudcrack({
				tagName: "div",
				className: "palette-option",
				style: {
					backgroundColor: getCssColor(color)
				},
				events: {
					"click": () => onSelect()
				}
			}),
			null,
			(_, root) => {
				if (color === globalState.selectedColor)
					root.classList.add("selected");
				else
					root.classList.remove("selected");
			}
		);
	}

	const options =
		(range(0, 5) as CellColor[])
		.map((optionColor) =>
			buildColorOption(
				optionColor,
				() => {
					globalState.selectedColor = optionColor;
					options.forEach(o => o.rampike.render());
				}
			)
		);

	return mudcrack({
		className: "palette",
		contents: options
	});
}

export function buildScaler(updateScale: (scale: number) => void) {
	return mudcrack({
		tagName: "input",
		attributes: {
			type: "range",
			id: "cell-scale",
			min: "10",
			max: "700",
			value: "100"
		},
		style: {
			width: "70%"
		},
		events: {
			input: (e) => {
				const scale: number = (e.target as any).value / 700;
				updateScale(scale);
			}
		}
	})
}

export function buildGrid(pads: number, cellData: APICellData[]) {
	const deadCells = repeat(pads, null).map(
		() => ({
			cell: mudcrack({
				tagName: "div",
				className: "canvas-grid-cell",
				style: {
					visibility: "hidden"
				}
			})
		})
	);
	const liveCells = cellData.map(buildCell);
	const gridContents = [
		...deadCells,
		...liveCells
	];

	const grid = mudcrack({
		tagName: "div",
		className: "canvas-grid",
		contents: gridContents.map(({ cell }) => cell)
	});

	return {
		grid,
		reset: () => liveCells.forEach(cell => cell.reset()),
		getLevels: () =>
			liveCells.map(({ cell, date }) => ({
				commitCount: requiredCommitCount(cell.rampike.params.minColor, cell.rampike.params.color),
				date
			}))
	}
}

export function buildCell(data: APICellData) {
	const minColor = data.cellColor;
	let state = {
		color: minColor,
		minColor
	};
	let update = () => {};
	const cell =
		rampike(
			mudcrack({
				tagName: "div",
				className: "canvas-grid-cell",
				attributes: {
					title: `${data.dateOriginal}: ${WEEKDAY_NAMES[data.weekday]}`
				},
				events: {
					pointerdown: () => {
						state.color = Math.max(
							minColor,
							globalState.selectedColor
						) as CellColor;
		
						update();
					},
					pointerenter: (e) => {
						if ((e as PointerEvent).buttons <= 0) return;
		
						state.color = Math.max(
							minColor,
							globalState.selectedColor
						) as CellColor;
		
						update();
					}
				}
			}),
			state,
			(state, root) => {
				root.style.backgroundColor = getCssColor(state.color);
			}
		);
	update = cell.rampike.render;

	return {
		cell,
		reset: () => {
			state.color = minColor;
			update();
		},
		date: data.dateOriginal
	}
}

export function buildDownloadLink(contents: string, filename: string, caption: string) {
	const blob = new Blob([contents], { type: 'text/plain' });
	const url = URL.createObjectURL(blob);

	const link = mudcrack({
		tagName: "a",
		contents: caption,
		attributes: {
			href: url,
			download: filename
		}
	});

	return {
		link,
		destroy: () => {
			link.remove();
			URL.revokeObjectURL(url);
		}
	};
}

function getCssColor(color: CellColor) {
	return `var(--color-gh-${color})`;
}
