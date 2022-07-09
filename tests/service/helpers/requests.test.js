import {
	addParamsToURL,
	headersForRequest,
	serializeRequestDataForContentType
} from '../../../src/service/helpers/requests';

describe( 'headersForRequest', () => {
	describe( 'when the request includes files', () => {
		it( 'returns the multipar/form-data content-type header', () => {
			expect( headersForRequest( { includesFiles: true } ) ).toEqual(
				{ 'Content-Type': 'multipart/form-data' }
			);
		} );
	} );

	describe( 'when the request does not include files', () => {
		it( 'returns the application/json content-type header', () => {
			expect( headersForRequest( { includesFiles: false } ) ).toEqual(
				{ 'Content-Type': 'application/json' }
			);
		} );
	} );
} );

describe( 'addParamsToURL', () => {
	const itAppendsTheCorrectSerializationToTheUrl = ( { params, expectedSerialization } ) => {
		it( 'appends "?" and the serialization of the params to the url', () => {
			expect( addParamsToURL( { url: '1/users/3', params } ) ).toEqual(
				`1/users/3?${expectedSerialization}`
			);
		} );
	};

	describe( 'without params', () => {
		it( 'does not append anything to the url', () => {
			expect( addParamsToURL( { url: '1/no/params', params: {} } ) ).toEqual( '1/no/params' );
		} );
	} );

	describe( 'with strings only', () => {
		itAppendsTheCorrectSerializationToTheUrl( {
			params: { city: 'NY', state: 'astate' },
			expectedSerialization: 'city=NY&state=astate'
		} );
	} );

	describe( 'with strings and numbers', () => {
		itAppendsTheCorrectSerializationToTheUrl( {
			params: { search: 'sometext', limit: 34 },
			expectedSerialization: 'search=sometext&limit=34'
		} );
	} );

	describe( 'with strings that have special characters', () => {
		itAppendsTheCorrectSerializationToTheUrl( {
			params: { search: 'a question?' },
			expectedSerialization: 'search=a%20question%3F'
		} );
	} );

	describe( 'with arrays', () => {
		itAppendsTheCorrectSerializationToTheUrl( {
			params: { ids: [ 12, 24, 36 ] },
			expectedSerialization: 'ids%5B0%5D=12&ids%5B1%5D=24&ids%5B2%5D=36'
		} );
	} );

	describe( 'with objects', () => {
		itAppendsTheCorrectSerializationToTheUrl( {
			params: {
				page: { after: 'an_id', size: 5 },
				search: { name: 'abc' }
			},
			expectedSerialization: 'page%5Bafter%5D=an_id&page%5Bsize%5D=5&search%5Bname%5D=abc'
		} );
	} );

	describe( 'with arrays and objects mixed', () => {
		itAppendsTheCorrectSerializationToTheUrl( {
			params: {
				array: { content: [ 1, 2 ] }
			},
			expectedSerialization: 'array%5Bcontent%5D%5B0%5D=1&array%5Bcontent%5D%5B1%5D=2'
		} );
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
		it( 'serializes the data as json', () => {
			const result = serializeRequestDataForContentType(
				data,
				{ 'Content-Type': 'application/json' }
			);

			expect( result ).toEqual( JSON.stringify( data ) );
		} );
	} );

	describe( 'when the request has content type multipart/form-data', () => {
		it( 'serializes the data as form data correctly', () => {
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
