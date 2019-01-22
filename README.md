# Driver Express for Blockbase
Compatible with Blockbase Framework

### Version
0.2.7

### How to install ?
```shell
$ npm i --save blockbase-express
```

Then add to your `config/{env}.yml` the following (example) instructions depending of your system
```yml
express :
    port: 1340
    open: true
    silent: false
    body_parser_limit : 50mb
    404_redirect : /404
    routes :
        - type: controller
          src: /foo/bar
          dest: /controllers/foo::bar
          method: get
        - type: view
          src: /
          dest: home
          method: get
```

(optional) You can also register routes in a seperated file `config/routes.yml` :

```yml
- type: controller
  src: /foo/bar
  dest: /controllers/foo::bar
  method: get
- type: view
  src: /
  dest: home
  method: get
```

### Options

- port : the port you want the server to be listening on. (default : 4000)
- open : open the app in your browser when the app starts (default : true)
- silent : disable error message when __No__ custom error handlers are used (default : false)
- body_parser_limit : content size limit to be parsed by Bodyparser
- 404_redirect : URL to redirect a user to when requesting a URL that doesn't exist
- assets : your project assets folder, at your project's root directory (ex : 'src/views/public') (default : 'views/assets')
- async_init : init drivers and models first, but not the controllers to allow you to do it manually (ex : if you want to use __express.use(morgan())__ ) (default : false)
- session_secret : your __express-session__ secret key
- session_redis_host : your __express-session__ host to your redis server (default localhost)
- session_redis_port : your __express-session__ port to your redis (default 6379)

### Usage
The entire usage of the driver is done by the `config/{env}.yml`, we've tried to make it as simple as it need.

#### Ports
The port is simply handled by the `config/{env}.yml` file in the port section of express.

```yml
express :
    port: 1340
    #...
```

The example above creates a server on `http://localhost:1340`


#### Routing
A route can have two type : `controller` or `view`.
As it looks like a controller will be a program call (in a `app.controller.*` controller) and a view will call a view in the folder `/views`.

The following routes are programmed as described below :

* controller
ex : creates a route on `localhost:1340/foo/bar` that will trigger the `app.controllers.foo.bar()` method on the GET method
```yml
      - type: controller
        src: /foo/bar
        dest: /controllers/foo::bar
        method: get
```

* view
ex : creates a route on `localhost:1340/` that will show the `/views/home.twig` template on the GET method
```yml
      - type: view
        src: /
        dest: home
        method: get
```

#### Middlewares

A middleware needs to have a destination `dest`, and can optionaly have a source `src` to define the path where to use it.
Example : 
```yaml
    - dest: uri-logger
    - dest: cors
      src: /login
    #...
```

Then, inside the /middleware folder, create a middleware using the following sample :
```js
//cors.js - /login
module.exports = (app) => {
    return function(req, res, next) {
        app.drivers.logger.log(`hello it's Middleware again on /login !`)
        next() //Continue to next middleware/route call
    }
}

```

#### Static Assets
Static assets can be stored in `/views/assets/*`
You can then call them directly from the route `localhost:port/assets/*`

You can override this outside route by adding the `assets` route config to the express configuration

```yml
express :
    assets: /static
    #...
```

#### Body Parser
The [https://www.npmjs.com/package/body-parser](body parser) is a critical sub-library really useful when creating APIs, it handles the JSON support of the route and will create a security layer on the size of your requests.

You can set up the bodyparser limit with the `body_parser_limit` parameter.
To see what to put inside this key please refer to the [https://www.npmjs.com/package/body-parser#limit](lib doc section).

```yml
express :
    body_parser_limit: /50mb
    #...
```

#### Redirects
The driver handles automatically 404 redirections to improve security and SEO compliance.
Just add the route you wanna you for your 404 in the `404_redirect` section

```yml
express :
    404_redirect: /notfound
    #...
    routes :
        #...
        - type: view
          src: /notfound
          dest: fourOfour
          method: get
    #...
```

The example above will redirect all 404 responses to /notfound handled by the four0four html template.

#### Async Init
Due to Blockbase architecture, drivers & models are created before controllers. However if you use controllers related routes, you might need to force Express to wait until the controllers are ready to listen & use addons.

In order to do that, two steps :

Add the boolean `async_init` to the config/{env}.yml in the express section :
```yml
express :
    async_init : true
    #...
    routes :
        #...
        #...
```

Then manually trigger `app.drivers.express.route` and `app.drivers.express.listen` after the app init in the main blockbase callback.
```js
blockbase({ root : __dirname }, (app) => {
    app.drivers.express.route()
    app.drivers.express.listen()
})
```

#### Sessions
blockbase-express driver includes a native support of the [express-session](https://www.npmjs.com/package/express-session) driver (with Redis).

To activate it, you just have to fill the following infos :
```yml
express :
    session : true
    session_secret : hereYourSecretKey
    session_redis_host : host to your redis server (default localhost)
    session_redis_port : port to your redis (default 6379)
```

The `session_secret` key is mandatory in order to secure your sessions. Try to use a cool rock-solid hash :)

Be also careful `redis` is mandatory when you use session...

Issues
-
If you find any issue, feel free to post it in the [repo on Github](https://github.com/blacksmithstudio/blockbase-express/issues)

License
----
(Licence [MIT](https://github.com/blacksmithstudio/blockbase-express/blob/master/LICENCE))
Coded by [Blacksmith](https://www.blacksmith.studio)


**Free Software, Hell Yeah!**

[Node.js]:https://nodejs.org/en
[NPM]:https://www.npmjs.com
