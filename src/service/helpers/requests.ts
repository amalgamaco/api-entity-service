import { Attributes, Headers } from './types';

export const serializeObjectAsFormData = ( properties: Attributes ): FormData => Object
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
				result.append( property, value as any );
			}

			return result;
		},
		new FormData()
	);

export const hasJSONContentType = ( headers: Headers ): boolean => (
	headers[ 'Content-Type' ] === 'application/json'
);

export const headersForRequest = (
	{ includesFiles = false }: { includesFiles: boolean }
): Headers => ( {
	'Content-Type': (
		includesFiles ? 'multipart/form-data' : 'application/json'
	)
} );

export const serializeRequestDataForContentType = (
	data: Attributes, headers: Headers
): string | FormData => (
	hasJSONContentType( headers )
		? JSON.stringify( data )
		: serializeObjectAsFormData( data )
);

export const addIncludeToURL = (
	{ url, include }: { url: string, include: string[] }
): string => (
	include.length > 0
		? `${url}?include=${include.join( ',' )}`
		: url
);
