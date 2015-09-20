EVA = function(){
    curEVA = this;
    this.is_nodeWebkit = false;
    this._const = {};
    this.config = {};
    this.defaultConfig = {};

    this._init = function(){
        this.setConst();
        this.loadConfiguration();
        this.connectToServer(this.config.server);
    }

    this._mergeObj = function(obj1, obj2){
        for(var method in obj2){
            obj1[method] = obj2[method];
        }
        return obj1;
    }

    this._arrayClone = function(pArr){return pArr.slice(0)}

    this.notify = function(pTitle, pBody, pIcon, pTime , pEvents){
        title = pTitle+" - EVA" || "Nouvelle notification - EVA";
        body = pBody || "";
        icon = (pIcon) || null;
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
                console.log(icon);
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

    this.connectToServer = function(pServer){
        if(this.is_nodeWebkit){
            var io = require('socket.io-client');
            this.socket = io.connect(pServer);
            this.socket.on('connect', function () {
              curEVA.notify("connecté au serveur", "La connexion au serveur EVA à réussie !", "icon.png");
            });
            this.socket.on('disconnect', function () {
              curEVA.notify("Déconnecté du serveur", "La connexion au serveur EVA à était perdue !", "icon.png");
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
            {
                name:"node-webkit",
                version: process.versions['node-webkit'],
            };
        }
        else{
            this._navigatorExtend();
            this._const.navigator = 
            {
                name:window.navigator.browser,
                version: window.navigator.version,
            };
        }
    }

    this.loadConfiguration = function(){
        if(this.is_nodeWebkit){
            config = require("./data/config.js");
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