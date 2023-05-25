import type { GetServerSideProps, NextPage } from "next";
import { ReactNode } from "react";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";
// layout
import { AppLayout } from "../../components/layout";

interface INewPostProps {}

type NextPageWithLayout = NextPage<INewPostProps> & {
	getLayout?: (page: ReactNode, pageProps: any) => ReactNode;
};

const NewPost: NextPageWithLayout = (props) => {
	console.log("props: ", props);
	return <div>NewPost</div>;
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
