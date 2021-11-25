import EntitySet from './helpers/EntitySet';

export { default as SchemaEntity } from './helpers/SchemaEntity';

export default class SchemaParser {
	constructor( { schema, dataKey } ) {
		this.schema = schema;
		this.dataKey = dataKey;
	}

	parse( response ) {
		const responseData = this.dataKey ? response[ this.dataKey ] : response;

		const { data, included } = Array.isArray( responseData )
			? this.parseItems( responseData, this.schema )
			: this.parseItem( responseData, this.schema );

		return {
			data,
			included: included.values()
		};
	}

	parseItems( items, schema ) {
		return items
			.reduce(
				( { data, included }, item ) => {
					const { data: itemData, included: itemIncluded } = this.parseItem( item, schema );
					data.push( itemData );
					included.merge( itemIncluded );

					return { data, included };
				},
				{ data: [], included: new EntitySet() }
			);
	}

	parseItem( data, schema ) {
		const { related, included } = this.parseRelations( data, schema );

		const serialization = {
			id: parseInt( data.id, 10 ),
			...data,
			...related
		};

		return {
			data: {
				type: schema.type,
				attributes: schema.map( serialization )
			},
			included
		};
	}

	parseRelations( data, schema ) {
		return Object
			.keys( schema.relations )
			.reduce(
				( result, relationshipName ) => {
					const relatedData = data[ relationshipName ];
					const relatedSchema = schema.relations[ relationshipName ];

					if ( !relatedData ) { return result; }

					const { related, included } = Array.isArray( relatedData )
						? this.parseRelatedItems( relationshipName, relatedData, relatedSchema )
						: this.parseRelatedItem( relationshipName, relatedData, relatedSchema );

					return {
						related: { ...result.related, ...related },
						included: result.included.merge( included )
					};
				},
				{ related: {}, included: new EntitySet() }
			);
	}

	parseRelatedItems( relationshipName, items, schema ) {
		const { ids, included } = items
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
				{ ids: new Set(), included: new EntitySet() }
			);

		return {
			related: {
				[ `${relationshipName}_ids` ]: Array.from( ids )
			},
			included
		};
	}

	parseRelatedItem( relationshipName, item, schema ) {
		const { data, included: itemIncluded } = this.parseItem( item, schema );

		const related = { [ `${relationshipName}_id` ]: data.attributes.id };
		const included = itemIncluded.add( data );

		return { related, included };
	}
}
