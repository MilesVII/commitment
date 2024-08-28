import { buildElement } from "./domkraft";
import { range } from "./utils";

type CellColor = 0 | 1 | 2 | 3 | 4;

const globalState = {
	selectedColor: 0 as CellColor
}

main();

function main() {
	const palette = buildPalette();
	const canvas = buildGrid();
	const updateScale = (scale: number) => {
		canvas.style.setProperty("--cell-size", `${scale * 70}px`);
	}
	const scaler = buildScaler(updateScale);
	
	document.body.append(palette);
	document.body.append(scaler);
	document.querySelector("#canvas-container")?.append(canvas);
};

function buildPalette() {
	function buildColorOption(color: CellColor, onSelect: (color: CellColor, element: HTMLElement) => void) {
		return buildElement({
			className: "palette-option",
			style: {
				backgroundColor: getCssColor(color)
			},
			prefire: (el) => {
				if (globalState.selectedColor === color)
					el.classList.add("selected");
			},
			events: {
				click: (_e, el) => onSelect(color, el)
			}
		});
	}

	const options = range(0, 5).map(color => buildColorOption(color as CellColor, (color, element) => {
		options.forEach(o => o.classList.remove("selected"));
		element.classList.add("selected");
		globalState.selectedColor = color;
	}));
	return buildElement({
		className: "palette",
		children: options
	});
}

function buildScaler(updateScale: (scale: number) => void) {
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

function buildGrid() {
	const gridContents = range(0, 370).map(index =>
		buildCell()
	);

	return buildElement({
		elementName: "div",
		className: "canvas-grid",
		children: gridContents
	});
}

function buildCell() {
	return buildElement({
		elementName: "div",
		className: "canvas-grid-cell",
		state: {
			color: 0 as CellColor,
		},
		events: {
			pointerdown: (_e, _el, state, update) => {
				state!.color = globalState.selectedColor;

				update!();
			},
			pointerenter: (e, _el, state, update) => {
				if ((e as PointerEvent).buttons <= 0) return;

				state!.color = globalState.selectedColor;

				update!();
			}
		},
		update(el, state) {
			el.style.backgroundColor = getCssColor(state!.color);
		}
	});
}

function getCssColor(color: CellColor) {
	return `var(--color-gh-${color})`;
}