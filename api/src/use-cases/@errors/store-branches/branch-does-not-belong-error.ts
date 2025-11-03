export class BranchDoesNotBelongError extends Error {
	constructor() {
		super("Branch does not belong to the specified store");
	}
}
