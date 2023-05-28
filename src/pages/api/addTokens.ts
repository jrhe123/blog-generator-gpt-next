import type { NextApiRequest, NextApiResponse } from "next";
// auth0
import { getSession, Session, withApiAuthRequired } from "@auth0/nextjs-auth0";
// stripe
import stripeInit from "stripe";

const stripe = new stripeInit(process.env.STRIPE_SECRET_KEY + "", {
	apiVersion: "2022-11-15",
});

type APIResponse = {
	code: number;
	message?: string;
	session?: stripeInit.Response<stripeInit.Checkout.Session>;
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
		// stripe
		const lineItems = [
			{
				price: process.env.STRIPE_PRODUCT_PRICE_ID,
				quantity: 1,
			},
		];
		const protocol =
			process.env.NODE_ENV === "development" ? "http://" : "https://";
		const host = req.headers.host;
		const checkoutSession = await stripe.checkout.sessions.create({
			line_items: lineItems,
			mode: "payment",
			success_url: `${protocol}${host}/success`,
			payment_intent_data: {
				metadata: {
					sub: user.sub,
				},
			},
			metadata: {
				sub: user.sub,
			},
		});
		return res.status(200).json({
			code: 0,
			session: checkoutSession,
		});
	} catch (error) {
		console.log("error: ", error);
		return res.status(400);
	}
};

export default withApiAuthRequired(handler);
