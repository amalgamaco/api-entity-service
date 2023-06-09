import {
	IResponseParser, EntityAttributes, ParsedEntity, ParsedResponse, EntityID
} from '../types';
import ParsedEntitySet from './helpers/ParsedEntitySet';
import SchemaEntity from './helpers/SchemaEntity';
import {
	InitParameters, JSONData, ParsedItem, ParsedItems,
	ParsedRelations
} from './SchemaParser.types';

export { SchemaEntity };

export default class SchemaParser implements IResponseParser {
	schema: SchemaEntity;
	dataKey: string;
	metaKey: string;

	constructor( { schema, dataKey, metaKey }: InitParameters ) {
		this.schema = schema;
		this.dataKey = dataKey;
		this.metaKey = metaKey;
	}

	parse( response: JSONData ): ParsedResponse {
		const responseData: JSONData = this.dataKey
			? response[ this.dataKey ] as JSONData
			: response;

		const responseMetadata = response[ this.metaKey ] || null;

		const { data, included } = Array.isArray( responseData )
			? this.parseItems( responseData, this.schema )
			: this.parseItem( responseData, this.schema );

		return {
			data,
			included: included.values(),
			meta: responseMetadata
		};
	}

	private parseItems( items: JSONData[], schema: SchemaEntity ): ParsedItems {
		return items
			.reduce(
				( { data, included }, item ) => {
					const {
						data: itemData,
						included: itemIncluded
					} = this.parseItem( item, schema );

					data.push( itemData );
					included.merge( itemIncluded );

					return { data, included };
				},
				<{ data: ParsedEntity[], included: ParsedEntitySet }>(
					{ data: [], included: new ParsedEntitySet() }
				)
			);
	}

	private parseItem( data: JSONData, schema: SchemaEntity ): ParsedItem {
		const { related, included } = this.parseRelations( data, schema );

		const serialization = {
			...data,
			...related
		};

		const { type } = schema;
		const parsed = schema.map( serialization );

		const attributes: EntityAttributes = {
			...parsed,
			id: parseInt( data.id as string, 10 )
		};

		return {
			data: { type, attributes },
			included
		};
	}

	parseRelations( data: JSONData, schema: SchemaEntity ): ParsedRelations {
		return Object
			.keys( schema.relations )
			.reduce(
				( result, relationshipName ) => {
					const relatedData = data[ relationshipName ];
					const relatedSchema = schema.relations[ relationshipName ];

					if ( !relatedData ) { return result; }

					const { related, included } = Array.isArray( relatedData )
						? this.parseRelatedItems(
							relationshipName, relatedData as JSONData[], relatedSchema
						)
						: this.parseRelatedItem(
							relationshipName, relatedData as JSONData, relatedSchema
						);

					return {
						related: { ...result.related, ...related },
						included: result.included.merge( included )
					};
				},
				{ related: {}, included: new ParsedEntitySet() }
			);
	}

	parseRelatedItems(
		relationshipName: string, items: JSONData[], schema: SchemaEntity
	): ParsedRelations {
		const { ids, included }: { ids: Set<EntityID>, included: ParsedEntitySet} = items
			.reduce(
				( result, item ) => {
					const { data, included: itemIncluded } = this.parseItem(
						item, schema
					);

					result.ids
						.add( data.attributes.id );
					result.included
						.add( data )
						.merge( itemIncluded );

					return {
						ids: result.ids,
						included: result.included
					};
				},
				{ ids: new Set<EntityID>(), included: new ParsedEntitySet() }
			);

		return {
			related: {
				[ `${relationshipName}_ids` ]: Array.from( ids )
			},
			included
		};
	}

	parseRelatedItem(
		relationshipName: string, item: JSONData, schema: SchemaEntity
	): ParsedRelations {
		const { data, included: itemIncluded } = this.parseItem( item, schema );

		const related = { [ `${relationshipName}_id` ]: data.attributes.id };
		const included = itemIncluded.add( data );

		return { related, included };
	}
}
