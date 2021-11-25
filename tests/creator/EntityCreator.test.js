import EntityCreator from '../../src/creator/EntityCreator.ts';

const createDataItem = ( {
	type = 'user',
	attributes = {
		id: '1',
		firstName: 'John',
		lastName: 'Doe',
		age: 33,
		cityId: 3,
		stateId: 5
	}
} = {} ) => ( {
	type,
	attributes
} );

const included = [
	{
		type: 'city',
		attributes: {
			id: 3,
			name: 'City 3',
			stateId: 5
		}
	},
	{
		type: 'state',
		attributes: { id: 5, name: 'State 5' }
	}
];

describe( 'EntityCreator', () => {
	const createEntityCreator = () => {
		const usersStore = {
			create: jest.fn( ( { id } ) => `User ${id}` )
		};
		const citiesStore = {
			create: jest.fn( () => 'City' )
		};
		const statesStore = {
			create: jest.fn( () => 'State' )
		};
		const stores = {
			user: usersStore,
			city: citiesStore,
			state: statesStore
		};

		const rootStore = {
			getStore: jest.fn( type => stores[ type ] )
		};

		const entityCreator = new EntityCreator( { rootStore } );

		return {
			entityCreator,
			rootStore,
			usersStore,
			citiesStore,
			statesStore
		};
	};

	describe( '@create', () => {
		const testCreatesTheIncludedCorrectly = ( { parsedResponse } ) => {
			it( 'gets the correct stores for the types in data and included from the root store', () => {
				const { rootStore, entityCreator } = createEntityCreator();

				entityCreator.create( parsedResponse );

				expect( rootStore.getStore ).toHaveBeenCalledWith( 'city' );
				expect( rootStore.getStore ).toHaveBeenCalledWith( 'state' );
			} );

			it( 'calls the create method with the given attributes in the correct store for the included ', () => {
				const { citiesStore, statesStore, entityCreator } = createEntityCreator();
				entityCreator.create( parsedResponse );

				expect( citiesStore.create ).toHaveBeenCalledWith(
					parsedResponse.included[ 0 ].attributes
				);
				expect( statesStore.create ).toHaveBeenCalledWith(
					parsedResponse.included[ 1 ].attributes
				);
			} );
		};

		describe( 'for data with a single item', () => {
			const data = createDataItem();
			const parsedResponse = { data };

			it( 'gets the correct store for the type of data', () => {
				const { rootStore, entityCreator } = createEntityCreator();

				entityCreator.create( parsedResponse );

				expect( rootStore.getStore ).toHaveBeenCalledWith( 'user' );
			} );

			it( 'calls the create method with the given attributes in the correct store ', () => {
				const { usersStore, entityCreator } = createEntityCreator();
				entityCreator.create( parsedResponse );

				expect( usersStore.create ).toHaveBeenCalledWith( parsedResponse.data.attributes );
			} );

			it( 'returns the created entity', () => {
				const { usersStore, entityCreator } = createEntityCreator();
				const result = entityCreator.create( parsedResponse );

				expect( result ).toEqual( usersStore.create( parsedResponse.data.attributes ) );
			} );

			describe( 'with included', () => {
				const parsedResponseWithIncluded = { data, included };

				testCreatesTheIncludedCorrectly( { parsedResponse: parsedResponseWithIncluded } );
			} );
		} );

		describe( 'for data with a multiple items', () => {
			const data = [
				createDataItem(),
				createDataItem( {
					id: 2,
					attributes: {
						firstName: 'Jane', lastName: 'Doe', age: 35, cityId: 3, stateId: 5
					}
				} ),
				createDataItem( {
					id: 3,
					attributes: {
						firstName: 'Jake', lastName: 'Done', age: 30, cityId: 3, stateId: 5
					}
				} )
			];

			const parsedResponse = { data };

			it( 'gets the correct store for the type of data', () => {
				const { rootStore, entityCreator } = createEntityCreator();

				entityCreator.create( parsedResponse );

				expect( rootStore.getStore ).toHaveBeenCalledWith( 'user' );
			} );

			it( 'calls the create method with the given attributes in the correct store for each of the items ', () => {
				const { usersStore, entityCreator } = createEntityCreator();
				entityCreator.create( parsedResponse );

				expect( usersStore.create ).toHaveBeenCalledWith( parsedResponse.data[ 0 ].attributes );
				expect( usersStore.create ).toHaveBeenCalledWith( parsedResponse.data[ 1 ].attributes );
				expect( usersStore.create ).toHaveBeenCalledWith( parsedResponse.data[ 2 ].attributes );
			} );

			it( 'returns the created entities', () => {
				const { usersStore, entityCreator } = createEntityCreator();
				const result = entityCreator.create( parsedResponse );

				expect( result[ 0 ] ).toEqual( usersStore.create( parsedResponse.data[ 0 ].attributes ) );
				expect( result[ 1 ] ).toEqual( usersStore.create( parsedResponse.data[ 1 ].attributes ) );
				expect( result[ 2 ] ).toEqual( usersStore.create( parsedResponse.data[ 2 ].attributes ) );
			} );

			describe( 'with included', () => {
				const parsedResponseWithIncluded = { data, included };

				testCreatesTheIncludedCorrectly( { parsedResponse: parsedResponseWithIncluded } );
			} );
		} );

		describe( 'when there is no store for the given type', () => {
			const parsedResponse = {
				data: createDataItem( { type: 'non-exist' } )
			};

			it( 'returns null', () => {
				const { entityCreator } = createEntityCreator();
				const result = entityCreator.create( parsedResponse );

				expect( result ).toBeNull();
			} );
		} );
	} );
} );
