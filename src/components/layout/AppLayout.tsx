import type { NextPage } from "next";

interface IAppLayoutProps {
	children: React.ReactNode;
}

/**
 * How to setup AppLayout as HOC
 * 1. https://stackoverflow.com/questions/62115518/persistent-layout-in-next-js-with-typescript-and-hoc
 * 2. https://github.com/auth0/nextjs-auth0/issues/597
 */

export const AppLayout: NextPage<IAppLayoutProps> = ({ children }) => {
	return (
		<div>
			<p>this is app layout</p>
			<div>{children}</div>
		</div>
	);
};
