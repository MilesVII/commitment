import { mudcrack } from "rampike";
import { fetchUser } from "./api";
import { generateCommandSequence, ScriptType } from "./commits";
import { buildDownloadLink, buildGrid, buildPalette, buildScaler } from "./widgets";

main();

function main() {
	let pending = false;
	const form = document.querySelector("#form-username")!;
	form.addEventListener("submit", event => {
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

	const controls = document.querySelector("#controls-container")!;
	controls.innerHTML = "";
	
	const canvasContainer = document.querySelector("#canvas-container");
	canvasContainer!.innerHTML = "";
	canvasContainer?.append(grid.grid);
	
	const palette = buildPalette();
	const updateScale = (scale: number) => {
		grid.grid.style.setProperty("--cell-size", `${scale * 70}px`);
	};
	const scaler = buildScaler(updateScale);

	const links: Record<ScriptType, null | ReturnType<typeof buildDownloadLink>> = {
		sh: null,
		bat: null
	};

	const resetButton = mudcrack({
		tagName: "button",
		contents: "reset",
		events: {
			"click": () => grid.reset()
		}
	});
	const generateButton = mudcrack({
		tagName: "button",
		contents: "generate",
		events: {
			"click": () => {
				const commits = grid.getLevels().filter(c => c.commitCount > 0);
				const commitsTotal = commits.reduce((p, c) => p + c.commitCount, 0);
				(["bat", "sh"] as ScriptType[])
					.forEach(type => {
						const script = generateCommandSequence(type, commits)
						links[type]?.destroy()
						links[type] = buildDownloadLink(script, `commits.${type}`, `save .${type} (${commitsTotal} commits)`);
						controls.append(links[type].link);
					});
			}
		}
	});
	const buttonRow = mudcrack({
		tagName: "div",
		className: "container row wide center-contents",
		contents: [resetButton, generateButton]
	});

	controls.append(palette, scaler, buttonRow);
}
