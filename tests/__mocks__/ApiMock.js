export default class ApiMock {
	constructor() {
		this.get = jest.fn( () => Promise.resolve() );
		this.post = jest.fn( () => Promise.resolve() );
		this.patch = jest.fn( () => Promise.resolve() );
		this.delete = jest.fn( () => Promise.resolve() );
		this.put = jest.fn( () => Promise.resolve() );
	}
}
