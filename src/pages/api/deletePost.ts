import { withApiAuthRequired, getSession, Session } from "@auth0/nextjs-auth0";
import type { NextApiRequest, NextApiResponse } from "next";
// mongo
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

type IUser = {
	auth0Id: string;
	availableTokens: number;
};

type APIResponse = {
	code: number;
	message?: string;
};

const handler = async (
	req: NextApiRequest,
	res: NextApiResponse<APIResponse>
) => {
	if (req.method !== "POST")
		return res.status(405).json({ code: -1, message: "Method Not Allowed" });

	const { postId } = req.body;
	if (!postId) {
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

		await db.collection("posts").deleteOne({
			userId: userProfile?._id,
			_id: new ObjectId(postId),
		});

		return res.status(200).json({
			code: 0,
		});
	} catch (error) {
		console.log("error: ", error);
		return res.status(400);
	}
};

export default withApiAuthRequired(handler);
