import {
	IEntityCreator, IErrorParser, IResponseParser, ParsedResponse,
	EntityID
} from '../types';
import {
	IApi, Attributes, Params, HTTPMethod, InitParameters,
	RequestWithBodyConfig, RequestParameters,
	MakeRequestParameters, EntityResponse,
	SingleEntityResponse, MultiEntityResponse, ICustomPaths
} from './ApiEntityService.types';
import NullErrorParser from '../errorParsers/NullErrorParser';

export default class ApiEntityService<T> {
	readonly api: IApi;
	readonly basePath: string;
	readonly parser: IResponseParser;
	readonly creator: IEntityCreator;
	readonly paths: ICustomPaths;
	readonly errorParser: IErrorParser;

	constructor( {
		api, basePath, parser, creator, paths = {}, errorParser = new NullErrorParser()
	}: InitParameters ) {
		this.api = api;
		this.basePath = basePath;
		this.parser = parser;
		this.creator = creator;
		this.paths = paths;
		this.errorParser = errorParser;
	}

	create(
		attributes: Attributes,
		params: Params = {},
		config: RequestWithBodyConfig = {}
	): Promise<SingleEntityResponse<T>> {
		return this.request( {
			method: HTTPMethod.POST,
			url: `${this.createPath}`,
			attributes,
			params,
			config
		} ) as Promise<SingleEntityResponse<T>>;
	}

	update(
		id: EntityID,
		attributes: Attributes,
		params: Params = {},
		config: RequestWithBodyConfig = {}
	): Promise<SingleEntityResponse<T> | null> {
		return this.request( {
			method: HTTPMethod.PATCH,
			url: `${this.updatePath( id )}`,
			attributes,
			params,
			config
		} ) as Promise<SingleEntityResponse<T> | null>;
	}

	fetch( id: EntityID, params: Params = {} ): Promise<SingleEntityResponse<T>> {
		return this.request( {
			method: HTTPMethod.GET,
			url: this.defaultResourcePathForId( id ),
			params,
			config: {}
		} ) as Promise<SingleEntityResponse<T>>;
	}

	fetchAll( params: Params = {} ): Promise<MultiEntityResponse<T>> {
		return this.request( {
			method: HTTPMethod.GET,
			url: `${this.listPath}`,
			params,
			config: {}
		} ) as Promise<MultiEntityResponse<T>>;
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
	}: RequestParameters ): Promise<EntityResponse<T> | null> {
		try {
			const response = await this
				.makeRequest( {
					method, url, attributes, params, includesFiles: config.includesFiles || false
				} );

			const parsedResponse = this.parseResponse( response );

			return this.createEntities( parsedResponse );
		} catch ( error ) {
			throw this.errorParser.parse( error );
		}
	}

	private makeRequest = ( {
		method,
		url,
		attributes,
		params,
		includesFiles = false
	}: MakeRequestParameters ) => (
		this.api.request( {
			method,
			path: url,
			params,
			data: attributes,
			sendAsFormData: includesFiles
		} )
	);

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

	private createEntities( parsedResponse: ParsedResponse | null ): EntityResponse<T> | null {
		if ( !parsedResponse ) return null;

		return {
			data: this.creator.create( parsedResponse ),
			meta: parsedResponse.meta
		};
	}
}
