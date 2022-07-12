import ApiEntityService from '../../src/service/ApiEntityService';
import ApiMock from '../__mocks__/ApiMock';

const mockedMetadata = {
	next: 25,
	size: 1
};

const userResponse = {
	data: {
		data: {
			id: '1',
			type: 'user',
			attributes: {
				first_name: 'John',
				last_name: 'Doe',
				age: 33
			},
			relationships: {
				city: {
					data: { id: 3 },
					type: 'city'
				},
				state: {
					data: { id: 5 },
					type: 'state'
				}
			}
		},
		included: [
			{
				id: 3,
				type: 'city',
				attributes: { name: 'City 3' },
				relationships: {
					state: {
						type: 'state',
						data: { id: 5 }
					}
				}
			},
			{
				id: 5,
				type: 'state',
				attributes: { name: 'State 5' }
			}
		],
		meta: mockedMetadata
	}
};

const nullResponse = { data: null };

const apiMock = new ApiMock();

const parsedResponse = {
	data: {
		type: 'user',
		attributes: {
			firstName: 'John',
			lastName: 'Doe',
			age: 33,
			cityId: 3,
			stateId: 5
		}
	},
	included: [
		{
			id: 3,
			attributes: {
				name: 'City 3',
				stateId: 5
			}
		},
		{
			id: 5,
			attributes: { name: 'State 5' }
		}
	],
	meta: mockedMetadata
};

const parserMock = {
	parse: jest.fn( () => parsedResponse )
};

const mockedCreatedEntities = 'Entity';

const creatorMock = {
	create: jest.fn( () => mockedCreatedEntities )
};

const basePath = '1/users';

describe( 'ApiEntityService', () => {
	const createService = ( {
		api = apiMock,
		parser = parserMock,
		creator = creatorMock,
		paths = {}
	} = {} ) => new ApiEntityService( {
		api,
		basePath,
		parser,
		creator,
		paths
	} );

	beforeEach( () => jest.clearAllMocks() );

	const testMethodCallsTheCorrectApiMethodAndHandlesTheResponse = ( {
		serviceMethod,
		expectedApiMethod,
		expectedPath,
		response,
		id = undefined,
		attributes = undefined
	} ) => {
		const callService = ( service, params, config ) => {
			const parameters = [];

			if ( id ) { parameters.push( id ); }
			if ( attributes ) { parameters.push( attributes ); }
			if ( params ) { parameters.push( params ); }
			if ( config ) { parameters.push( config ); }

			return service[ serviceMethod ]( ...parameters );
		};

		const hasResponse = !!response.data;

		beforeEach( () => apiMock[ expectedApiMethod ].mockResolvedValueOnce( response ) );

		if ( attributes ) {
			it( 'calls the correct api method with the correct path, attributes and config', () => {
				const service = createService();
				callService( service );

				expect( apiMock[ expectedApiMethod ] ).toHaveBeenCalledWith(
					expectedPath,
					attributes,
					{
						headers: { 'Content-Type': 'application/json' },
						transformRequest: expect.any( Function )
					}
				);
			} );

			describe( 'when the includesFiles flag is true', () => {
				it( 'changes the content type header to multipart/form-data', () => {
					const service = createService();
					callService( service, {}, { includesFiles: true } );

					expect( apiMock[ expectedApiMethod ].mock.calls[ 0 ][ 2 ] ).toEqual(
						{
							headers: { 'Content-Type': 'multipart/form-data' },
							transformRequest: expect.any( Function )
						}
					);
				} );
			} );
		} else {
			it( 'calls the correct api method with the correct path', () => {
				const service = createService();
				callService( service );

				expect( apiMock[ expectedApiMethod ] ).toHaveBeenCalledWith( expectedPath );
			} );
		}

		describe( 'with the "params" parameter', () => {
			it( 'calls the correct api method with the correct path appending the params', () => {
				const service = createService();
				const params = {
					search: 'A text',
					page: {
						after: 82,
						size: 5
					},
					include: [ 'city' ]
				};

				callService( service, params );

				expect( apiMock[ expectedApiMethod ].mock.calls[ 0 ][ 0 ] ).toEqual(
					`${expectedPath}?search=A%20text&page%5Bafter%5D=82&page%5Bsize%5D=5&include%5B0%5D=city`
				);
			} );
		} );

		if ( hasResponse ) {
			it( 'calls the parser with the received response', async () => {
				const service = createService();
				await callService( service );

				expect( parserMock.parse ).toHaveBeenCalledWith( userResponse.data );
			} );

			it( 'calls the creator with the parsed response', async () => {
				const service = createService();
				await callService( service );

				expect( creatorMock.create ).toHaveBeenCalledWith( parsedResponse );
			} );

			it( 'returns the created entity/entities with the metadata from the parsed response', async () => {
				const service = createService();
				const result = await callService( service );

				expect( result ).toEqual( { data: mockedCreatedEntities, meta: mockedMetadata } );
			} );
		} else {
			it( 'does not call the parser', async () => {
				const service = createService();
				await callService( service );

				expect( parserMock.parse ).not.toHaveBeenCalled();
			} );

			it( 'does not call the creator', async () => {
				const service = createService();
				await callService( service );

				expect( creatorMock.create ).not.toHaveBeenCalled();
			} );

			it( 'returns null', async () => {
				const service = createService();
				const result = await callService( service );

				expect( result ).toBeNull();
			} );
		}
	};

	describe( '@create', () => {
		const attributes = {
			first_name: 'John',
			last_name: 'Doe',
			age: 33,
			city_id: 3,
			state_id: 5
		};

		testMethodCallsTheCorrectApiMethodAndHandlesTheResponse( {
			serviceMethod: 'create',
			expectedApiMethod: 'post',
			expectedPath: basePath,
			response: userResponse,
			attributes
		} );
	} );

	describe( '@update', () => {
		const id = 3;
		const attributes = {
			first_name: 'John',
			last_name: 'Doe',
			age: 33,
			city_id: 3,
			state_id: 5
		};

		testMethodCallsTheCorrectApiMethodAndHandlesTheResponse( {
			serviceMethod: 'update',
			expectedApiMethod: 'patch',
			expectedPath: `${basePath}/${id}`,
			response: userResponse,
			id,
			attributes
		} );
	} );

	describe( '@fetch', () => {
		const id = 3;

		testMethodCallsTheCorrectApiMethodAndHandlesTheResponse( {
			serviceMethod: 'fetch',
			expectedApiMethod: 'get',
			expectedPath: `${basePath}/${id}`,
			response: userResponse,
			id
		} );
	} );

	describe( '@fetchAll', () => {
		testMethodCallsTheCorrectApiMethodAndHandlesTheResponse( {
			serviceMethod: 'fetchAll',
			expectedApiMethod: 'get',
			expectedPath: basePath,
			response: userResponse
		} );
	} );

	describe( '@delete', () => {
		const id = 3;

		testMethodCallsTheCorrectApiMethodAndHandlesTheResponse( {
			serviceMethod: 'delete',
			expectedApiMethod: 'delete',
			expectedPath: `${basePath}/${id}`,
			response: nullResponse,
			hasResponse: false,
			id
		} );
	} );
} );
