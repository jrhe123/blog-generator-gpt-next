import type { GetServerSideProps, NextPage } from "next";
import { ReactNode } from "react";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";
// layout
import { AppLayout } from "../components/layout";
import getAppProps from "@/utils/getAppProps";

interface ITokenTopupProps {}

type NextPageWithLayout = NextPage<ITokenTopupProps> & {
	getLayout?: (page: ReactNode, pageProps: any) => ReactNode;
};

const TokenTopup: NextPageWithLayout = (props) => {
	const handleAddToken = async (
		e: React.MouseEvent<HTMLElement, MouseEvent>
	) => {
		e.preventDefault();
		const response = await fetch(`/api/addTokens`, {
			method: "POST",
			headers: {
				"content-type": "application/json",
			},
			body: JSON.stringify({}),
		});
		const jsonResponse: {
			code: number;
			session: {
				url: string;
			};
		} = await response.json();
		if (jsonResponse.code === 0 && jsonResponse.session.url) {
			window.location.href = jsonResponse.session.url;
		}
	};

	return (
		<div className="w-full h-full flex flex-col overflow-auto">
			<div className="m-auto w-full max-w-screen-sm bg-slate-100 p-4 rounded-md shadow-xl border border-slate-200 shadow-slate-200">
				<label className="block my-2">
					<strong>Topup token</strong>
				</label>
				<button className="btn" onClick={handleAddToken}>
					Add tokens
				</button>
			</div>
		</div>
	);
};

TokenTopup.getLayout = function getLayout(page, pageProps) {
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

export default TokenTopup;
