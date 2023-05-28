import type { GetServerSideProps, NextPage } from "next";
import { ReactNode, useContext, useState } from "react";
import { Session, getSession, withPageAuthRequired } from "@auth0/nextjs-auth0";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHashtag } from "@fortawesome/free-solid-svg-icons";
// layout
import { AppLayout } from "../../components/layout";
// db
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import getAppProps from "@/utils/getAppProps";
// router
import { useRouter } from "next/router";
//
import PostsContext from "@/context/postsContext";

interface IPostDetailProps {
	postId: string;
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
	const router = useRouter();
	const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
	const { deletePost } = useContext(PostsContext);

	const handleDeleteConfirm = async (
		e: React.MouseEvent<HTMLElement, MouseEvent>
	) => {
		e.preventDefault();
		try {
			const response = await fetch(`/api/deletePost`, {
				method: "POST",
				headers: {
					"content-type": "application/json",
				},
				body: JSON.stringify({
					postId: props.postId,
				}),
			});
			const jsonResponse: {
				code: number;
			} = await response.json();
			if (jsonResponse.code === 0) {
				deletePost(props.postId);
				router.replace("/post/new");
			}
		} catch (error) {}
	};

	return (
		<div className="overflow-auto h-full">
			<div className="max-w-screen-sm mx-auto">
				{/* seo & meta desc */}
				<div className="text-sm rounded-sm font-bold mt-6 p-2 bg-stone-200">
					SEO title & meta description
				</div>
				<div className="p-4 my-2 rounded-md border border-stone-200">
					<div className="text-blue-600 text-2xl font-bold">{props.title}</div>
					<div className="mt-2">{props.metaDescription}</div>
				</div>
				{/* keywords */}
				<div className="text-sm rounded-sm font-bold mt-6 p-2 bg-stone-200">
					Keywords
				</div>
				<div className="flex flex-wrap pt-2 gap-1">
					{props.keywords.split(",").map((keyword, i) => (
						<div key={i} className="p-2 rounded-full text-white bg-slate-800">
							<FontAwesomeIcon icon={faHashtag} />
							{keyword}
						</div>
					))}
				</div>
				{/* content */}
				<div className="text-sm rounded-sm font-bold mt-6 p-2 bg-stone-200">
					Blog post
				</div>
				<div
					className="max-w-screen-sm p-10"
					dangerouslySetInnerHTML={{
						__html: props.postContent || "",
					}}
				/>
				<div className="my-4">
					{!showDeleteConfirm && (
						<button
							onClick={() => setShowDeleteConfirm(true)}
							className="btn bg-red-600 hover:bg-red-700"
						>
							Delete post
						</button>
					)}
					{showDeleteConfirm && (
						<div className="p-2 bg-red-300 text-center">
							<p>Are you sure want to delete this post?</p>
							<div className="grid grid-cols-2 gap-2">
								<button
									onClick={() => setShowDeleteConfirm(false)}
									className="btn bg-stone-600 hover:bg-stone-700"
								>
									cancel
								</button>
								<button
									onClick={handleDeleteConfirm}
									className="btn bg-red-600 hover:bg-red-700"
								>
									confirm delete
								</button>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

PostDetail.getLayout = function getLayout(page, pageProps) {
	return <AppLayout {...pageProps}>{page}</AppLayout>;
};

export const getServerSideProps: GetServerSideProps = withPageAuthRequired({
	getServerSideProps: async (ctx) => {
		const props = await getAppProps(ctx);
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
				postId: ctx.params?.postId,
				postContent: post.postContent,
				title: post.title,
				metaDescription: post.metaDescription,
				keywords: post.keywords,
				topic: post.topic,
				created: post.created.toString(),
				...props,
			},
		};
	},
});

export default PostDetail;
