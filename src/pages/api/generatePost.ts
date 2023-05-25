import type { NextApiRequest, NextApiResponse } from "next";
// openAI
import { Configuration, OpenAIApi } from "openai";

type APIResponse = {
	code: number;
	post?: string;
	message?: string;
};

const handler = async (
	req: NextApiRequest,
	res: NextApiResponse<APIResponse>
) => {
	if (req.method !== "POST")
		return res.status(405).json({ code: -1, message: "Method Not Allowed" });
	const {
		topic = "Nasdaq",
		keywords = "top-gainers, top-losers, top U.S. stocks, monthly dividends",
	}: { topic: string; keywords: string } = req.body;
	const config = new Configuration({
		apiKey: process.env.OPENAI_API_KEY,
	});
	const openAIApi = new OpenAIApi(config);
	try {
		// keywords: top-gainers, top-losers, top U.S. stocks, monthly dividends
		const prompt =
			`Write a short SEO-friendly blog post about ${topic} ` +
			`that targets the following comma-separated keywords: ${keywords}. ` +
			`The content should be formatted in SEO-friendly HTML, ` +
			`the response must also include appropriate HTML title and meta description content. ` +
			`The return format must be stringified JSON in the following format: 
      {
        "postContent": post content here
        "title": title goes here
        "metaDescription": meta description goes here
      }`;
		const response = await openAIApi.createCompletion({
			model: "text-davinci-003",
			temperature: 1,
			max_tokens: 500,
			prompt,
		});
		if (!response.data.choices.length || !response.data.choices[0].text) {
			return res.status(422).json({ code: -1, message: "No result" });
		}
		// response
		return res.status(200).json({
			code: 0,
			post: response.data.choices[0].text.split("\n").join(""),
		});
	} catch (error) {
		return res.status(400);
	}
};

export default handler;
