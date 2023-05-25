import type { NextPage } from "next";
import Link from "next/link";
import Image from "next//image";
//
import { useUser } from "@auth0/nextjs-auth0/client";
interface IAppLayoutProps {
	children: React.ReactNode;
}

/**
 * How to setup AppLayout as HOC
 * 1. https://stackoverflow.com/questions/62115518/persistent-layout-in-next-js-with-typescript-and-hoc
 * 2. https://github.com/auth0/nextjs-auth0/issues/597
 */

export const AppLayout: NextPage<IAppLayoutProps> = ({ children }) => {
	const { user } = useUser();
	console.log("user: ", user);

	return (
		<div className="grid grid-cols-[300px_1fr] h-screen max-h-screen">
			<div className="flex flex-col text-white overflow-hidden">
				<div className="bg-slate-800">
					<div>logo</div>
					<div>cta</div>
					<div>tokens</div>
				</div>
				<div className="flex-1 overflow-auto bg-gradient-to-b from-slate-800 to-cyan-800">
					list of posts
				</div>
				<div className="bg-cyan-800 flex items-center gap-2 border-t border-t-black/50 h-20 px-2">
					{!!user ? (
						<>
							<div className="min-w-[50px]">
								{user.picture && (
									<Image
										src={user.picture}
										alt={user.name || ""}
										height={50}
										width={50}
										className="rounded-full"
									/>
								)}
							</div>
							<div className="flex-1">
								<div className="font-bold">{user.email}</div>
								<Link className="text-sm" href={"/api/auth/logout"}>
									logout
								</Link>
							</div>
						</>
					) : (
						<Link href={"/api/auth/login"}>login</Link>
					)}
				</div>
			</div>
			<div>{children}</div>
		</div>
	);
};
