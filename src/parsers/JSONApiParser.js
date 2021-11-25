export default class JSONApiParser {
	constructor( { mappers } ) {
		this.mappers = mappers;
	}

	parse = ( { data, included } ) => ( {
		data: this.#parseData( data ),
		included: this.#parseIncluded( included )
	} )

	#parseData = data => (
		Array.isArray( data )
			? data.map( this.#parseEntity )
			: this.#parseEntity( data )
	)

	#parseIncluded = included => (
		included
			? included.map( this.#parseEntity )
			: []
	)

	#parseEntity = ( {
		id, type, attributes: baseAttributes, relationships = {}
	} ) => {
		const relatedIdAttributes = this.#parseRelationships(
			relationships
		);

		const serialization = {
			...baseAttributes,
			...relatedIdAttributes,
			id: parseInt( id, 10 )
		};

		if ( !this.#hasMapperForType( type ) ) {
			return serialization;
		}

		const attributesMap = this.mappers[ type ];

		const attributes = Object
			.entries( attributesMap )
			.reduce(
				( result, [ serializationKey, entityKey ] ) => {
					result[ entityKey ] = serialization[ serializationKey ];
					return result;
				},
				{}
			);

		return { attributes, type };
	}

	#parseRelationships = relationships => Object
		.keys( relationships )
		.reduce( ( result, relationshipName ) => {
			const { data } = relationships[ relationshipName ];

			if ( !data ) { return result; }

			return !Array.isArray( data )
				? ( {
					...result,
					[ `${relationshipName}_id` ]: parseInt( data.id, 10 )
				} ) : ( {
					...result,
					[ `${relationshipName}_ids` ]: data.map( r => parseInt( r.id, 10 ) )
				} );
		}, {} );

	#hasMapperForType = type => !!this.mappers[ type ];
}
