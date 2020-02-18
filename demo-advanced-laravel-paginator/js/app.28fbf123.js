(function(t){function e(e){for(var n,s,i=e[0],c=e[1],l=e[2],d=0,p=[];d<i.length;d++)s=i[d],Object.prototype.hasOwnProperty.call(o,s)&&o[s]&&p.push(o[s][0]),o[s]=0;for(n in c)Object.prototype.hasOwnProperty.call(c,n)&&(t[n]=c[n]);u&&u(e);while(p.length)p.shift()();return r.push.apply(r,l||[]),a()}function a(){for(var t,e=0;e<r.length;e++){for(var a=r[e],n=!0,i=1;i<a.length;i++){var c=a[i];0!==o[c]&&(n=!1)}n&&(r.splice(e--,1),t=s(s.s=a[0]))}return t}var n={},o={app:0},r=[];function s(e){if(n[e])return n[e].exports;var a=n[e]={i:e,l:!1,exports:{}};return t[e].call(a.exports,a,a.exports,s),a.l=!0,a.exports}s.m=t,s.c=n,s.d=function(t,e,a){s.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:a})},s.r=function(t){"undefined"!==typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},s.t=function(t,e){if(1&e&&(t=s(t)),8&e)return t;if(4&e&&"object"===typeof t&&t&&t.__esModule)return t;var a=Object.create(null);if(s.r(a),Object.defineProperty(a,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var n in t)s.d(a,n,function(e){return t[e]}.bind(null,n));return a},s.n=function(t){var e=t&&t.__esModule?function(){return t["default"]}:function(){return t};return s.d(e,"a",e),e},s.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},s.p="demo-advanced-laravel-paginator/";var i=window["webpackJsonp"]=window["webpackJsonp"]||[],c=i.push.bind(i);i.push=e,i=i.slice();for(var l=0;l<i.length;l++)e(i[l]);var u=c;r.push([0,"chunk-vendors"]),a()})({0:function(t,e,a){t.exports=a("56d7")},"56d7":function(t,e,a){"use strict";a.r(e);a("e260"),a("e6cf"),a("cca6"),a("a79d");var n=a("2b0e"),o=function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("div",{staticClass:"container-fluid",attrs:{id:"app"}},[a("div",{staticClass:"row"},[a("div",{staticClass:"col-md-12"},[a("greetings")],1),a("div",{staticClass:"col-md-12"},[a("preview")],1),a("div",{staticClass:"col-md-12"},[a("div",{staticClass:"row"},[a("div",{staticClass:"col-md-4"},[a("options")],1),a("div",{staticClass:"col-md-8"},[a("code-preview")],1)])]),a("div",{staticClass:"col-md-12"},[a("documentation-processing")],1)])])},r=[],s=function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("h1",{staticClass:"text-center"},[t._v("Advanced Laravel Vue Paginator")])},i=[],c={name:"Greetings",data:function(){return{}}},l=c,u=a("2877"),d=Object(u["a"])(l,s,i,!1,null,"92384b20",null),p=d.exports,v=function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("div",{staticClass:"card"},[a("div",{staticClass:"card-header"},[t._v(" Props ")]),a("ul",{staticClass:"list-group list-group-flush"},[a("li",{staticClass:"list-group-item"},[a("on-each-side")],1),a("li",{staticClass:"list-group-item"},[a("show-next-prev")],1),a("li",{staticClass:"list-group-item"},[a("dots")],1)])])},m=[],f=function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("div",[a("div",{staticClass:"form-row"},[a("label",{staticClass:"col-sm-6 col-form-label-sm",attrs:{for:"onEachSide"}},[t._v("onEachSide")]),a("div",{staticClass:"col-sm-6"},[a("input",{staticClass:"form-control form-control-sm",attrs:{type:"number",id:"onEachSide"},domProps:{value:t.onEachSide},on:{input:t.actionOnEachSide}})])]),a("small",{staticClass:"form-text text-muted"},[t._v(" Number of page number show each side of current page. Any negative value show all page links. ")])])},h=[],b=a("5530"),g=a("2f62"),_={name:"OnEachSideComponent",computed:Object(b["a"])({},Object(g["c"])(["onEachSide"])),methods:Object(b["a"])({},Object(g["b"])(["actionOnEachSide"]))},w=_,x=Object(u["a"])(w,f,h,!1,null,null,null),C=x.exports,O=function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("div",[a("div",{staticClass:"form-row"},[a("label",{staticClass:"col-sm-6 col-form-label-sm",attrs:{for:"showNextPrev"}},[t._v("showNextPrev")]),a("div",{staticClass:"col-sm-6"},[a("select",{staticClass:"form-control form-control-sm",attrs:{id:"showNextPrev"},on:{change:t.actionShowNextPrev}},[a("option",{domProps:{value:!0}},[t._v("true")]),a("option",{domProps:{value:!1}},[t._v("false")])])])]),t._m(0)])},P=[function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("small",{staticClass:"form-text text-muted"},[t._v(" Show next/previous button. "),a("code",[t._v("true")]),t._v(" for show Next/Previous button and "),a("code",[t._v("false")]),t._v(" for hide next/previous button ")])}],S={name:"ShowNextPrevComponent",methods:Object(b["a"])({},Object(g["b"])(["actionShowNextPrev"]))},E=S,j=Object(u["a"])(E,O,P,!1,null,null,null),y=j.exports,N=function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("div",[a("div",{staticClass:"form-row"},[a("label",{staticClass:"col-sm-6 col-form-label-sm",attrs:{for:"dots"}},[t._v("dots")]),a("div",{staticClass:"col-sm-6"},[a("input",{staticClass:"form-control form-control-sm",attrs:{type:"string",id:"dots"},domProps:{value:t.dots},on:{input:t.actionDots}})])]),a("small",{staticClass:"form-text text-muted"},[t._v(" Symbol for hidden page numbers ")])])},D=[],$={name:"DotsComponent",computed:Object(b["a"])({},Object(g["c"])(["dots"])),methods:Object(b["a"])({},Object(g["b"])(["actionDots"]))},T=$,k=Object(u["a"])(T,N,D,!1,null,null,null),U=k.exports,M={name:"Options",components:{OnEachSide:C,ShowNextPrev:y,Dots:U},data:function(){return{}}},A=M,G=Object(u["a"])(A,v,m,!1,null,null,null),J=G.exports,I=function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("div",[a("advanced-laravel-vue-paginate",{attrs:{data:t.laravelData,"on-each-side":t.onEachSide,"show-next-prev":t.showNextPrev,dots:t.dots},on:{paginateTo:t.paginateTo}})],1)},L=[],R={name:"Preview",computed:Object(b["a"])({},Object(g["c"])(["laravelData","onEachSide","showNextPrev","dots"])),methods:Object(b["a"])({},Object(g["b"])(["actionUpdateCurrentPage"]),{paginateTo:function(t){this.actionUpdateCurrentPage(t)},onEachSideChange:function(t){this.onEachSide=t}}),mounted:function(){}},V=R,q=Object(u["a"])(V,I,L,!1,null,null,null),z=q.exports,B=function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("pre",{staticClass:"codePreview"},[t._v("\t\t"),a("code",[t._v('\n\t\t    <advanced-laravel-vue-paginate \n\t\t    :data="laravelData"\n\t\t\t'+t._s(t.propsOnEachSide)+"\n\t\t\t"+t._s(t.propsShowNextPrev)+"\n\t\t\t"+t._s(t.propsDots)+'\n\t\t    @paginateTo="getResults"/>\n\t\t')]),t._v("\n\t")])},F=[],H={name:"CodePreview",computed:Object(b["a"])({},Object(g["c"])(["onEachSide","showNextPrev","dots"]),{propsOnEachSide:function(){return null==this.onEachSide?"":':onEachSide="'+this.onEachSide+'"'},propsShowNextPrev:function(){return this.showNextPrev?':onEachSide="true"':':onEachSide="false"'},propsDots:function(){return':dots="'+this.dots+'"'}})},K=H,Q=(a("7043"),Object(u["a"])(K,B,F,!1,null,"3ae0c160",null)),W=Q.exports,X=function(){var t=this,e=t.$createElement;t._self._c;return t._m(0)},Y=[function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("div",{staticClass:"text-center"},[a("h4",{staticClass:"text-black-50"},[t._v("Demo processing...")]),a("a",{staticClass:"card-link",attrs:{href:"https://github.com/shibbirweb/advanced-laravel-vue-paginate"}},[t._v("Documentation")])])}],Z={name:"DocumentationProcessingComponent"},tt=Z,et=Object(u["a"])(tt,X,Y,!1,null,null,null),at=et.exports,nt={name:"App",components:{DocumentationProcessing:at,Greetings:p,Options:J,Preview:z,CodePreview:W}},ot=nt,rt=Object(u["a"])(ot,o,r,!1,null,null,null),st=rt.exports,it={laravelData:{total:50,per_page:15,current_page:12,last_page:25,first_page_url:"http://laravel.app?page=1",last_page_url:"http://laravel.app?page=4",next_page_url:"http://laravel.app?page=2",prev_page_url:null,path:"http://laravel.app",from:1,to:15,data:[{},{}]},onEachSide:3,showNextPrev:!0,dots:"..."},ct=(a("a9e3"),a("25eb"),{actionUpdateCurrentPage:function(t,e){var a=t.commit;a("mutationUpdateCurrentPage",e)},actionOnEachSide:function(t,e){var a=t.commit;a("mutationOnEachSide",Number.parseInt(e.target.value))},actionShowNextPrev:function(t,e){var a=t.commit;a("mutationShowNextPrev","true"===e.target.value)},actionDots:function(t,e){var a=t.commit;a("mutationDots",e.target.value)}}),lt={mutationUpdateCurrentPage:function(t,e){t.laravelData.current_page=e},mutationOnEachSide:function(t,e){t.onEachSide=e},mutationShowNextPrev:function(t,e){t.showNextPrev=e},mutationDots:function(t,e){t.dots=e}},ut=a("94d5"),dt=a.n(ut);n["a"].use(g["a"]);var pt=new g["a"].Store({state:it,getters:dt.a,mutations:lt,actions:ct});a("ab8b"),a("4fcf"),n["a"].use(a("f634")),n["a"].config.productionTip=!1,new n["a"]({store:pt,render:function(t){return t(st)}}).$mount("#app")},7043:function(t,e,a){"use strict";var n=a("ef52"),o=a.n(n);o.a},"94d5":function(t,e){},ef52:function(t,e,a){}});
//# sourceMappingURL=app.28fbf123.js.map