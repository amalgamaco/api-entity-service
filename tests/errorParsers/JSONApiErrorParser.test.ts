import JSONApiErrorParser from '../../src/errorParsers/JSONApiErrorParser';
import UnprocessableEntityError from '../../src/errors/UnprocessableEntityError';

import { JSONValue } from '../../src/types';

class ApiError {
	data: JSONValue;
	status: number;

	constructor( status: number, data: JSONValue ) {
		this.data = data;
		this.status = status;
	}
}

describe( 'JSONApiErrorParser', () => {
	const parser = new JSONApiErrorParser();

	describe( 'for a 403 api error', () => {
		const error = new ApiError( 403, {
			errors: [
				{
					title: 'Forbidden Error',
					code: 'forbidden.album',
					detail: 'The item 123 does not belong to current user',
					source: {
						pointer: null
					}
				}
			]
		} );

		it( 'returns a NotAllowedError error', () => {
			expect( ( parser.parse( error ) as Error ).name ).toEqual( 'NotAllowedError' );
		} );

		it( 'returns the details included in the api error', () => {
			expect( ( parser.parse( error ) as Error ).message ).toEqual(
				'The item 123 does not belong to current user'
			);
		} );
	} );

	describe( 'for a 404 api error', () => {
		const error = new ApiError( 404, {
			'errors': [
				{
					'title': 'Not Found Error',
					'code': 'not_found',
					'detail': "Couldn't find User with 'id'=133",
					'source': {
						'pointer': '/User/id'
					}
				}
			]
		} );

		it( 'returns an EntityNotFound error', () => {
			expect( ( parser.parse( error ) as Error ).name ).toEqual( 'EntityNotFoundError' );
		} );

		it( 'returns the details included in the api error', () => {
			expect( ( parser.parse( error ) as Error ).message ).toEqual(
				"Couldn't find User with 'id'=133"
			);
		} );
	} );

	describe( 'for a 422 api error', () => {
		const error = new ApiError( 422, {
			'errors': [
				{
					'status': 422,
					'title': 'Unprocessable entity',
					'detail': 'Email taken',
					'code': 'invalid.email_taken',
					'source': {
						'pointer': '/email'
					}
				},
				{
					'status': 422,
					'title': 'Unprocessable entity',
					'code': 'invalid.blank',
					'detail': 'Can\'t be blank',
					'source': {
						'pointer': '/content'
					}
				},
				{
					'status': 422,
					'title': 'Unprocessable entity',
					'code': 'invalid.invalid_format',
					'detail': 'URL format is not valid',
					'source': {
						'pointer': '/photo/url'
					}
				}
			]
		} );

		it( 'returns an UnprocessableEntityError', () => {
			expect( ( parser.parse( error ) as Error ).name ).toEqual( 'UnprocessableEntityError' );
		} );

		it( 'returns the correct errors for the attributes', () => {
			expect( ( parser.parse( error ) as UnprocessableEntityError ).errors ).toEqual( {
				email: {
					code: 'invalid.email_taken',
					detail: 'Email taken'
				},
				content: {
					code: 'invalid.blank',
					detail: 'Can\'t be blank'
				},
				photo: {
					url: {
						code: 'invalid.invalid_format',
						detail: 'URL format is not valid'
					}
				}
			} );
		} );
	} );

	describe( 'for a unknown error', () => {
		it( 'returns the passed error', () => {
			const error = new Error( 'Something went wrong' );
			expect( parser.parse( error ) ).toEqual( error );
		} );
	} );
} );
