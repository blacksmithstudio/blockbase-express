# Driver Express for Blockbase
Compatible with Blockbase Framework

### Version
0.0.1 alpha

### How to install ?
```shell
$ npm i --save @blacksmithstudio/blockbase-express
```

Then add to your config/{env}.yml the following (example) instructions depending of your system
```yml
express :
    port: 1340
    body_parser_limit : 50mb
    404_redirect : /404
    500_redirect : /oups
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

License
----

(Copyright) 2017 - Alexandre Pereira for Blacksmith S.A.S.


**Free Software, Hell Yeah!**

[Node.js]:https://nodejs.org/en
[NPM]:https://www.npmjs.com
