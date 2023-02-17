export default class NotAllowedError extends Error {
	constructor( detail: string ) {
		super( detail );

		this.name = 'NotAllowedError';
	}
}
