const {resolve} = require('path');
const Joi = require('joi');
const Pipes = require('./pipes');
const {name: pluginName} = require('../package.json');


class SchemaValidator {
  get pipes() {
    return Pipes;
  }

  init(config, pluginContext) {
    this.pluginContext = pluginContext;
    this.errors = pluginContext.errors;
    this.schemas = loadAllSchemas(config.schemas);
  }

  validate(request, next) {
    const collection = request.collection;

    const schemaConfig = this.schemas[collection];
    if (!isSchemaActive(schemaConfig)) {
      return next(null, request);
    }

    const schema = schemaConfig.schema;
    const options = Object.assign({}, schemaConfig.options);

    const getContext = schema.getContext || Promise.resolve();

    getContext(request, this.pluginContext)
      .then(context => {
        options.context = Object.assign({}, options.context, context);

        Joi.validate(request.data.body, schema, options, (error, body) => {
          if (error) {
            error = new this.errors.BadRequestError(pluginMessage(error.message));
            return next(error, request);
          }

          request.data.body = body;
          next(null, request);
        });
      });
  }
}


function pluginMessage(message) {
  return `${pluginName}: ${message}`;
}

function loadSchema(collection, workingDir, path) {
  path = resolve(workingDir, path);
  try {
    return require(path);
  } catch (error) {
    throw new Error(pluginMessage(
      `loading '${collection}' schema from '${path}' failed: ${error.message}`
    ));
  }
}

function loadAllSchemas(schemas) {
  schemas = Object.assign({}, schemas);
  const workingDir = process.cwd();

  for (const collection in schemas) {
    const schemaConfig = schemas[collection];
    if (!isSchemaActive(schemaConfig)) continue;

    const schema = loadSchema(collection, workingDir, schemaConfig.path);
    schemaConfig.schema = schema;
  }

  return schemas;
}

function isSchemaActive(schemaConfig) {
  return schemaConfig && schemaConfig.activated !== false;
}


module.exports = SchemaValidator;
