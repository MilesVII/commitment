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
				if ((e as PointerEvent).buttons > 0)
				state!.color = 2;

				update!();
			}
		},
		update(el, state) {
			el.style.backgroundColor = state!.color === 0 ? "transparent" : "var(--color-accent-plus)";
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

function main() {
	document.body.innerHTML = "";

	const canvas = buildGrid();
	document.body.append(canvas);
};

main();