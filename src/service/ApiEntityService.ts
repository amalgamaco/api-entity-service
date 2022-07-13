import { IEntityCreator, IResponseParser, ParsedResponse } from '../types';
import {
	IApi, Attributes, Params, HTTPMethod, InitParameters,
	RequestWithBodyConfig, RequestParameters,
	MakeRequestParameters, EntityID
} from './ApiEntityService.types';
import {
	addParamsToURL, headersForRequest, serializeRequestDataForContentType,
	requestHasBody
} from './helpers/requests';

export default class ApiEntityService<T> {
	readonly api: IApi;
	readonly basePath: string;
	readonly parser: IResponseParser;
	readonly creator: IEntityCreator;
	readonly paths: { [ key: string ]: string };

	constructor( {
		api, basePath, parser, creator, paths = {}
	}: InitParameters ) {
		this.api = api;
		this.basePath = basePath;
		this.parser = parser;
		this.creator = creator;
		this.paths = paths;
	}

	create(
		attributes: Attributes,
		params: Params = {},
		config: RequestWithBodyConfig = {}
	): Promise<T> {
		return this.request( {
			method: HTTPMethod.POST,
			url: `${this.createPath}`,
			attributes,
			params,
			config
		} ) as Promise<T>;
	}

	update(
		id: EntityID,
		attributes: Attributes,
		params: Params = {},
		config: RequestWithBodyConfig = {}
	): Promise<T | null> {
		return this.request( {
			method: HTTPMethod.PATCH,
			url: `${this.updatePath( id )}`,
			attributes,
			params,
			config
		} ) as Promise<T | null>;
	}

	fetch( id: EntityID, params: Params = {} ): Promise<T> {
		return this.request( {
			method: HTTPMethod.GET,
			url: this.defaultResourcePathForId( id ),
			params,
			config: {}
		} ) as Promise<T>;
	}

	fetchAll( params: Params = {} ): Promise<T[]> {
		return this.request( {
			method: HTTPMethod.GET,
			url: `${this.listPath}`,
			params,
			config: {}
		} ) as Promise<T[]>;
	}

	delete( id: EntityID, params: Params = {} ): Promise<null> {
		return this.request( {
			method: HTTPMethod.DELETE,
			url: `${this.deletePath( id )}`,
			params,
			config: {}
		} ) as Promise<null>;
	}

	async request( {
		method = HTTPMethod.GET,
		url,
		attributes,
		params,
		config
	}: RequestParameters ): Promise<null | T | T[]> {
		const response = await this
			.makeRequest( {
				method, url, attributes, params, includesFiles: config.includesFiles || false
			} );

		const { data } = response;
		const parsedResponse = this.parseResponse( data );

		return this.createEntities( parsedResponse );
	}

	private makeRequest = ( {
		method,
		url,
		attributes,
		params,
		includesFiles = false
	}: MakeRequestParameters ) => {
		const urlWithParams = addParamsToURL( { url, params } );
		const apiCall = this.api[ method ].bind( this.api );

		if ( !requestHasBody( method ) ) {
			return apiCall( urlWithParams );
		}

		return apiCall(
			urlWithParams,
			attributes,
			{
				headers: headersForRequest( { includesFiles } ),
				transformRequest: serializeRequestDataForContentType
			}
		);
	};

	// Paths
	private get createPath(): string {
		return this.paths.create || this.basePath;
	}

	private get listPath(): string {
		return this.paths.list || this.basePath;
	}

	private updatePath( id: EntityID ): string {
		return this.paths.update || this.defaultResourcePathForId( id );
	}

	private deletePath( id: EntityID ): string {
		return this.paths.delete || this.defaultResourcePathForId( id );
	}

	private defaultResourcePathForId( id: EntityID ): string {
		return (
			id ? `${this.basePath}/${id}` : this.basePath
		);
	}

	// Parse and create
	private parseResponse( response: unknown ): ParsedResponse | null {
		return (
			response
				? this.parser.parse( response )
				: null
		);
	}

	private createEntities( parsedResponse: ParsedResponse | null ): ( T | T[] | null ) {
		return (
			parsedResponse
				? this.creator.create( parsedResponse )
				: null
		);
	}
}
