const isFunction = require('underscore').isFunction;
const isValidUuid = require('validator').isUUID;
const generateUuid = require('uuid').v4;

const TODO_PROTOTYPE = {
  toJSON() {
    const {id, done, text} = this;

    return {
      id,
      done,
      text,
    };
  },
  markAsDone() {
    this.done = true;
  },
};

function Todo(properties) {
  // Allow calling this constructor without the `new` keyword.
  if (!(this instanceof Todo)) return new Todo(properties);

  const id = isValidUuid(properties.id) ? properties.id : generateUuid();
  const {done, text} = properties;

  this.id = id;
  this.done = !!done;
  this.text = text || '';
}

Todo.isFactoryOf = (properties) => {
  const {id} = properties;

  if (!hasFields(['id', 'done', 'text'], properties)) return false;
  if (!isValidUuid(id)) return false;
  if (!hasValidToJsonMethod(properties)) return false;

  return true
};

Object.setPrototypeOf(Todo.prototype, TODO_PROTOTYPE);

exports.Todo = Todo;

/**
 * Helpers
 */
function hasFields(fields, obj) {
  return fields.map(f => f in obj).reduce((p, c) => p && c);
}

function hasValidToJsonMethod(obj) {
  return obj.toJSON && isFunction(obj.toJSON); /* && obj.toJSON === TODO_PROTOTYPE.toJSON // limits extensability (?) */
}
