export type APICell = {
	date: string,
	level: number,
	count: number
};

function parseContributionCount(tooltip: string): number | null {
	// "3 contributions on October 12th." / "1 contribution on ..." / "No contributions on ..."
	const match = tooltip.trim().match(/^(\d+|No) contributions?\b/);
	if (!match) return null;
	return match[1] === "No" ? 0 : parseInt(match[1], 10);
}

export default {
	async fetch(request, env, ctx): Promise<Response> {
		const corsHeaders = {
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Methods": "POST,OPTIONS",
			"Access-Control-Max-Age": "86400",
		};

		if (request.method === "OPTIONS") {
			return new Response(null, {
				headers: {
					...corsHeaders,
					"Access-Control-Allow-Headers": "*",
				},
			});
		}

		const username = await request.text();
		if (!username) return new Response(null, {
			status: 403,
			headers: corsHeaders
		});

		const url = `https://github.com/${username}?action=show&controller=profiles&tab=contributions&user_id=${username}`;
		const headers = {
			"Accept": "text/html",
			"X-Requested-With": "XMLHttpRequest"
		};
		const ghPage = await fetch(url, { headers });

		if (ghPage.status === 200) {
			// Every day is a <td data-date data-level id="contribution-day-component-X-Y">,
			// its contribution count lives in a separate <tool-tip for="contribution-day-component-X-Y">
			const cells: { id: string | null, date: string, level: number }[] = [];
			const counts = new Map<string, number>();

			const cellHandler = {
				element: (e: Element) => {
					const date = e.getAttribute("data-date");
					const level = e.getAttribute("data-level");
					if (date === null || level === null) return;

					cells.push({ id: e.getAttribute("id"), date, level: parseInt(level, 10) });
				}
			};

			let tooltipFor: string | null = null;
			let tooltipText = "";
			const tooltipHandler = {
				element: (e: Element) => {
					tooltipFor = e.getAttribute("for");
					tooltipText = "";
				},
				text: (t: Text) => {
					if (tooltipFor === null) return;
					tooltipText += t.text;
					if (!t.lastInTextNode) return;

					const count = parseContributionCount(tooltipText);
					if (count !== null) counts.set(tooltipFor, count);
				}
			};

			const rewriter = new HTMLRewriter();

			rewriter.on("td", cellHandler);
			rewriter.on("tool-tip", tooltipHandler);

			await rewriter.transform(ghPage).text();

			const result: APICell[] = cells.map(cell => ({
				date: cell.date,
				level: cell.level,
				// if GitHub changes tooltip markup, fall back to the old guess (level 0 => 0, otherwise unknown)
				count: (cell.id === null ? undefined : counts.get(cell.id)) ?? (cell.level === 0 ? 0 : -1)
			}));

			return new Response(JSON.stringify(result), {
				status: 200,
				headers: {
					"Content-Type": "application/json",
					...corsHeaders
				}
			});
		} else {
			return new Response(await ghPage.text(), {
				status: 502,
				headers: corsHeaders
			});
		}
	}
} satisfies ExportedHandler<Env>;
