
const mongodb = require('mongodb');
const Promise = require('bluebird');
const utilities = require('underscore');

const DEFAULT_PAGINATION = {skip: 0, limit: 0};
const DEFAULT_DESTROY_OPTIONS = {
  forcefully: false,
};

const MONGODB_DATA_MAPPER_PROTOTYPE = {
  // Life-cycle methods.
  *initialize(options = {}) {
    if (propertiesAreMissing(['dbUri', 'factory', 'collectionName'], options)) {
      throw new Error('Missing `dbUri`, `factory` or `collectionName`');
    }

    const {dbUri, factory, collectionName} = options;

    if (!isValidConnectionUri(dbUri)) throw new Error('`dbUri` is malformed.');
    if (!isValidFactoryFunction(factory)) throw new Error('`factory` is invalid.');
    if (!isValidCollectionName(collectionName)) throw new Error('`collectionName` is invalid.');

    const db = yield mongodb.MongoClient.connect(dbUri);

    this.db = db;
    this.collection = db.collection(collectionName);
    this.factory = this.createEntityFrom = factory;
  },
  *destroy({forcefully} = DEFAULT_DESTROY_OPTIONS) {
    yield this.db.close(forcefully);
  },
  // CRUD methods.
  *save(entity) {
    if (!this.factory.isFactoryOf(entity))
      throw new Error(`Can only save instances of ${this.factory.name}`);

    const document = mapEntityToDocument(entity);

    yield this.collection.insert(document);
  },
  *find(query = {}, projection = {}, sorting = {}, {skip, limit} = DEFAULT_PAGINATION) {
    return yield Promise.resolve(
      this.collection
      .find(query, projection)
      .sort(sorting)
      .skip(skip)
      .limit(limit)
      .toArray()
    )
    .map( mapDocumentToEntity )
    .map( this.createEntityFrom );
  },
  *update(id, entity) {
    if (!this.factory.isFactoryOf(entity))
      throw new Error(`Can only update instances of ${this.factory.name}`);

    const matchingId = {_id: id};
    const properties = getEntityWithoutId(entity);
    const update = {$set: properties};

    const {value: updatedDocument} = yield this.collection
    .findOneAndUpdate(matchingId, update, {returnOriginal: false});

    const updatedEntity = this.createEntityFrom(
      mapDocumentToEntity(updatedDocument)
    );

    return updatedEntity;
  },
  *remove(id) {
    const matchingId = {_id: id};

    const {value: deletedDocument} = yield this.collection
    .findOneAndDelete(matchingId);
    const deletedEntity = this.createEntityFrom(
      mapDocumentToEntity(deletedDocument)
    );

    return deletedEntity;
  },
};

module.exports = MONGODB_DATA_MAPPER_PROTOTYPE;

/**
 * Helpers
 */
function propertiesAreMissing(properties, obj) {
  return properties.map(p => !utilities.has(obj, p)).reduce((p, c) => p && c);
}

function isValidConnectionUri(uri) {
  // NOTE: For now, a valid connection URI is a string starting with `mongodb://`.
  return utilities.isString(uri) && uri.startsWith('mongodb://');
}

function isValidFactoryFunction(factory) {
  return utilities.isFunction(factory) && factory.isFactoryOf && utilities.isFunction(factory.isFactoryOf);
}

function isValidCollectionName(collectionName) {
  return utilities.isString(collectionName);
}

function getEntityWithoutId(entity) {
  return utilities.omit(entity, 'id');
}

function getDocumentWithoutId(document) {
  return utilities.omit(document, '_id');
}

function mapEntityToDocument(entity) {
  const entityId = entity.id;
  const entityWithoutId = getEntityWithoutId(entity);
  const document = Object.assign({}, entityWithoutId, {_id: entityId});

  return document;
}

function mapDocumentToEntity(document) {
  const documentId = document._id;
  const documentWithoutId = getDocumentWithoutId(document);
  const entity = Object.assign({}, documentWithoutId, {id: documentId});

  return entity;
}
