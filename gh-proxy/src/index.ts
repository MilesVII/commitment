export default {
	async fetch(request, env, ctx): Promise<Response> {
		const corsHeaders = {
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS",
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

		const username = request.url.split("?name=")[1];
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
			const cells: { date: string, level: string }[] = [];

			const cellHandler = {
				element: (e: Element) => {
					const date = e.getAttribute("data-date");
					const level = e.getAttribute("data-level");
					if (date === null || level === null) return;

					cells.push({ date, level });
				}
			}
			
			const rewriter = new HTMLRewriter();

			rewriter.on("td", cellHandler);

			await rewriter.transform(ghPage).text();

			return new Response(JSON.stringify(cells), {
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


	},
} satisfies ExportedHandler<Env>;
