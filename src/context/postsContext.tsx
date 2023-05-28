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
};
type IPostsContextType = {
	posts: IPost[];
	setPostsFromSSR: (postsFromSSR: IPost[]) => void;
};
const postsContextDefaultValues: IPostsContextType = {
	posts: [],
	setPostsFromSSR: (postsFromSSR) => {},
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

	const value = {
		posts,
		setPostsFromSSR,
	};

	return (
		<PostsContext.Provider value={value}>{children}</PostsContext.Provider>
	);
};
