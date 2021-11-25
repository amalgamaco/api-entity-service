export const serializeObjectAsFormData = properties => Object
	.keys( properties )
	.reduce(
		( result, property ) => {
			const value = properties[ property ];
			if ( value === undefined || value === null ) { return result; }

			if ( Array.isArray( value ) ) {
				value.forEach(
					item => result.append( `${property}[]`, item )
				);
			} else {
				result.append( property, value );
			}

			return result;
		},
		new FormData()
	);

export const hasJSONContentType = headers => (
	headers[ 'Content-Type' ] === 'application/json'
);

export const headersForRequest = ( { includesFiles = false } ) => ( {
	'Content-Type': (
		includesFiles ? 'multipart/form-data' : 'application/json'
	)
} );

export const serializeRequestDataForContentType = ( data, headers ) => (
	hasJSONContentType( headers )
		? JSON.stringify( data )
		: serializeObjectAsFormData( data )
);

export const addIncludeToURL = ( { url, include } ) => (
	include.length > 0
		? `${url}?include=${include.join( ',' )}`
		: url
);
