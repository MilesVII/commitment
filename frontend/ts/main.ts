import { buildElement } from "./domkraft";
import { range } from "./utils";

type CellColor = 0 | 1 | 2 | 3 | 4;

function buildCell() {
	return buildElement({
		elementName: "div",
		className: "canvas-grid-cell",
		state: {
			color: 0 as CellColor,
		},
		events: {
			pointerdown: (_e, _el, state, update) => {
				state!.color = 2;

				update!();
			},
			pointerenter: (e, _el, state, update) => {
				if ((e as PointerEvent).buttons <= 0) return;

				state!.color = 4;

				update!();
			}
		},
		update(el, state) {
			el.style.backgroundColor = `var(--color-gh-${state!.color})`;
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

function main() {
	const canvas = buildGrid();
	document.querySelector("#canvas-container")?.append(canvas);

	const updateScale = (scale: number) => {
		canvas.style.setProperty("--cell-size", `${scale * 70}px`);
	}
	const scaler = buildScaler(updateScale);
	document.body.prepend(scaler);
};

main();