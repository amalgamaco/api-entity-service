export default class ApiMock {
	constructor() {
		this.request = jest.fn( () => Promise.resolve() );
	}
}
