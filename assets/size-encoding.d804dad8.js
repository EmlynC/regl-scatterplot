import{c as e}from"./index.522b8f46.js";import{s as t}from"./utils.1dbcb5de.js";import{G as o,H as r}from"./vendor.ad595088.js";const n=document.querySelector("#canvas"),a=document.querySelector("#num-points"),c=document.querySelector("#num-points-value"),i=document.querySelector("#point-size"),s=document.querySelector("#point-size-value"),l=document.querySelector("#opacity"),d=document.querySelector("#opacity-value"),u=document.querySelector("#click-lasso-initiator"),m=document.querySelector("#reset"),p=document.querySelector("#export"),y=document.querySelector("#example-size-encoding");y.setAttribute("class","active"),y.removeAttribute("href");let v=[],h=1e5,g=2,M=1,f=[];const S=e({canvas:n,lassoMinDelay:10,lassoMinDist:2,pointSize:g,showReticle:!0,reticleColor:[1,1,.878431373,.33],lassoInitiator:!0,opacityInactiveScale:.66});p.addEventListener("click",(()=>t(S))),console.log(`Scatterplot v${S.get("version")}`),S.subscribe("select",(({points:e})=>{if(console.log("Selected:",e),f=e,1===f.length){const e=v[f[0]];console.log(`X: ${e[0]}\nY: ${e[1]}\nCategory: ${e[2]}\nValue: ${e[3]}`)}})),S.subscribe("deselect",(()=>{console.log("Deselected:",f),f=[]}));const q=r(2),L=r(4),b=r(5),w=e=>{h=e,a.value=h,c.innerHTML=h,v=(e=>{const t=[...new Array(Math.round(2*e/12)).fill().map((()=>[2*Math.random()*1/3-1,2*Math.random()-1,0,q()])),...new Array(Math.round(4*e/12)).fill().map((()=>[2/3-1+2*Math.random()*1/3,2*Math.random()-1,1,L()])),...new Array(Math.round(6*e/12)).fill().map((()=>[4/3-1+2*Math.random()*1/3,2*Math.random()-1,2,b()]))],[o,r]=t.reduce((([e,t],o)=>[Math.min(e,o[3]),Math.max(t,o[3])]),[1/0,-1/0]),n=r-o;return t.forEach((e=>{e[3]=(e[3]-o)/n})),t})(h),S.draw(v)};a.addEventListener("input",(e=>{c.innerHTML=+e.target.value+" <em>release to redraw</em>"}));a.addEventListener("change",(e=>w(+e.target.value)));const E=e=>{const t=o().domain([1,10]).range([e,10*e]);return Array(100).fill().map(((e,o)=>t(1+o/99*9)))},A=e=>{g=e,i.value=g,s.innerHTML=g,S.set({pointSize:E(g)})};i.addEventListener("input",(e=>A(+e.target.value)));const z=e=>{var t;M=e,l.value=M,d.innerHTML=M,S.set({opacity:(t=M,Array(10).fill().map(((e,o)=>(o+1)/10*t)))})};l.addEventListener("input",(e=>z(+e.target.value)));u.addEventListener("change",(e=>{S.set({lassoInitiator:e.target.checked})})),u.checked=S.get("lassoInitiator");m.addEventListener("click",(()=>{S.reset()})),S.set({colorBy:"category",pointColor:["#ff80cb","#57c7ff","#eee462"],sizeBy:"w",opacityBy:"w"}),A(g),z(M),w(h);
