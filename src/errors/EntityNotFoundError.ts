export default class EntityNotFoundError extends Error {
	constructor( detail: string ) {
		super( detail );

		this.name = 'EntityNotFoundError';
	}
}
