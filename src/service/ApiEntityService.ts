import { IEntityCreator, IResponseParser, ParsedResponse } from '../types';
import { Api, Attributes, HTTPMethod } from './helpers/types';

import {
	addIncludeToURL, headersForRequest, serializeRequestDataForContentType
} from './helpers/requests';

interface InitParameters {
	api: Api,
	basePath: string,
	parser: IResponseParser,
	creator: IEntityCreator,
	paths: { [ key: string ]: string }
}

type RequestCofig = {
	include?: string[]
}

type RequestWithBodyConfig = RequestCofig & {
	includesFiles?: boolean
}

type RequestParameters = {
	method: HTTPMethod,
	url: string,
	attributes?: Attributes,
	config: RequestWithBodyConfig
}

type MakeRequestParameters = {
	method: HTTPMethod,
	url: string,
	attributes?: Attributes,
	include?: string[],
	includesFiles?: boolean
}

const requestHasBody = ( method: HTTPMethod ): boolean => (
	method === HTTPMethod.POST || method === HTTPMethod.PATCH || method === HTTPMethod.PUT
);

export default class ApiEntityService<T> {
	readonly api: Api;
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
		{ includesFiles, include }: RequestWithBodyConfig = {}
	): Promise<T> {
		return this.request( {
			method: HTTPMethod.POST,
			url: `${this.createPath}`,
			attributes,
			config: { include, includesFiles }
		} ) as Promise<T>;
	}

	update(
		id: number,
		attributes: Attributes,
		{ includesFiles, include }: RequestWithBodyConfig = {}
	): Promise<T | null> {
		return this.request( {
			method: HTTPMethod.PATCH,
			url: `${this.updatePath( id )}`,
			attributes,
			config: { include, includesFiles }
		} ) as Promise<T | null>;
	}

	fetch( id: number, { include }: RequestCofig = {} ): Promise<T> {
		return this.request( {
			method: HTTPMethod.GET,
			url: this.defaultResourcePathForId( id ),
			config: { include }
		} ) as Promise<T>;
	}

	fetchAll( { include }: RequestCofig = {} ): Promise<T[]> {
		return this.request( {
			method: HTTPMethod.GET,
			url: `${this.listPath}`,
			config: { include }
		} ) as Promise<T[]>;
	}

	delete( id: number, { include }: RequestCofig = {} ): Promise<null> {
		return this.request( {
			method: HTTPMethod.DELETE,
			url: `${this.deletePath( id )}`,
			config: { include }
		} ) as Promise<null>;
	}

	async request( {
		method = HTTPMethod.GET,
		url,
		attributes,
		config: { includesFiles = false, include = [] }
	}: RequestParameters ): Promise<null | T | T[]> {
		const response = await this
			.makeRequest( {
				method, url, attributes, include, includesFiles
			} );

		const { data } = response;
		const parsedResponse = this.parseResponse( data );

		return this.createEntities( parsedResponse );
	}

	private makeRequest = ( {
		method,
		url,
		attributes,
		include = [],
		includesFiles = false
	}: MakeRequestParameters ) => {
		const urlWithInclude = addIncludeToURL( { url, include } );
		const apiCall = this.api[ method ].bind( this.api );

		if ( !requestHasBody( method ) ) {
			return apiCall( urlWithInclude );
		}

		return apiCall(
			urlWithInclude,
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

	private updatePath( id: number ): string {
		return this.paths.update || this.defaultResourcePathForId( id );
	}

	private deletePath( id: number ): string {
		return this.paths.delete || this.defaultResourcePathForId( id );
	}

	private defaultResourcePathForId( id: number ): string {
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
