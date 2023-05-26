import type { NextApiRequest, NextApiResponse } from "next";
// auth0
import { getSession, Session, withApiAuthRequired } from "@auth0/nextjs-auth0";
// mongo
import clientPromise from "@/lib/mongodb";

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

	try {
		// auth0
		const session = await getSession(req, res);
		const { user } = session as Session;
		// db
		const client = await clientPromise;
		const db = client.db("Blog");
		const userProfile = await db.collection("users").updateOne(
			{
				auth0Id: user.sub,
			},
			{
				$inc: {
					availableTokens: 10,
				},
				$setOnInsert: {
					auth0Id: user.sub,
				},
			},
			{
				upsert: true,
			}
		);

		return res.status(200).json({
			code: 0,
		});
	} catch (error) {
		console.log("error: ", error);
		return res.status(400);
	}
};

export default withApiAuthRequired(handler);
