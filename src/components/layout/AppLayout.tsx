import type { NextPage } from "next";
import Link from "next/link";
import Image from "next//image";
//
import { useUser } from "@auth0/nextjs-auth0/client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCoins } from "@fortawesome/free-solid-svg-icons";
//
import { Logo } from "../logo";
// context api
import { useContext, useEffect } from "react";
import PostsContext from "@/context/postsContext";

interface IAppLayoutProps {
	children: React.ReactNode;
	availableTokens: number;
	posts: {
		postContent: string;
		title: string;
		metaDescription: string;
		keywords: string;
		topic: string;
		_id: string;
	}[];
	postId: string | null;
	created: string;
}

/**
 * How to setup AppLayout as HOC
 * 1. https://stackoverflow.com/questions/62115518/persistent-layout-in-next-js-with-typescript-and-hoc
 * 2. https://github.com/auth0/nextjs-auth0/issues/597
 */

export const AppLayout: NextPage<IAppLayoutProps> = ({
	children,
	availableTokens,
	posts: postsFromSSR,
	postId,
	created,
}) => {
	const { user } = useUser();
	// context api
	const { noMorePosts, posts, setPostsFromSSR, getPosts } =
		useContext(PostsContext);

	useEffect(() => {
		setPostsFromSSR(postsFromSSR);
		if (postId) {
			const exists = postsFromSSR.find((item) => item._id === postId);
			if (!exists && created) {
				getPosts({
					lastPostDate: created,
					getNewerPosts: true,
				});
			}
		}
	}, [postsFromSSR, setPostsFromSSR, postId, created, getPosts]);

	const handleLoadMore = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
		e.preventDefault();
		getPosts({
			lastPostDate: posts[posts.length - 1].created + "",
			getNewerPosts: false,
		});
	};

	return (
		<div className="grid grid-cols-[300px_1fr] h-screen max-h-screen">
			<div className="flex flex-col text-white overflow-hidden">
				<div className="bg-slate-800 px-2">
					<Logo />
					<Link href={"/post/new"} className="btn">
						New Post
					</Link>
					<Link href={"/token-topup"} className="block mt-2 text-center">
						<FontAwesomeIcon icon={faCoins} className="text-yellow-500" />
						<span className="pl-1">{availableTokens} tokens available</span>
					</Link>
				</div>
				<div className="px-4 flex-1 overflow-auto bg-gradient-to-b from-slate-800 to-cyan-800">
					{posts.map((po) => (
						<Link
							className={`py-1 border border-white/0 text-ellipsis block overflow-hidden whitespace-nowrap my-1 px-2 bg-white/10 cursor-pointer rounded-sm ${
								postId === po._id ? "bg-white/20 border-white" : ""
							}`}
							key={po._id}
							href={`/post/${po._id}`}
						>
							{po.title}
						</Link>
					))}
					{!noMorePosts && (
						<div
							onClick={handleLoadMore}
							className="mt-4 hover:underline text-sm text-slate-400 text-center cursor-pointer"
						>
							Load more posts
						</div>
					)}
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
			{children}
		</div>
	);
};
