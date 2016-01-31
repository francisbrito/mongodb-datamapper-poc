const test = require('blue-tape');
const utilities = require('underscore');
const coroutine = require('co');

const MongoDbDataMapper = require('../');

const Person = require('./mocks/person');

const OPTIONS = {
  dbUri: 'mongodb://localhost/test',
  factory: Person,
  collectionName: 'people',
};

const OPTIONS_WITH_MALFORMED_DB_URI = {
  dbUri: 'foo',
  factory: Person,
  collectionName: 'people',
};

test('#initialize throws if `dbUri` option is missing.', createTestCase(function* (assert) {
  const testDataMapper = Object.create(MongoDbDataMapper);
  const withMissingDbUri = getOptionsWithout('dbUri', OPTIONS);
  const intializeWithMissingDbUri = createDataMapperInitializer(withMissingDbUri, testDataMapper);
  const expectedDbUriMissingMessage = /`dbUri` is missing/gi;

  assert.throws(
    () => intializeWithMissingDbUri(),
    expectedDbUriMissingMessage,
    'should throw if `dbUri` is missing.'
  );
}));

test('#initialize throws if `dbUri` option is malformed.', createTestCase(function* (assert) {
  const testDataMapper = Object.create(MongoDbDataMapper);
  const withMalformedDbUri = OPTIONS_WITH_MALFORMED_DB_URI;
  const initializeWithMalformedDbUri =
  createDataMapperInitializer(withMalformedDbUri, testDataMapper);
  const expectedDbUriMalformedMessage = /`dbUri` is malformed/gi;

  assert.throws(
    () => initializeWithMalformedDbUri(),
    expectedDbUriMalformedMessage,
    'should thorw if `dbUri` is malformed.'
  );
}));

test('#initialize throws if `factory` option is missing.', createTestCase(function* (assert) {
  const testDataMapper = Object.create(MongoDbDataMapper);
  const withMissingFactory = getOptionsWithout('factory', OPTIONS);
  const initializeWithMissingFactory =
  createDataMapperInitializer(withMissingFactory, testDataMapper);
  const expectedFactoryMissingMessage = /`factory` is missing/gi;

  assert.throws(
    () => initializeWithMissingFactory(),
    expectedFactoryMissingMessage,
    'should throw if `factory` is missing.'
  );
}));

test('#initialize throws if `collectionName` option is missing.',
createTestCase(function* (assert) {
  const testDataMapper = Object.create(MongoDbDataMapper);
  const withMissingCollectionName = getOptionsWithout('collectionName', OPTIONS);
  const initializeWithMissingCollectionName =
  createDataMapperInitializer(withMissingCollectionName, testDataMapper);
  const expectedCollectionNameMissingMessage = /`collectionName` is missing/gi;

  assert.throws(
    () => initializeWithMissingCollectionName(),
    expectedCollectionNameMissingMessage,
    'should throw if `collectionName` is missing.'
  );
}));

function createTestCase(fn) {
  return coroutine.wrap(fn);
}

function getOptionsWithout(property, options) {
  return utilities.omit(options, property);
}

function createDataMapperInitializer(options, mapper) {
  return () => mapper.initialize(options).next();
}
