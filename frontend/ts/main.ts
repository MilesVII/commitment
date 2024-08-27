import { buildElement } from "./domkraft";
import { range } from "./utils";

type CellColor = 0 | 1 | 2 | 3 | 4;

function buildCell() {
	const update = (element: HTMLElement, cellColor: CellColor) => {
		element.style.backgroundColor = cellColor === 0 ? "transparent" : "var(--color-accent-plus)";
	};
	return buildElement({
		elementName: "div",
		className: "canvas-grid-cell",
		state: {
			color: 0 as CellColor,
		},
	})
}

function buildGrid() {
	const gridContents = range(0, 370).map(index =>
		buildCell()
	);

	return buildElement({
		elementName: "div",
		className: "canvas-grid",
		children: gridContents
	})
}

function main() {
	document.body.innerHTML = "";

	const canvas = buildGrid();
	document.body.append(canvas);
};

main();