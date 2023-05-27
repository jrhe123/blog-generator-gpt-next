import { GetServerSidePropsContext, PreviewData } from "next";
import { ParsedUrlQuery } from "querystring";
// auth0
import { Session, getSession } from "@auth0/nextjs-auth0";
// db
import clientPromise from "@/lib/mongodb";

const getAppProps = async (
	ctx: GetServerSidePropsContext<ParsedUrlQuery, PreviewData>
) => {
	// auth0
	const session = await getSession(ctx.req, ctx.res);
	const { user } = session as Session;
	// db
	const client = await clientPromise;
	const db = client.db("Blog");
	const userProfile = await db.collection("users").findOne({
		auth0Id: user.sub,
	});

	if (!userProfile) {
		return {
			availableTokens: 0,
			posts: [],
		};
	}

	const posts = await db
		.collection("posts")
		.find({
			userId: userProfile._id,
		})
		.sort({
			created: -1,
		})
		.toArray();

	return {
		availableTokens: userProfile.availableTokens,
		posts: posts.map(({ created, _id, userId, ...rest }) => ({
			_id: _id.toString(),
			created: created.toString(),
			...rest,
		})),
		postId: ctx.params?.postId || null,
	};
};

export default getAppProps;
