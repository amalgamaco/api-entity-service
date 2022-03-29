import {
	EntityAttributes, ParsedEntity,
	IResponseParser, ParsedResponse
} from '../types';

import {
	InitParameters, ParseParameters,
	AttributesMappers, JSONApiData, JSONApiRelationships
} from './JSONApiParser.types';

export default class JSONApiParser implements IResponseParser {
	private mappers: AttributesMappers;

	constructor( { mappers }: InitParameters ) {
		this.mappers = mappers;
	}

	parse( { data, included }: ParseParameters ): ParsedResponse {
		return ( {
			data: this.parseData( data ),
			included: this.parseIncluded( included )
		} );
	}

	private parseData( data: JSONApiData ):
		( ParsedEntity | ParsedEntity[] ) {
		return (
			Array.isArray( data )
				? data.map( this.parseEntity.bind( this ) )
				: this.parseEntity( data )
		);
	}

	private parseIncluded( included: JSONApiData[] ): ParsedEntity[] {
		if ( !included ) { return []; }

		return included
			.map( this.parseEntity.bind( this ) );
	}

	private parseEntity( {
		id, type, attributes: baseAttributes, relationships = {}
	}: JSONApiData ): ParsedEntity {
		if ( !this.hasMapperForType( type ) ) {
			throw new Error( `No mapper found for entity with type: ${type}!` );
		}

		const relatedIdAttributes = this.parseRelationships(
			relationships
		);

		const serialization: { [ key: string ]: unknown } = {
			...baseAttributes,
			...relatedIdAttributes
		};

		const attributesMap = this.mappers[ type ];

		const parsed = Object
			.entries( attributesMap )
			.reduce(
				( result, [ serializationKey, entityKey ] ) => {
					result[ entityKey ] = serialization[ serializationKey ];
					return result;
				},
				<{ [ key: string ]: unknown }> {}
			);

		const attributes: EntityAttributes = {
			...parsed,
			id: parseInt( id, 10 )
		};

		return { type, attributes };
	}

	// eslint-disable-next-line class-methods-use-this
	private parseRelationships( relationships: JSONApiRelationships ) {
		return Object
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
	}

	private hasMapperForType( type: string ) {
		return !!this.mappers[ type ];
	}
}