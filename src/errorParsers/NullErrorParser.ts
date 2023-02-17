export default class NullErrorParser {
	// eslint-disable-next-line class-methods-use-this
	parse( error: unknown ) {
		return error;
	}
}
