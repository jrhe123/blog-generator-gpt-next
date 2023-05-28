import React, { ReactNode, useCallback, useState } from "react";

/**
 * Create your context
 * https://github.com/shareef99/context-api-with-nextjs-and-ts?search=1
 */
type IPost = {
	postContent: string;
	title: string;
	metaDescription: string;
	keywords: string;
	topic: string;
	_id: string;
	created?: string;
};
type IPostsContextType = {
	posts: IPost[];
	setPostsFromSSR: (postsFromSSR: IPost[]) => void;
	getPosts: ({ lastPostDate }: { lastPostDate: string }) => Promise<void>;
};
const postsContextDefaultValues: IPostsContextType = {
	posts: [],
	setPostsFromSSR: (postsFromSSR) => {},
	getPosts: async ({ lastPostDate }) => {},
};

const PostsContext = React.createContext<IPostsContextType>(
	postsContextDefaultValues
);

export default PostsContext;

export const PostsProvider = ({ children }: { children: ReactNode }) => {
	const [posts, setPosts] = useState<IPost[]>([]);

	const setPostsFromSSR = useCallback((postsFromSSR: IPost[] = []) => {
		setPosts(postsFromSSR);
	}, []);

	const getPosts = useCallback(
		async ({ lastPostDate }: { lastPostDate: string }) => {
			const result = await fetch(`/api/getPosts`, {
				method: "POST",
				headers: {
					"content-type": "application/json",
				},
				body: JSON.stringify({
					lastPostDate,
				}),
			});
			const jsonResponse: {
				code: number;
				posts?: IPost[];
			} = await result.json();
			if (jsonResponse.code === 0) {
				const result = jsonResponse.posts;
				setPosts((value) => {
					const newPosts = [...value];
					result?.forEach((post) => {
						const exists = newPosts.find((item) => item._id === post._id);
						if (!exists) {
							newPosts.push(post);
						}
					});
					return newPosts;
				});
			}
		},
		[]
	);

	const value = {
		posts,
		setPostsFromSSR,
		getPosts,
	};

	return (
		<PostsContext.Provider value={value}>{children}</PostsContext.Provider>
	);
};
