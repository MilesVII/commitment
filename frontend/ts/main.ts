import { type APICellData, type CellColor, fetchUser } from "./api";
import { buildElement } from "./domkraft";
import { range, repeat, WEEKDAY_NAMES } from "./utils";

const globalState = {
	selectedColor: 0 as CellColor,
	username: null as (null | string)
}

main();

function main() {	
	document.querySelector("#form-username")?.addEventListener("submit", (event) => {
		event.preventDefault();
		onFetchRequested();
	});
};

async function onFetchRequested() {
	const username = document.querySelector<HTMLInputElement>("#field-username");
	if (!username?.value) return;
	const contributions = await fetchUser(username.value);
	
	if (!contributions) return;
	
	const pads = contributions[0]?.weekday ?? 0;
	const grid = buildGrid(pads, contributions);

	const controls = document.querySelector("#controls-container");
	controls!.innerHTML = "";
	
	const canvasContainer = document.querySelector("#canvas-container");
	canvasContainer!.innerHTML = "";
	canvasContainer?.append(grid.element);
	
	const palette = buildPalette();
	const updateScale = (scale: number) => {
		grid.element.style.setProperty("--cell-size", `${scale * 70}px`);
	}
	const scaler = buildScaler(updateScale);

	const resetButton = buildElement({
		elementName: "button",
		textContent: "reset",
		events: {
			"click": () => grid.reset()
		}
	});

	controls?.append(palette.element);
	controls?.append(scaler.element);
	controls?.append(resetButton.element);
}

function buildPalette() {
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

function buildGrid(pads: number, cellData: APICellData[]) {
	const gridContents = [
		...repeat(pads, null),
		...cellData
	].map(buildCell);

	const grid = buildElement({
		elementName: "div",
		className: "canvas-grid",
		children: gridContents.map(c => c.element)
	});

	return {
		...grid,
		reset: () => gridContents.forEach(cell => cell && cell.reset())
	}
}

function buildCell(data: APICellData | null) {
	if (!data)
		return {
			...buildElement({
				elementName: "div",
				className: "canvas-grid-cell",
				style: {
					visibility: "hidden"
				}
			}),
			reset: () => {}
		};

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
		}
	}
}

function getCssColor(color: CellColor) {
	return `var(--color-gh-${color})`;
}