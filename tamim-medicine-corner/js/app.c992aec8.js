(function(e){function n(n){for(var r,o,u=n[0],i=n[1],d=n[2],l=0,s=[];l<u.length;l++)o=u[l],Object.prototype.hasOwnProperty.call(c,o)&&c[o]&&s.push(c[o][0]),c[o]=0;for(r in i)Object.prototype.hasOwnProperty.call(i,r)&&(e[r]=i[r]);f&&f(n);while(s.length)s.shift()();return a.push.apply(a,d||[]),t()}function t(){for(var e,n=0;n<a.length;n++){for(var t=a[n],r=!0,o=1;o<t.length;o++){var u=t[o];0!==c[u]&&(r=!1)}r&&(a.splice(n--,1),e=i(i.s=t[0]))}return e}var r={},o={app:0},c={app:0},a=[];function u(e){return i.p+"js/"+({}[e]||e)+"."+{"chunk-2d0b2187":"4ef8deff","chunk-2d0b9404":"63db670d","chunk-2d0d3ac4":"fe60e665","chunk-2d0d7c09":"016e3bcf","chunk-2d217ec6":"8622c26d","chunk-5f2bcf20":"ceed3b2c","chunk-2d2086b7":"006da7d7","chunk-2d21a3d2":"92bf1135","chunk-2d22bd20":"5db8eaf0"}[e]+".js"}function i(n){if(r[n])return r[n].exports;var t=r[n]={i:n,l:!1,exports:{}};return e[n].call(t.exports,t,t.exports,i),t.l=!0,t.exports}i.e=function(e){var n=[],t={"chunk-5f2bcf20":1};o[e]?n.push(o[e]):0!==o[e]&&t[e]&&n.push(o[e]=new Promise((function(n,t){for(var r="css/"+({}[e]||e)+"."+{"chunk-2d0b2187":"31d6cfe0","chunk-2d0b9404":"31d6cfe0","chunk-2d0d3ac4":"31d6cfe0","chunk-2d0d7c09":"31d6cfe0","chunk-2d217ec6":"31d6cfe0","chunk-5f2bcf20":"71107970","chunk-2d2086b7":"31d6cfe0","chunk-2d21a3d2":"31d6cfe0","chunk-2d22bd20":"31d6cfe0"}[e]+".css",c=i.p+r,a=document.getElementsByTagName("link"),u=0;u<a.length;u++){var d=a[u],l=d.getAttribute("data-href")||d.getAttribute("href");if("stylesheet"===d.rel&&(l===r||l===c))return n()}var s=document.getElementsByTagName("style");for(u=0;u<s.length;u++){d=s[u],l=d.getAttribute("data-href");if(l===r||l===c)return n()}var f=document.createElement("link");f.rel="stylesheet",f.type="text/css",f.onload=n,f.onerror=function(n){var r=n&&n.target&&n.target.src||c,a=new Error("Loading CSS chunk "+e+" failed.\n("+r+")");a.code="CSS_CHUNK_LOAD_FAILED",a.request=r,delete o[e],f.parentNode.removeChild(f),t(a)},f.href=c;var h=document.getElementsByTagName("head")[0];h.appendChild(f)})).then((function(){o[e]=0})));var r=c[e];if(0!==r)if(r)n.push(r[2]);else{var a=new Promise((function(n,t){r=c[e]=[n,t]}));n.push(r[2]=a);var d,l=document.createElement("script");l.charset="utf-8",l.timeout=120,i.nc&&l.setAttribute("nonce",i.nc),l.src=u(e);var s=new Error;d=function(n){l.onerror=l.onload=null,clearTimeout(f);var t=c[e];if(0!==t){if(t){var r=n&&("load"===n.type?"missing":n.type),o=n&&n.target&&n.target.src;s.message="Loading chunk "+e+" failed.\n("+r+": "+o+")",s.name="ChunkLoadError",s.type=r,s.request=o,t[1](s)}c[e]=void 0}};var f=setTimeout((function(){d({type:"timeout",target:l})}),12e4);l.onerror=l.onload=d,document.head.appendChild(l)}return Promise.all(n)},i.m=e,i.c=r,i.d=function(e,n,t){i.o(e,n)||Object.defineProperty(e,n,{enumerable:!0,get:t})},i.r=function(e){"undefined"!==typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},i.t=function(e,n){if(1&n&&(e=i(e)),8&n)return e;if(4&n&&"object"===typeof e&&e&&e.__esModule)return e;var t=Object.create(null);if(i.r(t),Object.defineProperty(t,"default",{enumerable:!0,value:e}),2&n&&"string"!=typeof e)for(var r in e)i.d(t,r,function(n){return e[n]}.bind(null,r));return t},i.n=function(e){var n=e&&e.__esModule?function(){return e["default"]}:function(){return e};return i.d(n,"a",n),n},i.o=function(e,n){return Object.prototype.hasOwnProperty.call(e,n)},i.p="/tamim-medicine-corner/",i.oe=function(e){throw console.error(e),e};var d=window["webpackJsonp"]=window["webpackJsonp"]||[],l=d.push.bind(d);d.push=n,d=d.slice();for(var s=0;s<d.length;s++)n(d[s]);var f=l;a.push([0,"chunk-vendors"]),t()})({0:function(e,n,t){e.exports=t("56d7")},"56d7":function(e,n,t){"use strict";t.r(n);t("e260"),t("e6cf"),t("cca6"),t("a79d");var r=t("2b0e"),o=(t("ab8b"),t("3e48"),function(){var e=this,n=e.$createElement,t=e._self._c||n;return t("div",{attrs:{id:"app"}},[t("router-view")],1)}),c=[],a=(t("5c0b"),t("2877")),u={},i=Object(a["a"])(u,o,c,!1,null,null,null),d=i.exports,l=t("9483");Object(l["a"])("".concat("/tamim-medicine-corner/","service-worker.js"),{ready:function(){console.log("App is being served from cache by a service worker.\nFor more details, visit https://goo.gl/AFskqB")},registered:function(){console.log("Service worker has been registered.")},cached:function(){console.log("Content has been cached for offline use.")},updatefound:function(){console.log("New content is downloading.")},updated:function(){console.log("New content is available; please refresh.")},offline:function(){console.log("No internet connection found. App is running in offline mode.")},error:function(e){console.error("Error during service worker registration:",e)}});t("d3b7");var s=t("8c4f");r["a"].use(s["a"]);var f=[{path:"/",name:"Home",component:function(){return t.e("chunk-2d21a3d2").then(t.bind(null,"bb51"))}},{path:"/login",name:"Login",component:function(){return t.e("chunk-2d2086b7").then(t.bind(null,"a55b"))}},{path:"/dashboard",name:"Dashboard",redirect:{name:"Dashboard.summary"},component:function(){return Promise.all([t.e("chunk-2d0d7c09"),t.e("chunk-5f2bcf20")]).then(t.bind(null,"7277"))},children:[{path:"summary",name:"Dashboard.summary",component:function(){return Promise.all([t.e("chunk-2d0d7c09"),t.e("chunk-2d217ec6")]).then(t.bind(null,"c993"))}},{path:"group",name:"Dashboard.group",component:function(){return t.e("chunk-2d0d3ac4").then(t.bind(null,"5e86"))}},{path:"company",name:"Dashboard.company",component:function(){return t.e("chunk-2d22bd20").then(t.bind(null,"f132"))}},{path:"location",name:"Dashboard.location",component:function(){return t.e("chunk-2d0b9404").then(t.bind(null,"31c3"))}},{path:"medicine",name:"Dashboard.medicine",component:function(){return t.e("chunk-2d0b2187").then(t.bind(null,"233c"))}}]}],h=new s["a"]({base:"/tamim-medicine-corner/",routes:f,linkActiveClass:"active"}),p=h,m=t("2f62");r["a"].use(m["a"]);var b=new m["a"].Store({state:{},mutations:{},actions:{},modules:{}});r["a"].config.productionTip=!1,new r["a"]({router:p,store:b,render:function(e){return e(d)}}).$mount("#app")},"5c0b":function(e,n,t){"use strict";var r=t("9c0c"),o=t.n(r);o.a},"9c0c":function(e,n,t){}});
//# sourceMappingURL=app.c992aec8.js.map