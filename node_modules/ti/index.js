/*
* 
*/
var Class = require('./lib/Class'),
    Route = require('./lib/Route'),
    Controller = require('./lib/Controller'),

    //node module
    http = require('http'),
    $url = require('url'),
    path_join = require('path').join,

    //类型
    // mime = {
    //     'html': 'text/html',
    //     'css': 'text/css',
    //     'js': 'application/javascript'
    // },
    //路由缓存
    routeArr = [],

    /* Application class construct */
    App = Class.create(function(options){

        options = options || {};

        var self = this,
            opt = {
                port:5927,
                baseUriIndex:0,
                routeSep:'/',
                controllerPath:'./controller',
                defaultController:'site',
                defaultAction:'index',
                viewPath:"./view",
                templatePluginPath:"./plugin/view"
            };

        App.currentApplication = self;

        routeArr[self.id] = {};

        for(var p in options){
            opt[p] = options[p];
        }

        
        //save opt
        self.opt = opt; 
        self.route = new Route(self,{
            routeSep:opt.routeSep,
            controllerPath:path_join(opt.controllerPath),
            defaultController:opt.defaultController,
            defaultAction:opt.defaultAction,
            baseUriIndex:opt.baseUriIndex
        });
        //配置controller
        Controller.configure({
            viewPath:opt.viewPath,
            templatePluginPath:opt.templatePluginPath
        });

        Controller.getApplication  = function(){
            return self;
        }

        self.route.addEventListener('error',function(code,message){
            self.fire('error.action',{
                code:code,
                message:message
            });
        });

        if(opt.routes && typeof opt.routes ==='object')
            self.addRoute(opt.routes)

        self.addEventListener('start',function(){
            //建立服务
            http.createServer(function(req,res){

                self.request = req;
                self.response = res;

                Controller.request = req;
                Controller.response = res;

                var urlObj = $url.parse(req.url), 
                    url = '';

                if(urlObj.pathname!='')
                    url = req.url.replace(urlObj.protocol+'//'+urlObj.host+'/'+urlObj.pathname)

                //获取正确的pathname
                if(opt.baseUriIndex)
                    url = url.split(opt.routeSep).slice(opt.baseUriIndex);


                self.fire('routerStartup',req,res,self.route);
                //解析路由
                try{
                    self.route.parse(req.url,req,res,self);
                }catch(e){
                    self.fire('error',e);
                }
                //路由解析完成
                self.fire('routerShutdown',req,res,self.route);

            }).listen(opt.port).on('error',function(e){
                self.fire('error',e)
            });
        });

    },
    /* Apolication class methods and propertys */
    {
        addRoute:function(strRoute,route){
            this.route.add(strRoute,route);
        },
        start:function(){
            if(this.__isruning)
                return console.error('Application is on runing');

            this.__isruning = true;
            this.fire('start');
        },
        addErrorHandle:function(handle){
            this.addEventListener('error.action',handle);
        }
    });



module.exports = {
    application:App,
    Controller:Controller,
    Class:Class,
    template:require('./lib/template')
};
