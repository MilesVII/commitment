import type { APICellData, CellColor } from "./api";
import { requiredCommitCount } from "./commits";
import { buildElement } from "./domkraft";
import { range, repeat, WEEKDAY_NAMES } from "./utils";

const globalState = {
	selectedColor: 0 as CellColor,
	username: null as (null | string)
}

export function buildPalette() {
	function buildColorOption(color: CellColor, onSelect: (element: HTMLElement) => void) {
		return buildElement({
			className: "palette-option",
			style: {
				backgroundColor: getCssColor(color)
			},
			events: {
				click: (_e, el) => onSelect(el)
			},
			update: (element, state) => {
				if (color === globalState.selectedColor)
					element.classList.add("selected");
				else
					element.classList.remove("selected");
			},
			prefireUpdate: true
		});
	}

	const options =
		(range(0, 5)  as CellColor[])
		.map((optionColor) =>
			buildColorOption(
				optionColor,
				(element) => {
					globalState.selectedColor = optionColor;
					options.forEach(o => o.update());

				}
			)
		);

	return buildElement({
		className: "palette",
		children: options.map(o => o.element)
	});
}

export function buildScaler(updateScale: (scale: number) => void) {
	return buildElement({
		elementName: "input",
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
	});
}

export function buildGrid(pads: number, cellData: APICellData[]) {
	const deadCells = repeat(pads, null).map(
		() => buildElement({
			elementName: "div",
			className: "canvas-grid-cell",
			style: {
				visibility: "hidden"
			}
		})
	);
	const liveCells = cellData.map(buildCell);
	const gridContents = [
		...deadCells,
		...liveCells
	];

	const grid = buildElement({
		elementName: "div",
		className: "canvas-grid",
		children: gridContents.map(c => c.element)
	});

	return {
		...grid,
		reset: () => liveCells.forEach(cell => cell.reset()),
		getLevels: () =>
			liveCells.map(cell => ({
				commitCount: requiredCommitCount(cell.state!.minColor, cell.state!.color),
				date: cell.date
			}))
	}
}

export function buildCell(data: APICellData) {
	const cell = buildElement({
		elementName: "div",
		className: "canvas-grid-cell",
		attributes: {
			title: `${data.dateOriginal}: ${WEEKDAY_NAMES[data.weekday]}`
		},
		state: {
			minColor: data.cellColor,
			color: data.cellColor,
		},
		events: {
			pointerdown: (_e, _el, state, update) => {
				state!.color = Math.max(
					state!.minColor,
					globalState.selectedColor
				) as CellColor;

				update!();
			},
			pointerenter: (e, _el, state, update) => {
				if ((e as PointerEvent).buttons <= 0) return;

				state!.color = Math.max(
					state!.minColor,
					globalState.selectedColor
				) as CellColor;

				update!();
			}
		},
		update(el, state) {
			el.style.backgroundColor = getCssColor(state!.color);
		},
		prefireUpdate: true
	});

	return {
		...cell,
		reset: () => {
			cell.state!.color = cell.state!.minColor;
			cell.update();
		},
		date: data.dateOriginal
	}
}

export function buildDownloadLink(contents: string, filename: string, caption: string) {
	const blob = new Blob([contents], { type: 'text/plain' });
	const url = URL.createObjectURL(blob);

	const link = buildElement({
		elementName: "a",
		textContent: caption,
		prefire: (el) => {
			el.href = url;
			el.download = filename;
		}
	});

	return {
		...link,
		destroy: () => {
			link.element.remove();
			URL.revokeObjectURL(url);
		}
	};
}

function getCssColor(color: CellColor) {
	return `var(--color-gh-${color})`;
}
