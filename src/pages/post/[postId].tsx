import type { GetServerSideProps, NextPage } from "next";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";

interface IPostDetailProps {}

const PostDetail: NextPage<IPostDetailProps> = (props) => {
	console.log("props: ", props);
	return <main>PostDetail</main>;
};

export const getServerSideProps: GetServerSideProps = withPageAuthRequired({
	getServerSideProps: async (ctx) => {
		return {
			props: {},
		};
	},
});

export default PostDetail;
