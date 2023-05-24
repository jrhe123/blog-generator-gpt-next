import Link from "next/link";
import Image from "next//image";
import { useUser } from "@auth0/nextjs-auth0/client";

export default function Home() {
	const { user } = useUser();
	console.log("user: ", user);
	return (
		<main>
			<div>home page here</div>
			<div>
				{!!user ? (
					<>
						<div>
							{user.picture && (
								<Image
									src={user.picture}
									alt={user.name || ""}
									height={50}
									width={50}
								/>
							)}
							<div>{user.email}</div>
						</div>
						<Link href={"/api/auth/logout"}>logout</Link>
					</>
				) : (
					<Link href={"/api/auth/login"}>login</Link>
				)}
			</div>
		</main>
	);
}
