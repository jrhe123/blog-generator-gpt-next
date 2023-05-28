import React, { ReactNode, useCallback, useReducer, useState } from "react";

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

/**
 * use reducer
 * https://dev.to/elisealcala/react-context-with-usereducer-and-typescript-4obm
 */
type ActionMap<M extends { [index: string]: any }> = {
	[Key in keyof M]: M[Key] extends undefined
		? {
				type: Key;
		  }
		: {
				type: Key;
				payload: M[Key];
		  };
};
enum PostTypes {
	ADD_POSTS = "ADD_POSTS",
	DELETE_POST = "DELETE_POST",
}
type PostPayload = {
	[PostTypes.ADD_POSTS]: {
		posts: IPost[];
	};
	[PostTypes.DELETE_POST]: {
		postId: string;
	};
};
type PostActions = ActionMap<PostPayload>[keyof ActionMap<PostPayload>];

const postsReducer = (
	state: {
		posts: IPost[];
	},
	action: PostActions
) => {
	let newPosts: IPost[] = [];
	switch (action.type) {
		case PostTypes.ADD_POSTS:
			newPosts = [...state.posts];
			action.payload.posts.forEach((post) => {
				const exists = newPosts.find((item) => item._id === post._id);
				if (!exists) {
					newPosts.push(post);
				}
			});
			return {
				posts: newPosts,
			};
		case PostTypes.DELETE_POST:
			state.posts.forEach((post) => {
				if (post._id !== action.payload.postId) {
					newPosts.push(post);
				}
			});
			return {
				posts: newPosts,
			};
		default:
			return state;
	}
};
const initialState = {
	posts: [],
};

export const PostsProvider = ({ children }: { children: ReactNode }) => {
	// const [posts, setPosts] = useState<IPost[]>([]);
	const [state, dispatch] = useReducer(postsReducer, initialState);
	const [noMorePosts, setNoMorePosts] = useState<boolean>(false);

	const setPostsFromSSR = useCallback((postsFromSSR: IPost[] = []) => {
		dispatch({
			type: PostTypes.ADD_POSTS,
			payload: {
				posts: postsFromSSR,
			},
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
				dispatch({
					type: PostTypes.ADD_POSTS,
					payload: {
						posts: result || [],
					},
				});
			}
		},
		[]
	);

	const deletePost = useCallback((postId: string) => {
		dispatch({
			type: PostTypes.DELETE_POST,
			payload: {
				postId: postId,
			},
		});
	}, []);

	const value = {
		noMorePosts,
		posts: state.posts,
		setPostsFromSSR,
		getPosts,
		deletePost,
	};

	return (
		<PostsContext.Provider value={value}>{children}</PostsContext.Provider>
	);
};
