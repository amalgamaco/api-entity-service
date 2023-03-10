# Reference

This library provide implementations for:

- __The service itself__:
  - [ApiEntityService](classes/api_entity_service.md): The main class of the package and provides an abstraction for an REST Api resource.
- __Api response parsers__:
  - [JSONApiParser](classes/json_api_parser.md): A parser for JSON API responses.
  - [SchemaParser](classes/schema_parser.md): A parser for REST API responses following a provided schema.
- __Api error parsers__:
  - [JSONApiErrorParser](classes/json_api_error_parser.md): Parses error responses in JSON Api format.
- __Entities creators__:
  - [EntityCreator](classes/entity_creator.md): Creates the entities included in a parsed response in their corresponding stores.

If you want to know how all this elements work together please refer to the [Usage](./usage.md) section.

## Types

For a complete list of all the types exported by this library please refer to the [Types](./types.md) section.

## Errors

For a complete list of all the errors that can be thrown when using the library please refer to the [Errors](./errors.md) section.
