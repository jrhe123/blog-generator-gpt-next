import type { GetServerSideProps, NextPage } from "next";
import { ReactNode, useState } from "react";
import { Session, getSession, withPageAuthRequired } from "@auth0/nextjs-auth0";
// layout
import { AppLayout } from "../../components/layout";
// db
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

interface IPostDetailProps {
	postContent: string;
	title: string;
	metaDescription: string;
	keywords: string;
	topic: string;
}

type NextPageWithLayout = NextPage<IPostDetailProps> & {
	getLayout?: (page: ReactNode, pageProps: any) => ReactNode;
};

const PostDetail: NextPageWithLayout = (props) => {
	console.log("props: ", props);
	return <main>PostDetail</main>;
};

PostDetail.getLayout = function getLayout(page, pageProps) {
	return <AppLayout {...pageProps}>{page}</AppLayout>;
};

export const getServerSideProps: GetServerSideProps = withPageAuthRequired({
	getServerSideProps: async (ctx) => {
		const session = await getSession(ctx.req, ctx.res);
		const { user } = session as Session;
		const client = await clientPromise;
		const db = client.db("Blog");
		const userProfile = await db.collection("users").findOne({
			auth0Id: user.sub,
		});
		const post = await db.collection("posts").findOne({
			_id: new ObjectId(ctx.params?.postId + ""),
			userId: userProfile?._id,
		});
		if (!post) {
			return {
				redirect: {
					destination: "/post/new",
					permanent: false,
				},
			};
		}
		return {
			props: {
				postContent: post.postContent,
				title: post.title,
				metaDescription: post.metaDescription,
				keywords: post.keywords,
				topic: post.topic,
			},
		};
	},
});

export default PostDetail;
