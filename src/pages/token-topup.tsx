import type { GetServerSideProps, NextPage } from "next";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";

interface ITokenTopupProps {}

const TokenTopup: NextPage<ITokenTopupProps> = (props) => {
	console.log("props: ", props);
	return <main>TokenTopup</main>;
};
export const getServerSideProps: GetServerSideProps = withPageAuthRequired({
	getServerSideProps: async (ctx) => {
		return {
			props: {},
		};
	},
});

export default TokenTopup;
