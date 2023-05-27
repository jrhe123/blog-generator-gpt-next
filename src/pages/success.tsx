import type { GetServerSideProps, NextPage } from "next";
import { ReactNode } from "react";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";
// layout
import { AppLayout } from "../components/layout";
import getAppProps from "@/utils/getAppProps";

interface ISuccessProps {}

type NextPageWithLayout = NextPage<ISuccessProps> & {
	getLayout?: (page: ReactNode, pageProps: any) => ReactNode;
};

const Success: NextPageWithLayout = (props) => {
	return (
		<div>
			<p>Thank you for your purchase!</p>
		</div>
	);
};

Success.getLayout = function getLayout(page, pageProps) {
	return <AppLayout {...pageProps}>{page}</AppLayout>;
};

export const getServerSideProps: GetServerSideProps = withPageAuthRequired({
	getServerSideProps: async (ctx) => {
		const props = await getAppProps(ctx);
		return {
			props,
		};
	},
});

export default Success;
