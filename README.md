# Kuzzle data validation plugin

Simple data validation plugin for [Kuzzle](http://kuzzle.io/) back-end. It's verifying input data before writing it to database or publishing. It is based on [Joi](https://github.com/hapijs/joi) schemas.

## Installation

`kuzzle plugins --install --npmVersion x.y.z kuzzle-plugin-schema-validator`

## Config

Schemas keys are collection names and values are object with path to Joi validator scheme. `options` will be passed to Joi [`validate()`](https://github.com/hapijs/joi/blob/v9.1.0/API.md#validatevalue-schema-options-callback).

```json
{
  "schemas": {
    "users": {
      "path": "/absolute/path/to/schemas/user",
      "options": {"abortEarly": false}
    },
    "posts": {"path": "relative/path/to/nodejs/working/dir/posts"}
  }
}
```

Importing config:  

`kuzzle plugins --importConfig config.json kuzzle-plugin-schema-validator`

## Schema example

```javascript
const Joi = require('joi');

module.exports = Joi.object().keys({
  title: Joi.string().required(),
  text: Joi.string().required(),
  likes: Joi.number().integer().positive()
});
```
