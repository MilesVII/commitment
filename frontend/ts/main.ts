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
		canvas.element.style.setProperty("--cell-size", `${scale * 70}px`);
	}
	const scaler = buildScaler(updateScale);
	
	document.body.append(palette.element);
	document.body.append(scaler.element);
	document.querySelector("#canvas-container")?.append(canvas.element);
};

function buildPalette() {
	function buildColorOption(color: CellColor, onSelect: (element: HTMLElement) => void) {
		return buildElement({
			className: "palette-option",
			style: {
				backgroundColor: getCssColor(color)
			},
			state: {
				selected: false,
				color
			},
			events: {
				click: (_e, el) => onSelect(el)
			},
			update: (element, state) => {
				if (state!.selected)
					element.classList.remove("selected");
				else
					element.classList.add("selected");
			}
		});
	}

	const options =
		(range(0, 5)  as CellColor[])
		.map((optionColor) =>
			buildColorOption(
				optionColor,
				(element) => {
					options.forEach(o => {
						o.state!.selected = optionColor === o.state!.color;
						o.element.classList.remove("selected")
						o.update()
					});

					element.classList.add("selected");
					globalState.selectedColor = optionColor;
				}
			)
		);

	return buildElement({
		className: "palette",
		children: options.map(o => o.element)
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
		children: gridContents.map(c => c.element)
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