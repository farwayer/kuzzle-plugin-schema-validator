# Kuzzle data validation plugin

         ▄▄▄▄▄      ▄███▄      ▄▄▄▄
      ▄█████████▄▄█████████▄▄████████▄
     ██████████████████████████████████
      ▀██████████████████████████████▀
       ▄███████████████████████████▄
     ▄███████████████████████████████▄
    ▀█████████████████████████████████▀
      ▀██▀        ▀██████▀       ▀██▀
             ██     ████    ██
                   ▄████▄
                   ▀████▀
                     ▀▀

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
    "posts": {
      "path": "relative/path/to/nodejs/working/dir/post",
      "options": {"context": {"defaultAuthor": "NoNaMe"}},
      "activated": false
    }
  }
}
```

Importing config:  

`kuzzle plugins --importConfig config.json kuzzle-plugin-schema-validator`

## Simple schema

```js
const Joi = require('joi');

module.exports = Joi.object().keys({
  title: Joi.string().required(),
  text: Joi.string().required(),
  likes: Joi.number().integer().min(0)
});
```

## Schema with context generator

```json
{
  "schemas": {
    "posts": {
      "path": "schemas/post",
      "options": {"context": {"defaultAuthor": "NoNaMe"}}
    }
  }
}
```

```js
const Joi = require('joi');


const Schema = Joi.object().keys({
  title: Joi.string().required(),
  text: Joi.string().required(),
  author: Joi.string().default(Joi.ref('$defaultAuthor'))
});

Schema.getContext = (request, pluginContext) => {
  const repositories = pluginContext.accessors.kuzzle.repositories;
  
  const token = getUserToken(request.headers);
  if (!token) return Promise.resolve();

  return repositories.token.verifyToken(token)
    .then(tokenData => repositories.user.load(tokenData.userId))
    .then(user => ({defaultAuthor: user.username}));
};


function getUserToken(headers) {
  if (!headers || !headers.authorization) {
    return null;
  }

  const res = /^Bearer (.+)$/.exec(headers.authorization);
  if (!res) return null;

  const token = res[1].trim();
  return token || null;
}


module.exports = Schema;
```

## F.A.Q

### Can I use custom validation?

Yes, check [Joi.extend()](https://github.com/hapijs/joi/blob/v9.1.0/API.md#extendextension) method. Some ready validators [can be find on npm](https://www.npmjs.com/search?q=joi+extension).


## Changelog

### 0.2.0

  - `getContext()` to provide dynamic schema data

### 0.1.0

  - schemas are loading at plugin init now (optimization)
  - `activated` schema config option; true by default
  - throwing `BadRequestError` if validation failed

### 0.0.2

Initial version
