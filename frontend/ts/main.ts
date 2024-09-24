import { fetchUser } from "./api";
import { generateCommandSequence, ScriptType } from "./commits";
import { buildElement } from "./domkraft";
import { buildDownloadLink, buildGrid, buildPalette, buildScaler } from "./widgets";

main();

function main() {
	let pending = false;
	const form = document.querySelector("#form-username");
	form?.addEventListener("submit", (event) => {
		event.preventDefault();
		if (pending) return;
		pending = true;
		onFetchRequested().then(() => pending = false);
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

	const links: Record<ScriptType, null | ReturnType<typeof buildDownloadLink>> = {
		sh: null,
		bat: null
	};

	const resetButton = buildElement({
		elementName: "button",
		textContent: "reset",
		events: {
			"click": () => grid.reset()
		}
	});
	const generateButton = buildElement({
		elementName: "button",
		textContent: "generate",
		events: {
			"click": () => {
				const commits = grid.getLevels().filter(c => c.commitCount > 0);
				const commitsTotal = commits.reduce((p, c) => p + c.commitCount, 0);
				(["bat", "sh"] as ScriptType[])
					.forEach(type => {
						const script = generateCommandSequence(type, commits)
						links[type]?.destroy()
						links[type] = buildDownloadLink(script, `commits.${type}`, `save .${type} (${commitsTotal} commits)`);
						controls?.append(links[type].element);
					});
			}
		}
	})
	const buttonRow = buildElement({
		elementName: "div",
		className: "container row wide center-contents",
		children: [resetButton.element, generateButton.element]
	})

	controls?.append(palette.element);
	controls?.append(scaler.element);
	controls?.append(buttonRow.element);
}
