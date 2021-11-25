export default class SchemaEntity {
	constructor( { type, mapper, relations = {} } = {} ) {
		this.type = type;
		this.mapper = mapper;
		this.relations = relations;
	}

	map( serialization ) {
		return Object
			.entries( this.mapper )
			.reduce(
				( result, [ serializationKey, entityKey ] ) => {
					result[ entityKey ] = serialization[ serializationKey ];
					return result;
				},
				{}
			);
	}
}
