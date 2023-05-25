import type { GetServerSideProps, NextPage } from "next";
import { ReactNode, useState } from "react";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";
// layout
import { AppLayout } from "../../components/layout";

interface INewPostProps {}

type NextPageWithLayout = NextPage<INewPostProps> & {
	getLayout?: (page: ReactNode, pageProps: any) => ReactNode;
};

const NewPost: NextPageWithLayout = (props) => {
	const [postContent, setPostContent] = useState<string>("");

	const handleCreatePost = async (
		e: React.MouseEvent<HTMLElement, MouseEvent>
	) => {
		e.preventDefault();
		try {
			const response = await fetch(`/api/generatePost`, {
				method: "POST",
			});
			const jsonResponse: {
				code: number;
				post?: string;
				message?: string;
			} = await response.json();
			console.log("jsonResponse: ", jsonResponse);
		} catch (error) {
			console.log("error: ", error);
		}
	};

	return (
		<div>
			<h1>this is new post page</h1>
			<button className="btn" onClick={handleCreatePost}>
				Genreate
			</button>
			<div
				className="max-w-screen-sm p-10"
				dangerouslySetInnerHTML={{
					__html: postContent,
				}}
			/>
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
