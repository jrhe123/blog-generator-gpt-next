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

		console.log("response: ", response);
	};

	return (
		<div>
			<p>token topup</p>
			<button className="btn" onClick={handleAddToken}>
				Add tokens
			</button>
		</div>
	);
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
