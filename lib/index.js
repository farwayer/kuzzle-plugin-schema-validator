const {resolve} = require('path');
const Joi = require('joi');
const Pipes = require('./pipes');
const {name: pluginName} = require('../package.json');


function pluginError(message) {
  return new Error(`${pluginName}: ${message}`);
}


class SchemaValidator {
  constructor() {
    this.pipes = Pipes;
  }

  init(config) {
    this.schemas = config.schemas;
  }

  validate(request, next) {
    const collection = request.collection;
    const schemaConfig = this.schemas[collection];
    if (!schemaConfig) {
      return next(null, request);
    }

    const options = schemaConfig.options;
    const path = resolve(process.cwd(), schemaConfig.path);

    try {
      var schema = require(path);
    } catch (_) {
      const error = pluginError(`'${collection}' schema not found at ${path}`);
      return next(error, request);
    }

    Joi.validate(request.data.body, schema, options, (error, body) => {
      if (error) {
        return next(error, request);
      }

      request.data.body = body;
      next(null, request);
    });
  }
}


module.exports = SchemaValidator;
