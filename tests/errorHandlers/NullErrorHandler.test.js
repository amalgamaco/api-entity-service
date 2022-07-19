import NullErrorHandler from '../../src/errorHandlers/NullErrorHandler';

describe( 'NullErrorHandler', () => {
	describe( '@handleError', () => {
		it( 'throws the given error', () => {
			const errorHandler = new NullErrorHandler();
			const error = new Error( 'Something went wrong' );

			expect( () => errorHandler.handleError( error ) ).toThrow( 'Something went wrong' );
		} );
	} );
} );
