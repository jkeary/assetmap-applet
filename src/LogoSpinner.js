import React from "react";
import logo from "./images/logo.svg";
import "./LogoSpinner.css";

function LogoSpinner() {
	return (
		<div className="logo-container">
			<img src={logo} alt="Logo" className="spinning-logo"/>
		</div>
	);
}

export default LogoSpinner;
