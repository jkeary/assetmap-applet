import { useState, useEffect } from "react";
import { makeAPICall } from "./mock_api/fake_api";

const App = () => {
	const [appletState, setAppletState] = useState("init");
	const [householdId, setHouseholdId] = useState();
	const [household, setHousehold] = useState();
	const [householdInfo, setHouseholdInfo] = useState({
		status: "client",
		is_private: false,
		name: "",
		address: "",
		address2: "",
		city: "",
		state: "",
		zip: "",
		country: "",
		currency: "",
		phone_number: "",
	});

	useEffect(() => {
		if (appletState === "init") {
			sendEvent("glass.applet.state", { keyname: "assetmap" });
		}
	}, [appletState]);

	useEffect(() => {
		if (household) {
			let newHouseholdInfo = householdInfo;
			for (const [key, value] of Object.entries(householdInfo)) {
				newHouseholdInfo[key] = household[key];
			}
			setHouseholdInfo(newHouseholdInfo);
			setAppletState("household");
		}
	}, [household]);

	const sendEvent = (eventType, payload = null) => {
		window.parent.postMessage(
			{
				event: eventType,
				payload,
			},
			"http://localhost:8000/ampux/household"
		);
	};

	async function fetchData(type, id) {
		try {
			const response = await makeAPICall(type, id);
			console.log("Received data:", response);
			if (type === "household") {
				setHousehold(response["data"]);
			}
		} catch (error) {
			console.error("Error:", error.message);
		}
	}

	const getHouseholdInfo = (hhid) => {
		fetchData("household", hhid);
	};

	// EVENT LISTENERS
	const listenForEvent = (ev) => {
		if (typeof ev.data !== "object") return;
		if (!("payload" in ev.data)) return;
		if (!("event" in ev.data)) return;
		if (!ev.data?.event.startsWith("glass")) return;
		console.log(`Asset-Map received ${ev.data.event} event from Asset-Map`);
		if (["glass.assetmap.state"].includes(ev.data?.event)) {
			setAppletState("loading");
			setHouseholdId(ev.data?.payload?.householdId);
			getHouseholdInfo(ev.data?.payload?.householdId);
		}
	};

	window.addEventListener("message", listenForEvent);

	return (
		<div className="App">
			<header className="App-header">
				{appletState === "household" ? (
					<p>Household Details: </p>
				) : (
					<p>Welcome to the Asset-Map Applet</p>
				)}
			</header>
			{appletState === "household" && (
				<div>
					<ul>
						{Object.keys(householdInfo).map((key) => (
							<li key={key}>
								<strong>{key}:</strong> {householdInfo[key]}
							</li>
						))}
					</ul>
				</div>
			)}
			{appletState === "loading" && <p>loading...</p>}
		</div>
	);
};

export default App;
