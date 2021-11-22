import {
	addIncludeToURL,
	headersForRequest,
	serializeRequestDataForContentType
} from '../../src/helpers/requests';

global.FormData = class {
	constructor() {
		this.append = jest.fn();
	}
};

describe( 'headersForRequest', () => {
	describe( 'when the request includes files', () => {
		test( 'returns the multipar/form-data content-type header', () => {
			expect( headersForRequest( { includesFiles: true } ) ).toEqual(
				{ 'Content-Type': 'multipart/form-data' }
			);
		} );
	} );

	describe( 'when the request does not include files', () => {
		test( 'returns the application/json content-type header', () => {
			expect( headersForRequest( { includesFiles: false } ) ).toEqual(
				{ 'Content-Type': 'application/json' }
			);
		} );
	} );
} );

describe( 'addIncludeToURL', () => {
	test( 'appends the include items to the url as the query parameter include', () => {
		expect( addIncludeToURL( { url: '1/users/3', include: [ 'city', 'state' ] } ) ).toEqual(
			'1/users/3?include=city,state'
		);
	} );
} );

describe( 'serializeRequestDataForContentType', () => {
	const data = {
		firstName: 'John',
		lastName: 'Doe',
		age: 33,
		friendsIds: [ 3, 5 ],
		relation: undefined
	};

	describe( 'when the request has content type application/json', () => {
		test( 'serialize the data as json', () => {
			const result = serializeRequestDataForContentType(
				data,
				{ 'Content-Type': 'application/json' }
			);

			expect( result ).toEqual( JSON.stringify( data ) );
		} );
	} );

	describe( 'when the request has content type multipart/form-data', () => {
		test( 'serialize the data as form data correctly', () => {
			const result = serializeRequestDataForContentType(
				data,
				{ 'Content-Type': 'multipart/form-data' }
			);

			expect( result.append ).toHaveBeenCalledWith( 'firstName', data.firstName );
			expect( result.append ).toHaveBeenCalledWith( 'lastName', data.lastName );
			expect( result.append ).toHaveBeenCalledWith( 'age', data.age );

			// Lists values
			expect( result.append ).toHaveBeenCalledWith( 'friendsIds[]', 3 );
			expect( result.append ).toHaveBeenCalledWith( 'friendsIds[]', 5 );

			// Undefined values
			expect( result.append ).not.toHaveBeenCalledWith( 'relation', data.relation );
		} );
	} );
} );
