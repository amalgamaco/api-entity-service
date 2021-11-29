import {
	EntityAttributes, ParsedEntity,
	IResponseParser, ParsedResponse
} from '../types';

interface AttributesMapper {
	[ key: string ]: string;
}

interface AttributesMappers {
	[ key: string ]: AttributesMapper
}

interface InitParameters {
	mappers: AttributesMappers;
}

interface JSONApiAttributes {
	[ key: string ]: unknown;
}

interface JSONApiRelationshipData {
	id: string;
	type: string;
}

interface JSONApiRelationship {
	data: JSONApiRelationshipData;
}

interface JSONApiRelationships {
	[ key: string ]: JSONApiRelationship;
}

interface JSONApiData {
	id: string;
	type: string;
	attributes: JSONApiAttributes;
	relationships: JSONApiRelationships;
}

interface ParseParameters {
	data: JSONApiData;
	included: JSONApiData[]
}

export default class JSONApiParser implements IResponseParser {
	private mappers: AttributesMappers;

	constructor( { mappers }: InitParameters ) {
		this.mappers = mappers;
	}

	parse = ( { data, included }: ParseParameters ): ParsedResponse => ( {
		data: this.parseData( data ),
		included: this.parseIncluded( included )
	} );

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
