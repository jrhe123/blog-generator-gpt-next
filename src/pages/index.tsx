import Link from "next/link";

export default function Home() {
	return (
		<main>
			<div>home page here</div>
			<div>
				<Link href={"/api/auth/login"}>login</Link>
			</div>
		</main>
	);
}
