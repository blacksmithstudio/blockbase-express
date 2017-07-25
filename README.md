# Driver Express for Blockbase
Compatible with Blockbase Framework

### Version
0.0.1 alpha

### How to install ?
```shell
$ npm i --save @blacksmithstudio/blockbase-express
```

Then add to your `config/{env}.yml` the following (example) instructions depending of your system
```yml
express :
    port: 1340
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

### Usage
The entire usage of the driver is done by the `config/{env}.yml`, we've made tried to make it as simple as it need.

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
ex : creates a route on `localhost:1340/` that will show the `/views/home.html` template on the GET method
```yml
      - type: view
        src: /
        dest: home
        method: get
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

License
----

(Copyright) 2017 - Alexandre Pereira for Blacksmith S.A.S.


**Free Software, Hell Yeah!**

[Node.js]:https://nodejs.org/en
[NPM]:https://www.npmjs.com
