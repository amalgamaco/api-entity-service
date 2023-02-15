import NullErrorParser from '../../src/errorParsers/NullErrorParser';

describe( 'NullErrorParser', () => {
	describe( '@parse', () => {
		it( 'returns the given error', () => {
			const parser = new NullErrorParser();
			const error = new Error( 'Something went wrong' );

			expect( parser.parse( error ) ).toBe( error );
		} );
	} );
} );
