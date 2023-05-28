import { withApiAuthRequired, getSession, Session } from "@auth0/nextjs-auth0";
import type { NextApiRequest, NextApiResponse } from "next";
// mongo
import clientPromise from "@/lib/mongodb";

type IPost = {
	_id: string;
	postContent: string;
	title: string;
	metaDescription: string;
	topic?: string;
	keywords?: string;
	created: string;
};
type IUser = {
	auth0Id: string;
	availableTokens: number;
};

type APIResponse = {
	code: number;
	posts?: IPost[];
	message?: string;
};

const handler = async (
	req: NextApiRequest,
	res: NextApiResponse<APIResponse>
) => {
	if (req.method !== "POST")
		return res.status(405).json({ code: -1, message: "Method Not Allowed" });

	const { lastPostDate } = req.body;
	if (!lastPostDate) {
		return res.status(422);
	}

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

		const posts = await db
			.collection("posts")
			.find({
				userId: userProfile?._id,
				created: {
					$lt: new Date(lastPostDate),
				},
			})
			.limit(5)
			.sort({
				created: -1,
			})
			.toArray();

		return res.status(200).json({
			code: 0,
			posts: posts.map(
				({
					_id,
					created,
					postContent,
					title,
					metaDescription,
					topic,
					keywords,
				}) => ({
					_id: _id.toString(),
					created: created.toString(),
					postContent,
					title,
					metaDescription,
					topic,
					keywords,
				})
			),
		});
	} catch (error) {
		console.log("error: ", error);
		return res.status(400);
	}
};

export default withApiAuthRequired(handler);
