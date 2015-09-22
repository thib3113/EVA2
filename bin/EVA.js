EVA = function(){
    this.version = "0.0.5"
    curEVA = this;
    this.is_nodeWebkit = false;
    this.is_focus = false;
    this._const = {};
    this.config = {};
    this.defaultConfig = {};

    this.previousSnack = null;
    this.is_devTimer = null;
    this.is_devCounter = 0;

    this._init = function(){
        this.checkVersion();
        this.setConst();
        this.loadConfiguration();
        this.setListener();
        this.setAbout();
        this.configureWindow();
        this.connectToServer(this.config.server);
    }

    this.close = function(){
        var gui = require('nw.gui');
        win = gui.Window.get();
        win.close();
    }

    this.setListener = function(){
      var gui = require('nw.gui');
      gui.Window.get().on('focus', function() {
        curEVA.is_focus = true;
      });
      gui.Window.get().on('blur', function() {
        curEVA.is_focus = false;
      });
      $('[data-control]').on('click', function(){
        control = $(this).data("control");
        var gui = require('nw.gui');
        win = gui.Window.get();
        
        switch(control){
            case "open_dev_tools":
                if(win.isDevToolsOpen())
                    win.closeDevTools();
                else
                    win.showDevTools();
            break;
            case "minimize_window":
                win.minimize();
            break;
            case "maximize_window":
                if(win.width < screen.availWidth && win.height < screen.availHeight)
                    win.maximize();
                else
                    win.unmaximize();
            break;
            case "close_window":
                curEVA.close();
            break;
        }
      });
      $('[data-action="go_dev"]').on('click', function() {
        if(!curEVA.config.user.is_dev){
            if(curEVA.is_devTimer != null)
                clearTimeout(curEVA.is_devTimer);
            curEVA.is_devCounter++;

            if(curEVA.is_devCounter == 7){
                curEVA.notify("Vous êtes développeur !", null, null , null, true);
                curEVA.config.user.is_dev = true;
                curEVA.saveConfig();
            }
            else{
                if(curEVA.is_devCounter > 3){
                    curEVA.notify("Encore "+(7-curEVA.is_devCounter)+" clic"+(7-curEVA.is_devCounter>1?"s":""), null, null , null, true);
                }
                curEVA.is_devTimer = setTimeout(function(){
                    curEVA.is_devCounter = 0;
                }, 5000);
            }
        }
        else{
            curEVA.notify("Vous êtes déjà développeur !", null, null , null, true);
        }
      });
    }

    this.setAbout = function(){
        this.about = {
            "version": "EVA "+curEVA.version,
            "OS": this._const.navigator.os.name+" "+this._const.navigator.os.version,
        }
    }

    this.checkVersion = function(){
        var fs = require('fs');
        _package = JSON.parse(fs.readFileSync('package.json').toString());
        
        if(this.version != _package.version){
            throw new Error("Version mismatch !!");
        }
    }

    this.configureWindow = function(){
        if(!this.is_nodeWebkit){
            return;
        }
        if(typeof this.config.window != "undefined"){
            var gui = require('nw.gui');
            var win = gui.Window.get();

            if(this.config.window.width === parseInt(this.config.window.width, 10) && this.config.window.height === parseInt(this.config.window.height, 10) ){
                win.resizeTo(this.config.window.width, this.config.window.height);
            }      
        }

        //on ajoute boutons de controls
        $("html").addClass(this._const.navigator.os.name.toLowerCase()).addClass(this._const.navigator.browser.name.toLowerCase());
        if(curEVA.config.user.is_dev){
            $("html").addClass("is_dev");
        }
    }

    this._mergeObj = function(objects) {
        var args
            , first = Array.prototype.slice.call(arguments, 0, 1)[0]
            , second;

        if (arguments.length > 1) {
            second = Array.prototype.splice.call(arguments, 1, 1)[0];
            for (var key in second) {
                first[key] = second[key];
            }
            args = Array.prototype.slice.call(arguments, 0);
            return this._mergeObj.apply(this, args);
        }

        return first;
    }

    this._arrayClone = function(pArr){return pArr.slice(0)}

    this.populateSettings = function(){
        $('[data-config]').each(function(){
            if(!$(this).data("config").match(/\./)){
                if(curEVA.config.hasOwnProperty($(this).data("config"))){
                    $(this).val(curEVA.config[$(this).data("config")]).trigger("change");
                }
            }
            else{
                lastObj = curEVA.config;
                list = $(this).data("config").replace(/settings_/, '').split(".");
                for(obj in list){
                    if(lastObj.hasOwnProperty(list[obj])){
                        lastObj = lastObj[list[obj]];
                    }
                }
                if(lastObj !== curEVA.config){
                    $(this).val(lastObj).trigger("change");                    
                }
            }
        })
    }

    this.populateAbout = function(){
        $('[data-about]').each(function(){
            $(this).data("about")
            if(curEVA.about.hasOwnProperty($(this).data("about"))){
                $(this).html(curEVA.about[$(this).data("about")]);
            }
        });
    }

    this.saveSettings = function(){
        $('[data-config]').each(function(){
            if(!$(this).data("config").match(/\./)){
                curEVA.config[$(this).data("config")] = $(this).val();
            }
            else{
                list = $(this).data("config").replace(/settings_/, '').split(".");
                curEVA.saveSettingsRecursive(curEVA.config, list, $(this).val())
            }
        })
        //si les paramètres de la fenètres ont changés
        this.configureWindow();
        this.saveConfig();
    }

    this.saveSettingsRecursive = function(obj, list, pVal){
        if(list.length > 0){
            obj[list[0]] = this.saveSettingsRecursive(obj[list[0]], list.slice(1), pVal)
            return obj;
        }
        else{
            return (!!parseInt(pVal))? parseInt(pVal) : (!!parseFloat(pVal))? parseFloat(pVal) : pVal ;
        }
    }

    this.saveConfig = function(){
        if(this.is_nodeWebkit){
            fs = require("fs");
            fs.writeFile("data/config.json", JSON.stringify(this.config, null, 2), function(err) {
                if(err) {
                    curEVA.notify("Erreur lors de la sauvegarde", err);
                }

                curEVA.notify("Sauvegarde des paramètres réussie", "La sauvegarde des paramètres à réussie");
            }); 
        }
    }

    this.showNotification = function(pBody, pIcon, pTime , pEvents){
        title = "Nouvelle notification - EVA";
        body = pBody || "";
        icon = pIcon || "icon.png";
        time = pTime || 5000; //5s
        defEvents = {
            onclick:null,
            onclose:null,
            onerror:null,
            onshow:null
        }
        FnEvents = this._mergeObj(defEvents, pEvents);
        if(this.is_nodeWebkit){
            path = require("path");
            if(!path.isAbsolute(icon)){
                icon = path.dirname(process.mainModule.filename)+path.sep+"assets"+path.sep+"images"+path.sep+icon;
            }

            var options = {
              "icon": icon,
              "body": body
             };
            var notification = new Notification(title,options);

            var checkEvent = function(pEvent, pNotification){
                if(typeof FnEvents[pEvent] == "function"){
                    FnEvents[pEvent]();
                }
                if(pEvent == "onshow"){
                    setTimeout(function() {pNotification.close();}, time);
                }
            }
            notification.onclick = function(){checkEvent("onclick", this);}
            notification.onshow  = function(){checkEvent("onshow", this);}
            notification.onclose = function(){checkEvent("onclose", this);}
            notification.onerror = function(){checkEvent("onerror", this);}
        }
    }

    this.notify = function(pBody, pTime, pIcon , pEvents, pLight){
        if(this.is_focus){
            this.showSnackbar(pBody, pTime, pEvents, pLight);
        }
        else{
            this.showNotification(pBody, pIcon, pTime , pEvents);
            this.requestAttention(true);
        }
    }

    this.requestAttention = function(pVal){
        val = pVal || 1;
        if(this.is_nodeWebkit){
            var gui = require('nw.gui');
            gui.Window.get().requestAttention(val);
        }
    }

    this.showSnackbar = function(pMessage, pTime, pEvents, action) {
        message = pMessage || "";
        time = pTime || 5000; //5s
        defEvents = {
            onclick:null,
            onclose:null,
            onerror:null,
            onshow:null
        }
        FnEvents = this._mergeObj(defEvents, pEvents);
        if (curEVA.previousSnack) {
          curEVA.previousSnack.dismiss();
        }
        var snackbar = document.createElement('div');
        snackbar.className = 'paper-snackbar';
        snackbar.dismiss = function() {
          this.style.opacity = 0;
        };
        var text = document.createTextNode(message);
        snackbar.appendChild(text);
        var actionButton = document.createElement('button');
        actionButton.className = 'action';
        actionButton.innerHTML = "cacher";
        actionButton.addEventListener('click', function(){
            curEVA.previousSnack.dismiss();
        });
        snackbar.appendChild(actionButton);
        setTimeout(function() {
          if (curEVA.previousSnack === this) {
            curEVA.previousSnack.dismiss();
          }
        }.bind(snackbar), time);

        snackbar.addEventListener('transitionend', function(event, elapsed) {
          if (event.propertyName === 'opacity' && this.style.opacity == 0) {
            this.parentElement.removeChild(this);
            if (curEVA.previousSnack === this) {
              curEVA.previousSnack = null;
            }
          }
        }.bind(snackbar));



        this.previousSnack = snackbar;
        document.body.appendChild(snackbar);
        // In order for the animations to trigger, I have to force the original style to be computed, and then change it.
        getComputedStyle(snackbar).bottom;
        snackbar.style.bottom = '0px';
        snackbar.style.opacity = 1;
    }

    this.connectToServer = function(pServer){
        if(this.is_nodeWebkit){
            var io = require('socket.io-client');
            this.socket = io.connect(pServer);
            this.socket.on('connect', function () {
              curEVA.notify("Connecté au serveur EVA");
            });
            this.socket.on('disconnect', function () {
              curEVA.notify("Déconnecté du serveur EVA");
            });
            // this.socket.on('disconnect', function (pData) {
            //   curEVA.notify("Déconnecté du serveur");
            // });
        }
    }

    this.setConst = function(){
        if(typeof process != "undefined"){
            this.is_nodeWebkit = true;
            this._const.navigator = 
            { "browser":{
                name:"node-webkit",
                version: process.versions['node-webkit'],
                }
            };
            var parser = require('ua-parser-js');
        }
        else{
            this._navigatorExtend();
            this._const.navigator = 
            {
                name:window.navigator.browser,
            };
        }
        uaParsed = parser(navigator.userAgent);
        this._const.navigator = this._mergeObj(uaParsed, this._const.navigator);

    }

    this.loadConfiguration = function(){
        if(this.is_nodeWebkit){
            var fs = require('fs');
            config = JSON.parse(fs.readFileSync('data/config.json').toString());
        }
        this.config = this._mergeObj(this.defaultConfig, config);
    }

    /** navigator [extended]
     *  Simply extends Browsers navigator Object to include browser name, version number, and mobile type (if available).
     *
     *  @property {String} browser The name of the browser.
     *  @property {Double} version The current Browser version number.
     *  @property {String|Boolean} Will be `false` if is not found to be mobile device. Else, will be best guess Name of Mobile Device (not to be confused with browser name)
     */
    this._navigatorExtend = function(){
        ;;navigator&&(navigator.browser=void 0,navigator.version=void 0,navigator.mobile=!1,navigator.userAgent&&(navigator.webkit=/WebKit/i.test(navigator.userAgent),/Sony[^ ]*/i.test(navigator.userAgent)?navigator.mobile="Sony":/RIM Tablet/i.test(navigator.userAgent)?navigator.mobile="RIM Tablet":/BlackBerry/i.test(navigator.userAgent)?navigator.mobile="BlackBerry":/iPhone/i.test(navigator.userAgent)?navigator.mobile="iPhone":/iPad/i.test(navigator.userAgent)?navigator.mobile="iPad":/iPod/i.test(navigator.userAgent)?
        navigator.mobile="iPod":/Opera Mini/i.test(navigator.userAgent)?navigator.mobile="Opera Mini":/IEMobile/i.test(navigator.userAgent)?navigator.mobile="IEMobile":/BB[0-9]{1,}; Touch/i.test(navigator.userAgent)?navigator.mobile="BlackBerry":/Nokia/i.test(navigator.userAgent)?navigator.mobile="Nokia":/Android/i.test(navigator.userAgent)&&(navigator.mobile="Android"),/MSIE|Trident/i.test(navigator.userAgent)?(navigator.browser="MSIE",navigator.version=/MSIE/i.test(navigator.userAgent)&&0<parseFloat(navigator.userAgent.split("MSIE")[1].replace(/[^0-9\.]/g,
        ""))?parseFloat(navigator.userAgent.split("MSIE")[1].replace(/[^0-9\.]/g,"")):"Edge",/Trident/i.test(navigator.userAgent)&&/rv:([0-9]{1,}[\.0-9]{0,})/.test(navigator.userAgent)&&(navigator.version=parseFloat(navigator.userAgent.match(/rv:([0-9]{1,}[\.0-9]{0,})/)[1].replace(/[^0-9\.]/g,"")))):/Chrome/.test(navigator.userAgent)?(navigator.browser="Chrome",navigator.version=parseFloat(navigator.userAgent.split("Chrome/")[1].split("Safari")[0].replace(/[^0-9\.]/g,""))):/Opera/.test(navigator.userAgent)?
        (navigator.browser="Opera",navigator.version=parseFloat(navigator.userAgent.split("Version/")[1].replace(/[^0-9\.]/g,""))):/Kindle|Silk|KFTT|KFOT|KFJWA|KFJWI|KFSOWI|KFTHWA|KFTHWI|KFAPWA|KFAPWI/i.test(navigator.userAgent)?(navigator.mobile="Kindle",/Silk/i.test(navigator.userAgent)?(navigator.browser="Silk",navigator.version=parseFloat(navigator.userAgent.split("Silk/")[1].split("Safari")[0].replace(/[^0-9\.]/g,""))):/Kindle/i.test(navigator.userAgent)&&/Version/i.test(navigator.userAgent)&&(navigator.browser=
        "Kindle",navigator.version=parseFloat(navigator.userAgent.split("Version/")[1].split("Safari")[0].replace(/[^0-9\.]/g,"")))):/BlackBerry/.test(navigator.userAgent)?(navigator.browser="BlackBerry",navigator.version=parseFloat(navigator.userAgent.split("/")[1].replace(/[^0-9\.]/g,""))):/PlayBook/.test(navigator.userAgent)?(navigator.browser="PlayBook",navigator.version=parseFloat(navigator.userAgent.split("Version/")[1].split("Safari")[0].replace(/[^0-9\.]/g,""))):/BB[0-9]{1,}; Touch/.test(navigator.userAgent)?
        (navigator.browser="Blackberry",navigator.version=parseFloat(navigator.userAgent.split("Version/")[1].split("Safari")[0].replace(/[^0-9\.]/g,""))):/Android/.test(navigator.userAgent)?(navigator.browser="Android",navigator.version=parseFloat(navigator.userAgent.split("Version/")[1].split("Safari")[0].replace(/[^0-9\.]/g,""))):/Safari/.test(navigator.userAgent)?(navigator.browser="Safari",navigator.version=parseFloat(navigator.userAgent.split("Version/")[1].split("Safari")[0].replace(/[^0-9\.]/g,""))):
        /Firefox/.test(navigator.userAgent)?(navigator.browser="Mozilla",navigator.version=parseFloat(navigator.userAgent.split("Firefox/")[1].replace(/[^0-9\.]/g,""))):/Nokia/.test(navigator.userAgent)&&(navigator.browser="Nokia",navigator.version=parseFloat(navigator.userAgent.split("Browser")[1].replace(/[^0-9\.]/g,"")))));
    }
    this._init();
}
E = new EVA();