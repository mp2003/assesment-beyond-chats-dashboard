import React, { createContext, useState, useContext } from "react";

const NavContext = createContext();

export const useNavContext = () => useContext(NavContext);

export const NavProvider = ({ children }) => {
	const [OptionActive, setOptionActive] = useState(null);

	return (
		<NavContext.Provider value={{ OptionActive, setOptionActive }}>
			{children}
		</NavContext.Provider>
	);
};
