# API Entity Service

A set of services to provide an easy way to interact with a REST API resource and abstract common CRUD operations handling:

- The creation of the requests to the REST API service depending on the called method following REST conventions to decide which path and type of request to use.
- Parsing the REST API response using the provided attributes mappers.
- Creating the local entities in their corresponding stores. Taking care of setting up the relations between them correctly.

## Getting Started

### Installation
Run the following command to add the `ApiEntityService` library to your project:

```bash
yarn add @amalgamaco/api-entity-service
```
or
```bash
npm install @amalgamaco/api-entity-service
```

### Usage
For instructions on how to use this library you can go to the [Usage](./docs/usage.md) section.

## Reference
For a more detailed api reference for the provided classes you can go the [Reference](./docs/reference.md) section.
