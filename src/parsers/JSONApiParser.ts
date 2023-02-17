import {
	EntityAttributes, ParsedEntity,
	IResponseParser, ParsedResponse
} from '../types';

import {
	InitParameters, JSONApiResponse,
	AttributesMappers, JSONApiData, JSONApiRelationships, JSONApiRelationshipData,
	JSONApiParserOptions
} from './JSONApiParser.types';

import { mapAttributes } from './helpers/mappers';

export default class JSONApiParser implements IResponseParser {
	private mappers: AttributesMappers;
	private options: JSONApiParserOptions;

	constructor( { mappers, options = { convertIDsToInt: true } }: InitParameters ) {
		this.mappers = mappers;
		this.options = options;
	}

	parse( { data, included, meta }: JSONApiResponse ): ParsedResponse {
		return ( {
			data: this.parseData( data ),
			included: this.parseIncluded( included ),
			meta
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

		const attributesMapper = this.mappers[ type ];

		const parsed = mapAttributes( attributesMapper, serialization );

		const attributes: EntityAttributes = {
			...parsed,
			id: this.parseID( id )
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
						[ `${relationshipName}_id` ]: this.parseID( data.id )
					} ) : ( {
						...result,
						[ `${relationshipName}_ids` ]: data.map(
							( r: JSONApiRelationshipData ) => this.parseID( r.id )
						)
					} );
			}, {} );
	}

	private hasMapperForType( type: string ) {
		return !!this.mappers[ type ];
	}

	private parseID( rawID: string ) {
		return this.options.convertIDsToInt
			? parseInt( rawID, 10 )
			: rawID;
	}
}
