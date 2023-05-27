import type { GetServerSideProps, NextPage } from "next";
import { ReactNode, useState } from "react";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import { useRouter } from "next/router";
// layout
import { AppLayout } from "../../components/layout";
import { ObjectId } from "mongodb";

interface INewPostProps {}

type NextPageWithLayout = NextPage<INewPostProps> & {
	getLayout?: (page: ReactNode, pageProps: any) => ReactNode;
};

const NewPost: NextPageWithLayout = (props) => {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [topic, setTopic] = useState<string>("");
	const [keywords, setKeywords] = useState<string>("");
	// const [postContent, setPostContent] = useState<string>("");

	const handleCreatePost = async (e: React.FormEvent) => {
		try {
			e.preventDefault();
			setIsLoading(true);
			const response = await fetch(`/api/generatePost`, {
				method: "POST",
				headers: {
					"content-type": "application/json",
				},
				body: JSON.stringify({
					topic,
					keywords,
					cached: false,
				}),
			});
			const jsonResponse: {
				code: number;
				post?: {
					postContent: string;
					title: string;
					metaDescription: string;
				};
				postId?: ObjectId;
				message?: string;
			} = await response.json();
			if (jsonResponse.code === 0 && jsonResponse.postId) {
				// const post = jsonResponse.post;
				// setPostContent(post?.postContent || "");
				router.push(`/post/${jsonResponse.postId}`);
			}
		} catch (error) {
			console.log("error: ", error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div>
			<form onSubmit={handleCreatePost}>
				<div>
					<label>
						<strong>Generate a blog post on the topic of:</strong>
					</label>
					<textarea
						className="resize-none border border-slate-500 w-full block my-2 px-4 py-2 rounded-sm"
						value={topic}
						onChange={(e) => setTopic(e.target.value)}
					/>
				</div>
				<div>
					<label>
						<strong>Targeting the following keywords:</strong>
					</label>
					<textarea
						className="resize-none border border-slate-500 w-full block my-2 px-4 py-2 rounded-sm"
						value={keywords}
						onChange={(e) => setKeywords(e.target.value)}
					/>
				</div>
				<button
					type="submit"
					className="btn"
					disabled={isLoading || !keywords || !topic}
				>
					Generate
				</button>
			</form>
			{/* <div
				className="max-w-screen-sm p-10"
				dangerouslySetInnerHTML={{
					__html: postContent,
				}}
			/> */}
		</div>
	);
};

NewPost.getLayout = function getLayout(page, pageProps) {
	return <AppLayout {...pageProps}>{page}</AppLayout>;
};

export const getServerSideProps: GetServerSideProps = withPageAuthRequired({
	getServerSideProps: async (ctx) => {
		return {
			props: {},
		};
	},
});

export default NewPost;
