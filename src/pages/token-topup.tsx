import type { GetServerSideProps, NextPage } from "next";
import { ReactNode } from "react";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";
// layout
import { AppLayout } from "../components/layout";

interface ITokenTopupProps {}

type NextPageWithLayout = NextPage<ITokenTopupProps> & {
	getLayout?: (page: ReactNode, pageProps: any) => ReactNode;
};

const TokenTopup: NextPageWithLayout = (props) => {
	console.log("props: ", props);
	return <div>TokenTopup</div>;
};

TokenTopup.getLayout = function getLayout(page, pageProps) {
	return <AppLayout {...pageProps}>{page}</AppLayout>;
};

export const getServerSideProps: GetServerSideProps = withPageAuthRequired({
	getServerSideProps: async (ctx) => {
		return {
			props: {},
		};
	},
});

export default TokenTopup;
