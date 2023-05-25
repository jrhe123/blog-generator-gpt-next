import type { NextPage } from "next";

import { faBrain } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface ILogoProps {}

export const Logo: NextPage<ILogoProps> = () => {
	return (
		<div className="text-2xl text-center py-4 font-heading">
			Blog Generator&nbsp;
			<FontAwesomeIcon icon={faBrain} className="text-2xl text-slate-400" />
		</div>
	);
};
