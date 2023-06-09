import JSONApiParser from '../../src/parsers/JSONApiParser';

/* eslint-disable camelcase */

const createUserData = ( {
	id = '1',
	type = 'user',
	attributes = {
		first_name: 'John',
		last_name: 'Doe',
		age: 33
	}
} = {} ) => {
	const relationships = {
		city: {
			data: { id: 3 },
			type: 'city'
		},
		state: {
			data: { id: 5 },
			type: 'state'
		},
		friends: {
			data: [ { id: 7 }, { id: 9 } ],
			type: 'state'
		}
	};

	return {
		id, type, attributes, relationships
	};
};

const included = [
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
];

const meta = {
	page: {
		prev: 61,
		next: 73
	}
};

const userMapper = {
	id: 'id',
	first_name: 'firstName',
	last_name: 'lastName',
	age: 'age',
	city_id: 'cityId',
	state_id: 'stateId',
	friends_ids: 'friendsIds'
};

const cityMapper = ( { id, name, state_id } ) => ( {
	id, name, stateId: state_id
} );

const stateMapper = {
	id: 'id',
	name: 'name'
};

const userFunctionalMapper = ( {
	id: an_id,
	first_name,
	last_name,
	age,
	city_id,
	state_id,
	friends_ids
} ) => ( {
	id: an_id,
	firstName: first_name,
	lastName: last_name,
	age,
	cityId: city_id,
	stateId: state_id,
	friendsIds: friends_ids
} );

describe( 'JSONApiParser', () => {
	const createParser = (
		{ mappers = {}, options } = {}
	) => new JSONApiParser( { mappers, options } );

	const testParsesIncludedCorrectly = ( { response } ) => {
		const mappers = {
			user: userMapper,
			city: cityMapper,
			state: stateMapper
		};

		it( 'assigns the correct types for the included', () => {
			const parser = createParser( { mappers } );
			const parsed = parser.parse( response );

			expect( parsed.included[ 0 ].type ).toEqual( included[ 0 ].type );
			expect( parsed.included[ 1 ].type ).toEqual( included[ 1 ].type );
		} );

		it( 'parses the attributes for the included correctly', () => {
			const parser = createParser( { mappers } );
			const parsed = parser.parse( response );

			expect(
				parsed.included[ 0 ].attributes.name
			).toEqual( included[ 0 ].attributes.name );
			expect(
				parsed.included[ 1 ].attributes.name
			).toEqual( included[ 1 ].attributes.name );
		} );

		it( 'parses the relationships for the included correctly', () => {
			const parser = createParser( { mappers } );
			const parsed = parser.parse( response );

			expect(
				parsed.included[ 0 ].attributes.stateId
			).toEqual( included[ 0 ].relationships.state.data.id );
		} );
	};

	const testParsesMetaCorrectly = ( { response } ) => {
		it( 'maps the meta content without making any change', () => {
			const parser = createParser( { mappers: { user: userMapper } } );
			const parsed = parser.parse( response );

			expect( parsed.meta ).toEqual( meta );
		} );
	};

	describe( 'for a response with a single item', () => {
		const data = createUserData();
		const {
			id, type, attributes, relationships
		} = data;

		const response = { data };

		describe( 'when there is a mapper for the type', () => {
			it( 'parses the id as int', () => {
				const parser = createParser( { mappers: { user: userMapper } } );
				const parsed = parser.parse( response );

				expect( parsed.data.attributes.id ).toEqual( parseInt( id, 10 ) );
			} );

			describe( 'when the convertIDsToInt option is set to false', () => {
				it( 'leaves the id as it is', () => {
					const parser = createParser(
						{ mappers: { user: userMapper }, options: { convertIDsToInt: false } }
					);
					const parsed = parser.parse( response );

					expect( parsed.data.attributes.id ).toEqual( id );
				} );
			} );

			it( 'assigns the correct type', () => {
				const parser = createParser( { mappers: { user: userMapper } } );
				const parsed = parser.parse( response );

				expect( parsed.data.type ).toEqual( type );
			} );

			const itMapsAttributesAndRelationshipsCorrectly = ( { mappers } ) => {
				it( 'maps the attributes correctly', () => {
					const parser = createParser( { mappers } );
					const parsed = parser.parse( response );

					expect( parsed.data.attributes.firstName ).toEqual( attributes.first_name );
					expect( parsed.data.attributes.last_name ).toEqual( attributes.lastName );
					expect( parsed.data.attributes.age ).toEqual( attributes.age );
				} );

				describe( 'with relationships', () => {
					it( 'maps the relationships correctly', () => {
						const parser = createParser( { mappers } );
						const parsed = parser.parse( response );

						expect( parsed.data.attributes.cityId ).toEqual( relationships.city.data.id );
						expect( parsed.data.attributes.stateId ).toEqual( relationships.state.data.id );
						expect( parsed.data.attributes.friendsIds ).toEqual(
							relationships.friends.data.map( r => r.id )
						);
					} );
				} );
			};

			describe( 'with a key-to-key attributes mapper', () => {
				itMapsAttributesAndRelationshipsCorrectly( { mappers: { user: userMapper } } );
			} );

			describe( 'with a functional attributes mapper', () => {
				// const cityFunctionalMapper = ( { id, name, state_id } ) => ( {
				//   id, name, stateId
				// } );
				itMapsAttributesAndRelationshipsCorrectly( { mappers: { user: userFunctionalMapper } } );
			} );

			describe( 'with included', () => {
				const responseWithIncluded = { data, included };

				testParsesIncludedCorrectly( { response: responseWithIncluded } );
			} );

			describe( 'with meta', () => {
				const responseWithMeta = { data, meta };

				testParsesMetaCorrectly( { response: responseWithMeta } );
			} );
		} );
	} );

	describe( 'for a response with a multiple items', () => {
		const data = [
			createUserData(),
			createUserData( {
				id: 2,
				attributes: { first_name: 'Jane', last_name: 'Doe', age: 35 }
			} ),
			createUserData( {
				id: 3,
				attributes: { first_name: 'Jake', last_name: 'Done', age: 30 }
			} )
		];

		const response = { data };

		describe( 'when there is a mapper for the type', () => {
			it( 'parses the ids as int', () => {
				const parser = createParser( { mappers: { user: userMapper } } );
				const parsed = parser.parse( response );

				expect( parsed.data[ 0 ].attributes.id ).toEqual( parseInt( data[ 0 ].id, 10 ) );
				expect( parsed.data[ 1 ].attributes.id ).toEqual( parseInt( data[ 1 ].id, 10 ) );
				expect( parsed.data[ 2 ].attributes.id ).toEqual( parseInt( data[ 2 ].id, 10 ) );
			} );

			it( 'assigns the correct types', () => {
				const parser = createParser( { mappers: { user: userMapper } } );
				const parsed = parser.parse( response );

				expect( parsed.data[ 0 ].type ).toEqual( data[ 0 ].type );
				expect( parsed.data[ 1 ].type ).toEqual( data[ 1 ].type );
				expect( parsed.data[ 2 ].type ).toEqual( data[ 2 ].type );
			} );

			const itMapsAttributesAndRelationshipsCorrectly = ( { mappers } ) => {
				it( 'maps the attributes correctly', () => {
					const parser = createParser( { mappers } );
					const parsed = parser.parse( response );

					expect( parsed.data[ 0 ].attributes.firstName ).toEqual(
						data[ 0 ].attributes.first_name
					);
					expect( parsed.data[ 0 ].attributes.last_name ).toEqual( data[ 0 ].attributes.lastName );
					expect( parsed.data[ 0 ].attributes.age ).toEqual( data[ 0 ].attributes.age );

					expect( parsed.data[ 1 ].attributes.firstName ).toEqual(
						data[ 1 ].attributes.first_name
					);
					expect( parsed.data[ 1 ].attributes.last_name ).toEqual( data[ 1 ].attributes.lastName );
					expect( parsed.data[ 1 ].attributes.age ).toEqual( data[ 1 ].attributes.age );

					expect( parsed.data[ 2 ].attributes.firstName ).toEqual(
						data[ 2 ].attributes.first_name
					);
					expect( parsed.data[ 2 ].attributes.last_name ).toEqual( data[ 2 ].attributes.lastName );
					expect( parsed.data[ 2 ].attributes.age ).toEqual( data[ 2 ].attributes.age );
				} );

				describe( 'with relationships', () => {
					it( 'maps the relationships correctly', () => {
						const parser = createParser( { mappers: { user: userMapper } } );
						const parsed = parser.parse( response );

						expect(
							parsed.data[ 0 ].attributes.cityId
						).toEqual( data[ 0 ].relationships.city.data.id );
						expect(
							parsed.data[ 0 ].attributes.stateId
						).toEqual( data[ 0 ].relationships.state.data.id );
						expect(
							parsed.data[ 0 ].attributes.friendsIds
						).toEqual( data[ 0 ].relationships.friends.data.map( r => r.id ) );

						expect(
							parsed.data[ 1 ].attributes.cityId
						).toEqual( data[ 1 ].relationships.city.data.id );
						expect(
							parsed.data[ 1 ].attributes.stateId
						).toEqual( data[ 1 ].relationships.state.data.id );
						expect(
							parsed.data[ 1 ].attributes.friendsIds
						).toEqual( data[ 1 ].relationships.friends.data.map( r => r.id ) );

						expect(
							parsed.data[ 2 ].attributes.cityId
						).toEqual( data[ 2 ].relationships.city.data.id );
						expect(
							parsed.data[ 2 ].attributes.stateId
						).toEqual( data[ 2 ].relationships.state.data.id );
						expect(
							parsed.data[ 2 ].attributes.friendsIds
						).toEqual( data[ 2 ].relationships.friends.data.map( r => r.id ) );
					} );
				} );
			};

			describe( 'with a key-to-key attributes mapper', () => {
				itMapsAttributesAndRelationshipsCorrectly( { mappers: { user: userMapper } } );
			} );

			describe( 'with a functional attributes mapper', () => {
				itMapsAttributesAndRelationshipsCorrectly( { mappers: { user: userFunctionalMapper } } );
			} );

			describe( 'with included', () => {
				const responseWithIncluded = { data, included };
				testParsesIncludedCorrectly( { response: responseWithIncluded } );
			} );

			describe( 'with meta', () => {
				const responseWithMeta = { data, meta };
				testParsesMetaCorrectly( { response: responseWithMeta } );
			} );
		} );
	} );
} );
