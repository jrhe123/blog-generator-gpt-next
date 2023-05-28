import "@/styles/globals.css";
import { NextPage } from "next";
import type { AppProps } from "next/app";
import { ReactNode } from "react";
import { UserProvider } from "@auth0/nextjs-auth0/client";
// font
import { DM_Sans, DM_Serif_Display } from "@next/font/google";
// font awesome (prevent the font awesome icon sizing flashing issue)
import "@fortawesome/fontawesome-svg-core/styles.css";
import { config } from "@fortawesome/fontawesome-svg-core";
config.autoAddCss = false;

const dmSans = DM_Sans({
	weight: ["400", "500", "700"],
	subsets: ["latin"],
	variable: "--font-dm-sans",
});
const dmSerifDisplay = DM_Serif_Display({
	weight: ["400"],
	subsets: ["latin"],
	variable: "--font-dm-serif",
});

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
			<main
				className={`${dmSans.variable} ${dmSerifDisplay.variable} font-body`}
			>
				{getLayout(<Component {...pageProps} />, pageProps)}
			</main>
		</UserProvider>
	);
}
