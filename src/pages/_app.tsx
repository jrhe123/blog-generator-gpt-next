import "@/styles/globals.css";
import { NextPage } from "next";
import type { AppProps } from "next/app";
import { ComponentType, ReactElement, ReactNode } from "react";
import { UserProvider } from "@auth0/nextjs-auth0/client";

export type Page<P = {}> = NextPage<P> & {
	getLayout?: (page: ReactNode, pageProps: any) => ReactNode;
};

type Props = AppProps & {
	Component: Page;
};
export default function App({ Component, pageProps }: Props) {
	const getLayout = Component.getLayout ?? ((page) => page);
	return (
		<UserProvider>
			{getLayout(<Component {...pageProps} />, pageProps)}
		</UserProvider>
	);
}
