import type { NextApiRequest, NextApiResponse } from "next";
import type { RequestHandler } from "next/dist/server/next";
// stripe
import Cors from "micro-cors";
import stripeInit from "stripe";
// mongo
import clientPromise from "@/lib/mongodb";

const cors = Cors({
	allowMethods: ["POST", "HEAD"],
});
const stripe = new stripeInit(process.env.STRIPE_SECRET_KEY + "", {
	apiVersion: "2022-11-15",
});
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

/**
 * @webdeveducation/next-verify-stripe
 * verify stripe webhook response
 * @param param0
 * @returns
 */
const verifyStripe = async ({
	req,
	stripe,
	endpointSecret,
}: {
	req: NextApiRequest;
	stripe: stripeInit;
	endpointSecret: string;
}) => {
	const buffer = async (readable: any) => {
		const chunks = [];
		for await (const chunk of readable) {
			chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
		}
		return Buffer.concat(chunks);
	};
	const buf = await buffer(req);
	const sig = req.headers["stripe-signature"];
	const event = stripe.webhooks.constructEvent(
		buf.toString() as string | Buffer,
		sig as string | Buffer | Array<string>,
		endpointSecret as string
	);
	return event;
};

export const config = {
	api: {
		bodyParser: false,
	},
};

type APIResponse = {
	receive: boolean;
};
type IMetadata = {
	sub: string;
};
type IPaymentItent = {
	metadata: IMetadata;
};

const handler = async (
	req: NextApiRequest,
	res: NextApiResponse<APIResponse>
) => {
	if (req.method === "POST") {
		let event: stripeInit.Event;
		try {
			event = await verifyStripe({ req, stripe, endpointSecret });
		} catch (error) {
			return res.status(400);
		}

		switch (event.type) {
			case "payment_intent.succeeded":
				// contains the user info
				const paymentIntent = event.data.object as IPaymentItent;
				// db
				const client = await clientPromise;
				const db = client.db("Blog");
				const userProfile = await db.collection("users").updateOne(
					{
						auth0Id: paymentIntent.metadata.sub,
					},
					{
						$inc: {
							availableTokens: 10,
						},
						$setOnInsert: {
							auth0Id: paymentIntent.metadata.sub,
						},
					},
					{
						upsert: true,
					}
				);
				break;
			default:
				console.log("UNHANDLED_EVENTS: ", event.type);
		}
		return res.status(200).json({
			receive: true,
		});
	}
};

export default cors(handler as RequestHandler);
