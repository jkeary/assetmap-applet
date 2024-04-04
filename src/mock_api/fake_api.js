import mockHouseholds from "./households.json";

// Welcome to the simulation
function fakeAPICall(type, id) {
	return new Promise((resolve, reject) => {
		// Simulate asynchronous behavior using setTimeout
		setTimeout(() => {
			// Simulate success
			if (type === "household") {
				if (id in mockHouseholds) {
					resolve({ data: mockHouseholds[id], status: "success" });
				} else {
					// Simulate error
					reject(new Error("Cannot find object"));
				}
			} else {
				// Simulate error
				reject(new Error("Cannot find endpoint"));
			}
		}, 1000); // Simulate 1 second delay
	});
}

export function makeAPICall(type, id) {
	return fakeAPICall(type, id)
		.then((response) => {
			console.log("API call successful");
			return response;
		})
		.catch((error) => {
			console.error("API call failed");
			throw error;
		});
}
