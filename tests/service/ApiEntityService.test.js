import ApiEntityService from '../../src/service/ApiEntityService';

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
		]
	}
};

const nullResponse = { data: null };

const apiMock = {
	post: jest.fn( () => Promise.resolve() ),
	patch: jest.fn( () => Promise.resolve() ),
	get: jest.fn( () => Promise.resolve() ),
	delete: jest.fn( () => Promise.resolve() )
};

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
	]
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

	beforeEach( () => {
		apiMock.post.mockClear();
		apiMock.patch.mockClear();
		apiMock.get.mockClear();
		apiMock.delete.mockClear();

		parserMock.parse.mockClear();

		creatorMock.create.mockClear();
	} );

	const testMethodCallsTheCorrectApiMethodAndHandlesTheResponse = ( {
		serviceMethod,
		expectedApiMethod,
		expectedPath,
		response,
		id = undefined,
		attributes = undefined
	} ) => {
		const callService = ( service, config ) => {
			const parameters = [];

			if ( id ) { parameters.push( id ); }
			if ( attributes ) { parameters.push( attributes ); }
			if ( config ) { parameters.push( config ); }

			return service[ serviceMethod ]( ...parameters );
		};

		const hasResponse = !!response.data;

		beforeEach( () => {
			apiMock[ expectedApiMethod ].mockImplementationOnce(
				() => Promise.resolve( response )
			);
		} );

		if ( attributes ) {
			test( 'calls the correct api method with the correct path, attributes and config', () => {
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

			describe( 'with the includesFiles flag in true', () => {
				test( 'changes the content type header to multipart/form-data', () => {
					const service = createService();
					callService( service, { includesFiles: true } );

					expect( apiMock[ expectedApiMethod ].mock.calls[ 0 ][ 2 ] ).toEqual(
						{
							headers: { 'Content-Type': 'multipart/form-data' },
							transformRequest: expect.any( Function )
						}
					);
				} );
			} );
		} else {
			test( 'calls the correct api method with the correct path', () => {
				const service = createService();
				callService( service );

				expect( apiMock[ expectedApiMethod ] ).toHaveBeenCalledWith( expectedPath );
			} );
		}

		describe( 'with the include parameter', () => {
			test( 'calls the correct api method with the correct path apending the include parameter', () => {
				const service = createService();
				const include = [ 'city', 'state' ];

				callService( service, { include } );

				expect( apiMock[ expectedApiMethod ].mock.calls[ 0 ][ 0 ] ).toEqual(
					`${expectedPath}?include=city,state`
				);
			} );
		} );

		if ( hasResponse ) {
			test( 'calls the parser with the received response', async () => {
				const service = createService();
				await callService( service );

				expect( parserMock.parse ).toHaveBeenCalledWith( userResponse.data );
			} );

			test( 'calls the creator with the parsed response', async () => {
				const service = createService();
				await callService( service );

				expect( creatorMock.create ).toHaveBeenCalledWith( parsedResponse );
			} );

			test( 'returns the created entity/entities', async () => {
				const service = createService();
				const result = await callService( service );

				expect( result ).toEqual( mockedCreatedEntities );
			} );
		} else {
			test( 'does not call the parser', async () => {
				const service = createService();
				await callService( service );

				expect( parserMock.parse ).not.toHaveBeenCalled();
			} );

			test( 'does not call the creator', async () => {
				const service = createService();
				await callService( service );

				expect( creatorMock.create ).not.toHaveBeenCalled();
			} );

			test( 'returns null', async () => {
				const service = createService();
				const result = await callService( service );

				expect( result ).toBeNull();
			} );
		}
	};

	describe( 'create', () => {
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

	describe( 'update', () => {
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

	describe( 'fetch', () => {
		const id = 3;

		testMethodCallsTheCorrectApiMethodAndHandlesTheResponse( {
			serviceMethod: 'fetch',
			expectedApiMethod: 'get',
			expectedPath: `${basePath}/${id}`,
			response: userResponse,
			id
		} );
	} );

	describe( 'fetchAll', () => {
		testMethodCallsTheCorrectApiMethodAndHandlesTheResponse( {
			serviceMethod: 'fetchAll',
			expectedApiMethod: 'get',
			expectedPath: basePath,
			response: userResponse
		} );
	} );

	describe( 'delete', () => {
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
