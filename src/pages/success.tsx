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
		<div className="w-full h-full flex flex-col overflow-auto">
			<div className="m-auto w-full max-w-screen-sm bg-slate-100 p-4 rounded-md shadow-xl border border-slate-200 shadow-slate-200">
				<label className="block my-2 text-center">
					<strong>Thank you for your purchase!</strong>
				</label>
			</div>
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
