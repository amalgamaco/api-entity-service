export default class NullErrorHandler {
	// eslint-disable-next-line class-methods-use-this
	handleError( error: unknown ) {
		throw error;
	}
}
