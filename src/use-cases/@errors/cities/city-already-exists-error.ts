export class CityAlreadyExistsError extends Error {
	constructor() {
		super("City with same name and state already exists");
	}
}
