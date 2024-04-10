import { useState, useEffect } from "react";
import { makeAPICall } from "./mock_api/fake_api";
import LogoSpinner from "./LogoSpinner";
import "./App.css";

const App = () => {
	const [appletState, setAppletState] = useState("init");
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
	const [instrument, setInstrument] = useState();
	const [instrumentInfo, setInstrumentInfo] = useState({
		essentials: {
			category: "",
			// members: "",
			name: "",
			source: "",
			amount: "",
			is_future_value: "",
			benefit_period_type: "",
			as_of_date: "",
			is_managed: "",
			is_annuity: "",
			is_roth: "",
		},
		details: {},
		notes: {},
	});
	const [householdmember, setHouseholdmember] = useState();
	const [householdmemberInfo, setHouseholdmemberInfo] = useState({
		essentials: {
			category: "",
			first_name: "",
			last_name: "",
			date_of_birth: "",
			date_of_birth_estimated: "",
			gender: "",
		},
		details: {},
		notes: {},
	});
	const [previousAppletState, setPreviousAppletState] = useState();
	const [previousAppletItem, setPreviousAppletItem] = useState();
	const [errorMessage, setErrorMessage] = useState(
		"There was an error.  Unable to display information at this time."
	);

	// const [activeTab, setActiveTab] = useState('essentials');
	// const [tabOptions, setTabOptions] = useState([
	//   { label: 'Essentials', value: 'essentials' },
	//   { label: 'Details', value: 'details' },
	//   { label: 'Notes', value: 'notes' },
	// ]);

	const householdFieldDisplay = {
		status: "Status",
		is_private: "Private",
		name: "Household Name",
		address: "Address",
		address2: "Address Additional",
		city: "City",
		state: "State",
		zip: "Zip",
		country: "Country",
		currency: "Currency",
		phone_number: "Phone",
	};

	const instrumentFieldDisplay = {
		essentials: {
			category: "Asset Type",
			// members: "Interested Members",
			name: "Reference Name",
			source: "Location",
			amount: "Value",
			is_future_value: "Future Value",
			benefit_period_type: "Value as of Age/Date",
			as_of_date: "Date",
			is_managed: "Under My Management",
			is_annuity: "Deferred Annuity",
			is_roth: "Roth Features",
			cash_value: "Cash Value",
			surrendered_value: "Surrendered Value",
		},
		details: {
			as_of_date: "Data Collected",
			// beneficiaries: "",
			// contingent_beneficiaries: "",
			annual_contribution: "Annual Contribution",
			annual_contribution_start_date_reference: "Age/Date",
			annual_contribution_start_date: "Contribution Start Date",
			annual_contribution_start_age: "Contribution Start Age",
			annual_contribution_end_date_reference: "Age/Date",
			annual_contribution_end_date: "Contribution End Date",
			annual_contribution_end_age: "Contribution End Age",
			// custodian: "Grantor or Custodian"
			subcategory: "Account Type",
			nickname: "Account Nickname",
			risk_preference: "Risk Profile",
			instrument_choice: "Instrument Choice",
		},
		notes: {
			notes: "Notes",
		},
	};

	const householdmemberFieldDisplay = {
		essentials: {
			category: "Role",
			first_name: "First Name",
			last_name: "Last Name",
			date_of_birth: "Date of Birth or Age",
			gender: "Gender",
			date_of_birth_estimated: "Date of Birth is Estimated",
		},
		details: {
			description: "Relationship to Household",
			citizenship: "Citizenship",
			address: "Address",
			address2: "Additional Address",
			city: "City",
			state: "State",
			zip: "Zip",
			country: "Country",
			phone_number: "Phone",
			email: "Email",
		},
		notes: {
			notes: "Notes",
		},
	};

	// EVENT LISTENERS
	useEffect(() => {
		const listenForEvent = (ev) => {
			if (typeof ev.data !== "object") return;
			if (!("payload" in ev.data)) return;
			if (!("event" in ev.data)) return;
			if (!ev.data?.event.startsWith("glass")) return;
			console.log(
				`Assetmap Applet received ${ev.data.event} event from Asset-Map`
			);
			if (ev.data?.event === "glass.assetmap.state") {
				setAppletState("loading");
				fetchData(ev.data?.payload?.householdId, "household");
			}
			if (ev.data?.event === "glass.assetmap.click") {
				setAppletState("loading");
				fetchData(ev.data?.payload?.id, ev.data.payload?.type);
			}
			if (ev.data?.event === "glass.modal.opened") {
				setPreviousAppletState(appletState);
				if (appletState === "instrument") {
					setPreviousAppletItem(instrument);
				}
				if (appletState === "householdmember") {
					setPreviousAppletItem(householdmember);
				}
				setAppletState("household");
			}
			if (ev.data?.event === "glass.modal.closed") {
				// refresh data
				fetchData(previousAppletItem.id, previousAppletState);
				setPreviousAppletState();
				sendEvent("glass.assetmap.modals", { disable: true });
			}
		};

		window.addEventListener("message", listenForEvent);
		return () => {
			window.removeEventListener("message", listenForEvent);
		};
	}, [appletState, previousAppletState]);

	useEffect(() => {
		if (appletState === "init") {
			sendEvent("glass.assetmap.state");
			sendEvent("glass.assetmap.modals", { disable: true });
		}
	}, [appletState]);

	const deepEqual = (obj1 = {}, obj2 = {}) => {
		if (obj1 === obj2) {
			return true;
		}

		if (
			typeof obj1 !== "object" ||
			typeof obj2 !== "object" ||
			obj1 === null ||
			obj2 === null
		) {
			return false;
		}

		const keys1 = Object.keys(obj1);
		const keys2 = Object.keys(obj2);

		if (keys1.length !== keys2.length) {
			return false;
		}

		for (let key of keys1) {
			if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) {
				return false;
			}
		}

		return true;
	};

	async function fetchData(id, type) {
		try {
			const response = await makeAPICall(type, id);
			console.log("Received data:", response);
			if (type === "household") {
				if (deepEqual(response["data"], household)) {
					setAppletState("household");
				} else {
					setHousehold(response["data"]);
				}
			}
			if (type === "instrument") {
				if (deepEqual(response["data"], instrument)) {
					setAppletState("instrument");
				} else {
					setInstrument(response["data"]);
				}
			}
			if (type === "householdmember") {
				if (deepEqual(response["data"], householdmember)) {
					setAppletState("householdmember");
				} else {
					setHouseholdmember(response["data"]);
				}
			}
		} catch (error) {
			console.log(error);
			if (error.message) {
				console.error("Error:", error.message);
				setErrorMessage("Error: " + error.message);
			}
			setAppletState("error");
		}
	}

	const generateList = (display, object, tabbed = false) => {
		let newDisplay = display;
		if (tabbed) {
			for (let tab in display) {
				for (let key in display[tab]) {
					newDisplay[tab][key] = object[key];
					if (typeof object[key] == "boolean") {
						newDisplay[tab][key] = object[key] ? "Yes" : "No";
					}
					if (typeof object[key] == "string") {
						newDisplay[tab][key] =
							object[key].charAt(0).toUpperCase() + object[key].slice(1);
					}
				}
			}
		} else {
			for (let key in display) {
				newDisplay[key] = object[key];
				if (typeof object[key] == "boolean") {
					newDisplay[key] = object[key] ? "Yes" : "No";
				}
				if (typeof object[key] == "string") {
					newDisplay[key] =
						object[key].charAt(0).toUpperCase() + object[key].slice(1);
				}
			}
		}
		return newDisplay;
	};

	useEffect(() => {
		if (household) {
			let newHouseholdInfo = generateList(householdInfo, household);
			setHouseholdInfo(newHouseholdInfo);
			setAppletState("household");
		}
	}, [household, householdInfo]);

	useEffect(() => {
		if (instrument) {
			let newInstruemntInfo = generateList(instrumentInfo, instrument, true);
			setInstrumentInfo(newInstruemntInfo);
			setAppletState("instrument");
		}
	}, [instrument, instrumentInfo]);

	useEffect(() => {
		if (householdmember) {
			let newHouseholdmemberInfo = generateList(
				householdmemberInfo,
				householdmember,
				true
			);
			setHouseholdmemberInfo(newHouseholdmemberInfo);
			setAppletState("householdmember");
		}
	}, [householdmember, householdmemberInfo]);

	const sendEvent = (eventType, payload = {}) => {
		window.parent.postMessage(
			{
				event: eventType,
				payload: {
					...payload,
					...{ sender: { name: "Asset-Map Applet", key: "assetmap" } },
				},
			},
			"http://localhost:8000/ampux/household"
		);
	};

	const updateClickHandler = (e) => {
		if (appletState === "instrument") {
			sendEvent("glass.modal.open", { type: appletState, item: instrument });
		}
		if (appletState === "householdmember") {
			sendEvent("glass.modal.open", {
				type: "member",
				item: householdmember,
			});
		}
	};

	return (
		<div className={`App ${appletState === 'error' ? 'Error-state' : ''}`}>
			{appletState === "init" && (
				<header className="App-header">
					<p>Welcome to the Asset-Map Applet</p>
				</header>
			)}
			{appletState === "household" && (
				<>
					<header className="App-header">
						<h1>Household Information</h1>
					</header>
					<div className="list">
						{Object.keys(householdInfo).map((key) => (
							<div key={key} className="item">
								<label className="label">
									{householdFieldDisplay[key] || key}:
								</label>
								<div className="value">{householdInfo[key]}</div>
							</div>
						))}
					</div>
				</>
			)}
			{appletState === "instrument" && (
				<>
					<header className="App-header">
						<h1>Instrument Details: </h1>
					</header>
					<div className="container">
						<div className="list">
							{Object.keys(instrumentInfo["essentials"]).map((key) => (
								<div key={key} className="item">
									<label className="label">
										{instrumentFieldDisplay["essentials"][key] || key}:
									</label>
									<div className="value">
										{instrumentInfo["essentials"][key]}
									</div>
								</div>
							))}
						</div>
						<button onClick={updateClickHandler}>Update</button>
					</div>
				</>
			)}
			{appletState === "householdmember" && (
				<>
					<header className="App-header">
						<h1>Household Member Details: </h1>
					</header>
					<div className="container">
						<div className="list">
							{Object.keys(householdmemberInfo["essentials"]).map((key) => (
								<div key={key} className="item">
									<label className="label">
										{householdmemberFieldDisplay["essentials"][key] || key}:
									</label>
									<div className="value">
										{householdmemberInfo["essentials"][key]}
									</div>
								</div>
							))}
						</div>
						<button onClick={updateClickHandler}>Update</button>
					</div>
				</>
			)}
			{appletState === "loading" && (
				<>
					<strong>Loading...</strong>
					<LogoSpinner></LogoSpinner>
				</>
			)}
			{appletState === "error" && (
				<strong className="error">{errorMessage}</strong>
			)}
		</div>
	);
};

export default App;
