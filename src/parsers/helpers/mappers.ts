import { AttributesMapper, KeyToKeyAttributesMapper, Serialization } from '../types';

const mapAttributesWithKeyToKeyMapper = (
	mapper: KeyToKeyAttributesMapper, serialization: Serialization
): Serialization => (
	Object
		.entries( mapper )
		.reduce(
			( result, [ serializationKey, entityKey ] ) => {
				result[ entityKey ] = serialization[ serializationKey ];
				return result;
			},
			<{ [ key: string ]: unknown }> {}
		)
);

export const mapAttributes = (
	mapper: AttributesMapper, serialization: Serialization
): Serialization => (
	typeof mapper === 'function'
		? mapper( serialization )
		: mapAttributesWithKeyToKeyMapper( mapper, serialization )
);
