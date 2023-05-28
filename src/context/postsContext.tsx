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
	noMorePosts: boolean;
	posts: IPost[];
	setPostsFromSSR: (postsFromSSR: IPost[]) => void;
	getPosts: ({
		lastPostDate,
		getNewerPosts,
	}: {
		lastPostDate: string;
		getNewerPosts: boolean;
	}) => Promise<void>;
	deletePost: (postId: string) => void;
};
const postsContextDefaultValues: IPostsContextType = {
	noMorePosts: false,
	posts: [],
	setPostsFromSSR: (postsFromSSR) => {},
	getPosts: async ({ lastPostDate, getNewerPosts }) => {},
	deletePost: (postId) => {},
};

const PostsContext = React.createContext<IPostsContextType>(
	postsContextDefaultValues
);

export default PostsContext;

export const PostsProvider = ({ children }: { children: ReactNode }) => {
	const [posts, setPosts] = useState<IPost[]>([]);
	const [noMorePosts, setNoMorePosts] = useState<boolean>(false);

	const setPostsFromSSR = useCallback((postsFromSSR: IPost[] = []) => {
		setPosts((value) => {
			const newPosts = [...value];
			postsFromSSR.forEach((post) => {
				const exists = newPosts.find((item) => item._id === post._id);
				if (!exists) {
					newPosts.push(post);
				}
			});
			return newPosts;
		});
	}, []);

	const getPosts = useCallback(
		async ({
			lastPostDate,
			getNewerPosts = false,
		}: {
			lastPostDate: string;
			getNewerPosts: boolean;
		}) => {
			const result = await fetch(`/api/getPosts`, {
				method: "POST",
				headers: {
					"content-type": "application/json",
				},
				body: JSON.stringify({
					lastPostDate,
					getNewerPosts,
				}),
			});
			const jsonResponse: {
				code: number;
				posts?: IPost[];
			} = await result.json();
			if (jsonResponse.code === 0) {
				const result = jsonResponse.posts;
				if (result && result.length < 5) {
					setNoMorePosts(true);
				}
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

	const deletePost = useCallback((postId: string) => {
		setPosts((value) => {
			const newPosts: IPost[] = [];
			value.forEach((post) => {
				if (post._id !== postId) {
					newPosts.push(post);
				}
			});
			return newPosts;
		});
	}, []);

	const value = {
		noMorePosts,
		posts,
		setPostsFromSSR,
		getPosts,
		deletePost,
	};

	return (
		<PostsContext.Provider value={value}>{children}</PostsContext.Provider>
	);
};
