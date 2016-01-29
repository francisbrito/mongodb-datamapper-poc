const Promise = require('bluebird');
const toCoroutine = require('co');

const Todo = require('./models').Todo;
const MongoDbDataMapper = require('./');

Promise
.resolve(toCoroutine(function* () {
  const todoDataMapper = Object.create(MongoDbDataMapper);

  yield todoDataMapper.initialize({
    dbUri: 'mongodb://localhost/test',
    factory: Todo,
    collectionName: 'todos',
  });

  const myNewTodo = new Todo({
    text: 'Test Data-Mapper concept.'
  });

  yield todoDataMapper.save(myNewTodo);

  const todos = yield todoDataMapper.find();

  console.log(todos);

  myNewTodo.markAsDone();

  const updatedTodo = yield todoDataMapper.update(myNewTodo.id, myNewTodo);

  console.log(updatedTodo);

  const deletedTodo = yield todoDataMapper.remove(updatedTodo.id);

  console.log(deletedTodo);

  yield todoDataMapper.destroy();
}));
