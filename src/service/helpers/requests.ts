import { stringify } from 'qs';
import {
	Attributes, Params, Headers, HTTPMethod
} from '../ApiEntityService.types';

const serializeQueryParams = ( params: Params ): string => stringify( params );

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
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
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

export const addParamsToURL = (
	{ url, params }: { url: string, params: Params }
): string => {
	const serializedParams = serializeQueryParams( params );
	return serializedParams.length > 0
		? `${url}?${serializedParams}`
		: url;
};

export const requestHasBody = ( method: HTTPMethod ): boolean => (
	method === HTTPMethod.POST || method === HTTPMethod.PATCH || method === HTTPMethod.PUT
);
