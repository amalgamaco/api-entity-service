/* eslint-disable class-methods-use-this, @typescript-eslint/no-explicit-any */
import set from 'lodash.set';
import EntityNotFoundError from '../errors/EntityNotFoundError';
import NotAllowedError from '../errors/NotAllowedError';
import UnprocessableEntityError, { AttributeError, AttributesErrors } from '../errors/UnprocessableEntityError';
import { IErrorParser } from '../types';
import { JSONApiError, JSONApiErrorItem } from './types';

const isApiError = ( error: any ): error is JSONApiError => (
	'data' in error && 'status' in error
);

type ApiErrorStatus = number;
type ApiParsedError = EntityNotFoundError | UnprocessableEntityError;
type ApiErrorHandler = ( error: JSONApiError ) => ApiParsedError;

export default class JSONApiErrorParser implements IErrorParser {
	apiErrorHandlers: Record<ApiErrorStatus, ApiErrorHandler>;

	constructor() {
		this.apiErrorHandlers = {
			403: this.notAllowedErrorFor.bind( this ),
			404: this.notFoundErrorFor.bind( this ),
			422: this.unprocessableApiErrorFor.bind( this )
		};
	}

	parse( error: unknown ) {
		if ( isApiError( error ) && this.hasHandlerFor( error ) ) {
			return this.handlerFor( error )( error );
		}

		return error;
	}

	protected hasHandlerFor( error: JSONApiError ) {
		return !!this.apiErrorHandlers[ error.status ];
	}

	protected handlerFor( error: JSONApiError ) {
		return this.apiErrorHandlers[ error.status ];
	}

	protected notAllowedErrorFor( error: JSONApiError ) {
		return new NotAllowedError( this.detailForError( error ) );
	}

	protected notFoundErrorFor( error: JSONApiError ) {
		return new EntityNotFoundError( this.detailForError( error ) );
	}

	protected unprocessableApiErrorFor( error: JSONApiError ) {
		return new UnprocessableEntityError( this.errorsMapFromApiError( error ) );
	}

	protected detailForError( error: JSONApiError ) {
		return error.data.errors?.[ 0 ]?.detail || '';
	}

	protected pathForApiErrorItem( { source: { pointer } }: JSONApiErrorItem ): string {
		const path = pointer.replace( /\//g, '.' );
		return path.length > 0 && path[ 0 ] === '.'
			? path.substring( 1 )
			: path;
	}

	protected attributeErrorForApiErrorItem( { code, detail }: JSONApiErrorItem ): AttributeError {
		return ( { code, detail } );
	}

	protected errorsMapFromApiError( error: JSONApiError ): AttributesErrors {
		if ( !error.data.errors ) { return {}; }

		return error.data.errors.reduce(
			( res: AttributesErrors, errorItem: JSONApiErrorItem ) => {
				const path = this.pathForApiErrorItem( errorItem );
				const parsedError = this.attributeErrorForApiErrorItem( errorItem );

				return set( res, path, parsedError );
			},
			{} as AttributesErrors
		);
	}
}
