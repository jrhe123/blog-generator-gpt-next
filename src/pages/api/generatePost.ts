import { withApiAuthRequired, getSession, Session } from "@auth0/nextjs-auth0";
import type { NextApiRequest, NextApiResponse } from "next";
// openAI
import { Configuration, OpenAIApi } from "openai";
// mongo
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

type APIResponse = {
	code: number;
	post?: IPost;
	postId?: ObjectId;
	message?: string;
};
type IPost = {
	postContent: string;
	title: string;
	metaDescription: string;
	topic?: string;
	keywords?: string;
	userId: ObjectId;
	created: Date;
};
// https://stackoverflow.com/questions/70029584/casting-mongodb-document-to-typescript-interface
type IUser = {
	auth0Id: string;
	availableTokens: number;
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
		cached = true,
	}: { topic: string; keywords: string; cached: boolean } = req.body;

	try {
		// auth0
		const session = await getSession(req, res);
		const { user } = session as Session;
		// db
		const client = await clientPromise;
		const db = client.db("Blog");
		const userProfile = await db.collection<IUser>("users").findOne({
			auth0Id: user.sub,
		});
		if (!userProfile?.availableTokens) {
			return res.status(403);
		}
		//
		if (cached) {
			return res.status(200).json({
				code: 0,
				post: {
					postContent:
						"<p><strong>Nasdaq</strong>: Get the Latest Info on Top U.S. Stocks and Their Monthly Dividends</p><p>Gain insight on the top-gaining and top-losing stocks on Nasdaq. Knowing the stocks that are gaining and losing can help you make informed and profitable decisions. That's why Nasdaq provides a wealth of information on U.S. stocks, from trading activities to company profiles and even monthly dividend information. Nasdaq is your go-to resource for all the information you need to stay on top of the stock market.</p><p>The Nasdaq exchange is home to the majority of top U.S. stocks, both blue-chip stalwarts and smaller companies. Nasdaq offers details on each stock's monthly dividend yields, current market prices, trading volume, and other pertinent information. This sneak peak helps investors spot the top-gaining stocks in terms of price and dividends so they can make informed investment decisions.</p><p>Nasdaq provides detailed insight on the performance of U.S. stocks, which helps investors stay informed and make the most of their investments. With Nasdaq, you can identify the top-gaining and top-losing stocks with their monthly dividend yields, allowing for an easy way to reach your financial goals. Make Nasdaq your go-to source for all the latest stock market news.</p>",
					title:
						"Nasdaq: Get the Latest Info on Top U.S. Stocks and Their Monthly Dividends",
					metaDescription:
						"Gain insight on the top-gaining and top-losers stocks on Nasdaq and stay informed about the performance of U.S. stocks with monthly dividend yields. Nasdaq is your go-to source of information for all the latest stock market news.",
					topic,
					keywords,
					userId: userProfile._id,
					created: new Date(),
				},
			});
		}
		const config = new Configuration({
			apiKey: process.env.OPENAI_API_KEY,
		});
		const openAIApi = new OpenAIApi(config);

		// keywords: top-gainers, top-losers, top U.S. stocks, monthly dividends
		// const prompt =
		// 	`Write a short SEO-friendly blog post about ${topic} ` +
		// 	`that targets the following comma-separated keywords: ${keywords}. ` +
		// 	`The content should be formatted in SEO-friendly HTML, ` +
		// 	`the response must also include appropriate HTML title and meta description content. ` +
		// 	`The return format must be stringified JSON in the following format:
		//   {
		//     "postContent": post content here
		//     "title": title goes here
		//     "metaDescription": meta description goes here
		//   }`;
		// const response = await openAIApi.createCompletion({
		// 	model: "text-davinci-003",
		// 	temperature: 1,
		// 	max_tokens: 500,
		// 	prompt,
		// });

		const prompt =
			`Write a short SEO-friendly blog post about ${topic} ` +
			`that targets the following comma-separated keywords: ${keywords}. ` +
			`The content should be formatted in SEO-friendly HTML, ` +
			`limited to the following HTML tags: p, h1, h2, h3, h4, h5, h6, strong, li, ol, ul, i`;
		const postContentResponse = await openAIApi.createChatCompletion({
			model: "gpt-3.5-turbo",
			temperature: 1,
			max_tokens: 500,
			messages: [
				{
					role: "system",
					content: "You are a blog post generator",
				},
				{
					role: "user",
					content: prompt,
				},
			],
		});
		const postContent = postContentResponse.data.choices[0].message?.content;
		const titleContentResponse = await openAIApi.createChatCompletion({
			model: "gpt-3.5-turbo",
			temperature: 1,
			max_tokens: 40,
			messages: [
				{
					role: "system",
					content: "You are a blog post generator",
				},
				{
					role: "user",
					content: prompt,
				},
				{
					role: "assistant",
					content: postContent || "",
				},
				{
					role: "user",
					content:
						"Generate appropriate title tag text for the above blog post",
				},
			],
		});
		const titleContent = titleContentResponse.data.choices[0].message?.content;
		const metaDescriptionContentResponse = await openAIApi.createChatCompletion(
			{
				model: "gpt-3.5-turbo",
				temperature: 1,
				max_tokens: 60,
				messages: [
					{
						role: "system",
						content: "You are a blog post generator",
					},
					{
						role: "user",
						content: prompt,
					},
					{
						role: "assistant",
						content: postContent || "",
					},
					{
						role: "user",
						content:
							"Generate appropriate title tag text for the above blog post",
					},
					{
						role: "assistant",
						content: titleContent || "",
					},
					{
						role: "user",
						content:
							"Generate SEO-friendly meta description for the above blog post",
					},
				],
			}
		);
		const metaDescriptionContent =
			metaDescriptionContentResponse.data.choices[0].message?.content;

		// if (!response.data.choices.length || !response.data.choices[0].text) {
		// 	return res.status(422).json({ code: -1, message: "No result" });
		// }

		// response
		// let text = response.data.choices[0].text;
		// let text = response.data.choices[0].message.content;
		// const indexOfBegin = text.indexOf("{");
		// text = text.substr(indexOfBegin);
		// const parsedData: IPost = JSON.parse(text.split("\n").join(""));

		// db
		await db.collection<IUser>("users").updateOne(
			{
				auth0Id: user.sub,
			},
			{
				$inc: {
					availableTokens: -1,
				},
			}
		);
		const result = {
			postContent: postContent || "",
			title: titleContent || "",
			metaDescription: metaDescriptionContent || "",
			topic,
			keywords,
			userId: userProfile._id,
			created: new Date(),
		};
		const post = await db.collection<IPost>("posts").insertOne(result);
		return res.status(200).json({
			code: 0,
			// post: result,
			postId: post.insertedId,
		});
	} catch (error) {
		console.log("error: ", error);
		return res.status(400);
	}
};

export default withApiAuthRequired(handler);
