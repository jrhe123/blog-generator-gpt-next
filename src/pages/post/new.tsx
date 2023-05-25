import type { GetServerSideProps, NextPage } from "next";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";

interface INewPostProps {}

const NewPost: NextPage<INewPostProps> = (props) => {
	console.log("props: ", props);
	return <main>NewPost</main>;
};

export const getServerSideProps: GetServerSideProps = withPageAuthRequired({
	getServerSideProps: async (ctx) => {
		return {
			props: {},
		};
	},
});

export default NewPost;
