import SchemaParser, { SchemaEntity } from '../../src/parsers/SchemaParser';

/* eslint-disable camelcase */

const stateSchema = new SchemaEntity( {
	type: 'state',
	mapper: {
		id: 'id',
		name: 'name'
	}
} );

const citySchema = new SchemaEntity( {
	type: 'city',
	mapper: ( { id, name, state_id } ) => ( { id, name, stateId: state_id } ),
	relations: {
		state: stateSchema
	}
} );

const userSchema = new SchemaEntity( {
	type: 'user',
	mapper: {
		id: 'id',
		first_name: 'firstName',
		last_name: 'lastName',
		age: 'age',
		city_id: 'cityId',
		state_id: 'stateId',
		favorite_states_ids: 'favoriteStatesIds'
	},
	relations: {
		city: citySchema,
		state: stateSchema,
		favorite_states: stateSchema
	}
} );

const matchesTypeAndId = ( type, id ) => item => (
	item.type === type && item.attributes.id === id
);

describe( 'SchemaParser', () => {
	const createParser = parserProps => new SchemaParser( {
		schema: userSchema, dataKey: 'response', ...parserProps
	} );

	const parser = createParser();

	const testParsesMetaCorrectly = ( { responseWithoutMeta } ) => {
		const meta = {
			page: {
				prev: 61,
				next: 73
			}
		};

		describe( 'when the parser has no meta key', () => {
			it( 'assigns null to the metadata field', () => {
				const result = parser.parse( { ...responseWithoutMeta, meta } );

				expect( result.meta ).toBeNull();
			} );
		} );

		describe( 'when the parser has a meta key', () => {
			const parserWithMetaKey = createParser( { metaKey: 'a_meta_key' } );

			describe( 'and the response has a key equal to the meta key', () => {
				it( 'assigns the value for the meta key directly to the metadata field', () => {
					const result = parserWithMetaKey.parse( {
						...responseWithoutMeta, a_meta_key: meta
					} );

					expect( result.meta ).toEqual( meta );
				} );
			} );

			describe( 'and the response has no key equal to the meta key', () => {
				it( 'assigns null to the metadata field', () => {
					const result = parserWithMetaKey.parse( { ...responseWithoutMeta, meta } );

					expect( result.meta ).toBeNull();
				} );
			} );
		} );
	};

	describe( 'for a response with a single item', () => {
		const userResponse = {
			id: '1',
			first_name: 'John',
			last_name: 'Doe',
			age: 33,
			city: {
				id: 3,
				name: 'City 3',
				state: {
					id: 8,
					name: 'State 8'
				}
			},
			state: {
				id: 5,
				name: 'State 5'
			},
			favorite_states: [
				{
					id: 7,
					name: 'State 7'
				},
				{
					id: 3,
					name: 'State 3'
				}
			]
		};

		const response = { response: userResponse };

		it( 'sets the correct type', () => {
			const result = parser.parse( response );

			expect( result.data.type ).toEqual( 'user' );
		} );

		it( 'maps the attributes correctly', () => {
			const result = parser.parse( response );

			expect( result.data.attributes.id ).toEqual( parseInt( userResponse.id, 10 ) );
			expect( result.data.attributes.firstName ).toEqual( userResponse.first_name );
			expect( result.data.attributes.lastName ).toEqual( userResponse.last_name );
			expect( result.data.attributes.age ).toEqual( userResponse.age );
		} );

		describe( 'with relations', () => {
			it( 'replaces the nested relations with the ids', () => {
				const { data } = parser.parse( response );

				expect( data.attributes.stateId ).toEqual( userResponse.state.id );
			} );

			it( 'adds the related item to the included list', () => {
				const { included } = parser.parse( response );

				expect( included ).toContainEqual(
					{ type: 'state', attributes: userResponse.state }
				);
			} );

			describe( 'and one relation with a nested relation', () => {
				it( 'replaces the nested relations with the ids in the related data', () => {
					const { included } = parser.parse( response );

					const city = included.find( i => i.type === 'city' );

					expect( city.attributes.stateId ).toEqual( userResponse.city.state.id );
				} );

				it( 'adds the related item of the related item to the included list', () => {
					const { included } = parser.parse( response );

					expect( included ).toContainEqual(
						{ type: 'state', attributes: userResponse.city.state }
					);
				} );
			} );

			describe( 'and one is a list relation', () => {
				it( 'replaces the nested relations with a list of ids in the related data', () => {
					const { data } = parser.parse( response );

					expect( data.attributes.favoriteStatesIds ).toEqual(
						userResponse.favorite_states.map( fs => fs.id )
					);
				} );

				it( 'adds the related items to the included list', () => {
					const { included } = parser.parse( response );

					expect( included ).toContainEqual(
						{ type: 'state', attributes: userResponse.favorite_states[ 0 ] }
					);
					expect( included ).toContainEqual(
						{ type: 'state', attributes: userResponse.favorite_states[ 1 ] }
					);
				} );
			} );
		} );

		testParsesMetaCorrectly( { responseWithoutMeta: response } );
	} );

	describe( 'for a response with multiple items', () => {
		const usersResponse = [
			{
				id: '1',
				first_name: 'John',
				last_name: 'Doe',
				age: 33,
				city: {
					id: 3,
					name: 'City 3',
					state: {
						id: 8,
						name: 'State 8'
					}
				},
				state: {
					id: 5,
					name: 'State 5'
				},
				favorite_states: [
					{
						id: 7,
						name: 'State 7'
					},
					{
						id: 3,
						name: 'State 3'
					}
				]
			},
			{
				id: '4',
				first_name: 'Jane',
				last_name: 'Doe',
				age: 35,
				city: {
					id: 7,
					name: 'City 7',
					state: {
						id: 2,
						name: 'State 2'
					}
				},
				state: {
					id: 5,
					name: 'State 5'
				},
				favorite_states: [
					{
						id: 11,
						name: 'State 11'
					},
					{
						id: 23,
						name: 'State 23'
					}
				]
			}
		];

		const response = { response: usersResponse };

		it( 'sets the correct type for all the items', () => {
			const result = parser.parse( response );

			expect( result.data[ 0 ].type ).toEqual( 'user' );
			expect( result.data[ 1 ].type ).toEqual( 'user' );
		} );

		it( 'maps the attributes correctly for all the items', () => {
			const result = parser.parse( response );

			expect( result.data[ 0 ].attributes.id ).toEqual( parseInt( usersResponse[ 0 ].id, 10 ) );
			expect( result.data[ 0 ].attributes.firstName ).toEqual( usersResponse[ 0 ].first_name );
			expect( result.data[ 0 ].attributes.lastName ).toEqual( usersResponse[ 0 ].last_name );
			expect( result.data[ 0 ].attributes.age ).toEqual( usersResponse[ 0 ].age );

			expect( result.data[ 1 ].attributes.id ).toEqual( parseInt( usersResponse[ 1 ].id, 10 ) );
			expect( result.data[ 1 ].attributes.firstName ).toEqual( usersResponse[ 1 ].first_name );
			expect( result.data[ 1 ].attributes.lastName ).toEqual( usersResponse[ 1 ].last_name );
			expect( result.data[ 1 ].attributes.age ).toEqual( usersResponse[ 1 ].age );
		} );

		describe( 'with relations', () => {
			it( 'replaces the nested relations with the ids', () => {
				const { data } = parser.parse( response );

				expect( data[ 0 ].attributes.stateId ).toEqual( usersResponse[ 0 ].state.id );
				expect( data[ 1 ].attributes.stateId ).toEqual( usersResponse[ 1 ].state.id );
			} );

			it( 'adds the related item to the included list', () => {
				const { included } = parser.parse( response );

				expect( included ).toContainEqual(
					{ type: 'state', attributes: usersResponse[ 0 ].state }
				);
				expect( included ).toContainEqual(
					{ type: 'state', attributes: usersResponse[ 1 ].state }
				);
			} );

			describe( 'and one relation with a nested relation', () => {
				it( 'replaces the nested relations with the ids in the related data', () => {
					const { included } = parser.parse( response );

					const cities = included.filter( i => i.type === 'city' );

					expect( cities[ 0 ].attributes.stateId ).toEqual( usersResponse[ 0 ].city.state.id );
					expect( cities[ 1 ].attributes.stateId ).toEqual( usersResponse[ 1 ].city.state.id );
				} );

				it( 'adds the related item of the related item to the included list', () => {
					const { included } = parser.parse( response );

					expect( included ).toContainEqual(
						{ type: 'state', attributes: usersResponse[ 0 ].city.state }
					);
					expect( included ).toContainEqual(
						{ type: 'state', attributes: usersResponse[ 1 ].city.state }
					);
				} );

				it( 'doesn\'t have repeated items in the included', () => {
					const { included } = parser.parse( response );

					expect(
						included.filter( matchesTypeAndId( 'state', usersResponse[ 0 ].state.id ) ).length
					).toEqual( 1 );
				} );
			} );

			describe( 'and one is a list relation', () => {
				it( 'replaces the nested relations with a list of ids in the related data', () => {
					const { data } = parser.parse( response );

					expect( data[ 0 ].attributes.favoriteStatesIds ).toEqual(
						usersResponse[ 0 ].favorite_states.map( fs => fs.id )
					);
					expect( data[ 1 ].attributes.favoriteStatesIds ).toEqual(
						usersResponse[ 1 ].favorite_states.map( fs => fs.id )
					);
				} );

				it( 'adds the related items to the included list', () => {
					const { included } = parser.parse( response );

					expect( included ).toContainEqual(
						{ type: 'state', attributes: usersResponse[ 0 ].favorite_states[ 0 ] }
					);
					expect( included ).toContainEqual(
						{ type: 'state', attributes: usersResponse[ 0 ].favorite_states[ 1 ] }
					);

					expect( included ).toContainEqual(
						{ type: 'state', attributes: usersResponse[ 1 ].favorite_states[ 0 ] }
					);
					expect( included ).toContainEqual(
						{ type: 'state', attributes: usersResponse[ 1 ].favorite_states[ 1 ] }
					);
				} );
			} );
		} );

		testParsesMetaCorrectly( { responseWithoutMeta: response } );
	} );
} );
