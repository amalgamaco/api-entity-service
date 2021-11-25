import {
	addIncludeToURL, headersForRequest, serializeRequestDataForContentType
} from '../helpers/requests';

const requestHasBody = method => (
	method === 'post' || method === 'patch' || method === 'put'
);
export default class ApiEntityService {
	constructor( {
		api, basePath, parser, creator, paths = {}
	} ) {
		this.api = api;
		this.basePath = basePath;
		this.parser = parser;
		this.creator = creator;
		this.paths = paths;
	}

	create( attributes, { includesFiles = false, include = [] } = {} ) {
		return this.request( {
			method: 'post',
			url: `${this.createPath}`,
			attributes,
			config: { include, includesFiles }
		} );
	}

	update( id, attributes, { includesFiles = false, include = [] } = {} ) {
		return this.request( {
			method: 'patch',
			url: `${this.updatePath( id )}`,
			attributes,
			config: { include, includesFiles }
		} );
	}

	fetch( id, { include = [] } = {} ) {
		return this.request( {
			method: 'get',
			url: this.#defaultResourcePathForId( id ),
			config: { include }
		} );
	}

	fetchAll( { include = [] } = {} ) {
		return this.request( {
			method: 'get',
			url: `${this.listPath}`,
			config: { include }
		} );
	}

	delete( id, { include = [] } = {} ) {
		return this.request( {
			method: 'delete',
			url: `${this.deletePath( id )}`,
			config: { include }
		} );
	}

	request( {
		method, url, attributes, config: { includesFiles = false, include = [] } = {}
	} ) {
		return this
			.#makeRequest( {
				method, url, attributes, include, includesFiles
			} )
			.then( response => response.data )
			.then( this.#parseResponse )
			.then( this.#createEntities );
	}

	#makeRequest = ( {
		method = 'get',
		url,
		attributes = null,
		include = [],
		includesFiles = false
	} ) => {
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
	}

	// Paths
	get createPath() {
		return this.paths.create || this.basePath;
	}

	get listPath() {
		return this.paths.list || this.basePath;
	}

	updatePath( id ) {
		return this.paths.update || this.#defaultResourcePathForId( id );
	}

	deletePath( id ) {
		return this.paths.delete || this.#defaultResourcePathForId( id );
	}

	#defaultResourcePathForId = id => (
		id ? `${this.basePath}/${id}` : this.basePath
	);

	// Parse and create
	#parseResponse = response => (
		response
			? this.parser.parse( response )
			: null
	);

	#createEntities = parsedResponse => (
		parsedResponse
			? this.creator.create( parsedResponse )
			: null
	)
}
