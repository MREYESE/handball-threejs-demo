(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))n(s);new MutationObserver(s=>{for(const r of s)if(r.type==="childList")for(const a of r.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&n(a)}).observe(document,{childList:!0,subtree:!0});function t(s){const r={};return s.integrity&&(r.integrity=s.integrity),s.referrerPolicy&&(r.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?r.credentials="include":s.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function n(s){if(s.ep)return;s.ep=!0;const r=t(s);fetch(s.href,r)}})();function Oh(i){if(!i.terminalState)throw new Error("Continuation requires an authoritative result");return{position:{...i.position},velocity:{...i.velocity},elapsedSeconds:0,goal:i.terminalState==="GOAL",volume:i.playableVolume,netImpact:null}}function Nh(i,e,t){if(!Number.isFinite(e)||e<=0||e>.1)throw new RangeError("Invalid continuation step");const n=Math.ceil(e*240),s=e/n,r=t.ballRadiusMeters;for(let a=0;a<n;a++){const o=i.position,l=i.velocity,c=o.x,h=o.y,u=o.z;o.x+=l.x*s,o.y+=l.y*s-4.905*s*s,o.z+=l.z*s,l.y-=9.81*s,o.y<r&&(o.y=r+(r-o.y)*.3,l.y=Math.abs(l.y)*.3,l.x*=.94,l.z*=.94);const f=i.volume.ceilingHeightMeters-r;if(o.y>f&&l.y>0&&(o.y=f,l.y*=-.3),i.goal&&o.z>=t.center.z){const g=t.center.z+.8-r,_=t.widthMeters/2-r,m=t.center.y+t.heightMeters/2-r;let d=!1,b=!1;if(o.z>g&&l.z>0&&(o.z=g-(o.z-g)*.18,l.z*=-.18,d=!0,b=!0),Math.abs(o.x-t.center.x)>_){const E=Math.sign(o.x-t.center.x);o.x=t.center.x+E*_,l.x*E>0&&(l.x*=-.18,d=!0)}o.y>m&&l.y>0&&(o.y=m,l.y*=-.18,d=!0),d&&(l.x*=.8,l.y*=.8,l.z*=.8,b&&(i.netImpact={...o}))}if(!i.goal){const g=t.widthMeters/2+r,_=t.center.y+t.heightMeters/2+r,m=t.center.z-r,d=t.center.z+.8+r,b=o.z>=m&&o.z<=d;if(b&&Math.abs(o.x-t.center.x)<=g&&h>_-2*r+1e-9&&o.y<_&&(o.y=_+(_-o.y)*.18,l.y=Math.abs(l.y)*.18,l.x*=.8,l.z*=.8),b&&o.y<=_&&Math.abs(c-t.center.x)>g-2*r+1e-9&&Math.abs(o.x-t.center.x)<g){const E=Math.sign(c-t.center.x);o.x=t.center.x+E*g,l.x=E*Math.abs(l.x)*.18,l.y*=.8,l.z*=.8}Math.abs(o.x-t.center.x)<=g&&o.y<=_&&u>=d&&o.z<d&&(o.z=d,l.z=Math.abs(l.z)*.18,l.x*=.8,l.y*=.8)}for(const g of["x","z"]){const _=g==="x"?-i.volume.halfWidthMeters+r:i.volume.minimumZMeters+r,m=g==="x"?i.volume.halfWidthMeters-r:15.4-.35/2-r;o[g]<_&&(o[g]=_,l[g]=Math.abs(l[g])*.3),o[g]>m&&(o[g]=m,l[g]=-Math.abs(l[g])*.3)}const p=Math.exp(-.45*s);l.x*=p,l.y*=p,l.z*=p,i.elapsedSeconds+=s}}function Fh(i,e,t,n){if(n<0||n>.65)return 0;const s=(i-t.x)**2+(e-t.y)**2,r=Math.max(0,1-(i/1.5)**2)*Math.max(0,1-((e-1)/1)**2);return .16*Math.exp(-s*6)*Math.sin(Math.min(1,n/.09)*Math.PI/2)*Math.exp(-n*7)*r}const tl=1e-9,Xt=1e-9;function _n(i,e){const t=e.safeAreaPosition01.x-i.safeAreaPosition01.x,n=i.safeAreaPosition01.y-e.safeAreaPosition01.y;return{x:t,y:n,length:Math.hypot(t,n)}}function Zi(i,e,t){return i.x*e+i.y*t}function Hc(i){const e=[["initial impulse",i.feintMinimumInitialImpulseSafeFraction],["brake",i.feintMinimumBrakeSafeFraction],["second impulse",i.feintMinimumSecondImpulseSafeFraction]];for(const[t,n]of e)if(!Number.isFinite(n)||n<=0||n>1)throw new RangeError(`FEINT ${t} threshold must be finite and within (0, 1].`);if(!Number.isFinite(i.feintMinimumInitialHorizontalRatio)||i.feintMinimumInitialHorizontalRatio<=0||i.feintMinimumInitialHorizontalRatio>1)throw new RangeError("FEINT initial horizontal ratio must be finite and within (0, 1].");if(!Number.isFinite(i.feintMaximumBrakeSpeedRatio)||i.feintMaximumBrakeSpeedRatio<0||i.feintMaximumBrakeSpeedRatio>=1)throw new RangeError("FEINT brake speed ratio must be finite and within [0, 1).");for(const[t,n]of[["reversal direction",i.feintMaximumReversalDirectionDot],["second impulse direction",i.feintMaximumSecondImpulseDirectionDot]])if(!Number.isFinite(n)||n<-1||n>=0)throw new RangeError(`FEINT ${t} dot threshold must be finite and within [-1, 0).`);if(!Number.isFinite(i.feintMaximumPrefixDurationSeconds)||i.feintMaximumPrefixDurationSeconds<=0||i.feintMaximumPrefixDurationSeconds>i.maximumDurationSeconds)throw new RangeError("FEINT prefix duration must be finite, positive, and no longer than the gesture duration.")}function Uh(i,e){if(Hc(e),i.length<4)return null;if(i.some(s=>!Number.isFinite(s.safeAreaPosition01.x)||!Number.isFinite(s.safeAreaPosition01.y)||!Number.isFinite(s.timeSeconds)))throw new RangeError("FEINT points must contain only finite values.");const t=i[0];if(t===void 0)return null;const n=i.find(s=>_n(t,s).length>.035);if(n!==void 0){const s=_n(t,n);if(Math.abs(s.x)/s.length<=e.feintMinimumInitialHorizontalRatio)return null}for(let s=1;s<i.length-2;s+=1){const r=i[s];if(r===void 0)continue;const a=_n(t,r);if(a.length<=e.feintMinimumInitialImpulseSafeFraction+Xt||Math.abs(a.x)/a.length<=e.feintMinimumInitialHorizontalRatio+Xt)continue;const o=r.timeSeconds-t.timeSeconds;if(o<=0)continue;const l=a.x/a.length,c=a.y/a.length,h=a.length/o;let u=a.length;for(let f=s+1;f<i.length-1;f+=1){const p=i[f-1],g=i[f];if(p===void 0||g===void 0)continue;const _=_n(t,g),m=Zi(_,l,c);u=Math.max(u,m);const d=u-m,b=_n(p,g),E=g.timeSeconds-p.timeSeconds;if(E<=0)continue;const M=b.length/E,w=b.length<=tl?1:Zi(b,l,c)/b.length,A=d>e.feintMinimumBrakeSafeFraction+Xt&&w<e.feintMaximumReversalDirectionDot-Xt,C=M<h*e.feintMaximumBrakeSpeedRatio-Xt;if(!(!A&&!C))for(let D=f+1;D<i.length;D+=1){const S=i[D];if(S===void 0)continue;const y=S.timeSeconds-t.timeSeconds;if(y<=0||y>=e.feintMaximumPrefixDurationSeconds-Xt)continue;const P=_n(g,S);if(!(P.length<=e.feintMinimumSecondImpulseSafeFraction+Xt||Zi(P,l,c)/P.length>=e.feintMaximumSecondImpulseDirectionDot-Xt)&&!(A&&!C&&b.length>tl&&(b.x*P.x+b.y*P.y)/(b.length*P.length)>.95))return Object.freeze({type:"FEINT",apparentDirection:Object.freeze({x:l,y:c}),recognizedAtSeconds:y,initialImpulseSafeFraction:a.length,brakeSafeFraction:A?d:b.length,secondImpulseSafeFraction:P.length})}}}return null}function bo(i,e){const t=Uh(i,e);if(t!==null||i.length<3)return t;if(i.some(a=>!Number.isFinite(a.safeAreaPosition01.x)||!Number.isFinite(a.safeAreaPosition01.y)||!Number.isFinite(a.timeSeconds)))throw new RangeError("FEINT points must contain only finite values.");const n=i[0],s=i.find(a=>_n(n,a).length>.035);if(!s)return null;const r=_n(n,s);if(Math.abs(r.x)/r.length<=e.feintMinimumInitialHorizontalRatio)return null;for(let a=1;a<i.length-1;a++){const o=i[a],l=_n(n,o),c=o.timeSeconds-n.timeSeconds;if(c<=0||l.length<=e.feintMinimumInitialImpulseSafeFraction+Xt||Math.abs(l.x)/l.length<=e.feintMinimumInitialHorizontalRatio+Xt)continue;const h=l.x/l.length,u=l.y/l.length;for(let f=a+1;f<i.length;f++){const p=i[f],g=p.timeSeconds-n.timeSeconds;if(g>=e.feintMaximumPrefixDurationSeconds||g<=0)continue;const _=_n(o,p),m=_.length===0?1:Zi(_,h,u)/_.length,d=-Zi(_,h,u),E=(_.y<=.015||n.safeAreaPosition01.y-p.safeAreaPosition01.y<=.02)&&_.length>e.feintMinimumSecondImpulseSafeFraction+Xt&&d>e.feintMinimumBrakeSafeFraction+Xt&&m<e.feintMaximumReversalDirectionDot-Xt,M=p.timeSeconds-o.timeSeconds,w=f<i.length-1&&M>=.06&&_.length>.006&&Zi(_,h,u)>0&&_.length/M<l.length/c*e.feintMaximumBrakeSpeedRatio;if(!(!E&&!w))return Object.freeze({type:"FEINT",apparentDirection:Object.freeze({x:h,y:u}),recognizedAtSeconds:g,initialImpulseSafeFraction:l.length,brakeSafeFraction:E?d:_.length,secondImpulseSafeFraction:E?_.length:0})}}return null}class zh{constructor(e,t,n){this.play=t,this.tutorial=n,this.element.className="onboarding",this.element.addEventListener("click",this.click),e.append(this.element)}play;tutorial;element=document.createElement("section");click=e=>{const t=e.target.closest("button")?.dataset.action;t==="play"&&this.play(),t==="tutorial"&&this.tutorial()};menu(){this.element.className="onboarding menu-screen",this.element.innerHTML='<div class="menu-copy"><p class="eyebrow">HANDBALL / PENALTY ARENA</p><h1>Tu gesto.<br>Tu gol.</h1><p>Cinco tiros. Un dedo. Toda la pista.</p><div class="menu-actions"><button data-action="play">JUGAR <span>↗</span></button><button data-action="tutorial">TUTORIAL <span>→</span></button></div><small>Apunta · Amaga · Sorprende</small></div>',this.element.querySelector("button")?.focus()}step(e,t,n){const s=this.element.contains(document.activeElement);this.element.className="onboarding tutorial-screen",this.element.innerHTML=`<button class="skip-tutorial" data-action="play" aria-label="Skip tutorial">Saltar tutorial</button><div class="tutorial-copy" role="status"><p class="eyebrow">${e+1} / 6 · DEMOSTRACIÓN AUTOMÁTICA</p><h2>${t}</h2><p class="tutorial-message"></p><small>Gesto sintético de enseñanza</small></div>`,this.message(n),s&&this.element.querySelector(".skip-tutorial")?.focus()}message(e){const t=this.element.querySelector(".tutorial-message");t&&(t.textContent=e)}complete(){this.element.className="onboarding menu-screen",this.element.innerHTML='<div class="menu-copy"><p class="eyebrow">TUTORIAL COMPLETADO</p><h1>Tu turno.</h1><p>Prueba los gestos y encuentra tu tiro.</p><button data-action="play">Jugar ahora →</button></div>',this.element.querySelector("button")?.focus()}hide(){this.element.className="onboarding",this.element.replaceChildren()}dispose(){this.element.removeEventListener("click",this.click),this.element.remove()}}const Ji=Object.freeze({minimumDistancePixels:40,minimumDurationSeconds:.03,maximumDurationSeconds:1.5,maximumSampleGapSeconds:.25,startZoneFraction:.45,minimumIntermediateDistanceSafeFraction:.002,horizontalFullRangeViewportFraction:.22,verticalFullRangeViewportFraction:.28,resamplePointCount:32,smoothingWindow:3,releaseSpeedSampleCount:4,releaseSpeedFullPowerSafeFractionsPerSecond:2.4,maximumSpeedFullPowerSafeFractionsPerSecond:3,pathLengthFullPowerSafeFraction:.35,loftFullRangeSafeFraction:.12,loftMaximumHorizontalDeviationSafeFraction:.12,sideSpinFullRangeSafeFraction:.09,topSpinFullRangeSafeFraction:.12,topSpinMaximumHorizontalDeviationSafeFraction:.12,bounceZeroIntentVerticalGesture01:.5,lobCategoryMinimumLoft:.6,bounceCategoryMinimumIntent:.6,feintMinimumInitialImpulseSafeFraction:.055,feintMinimumInitialHorizontalRatio:.7,feintMinimumBrakeSafeFraction:.025,feintMaximumBrakeSpeedRatio:.3,feintMaximumReversalDirectionDot:-.35,feintMinimumSecondImpulseSafeFraction:.06,feintMaximumSecondImpulseDirectionDot:-.2,feintMaximumPrefixDurationSeconds:.75,releaseSpeedWeight:.5,maximumSpeedWeight:.3,pathLengthWeight:.2}),Tt=Object.freeze({widthMeters:3,heightMeters:2,postThicknessMeters:.12,ballRadiusMeters:.094,safetyMarginMeters:.02,horizontalOvershootFactor:.15,verticalOvershootFactor:.15,center:Object.freeze({x:0,y:1,z:7})}),zs=Object.freeze({minimumDurationSeconds:.35,maximumDurationSeconds:.8,arcHeightMeters:1.1,resetDelaySeconds:.7}),nl=Object.freeze({playableVolume:Object.freeze({halfWidthMeters:10.025,ceilingHeightMeters:9.58,minimumZMeters:-12.5}),minimumReleaseSpeedMetersPerSecond:8,maximumReleaseSpeedMetersPerSecond:24,minimumLaunchLiftMeters:.45,maximumLaunchLiftMeters:1.35,maximumSideSpinAccelerationMetersPerSecondSquared:8,maximumTopSpinDropAccelerationMetersPerSecondSquared:12,gravityMetersPerSecondSquared:-9.81,postRestitution:.72,crossbarRestitution:.68,minimumGroundRestitution:0,maximumGroundRestitution:.72,minimumGroundReboundSpeedMetersPerSecond:1.25,maximumGroundBounces:1}),Vt=Object.freeze({feintHoldSeconds:.65,feintRecoverySeconds:.6,feintMaximumSpeedMetersPerSecond:1.2,horizontalRangeMeters:1.2,verticalRangeMeters:.75,reactionDelaySeconds:.15,diveDurationSeconds:.3,returnDurationSeconds:.25,saveRadiusMeters:.65,contactRestitution:.6,minimumReadSeconds:.08,maximumReadSeconds:.45,minimumCueConfidence:.055,minimumCueAgreementDot:.5,minimumStableCueSamples:2,horizontalCommitThreshold:.3,verticalCommitThreshold:.35,maximumTendency:.08}),Bh=Object.freeze({shotsPerRound:5}),ds=Object.freeze({x:0,y:1,z:0});function Ca(i){const e=i[0],t=i.at(-1);if(!e||!t)return{hook:!1,vee:!1,descent:0};let n=e.y,s=e.y,r=0,a=0;for(let u=1;u<i.length;u++){const f=i[u].y,p=i[u-1].y;n=Math.min(n,f),s=Math.max(s,f),r+=Math.max(0,p-f),a+=Math.max(0,f-p)}const o=e.y-n,l=t.y-n,c=s-e.y,h=s-t.y;return{hook:o>.16&&l>.045&&l<o*.65&&e.y-t.y>.065&&r<o*1.18&&a<l*1.18,vee:c>.07&&h>.12&&a<c*1.18&&r<h*1.18,descent:c}}function Yt(i,e,t){return Math.min(t,Math.max(e,i))}function At(i){return Yt(i,0,1)}function ut(i,e,t){return i+(e-i)*t}function Un(i,e){return Math.hypot(e.x-i.x,e.y-i.y)}const il=1e-6;function Mt(i){return Object.freeze({accepted:!1,reason:i})}function Hh(i,e){return e??{xPixels:0,yPixels:0,widthPixels:i.widthPixels,heightPixels:i.heightPixels}}function sl(i,e,t){return Object.freeze({positionPixels:Object.freeze({...i.positionPixels}),safeAreaPosition01:Object.freeze({x:(i.positionPixels.x-e.xPixels)/e.widthPixels,y:(i.positionPixels.y-e.yPixels)/e.heightPixels}),timeSeconds:i.timeSeconds-t})}function kc(i,e,t){return i>=0&&i<=1&&e<=1&&(e>=1-t.startZoneFraction||e>=.3&&i>=.04&&i<=.96)}function Gc(i,e,t,n={}){const s=Hh(e,n.safeArea);if(!Number.isFinite(e.widthPixels)||!Number.isFinite(e.heightPixels)||e.widthPixels<=0||e.heightPixels<=0||!Number.isFinite(s.widthPixels)||!Number.isFinite(s.heightPixels)||s.widthPixels<=0||s.heightPixels<=0)return Mt("INVALID_VIEWPORT");if(i.length<2)return Mt("TOO_FEW_POINTS");if(i.some(h=>!Number.isFinite(h.positionPixels.x)||!Number.isFinite(h.positionPixels.y)||!Number.isFinite(h.timeSeconds)))return Mt("NON_FINITE_SAMPLE");if(n.inputEnabled===!1)return Mt("INPUT_DISABLED");if(n.captureAlreadyActive===!0)return Mt("CAPTURE_ALREADY_ACTIVE");if(n.startedOverBlockingUi===!0)return Mt("STARTED_OVER_BLOCKING_UI");if(n.interrupted===!0)return Mt("INTERRUPTED");const r=i[0],a=i[i.length-1];if(r===void 0||a===void 0)return Mt("TOO_FEW_POINTS");const o=sl(r,s,r.timeSeconds);if(!kc(o.safeAreaPosition01.x,o.safeAreaPosition01.y,t))return Mt("START_OUTSIDE_INPUT_ZONE");for(let h=1;h<i.length;h+=1){const u=i[h-1],f=i[h];if(u===void 0||f===void 0)return Mt("TOO_FEW_POINTS");const p=f.timeSeconds-u.timeSeconds;if(!Number.isFinite(p)||p<0)return Mt("NON_MONOTONIC_TIME");if(p>t.maximumSampleGapSeconds)return Mt("SAMPLE_GAP_TOO_LONG")}const l=a.timeSeconds-r.timeSeconds;if(l<t.minimumDurationSeconds)return Mt("DURATION_TOO_SHORT");if(l>t.maximumDurationSeconds)return Mt("DURATION_TOO_LONG");const c=i.map(h=>sl(h,s,r.timeSeconds));if(o.safeAreaPosition01.y<1-t.startZoneFraction&&!Ca(c.map(h=>h.safeAreaPosition01)).vee)return Mt("START_OUTSIDE_INPUT_ZONE");if(!n.nonShootingFeint&&Un(r.positionPixels,a.positionPixels)<t.minimumDistancePixels){const h=Ca(c.map(f=>f.safeAreaPosition01));let u=0;for(let f=1;f<i.length;f++)u+=Un(i[f-1].positionPixels,i[f].positionPixels);if(!h.vee&&!h.hook||u<t.minimumDistancePixels)return Mt("DISTANCE_TOO_SHORT")}return Object.freeze({accepted:!0,points:Object.freeze(c),durationSeconds:l})}function kh(i,e,t,n){if(t.widthPixels<=0||t.heightPixels<=0)return!1;const s={x:(i.x-t.xPixels)/t.widthPixels,y:(i.y-t.yPixels)/t.heightPixels},r={x:(e.x-t.xPixels)/t.widthPixels,y:(e.y-t.yPixels)/t.heightPixels};return Un(s,r)+Number.EPSILON*8>=n.minimumIntermediateDistanceSafeFraction}function Gh(i,e){if(i.length<2||e<=1)return Object.freeze(i.map(s=>Object.freeze({...s})));const t=Math.max(1,Math.floor(e/2)),n=i.map((s,r)=>{if(r===0||r===i.length-1)return Object.freeze({...s});let a=0,o=0,l=0;const c=Math.max(0,r-t),h=Math.min(i.length-1,r+t);for(let u=c;u<=h;u+=1){const f=i[u];f!==void 0&&(a+=f.x,o+=f.y,l+=1)}return Object.freeze({x:a/l,y:o/l})});return Object.freeze(n)}function Vh(i,e){if(!Number.isInteger(e)||e<2)throw new RangeError("Gesture resample count must be an integer of at least two.");if(i.length===0)return Object.freeze(Array.from({length:e},()=>Object.freeze({x:0,y:0})));const t=i[0];if(t===void 0)return Object.freeze([]);if(i.length===1)return Object.freeze(Array.from({length:e},()=>Object.freeze({...t})));const n=new Array(i.length).fill(0);let s=0;for(let l=1;l<i.length;l+=1){const c=i[l-1],h=i[l];c!==void 0&&h!==void 0&&(s+=Un(c,h),n[l]=s)}const r=i[i.length-1]??t;if(s<=il)return Object.freeze(Array.from({length:e},(l,c)=>Object.freeze({...c===e-1?r:t})));const a=[Object.freeze({...t})];let o=1;for(let l=1;l<e-1;l+=1){const c=s*l/(e-1);for(;o<n.length-1&&(n[o]??0)<c;)o+=1;const h=i[o-1]??t,u=i[o]??r,f=n[o-1]??0,g=(n[o]??s)-f,_=g<=il?0:(c-f)/g;a.push(Object.freeze({x:ut(h.x,u.x,_),y:ut(h.y,u.y,_)}))}return a.push(Object.freeze({...r})),Object.freeze(a)}function rl(i,e){if(!Number.isFinite(i)||i<0||i>1)throw new RangeError(`${e} must be finite and within [0, 1].`)}function al(i,e){if(!Number.isFinite(i)||i<=0||i>=1)throw new RangeError(`${e} must be finite and within (0, 1).`)}function Wh(i,e){rl(i.loft,"Shot-category loft"),rl(i.bounceIntent,"Shot-category bounce intent"),al(e.lobCategoryMinimumLoft,"LOB category threshold"),al(e.bounceCategoryMinimumIntent,"BOUNCE category threshold");const t=i.loft>e.lobCategoryMinimumLoft,n=i.bounceIntent>e.bounceCategoryMinimumIntent;return t===n?"DIRECT":t?"LOB":"BOUNCE"}const Er=1e-4,ol=1e-6,ll=.0011;function qh(i){let e=0;for(let t=1;t<i.length;t+=1){const n=i[t-1],s=i[t];n!==void 0&&s!==void 0&&(e+=Un(n,s))}return e}function Xh(i){const e=i[0],t=i.at(-1);if(!e||!t)return[];const n=t.timeSeconds-e.timeSeconds;if(n<=Er)return[];const s=32,r=n/s,a=c=>{let h=1;for(;h<i.length-1&&i[h].timeSeconds<c;)h++;const u=i[h-1],f=i[h],p=f.timeSeconds-u.timeSeconds,g=p<=Er?1:At((c-u.timeSeconds)/p);return{x:ut(u.safeAreaPosition01.x,f.safeAreaPosition01.x,g),y:ut(u.safeAreaPosition01.y,f.safeAreaPosition01.y,g)}},o=[];let l=e.safeAreaPosition01;for(let c=1;c<=s;c++){const h=a(e.timeSeconds+r*c);o.push(Un(l,h)/r),l=h}return o}function gr(i){if(i.length===0)return 0;const e=[...i].sort((n,s)=>n-s),t=Math.floor(e.length/2);return e.length%2===1?e[t]??0:((e[t-1]??0)+(e[t]??0))/2}function jh(i,e,t){const n=Math.max(1,e.widthPixels*t.horizontalFullRangeViewportFraction),s=Math.max(1,e.heightPixels*t.verticalFullRangeViewportFraction),r=Yt(i.dx/n,-1,1),a=At(i.dyUp/s);return Object.freeze({horizontalAim:r,verticalGesture01:a,verticalAim:a*2-1})}function Yh(i){const e=i.at(-1)?.timeSeconds??0,t=i.filter(_=>_.timeSeconds>=e-.12);if(t.length<7||e-t[0].timeSeconds<.1)return{intensity:0,confidence:0};const n=[],s=[];let r=0;for(let _=1;_<t.length;_++){const m=t[_-1],d=t[_],b=d.timeSeconds-m.timeSeconds;if(!Number.isFinite(b)||b<=1e-4)continue;r=Math.max(r,b);const E={x:(d.safeAreaPosition01.x-m.safeAreaPosition01.x)/b,y:(d.safeAreaPosition01.y-m.safeAreaPosition01.y)/b};if(!Number.isFinite(E.x+E.y)||Math.hypot(E.x,E.y)>6)return{intensity:0,confidence:0};((m.timeSeconds+d.timeSeconds)/2<e-.06?n:s).push(E)}if(r>.035||n.length<3||s.length<3)return{intensity:0,confidence:0};const a=_=>({x:gr(_.map(m=>m.x)),y:gr(_.map(m=>m.y))}),o=a(n),l=a(s),c=Math.hypot(l.x,l.y);if(c<.2)return{intensity:0,confidence:0};const h=gr(s.map(_=>Math.hypot(_.x-l.x,_.y-l.y))),u=At(1-h/Math.max(.2,c*.5)),f=Math.hypot(o.x,o.y),p=f>.1?At((o.x*l.x+o.y*l.y)/(f*c)):1,g=Math.max(0,c-f)*p;return{intensity:At((g-.15)/1.5),confidence:u}}function $h(i,e,t){const n=(i[i.length-1]?.timeSeconds??0)-(i[0]?.timeSeconds??0),s=Xh(i),r=s.length>0?Math.max(...s):0,a=s.slice(-Math.max(1,t.releaseSpeedSampleCount)),o=gr(a),l=qh(e),c=At(o/t.releaseSpeedFullPowerSafeFractionsPerSecond),h=At(r/t.maximumSpeedFullPowerSafeFractionsPerSecond),u=At(l/t.pathLengthFullPowerSafeFraction);return Object.freeze({finalSnap:Yh(i),durationSeconds:n,pathLengthSafeFraction:l,maximumSpeedSafeFractionsPerSecond:r,releaseSpeedSafeFractionsPerSecond:o,releaseSpeedContribution:c,maximumSpeedContribution:h,pathLengthContribution:u,usedTimingFallback:n<=Er||r<=0||o<=0})}function Kh(i,e){const t=e.releaseSpeedWeight+e.maximumSpeedWeight+e.pathLengthWeight;if(i.usedTimingFallback||t<=Er)return i.pathLengthContribution;const n=At((i.releaseSpeedContribution*e.releaseSpeedWeight+i.maximumSpeedContribution*e.maximumSpeedWeight+i.pathLengthContribution*e.pathLengthWeight)/t),s=i.finalSnap;return n+(1-n)*.12*(s?.intensity??0)*(s?.confidence??0)}function Zh(i,e){if(!Number.isFinite(e.loftFullRangeSafeFraction)||e.loftFullRangeSafeFraction<=0||!Number.isFinite(e.loftMaximumHorizontalDeviationSafeFraction)||e.loftMaximumHorizontalDeviationSafeFraction<=0)throw new RangeError("Gesture loft range must be a positive finite number.");if(i.length<2)throw new RangeError("Gesture loft requires at least two trace points.");if(i.some(l=>!Number.isFinite(l.x)||!Number.isFinite(l.y)))throw new RangeError("Gesture loft points must contain only finite values.");const t=i[0],n=i[i.length-1];if(t===void 0||n===void 0)throw new RangeError("Gesture loft requires finite endpoints.");let s=0;const r=[];let a=0;for(let l=1;l<i.length;l+=1){const c=i[l-1],h=i[l];if(c===void 0||h===void 0)continue;const u=Un(c,h);r.push(u),a+=u}if(a<=Number.EPSILON)return 0;let o=0;for(let l=1;l<i.length-1;l+=1){const c=i[l];if(c===void 0)continue;o+=r[l-1]??0;const h=o/a,u=ut(t.x,n.x,h);if(Math.abs(c.x-u)>e.loftMaximumHorizontalDeviationSafeFraction)continue;const f=ut(t.y,n.y,h);s=Math.max(s,f-c.y)}return At(s/e.loftFullRangeSafeFraction)}function Jh(i,e){if(!Number.isFinite(e.sideSpinFullRangeSafeFraction)||e.sideSpinFullRangeSafeFraction<=0)throw new RangeError("Gesture side-spin range must be a positive finite number.");if(i.length<2)throw new RangeError("Gesture side-spin requires at least two trace points.");if(i.some(c=>!Number.isFinite(c.x)||!Number.isFinite(c.y)))throw new RangeError("Gesture side-spin points must contain only finite values.");const t=i[0],n=i[i.length-1];if(t===void 0||n===void 0)throw new RangeError("Gesture side-spin requires finite endpoints.");const s=[];let r=0;for(let c=1;c<i.length;c+=1){const h=i[c-1],u=i[c];if(h===void 0||u===void 0)continue;const f=Un(h,u);s.push(f),r+=f}if(r<=Number.EPSILON)return 0;let a=0,o=0;for(let c=1;c<i.length-1;c+=1){const h=i[c];if(h===void 0)continue;a+=s[c-1]??0;const u=a/r,f=ut(t.x,n.x,u),p=h.x-f;Math.abs(p)>Math.abs(o)&&(o=p)}if(Math.abs(o)<=ol)return 0;const l=Math.sign(o)*(Math.abs(o)-ol);return Yt(l/e.sideSpinFullRangeSafeFraction,-1,1)}function Qh(i,e){if(!Number.isFinite(e.topSpinFullRangeSafeFraction)||e.topSpinFullRangeSafeFraction<=0||!Number.isFinite(e.topSpinMaximumHorizontalDeviationSafeFraction)||e.topSpinMaximumHorizontalDeviationSafeFraction<=0)throw new RangeError("Gesture top-spin range must be a positive finite number.");if(i.length<2)throw new RangeError("Gesture top-spin requires at least two trace points.");if(i.some(l=>!Number.isFinite(l.safeAreaPosition01.x)||!Number.isFinite(l.safeAreaPosition01.y)||!Number.isFinite(l.timeSeconds)))throw new RangeError("Gesture top-spin points must contain only finite values.");const t=i[0],n=i[i.length-1];if(t===void 0||n===void 0)throw new RangeError("Gesture top-spin requires finite endpoints.");const s=[];let r=0;for(let l=1;l<i.length;l+=1){const c=i[l-1],h=i[l];if(c===void 0||h===void 0)continue;const u=Un(c.safeAreaPosition01,h.safeAreaPosition01);s.push(u),r+=u}if(r<=Number.EPSILON)return 0;let a=0,o=0;for(let l=1;l<i.length-1;l+=1){const c=i[l];if(c===void 0)continue;o+=s[l-1]??0;const h=o/r,u=ut(t.safeAreaPosition01.x,n.safeAreaPosition01.x,h);if(Math.abs(c.safeAreaPosition01.x-u)>e.topSpinMaximumHorizontalDeviationSafeFraction)continue;const f=ut(t.safeAreaPosition01.y,n.safeAreaPosition01.y,h);a=Math.max(a,c.safeAreaPosition01.y-f)}return a<=ll?0:At((a-ll)/e.topSpinFullRangeSafeFraction)}function Vc(i,e,t,n=null){const s=i[0],r=i[i.length-1];if(s===void 0||r===void 0)throw new Error("At least two preprocessed gesture points are required.");const a=i.map(m=>m.safeAreaPosition01),o=Gh(a,t.smoothingWindow),l=Vh(o,t.resamplePointCount),c=$h(i,a,t),h=jh({dx:r.positionPixels.x-s.positionPixels.x,dyUp:s.positionPixels.y-r.positionPixels.y},e,t),{hook:u,vee:f,descent:p}=Ca(a),g=u?Zh(a,t):0,_=f?At(.65+p*1.4):0;return Object.freeze({category:Wh({loft:g,bounceIntent:_},t),feint:n,aim:h,power:Math.round(Kh(c,t)*1e12)/1e12,loft:g,sideSpin:u||f?0:Jh(a,t),topSpin:f?Math.min(.25,p):Qh(i,t),bounceIntent:_,features:c,rawPoints:i,smoothedPoints:o,resampledPoints:l})}const Pa=[{name:"DIRECT",instruction:"Desliza hacia arriba y suelta. Inclina para apuntar.",takeaway:"La dirección y la rapidez controlan el tiro.",path:[[.5,.85],[.5,.73],[.5,.62]]},{name:"LOB",instruction:"Sube con fuerza y termina con un pequeño gancho hacia abajo.",takeaway:"El balón sube y cae por gravedad. El gancho no lo empuja hacia abajo.",path:[[.5,.85],[.5,.43],[.5,.61]]},{name:"BOUNCE",instruction:"Empieza en el centro, baja y vuelve a subir: una V.",takeaway:"El tiro bajo puede rebotar al tocar el suelo.",path:[[.5,.4],[.5,.8],[.5,.4]]},{name:"ROSCA_LEFT",instruction:"Sube, dibuja una barriga a la izquierda y vuelve subiendo.",takeaway:"La curva añade giro; el final del gesto sigue apuntando.",path:[[.5,.85],[.5,.77],[.39,.7],[.5,.62]]},{name:"ROSCA_RIGHT",instruction:"Sube, dibuja una barriga a la derecha y vuelve subiendo.",takeaway:"La barriga opuesta cambia el sentido del efecto.",path:[[.5,.85],[.5,.77],[.61,.7],[.5,.62]]},{name:"FEINT",instruction:"Amaga de lado, frena y vuelve. Levanta el dedo.",takeaway:"El balón sigue en la mano. Para tirar, empieza OTRO gesto.",path:[[.5,.84],[.61,.8],[.55,.79],[.4,.76]]}],eu=Pa[0];function tu(i,e,t=.36){const n=i.flatMap((s,r)=>r===0?[{x:s[0],y:s[1]}]:Array.from({length:12},(a,o)=>({x:i[r-1][0]+(s[0]-i[r-1][0])*(o+1)/12,y:i[r-1][1]+(s[1]-i[r-1][1])*(o+1)/12})));return n.map((s,r)=>({positionPixels:{x:s.x*e.widthPixels,y:s.y*e.heightPixels},timeSeconds:r/(n.length-1)*t}))}function cl(i,e){const t=tu(i,e),n=t.map(a=>({...a,safeAreaPosition01:{x:a.positionPixels.x/e.widthPixels,y:a.positionPixels.y/e.heightPixels}})),s=bo(n,Ji),r=Gc(t,e,Ji,{nonShootingFeint:s!==null});if(!r.accepted)throw new Error(`Invalid instructional gesture: ${r.reason}`);return Vc(r.points,e,Ji,s)}function Fr(i){return i.feint?"FEINT":i.category==="DIRECT"&&Math.abs(i.sideSpin)>.15?i.sideSpin<0?"ROSCA_LEFT":"ROSCA_RIGHT":i.category}function nu(i,e,t,n){const s=(i.length-1)*Math.min(1,Math.max(0,e)),r=Math.floor(s),a=s-r,o=i.slice(0,r+1).map(l=>({x:l[0]*t,y:l[1]*n}));return r<i.length-1&&o.push({x:(i[r][0]+(i[r+1][0]-i[r][0])*a)*t,y:(i[r][1]+(i[r+1][1]-i[r][1])*a)*n}),o}const hl=()=>({ambience:0,crowd:0,throw:0,flight:0,goal:0,save:0,miss:0,ui:0});class iu{requestedCues=hl();scheduledCues=hl();outputEnabled;enabled;context=null;masterGain=null;ambienceStarted=!1;ambienceNodes=[];noiseBuffer=null;disposed=!1;outputAvailable;constructor(e){this.enabled=e.enabled,this.outputEnabled=e.outputEnabled,this.outputAvailable=this.resolveConstructor()!==null}setEnabled(e){if(!(this.disposed||this.enabled===e)){if(this.enabled=e,!e){this.context?.state==="running"&&this.context.suspend().catch(()=>{});return}this.requestedCues.ui+=1,this.withContext((t,n)=>{this.scheduledCues.ui+=1,this.scheduleTone(t,n,{frequency:620,endFrequency:880,durationSeconds:.08,gain:.05,type:"sine"})})}}shotReleased(e,t){this.disposed||!this.enabled||(this.requestedCues.throw+=1,this.requestedCues.flight+=1,this.withContext((n,s)=>{this.scheduledCues.throw+=1,this.scheduledCues.flight+=1;const r=Math.max(0,Math.min(1,e));this.scheduleNoiseBurst(n,s,{durationSeconds:.16,gain:.075+r*.035,filterFrequency:1250+r*650,filterType:"bandpass"}),this.scheduleTone(n,s,{frequency:105+r*45,endFrequency:68,durationSeconds:.14,gain:.07,type:"triangle"}),this.scheduleTone(n,s,{frequency:175+r*70,endFrequency:360+r*110,durationSeconds:Math.max(.12,t),gain:.022+r*.018,type:"sine"})}))}frameImpact(e){this.disposed||!this.enabled||this.withContext((t,n)=>this.scheduleTone(t,n,{frequency:e==="CROSSBAR"?720:540,endFrequency:230,durationSeconds:.18,gain:.085,type:"triangle"}))}outcome(e){if(this.disposed||!this.enabled)return;const t=e==="GOAL"?"goal":e==="SAVED"?"save":"miss";this.requestedCues[t]+=1,this.requestedCues.crowd+=1,this.requestedCues.ui+=1,this.withContext((n,s)=>{this.scheduledCues[t]+=1,this.scheduledCues.crowd+=1,this.scheduledCues.ui+=1,this.scheduleOutcomeTones(n,s,e),this.scheduleCrowdReaction(n,s,e)})}uiConfirm(){this.disposed||!this.enabled||(this.requestedCues.ui+=1,this.withContext((e,t)=>{this.scheduledCues.ui+=1,this.scheduleTone(e,t,{frequency:520,endFrequency:720,durationSeconds:.07,gain:.045,type:"sine"})}))}diagnostics(){return Object.freeze({enabled:this.enabled,outputEnabled:this.outputEnabled,outputAvailable:this.outputAvailable,state:this.state(),contextState:this.context?.state??"not-created",requestedCues:Object.freeze({...this.requestedCues}),scheduledCues:Object.freeze({...this.scheduledCues}),ambienceStarted:this.ambienceStarted,synthesizedOnly:!0})}dispose(){if(this.disposed)return;this.disposed=!0;for(const t of this.ambienceNodes){try{t.stop()}catch{}t.disconnect()}this.ambienceNodes=[],this.masterGain?.disconnect(),this.masterGain=null,this.noiseBuffer=null;const e=this.context;this.context=null,e!==null&&e.state!=="closed"&&e.close().catch(()=>{})}state(){return this.disposed?"disposed":this.outputEnabled?this.outputAvailable?this.enabled?this.context===null?"armed":this.context.state==="running"?"running":"suspended":"muted":"unavailable":"capture-muted"}resolveConstructor(){const e=globalThis;return e.AudioContext??e.webkitAudioContext??null}async withContext(e){if(this.disposed||!this.enabled||!this.outputEnabled||!this.outputAvailable)return;const t=this.ensureContext();if(t!==null)try{if(t.state==="suspended"&&await t.resume(),this.disposed||!this.enabled||t.state!=="running")return;this.startAmbience(t);const n=this.masterGain;n!==null&&e(t,n)}catch{this.outputAvailable=!1}}ensureContext(){if(this.context!==null)return this.context;const e=this.resolveConstructor();if(e===null)return this.outputAvailable=!1,null;try{const t=new e({latencyHint:"interactive"}),n=t.createGain();return n.gain.setValueAtTime(.42,t.currentTime),n.connect(t.destination),this.context=t,this.masterGain=n,this.noiseBuffer=this.createGeneratedNoise(t),t}catch{return this.outputAvailable=!1,null}}startAmbience(e){if(this.ambienceStarted||this.masterGain===null)return;this.ambienceStarted=!0,this.requestedCues.ambience+=1,this.scheduledCues.ambience+=1;const t=e.createGain();t.gain.setValueAtTime(.018,e.currentTime);const n=e.createBiquadFilter();n.type="lowpass",n.frequency.setValueAtTime(520,e.currentTime),t.connect(n),n.connect(this.masterGain);for(const[s,r]of[[82,"sine"],[123,"triangle"]]){const a=e.createOscillator();a.type=r,a.frequency.setValueAtTime(s,e.currentTime),a.detune.setValueAtTime(s===82?-4:5,e.currentTime),a.connect(t),a.start(),this.ambienceNodes.push(a)}}scheduleOutcomeTones(e,t,n){if(n==="GOAL"){this.scheduleTone(e,t,{frequency:392,endFrequency:784,durationSeconds:.32,gain:.095,type:"sawtooth"}),this.scheduleTone(e,t,{frequency:523.25,endFrequency:659.25,durationSeconds:.38,gain:.06,type:"triangle",delaySeconds:.05});return}if(n==="SAVED"){this.scheduleTone(e,t,{frequency:168,endFrequency:92,durationSeconds:.26,gain:.11,type:"square"}),this.scheduleNoiseBurst(e,t,{durationSeconds:.2,gain:.08,filterFrequency:720,filterType:"lowpass"});return}this.scheduleTone(e,t,{frequency:260,endFrequency:128,durationSeconds:.34,gain:.07,type:"triangle"})}scheduleCrowdReaction(e,t,n){this.scheduleNoiseBurst(e,t,{durationSeconds:n==="GOAL"?.62:.42,gain:n==="GOAL"?.11:n==="SAVED"?.085:.05,filterFrequency:n==="GOAL"?1450:n==="SAVED"?980:620,filterType:"bandpass",delaySeconds:n==="MISS"?.04:0})}scheduleTone(e,t,n){const s=e.currentTime+(n.delaySeconds??0),r=s+n.durationSeconds,a=e.createOscillator(),o=e.createGain();a.type=n.type,a.frequency.setValueAtTime(n.frequency,s),a.frequency.exponentialRampToValueAtTime(Math.max(1,n.endFrequency),r),o.gain.setValueAtTime(1e-4,s),o.gain.exponentialRampToValueAtTime(n.gain,s+.012),o.gain.exponentialRampToValueAtTime(1e-4,r),a.connect(o),o.connect(t),a.start(s),a.stop(r+.02)}scheduleNoiseBurst(e,t,n){const s=this.noiseBuffer;if(s===null)return;const r=e.currentTime+(n.delaySeconds??0),a=r+n.durationSeconds,o=e.createBufferSource(),l=e.createBiquadFilter(),c=e.createGain();o.buffer=s,l.type=n.filterType,l.frequency.setValueAtTime(n.filterFrequency,r),l.Q.setValueAtTime(.7,r),c.gain.setValueAtTime(1e-4,r),c.gain.exponentialRampToValueAtTime(n.gain,r+.02),c.gain.exponentialRampToValueAtTime(1e-4,a),o.connect(l),l.connect(c),c.connect(t),o.start(r),o.stop(a+.02)}createGeneratedNoise(e){const t=Math.max(1,Math.floor(e.sampleRate*.72)),n=e.createBuffer(1,t,e.sampleRate),s=n.getChannelData(0);let r=7999950;for(let a=0;a<s.length;a+=1)r=Math.imul(r,1664525)+1013904223>>>0,s[a]=r/4294967295*2-1;return n}}const ul=1e-9;class su{stepSeconds;maximumFrameSeconds;maximumStepsPerFrame;accumulatorSeconds=0;elapsedSimulationSeconds=0;constructor(e={}){if(this.stepSeconds=e.stepSeconds??1/60,this.maximumFrameSeconds=e.maximumFrameSeconds??.25,this.maximumStepsPerFrame=e.maximumStepsPerFrame??8,!Number.isFinite(this.stepSeconds)||this.stepSeconds<=0)throw new RangeError("Fixed clock step must be a positive finite number.");if(!Number.isFinite(this.maximumFrameSeconds)||this.maximumFrameSeconds<=0)throw new RangeError("Maximum frame duration must be a positive finite number.");if(!Number.isInteger(this.maximumStepsPerFrame)||this.maximumStepsPerFrame<1)throw new RangeError("Maximum steps per frame must be a positive integer.")}get simulationSeconds(){return this.elapsedSimulationSeconds}advance(e,t){const n=Number.isFinite(e)?Math.max(0,e):0,s=Math.min(n,this.maximumFrameSeconds);let r=n-s;this.accumulatorSeconds+=s;let a=0;for(;this.accumulatorSeconds+ul>=this.stepSeconds&&a<this.maximumStepsPerFrame;)this.accumulatorSeconds-=this.stepSeconds,this.elapsedSimulationSeconds+=this.stepSeconds,a+=1,t(this.stepSeconds,this.elapsedSimulationSeconds);if(this.accumulatorSeconds+ul>=this.stepSeconds){const o=this.accumulatorSeconds%this.stepSeconds;r+=this.accumulatorSeconds-o,this.accumulatorSeconds=o}return Object.freeze({steps:a,interpolationAlpha:this.accumulatorSeconds/this.stepSeconds,droppedSeconds:r})}reset(){this.accumulatorSeconds=0,this.elapsedSimulationSeconds=0}}function ru(){return{request:i=>window.requestAnimationFrame(i),cancel:i=>window.cancelAnimationFrame(i)}}class au{constructor(e){this.options=e,this.clock=new su({stepSeconds:e.fixedStepSeconds}),this.scheduler=e.scheduler??ru()}options;clock;scheduler;animationFrame;previousTimestampMilliseconds;running=!1;get simulationSeconds(){return this.clock.simulationSeconds}start(){if(!this.running){if(this.running=!0,this.previousTimestampMilliseconds=void 0,this.options.onPresent?.(0),this.options.manualPumping===!0){this.animationFrame=this.scheduler.request(this.presentationFrame);return}this.animationFrame=this.scheduler.request(this.frame)}}pumpFrames(e){if(!this.running||this.options.manualPumping!==!0)throw new Error("Manual frame pumping is only available in running manual mode.");if(!Number.isInteger(e)||e<0)throw new RangeError("Manual frame count must be a non-negative integer.");for(let t=0;t<e;t+=1){const n=this.clock.advance(this.options.fixedStepSeconds,this.options.onFixedUpdate);this.options.onPresent?.(n.interpolationAlpha)}}presentFrames(e){if(!this.running||this.options.manualPumping!==!0)throw new Error("Manual presentation is only available in running manual mode.");if(!Number.isInteger(e)||e<0)throw new RangeError("Presentation frame count must be a non-negative integer.");for(let t=0;t<e;t+=1)this.options.onPresent?.(0)}stop(){this.running&&(this.running=!1,this.animationFrame!==void 0&&(this.scheduler.cancel(this.animationFrame),this.animationFrame=void 0),this.previousTimestampMilliseconds=void 0)}dispose(){this.stop()}frame=e=>{if(!this.running)return;const t=this.previousTimestampMilliseconds??e,n=(e-t)/1e3;this.previousTimestampMilliseconds=e;const s=this.clock.advance(n,this.options.onFixedUpdate);this.options.onPresent?.(s.interpolationAlpha),this.animationFrame=this.scheduler.request(this.frame)};presentationFrame=()=>{this.running&&(this.options.onPresent?.(0),this.animationFrame=this.scheduler.request(this.presentationFrame))}}class ou{handlers=new Map;on(e,t){let n=this.handlers.get(e);n===void 0&&(n=new Set,this.handlers.set(e,n));const s=t;return n.add(s),()=>{n.delete(s),n.size===0&&this.handlers.delete(e)}}emit(e,t){const n=this.handlers.get(e);if(n!==void 0)for(const s of[...n])s(t)}clear(){this.handlers.clear()}}const lu={balanced:Object.freeze({name:"balanced",runtimeRole:"default_gameplay",maximumPixelRatio:1.25,shadowMapSize:512,shadowMapSizeMaximum:1024,crowdInstances:160,crowdInstancesMaximum:240,animatedCrowdInstances:0,animatedCrowdInstancesMaximum:48,crowdAnimationMaximumHz:0,proceduralTextureResolution:96,proceduralTextureResolutionMaximum:128,environmentMapSize:32,environmentMapSizeMaximum:96,shadowCastingLightsMaximum:1,shadowCastingKeyLight:!1,antialias:!1,postProcessing:!1,postProcessingAllowed:!1,frustumCullingRequired:!0}),high:Object.freeze({name:"high",runtimeRole:"explicit_opt_in_gameplay",maximumPixelRatio:1.5,shadowMapSize:512,shadowMapSizeMaximum:1024,crowdInstances:256,crowdInstancesMaximum:480,animatedCrowdInstances:0,animatedCrowdInstancesMaximum:96,crowdAnimationMaximumHz:0,proceduralTextureResolution:128,proceduralTextureResolutionMaximum:192,environmentMapSize:64,environmentMapSizeMaximum:128,shadowCastingLightsMaximum:1,shadowCastingKeyLight:!1,antialias:!1,postProcessing:!1,postProcessingAllowed:!1,frustumCullingRequired:!0}),capture:Object.freeze({name:"capture",runtimeRole:"offline_capture_only",maximumPixelRatio:1,shadowMapSize:1024,shadowMapSizeMaximum:2048,crowdInstances:480,crowdInstancesMaximum:960,animatedCrowdInstances:0,animatedCrowdInstancesMaximum:0,crowdAnimationMaximumHz:0,proceduralTextureResolution:192,proceduralTextureResolutionMaximum:256,environmentMapSize:96,environmentMapSizeMaximum:256,shadowCastingLightsMaximum:1,shadowCastingKeyLight:!0,antialias:!0,postProcessing:!1,postProcessingAllowed:!0,frustumCullingRequired:!0})};function cu(i){return lu[i]}function hu(i,e){return e==="gameplay"?i==="high"?"high":"balanced":i==="balanced"||i==="medium"||i==="low"?"balanced":i==="high"?"high":"capture"}class uu{disposeActions=[];disposed=!1;track(e){return this.assertActive(),this.disposeActions.push(()=>{e.dispose()}),e}add(e){return this.assertActive(),this.disposeActions.push(e),e}dispose(){if(this.disposed)return;this.disposed=!0;const e=[];for(let t=this.disposeActions.length-1;t>=0;t-=1)try{this.disposeActions[t]?.()}catch(n){e.push(n)}if(this.disposeActions.length=0,e.length>0)throw new AggregateError(e,"One or more resources failed to dispose.")}assertActive(){if(this.disposed)throw new Error("Cannot track a resource after disposal.")}}const du=4294967296,fu=1831565813;function pu(i,e){let t=(i^2166136261)>>>0;for(let n=0;n<e.length;n+=1)t^=e.charCodeAt(n),t=Math.imul(t,16777619)>>>0;return t}class Pr{constructor(e){if(this.initialSeed=e,!Number.isFinite(e))throw new RangeError("RNG seed must be finite.");this.state=e>>>0}initialSeed;state;nextUint32(){this.state=this.state+fu>>>0;let e=this.state;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),(e^e>>>14)>>>0}nextFloat(){return this.nextUint32()/du}nextInt(e){if(!Number.isInteger(e)||e<1)throw new RangeError("RNG integer bound must be a positive integer.");return Math.floor(this.nextFloat()*e)}fork(e){return new Pr(pu(this.initialSeed>>>0,e))}}const mu=["hero-ready","hero-release","hero-ball-flight","hero-promo","hero-goal","hero-save-high","hero-miss","mobile-ready","round-complete"],zn=Object.freeze({width:1920,height:1080}),Wc=Object.freeze({"hero-ready":Object.freeze({name:"hero-ready",viewport:zn,quality:"balanced",seed:1,requirement:"READY",targetShotFrame:null,expectedOutcome:null,expectedKeeperZone:null}),"hero-release":Object.freeze({name:"hero-release",viewport:zn,quality:"balanced",seed:1,requirement:"ACTIVE_SHOT",targetShotFrame:8,expectedOutcome:null,expectedKeeperZone:null}),"hero-ball-flight":Object.freeze({name:"hero-ball-flight",viewport:zn,quality:"balanced",seed:1,requirement:"ACTIVE_SHOT",targetShotFrame:12,expectedOutcome:null,expectedKeeperZone:null}),"hero-promo":Object.freeze({name:"hero-promo",viewport:zn,quality:"capture",seed:1,requirement:"ACTIVE_SHOT",targetShotFrame:12,expectedOutcome:null,expectedKeeperZone:null}),"hero-goal":Object.freeze({name:"hero-goal",viewport:zn,quality:"balanced",seed:1,requirement:"RESULT",targetShotFrame:null,expectedOutcome:"GOAL",expectedKeeperZone:null}),"hero-save-high":Object.freeze({name:"hero-save-high",viewport:zn,quality:"balanced",seed:3,requirement:"RESULT",targetShotFrame:null,expectedOutcome:"SAVED",expectedKeeperZone:"high-center"}),"hero-miss":Object.freeze({name:"hero-miss",viewport:zn,quality:"balanced",seed:1,requirement:"RESULT",targetShotFrame:null,expectedOutcome:"MISS",expectedKeeperZone:null}),"mobile-ready":Object.freeze({name:"mobile-ready",viewport:Object.freeze({width:844,height:390}),quality:"balanced",seed:1,requirement:"READY",targetShotFrame:null,expectedOutcome:null,expectedKeeperZone:null}),"round-complete":Object.freeze({name:"round-complete",viewport:zn,quality:"balanced",seed:1,requirement:"ROUND_COMPLETE",targetShotFrame:null,expectedOutcome:null,expectedKeeperZone:null})}),gu=Object.freeze(mu.map(i=>Wc[i]));function _u(i){return Wc[i]}const xu=Object.freeze({"low-left":Object.freeze({x:-1,y:-1}),"low-center":Object.freeze({x:0,y:-1}),"low-right":Object.freeze({x:1,y:-1}),"mid-left":Object.freeze({x:-1,y:0}),"mid-center":Object.freeze({x:0,y:0}),"mid-right":Object.freeze({x:1,y:0}),"high-left":Object.freeze({x:-1,y:1}),"high-center":Object.freeze({x:0,y:1}),"high-right":Object.freeze({x:1,y:1})});function qc(i,e,t){const n=xu[i];return Object.freeze({x:e.x+n.x*t.horizontalRangeMeters,y:e.y+n.y*t.verticalRangeMeters,z:e.z})}function Xc(i,e){return At((i-e.reactionDelaySeconds)/e.diveDurationSeconds)}function Bs(i,e,t,n,s=e){const r=qc(i,e,t),a=Xc(n,t);return Object.freeze({x:ut(s.x,r.x,a),y:ut(s.y,r.y,a),z:e.z})}function Su(i,e,t,n){const s=At(n/t.returnDurationSeconds);return Object.freeze({x:ut(i.x,e.x,s),y:ut(i.y,e.y,s),z:e.z})}const fs=1e-9,dl="mid-center";function vu(i){if(![i.feintHoldSeconds,i.feintRecoverySeconds,i.feintMaximumSpeedMetersPerSecond,i.minimumReadSeconds,i.maximumReadSeconds,i.minimumCueConfidence,i.minimumCueAgreementDot,i.horizontalCommitThreshold,i.verticalCommitThreshold,i.maximumTendency].every(Number.isFinite))throw new RangeError("Goalkeeper commitment configuration must be finite.");if(i.feintHoldSeconds<=0||i.feintRecoverySeconds<=0||i.feintMaximumSpeedMetersPerSecond<=0)throw new RangeError("Invalid FEINT recovery bounds");if(i.minimumReadSeconds<=0||i.maximumReadSeconds<i.minimumReadSeconds)throw new RangeError("Goalkeeper read bounds must be positive and ordered.");if(i.minimumCueConfidence<=0||i.minimumCueConfidence>1)throw new RangeError("Goalkeeper cue confidence must be within (0, 1].");if(i.minimumCueAgreementDot<-1||i.minimumCueAgreementDot>=1)throw new RangeError("Goalkeeper cue agreement must be within [-1, 1).");if(!Number.isInteger(i.minimumStableCueSamples)||i.minimumStableCueSamples<1)throw new RangeError("Goalkeeper stable cue sample count must be a positive integer.");if(i.horizontalCommitThreshold<0||i.horizontalCommitThreshold>=1||i.verticalCommitThreshold<0||i.verticalCommitThreshold>=1)throw new RangeError("Goalkeeper commitment thresholds must be within [0, 1).");if(i.maximumTendency<0||i.maximumTendency>.25)throw new RangeError("Goalkeeper tendency must be within [0, 0.25].")}class Mu{constructor(e,t){this.config=e,this.rng=t,vu(e)}config;rng;feintAgeSeconds=null;offset={x:0,y:0};recoveringGesture=!1;phase="READY";observedCue=null;seededTendency=null;commitmentTimeSeconds=null;committedDestination=null;releaseDestination=null;gestureElapsedSeconds=0;stableCueSamples=0;conflictingCue=!1;referenceDirection=null;gestureQueuedOrActive=!1;readingClosed=!1;queuedEvents=[];completeFeint(){this.consumeQueuedEvents(),this.recoveringGesture=!1,this.feintAgeSeconds===null&&(this.feintAgeSeconds=0)}preReleasePosition(e){return{x:e.x+this.offset.x,y:e.y+this.offset.y,z:e.z}}queueGestureStart(){if(this.feintAgeSeconds!==null){this.recoveringGesture=!0;return}this.gestureQueuedOrActive||(this.clearState(),this.gestureQueuedOrActive=!0,this.queuedEvents.push(Object.freeze({type:"START"})))}queueObservation(e){this.gestureQueuedOrActive&&(this.validateObservation(e),this.queuedEvents.push(Object.freeze({type:"OBSERVATION",observation:Ur(e)})))}advance(e){if(!Number.isFinite(e)||e<=0)throw new RangeError("Goalkeeper fixed step must be finite and positive.");if(this.consumeQueuedEvents(),this.feintAgeSeconds!==null){this.feintAgeSeconds<this.config.feintHoldSeconds&&this.phase!=="COMMIT"&&this.advanceReading(e),this.feintAgeSeconds+=e;const t=this.feintAgeSeconds>=this.config.feintHoldSeconds;t&&(this.phase="RECOVER");const n=!t&&this.committedDestination!==null?qc(this.committedDestination,{x:0,y:0,z:0},this.config):{x:0,y:0},s=n.x*(t?1:.35)-this.offset.x,r=n.y*(t?1:.35)-this.offset.y,a=Math.hypot(s,r),o=a===0?0:Math.min(1,this.config.feintMaximumSpeedMetersPerSecond*e/a);if(this.offset.x+=s*o,this.offset.y+=r*o,t&&a<=this.config.feintMaximumSpeedMetersPerSecond*e&&this.feintAgeSeconds>=this.config.feintHoldSeconds+this.config.feintRecoverySeconds){const l=this.recoveringGesture;this.clearState(),l&&this.queueGestureStart()}return}this.advanceReading(e)}consumeQueuedEvents(){for(let e=0;e<this.queuedEvents.length;e+=1){const t=this.queuedEvents[e];t.type==="START"?(this.phase="READ",this.seededTendency=Object.freeze({x:(this.rng.nextFloat()*2-1)*this.config.maximumTendency,y:(this.rng.nextFloat()*2-1)*this.config.maximumTendency})):this.phase!=="COMMIT"&&!this.readingClosed&&this.consumeObservation(t.observation)}this.queuedEvents.length=0}advanceReading(e){if(!(!this.gestureQueuedOrActive||this.phase==="READY")&&(this.gestureElapsedSeconds+=e,this.phase!=="COMMIT")){if(this.gestureElapsedSeconds+fs>=this.config.maximumReadSeconds){this.phase="HOLD",this.readingClosed=!0;return}if(this.gestureElapsedSeconds+fs<this.config.minimumReadSeconds){this.phase="READ";return}this.observedCue!==null&&!this.conflictingCue&&this.stableCueSamples>=this.config.minimumStableCueSamples&&this.observedCue.confidence>this.config.minimumCueConfidence+fs?this.commit(this.observedCue.apparentDirection):this.phase="HOLD"}}releaseGesture(){return this.consumeQueuedEvents(),this.feintAgeSeconds=null,this.recoveringGesture=!1,this.gestureQueuedOrActive=!1,this.phase!=="COMMIT"||this.committedDestination===null?(this.phase="HOLD",this.committedDestination=null,this.commitmentTimeSeconds=null,this.releaseDestination=dl,dl):(this.releaseDestination=this.committedDestination,this.committedDestination)}cancelGesture(){if(this.feintAgeSeconds!==null){this.recoveringGesture=!1;return}this.clearState()}reset(){this.clearState()}get currentPhase(){return this.phase}get currentDestination(){return this.committedDestination}diagnostics(){return Object.freeze({phase:this.phase,feintAgeSeconds:this.feintAgeSeconds,positionOffset:Object.freeze({...this.offset}),observedCue:this.observedCue,seededTendency:this.seededTendency,commitmentTimeSeconds:this.commitmentTimeSeconds,committedDestination:this.committedDestination,releaseDestination:this.releaseDestination,gestureElapsedSeconds:this.gestureElapsedSeconds,stableCueSamples:this.stableCueSamples,conflictingCue:this.conflictingCue})}consumeObservation(e){const t=e.feint===null?Ur(e):Ur({...e,apparentDirection:e.feint.apparentDirection});if(this.observedCue=t,t.confidence<=this.config.minimumCueConfidence+fs)return;if(t.feint!==null){this.referenceDirection=t.apparentDirection,this.conflictingCue=!1,this.stableCueSamples=Math.max(this.stableCueSamples,this.config.minimumStableCueSamples);return}if(this.referenceDirection===null){this.referenceDirection=t.apparentDirection,this.stableCueSamples=1;return}if(this.referenceDirection.x*t.apparentDirection.x+this.referenceDirection.y*t.apparentDirection.y<=this.config.minimumCueAgreementDot+fs){this.conflictingCue=!0,this.stableCueSamples=0;return}this.conflictingCue||(this.stableCueSamples+=1)}commit(e){const t=this.seededTendency??Object.freeze({x:0,y:0}),n=e.x+t.x,s=e.y+t.y,r=n<-this.config.horizontalCommitThreshold?"left":n>this.config.horizontalCommitThreshold?"right":"center",a=s<-this.config.verticalCommitThreshold?"low":s>this.config.verticalCommitThreshold?"high":"mid";this.committedDestination=`${a}-${r}`,this.commitmentTimeSeconds=this.gestureElapsedSeconds,this.phase="COMMIT",this.readingClosed=!0}validateObservation(e){if(![e.apparentDirection.x,e.apparentDirection.y,e.elapsedGestureSeconds,e.confidence].every(Number.isFinite))throw new RangeError("Goalkeeper observations must contain finite values.");const n=Math.hypot(e.apparentDirection.x,e.apparentDirection.y);if(Math.abs(n-1)>1e-6||e.elapsedGestureSeconds<0||e.confidence<0||e.confidence>1)throw new RangeError("Goalkeeper observations require a unit direction, non-negative time, and normalized confidence.")}clearState(){this.feintAgeSeconds=null,this.offset={x:0,y:0},this.recoveringGesture=!1,this.phase="READY",this.observedCue=null,this.seededTendency=null,this.commitmentTimeSeconds=null,this.committedDestination=null,this.releaseDestination=null,this.gestureElapsedSeconds=0,this.stableCueSamples=0,this.conflictingCue=!1,this.referenceDirection=null,this.gestureQueuedOrActive=!1,this.readingClosed=!1,this.queuedEvents.length=0}}function Ur(i){return Object.freeze({apparentDirection:Object.freeze({...i.apparentDirection}),elapsedGestureSeconds:i.elapsedGestureSeconds,confidence:i.confidence,feint:i.feint})}function jc(){return Object.freeze({phase:"READY",shotsTaken:0,goals:0,saves:0,misses:0,lastOutcome:null})}function yu(i){if(i.phase!=="READY")throw new Error(`Cannot begin a shot while match is '${i.phase}'.`);return Object.freeze({...i,phase:"SHOT_ACTIVE",lastOutcome:null})}function bu(i,e,t){if(i.phase!=="SHOT_ACTIVE")throw new Error(`Cannot resolve a shot while match is '${i.phase}'.`);const n=i.shotsTaken+1;return Object.freeze({phase:n>=t.shotsPerRound?"ROUND_COMPLETE":"RESULT",shotsTaken:n,goals:i.goals+(e==="GOAL"?1:0),saves:i.saves+(e==="SAVED"?1:0),misses:i.misses+(e==="MISS"?1:0),lastOutcome:e})}function Eu(i){if(i.phase!=="RESULT")throw new Error(`Cannot prepare next shot while match is '${i.phase}'.`);return Object.freeze({...i,phase:"READY"})}function Tu(){return jc()}function wu(i){const e=i.widthMeters/2,t=i.heightMeters/2,n=Math.max(0,i.ballRadiusMeters+i.safetyMarginMeters),s=Math.max(0,e-n),r=Math.max(0,t-n);return Object.freeze({validHorizontalHalfRange:s,validVerticalHalfRange:r,horizontalTargetRange:s+e*i.horizontalOvershootFactor,verticalTargetLow:-r-t*i.verticalOvershootFactor,verticalTargetHigh:r+t*i.verticalOvershootFactor})}function Au(i,e,t){const n=wu(t),s=Yt(i,-1,1),r=At((Yt(e,-1,1)+1)/2);return Object.freeze({x:t.center.x-s*n.horizontalTargetRange,y:t.center.y+ut(n.verticalTargetLow,n.verticalTargetHigh,r),z:t.center.z})}const Yc=1e-9;function Ru(i,e){const t=Yc;return Math.abs(i.x-e.center.x)<=e.widthMeters/2-e.ballRadiusMeters+t&&i.y>=e.center.y-e.heightMeters/2+e.ballRadiusMeters-t&&i.y<=e.center.y+e.heightMeters/2-e.ballRadiusMeters+t}function Cu(i,e){return ut(e.maximumDurationSeconds,e.minimumDurationSeconds,At(i))}const Hs=2.5,fl=1e-10,wt=Number.POSITIVE_INFINITY,Bn=1e-6,Pu=4,Lu=4,Du=1,pl=1e-12,Iu=1e-10;function Ou(i,e,t,n,s,r=0,a=0,o=0,l=0){Vi(i,"Ball release position"),Vi(e,"Ball aim target"),Eo(s),ku(n);const c=$c(t),h=zu(r),u=Bu(a),f=Hu(o),p=Kc(l),g=Cu(c,n);let _=Nu(c,s);const m=e.x-i.x,d=ut(s.minimumLaunchLiftMeters,s.maximumLaunchLiftMeters,h),b=e.y-i.y+d-p*1.8,E=e.z-i.z,M=Math.hypot(m,b,E);if(!Number.isFinite(M)||M<=Number.EPSILON)throw new RangeError("Ball launch direction must have finite non-zero length.");const w=_/M;let A=Object.freeze({x:m*w,y:b*w,z:E*w});if(h>.6){const C=ut(1.3,1.02,c),D={x:m/C,y:(e.y-i.y-.5*s.gravityMetersPerSecondSquared*C*C)/C,z:E/C};A=Object.freeze({x:ut(A.x,D.x,(h-.6)/.4),y:ut(A.y,D.y,(h-.6)/.4),z:ut(A.z,D.z,(h-.6)/.4)}),_=Math.hypot(A.x,A.y,A.z)}return{playableVolume:Object.freeze({...s.playableVolume}),position:Hr(i),previousPosition:Hr(i),velocity:Hr(A),gravityMetersPerSecondSquared:s.gravityMetersPerSecondSquared,releasePower:c,releaseLoft:h,releaseSideSpin:u,releaseTopSpin:f,releaseBounceIntent:p,launchLiftMeters:d,sideSpinAccelerationMetersPerSecondSquared:-u*s.maximumSideSpinAccelerationMetersPerSecondSquared,topSpinDropAccelerationMetersPerSecondSquared:f*s.maximumTopSpinDropAccelerationMetersPerSecondSquared,releaseSpeedMetersPerSecond:_,initialVelocity:A,postRestitution:Yt(s.postRestitution,0,1),crossbarRestitution:Yt(s.crossbarRestitution,0,1),groundRestitution:Fu(p,s),minimumGroundReboundSpeedMetersPerSecond:s.minimumGroundReboundSpeedMetersPerSecond,maximumGroundBounces:s.maximumGroundBounces,groundBounceCount:0,floorSliding:!1,durationSeconds:g,elapsedSeconds:0,contactHistory:[],terminalState:null}}function Nu(i,e){return Eo(e),ut(e.minimumReleaseSpeedMetersPerSecond,e.maximumReleaseSpeedMetersPerSecond,$c(i))}function Fu(i,e){return Eo(e),ut(e.minimumGroundRestitution,e.maximumGroundRestitution,Kc(i))}function Uu(i,e,t,n,s){if(i.terminalState!==null)return i.terminalState;if(!Number.isFinite(e)||e<=0)throw new RangeError("Ball flight step must be a positive finite number.");Gu(i),i.previousPosition.x=i.position.x,i.previousPosition.y=i.position.y,i.previousPosition.z=i.position.z;let r=e,a=0,o=0,l=0,c=0;for(;r>Number.EPSILON;){const h=i.position.x,u=i.position.y,f=i.position.z,p=i.velocity.x,g=i.velocity.y,_=i.velocity.z,m=Math.hypot(p,_);if(i.floorSliding&&m<=fl)return i.velocity.x=0,i.velocity.y=0,i.velocity.z=0,Br(i,"SETTLED",zr(i));const d=i.floorSliding?Math.min(r,m/Hs):r,b=i.floorSliding?0:i.gravityMetersPerSecondSquared-i.topSpinDropAccelerationMetersPerSecondSquared,E=i.floorSliding?-Hs*p/m:i.sideSpinAccelerationMetersPerSecondSquared,M=i.floorSliding?-Hs*_/m:0,w=h+p*d+.5*E*d*d,A=u+g*d+.5*b*d*d,C=f+_*d+.5*M*d*d,D=a/e,S=(a+d)/e,y=En(s.previousPosition.x,s.currentPosition.x,D),P=En(s.previousPosition.y,s.currentPosition.y,D),N=En(s.previousPosition.z,s.currentPosition.z,D),z=En(s.previousPosition.x,s.currentPosition.x,S),q=En(s.previousPosition.y,s.currentPosition.y,S),G=En(s.previousPosition.z,s.currentPosition.z,S),V=t.center.z+t.ballRadiusMeters,$=Math.abs(f-V)<=Yc?V:f,k=$<=V?ys($,_,M,V,d):wt,ie=i.floorSliding?wt:Xu(u,g,b,d,t.ballRadiusMeters),ce=c<Du?ju(h,u,f,p,g,_,E,b,d,y,P,N,z,q,G,n.saveRadiusMeters+t.ballRadiusMeters,M):wt,ue=o<Pu?qu(h,u,f,p,g,_,E,b,d,t,M):null,Ie=ue?.fraction??wt,Ue=l<Lu?Wu(h,u,f,p,g,_,b,E,d,t,M):null,je=Ue?.fraction??wt,He=Vu(ie,Ie,je,ce,k),j=He===null?wt:He==="GROUND"?ie:He==="VERTICAL_POST"?Ie:He==="CROSSBAR"?je:He==="KEEPER"?ce:k,K=$u(i,d,t.ballRadiusMeters,E,b,M),oe=K<j?"PLAY_VOLUME":He,Te=Math.min(K,j);if(oe===null)return i.position.x=w,i.position.y=A,i.position.z=C,i.velocity.x=p+E*d,i.velocity.y=g+b*d,i.velocity.z=_+M*d,i.elapsedSeconds+=d,i.floorSliding&&d<r+Number.EPSILON&&m-Hs*d<=fl?(i.velocity.x=0,i.velocity.y=0,i.velocity.z=0,Br(i,"SETTLED",zr(i))):null;const re=d*Te;if(i.position.x=h+p*re+.5*E*re*re,i.position.y=oe==="GROUND"?t.ballRadiusMeters:u+g*re+.5*b*re*re,i.position.z=f+_*re+.5*M*re*re,i.velocity.x=p+E*re,i.velocity.y=g+b*re,i.velocity.z=_+M*re,i.elapsedSeconds+=re,a+=re,r-=re,oe==="GROUND"){const Ce=Et(i.position),R=Et(i.velocity),ke=-i.velocity.y*i.groundRestitution;if(i.groundBounceCount<i.maximumGroundBounces&&i.velocity.y<0&&ke>=i.minimumGroundReboundSpeedMetersPerSecond){i.velocity.y=ke,i.position.y=t.ballRadiusMeters+Bn;const xe=Et(i.velocity);i.contactHistory.push(Object.freeze({kind:"GROUND",elapsedSeconds:i.elapsedSeconds,position:Ce,normal:Object.freeze({x:0,y:1,z:0}),incomingVelocity:R,outgoingVelocity:xe,outcome:null})),i.groundBounceCount+=1;continue}i.velocity.y=0,i.floorSliding=!0,i.contactHistory.push(Object.freeze({kind:"GROUND",elapsedSeconds:i.elapsedSeconds,position:Ce,normal:Object.freeze({x:0,y:1,z:0}),incomingVelocity:R,outgoingVelocity:Et(i.velocity),outcome:null}));continue}if(oe==="VERTICAL_POST"){if(ue===null)throw new Error("Vertical-post contact is missing swept collision data.");const Ce=Et(i.position),R=Et(i.velocity),ke=i.velocity.x*ue.normal.x+i.velocity.z*ue.normal.z,we=(1+i.postRestitution)*ke;i.velocity.x-=we*ue.normal.x,i.velocity.z-=we*ue.normal.z;const xe=t.ballRadiusMeters+t.postThicknessMeters/2;i.position.x=ue.centerX+ue.normal.x*(xe+Bn),i.position.z=t.center.z+ue.normal.z*(xe+Bn);const de=Et(i.velocity);i.contactHistory.push(Object.freeze({kind:"VERTICAL_POST",post:ue.post,elapsedSeconds:i.elapsedSeconds,position:Ce,normal:ue.normal,incomingVelocity:R,outgoingVelocity:de,outcome:null})),o+=1;continue}if(oe==="CROSSBAR"){if(Ue===null)throw new Error("Crossbar contact is missing swept collision data.");const Ce=Et(i.position),R=Et(i.velocity),ke=i.velocity.y*Ue.normal.y+i.velocity.z*Ue.normal.z,we=(1+i.crossbarRestitution)*ke;i.velocity.y-=we*Ue.normal.y,i.velocity.z-=we*Ue.normal.z;const xe=t.ballRadiusMeters+t.postThicknessMeters/2;i.position.y=Ue.centerY+Ue.normal.y*(xe+Bn),i.position.z=t.center.z+Ue.normal.z*(xe+Bn);const de=Et(i.velocity);i.contactHistory.push(Object.freeze({kind:"CROSSBAR",elapsedSeconds:i.elapsedSeconds,position:Ce,normal:Ue.normal,incomingVelocity:R,outgoingVelocity:de,outcome:null})),i.velocity.y>0&&(i.floorSliding=!1),l+=1;continue}if(oe==="KEEPER"){const Ce=Et(i.position),R=Et(i.velocity),ke=En(y,z,Te),we=En(P,q,Te),xe=En(N,G,Te),de=(s.currentPosition.x-s.previousPosition.x)/e,et=(s.currentPosition.y-s.previousPosition.y)/e,_e=(s.currentPosition.z-s.previousPosition.z)/e,Ne=i.velocity.x-de,lt=i.velocity.y-et,st=i.velocity.z-_e,T=Yu(i.position.x-ke,i.position.y-we,i.position.z-xe,Ne,lt,st),x=Ne*T.x+lt*T.y+st*T.z,U=x<0?(1+Yt(n.contactRestitution,0,1))*x:0;i.velocity.x=Ne-U*T.x+de,i.velocity.y=lt-U*T.y+et,i.velocity.z=st-U*T.z+_e;const X=n.saveRadiusMeters+t.ballRadiusMeters;i.position.x=ke+T.x*(X+Bn),i.position.y=we+T.y*(X+Bn),i.position.z=xe+T.z*(X+Bn);const Z=Et(i.velocity);i.contactHistory.push(Object.freeze({kind:"KEEPER",elapsedSeconds:i.elapsedSeconds,position:Ce,normal:T,incomingVelocity:R,outgoingVelocity:Z,outcome:null})),i.floorSliding=!1,c+=1;continue}const pe=oe==="GOAL_PLANE"&&Ru(i.position,t)?"GOAL":zr(i);return Br(i,oe,pe)}return null}function zr(i){return i.contactHistory.some(e=>e.kind==="KEEPER")?"SAVED":"MISS"}function Br(i,e,t){return i.terminalState=t,i.contactHistory.push(Object.freeze({kind:e,elapsedSeconds:i.elapsedSeconds,position:Et(i.position),incomingVelocity:Et(i.velocity),outgoingVelocity:Et(i.velocity),normal:Object.freeze(e==="GOAL_PLANE"?{x:0,y:0,z:-1}:{x:0,y:0,z:0}),outcome:t})),t}function $c(i){if(!Number.isFinite(i))throw new RangeError("Ball release power must be finite.");return Yt(i,0,1)}function zu(i){if(!Number.isFinite(i))throw new RangeError("Ball release loft must be finite.");return Yt(i,0,1)}function Bu(i){if(!Number.isFinite(i))throw new RangeError("Ball release side-spin must be finite.");return Yt(i,-1,1)}function Hu(i){if(!Number.isFinite(i))throw new RangeError("Ball release top-spin must be finite.");return Yt(i,0,1)}function Kc(i){if(!Number.isFinite(i))throw new RangeError("Ball release bounce intent must be finite.");return Yt(i,0,1)}function Eo(i){if(![i.playableVolume.halfWidthMeters,i.playableVolume.ceilingHeightMeters,i.playableVolume.minimumZMeters,i.minimumReleaseSpeedMetersPerSecond,i.maximumReleaseSpeedMetersPerSecond,i.minimumLaunchLiftMeters,i.maximumLaunchLiftMeters,i.maximumSideSpinAccelerationMetersPerSecondSquared,i.maximumTopSpinDropAccelerationMetersPerSecondSquared,i.gravityMetersPerSecondSquared,i.postRestitution,i.crossbarRestitution,i.minimumGroundRestitution,i.maximumGroundRestitution,i.minimumGroundReboundSpeedMetersPerSecond,i.maximumGroundBounces].every(Number.isFinite))throw new RangeError("Ball flight configuration must contain only finite values.");if(i.playableVolume.halfWidthMeters<=0||i.playableVolume.ceilingHeightMeters<=0||i.playableVolume.minimumZMeters>=0)throw new RangeError("Playable arena volume must surround the release area.");if(i.minimumReleaseSpeedMetersPerSecond<=0||i.maximumReleaseSpeedMetersPerSecond<i.minimumReleaseSpeedMetersPerSecond)throw new RangeError("Ball release-speed bounds must be positive and ordered.");if(i.minimumLaunchLiftMeters<0||i.maximumLaunchLiftMeters<i.minimumLaunchLiftMeters)throw new RangeError("Ball launch-lift bounds must be non-negative and ordered.");if(i.maximumSideSpinAccelerationMetersPerSecondSquared<=0)throw new RangeError("Ball side-spin acceleration bound must be positive.");if(i.maximumTopSpinDropAccelerationMetersPerSecondSquared<=0)throw new RangeError("Ball top-spin drop acceleration bound must be positive.");if(i.gravityMetersPerSecondSquared>=0)throw new RangeError("Ball flight gravity must be finite and negative.");if(i.minimumGroundRestitution<0||i.maximumGroundRestitution<i.minimumGroundRestitution||i.maximumGroundRestitution>1)throw new RangeError("Ground restitution bounds must be ordered within [0, 1].");if(i.minimumGroundReboundSpeedMetersPerSecond<=0)throw new RangeError("Ground settling speed must be positive.");if(!Number.isInteger(i.maximumGroundBounces)||i.maximumGroundBounces<0||i.maximumGroundBounces>1)throw new RangeError("Maximum ground bounces must be an integer within [0, 1].")}function ku(i){if(![i.minimumDurationSeconds,i.maximumDurationSeconds,i.arcHeightMeters,i.resetDelaySeconds].every(Number.isFinite))throw new RangeError("Nominal trajectory configuration must be finite.");if(i.minimumDurationSeconds<=0||i.maximumDurationSeconds<i.minimumDurationSeconds||i.arcHeightMeters<0||i.resetDelaySeconds<0)throw new RangeError("Nominal trajectory configuration is out of bounds.")}function Vi(i,e){if(![i.x,i.y,i.z].every(Number.isFinite))throw new RangeError(`${e} must contain only finite values.`)}function Gu(i){if(Vi(i.position,"Ball position"),Vi(i.previousPosition,"Previous ball position"),Vi(i.velocity,"Ball velocity"),Vi(i.initialVelocity,"Initial ball velocity"),!Number.isFinite(i.gravityMetersPerSecondSquared)||!Number.isFinite(i.releasePower)||!Number.isFinite(i.releaseLoft)||!Number.isFinite(i.releaseSideSpin)||!Number.isFinite(i.releaseTopSpin)||!Number.isFinite(i.releaseBounceIntent)||!Number.isFinite(i.launchLiftMeters)||!Number.isFinite(i.sideSpinAccelerationMetersPerSecondSquared)||!Number.isFinite(i.topSpinDropAccelerationMetersPerSecondSquared)||!Number.isFinite(i.releaseSpeedMetersPerSecond)||!Number.isFinite(i.postRestitution)||!Number.isFinite(i.crossbarRestitution)||!Number.isFinite(i.groundRestitution)||!Number.isFinite(i.minimumGroundReboundSpeedMetersPerSecond)||!Number.isFinite(i.maximumGroundBounces)||!Number.isFinite(i.groundBounceCount)||!Number.isFinite(i.durationSeconds)||!Number.isFinite(i.elapsedSeconds))throw new RangeError("Ball flight state must remain finite.");if(i.releaseSideSpin<-1||i.releaseSideSpin>1)throw new RangeError("Ball release side-spin must remain within [-1, 1].");if(i.releaseTopSpin<0||i.releaseTopSpin>1)throw new RangeError("Ball release top-spin must remain within [0, 1].");if(i.releaseBounceIntent<0||i.releaseBounceIntent>1)throw new RangeError("Ball release bounce intent must remain within [0, 1].");if(i.groundRestitution<0||i.groundRestitution>1)throw new RangeError("Ball ground restitution must remain within [0, 1].");if(i.minimumGroundReboundSpeedMetersPerSecond<=0)throw new RangeError("Ball ground settling speed must remain positive.");if(!Number.isInteger(i.maximumGroundBounces)||!Number.isInteger(i.groundBounceCount)||i.maximumGroundBounces<0||i.maximumGroundBounces>1||i.groundBounceCount<0||i.groundBounceCount>i.maximumGroundBounces)throw new RangeError("Ball ground-contact counts must remain bounded integers.");if(i.topSpinDropAccelerationMetersPerSecondSquared<0)throw new RangeError("Ball top-spin drop acceleration must remain non-negative.")}function Vu(i,e,t,n,s){return i<=n&&i<=e&&i<=t&&i<=s?i===wt?null:"GROUND":e<=t&&e<=n&&e<=s?"VERTICAL_POST":t<=n&&t<=s?"CROSSBAR":n<=s?"KEEPER":"GOAL_PLANE"}function Wu(i,e,t,n,s,r,a,o,l,c,h=0){const u=c.center.y+c.heightMeters/2+c.postThicknessMeters/2,f=c.widthMeters/2+c.postThicknessMeters/2,p=c.ballRadiusMeters+c.postThicknessMeters/2,g=.5*a,_=.5*h,m=e-u,d=t-c.center.z,b=Is([m*m+d*d-p*p,2*(m*s+d*r),s*s+2*m*g+r*r+2*d*_,2*(s*g+r*_),g*g+_*_],0,l);for(const E of b){const M=i+n*E+.5*o*E*E;if(Math.abs(M-c.center.x)>f)continue;const w=e+s*E+g*E*E,A=t+r*E+_*E*E,C=(w-u)/p,D=(A-c.center.z)/p;if(!((s+a*E)*C+(r+h*E)*D>=0))return{fraction:E/l,centerY:u,normal:Object.freeze({x:0,y:C,z:D})}}return null}function Is(i,e,t){let n=i.length-1;for(;n>0&&Math.abs(i[n]??0)<=pl;)n-=1;if(n===0)return[];if(n===1){const l=i[1]??0,c=-(i[0]??0)/l;return c>=e&&c<=t?[c]:[]}const s=Array.from({length:n},(l,c)=>(i[c+1]??0)*(c+1)),r=Is(s,e,t),a=[e,...r,t],o=[];for(const l of a)Math.abs(ks(i,n,l))<=pl&&ml(o,l);for(let l=0;l+1<a.length;l+=1){let c=a[l]??e,h=a[l+1]??t,u=ks(i,n,c);const f=ks(i,n,h);if(!(u===0||f===0||u*f>0)){for(let p=0;p<64;p+=1){const g=(c+h)/2,_=ks(i,n,g);if(_===0){c=g,h=g;break}u*_<0?h=g:(c=g,u=_)}ml(o,(c+h)/2)}}return o.sort((l,c)=>l-c),o}function ks(i,e,t){let n=i[e]??0;for(let s=e-1;s>=0;s-=1)n=n*t+(i[s]??0);return n}function ml(i,e){i.every(t=>Math.abs(t-e)>Iu)&&i.push(e)}function qu(i,e,t,n,s,r,a,o,l,c,h=0){const u=c.widthMeters/2+c.postThicknessMeters/2,f=c.ballRadiusMeters+c.postThicknessMeters/2,p=.5*a,g=.5*h;let _=null;for(const m of["LEFT","RIGHT"]){const d=c.center.x+(m==="LEFT"?-u:u),b=i-d,E=t-c.center.z,M=Is([b*b+E*E-f*f,2*(b*n+E*r),n*n+2*b*p+r*r+2*E*g,2*(n*p+r*g),p*p+g*g],0,l);for(const w of M){const A=w/l;if(_!==null&&A>=_.fraction)continue;const C=e+s*w+.5*o*w*w,D=c.center.y+c.heightMeters/2+c.postThicknessMeters;if(C<c.ballRadiusMeters||C>D)continue;const S=i+n*w+p*w*w,y=t+r*w+g*w*w,P=(S-d)/f,N=(y-c.center.z)/f;(n+a*w)*P+(r+h*w)*N>=0||(_={fraction:A,post:m,centerX:d,normal:Object.freeze({x:P,y:0,z:N})})}}return _}function Xu(i,e,t,n,s){const r=i-s;if(r<0)return 0;const a=.5*t;if(Math.abs(a)<=Number.EPSILON){if(e>=0)return r===0?0:wt;const g=-r/e;return g>=0&&g<=n?g/n:wt}const o=e*e-4*a*r;if(o<0)return wt;const l=2*a,c=-e,h=Math.sqrt(o),u=(c-h)/l,f=(c+h)/l;let p=wt;return u>=0&&u<=n&&e+t*u<=0&&(p=u),f>=0&&f<=n&&e+t*f<=0&&f<p&&(p=f),p===wt?wt:p/n}function ju(i,e,t,n,s,r,a,o,l,c,h,u,f,p,g,_,m=0){const d=i-c,b=e-h,E=t-u,M=n-(f-c)/l,w=s-(p-h)/l,A=r-(g-u)/l,C=.5*a,D=.5*o,S=.5*m,y=_*_,P=d*d+b*b+E*E-y;if(P<=0)return 0;const N=Is([P,2*(d*M+b*w+E*A),M*M+w*w+A*A+2*(d*C+b*D+E*S),2*(M*C+w*D+A*S),C*C+D*D+S*S],0,l);for(const z of N){const q=d+M*z+C*z*z,G=b+w*z+D*z*z,V=E+A*z+S*z*z,$=M+a*z,k=w+o*z;if(q*$+G*k+V*(A+m*z)<0)return z/l}return wt}function Yu(i,e,t,n,s,r){const a=Math.hypot(i,e,t);if(a>Number.EPSILON)return Object.freeze({x:i/a,y:e/a,z:t/a});const o=Math.hypot(n,s,r);return o>Number.EPSILON?Object.freeze({x:-n/o,y:-s/o,z:-r/o}):Object.freeze({x:0,y:0,z:-1})}function Hr(i){return{x:i.x,y:i.y,z:i.z}}function Et(i){return Object.freeze({x:i.x,y:i.y,z:i.z})}function En(i,e,t){return i+(e-i)*t}function $u(i,e,t,n=i.sideSpinAccelerationMetersPerSecondSquared,s=i.gravityMetersPerSecondSquared-i.topSpinDropAccelerationMetersPerSecondSquared,r=0){const a=i.playableVolume;return Math.min(ys(i.position.x,i.velocity.x,n,a.halfWidthMeters-t,e),ys(-i.position.x,-i.velocity.x,-n,a.halfWidthMeters-t,e),ys(i.position.y,i.velocity.y,s,a.ceilingHeightMeters-t,e),ys(-i.position.z,-i.velocity.z,-r,-a.minimumZMeters-t,e))}function ys(i,e,t,n,s){if(i>n)return 0;const r=i+e*s+.5*t*s*s,a=t<0?-e/t:-1;if((a>0&&a<s?Math.max(i,r,i+e*a+.5*t*a*a):Math.max(i,r))<n)return wt;for(const l of Is([i-n,e,.5*t],0,s))if(e+t*l>0)return l/s;return wt}class Ku{constructor(e,t,n,s){this.canvas=e,this.config=t,this.callbacks=n,this.trace=s,Hc(t),e.addEventListener("pointerdown",this.onPointerDown),e.addEventListener("pointermove",this.onPointerMove),e.addEventListener("pointerup",this.onPointerUp),e.addEventListener("pointercancel",this.onPointerCancel),e.addEventListener("lostpointercapture",this.onLostCapture)}canvas;config;callbacks;trace;activePointerId=null;activePointerType="unknown";samples=[];pendingFeint=null;enabled=!0;captureLossTimer;setEnabled(e){this.enabled=e,!e&&this.activePointerId!==null&&this.cancelActive("INTERRUPTED")}dispose(){this.canvas.removeEventListener("pointerdown",this.onPointerDown),this.canvas.removeEventListener("pointermove",this.onPointerMove),this.canvas.removeEventListener("pointerup",this.onPointerUp),this.canvas.removeEventListener("pointercancel",this.onPointerCancel),this.canvas.removeEventListener("lostpointercapture",this.onLostCapture),this.captureLossTimer!==void 0&&clearTimeout(this.captureLossTimer),this.releaseActiveCapture(),this.callbacks.onFeintChanged?.(null)}diagnostics(){return Object.freeze({captureActive:this.activePointerId!==null,pointerType:this.activePointerId===null?null:this.activePointerType,sampleCount:this.samples.length,pendingFeint:this.pendingFeint})}onPointerDown=e=>{if(!this.enabled||this.activePointerId!==null||!e.isPrimary)return;const{point:t,viewport:n}=this.localPoint(e);this.startTrace(e,n);const s=this.canvas.ownerDocument?.querySelectorAll("[data-safe-zone]");if(s&&Array.from(s).some(a=>{const o=a.getBoundingClientRect();return e.clientX>=o.left&&e.clientX<=o.right&&e.clientY>=o.top&&e.clientY<=o.bottom})){this.traceSample(e,"down",!1,e,n,t),this.trace?.finish(n,null,"STARTED_OVER_BLOCKING_UI"),this.callbacks.onRejected("STARTED_OVER_BLOCKING_UI");return}if(!kc(t.x/n.widthPixels,t.y/n.heightPixels,this.config)){this.traceSample(e,"down",!1,e,n,t),this.trace?.finish(n,null,"START_OUTSIDE_INPUT_ZONE"),this.callbacks.onRejected("START_OUTSIDE_INPUT_ZONE");return}e.preventDefault(),this.activePointerId=e.pointerId,this.activePointerType=e.pointerType||"unknown",this.samples=[this.sample(e,t)],this.traceSample(e,"down",!0,e,n,t),this.canvas.setPointerCapture(e.pointerId),this.callbacks.onGestureStarted?.(),this.publishTrail(n)};onPointerMove=e=>{if(e.pointerId!==this.activePointerId)return;e.preventDefault();const t=typeof e.getCoalescedEvents=="function"?e.getCoalescedEvents():[],n=t.length>0?t:[e],s=this.viewport();let r=!1;t.length>0&&this.traceSample(e,"parent",!1,e,s);for(const a of n){if(a.pointerId!==this.activePointerId)continue;const o=this.localPointInViewport(a),l=this.samples.at(-1),c=l!==void 0&&kh(l.positionPixels,o,{xPixels:0,yPixels:0,widthPixels:s.widthPixels,heightPixels:s.heightPixels},this.config);this.traceSample(a,t.length>0?"coalesced":"parent",c,e,s,o),c&&(this.samples.push(this.sample(a,o)),this.trace?.movement(),this.tryRecognizeFeint(s),this.publishGoalkeeperObservation(s),r=!0)}r&&this.publishTrail(s)};onPointerUp=e=>{if(e.pointerId!==this.activePointerId)return;e.preventDefault();const{point:t,viewport:n}=this.localPoint(e);this.samples.push(this.sample(e,t)),this.traceSample(e,"up",!0,e,n,t);const s=this.activePointerType,r=this.samples;this.trace?.movement(),this.tryRecognizeFeint(n);const a=this.pendingFeint;this.releaseCapture(e.pointerId);const o=Gc(r,n,this.config,{inputEnabled:this.enabled,nonShootingFeint:a!==null});if(!o.accepted){this.trace?.finish(n,null,o.reason),this.callbacks.onFeintChanged?.(null),this.callbacks.onRejected(o.reason),this.callbacks.onTrailChanged(Object.freeze([]),n);return}const l=Vc(o.points,n,this.config,a);this.trace?.finish(n,l,null),a!==null?(this.callbacks.onFeintCompleted?.({gesture:l,pointerType:s}),this.callbacks.onTrailChanged(Object.freeze([]),n)):this.callbacks.onAccepted({gesture:l,pointerType:s}),this.callbacks.onFeintChanged?.(null)};onLostCapture=e=>{if(e.pointerId!==this.activePointerId)return;const t=e.pointerId;this.captureLossTimer=setTimeout(()=>{this.activePointerId===t&&this.cancelActive("INTERRUPTED")},0)};onPointerCancel=e=>{e.pointerId===this.activePointerId&&(this.traceSample(e,"cancel",!1,e,this.viewport()),this.cancelActive("INTERRUPTED"))};cancelActive(e){const t=this.viewport();this.trace?.finish(t,null,e),this.releaseActiveCapture(),this.callbacks.onFeintChanged?.(null),this.callbacks.onTrailChanged(Object.freeze([]),t),this.callbacks.onRejected(e)}releaseCapture(e){this.clearActiveState(),this.releaseHeldCapture(e)}releaseActiveCapture(){const e=this.activePointerId;this.clearActiveState(),e!==null&&this.releaseHeldCapture(e)}clearActiveState(){this.captureLossTimer!==void 0&&clearTimeout(this.captureLossTimer),this.activePointerId=null,this.activePointerType="unknown",this.samples=[],this.pendingFeint=null}releaseHeldCapture(e){this.canvas.hasPointerCapture(e)&&this.canvas.releasePointerCapture(e)}startTrace(e,t){if(!this.trace)return;const n=this.canvas.getBoundingClientRect();this.trace.start({pointerType:e.pointerType||"unknown",viewport:t,bounds:{left:n.left,top:n.top,width:n.width,height:n.height},browserViewport:{width:window.innerWidth,height:window.innerHeight},backingStore:{width:this.canvas.width,height:this.canvas.height},dpr:window.devicePixelRatio})}traceSample(e,t,n,s,r,a){this.trace?.sample({sample:this.sample(e,a??this.localPointInViewport(e)),source:t,retained:n,parentTimeSeconds:s.timeStamp/1e3,viewport:r})}localPoint(e){const t=this.canvas.getBoundingClientRect(),n=Object.freeze({widthPixels:t.width,heightPixels:t.height});return{point:Object.freeze({x:e.clientX-t.left,y:e.clientY-t.top}),viewport:n}}localPointInViewport(e){const t=this.canvas.getBoundingClientRect();return Object.freeze({x:e.clientX-t.left,y:e.clientY-t.top})}sample(e,t){return Object.freeze({positionPixels:t,timeSeconds:e.timeStamp/1e3})}viewport(){const e=this.canvas.getBoundingClientRect();return Object.freeze({widthPixels:e.width,heightPixels:e.height})}publishTrail(e){this.callbacks.onTrailChanged(Object.freeze(this.samples.map(t=>t.positionPixels)),e)}tryRecognizeFeint(e){if(this.pendingFeint!==null||this.samples.length<3)return;const t=this.samples[0];if(t===void 0)return;const n=this.samples.map(r=>Object.freeze({positionPixels:r.positionPixels,safeAreaPosition01:Object.freeze({x:r.positionPixels.x/e.widthPixels,y:r.positionPixels.y/e.heightPixels}),timeSeconds:r.timeSeconds-t.timeSeconds})),s=bo(n,this.config);s!==null&&(this.pendingFeint=s,this.callbacks.onFeintChanged?.(s))}publishGoalkeeperObservation(e){const t=this.samples[0],n=this.samples.at(-1);if(t===void 0||n===void 0||e.widthPixels<=0||e.heightPixels<=0)return;const s={x:(n.positionPixels.x-t.positionPixels.x)/e.widthPixels,y:(t.positionPixels.y-n.positionPixels.y)/e.heightPixels},r=Math.hypot(s.x,s.y);if(!Number.isFinite(r)||r<=1e-9)return;const a=this.pendingFeint,o=a?.apparentDirection??Object.freeze({x:s.x/r,y:s.y/r});this.callbacks.onGoalkeeperObservation?.(Object.freeze({apparentDirection:o,elapsedGestureSeconds:Math.max(0,n.timeSeconds-t.timeSeconds),confidence:Math.min(1,r),feint:a}))}}const To="180",Zu=0,gl=1,Ju=2,Zc=1,Jc=2,Pn=3,ei=0,Ut=1,cn=2,Jn=0,Qi=1,Es=2,_l=3,xl=4,Qu=5,pi=100,ed=101,td=102,nd=103,id=104,sd=200,rd=201,ad=202,od=203,La=204,Da=205,ld=206,cd=207,hd=208,ud=209,dd=210,fd=211,pd=212,md=213,gd=214,Ia=0,Oa=1,Na=2,ts=3,Fa=4,Ua=5,za=6,Ba=7,wo=0,_d=1,xd=2,Qn=0,Sd=1,vd=2,Md=3,Qc=4,yd=5,bd=6,Ed=7,eh=300,ns=301,is=302,Ha=303,ka=304,Lr=306,As=1e3,dn=1001,Ga=1002,jt=1003,Td=1004,Gs=1005,tn=1006,kr=1007,gi=1008,yn=1009,th=1010,nh=1011,Rs=1012,Ao=1013,_i=1014,Sn=1015,Os=1016,Ro=1017,Co=1018,Cs=1020,ih=35902,sh=35899,rh=1021,ah=1022,fn=1023,Ps=1026,Ls=1027,Po=1028,Lo=1029,oh=1030,Do=1031,Io=1033,_r=33776,xr=33777,Sr=33778,vr=33779,Va=35840,Wa=35841,qa=35842,Xa=35843,ja=36196,Ya=37492,$a=37496,Ka=37808,Za=37809,Ja=37810,Qa=37811,eo=37812,to=37813,no=37814,io=37815,so=37816,ro=37817,ao=37818,oo=37819,lo=37820,co=37821,ho=36492,uo=36494,fo=36495,po=36283,mo=36284,go=36285,_o=36286,wd=3200,Ad=3201,Oo=0,Rd=1,hn="",St="srgb",ss="srgb-linear",Tr="linear",Je="srgb",yi=7680,Sl=519,Cd=512,Pd=513,Ld=514,lh=515,Dd=516,Id=517,Od=518,Nd=519,vl=35044,Fd=35048,Ml="300 es",vn=2e3,wr=2001;class ls{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});const n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){const n=this._listeners;return n===void 0?!1:n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){const n=this._listeners;if(n===void 0)return;const s=n[e];if(s!==void 0){const r=s.indexOf(t);r!==-1&&s.splice(r,1)}}dispatchEvent(e){const t=this._listeners;if(t===void 0)return;const n=t[e.type];if(n!==void 0){e.target=this;const s=n.slice(0);for(let r=0,a=s.length;r<a;r++)s[r].call(this,e);e.target=null}}}const yt=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];let yl=1234567;const Ts=Math.PI/180,rs=180/Math.PI;function cs(){const i=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(yt[i&255]+yt[i>>8&255]+yt[i>>16&255]+yt[i>>24&255]+"-"+yt[e&255]+yt[e>>8&255]+"-"+yt[e>>16&15|64]+yt[e>>24&255]+"-"+yt[t&63|128]+yt[t>>8&255]+"-"+yt[t>>16&255]+yt[t>>24&255]+yt[n&255]+yt[n>>8&255]+yt[n>>16&255]+yt[n>>24&255]).toLowerCase()}function qe(i,e,t){return Math.max(e,Math.min(t,i))}function No(i,e){return(i%e+e)%e}function Ud(i,e,t,n,s){return n+(i-e)*(s-n)/(t-e)}function zd(i,e,t){return i!==e?(t-i)/(e-i):0}function ws(i,e,t){return(1-t)*i+t*e}function Bd(i,e,t,n){return ws(i,e,1-Math.exp(-t*n))}function Hd(i,e=1){return e-Math.abs(No(i,e*2)-e)}function kd(i,e,t){return i<=e?0:i>=t?1:(i=(i-e)/(t-e),i*i*(3-2*i))}function Gd(i,e,t){return i<=e?0:i>=t?1:(i=(i-e)/(t-e),i*i*i*(i*(i*6-15)+10))}function Vd(i,e){return i+Math.floor(Math.random()*(e-i+1))}function Wd(i,e){return i+Math.random()*(e-i)}function qd(i){return i*(.5-Math.random())}function Xd(i){i!==void 0&&(yl=i);let e=yl+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}function jd(i){return i*Ts}function Yd(i){return i*rs}function $d(i){return(i&i-1)===0&&i!==0}function Kd(i){return Math.pow(2,Math.ceil(Math.log(i)/Math.LN2))}function Zd(i){return Math.pow(2,Math.floor(Math.log(i)/Math.LN2))}function Jd(i,e,t,n,s){const r=Math.cos,a=Math.sin,o=r(t/2),l=a(t/2),c=r((e+n)/2),h=a((e+n)/2),u=r((e-n)/2),f=a((e-n)/2),p=r((n-e)/2),g=a((n-e)/2);switch(s){case"XYX":i.set(o*h,l*u,l*f,o*c);break;case"YZY":i.set(l*f,o*h,l*u,o*c);break;case"ZXZ":i.set(l*u,l*f,o*h,o*c);break;case"XZX":i.set(o*h,l*g,l*p,o*c);break;case"YXY":i.set(l*p,o*h,l*g,o*c);break;case"ZYZ":i.set(l*g,l*p,o*h,o*c);break;default:console.warn("THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+s)}}function ki(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return i/4294967295;case Uint16Array:return i/65535;case Uint8Array:return i/255;case Int32Array:return Math.max(i/2147483647,-1);case Int16Array:return Math.max(i/32767,-1);case Int8Array:return Math.max(i/127,-1);default:throw new Error("Invalid component type.")}}function Lt(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return Math.round(i*4294967295);case Uint16Array:return Math.round(i*65535);case Uint8Array:return Math.round(i*255);case Int32Array:return Math.round(i*2147483647);case Int16Array:return Math.round(i*32767);case Int8Array:return Math.round(i*127);default:throw new Error("Invalid component type.")}}const On={DEG2RAD:Ts,RAD2DEG:rs,generateUUID:cs,clamp:qe,euclideanModulo:No,mapLinear:Ud,inverseLerp:zd,lerp:ws,damp:Bd,pingpong:Hd,smoothstep:kd,smootherstep:Gd,randInt:Vd,randFloat:Wd,randFloatSpread:qd,seededRandom:Xd,degToRad:jd,radToDeg:Yd,isPowerOfTwo:$d,ceilPowerOfTwo:Kd,floorPowerOfTwo:Zd,setQuaternionFromProperEuler:Jd,normalize:Lt,denormalize:ki};class Ve{constructor(e=0,t=0){Ve.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){const t=this.x,n=this.y,s=e.elements;return this.x=s[0]*t+s[3]*n+s[6],this.y=s[1]*t+s[4]*n+s[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=qe(this.x,e.x,t.x),this.y=qe(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=qe(this.x,e,t),this.y=qe(this.y,e,t),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(qe(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const n=this.dot(e)/t;return Math.acos(qe(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){const n=Math.cos(t),s=Math.sin(t),r=this.x-e.x,a=this.y-e.y;return this.x=r*n-a*s+e.x,this.y=r*s+a*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class Nt{constructor(e=0,t=0,n=0,s=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=s}static slerpFlat(e,t,n,s,r,a,o){let l=n[s+0],c=n[s+1],h=n[s+2],u=n[s+3];const f=r[a+0],p=r[a+1],g=r[a+2],_=r[a+3];if(o===0){e[t+0]=l,e[t+1]=c,e[t+2]=h,e[t+3]=u;return}if(o===1){e[t+0]=f,e[t+1]=p,e[t+2]=g,e[t+3]=_;return}if(u!==_||l!==f||c!==p||h!==g){let m=1-o;const d=l*f+c*p+h*g+u*_,b=d>=0?1:-1,E=1-d*d;if(E>Number.EPSILON){const w=Math.sqrt(E),A=Math.atan2(w,d*b);m=Math.sin(m*A)/w,o=Math.sin(o*A)/w}const M=o*b;if(l=l*m+f*M,c=c*m+p*M,h=h*m+g*M,u=u*m+_*M,m===1-o){const w=1/Math.sqrt(l*l+c*c+h*h+u*u);l*=w,c*=w,h*=w,u*=w}}e[t]=l,e[t+1]=c,e[t+2]=h,e[t+3]=u}static multiplyQuaternionsFlat(e,t,n,s,r,a){const o=n[s],l=n[s+1],c=n[s+2],h=n[s+3],u=r[a],f=r[a+1],p=r[a+2],g=r[a+3];return e[t]=o*g+h*u+l*p-c*f,e[t+1]=l*g+h*f+c*u-o*p,e[t+2]=c*g+h*p+o*f-l*u,e[t+3]=h*g-o*u-l*f-c*p,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,s){return this._x=e,this._y=t,this._z=n,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){const n=e._x,s=e._y,r=e._z,a=e._order,o=Math.cos,l=Math.sin,c=o(n/2),h=o(s/2),u=o(r/2),f=l(n/2),p=l(s/2),g=l(r/2);switch(a){case"XYZ":this._x=f*h*u+c*p*g,this._y=c*p*u-f*h*g,this._z=c*h*g+f*p*u,this._w=c*h*u-f*p*g;break;case"YXZ":this._x=f*h*u+c*p*g,this._y=c*p*u-f*h*g,this._z=c*h*g-f*p*u,this._w=c*h*u+f*p*g;break;case"ZXY":this._x=f*h*u-c*p*g,this._y=c*p*u+f*h*g,this._z=c*h*g+f*p*u,this._w=c*h*u-f*p*g;break;case"ZYX":this._x=f*h*u-c*p*g,this._y=c*p*u+f*h*g,this._z=c*h*g-f*p*u,this._w=c*h*u+f*p*g;break;case"YZX":this._x=f*h*u+c*p*g,this._y=c*p*u+f*h*g,this._z=c*h*g-f*p*u,this._w=c*h*u-f*p*g;break;case"XZY":this._x=f*h*u-c*p*g,this._y=c*p*u-f*h*g,this._z=c*h*g+f*p*u,this._w=c*h*u+f*p*g;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+a)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){const n=t/2,s=Math.sin(n);return this._x=e.x*s,this._y=e.y*s,this._z=e.z*s,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){const t=e.elements,n=t[0],s=t[4],r=t[8],a=t[1],o=t[5],l=t[9],c=t[2],h=t[6],u=t[10],f=n+o+u;if(f>0){const p=.5/Math.sqrt(f+1);this._w=.25/p,this._x=(h-l)*p,this._y=(r-c)*p,this._z=(a-s)*p}else if(n>o&&n>u){const p=2*Math.sqrt(1+n-o-u);this._w=(h-l)/p,this._x=.25*p,this._y=(s+a)/p,this._z=(r+c)/p}else if(o>u){const p=2*Math.sqrt(1+o-n-u);this._w=(r-c)/p,this._x=(s+a)/p,this._y=.25*p,this._z=(l+h)/p}else{const p=2*Math.sqrt(1+u-n-o);this._w=(a-s)/p,this._x=(r+c)/p,this._y=(l+h)/p,this._z=.25*p}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<1e-8?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(qe(this.dot(e),-1,1)))}rotateTowards(e,t){const n=this.angleTo(e);if(n===0)return this;const s=Math.min(1,t/n);return this.slerp(e,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){const n=e._x,s=e._y,r=e._z,a=e._w,o=t._x,l=t._y,c=t._z,h=t._w;return this._x=n*h+a*o+s*c-r*l,this._y=s*h+a*l+r*o-n*c,this._z=r*h+a*c+n*l-s*o,this._w=a*h-n*o-s*l-r*c,this._onChangeCallback(),this}slerp(e,t){if(t===0)return this;if(t===1)return this.copy(e);const n=this._x,s=this._y,r=this._z,a=this._w;let o=a*e._w+n*e._x+s*e._y+r*e._z;if(o<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,o=-o):this.copy(e),o>=1)return this._w=a,this._x=n,this._y=s,this._z=r,this;const l=1-o*o;if(l<=Number.EPSILON){const p=1-t;return this._w=p*a+t*this._w,this._x=p*n+t*this._x,this._y=p*s+t*this._y,this._z=p*r+t*this._z,this.normalize(),this}const c=Math.sqrt(l),h=Math.atan2(c,o),u=Math.sin((1-t)*h)/c,f=Math.sin(t*h)/c;return this._w=a*u+this._w*f,this._x=n*u+this._x*f,this._y=s*u+this._y*f,this._z=r*u+this._z*f,this._onChangeCallback(),this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){const e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),s=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(s*Math.sin(e),s*Math.cos(e),r*Math.sin(t),r*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class L{constructor(e=0,t=0,n=0){L.prototype.isVector3=!0,this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(bl.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(bl.setFromAxisAngle(e,t))}applyMatrix3(e){const t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6]*s,this.y=r[1]*t+r[4]*n+r[7]*s,this.z=r[2]*t+r[5]*n+r[8]*s,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){const t=this.x,n=this.y,s=this.z,r=e.elements,a=1/(r[3]*t+r[7]*n+r[11]*s+r[15]);return this.x=(r[0]*t+r[4]*n+r[8]*s+r[12])*a,this.y=(r[1]*t+r[5]*n+r[9]*s+r[13])*a,this.z=(r[2]*t+r[6]*n+r[10]*s+r[14])*a,this}applyQuaternion(e){const t=this.x,n=this.y,s=this.z,r=e.x,a=e.y,o=e.z,l=e.w,c=2*(a*s-o*n),h=2*(o*t-r*s),u=2*(r*n-a*t);return this.x=t+l*c+a*u-o*h,this.y=n+l*h+o*c-r*u,this.z=s+l*u+r*h-a*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){const t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[4]*n+r[8]*s,this.y=r[1]*t+r[5]*n+r[9]*s,this.z=r[2]*t+r[6]*n+r[10]*s,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=qe(this.x,e.x,t.x),this.y=qe(this.y,e.y,t.y),this.z=qe(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=qe(this.x,e,t),this.y=qe(this.y,e,t),this.z=qe(this.z,e,t),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(qe(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){const n=e.x,s=e.y,r=e.z,a=t.x,o=t.y,l=t.z;return this.x=s*l-r*o,this.y=r*a-n*l,this.z=n*o-s*a,this}projectOnVector(e){const t=e.lengthSq();if(t===0)return this.set(0,0,0);const n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return Gr.copy(this).projectOnVector(e),this.sub(Gr)}reflect(e){return this.sub(Gr.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const n=this.dot(e)/t;return Math.acos(qe(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y,s=this.z-e.z;return t*t+n*n+s*s}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){const s=Math.sin(t)*e;return this.x=s*Math.sin(n),this.y=Math.cos(t)*e,this.z=s*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){const t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),s=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=s,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const Gr=new L,bl=new Nt;class Be{constructor(e,t,n,s,r,a,o,l,c){Be.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,a,o,l,c)}set(e,t,n,s,r,a,o,l,c){const h=this.elements;return h[0]=e,h[1]=s,h[2]=o,h[3]=t,h[4]=r,h[5]=l,h[6]=n,h[7]=a,h[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){const t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){const t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const n=e.elements,s=t.elements,r=this.elements,a=n[0],o=n[3],l=n[6],c=n[1],h=n[4],u=n[7],f=n[2],p=n[5],g=n[8],_=s[0],m=s[3],d=s[6],b=s[1],E=s[4],M=s[7],w=s[2],A=s[5],C=s[8];return r[0]=a*_+o*b+l*w,r[3]=a*m+o*E+l*A,r[6]=a*d+o*M+l*C,r[1]=c*_+h*b+u*w,r[4]=c*m+h*E+u*A,r[7]=c*d+h*M+u*C,r[2]=f*_+p*b+g*w,r[5]=f*m+p*E+g*A,r[8]=f*d+p*M+g*C,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){const e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],h=e[8];return t*a*h-t*o*c-n*r*h+n*o*l+s*r*c-s*a*l}invert(){const e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],h=e[8],u=h*a-o*c,f=o*l-h*r,p=c*r-a*l,g=t*u+n*f+s*p;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);const _=1/g;return e[0]=u*_,e[1]=(s*c-h*n)*_,e[2]=(o*n-s*a)*_,e[3]=f*_,e[4]=(h*t-s*l)*_,e[5]=(s*r-o*t)*_,e[6]=p*_,e[7]=(n*l-c*t)*_,e[8]=(a*t-n*r)*_,this}transpose(){let e;const t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){const t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,s,r,a,o){const l=Math.cos(r),c=Math.sin(r);return this.set(n*l,n*c,-n*(l*a+c*o)+a+e,-s*c,s*l,-s*(-c*a+l*o)+o+t,0,0,1),this}scale(e,t){return this.premultiply(Vr.makeScale(e,t)),this}rotate(e){return this.premultiply(Vr.makeRotation(-e)),this}translate(e,t){return this.premultiply(Vr.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){const t=this.elements,n=e.elements;for(let s=0;s<9;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){const n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}}const Vr=new Be;function ch(i){for(let e=i.length-1;e>=0;--e)if(i[e]>=65535)return!0;return!1}function Ar(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function Qd(){const i=Ar("canvas");return i.style.display="block",i}const El={};function Ds(i){i in El||(El[i]=!0,console.warn(i))}function ef(i,e,t){return new Promise(function(n,s){function r(){switch(i.clientWaitSync(e,i.SYNC_FLUSH_COMMANDS_BIT,0)){case i.WAIT_FAILED:s();break;case i.TIMEOUT_EXPIRED:setTimeout(r,t);break;default:n()}}setTimeout(r,t)})}const Tl=new Be().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),wl=new Be().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function tf(){const i={enabled:!0,workingColorSpace:ss,spaces:{},convert:function(s,r,a){return this.enabled===!1||r===a||!r||!a||(this.spaces[r].transfer===Je&&(s.r=Fn(s.r),s.g=Fn(s.g),s.b=Fn(s.b)),this.spaces[r].primaries!==this.spaces[a].primaries&&(s.applyMatrix3(this.spaces[r].toXYZ),s.applyMatrix3(this.spaces[a].fromXYZ)),this.spaces[a].transfer===Je&&(s.r=es(s.r),s.g=es(s.g),s.b=es(s.b))),s},workingToColorSpace:function(s,r){return this.convert(s,this.workingColorSpace,r)},colorSpaceToWorking:function(s,r){return this.convert(s,r,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===hn?Tr:this.spaces[s].transfer},getToneMappingMode:function(s){return this.spaces[s].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(s,r=this.workingColorSpace){return s.fromArray(this.spaces[r].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,r,a){return s.copy(this.spaces[r].toXYZ).multiply(this.spaces[a].fromXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(s,r){return Ds("THREE.ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),i.workingToColorSpace(s,r)},toWorkingColorSpace:function(s,r){return Ds("THREE.ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),i.colorSpaceToWorking(s,r)}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],n=[.3127,.329];return i.define({[ss]:{primaries:e,whitePoint:n,transfer:Tr,toXYZ:Tl,fromXYZ:wl,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:St},outputColorSpaceConfig:{drawingBufferColorSpace:St}},[St]:{primaries:e,whitePoint:n,transfer:Je,toXYZ:Tl,fromXYZ:wl,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:St}}}),i}const $e=tf();function Fn(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function es(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}let bi;class nf{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{bi===void 0&&(bi=Ar("canvas")),bi.width=e.width,bi.height=e.height;const s=bi.getContext("2d");e instanceof ImageData?s.putImageData(e,0,0):s.drawImage(e,0,0,e.width,e.height),n=bi}return n.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){const t=Ar("canvas");t.width=e.width,t.height=e.height;const n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);const s=n.getImageData(0,0,e.width,e.height),r=s.data;for(let a=0;a<r.length;a++)r[a]=Fn(r[a]/255)*255;return n.putImageData(s,0,0),t}else if(e.data){const t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor(Fn(t[n]/255)*255):t[n]=Fn(t[n]);return{data:t,width:e.width,height:e.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}}let sf=0;class Fo{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:sf++}),this.uuid=cs(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){const t=this.data;return typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):t instanceof VideoFrame?e.set(t.displayHeight,t.displayWidth,0):t!==null?e.set(t.width,t.height,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];const n={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let a=0,o=s.length;a<o;a++)s[a].isDataTexture?r.push(Wr(s[a].image)):r.push(Wr(s[a]))}else r=Wr(s);n.url=r}return t||(e.images[this.uuid]=n),n}}function Wr(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?nf.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}let rf=0;const qr=new L;class Rt extends ls{constructor(e=Rt.DEFAULT_IMAGE,t=Rt.DEFAULT_MAPPING,n=dn,s=dn,r=tn,a=gi,o=fn,l=yn,c=Rt.DEFAULT_ANISOTROPY,h=hn){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:rf++}),this.uuid=cs(),this.name="",this.source=new Fo(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=n,this.wrapT=s,this.magFilter=r,this.minFilter=a,this.anisotropy=c,this.format=o,this.internalFormat=null,this.type=l,this.offset=new Ve(0,0),this.repeat=new Ve(1,1),this.center=new Ve(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Be,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0}get width(){return this.source.getSize(qr).x}get height(){return this.source.getSize(qr).y}get depth(){return this.source.getSize(qr).z}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(const t in e){const n=e[t];if(n===void 0){console.warn(`THREE.Texture.setValues(): parameter '${t}' has value of undefined.`);continue}const s=this[t];if(s===void 0){console.warn(`THREE.Texture.setValues(): property '${t}' does not exist.`);continue}s&&n&&s.isVector2&&n.isVector2||s&&n&&s.isVector3&&n.isVector3||s&&n&&s.isMatrix3&&n.isMatrix3?s.copy(n):this[t]=n}}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];const n={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==eh)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case As:e.x=e.x-Math.floor(e.x);break;case dn:e.x=e.x<0?0:1;break;case Ga:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case As:e.y=e.y-Math.floor(e.y);break;case dn:e.y=e.y<0?0:1;break;case Ga:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}}Rt.DEFAULT_IMAGE=null;Rt.DEFAULT_MAPPING=eh;Rt.DEFAULT_ANISOTROPY=1;class Qe{constructor(e=0,t=0,n=0,s=1){Qe.prototype.isVector4=!0,this.x=e,this.y=t,this.z=n,this.w=s}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,s){return this.x=e,this.y=t,this.z=n,this.w=s,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){const t=this.x,n=this.y,s=this.z,r=this.w,a=e.elements;return this.x=a[0]*t+a[4]*n+a[8]*s+a[12]*r,this.y=a[1]*t+a[5]*n+a[9]*s+a[13]*r,this.z=a[2]*t+a[6]*n+a[10]*s+a[14]*r,this.w=a[3]*t+a[7]*n+a[11]*s+a[15]*r,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);const t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,s,r;const l=e.elements,c=l[0],h=l[4],u=l[8],f=l[1],p=l[5],g=l[9],_=l[2],m=l[6],d=l[10];if(Math.abs(h-f)<.01&&Math.abs(u-_)<.01&&Math.abs(g-m)<.01){if(Math.abs(h+f)<.1&&Math.abs(u+_)<.1&&Math.abs(g+m)<.1&&Math.abs(c+p+d-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;const E=(c+1)/2,M=(p+1)/2,w=(d+1)/2,A=(h+f)/4,C=(u+_)/4,D=(g+m)/4;return E>M&&E>w?E<.01?(n=0,s=.707106781,r=.707106781):(n=Math.sqrt(E),s=A/n,r=C/n):M>w?M<.01?(n=.707106781,s=0,r=.707106781):(s=Math.sqrt(M),n=A/s,r=D/s):w<.01?(n=.707106781,s=.707106781,r=0):(r=Math.sqrt(w),n=C/r,s=D/r),this.set(n,s,r,t),this}let b=Math.sqrt((m-g)*(m-g)+(u-_)*(u-_)+(f-h)*(f-h));return Math.abs(b)<.001&&(b=1),this.x=(m-g)/b,this.y=(u-_)/b,this.z=(f-h)/b,this.w=Math.acos((c+p+d-1)/2),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=qe(this.x,e.x,t.x),this.y=qe(this.y,e.y,t.y),this.z=qe(this.z,e.z,t.z),this.w=qe(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=qe(this.x,e,t),this.y=qe(this.y,e,t),this.z=qe(this.z,e,t),this.w=qe(this.w,e,t),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(qe(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class af extends ls{constructor(e=1,t=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:tn,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1},n),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=n.depth,this.scissor=new Qe(0,0,e,t),this.scissorTest=!1,this.viewport=new Qe(0,0,e,t);const s={width:e,height:t,depth:n.depth},r=new Rt(s);this.textures=[];const a=n.count;for(let o=0;o<a;o++)this.textures[o]=r.clone(),this.textures[o].isRenderTargetTexture=!0,this.textures[o].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview}_setTextureOptions(e={}){const t={minFilter:tn,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let n=0;n<this.textures.length;n++)this.textures[n].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&(this._depthTexture.renderTarget=null),e!==null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=e,this.textures[s].image.height=t,this.textures[s].image.depth=n,this.textures[s].isArrayTexture=this.textures[s].image.depth>1;this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,n=e.textures.length;t<n;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;const s=Object.assign({},e.textures[t].image);this.textures[t].source=new Fo(s)}return this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class ti extends af{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}}class hh extends Rt{constructor(e=null,t=1,n=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=jt,this.minFilter=jt,this.wrapR=dn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}}class of extends Rt{constructor(e=null,t=1,n=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=jt,this.minFilter=jt,this.wrapR=dn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class xi{constructor(e=new L(1/0,1/0,1/0),t=new L(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(sn.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(sn.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){const n=sn.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);const n=e.geometry;if(n!==void 0){const r=n.getAttribute("position");if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let a=0,o=r.count;a<o;a++)e.isMesh===!0?e.getVertexPosition(a,sn):sn.fromBufferAttribute(r,a),sn.applyMatrix4(e.matrixWorld),this.expandByPoint(sn);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),Vs.copy(e.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),Vs.copy(n.boundingBox)),Vs.applyMatrix4(e.matrixWorld),this.union(Vs)}const s=e.children;for(let r=0,a=s.length;r<a;r++)this.expandByObject(s[r],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,sn),sn.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(ps),Ws.subVectors(this.max,ps),Ei.subVectors(e.a,ps),Ti.subVectors(e.b,ps),wi.subVectors(e.c,ps),Hn.subVectors(Ti,Ei),kn.subVectors(wi,Ti),ai.subVectors(Ei,wi);let t=[0,-Hn.z,Hn.y,0,-kn.z,kn.y,0,-ai.z,ai.y,Hn.z,0,-Hn.x,kn.z,0,-kn.x,ai.z,0,-ai.x,-Hn.y,Hn.x,0,-kn.y,kn.x,0,-ai.y,ai.x,0];return!Xr(t,Ei,Ti,wi,Ws)||(t=[1,0,0,0,1,0,0,0,1],!Xr(t,Ei,Ti,wi,Ws))?!1:(qs.crossVectors(Hn,kn),t=[qs.x,qs.y,qs.z],Xr(t,Ei,Ti,wi,Ws))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,sn).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(sn).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(Tn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Tn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Tn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Tn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Tn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Tn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Tn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Tn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Tn),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}}const Tn=[new L,new L,new L,new L,new L,new L,new L,new L],sn=new L,Vs=new xi,Ei=new L,Ti=new L,wi=new L,Hn=new L,kn=new L,ai=new L,ps=new L,Ws=new L,qs=new L,oi=new L;function Xr(i,e,t,n,s){for(let r=0,a=i.length-3;r<=a;r+=3){oi.fromArray(i,r);const o=s.x*Math.abs(oi.x)+s.y*Math.abs(oi.y)+s.z*Math.abs(oi.z),l=e.dot(oi),c=t.dot(oi),h=n.dot(oi);if(Math.max(-Math.max(l,c,h),Math.min(l,c,h))>o)return!1}return!0}const lf=new xi,ms=new L,jr=new L;class Si{constructor(e=new L,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){const n=this.center;t!==void 0?n.copy(t):lf.setFromPoints(e).getCenter(n);let s=0;for(let r=0,a=e.length;r<a;r++)s=Math.max(s,n.distanceToSquared(e[r]));return this.radius=Math.sqrt(s),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){const t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){const n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;ms.subVectors(e,this.center);const t=ms.lengthSq();if(t>this.radius*this.radius){const n=Math.sqrt(t),s=(n-this.radius)*.5;this.center.addScaledVector(ms,s/n),this.radius+=s}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(jr.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(ms.copy(e.center).add(jr)),this.expandByPoint(ms.copy(e.center).sub(jr))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}}const wn=new L,Yr=new L,Xs=new L,Gn=new L,$r=new L,js=new L,Kr=new L;class uh{constructor(e=new L,t=new L(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,wn)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);const n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){const t=wn.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(wn.copy(this.origin).addScaledVector(this.direction,t),wn.distanceToSquared(e))}distanceSqToSegment(e,t,n,s){Yr.copy(e).add(t).multiplyScalar(.5),Xs.copy(t).sub(e).normalize(),Gn.copy(this.origin).sub(Yr);const r=e.distanceTo(t)*.5,a=-this.direction.dot(Xs),o=Gn.dot(this.direction),l=-Gn.dot(Xs),c=Gn.lengthSq(),h=Math.abs(1-a*a);let u,f,p,g;if(h>0)if(u=a*l-o,f=a*o-l,g=r*h,u>=0)if(f>=-g)if(f<=g){const _=1/h;u*=_,f*=_,p=u*(u+a*f+2*o)+f*(a*u+f+2*l)+c}else f=r,u=Math.max(0,-(a*f+o)),p=-u*u+f*(f+2*l)+c;else f=-r,u=Math.max(0,-(a*f+o)),p=-u*u+f*(f+2*l)+c;else f<=-g?(u=Math.max(0,-(-a*r+o)),f=u>0?-r:Math.min(Math.max(-r,-l),r),p=-u*u+f*(f+2*l)+c):f<=g?(u=0,f=Math.min(Math.max(-r,-l),r),p=f*(f+2*l)+c):(u=Math.max(0,-(a*r+o)),f=u>0?r:Math.min(Math.max(-r,-l),r),p=-u*u+f*(f+2*l)+c);else f=a>0?-r:r,u=Math.max(0,-(a*f+o)),p=-u*u+f*(f+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,u),s&&s.copy(Yr).addScaledVector(Xs,f),p}intersectSphere(e,t){wn.subVectors(e.center,this.origin);const n=wn.dot(this.direction),s=wn.dot(wn)-n*n,r=e.radius*e.radius;if(s>r)return null;const a=Math.sqrt(r-s),o=n-a,l=n+a;return l<0?null:o<0?this.at(l,t):this.at(o,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){const t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;const n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){const n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){const t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,s,r,a,o,l;const c=1/this.direction.x,h=1/this.direction.y,u=1/this.direction.z,f=this.origin;return c>=0?(n=(e.min.x-f.x)*c,s=(e.max.x-f.x)*c):(n=(e.max.x-f.x)*c,s=(e.min.x-f.x)*c),h>=0?(r=(e.min.y-f.y)*h,a=(e.max.y-f.y)*h):(r=(e.max.y-f.y)*h,a=(e.min.y-f.y)*h),n>a||r>s||((r>n||isNaN(n))&&(n=r),(a<s||isNaN(s))&&(s=a),u>=0?(o=(e.min.z-f.z)*u,l=(e.max.z-f.z)*u):(o=(e.max.z-f.z)*u,l=(e.min.z-f.z)*u),n>l||o>s)||((o>n||n!==n)&&(n=o),(l<s||s!==s)&&(s=l),s<0)?null:this.at(n>=0?n:s,t)}intersectsBox(e){return this.intersectBox(e,wn)!==null}intersectTriangle(e,t,n,s,r){$r.subVectors(t,e),js.subVectors(n,e),Kr.crossVectors($r,js);let a=this.direction.dot(Kr),o;if(a>0){if(s)return null;o=1}else if(a<0)o=-1,a=-a;else return null;Gn.subVectors(this.origin,e);const l=o*this.direction.dot(js.crossVectors(Gn,js));if(l<0)return null;const c=o*this.direction.dot($r.cross(Gn));if(c<0||l+c>a)return null;const h=-o*Gn.dot(Kr);return h<0?null:this.at(h/a,r)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class Xe{constructor(e,t,n,s,r,a,o,l,c,h,u,f,p,g,_,m){Xe.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,a,o,l,c,h,u,f,p,g,_,m)}set(e,t,n,s,r,a,o,l,c,h,u,f,p,g,_,m){const d=this.elements;return d[0]=e,d[4]=t,d[8]=n,d[12]=s,d[1]=r,d[5]=a,d[9]=o,d[13]=l,d[2]=c,d[6]=h,d[10]=u,d[14]=f,d[3]=p,d[7]=g,d[11]=_,d[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new Xe().fromArray(this.elements)}copy(e){const t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){const t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){const t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){const t=this.elements,n=e.elements,s=1/Ai.setFromMatrixColumn(e,0).length(),r=1/Ai.setFromMatrixColumn(e,1).length(),a=1/Ai.setFromMatrixColumn(e,2).length();return t[0]=n[0]*s,t[1]=n[1]*s,t[2]=n[2]*s,t[3]=0,t[4]=n[4]*r,t[5]=n[5]*r,t[6]=n[6]*r,t[7]=0,t[8]=n[8]*a,t[9]=n[9]*a,t[10]=n[10]*a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){const t=this.elements,n=e.x,s=e.y,r=e.z,a=Math.cos(n),o=Math.sin(n),l=Math.cos(s),c=Math.sin(s),h=Math.cos(r),u=Math.sin(r);if(e.order==="XYZ"){const f=a*h,p=a*u,g=o*h,_=o*u;t[0]=l*h,t[4]=-l*u,t[8]=c,t[1]=p+g*c,t[5]=f-_*c,t[9]=-o*l,t[2]=_-f*c,t[6]=g+p*c,t[10]=a*l}else if(e.order==="YXZ"){const f=l*h,p=l*u,g=c*h,_=c*u;t[0]=f+_*o,t[4]=g*o-p,t[8]=a*c,t[1]=a*u,t[5]=a*h,t[9]=-o,t[2]=p*o-g,t[6]=_+f*o,t[10]=a*l}else if(e.order==="ZXY"){const f=l*h,p=l*u,g=c*h,_=c*u;t[0]=f-_*o,t[4]=-a*u,t[8]=g+p*o,t[1]=p+g*o,t[5]=a*h,t[9]=_-f*o,t[2]=-a*c,t[6]=o,t[10]=a*l}else if(e.order==="ZYX"){const f=a*h,p=a*u,g=o*h,_=o*u;t[0]=l*h,t[4]=g*c-p,t[8]=f*c+_,t[1]=l*u,t[5]=_*c+f,t[9]=p*c-g,t[2]=-c,t[6]=o*l,t[10]=a*l}else if(e.order==="YZX"){const f=a*l,p=a*c,g=o*l,_=o*c;t[0]=l*h,t[4]=_-f*u,t[8]=g*u+p,t[1]=u,t[5]=a*h,t[9]=-o*h,t[2]=-c*h,t[6]=p*u+g,t[10]=f-_*u}else if(e.order==="XZY"){const f=a*l,p=a*c,g=o*l,_=o*c;t[0]=l*h,t[4]=-u,t[8]=c*h,t[1]=f*u+_,t[5]=a*h,t[9]=p*u-g,t[2]=g*u-p,t[6]=o*h,t[10]=_*u+f}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(cf,e,hf)}lookAt(e,t,n){const s=this.elements;return Wt.subVectors(e,t),Wt.lengthSq()===0&&(Wt.z=1),Wt.normalize(),Vn.crossVectors(n,Wt),Vn.lengthSq()===0&&(Math.abs(n.z)===1?Wt.x+=1e-4:Wt.z+=1e-4,Wt.normalize(),Vn.crossVectors(n,Wt)),Vn.normalize(),Ys.crossVectors(Wt,Vn),s[0]=Vn.x,s[4]=Ys.x,s[8]=Wt.x,s[1]=Vn.y,s[5]=Ys.y,s[9]=Wt.y,s[2]=Vn.z,s[6]=Ys.z,s[10]=Wt.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const n=e.elements,s=t.elements,r=this.elements,a=n[0],o=n[4],l=n[8],c=n[12],h=n[1],u=n[5],f=n[9],p=n[13],g=n[2],_=n[6],m=n[10],d=n[14],b=n[3],E=n[7],M=n[11],w=n[15],A=s[0],C=s[4],D=s[8],S=s[12],y=s[1],P=s[5],N=s[9],z=s[13],q=s[2],G=s[6],V=s[10],$=s[14],k=s[3],ie=s[7],ce=s[11],ue=s[15];return r[0]=a*A+o*y+l*q+c*k,r[4]=a*C+o*P+l*G+c*ie,r[8]=a*D+o*N+l*V+c*ce,r[12]=a*S+o*z+l*$+c*ue,r[1]=h*A+u*y+f*q+p*k,r[5]=h*C+u*P+f*G+p*ie,r[9]=h*D+u*N+f*V+p*ce,r[13]=h*S+u*z+f*$+p*ue,r[2]=g*A+_*y+m*q+d*k,r[6]=g*C+_*P+m*G+d*ie,r[10]=g*D+_*N+m*V+d*ce,r[14]=g*S+_*z+m*$+d*ue,r[3]=b*A+E*y+M*q+w*k,r[7]=b*C+E*P+M*G+w*ie,r[11]=b*D+E*N+M*V+w*ce,r[15]=b*S+E*z+M*$+w*ue,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){const e=this.elements,t=e[0],n=e[4],s=e[8],r=e[12],a=e[1],o=e[5],l=e[9],c=e[13],h=e[2],u=e[6],f=e[10],p=e[14],g=e[3],_=e[7],m=e[11],d=e[15];return g*(+r*l*u-s*c*u-r*o*f+n*c*f+s*o*p-n*l*p)+_*(+t*l*p-t*c*f+r*a*f-s*a*p+s*c*h-r*l*h)+m*(+t*c*u-t*o*p-r*a*u+n*a*p+r*o*h-n*c*h)+d*(-s*o*h-t*l*u+t*o*f+s*a*u-n*a*f+n*l*h)}transpose(){const e=this.elements;let t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){const s=this.elements;return e.isVector3?(s[12]=e.x,s[13]=e.y,s[14]=e.z):(s[12]=e,s[13]=t,s[14]=n),this}invert(){const e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],h=e[8],u=e[9],f=e[10],p=e[11],g=e[12],_=e[13],m=e[14],d=e[15],b=u*m*c-_*f*c+_*l*p-o*m*p-u*l*d+o*f*d,E=g*f*c-h*m*c-g*l*p+a*m*p+h*l*d-a*f*d,M=h*_*c-g*u*c+g*o*p-a*_*p-h*o*d+a*u*d,w=g*u*l-h*_*l-g*o*f+a*_*f+h*o*m-a*u*m,A=t*b+n*E+s*M+r*w;if(A===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const C=1/A;return e[0]=b*C,e[1]=(_*f*r-u*m*r-_*s*p+n*m*p+u*s*d-n*f*d)*C,e[2]=(o*m*r-_*l*r+_*s*c-n*m*c-o*s*d+n*l*d)*C,e[3]=(u*l*r-o*f*r-u*s*c+n*f*c+o*s*p-n*l*p)*C,e[4]=E*C,e[5]=(h*m*r-g*f*r+g*s*p-t*m*p-h*s*d+t*f*d)*C,e[6]=(g*l*r-a*m*r-g*s*c+t*m*c+a*s*d-t*l*d)*C,e[7]=(a*f*r-h*l*r+h*s*c-t*f*c-a*s*p+t*l*p)*C,e[8]=M*C,e[9]=(g*u*r-h*_*r-g*n*p+t*_*p+h*n*d-t*u*d)*C,e[10]=(a*_*r-g*o*r+g*n*c-t*_*c-a*n*d+t*o*d)*C,e[11]=(h*o*r-a*u*r-h*n*c+t*u*c+a*n*p-t*o*p)*C,e[12]=w*C,e[13]=(h*_*s-g*u*s+g*n*f-t*_*f-h*n*m+t*u*m)*C,e[14]=(g*o*s-a*_*s-g*n*l+t*_*l+a*n*m-t*o*m)*C,e[15]=(a*u*s-h*o*s+h*n*l-t*u*l-a*n*f+t*o*f)*C,this}scale(e){const t=this.elements,n=e.x,s=e.y,r=e.z;return t[0]*=n,t[4]*=s,t[8]*=r,t[1]*=n,t[5]*=s,t[9]*=r,t[2]*=n,t[6]*=s,t[10]*=r,t[3]*=n,t[7]*=s,t[11]*=r,this}getMaxScaleOnAxis(){const e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],s=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,s))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){const t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){const n=Math.cos(t),s=Math.sin(t),r=1-n,a=e.x,o=e.y,l=e.z,c=r*a,h=r*o;return this.set(c*a+n,c*o-s*l,c*l+s*o,0,c*o+s*l,h*o+n,h*l-s*a,0,c*l-s*o,h*l+s*a,r*l*l+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,s,r,a){return this.set(1,n,r,0,e,1,a,0,t,s,1,0,0,0,0,1),this}compose(e,t,n){const s=this.elements,r=t._x,a=t._y,o=t._z,l=t._w,c=r+r,h=a+a,u=o+o,f=r*c,p=r*h,g=r*u,_=a*h,m=a*u,d=o*u,b=l*c,E=l*h,M=l*u,w=n.x,A=n.y,C=n.z;return s[0]=(1-(_+d))*w,s[1]=(p+M)*w,s[2]=(g-E)*w,s[3]=0,s[4]=(p-M)*A,s[5]=(1-(f+d))*A,s[6]=(m+b)*A,s[7]=0,s[8]=(g+E)*C,s[9]=(m-b)*C,s[10]=(1-(f+_))*C,s[11]=0,s[12]=e.x,s[13]=e.y,s[14]=e.z,s[15]=1,this}decompose(e,t,n){const s=this.elements;let r=Ai.set(s[0],s[1],s[2]).length();const a=Ai.set(s[4],s[5],s[6]).length(),o=Ai.set(s[8],s[9],s[10]).length();this.determinant()<0&&(r=-r),e.x=s[12],e.y=s[13],e.z=s[14],rn.copy(this);const c=1/r,h=1/a,u=1/o;return rn.elements[0]*=c,rn.elements[1]*=c,rn.elements[2]*=c,rn.elements[4]*=h,rn.elements[5]*=h,rn.elements[6]*=h,rn.elements[8]*=u,rn.elements[9]*=u,rn.elements[10]*=u,t.setFromRotationMatrix(rn),n.x=r,n.y=a,n.z=o,this}makePerspective(e,t,n,s,r,a,o=vn,l=!1){const c=this.elements,h=2*r/(t-e),u=2*r/(n-s),f=(t+e)/(t-e),p=(n+s)/(n-s);let g,_;if(l)g=r/(a-r),_=a*r/(a-r);else if(o===vn)g=-(a+r)/(a-r),_=-2*a*r/(a-r);else if(o===wr)g=-a/(a-r),_=-a*r/(a-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return c[0]=h,c[4]=0,c[8]=f,c[12]=0,c[1]=0,c[5]=u,c[9]=p,c[13]=0,c[2]=0,c[6]=0,c[10]=g,c[14]=_,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,t,n,s,r,a,o=vn,l=!1){const c=this.elements,h=2/(t-e),u=2/(n-s),f=-(t+e)/(t-e),p=-(n+s)/(n-s);let g,_;if(l)g=1/(a-r),_=a/(a-r);else if(o===vn)g=-2/(a-r),_=-(a+r)/(a-r);else if(o===wr)g=-1/(a-r),_=-r/(a-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return c[0]=h,c[4]=0,c[8]=0,c[12]=f,c[1]=0,c[5]=u,c[9]=0,c[13]=p,c[2]=0,c[6]=0,c[10]=g,c[14]=_,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){const t=this.elements,n=e.elements;for(let s=0;s<16;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){const n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}}const Ai=new L,rn=new Xe,cf=new L(0,0,0),hf=new L(1,1,1),Vn=new L,Ys=new L,Wt=new L,Al=new Xe,Rl=new Nt;class pn{constructor(e=0,t=0,n=0,s=pn.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=s}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,s=this._order){return this._x=e,this._y=t,this._z=n,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){const s=e.elements,r=s[0],a=s[4],o=s[8],l=s[1],c=s[5],h=s[9],u=s[2],f=s[6],p=s[10];switch(t){case"XYZ":this._y=Math.asin(qe(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-h,p),this._z=Math.atan2(-a,r)):(this._x=Math.atan2(f,c),this._z=0);break;case"YXZ":this._x=Math.asin(-qe(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(o,p),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-u,r),this._z=0);break;case"ZXY":this._x=Math.asin(qe(f,-1,1)),Math.abs(f)<.9999999?(this._y=Math.atan2(-u,p),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-qe(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(f,p),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-a,c));break;case"YZX":this._z=Math.asin(qe(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-h,c),this._y=Math.atan2(-u,r)):(this._x=0,this._y=Math.atan2(o,p));break;case"XZY":this._z=Math.asin(-qe(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(f,c),this._y=Math.atan2(o,r)):(this._x=Math.atan2(-h,p),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return Al.makeRotationFromQuaternion(e),this.setFromRotationMatrix(Al,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return Rl.setFromEuler(this),this.setFromQuaternion(Rl,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}pn.DEFAULT_ORDER="XYZ";class dh{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}}let uf=0;const Cl=new L,Ri=new Nt,An=new Xe,$s=new L,gs=new L,df=new L,ff=new Nt,Pl=new L(1,0,0),Ll=new L(0,1,0),Dl=new L(0,0,1),Il={type:"added"},pf={type:"removed"},Ci={type:"childadded",child:null},Zr={type:"childremoved",child:null};class ft extends ls{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:uf++}),this.uuid=cs(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=ft.DEFAULT_UP.clone();const e=new L,t=new pn,n=new Nt,s=new L(1,1,1);function r(){n.setFromEuler(t,!1)}function a(){t.setFromQuaternion(n,void 0,!1)}t._onChange(r),n._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new Xe},normalMatrix:{value:new Be}}),this.matrix=new Xe,this.matrixWorld=new Xe,this.matrixAutoUpdate=ft.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=ft.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new dh,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return Ri.setFromAxisAngle(e,t),this.quaternion.multiply(Ri),this}rotateOnWorldAxis(e,t){return Ri.setFromAxisAngle(e,t),this.quaternion.premultiply(Ri),this}rotateX(e){return this.rotateOnAxis(Pl,e)}rotateY(e){return this.rotateOnAxis(Ll,e)}rotateZ(e){return this.rotateOnAxis(Dl,e)}translateOnAxis(e,t){return Cl.copy(e).applyQuaternion(this.quaternion),this.position.add(Cl.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(Pl,e)}translateY(e){return this.translateOnAxis(Ll,e)}translateZ(e){return this.translateOnAxis(Dl,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(An.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?$s.copy(e):$s.set(e,t,n);const s=this.parent;this.updateWorldMatrix(!0,!1),gs.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?An.lookAt(gs,$s,this.up):An.lookAt($s,gs,this.up),this.quaternion.setFromRotationMatrix(An),s&&(An.extractRotation(s.matrixWorld),Ri.setFromRotationMatrix(An),this.quaternion.premultiply(Ri.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(Il),Ci.child=e,this.dispatchEvent(Ci),Ci.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}const t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(pf),Zr.child=e,this.dispatchEvent(Zr),Zr.child=null),this}removeFromParent(){const e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),An.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),An.multiply(e.parent.matrixWorld)),e.applyMatrix4(An),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(Il),Ci.child=e,this.dispatchEvent(Ci),Ci.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,s=this.children.length;n<s;n++){const a=this.children[n].getObjectByProperty(e,t);if(a!==void 0)return a}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);const s=this.children;for(let r=0,a=s.length;r<a;r++)s[r].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(gs,e,df),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(gs,ff,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);const t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);const t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverseVisible(e)}traverseAncestors(e){const t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);const t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t){const n=this.parent;if(e===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),t===!0){const s=this.children;for(let r=0,a=s.length;r<a;r++)s[r].updateWorldMatrix(!1,!0)}}toJSON(e){const t=e===void 0||typeof e=="string",n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});const s={};s.uuid=this.uuid,s.type=this.type,this.name!==""&&(s.name=this.name),this.castShadow===!0&&(s.castShadow=!0),this.receiveShadow===!0&&(s.receiveShadow=!0),this.visible===!1&&(s.visible=!1),this.frustumCulled===!1&&(s.frustumCulled=!1),this.renderOrder!==0&&(s.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(s.matrixAutoUpdate=!1),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.geometryInfo=this._geometryInfo.map(o=>({...o,boundingBox:o.boundingBox?o.boundingBox.toJSON():void 0,boundingSphere:o.boundingSphere?o.boundingSphere.toJSON():void 0})),s.instanceInfo=this._instanceInfo.map(o=>({...o})),s.availableInstanceIds=this._availableInstanceIds.slice(),s.availableGeometryIds=this._availableGeometryIds.slice(),s.nextIndexStart=this._nextIndexStart,s.nextVertexStart=this._nextVertexStart,s.geometryCount=this._geometryCount,s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.matricesTexture=this._matricesTexture.toJSON(e),s.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(s.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(s.boundingBox=this.boundingBox.toJSON()));function r(o,l){return o[l.uuid]===void 0&&(o[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(e.geometries,this.geometry);const o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){const l=o.shapes;if(Array.isArray(l))for(let c=0,h=l.length;c<h;c++){const u=l[c];r(e.shapes,u)}else r(e.shapes,l)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(e.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const o=[];for(let l=0,c=this.material.length;l<c;l++)o.push(r(e.materials,this.material[l]));s.material=o}else s.material=r(e.materials,this.material);if(this.children.length>0){s.children=[];for(let o=0;o<this.children.length;o++)s.children.push(this.children[o].toJSON(e).object)}if(this.animations.length>0){s.animations=[];for(let o=0;o<this.animations.length;o++){const l=this.animations[o];s.animations.push(r(e.animations,l))}}if(t){const o=a(e.geometries),l=a(e.materials),c=a(e.textures),h=a(e.images),u=a(e.shapes),f=a(e.skeletons),p=a(e.animations),g=a(e.nodes);o.length>0&&(n.geometries=o),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),h.length>0&&(n.images=h),u.length>0&&(n.shapes=u),f.length>0&&(n.skeletons=f),p.length>0&&(n.animations=p),g.length>0&&(n.nodes=g)}return n.object=s,n;function a(o){const l=[];for(const c in o){const h=o[c];delete h.metadata,l.push(h)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){const s=e.children[n];this.add(s.clone())}return this}}ft.DEFAULT_UP=new L(0,1,0);ft.DEFAULT_MATRIX_AUTO_UPDATE=!0;ft.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const an=new L,Rn=new L,Jr=new L,Cn=new L,Pi=new L,Li=new L,Ol=new L,Qr=new L,ea=new L,ta=new L,na=new Qe,ia=new Qe,sa=new Qe;class un{constructor(e=new L,t=new L,n=new L){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,s){s.subVectors(n,t),an.subVectors(e,t),s.cross(an);const r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(e,t,n,s,r){an.subVectors(s,t),Rn.subVectors(n,t),Jr.subVectors(e,t);const a=an.dot(an),o=an.dot(Rn),l=an.dot(Jr),c=Rn.dot(Rn),h=Rn.dot(Jr),u=a*c-o*o;if(u===0)return r.set(0,0,0),null;const f=1/u,p=(c*l-o*h)*f,g=(a*h-o*l)*f;return r.set(1-p-g,g,p)}static containsPoint(e,t,n,s){return this.getBarycoord(e,t,n,s,Cn)===null?!1:Cn.x>=0&&Cn.y>=0&&Cn.x+Cn.y<=1}static getInterpolation(e,t,n,s,r,a,o,l){return this.getBarycoord(e,t,n,s,Cn)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,Cn.x),l.addScaledVector(a,Cn.y),l.addScaledVector(o,Cn.z),l)}static getInterpolatedAttribute(e,t,n,s,r,a){return na.setScalar(0),ia.setScalar(0),sa.setScalar(0),na.fromBufferAttribute(e,t),ia.fromBufferAttribute(e,n),sa.fromBufferAttribute(e,s),a.setScalar(0),a.addScaledVector(na,r.x),a.addScaledVector(ia,r.y),a.addScaledVector(sa,r.z),a}static isFrontFacing(e,t,n,s){return an.subVectors(n,t),Rn.subVectors(e,t),an.cross(Rn).dot(s)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,s){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[s]),this}setFromAttributeAndIndices(e,t,n,s){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,s),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return an.subVectors(this.c,this.b),Rn.subVectors(this.a,this.b),an.cross(Rn).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return un.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return un.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,n,s,r){return un.getInterpolation(e,this.a,this.b,this.c,t,n,s,r)}containsPoint(e){return un.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return un.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){const n=this.a,s=this.b,r=this.c;let a,o;Pi.subVectors(s,n),Li.subVectors(r,n),Qr.subVectors(e,n);const l=Pi.dot(Qr),c=Li.dot(Qr);if(l<=0&&c<=0)return t.copy(n);ea.subVectors(e,s);const h=Pi.dot(ea),u=Li.dot(ea);if(h>=0&&u<=h)return t.copy(s);const f=l*u-h*c;if(f<=0&&l>=0&&h<=0)return a=l/(l-h),t.copy(n).addScaledVector(Pi,a);ta.subVectors(e,r);const p=Pi.dot(ta),g=Li.dot(ta);if(g>=0&&p<=g)return t.copy(r);const _=p*c-l*g;if(_<=0&&c>=0&&g<=0)return o=c/(c-g),t.copy(n).addScaledVector(Li,o);const m=h*g-p*u;if(m<=0&&u-h>=0&&p-g>=0)return Ol.subVectors(r,s),o=(u-h)/(u-h+(p-g)),t.copy(s).addScaledVector(Ol,o);const d=1/(m+_+f);return a=_*d,o=f*d,t.copy(n).addScaledVector(Pi,a).addScaledVector(Li,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}const fh={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Wn={h:0,s:0,l:0},Ks={h:0,s:0,l:0};function ra(i,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?i+(e-i)*6*t:t<1/2?e:t<2/3?i+(e-i)*6*(2/3-t):i}class Oe{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){const s=e;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=St){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,$e.colorSpaceToWorking(this,t),this}setRGB(e,t,n,s=$e.workingColorSpace){return this.r=e,this.g=t,this.b=n,$e.colorSpaceToWorking(this,s),this}setHSL(e,t,n,s=$e.workingColorSpace){if(e=No(e,1),t=qe(t,0,1),n=qe(n,0,1),t===0)this.r=this.g=this.b=n;else{const r=n<=.5?n*(1+t):n+t-n*t,a=2*n-r;this.r=ra(a,r,e+1/3),this.g=ra(a,r,e),this.b=ra(a,r,e-1/3)}return $e.colorSpaceToWorking(this,s),this}setStyle(e,t=St){function n(r){r!==void 0&&parseFloat(r)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(e)){let r;const a=s[1],o=s[2];switch(a){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,t);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,t);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,t);break;default:console.warn("THREE.Color: Unknown color model "+e)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(e)){const r=s[1],a=r.length;if(a===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,t);if(a===6)return this.setHex(parseInt(r,16),t);console.warn("THREE.Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=St){const n=fh[e.toLowerCase()];return n!==void 0?this.setHex(n,t):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=Fn(e.r),this.g=Fn(e.g),this.b=Fn(e.b),this}copyLinearToSRGB(e){return this.r=es(e.r),this.g=es(e.g),this.b=es(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=St){return $e.workingToColorSpace(bt.copy(this),e),Math.round(qe(bt.r*255,0,255))*65536+Math.round(qe(bt.g*255,0,255))*256+Math.round(qe(bt.b*255,0,255))}getHexString(e=St){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=$e.workingColorSpace){$e.workingToColorSpace(bt.copy(this),t);const n=bt.r,s=bt.g,r=bt.b,a=Math.max(n,s,r),o=Math.min(n,s,r);let l,c;const h=(o+a)/2;if(o===a)l=0,c=0;else{const u=a-o;switch(c=h<=.5?u/(a+o):u/(2-a-o),a){case n:l=(s-r)/u+(s<r?6:0);break;case s:l=(r-n)/u+2;break;case r:l=(n-s)/u+4;break}l/=6}return e.h=l,e.s=c,e.l=h,e}getRGB(e,t=$e.workingColorSpace){return $e.workingToColorSpace(bt.copy(this),t),e.r=bt.r,e.g=bt.g,e.b=bt.b,e}getStyle(e=St){$e.workingToColorSpace(bt.copy(this),e);const t=bt.r,n=bt.g,s=bt.b;return e!==St?`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(s*255)})`}offsetHSL(e,t,n){return this.getHSL(Wn),this.setHSL(Wn.h+e,Wn.s+t,Wn.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(Wn),e.getHSL(Ks);const n=ws(Wn.h,Ks.h,t),s=ws(Wn.s,Ks.s,t),r=ws(Wn.l,Ks.l,t);return this.setHSL(n,s,r),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){const t=this.r,n=this.g,s=this.b,r=e.elements;return this.r=r[0]*t+r[3]*n+r[6]*s,this.g=r[1]*t+r[4]*n+r[7]*s,this.b=r[2]*t+r[5]*n+r[8]*s,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const bt=new Oe;Oe.NAMES=fh;let mf=0;class vi extends ls{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:mf++}),this.uuid=cs(),this.name="",this.type="Material",this.blending=Qi,this.side=ei,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=La,this.blendDst=Da,this.blendEquation=pi,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Oe(0,0,0),this.blendAlpha=0,this.depthFunc=ts,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Sl,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=yi,this.stencilZFail=yi,this.stencilZPass=yi,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const t in e){const n=e[t];if(n===void 0){console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);continue}const s=this[t];if(s===void 0){console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(n):s&&s.isVector3&&n&&n.isVector3?s.copy(n):this[t]=n}}toJSON(e){const t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});const n={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==Qi&&(n.blending=this.blending),this.side!==ei&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==La&&(n.blendSrc=this.blendSrc),this.blendDst!==Da&&(n.blendDst=this.blendDst),this.blendEquation!==pi&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==ts&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==Sl&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==yi&&(n.stencilFail=this.stencilFail),this.stencilZFail!==yi&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==yi&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function s(r){const a=[];for(const o in r){const l=r[o];delete l.metadata,a.push(l)}return a}if(t){const r=s(e.textures),a=s(e.images);r.length>0&&(n.textures=r),a.length>0&&(n.images=a)}return n}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const t=e.clippingPlanes;let n=null;if(t!==null){const s=t.length;n=new Array(s);for(let r=0;r!==s;++r)n[r]=t[r].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}}class Qt extends vi{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Oe(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new pn,this.combine=wo,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}const pt=new L,Zs=new Ve;let gf=0;class Ft{constructor(e,t,n=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:gf++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=vl,this.updateRanges=[],this.gpuType=Sn,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[e+s]=t.array[n+s];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)Zs.fromBufferAttribute(this,t),Zs.applyMatrix3(e),this.setXY(t,Zs.x,Zs.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)pt.fromBufferAttribute(this,t),pt.applyMatrix3(e),this.setXYZ(t,pt.x,pt.y,pt.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)pt.fromBufferAttribute(this,t),pt.applyMatrix4(e),this.setXYZ(t,pt.x,pt.y,pt.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)pt.fromBufferAttribute(this,t),pt.applyNormalMatrix(e),this.setXYZ(t,pt.x,pt.y,pt.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)pt.fromBufferAttribute(this,t),pt.transformDirection(e),this.setXYZ(t,pt.x,pt.y,pt.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=ki(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=Lt(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=ki(t,this.array)),t}setX(e,t){return this.normalized&&(t=Lt(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=ki(t,this.array)),t}setY(e,t){return this.normalized&&(t=Lt(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=ki(t,this.array)),t}setZ(e,t){return this.normalized&&(t=Lt(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=ki(t,this.array)),t}setW(e,t){return this.normalized&&(t=Lt(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=Lt(t,this.array),n=Lt(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,s){return e*=this.itemSize,this.normalized&&(t=Lt(t,this.array),n=Lt(n,this.array),s=Lt(s,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this}setXYZW(e,t,n,s,r){return e*=this.itemSize,this.normalized&&(t=Lt(t,this.array),n=Lt(n,this.array),s=Lt(s,this.array),r=Lt(r,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this.array[e+3]=r,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==vl&&(e.usage=this.usage),e}}class ph extends Ft{constructor(e,t,n){super(new Uint16Array(e),t,n)}}class mh extends Ft{constructor(e,t,n){super(new Uint32Array(e),t,n)}}class nt extends Ft{constructor(e,t,n){super(new Float32Array(e),t,n)}}let _f=0;const Zt=new Xe,aa=new ft,Di=new L,qt=new xi,_s=new xi,xt=new L;class vt extends ls{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:_f++}),this.uuid=cs(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(ch(e)?mh:ph)(e,1):this.index=e,this}setIndirect(e){return this.indirect=e,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){const t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);const n=this.attributes.normal;if(n!==void 0){const r=new Be().getNormalMatrix(e);n.applyNormalMatrix(r),n.needsUpdate=!0}const s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(e),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return Zt.makeRotationFromQuaternion(e),this.applyMatrix4(Zt),this}rotateX(e){return Zt.makeRotationX(e),this.applyMatrix4(Zt),this}rotateY(e){return Zt.makeRotationY(e),this.applyMatrix4(Zt),this}rotateZ(e){return Zt.makeRotationZ(e),this.applyMatrix4(Zt),this}translate(e,t,n){return Zt.makeTranslation(e,t,n),this.applyMatrix4(Zt),this}scale(e,t,n){return Zt.makeScale(e,t,n),this.applyMatrix4(Zt),this}lookAt(e){return aa.lookAt(e),aa.updateMatrix(),this.applyMatrix4(aa.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Di).negate(),this.translate(Di.x,Di.y,Di.z),this}setFromPoints(e){const t=this.getAttribute("position");if(t===void 0){const n=[];for(let s=0,r=e.length;s<r;s++){const a=e[s];n.push(a.x,a.y,a.z||0)}this.setAttribute("position",new nt(n,3))}else{const n=Math.min(e.length,t.count);for(let s=0;s<n;s++){const r=e[s];t.setXYZ(s,r.x,r.y,r.z||0)}e.length>t.count&&console.warn("THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new xi);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new L(-1/0,-1/0,-1/0),new L(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,s=t.length;n<s;n++){const r=t[n];qt.setFromBufferAttribute(r),this.morphTargetsRelative?(xt.addVectors(this.boundingBox.min,qt.min),this.boundingBox.expandByPoint(xt),xt.addVectors(this.boundingBox.max,qt.max),this.boundingBox.expandByPoint(xt)):(this.boundingBox.expandByPoint(qt.min),this.boundingBox.expandByPoint(qt.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Si);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new L,1/0);return}if(e){const n=this.boundingSphere.center;if(qt.setFromBufferAttribute(e),t)for(let r=0,a=t.length;r<a;r++){const o=t[r];_s.setFromBufferAttribute(o),this.morphTargetsRelative?(xt.addVectors(qt.min,_s.min),qt.expandByPoint(xt),xt.addVectors(qt.max,_s.max),qt.expandByPoint(xt)):(qt.expandByPoint(_s.min),qt.expandByPoint(_s.max))}qt.getCenter(n);let s=0;for(let r=0,a=e.count;r<a;r++)xt.fromBufferAttribute(e,r),s=Math.max(s,n.distanceToSquared(xt));if(t)for(let r=0,a=t.length;r<a;r++){const o=t[r],l=this.morphTargetsRelative;for(let c=0,h=o.count;c<h;c++)xt.fromBufferAttribute(o,c),l&&(Di.fromBufferAttribute(e,c),xt.add(Di)),s=Math.max(s,n.distanceToSquared(xt))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const n=t.position,s=t.normal,r=t.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new Ft(new Float32Array(4*n.count),4));const a=this.getAttribute("tangent"),o=[],l=[];for(let D=0;D<n.count;D++)o[D]=new L,l[D]=new L;const c=new L,h=new L,u=new L,f=new Ve,p=new Ve,g=new Ve,_=new L,m=new L;function d(D,S,y){c.fromBufferAttribute(n,D),h.fromBufferAttribute(n,S),u.fromBufferAttribute(n,y),f.fromBufferAttribute(r,D),p.fromBufferAttribute(r,S),g.fromBufferAttribute(r,y),h.sub(c),u.sub(c),p.sub(f),g.sub(f);const P=1/(p.x*g.y-g.x*p.y);isFinite(P)&&(_.copy(h).multiplyScalar(g.y).addScaledVector(u,-p.y).multiplyScalar(P),m.copy(u).multiplyScalar(p.x).addScaledVector(h,-g.x).multiplyScalar(P),o[D].add(_),o[S].add(_),o[y].add(_),l[D].add(m),l[S].add(m),l[y].add(m))}let b=this.groups;b.length===0&&(b=[{start:0,count:e.count}]);for(let D=0,S=b.length;D<S;++D){const y=b[D],P=y.start,N=y.count;for(let z=P,q=P+N;z<q;z+=3)d(e.getX(z+0),e.getX(z+1),e.getX(z+2))}const E=new L,M=new L,w=new L,A=new L;function C(D){w.fromBufferAttribute(s,D),A.copy(w);const S=o[D];E.copy(S),E.sub(w.multiplyScalar(w.dot(S))).normalize(),M.crossVectors(A,S);const P=M.dot(l[D])<0?-1:1;a.setXYZW(D,E.x,E.y,E.z,P)}for(let D=0,S=b.length;D<S;++D){const y=b[D],P=y.start,N=y.count;for(let z=P,q=P+N;z<q;z+=3)C(e.getX(z+0)),C(e.getX(z+1)),C(e.getX(z+2))}}computeVertexNormals(){const e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0)n=new Ft(new Float32Array(t.count*3),3),this.setAttribute("normal",n);else for(let f=0,p=n.count;f<p;f++)n.setXYZ(f,0,0,0);const s=new L,r=new L,a=new L,o=new L,l=new L,c=new L,h=new L,u=new L;if(e)for(let f=0,p=e.count;f<p;f+=3){const g=e.getX(f+0),_=e.getX(f+1),m=e.getX(f+2);s.fromBufferAttribute(t,g),r.fromBufferAttribute(t,_),a.fromBufferAttribute(t,m),h.subVectors(a,r),u.subVectors(s,r),h.cross(u),o.fromBufferAttribute(n,g),l.fromBufferAttribute(n,_),c.fromBufferAttribute(n,m),o.add(h),l.add(h),c.add(h),n.setXYZ(g,o.x,o.y,o.z),n.setXYZ(_,l.x,l.y,l.z),n.setXYZ(m,c.x,c.y,c.z)}else for(let f=0,p=t.count;f<p;f+=3)s.fromBufferAttribute(t,f+0),r.fromBufferAttribute(t,f+1),a.fromBufferAttribute(t,f+2),h.subVectors(a,r),u.subVectors(s,r),h.cross(u),n.setXYZ(f+0,h.x,h.y,h.z),n.setXYZ(f+1,h.x,h.y,h.z),n.setXYZ(f+2,h.x,h.y,h.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){const e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)xt.fromBufferAttribute(e,t),xt.normalize(),e.setXYZ(t,xt.x,xt.y,xt.z)}toNonIndexed(){function e(o,l){const c=o.array,h=o.itemSize,u=o.normalized,f=new c.constructor(l.length*h);let p=0,g=0;for(let _=0,m=l.length;_<m;_++){o.isInterleavedBufferAttribute?p=l[_]*o.data.stride+o.offset:p=l[_]*h;for(let d=0;d<h;d++)f[g++]=c[p++]}return new Ft(f,h,u)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const t=new vt,n=this.index.array,s=this.attributes;for(const o in s){const l=s[o],c=e(l,n);t.setAttribute(o,c)}const r=this.morphAttributes;for(const o in r){const l=[],c=r[o];for(let h=0,u=c.length;h<u;h++){const f=c[h],p=e(f,n);l.push(p)}t.morphAttributes[o]=l}t.morphTargetsRelative=this.morphTargetsRelative;const a=this.groups;for(let o=0,l=a.length;o<l;o++){const c=a[o];t.addGroup(c.start,c.count,c.materialIndex)}return t}toJSON(){const e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){const l=this.parameters;for(const c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};const t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});const n=this.attributes;for(const l in n){const c=n[l];e.data.attributes[l]=c.toJSON(e.data)}const s={};let r=!1;for(const l in this.morphAttributes){const c=this.morphAttributes[l],h=[];for(let u=0,f=c.length;u<f;u++){const p=c[u];h.push(p.toJSON(e.data))}h.length>0&&(s[l]=h,r=!0)}r&&(e.data.morphAttributes=s,e.data.morphTargetsRelative=this.morphTargetsRelative);const a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));const o=this.boundingSphere;return o!==null&&(e.data.boundingSphere=o.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const t={};this.name=e.name;const n=e.index;n!==null&&this.setIndex(n.clone());const s=e.attributes;for(const c in s){const h=s[c];this.setAttribute(c,h.clone(t))}const r=e.morphAttributes;for(const c in r){const h=[],u=r[c];for(let f=0,p=u.length;f<p;f++)h.push(u[f].clone(t));this.morphAttributes[c]=h}this.morphTargetsRelative=e.morphTargetsRelative;const a=e.groups;for(let c=0,h=a.length;c<h;c++){const u=a[c];this.addGroup(u.start,u.count,u.materialIndex)}const o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());const l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}const Nl=new Xe,li=new uh,Js=new Si,Fl=new L,Qs=new L,er=new L,tr=new L,oa=new L,nr=new L,Ul=new L,ir=new L;class ht extends ft{constructor(e=new vt,t=new Qt){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){const o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}getVertexPosition(e,t){const n=this.geometry,s=n.attributes.position,r=n.morphAttributes.position,a=n.morphTargetsRelative;t.fromBufferAttribute(s,e);const o=this.morphTargetInfluences;if(r&&o){nr.set(0,0,0);for(let l=0,c=r.length;l<c;l++){const h=o[l],u=r[l];h!==0&&(oa.fromBufferAttribute(u,e),a?nr.addScaledVector(oa,h):nr.addScaledVector(oa.sub(t),h))}t.add(nr)}return t}raycast(e,t){const n=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),Js.copy(n.boundingSphere),Js.applyMatrix4(r),li.copy(e.ray).recast(e.near),!(Js.containsPoint(li.origin)===!1&&(li.intersectSphere(Js,Fl)===null||li.origin.distanceToSquared(Fl)>(e.far-e.near)**2))&&(Nl.copy(r).invert(),li.copy(e.ray).applyMatrix4(Nl),!(n.boundingBox!==null&&li.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(e,t,li)))}_computeIntersections(e,t,n){let s;const r=this.geometry,a=this.material,o=r.index,l=r.attributes.position,c=r.attributes.uv,h=r.attributes.uv1,u=r.attributes.normal,f=r.groups,p=r.drawRange;if(o!==null)if(Array.isArray(a))for(let g=0,_=f.length;g<_;g++){const m=f[g],d=a[m.materialIndex],b=Math.max(m.start,p.start),E=Math.min(o.count,Math.min(m.start+m.count,p.start+p.count));for(let M=b,w=E;M<w;M+=3){const A=o.getX(M),C=o.getX(M+1),D=o.getX(M+2);s=sr(this,d,e,n,c,h,u,A,C,D),s&&(s.faceIndex=Math.floor(M/3),s.face.materialIndex=m.materialIndex,t.push(s))}}else{const g=Math.max(0,p.start),_=Math.min(o.count,p.start+p.count);for(let m=g,d=_;m<d;m+=3){const b=o.getX(m),E=o.getX(m+1),M=o.getX(m+2);s=sr(this,a,e,n,c,h,u,b,E,M),s&&(s.faceIndex=Math.floor(m/3),t.push(s))}}else if(l!==void 0)if(Array.isArray(a))for(let g=0,_=f.length;g<_;g++){const m=f[g],d=a[m.materialIndex],b=Math.max(m.start,p.start),E=Math.min(l.count,Math.min(m.start+m.count,p.start+p.count));for(let M=b,w=E;M<w;M+=3){const A=M,C=M+1,D=M+2;s=sr(this,d,e,n,c,h,u,A,C,D),s&&(s.faceIndex=Math.floor(M/3),s.face.materialIndex=m.materialIndex,t.push(s))}}else{const g=Math.max(0,p.start),_=Math.min(l.count,p.start+p.count);for(let m=g,d=_;m<d;m+=3){const b=m,E=m+1,M=m+2;s=sr(this,a,e,n,c,h,u,b,E,M),s&&(s.faceIndex=Math.floor(m/3),t.push(s))}}}}function xf(i,e,t,n,s,r,a,o){let l;if(e.side===Ut?l=n.intersectTriangle(a,r,s,!0,o):l=n.intersectTriangle(s,r,a,e.side===ei,o),l===null)return null;ir.copy(o),ir.applyMatrix4(i.matrixWorld);const c=t.ray.origin.distanceTo(ir);return c<t.near||c>t.far?null:{distance:c,point:ir.clone(),object:i}}function sr(i,e,t,n,s,r,a,o,l,c){i.getVertexPosition(o,Qs),i.getVertexPosition(l,er),i.getVertexPosition(c,tr);const h=xf(i,e,t,n,Qs,er,tr,Ul);if(h){const u=new L;un.getBarycoord(Ul,Qs,er,tr,u),s&&(h.uv=un.getInterpolatedAttribute(s,o,l,c,u,new Ve)),r&&(h.uv1=un.getInterpolatedAttribute(r,o,l,c,u,new Ve)),a&&(h.normal=un.getInterpolatedAttribute(a,o,l,c,u,new L),h.normal.dot(n.direction)>0&&h.normal.multiplyScalar(-1));const f={a:o,b:l,c,normal:new L,materialIndex:0};un.getNormal(Qs,er,tr,f.normal),h.face=f,h.barycoord=u}return h}class dt extends vt{constructor(e=1,t=1,n=1,s=1,r=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:s,heightSegments:r,depthSegments:a};const o=this;s=Math.floor(s),r=Math.floor(r),a=Math.floor(a);const l=[],c=[],h=[],u=[];let f=0,p=0;g("z","y","x",-1,-1,n,t,e,a,r,0),g("z","y","x",1,-1,n,t,-e,a,r,1),g("x","z","y",1,1,e,n,t,s,a,2),g("x","z","y",1,-1,e,n,-t,s,a,3),g("x","y","z",1,-1,e,t,n,s,r,4),g("x","y","z",-1,-1,e,t,-n,s,r,5),this.setIndex(l),this.setAttribute("position",new nt(c,3)),this.setAttribute("normal",new nt(h,3)),this.setAttribute("uv",new nt(u,2));function g(_,m,d,b,E,M,w,A,C,D,S){const y=M/C,P=w/D,N=M/2,z=w/2,q=A/2,G=C+1,V=D+1;let $=0,k=0;const ie=new L;for(let ce=0;ce<V;ce++){const ue=ce*P-z;for(let Ie=0;Ie<G;Ie++){const Ue=Ie*y-N;ie[_]=Ue*b,ie[m]=ue*E,ie[d]=q,c.push(ie.x,ie.y,ie.z),ie[_]=0,ie[m]=0,ie[d]=A>0?1:-1,h.push(ie.x,ie.y,ie.z),u.push(Ie/C),u.push(1-ce/D),$+=1}}for(let ce=0;ce<D;ce++)for(let ue=0;ue<C;ue++){const Ie=f+ue+G*ce,Ue=f+ue+G*(ce+1),je=f+(ue+1)+G*(ce+1),He=f+(ue+1)+G*ce;l.push(Ie,Ue,He),l.push(Ue,je,He),k+=6}o.addGroup(p,k,S),p+=k,f+=$}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new dt(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}function as(i){const e={};for(const t in i){e[t]={};for(const n in i[t]){const s=i[t][n];s&&(s.isColor||s.isMatrix3||s.isMatrix4||s.isVector2||s.isVector3||s.isVector4||s.isTexture||s.isQuaternion)?s.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][n]=null):e[t][n]=s.clone():Array.isArray(s)?e[t][n]=s.slice():e[t][n]=s}}return e}function Dt(i){const e={};for(let t=0;t<i.length;t++){const n=as(i[t]);for(const s in n)e[s]=n[s]}return e}function Sf(i){const e=[];for(let t=0;t<i.length;t++)e.push(i[t].clone());return e}function gh(i){const e=i.getRenderTarget();return e===null?i.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:$e.workingColorSpace}const vf={clone:as,merge:Dt};var Mf=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,yf=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class ni extends vi{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Mf,this.fragmentShader=yf,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=as(e.uniforms),this.uniformsGroups=Sf(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){const t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(const s in this.uniforms){const a=this.uniforms[s].value;a&&a.isTexture?t.uniforms[s]={type:"t",value:a.toJSON(e).uuid}:a&&a.isColor?t.uniforms[s]={type:"c",value:a.getHex()}:a&&a.isVector2?t.uniforms[s]={type:"v2",value:a.toArray()}:a&&a.isVector3?t.uniforms[s]={type:"v3",value:a.toArray()}:a&&a.isVector4?t.uniforms[s]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?t.uniforms[s]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?t.uniforms[s]={type:"m4",value:a.toArray()}:t.uniforms[s]={value:a}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;const n={};for(const s in this.extensions)this.extensions[s]===!0&&(n[s]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}}class Uo extends ft{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Xe,this.projectionMatrix=new Xe,this.projectionMatrixInverse=new Xe,this.coordinateSystem=vn,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}const qn=new L,zl=new Ve,Bl=new Ve;class Ht extends Uo{constructor(e=50,t=1,n=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=s,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const t=.5*this.getFilmHeight()/e;this.fov=rs*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan(Ts*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return rs*2*Math.atan(Math.tan(Ts*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){qn.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(qn.x,qn.y).multiplyScalar(-e/qn.z),qn.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(qn.x,qn.y).multiplyScalar(-e/qn.z)}getViewSize(e,t){return this.getViewBounds(e,zl,Bl),t.subVectors(Bl,zl)}setViewOffset(e,t,n,s,r,a){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let t=e*Math.tan(Ts*.5*this.fov)/this.zoom,n=2*t,s=this.aspect*n,r=-.5*s;const a=this.view;if(this.view!==null&&this.view.enabled){const l=a.fullWidth,c=a.fullHeight;r+=a.offsetX*s/l,t-=a.offsetY*n/c,s*=a.width/l,n*=a.height/c}const o=this.filmOffset;o!==0&&(r+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,t,t-n,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}}const Ii=-90,Oi=1;class bf extends ft{constructor(e,t,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;const s=new Ht(Ii,Oi,e,t);s.layers=this.layers,this.add(s);const r=new Ht(Ii,Oi,e,t);r.layers=this.layers,this.add(r);const a=new Ht(Ii,Oi,e,t);a.layers=this.layers,this.add(a);const o=new Ht(Ii,Oi,e,t);o.layers=this.layers,this.add(o);const l=new Ht(Ii,Oi,e,t);l.layers=this.layers,this.add(l);const c=new Ht(Ii,Oi,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){const e=this.coordinateSystem,t=this.children.concat(),[n,s,r,a,o,l]=t;for(const c of t)this.remove(c);if(e===vn)n.up.set(0,1,0),n.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===wr)n.up.set(0,-1,0),n.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(const c of t)this.add(c),c.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();const{renderTarget:n,activeMipmapLevel:s}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());const[r,a,o,l,c,h]=this.children,u=e.getRenderTarget(),f=e.getActiveCubeFace(),p=e.getActiveMipmapLevel(),g=e.xr.enabled;e.xr.enabled=!1;const _=n.texture.generateMipmaps;n.texture.generateMipmaps=!1,e.setRenderTarget(n,0,s),e.render(t,r),e.setRenderTarget(n,1,s),e.render(t,a),e.setRenderTarget(n,2,s),e.render(t,o),e.setRenderTarget(n,3,s),e.render(t,l),e.setRenderTarget(n,4,s),e.render(t,c),n.texture.generateMipmaps=_,e.setRenderTarget(n,5,s),e.render(t,h),e.setRenderTarget(u,f,p),e.xr.enabled=g,n.texture.needsPMREMUpdate=!0}}class _h extends Rt{constructor(e=[],t=ns,n,s,r,a,o,l,c,h){super(e,t,n,s,r,a,o,l,c,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}}class Ef extends ti{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;const n={width:e,height:e,depth:1},s=[n,n,n,n,n,n];this.texture=new _h(s),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;const n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},s=new dt(5,5,5),r=new ni({name:"CubemapFromEquirect",uniforms:as(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:Ut,blending:Jn});r.uniforms.tEquirect.value=t;const a=new ht(s,r),o=t.minFilter;return t.minFilter===gi&&(t.minFilter=tn),new bf(1,10,this).update(e,a),t.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(e,t=!0,n=!0,s=!0){const r=e.getRenderTarget();for(let a=0;a<6;a++)e.setRenderTarget(this,a),e.clear(t,n,s);e.setRenderTarget(r)}}class nn extends ft{constructor(){super(),this.isGroup=!0,this.type="Group"}}const Tf={type:"move"};class la{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new nn,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new nn,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new L,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new L),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new nn,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new L,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new L),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){const t=this._hand;if(t)for(const n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let s=null,r=null,a=null;const o=this._targetRay,l=this._grip,c=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(c&&e.hand){a=!0;for(const _ of e.hand.values()){const m=t.getJointPose(_,n),d=this._getHandJoint(c,_);m!==null&&(d.matrix.fromArray(m.transform.matrix),d.matrix.decompose(d.position,d.rotation,d.scale),d.matrixWorldNeedsUpdate=!0,d.jointRadius=m.radius),d.visible=m!==null}const h=c.joints["index-finger-tip"],u=c.joints["thumb-tip"],f=h.position.distanceTo(u.position),p=.02,g=.005;c.inputState.pinching&&f>p+g?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&f<=p-g&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(r=t.getPose(e.gripSpace,n),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1));o!==null&&(s=t.getPose(e.targetRaySpace,n),s===null&&r!==null&&(s=r),s!==null&&(o.matrix.fromArray(s.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,s.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(s.linearVelocity)):o.hasLinearVelocity=!1,s.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(s.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(Tf)))}return o!==null&&(o.visible=s!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){const n=new nn;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}}class zo{constructor(e,t=1,n=1e3){this.isFog=!0,this.name="",this.color=new Oe(e),this.near=t,this.far=n}clone(){return new zo(this.color,this.near,this.far)}toJSON(){return{type:"Fog",name:this.name,color:this.color.getHex(),near:this.near,far:this.far}}}class Bo extends ft{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new pn,this.environmentIntensity=1,this.environmentRotation=new pn,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){const t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}}class wf extends Rt{constructor(e=null,t=1,n=1,s,r,a,o,l,c=jt,h=jt,u,f){super(null,a,o,l,c,h,s,r,u,f),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class Hl extends Ft{constructor(e,t,n,s=1){super(e,t,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=s}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){const e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}}const Ni=new Xe,kl=new Xe,rr=[],Gl=new xi,Af=new Xe,xs=new ht,Ss=new Si;class It extends ht{constructor(e,t,n){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new Hl(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let s=0;s<n;s++)this.setMatrixAt(s,Af)}computeBoundingBox(){const e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new xi),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,Ni),Gl.copy(e.boundingBox).applyMatrix4(Ni),this.boundingBox.union(Gl)}computeBoundingSphere(){const e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new Si),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,Ni),Ss.copy(e.boundingSphere).applyMatrix4(Ni),this.boundingSphere.union(Ss)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.morphTexture!==null&&(this.morphTexture=e.morphTexture.clone()),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,t){t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){const n=t.morphTargetInfluences,s=this.morphTexture.source.data.data,r=n.length+1,a=e*r+1;for(let o=0;o<n.length;o++)n[o]=s[a+o]}raycast(e,t){const n=this.matrixWorld,s=this.count;if(xs.geometry=this.geometry,xs.material=this.material,xs.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Ss.copy(this.boundingSphere),Ss.applyMatrix4(n),e.ray.intersectsSphere(Ss)!==!1))for(let r=0;r<s;r++){this.getMatrixAt(r,Ni),kl.multiplyMatrices(n,Ni),xs.matrixWorld=kl,xs.raycast(e,rr);for(let a=0,o=rr.length;a<o;a++){const l=rr[a];l.instanceId=r,l.object=this,t.push(l)}rr.length=0}}setColorAt(e,t){this.instanceColor===null&&(this.instanceColor=new Hl(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3)}setMatrixAt(e,t){t.toArray(this.instanceMatrix.array,e*16)}setMorphAt(e,t){const n=t.morphTargetInfluences,s=n.length+1;this.morphTexture===null&&(this.morphTexture=new wf(new Float32Array(s*this.count),s,this.count,Po,Sn));const r=this.morphTexture.source.data.data;let a=0;for(let c=0;c<n.length;c++)a+=n[c];const o=this.geometry.morphTargetsRelative?1:1-a,l=s*e;r[l]=o,r.set(n,l+1)}updateMorphTargets(){}dispose(){this.dispatchEvent({type:"dispose"}),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}}const ca=new L,Rf=new L,Cf=new Be;class di{constructor(e=new L(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,s){return this.normal.set(e,t,n),this.constant=s,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){const s=ca.subVectors(n,t).cross(Rf.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(s,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){const n=e.delta(ca),s=this.normal.dot(n);if(s===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;const r=-(e.start.dot(this.normal)+this.constant)/s;return r<0||r>1?null:t.copy(e.start).addScaledVector(n,r)}intersectsLine(e){const t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){const n=t||Cf.getNormalMatrix(e),s=this.coplanarPoint(ca).applyMatrix4(e),r=this.normal.applyMatrix3(n).normalize();return this.constant=-s.dot(r),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}}const ci=new Si,Pf=new Ve(.5,.5),ar=new L;class Ho{constructor(e=new di,t=new di,n=new di,s=new di,r=new di,a=new di){this.planes=[e,t,n,s,r,a]}set(e,t,n,s,r,a){const o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(n),o[3].copy(s),o[4].copy(r),o[5].copy(a),this}copy(e){const t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=vn,n=!1){const s=this.planes,r=e.elements,a=r[0],o=r[1],l=r[2],c=r[3],h=r[4],u=r[5],f=r[6],p=r[7],g=r[8],_=r[9],m=r[10],d=r[11],b=r[12],E=r[13],M=r[14],w=r[15];if(s[0].setComponents(c-a,p-h,d-g,w-b).normalize(),s[1].setComponents(c+a,p+h,d+g,w+b).normalize(),s[2].setComponents(c+o,p+u,d+_,w+E).normalize(),s[3].setComponents(c-o,p-u,d-_,w-E).normalize(),n)s[4].setComponents(l,f,m,M).normalize(),s[5].setComponents(c-l,p-f,d-m,w-M).normalize();else if(s[4].setComponents(c-l,p-f,d-m,w-M).normalize(),t===vn)s[5].setComponents(c+l,p+f,d+m,w+M).normalize();else if(t===wr)s[5].setComponents(l,f,m,M).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),ci.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{const t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),ci.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(ci)}intersectsSprite(e){ci.center.set(0,0,0);const t=Pf.distanceTo(e.center);return ci.radius=.7071067811865476+t,ci.applyMatrix4(e.matrixWorld),this.intersectsSphere(ci)}intersectsSphere(e){const t=this.planes,n=e.center,s=-e.radius;for(let r=0;r<6;r++)if(t[r].distanceToPoint(n)<s)return!1;return!0}intersectsBox(e){const t=this.planes;for(let n=0;n<6;n++){const s=t[n];if(ar.x=s.normal.x>0?e.max.x:e.min.x,ar.y=s.normal.y>0?e.max.y:e.min.y,ar.z=s.normal.z>0?e.max.z:e.min.z,s.distanceToPoint(ar)<0)return!1}return!0}containsPoint(e){const t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}class xo extends vi{constructor(e){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new Oe(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}}const Rr=new L,Cr=new L,Vl=new Xe,vs=new uh,or=new Si,ha=new L,Wl=new L;class Lf extends ft{constructor(e=new vt,t=new xo){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,n=[0];for(let s=1,r=t.count;s<r;s++)Rr.fromBufferAttribute(t,s-1),Cr.fromBufferAttribute(t,s),n[s]=n[s-1],n[s]+=Rr.distanceTo(Cr);e.setAttribute("lineDistance",new nt(n,1))}else console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(e,t){const n=this.geometry,s=this.matrixWorld,r=e.params.Line.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),or.copy(n.boundingSphere),or.applyMatrix4(s),or.radius+=r,e.ray.intersectsSphere(or)===!1)return;Vl.copy(s).invert(),vs.copy(e.ray).applyMatrix4(Vl);const o=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=o*o,c=this.isLineSegments?2:1,h=n.index,f=n.attributes.position;if(h!==null){const p=Math.max(0,a.start),g=Math.min(h.count,a.start+a.count);for(let _=p,m=g-1;_<m;_+=c){const d=h.getX(_),b=h.getX(_+1),E=lr(this,e,vs,l,d,b,_);E&&t.push(E)}if(this.isLineLoop){const _=h.getX(g-1),m=h.getX(p),d=lr(this,e,vs,l,_,m,g-1);d&&t.push(d)}}else{const p=Math.max(0,a.start),g=Math.min(f.count,a.start+a.count);for(let _=p,m=g-1;_<m;_+=c){const d=lr(this,e,vs,l,_,_+1,_);d&&t.push(d)}if(this.isLineLoop){const _=lr(this,e,vs,l,g-1,p,g-1);_&&t.push(_)}}}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){const o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}}function lr(i,e,t,n,s,r,a){const o=i.geometry.attributes.position;if(Rr.fromBufferAttribute(o,s),Cr.fromBufferAttribute(o,r),t.distanceSqToSegment(Rr,Cr,ha,Wl)>n)return;ha.applyMatrix4(i.matrixWorld);const c=e.ray.origin.distanceTo(ha);if(!(c<e.near||c>e.far))return{distance:c,point:Wl.clone().applyMatrix4(i.matrixWorld),index:a,face:null,faceIndex:null,barycoord:null,object:i}}const ql=new L,Xl=new L;class jl extends Lf{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,n=[];for(let s=0,r=t.count;s<r;s+=2)ql.fromBufferAttribute(t,s),Xl.fromBufferAttribute(t,s+1),n[s]=s===0?0:n[s-1],n[s+1]=n[s]+ql.distanceTo(Xl);e.setAttribute("lineDistance",new nt(n,1))}else console.warn("THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}}class Df extends Rt{constructor(e,t,n,s,r,a,o,l,c){super(e,t,n,s,r,a,o,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}}class xh extends Rt{constructor(e,t,n=_i,s,r,a,o=jt,l=jt,c,h=Ps,u=1){if(h!==Ps&&h!==Ls)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");const f={width:e,height:t,depth:u};super(f,s,r,a,o,l,h,n,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new Fo(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){const t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}}class Sh extends Rt{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}}class $n extends vt{constructor(e=1,t=1,n=4,s=8,r=1){super(),this.type="CapsuleGeometry",this.parameters={radius:e,height:t,capSegments:n,radialSegments:s,heightSegments:r},t=Math.max(0,t),n=Math.max(1,Math.floor(n)),s=Math.max(3,Math.floor(s)),r=Math.max(1,Math.floor(r));const a=[],o=[],l=[],c=[],h=t/2,u=Math.PI/2*e,f=t,p=2*u+f,g=n*2+r,_=s+1,m=new L,d=new L;for(let b=0;b<=g;b++){let E=0,M=0,w=0,A=0;if(b<=n){const S=b/n,y=S*Math.PI/2;M=-h-e*Math.cos(y),w=e*Math.sin(y),A=-e*Math.cos(y),E=S*u}else if(b<=n+r){const S=(b-n)/r;M=-h+S*t,w=e,A=0,E=u+S*f}else{const S=(b-n-r)/n,y=S*Math.PI/2;M=h+e*Math.sin(y),w=e*Math.cos(y),A=e*Math.sin(y),E=u+f+S*u}const C=Math.max(0,Math.min(1,E/p));let D=0;b===0?D=.5/s:b===g&&(D=-.5/s);for(let S=0;S<=s;S++){const y=S/s,P=y*Math.PI*2,N=Math.sin(P),z=Math.cos(P);d.x=-w*z,d.y=M,d.z=w*N,o.push(d.x,d.y,d.z),m.set(-w*z,A,w*N),m.normalize(),l.push(m.x,m.y,m.z),c.push(y+D,C)}if(b>0){const S=(b-1)*_;for(let y=0;y<s;y++){const P=S+y,N=S+y+1,z=b*_+y,q=b*_+y+1;a.push(P,N,z),a.push(N,q,z)}}}this.setIndex(a),this.setAttribute("position",new nt(o,3)),this.setAttribute("normal",new nt(l,3)),this.setAttribute("uv",new nt(c,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new $n(e.radius,e.height,e.capSegments,e.radialSegments,e.heightSegments)}}class ko extends vt{constructor(e=1,t=32,n=0,s=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:e,segments:t,thetaStart:n,thetaLength:s},t=Math.max(3,t);const r=[],a=[],o=[],l=[],c=new L,h=new Ve;a.push(0,0,0),o.push(0,0,1),l.push(.5,.5);for(let u=0,f=3;u<=t;u++,f+=3){const p=n+u/t*s;c.x=e*Math.cos(p),c.y=e*Math.sin(p),a.push(c.x,c.y,c.z),o.push(0,0,1),h.x=(a[f]/e+1)/2,h.y=(a[f+1]/e+1)/2,l.push(h.x,h.y)}for(let u=1;u<=t;u++)r.push(u,u+1,0);this.setIndex(r),this.setAttribute("position",new nt(a,3)),this.setAttribute("normal",new nt(o,3)),this.setAttribute("uv",new nt(l,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new ko(e.radius,e.segments,e.thetaStart,e.thetaLength)}}class Mn extends vt{constructor(e=1,t=1,n=1,s=32,r=1,a=!1,o=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:n,radialSegments:s,heightSegments:r,openEnded:a,thetaStart:o,thetaLength:l};const c=this;s=Math.floor(s),r=Math.floor(r);const h=[],u=[],f=[],p=[];let g=0;const _=[],m=n/2;let d=0;b(),a===!1&&(e>0&&E(!0),t>0&&E(!1)),this.setIndex(h),this.setAttribute("position",new nt(u,3)),this.setAttribute("normal",new nt(f,3)),this.setAttribute("uv",new nt(p,2));function b(){const M=new L,w=new L;let A=0;const C=(t-e)/n;for(let D=0;D<=r;D++){const S=[],y=D/r,P=y*(t-e)+e;for(let N=0;N<=s;N++){const z=N/s,q=z*l+o,G=Math.sin(q),V=Math.cos(q);w.x=P*G,w.y=-y*n+m,w.z=P*V,u.push(w.x,w.y,w.z),M.set(G,C,V).normalize(),f.push(M.x,M.y,M.z),p.push(z,1-y),S.push(g++)}_.push(S)}for(let D=0;D<s;D++)for(let S=0;S<r;S++){const y=_[S][D],P=_[S+1][D],N=_[S+1][D+1],z=_[S][D+1];(e>0||S!==0)&&(h.push(y,P,z),A+=3),(t>0||S!==r-1)&&(h.push(P,N,z),A+=3)}c.addGroup(d,A,0),d+=A}function E(M){const w=g,A=new Ve,C=new L;let D=0;const S=M===!0?e:t,y=M===!0?1:-1;for(let N=1;N<=s;N++)u.push(0,m*y,0),f.push(0,y,0),p.push(.5,.5),g++;const P=g;for(let N=0;N<=s;N++){const q=N/s*l+o,G=Math.cos(q),V=Math.sin(q);C.x=S*V,C.y=m*y,C.z=S*G,u.push(C.x,C.y,C.z),f.push(0,y,0),A.x=G*.5+.5,A.y=V*.5*y+.5,p.push(A.x,A.y),g++}for(let N=0;N<s;N++){const z=w+N,q=P+N;M===!0?h.push(q,q+1,z):h.push(q+1,q,z),D+=3}c.addGroup(d,D,M===!0?1:2),d+=D}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Mn(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}class Dr extends Mn{constructor(e=1,t=1,n=32,s=1,r=!1,a=0,o=Math.PI*2){super(0,e,t,n,s,r,a,o),this.type="ConeGeometry",this.parameters={radius:e,height:t,radialSegments:n,heightSegments:s,openEnded:r,thetaStart:a,thetaLength:o}}static fromJSON(e){return new Dr(e.radius,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}class Ot extends vt{constructor(e=1,t=1,n=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:s};const r=e/2,a=t/2,o=Math.floor(n),l=Math.floor(s),c=o+1,h=l+1,u=e/o,f=t/l,p=[],g=[],_=[],m=[];for(let d=0;d<h;d++){const b=d*f-a;for(let E=0;E<c;E++){const M=E*u-r;g.push(M,-b,0),_.push(0,0,1),m.push(E/o),m.push(1-d/l)}}for(let d=0;d<l;d++)for(let b=0;b<o;b++){const E=b+c*d,M=b+c*(d+1),w=b+1+c*(d+1),A=b+1+c*d;p.push(E,M,A),p.push(M,w,A)}this.setIndex(p),this.setAttribute("position",new nt(g,3)),this.setAttribute("normal",new nt(_,3)),this.setAttribute("uv",new nt(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Ot(e.width,e.height,e.widthSegments,e.heightSegments)}}class Go extends vt{constructor(e=.5,t=1,n=32,s=1,r=0,a=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:e,outerRadius:t,thetaSegments:n,phiSegments:s,thetaStart:r,thetaLength:a},n=Math.max(3,n),s=Math.max(1,s);const o=[],l=[],c=[],h=[];let u=e;const f=(t-e)/s,p=new L,g=new Ve;for(let _=0;_<=s;_++){for(let m=0;m<=n;m++){const d=r+m/n*a;p.x=u*Math.cos(d),p.y=u*Math.sin(d),l.push(p.x,p.y,p.z),c.push(0,0,1),g.x=(p.x/t+1)/2,g.y=(p.y/t+1)/2,h.push(g.x,g.y)}u+=f}for(let _=0;_<s;_++){const m=_*(n+1);for(let d=0;d<n;d++){const b=d+m,E=b,M=b+n+1,w=b+n+2,A=b+1;o.push(E,M,A),o.push(M,w,A)}}this.setIndex(o),this.setAttribute("position",new nt(l,3)),this.setAttribute("normal",new nt(c,3)),this.setAttribute("uv",new nt(h,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Go(e.innerRadius,e.outerRadius,e.thetaSegments,e.phiSegments,e.thetaStart,e.thetaLength)}}class ln extends vt{constructor(e=1,t=32,n=16,s=0,r=Math.PI*2,a=0,o=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:n,phiStart:s,phiLength:r,thetaStart:a,thetaLength:o},t=Math.max(3,Math.floor(t)),n=Math.max(2,Math.floor(n));const l=Math.min(a+o,Math.PI);let c=0;const h=[],u=new L,f=new L,p=[],g=[],_=[],m=[];for(let d=0;d<=n;d++){const b=[],E=d/n;let M=0;d===0&&a===0?M=.5/t:d===n&&l===Math.PI&&(M=-.5/t);for(let w=0;w<=t;w++){const A=w/t;u.x=-e*Math.cos(s+A*r)*Math.sin(a+E*o),u.y=e*Math.cos(a+E*o),u.z=e*Math.sin(s+A*r)*Math.sin(a+E*o),g.push(u.x,u.y,u.z),f.copy(u).normalize(),_.push(f.x,f.y,f.z),m.push(A+M,1-E),b.push(c++)}h.push(b)}for(let d=0;d<n;d++)for(let b=0;b<t;b++){const E=h[d][b+1],M=h[d][b],w=h[d+1][b],A=h[d+1][b+1];(d!==0||a>0)&&p.push(E,M,A),(d!==n-1||l<Math.PI)&&p.push(M,w,A)}this.setIndex(p),this.setAttribute("position",new nt(g,3)),this.setAttribute("normal",new nt(_,3)),this.setAttribute("uv",new nt(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new ln(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}}class Vo extends vt{constructor(e=1,t=.4,n=12,s=48,r=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:e,tube:t,radialSegments:n,tubularSegments:s,arc:r},n=Math.floor(n),s=Math.floor(s);const a=[],o=[],l=[],c=[],h=new L,u=new L,f=new L;for(let p=0;p<=n;p++)for(let g=0;g<=s;g++){const _=g/s*r,m=p/n*Math.PI*2;u.x=(e+t*Math.cos(m))*Math.cos(_),u.y=(e+t*Math.cos(m))*Math.sin(_),u.z=t*Math.sin(m),o.push(u.x,u.y,u.z),h.x=e*Math.cos(_),h.y=e*Math.sin(_),f.subVectors(u,h).normalize(),l.push(f.x,f.y,f.z),c.push(g/s),c.push(p/n)}for(let p=1;p<=n;p++)for(let g=1;g<=s;g++){const _=(s+1)*p+g-1,m=(s+1)*(p-1)+g-1,d=(s+1)*(p-1)+g,b=(s+1)*p+g;a.push(_,m,b),a.push(m,d,b)}this.setIndex(a),this.setAttribute("position",new nt(o,3)),this.setAttribute("normal",new nt(l,3)),this.setAttribute("uv",new nt(c,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Vo(e.radius,e.tube,e.radialSegments,e.tubularSegments,e.arc)}}class Dn extends vi{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new Oe(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Oe(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Oo,this.normalScale=new Ve(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new pn,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class Yn extends vi{constructor(e){super(),this.isMeshLambertMaterial=!0,this.type="MeshLambertMaterial",this.color=new Oe(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Oe(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Oo,this.normalScale=new Ve(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new pn,this.combine=wo,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class If extends vi{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=wd,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}}class Of extends vi{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}}class Ns extends ft{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new Oe(e),this.intensity=t}dispose(){}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){const t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,this.groundColor!==void 0&&(t.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(t.object.distance=this.distance),this.angle!==void 0&&(t.object.angle=this.angle),this.decay!==void 0&&(t.object.decay=this.decay),this.penumbra!==void 0&&(t.object.penumbra=this.penumbra),this.shadow!==void 0&&(t.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(t.object.target=this.target.uuid),t}}class Nf extends Ns{constructor(e,t,n){super(e,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(ft.DEFAULT_UP),this.updateMatrix(),this.groundColor=new Oe(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}}const ua=new Xe,Yl=new L,$l=new L;class Wo{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new Ve(512,512),this.mapType=yn,this.map=null,this.mapPass=null,this.matrix=new Xe,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Ho,this._frameExtents=new Ve(1,1),this._viewportCount=1,this._viewports=[new Qe(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){const t=this.camera,n=this.matrix;Yl.setFromMatrixPosition(e.matrixWorld),t.position.copy(Yl),$l.setFromMatrixPosition(e.target.matrixWorld),t.lookAt($l),t.updateMatrixWorld(),ua.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(ua,t.coordinateSystem,t.reversedDepth),t.reversedDepth?n.set(.5,0,0,.5,0,.5,0,.5,0,0,1,0,0,0,0,1):n.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),n.multiply(ua)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){const e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}}class Ff extends Wo{constructor(){super(new Ht(50,1,.5,500)),this.isSpotLightShadow=!0,this.focus=1,this.aspect=1}updateMatrices(e){const t=this.camera,n=rs*2*e.angle*this.focus,s=this.mapSize.width/this.mapSize.height*this.aspect,r=e.distance||t.far;(n!==t.fov||s!==t.aspect||r!==t.far)&&(t.fov=n,t.aspect=s,t.far=r,t.updateProjectionMatrix()),super.updateMatrices(e)}copy(e){return super.copy(e),this.focus=e.focus,this}}class Kl extends Ns{constructor(e,t,n=0,s=Math.PI/3,r=0,a=2){super(e,t),this.isSpotLight=!0,this.type="SpotLight",this.position.copy(ft.DEFAULT_UP),this.updateMatrix(),this.target=new ft,this.distance=n,this.angle=s,this.penumbra=r,this.decay=a,this.map=null,this.shadow=new Ff}get power(){return this.intensity*Math.PI}set power(e){this.intensity=e/Math.PI}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.angle=e.angle,this.penumbra=e.penumbra,this.decay=e.decay,this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}}const Zl=new Xe,Ms=new L,da=new L;class Uf extends Wo{constructor(){super(new Ht(90,1,.5,500)),this.isPointLightShadow=!0,this._frameExtents=new Ve(4,2),this._viewportCount=6,this._viewports=[new Qe(2,1,1,1),new Qe(0,1,1,1),new Qe(3,1,1,1),new Qe(1,1,1,1),new Qe(3,0,1,1),new Qe(1,0,1,1)],this._cubeDirections=[new L(1,0,0),new L(-1,0,0),new L(0,0,1),new L(0,0,-1),new L(0,1,0),new L(0,-1,0)],this._cubeUps=[new L(0,1,0),new L(0,1,0),new L(0,1,0),new L(0,1,0),new L(0,0,1),new L(0,0,-1)]}updateMatrices(e,t=0){const n=this.camera,s=this.matrix,r=e.distance||n.far;r!==n.far&&(n.far=r,n.updateProjectionMatrix()),Ms.setFromMatrixPosition(e.matrixWorld),n.position.copy(Ms),da.copy(n.position),da.add(this._cubeDirections[t]),n.up.copy(this._cubeUps[t]),n.lookAt(da),n.updateMatrixWorld(),s.makeTranslation(-Ms.x,-Ms.y,-Ms.z),Zl.multiplyMatrices(n.projectionMatrix,n.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Zl,n.coordinateSystem,n.reversedDepth)}}class zf extends Ns{constructor(e,t,n=0,s=2){super(e,t),this.isPointLight=!0,this.type="PointLight",this.distance=n,this.decay=s,this.shadow=new Uf}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}}class qo extends Uo{constructor(e=-1,t=1,n=1,s=-1,r=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=s,this.near=r,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,s,r,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,s=(this.top+this.bottom)/2;let r=n-e,a=n+e,o=s+t,l=s-t;if(this.view!==null&&this.view.enabled){const c=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,a=r+c*this.view.width,o-=h*this.view.offsetY,l=o-h*this.view.height}this.projectionMatrix.makeOrthographic(r,a,o,l,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}}class Bf extends Wo{constructor(){super(new qo(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class Jl extends Ns{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(ft.DEFAULT_UP),this.updateMatrix(),this.target=new ft,this.shadow=new Bf}dispose(){this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}}class Hf extends Ht{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}}function Ql(i,e,t,n){const s=kf(n);switch(t){case rh:return i*e;case Po:return i*e/s.components*s.byteLength;case Lo:return i*e/s.components*s.byteLength;case oh:return i*e*2/s.components*s.byteLength;case Do:return i*e*2/s.components*s.byteLength;case ah:return i*e*3/s.components*s.byteLength;case fn:return i*e*4/s.components*s.byteLength;case Io:return i*e*4/s.components*s.byteLength;case _r:case xr:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case Sr:case vr:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case Wa:case Xa:return Math.max(i,16)*Math.max(e,8)/4;case Va:case qa:return Math.max(i,8)*Math.max(e,8)/2;case ja:case Ya:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case $a:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case Ka:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case Za:return Math.floor((i+4)/5)*Math.floor((e+3)/4)*16;case Ja:return Math.floor((i+4)/5)*Math.floor((e+4)/5)*16;case Qa:return Math.floor((i+5)/6)*Math.floor((e+4)/5)*16;case eo:return Math.floor((i+5)/6)*Math.floor((e+5)/6)*16;case to:return Math.floor((i+7)/8)*Math.floor((e+4)/5)*16;case no:return Math.floor((i+7)/8)*Math.floor((e+5)/6)*16;case io:return Math.floor((i+7)/8)*Math.floor((e+7)/8)*16;case so:return Math.floor((i+9)/10)*Math.floor((e+4)/5)*16;case ro:return Math.floor((i+9)/10)*Math.floor((e+5)/6)*16;case ao:return Math.floor((i+9)/10)*Math.floor((e+7)/8)*16;case oo:return Math.floor((i+9)/10)*Math.floor((e+9)/10)*16;case lo:return Math.floor((i+11)/12)*Math.floor((e+9)/10)*16;case co:return Math.floor((i+11)/12)*Math.floor((e+11)/12)*16;case ho:case uo:case fo:return Math.ceil(i/4)*Math.ceil(e/4)*16;case po:case mo:return Math.ceil(i/4)*Math.ceil(e/4)*8;case go:case _o:return Math.ceil(i/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function kf(i){switch(i){case yn:case th:return{byteLength:1,components:1};case Rs:case nh:case Os:return{byteLength:2,components:1};case Ro:case Co:return{byteLength:2,components:4};case _i:case Ao:case Sn:return{byteLength:4,components:1};case ih:case sh:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${i}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:To}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=To);function vh(){let i=null,e=!1,t=null,n=null;function s(r,a){t(r,a),n=i.requestAnimationFrame(s)}return{start:function(){e!==!0&&t!==null&&(n=i.requestAnimationFrame(s),e=!0)},stop:function(){i.cancelAnimationFrame(n),e=!1},setAnimationLoop:function(r){t=r},setContext:function(r){i=r}}}function Gf(i){const e=new WeakMap;function t(o,l){const c=o.array,h=o.usage,u=c.byteLength,f=i.createBuffer();i.bindBuffer(l,f),i.bufferData(l,c,h),o.onUploadCallback();let p;if(c instanceof Float32Array)p=i.FLOAT;else if(typeof Float16Array<"u"&&c instanceof Float16Array)p=i.HALF_FLOAT;else if(c instanceof Uint16Array)o.isFloat16BufferAttribute?p=i.HALF_FLOAT:p=i.UNSIGNED_SHORT;else if(c instanceof Int16Array)p=i.SHORT;else if(c instanceof Uint32Array)p=i.UNSIGNED_INT;else if(c instanceof Int32Array)p=i.INT;else if(c instanceof Int8Array)p=i.BYTE;else if(c instanceof Uint8Array)p=i.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)p=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:f,type:p,bytesPerElement:c.BYTES_PER_ELEMENT,version:o.version,size:u}}function n(o,l,c){const h=l.array,u=l.updateRanges;if(i.bindBuffer(c,o),u.length===0)i.bufferSubData(c,0,h);else{u.sort((p,g)=>p.start-g.start);let f=0;for(let p=1;p<u.length;p++){const g=u[f],_=u[p];_.start<=g.start+g.count+1?g.count=Math.max(g.count,_.start+_.count-g.start):(++f,u[f]=_)}u.length=f+1;for(let p=0,g=u.length;p<g;p++){const _=u[p];i.bufferSubData(c,_.start*h.BYTES_PER_ELEMENT,h,_.start,_.count)}l.clearUpdateRanges()}l.onUploadCallback()}function s(o){return o.isInterleavedBufferAttribute&&(o=o.data),e.get(o)}function r(o){o.isInterleavedBufferAttribute&&(o=o.data);const l=e.get(o);l&&(i.deleteBuffer(l.buffer),e.delete(o))}function a(o,l){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){const h=e.get(o);(!h||h.version<o.version)&&e.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}const c=e.get(o);if(c===void 0)e.set(o,t(o,l));else if(c.version<o.version){if(c.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(c.buffer,o,l),c.version=o.version}}return{get:s,remove:r,update:a}}var Vf=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Wf=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,qf=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,Xf=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,jf=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,Yf=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,$f=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,Kf=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Zf=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`,Jf=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,Qf=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,ep=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,tp=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,np=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,ip=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,sp=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,rp=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,ap=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,op=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,lp=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,cp=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,hp=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,up=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`,dp=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,fp=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,pp=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,mp=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,gp=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,_p=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,xp=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,Sp="gl_FragColor = linearToOutputTexel( gl_FragColor );",vp=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,Mp=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,yp=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,bp=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,Ep=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,Tp=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,wp=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,Ap=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,Rp=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,Cp=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,Pp=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,Lp=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,Dp=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,Ip=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,Op=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,Np=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,Fp=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,Up=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,zp=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,Bp=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,Hp=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,kp=`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,Gp=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,Vp=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,Wp=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,qp=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,Xp=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,jp=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Yp=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,$p=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,Kp=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Zp=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,Jp=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Qp=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,em=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,tm=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,nm=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,im=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,sm=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,rm=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,am=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,om=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,lm=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,cm=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,hm=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,um=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,dm=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,fm=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,pm=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,mm=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,gm=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,_m=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,xm=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,Sm=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,vm=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,Mm=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,ym=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,bm=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,Em=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		float depth = unpackRGBAToDepth( texture2D( depths, uv ) );
		#ifdef USE_REVERSED_DEPTH_BUFFER
			return step( depth, compare );
		#else
			return step( compare, depth );
		#endif
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow( sampler2D shadow, vec2 uv, float compare ) {
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		#ifdef USE_REVERSED_DEPTH_BUFFER
			float hard_shadow = step( distribution.x, compare );
		#else
			float hard_shadow = step( compare, distribution.x );
		#endif
		if ( hard_shadow != 1.0 ) {
			float distance = compare - distribution.x;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		
		float lightToPositionLength = length( lightToPosition );
		if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {
			float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
			#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
				vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
				shadow = (
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
				) * ( 1.0 / 9.0 );
			#else
				shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
#endif`,Tm=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,wm=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,Am=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,Rm=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,Cm=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,Pm=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,Lm=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,Dm=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,Im=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,Om=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,Nm=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,Fm=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,Um=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,zm=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Bm=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Hm=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,km=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const Gm=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,Vm=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Wm=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,qm=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Xm=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,jm=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Ym=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,$m=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,Km=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,Zm=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,Jm=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,Qm=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,eg=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,tg=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,ng=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,ig=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,sg=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,rg=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,ag=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,og=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,lg=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,cg=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,hg=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,ug=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,dg=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,fg=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,pg=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,mg=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,gg=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,_g=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,xg=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Sg=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,vg=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,Mg=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,Ge={alphahash_fragment:Vf,alphahash_pars_fragment:Wf,alphamap_fragment:qf,alphamap_pars_fragment:Xf,alphatest_fragment:jf,alphatest_pars_fragment:Yf,aomap_fragment:$f,aomap_pars_fragment:Kf,batching_pars_vertex:Zf,batching_vertex:Jf,begin_vertex:Qf,beginnormal_vertex:ep,bsdfs:tp,iridescence_fragment:np,bumpmap_pars_fragment:ip,clipping_planes_fragment:sp,clipping_planes_pars_fragment:rp,clipping_planes_pars_vertex:ap,clipping_planes_vertex:op,color_fragment:lp,color_pars_fragment:cp,color_pars_vertex:hp,color_vertex:up,common:dp,cube_uv_reflection_fragment:fp,defaultnormal_vertex:pp,displacementmap_pars_vertex:mp,displacementmap_vertex:gp,emissivemap_fragment:_p,emissivemap_pars_fragment:xp,colorspace_fragment:Sp,colorspace_pars_fragment:vp,envmap_fragment:Mp,envmap_common_pars_fragment:yp,envmap_pars_fragment:bp,envmap_pars_vertex:Ep,envmap_physical_pars_fragment:Np,envmap_vertex:Tp,fog_vertex:wp,fog_pars_vertex:Ap,fog_fragment:Rp,fog_pars_fragment:Cp,gradientmap_pars_fragment:Pp,lightmap_pars_fragment:Lp,lights_lambert_fragment:Dp,lights_lambert_pars_fragment:Ip,lights_pars_begin:Op,lights_toon_fragment:Fp,lights_toon_pars_fragment:Up,lights_phong_fragment:zp,lights_phong_pars_fragment:Bp,lights_physical_fragment:Hp,lights_physical_pars_fragment:kp,lights_fragment_begin:Gp,lights_fragment_maps:Vp,lights_fragment_end:Wp,logdepthbuf_fragment:qp,logdepthbuf_pars_fragment:Xp,logdepthbuf_pars_vertex:jp,logdepthbuf_vertex:Yp,map_fragment:$p,map_pars_fragment:Kp,map_particle_fragment:Zp,map_particle_pars_fragment:Jp,metalnessmap_fragment:Qp,metalnessmap_pars_fragment:em,morphinstance_vertex:tm,morphcolor_vertex:nm,morphnormal_vertex:im,morphtarget_pars_vertex:sm,morphtarget_vertex:rm,normal_fragment_begin:am,normal_fragment_maps:om,normal_pars_fragment:lm,normal_pars_vertex:cm,normal_vertex:hm,normalmap_pars_fragment:um,clearcoat_normal_fragment_begin:dm,clearcoat_normal_fragment_maps:fm,clearcoat_pars_fragment:pm,iridescence_pars_fragment:mm,opaque_fragment:gm,packing:_m,premultiplied_alpha_fragment:xm,project_vertex:Sm,dithering_fragment:vm,dithering_pars_fragment:Mm,roughnessmap_fragment:ym,roughnessmap_pars_fragment:bm,shadowmap_pars_fragment:Em,shadowmap_pars_vertex:Tm,shadowmap_vertex:wm,shadowmask_pars_fragment:Am,skinbase_vertex:Rm,skinning_pars_vertex:Cm,skinning_vertex:Pm,skinnormal_vertex:Lm,specularmap_fragment:Dm,specularmap_pars_fragment:Im,tonemapping_fragment:Om,tonemapping_pars_fragment:Nm,transmission_fragment:Fm,transmission_pars_fragment:Um,uv_pars_fragment:zm,uv_pars_vertex:Bm,uv_vertex:Hm,worldpos_vertex:km,background_vert:Gm,background_frag:Vm,backgroundCube_vert:Wm,backgroundCube_frag:qm,cube_vert:Xm,cube_frag:jm,depth_vert:Ym,depth_frag:$m,distanceRGBA_vert:Km,distanceRGBA_frag:Zm,equirect_vert:Jm,equirect_frag:Qm,linedashed_vert:eg,linedashed_frag:tg,meshbasic_vert:ng,meshbasic_frag:ig,meshlambert_vert:sg,meshlambert_frag:rg,meshmatcap_vert:ag,meshmatcap_frag:og,meshnormal_vert:lg,meshnormal_frag:cg,meshphong_vert:hg,meshphong_frag:ug,meshphysical_vert:dg,meshphysical_frag:fg,meshtoon_vert:pg,meshtoon_frag:mg,points_vert:gg,points_frag:_g,shadow_vert:xg,shadow_frag:Sg,sprite_vert:vg,sprite_frag:Mg},ae={common:{diffuse:{value:new Oe(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Be},alphaMap:{value:null},alphaMapTransform:{value:new Be},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Be}},envmap:{envMap:{value:null},envMapRotation:{value:new Be},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Be}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Be}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Be},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Be},normalScale:{value:new Ve(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Be},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Be}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Be}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Be}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Oe(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new Oe(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Be},alphaTest:{value:0},uvTransform:{value:new Be}},sprite:{diffuse:{value:new Oe(16777215)},opacity:{value:1},center:{value:new Ve(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Be},alphaMap:{value:null},alphaMapTransform:{value:new Be},alphaTest:{value:0}}},xn={basic:{uniforms:Dt([ae.common,ae.specularmap,ae.envmap,ae.aomap,ae.lightmap,ae.fog]),vertexShader:Ge.meshbasic_vert,fragmentShader:Ge.meshbasic_frag},lambert:{uniforms:Dt([ae.common,ae.specularmap,ae.envmap,ae.aomap,ae.lightmap,ae.emissivemap,ae.bumpmap,ae.normalmap,ae.displacementmap,ae.fog,ae.lights,{emissive:{value:new Oe(0)}}]),vertexShader:Ge.meshlambert_vert,fragmentShader:Ge.meshlambert_frag},phong:{uniforms:Dt([ae.common,ae.specularmap,ae.envmap,ae.aomap,ae.lightmap,ae.emissivemap,ae.bumpmap,ae.normalmap,ae.displacementmap,ae.fog,ae.lights,{emissive:{value:new Oe(0)},specular:{value:new Oe(1118481)},shininess:{value:30}}]),vertexShader:Ge.meshphong_vert,fragmentShader:Ge.meshphong_frag},standard:{uniforms:Dt([ae.common,ae.envmap,ae.aomap,ae.lightmap,ae.emissivemap,ae.bumpmap,ae.normalmap,ae.displacementmap,ae.roughnessmap,ae.metalnessmap,ae.fog,ae.lights,{emissive:{value:new Oe(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Ge.meshphysical_vert,fragmentShader:Ge.meshphysical_frag},toon:{uniforms:Dt([ae.common,ae.aomap,ae.lightmap,ae.emissivemap,ae.bumpmap,ae.normalmap,ae.displacementmap,ae.gradientmap,ae.fog,ae.lights,{emissive:{value:new Oe(0)}}]),vertexShader:Ge.meshtoon_vert,fragmentShader:Ge.meshtoon_frag},matcap:{uniforms:Dt([ae.common,ae.bumpmap,ae.normalmap,ae.displacementmap,ae.fog,{matcap:{value:null}}]),vertexShader:Ge.meshmatcap_vert,fragmentShader:Ge.meshmatcap_frag},points:{uniforms:Dt([ae.points,ae.fog]),vertexShader:Ge.points_vert,fragmentShader:Ge.points_frag},dashed:{uniforms:Dt([ae.common,ae.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Ge.linedashed_vert,fragmentShader:Ge.linedashed_frag},depth:{uniforms:Dt([ae.common,ae.displacementmap]),vertexShader:Ge.depth_vert,fragmentShader:Ge.depth_frag},normal:{uniforms:Dt([ae.common,ae.bumpmap,ae.normalmap,ae.displacementmap,{opacity:{value:1}}]),vertexShader:Ge.meshnormal_vert,fragmentShader:Ge.meshnormal_frag},sprite:{uniforms:Dt([ae.sprite,ae.fog]),vertexShader:Ge.sprite_vert,fragmentShader:Ge.sprite_frag},background:{uniforms:{uvTransform:{value:new Be},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Ge.background_vert,fragmentShader:Ge.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Be}},vertexShader:Ge.backgroundCube_vert,fragmentShader:Ge.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Ge.cube_vert,fragmentShader:Ge.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Ge.equirect_vert,fragmentShader:Ge.equirect_frag},distanceRGBA:{uniforms:Dt([ae.common,ae.displacementmap,{referencePosition:{value:new L},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Ge.distanceRGBA_vert,fragmentShader:Ge.distanceRGBA_frag},shadow:{uniforms:Dt([ae.lights,ae.fog,{color:{value:new Oe(0)},opacity:{value:1}}]),vertexShader:Ge.shadow_vert,fragmentShader:Ge.shadow_frag}};xn.physical={uniforms:Dt([xn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Be},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Be},clearcoatNormalScale:{value:new Ve(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Be},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Be},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Be},sheen:{value:0},sheenColor:{value:new Oe(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Be},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Be},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Be},transmissionSamplerSize:{value:new Ve},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Be},attenuationDistance:{value:0},attenuationColor:{value:new Oe(0)},specularColor:{value:new Oe(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Be},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Be},anisotropyVector:{value:new Ve},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Be}}]),vertexShader:Ge.meshphysical_vert,fragmentShader:Ge.meshphysical_frag};const cr={r:0,b:0,g:0},hi=new pn,yg=new Xe;function bg(i,e,t,n,s,r,a){const o=new Oe(0);let l=r===!0?0:1,c,h,u=null,f=0,p=null;function g(E){let M=E.isScene===!0?E.background:null;return M&&M.isTexture&&(M=(E.backgroundBlurriness>0?t:e).get(M)),M}function _(E){let M=!1;const w=g(E);w===null?d(o,l):w&&w.isColor&&(d(w,1),M=!0);const A=i.xr.getEnvironmentBlendMode();A==="additive"?n.buffers.color.setClear(0,0,0,1,a):A==="alpha-blend"&&n.buffers.color.setClear(0,0,0,0,a),(i.autoClear||M)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil))}function m(E,M){const w=g(M);w&&(w.isCubeTexture||w.mapping===Lr)?(h===void 0&&(h=new ht(new dt(1,1,1),new ni({name:"BackgroundCubeMaterial",uniforms:as(xn.backgroundCube.uniforms),vertexShader:xn.backgroundCube.vertexShader,fragmentShader:xn.backgroundCube.fragmentShader,side:Ut,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),h.geometry.deleteAttribute("normal"),h.geometry.deleteAttribute("uv"),h.onBeforeRender=function(A,C,D){this.matrixWorld.copyPosition(D.matrixWorld)},Object.defineProperty(h.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),s.update(h)),hi.copy(M.backgroundRotation),hi.x*=-1,hi.y*=-1,hi.z*=-1,w.isCubeTexture&&w.isRenderTargetTexture===!1&&(hi.y*=-1,hi.z*=-1),h.material.uniforms.envMap.value=w,h.material.uniforms.flipEnvMap.value=w.isCubeTexture&&w.isRenderTargetTexture===!1?-1:1,h.material.uniforms.backgroundBlurriness.value=M.backgroundBlurriness,h.material.uniforms.backgroundIntensity.value=M.backgroundIntensity,h.material.uniforms.backgroundRotation.value.setFromMatrix4(yg.makeRotationFromEuler(hi)),h.material.toneMapped=$e.getTransfer(w.colorSpace)!==Je,(u!==w||f!==w.version||p!==i.toneMapping)&&(h.material.needsUpdate=!0,u=w,f=w.version,p=i.toneMapping),h.layers.enableAll(),E.unshift(h,h.geometry,h.material,0,0,null)):w&&w.isTexture&&(c===void 0&&(c=new ht(new Ot(2,2),new ni({name:"BackgroundMaterial",uniforms:as(xn.background.uniforms),vertexShader:xn.background.vertexShader,fragmentShader:xn.background.fragmentShader,side:ei,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),s.update(c)),c.material.uniforms.t2D.value=w,c.material.uniforms.backgroundIntensity.value=M.backgroundIntensity,c.material.toneMapped=$e.getTransfer(w.colorSpace)!==Je,w.matrixAutoUpdate===!0&&w.updateMatrix(),c.material.uniforms.uvTransform.value.copy(w.matrix),(u!==w||f!==w.version||p!==i.toneMapping)&&(c.material.needsUpdate=!0,u=w,f=w.version,p=i.toneMapping),c.layers.enableAll(),E.unshift(c,c.geometry,c.material,0,0,null))}function d(E,M){E.getRGB(cr,gh(i)),n.buffers.color.setClear(cr.r,cr.g,cr.b,M,a)}function b(){h!==void 0&&(h.geometry.dispose(),h.material.dispose(),h=void 0),c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0)}return{getClearColor:function(){return o},setClearColor:function(E,M=1){o.set(E),l=M,d(o,l)},getClearAlpha:function(){return l},setClearAlpha:function(E){l=E,d(o,l)},render:_,addToRenderList:m,dispose:b}}function Eg(i,e){const t=i.getParameter(i.MAX_VERTEX_ATTRIBS),n={},s=f(null);let r=s,a=!1;function o(y,P,N,z,q){let G=!1;const V=u(z,N,P);r!==V&&(r=V,c(r.object)),G=p(y,z,N,q),G&&g(y,z,N,q),q!==null&&e.update(q,i.ELEMENT_ARRAY_BUFFER),(G||a)&&(a=!1,M(y,P,N,z),q!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,e.get(q).buffer))}function l(){return i.createVertexArray()}function c(y){return i.bindVertexArray(y)}function h(y){return i.deleteVertexArray(y)}function u(y,P,N){const z=N.wireframe===!0;let q=n[y.id];q===void 0&&(q={},n[y.id]=q);let G=q[P.id];G===void 0&&(G={},q[P.id]=G);let V=G[z];return V===void 0&&(V=f(l()),G[z]=V),V}function f(y){const P=[],N=[],z=[];for(let q=0;q<t;q++)P[q]=0,N[q]=0,z[q]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:P,enabledAttributes:N,attributeDivisors:z,object:y,attributes:{},index:null}}function p(y,P,N,z){const q=r.attributes,G=P.attributes;let V=0;const $=N.getAttributes();for(const k in $)if($[k].location>=0){const ce=q[k];let ue=G[k];if(ue===void 0&&(k==="instanceMatrix"&&y.instanceMatrix&&(ue=y.instanceMatrix),k==="instanceColor"&&y.instanceColor&&(ue=y.instanceColor)),ce===void 0||ce.attribute!==ue||ue&&ce.data!==ue.data)return!0;V++}return r.attributesNum!==V||r.index!==z}function g(y,P,N,z){const q={},G=P.attributes;let V=0;const $=N.getAttributes();for(const k in $)if($[k].location>=0){let ce=G[k];ce===void 0&&(k==="instanceMatrix"&&y.instanceMatrix&&(ce=y.instanceMatrix),k==="instanceColor"&&y.instanceColor&&(ce=y.instanceColor));const ue={};ue.attribute=ce,ce&&ce.data&&(ue.data=ce.data),q[k]=ue,V++}r.attributes=q,r.attributesNum=V,r.index=z}function _(){const y=r.newAttributes;for(let P=0,N=y.length;P<N;P++)y[P]=0}function m(y){d(y,0)}function d(y,P){const N=r.newAttributes,z=r.enabledAttributes,q=r.attributeDivisors;N[y]=1,z[y]===0&&(i.enableVertexAttribArray(y),z[y]=1),q[y]!==P&&(i.vertexAttribDivisor(y,P),q[y]=P)}function b(){const y=r.newAttributes,P=r.enabledAttributes;for(let N=0,z=P.length;N<z;N++)P[N]!==y[N]&&(i.disableVertexAttribArray(N),P[N]=0)}function E(y,P,N,z,q,G,V){V===!0?i.vertexAttribIPointer(y,P,N,q,G):i.vertexAttribPointer(y,P,N,z,q,G)}function M(y,P,N,z){_();const q=z.attributes,G=N.getAttributes(),V=P.defaultAttributeValues;for(const $ in G){const k=G[$];if(k.location>=0){let ie=q[$];if(ie===void 0&&($==="instanceMatrix"&&y.instanceMatrix&&(ie=y.instanceMatrix),$==="instanceColor"&&y.instanceColor&&(ie=y.instanceColor)),ie!==void 0){const ce=ie.normalized,ue=ie.itemSize,Ie=e.get(ie);if(Ie===void 0)continue;const Ue=Ie.buffer,je=Ie.type,He=Ie.bytesPerElement,j=je===i.INT||je===i.UNSIGNED_INT||ie.gpuType===Ao;if(ie.isInterleavedBufferAttribute){const K=ie.data,oe=K.stride,Te=ie.offset;if(K.isInstancedInterleavedBuffer){for(let re=0;re<k.locationSize;re++)d(k.location+re,K.meshPerAttribute);y.isInstancedMesh!==!0&&z._maxInstanceCount===void 0&&(z._maxInstanceCount=K.meshPerAttribute*K.count)}else for(let re=0;re<k.locationSize;re++)m(k.location+re);i.bindBuffer(i.ARRAY_BUFFER,Ue);for(let re=0;re<k.locationSize;re++)E(k.location+re,ue/k.locationSize,je,ce,oe*He,(Te+ue/k.locationSize*re)*He,j)}else{if(ie.isInstancedBufferAttribute){for(let K=0;K<k.locationSize;K++)d(k.location+K,ie.meshPerAttribute);y.isInstancedMesh!==!0&&z._maxInstanceCount===void 0&&(z._maxInstanceCount=ie.meshPerAttribute*ie.count)}else for(let K=0;K<k.locationSize;K++)m(k.location+K);i.bindBuffer(i.ARRAY_BUFFER,Ue);for(let K=0;K<k.locationSize;K++)E(k.location+K,ue/k.locationSize,je,ce,ue*He,ue/k.locationSize*K*He,j)}}else if(V!==void 0){const ce=V[$];if(ce!==void 0)switch(ce.length){case 2:i.vertexAttrib2fv(k.location,ce);break;case 3:i.vertexAttrib3fv(k.location,ce);break;case 4:i.vertexAttrib4fv(k.location,ce);break;default:i.vertexAttrib1fv(k.location,ce)}}}}b()}function w(){D();for(const y in n){const P=n[y];for(const N in P){const z=P[N];for(const q in z)h(z[q].object),delete z[q];delete P[N]}delete n[y]}}function A(y){if(n[y.id]===void 0)return;const P=n[y.id];for(const N in P){const z=P[N];for(const q in z)h(z[q].object),delete z[q];delete P[N]}delete n[y.id]}function C(y){for(const P in n){const N=n[P];if(N[y.id]===void 0)continue;const z=N[y.id];for(const q in z)h(z[q].object),delete z[q];delete N[y.id]}}function D(){S(),a=!0,r!==s&&(r=s,c(r.object))}function S(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:o,reset:D,resetDefaultState:S,dispose:w,releaseStatesOfGeometry:A,releaseStatesOfProgram:C,initAttributes:_,enableAttribute:m,disableUnusedAttributes:b}}function Tg(i,e,t){let n;function s(c){n=c}function r(c,h){i.drawArrays(n,c,h),t.update(h,n,1)}function a(c,h,u){u!==0&&(i.drawArraysInstanced(n,c,h,u),t.update(h,n,u))}function o(c,h,u){if(u===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,c,0,h,0,u);let p=0;for(let g=0;g<u;g++)p+=h[g];t.update(p,n,1)}function l(c,h,u,f){if(u===0)return;const p=e.get("WEBGL_multi_draw");if(p===null)for(let g=0;g<c.length;g++)a(c[g],h[g],f[g]);else{p.multiDrawArraysInstancedWEBGL(n,c,0,h,0,f,0,u);let g=0;for(let _=0;_<u;_++)g+=h[_]*f[_];t.update(g,n,1)}}this.setMode=s,this.render=r,this.renderInstances=a,this.renderMultiDraw=o,this.renderMultiDrawInstances=l}function wg(i,e,t,n){let s;function r(){if(s!==void 0)return s;if(e.has("EXT_texture_filter_anisotropic")===!0){const C=e.get("EXT_texture_filter_anisotropic");s=i.getParameter(C.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function a(C){return!(C!==fn&&n.convert(C)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(C){const D=C===Os&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(C!==yn&&n.convert(C)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE)&&C!==Sn&&!D)}function l(C){if(C==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";C="mediump"}return C==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=t.precision!==void 0?t.precision:"highp";const h=l(c);h!==c&&(console.warn("THREE.WebGLRenderer:",c,"not supported, using",h,"instead."),c=h);const u=t.logarithmicDepthBuffer===!0,f=t.reversedDepthBuffer===!0&&e.has("EXT_clip_control"),p=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),g=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),_=i.getParameter(i.MAX_TEXTURE_SIZE),m=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),d=i.getParameter(i.MAX_VERTEX_ATTRIBS),b=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),E=i.getParameter(i.MAX_VARYING_VECTORS),M=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),w=g>0,A=i.getParameter(i.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:a,textureTypeReadable:o,precision:c,logarithmicDepthBuffer:u,reversedDepthBuffer:f,maxTextures:p,maxVertexTextures:g,maxTextureSize:_,maxCubemapSize:m,maxAttributes:d,maxVertexUniforms:b,maxVaryings:E,maxFragmentUniforms:M,vertexTextures:w,maxSamples:A}}function Ag(i){const e=this;let t=null,n=0,s=!1,r=!1;const a=new di,o=new Be,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(u,f){const p=u.length!==0||f||n!==0||s;return s=f,n=u.length,p},this.beginShadows=function(){r=!0,h(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(u,f){t=h(u,f,0)},this.setState=function(u,f,p){const g=u.clippingPlanes,_=u.clipIntersection,m=u.clipShadows,d=i.get(u);if(!s||g===null||g.length===0||r&&!m)r?h(null):c();else{const b=r?0:n,E=b*4;let M=d.clippingState||null;l.value=M,M=h(g,f,E,p);for(let w=0;w!==E;++w)M[w]=t[w];d.clippingState=M,this.numIntersection=_?this.numPlanes:0,this.numPlanes+=b}};function c(){l.value!==t&&(l.value=t,l.needsUpdate=n>0),e.numPlanes=n,e.numIntersection=0}function h(u,f,p,g){const _=u!==null?u.length:0;let m=null;if(_!==0){if(m=l.value,g!==!0||m===null){const d=p+_*4,b=f.matrixWorldInverse;o.getNormalMatrix(b),(m===null||m.length<d)&&(m=new Float32Array(d));for(let E=0,M=p;E!==_;++E,M+=4)a.copy(u[E]).applyMatrix4(b,o),a.normal.toArray(m,M),m[M+3]=a.constant}l.value=m,l.needsUpdate=!0}return e.numPlanes=_,e.numIntersection=0,m}}function Rg(i){let e=new WeakMap;function t(a,o){return o===Ha?a.mapping=ns:o===ka&&(a.mapping=is),a}function n(a){if(a&&a.isTexture){const o=a.mapping;if(o===Ha||o===ka)if(e.has(a)){const l=e.get(a).texture;return t(l,a.mapping)}else{const l=a.image;if(l&&l.height>0){const c=new Ef(l.height);return c.fromEquirectangularTexture(i,a),e.set(a,c),a.addEventListener("dispose",s),t(c.texture,a.mapping)}else return null}}return a}function s(a){const o=a.target;o.removeEventListener("dispose",s);const l=e.get(o);l!==void 0&&(e.delete(o),l.dispose())}function r(){e=new WeakMap}return{get:n,dispose:r}}const Wi=4,ec=[.125,.215,.35,.446,.526,.582],mi=20,fa=new qo,tc=new Oe;let pa=null,ma=0,ga=0,_a=!1;const fi=(1+Math.sqrt(5))/2,Fi=1/fi,nc=[new L(-fi,Fi,0),new L(fi,Fi,0),new L(-Fi,0,fi),new L(Fi,0,fi),new L(0,fi,-Fi),new L(0,fi,Fi),new L(-1,1,-1),new L(1,1,-1),new L(-1,1,1),new L(1,1,1)],Cg=new L;class So{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,t=0,n=.1,s=100,r={}){const{size:a=256,position:o=Cg}=r;pa=this._renderer.getRenderTarget(),ma=this._renderer.getActiveCubeFace(),ga=this._renderer.getActiveMipmapLevel(),_a=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(a);const l=this._allocateTargets();return l.depthBuffer=!0,this._sceneToCubeUV(e,n,s,l,o),t>0&&this._blur(l,0,0,t),this._applyPMREM(l),this._cleanup(l),l}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=rc(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=sc(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(pa,ma,ga),this._renderer.xr.enabled=_a,e.scissorTest=!1,hr(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===ns||e.mapping===is?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),pa=this._renderer.getRenderTarget(),ma=this._renderer.getActiveCubeFace(),ga=this._renderer.getActiveMipmapLevel(),_a=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){const e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:tn,minFilter:tn,generateMipmaps:!1,type:Os,format:fn,colorSpace:ss,depthBuffer:!1},s=ic(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=ic(e,t,n);const{_lodMax:r}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=Pg(r)),this._blurMaterial=Lg(r,e,t)}return s}_compileMaterial(e){const t=new ht(this._lodPlanes[0],e);this._renderer.compile(t,fa)}_sceneToCubeUV(e,t,n,s,r){const l=new Ht(90,1,t,n),c=[1,-1,1,1,1,1],h=[1,1,1,-1,-1,-1],u=this._renderer,f=u.autoClear,p=u.toneMapping;u.getClearColor(tc),u.toneMapping=Qn,u.autoClear=!1,u.state.buffers.depth.getReversed()&&(u.setRenderTarget(s),u.clearDepth(),u.setRenderTarget(null));const _=new Qt({name:"PMREM.Background",side:Ut,depthWrite:!1,depthTest:!1}),m=new ht(new dt,_);let d=!1;const b=e.background;b?b.isColor&&(_.color.copy(b),e.background=null,d=!0):(_.color.copy(tc),d=!0);for(let E=0;E<6;E++){const M=E%3;M===0?(l.up.set(0,c[E],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x+h[E],r.y,r.z)):M===1?(l.up.set(0,0,c[E]),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y+h[E],r.z)):(l.up.set(0,c[E],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y,r.z+h[E]));const w=this._cubeSize;hr(s,M*w,E>2?w:0,w,w),u.setRenderTarget(s),d&&u.render(m,l),u.render(e,l)}m.geometry.dispose(),m.material.dispose(),u.toneMapping=p,u.autoClear=f,e.background=b}_textureToCubeUV(e,t){const n=this._renderer,s=e.mapping===ns||e.mapping===is;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=rc()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=sc());const r=s?this._cubemapMaterial:this._equirectMaterial,a=new ht(this._lodPlanes[0],r),o=r.uniforms;o.envMap.value=e;const l=this._cubeSize;hr(t,0,0,3*l,2*l),n.setRenderTarget(t),n.render(a,fa)}_applyPMREM(e){const t=this._renderer,n=t.autoClear;t.autoClear=!1;const s=this._lodPlanes.length;for(let r=1;r<s;r++){const a=Math.sqrt(this._sigmas[r]*this._sigmas[r]-this._sigmas[r-1]*this._sigmas[r-1]),o=nc[(s-r-1)%nc.length];this._blur(e,r-1,r,a,o)}t.autoClear=n}_blur(e,t,n,s,r){const a=this._pingPongRenderTarget;this._halfBlur(e,a,t,n,s,"latitudinal",r),this._halfBlur(a,e,n,n,s,"longitudinal",r)}_halfBlur(e,t,n,s,r,a,o){const l=this._renderer,c=this._blurMaterial;a!=="latitudinal"&&a!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");const h=3,u=new ht(this._lodPlanes[s],c),f=c.uniforms,p=this._sizeLods[n]-1,g=isFinite(r)?Math.PI/(2*p):2*Math.PI/(2*mi-1),_=r/g,m=isFinite(r)?1+Math.floor(h*_):mi;m>mi&&console.warn(`sigmaRadians, ${r}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${mi}`);const d=[];let b=0;for(let C=0;C<mi;++C){const D=C/_,S=Math.exp(-D*D/2);d.push(S),C===0?b+=S:C<m&&(b+=2*S)}for(let C=0;C<d.length;C++)d[C]=d[C]/b;f.envMap.value=e.texture,f.samples.value=m,f.weights.value=d,f.latitudinal.value=a==="latitudinal",o&&(f.poleAxis.value=o);const{_lodMax:E}=this;f.dTheta.value=g,f.mipInt.value=E-n;const M=this._sizeLods[s],w=3*M*(s>E-Wi?s-E+Wi:0),A=4*(this._cubeSize-M);hr(t,w,A,3*M,2*M),l.setRenderTarget(t),l.render(u,fa)}}function Pg(i){const e=[],t=[],n=[];let s=i;const r=i-Wi+1+ec.length;for(let a=0;a<r;a++){const o=Math.pow(2,s);t.push(o);let l=1/o;a>i-Wi?l=ec[a-i+Wi-1]:a===0&&(l=0),n.push(l);const c=1/(o-2),h=-c,u=1+c,f=[h,h,u,h,u,u,h,h,u,u,h,u],p=6,g=6,_=3,m=2,d=1,b=new Float32Array(_*g*p),E=new Float32Array(m*g*p),M=new Float32Array(d*g*p);for(let A=0;A<p;A++){const C=A%3*2/3-1,D=A>2?0:-1,S=[C,D,0,C+2/3,D,0,C+2/3,D+1,0,C,D,0,C+2/3,D+1,0,C,D+1,0];b.set(S,_*g*A),E.set(f,m*g*A);const y=[A,A,A,A,A,A];M.set(y,d*g*A)}const w=new vt;w.setAttribute("position",new Ft(b,_)),w.setAttribute("uv",new Ft(E,m)),w.setAttribute("faceIndex",new Ft(M,d)),e.push(w),s>Wi&&s--}return{lodPlanes:e,sizeLods:t,sigmas:n}}function ic(i,e,t){const n=new ti(i,e,t);return n.texture.mapping=Lr,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function hr(i,e,t,n,s){i.viewport.set(e,t,n,s),i.scissor.set(e,t,n,s)}function Lg(i,e,t){const n=new Float32Array(mi),s=new L(0,1,0);return new ni({name:"SphericalGaussianBlur",defines:{n:mi,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:n},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:s}},vertexShader:Xo(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:Jn,depthTest:!1,depthWrite:!1})}function sc(){return new ni({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Xo(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:Jn,depthTest:!1,depthWrite:!1})}function rc(){return new ni({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Xo(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Jn,depthTest:!1,depthWrite:!1})}function Xo(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function Dg(i){let e=new WeakMap,t=null;function n(o){if(o&&o.isTexture){const l=o.mapping,c=l===Ha||l===ka,h=l===ns||l===is;if(c||h){let u=e.get(o);const f=u!==void 0?u.texture.pmremVersion:0;if(o.isRenderTargetTexture&&o.pmremVersion!==f)return t===null&&(t=new So(i)),u=c?t.fromEquirectangular(o,u):t.fromCubemap(o,u),u.texture.pmremVersion=o.pmremVersion,e.set(o,u),u.texture;if(u!==void 0)return u.texture;{const p=o.image;return c&&p&&p.height>0||h&&p&&s(p)?(t===null&&(t=new So(i)),u=c?t.fromEquirectangular(o):t.fromCubemap(o),u.texture.pmremVersion=o.pmremVersion,e.set(o,u),o.addEventListener("dispose",r),u.texture):null}}}return o}function s(o){let l=0;const c=6;for(let h=0;h<c;h++)o[h]!==void 0&&l++;return l===c}function r(o){const l=o.target;l.removeEventListener("dispose",r);const c=e.get(l);c!==void 0&&(e.delete(l),c.dispose())}function a(){e=new WeakMap,t!==null&&(t.dispose(),t=null)}return{get:n,dispose:a}}function Ig(i){const e={};function t(n){if(e[n]!==void 0)return e[n];let s;switch(n){case"WEBGL_depth_texture":s=i.getExtension("WEBGL_depth_texture")||i.getExtension("MOZ_WEBGL_depth_texture")||i.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":s=i.getExtension("EXT_texture_filter_anisotropic")||i.getExtension("MOZ_EXT_texture_filter_anisotropic")||i.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":s=i.getExtension("WEBGL_compressed_texture_s3tc")||i.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":s=i.getExtension("WEBGL_compressed_texture_pvrtc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:s=i.getExtension(n)}return e[n]=s,s}return{has:function(n){return t(n)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(n){const s=t(n);return s===null&&Ds("THREE.WebGLRenderer: "+n+" extension not supported."),s}}}function Og(i,e,t,n){const s={},r=new WeakMap;function a(u){const f=u.target;f.index!==null&&e.remove(f.index);for(const g in f.attributes)e.remove(f.attributes[g]);f.removeEventListener("dispose",a),delete s[f.id];const p=r.get(f);p&&(e.remove(p),r.delete(f)),n.releaseStatesOfGeometry(f),f.isInstancedBufferGeometry===!0&&delete f._maxInstanceCount,t.memory.geometries--}function o(u,f){return s[f.id]===!0||(f.addEventListener("dispose",a),s[f.id]=!0,t.memory.geometries++),f}function l(u){const f=u.attributes;for(const p in f)e.update(f[p],i.ARRAY_BUFFER)}function c(u){const f=[],p=u.index,g=u.attributes.position;let _=0;if(p!==null){const b=p.array;_=p.version;for(let E=0,M=b.length;E<M;E+=3){const w=b[E+0],A=b[E+1],C=b[E+2];f.push(w,A,A,C,C,w)}}else if(g!==void 0){const b=g.array;_=g.version;for(let E=0,M=b.length/3-1;E<M;E+=3){const w=E+0,A=E+1,C=E+2;f.push(w,A,A,C,C,w)}}else return;const m=new(ch(f)?mh:ph)(f,1);m.version=_;const d=r.get(u);d&&e.remove(d),r.set(u,m)}function h(u){const f=r.get(u);if(f){const p=u.index;p!==null&&f.version<p.version&&c(u)}else c(u);return r.get(u)}return{get:o,update:l,getWireframeAttribute:h}}function Ng(i,e,t){let n;function s(f){n=f}let r,a;function o(f){r=f.type,a=f.bytesPerElement}function l(f,p){i.drawElements(n,p,r,f*a),t.update(p,n,1)}function c(f,p,g){g!==0&&(i.drawElementsInstanced(n,p,r,f*a,g),t.update(p,n,g))}function h(f,p,g){if(g===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,p,0,r,f,0,g);let m=0;for(let d=0;d<g;d++)m+=p[d];t.update(m,n,1)}function u(f,p,g,_){if(g===0)return;const m=e.get("WEBGL_multi_draw");if(m===null)for(let d=0;d<f.length;d++)c(f[d]/a,p[d],_[d]);else{m.multiDrawElementsInstancedWEBGL(n,p,0,r,f,0,_,0,g);let d=0;for(let b=0;b<g;b++)d+=p[b]*_[b];t.update(d,n,1)}}this.setMode=s,this.setIndex=o,this.render=l,this.renderInstances=c,this.renderMultiDraw=h,this.renderMultiDrawInstances=u}function Fg(i){const e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,a,o){switch(t.calls++,a){case i.TRIANGLES:t.triangles+=o*(r/3);break;case i.LINES:t.lines+=o*(r/2);break;case i.LINE_STRIP:t.lines+=o*(r-1);break;case i.LINE_LOOP:t.lines+=o*r;break;case i.POINTS:t.points+=o*r;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",a);break}}function s(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:s,update:n}}function Ug(i,e,t){const n=new WeakMap,s=new Qe;function r(a,o,l){const c=a.morphTargetInfluences,h=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,u=h!==void 0?h.length:0;let f=n.get(o);if(f===void 0||f.count!==u){let y=function(){D.dispose(),n.delete(o),o.removeEventListener("dispose",y)};var p=y;f!==void 0&&f.texture.dispose();const g=o.morphAttributes.position!==void 0,_=o.morphAttributes.normal!==void 0,m=o.morphAttributes.color!==void 0,d=o.morphAttributes.position||[],b=o.morphAttributes.normal||[],E=o.morphAttributes.color||[];let M=0;g===!0&&(M=1),_===!0&&(M=2),m===!0&&(M=3);let w=o.attributes.position.count*M,A=1;w>e.maxTextureSize&&(A=Math.ceil(w/e.maxTextureSize),w=e.maxTextureSize);const C=new Float32Array(w*A*4*u),D=new hh(C,w,A,u);D.type=Sn,D.needsUpdate=!0;const S=M*4;for(let P=0;P<u;P++){const N=d[P],z=b[P],q=E[P],G=w*A*4*P;for(let V=0;V<N.count;V++){const $=V*S;g===!0&&(s.fromBufferAttribute(N,V),C[G+$+0]=s.x,C[G+$+1]=s.y,C[G+$+2]=s.z,C[G+$+3]=0),_===!0&&(s.fromBufferAttribute(z,V),C[G+$+4]=s.x,C[G+$+5]=s.y,C[G+$+6]=s.z,C[G+$+7]=0),m===!0&&(s.fromBufferAttribute(q,V),C[G+$+8]=s.x,C[G+$+9]=s.y,C[G+$+10]=s.z,C[G+$+11]=q.itemSize===4?s.w:1)}}f={count:u,texture:D,size:new Ve(w,A)},n.set(o,f),o.addEventListener("dispose",y)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)l.getUniforms().setValue(i,"morphTexture",a.morphTexture,t);else{let g=0;for(let m=0;m<c.length;m++)g+=c[m];const _=o.morphTargetsRelative?1:1-g;l.getUniforms().setValue(i,"morphTargetBaseInfluence",_),l.getUniforms().setValue(i,"morphTargetInfluences",c)}l.getUniforms().setValue(i,"morphTargetsTexture",f.texture,t),l.getUniforms().setValue(i,"morphTargetsTextureSize",f.size)}return{update:r}}function zg(i,e,t,n){let s=new WeakMap;function r(l){const c=n.render.frame,h=l.geometry,u=e.get(l,h);if(s.get(u)!==c&&(e.update(u),s.set(u,c)),l.isInstancedMesh&&(l.hasEventListener("dispose",o)===!1&&l.addEventListener("dispose",o),s.get(l)!==c&&(t.update(l.instanceMatrix,i.ARRAY_BUFFER),l.instanceColor!==null&&t.update(l.instanceColor,i.ARRAY_BUFFER),s.set(l,c))),l.isSkinnedMesh){const f=l.skeleton;s.get(f)!==c&&(f.update(),s.set(f,c))}return u}function a(){s=new WeakMap}function o(l){const c=l.target;c.removeEventListener("dispose",o),t.remove(c.instanceMatrix),c.instanceColor!==null&&t.remove(c.instanceColor)}return{update:r,dispose:a}}const Mh=new Rt,ac=new xh(1,1),yh=new hh,bh=new of,Eh=new _h,oc=[],lc=[],cc=new Float32Array(16),hc=new Float32Array(9),uc=new Float32Array(4);function hs(i,e,t){const n=i[0];if(n<=0||n>0)return i;const s=e*t;let r=oc[s];if(r===void 0&&(r=new Float32Array(s),oc[s]=r),e!==0){n.toArray(r,0);for(let a=1,o=0;a!==e;++a)o+=t,i[a].toArray(r,o)}return r}function gt(i,e){if(i.length!==e.length)return!1;for(let t=0,n=i.length;t<n;t++)if(i[t]!==e[t])return!1;return!0}function _t(i,e){for(let t=0,n=e.length;t<n;t++)i[t]=e[t]}function Ir(i,e){let t=lc[e];t===void 0&&(t=new Int32Array(e),lc[e]=t);for(let n=0;n!==e;++n)t[n]=i.allocateTextureUnit();return t}function Bg(i,e){const t=this.cache;t[0]!==e&&(i.uniform1f(this.addr,e),t[0]=e)}function Hg(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(gt(t,e))return;i.uniform2fv(this.addr,e),_t(t,e)}}function kg(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(i.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(gt(t,e))return;i.uniform3fv(this.addr,e),_t(t,e)}}function Gg(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(gt(t,e))return;i.uniform4fv(this.addr,e),_t(t,e)}}function Vg(i,e){const t=this.cache,n=e.elements;if(n===void 0){if(gt(t,e))return;i.uniformMatrix2fv(this.addr,!1,e),_t(t,e)}else{if(gt(t,n))return;uc.set(n),i.uniformMatrix2fv(this.addr,!1,uc),_t(t,n)}}function Wg(i,e){const t=this.cache,n=e.elements;if(n===void 0){if(gt(t,e))return;i.uniformMatrix3fv(this.addr,!1,e),_t(t,e)}else{if(gt(t,n))return;hc.set(n),i.uniformMatrix3fv(this.addr,!1,hc),_t(t,n)}}function qg(i,e){const t=this.cache,n=e.elements;if(n===void 0){if(gt(t,e))return;i.uniformMatrix4fv(this.addr,!1,e),_t(t,e)}else{if(gt(t,n))return;cc.set(n),i.uniformMatrix4fv(this.addr,!1,cc),_t(t,n)}}function Xg(i,e){const t=this.cache;t[0]!==e&&(i.uniform1i(this.addr,e),t[0]=e)}function jg(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(gt(t,e))return;i.uniform2iv(this.addr,e),_t(t,e)}}function Yg(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(gt(t,e))return;i.uniform3iv(this.addr,e),_t(t,e)}}function $g(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(gt(t,e))return;i.uniform4iv(this.addr,e),_t(t,e)}}function Kg(i,e){const t=this.cache;t[0]!==e&&(i.uniform1ui(this.addr,e),t[0]=e)}function Zg(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(gt(t,e))return;i.uniform2uiv(this.addr,e),_t(t,e)}}function Jg(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(gt(t,e))return;i.uniform3uiv(this.addr,e),_t(t,e)}}function Qg(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(gt(t,e))return;i.uniform4uiv(this.addr,e),_t(t,e)}}function e0(i,e,t){const n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);let r;this.type===i.SAMPLER_2D_SHADOW?(ac.compareFunction=lh,r=ac):r=Mh,t.setTexture2D(e||r,s)}function t0(i,e,t){const n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture3D(e||bh,s)}function n0(i,e,t){const n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTextureCube(e||Eh,s)}function i0(i,e,t){const n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture2DArray(e||yh,s)}function s0(i){switch(i){case 5126:return Bg;case 35664:return Hg;case 35665:return kg;case 35666:return Gg;case 35674:return Vg;case 35675:return Wg;case 35676:return qg;case 5124:case 35670:return Xg;case 35667:case 35671:return jg;case 35668:case 35672:return Yg;case 35669:case 35673:return $g;case 5125:return Kg;case 36294:return Zg;case 36295:return Jg;case 36296:return Qg;case 35678:case 36198:case 36298:case 36306:case 35682:return e0;case 35679:case 36299:case 36307:return t0;case 35680:case 36300:case 36308:case 36293:return n0;case 36289:case 36303:case 36311:case 36292:return i0}}function r0(i,e){i.uniform1fv(this.addr,e)}function a0(i,e){const t=hs(e,this.size,2);i.uniform2fv(this.addr,t)}function o0(i,e){const t=hs(e,this.size,3);i.uniform3fv(this.addr,t)}function l0(i,e){const t=hs(e,this.size,4);i.uniform4fv(this.addr,t)}function c0(i,e){const t=hs(e,this.size,4);i.uniformMatrix2fv(this.addr,!1,t)}function h0(i,e){const t=hs(e,this.size,9);i.uniformMatrix3fv(this.addr,!1,t)}function u0(i,e){const t=hs(e,this.size,16);i.uniformMatrix4fv(this.addr,!1,t)}function d0(i,e){i.uniform1iv(this.addr,e)}function f0(i,e){i.uniform2iv(this.addr,e)}function p0(i,e){i.uniform3iv(this.addr,e)}function m0(i,e){i.uniform4iv(this.addr,e)}function g0(i,e){i.uniform1uiv(this.addr,e)}function _0(i,e){i.uniform2uiv(this.addr,e)}function x0(i,e){i.uniform3uiv(this.addr,e)}function S0(i,e){i.uniform4uiv(this.addr,e)}function v0(i,e,t){const n=this.cache,s=e.length,r=Ir(t,s);gt(n,r)||(i.uniform1iv(this.addr,r),_t(n,r));for(let a=0;a!==s;++a)t.setTexture2D(e[a]||Mh,r[a])}function M0(i,e,t){const n=this.cache,s=e.length,r=Ir(t,s);gt(n,r)||(i.uniform1iv(this.addr,r),_t(n,r));for(let a=0;a!==s;++a)t.setTexture3D(e[a]||bh,r[a])}function y0(i,e,t){const n=this.cache,s=e.length,r=Ir(t,s);gt(n,r)||(i.uniform1iv(this.addr,r),_t(n,r));for(let a=0;a!==s;++a)t.setTextureCube(e[a]||Eh,r[a])}function b0(i,e,t){const n=this.cache,s=e.length,r=Ir(t,s);gt(n,r)||(i.uniform1iv(this.addr,r),_t(n,r));for(let a=0;a!==s;++a)t.setTexture2DArray(e[a]||yh,r[a])}function E0(i){switch(i){case 5126:return r0;case 35664:return a0;case 35665:return o0;case 35666:return l0;case 35674:return c0;case 35675:return h0;case 35676:return u0;case 5124:case 35670:return d0;case 35667:case 35671:return f0;case 35668:case 35672:return p0;case 35669:case 35673:return m0;case 5125:return g0;case 36294:return _0;case 36295:return x0;case 36296:return S0;case 35678:case 36198:case 36298:case 36306:case 35682:return v0;case 35679:case 36299:case 36307:return M0;case 35680:case 36300:case 36308:case 36293:return y0;case 36289:case 36303:case 36311:case 36292:return b0}}class T0{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=s0(t.type)}}class w0{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=E0(t.type)}}class A0{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){const s=this.seq;for(let r=0,a=s.length;r!==a;++r){const o=s[r];o.setValue(e,t[o.id],n)}}}const xa=/(\w+)(\])?(\[|\.)?/g;function dc(i,e){i.seq.push(e),i.map[e.id]=e}function R0(i,e,t){const n=i.name,s=n.length;for(xa.lastIndex=0;;){const r=xa.exec(n),a=xa.lastIndex;let o=r[1];const l=r[2]==="]",c=r[3];if(l&&(o=o|0),c===void 0||c==="["&&a+2===s){dc(t,c===void 0?new T0(o,i,e):new w0(o,i,e));break}else{let u=t.map[o];u===void 0&&(u=new A0(o),dc(t,u)),t=u}}}class Mr{constructor(e,t){this.seq=[],this.map={};const n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let s=0;s<n;++s){const r=e.getActiveUniform(t,s),a=e.getUniformLocation(t,r.name);R0(r,a,this)}}setValue(e,t,n,s){const r=this.map[t];r!==void 0&&r.setValue(e,n,s)}setOptional(e,t,n){const s=t[n];s!==void 0&&this.setValue(e,n,s)}static upload(e,t,n,s){for(let r=0,a=t.length;r!==a;++r){const o=t[r],l=n[o.id];l.needsUpdate!==!1&&o.setValue(e,l.value,s)}}static seqWithValue(e,t){const n=[];for(let s=0,r=e.length;s!==r;++s){const a=e[s];a.id in t&&n.push(a)}return n}}function fc(i,e,t){const n=i.createShader(e);return i.shaderSource(n,t),i.compileShader(n),n}const C0=37297;let P0=0;function L0(i,e){const t=i.split(`
`),n=[],s=Math.max(e-6,0),r=Math.min(e+6,t.length);for(let a=s;a<r;a++){const o=a+1;n.push(`${o===e?">":" "} ${o}: ${t[a]}`)}return n.join(`
`)}const pc=new Be;function D0(i){$e._getMatrix(pc,$e.workingColorSpace,i);const e=`mat3( ${pc.elements.map(t=>t.toFixed(4))} )`;switch($e.getTransfer(i)){case Tr:return[e,"LinearTransferOETF"];case Je:return[e,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space: ",i),[e,"LinearTransferOETF"]}}function mc(i,e,t){const n=i.getShaderParameter(e,i.COMPILE_STATUS),r=(i.getShaderInfoLog(e)||"").trim();if(n&&r==="")return"";const a=/ERROR: 0:(\d+)/.exec(r);if(a){const o=parseInt(a[1]);return t.toUpperCase()+`

`+r+`

`+L0(i.getShaderSource(e),o)}else return r}function I0(i,e){const t=D0(e);return[`vec4 ${i}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}function O0(i,e){let t;switch(e){case Sd:t="Linear";break;case vd:t="Reinhard";break;case Md:t="Cineon";break;case Qc:t="ACESFilmic";break;case bd:t="AgX";break;case Ed:t="Neutral";break;case yd:t="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",e),t="Linear"}return"vec3 "+i+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}const ur=new L;function N0(){$e.getLuminanceCoefficients(ur);const i=ur.x.toFixed(4),e=ur.y.toFixed(4),t=ur.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${i}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function F0(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(bs).join(`
`)}function U0(i){const e=[];for(const t in i){const n=i[t];n!==!1&&e.push("#define "+t+" "+n)}return e.join(`
`)}function z0(i,e){const t={},n=i.getProgramParameter(e,i.ACTIVE_ATTRIBUTES);for(let s=0;s<n;s++){const r=i.getActiveAttrib(e,s),a=r.name;let o=1;r.type===i.FLOAT_MAT2&&(o=2),r.type===i.FLOAT_MAT3&&(o=3),r.type===i.FLOAT_MAT4&&(o=4),t[a]={type:r.type,location:i.getAttribLocation(e,a),locationSize:o}}return t}function bs(i){return i!==""}function gc(i,e){const t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return i.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function _c(i,e){return i.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}const B0=/^[ \t]*#include +<([\w\d./]+)>/gm;function vo(i){return i.replace(B0,k0)}const H0=new Map;function k0(i,e){let t=Ge[e];if(t===void 0){const n=H0.get(e);if(n!==void 0)t=Ge[n],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,n);else throw new Error("Can not resolve #include <"+e+">")}return vo(t)}const G0=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function xc(i){return i.replace(G0,V0)}function V0(i,e,t,n){let s="";for(let r=parseInt(e);r<parseInt(t);r++)s+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function Sc(i){let e=`precision ${i.precision} float;
	precision ${i.precision} int;
	precision ${i.precision} sampler2D;
	precision ${i.precision} samplerCube;
	precision ${i.precision} sampler3D;
	precision ${i.precision} sampler2DArray;
	precision ${i.precision} sampler2DShadow;
	precision ${i.precision} samplerCubeShadow;
	precision ${i.precision} sampler2DArrayShadow;
	precision ${i.precision} isampler2D;
	precision ${i.precision} isampler3D;
	precision ${i.precision} isamplerCube;
	precision ${i.precision} isampler2DArray;
	precision ${i.precision} usampler2D;
	precision ${i.precision} usampler3D;
	precision ${i.precision} usamplerCube;
	precision ${i.precision} usampler2DArray;
	`;return i.precision==="highp"?e+=`
#define HIGH_PRECISION`:i.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:i.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}function W0(i){let e="SHADOWMAP_TYPE_BASIC";return i.shadowMapType===Zc?e="SHADOWMAP_TYPE_PCF":i.shadowMapType===Jc?e="SHADOWMAP_TYPE_PCF_SOFT":i.shadowMapType===Pn&&(e="SHADOWMAP_TYPE_VSM"),e}function q0(i){let e="ENVMAP_TYPE_CUBE";if(i.envMap)switch(i.envMapMode){case ns:case is:e="ENVMAP_TYPE_CUBE";break;case Lr:e="ENVMAP_TYPE_CUBE_UV";break}return e}function X0(i){let e="ENVMAP_MODE_REFLECTION";return i.envMap&&i.envMapMode===is&&(e="ENVMAP_MODE_REFRACTION"),e}function j0(i){let e="ENVMAP_BLENDING_NONE";if(i.envMap)switch(i.combine){case wo:e="ENVMAP_BLENDING_MULTIPLY";break;case _d:e="ENVMAP_BLENDING_MIX";break;case xd:e="ENVMAP_BLENDING_ADD";break}return e}function Y0(i){const e=i.envMapCubeUVHeight;if(e===null)return null;const t=Math.log2(e)-2,n=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:n,maxMip:t}}function $0(i,e,t,n){const s=i.getContext(),r=t.defines;let a=t.vertexShader,o=t.fragmentShader;const l=W0(t),c=q0(t),h=X0(t),u=j0(t),f=Y0(t),p=F0(t),g=U0(r),_=s.createProgram();let m,d,b=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(m=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(bs).join(`
`),m.length>0&&(m+=`
`),d=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(bs).join(`
`),d.length>0&&(d+=`
`)):(m=[Sc(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+h:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(bs).join(`
`),d=[Sc(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+c:"",t.envMap?"#define "+h:"",t.envMap?"#define "+u:"",f?"#define CUBEUV_TEXEL_WIDTH "+f.texelWidth:"",f?"#define CUBEUV_TEXEL_HEIGHT "+f.texelHeight:"",f?"#define CUBEUV_MAX_MIP "+f.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor||t.batchingColor?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==Qn?"#define TONE_MAPPING":"",t.toneMapping!==Qn?Ge.tonemapping_pars_fragment:"",t.toneMapping!==Qn?O0("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",Ge.colorspace_pars_fragment,I0("linearToOutputTexel",t.outputColorSpace),N0(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(bs).join(`
`)),a=vo(a),a=gc(a,t),a=_c(a,t),o=vo(o),o=gc(o,t),o=_c(o,t),a=xc(a),o=xc(o),t.isRawShaderMaterial!==!0&&(b=`#version 300 es
`,m=[p,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,d=["#define varying in",t.glslVersion===Ml?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===Ml?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+d);const E=b+m+a,M=b+d+o,w=fc(s,s.VERTEX_SHADER,E),A=fc(s,s.FRAGMENT_SHADER,M);s.attachShader(_,w),s.attachShader(_,A),t.index0AttributeName!==void 0?s.bindAttribLocation(_,0,t.index0AttributeName):t.morphTargets===!0&&s.bindAttribLocation(_,0,"position"),s.linkProgram(_);function C(P){if(i.debug.checkShaderErrors){const N=s.getProgramInfoLog(_)||"",z=s.getShaderInfoLog(w)||"",q=s.getShaderInfoLog(A)||"",G=N.trim(),V=z.trim(),$=q.trim();let k=!0,ie=!0;if(s.getProgramParameter(_,s.LINK_STATUS)===!1)if(k=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(s,_,w,A);else{const ce=mc(s,w,"vertex"),ue=mc(s,A,"fragment");console.error("THREE.WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(_,s.VALIDATE_STATUS)+`

Material Name: `+P.name+`
Material Type: `+P.type+`

Program Info Log: `+G+`
`+ce+`
`+ue)}else G!==""?console.warn("THREE.WebGLProgram: Program Info Log:",G):(V===""||$==="")&&(ie=!1);ie&&(P.diagnostics={runnable:k,programLog:G,vertexShader:{log:V,prefix:m},fragmentShader:{log:$,prefix:d}})}s.deleteShader(w),s.deleteShader(A),D=new Mr(s,_),S=z0(s,_)}let D;this.getUniforms=function(){return D===void 0&&C(this),D};let S;this.getAttributes=function(){return S===void 0&&C(this),S};let y=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return y===!1&&(y=s.getProgramParameter(_,C0)),y},this.destroy=function(){n.releaseStatesOfProgram(this),s.deleteProgram(_),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=P0++,this.cacheKey=e,this.usedTimes=1,this.program=_,this.vertexShader=w,this.fragmentShader=A,this}let K0=0;class Z0{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){const t=e.vertexShader,n=e.fragmentShader,s=this._getShaderStage(t),r=this._getShaderStage(n),a=this._getShaderCacheForMaterial(e);return a.has(s)===!1&&(a.add(s),s.usedTimes++),a.has(r)===!1&&(a.add(r),r.usedTimes++),this}remove(e){const t=this.materialCache.get(e);for(const n of t)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){const t=this.materialCache;let n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){const t=this.shaderCache;let n=t.get(e);return n===void 0&&(n=new J0(e),t.set(e,n)),n}}class J0{constructor(e){this.id=K0++,this.code=e,this.usedTimes=0}}function Q0(i,e,t,n,s,r,a){const o=new dh,l=new Z0,c=new Set,h=[],u=s.logarithmicDepthBuffer,f=s.vertexTextures;let p=s.precision;const g={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function _(S){return c.add(S),S===0?"uv":`uv${S}`}function m(S,y,P,N,z){const q=N.fog,G=z.geometry,V=S.isMeshStandardMaterial?N.environment:null,$=(S.isMeshStandardMaterial?t:e).get(S.envMap||V),k=$&&$.mapping===Lr?$.image.height:null,ie=g[S.type];S.precision!==null&&(p=s.getMaxPrecision(S.precision),p!==S.precision&&console.warn("THREE.WebGLProgram.getParameters:",S.precision,"not supported, using",p,"instead."));const ce=G.morphAttributes.position||G.morphAttributes.normal||G.morphAttributes.color,ue=ce!==void 0?ce.length:0;let Ie=0;G.morphAttributes.position!==void 0&&(Ie=1),G.morphAttributes.normal!==void 0&&(Ie=2),G.morphAttributes.color!==void 0&&(Ie=3);let Ue,je,He,j;if(ie){const Ke=xn[ie];Ue=Ke.vertexShader,je=Ke.fragmentShader}else Ue=S.vertexShader,je=S.fragmentShader,l.update(S),He=l.getVertexShaderID(S),j=l.getFragmentShaderID(S);const K=i.getRenderTarget(),oe=i.state.buffers.depth.getReversed(),Te=z.isInstancedMesh===!0,re=z.isBatchedMesh===!0,pe=!!S.map,Ce=!!S.matcap,R=!!$,ke=!!S.aoMap,we=!!S.lightMap,xe=!!S.bumpMap,de=!!S.normalMap,et=!!S.displacementMap,_e=!!S.emissiveMap,Ne=!!S.metalnessMap,lt=!!S.roughnessMap,st=S.anisotropy>0,T=S.clearcoat>0,x=S.dispersion>0,U=S.iridescence>0,X=S.sheen>0,Z=S.transmission>0,W=st&&!!S.anisotropyMap,Ee=T&&!!S.clearcoatMap,ne=T&&!!S.clearcoatNormalMap,Me=T&&!!S.clearcoatRoughnessMap,ye=U&&!!S.iridescenceMap,ee=U&&!!S.iridescenceThicknessMap,fe=X&&!!S.sheenColorMap,Le=X&&!!S.sheenRoughnessMap,be=!!S.specularMap,le=!!S.specularColorMap,ze=!!S.specularIntensityMap,I=Z&&!!S.transmissionMap,te=Z&&!!S.thicknessMap,se=!!S.gradientMap,ge=!!S.alphaMap,J=S.alphaTest>0,Y=!!S.alphaHash,ve=!!S.extensions;let Fe=Qn;S.toneMapped&&(K===null||K.isXRRenderTarget===!0)&&(Fe=i.toneMapping);const it={shaderID:ie,shaderType:S.type,shaderName:S.name,vertexShader:Ue,fragmentShader:je,defines:S.defines,customVertexShaderID:He,customFragmentShaderID:j,isRawShaderMaterial:S.isRawShaderMaterial===!0,glslVersion:S.glslVersion,precision:p,batching:re,batchingColor:re&&z._colorsTexture!==null,instancing:Te,instancingColor:Te&&z.instanceColor!==null,instancingMorph:Te&&z.morphTexture!==null,supportsVertexTextures:f,outputColorSpace:K===null?i.outputColorSpace:K.isXRRenderTarget===!0?K.texture.colorSpace:ss,alphaToCoverage:!!S.alphaToCoverage,map:pe,matcap:Ce,envMap:R,envMapMode:R&&$.mapping,envMapCubeUVHeight:k,aoMap:ke,lightMap:we,bumpMap:xe,normalMap:de,displacementMap:f&&et,emissiveMap:_e,normalMapObjectSpace:de&&S.normalMapType===Rd,normalMapTangentSpace:de&&S.normalMapType===Oo,metalnessMap:Ne,roughnessMap:lt,anisotropy:st,anisotropyMap:W,clearcoat:T,clearcoatMap:Ee,clearcoatNormalMap:ne,clearcoatRoughnessMap:Me,dispersion:x,iridescence:U,iridescenceMap:ye,iridescenceThicknessMap:ee,sheen:X,sheenColorMap:fe,sheenRoughnessMap:Le,specularMap:be,specularColorMap:le,specularIntensityMap:ze,transmission:Z,transmissionMap:I,thicknessMap:te,gradientMap:se,opaque:S.transparent===!1&&S.blending===Qi&&S.alphaToCoverage===!1,alphaMap:ge,alphaTest:J,alphaHash:Y,combine:S.combine,mapUv:pe&&_(S.map.channel),aoMapUv:ke&&_(S.aoMap.channel),lightMapUv:we&&_(S.lightMap.channel),bumpMapUv:xe&&_(S.bumpMap.channel),normalMapUv:de&&_(S.normalMap.channel),displacementMapUv:et&&_(S.displacementMap.channel),emissiveMapUv:_e&&_(S.emissiveMap.channel),metalnessMapUv:Ne&&_(S.metalnessMap.channel),roughnessMapUv:lt&&_(S.roughnessMap.channel),anisotropyMapUv:W&&_(S.anisotropyMap.channel),clearcoatMapUv:Ee&&_(S.clearcoatMap.channel),clearcoatNormalMapUv:ne&&_(S.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:Me&&_(S.clearcoatRoughnessMap.channel),iridescenceMapUv:ye&&_(S.iridescenceMap.channel),iridescenceThicknessMapUv:ee&&_(S.iridescenceThicknessMap.channel),sheenColorMapUv:fe&&_(S.sheenColorMap.channel),sheenRoughnessMapUv:Le&&_(S.sheenRoughnessMap.channel),specularMapUv:be&&_(S.specularMap.channel),specularColorMapUv:le&&_(S.specularColorMap.channel),specularIntensityMapUv:ze&&_(S.specularIntensityMap.channel),transmissionMapUv:I&&_(S.transmissionMap.channel),thicknessMapUv:te&&_(S.thicknessMap.channel),alphaMapUv:ge&&_(S.alphaMap.channel),vertexTangents:!!G.attributes.tangent&&(de||st),vertexColors:S.vertexColors,vertexAlphas:S.vertexColors===!0&&!!G.attributes.color&&G.attributes.color.itemSize===4,pointsUvs:z.isPoints===!0&&!!G.attributes.uv&&(pe||ge),fog:!!q,useFog:S.fog===!0,fogExp2:!!q&&q.isFogExp2,flatShading:S.flatShading===!0&&S.wireframe===!1,sizeAttenuation:S.sizeAttenuation===!0,logarithmicDepthBuffer:u,reversedDepthBuffer:oe,skinning:z.isSkinnedMesh===!0,morphTargets:G.morphAttributes.position!==void 0,morphNormals:G.morphAttributes.normal!==void 0,morphColors:G.morphAttributes.color!==void 0,morphTargetsCount:ue,morphTextureStride:Ie,numDirLights:y.directional.length,numPointLights:y.point.length,numSpotLights:y.spot.length,numSpotLightMaps:y.spotLightMap.length,numRectAreaLights:y.rectArea.length,numHemiLights:y.hemi.length,numDirLightShadows:y.directionalShadowMap.length,numPointLightShadows:y.pointShadowMap.length,numSpotLightShadows:y.spotShadowMap.length,numSpotLightShadowsWithMaps:y.numSpotLightShadowsWithMaps,numLightProbes:y.numLightProbes,numClippingPlanes:a.numPlanes,numClipIntersection:a.numIntersection,dithering:S.dithering,shadowMapEnabled:i.shadowMap.enabled&&P.length>0,shadowMapType:i.shadowMap.type,toneMapping:Fe,decodeVideoTexture:pe&&S.map.isVideoTexture===!0&&$e.getTransfer(S.map.colorSpace)===Je,decodeVideoTextureEmissive:_e&&S.emissiveMap.isVideoTexture===!0&&$e.getTransfer(S.emissiveMap.colorSpace)===Je,premultipliedAlpha:S.premultipliedAlpha,doubleSided:S.side===cn,flipSided:S.side===Ut,useDepthPacking:S.depthPacking>=0,depthPacking:S.depthPacking||0,index0AttributeName:S.index0AttributeName,extensionClipCullDistance:ve&&S.extensions.clipCullDistance===!0&&n.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(ve&&S.extensions.multiDraw===!0||re)&&n.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:n.has("KHR_parallel_shader_compile"),customProgramCacheKey:S.customProgramCacheKey()};return it.vertexUv1s=c.has(1),it.vertexUv2s=c.has(2),it.vertexUv3s=c.has(3),c.clear(),it}function d(S){const y=[];if(S.shaderID?y.push(S.shaderID):(y.push(S.customVertexShaderID),y.push(S.customFragmentShaderID)),S.defines!==void 0)for(const P in S.defines)y.push(P),y.push(S.defines[P]);return S.isRawShaderMaterial===!1&&(b(y,S),E(y,S),y.push(i.outputColorSpace)),y.push(S.customProgramCacheKey),y.join()}function b(S,y){S.push(y.precision),S.push(y.outputColorSpace),S.push(y.envMapMode),S.push(y.envMapCubeUVHeight),S.push(y.mapUv),S.push(y.alphaMapUv),S.push(y.lightMapUv),S.push(y.aoMapUv),S.push(y.bumpMapUv),S.push(y.normalMapUv),S.push(y.displacementMapUv),S.push(y.emissiveMapUv),S.push(y.metalnessMapUv),S.push(y.roughnessMapUv),S.push(y.anisotropyMapUv),S.push(y.clearcoatMapUv),S.push(y.clearcoatNormalMapUv),S.push(y.clearcoatRoughnessMapUv),S.push(y.iridescenceMapUv),S.push(y.iridescenceThicknessMapUv),S.push(y.sheenColorMapUv),S.push(y.sheenRoughnessMapUv),S.push(y.specularMapUv),S.push(y.specularColorMapUv),S.push(y.specularIntensityMapUv),S.push(y.transmissionMapUv),S.push(y.thicknessMapUv),S.push(y.combine),S.push(y.fogExp2),S.push(y.sizeAttenuation),S.push(y.morphTargetsCount),S.push(y.morphAttributeCount),S.push(y.numDirLights),S.push(y.numPointLights),S.push(y.numSpotLights),S.push(y.numSpotLightMaps),S.push(y.numHemiLights),S.push(y.numRectAreaLights),S.push(y.numDirLightShadows),S.push(y.numPointLightShadows),S.push(y.numSpotLightShadows),S.push(y.numSpotLightShadowsWithMaps),S.push(y.numLightProbes),S.push(y.shadowMapType),S.push(y.toneMapping),S.push(y.numClippingPlanes),S.push(y.numClipIntersection),S.push(y.depthPacking)}function E(S,y){o.disableAll(),y.supportsVertexTextures&&o.enable(0),y.instancing&&o.enable(1),y.instancingColor&&o.enable(2),y.instancingMorph&&o.enable(3),y.matcap&&o.enable(4),y.envMap&&o.enable(5),y.normalMapObjectSpace&&o.enable(6),y.normalMapTangentSpace&&o.enable(7),y.clearcoat&&o.enable(8),y.iridescence&&o.enable(9),y.alphaTest&&o.enable(10),y.vertexColors&&o.enable(11),y.vertexAlphas&&o.enable(12),y.vertexUv1s&&o.enable(13),y.vertexUv2s&&o.enable(14),y.vertexUv3s&&o.enable(15),y.vertexTangents&&o.enable(16),y.anisotropy&&o.enable(17),y.alphaHash&&o.enable(18),y.batching&&o.enable(19),y.dispersion&&o.enable(20),y.batchingColor&&o.enable(21),y.gradientMap&&o.enable(22),S.push(o.mask),o.disableAll(),y.fog&&o.enable(0),y.useFog&&o.enable(1),y.flatShading&&o.enable(2),y.logarithmicDepthBuffer&&o.enable(3),y.reversedDepthBuffer&&o.enable(4),y.skinning&&o.enable(5),y.morphTargets&&o.enable(6),y.morphNormals&&o.enable(7),y.morphColors&&o.enable(8),y.premultipliedAlpha&&o.enable(9),y.shadowMapEnabled&&o.enable(10),y.doubleSided&&o.enable(11),y.flipSided&&o.enable(12),y.useDepthPacking&&o.enable(13),y.dithering&&o.enable(14),y.transmission&&o.enable(15),y.sheen&&o.enable(16),y.opaque&&o.enable(17),y.pointsUvs&&o.enable(18),y.decodeVideoTexture&&o.enable(19),y.decodeVideoTextureEmissive&&o.enable(20),y.alphaToCoverage&&o.enable(21),S.push(o.mask)}function M(S){const y=g[S.type];let P;if(y){const N=xn[y];P=vf.clone(N.uniforms)}else P=S.uniforms;return P}function w(S,y){let P;for(let N=0,z=h.length;N<z;N++){const q=h[N];if(q.cacheKey===y){P=q,++P.usedTimes;break}}return P===void 0&&(P=new $0(i,y,S,r),h.push(P)),P}function A(S){if(--S.usedTimes===0){const y=h.indexOf(S);h[y]=h[h.length-1],h.pop(),S.destroy()}}function C(S){l.remove(S)}function D(){l.dispose()}return{getParameters:m,getProgramCacheKey:d,getUniforms:M,acquireProgram:w,releaseProgram:A,releaseShaderCache:C,programs:h,dispose:D}}function e_(){let i=new WeakMap;function e(a){return i.has(a)}function t(a){let o=i.get(a);return o===void 0&&(o={},i.set(a,o)),o}function n(a){i.delete(a)}function s(a,o,l){i.get(a)[o]=l}function r(){i=new WeakMap}return{has:e,get:t,remove:n,update:s,dispose:r}}function t_(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.material.id!==e.material.id?i.material.id-e.material.id:i.z!==e.z?i.z-e.z:i.id-e.id}function vc(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.z!==e.z?e.z-i.z:i.id-e.id}function Mc(){const i=[];let e=0;const t=[],n=[],s=[];function r(){e=0,t.length=0,n.length=0,s.length=0}function a(u,f,p,g,_,m){let d=i[e];return d===void 0?(d={id:u.id,object:u,geometry:f,material:p,groupOrder:g,renderOrder:u.renderOrder,z:_,group:m},i[e]=d):(d.id=u.id,d.object=u,d.geometry=f,d.material=p,d.groupOrder=g,d.renderOrder=u.renderOrder,d.z=_,d.group=m),e++,d}function o(u,f,p,g,_,m){const d=a(u,f,p,g,_,m);p.transmission>0?n.push(d):p.transparent===!0?s.push(d):t.push(d)}function l(u,f,p,g,_,m){const d=a(u,f,p,g,_,m);p.transmission>0?n.unshift(d):p.transparent===!0?s.unshift(d):t.unshift(d)}function c(u,f){t.length>1&&t.sort(u||t_),n.length>1&&n.sort(f||vc),s.length>1&&s.sort(f||vc)}function h(){for(let u=e,f=i.length;u<f;u++){const p=i[u];if(p.id===null)break;p.id=null,p.object=null,p.geometry=null,p.material=null,p.group=null}}return{opaque:t,transmissive:n,transparent:s,init:r,push:o,unshift:l,finish:h,sort:c}}function n_(){let i=new WeakMap;function e(n,s){const r=i.get(n);let a;return r===void 0?(a=new Mc,i.set(n,[a])):s>=r.length?(a=new Mc,r.push(a)):a=r[s],a}function t(){i=new WeakMap}return{get:e,dispose:t}}function i_(){const i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new L,color:new Oe};break;case"SpotLight":t={position:new L,direction:new L,color:new Oe,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new L,color:new Oe,distance:0,decay:0};break;case"HemisphereLight":t={direction:new L,skyColor:new Oe,groundColor:new Oe};break;case"RectAreaLight":t={color:new Oe,position:new L,halfWidth:new L,halfHeight:new L};break}return i[e.id]=t,t}}}function s_(){const i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Ve};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Ve};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Ve,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[e.id]=t,t}}}let r_=0;function a_(i,e){return(e.castShadow?2:0)-(i.castShadow?2:0)+(e.map?1:0)-(i.map?1:0)}function o_(i){const e=new i_,t=s_(),n={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)n.probe.push(new L);const s=new L,r=new Xe,a=new Xe;function o(c){let h=0,u=0,f=0;for(let S=0;S<9;S++)n.probe[S].set(0,0,0);let p=0,g=0,_=0,m=0,d=0,b=0,E=0,M=0,w=0,A=0,C=0;c.sort(a_);for(let S=0,y=c.length;S<y;S++){const P=c[S],N=P.color,z=P.intensity,q=P.distance,G=P.shadow&&P.shadow.map?P.shadow.map.texture:null;if(P.isAmbientLight)h+=N.r*z,u+=N.g*z,f+=N.b*z;else if(P.isLightProbe){for(let V=0;V<9;V++)n.probe[V].addScaledVector(P.sh.coefficients[V],z);C++}else if(P.isDirectionalLight){const V=e.get(P);if(V.color.copy(P.color).multiplyScalar(P.intensity),P.castShadow){const $=P.shadow,k=t.get(P);k.shadowIntensity=$.intensity,k.shadowBias=$.bias,k.shadowNormalBias=$.normalBias,k.shadowRadius=$.radius,k.shadowMapSize=$.mapSize,n.directionalShadow[p]=k,n.directionalShadowMap[p]=G,n.directionalShadowMatrix[p]=P.shadow.matrix,b++}n.directional[p]=V,p++}else if(P.isSpotLight){const V=e.get(P);V.position.setFromMatrixPosition(P.matrixWorld),V.color.copy(N).multiplyScalar(z),V.distance=q,V.coneCos=Math.cos(P.angle),V.penumbraCos=Math.cos(P.angle*(1-P.penumbra)),V.decay=P.decay,n.spot[_]=V;const $=P.shadow;if(P.map&&(n.spotLightMap[w]=P.map,w++,$.updateMatrices(P),P.castShadow&&A++),n.spotLightMatrix[_]=$.matrix,P.castShadow){const k=t.get(P);k.shadowIntensity=$.intensity,k.shadowBias=$.bias,k.shadowNormalBias=$.normalBias,k.shadowRadius=$.radius,k.shadowMapSize=$.mapSize,n.spotShadow[_]=k,n.spotShadowMap[_]=G,M++}_++}else if(P.isRectAreaLight){const V=e.get(P);V.color.copy(N).multiplyScalar(z),V.halfWidth.set(P.width*.5,0,0),V.halfHeight.set(0,P.height*.5,0),n.rectArea[m]=V,m++}else if(P.isPointLight){const V=e.get(P);if(V.color.copy(P.color).multiplyScalar(P.intensity),V.distance=P.distance,V.decay=P.decay,P.castShadow){const $=P.shadow,k=t.get(P);k.shadowIntensity=$.intensity,k.shadowBias=$.bias,k.shadowNormalBias=$.normalBias,k.shadowRadius=$.radius,k.shadowMapSize=$.mapSize,k.shadowCameraNear=$.camera.near,k.shadowCameraFar=$.camera.far,n.pointShadow[g]=k,n.pointShadowMap[g]=G,n.pointShadowMatrix[g]=P.shadow.matrix,E++}n.point[g]=V,g++}else if(P.isHemisphereLight){const V=e.get(P);V.skyColor.copy(P.color).multiplyScalar(z),V.groundColor.copy(P.groundColor).multiplyScalar(z),n.hemi[d]=V,d++}}m>0&&(i.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=ae.LTC_FLOAT_1,n.rectAreaLTC2=ae.LTC_FLOAT_2):(n.rectAreaLTC1=ae.LTC_HALF_1,n.rectAreaLTC2=ae.LTC_HALF_2)),n.ambient[0]=h,n.ambient[1]=u,n.ambient[2]=f;const D=n.hash;(D.directionalLength!==p||D.pointLength!==g||D.spotLength!==_||D.rectAreaLength!==m||D.hemiLength!==d||D.numDirectionalShadows!==b||D.numPointShadows!==E||D.numSpotShadows!==M||D.numSpotMaps!==w||D.numLightProbes!==C)&&(n.directional.length=p,n.spot.length=_,n.rectArea.length=m,n.point.length=g,n.hemi.length=d,n.directionalShadow.length=b,n.directionalShadowMap.length=b,n.pointShadow.length=E,n.pointShadowMap.length=E,n.spotShadow.length=M,n.spotShadowMap.length=M,n.directionalShadowMatrix.length=b,n.pointShadowMatrix.length=E,n.spotLightMatrix.length=M+w-A,n.spotLightMap.length=w,n.numSpotLightShadowsWithMaps=A,n.numLightProbes=C,D.directionalLength=p,D.pointLength=g,D.spotLength=_,D.rectAreaLength=m,D.hemiLength=d,D.numDirectionalShadows=b,D.numPointShadows=E,D.numSpotShadows=M,D.numSpotMaps=w,D.numLightProbes=C,n.version=r_++)}function l(c,h){let u=0,f=0,p=0,g=0,_=0;const m=h.matrixWorldInverse;for(let d=0,b=c.length;d<b;d++){const E=c[d];if(E.isDirectionalLight){const M=n.directional[u];M.direction.setFromMatrixPosition(E.matrixWorld),s.setFromMatrixPosition(E.target.matrixWorld),M.direction.sub(s),M.direction.transformDirection(m),u++}else if(E.isSpotLight){const M=n.spot[p];M.position.setFromMatrixPosition(E.matrixWorld),M.position.applyMatrix4(m),M.direction.setFromMatrixPosition(E.matrixWorld),s.setFromMatrixPosition(E.target.matrixWorld),M.direction.sub(s),M.direction.transformDirection(m),p++}else if(E.isRectAreaLight){const M=n.rectArea[g];M.position.setFromMatrixPosition(E.matrixWorld),M.position.applyMatrix4(m),a.identity(),r.copy(E.matrixWorld),r.premultiply(m),a.extractRotation(r),M.halfWidth.set(E.width*.5,0,0),M.halfHeight.set(0,E.height*.5,0),M.halfWidth.applyMatrix4(a),M.halfHeight.applyMatrix4(a),g++}else if(E.isPointLight){const M=n.point[f];M.position.setFromMatrixPosition(E.matrixWorld),M.position.applyMatrix4(m),f++}else if(E.isHemisphereLight){const M=n.hemi[_];M.direction.setFromMatrixPosition(E.matrixWorld),M.direction.transformDirection(m),_++}}}return{setup:o,setupView:l,state:n}}function yc(i){const e=new o_(i),t=[],n=[];function s(h){c.camera=h,t.length=0,n.length=0}function r(h){t.push(h)}function a(h){n.push(h)}function o(){e.setup(t)}function l(h){e.setupView(t,h)}const c={lightsArray:t,shadowsArray:n,camera:null,lights:e,transmissionRenderTarget:{}};return{init:s,state:c,setupLights:o,setupLightsView:l,pushLight:r,pushShadow:a}}function l_(i){let e=new WeakMap;function t(s,r=0){const a=e.get(s);let o;return a===void 0?(o=new yc(i),e.set(s,[o])):r>=a.length?(o=new yc(i),a.push(o)):o=a[r],o}function n(){e=new WeakMap}return{get:t,dispose:n}}const c_=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,h_=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function u_(i,e,t){let n=new Ho;const s=new Ve,r=new Ve,a=new Qe,o=new If({depthPacking:Ad}),l=new Of,c={},h=t.maxTextureSize,u={[ei]:Ut,[Ut]:ei,[cn]:cn},f=new ni({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Ve},radius:{value:4}},vertexShader:c_,fragmentShader:h_}),p=f.clone();p.defines.HORIZONTAL_PASS=1;const g=new vt;g.setAttribute("position",new Ft(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const _=new ht(g,f),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Zc;let d=this.type;this.render=function(A,C,D){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||A.length===0)return;const S=i.getRenderTarget(),y=i.getActiveCubeFace(),P=i.getActiveMipmapLevel(),N=i.state;N.setBlending(Jn),N.buffers.depth.getReversed()===!0?N.buffers.color.setClear(0,0,0,0):N.buffers.color.setClear(1,1,1,1),N.buffers.depth.setTest(!0),N.setScissorTest(!1);const z=d!==Pn&&this.type===Pn,q=d===Pn&&this.type!==Pn;for(let G=0,V=A.length;G<V;G++){const $=A[G],k=$.shadow;if(k===void 0){console.warn("THREE.WebGLShadowMap:",$,"has no shadow.");continue}if(k.autoUpdate===!1&&k.needsUpdate===!1)continue;s.copy(k.mapSize);const ie=k.getFrameExtents();if(s.multiply(ie),r.copy(k.mapSize),(s.x>h||s.y>h)&&(s.x>h&&(r.x=Math.floor(h/ie.x),s.x=r.x*ie.x,k.mapSize.x=r.x),s.y>h&&(r.y=Math.floor(h/ie.y),s.y=r.y*ie.y,k.mapSize.y=r.y)),k.map===null||z===!0||q===!0){const ue=this.type!==Pn?{minFilter:jt,magFilter:jt}:{};k.map!==null&&k.map.dispose(),k.map=new ti(s.x,s.y,ue),k.map.texture.name=$.name+".shadowMap",k.camera.updateProjectionMatrix()}i.setRenderTarget(k.map),i.clear();const ce=k.getViewportCount();for(let ue=0;ue<ce;ue++){const Ie=k.getViewport(ue);a.set(r.x*Ie.x,r.y*Ie.y,r.x*Ie.z,r.y*Ie.w),N.viewport(a),k.updateMatrices($,ue),n=k.getFrustum(),M(C,D,k.camera,$,this.type)}k.isPointLightShadow!==!0&&this.type===Pn&&b(k,D),k.needsUpdate=!1}d=this.type,m.needsUpdate=!1,i.setRenderTarget(S,y,P)};function b(A,C){const D=e.update(_);f.defines.VSM_SAMPLES!==A.blurSamples&&(f.defines.VSM_SAMPLES=A.blurSamples,p.defines.VSM_SAMPLES=A.blurSamples,f.needsUpdate=!0,p.needsUpdate=!0),A.mapPass===null&&(A.mapPass=new ti(s.x,s.y)),f.uniforms.shadow_pass.value=A.map.texture,f.uniforms.resolution.value=A.mapSize,f.uniforms.radius.value=A.radius,i.setRenderTarget(A.mapPass),i.clear(),i.renderBufferDirect(C,null,D,f,_,null),p.uniforms.shadow_pass.value=A.mapPass.texture,p.uniforms.resolution.value=A.mapSize,p.uniforms.radius.value=A.radius,i.setRenderTarget(A.map),i.clear(),i.renderBufferDirect(C,null,D,p,_,null)}function E(A,C,D,S){let y=null;const P=D.isPointLight===!0?A.customDistanceMaterial:A.customDepthMaterial;if(P!==void 0)y=P;else if(y=D.isPointLight===!0?l:o,i.localClippingEnabled&&C.clipShadows===!0&&Array.isArray(C.clippingPlanes)&&C.clippingPlanes.length!==0||C.displacementMap&&C.displacementScale!==0||C.alphaMap&&C.alphaTest>0||C.map&&C.alphaTest>0||C.alphaToCoverage===!0){const N=y.uuid,z=C.uuid;let q=c[N];q===void 0&&(q={},c[N]=q);let G=q[z];G===void 0&&(G=y.clone(),q[z]=G,C.addEventListener("dispose",w)),y=G}if(y.visible=C.visible,y.wireframe=C.wireframe,S===Pn?y.side=C.shadowSide!==null?C.shadowSide:C.side:y.side=C.shadowSide!==null?C.shadowSide:u[C.side],y.alphaMap=C.alphaMap,y.alphaTest=C.alphaToCoverage===!0?.5:C.alphaTest,y.map=C.map,y.clipShadows=C.clipShadows,y.clippingPlanes=C.clippingPlanes,y.clipIntersection=C.clipIntersection,y.displacementMap=C.displacementMap,y.displacementScale=C.displacementScale,y.displacementBias=C.displacementBias,y.wireframeLinewidth=C.wireframeLinewidth,y.linewidth=C.linewidth,D.isPointLight===!0&&y.isMeshDistanceMaterial===!0){const N=i.properties.get(y);N.light=D}return y}function M(A,C,D,S,y){if(A.visible===!1)return;if(A.layers.test(C.layers)&&(A.isMesh||A.isLine||A.isPoints)&&(A.castShadow||A.receiveShadow&&y===Pn)&&(!A.frustumCulled||n.intersectsObject(A))){A.modelViewMatrix.multiplyMatrices(D.matrixWorldInverse,A.matrixWorld);const z=e.update(A),q=A.material;if(Array.isArray(q)){const G=z.groups;for(let V=0,$=G.length;V<$;V++){const k=G[V],ie=q[k.materialIndex];if(ie&&ie.visible){const ce=E(A,ie,S,y);A.onBeforeShadow(i,A,C,D,z,ce,k),i.renderBufferDirect(D,null,z,ce,A,k),A.onAfterShadow(i,A,C,D,z,ce,k)}}}else if(q.visible){const G=E(A,q,S,y);A.onBeforeShadow(i,A,C,D,z,G,null),i.renderBufferDirect(D,null,z,G,A,null),A.onAfterShadow(i,A,C,D,z,G,null)}}const N=A.children;for(let z=0,q=N.length;z<q;z++)M(N[z],C,D,S,y)}function w(A){A.target.removeEventListener("dispose",w);for(const D in c){const S=c[D],y=A.target.uuid;y in S&&(S[y].dispose(),delete S[y])}}}const d_={[Ia]:Oa,[Na]:za,[Fa]:Ba,[ts]:Ua,[Oa]:Ia,[za]:Na,[Ba]:Fa,[Ua]:ts};function f_(i,e){function t(){let I=!1;const te=new Qe;let se=null;const ge=new Qe(0,0,0,0);return{setMask:function(J){se!==J&&!I&&(i.colorMask(J,J,J,J),se=J)},setLocked:function(J){I=J},setClear:function(J,Y,ve,Fe,it){it===!0&&(J*=Fe,Y*=Fe,ve*=Fe),te.set(J,Y,ve,Fe),ge.equals(te)===!1&&(i.clearColor(J,Y,ve,Fe),ge.copy(te))},reset:function(){I=!1,se=null,ge.set(-1,0,0,0)}}}function n(){let I=!1,te=!1,se=null,ge=null,J=null;return{setReversed:function(Y){if(te!==Y){const ve=e.get("EXT_clip_control");Y?ve.clipControlEXT(ve.LOWER_LEFT_EXT,ve.ZERO_TO_ONE_EXT):ve.clipControlEXT(ve.LOWER_LEFT_EXT,ve.NEGATIVE_ONE_TO_ONE_EXT),te=Y;const Fe=J;J=null,this.setClear(Fe)}},getReversed:function(){return te},setTest:function(Y){Y?K(i.DEPTH_TEST):oe(i.DEPTH_TEST)},setMask:function(Y){se!==Y&&!I&&(i.depthMask(Y),se=Y)},setFunc:function(Y){if(te&&(Y=d_[Y]),ge!==Y){switch(Y){case Ia:i.depthFunc(i.NEVER);break;case Oa:i.depthFunc(i.ALWAYS);break;case Na:i.depthFunc(i.LESS);break;case ts:i.depthFunc(i.LEQUAL);break;case Fa:i.depthFunc(i.EQUAL);break;case Ua:i.depthFunc(i.GEQUAL);break;case za:i.depthFunc(i.GREATER);break;case Ba:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}ge=Y}},setLocked:function(Y){I=Y},setClear:function(Y){J!==Y&&(te&&(Y=1-Y),i.clearDepth(Y),J=Y)},reset:function(){I=!1,se=null,ge=null,J=null,te=!1}}}function s(){let I=!1,te=null,se=null,ge=null,J=null,Y=null,ve=null,Fe=null,it=null;return{setTest:function(Ke){I||(Ke?K(i.STENCIL_TEST):oe(i.STENCIL_TEST))},setMask:function(Ke){te!==Ke&&!I&&(i.stencilMask(Ke),te=Ke)},setFunc:function(Ke,bn,mn){(se!==Ke||ge!==bn||J!==mn)&&(i.stencilFunc(Ke,bn,mn),se=Ke,ge=bn,J=mn)},setOp:function(Ke,bn,mn){(Y!==Ke||ve!==bn||Fe!==mn)&&(i.stencilOp(Ke,bn,mn),Y=Ke,ve=bn,Fe=mn)},setLocked:function(Ke){I=Ke},setClear:function(Ke){it!==Ke&&(i.clearStencil(Ke),it=Ke)},reset:function(){I=!1,te=null,se=null,ge=null,J=null,Y=null,ve=null,Fe=null,it=null}}}const r=new t,a=new n,o=new s,l=new WeakMap,c=new WeakMap;let h={},u={},f=new WeakMap,p=[],g=null,_=!1,m=null,d=null,b=null,E=null,M=null,w=null,A=null,C=new Oe(0,0,0),D=0,S=!1,y=null,P=null,N=null,z=null,q=null;const G=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let V=!1,$=0;const k=i.getParameter(i.VERSION);k.indexOf("WebGL")!==-1?($=parseFloat(/^WebGL (\d)/.exec(k)[1]),V=$>=1):k.indexOf("OpenGL ES")!==-1&&($=parseFloat(/^OpenGL ES (\d)/.exec(k)[1]),V=$>=2);let ie=null,ce={};const ue=i.getParameter(i.SCISSOR_BOX),Ie=i.getParameter(i.VIEWPORT),Ue=new Qe().fromArray(ue),je=new Qe().fromArray(Ie);function He(I,te,se,ge){const J=new Uint8Array(4),Y=i.createTexture();i.bindTexture(I,Y),i.texParameteri(I,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(I,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let ve=0;ve<se;ve++)I===i.TEXTURE_3D||I===i.TEXTURE_2D_ARRAY?i.texImage3D(te,0,i.RGBA,1,1,ge,0,i.RGBA,i.UNSIGNED_BYTE,J):i.texImage2D(te+ve,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,J);return Y}const j={};j[i.TEXTURE_2D]=He(i.TEXTURE_2D,i.TEXTURE_2D,1),j[i.TEXTURE_CUBE_MAP]=He(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),j[i.TEXTURE_2D_ARRAY]=He(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),j[i.TEXTURE_3D]=He(i.TEXTURE_3D,i.TEXTURE_3D,1,1),r.setClear(0,0,0,1),a.setClear(1),o.setClear(0),K(i.DEPTH_TEST),a.setFunc(ts),xe(!1),de(gl),K(i.CULL_FACE),ke(Jn);function K(I){h[I]!==!0&&(i.enable(I),h[I]=!0)}function oe(I){h[I]!==!1&&(i.disable(I),h[I]=!1)}function Te(I,te){return u[I]!==te?(i.bindFramebuffer(I,te),u[I]=te,I===i.DRAW_FRAMEBUFFER&&(u[i.FRAMEBUFFER]=te),I===i.FRAMEBUFFER&&(u[i.DRAW_FRAMEBUFFER]=te),!0):!1}function re(I,te){let se=p,ge=!1;if(I){se=f.get(te),se===void 0&&(se=[],f.set(te,se));const J=I.textures;if(se.length!==J.length||se[0]!==i.COLOR_ATTACHMENT0){for(let Y=0,ve=J.length;Y<ve;Y++)se[Y]=i.COLOR_ATTACHMENT0+Y;se.length=J.length,ge=!0}}else se[0]!==i.BACK&&(se[0]=i.BACK,ge=!0);ge&&i.drawBuffers(se)}function pe(I){return g!==I?(i.useProgram(I),g=I,!0):!1}const Ce={[pi]:i.FUNC_ADD,[ed]:i.FUNC_SUBTRACT,[td]:i.FUNC_REVERSE_SUBTRACT};Ce[nd]=i.MIN,Ce[id]=i.MAX;const R={[sd]:i.ZERO,[rd]:i.ONE,[ad]:i.SRC_COLOR,[La]:i.SRC_ALPHA,[dd]:i.SRC_ALPHA_SATURATE,[hd]:i.DST_COLOR,[ld]:i.DST_ALPHA,[od]:i.ONE_MINUS_SRC_COLOR,[Da]:i.ONE_MINUS_SRC_ALPHA,[ud]:i.ONE_MINUS_DST_COLOR,[cd]:i.ONE_MINUS_DST_ALPHA,[fd]:i.CONSTANT_COLOR,[pd]:i.ONE_MINUS_CONSTANT_COLOR,[md]:i.CONSTANT_ALPHA,[gd]:i.ONE_MINUS_CONSTANT_ALPHA};function ke(I,te,se,ge,J,Y,ve,Fe,it,Ke){if(I===Jn){_===!0&&(oe(i.BLEND),_=!1);return}if(_===!1&&(K(i.BLEND),_=!0),I!==Qu){if(I!==m||Ke!==S){if((d!==pi||M!==pi)&&(i.blendEquation(i.FUNC_ADD),d=pi,M=pi),Ke)switch(I){case Qi:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case Es:i.blendFunc(i.ONE,i.ONE);break;case _l:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case xl:i.blendFuncSeparate(i.DST_COLOR,i.ONE_MINUS_SRC_ALPHA,i.ZERO,i.ONE);break;default:console.error("THREE.WebGLState: Invalid blending: ",I);break}else switch(I){case Qi:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case Es:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE,i.ONE,i.ONE);break;case _l:console.error("THREE.WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case xl:console.error("THREE.WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:console.error("THREE.WebGLState: Invalid blending: ",I);break}b=null,E=null,w=null,A=null,C.set(0,0,0),D=0,m=I,S=Ke}return}J=J||te,Y=Y||se,ve=ve||ge,(te!==d||J!==M)&&(i.blendEquationSeparate(Ce[te],Ce[J]),d=te,M=J),(se!==b||ge!==E||Y!==w||ve!==A)&&(i.blendFuncSeparate(R[se],R[ge],R[Y],R[ve]),b=se,E=ge,w=Y,A=ve),(Fe.equals(C)===!1||it!==D)&&(i.blendColor(Fe.r,Fe.g,Fe.b,it),C.copy(Fe),D=it),m=I,S=!1}function we(I,te){I.side===cn?oe(i.CULL_FACE):K(i.CULL_FACE);let se=I.side===Ut;te&&(se=!se),xe(se),I.blending===Qi&&I.transparent===!1?ke(Jn):ke(I.blending,I.blendEquation,I.blendSrc,I.blendDst,I.blendEquationAlpha,I.blendSrcAlpha,I.blendDstAlpha,I.blendColor,I.blendAlpha,I.premultipliedAlpha),a.setFunc(I.depthFunc),a.setTest(I.depthTest),a.setMask(I.depthWrite),r.setMask(I.colorWrite);const ge=I.stencilWrite;o.setTest(ge),ge&&(o.setMask(I.stencilWriteMask),o.setFunc(I.stencilFunc,I.stencilRef,I.stencilFuncMask),o.setOp(I.stencilFail,I.stencilZFail,I.stencilZPass)),_e(I.polygonOffset,I.polygonOffsetFactor,I.polygonOffsetUnits),I.alphaToCoverage===!0?K(i.SAMPLE_ALPHA_TO_COVERAGE):oe(i.SAMPLE_ALPHA_TO_COVERAGE)}function xe(I){y!==I&&(I?i.frontFace(i.CW):i.frontFace(i.CCW),y=I)}function de(I){I!==Zu?(K(i.CULL_FACE),I!==P&&(I===gl?i.cullFace(i.BACK):I===Ju?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):oe(i.CULL_FACE),P=I}function et(I){I!==N&&(V&&i.lineWidth(I),N=I)}function _e(I,te,se){I?(K(i.POLYGON_OFFSET_FILL),(z!==te||q!==se)&&(i.polygonOffset(te,se),z=te,q=se)):oe(i.POLYGON_OFFSET_FILL)}function Ne(I){I?K(i.SCISSOR_TEST):oe(i.SCISSOR_TEST)}function lt(I){I===void 0&&(I=i.TEXTURE0+G-1),ie!==I&&(i.activeTexture(I),ie=I)}function st(I,te,se){se===void 0&&(ie===null?se=i.TEXTURE0+G-1:se=ie);let ge=ce[se];ge===void 0&&(ge={type:void 0,texture:void 0},ce[se]=ge),(ge.type!==I||ge.texture!==te)&&(ie!==se&&(i.activeTexture(se),ie=se),i.bindTexture(I,te||j[I]),ge.type=I,ge.texture=te)}function T(){const I=ce[ie];I!==void 0&&I.type!==void 0&&(i.bindTexture(I.type,null),I.type=void 0,I.texture=void 0)}function x(){try{i.compressedTexImage2D(...arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function U(){try{i.compressedTexImage3D(...arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function X(){try{i.texSubImage2D(...arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function Z(){try{i.texSubImage3D(...arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function W(){try{i.compressedTexSubImage2D(...arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function Ee(){try{i.compressedTexSubImage3D(...arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function ne(){try{i.texStorage2D(...arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function Me(){try{i.texStorage3D(...arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function ye(){try{i.texImage2D(...arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function ee(){try{i.texImage3D(...arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function fe(I){Ue.equals(I)===!1&&(i.scissor(I.x,I.y,I.z,I.w),Ue.copy(I))}function Le(I){je.equals(I)===!1&&(i.viewport(I.x,I.y,I.z,I.w),je.copy(I))}function be(I,te){let se=c.get(te);se===void 0&&(se=new WeakMap,c.set(te,se));let ge=se.get(I);ge===void 0&&(ge=i.getUniformBlockIndex(te,I.name),se.set(I,ge))}function le(I,te){const ge=c.get(te).get(I);l.get(te)!==ge&&(i.uniformBlockBinding(te,ge,I.__bindingPointIndex),l.set(te,ge))}function ze(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),a.setReversed(!1),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),h={},ie=null,ce={},u={},f=new WeakMap,p=[],g=null,_=!1,m=null,d=null,b=null,E=null,M=null,w=null,A=null,C=new Oe(0,0,0),D=0,S=!1,y=null,P=null,N=null,z=null,q=null,Ue.set(0,0,i.canvas.width,i.canvas.height),je.set(0,0,i.canvas.width,i.canvas.height),r.reset(),a.reset(),o.reset()}return{buffers:{color:r,depth:a,stencil:o},enable:K,disable:oe,bindFramebuffer:Te,drawBuffers:re,useProgram:pe,setBlending:ke,setMaterial:we,setFlipSided:xe,setCullFace:de,setLineWidth:et,setPolygonOffset:_e,setScissorTest:Ne,activeTexture:lt,bindTexture:st,unbindTexture:T,compressedTexImage2D:x,compressedTexImage3D:U,texImage2D:ye,texImage3D:ee,updateUBOMapping:be,uniformBlockBinding:le,texStorage2D:ne,texStorage3D:Me,texSubImage2D:X,texSubImage3D:Z,compressedTexSubImage2D:W,compressedTexSubImage3D:Ee,scissor:fe,viewport:Le,reset:ze}}function p_(i,e,t,n,s,r,a){const o=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new Ve,h=new WeakMap;let u;const f=new WeakMap;let p=!1;try{p=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function g(T,x){return p?new OffscreenCanvas(T,x):Ar("canvas")}function _(T,x,U){let X=1;const Z=st(T);if((Z.width>U||Z.height>U)&&(X=U/Math.max(Z.width,Z.height)),X<1)if(typeof HTMLImageElement<"u"&&T instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&T instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&T instanceof ImageBitmap||typeof VideoFrame<"u"&&T instanceof VideoFrame){const W=Math.floor(X*Z.width),Ee=Math.floor(X*Z.height);u===void 0&&(u=g(W,Ee));const ne=x?g(W,Ee):u;return ne.width=W,ne.height=Ee,ne.getContext("2d").drawImage(T,0,0,W,Ee),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+Z.width+"x"+Z.height+") to ("+W+"x"+Ee+")."),ne}else return"data"in T&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+Z.width+"x"+Z.height+")."),T;return T}function m(T){return T.generateMipmaps}function d(T){i.generateMipmap(T)}function b(T){return T.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:T.isWebGL3DRenderTarget?i.TEXTURE_3D:T.isWebGLArrayRenderTarget||T.isCompressedArrayTexture?i.TEXTURE_2D_ARRAY:i.TEXTURE_2D}function E(T,x,U,X,Z=!1){if(T!==null){if(i[T]!==void 0)return i[T];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+T+"'")}let W=x;if(x===i.RED&&(U===i.FLOAT&&(W=i.R32F),U===i.HALF_FLOAT&&(W=i.R16F),U===i.UNSIGNED_BYTE&&(W=i.R8)),x===i.RED_INTEGER&&(U===i.UNSIGNED_BYTE&&(W=i.R8UI),U===i.UNSIGNED_SHORT&&(W=i.R16UI),U===i.UNSIGNED_INT&&(W=i.R32UI),U===i.BYTE&&(W=i.R8I),U===i.SHORT&&(W=i.R16I),U===i.INT&&(W=i.R32I)),x===i.RG&&(U===i.FLOAT&&(W=i.RG32F),U===i.HALF_FLOAT&&(W=i.RG16F),U===i.UNSIGNED_BYTE&&(W=i.RG8)),x===i.RG_INTEGER&&(U===i.UNSIGNED_BYTE&&(W=i.RG8UI),U===i.UNSIGNED_SHORT&&(W=i.RG16UI),U===i.UNSIGNED_INT&&(W=i.RG32UI),U===i.BYTE&&(W=i.RG8I),U===i.SHORT&&(W=i.RG16I),U===i.INT&&(W=i.RG32I)),x===i.RGB_INTEGER&&(U===i.UNSIGNED_BYTE&&(W=i.RGB8UI),U===i.UNSIGNED_SHORT&&(W=i.RGB16UI),U===i.UNSIGNED_INT&&(W=i.RGB32UI),U===i.BYTE&&(W=i.RGB8I),U===i.SHORT&&(W=i.RGB16I),U===i.INT&&(W=i.RGB32I)),x===i.RGBA_INTEGER&&(U===i.UNSIGNED_BYTE&&(W=i.RGBA8UI),U===i.UNSIGNED_SHORT&&(W=i.RGBA16UI),U===i.UNSIGNED_INT&&(W=i.RGBA32UI),U===i.BYTE&&(W=i.RGBA8I),U===i.SHORT&&(W=i.RGBA16I),U===i.INT&&(W=i.RGBA32I)),x===i.RGB&&(U===i.UNSIGNED_INT_5_9_9_9_REV&&(W=i.RGB9_E5),U===i.UNSIGNED_INT_10F_11F_11F_REV&&(W=i.R11F_G11F_B10F)),x===i.RGBA){const Ee=Z?Tr:$e.getTransfer(X);U===i.FLOAT&&(W=i.RGBA32F),U===i.HALF_FLOAT&&(W=i.RGBA16F),U===i.UNSIGNED_BYTE&&(W=Ee===Je?i.SRGB8_ALPHA8:i.RGBA8),U===i.UNSIGNED_SHORT_4_4_4_4&&(W=i.RGBA4),U===i.UNSIGNED_SHORT_5_5_5_1&&(W=i.RGB5_A1)}return(W===i.R16F||W===i.R32F||W===i.RG16F||W===i.RG32F||W===i.RGBA16F||W===i.RGBA32F)&&e.get("EXT_color_buffer_float"),W}function M(T,x){let U;return T?x===null||x===_i||x===Cs?U=i.DEPTH24_STENCIL8:x===Sn?U=i.DEPTH32F_STENCIL8:x===Rs&&(U=i.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):x===null||x===_i||x===Cs?U=i.DEPTH_COMPONENT24:x===Sn?U=i.DEPTH_COMPONENT32F:x===Rs&&(U=i.DEPTH_COMPONENT16),U}function w(T,x){return m(T)===!0||T.isFramebufferTexture&&T.minFilter!==jt&&T.minFilter!==tn?Math.log2(Math.max(x.width,x.height))+1:T.mipmaps!==void 0&&T.mipmaps.length>0?T.mipmaps.length:T.isCompressedTexture&&Array.isArray(T.image)?x.mipmaps.length:1}function A(T){const x=T.target;x.removeEventListener("dispose",A),D(x),x.isVideoTexture&&h.delete(x)}function C(T){const x=T.target;x.removeEventListener("dispose",C),y(x)}function D(T){const x=n.get(T);if(x.__webglInit===void 0)return;const U=T.source,X=f.get(U);if(X){const Z=X[x.__cacheKey];Z.usedTimes--,Z.usedTimes===0&&S(T),Object.keys(X).length===0&&f.delete(U)}n.remove(T)}function S(T){const x=n.get(T);i.deleteTexture(x.__webglTexture);const U=T.source,X=f.get(U);delete X[x.__cacheKey],a.memory.textures--}function y(T){const x=n.get(T);if(T.depthTexture&&(T.depthTexture.dispose(),n.remove(T.depthTexture)),T.isWebGLCubeRenderTarget)for(let X=0;X<6;X++){if(Array.isArray(x.__webglFramebuffer[X]))for(let Z=0;Z<x.__webglFramebuffer[X].length;Z++)i.deleteFramebuffer(x.__webglFramebuffer[X][Z]);else i.deleteFramebuffer(x.__webglFramebuffer[X]);x.__webglDepthbuffer&&i.deleteRenderbuffer(x.__webglDepthbuffer[X])}else{if(Array.isArray(x.__webglFramebuffer))for(let X=0;X<x.__webglFramebuffer.length;X++)i.deleteFramebuffer(x.__webglFramebuffer[X]);else i.deleteFramebuffer(x.__webglFramebuffer);if(x.__webglDepthbuffer&&i.deleteRenderbuffer(x.__webglDepthbuffer),x.__webglMultisampledFramebuffer&&i.deleteFramebuffer(x.__webglMultisampledFramebuffer),x.__webglColorRenderbuffer)for(let X=0;X<x.__webglColorRenderbuffer.length;X++)x.__webglColorRenderbuffer[X]&&i.deleteRenderbuffer(x.__webglColorRenderbuffer[X]);x.__webglDepthRenderbuffer&&i.deleteRenderbuffer(x.__webglDepthRenderbuffer)}const U=T.textures;for(let X=0,Z=U.length;X<Z;X++){const W=n.get(U[X]);W.__webglTexture&&(i.deleteTexture(W.__webglTexture),a.memory.textures--),n.remove(U[X])}n.remove(T)}let P=0;function N(){P=0}function z(){const T=P;return T>=s.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+T+" texture units while this GPU supports only "+s.maxTextures),P+=1,T}function q(T){const x=[];return x.push(T.wrapS),x.push(T.wrapT),x.push(T.wrapR||0),x.push(T.magFilter),x.push(T.minFilter),x.push(T.anisotropy),x.push(T.internalFormat),x.push(T.format),x.push(T.type),x.push(T.generateMipmaps),x.push(T.premultiplyAlpha),x.push(T.flipY),x.push(T.unpackAlignment),x.push(T.colorSpace),x.join()}function G(T,x){const U=n.get(T);if(T.isVideoTexture&&Ne(T),T.isRenderTargetTexture===!1&&T.isExternalTexture!==!0&&T.version>0&&U.__version!==T.version){const X=T.image;if(X===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(X.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{j(U,T,x);return}}else T.isExternalTexture&&(U.__webglTexture=T.sourceTexture?T.sourceTexture:null);t.bindTexture(i.TEXTURE_2D,U.__webglTexture,i.TEXTURE0+x)}function V(T,x){const U=n.get(T);if(T.isRenderTargetTexture===!1&&T.version>0&&U.__version!==T.version){j(U,T,x);return}t.bindTexture(i.TEXTURE_2D_ARRAY,U.__webglTexture,i.TEXTURE0+x)}function $(T,x){const U=n.get(T);if(T.isRenderTargetTexture===!1&&T.version>0&&U.__version!==T.version){j(U,T,x);return}t.bindTexture(i.TEXTURE_3D,U.__webglTexture,i.TEXTURE0+x)}function k(T,x){const U=n.get(T);if(T.version>0&&U.__version!==T.version){K(U,T,x);return}t.bindTexture(i.TEXTURE_CUBE_MAP,U.__webglTexture,i.TEXTURE0+x)}const ie={[As]:i.REPEAT,[dn]:i.CLAMP_TO_EDGE,[Ga]:i.MIRRORED_REPEAT},ce={[jt]:i.NEAREST,[Td]:i.NEAREST_MIPMAP_NEAREST,[Gs]:i.NEAREST_MIPMAP_LINEAR,[tn]:i.LINEAR,[kr]:i.LINEAR_MIPMAP_NEAREST,[gi]:i.LINEAR_MIPMAP_LINEAR},ue={[Cd]:i.NEVER,[Nd]:i.ALWAYS,[Pd]:i.LESS,[lh]:i.LEQUAL,[Ld]:i.EQUAL,[Od]:i.GEQUAL,[Dd]:i.GREATER,[Id]:i.NOTEQUAL};function Ie(T,x){if(x.type===Sn&&e.has("OES_texture_float_linear")===!1&&(x.magFilter===tn||x.magFilter===kr||x.magFilter===Gs||x.magFilter===gi||x.minFilter===tn||x.minFilter===kr||x.minFilter===Gs||x.minFilter===gi)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),i.texParameteri(T,i.TEXTURE_WRAP_S,ie[x.wrapS]),i.texParameteri(T,i.TEXTURE_WRAP_T,ie[x.wrapT]),(T===i.TEXTURE_3D||T===i.TEXTURE_2D_ARRAY)&&i.texParameteri(T,i.TEXTURE_WRAP_R,ie[x.wrapR]),i.texParameteri(T,i.TEXTURE_MAG_FILTER,ce[x.magFilter]),i.texParameteri(T,i.TEXTURE_MIN_FILTER,ce[x.minFilter]),x.compareFunction&&(i.texParameteri(T,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(T,i.TEXTURE_COMPARE_FUNC,ue[x.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(x.magFilter===jt||x.minFilter!==Gs&&x.minFilter!==gi||x.type===Sn&&e.has("OES_texture_float_linear")===!1)return;if(x.anisotropy>1||n.get(x).__currentAnisotropy){const U=e.get("EXT_texture_filter_anisotropic");i.texParameterf(T,U.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(x.anisotropy,s.getMaxAnisotropy())),n.get(x).__currentAnisotropy=x.anisotropy}}}function Ue(T,x){let U=!1;T.__webglInit===void 0&&(T.__webglInit=!0,x.addEventListener("dispose",A));const X=x.source;let Z=f.get(X);Z===void 0&&(Z={},f.set(X,Z));const W=q(x);if(W!==T.__cacheKey){Z[W]===void 0&&(Z[W]={texture:i.createTexture(),usedTimes:0},a.memory.textures++,U=!0),Z[W].usedTimes++;const Ee=Z[T.__cacheKey];Ee!==void 0&&(Z[T.__cacheKey].usedTimes--,Ee.usedTimes===0&&S(x)),T.__cacheKey=W,T.__webglTexture=Z[W].texture}return U}function je(T,x,U){return Math.floor(Math.floor(T/U)/x)}function He(T,x,U,X){const W=T.updateRanges;if(W.length===0)t.texSubImage2D(i.TEXTURE_2D,0,0,0,x.width,x.height,U,X,x.data);else{W.sort((ee,fe)=>ee.start-fe.start);let Ee=0;for(let ee=1;ee<W.length;ee++){const fe=W[Ee],Le=W[ee],be=fe.start+fe.count,le=je(Le.start,x.width,4),ze=je(fe.start,x.width,4);Le.start<=be+1&&le===ze&&je(Le.start+Le.count-1,x.width,4)===le?fe.count=Math.max(fe.count,Le.start+Le.count-fe.start):(++Ee,W[Ee]=Le)}W.length=Ee+1;const ne=i.getParameter(i.UNPACK_ROW_LENGTH),Me=i.getParameter(i.UNPACK_SKIP_PIXELS),ye=i.getParameter(i.UNPACK_SKIP_ROWS);i.pixelStorei(i.UNPACK_ROW_LENGTH,x.width);for(let ee=0,fe=W.length;ee<fe;ee++){const Le=W[ee],be=Math.floor(Le.start/4),le=Math.ceil(Le.count/4),ze=be%x.width,I=Math.floor(be/x.width),te=le,se=1;i.pixelStorei(i.UNPACK_SKIP_PIXELS,ze),i.pixelStorei(i.UNPACK_SKIP_ROWS,I),t.texSubImage2D(i.TEXTURE_2D,0,ze,I,te,se,U,X,x.data)}T.clearUpdateRanges(),i.pixelStorei(i.UNPACK_ROW_LENGTH,ne),i.pixelStorei(i.UNPACK_SKIP_PIXELS,Me),i.pixelStorei(i.UNPACK_SKIP_ROWS,ye)}}function j(T,x,U){let X=i.TEXTURE_2D;(x.isDataArrayTexture||x.isCompressedArrayTexture)&&(X=i.TEXTURE_2D_ARRAY),x.isData3DTexture&&(X=i.TEXTURE_3D);const Z=Ue(T,x),W=x.source;t.bindTexture(X,T.__webglTexture,i.TEXTURE0+U);const Ee=n.get(W);if(W.version!==Ee.__version||Z===!0){t.activeTexture(i.TEXTURE0+U);const ne=$e.getPrimaries($e.workingColorSpace),Me=x.colorSpace===hn?null:$e.getPrimaries(x.colorSpace),ye=x.colorSpace===hn||ne===Me?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,x.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,x.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,x.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,ye);let ee=_(x.image,!1,s.maxTextureSize);ee=lt(x,ee);const fe=r.convert(x.format,x.colorSpace),Le=r.convert(x.type);let be=E(x.internalFormat,fe,Le,x.colorSpace,x.isVideoTexture);Ie(X,x);let le;const ze=x.mipmaps,I=x.isVideoTexture!==!0,te=Ee.__version===void 0||Z===!0,se=W.dataReady,ge=w(x,ee);if(x.isDepthTexture)be=M(x.format===Ls,x.type),te&&(I?t.texStorage2D(i.TEXTURE_2D,1,be,ee.width,ee.height):t.texImage2D(i.TEXTURE_2D,0,be,ee.width,ee.height,0,fe,Le,null));else if(x.isDataTexture)if(ze.length>0){I&&te&&t.texStorage2D(i.TEXTURE_2D,ge,be,ze[0].width,ze[0].height);for(let J=0,Y=ze.length;J<Y;J++)le=ze[J],I?se&&t.texSubImage2D(i.TEXTURE_2D,J,0,0,le.width,le.height,fe,Le,le.data):t.texImage2D(i.TEXTURE_2D,J,be,le.width,le.height,0,fe,Le,le.data);x.generateMipmaps=!1}else I?(te&&t.texStorage2D(i.TEXTURE_2D,ge,be,ee.width,ee.height),se&&He(x,ee,fe,Le)):t.texImage2D(i.TEXTURE_2D,0,be,ee.width,ee.height,0,fe,Le,ee.data);else if(x.isCompressedTexture)if(x.isCompressedArrayTexture){I&&te&&t.texStorage3D(i.TEXTURE_2D_ARRAY,ge,be,ze[0].width,ze[0].height,ee.depth);for(let J=0,Y=ze.length;J<Y;J++)if(le=ze[J],x.format!==fn)if(fe!==null)if(I){if(se)if(x.layerUpdates.size>0){const ve=Ql(le.width,le.height,x.format,x.type);for(const Fe of x.layerUpdates){const it=le.data.subarray(Fe*ve/le.data.BYTES_PER_ELEMENT,(Fe+1)*ve/le.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,J,0,0,Fe,le.width,le.height,1,fe,it)}x.clearLayerUpdates()}else t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,J,0,0,0,le.width,le.height,ee.depth,fe,le.data)}else t.compressedTexImage3D(i.TEXTURE_2D_ARRAY,J,be,le.width,le.height,ee.depth,0,le.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else I?se&&t.texSubImage3D(i.TEXTURE_2D_ARRAY,J,0,0,0,le.width,le.height,ee.depth,fe,Le,le.data):t.texImage3D(i.TEXTURE_2D_ARRAY,J,be,le.width,le.height,ee.depth,0,fe,Le,le.data)}else{I&&te&&t.texStorage2D(i.TEXTURE_2D,ge,be,ze[0].width,ze[0].height);for(let J=0,Y=ze.length;J<Y;J++)le=ze[J],x.format!==fn?fe!==null?I?se&&t.compressedTexSubImage2D(i.TEXTURE_2D,J,0,0,le.width,le.height,fe,le.data):t.compressedTexImage2D(i.TEXTURE_2D,J,be,le.width,le.height,0,le.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):I?se&&t.texSubImage2D(i.TEXTURE_2D,J,0,0,le.width,le.height,fe,Le,le.data):t.texImage2D(i.TEXTURE_2D,J,be,le.width,le.height,0,fe,Le,le.data)}else if(x.isDataArrayTexture)if(I){if(te&&t.texStorage3D(i.TEXTURE_2D_ARRAY,ge,be,ee.width,ee.height,ee.depth),se)if(x.layerUpdates.size>0){const J=Ql(ee.width,ee.height,x.format,x.type);for(const Y of x.layerUpdates){const ve=ee.data.subarray(Y*J/ee.data.BYTES_PER_ELEMENT,(Y+1)*J/ee.data.BYTES_PER_ELEMENT);t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,Y,ee.width,ee.height,1,fe,Le,ve)}x.clearLayerUpdates()}else t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,ee.width,ee.height,ee.depth,fe,Le,ee.data)}else t.texImage3D(i.TEXTURE_2D_ARRAY,0,be,ee.width,ee.height,ee.depth,0,fe,Le,ee.data);else if(x.isData3DTexture)I?(te&&t.texStorage3D(i.TEXTURE_3D,ge,be,ee.width,ee.height,ee.depth),se&&t.texSubImage3D(i.TEXTURE_3D,0,0,0,0,ee.width,ee.height,ee.depth,fe,Le,ee.data)):t.texImage3D(i.TEXTURE_3D,0,be,ee.width,ee.height,ee.depth,0,fe,Le,ee.data);else if(x.isFramebufferTexture){if(te)if(I)t.texStorage2D(i.TEXTURE_2D,ge,be,ee.width,ee.height);else{let J=ee.width,Y=ee.height;for(let ve=0;ve<ge;ve++)t.texImage2D(i.TEXTURE_2D,ve,be,J,Y,0,fe,Le,null),J>>=1,Y>>=1}}else if(ze.length>0){if(I&&te){const J=st(ze[0]);t.texStorage2D(i.TEXTURE_2D,ge,be,J.width,J.height)}for(let J=0,Y=ze.length;J<Y;J++)le=ze[J],I?se&&t.texSubImage2D(i.TEXTURE_2D,J,0,0,fe,Le,le):t.texImage2D(i.TEXTURE_2D,J,be,fe,Le,le);x.generateMipmaps=!1}else if(I){if(te){const J=st(ee);t.texStorage2D(i.TEXTURE_2D,ge,be,J.width,J.height)}se&&t.texSubImage2D(i.TEXTURE_2D,0,0,0,fe,Le,ee)}else t.texImage2D(i.TEXTURE_2D,0,be,fe,Le,ee);m(x)&&d(X),Ee.__version=W.version,x.onUpdate&&x.onUpdate(x)}T.__version=x.version}function K(T,x,U){if(x.image.length!==6)return;const X=Ue(T,x),Z=x.source;t.bindTexture(i.TEXTURE_CUBE_MAP,T.__webglTexture,i.TEXTURE0+U);const W=n.get(Z);if(Z.version!==W.__version||X===!0){t.activeTexture(i.TEXTURE0+U);const Ee=$e.getPrimaries($e.workingColorSpace),ne=x.colorSpace===hn?null:$e.getPrimaries(x.colorSpace),Me=x.colorSpace===hn||Ee===ne?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,x.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,x.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,x.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,Me);const ye=x.isCompressedTexture||x.image[0].isCompressedTexture,ee=x.image[0]&&x.image[0].isDataTexture,fe=[];for(let Y=0;Y<6;Y++)!ye&&!ee?fe[Y]=_(x.image[Y],!0,s.maxCubemapSize):fe[Y]=ee?x.image[Y].image:x.image[Y],fe[Y]=lt(x,fe[Y]);const Le=fe[0],be=r.convert(x.format,x.colorSpace),le=r.convert(x.type),ze=E(x.internalFormat,be,le,x.colorSpace),I=x.isVideoTexture!==!0,te=W.__version===void 0||X===!0,se=Z.dataReady;let ge=w(x,Le);Ie(i.TEXTURE_CUBE_MAP,x);let J;if(ye){I&&te&&t.texStorage2D(i.TEXTURE_CUBE_MAP,ge,ze,Le.width,Le.height);for(let Y=0;Y<6;Y++){J=fe[Y].mipmaps;for(let ve=0;ve<J.length;ve++){const Fe=J[ve];x.format!==fn?be!==null?I?se&&t.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Y,ve,0,0,Fe.width,Fe.height,be,Fe.data):t.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Y,ve,ze,Fe.width,Fe.height,0,Fe.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):I?se&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Y,ve,0,0,Fe.width,Fe.height,be,le,Fe.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Y,ve,ze,Fe.width,Fe.height,0,be,le,Fe.data)}}}else{if(J=x.mipmaps,I&&te){J.length>0&&ge++;const Y=st(fe[0]);t.texStorage2D(i.TEXTURE_CUBE_MAP,ge,ze,Y.width,Y.height)}for(let Y=0;Y<6;Y++)if(ee){I?se&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Y,0,0,0,fe[Y].width,fe[Y].height,be,le,fe[Y].data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Y,0,ze,fe[Y].width,fe[Y].height,0,be,le,fe[Y].data);for(let ve=0;ve<J.length;ve++){const it=J[ve].image[Y].image;I?se&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Y,ve+1,0,0,it.width,it.height,be,le,it.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Y,ve+1,ze,it.width,it.height,0,be,le,it.data)}}else{I?se&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Y,0,0,0,be,le,fe[Y]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Y,0,ze,be,le,fe[Y]);for(let ve=0;ve<J.length;ve++){const Fe=J[ve];I?se&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Y,ve+1,0,0,be,le,Fe.image[Y]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Y,ve+1,ze,be,le,Fe.image[Y])}}}m(x)&&d(i.TEXTURE_CUBE_MAP),W.__version=Z.version,x.onUpdate&&x.onUpdate(x)}T.__version=x.version}function oe(T,x,U,X,Z,W){const Ee=r.convert(U.format,U.colorSpace),ne=r.convert(U.type),Me=E(U.internalFormat,Ee,ne,U.colorSpace),ye=n.get(x),ee=n.get(U);if(ee.__renderTarget=x,!ye.__hasExternalTextures){const fe=Math.max(1,x.width>>W),Le=Math.max(1,x.height>>W);Z===i.TEXTURE_3D||Z===i.TEXTURE_2D_ARRAY?t.texImage3D(Z,W,Me,fe,Le,x.depth,0,Ee,ne,null):t.texImage2D(Z,W,Me,fe,Le,0,Ee,ne,null)}t.bindFramebuffer(i.FRAMEBUFFER,T),_e(x)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,X,Z,ee.__webglTexture,0,et(x)):(Z===i.TEXTURE_2D||Z>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&Z<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,X,Z,ee.__webglTexture,W),t.bindFramebuffer(i.FRAMEBUFFER,null)}function Te(T,x,U){if(i.bindRenderbuffer(i.RENDERBUFFER,T),x.depthBuffer){const X=x.depthTexture,Z=X&&X.isDepthTexture?X.type:null,W=M(x.stencilBuffer,Z),Ee=x.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,ne=et(x);_e(x)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,ne,W,x.width,x.height):U?i.renderbufferStorageMultisample(i.RENDERBUFFER,ne,W,x.width,x.height):i.renderbufferStorage(i.RENDERBUFFER,W,x.width,x.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,Ee,i.RENDERBUFFER,T)}else{const X=x.textures;for(let Z=0;Z<X.length;Z++){const W=X[Z],Ee=r.convert(W.format,W.colorSpace),ne=r.convert(W.type),Me=E(W.internalFormat,Ee,ne,W.colorSpace),ye=et(x);U&&_e(x)===!1?i.renderbufferStorageMultisample(i.RENDERBUFFER,ye,Me,x.width,x.height):_e(x)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,ye,Me,x.width,x.height):i.renderbufferStorage(i.RENDERBUFFER,Me,x.width,x.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function re(T,x){if(x&&x.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(t.bindFramebuffer(i.FRAMEBUFFER,T),!(x.depthTexture&&x.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");const X=n.get(x.depthTexture);X.__renderTarget=x,(!X.__webglTexture||x.depthTexture.image.width!==x.width||x.depthTexture.image.height!==x.height)&&(x.depthTexture.image.width=x.width,x.depthTexture.image.height=x.height,x.depthTexture.needsUpdate=!0),G(x.depthTexture,0);const Z=X.__webglTexture,W=et(x);if(x.depthTexture.format===Ps)_e(x)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,Z,0,W):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,Z,0);else if(x.depthTexture.format===Ls)_e(x)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,Z,0,W):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,Z,0);else throw new Error("Unknown depthTexture format")}function pe(T){const x=n.get(T),U=T.isWebGLCubeRenderTarget===!0;if(x.__boundDepthTexture!==T.depthTexture){const X=T.depthTexture;if(x.__depthDisposeCallback&&x.__depthDisposeCallback(),X){const Z=()=>{delete x.__boundDepthTexture,delete x.__depthDisposeCallback,X.removeEventListener("dispose",Z)};X.addEventListener("dispose",Z),x.__depthDisposeCallback=Z}x.__boundDepthTexture=X}if(T.depthTexture&&!x.__autoAllocateDepthBuffer){if(U)throw new Error("target.depthTexture not supported in Cube render targets");const X=T.texture.mipmaps;X&&X.length>0?re(x.__webglFramebuffer[0],T):re(x.__webglFramebuffer,T)}else if(U){x.__webglDepthbuffer=[];for(let X=0;X<6;X++)if(t.bindFramebuffer(i.FRAMEBUFFER,x.__webglFramebuffer[X]),x.__webglDepthbuffer[X]===void 0)x.__webglDepthbuffer[X]=i.createRenderbuffer(),Te(x.__webglDepthbuffer[X],T,!1);else{const Z=T.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,W=x.__webglDepthbuffer[X];i.bindRenderbuffer(i.RENDERBUFFER,W),i.framebufferRenderbuffer(i.FRAMEBUFFER,Z,i.RENDERBUFFER,W)}}else{const X=T.texture.mipmaps;if(X&&X.length>0?t.bindFramebuffer(i.FRAMEBUFFER,x.__webglFramebuffer[0]):t.bindFramebuffer(i.FRAMEBUFFER,x.__webglFramebuffer),x.__webglDepthbuffer===void 0)x.__webglDepthbuffer=i.createRenderbuffer(),Te(x.__webglDepthbuffer,T,!1);else{const Z=T.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,W=x.__webglDepthbuffer;i.bindRenderbuffer(i.RENDERBUFFER,W),i.framebufferRenderbuffer(i.FRAMEBUFFER,Z,i.RENDERBUFFER,W)}}t.bindFramebuffer(i.FRAMEBUFFER,null)}function Ce(T,x,U){const X=n.get(T);x!==void 0&&oe(X.__webglFramebuffer,T,T.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),U!==void 0&&pe(T)}function R(T){const x=T.texture,U=n.get(T),X=n.get(x);T.addEventListener("dispose",C);const Z=T.textures,W=T.isWebGLCubeRenderTarget===!0,Ee=Z.length>1;if(Ee||(X.__webglTexture===void 0&&(X.__webglTexture=i.createTexture()),X.__version=x.version,a.memory.textures++),W){U.__webglFramebuffer=[];for(let ne=0;ne<6;ne++)if(x.mipmaps&&x.mipmaps.length>0){U.__webglFramebuffer[ne]=[];for(let Me=0;Me<x.mipmaps.length;Me++)U.__webglFramebuffer[ne][Me]=i.createFramebuffer()}else U.__webglFramebuffer[ne]=i.createFramebuffer()}else{if(x.mipmaps&&x.mipmaps.length>0){U.__webglFramebuffer=[];for(let ne=0;ne<x.mipmaps.length;ne++)U.__webglFramebuffer[ne]=i.createFramebuffer()}else U.__webglFramebuffer=i.createFramebuffer();if(Ee)for(let ne=0,Me=Z.length;ne<Me;ne++){const ye=n.get(Z[ne]);ye.__webglTexture===void 0&&(ye.__webglTexture=i.createTexture(),a.memory.textures++)}if(T.samples>0&&_e(T)===!1){U.__webglMultisampledFramebuffer=i.createFramebuffer(),U.__webglColorRenderbuffer=[],t.bindFramebuffer(i.FRAMEBUFFER,U.__webglMultisampledFramebuffer);for(let ne=0;ne<Z.length;ne++){const Me=Z[ne];U.__webglColorRenderbuffer[ne]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,U.__webglColorRenderbuffer[ne]);const ye=r.convert(Me.format,Me.colorSpace),ee=r.convert(Me.type),fe=E(Me.internalFormat,ye,ee,Me.colorSpace,T.isXRRenderTarget===!0),Le=et(T);i.renderbufferStorageMultisample(i.RENDERBUFFER,Le,fe,T.width,T.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+ne,i.RENDERBUFFER,U.__webglColorRenderbuffer[ne])}i.bindRenderbuffer(i.RENDERBUFFER,null),T.depthBuffer&&(U.__webglDepthRenderbuffer=i.createRenderbuffer(),Te(U.__webglDepthRenderbuffer,T,!0)),t.bindFramebuffer(i.FRAMEBUFFER,null)}}if(W){t.bindTexture(i.TEXTURE_CUBE_MAP,X.__webglTexture),Ie(i.TEXTURE_CUBE_MAP,x);for(let ne=0;ne<6;ne++)if(x.mipmaps&&x.mipmaps.length>0)for(let Me=0;Me<x.mipmaps.length;Me++)oe(U.__webglFramebuffer[ne][Me],T,x,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+ne,Me);else oe(U.__webglFramebuffer[ne],T,x,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+ne,0);m(x)&&d(i.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(Ee){for(let ne=0,Me=Z.length;ne<Me;ne++){const ye=Z[ne],ee=n.get(ye);let fe=i.TEXTURE_2D;(T.isWebGL3DRenderTarget||T.isWebGLArrayRenderTarget)&&(fe=T.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(fe,ee.__webglTexture),Ie(fe,ye),oe(U.__webglFramebuffer,T,ye,i.COLOR_ATTACHMENT0+ne,fe,0),m(ye)&&d(fe)}t.unbindTexture()}else{let ne=i.TEXTURE_2D;if((T.isWebGL3DRenderTarget||T.isWebGLArrayRenderTarget)&&(ne=T.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(ne,X.__webglTexture),Ie(ne,x),x.mipmaps&&x.mipmaps.length>0)for(let Me=0;Me<x.mipmaps.length;Me++)oe(U.__webglFramebuffer[Me],T,x,i.COLOR_ATTACHMENT0,ne,Me);else oe(U.__webglFramebuffer,T,x,i.COLOR_ATTACHMENT0,ne,0);m(x)&&d(ne),t.unbindTexture()}T.depthBuffer&&pe(T)}function ke(T){const x=T.textures;for(let U=0,X=x.length;U<X;U++){const Z=x[U];if(m(Z)){const W=b(T),Ee=n.get(Z).__webglTexture;t.bindTexture(W,Ee),d(W),t.unbindTexture()}}}const we=[],xe=[];function de(T){if(T.samples>0){if(_e(T)===!1){const x=T.textures,U=T.width,X=T.height;let Z=i.COLOR_BUFFER_BIT;const W=T.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,Ee=n.get(T),ne=x.length>1;if(ne)for(let ye=0;ye<x.length;ye++)t.bindFramebuffer(i.FRAMEBUFFER,Ee.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+ye,i.RENDERBUFFER,null),t.bindFramebuffer(i.FRAMEBUFFER,Ee.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+ye,i.TEXTURE_2D,null,0);t.bindFramebuffer(i.READ_FRAMEBUFFER,Ee.__webglMultisampledFramebuffer);const Me=T.texture.mipmaps;Me&&Me.length>0?t.bindFramebuffer(i.DRAW_FRAMEBUFFER,Ee.__webglFramebuffer[0]):t.bindFramebuffer(i.DRAW_FRAMEBUFFER,Ee.__webglFramebuffer);for(let ye=0;ye<x.length;ye++){if(T.resolveDepthBuffer&&(T.depthBuffer&&(Z|=i.DEPTH_BUFFER_BIT),T.stencilBuffer&&T.resolveStencilBuffer&&(Z|=i.STENCIL_BUFFER_BIT)),ne){i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,Ee.__webglColorRenderbuffer[ye]);const ee=n.get(x[ye]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,ee,0)}i.blitFramebuffer(0,0,U,X,0,0,U,X,Z,i.NEAREST),l===!0&&(we.length=0,xe.length=0,we.push(i.COLOR_ATTACHMENT0+ye),T.depthBuffer&&T.resolveDepthBuffer===!1&&(we.push(W),xe.push(W),i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,xe)),i.invalidateFramebuffer(i.READ_FRAMEBUFFER,we))}if(t.bindFramebuffer(i.READ_FRAMEBUFFER,null),t.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),ne)for(let ye=0;ye<x.length;ye++){t.bindFramebuffer(i.FRAMEBUFFER,Ee.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+ye,i.RENDERBUFFER,Ee.__webglColorRenderbuffer[ye]);const ee=n.get(x[ye]).__webglTexture;t.bindFramebuffer(i.FRAMEBUFFER,Ee.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+ye,i.TEXTURE_2D,ee,0)}t.bindFramebuffer(i.DRAW_FRAMEBUFFER,Ee.__webglMultisampledFramebuffer)}else if(T.depthBuffer&&T.resolveDepthBuffer===!1&&l){const x=T.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[x])}}}function et(T){return Math.min(s.maxSamples,T.samples)}function _e(T){const x=n.get(T);return T.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&x.__useRenderToTexture!==!1}function Ne(T){const x=a.render.frame;h.get(T)!==x&&(h.set(T,x),T.update())}function lt(T,x){const U=T.colorSpace,X=T.format,Z=T.type;return T.isCompressedTexture===!0||T.isVideoTexture===!0||U!==ss&&U!==hn&&($e.getTransfer(U)===Je?(X!==fn||Z!==yn)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",U)),x}function st(T){return typeof HTMLImageElement<"u"&&T instanceof HTMLImageElement?(c.width=T.naturalWidth||T.width,c.height=T.naturalHeight||T.height):typeof VideoFrame<"u"&&T instanceof VideoFrame?(c.width=T.displayWidth,c.height=T.displayHeight):(c.width=T.width,c.height=T.height),c}this.allocateTextureUnit=z,this.resetTextureUnits=N,this.setTexture2D=G,this.setTexture2DArray=V,this.setTexture3D=$,this.setTextureCube=k,this.rebindTextures=Ce,this.setupRenderTarget=R,this.updateRenderTargetMipmap=ke,this.updateMultisampleRenderTarget=de,this.setupDepthRenderbuffer=pe,this.setupFrameBufferTexture=oe,this.useMultisampledRTT=_e}function m_(i,e){function t(n,s=hn){let r;const a=$e.getTransfer(s);if(n===yn)return i.UNSIGNED_BYTE;if(n===Ro)return i.UNSIGNED_SHORT_4_4_4_4;if(n===Co)return i.UNSIGNED_SHORT_5_5_5_1;if(n===ih)return i.UNSIGNED_INT_5_9_9_9_REV;if(n===sh)return i.UNSIGNED_INT_10F_11F_11F_REV;if(n===th)return i.BYTE;if(n===nh)return i.SHORT;if(n===Rs)return i.UNSIGNED_SHORT;if(n===Ao)return i.INT;if(n===_i)return i.UNSIGNED_INT;if(n===Sn)return i.FLOAT;if(n===Os)return i.HALF_FLOAT;if(n===rh)return i.ALPHA;if(n===ah)return i.RGB;if(n===fn)return i.RGBA;if(n===Ps)return i.DEPTH_COMPONENT;if(n===Ls)return i.DEPTH_STENCIL;if(n===Po)return i.RED;if(n===Lo)return i.RED_INTEGER;if(n===oh)return i.RG;if(n===Do)return i.RG_INTEGER;if(n===Io)return i.RGBA_INTEGER;if(n===_r||n===xr||n===Sr||n===vr)if(a===Je)if(r=e.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===_r)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===xr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===Sr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===vr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=e.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===_r)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===xr)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===Sr)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===vr)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===Va||n===Wa||n===qa||n===Xa)if(r=e.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===Va)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===Wa)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===qa)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===Xa)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===ja||n===Ya||n===$a)if(r=e.get("WEBGL_compressed_texture_etc"),r!==null){if(n===ja||n===Ya)return a===Je?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===$a)return a===Je?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(n===Ka||n===Za||n===Ja||n===Qa||n===eo||n===to||n===no||n===io||n===so||n===ro||n===ao||n===oo||n===lo||n===co)if(r=e.get("WEBGL_compressed_texture_astc"),r!==null){if(n===Ka)return a===Je?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===Za)return a===Je?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===Ja)return a===Je?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===Qa)return a===Je?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===eo)return a===Je?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===to)return a===Je?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===no)return a===Je?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===io)return a===Je?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===so)return a===Je?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===ro)return a===Je?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===ao)return a===Je?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===oo)return a===Je?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===lo)return a===Je?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===co)return a===Je?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===ho||n===uo||n===fo)if(r=e.get("EXT_texture_compression_bptc"),r!==null){if(n===ho)return a===Je?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===uo)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===fo)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===po||n===mo||n===go||n===_o)if(r=e.get("EXT_texture_compression_rgtc"),r!==null){if(n===po)return r.COMPRESSED_RED_RGTC1_EXT;if(n===mo)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===go)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===_o)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===Cs?i.UNSIGNED_INT_24_8:i[n]!==void 0?i[n]:null}return{convert:t}}const g_=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,__=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`;class x_{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){const n=new Sh(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(e){if(this.texture!==null&&this.mesh===null){const t=e.cameras[0].viewport,n=new ni({vertexShader:g_,fragmentShader:__,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new ht(new Ot(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class S_ extends ls{constructor(e,t){super();const n=this;let s=null,r=1,a=null,o="local-floor",l=1,c=null,h=null,u=null,f=null,p=null,g=null;const _=typeof XRWebGLBinding<"u",m=new x_,d={},b=t.getContextAttributes();let E=null,M=null;const w=[],A=[],C=new Ve;let D=null;const S=new Ht;S.viewport=new Qe;const y=new Ht;y.viewport=new Qe;const P=[S,y],N=new Hf;let z=null,q=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(j){let K=w[j];return K===void 0&&(K=new la,w[j]=K),K.getTargetRaySpace()},this.getControllerGrip=function(j){let K=w[j];return K===void 0&&(K=new la,w[j]=K),K.getGripSpace()},this.getHand=function(j){let K=w[j];return K===void 0&&(K=new la,w[j]=K),K.getHandSpace()};function G(j){const K=A.indexOf(j.inputSource);if(K===-1)return;const oe=w[K];oe!==void 0&&(oe.update(j.inputSource,j.frame,c||a),oe.dispatchEvent({type:j.type,data:j.inputSource}))}function V(){s.removeEventListener("select",G),s.removeEventListener("selectstart",G),s.removeEventListener("selectend",G),s.removeEventListener("squeeze",G),s.removeEventListener("squeezestart",G),s.removeEventListener("squeezeend",G),s.removeEventListener("end",V),s.removeEventListener("inputsourceschange",$);for(let j=0;j<w.length;j++){const K=A[j];K!==null&&(A[j]=null,w[j].disconnect(K))}z=null,q=null,m.reset();for(const j in d)delete d[j];e.setRenderTarget(E),p=null,f=null,u=null,s=null,M=null,He.stop(),n.isPresenting=!1,e.setPixelRatio(D),e.setSize(C.width,C.height,!1),n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(j){r=j,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(j){o=j,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(j){c=j},this.getBaseLayer=function(){return f!==null?f:p},this.getBinding=function(){return u===null&&_&&(u=new XRWebGLBinding(s,t)),u},this.getFrame=function(){return g},this.getSession=function(){return s},this.setSession=async function(j){if(s=j,s!==null){if(E=e.getRenderTarget(),s.addEventListener("select",G),s.addEventListener("selectstart",G),s.addEventListener("selectend",G),s.addEventListener("squeeze",G),s.addEventListener("squeezestart",G),s.addEventListener("squeezeend",G),s.addEventListener("end",V),s.addEventListener("inputsourceschange",$),b.xrCompatible!==!0&&await t.makeXRCompatible(),D=e.getPixelRatio(),e.getSize(C),_&&"createProjectionLayer"in XRWebGLBinding.prototype){let oe=null,Te=null,re=null;b.depth&&(re=b.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,oe=b.stencil?Ls:Ps,Te=b.stencil?Cs:_i);const pe={colorFormat:t.RGBA8,depthFormat:re,scaleFactor:r};u=this.getBinding(),f=u.createProjectionLayer(pe),s.updateRenderState({layers:[f]}),e.setPixelRatio(1),e.setSize(f.textureWidth,f.textureHeight,!1),M=new ti(f.textureWidth,f.textureHeight,{format:fn,type:yn,depthTexture:new xh(f.textureWidth,f.textureHeight,Te,void 0,void 0,void 0,void 0,void 0,void 0,oe),stencilBuffer:b.stencil,colorSpace:e.outputColorSpace,samples:b.antialias?4:0,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1})}else{const oe={antialias:b.antialias,alpha:!0,depth:b.depth,stencil:b.stencil,framebufferScaleFactor:r};p=new XRWebGLLayer(s,t,oe),s.updateRenderState({baseLayer:p}),e.setPixelRatio(1),e.setSize(p.framebufferWidth,p.framebufferHeight,!1),M=new ti(p.framebufferWidth,p.framebufferHeight,{format:fn,type:yn,colorSpace:e.outputColorSpace,stencilBuffer:b.stencil,resolveDepthBuffer:p.ignoreDepthValues===!1,resolveStencilBuffer:p.ignoreDepthValues===!1})}M.isXRRenderTarget=!0,this.setFoveation(l),c=null,a=await s.requestReferenceSpace(o),He.setContext(s),He.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return m.getDepthTexture()};function $(j){for(let K=0;K<j.removed.length;K++){const oe=j.removed[K],Te=A.indexOf(oe);Te>=0&&(A[Te]=null,w[Te].disconnect(oe))}for(let K=0;K<j.added.length;K++){const oe=j.added[K];let Te=A.indexOf(oe);if(Te===-1){for(let pe=0;pe<w.length;pe++)if(pe>=A.length){A.push(oe),Te=pe;break}else if(A[pe]===null){A[pe]=oe,Te=pe;break}if(Te===-1)break}const re=w[Te];re&&re.connect(oe)}}const k=new L,ie=new L;function ce(j,K,oe){k.setFromMatrixPosition(K.matrixWorld),ie.setFromMatrixPosition(oe.matrixWorld);const Te=k.distanceTo(ie),re=K.projectionMatrix.elements,pe=oe.projectionMatrix.elements,Ce=re[14]/(re[10]-1),R=re[14]/(re[10]+1),ke=(re[9]+1)/re[5],we=(re[9]-1)/re[5],xe=(re[8]-1)/re[0],de=(pe[8]+1)/pe[0],et=Ce*xe,_e=Ce*de,Ne=Te/(-xe+de),lt=Ne*-xe;if(K.matrixWorld.decompose(j.position,j.quaternion,j.scale),j.translateX(lt),j.translateZ(Ne),j.matrixWorld.compose(j.position,j.quaternion,j.scale),j.matrixWorldInverse.copy(j.matrixWorld).invert(),re[10]===-1)j.projectionMatrix.copy(K.projectionMatrix),j.projectionMatrixInverse.copy(K.projectionMatrixInverse);else{const st=Ce+Ne,T=R+Ne,x=et-lt,U=_e+(Te-lt),X=ke*R/T*st,Z=we*R/T*st;j.projectionMatrix.makePerspective(x,U,X,Z,st,T),j.projectionMatrixInverse.copy(j.projectionMatrix).invert()}}function ue(j,K){K===null?j.matrixWorld.copy(j.matrix):j.matrixWorld.multiplyMatrices(K.matrixWorld,j.matrix),j.matrixWorldInverse.copy(j.matrixWorld).invert()}this.updateCamera=function(j){if(s===null)return;let K=j.near,oe=j.far;m.texture!==null&&(m.depthNear>0&&(K=m.depthNear),m.depthFar>0&&(oe=m.depthFar)),N.near=y.near=S.near=K,N.far=y.far=S.far=oe,(z!==N.near||q!==N.far)&&(s.updateRenderState({depthNear:N.near,depthFar:N.far}),z=N.near,q=N.far),N.layers.mask=j.layers.mask|6,S.layers.mask=N.layers.mask&3,y.layers.mask=N.layers.mask&5;const Te=j.parent,re=N.cameras;ue(N,Te);for(let pe=0;pe<re.length;pe++)ue(re[pe],Te);re.length===2?ce(N,S,y):N.projectionMatrix.copy(S.projectionMatrix),Ie(j,N,Te)};function Ie(j,K,oe){oe===null?j.matrix.copy(K.matrixWorld):(j.matrix.copy(oe.matrixWorld),j.matrix.invert(),j.matrix.multiply(K.matrixWorld)),j.matrix.decompose(j.position,j.quaternion,j.scale),j.updateMatrixWorld(!0),j.projectionMatrix.copy(K.projectionMatrix),j.projectionMatrixInverse.copy(K.projectionMatrixInverse),j.isPerspectiveCamera&&(j.fov=rs*2*Math.atan(1/j.projectionMatrix.elements[5]),j.zoom=1)}this.getCamera=function(){return N},this.getFoveation=function(){if(!(f===null&&p===null))return l},this.setFoveation=function(j){l=j,f!==null&&(f.fixedFoveation=j),p!==null&&p.fixedFoveation!==void 0&&(p.fixedFoveation=j)},this.hasDepthSensing=function(){return m.texture!==null},this.getDepthSensingMesh=function(){return m.getMesh(N)},this.getCameraTexture=function(j){return d[j]};let Ue=null;function je(j,K){if(h=K.getViewerPose(c||a),g=K,h!==null){const oe=h.views;p!==null&&(e.setRenderTargetFramebuffer(M,p.framebuffer),e.setRenderTarget(M));let Te=!1;oe.length!==N.cameras.length&&(N.cameras.length=0,Te=!0);for(let R=0;R<oe.length;R++){const ke=oe[R];let we=null;if(p!==null)we=p.getViewport(ke);else{const de=u.getViewSubImage(f,ke);we=de.viewport,R===0&&(e.setRenderTargetTextures(M,de.colorTexture,de.depthStencilTexture),e.setRenderTarget(M))}let xe=P[R];xe===void 0&&(xe=new Ht,xe.layers.enable(R),xe.viewport=new Qe,P[R]=xe),xe.matrix.fromArray(ke.transform.matrix),xe.matrix.decompose(xe.position,xe.quaternion,xe.scale),xe.projectionMatrix.fromArray(ke.projectionMatrix),xe.projectionMatrixInverse.copy(xe.projectionMatrix).invert(),xe.viewport.set(we.x,we.y,we.width,we.height),R===0&&(N.matrix.copy(xe.matrix),N.matrix.decompose(N.position,N.quaternion,N.scale)),Te===!0&&N.cameras.push(xe)}const re=s.enabledFeatures;if(re&&re.includes("depth-sensing")&&s.depthUsage=="gpu-optimized"&&_){u=n.getBinding();const R=u.getDepthInformation(oe[0]);R&&R.isValid&&R.texture&&m.init(R,s.renderState)}if(re&&re.includes("camera-access")&&_){e.state.unbindTexture(),u=n.getBinding();for(let R=0;R<oe.length;R++){const ke=oe[R].camera;if(ke){let we=d[ke];we||(we=new Sh,d[ke]=we);const xe=u.getCameraImage(ke);we.sourceTexture=xe}}}}for(let oe=0;oe<w.length;oe++){const Te=A[oe],re=w[oe];Te!==null&&re!==void 0&&re.update(Te,K,c||a)}Ue&&Ue(j,K),K.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:K}),g=null}const He=new vh;He.setAnimationLoop(je),this.setAnimationLoop=function(j){Ue=j},this.dispose=function(){}}}const ui=new pn,v_=new Xe;function M_(i,e){function t(m,d){m.matrixAutoUpdate===!0&&m.updateMatrix(),d.value.copy(m.matrix)}function n(m,d){d.color.getRGB(m.fogColor.value,gh(i)),d.isFog?(m.fogNear.value=d.near,m.fogFar.value=d.far):d.isFogExp2&&(m.fogDensity.value=d.density)}function s(m,d,b,E,M){d.isMeshBasicMaterial||d.isMeshLambertMaterial?r(m,d):d.isMeshToonMaterial?(r(m,d),u(m,d)):d.isMeshPhongMaterial?(r(m,d),h(m,d)):d.isMeshStandardMaterial?(r(m,d),f(m,d),d.isMeshPhysicalMaterial&&p(m,d,M)):d.isMeshMatcapMaterial?(r(m,d),g(m,d)):d.isMeshDepthMaterial?r(m,d):d.isMeshDistanceMaterial?(r(m,d),_(m,d)):d.isMeshNormalMaterial?r(m,d):d.isLineBasicMaterial?(a(m,d),d.isLineDashedMaterial&&o(m,d)):d.isPointsMaterial?l(m,d,b,E):d.isSpriteMaterial?c(m,d):d.isShadowMaterial?(m.color.value.copy(d.color),m.opacity.value=d.opacity):d.isShaderMaterial&&(d.uniformsNeedUpdate=!1)}function r(m,d){m.opacity.value=d.opacity,d.color&&m.diffuse.value.copy(d.color),d.emissive&&m.emissive.value.copy(d.emissive).multiplyScalar(d.emissiveIntensity),d.map&&(m.map.value=d.map,t(d.map,m.mapTransform)),d.alphaMap&&(m.alphaMap.value=d.alphaMap,t(d.alphaMap,m.alphaMapTransform)),d.bumpMap&&(m.bumpMap.value=d.bumpMap,t(d.bumpMap,m.bumpMapTransform),m.bumpScale.value=d.bumpScale,d.side===Ut&&(m.bumpScale.value*=-1)),d.normalMap&&(m.normalMap.value=d.normalMap,t(d.normalMap,m.normalMapTransform),m.normalScale.value.copy(d.normalScale),d.side===Ut&&m.normalScale.value.negate()),d.displacementMap&&(m.displacementMap.value=d.displacementMap,t(d.displacementMap,m.displacementMapTransform),m.displacementScale.value=d.displacementScale,m.displacementBias.value=d.displacementBias),d.emissiveMap&&(m.emissiveMap.value=d.emissiveMap,t(d.emissiveMap,m.emissiveMapTransform)),d.specularMap&&(m.specularMap.value=d.specularMap,t(d.specularMap,m.specularMapTransform)),d.alphaTest>0&&(m.alphaTest.value=d.alphaTest);const b=e.get(d),E=b.envMap,M=b.envMapRotation;E&&(m.envMap.value=E,ui.copy(M),ui.x*=-1,ui.y*=-1,ui.z*=-1,E.isCubeTexture&&E.isRenderTargetTexture===!1&&(ui.y*=-1,ui.z*=-1),m.envMapRotation.value.setFromMatrix4(v_.makeRotationFromEuler(ui)),m.flipEnvMap.value=E.isCubeTexture&&E.isRenderTargetTexture===!1?-1:1,m.reflectivity.value=d.reflectivity,m.ior.value=d.ior,m.refractionRatio.value=d.refractionRatio),d.lightMap&&(m.lightMap.value=d.lightMap,m.lightMapIntensity.value=d.lightMapIntensity,t(d.lightMap,m.lightMapTransform)),d.aoMap&&(m.aoMap.value=d.aoMap,m.aoMapIntensity.value=d.aoMapIntensity,t(d.aoMap,m.aoMapTransform))}function a(m,d){m.diffuse.value.copy(d.color),m.opacity.value=d.opacity,d.map&&(m.map.value=d.map,t(d.map,m.mapTransform))}function o(m,d){m.dashSize.value=d.dashSize,m.totalSize.value=d.dashSize+d.gapSize,m.scale.value=d.scale}function l(m,d,b,E){m.diffuse.value.copy(d.color),m.opacity.value=d.opacity,m.size.value=d.size*b,m.scale.value=E*.5,d.map&&(m.map.value=d.map,t(d.map,m.uvTransform)),d.alphaMap&&(m.alphaMap.value=d.alphaMap,t(d.alphaMap,m.alphaMapTransform)),d.alphaTest>0&&(m.alphaTest.value=d.alphaTest)}function c(m,d){m.diffuse.value.copy(d.color),m.opacity.value=d.opacity,m.rotation.value=d.rotation,d.map&&(m.map.value=d.map,t(d.map,m.mapTransform)),d.alphaMap&&(m.alphaMap.value=d.alphaMap,t(d.alphaMap,m.alphaMapTransform)),d.alphaTest>0&&(m.alphaTest.value=d.alphaTest)}function h(m,d){m.specular.value.copy(d.specular),m.shininess.value=Math.max(d.shininess,1e-4)}function u(m,d){d.gradientMap&&(m.gradientMap.value=d.gradientMap)}function f(m,d){m.metalness.value=d.metalness,d.metalnessMap&&(m.metalnessMap.value=d.metalnessMap,t(d.metalnessMap,m.metalnessMapTransform)),m.roughness.value=d.roughness,d.roughnessMap&&(m.roughnessMap.value=d.roughnessMap,t(d.roughnessMap,m.roughnessMapTransform)),d.envMap&&(m.envMapIntensity.value=d.envMapIntensity)}function p(m,d,b){m.ior.value=d.ior,d.sheen>0&&(m.sheenColor.value.copy(d.sheenColor).multiplyScalar(d.sheen),m.sheenRoughness.value=d.sheenRoughness,d.sheenColorMap&&(m.sheenColorMap.value=d.sheenColorMap,t(d.sheenColorMap,m.sheenColorMapTransform)),d.sheenRoughnessMap&&(m.sheenRoughnessMap.value=d.sheenRoughnessMap,t(d.sheenRoughnessMap,m.sheenRoughnessMapTransform))),d.clearcoat>0&&(m.clearcoat.value=d.clearcoat,m.clearcoatRoughness.value=d.clearcoatRoughness,d.clearcoatMap&&(m.clearcoatMap.value=d.clearcoatMap,t(d.clearcoatMap,m.clearcoatMapTransform)),d.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=d.clearcoatRoughnessMap,t(d.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),d.clearcoatNormalMap&&(m.clearcoatNormalMap.value=d.clearcoatNormalMap,t(d.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(d.clearcoatNormalScale),d.side===Ut&&m.clearcoatNormalScale.value.negate())),d.dispersion>0&&(m.dispersion.value=d.dispersion),d.iridescence>0&&(m.iridescence.value=d.iridescence,m.iridescenceIOR.value=d.iridescenceIOR,m.iridescenceThicknessMinimum.value=d.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=d.iridescenceThicknessRange[1],d.iridescenceMap&&(m.iridescenceMap.value=d.iridescenceMap,t(d.iridescenceMap,m.iridescenceMapTransform)),d.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=d.iridescenceThicknessMap,t(d.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),d.transmission>0&&(m.transmission.value=d.transmission,m.transmissionSamplerMap.value=b.texture,m.transmissionSamplerSize.value.set(b.width,b.height),d.transmissionMap&&(m.transmissionMap.value=d.transmissionMap,t(d.transmissionMap,m.transmissionMapTransform)),m.thickness.value=d.thickness,d.thicknessMap&&(m.thicknessMap.value=d.thicknessMap,t(d.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=d.attenuationDistance,m.attenuationColor.value.copy(d.attenuationColor)),d.anisotropy>0&&(m.anisotropyVector.value.set(d.anisotropy*Math.cos(d.anisotropyRotation),d.anisotropy*Math.sin(d.anisotropyRotation)),d.anisotropyMap&&(m.anisotropyMap.value=d.anisotropyMap,t(d.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=d.specularIntensity,m.specularColor.value.copy(d.specularColor),d.specularColorMap&&(m.specularColorMap.value=d.specularColorMap,t(d.specularColorMap,m.specularColorMapTransform)),d.specularIntensityMap&&(m.specularIntensityMap.value=d.specularIntensityMap,t(d.specularIntensityMap,m.specularIntensityMapTransform))}function g(m,d){d.matcap&&(m.matcap.value=d.matcap)}function _(m,d){const b=e.get(d).light;m.referencePosition.value.setFromMatrixPosition(b.matrixWorld),m.nearDistance.value=b.shadow.camera.near,m.farDistance.value=b.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:s}}function y_(i,e,t,n){let s={},r={},a=[];const o=i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS);function l(b,E){const M=E.program;n.uniformBlockBinding(b,M)}function c(b,E){let M=s[b.id];M===void 0&&(g(b),M=h(b),s[b.id]=M,b.addEventListener("dispose",m));const w=E.program;n.updateUBOMapping(b,w);const A=e.render.frame;r[b.id]!==A&&(f(b),r[b.id]=A)}function h(b){const E=u();b.__bindingPointIndex=E;const M=i.createBuffer(),w=b.__size,A=b.usage;return i.bindBuffer(i.UNIFORM_BUFFER,M),i.bufferData(i.UNIFORM_BUFFER,w,A),i.bindBuffer(i.UNIFORM_BUFFER,null),i.bindBufferBase(i.UNIFORM_BUFFER,E,M),M}function u(){for(let b=0;b<o;b++)if(a.indexOf(b)===-1)return a.push(b),b;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function f(b){const E=s[b.id],M=b.uniforms,w=b.__cache;i.bindBuffer(i.UNIFORM_BUFFER,E);for(let A=0,C=M.length;A<C;A++){const D=Array.isArray(M[A])?M[A]:[M[A]];for(let S=0,y=D.length;S<y;S++){const P=D[S];if(p(P,A,S,w)===!0){const N=P.__offset,z=Array.isArray(P.value)?P.value:[P.value];let q=0;for(let G=0;G<z.length;G++){const V=z[G],$=_(V);typeof V=="number"||typeof V=="boolean"?(P.__data[0]=V,i.bufferSubData(i.UNIFORM_BUFFER,N+q,P.__data)):V.isMatrix3?(P.__data[0]=V.elements[0],P.__data[1]=V.elements[1],P.__data[2]=V.elements[2],P.__data[3]=0,P.__data[4]=V.elements[3],P.__data[5]=V.elements[4],P.__data[6]=V.elements[5],P.__data[7]=0,P.__data[8]=V.elements[6],P.__data[9]=V.elements[7],P.__data[10]=V.elements[8],P.__data[11]=0):(V.toArray(P.__data,q),q+=$.storage/Float32Array.BYTES_PER_ELEMENT)}i.bufferSubData(i.UNIFORM_BUFFER,N,P.__data)}}}i.bindBuffer(i.UNIFORM_BUFFER,null)}function p(b,E,M,w){const A=b.value,C=E+"_"+M;if(w[C]===void 0)return typeof A=="number"||typeof A=="boolean"?w[C]=A:w[C]=A.clone(),!0;{const D=w[C];if(typeof A=="number"||typeof A=="boolean"){if(D!==A)return w[C]=A,!0}else if(D.equals(A)===!1)return D.copy(A),!0}return!1}function g(b){const E=b.uniforms;let M=0;const w=16;for(let C=0,D=E.length;C<D;C++){const S=Array.isArray(E[C])?E[C]:[E[C]];for(let y=0,P=S.length;y<P;y++){const N=S[y],z=Array.isArray(N.value)?N.value:[N.value];for(let q=0,G=z.length;q<G;q++){const V=z[q],$=_(V),k=M%w,ie=k%$.boundary,ce=k+ie;M+=ie,ce!==0&&w-ce<$.storage&&(M+=w-ce),N.__data=new Float32Array($.storage/Float32Array.BYTES_PER_ELEMENT),N.__offset=M,M+=$.storage}}}const A=M%w;return A>0&&(M+=w-A),b.__size=M,b.__cache={},this}function _(b){const E={boundary:0,storage:0};return typeof b=="number"||typeof b=="boolean"?(E.boundary=4,E.storage=4):b.isVector2?(E.boundary=8,E.storage=8):b.isVector3||b.isColor?(E.boundary=16,E.storage=12):b.isVector4?(E.boundary=16,E.storage=16):b.isMatrix3?(E.boundary=48,E.storage=48):b.isMatrix4?(E.boundary=64,E.storage=64):b.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",b),E}function m(b){const E=b.target;E.removeEventListener("dispose",m);const M=a.indexOf(E.__bindingPointIndex);a.splice(M,1),i.deleteBuffer(s[E.id]),delete s[E.id],delete r[E.id]}function d(){for(const b in s)i.deleteBuffer(s[b]);a=[],s={},r={}}return{bind:l,update:c,dispose:d}}class b_{constructor(e={}){const{canvas:t=Qd(),context:n=null,depth:s=!0,stencil:r=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:u=!1,reversedDepthBuffer:f=!1}=e;this.isWebGLRenderer=!0;let p;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");p=n.getContextAttributes().alpha}else p=a;const g=new Uint32Array(4),_=new Int32Array(4);let m=null,d=null;const b=[],E=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=Qn,this.toneMappingExposure=1,this.transmissionResolutionScale=1;const M=this;let w=!1;this._outputColorSpace=St;let A=0,C=0,D=null,S=-1,y=null;const P=new Qe,N=new Qe;let z=null;const q=new Oe(0);let G=0,V=t.width,$=t.height,k=1,ie=null,ce=null;const ue=new Qe(0,0,V,$),Ie=new Qe(0,0,V,$);let Ue=!1;const je=new Ho;let He=!1,j=!1;const K=new Xe,oe=new L,Te=new Qe,re={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let pe=!1;function Ce(){return D===null?k:1}let R=n;function ke(v,O){return t.getContext(v,O)}try{const v={alpha:!0,depth:s,stencil:r,antialias:o,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:h,failIfMajorPerformanceCaveat:u};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${To}`),t.addEventListener("webglcontextlost",se,!1),t.addEventListener("webglcontextrestored",ge,!1),t.addEventListener("webglcontextcreationerror",J,!1),R===null){const O="webgl2";if(R=ke(O,v),R===null)throw ke(O)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(v){throw console.error("THREE.WebGLRenderer: "+v.message),v}let we,xe,de,et,_e,Ne,lt,st,T,x,U,X,Z,W,Ee,ne,Me,ye,ee,fe,Le,be,le,ze;function I(){we=new Ig(R),we.init(),be=new m_(R,we),xe=new wg(R,we,e,be),de=new f_(R,we),xe.reversedDepthBuffer&&f&&de.buffers.depth.setReversed(!0),et=new Fg(R),_e=new e_,Ne=new p_(R,we,de,_e,xe,be,et),lt=new Rg(M),st=new Dg(M),T=new Gf(R),le=new Eg(R,T),x=new Og(R,T,et,le),U=new zg(R,x,T,et),ee=new Ug(R,xe,Ne),ne=new Ag(_e),X=new Q0(M,lt,st,we,xe,le,ne),Z=new M_(M,_e),W=new n_,Ee=new l_(we),ye=new bg(M,lt,st,de,U,p,l),Me=new u_(M,U,xe),ze=new y_(R,et,xe,de),fe=new Tg(R,we,et),Le=new Ng(R,we,et),et.programs=X.programs,M.capabilities=xe,M.extensions=we,M.properties=_e,M.renderLists=W,M.shadowMap=Me,M.state=de,M.info=et}I();const te=new S_(M,R);this.xr=te,this.getContext=function(){return R},this.getContextAttributes=function(){return R.getContextAttributes()},this.forceContextLoss=function(){const v=we.get("WEBGL_lose_context");v&&v.loseContext()},this.forceContextRestore=function(){const v=we.get("WEBGL_lose_context");v&&v.restoreContext()},this.getPixelRatio=function(){return k},this.setPixelRatio=function(v){v!==void 0&&(k=v,this.setSize(V,$,!1))},this.getSize=function(v){return v.set(V,$)},this.setSize=function(v,O,B=!0){if(te.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}V=v,$=O,t.width=Math.floor(v*k),t.height=Math.floor(O*k),B===!0&&(t.style.width=v+"px",t.style.height=O+"px"),this.setViewport(0,0,v,O)},this.getDrawingBufferSize=function(v){return v.set(V*k,$*k).floor()},this.setDrawingBufferSize=function(v,O,B){V=v,$=O,k=B,t.width=Math.floor(v*B),t.height=Math.floor(O*B),this.setViewport(0,0,v,O)},this.getCurrentViewport=function(v){return v.copy(P)},this.getViewport=function(v){return v.copy(ue)},this.setViewport=function(v,O,B,H){v.isVector4?ue.set(v.x,v.y,v.z,v.w):ue.set(v,O,B,H),de.viewport(P.copy(ue).multiplyScalar(k).round())},this.getScissor=function(v){return v.copy(Ie)},this.setScissor=function(v,O,B,H){v.isVector4?Ie.set(v.x,v.y,v.z,v.w):Ie.set(v,O,B,H),de.scissor(N.copy(Ie).multiplyScalar(k).round())},this.getScissorTest=function(){return Ue},this.setScissorTest=function(v){de.setScissorTest(Ue=v)},this.setOpaqueSort=function(v){ie=v},this.setTransparentSort=function(v){ce=v},this.getClearColor=function(v){return v.copy(ye.getClearColor())},this.setClearColor=function(){ye.setClearColor(...arguments)},this.getClearAlpha=function(){return ye.getClearAlpha()},this.setClearAlpha=function(){ye.setClearAlpha(...arguments)},this.clear=function(v=!0,O=!0,B=!0){let H=0;if(v){let F=!1;if(D!==null){const Q=D.texture.format;F=Q===Io||Q===Do||Q===Lo}if(F){const Q=D.texture.type,he=Q===yn||Q===_i||Q===Rs||Q===Cs||Q===Ro||Q===Co,Se=ye.getClearColor(),me=ye.getClearAlpha(),Pe=Se.r,De=Se.g,Ae=Se.b;he?(g[0]=Pe,g[1]=De,g[2]=Ae,g[3]=me,R.clearBufferuiv(R.COLOR,0,g)):(_[0]=Pe,_[1]=De,_[2]=Ae,_[3]=me,R.clearBufferiv(R.COLOR,0,_))}else H|=R.COLOR_BUFFER_BIT}O&&(H|=R.DEPTH_BUFFER_BIT),B&&(H|=R.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),R.clear(H)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",se,!1),t.removeEventListener("webglcontextrestored",ge,!1),t.removeEventListener("webglcontextcreationerror",J,!1),ye.dispose(),W.dispose(),Ee.dispose(),_e.dispose(),lt.dispose(),st.dispose(),U.dispose(),le.dispose(),ze.dispose(),X.dispose(),te.dispose(),te.removeEventListener("sessionstart",mn),te.removeEventListener("sessionend",$o),si.stop()};function se(v){v.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),w=!0}function ge(){console.log("THREE.WebGLRenderer: Context Restored."),w=!1;const v=et.autoReset,O=Me.enabled,B=Me.autoUpdate,H=Me.needsUpdate,F=Me.type;I(),et.autoReset=v,Me.enabled=O,Me.autoUpdate=B,Me.needsUpdate=H,Me.type=F}function J(v){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",v.statusMessage)}function Y(v){const O=v.target;O.removeEventListener("dispose",Y),ve(O)}function ve(v){Fe(v),_e.remove(v)}function Fe(v){const O=_e.get(v).programs;O!==void 0&&(O.forEach(function(B){X.releaseProgram(B)}),v.isShaderMaterial&&X.releaseShaderCache(v))}this.renderBufferDirect=function(v,O,B,H,F,Q){O===null&&(O=re);const he=F.isMesh&&F.matrixWorld.determinant()<0,Se=Rh(v,O,B,H,F);de.setMaterial(H,he);let me=B.index,Pe=1;if(H.wireframe===!0){if(me=x.getWireframeAttribute(B),me===void 0)return;Pe=2}const De=B.drawRange,Ae=B.attributes.position;let We=De.start*Pe,Ze=(De.start+De.count)*Pe;Q!==null&&(We=Math.max(We,Q.start*Pe),Ze=Math.min(Ze,(Q.start+Q.count)*Pe)),me!==null?(We=Math.max(We,0),Ze=Math.min(Ze,me.count)):Ae!=null&&(We=Math.max(We,0),Ze=Math.min(Ze,Ae.count));const ct=Ze-We;if(ct<0||ct===1/0)return;le.setup(F,H,Se,B,me);let rt,tt=fe;if(me!==null&&(rt=T.get(me),tt=Le,tt.setIndex(rt)),F.isMesh)H.wireframe===!0?(de.setLineWidth(H.wireframeLinewidth*Ce()),tt.setMode(R.LINES)):tt.setMode(R.TRIANGLES);else if(F.isLine){let Re=H.linewidth;Re===void 0&&(Re=1),de.setLineWidth(Re*Ce()),F.isLineSegments?tt.setMode(R.LINES):F.isLineLoop?tt.setMode(R.LINE_LOOP):tt.setMode(R.LINE_STRIP)}else F.isPoints?tt.setMode(R.POINTS):F.isSprite&&tt.setMode(R.TRIANGLES);if(F.isBatchedMesh)if(F._multiDrawInstances!==null)Ds("THREE.WebGLRenderer: renderMultiDrawInstances has been deprecated and will be removed in r184. Append to renderMultiDraw arguments and use indirection."),tt.renderMultiDrawInstances(F._multiDrawStarts,F._multiDrawCounts,F._multiDrawCount,F._multiDrawInstances);else if(we.get("WEBGL_multi_draw"))tt.renderMultiDraw(F._multiDrawStarts,F._multiDrawCounts,F._multiDrawCount);else{const Re=F._multiDrawStarts,at=F._multiDrawCounts,Ye=F._multiDrawCount,kt=me?T.get(me).bytesPerElement:1,Mi=_e.get(H).currentProgram.getUniforms();for(let Gt=0;Gt<Ye;Gt++)Mi.setValue(R,"_gl_DrawID",Gt),tt.render(Re[Gt]/kt,at[Gt])}else if(F.isInstancedMesh)tt.renderInstances(We,ct,F.count);else if(B.isInstancedBufferGeometry){const Re=B._maxInstanceCount!==void 0?B._maxInstanceCount:1/0,at=Math.min(B.instanceCount,Re);tt.renderInstances(We,ct,at)}else tt.render(We,ct)};function it(v,O,B){v.transparent===!0&&v.side===cn&&v.forceSinglePass===!1?(v.side=Ut,v.needsUpdate=!0,Us(v,O,B),v.side=ei,v.needsUpdate=!0,Us(v,O,B),v.side=cn):Us(v,O,B)}this.compile=function(v,O,B=null){B===null&&(B=v),d=Ee.get(B),d.init(O),E.push(d),B.traverseVisible(function(F){F.isLight&&F.layers.test(O.layers)&&(d.pushLight(F),F.castShadow&&d.pushShadow(F))}),v!==B&&v.traverseVisible(function(F){F.isLight&&F.layers.test(O.layers)&&(d.pushLight(F),F.castShadow&&d.pushShadow(F))}),d.setupLights();const H=new Set;return v.traverse(function(F){if(!(F.isMesh||F.isPoints||F.isLine||F.isSprite))return;const Q=F.material;if(Q)if(Array.isArray(Q))for(let he=0;he<Q.length;he++){const Se=Q[he];it(Se,B,F),H.add(Se)}else it(Q,B,F),H.add(Q)}),d=E.pop(),H},this.compileAsync=function(v,O,B=null){const H=this.compile(v,O,B);return new Promise(F=>{function Q(){if(H.forEach(function(he){_e.get(he).currentProgram.isReady()&&H.delete(he)}),H.size===0){F(v);return}setTimeout(Q,10)}we.get("KHR_parallel_shader_compile")!==null?Q():setTimeout(Q,10)})};let Ke=null;function bn(v){Ke&&Ke(v)}function mn(){si.stop()}function $o(){si.start()}const si=new vh;si.setAnimationLoop(bn),typeof self<"u"&&si.setContext(self),this.setAnimationLoop=function(v){Ke=v,te.setAnimationLoop(v),v===null?si.stop():si.start()},te.addEventListener("sessionstart",mn),te.addEventListener("sessionend",$o),this.render=function(v,O){if(O!==void 0&&O.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(w===!0)return;if(v.matrixWorldAutoUpdate===!0&&v.updateMatrixWorld(),O.parent===null&&O.matrixWorldAutoUpdate===!0&&O.updateMatrixWorld(),te.enabled===!0&&te.isPresenting===!0&&(te.cameraAutoUpdate===!0&&te.updateCamera(O),O=te.getCamera()),v.isScene===!0&&v.onBeforeRender(M,v,O,D),d=Ee.get(v,E.length),d.init(O),E.push(d),K.multiplyMatrices(O.projectionMatrix,O.matrixWorldInverse),je.setFromProjectionMatrix(K,vn,O.reversedDepth),j=this.localClippingEnabled,He=ne.init(this.clippingPlanes,j),m=W.get(v,b.length),m.init(),b.push(m),te.enabled===!0&&te.isPresenting===!0){const Q=M.xr.getDepthSensingMesh();Q!==null&&Or(Q,O,-1/0,M.sortObjects)}Or(v,O,0,M.sortObjects),m.finish(),M.sortObjects===!0&&m.sort(ie,ce),pe=te.enabled===!1||te.isPresenting===!1||te.hasDepthSensing()===!1,pe&&ye.addToRenderList(m,v),this.info.render.frame++,He===!0&&ne.beginShadows();const B=d.state.shadowsArray;Me.render(B,v,O),He===!0&&ne.endShadows(),this.info.autoReset===!0&&this.info.reset();const H=m.opaque,F=m.transmissive;if(d.setupLights(),O.isArrayCamera){const Q=O.cameras;if(F.length>0)for(let he=0,Se=Q.length;he<Se;he++){const me=Q[he];Zo(H,F,v,me)}pe&&ye.render(v);for(let he=0,Se=Q.length;he<Se;he++){const me=Q[he];Ko(m,v,me,me.viewport)}}else F.length>0&&Zo(H,F,v,O),pe&&ye.render(v),Ko(m,v,O);D!==null&&C===0&&(Ne.updateMultisampleRenderTarget(D),Ne.updateRenderTargetMipmap(D)),v.isScene===!0&&v.onAfterRender(M,v,O),le.resetDefaultState(),S=-1,y=null,E.pop(),E.length>0?(d=E[E.length-1],He===!0&&ne.setGlobalState(M.clippingPlanes,d.state.camera)):d=null,b.pop(),b.length>0?m=b[b.length-1]:m=null};function Or(v,O,B,H){if(v.visible===!1)return;if(v.layers.test(O.layers)){if(v.isGroup)B=v.renderOrder;else if(v.isLOD)v.autoUpdate===!0&&v.update(O);else if(v.isLight)d.pushLight(v),v.castShadow&&d.pushShadow(v);else if(v.isSprite){if(!v.frustumCulled||je.intersectsSprite(v)){H&&Te.setFromMatrixPosition(v.matrixWorld).applyMatrix4(K);const he=U.update(v),Se=v.material;Se.visible&&m.push(v,he,Se,B,Te.z,null)}}else if((v.isMesh||v.isLine||v.isPoints)&&(!v.frustumCulled||je.intersectsObject(v))){const he=U.update(v),Se=v.material;if(H&&(v.boundingSphere!==void 0?(v.boundingSphere===null&&v.computeBoundingSphere(),Te.copy(v.boundingSphere.center)):(he.boundingSphere===null&&he.computeBoundingSphere(),Te.copy(he.boundingSphere.center)),Te.applyMatrix4(v.matrixWorld).applyMatrix4(K)),Array.isArray(Se)){const me=he.groups;for(let Pe=0,De=me.length;Pe<De;Pe++){const Ae=me[Pe],We=Se[Ae.materialIndex];We&&We.visible&&m.push(v,he,We,B,Te.z,Ae)}}else Se.visible&&m.push(v,he,Se,B,Te.z,null)}}const Q=v.children;for(let he=0,Se=Q.length;he<Se;he++)Or(Q[he],O,B,H)}function Ko(v,O,B,H){const F=v.opaque,Q=v.transmissive,he=v.transparent;d.setupLightsView(B),He===!0&&ne.setGlobalState(M.clippingPlanes,B),H&&de.viewport(P.copy(H)),F.length>0&&Fs(F,O,B),Q.length>0&&Fs(Q,O,B),he.length>0&&Fs(he,O,B),de.buffers.depth.setTest(!0),de.buffers.depth.setMask(!0),de.buffers.color.setMask(!0),de.setPolygonOffset(!1)}function Zo(v,O,B,H){if((B.isScene===!0?B.overrideMaterial:null)!==null)return;d.state.transmissionRenderTarget[H.id]===void 0&&(d.state.transmissionRenderTarget[H.id]=new ti(1,1,{generateMipmaps:!0,type:we.has("EXT_color_buffer_half_float")||we.has("EXT_color_buffer_float")?Os:yn,minFilter:gi,samples:4,stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:$e.workingColorSpace}));const Q=d.state.transmissionRenderTarget[H.id],he=H.viewport||P;Q.setSize(he.z*M.transmissionResolutionScale,he.w*M.transmissionResolutionScale);const Se=M.getRenderTarget(),me=M.getActiveCubeFace(),Pe=M.getActiveMipmapLevel();M.setRenderTarget(Q),M.getClearColor(q),G=M.getClearAlpha(),G<1&&M.setClearColor(16777215,.5),M.clear(),pe&&ye.render(B);const De=M.toneMapping;M.toneMapping=Qn;const Ae=H.viewport;if(H.viewport!==void 0&&(H.viewport=void 0),d.setupLightsView(H),He===!0&&ne.setGlobalState(M.clippingPlanes,H),Fs(v,B,H),Ne.updateMultisampleRenderTarget(Q),Ne.updateRenderTargetMipmap(Q),we.has("WEBGL_multisampled_render_to_texture")===!1){let We=!1;for(let Ze=0,ct=O.length;Ze<ct;Ze++){const rt=O[Ze],tt=rt.object,Re=rt.geometry,at=rt.material,Ye=rt.group;if(at.side===cn&&tt.layers.test(H.layers)){const kt=at.side;at.side=Ut,at.needsUpdate=!0,Jo(tt,B,H,Re,at,Ye),at.side=kt,at.needsUpdate=!0,We=!0}}We===!0&&(Ne.updateMultisampleRenderTarget(Q),Ne.updateRenderTargetMipmap(Q))}M.setRenderTarget(Se,me,Pe),M.setClearColor(q,G),Ae!==void 0&&(H.viewport=Ae),M.toneMapping=De}function Fs(v,O,B){const H=O.isScene===!0?O.overrideMaterial:null;for(let F=0,Q=v.length;F<Q;F++){const he=v[F],Se=he.object,me=he.geometry,Pe=he.group;let De=he.material;De.allowOverride===!0&&H!==null&&(De=H),Se.layers.test(B.layers)&&Jo(Se,O,B,me,De,Pe)}}function Jo(v,O,B,H,F,Q){v.onBeforeRender(M,O,B,H,F,Q),v.modelViewMatrix.multiplyMatrices(B.matrixWorldInverse,v.matrixWorld),v.normalMatrix.getNormalMatrix(v.modelViewMatrix),F.onBeforeRender(M,O,B,H,v,Q),F.transparent===!0&&F.side===cn&&F.forceSinglePass===!1?(F.side=Ut,F.needsUpdate=!0,M.renderBufferDirect(B,O,H,F,v,Q),F.side=ei,F.needsUpdate=!0,M.renderBufferDirect(B,O,H,F,v,Q),F.side=cn):M.renderBufferDirect(B,O,H,F,v,Q),v.onAfterRender(M,O,B,H,F,Q)}function Us(v,O,B){O.isScene!==!0&&(O=re);const H=_e.get(v),F=d.state.lights,Q=d.state.shadowsArray,he=F.state.version,Se=X.getParameters(v,F.state,Q,O,B),me=X.getProgramCacheKey(Se);let Pe=H.programs;H.environment=v.isMeshStandardMaterial?O.environment:null,H.fog=O.fog,H.envMap=(v.isMeshStandardMaterial?st:lt).get(v.envMap||H.environment),H.envMapRotation=H.environment!==null&&v.envMap===null?O.environmentRotation:v.envMapRotation,Pe===void 0&&(v.addEventListener("dispose",Y),Pe=new Map,H.programs=Pe);let De=Pe.get(me);if(De!==void 0){if(H.currentProgram===De&&H.lightsStateVersion===he)return el(v,Se),De}else Se.uniforms=X.getUniforms(v),v.onBeforeCompile(Se,M),De=X.acquireProgram(Se,me),Pe.set(me,De),H.uniforms=Se.uniforms;const Ae=H.uniforms;return(!v.isShaderMaterial&&!v.isRawShaderMaterial||v.clipping===!0)&&(Ae.clippingPlanes=ne.uniform),el(v,Se),H.needsLights=Ph(v),H.lightsStateVersion=he,H.needsLights&&(Ae.ambientLightColor.value=F.state.ambient,Ae.lightProbe.value=F.state.probe,Ae.directionalLights.value=F.state.directional,Ae.directionalLightShadows.value=F.state.directionalShadow,Ae.spotLights.value=F.state.spot,Ae.spotLightShadows.value=F.state.spotShadow,Ae.rectAreaLights.value=F.state.rectArea,Ae.ltc_1.value=F.state.rectAreaLTC1,Ae.ltc_2.value=F.state.rectAreaLTC2,Ae.pointLights.value=F.state.point,Ae.pointLightShadows.value=F.state.pointShadow,Ae.hemisphereLights.value=F.state.hemi,Ae.directionalShadowMap.value=F.state.directionalShadowMap,Ae.directionalShadowMatrix.value=F.state.directionalShadowMatrix,Ae.spotShadowMap.value=F.state.spotShadowMap,Ae.spotLightMatrix.value=F.state.spotLightMatrix,Ae.spotLightMap.value=F.state.spotLightMap,Ae.pointShadowMap.value=F.state.pointShadowMap,Ae.pointShadowMatrix.value=F.state.pointShadowMatrix),H.currentProgram=De,H.uniformsList=null,De}function Qo(v){if(v.uniformsList===null){const O=v.currentProgram.getUniforms();v.uniformsList=Mr.seqWithValue(O.seq,v.uniforms)}return v.uniformsList}function el(v,O){const B=_e.get(v);B.outputColorSpace=O.outputColorSpace,B.batching=O.batching,B.batchingColor=O.batchingColor,B.instancing=O.instancing,B.instancingColor=O.instancingColor,B.instancingMorph=O.instancingMorph,B.skinning=O.skinning,B.morphTargets=O.morphTargets,B.morphNormals=O.morphNormals,B.morphColors=O.morphColors,B.morphTargetsCount=O.morphTargetsCount,B.numClippingPlanes=O.numClippingPlanes,B.numIntersection=O.numClipIntersection,B.vertexAlphas=O.vertexAlphas,B.vertexTangents=O.vertexTangents,B.toneMapping=O.toneMapping}function Rh(v,O,B,H,F){O.isScene!==!0&&(O=re),Ne.resetTextureUnits();const Q=O.fog,he=H.isMeshStandardMaterial?O.environment:null,Se=D===null?M.outputColorSpace:D.isXRRenderTarget===!0?D.texture.colorSpace:ss,me=(H.isMeshStandardMaterial?st:lt).get(H.envMap||he),Pe=H.vertexColors===!0&&!!B.attributes.color&&B.attributes.color.itemSize===4,De=!!B.attributes.tangent&&(!!H.normalMap||H.anisotropy>0),Ae=!!B.morphAttributes.position,We=!!B.morphAttributes.normal,Ze=!!B.morphAttributes.color;let ct=Qn;H.toneMapped&&(D===null||D.isXRRenderTarget===!0)&&(ct=M.toneMapping);const rt=B.morphAttributes.position||B.morphAttributes.normal||B.morphAttributes.color,tt=rt!==void 0?rt.length:0,Re=_e.get(H),at=d.state.lights;if(He===!0&&(j===!0||v!==y)){const Ct=v===y&&H.id===S;ne.setState(H,v,Ct)}let Ye=!1;H.version===Re.__version?(Re.needsLights&&Re.lightsStateVersion!==at.state.version||Re.outputColorSpace!==Se||F.isBatchedMesh&&Re.batching===!1||!F.isBatchedMesh&&Re.batching===!0||F.isBatchedMesh&&Re.batchingColor===!0&&F.colorTexture===null||F.isBatchedMesh&&Re.batchingColor===!1&&F.colorTexture!==null||F.isInstancedMesh&&Re.instancing===!1||!F.isInstancedMesh&&Re.instancing===!0||F.isSkinnedMesh&&Re.skinning===!1||!F.isSkinnedMesh&&Re.skinning===!0||F.isInstancedMesh&&Re.instancingColor===!0&&F.instanceColor===null||F.isInstancedMesh&&Re.instancingColor===!1&&F.instanceColor!==null||F.isInstancedMesh&&Re.instancingMorph===!0&&F.morphTexture===null||F.isInstancedMesh&&Re.instancingMorph===!1&&F.morphTexture!==null||Re.envMap!==me||H.fog===!0&&Re.fog!==Q||Re.numClippingPlanes!==void 0&&(Re.numClippingPlanes!==ne.numPlanes||Re.numIntersection!==ne.numIntersection)||Re.vertexAlphas!==Pe||Re.vertexTangents!==De||Re.morphTargets!==Ae||Re.morphNormals!==We||Re.morphColors!==Ze||Re.toneMapping!==ct||Re.morphTargetsCount!==tt)&&(Ye=!0):(Ye=!0,Re.__version=H.version);let kt=Re.currentProgram;Ye===!0&&(kt=Us(H,O,F));let Mi=!1,Gt=!1,us=!1;const ot=kt.getUniforms(),$t=Re.uniforms;if(de.useProgram(kt.program)&&(Mi=!0,Gt=!0,us=!0),H.id!==S&&(S=H.id,Gt=!0),Mi||y!==v){de.buffers.depth.getReversed()&&v.reversedDepth!==!0&&(v._reversedDepth=!0,v.updateProjectionMatrix()),ot.setValue(R,"projectionMatrix",v.projectionMatrix),ot.setValue(R,"viewMatrix",v.matrixWorldInverse);const zt=ot.map.cameraPosition;zt!==void 0&&zt.setValue(R,oe.setFromMatrixPosition(v.matrixWorld)),xe.logarithmicDepthBuffer&&ot.setValue(R,"logDepthBufFC",2/(Math.log(v.far+1)/Math.LN2)),(H.isMeshPhongMaterial||H.isMeshToonMaterial||H.isMeshLambertMaterial||H.isMeshBasicMaterial||H.isMeshStandardMaterial||H.isShaderMaterial)&&ot.setValue(R,"isOrthographic",v.isOrthographicCamera===!0),y!==v&&(y=v,Gt=!0,us=!0)}if(F.isSkinnedMesh){ot.setOptional(R,F,"bindMatrix"),ot.setOptional(R,F,"bindMatrixInverse");const Ct=F.skeleton;Ct&&(Ct.boneTexture===null&&Ct.computeBoneTexture(),ot.setValue(R,"boneTexture",Ct.boneTexture,Ne))}F.isBatchedMesh&&(ot.setOptional(R,F,"batchingTexture"),ot.setValue(R,"batchingTexture",F._matricesTexture,Ne),ot.setOptional(R,F,"batchingIdTexture"),ot.setValue(R,"batchingIdTexture",F._indirectTexture,Ne),ot.setOptional(R,F,"batchingColorTexture"),F._colorsTexture!==null&&ot.setValue(R,"batchingColorTexture",F._colorsTexture,Ne));const Kt=B.morphAttributes;if((Kt.position!==void 0||Kt.normal!==void 0||Kt.color!==void 0)&&ee.update(F,B,kt),(Gt||Re.receiveShadow!==F.receiveShadow)&&(Re.receiveShadow=F.receiveShadow,ot.setValue(R,"receiveShadow",F.receiveShadow)),H.isMeshGouraudMaterial&&H.envMap!==null&&($t.envMap.value=me,$t.flipEnvMap.value=me.isCubeTexture&&me.isRenderTargetTexture===!1?-1:1),H.isMeshStandardMaterial&&H.envMap===null&&O.environment!==null&&($t.envMapIntensity.value=O.environmentIntensity),Gt&&(ot.setValue(R,"toneMappingExposure",M.toneMappingExposure),Re.needsLights&&Ch($t,us),Q&&H.fog===!0&&Z.refreshFogUniforms($t,Q),Z.refreshMaterialUniforms($t,H,k,$,d.state.transmissionRenderTarget[v.id]),Mr.upload(R,Qo(Re),$t,Ne)),H.isShaderMaterial&&H.uniformsNeedUpdate===!0&&(Mr.upload(R,Qo(Re),$t,Ne),H.uniformsNeedUpdate=!1),H.isSpriteMaterial&&ot.setValue(R,"center",F.center),ot.setValue(R,"modelViewMatrix",F.modelViewMatrix),ot.setValue(R,"normalMatrix",F.normalMatrix),ot.setValue(R,"modelMatrix",F.matrixWorld),H.isShaderMaterial||H.isRawShaderMaterial){const Ct=H.uniformsGroups;for(let zt=0,Nr=Ct.length;zt<Nr;zt++){const ri=Ct[zt];ze.update(ri,kt),ze.bind(ri,kt)}}return kt}function Ch(v,O){v.ambientLightColor.needsUpdate=O,v.lightProbe.needsUpdate=O,v.directionalLights.needsUpdate=O,v.directionalLightShadows.needsUpdate=O,v.pointLights.needsUpdate=O,v.pointLightShadows.needsUpdate=O,v.spotLights.needsUpdate=O,v.spotLightShadows.needsUpdate=O,v.rectAreaLights.needsUpdate=O,v.hemisphereLights.needsUpdate=O}function Ph(v){return v.isMeshLambertMaterial||v.isMeshToonMaterial||v.isMeshPhongMaterial||v.isMeshStandardMaterial||v.isShadowMaterial||v.isShaderMaterial&&v.lights===!0}this.getActiveCubeFace=function(){return A},this.getActiveMipmapLevel=function(){return C},this.getRenderTarget=function(){return D},this.setRenderTargetTextures=function(v,O,B){const H=_e.get(v);H.__autoAllocateDepthBuffer=v.resolveDepthBuffer===!1,H.__autoAllocateDepthBuffer===!1&&(H.__useRenderToTexture=!1),_e.get(v.texture).__webglTexture=O,_e.get(v.depthTexture).__webglTexture=H.__autoAllocateDepthBuffer?void 0:B,H.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(v,O){const B=_e.get(v);B.__webglFramebuffer=O,B.__useDefaultFramebuffer=O===void 0};const Lh=R.createFramebuffer();this.setRenderTarget=function(v,O=0,B=0){D=v,A=O,C=B;let H=!0,F=null,Q=!1,he=!1;if(v){const me=_e.get(v);if(me.__useDefaultFramebuffer!==void 0)de.bindFramebuffer(R.FRAMEBUFFER,null),H=!1;else if(me.__webglFramebuffer===void 0)Ne.setupRenderTarget(v);else if(me.__hasExternalTextures)Ne.rebindTextures(v,_e.get(v.texture).__webglTexture,_e.get(v.depthTexture).__webglTexture);else if(v.depthBuffer){const Ae=v.depthTexture;if(me.__boundDepthTexture!==Ae){if(Ae!==null&&_e.has(Ae)&&(v.width!==Ae.image.width||v.height!==Ae.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");Ne.setupDepthRenderbuffer(v)}}const Pe=v.texture;(Pe.isData3DTexture||Pe.isDataArrayTexture||Pe.isCompressedArrayTexture)&&(he=!0);const De=_e.get(v).__webglFramebuffer;v.isWebGLCubeRenderTarget?(Array.isArray(De[O])?F=De[O][B]:F=De[O],Q=!0):v.samples>0&&Ne.useMultisampledRTT(v)===!1?F=_e.get(v).__webglMultisampledFramebuffer:Array.isArray(De)?F=De[B]:F=De,P.copy(v.viewport),N.copy(v.scissor),z=v.scissorTest}else P.copy(ue).multiplyScalar(k).floor(),N.copy(Ie).multiplyScalar(k).floor(),z=Ue;if(B!==0&&(F=Lh),de.bindFramebuffer(R.FRAMEBUFFER,F)&&H&&de.drawBuffers(v,F),de.viewport(P),de.scissor(N),de.setScissorTest(z),Q){const me=_e.get(v.texture);R.framebufferTexture2D(R.FRAMEBUFFER,R.COLOR_ATTACHMENT0,R.TEXTURE_CUBE_MAP_POSITIVE_X+O,me.__webglTexture,B)}else if(he){const me=O;for(let Pe=0;Pe<v.textures.length;Pe++){const De=_e.get(v.textures[Pe]);R.framebufferTextureLayer(R.FRAMEBUFFER,R.COLOR_ATTACHMENT0+Pe,De.__webglTexture,B,me)}}else if(v!==null&&B!==0){const me=_e.get(v.texture);R.framebufferTexture2D(R.FRAMEBUFFER,R.COLOR_ATTACHMENT0,R.TEXTURE_2D,me.__webglTexture,B)}S=-1},this.readRenderTargetPixels=function(v,O,B,H,F,Q,he,Se=0){if(!(v&&v.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let me=_e.get(v).__webglFramebuffer;if(v.isWebGLCubeRenderTarget&&he!==void 0&&(me=me[he]),me){de.bindFramebuffer(R.FRAMEBUFFER,me);try{const Pe=v.textures[Se],De=Pe.format,Ae=Pe.type;if(!xe.textureFormatReadable(De)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!xe.textureTypeReadable(Ae)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}O>=0&&O<=v.width-H&&B>=0&&B<=v.height-F&&(v.textures.length>1&&R.readBuffer(R.COLOR_ATTACHMENT0+Se),R.readPixels(O,B,H,F,be.convert(De),be.convert(Ae),Q))}finally{const Pe=D!==null?_e.get(D).__webglFramebuffer:null;de.bindFramebuffer(R.FRAMEBUFFER,Pe)}}},this.readRenderTargetPixelsAsync=async function(v,O,B,H,F,Q,he,Se=0){if(!(v&&v.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let me=_e.get(v).__webglFramebuffer;if(v.isWebGLCubeRenderTarget&&he!==void 0&&(me=me[he]),me)if(O>=0&&O<=v.width-H&&B>=0&&B<=v.height-F){de.bindFramebuffer(R.FRAMEBUFFER,me);const Pe=v.textures[Se],De=Pe.format,Ae=Pe.type;if(!xe.textureFormatReadable(De))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!xe.textureTypeReadable(Ae))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");const We=R.createBuffer();R.bindBuffer(R.PIXEL_PACK_BUFFER,We),R.bufferData(R.PIXEL_PACK_BUFFER,Q.byteLength,R.STREAM_READ),v.textures.length>1&&R.readBuffer(R.COLOR_ATTACHMENT0+Se),R.readPixels(O,B,H,F,be.convert(De),be.convert(Ae),0);const Ze=D!==null?_e.get(D).__webglFramebuffer:null;de.bindFramebuffer(R.FRAMEBUFFER,Ze);const ct=R.fenceSync(R.SYNC_GPU_COMMANDS_COMPLETE,0);return R.flush(),await ef(R,ct,4),R.bindBuffer(R.PIXEL_PACK_BUFFER,We),R.getBufferSubData(R.PIXEL_PACK_BUFFER,0,Q),R.deleteBuffer(We),R.deleteSync(ct),Q}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(v,O=null,B=0){const H=Math.pow(2,-B),F=Math.floor(v.image.width*H),Q=Math.floor(v.image.height*H),he=O!==null?O.x:0,Se=O!==null?O.y:0;Ne.setTexture2D(v,0),R.copyTexSubImage2D(R.TEXTURE_2D,B,0,0,he,Se,F,Q),de.unbindTexture()};const Dh=R.createFramebuffer(),Ih=R.createFramebuffer();this.copyTextureToTexture=function(v,O,B=null,H=null,F=0,Q=null){Q===null&&(F!==0?(Ds("WebGLRenderer: copyTextureToTexture function signature has changed to support src and dst mipmap levels."),Q=F,F=0):Q=0);let he,Se,me,Pe,De,Ae,We,Ze,ct;const rt=v.isCompressedTexture?v.mipmaps[Q]:v.image;if(B!==null)he=B.max.x-B.min.x,Se=B.max.y-B.min.y,me=B.isBox3?B.max.z-B.min.z:1,Pe=B.min.x,De=B.min.y,Ae=B.isBox3?B.min.z:0;else{const Kt=Math.pow(2,-F);he=Math.floor(rt.width*Kt),Se=Math.floor(rt.height*Kt),v.isDataArrayTexture?me=rt.depth:v.isData3DTexture?me=Math.floor(rt.depth*Kt):me=1,Pe=0,De=0,Ae=0}H!==null?(We=H.x,Ze=H.y,ct=H.z):(We=0,Ze=0,ct=0);const tt=be.convert(O.format),Re=be.convert(O.type);let at;O.isData3DTexture?(Ne.setTexture3D(O,0),at=R.TEXTURE_3D):O.isDataArrayTexture||O.isCompressedArrayTexture?(Ne.setTexture2DArray(O,0),at=R.TEXTURE_2D_ARRAY):(Ne.setTexture2D(O,0),at=R.TEXTURE_2D),R.pixelStorei(R.UNPACK_FLIP_Y_WEBGL,O.flipY),R.pixelStorei(R.UNPACK_PREMULTIPLY_ALPHA_WEBGL,O.premultiplyAlpha),R.pixelStorei(R.UNPACK_ALIGNMENT,O.unpackAlignment);const Ye=R.getParameter(R.UNPACK_ROW_LENGTH),kt=R.getParameter(R.UNPACK_IMAGE_HEIGHT),Mi=R.getParameter(R.UNPACK_SKIP_PIXELS),Gt=R.getParameter(R.UNPACK_SKIP_ROWS),us=R.getParameter(R.UNPACK_SKIP_IMAGES);R.pixelStorei(R.UNPACK_ROW_LENGTH,rt.width),R.pixelStorei(R.UNPACK_IMAGE_HEIGHT,rt.height),R.pixelStorei(R.UNPACK_SKIP_PIXELS,Pe),R.pixelStorei(R.UNPACK_SKIP_ROWS,De),R.pixelStorei(R.UNPACK_SKIP_IMAGES,Ae);const ot=v.isDataArrayTexture||v.isData3DTexture,$t=O.isDataArrayTexture||O.isData3DTexture;if(v.isDepthTexture){const Kt=_e.get(v),Ct=_e.get(O),zt=_e.get(Kt.__renderTarget),Nr=_e.get(Ct.__renderTarget);de.bindFramebuffer(R.READ_FRAMEBUFFER,zt.__webglFramebuffer),de.bindFramebuffer(R.DRAW_FRAMEBUFFER,Nr.__webglFramebuffer);for(let ri=0;ri<me;ri++)ot&&(R.framebufferTextureLayer(R.READ_FRAMEBUFFER,R.COLOR_ATTACHMENT0,_e.get(v).__webglTexture,F,Ae+ri),R.framebufferTextureLayer(R.DRAW_FRAMEBUFFER,R.COLOR_ATTACHMENT0,_e.get(O).__webglTexture,Q,ct+ri)),R.blitFramebuffer(Pe,De,he,Se,We,Ze,he,Se,R.DEPTH_BUFFER_BIT,R.NEAREST);de.bindFramebuffer(R.READ_FRAMEBUFFER,null),de.bindFramebuffer(R.DRAW_FRAMEBUFFER,null)}else if(F!==0||v.isRenderTargetTexture||_e.has(v)){const Kt=_e.get(v),Ct=_e.get(O);de.bindFramebuffer(R.READ_FRAMEBUFFER,Dh),de.bindFramebuffer(R.DRAW_FRAMEBUFFER,Ih);for(let zt=0;zt<me;zt++)ot?R.framebufferTextureLayer(R.READ_FRAMEBUFFER,R.COLOR_ATTACHMENT0,Kt.__webglTexture,F,Ae+zt):R.framebufferTexture2D(R.READ_FRAMEBUFFER,R.COLOR_ATTACHMENT0,R.TEXTURE_2D,Kt.__webglTexture,F),$t?R.framebufferTextureLayer(R.DRAW_FRAMEBUFFER,R.COLOR_ATTACHMENT0,Ct.__webglTexture,Q,ct+zt):R.framebufferTexture2D(R.DRAW_FRAMEBUFFER,R.COLOR_ATTACHMENT0,R.TEXTURE_2D,Ct.__webglTexture,Q),F!==0?R.blitFramebuffer(Pe,De,he,Se,We,Ze,he,Se,R.COLOR_BUFFER_BIT,R.NEAREST):$t?R.copyTexSubImage3D(at,Q,We,Ze,ct+zt,Pe,De,he,Se):R.copyTexSubImage2D(at,Q,We,Ze,Pe,De,he,Se);de.bindFramebuffer(R.READ_FRAMEBUFFER,null),de.bindFramebuffer(R.DRAW_FRAMEBUFFER,null)}else $t?v.isDataTexture||v.isData3DTexture?R.texSubImage3D(at,Q,We,Ze,ct,he,Se,me,tt,Re,rt.data):O.isCompressedArrayTexture?R.compressedTexSubImage3D(at,Q,We,Ze,ct,he,Se,me,tt,rt.data):R.texSubImage3D(at,Q,We,Ze,ct,he,Se,me,tt,Re,rt):v.isDataTexture?R.texSubImage2D(R.TEXTURE_2D,Q,We,Ze,he,Se,tt,Re,rt.data):v.isCompressedTexture?R.compressedTexSubImage2D(R.TEXTURE_2D,Q,We,Ze,rt.width,rt.height,tt,rt.data):R.texSubImage2D(R.TEXTURE_2D,Q,We,Ze,he,Se,tt,Re,rt);R.pixelStorei(R.UNPACK_ROW_LENGTH,Ye),R.pixelStorei(R.UNPACK_IMAGE_HEIGHT,kt),R.pixelStorei(R.UNPACK_SKIP_PIXELS,Mi),R.pixelStorei(R.UNPACK_SKIP_ROWS,Gt),R.pixelStorei(R.UNPACK_SKIP_IMAGES,us),Q===0&&O.generateMipmaps&&R.generateMipmap(at),de.unbindTexture()},this.initRenderTarget=function(v){_e.get(v).__webglFramebuffer===void 0&&Ne.setupRenderTarget(v)},this.initTexture=function(v){v.isCubeTexture?Ne.setTextureCube(v,0):v.isData3DTexture?Ne.setTexture3D(v,0):v.isDataArrayTexture||v.isCompressedArrayTexture?Ne.setTexture2DArray(v,0):Ne.setTexture2D(v,0),de.unbindTexture()},this.resetState=function(){A=0,C=0,D=null,de.reset(),le.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return vn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;const t=this.getContext();t.drawingBufferColorSpace=$e._getDrawingBufferColorSpace(e),t.unpackColorSpace=$e._getUnpackColorSpace()}}class E_ extends Bo{constructor(){super();const e=new dt;e.deleteAttribute("uv");const t=new Dn({side:Ut}),n=new Dn,s=new zf(16777215,900,28,2);s.position.set(.418,16.199,.3),this.add(s);const r=new ht(e,t);r.position.set(-.757,13.219,.717),r.scale.set(31.713,28.305,28.591),this.add(r);const a=new It(e,n,6),o=new ft;o.position.set(-10.906,2.009,1.846),o.rotation.set(0,-.195,0),o.scale.set(2.328,7.905,4.651),o.updateMatrix(),a.setMatrixAt(0,o.matrix),o.position.set(-5.607,-.754,-.758),o.rotation.set(0,.994,0),o.scale.set(1.97,1.534,3.955),o.updateMatrix(),a.setMatrixAt(1,o.matrix),o.position.set(6.167,.857,7.803),o.rotation.set(0,.561,0),o.scale.set(3.927,6.285,3.687),o.updateMatrix(),a.setMatrixAt(2,o.matrix),o.position.set(-2.017,.018,6.124),o.rotation.set(0,.333,0),o.scale.set(2.002,4.566,2.064),o.updateMatrix(),a.setMatrixAt(3,o.matrix),o.position.set(2.291,-.756,-2.621),o.rotation.set(0,-.286,0),o.scale.set(1.546,1.552,1.496),o.updateMatrix(),a.setMatrixAt(4,o.matrix),o.position.set(-2.193,-.369,-5.547),o.rotation.set(0,.516,0),o.scale.set(3.875,3.487,2.986),o.updateMatrix(),a.setMatrixAt(5,o.matrix),this.add(a);const l=new ht(e,Ui(50));l.position.set(-16.116,14.37,8.208),l.scale.set(.1,2.428,2.739),this.add(l);const c=new ht(e,Ui(50));c.position.set(-16.109,18.021,-8.207),c.scale.set(.1,2.425,2.751),this.add(c);const h=new ht(e,Ui(17));h.position.set(14.904,12.198,-1.832),h.scale.set(.15,4.265,6.331),this.add(h);const u=new ht(e,Ui(43));u.position.set(-.462,8.89,14.52),u.scale.set(4.38,5.441,.088),this.add(u);const f=new ht(e,Ui(20));f.position.set(3.235,11.486,-12.541),f.scale.set(2.5,2,.1),this.add(f);const p=new ht(e,Ui(100));p.position.set(0,20,0),p.scale.set(1,.1,1),this.add(p)}dispose(){const e=new Set;this.traverse(t=>{t.isMesh&&(e.add(t.geometry),e.add(t.material))});for(const t of e)t.dispose()}}function Ui(i){return new Yn({color:0,emissive:16777215,emissiveIntensity:i})}const Sa=360;class T_{renderCpuMilliseconds=new Float32Array(Sa);frameMilliseconds=new Float32Array(Sa);sampleCount=0;renderCpuSum=0;maximumRenderCpuMilliseconds=0;maximumDrawCalls=0;maximumTriangles=0;shaderProgramsAtShotStart=0;shaderProgramsCurrent=0;measurementActive=!1;beginShot(e){this.sampleCount=0,this.renderCpuSum=0,this.maximumRenderCpuMilliseconds=0,this.maximumDrawCalls=0,this.maximumTriangles=0,this.shaderProgramsAtShotStart=e,this.shaderProgramsCurrent=e,this.measurementActive=!0}recordRender(e,t,n,s,r){if(!this.measurementActive)return;const a=Number.isFinite(e)?Math.max(0,e):0,o=Number.isFinite(t)?Math.max(0,t):0;this.sampleCount<Sa&&(this.renderCpuMilliseconds[this.sampleCount]=a,this.frameMilliseconds[this.sampleCount]=o,this.sampleCount+=1,this.renderCpuSum+=a),this.maximumRenderCpuMilliseconds=Math.max(this.maximumRenderCpuMilliseconds,a),this.maximumDrawCalls=Math.max(this.maximumDrawCalls,n),this.maximumTriangles=Math.max(this.maximumTriangles,s),this.shaderProgramsCurrent=r}finishShot(e){this.shaderProgramsCurrent=e,this.measurementActive=!1}snapshot(){const e=this.shaderProgramsCurrent-this.shaderProgramsAtShotStart,t=Array.from(this.frameMilliseconds.subarray(0,this.sampleCount)).sort((s,r)=>s-r),n=va(t,.5);return Object.freeze({measurementActive:this.measurementActive,sampleCount:this.sampleCount,maximumRenderCpuMilliseconds:this.maximumRenderCpuMilliseconds,meanRenderCpuMilliseconds:this.sampleCount===0?0:this.renderCpuSum/this.sampleCount,medianFrameMilliseconds:n,p50FrameMilliseconds:n,p95FrameMilliseconds:va(t,.95),p99FrameMilliseconds:va(t,.99),worstFrameMilliseconds:t.at(-1)??0,maximumDrawCalls:this.maximumDrawCalls,maximumTriangles:this.maximumTriangles,shaderProgramsAtShotStart:this.shaderProgramsAtShotStart,shaderProgramsCurrent:this.shaderProgramsCurrent,shaderProgramDelta:e,shaderProgramsStable:e===0})}}function va(i,e){if(i.length===0)return 0;const t=Math.min(i.length-1,Math.max(0,Math.ceil(i.length*e)-1));return i[t]??0}const Ma=Object.freeze({x:0,y:1.08,z:7}),w_=Object.freeze({x:-3.3,y:2.15,z:-3}),A_=Object.freeze({x:-2.9,y:2.2,z:-3.2}),R_=Object.freeze({x:-2.95,y:2.15,z:-2.9});function bc(i,e){const t=Math.max(1,Math.floor(i)),n=Math.max(1,Math.floor(e)),s=t/n;return s>=2?Object.freeze({profile:"mobile-landscape",aspect:s,verticalFovDegrees:34,position:R_,target:Ma}):s<1.7?Object.freeze({profile:"desktop-compact",aspect:s,verticalFovDegrees:37,position:A_,target:Ma}):Object.freeze({profile:"desktop-wide",aspect:s,verticalFovDegrees:30,position:w_,target:Ma})}class C_{camera=new Ht(47,16/9,.05,80);layout=bc(1920,1080);constructor(){this.camera.name="LockedGameplayCamera",this.camera.userData.activeGameplayCamera=!0,this.applyLayout(this.layout)}resize(e,t){return this.layout=bc(e,t),this.applyLayout(this.layout),this.layout}currentLayout(){return this.layout}projectBounds(e,t){const n=[new L(e.x,e.y,e.z),new L(e.x,e.y,t.z),new L(e.x,t.y,e.z),new L(e.x,t.y,t.z),new L(t.x,e.y,e.z),new L(t.x,e.y,t.z),new L(t.x,t.y,e.z),new L(t.x,t.y,t.z)].map(l=>l.project(this.camera)),s=Math.min(...n.map(l=>l.x)),r=Math.max(...n.map(l=>l.x)),a=Math.max(...n.map(l=>l.y)),o=Math.min(...n.map(l=>l.y));return Object.freeze({left:s,right:r,top:a,bottom:o,width:r-s,height:a-o,visibleWidth:Math.max(0,Math.min(1,r)-Math.max(-1,s)),visibleHeight:Math.max(0,Math.min(1,a)-Math.max(-1,o)),centerX:(s+r)/2,centerY:(a+o)/2,fullyVisible:s>=-1&&r<=1&&o>=-1&&a<=1&&n.every(l=>Number.isFinite(l.x)&&Number.isFinite(l.y)&&Number.isFinite(l.z)&&l.z>=-1&&l.z<=1)})}projectPoint(e){const t=new L(e.x,e.y,e.z).project(this.camera);return Object.freeze({x:t.x,y:t.y,depth:t.z,visible:Number.isFinite(t.x)&&Number.isFinite(t.y)&&Number.isFinite(t.z)&&Math.abs(t.x)<=1&&Math.abs(t.y)<=1&&t.z>=-1&&t.z<=1})}applyLayout(e){this.camera.aspect=e.aspect,this.camera.fov=e.verticalFovDegrees,this.camera.position.set(e.position.x,e.position.y,e.position.z),this.camera.lookAt(e.target.x,e.target.y,e.target.z),this.camera.updateProjectionMatrix(),this.camera.updateMatrixWorld(!0)}}const P_="LockedArenaStaticLayer";class L_{frameWork={drawCalls:0,triangles:0};compositeScene=new Bo;compositeCamera=new qo(-1,1,1,-1,0,1);compositeGeometry=new Ot(2,2);compositeMaterial=new Qt({color:16777215,depthTest:!1,depthWrite:!1,toneMapped:!1});renderTarget=null;quality;widthPixels=0;heightPixels=0;pixelRatio=1;rebuildCount=0;invalidationCount=0;createdRenderTargets=0;disposedRenderTargets=0;staticDrawCallsAtRebuild=0;staticTrianglesAtRebuild=0;valid=!1;disposed=!1;constructor(e){this.quality=e;const t=new ht(this.compositeGeometry,this.compositeMaterial);t.frustumCulled=!1,t.name="LockedArenaStaticLayerComposite",this.compositeScene.add(t)}get isValid(){return this.valid}configure(e,t,n,s){this.assertUsable();const r=Math.max(1,Math.floor(e)),a=Math.max(1,Math.floor(t)),o=Math.max(.25,n);if(this.renderTarget!==null&&this.widthPixels===r&&this.heightPixels===a&&this.pixelRatio===o&&this.quality===s)return!1;this.disposeRenderTarget(),this.widthPixels=r,this.heightPixels=a,this.pixelRatio=o,this.quality=s;const l=Math.max(1,Math.floor(r*o)),c=Math.max(1,Math.floor(a*o));return this.renderTarget=new ti(l,c,{depthBuffer:!0,stencilBuffer:!1,magFilter:tn,minFilter:tn,generateMipmaps:!1}),this.renderTarget.texture.name=P_,this.renderTarget.texture.colorSpace=St,this.compositeMaterial.map=this.renderTarget.texture,this.compositeMaterial.needsUpdate=!0,this.createdRenderTargets+=1,this.invalidationCount+=1,this.valid=!1,!0}async compileComposite(e){this.assertUsable(),await e.compileAsync(this.compositeScene,this.compositeCamera)}rebuild(e,t){this.assertUsable();const n=this.renderTarget;if(n===null)throw new Error("The locked static layer cache must be configured before rebuilding.");const s=e.getRenderTarget();e.setRenderTarget(n);try{e.clear(!0,!0,!0),t(),this.staticDrawCallsAtRebuild=e.info.render.calls,this.staticTrianglesAtRebuild=e.info.render.triangles}finally{e.setRenderTarget(s)}this.valid=!0,this.rebuildCount+=1}present(e,t){if(this.assertUsable(),!this.valid||this.renderTarget===null)throw new Error("The locked static layer cache must be rebuilt before presentation.");const n=e.autoClear;let s=0,r=0,a=0,o=0;try{e.setRenderTarget(null),e.autoClear=!0,e.render(this.compositeScene,this.compositeCamera),s=e.info.render.calls,r=e.info.render.triangles,e.autoClear=!1,e.clearDepth(),t(),a=e.info.render.calls,o=e.info.render.triangles}finally{e.autoClear=n}return this.frameWork.drawCalls=s+a,this.frameWork.triangles=r+o,this.frameWork}diagnostics(){const e=this.renderTarget===null?0:1;return Object.freeze({enabled:!0,valid:this.valid,quality:this.quality,widthPixels:this.widthPixels,heightPixels:this.heightPixels,pixelRatio:this.pixelRatio,rebuildCount:this.rebuildCount,invalidationCount:this.invalidationCount,createdRenderTargets:this.createdRenderTargets,disposedRenderTargets:this.disposedRenderTargets,activeRenderTargets:e,orphanedRenderTargets:this.createdRenderTargets-this.disposedRenderTargets-e,staticDrawCallsAtRebuild:this.staticDrawCallsAtRebuild,staticTrianglesAtRebuild:this.staticTrianglesAtRebuild})}dispose(){this.disposed||(this.disposed=!0,this.disposeRenderTarget(),this.compositeMaterial.dispose(),this.compositeGeometry.dispose())}disposeRenderTarget(){this.renderTarget!==null&&(this.renderTarget.dispose(),this.renderTarget=null,this.compositeMaterial.map=null,this.disposedRenderTargets+=1,this.valid=!1)}assertUsable(){if(this.disposed)throw new Error("The locked static layer cache has been disposed.")}}const D_=-.3,Ec=Object.freeze({name:"authored-bind",bodyLeanX:0,bodyLeanZ:0,bodyTwistY:0,headYaw:0,leftHand:Object.freeze({x:-.35,y:.98,z:.02}),rightHand:Object.freeze({x:.35,y:.98,z:.02}),leftElbowPole:Object.freeze({x:-.58,y:1.18,z:.12}),rightElbowPole:Object.freeze({x:.58,y:1.18,z:.12}),leftFoot:Object.freeze({x:-.17,y:.08,z:.04}),rightFoot:Object.freeze({x:.17,y:.08,z:.04}),leftKneePole:Object.freeze({x:-.22,y:.46,z:.2}),rightKneePole:Object.freeze({x:.22,y:.46,z:.2}),handSpread:.08}),qi=Object.freeze({name:"shooter-aim",bodyLeanX:.08,bodyLeanZ:-.1,bodyTwistY:-.25,headYaw:.2,leftHand:Object.freeze({x:-.36,y:1.2,z:.24}),rightHand:Object.freeze({x:.87,y:1.12,z:.17}),leftElbowPole:Object.freeze({x:-.58,y:1.38,z:.22}),rightElbowPole:Object.freeze({x:.82,y:1.52,z:-.02}),leftFoot:Object.freeze({x:-.25,y:.08,z:.18}),rightFoot:Object.freeze({x:.28,y:.08,z:-.2}),leftKneePole:Object.freeze({x:-.32,y:.45,z:.4}),rightKneePole:Object.freeze({x:.36,y:.48,z:.05}),handSpread:.1}),Tc=Object.freeze({name:"shooter-release",bodyLeanX:.2,bodyLeanZ:.08,bodyTwistY:.22,headYaw:-.12,leftHand:Object.freeze({x:-.4,y:1.3,z:.3}),rightHand:Object.freeze({x:.9,y:1.62,z:.66}),leftElbowPole:Object.freeze({x:-.62,y:1.42,z:.28}),rightElbowPole:Object.freeze({x:.56,y:1.82,z:.48}),leftFoot:Object.freeze({x:-.27,y:.08,z:.24}),rightFoot:Object.freeze({x:.29,y:.08,z:-.12}),leftKneePole:Object.freeze({x:-.34,y:.44,z:.45}),rightKneePole:Object.freeze({x:.37,y:.48,z:.08}),handSpread:.16}),wc=Object.freeze({name:"shooter-follow-through",bodyLeanX:.3,bodyLeanZ:.14,bodyTwistY:.38,headYaw:-.16,leftHand:Object.freeze({x:-.38,y:1.28,z:.3}),rightHand:Object.freeze({x:.9,y:1.5,z:.78}),leftElbowPole:Object.freeze({x:-.58,y:1.38,z:.3}),rightElbowPole:Object.freeze({x:.52,y:1.7,z:.64}),leftFoot:Object.freeze({x:-.28,y:.08,z:.27}),rightFoot:Object.freeze({x:.27,y:.08,z:-.05}),leftKneePole:Object.freeze({x:-.34,y:.42,z:.48}),rightKneePole:Object.freeze({x:.34,y:.45,z:.14}),handSpread:.2}),Ac=Object.freeze({name:"keeper-ready",bodyLeanX:.08,bodyLeanZ:0,bodyTwistY:0,headYaw:0,leftHand:Object.freeze({x:-.48,y:1.28,z:.2}),rightHand:Object.freeze({x:.48,y:1.28,z:.2}),leftElbowPole:Object.freeze({x:-.68,y:1.2,z:.14}),rightElbowPole:Object.freeze({x:.68,y:1.2,z:.14}),leftFoot:Object.freeze({x:-.25,y:.08,z:.12}),rightFoot:Object.freeze({x:.25,y:.08,z:.12}),leftKneePole:Object.freeze({x:-.31,y:.43,z:.37}),rightKneePole:Object.freeze({x:.31,y:.43,z:.37}),handSpread:.16}),Gi=Object.freeze({name:"keeper-anticipation",bodyLeanX:.18,bodyLeanZ:0,bodyTwistY:0,headYaw:0,leftHand:Object.freeze({x:-.56,y:1.1,z:.28}),rightHand:Object.freeze({x:.56,y:1.1,z:.28}),leftElbowPole:Object.freeze({x:-.72,y:1.08,z:.18}),rightElbowPole:Object.freeze({x:.72,y:1.08,z:.18}),leftFoot:Object.freeze({x:-.3,y:.08,z:.15}),rightFoot:Object.freeze({x:.3,y:.08,z:.15}),leftKneePole:Object.freeze({x:-.38,y:.38,z:.48}),rightKneePole:Object.freeze({x:.38,y:.38,z:.48}),handSpread:.2}),I_=Object.freeze({...Gi,name:"keeper-hold",bodyLeanX:.12,leftHand:Object.freeze({x:-.64,y:1.4,z:.24}),rightHand:Object.freeze({x:.64,y:1.4,z:.24}),leftElbowPole:Object.freeze({x:-.76,y:1.22,z:.18}),rightElbowPole:Object.freeze({x:.76,y:1.22,z:.18})}),dr=.42;function Xi(i){return Math.min(1,Math.max(0,i))}function Zn(i){const e=Xi(i);return e*e*(3-2*e)}function O_(i){const e=Xi(i);return 1-(1-e)*(1-e)*(1-e)}function Kn(i,e,t){return i+(e-i)*t}function en(i,e,t){return Object.freeze({x:Kn(i.x,e.x,t),y:Kn(i.y,e.y,t),z:Kn(i.z,e.z,t)})}function In(i,e,t,n){const s=Zn(t);return Object.freeze({name:n,bodyLeanX:Kn(i.bodyLeanX,e.bodyLeanX,s),bodyLeanZ:Kn(i.bodyLeanZ,e.bodyLeanZ,s),bodyTwistY:Kn(i.bodyTwistY,e.bodyTwistY,s),headYaw:Kn(i.headYaw,e.headYaw,s),leftHand:en(i.leftHand,e.leftHand,s),rightHand:en(i.rightHand,e.rightHand,s),leftElbowPole:en(i.leftElbowPole,e.leftElbowPole,s),rightElbowPole:en(i.rightElbowPole,e.rightElbowPole,s),leftFoot:en(i.leftFoot,e.leftFoot,s),rightFoot:en(i.rightFoot,e.rightFoot,s),leftKneePole:en(i.leftKneePole,e.leftKneePole,s),rightKneePole:en(i.rightKneePole,e.rightKneePole,s),handSpread:Kn(i.handSpread,e.handSpread,s)})}function zi(i){const e=Math.sin(i*2.4);return Object.freeze({...qi,name:"shooter-idle-aim",bodyLeanX:qi.bodyLeanX+e*.012,rightHand:Object.freeze({...qi.rightHand,y:qi.rightHand.y+e*.018})})}function Mo(i,e,t,n,s=0,r=0,a="DIRECT",o=0,l){if(i==="RELEASE"&&l!==void 0){const u=Xi(e*(2.6+l)),f=Mo("RELEASE",.42+u*.58,t,n,s,r,a,o),p=In(zi(n),f.pose,Xi(e*16),"shooter-synchronized-release");return{stage:u<.18?"RELEASE":"FOLLOW_THROUGH",releaseAmount:1,pose:{...p,bodyLeanX:p.bodyLeanX+l*u*.04}}}if(i==="FEINT"){const u=Xi(r),f=zi(n);return{stage:u>0?"FEINT":"IDLE",releaseAmount:0,pose:{...f,name:u>0?"shooter-feint-held":"shooter-feint-ready",bodyTwistY:f.bodyTwistY+s*u*.22,bodyLeanZ:f.bodyLeanZ-s*u*.07,rightHand:{x:.55+s*u*.09,y:1.5+u*.18,z:.65+u*.1},rightElbowPole:{...f.rightElbowPole,y:f.rightElbowPole.y+u*.2}}}}if(i==="RELEASE"&&(a!=="DIRECT"||Math.abs(o)>.05)){const u=Mo(i,e,t,n),f=a==="LOB"?.28:a==="BOUNCE"?-.22:0;return{...u,pose:{...u.pose,name:`shooter-${a.toLowerCase()}-${Math.abs(o)>.05?"rosca":u.stage.toLowerCase()}`,bodyTwistY:u.pose.bodyTwistY+o*.22,rightHand:{...u.pose.rightHand,y:u.pose.rightHand.y+f,x:u.pose.rightHand.x+o*.18},rightElbowPole:{...u.pose.rightElbowPole,y:u.pose.rightElbowPole.y+f},handSpread:u.pose.handSpread+Math.abs(o)*.1}}}if(i==="READY"&&e>0){const u=zi(n),f=Zn(e);return{stage:f<.5?"PREPARE":"ACCELERATE",releaseAmount:0,pose:{...u,bodyTwistY:u.bodyTwistY-.06*f,rightElbowPole:{...u.rightElbowPole,y:u.rightElbowPole.y+.08*f}}}}if(i==="READY")return Object.freeze({stage:"IDLE",releaseAmount:0,pose:zi(n)});if(i==="RECOVER"){const u=Zn(t);return Object.freeze({stage:"RECOVERY",releaseAmount:1-u,pose:In(wc,zi(n),u,"shooter-recovery")})}const c=Xi(e);if(c<.16)return Object.freeze({stage:"AIM",releaseAmount:c/.42,pose:In(zi(n),qi,c/.16,"shooter-cocked-aim")});if(c<.42){const u=(c-.16)/.26;return Object.freeze({stage:"RELEASE",releaseAmount:Zn(u),pose:In(qi,Tc,u,"shooter-handball-release")})}const h=(c-.42)/.58;return Object.freeze({stage:"FOLLOW_THROUGH",releaseAmount:1,pose:In(Tc,wc,h,"shooter-follow-through")})}function N_(i){return Object.freeze(i===null?{x:0,y:0}:{x:i.endsWith("left")?-1:i.endsWith("right")?1:0,y:i.startsWith("low")?-1:i.startsWith("high")?1:0})}function F_(i){const e=N_(i),t=e.y<0?.24:e.y>0?1.82:1.08,n=.86,s=e.y>0?.7:.78,r=e.x===0?e.y>0?-.32:e.y===0?.24:.12:0,a=Object.freeze({x:e.x<0?-n:e.x>0?.38:-s,y:t+(e.x<0?.02:-.02),z:.18}),o=Object.freeze({x:e.x>0?n:e.x<0?-.38:s,y:t+(e.x>0?.02:-.02),z:.18}),l=e.x<0?a:e.x>0?o:Object.freeze({x:0,y:(a.y+o.y)/2,z:(a.z+o.z)/2}),c=Object.freeze({name:`keeper-${i}-dive`,bodyLeanX:e.y>0?-.16:.1,bodyLeanZ:e.x*-.88+r,bodyTwistY:e.x*.2,headYaw:e.x*.16,leftHand:a,rightHand:o,leftElbowPole:Object.freeze({x:a.x-.18,y:t-.12,z:.32}),rightElbowPole:Object.freeze({x:o.x+.18,y:t-.12,z:.32}),leftFoot:Object.freeze({x:e.x>0?-.54:e.x<0?-.28:-.5,y:e.y>0?.4:.08,z:e.y<0?.34:-.08}),rightFoot:Object.freeze({x:e.x<0?.54:e.x>0?.28:.5,y:e.y>0?.4:.08,z:e.y<0?.34:-.08}),leftKneePole:Object.freeze({x:-.42,y:.42,z:.4}),rightKneePole:Object.freeze({x:.42,y:.42,z:.4}),handSpread:.36});return Object.freeze({pose:c,reachPoint:l})}function U_(i,e,t,n,s,r,a=!1){const o=Math.sin(r*3)*.012,l=Object.freeze({...Ac,bodyLeanX:Ac.bodyLeanX+o});if(e==="READ")return Object.freeze({stage:"ANTICIPATION",diveAmount:0,pose:Gi,reachPoint:Object.freeze({x:0,y:1.1,z:.28})});if(e==="HOLD"&&i===null)return Object.freeze({stage:"ANTICIPATION",diveAmount:0,pose:I_,reachPoint:Object.freeze({x:0,y:1.4,z:.24})});if(i===null||e==="READY")return Object.freeze({stage:"READY",diveAmount:0,pose:l,reachPoint:Object.freeze({x:0,y:1.28,z:.2})});const c=F_(i),h=a||e==="COMMIT"||e==="RECOVER",u=h?In(Gi,c.pose,dr,`keeper-${i}-commit`):Gi,f=h?en({x:0,y:1.1,z:.28},c.reachPoint,Zn(dr)):{x:0,y:1.1,z:.28};if(e==="COMMIT"||e==="PREPARE"&&a)return Object.freeze({stage:"ANTICIPATION",diveAmount:dr,pose:u,reachPoint:f});if(e==="PREPARE")return Object.freeze({stage:"ANTICIPATION",diveAmount:0,pose:Gi,reachPoint:Object.freeze({x:0,y:1.1,z:.28})});if(e==="RECOVER")return{stage:"RECOVERY",diveAmount:dr*(1-Zn(n)),pose:In(u,l,n,"keeper-feint-recovery"),reachPoint:en(f,{x:0,y:1.28,z:.2},Zn(n))};if(e==="RETURN"){const g=Zn(n),_=s==="SAVED"&&g<.22;return Object.freeze({stage:_?"IMPACT":"RECOVERY",diveAmount:1-g,pose:In(c.pose,l,g,_?`keeper-${i}-impact`:`keeper-${i}-recovery`),reachPoint:en(c.reachPoint,{x:0,y:1.28,z:.2},g)})}const p=e==="HOLD"?1:O_(t);return Object.freeze({stage:e==="HOLD"&&s==="SAVED"?"IMPACT":"DIVE",diveAmount:p,pose:In(a&&p<1?u:Gi,c.pose,p,`keeper-${i}-${e.toLowerCase()}`),reachPoint:en(a&&p<1?f:{x:0,y:1.1,z:.28},c.reachPoint,p)})}const Rc=Object.freeze(["court","painted-metal","fabric","skin","hair","rubber","net","wall-panel","led-board"]),z_={court:834685457,"painted-metal":195936478,fabric:4205954305,skin:1511459345,hair:2702401261,rubber:3021015981,net:242330861,"wall-panel":2702884951,"led-board":517671501},B_={court:.5,"painted-metal":.42,fabric:.78,skin:.67,hair:.86,rubber:.82,net:.72,"wall-panel":.88,"led-board":.36},Th={court:[7,61],"painted-metal":[9,73],fabric:[18,92],skin:[6,47],hair:[12,79],rubber:[10,58],net:[8,64],"wall-panel":[5,43],"led-board":[14,96]};function fr(i,e,t){let n=Math.imul(i+1^t,73244475)^Math.imul(e+1^t>>>8,295559667);return n=Math.imul(n^n>>>16,73244475),n^=n>>>16,(n>>>0)/4294967295}function ya(i,e,t,n){const[s,r]=Th[i],a=Math.sin(e/s*Math.PI*2)*.28+Math.cos(t/(s*1.7)*Math.PI*2)*.18,o=Math.sin((e+t*.37)/r*Math.PI*2)*.16,l=fr(e,t,n)*2-1;switch(i){case"court":{const c=Math.sin(e/46*Math.PI)*.16,h=fr(Math.floor(e/7),Math.floor(t/13),n)-.5;return a*.22+o*.12+l*.16+c+h*.12}case"painted-metal":{const c=Math.sin(t*.82)*.08,h=fr(Math.floor(e/3),Math.floor(t/11),n);return a*.08+l*.08+c+(h>.985?-.48:0)}case"fabric":{const c=Math.sin(e*1.18)*.34,h=Math.sin(t*1.36)*.3;return c+h+a*.08+l*.05}case"skin":return a*.08+o*.05+l*.055;case"hair":return Math.sin(e*.24+t*1.18)*.34+a*.08+l*.06;case"rubber":{const c=Math.sin(e*.44),h=Math.sin(t*.44);return c*h*.28+a*.08+l*.12}case"net":return(Math.sin(e*.62)+Math.sin(t*.62))*.16+l*.06;case"wall-panel":{const c=fr(Math.floor(e/2),Math.floor(t/2),n)-.5,h=e%48<2||t%64<2?-.35:0;return a*.13+c*.3+h}case"led-board":return(t%4===0?-.2:.08)+o*.1+l*.035}}function H_(i,e){return i==="wall-panel"?32:i==="led-board"?Math.max(32,Math.floor(e/2)):e}function ji(i,e){const t=document.createElement("canvas");return t.width=i,t.height=e,t}function Yi(i){const e=i.getContext("2d");if(e===null)throw new Error("Procedural texture generation requires a 2D canvas context.");return e}function $i(i,e,t=1,n=1){const s=new Df(i);return s.colorSpace=e,s.wrapS=As,s.wrapT=As,s.repeat.set(t,n),s.anisotropy=4,s.userData.generatedInCode=!0,s}function k_(i,e){const t=H_(i,e),n=ji(t,t),s=ji(t,t),r=ji(t,t),a=Yi(n),o=Yi(s),l=Yi(r),c=a.createImageData(t,t),h=o.createImageData(t,t),u=l.createImageData(t,t),f=z_[i];for(let m=0;m<t;m+=1)for(let d=0;d<t;d+=1){const b=(m*t+d)*4,E=ya(i,d,m,f),M=ya(i,d+1,m,f),w=ya(i,d,m+1,f),A=On.clamp(Math.round((.82+E*.13)*255),0,255),C=On.clamp(Math.round(128-(M-E)*72),0,255),D=On.clamp(Math.round(128-(w-E)*72),0,255),S=On.clamp(Math.round((B_[i]+E*.09)*255),8,250);c.data[b]=A,c.data[b+1]=A,c.data[b+2]=A,c.data[b+3]=255,h.data[b]=C,h.data[b+1]=D,h.data[b+2]=246,h.data[b+3]=255,u.data[b]=S,u.data[b+1]=S,u.data[b+2]=S,u.data[b+3]=255}a.putImageData(c,0,0),o.putImageData(h,0,0),l.putImageData(u,0,0);let p=null;if(i==="net"){const m=ji(t,t),d=Yi(m);d.fillStyle="#000",d.fillRect(0,0,t,t),d.strokeStyle="#fff",d.lineWidth=Math.max(2,t/80);const b=t/10;for(let E=0;E<=10;E+=1){const M=E*b;d.beginPath(),d.moveTo(M,0),d.lineTo(M,t),d.stroke(),d.beginPath(),d.moveTo(0,M),d.lineTo(t,M),d.stroke()}p=$i(m,hn)}const _={court:[5,7],fabric:[3,5],"painted-metal":[2,5],"wall-panel":[2,2]}[i]??[1,1];return Object.freeze({name:i,albedo:$i(n,St,_[0],_[1]),normal:$i(s,hn,_[0],_[1]),roughness:$i(r,hn,_[0],_[1]),alpha:p,resolution:t,detailScales:Th[i]})}class G_{surfaces=new Map;generatedTextTextures=[];extraTextures=[];maximumResolution;largestAuxiliaryTextureEdge=0;disposed=!1;constructor(e){if(!Number.isInteger(e)||e<96||e>256)throw new RangeError("Procedural texture base resolution must be an integer from 96 to 256.");this.maximumResolution=e;for(const t of Rc)this.surfaces.set(t,k_(t,e))}surface(e){const t=this.surfaces.get(e);if(t===void 0)throw new Error(`Unknown procedural surface '${e}'.`);return t}createTextPanelTexture(e,t){const n=Math.max(t.width,t.height),s=Math.min(1,this.maximumResolution/n),r=Math.max(1,Math.round(t.width*s)),a=Math.max(1,Math.round(t.height*s)),o=ji(r,a),l=Yi(o),c=l.createLinearGradient(0,0,r,0);c.addColorStop(0,t.background),c.addColorStop(.48,"#06162d"),c.addColorStop(1,t.background),l.fillStyle=c,l.fillRect(0,0,r,a),l.fillStyle=t.accent,l.fillRect(0,0,r,Math.max(1,a*.04)),l.fillRect(0,a-Math.max(1,a*.04),r,Math.max(1,a*.04)),l.globalAlpha=.14;for(let u=-a;u<r;u+=a/2)l.beginPath(),l.moveTo(u,a),l.lineTo(u+a*.55,0),l.lineWidth=Math.max(1,a*.018),l.strokeStyle=t.accent,l.stroke();l.globalAlpha=1,l.fillStyle=t.foreground,l.font=`800 ${Math.max(8,Math.round(t.fontPixels*s))}px system-ui, sans-serif`,l.textAlign="center",l.textBaseline="middle",l.fillText(e,r/2,a*.52);const h=$i(o,St);return h.wrapS=dn,h.wrapT=dn,this.generatedTextTextures.push(h),this.largestAuxiliaryTextureEdge=Math.max(this.largestAuxiliaryTextureEdge,r,a),h}createContactShadowTexture(){const e=Math.min(128,this.maximumResolution),t=e/2,n=ji(e,e),s=Yi(n),r=s.createRadialGradient(t,t,e/32,t,t,e*.47);r.addColorStop(0,"rgba(0, 0, 0, 0.82)"),r.addColorStop(.42,"rgba(0, 0, 0, 0.42)"),r.addColorStop(1,"rgba(0, 0, 0, 0)"),s.clearRect(0,0,e,e),s.fillStyle=r,s.fillRect(0,0,e,e);const a=$i(n,St);return a.wrapS=dn,a.wrapT=dn,this.extraTextures.push(a),this.largestAuxiliaryTextureEdge=Math.max(this.largestAuxiliaryTextureEdge,e),a}diagnostics(){let e=0,t=0,n=0;for(const s of this.surfaces.values())e=Math.max(e,s.resolution),t+=s.alpha===null?3:4,s.detailScales[1]>s.detailScales[0]&&(n+=1);return t+=this.generatedTextTextures.length+this.extraTextures.length,e=Math.max(e,this.largestAuxiliaryTextureEdge),Object.freeze({surfaceNames:Rc,textureCount:t,largestTextureEdge:e,multiScaleSurfaceCount:n,generatedTextTextureCount:this.generatedTextTextures.length})}dispose(){if(!this.disposed){this.disposed=!0;for(const e of this.surfaces.values())e.albedo.dispose(),e.normal.dispose(),e.roughness.dispose(),e.alpha?.dispose();for(const e of this.generatedTextTextures)e.dispose();for(const e of this.extraTextures)e.dispose()}}}function Ki(i){return{map:i.albedo,normalMap:i.normal,roughnessMap:i.roughness}}function V_(i){return{map:i.albedo}}function Ln(i,e){const t=new Dn(e);return t.name=i,t.userData.proceduralMaterial=!0,t}function Cc(i,e,t="pbr"){const n=i==="shooter",s=h=>e===void 0?{}:t==="pbr"?Ki(e.surface(h)):V_(e.surface(h)),r=s("fabric"),a=s("skin"),o=s("hair"),l=s("rubber"),c=s("painted-metal");return Object.freeze({kit:Ln(`${i}-woven-kit`,{color:n?1060187:5824357,roughness:n?.72:.64,metalness:.02,...r,emissive:n?132884:466699,emissiveIntensity:.08}),kitAccent:Ln(`${i}-kit-accent`,{color:n?3048408:13238150,roughness:.58,metalness:.05,...r,emissive:n?202031:1522440,emissiveIntensity:.14}),lowerKit:Ln(`${i}-lower-kit`,{color:n?860479:1516598,roughness:.74,metalness:.01,...r}),skin:Ln(`${i}-stylized-skin`,{color:n?14654323:13797989,roughness:.7,metalness:0,...a}),hair:Ln(`${i}-matte-hair`,{color:n?1120295:2431253,roughness:.9,metalness:0,...o}),rubber:Ln(`${i}-rubber-sole`,{color:527120,roughness:.84,metalness:0,...l}),footwear:Ln(`${i}-court-footwear`,{color:n?15068146:1186083,roughness:.52,metalness:.04,...c}),eye:Ln(`${i}-eye`,{color:1119516,roughness:.42,metalness:0})})}function W_(i){return Ln("handball-grippy-rubber",{color:15770927,roughness:.64,metalness:.01,...i===void 0?{}:Ki(i.surface("rubber")),emissive:6037248,emissiveIntensity:.24})}function Pc(i){for(const e of Object.values(i))e.dispose()}const q_=new L(0,-1,0),pr=1e-4;class Lc{constructor(e,t){this.role=e,this.materials=t,this.root.name=e==="shooter"?"ProceduralShooterVisualRoot":"ProceduralGoalkeeperVisualRoot",this.root.userData.presentationOnly=!0,this.root.userData.ownsScoring=!1,this.body.name=`${e}-body-control`,this.root.add(this.body),this.buildTorsoAndHead(),this.leftArm=this.buildArm("left"),this.rightArm=this.buildArm("right"),this.leftLeg=this.buildLeg("left"),this.rightLeg=this.buildLeg("right"),this.applyBindPose()}role;materials;root=new nn;body=new nn;headJoint=new nn;leftArm;rightArm;leftLeg;rightLeg;geometries=[];joints=[];poseName=Ec.name;disposed=!1;applyBindPose(){this.applyPose(Ec)}applyPose(e){this.poseName=e.name,this.body.rotation.set(e.bodyLeanX,e.bodyTwistY,e.bodyLeanZ),this.headJoint.rotation.set(0,e.headYaw,-e.bodyLeanZ*.18),this.root.updateMatrixWorld(!0),this.solveChain(this.leftArm,e.leftHand,e.leftElbowPole),this.solveChain(this.rightArm,e.rightHand,e.rightElbowPole),this.solveChain(this.leftLeg,e.leftFoot,e.leftKneePole),this.solveChain(this.rightLeg,e.rightFoot,e.rightKneePole),this.leftArm.endJoint.rotation.z=-e.handSpread,this.rightArm.endJoint.rotation.z=e.handSpread,this.leftLeg.endJoint.rotation.x=Math.PI/2-.16,this.rightLeg.endJoint.rotation.x=Math.PI/2-.16,this.root.updateMatrixWorld(!0)}throwingHandWorld(){return this.worldPoint(this.rightArm.endJoint)}diagnostics(){let e=!0;return this.root.traverse(t=>{[t.position.x,t.position.y,t.position.z,t.quaternion.x,t.quaternion.y,t.quaternion.z,t.quaternion.w,t.scale.x,t.scale.y,t.scale.z].some(s=>!Number.isFinite(s))&&(e=!1)}),Object.freeze({role:this.role,poseName:this.poseName,articulatedJointCount:this.joints.length,finiteTransforms:e,leftHandWorld:this.worldPoint(this.leftArm.endJoint),rightHandWorld:this.worldPoint(this.rightArm.endJoint),leftFootWorld:this.worldPoint(this.leftLeg.endJoint),rightFootWorld:this.worldPoint(this.rightLeg.endJoint)})}dispose(){if(!this.disposed){this.disposed=!0;for(const e of this.geometries)e.dispose()}}buildTorsoAndHead(){const e=this.mesh(new ln(.25,12,8),this.materials.lowerKit,"pelvis");e.scale.set(1,.72,.72),e.position.y=.86,this.body.add(e);const t=this.mesh(new Mn(.22,.24,.25,12),this.materials.lowerKit,"waist");t.position.y=1.02,this.body.add(t);const n=this.mesh(new Mn(.25,.33,.62,12),this.materials.kit,"tapered-jersey");n.position.y=1.3,n.scale.z=.72,this.body.add(n);const s=this.mesh(new $n(.08,.43,5,10),this.materials.kitAccent,"shoulder-band");s.rotation.z=Math.PI/2,s.position.set(0,1.53,0),s.scale.z=.72,this.body.add(s);const r=this.mesh(new Vo(.105,.025,6,16),this.materials.kitAccent,"jersey-collar");r.rotation.x=Math.PI/2,r.position.set(0,1.58,0),this.body.add(r);const a=this.mesh(new Mn(.085,.095,.14,10),this.materials.skin,"neck");a.position.y=1.65,this.body.add(a),this.headJoint.name=`${this.role}-neck-joint`,this.headJoint.position.y=1.72,this.joints.push(this.headJoint),this.body.add(this.headJoint);const o=this.mesh(new ln(.18,14,10),this.materials.skin,"head");o.scale.set(.92,1.08,.92),o.position.y=.08,this.headJoint.add(o);const l=this.role==="shooter"?.165:-.165,c=new ln(.018,8,5),h=this.instancedMesh(c,this.materials.eye,"paired-eyes",2),u=new Xe;for(const[p,g]of[-.055,.055].entries())u.makeTranslation(g,.11,l),h.setMatrixAt(p,u);this.finalizeInstancedMesh(h),this.headJoint.add(h);const f=this.mesh(new ln(.19,12,8,0,Math.PI*2,0,Math.PI*.58),this.materials.hair,"hair-cap");f.scale.set(1.04,.9,1.04),f.position.y=.115,this.headJoint.add(f),this.addHairSilhouette()}addHairSilhouette(){const e=this.role==="shooter"?11:5,t=new Dr(.045,1,6),n=this.instancedMesh(t,this.materials.hair,"authored-hair-spikes",e),s=new L,r=new Nt,a=new L,o=new Xe;for(let l=0;l<e;l+=1){const c=l/e*Math.PI*2,h=this.role==="shooter"?.12+l%3*.025:.075+l%2*.015;s.set(Math.cos(c)*.15,.18+l%2*.025,Math.sin(c)*.15),r.setFromUnitVectors(new L(0,1,0),new L(Math.cos(c)*.62,.78,Math.sin(c)*.62).normalize()),a.set(1,h,1),o.compose(s,r,a),n.setMatrixAt(l,o)}this.finalizeInstancedMesh(n),this.headJoint.add(n)}buildArm(e){const t=e==="left"?-1:1,n=this.role==="shooter"?.37:.39,s=this.role==="shooter"?.34:.36,r=this.joint(`${this.role}-${e}-shoulder`);r.position.set(t*.29,1.49,0),this.body.add(r);const a=this.armSegment(n*.42,.082,.045,.02,this.materials.kit,`${e}-upper-sleeve`);r.add(a);const o=this.armSegment(n*.58,.062,.02,.035,this.materials.skin,`${e}-upper-arm`);o.position.y-=n*.42,r.add(o);const l=this.joint(`${this.role}-${e}-elbow`);l.position.y=-n,r.add(l);const c=this.armSegment(s,.055,.035,.025,this.materials.skin,`${e}-forearm`);l.add(c);const h=this.joint(`${this.role}-${e}-wrist`);return h.position.y=-s,l.add(h),this.addHand(h,e),{upperJoint:r,lowerJoint:l,endJoint:h,upperLength:n,lowerLength:s}}buildLeg(e){const t=e==="left"?-1:1,n=.43,s=.42,r=this.joint(`${this.role}-${e}-hip`);r.position.set(t*.13,.88,0),this.body.add(r);const a=this.segment(n,.105,.082,this.materials.lowerKit,`${e}-thigh`);r.add(a);const o=this.joint(`${this.role}-${e}-knee`);o.position.y=-n,r.add(o);const l=this.segment(s,.078,.052,this.materials.lowerKit,`${e}-shin`);o.add(l);const c=this.joint(`${this.role}-${e}-ankle`);return c.position.y=-s,o.add(c),this.addFoot(c,e),{upperJoint:r,lowerJoint:o,endJoint:c,upperLength:n,lowerLength:s}}addHand(e,t){const n=this.mesh(new ln(.07,10,7),this.materials.skin,`${t}-shaped-palm`);n.scale.set(.72,1.05,.48),n.position.y=-.055,e.add(n);const s=new $n(.011,.055,3,6),r=this.instancedMesh(s,this.materials.skin,`${t}-fingers`,4),a=new L,o=new Nt,l=new L(1,1,1),c=new Xe;for(let u=0;u<4;u+=1)a.set((u-1.5)*.019,-.14,0),o.setFromAxisAngle(new L(0,0,1),(u-1.5)*.035),c.compose(a,o,l),r.setMatrixAt(u,c);this.finalizeInstancedMesh(r),e.add(r);const h=this.mesh(new $n(.013,.045,3,6),this.materials.skin,`${t}-thumb`);h.position.set(t==="left"?.066:-.066,-.07,.012),h.rotation.z=t==="left"?-.75:.75,e.add(h)}addFoot(e,t){const n=this.mesh(new ln(.09,10,7),this.materials.footwear,`${t}-shoe-upper`);n.scale.set(.84,.58,1.55),n.position.set(0,-.045,.055),e.add(n);const s=this.mesh(new $n(.045,.16,4,8),this.materials.rubber,`${t}-rubber-sole`);s.rotation.x=Math.PI/2,s.position.set(0,-.095,.07),s.scale.x=1.18,e.add(s)}solveChain(e,t,n){this.root.updateMatrixWorld(!0);const s=e.upperJoint.getWorldPosition(new L),r=this.root.localToWorld(new L(t.x,t.y,t.z)),a=this.root.localToWorld(new L(n.x,n.y,n.z)),o=r.clone().sub(s),l=o.length(),c=Math.abs(e.upperLength-e.lowerLength)+pr,h=e.upperLength+e.lowerLength-pr,u=On.clamp(l,c,h),f=l>pr?o.multiplyScalar(1/l):new L(0,-1,0),p=a.sub(s);p.addScaledVector(f,-p.dot(f)),p.lengthSq()<pr&&p.set(0,0,1),p.normalize();const g=(e.upperLength*e.upperLength+u*u-e.lowerLength*e.lowerLength)/(2*u),_=Math.sqrt(Math.max(0,e.upperLength*e.upperLength-g*g)),m=s.clone().addScaledVector(f,g).addScaledVector(p,_),d=s.clone().addScaledVector(f,u),b=m.clone().sub(s).normalize(),E=d.clone().sub(m).normalize();this.setWorldDirection(e.upperJoint,b),e.upperJoint.updateMatrixWorld(!0),this.setWorldDirection(e.lowerJoint,E),e.lowerJoint.updateMatrixWorld(!0)}setWorldDirection(e,t){const n=new Nt().setFromUnitVectors(q_,t),s=new Nt;e.parent?.getWorldQuaternion(s),e.quaternion.copy(s.invert().multiply(n))}joint(e){const t=new nn;return t.name=e,t.userData.articulatedJoint=!0,this.joints.push(t),t}segment(e,t,n,s,r){const a=this.mesh(new Mn(n,t,e,10),s,r);return a.position.y=-e/2,a}armSegment(e,t,n,s,r,a){const o=e+n+s,l=this.mesh(new $n(t,Math.max(.01,o-t*2),4,8),r,a);return l.position.y=(-e+n-s)/2,l}mesh(e,t,n){e.name=`${this.role}-${n}-geometry`,this.geometries.push(e);const s=new ht(e,t);return s.name=`${this.role}-${n}`,s.castShadow=!0,s.receiveShadow=!0,s}instancedMesh(e,t,n,s){e.name=`${this.role}-${n}-geometry`,this.geometries.push(e);const r=new It(e,t,s);return r.name=`${this.role}-${n}`,r.castShadow=!1,r.receiveShadow=!0,r.userData.boundedProceduralDetail=!0,r}finalizeInstancedMesh(e){e.instanceMatrix.needsUpdate=!0,e.computeBoundingBox(),e.computeBoundingSphere()}worldPoint(e){const t=e.getWorldPosition(new L);return Object.freeze({x:t.x,y:t.y,z:t.z})}}const yr=Object.freeze([1398694,2457821,15331839,2111059,4945578,7901877]),br=Object.freeze([15776913,14260079,12153938,9196092,6306349]),yo=Object.freeze([3524351,16120063,1266873,8962047]),X_=8,j_=6;function Nn(i,e,t){return e+(t-e)*i.nextFloat()}function Y_(i,e,t){const n=Math.max(1,Math.ceil(e/X_)),s=Math.floor(i/n),r=i%n,a=n===1?.5:r/Math.max(1,n-1);let o=On.lerp(-8.82,8.82,a);o+=Nn(t,-.18,.18);for(const c of[-4.1,4.1])Math.abs(o-c)<.34&&(o+=o<c?-.34:.34);const l=s<=3||s===4&&r%3===0?"hero":"distant";return wh(t,o,.55+s*.43+Nn(t,-.055,.055),9.28+s*.78+Nn(t,-.09,.09),Math.PI+Nn(t,-.1,.1),l)}function $_(i,e,t,n){const s=Math.ceil(e/2),r=Math.max(1,Math.ceil(s/j_)),a=Math.floor(i/2),o=Math.floor(a/r),l=a%r,c=r===1?.5:l/Math.max(1,r-1);return wh(n,t*(8.78+o*.19),.68+o*.48,On.lerp(.8,13.7,c)+Nn(n,-.09,.09),t*(Math.PI/2)+Nn(n,-.12,.12),o<=2?"hero":"distant")}function wh(i,e,t,n,s,r){const a=i.nextInt(yr.length),o=Math.abs(e)<2.2&&a===2?4:a;return Object.freeze({x:e,y:t,z:n,yaw:s,heightScale:Nn(i,.82,1.2),widthScale:Nn(i,.82,1.16),animationPhase:i.nextFloat()*Math.PI*2,pose:Nn(i,-1,1),kitColorIndex:o,skinColorIndex:i.nextInt(br.length),scarfColorIndex:i.nextInt(yo.length),hasScarf:r==="hero"&&i.nextFloat()>.46,lod:r})}function K_(i,e){if(!Number.isInteger(i)||i<1||i>960)throw new RangeError("Crowd instance count must be an integer from 1 to 960.");const t=new Pr(e).fork("arena-crowd"),n=Math.round(i*.55),s=[];for(let a=0;a<n;a+=1)s.push(Y_(a,n,t));const r=i-n;for(let a=0;a<r;a+=1)s.push($_(a,r,a%2===0?-1:1,t));return Object.freeze(s)}function ba(i,e){const t=new Yn({color:16777215,map:e.albedo,emissive:i.includes("skin")?2035723:i.includes("scarves")?465462:398378,emissiveIntensity:i.includes("skin")?.16:.22});return t.name=i,t.vertexColors=!0,t.userData.proceduralMaterial=!0,t}class Z_{root=new nn;layout;heroMembers;staticHeroMembers;distantMembers;animatedMembers;scarfMembers;staticScarfMembers;animatedScarfMembers;animatedHeroTorso;animatedHeroHeads;animatedHeroArms;animatedScarves;staticHeroTorso;staticHeroHeads;staticHeroArms;staticScarves;distantBodies;distantHeads;geometries=[];materials=[];matrix=new Xe;position=new L;scale=new L;rotation=new Nt;yawRotation=new Nt;localRotation=new Nt;yAxis=new L(0,1,0);zAxis=new L(0,0,1);animationMaximumHz;staticMeshes;animatedMeshes;instancedMeshes;lastAnimationSecond=0;animationUpdateCount=0;matrixWritesLastUpdate=0;disposed=!1;constructor(e,t,n,s){if(!Number.isInteger(e.animatedInstanceMaximum)||e.animatedInstanceMaximum<0||e.animatedInstanceMaximum>e.instanceCount)throw new RangeError("Animated crowd maximum must be an integer within the crowd count.");if(!Number.isFinite(e.animationMaximumHz)||e.animationMaximumHz<0)throw new RangeError("Crowd animation frequency must be non-negative.");this.root.name="InstancedEuropeanArenaCrowd",this.root.userData.presentationOnly=!0,this.root.userData.ownsScoring=!1,this.layout=K_(e.instanceCount,t),this.heroMembers=Object.freeze(this.layout.filter(d=>d.lod==="hero")),this.distantMembers=Object.freeze(this.layout.filter(d=>d.lod==="distant")),this.animatedMembers=Object.freeze(this.heroMembers.slice(0,e.animatedInstanceMaximum)),this.staticHeroMembers=Object.freeze(this.heroMembers.slice(e.animatedInstanceMaximum)),this.scarfMembers=Object.freeze(this.heroMembers.filter(d=>d.hasScarf));const r=new Set(this.animatedMembers);this.animatedScarfMembers=Object.freeze(this.scarfMembers.filter(d=>r.has(d))),this.staticScarfMembers=Object.freeze(this.scarfMembers.filter(d=>!r.has(d))),this.animationMaximumHz=e.animationMaximumHz;const a=this.geometry(new $n(.13,.35,3,7)),o=this.geometry(new ln(.105,8,6)),l=this.geometry(new Mn(.035,.045,.45,6)),c=this.geometry(new dt(.48,.07,.045)),h=this.geometry(new Dr(.14,.62,5)),u=this.geometry(new ln(.095,5,4)),f=this.material(ba("crowd-generated-fabric",n)),p=this.material(ba("crowd-generated-skin",s)),g=this.material(ba("crowd-generated-scarves",n));this.animatedHeroTorso=this.instanceMesh(a,f,this.animatedMembers.length,"CrowdAnimatedHeroLodTorsos"),this.animatedHeroHeads=this.instanceMesh(o,p,this.animatedMembers.length,"CrowdAnimatedHeroLodHeads"),this.animatedHeroArms=this.instanceMesh(l,f,this.animatedMembers.length*2,"CrowdAnimatedHeroLodPoseArms"),this.animatedScarves=this.instanceMesh(c,g,this.animatedScarfMembers.length,"CrowdAnimatedHeroLodScarves"),this.staticHeroTorso=this.instanceMesh(a,f,this.staticHeroMembers.length,"CrowdStaticHeroLodTorsos"),this.staticHeroHeads=this.instanceMesh(o,p,this.staticHeroMembers.length,"CrowdStaticHeroLodHeads"),this.staticHeroArms=this.instanceMesh(l,f,this.staticHeroMembers.length*2,"CrowdStaticHeroLodPoseArms"),this.staticScarves=this.instanceMesh(c,g,this.staticScarfMembers.length,"CrowdStaticHeroLodScarves"),this.distantBodies=new It(h,f,this.distantMembers.length),this.distantHeads=new It(u,p,this.distantMembers.length),this.animatedMeshes=Object.freeze([this.animatedHeroTorso,this.animatedHeroHeads,this.animatedHeroArms,this.animatedScarves].filter(d=>d!==null)),this.staticMeshes=Object.freeze([this.staticHeroTorso,this.staticHeroHeads,this.staticHeroArms,this.staticScarves,this.distantBodies,this.distantHeads].filter(d=>d!==null)),this.instancedMeshes=Object.freeze([...this.animatedMeshes,...this.staticMeshes]);const _=e.staticRenderLayer??0,m=e.animatedRenderLayer??0;for(const d of this.animatedMeshes)d.layers.set(m),d.userData.crowdMotion="animated";for(const d of this.staticMeshes)d.layers.set(_),d.userData.crowdMotion="static";for(const d of this.instancedMeshes)d.frustumCulled=!0,d.castShadow=!1,d.receiveShadow=!1,d.userData.crowdLod=d===this.distantBodies||d===this.distantHeads?"distant":"hero",this.root.add(d);this.distantBodies.name="CrowdDistantLodBodies",this.distantHeads.name="CrowdDistantLodHeads";for(const d of this.animatedMeshes)d.instanceMatrix.setUsage(Fd);this.applyInstanceColors(),this.initializeInstanceMatrices(),this.computeConservativeBounds()}update(e){if(!(this.animatedMembers.length===0||this.animationMaximumHz===0||e-this.lastAnimationSecond+Number.EPSILON<1/this.animationMaximumHz)){this.lastAnimationSecond=e,this.animationUpdateCount+=1,this.matrixWritesLastUpdate=0;for(let t=0;t<this.animatedMembers.length;t+=1){const n=this.animatedMembers[t];if(n===void 0)continue;const s=Math.sin(e*2.4+n.animationPhase),r=s*.025*n.heightScale;if(this.animatedHeroTorso===null||this.animatedHeroHeads===null||this.animatedHeroArms===null)throw new Error("Animated crowd meshes are missing.");this.setBodyMatrix(this.animatedHeroTorso,t,n,r,.5,n.widthScale,n.heightScale),this.setBodyMatrix(this.animatedHeroHeads,t,n,r,.91,n.widthScale,n.heightScale),this.matrixWritesLastUpdate+=2,this.setArmMatrix(this.animatedHeroArms,n,t*2,-1,s,r),this.setArmMatrix(this.animatedHeroArms,n,t*2+1,1,s,r),this.matrixWritesLastUpdate+=2}for(let t=0;t<this.animatedScarfMembers.length;t+=1){const n=this.animatedScarfMembers[t];if(n===void 0)continue;if(this.animatedScarves===null)throw new Error("Animated crowd scarf mesh is missing.");const s=Math.sin(e*2.4+n.animationPhase);this.setBodyMatrix(this.animatedScarves,t,n,s*.03,.82,n.widthScale,n.heightScale),this.matrixWritesLastUpdate+=1}this.markMatrixRange(this.animatedHeroTorso,this.animatedMembers.length),this.markMatrixRange(this.animatedHeroHeads,this.animatedMembers.length),this.markMatrixRange(this.animatedHeroArms,this.animatedMembers.length*2),this.markMatrixRange(this.animatedScarves,this.animatedScarfMembers.length)}}diagnostics(){return Object.freeze({totalInstances:this.layout.length,heroLodInstances:this.heroMembers.length,distantLodInstances:this.distantMembers.length,animatedInstances:this.animatedMembers.length,staticInstances:this.layout.length-this.animatedMembers.length,animationMaximumHz:this.animationMaximumHz,animationUpdateCount:this.animationUpdateCount,matrixWritesLastUpdate:this.matrixWritesLastUpdate,distantRowsStatic:!0,scarfInstances:this.scarfMembers.length,uniqueKitColors:new Set(this.layout.map(e=>e.kitColorIndex)).size,uniquePoseBands:new Set(this.layout.map(e=>Math.round(e.pose*8))).size,uniqueAnimationPhases:new Set(this.layout.map(e=>Math.round(e.animationPhase*100))).size,instancedDrawGroups:this.instancedMeshes.length,staticInstancedDrawGroups:this.staticMeshes.length,animatedInstancedDrawGroups:this.animatedMeshes.length,frustumCulledMeshes:this.instancedMeshes.filter(e=>e.frustumCulled).length,boundedCullingMeshes:this.instancedMeshes.filter(e=>e.boundingBox!==null&&e.boundingSphere!==null).length,unboundedCullingMeshes:this.instancedMeshes.filter(e=>e.boundingBox===null||e.boundingSphere===null).length,sharedGeometryCount:this.geometries.length,sharedMaterialCount:this.materials.length})}dispose(){if(!this.disposed){this.disposed=!0;for(const e of this.geometries)e.dispose();for(const e of this.materials)e.dispose()}}initializeInstanceMatrices(){for(let e=0;e<this.animatedMembers.length;e+=1){const t=this.animatedMembers[e];if(t===void 0)continue;if(this.animatedHeroTorso===null||this.animatedHeroHeads===null||this.animatedHeroArms===null)throw new Error("Animated crowd meshes are missing.");const n=Math.sin(t.animationPhase),s=n*.025*t.heightScale;this.setBodyMatrix(this.animatedHeroTorso,e,t,s,.5,t.widthScale,t.heightScale),this.setBodyMatrix(this.animatedHeroHeads,e,t,s,.91,t.widthScale,t.heightScale),this.setArmMatrix(this.animatedHeroArms,t,e*2,-1,n,s),this.setArmMatrix(this.animatedHeroArms,t,e*2+1,1,n,s)}for(let e=0;e<this.animatedScarfMembers.length;e+=1){const t=this.animatedScarfMembers[e];if(t===void 0)continue;if(this.animatedScarves===null)throw new Error("Animated crowd scarf mesh is missing.");const n=Math.sin(t.animationPhase);this.setBodyMatrix(this.animatedScarves,e,t,n*.03,.82,t.widthScale,t.heightScale)}for(let e=0;e<this.staticHeroMembers.length;e+=1){const t=this.staticHeroMembers[e];if(t===void 0)continue;if(this.staticHeroTorso===null||this.staticHeroHeads===null||this.staticHeroArms===null)throw new Error("Static crowd meshes are missing.");const n=Math.sin(t.animationPhase),s=n*.025*t.heightScale;this.setBodyMatrix(this.staticHeroTorso,e,t,s,.5,t.widthScale,t.heightScale),this.setBodyMatrix(this.staticHeroHeads,e,t,s,.91,t.widthScale,t.heightScale),this.setArmMatrix(this.staticHeroArms,t,e*2,-1,n,s),this.setArmMatrix(this.staticHeroArms,t,e*2+1,1,n,s)}for(let e=0;e<this.staticScarfMembers.length;e+=1){const t=this.staticScarfMembers[e];if(t===void 0)continue;if(this.staticScarves===null)throw new Error("Static crowd scarf mesh is missing.");const n=Math.sin(t.animationPhase);this.setBodyMatrix(this.staticScarves,e,t,n*.03,.82,t.widthScale,t.heightScale)}for(let e=0;e<this.distantMembers.length;e+=1){const t=this.distantMembers[e];t!==void 0&&(this.setBodyMatrix(this.distantBodies,e,t,0,.43,t.widthScale,t.heightScale),this.setBodyMatrix(this.distantHeads,e,t,0,.81,t.widthScale,t.heightScale))}for(const e of this.instancedMeshes)e.instanceMatrix.needsUpdate=!0}computeConservativeBounds(){for(const e of this.instancedMeshes)e.computeBoundingBox(),e.computeBoundingSphere(),e.boundingBox?.expandByScalar(.12),e.boundingSphere!==null&&(e.boundingSphere.radius+=.12)}markMatrixRange(e,t){e===null||t===0||(e.instanceMatrix.clearUpdateRanges(),e.instanceMatrix.addUpdateRange(0,t*16),e.instanceMatrix.needsUpdate=!0)}applyInstanceColors(){for(let e=0;e<this.animatedMembers.length;e+=1){const t=this.animatedMembers[e];if(t===void 0)continue;if(this.animatedHeroTorso===null||this.animatedHeroHeads===null||this.animatedHeroArms===null)throw new Error("Animated crowd meshes are missing.");const n=new Oe(yr[t.kitColorIndex]??16777215),s=new Oe(br[t.skinColorIndex]??16777215);this.animatedHeroTorso.setColorAt(e,n),this.animatedHeroHeads.setColorAt(e,s),this.animatedHeroArms.setColorAt(e*2,n),this.animatedHeroArms.setColorAt(e*2+1,n)}for(let e=0;e<this.staticHeroMembers.length;e+=1){const t=this.staticHeroMembers[e];if(t===void 0)continue;if(this.staticHeroTorso===null||this.staticHeroHeads===null||this.staticHeroArms===null)throw new Error("Static crowd meshes are missing.");const n=new Oe(yr[t.kitColorIndex]??16777215),s=new Oe(br[t.skinColorIndex]??16777215);this.staticHeroTorso.setColorAt(e,n),this.staticHeroHeads.setColorAt(e,s),this.staticHeroArms.setColorAt(e*2,n),this.staticHeroArms.setColorAt(e*2+1,n)}for(let e=0;e<this.animatedScarfMembers.length;e+=1){const t=this.animatedScarfMembers[e];if(t!==void 0){if(this.animatedScarves===null)throw new Error("Animated crowd scarf mesh is missing.");this.animatedScarves.setColorAt(e,new Oe(yo[t.scarfColorIndex]??16777215))}}for(let e=0;e<this.staticScarfMembers.length;e+=1){const t=this.staticScarfMembers[e];if(t!==void 0){if(this.staticScarves===null)throw new Error("Static crowd scarf mesh is missing.");this.staticScarves.setColorAt(e,new Oe(yo[t.scarfColorIndex]??16777215))}}for(let e=0;e<this.distantMembers.length;e+=1){const t=this.distantMembers[e];t!==void 0&&(this.distantBodies.setColorAt(e,new Oe(yr[t.kitColorIndex]??16777215)),this.distantHeads.setColorAt(e,new Oe(br[t.skinColorIndex]??16777215)))}for(const e of this.instancedMeshes)e.instanceColor!==null&&(e.instanceColor.needsUpdate=!0)}setBodyMatrix(e,t,n,s,r,a,o){this.position.set(n.x,n.y+r*o+s,n.z),this.rotation.setFromAxisAngle(this.yAxis,n.yaw),this.scale.set(a,o,a*.9),this.matrix.compose(this.position,this.rotation,this.scale),e.setMatrixAt(t,this.matrix)}setArmMatrix(e,t,n,s,r,a){const o=s*(.22+Math.abs(t.pose)*.92+r*.14),l=s*.18*t.widthScale,c=.225*t.heightScale,h=l-Math.sin(o)*c,u=.69*t.heightScale+Math.cos(o)*c;this.position.set(t.x+Math.cos(t.yaw)*h,t.y+u+a,t.z-Math.sin(t.yaw)*h),this.yawRotation.setFromAxisAngle(this.yAxis,t.yaw),this.localRotation.setFromAxisAngle(this.zAxis,o),this.rotation.multiplyQuaternions(this.yawRotation,this.localRotation),this.scale.set(t.widthScale,t.heightScale,t.widthScale),this.matrix.compose(this.position,this.rotation,this.scale),e.setMatrixAt(n,this.matrix)}instanceMesh(e,t,n,s){if(n===0)return null;const r=new It(e,t,n);return r.name=s,r}geometry(e){return this.geometries.push(e),e}material(e){return this.materials.push(e),e}}const J_=Object.freeze({balanced:Object.freeze({ribbonPoints:18,speedLines:6,particles:24}),high:Object.freeze({ribbonPoints:24,speedLines:10,particles:36}),capture:Object.freeze({ribbonPoints:28,speedLines:12,particles:48})}),Dc=Object.freeze({GOAL:Object.freeze({label:"Goal surge",colorHex:"#4dff87",threeColor:5111687}),SAVED:Object.freeze({label:"Keeper shield",colorHex:"#4ed8ff",threeColor:5167359}),MISS:Object.freeze({label:"Miss warning",colorHex:"#ff725f",threeColor:16740959})}),mr=Object.freeze({tailHalfWidthMeters:.006,headHalfWidthMeters:.038,opacity:.56}),Ea=16757819,Q_=.22,ex=.48,Ic=.14,Oc=.24,Ta=new Si(new L(0,1.4,3.5),6);class tx{root=new nn;limits;camera;ribbonHistory;ribbonPositions;ribbonGeometry=new vt;ribbonMaterial=new Qt({color:Ea,transparent:!0,opacity:mr.opacity,depthWrite:!1,blending:Es,side:cn,toneMapped:!1});speedLinePositions;speedLineGeometry=new vt;speedLineMaterial=new xo({color:16766071,transparent:!0,opacity:.46,depthWrite:!1,blending:Es,toneMapped:!1});particlePositions;particleGeometry=new vt;particleMaterial=new xo({color:Ea,transparent:!0,opacity:.9,depthWrite:!1,blending:Es,toneMapped:!1});tempPrevious=new L;tempNext=new L;tempPoint=new L;tempDirection=new L;tempView=new L;tempSide=new L;releaseOrigin=new L;impactOrigin=new L;cameraImpulsePixels={x:0,y:0};phase="READY";particleMode=null;currentOutcome=null;reducedMotion=!1;ribbonPointCount=0;activeSpeedLines=0;activeParticles=0;previousShotProgress=0;releaseAtSeconds=Number.NEGATIVE_INFINITY;impactAtSeconds=Number.NEGATIVE_INFINITY;releasePower=0;releaseBursts=0;impactBursts=0;outcomeBursts={GOAL:0,SAVED:0,MISS:0};constructor(e,t){this.limits=J_[e.name],this.camera=t,this.root.name="BoundedArcadeEffects",this.root.userData.qualityPreset=e.name,this.root.userData.ownsScoring=!1,this.root.visible=!0,this.ribbonHistory=new Float32Array(this.limits.ribbonPoints*3),this.ribbonPositions=new Float32Array(this.limits.ribbonPoints*2*3);const n=new Uint16Array(Math.max(0,this.limits.ribbonPoints-1)*6);for(let o=0;o<this.limits.ribbonPoints-1;o+=1){const l=o*2,c=o*6;n[c]=l,n[c+1]=l+1,n[c+2]=l+2,n[c+3]=l+1,n[c+4]=l+3,n[c+5]=l+2}this.ribbonGeometry.setAttribute("position",new Ft(this.ribbonPositions,3)),this.ribbonGeometry.setIndex(new Ft(n,1)),this.ribbonGeometry.setDrawRange(0,0),this.ribbonGeometry.boundingSphere=Ta.clone();const s=new ht(this.ribbonGeometry,this.ribbonMaterial);s.name="WarmGoldBallRibbon",s.renderOrder=4,this.root.add(s),this.speedLinePositions=new Float32Array(this.limits.speedLines*2*3),this.speedLineGeometry.setAttribute("position",new Ft(this.speedLinePositions,3)),this.speedLineGeometry.setDrawRange(0,0),this.speedLineGeometry.boundingSphere=Ta.clone();const r=new jl(this.speedLineGeometry,this.speedLineMaterial);r.name="RestrainedBallSpeedLines",r.renderOrder=3,this.root.add(r),this.particlePositions=new Float32Array(this.limits.particles*2*3),this.particleGeometry.setAttribute("position",new Ft(this.particlePositions,3)),this.particleGeometry.setDrawRange(0,0),this.particleGeometry.boundingSphere=Ta.clone();const a=new jl(this.particleGeometry,this.particleMaterial);a.name="BoundedReleaseImpactParticles",a.renderOrder=6,this.root.add(a)}setReducedMotion(e){this.reducedMotion=e,e&&(this.speedLineGeometry.setDrawRange(0,0),this.particleGeometry.setDrawRange(0,0),this.activeSpeedLines=0,this.activeParticles=0,this.cameraImpulsePixels.x=0,this.cameraImpulsePixels.y=0)}beginShot(e,t,n){this.root.visible=!0,this.phase="FLIGHT",this.currentOutcome=null,this.releasePower=On.clamp(t,0,1),this.releaseAtSeconds=n,this.impactAtSeconds=Number.NEGATIVE_INFINITY,this.releaseOrigin.set(e.x,e.y,e.z),this.particleMode="RELEASE",this.releaseBursts+=1,this.previousShotProgress=0,this.clearRibbon(),this.appendRibbonPoint(e),this.configureParticleColor(Ea)}resolveOutcome(e,t,n){if(this.phase!=="FLIGHT"||this.currentOutcome!==null)return;this.phase="RESULT",this.currentOutcome=e,this.impactAtSeconds=n,this.impactOrigin.set(t.x,t.y,t.z),this.particleMode="IMPACT",this.impactBursts+=1,this.outcomeBursts[e]+=1;const s=Dc[e];this.configureParticleColor(s.threeColor)}resetVisuals(){this.root.visible=!1,this.phase="READY",this.currentOutcome=null,this.particleMode=null,this.previousShotProgress=0,this.clearRibbon(),this.speedLineGeometry.setDrawRange(0,0),this.particleGeometry.setDrawRange(0,0),this.activeSpeedLines=0,this.activeParticles=0,this.cameraImpulsePixels.x=0,this.cameraImpulsePixels.y=0}update(e){if(this.phase==="READY")return;this.phase==="FLIGHT"&&e.shotProgress>this.previousShotProgress+Number.EPSILON&&(this.appendRibbonPoint(e.ballPosition),this.previousShotProgress=e.shotProgress);const t=this.phase==="RESULT"?Math.max(0,1-e.resultProgress*1.35):1;this.ribbonMaterial.opacity=mr.opacity*t,this.updateSpeedLines(e),this.updateParticles(e.simulationSeconds),this.updateCameraImpulse(e.simulationSeconds)}screenImpulse(){return this.cameraImpulsePixels}diagnostics(){return Object.freeze({limits:this.limits,reducedMotion:this.reducedMotion,phase:this.phase,activeRibbonPoints:this.ribbonPointCount,activeSpeedLines:this.activeSpeedLines,activeParticles:this.activeParticles,releaseBursts:this.releaseBursts,impactBursts:this.impactBursts,outcomeBursts:Object.freeze({...this.outcomeBursts}),currentOutcome:this.currentOutcome,currentOutcomeColor:this.currentOutcome===null?null:Dc[this.currentOutcome].colorHex,resultEffectsStartedAfterOutcome:this.impactBursts===this.outcomeBursts.GOAL+this.outcomeBursts.SAVED+this.outcomeBursts.MISS,cameraImpulsePixels:Object.freeze({x:this.cameraImpulsePixels.x,y:this.cameraImpulsePixels.y})})}dispose(){this.ribbonGeometry.dispose(),this.ribbonMaterial.dispose(),this.speedLineGeometry.dispose(),this.speedLineMaterial.dispose(),this.particleGeometry.dispose(),this.particleMaterial.dispose()}clearRibbon(){this.ribbonPointCount=0,this.ribbonGeometry.setDrawRange(0,0)}appendRibbonPoint(e){this.ribbonPointCount>=this.limits.ribbonPoints&&(this.ribbonHistory.copyWithin(0,3),this.ribbonPointCount=this.limits.ribbonPoints-1);const t=this.ribbonPointCount*3;this.ribbonHistory[t]=e.x,this.ribbonHistory[t+1]=e.y,this.ribbonHistory[t+2]=e.z,this.ribbonPointCount+=1,this.rebuildRibbon()}rebuildRibbon(){const e=this.ribbonPointCount;for(let t=0;t<e;t+=1){const n=Math.max(0,t-1)*3,s=Math.min(e-1,t+1)*3,r=t*3;this.tempPrevious.fromArray(this.ribbonHistory,n),this.tempNext.fromArray(this.ribbonHistory,s),this.tempPoint.fromArray(this.ribbonHistory,r),this.tempDirection.subVectors(this.tempNext,this.tempPrevious),this.tempDirection.lengthSq()<1e-6?this.tempDirection.set(0,0,1):this.tempDirection.normalize(),this.tempView.subVectors(this.camera.position,this.tempPoint),this.tempView.lengthSq()<1e-6?this.tempView.set(0,1,0):this.tempView.normalize(),this.tempSide.crossVectors(this.tempDirection,this.tempView),this.tempSide.lengthSq()<1e-6?this.tempSide.set(1,0,0):this.tempSide.normalize();const a=e<=1?1:t/(e-1),o=On.lerp(mr.tailHalfWidthMeters,mr.headHalfWidthMeters,a),l=t*6;this.ribbonPositions[l]=this.tempPoint.x+this.tempSide.x*o,this.ribbonPositions[l+1]=this.tempPoint.y+this.tempSide.y*o,this.ribbonPositions[l+2]=this.tempPoint.z+this.tempSide.z*o,this.ribbonPositions[l+3]=this.tempPoint.x-this.tempSide.x*o,this.ribbonPositions[l+4]=this.tempPoint.y-this.tempSide.y*o,this.ribbonPositions[l+5]=this.tempPoint.z-this.tempSide.z*o}this.ribbonGeometry.getAttribute("position").needsUpdate=!0,this.ribbonGeometry.setDrawRange(0,Math.max(0,e-1)*6)}updateSpeedLines(e){if(this.reducedMotion||this.phase!=="FLIGHT"||e.shotProgress<.08||e.shotProgress>.94){this.activeSpeedLines!==0&&this.speedLineGeometry.setDrawRange(0,0),this.activeSpeedLines=0;return}const t=this.limits.speedLines,n=.18+this.releasePower*.26;for(let s=0;s<t;s+=1){const r=s*2.399963229728653+e.simulationSeconds*(s%2===0?.7:-.5),a=.2+s%3*.095,o=e.ballPosition.x+Math.cos(r)*a,l=e.ballPosition.y+Math.sin(r)*a*.7,c=e.ballPosition.z-.22-s%4*.09,h=s*6;this.speedLinePositions[h]=o,this.speedLinePositions[h+1]=l,this.speedLinePositions[h+2]=c,this.speedLinePositions[h+3]=o*.998,this.speedLinePositions[h+4]=l-.015,this.speedLinePositions[h+5]=c-n}this.speedLineGeometry.getAttribute("position").needsUpdate=!0,this.speedLineGeometry.setDrawRange(0,t*2),this.activeSpeedLines=t}updateParticles(e){if(this.reducedMotion||this.particleMode===null){this.activeParticles!==0&&this.particleGeometry.setDrawRange(0,0),this.activeParticles=0;return}const t=this.particleMode==="RELEASE"?this.releaseAtSeconds:this.impactAtSeconds,n=this.particleMode==="RELEASE"?Q_:ex,s=Math.max(0,e-t);if(s>=n){this.particleGeometry.setDrawRange(0,0),this.activeParticles=0,this.particleMode=null;return}const r=this.particleMode==="RELEASE"?this.releaseOrigin:this.impactOrigin,a=s/n,o=this.limits.particles;for(let l=0;l<o;l+=1){const c=l*2.399963229728653,h=.45+l%5*.11,u=this.particleMode==="RELEASE"?a*(.18+this.releasePower*.34):a*.78,f=this.particleMode==="RELEASE"?.04:.18*a,p=l*6,g=p+3,_=r.x+Math.cos(c)*u*h,m=r.y+Math.sin(c)*u*h+f-a*a*.12,d=r.z+Math.sin(c*.63)*u*.45-(this.particleMode==="RELEASE"?a*.12:0),b=(this.particleMode==="RELEASE"?.035:.065)*(1-a);this.particlePositions[p]=_,this.particlePositions[p+1]=m,this.particlePositions[p+2]=d,this.particlePositions[g]=_+Math.cos(c)*b,this.particlePositions[g+1]=m+Math.sin(c)*b,this.particlePositions[g+2]=d+Math.sin(c*.63)*b}this.particleMaterial.opacity=Math.max(0,1-a),this.particleGeometry.getAttribute("position").needsUpdate=!0,this.particleGeometry.setDrawRange(0,o*2),this.activeParticles=o}configureParticleColor(e){this.particleMaterial.color.setHex(e)}updateCameraImpulse(e){if(this.reducedMotion){this.cameraImpulsePixels.x=0,this.cameraImpulsePixels.y=0;return}if(this.phase==="FLIGHT"){const t=e-this.releaseAtSeconds;if(t>=0&&t<Ic){const n=Math.sin(t/Ic*Math.PI),s=2.2+this.releasePower*1.8;this.cameraImpulsePixels.x=-s*n,this.cameraImpulsePixels.y=s*.32*n;return}}if(this.phase==="RESULT"&&this.currentOutcome!==null){const t=e-this.impactAtSeconds;if(t>=0&&t<Oc){const n=1-t/Oc,s=this.currentOutcome==="SAVED"?4:this.currentOutcome==="GOAL"?3.2:2.2;this.cameraImpulsePixels.x=Math.sin(t*155)*s*n,this.cameraImpulsePixels.y=Math.sin(t*119+.7)*s*.55*n;return}}this.cameraImpulsePixels.x=0,this.cameraImpulsePixels.y=0}}const mt=Tt.center.z,Jt=Tt.widthMeters,gn=Tt.heightMeters,Bi=.8,Bt=Tt.postThicknessMeters,wa=6,Nc=7,Fc=9,nx=Object.freeze({x:-1.24,y:0,z:-.78}),ix=Object.freeze({x:-.28,y:2.05,z:.25}),Hi=0,Xn=1;class sx{scene=new Bo;staticRoot=new nn;cameraRig=new C_;renderer;canvas;backNet=null;netHit=null;netHitSeconds=-100;frameHitSeconds=-100;reducedMotion=!1;ball;arcadeEffects;materialLibrary;quality;shooterMaterials;goalkeeperMaterials;shooter;goalkeeper;goalRoot;crowd;staticLayerCache;goalkeeperContactShadow;performanceProbe=new T_;environmentTarget=null;disposables=new Set;shooterAnimationStage="IDLE";shooterReleaseAmount=0;goalkeeperAnimationStage="READY";goalkeeperVisualPhase="READY";goalkeeperDiveAmount=0;goalkeeperZone=null;goalkeeperSaveVolumeCenter=new L(0,1,mt);goalkeeperVisibleReach=new L(0,1.28,mt);prewarmComplete=!1;prewarmedShaderPrograms=0;presentedFrames=0;lastPresentationMilliseconds=null;lastRenderCalls=0;lastRenderedTriangles=0;appliedCanvasTransform="";constructor(e,t){this.quality=t,this.canvas=e,this.canvas.__HANDBALL_PRESENTED_FRAMES__=0,this.canvas.__HANDBALL_RENDER_INTERVALS__=new Float64Array(512*2),this.staticLayerCache=new L_(t.name),this.staticRoot.name="LockedArenaStaticLayerRoot",this.staticRoot.userData.cachedStaticLayer=!0,this.scene.add(this.staticRoot),this.materialLibrary=new G_(t.proceduralTextureResolution);const n=t.name==="capture"?"pbr":"albedo";this.shooterMaterials=Cc("shooter",this.materialLibrary,n),this.goalkeeperMaterials=Cc("goalkeeper",this.materialLibrary,n),this.shooter=new Lc("shooter",this.shooterMaterials),this.goalkeeper=new Lc("goalkeeper",this.goalkeeperMaterials),this.renderer=new b_({canvas:e,antialias:t.antialias,alpha:!1,powerPreference:"high-performance"}),this.renderer.setPixelRatio(Math.min(window.devicePixelRatio,t.maximumPixelRatio)),this.renderer.outputColorSpace=St,this.renderer.toneMapping=Qc,this.renderer.toneMappingExposure=1,this.renderer.shadowMap.enabled=t.shadowCastingKeyLight,this.renderer.shadowMap.type=Jc,this.scene.background=new Oe(463135),this.scene.fog=new zo(463135,18,38),this.cameraRig.camera.layers.set(Hi),this.scene.add(this.cameraRig.camera),this.addGeneratedEnvironment(),this.addLighting(t),this.collectStaticLayerObjects(()=>this.addCourt()),this.goalRoot=this.addGoal(),this.collectStaticLayerObjects(()=>this.addArenaBackdrop()),this.shooter.root.position.set(-.78,0,-.42),this.shooter.root.rotation.y=D_,this.scene.add(this.shooter.root),this.goalkeeper.root.position.set(0,0,mt-.08),this.scene.add(this.goalkeeper.root),this.crowd=new Z_({instanceCount:t.crowdInstances,animatedInstanceMaximum:t.animatedCrowdInstances,animationMaximumHz:t.crowdAnimationMaximumHz,staticRenderLayer:Xn,animatedRenderLayer:Hi},1592598533,this.materialLibrary.surface("fabric"),this.materialLibrary.surface("skin")),this.scene.add(this.crowd.root),this.goalkeeperContactShadow=this.addContactShadows(),this.ball=this.mesh(new ln(.094,20,14),W_(this.materialLibrary)),this.ball.castShadow=!0,this.scene.add(this.ball),this.arcadeEffects=new tx(t,this.cameraRig.camera),this.scene.add(this.arcadeEffects.root)}async prewarm(){this.prewarmComplete||(await this.compileLayer(Hi),this.netHit=null,this.netHitSeconds=-100,this.frameHitSeconds=-100,this.arcadeEffects.resetVisuals(),await this.staticLayerCache.compileComposite(this.renderer),this.rebuildStaticLayerCache(),this.presentCachedFrame(),this.presentCachedFrame(),this.prewarmedShaderPrograms=this.shaderProgramCount(),this.prewarmComplete=!0)}beginShotMeasurement(){if(!this.prewarmComplete)throw new Error("Cannot measure a shot before material/light pre-warm.");this.performanceProbe.beginShot(this.shaderProgramCount())}beginShotFeedback(e,t,n){this.arcadeEffects.beginShot(e,t,n)}resolveShotFeedback(e,t,n){this.arcadeEffects.resolveOutcome(e,t,n)}netImpact(e,t){this.netHit=e,this.netHitSeconds=t}frameImpact(e,t){this.frameHitSeconds=t,this.ball.material instanceof Dn&&this.ball.material.emissive.setHex(16757819)}resetFeedback(){this.arcadeEffects.resetVisuals(),this.applyCanvasImpulse(0,0)}setReducedMotion(e){this.reducedMotion=e,this.arcadeEffects.setReducedMotion(e),e&&this.applyCanvasImpulse(0,0)}finishShotMeasurement(){this.performanceProbe.finishShot(this.shaderProgramCount())}resize(e,t){const n=Math.max(1,Math.floor(e)),s=Math.max(1,Math.floor(t));this.cameraRig.resize(n,s),this.renderer.setSize(n,s,!1),this.staticLayerCache.configure(n,s,this.renderer.getPixelRatio(),this.quality.name)}apply(e){if(this.ball.position.set(e.ballPosition.x,e.ballPosition.y,e.ballPosition.z),this.ball.rotation.set(e.simulationSeconds*8,e.simulationSeconds*(e.sideSpin===void 0?5:-e.sideSpin*20),e.simulationSeconds*2),this.arcadeEffects.update({ballPosition:e.ballPosition,shotProgress:e.shotProgress,resultProgress:e.resultProgress,simulationSeconds:e.simulationSeconds}),this.backNet){const o=this.backNet.geometry.getAttribute("position");for(let l=0;l<o.count;l++)o.setZ(l,this.netHit&&!this.reducedMotion?Fh(o.getX(l),o.getY(l)+1,this.netHit,e.simulationSeconds-this.netHitSeconds):0);o.needsUpdate=!0}this.ball.material instanceof Dn&&this.ball.material.emissive.setHex(e.simulationSeconds-this.frameHitSeconds<.1?5582858:0);const t=this.arcadeEffects.screenImpulse();this.applyCanvasImpulse(t.x,t.y),this.crowd.update(e.simulationSeconds);const n=Mo(e.shooterPhase,e.shotProgress,e.resultProgress,e.simulationSeconds,e.feintDirection,e.feintAmount,e.shotCategory,e.sideSpin,e.releasePower);if(this.shooter.applyPose(n.pose),e.shooterPhase==="FEINT"||e.shooterPhase==="READY"){const o=this.shooter.throwingHandWorld();this.ball.position.set(o.x,o.y,o.z)}this.shooterAnimationStage=n.stage,this.shooterReleaseAmount=n.releaseAmount,this.goalkeeper.root.position.set(e.keeperPosition.x*.52,Math.max(0,(e.keeperPosition.y-1)*.28),e.keeperPosition.z-.08),this.goalkeeperContactShadow.position.set(this.goalkeeper.root.position.x,.021,this.goalkeeper.root.position.z),this.goalkeeperContactShadow.scale.set(1+e.keeperDiveProgress*.65,1+e.keeperDiveProgress*.18,1);const s=U_(e.keeperZone,e.keeperPhase,e.keeperDiveProgress,e.resultProgress,e.outcome,e.simulationSeconds,e.keeperCommitted??!1);this.goalkeeper.applyPose(s.pose),this.goalkeeperAnimationStage=s.stage,this.goalkeeperVisualPhase=e.keeperPhase,this.goalkeeperDiveAmount=s.diveAmount,this.goalkeeperZone=e.keeperZone,this.goalkeeperSaveVolumeCenter.set(e.keeperPosition.x,e.keeperPosition.y,e.keeperPosition.z);const r=this.goalkeeper.diagnostics(),a=e.keeperZone?.endsWith("left")===!0?r.leftHandWorld:e.keeperZone?.endsWith("right")===!0?r.rightHandWorld:{x:(r.leftHandWorld.x+r.rightHandWorld.x)/2,y:(r.leftHandWorld.y+r.rightHandWorld.y)/2,z:(r.leftHandWorld.z+r.rightHandWorld.z)/2};this.goalkeeperVisibleReach.set(a.x,a.y,a.z)}render(){const e=performance.now(),t=this.lastPresentationMilliseconds===null?0:e-this.lastPresentationMilliseconds;this.staticLayerCache.isValid||this.rebuildStaticLayerCache();const n=this.presentCachedFrame();this.lastRenderCalls=n.drawCalls,this.lastRenderedTriangles=n.triangles,this.lastPresentationMilliseconds=e,this.presentedFrames+=1,this.canvas.__HANDBALL_PRESENTED_FRAMES__=this.presentedFrames;const s=this.canvas.__HANDBALL_RENDER_INTERVALS__,r=(this.presentedFrames-1)%512*2;s[r]=e,s[r+1]=performance.now(),this.performanceProbe.recordRender(performance.now()-e,t,this.lastRenderCalls,this.lastRenderedTriangles,this.shaderProgramCount())}diagnostics(){let e=!0,t=0;this.scene.traverse(_=>{_ instanceof Uo&&(t+=1),[_.position.x,_.position.y,_.position.z,_.rotation.x,_.rotation.y,_.rotation.z,_.scale.x,_.scale.y,_.scale.z].some(d=>!Number.isFinite(d))&&(e=!1)});const n=this.cameraRig.projectBounds({x:-Jt/2-Bt,y:0,z:mt},{x:Jt/2+Bt,y:gn+Bt,z:mt+Bi}),s=this.cameraRig.projectBounds(nx,ix),r=this.cameraRig.projectPoint(this.ball.position),a=this.shooter.diagnostics(),o=this.goalkeeper.diagnostics(),l=this.materialLibrary.diagnostics(),c=this.crowd.diagnostics(),h=this.rendererDiagnostics();let u=0,f=0;this.scene.traverse(_=>{_ instanceof Ns&&(u+=1,_.castShadow&&(f+=1))});const p=this.shaderProgramCount(),g=[...Object.values(this.shooterMaterials),...Object.values(this.goalkeeperMaterials)].map(_=>_.name);return Object.freeze({finiteTransforms:e&&a.finiteTransforms&&o.finiteTransforms,goalInnerWidthMeters:Jt,goalInnerHeightMeters:gn,releaseToGoalMeters:mt,goalAreaRadiusMeters:wa,penaltyLineDistanceMeters:Nc,freeThrowRadiusMeters:Fc,cameraCount:t,cameraProfile:this.cameraRig.currentLayout().profile,goalProjection:n,shooterProjection:s,ballProjection:r,ballWorldPosition:Object.freeze({x:this.ball.position.x,y:this.ball.position.y,z:this.ball.position.z}),shooterHandWorldPosition:a.rightHandWorld,goalCentered:n.fullyVisible&&Math.abs(n.centerX)<=.08&&Math.abs(n.centerY)<=.16,shooterLeftForeground:s.left<-.3&&s.right<-.18&&s.top<=1&&s.top>=-.35&&s.visibleWidth>=.46&&s.visibleWidth<=.72,shooterAnimationStage:this.shooterAnimationStage,shooterPoseName:a.poseName,shooterReleaseAmount:this.shooterReleaseAmount,goalkeeperAnimationStage:this.goalkeeperAnimationStage,goalkeeperVisualPhase:this.goalkeeperVisualPhase,goalkeeperPoseName:o.poseName,goalkeeperZone:this.goalkeeperZone,goalkeeperDiveAmount:this.goalkeeperDiveAmount,goalkeeperSaveVolumeCenter:Object.freeze({x:this.goalkeeperSaveVolumeCenter.x,y:this.goalkeeperSaveVolumeCenter.y,z:this.goalkeeperSaveVolumeCenter.z}),goalkeeperVisibleReach:Object.freeze({x:this.goalkeeperVisibleReach.x,y:this.goalkeeperVisibleReach.y,z:this.goalkeeperVisibleReach.z}),goalkeeperReachErrorMeters:this.goalkeeperVisibleReach.distanceTo(this.goalkeeperSaveVolumeCenter),characterArticulatedJointCount:a.articulatedJointCount+o.articulatedJointCount,characterMaterialNames:Object.freeze(g),characterVisualRootsOwnScoring:!1,ballPathPointCount:this.arcadeEffects.diagnostics().activeRibbonPoints,arcadeFx:this.arcadeEffects.diagnostics(),renderCalls:this.lastRenderCalls,renderedTriangles:this.lastRenderedTriangles,presentedFrames:this.presentedFrames,shaderPrograms:p,prewarmedShaderPrograms:this.prewarmedShaderPrograms,shaderProgramsStableSincePrewarm:this.prewarmComplete&&p===this.prewarmedShaderPrograms,prewarmComplete:this.prewarmComplete,appliedPixelRatio:this.renderer.getPixelRatio(),maximumPixelRatio:this.quality.maximumPixelRatio,shadowMapSize:this.quality.shadowMapSize,shadowCastingLights:f,arenaLights:u,environmentMapSize:this.quality.environmentMapSize,postProcessing:this.quality.postProcessing,renderer:h,generatedEnvironment:this.environmentTarget?.texture.userData.generatedInCode===!0,contactShadowCount:3,proceduralMaterials:l,crowd:c,staticLayerCache:Object.freeze({...this.staticLayerCache.diagnostics(),staticSceneObjects:this.staticRoot.children.length,preservesGoalKeeperOcclusion:this.usesOnlyLayer(this.goalRoot,Hi)&&this.usesOnlyLayer(this.goalkeeper.root,Hi)}),performance:this.performanceProbe.snapshot(),gpuGeometries:this.renderer.info.memory.geometries,gpuTextures:this.renderer.info.memory.textures})}dispose(){this.arcadeEffects.dispose(),this.shooter.dispose(),this.goalkeeper.dispose(),this.crowd.dispose(),Pc(this.shooterMaterials),Pc(this.goalkeeperMaterials);for(const e of this.disposables)e.dispose();this.staticLayerCache.dispose(),this.environmentTarget?.dispose(),this.materialLibrary.dispose(),this.renderer.dispose(),this.applyCanvasImpulse(0,0),delete this.canvas.__HANDBALL_PRESENTED_FRAMES__,delete this.canvas.__HANDBALL_RENDER_INTERVALS__}applyCanvasImpulse(e,t){const n=e===0&&t===0?"":`translate3d(${e.toFixed(2)}px, ${t.toFixed(2)}px, 0) scale(1.003)`;if(n!==this.appliedCanvasTransform){if(this.appliedCanvasTransform=n,n.length===0){this.canvas.style.removeProperty("transform");return}this.canvas.style.transform=n}}collectStaticLayerObjects(e){const t=new Set(this.scene.children);e();const n=this.scene.children.filter(s=>!t.has(s));for(const s of n)s.traverse(r=>{r.layers.set(Xn),r.userData.cachedStaticLayer=!0}),this.staticRoot.add(s)}async compileLayer(e){const t=this.cameraRig.camera.layers.mask;this.cameraRig.camera.layers.set(e);try{await this.renderer.compileAsync(this.scene,this.cameraRig.camera)}finally{this.cameraRig.camera.layers.mask=t}}rebuildStaticLayerCache(){this.staticLayerCache.rebuild(this.renderer,()=>{this.renderLayer(Xn)})}presentCachedFrame(){return this.staticLayerCache.present(this.renderer,()=>{this.renderDynamicLayer()})}renderDynamicLayer(){const e=this.scene.background;this.scene.background=null;try{this.renderLayer(Hi)}finally{this.scene.background=e}}renderLayer(e){const t=this.cameraRig.camera.layers.mask;this.cameraRig.camera.layers.set(e);try{this.renderer.render(this.scene,this.cameraRig.camera)}finally{this.cameraRig.camera.layers.mask=t}}usesOnlyLayer(e,t){let n=!0;const s=1<<t;return e.traverse(r=>{r.layers.mask!==s&&(n=!1)}),n}addGeneratedEnvironment(){const e=new So(this.renderer),t=new E_;this.environmentTarget=e.fromScene(t,.045,.1,100,{size:this.quality.environmentMapSize}),this.environmentTarget.texture.name="GeneratedArenaReflection",this.environmentTarget.texture.userData.generatedInCode=!0,this.scene.environment=this.environmentTarget.texture,this.scene.environmentIntensity=.58,t.dispose(),e.dispose()}addLighting(e){const t=new Nf(11065343,1582141,.68);t.layers.enable(Xn),this.scene.add(t);const n=new Jl(16775144,2.6);if(n.layers.enable(Xn),n.position.set(-4.5,9.5,-1.5),n.castShadow=e.shadowCastingKeyLight,n.shadow.mapSize.set(e.shadowMapSize,e.shadowMapSize),n.shadow.bias=-18e-5,n.shadow.normalBias=.025,n.shadow.camera.left=-11,n.shadow.camera.right=11,n.shadow.camera.top=15,n.shadow.camera.bottom=-6,n.shadow.camera.near=.5,n.shadow.camera.far=30,n.target.position.set(0,1,mt),this.scene.add(n.target),this.scene.add(n),e.name!=="balanced"){const s=new Jl(6994687,1.1);s.layers.enable(Xn),s.castShadow=!1,s.position.set(6,4.5,-2),s.target.position.set(0,1.3,5),this.scene.add(s.target,s)}if(e.name==="capture"){const s=new Kl(3324159,28,18,Math.PI/5,.62,1.7);s.layers.enable(Xn),s.castShadow=!1,s.position.set(4.5,5.5,2),s.target.position.set(-.75,1.1,-.2),this.scene.add(s.target,s);const r=new Kl(16760176,24,15,Math.PI/5,.65,1.8);r.layers.enable(Xn),r.castShadow=!1,r.position.set(-5,5.8,10.5),r.target.position.set(0,1.1,mt),this.scene.add(r.target,r)}}addCourt(){const e=this.materialLibrary.surface("court"),t=this.mesh(new Ot(20,28),new Dn({color:553941,roughness:.5,metalness:.04,normalScale:new Ve(.18,.18),envMapIntensity:.68,...Ki(e)}));t.rotation.x=-Math.PI/2,t.position.set(0,0,1),t.receiveShadow=!0,t.name="RegulationBlueCourt",this.scene.add(t);const n=this.mesh(new ko(wa,64,0,Math.PI),new Qt({color:480422,transparent:!0,opacity:.44,depthWrite:!1}));n.rotation.x=-Math.PI/2,n.position.set(0,.006,mt),n.name="SixMetreGoalArea",this.scene.add(n);const s=new Qt({color:16054527,toneMapped:!1});this.trackDisposables(s),this.addFloorRectangle(1,.065,0,mt-Nc,s,"SevenMetrePenaltyLine"),this.addFloorRectangle(20,.055,0,mt,s,"GoalLine");for(const r of[-9.97,9.97])this.addFloorRectangle(.055,20,r,-3,s,"Sideline");this.addArc(wa,!1,s),this.addArc(Fc,!0,s)}addArc(e,t,n){if(!t){const f=this.mesh(new Go(e-.035,e+.035,96,1,0,Math.PI),n);f.rotation.x=-Math.PI/2,f.position.set(0,.016,mt),f.name="SixMetreArc",this.scene.add(f);return}const s=25,r=Math.PI/(s*1.7),a=new dt(e*r,.028,.055),o=new It(a,n,s),l=new Xe,c=new L,h=new Nt,u=new L(1,1,1);for(let f=0;f<s;f+=1){const p=Math.PI+(f+.5)*Math.PI/s;c.set(Math.cos(p)*e,.022,mt+Math.sin(p)*e),h.setFromAxisAngle(new L(0,1,0),-p-Math.PI/2),l.compose(c,h,u),o.setMatrixAt(f,l)}o.instanceMatrix.needsUpdate=!0,o.name="InstancedNineMetreDashes",this.trackDisposables(a),this.scene.add(o)}addGoal(){const e=this.materialLibrary.surface("painted-metal"),t=new Dn({color:16054527,roughness:.38,metalness:.22,envMapIntensity:.85,...Ki(e)}),n=new Dn({color:480472,roughness:.4,metalness:.2,envMapIntensity:.82,...Ki(e)});this.trackDisposables(t,n);const s=new dt(1,1,1);this.trackDisposables(s);const r=new nn;r.name="RegulationThreeByTwoGoal";const a=[],o=[],l=new L,c=new Nt,h=new L,u=new Xe,f=(b,E,M,w,A)=>{l.set(E,M,mt),h.set(w,A,Bt),u.compose(l,c,h),(b==="blue"?a:o).push(u.clone())};for(const b of[-Jt/2-Bt/2,Jt/2+Bt/2])for(let E=0;E<6;E+=1)f(E%2===0?"blue":"white",b,(E+.5)*(gn+Bt)/6,Bt,(gn+Bt)/6);for(let b=0;b<9;b+=1)f(b%2===0?"blue":"white",-Jt/2-Bt+(b+.5)*(Jt+Bt*2)/9,gn+Bt/2,(Jt+Bt*2)/9,Bt);for(const[b,E,M]of[["Blue",n,a],["White",t,o]]){const w=new It(s,E,M.length);for(let A=0;A<M.length;A+=1){const C=M[A];C!==void 0&&w.setMatrixAt(A,C)}w.instanceMatrix.needsUpdate=!0,w.castShadow=!0,w.receiveShadow=!0,w.computeBoundingBox(),w.computeBoundingSphere(),w.name=`StripedGoal${b}Sections`,w.userData.sharedGoalStripeGeometry=!0,r.add(w)}const p=this.materialLibrary.surface("net"),g=new Qt({color:15267839,map:p.albedo,alphaMap:p.alpha,transparent:!0,opacity:.72,alphaTest:.18,depthWrite:!1,side:cn,toneMapped:!1}),_=mt+Bi;this.trackDisposables(g);const m=this.mesh(new Ot(Jt,gn,20,14),g);m.position.set(0,gn/2,_),this.backNet=m,m.name="ProceduralGoalNetBack",r.add(m);for(const b of[-Jt/2,Jt/2]){const E=this.mesh(new Ot(Bi,gn),g);E.rotation.y=Math.PI/2,E.position.set(b,gn/2,mt+Bi/2),E.name="ProceduralGoalNetSide",r.add(E)}const d=this.mesh(new Ot(Jt,Bi),g);return d.rotation.x=Math.PI/2,d.position.set(0,gn,mt+Bi/2),d.name="ProceduralGoalNetTop",r.add(d),this.scene.add(r),r}addArenaBackdrop(){const e=this.materialLibrary.surface("painted-metal"),t=this.materialLibrary.surface("fabric"),n=this.materialLibrary.surface("led-board"),s=new Yn({color:1121067}),r=new Yn({color:1714754}),a=new Yn({color:2503751}),o=new Yn({color:735085,map:t.albedo}),l=new Dn({color:10467272,roughness:.38,metalness:.78,envMapIntensity:.9,...Ki(e)});this.trackDisposables(s,r,a,o,l);const c=this.mesh(new dt(20.6,9.6,.35),s);c.position.set(0,4.8,15.4),c.receiveShadow=!0,c.name="ArenaEndWall",this.scene.add(c);for(const pe of[-10.2,10.2]){const Ce=this.mesh(new dt(.35,9.6,28),r);Ce.position.set(pe,4.8,1.5),Ce.receiveShadow=!0,Ce.name="ArenaSideWall",this.scene.add(Ce)}const h=this.mesh(new dt(20.7,.24,28),s);h.position.set(0,9.7,1.5),h.name="ArenaCeiling",this.scene.add(h);const u=new dt(18.4,.42,.88),f=8,p=new It(u,o,f),g=new Xe;for(let pe=0;pe<f;pe+=1)g.makeTranslation(0,.28+pe*.43,9.25+pe*.78),p.setMatrixAt(pe,g);p.instanceMatrix.needsUpdate=!0,p.receiveShadow=!0,p.name="SteepEuropeanStands",this.trackDisposables(u),this.scene.add(p);const _=new dt(.72,.08,.78);this.trackDisposables(_);const m=2*f,d=new It(_,a,m);let b=0;for(const pe of[-4.1,4.1])for(let Ce=0;Ce<f;Ce+=1)g.makeTranslation(pe,.53+Ce*.43,9.25+Ce*.78),d.setMatrixAt(b,g),b+=1;d.instanceMatrix.needsUpdate=!0,d.name="InstancedStandAisleSteps",this.scene.add(d);const E=new Mn(.025,.025,18,6),M=new Mn(.022,.022,.8,6);this.trackDisposables(E,M);const w=new It(E,l,2),A=new It(M,l,14),C=new Nt().setFromAxisAngle(new L(0,0,1),Math.PI/2),D=new L(1,1,1),S=new L;let y=0,P=0;for(const pe of[0,4]){const Ce=8.76+pe*.78,R=.8+pe*.43;S.set(0,R,Ce),g.compose(S,C,D),w.setMatrixAt(y,g),y+=1;for(const ke of[-8.5,-6,-3,0,3,6,8.5])g.makeTranslation(ke,R-.35,Ce),A.setMatrixAt(P,g),P+=1}w.instanceMatrix.needsUpdate=!0,w.name="InstancedStandRailings",A.instanceMatrix.needsUpdate=!0,A.name="InstancedStandRailingPosts",this.scene.add(w,A);const N=new Yn({color:1516336}),z=new Qt({color:9109450,toneMapped:!1});this.trackDisposables(N,z);for(const pe of[-6.8,6.8]){const Ce=this.mesh(new dt(1.25,2.2,.18),N);Ce.position.set(pe,1.15,15.14),Ce.name="ArenaExit",this.scene.add(Ce);const R=this.mesh(new dt(.86,.22,.08),z);R.position.set(pe,2.48,14.92),R.name="ExitLuminaire",this.scene.add(R)}const q=new Qt({color:408977,map:n.albedo,toneMapped:!1});this.trackDisposables(q);const G=["NOVA AEGIS","AURORA FORUM","VOLT UNION","SPIEL MIT HERZ"],V=[-6.8,-4.1,4.1,6.8];for(let pe=0;pe<V.length;pe+=1){const Ce=V[pe],R=G[pe];if(Ce===void 0||R===void 0)continue;const ke=this.mesh(new dt(2.35,.72,.12),q);ke.position.set(Ce,.55,8.48),ke.name="FictionalLedBoard",this.scene.add(ke);const we=this.materialLibrary.createTextPanelTexture(R,{width:768,height:192,background:"#05275f",foreground:"#f4fbff",accent:pe%2===0?"#27c8ff":"#5d91ff",fontPixels:R.length>16?54:66}),xe=new Qt({color:16777215,map:we,toneMapped:!1});this.trackDisposables(xe);const de=this.mesh(new Ot(2.14,.5),xe);de.position.set(Ce,.55,8.415),de.rotation.y=Math.PI,de.name="GeneratedLedMessage",this.scene.add(de)}this.addFictionalBanner(-4.15,5.25,14.98,"ENSEMBLE, PLUS FORTS","#0a4cac","#f3f7ff"),this.addFictionalBanner(0,5.55,14.98,"JUNTOS HACIA EL GOL","#123b86","#47cfff"),this.addFictionalBanner(4.15,5.25,14.98,"GEMEINSAM STARK","#0a4cac","#f3f7ff");const $=new dt(19.4,.13,.13),k=new dt(.1,.1,2.1),ie=new dt(1.25,.08,.42);this.trackDisposables($,k,ie);const ce=new Qt({color:16317439,toneMapped:!1});this.trackDisposables(ce);const ue=[-.5,5,10.5],Ie=new It($,l,ue.length),Ue=new It(k,l,ue.length*7),je=new It(ie,ce,ue.length*4);let He=0,j=0,K=0;for(const pe of ue){g.makeTranslation(0,8.65,pe),Ie.setMatrixAt(He,g),He+=1;for(const Ce of[-7.5,-5,-2.5,0,2.5,5,7.5])g.makeTranslation(Ce,8.65,pe),Ue.setMatrixAt(j,g),j+=1;for(const Ce of[-6,-2,2,6])g.makeTranslation(Ce,8.5,pe),je.setMatrixAt(K,g),K+=1}Ie.instanceMatrix.needsUpdate=!0,Ie.name="InstancedArenaRoofTrusses",Ue.instanceMatrix.needsUpdate=!0,Ue.name="InstancedArenaTrussCrossMembers",je.instanceMatrix.needsUpdate=!0,je.name="InstancedSportsHallLuminaires",this.scene.add(Ie,Ue,je);const oe=new dt(3.1,1.15,.12);this.trackDisposables(oe);const Te=[-7.2,-3.6,0,3.6,7.2],re=new It(oe,r,Te.length);for(let pe=0;pe<Te.length;pe+=1)g.makeTranslation(Te[pe]??0,7.15,15.05),re.setMatrixAt(pe,g);re.instanceMatrix.needsUpdate=!0,re.name="InstancedAcousticWallPanels",this.scene.add(re)}addFictionalBanner(e,t,n,s,r,a){const o=this.materialLibrary.createTextPanelTexture(s,{width:1024,height:320,background:r,foreground:"#f6f9ff",accent:a,fontPixels:s.length>18?74:88}),l=new Yn({color:16777215,map:o});this.trackDisposables(l);const c=this.mesh(new Ot(3.45,1.05),l);c.position.set(e,t,n),c.rotation.y=Math.PI,c.name="FictionalEuropeanBanner",this.scene.add(c)}addContactShadows(){const e=this.materialLibrary.createContactShadowTexture(),t=new Qt({color:132362,map:e,transparent:!0,opacity:.44,depthWrite:!1,toneMapped:!1});this.trackDisposables(t);const n=this.mesh(new Ot(1.15,.72),t);n.rotation.x=-Math.PI/2,n.position.set(-.78,.021,-.38),n.renderOrder=2,n.name="ShooterGeneratedContactShadow",this.scene.add(n);const s=this.mesh(new Ot(1.28,.66),t);s.rotation.x=-Math.PI/2,s.position.set(0,.021,mt-.08),s.renderOrder=2,s.name="GoalkeeperGeneratedContactShadow",this.scene.add(s);const r=this.mesh(new Ot(3.6,.82),t);return r.rotation.x=-Math.PI/2,r.position.set(0,.02,mt+.18),r.scale.y=.74,r.renderOrder=2,r.name="GoalGeneratedContactShadow",this.scene.add(r),s}addFloorRectangle(e,t,n,s,r,a){const o=this.mesh(new Ot(e,t),r);o.rotation.x=-Math.PI/2,o.position.set(n,.018,s),o.name=a,this.scene.add(o)}shaderProgramCount(){return this.renderer.info.programs?.length??0}rendererDiagnostics(){const e=this.renderer.getContext(),t=e.getExtension("WEBGL_debug_renderer_info"),n=String(t===null?e.getParameter(e.RENDERER):e.getParameter(t.UNMASKED_RENDERER_WEBGL)),s=String(t===null?e.getParameter(e.VENDOR):e.getParameter(t.UNMASKED_VENDOR_WEBGL)),r=String(e.getParameter(e.VERSION)),a=`${n} ${s}`.toLowerCase(),o=["swiftshader","llvmpipe","softpipe","software rasterizer","microsoft basic render"],l=["webkit webgl","mozilla","generic renderer"],c=o.some(h=>a.includes(h))?"software":n.trim().length===0||n.toLowerCase()==="unknown"||l.some(h=>a.includes(h))?"unknown":"hardware";return Object.freeze({acceleration:c,renderer:n,vendor:s,version:r})}mesh(e,t){return this.trackDisposables(e,t),new ht(e,t)}trackDisposables(...e){for(const t of e)this.disposables.add(t)}}const Uc=Object.freeze({GOAL:Object.freeze({title:"GOAL",detail:"Net ignited"}),SAVED:Object.freeze({title:"SAVED",detail:"Keeper shield"}),MISS:Object.freeze({title:"MISS",detail:"Outside the frame"})});class rx{constructor(e,t){this.root=e,this.options=t,this.audioEnabled=t.audioEnabled,this.reducedMotion=t.reducedMotion,e.innerHTML=`
      <section class="game-stage" aria-label="Aurora Forum handball penalty game">
        <canvas id="game-canvas" aria-label="Handball penalty court. Swipe upward from the lower part of the game area to shoot."></canvas>
        <svg class="swipe-trail" aria-hidden="true" preserveAspectRatio="none">
          <defs>
            <linearGradient id="swipe-energy" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0" stop-color="#27c9ff" stop-opacity="0.25"></stop>
              <stop offset="0.62" stop-color="#72e9ff"></stop>
              <stop offset="1" stop-color="#ffe39a"></stop>
            </linearGradient>
          </defs>
          <polyline class="swipe-glow"></polyline>
          <polyline class="swipe-core"></polyline>
          <circle class="swipe-tip" r="9"></circle>
        </svg>
        <div class="hud" aria-label="Match status">
          <section class="hud-panel hud-round" data-safe-zone="top-left" aria-label="Round progress">
            <span class="panel-notch" aria-hidden="true"></span>
            <span class="hud-kicker">Penalty round</span>
            <div class="round-row">
              <strong id="hud-round">Shot 1</strong>
              <span class="round-total">/ 5</span>
            </div>
            <div id="hud-progress" class="round-dots" aria-label="No shots taken">
              <span></span><span></span><span></span><span></span><span></span>
            </div>
          </section>

          <section class="hud-panel hud-score" data-safe-zone="top-center" aria-label="Score">
            <span class="score-team score-team-home">
              <small>Home</small><b>NOVA AEGIS</b>
            </span>
            <strong id="hud-score">0 : 0</strong>
            <span class="score-team score-team-away">
              <small>Away</small><b>VOLT UNION</b>
            </span>
            <span class="arena-tag">Aurora Forum · Arc Seven</span>
          </section>

          <section class="hud-panel hud-technique" data-safe-zone="top-right" aria-label="Technique">
            <span class="hud-kicker">Technique</span>
            <strong id="hud-technique-value">DIRECT</strong>
            <span class="technique-vector" aria-hidden="true">↗</span>
          </section>

          <section class="hud-settings" data-safe-zone="right-edge" aria-label="Accessibility and sound">
            <button id="toggle-audio" class="hud-toggle" type="button">
              <span class="toggle-icon" aria-hidden="true">◖</span>
              <span class="toggle-label">Audio</span>
            </button>
            <button id="toggle-motion" class="hud-toggle" type="button">
              <span class="toggle-icon" aria-hidden="true">◇</span>
              <span class="toggle-label">Motion</span>
            </button>
          </section>

          <section class="hud-panel hud-power" data-safe-zone="bottom-left" aria-label="Shot power">
            <span class="hud-kicker">Release power</span>
            <div class="power-row">
              <strong id="hud-power-value">0%</strong>
              <span class="power-track"><span id="hud-power-fill"></span></span>
            </div>
          </section>

          <section class="hud-panel hud-result" data-safe-zone="bottom-right" aria-live="assertive">
            <span class="hud-kicker">Outcome</span>
            <strong id="hud-result">READY</strong>
            <span id="hud-result-detail" class="result-detail">Five throws · one arena</span>
            <span class="result-reticle" aria-hidden="true">◎</span>
          </section>

          <section id="input-hint" class="input-hint" aria-label="First shot instruction">
            <span class="hint-gesture" aria-hidden="true"><i></i><b>↑</b></span>
            <span><strong>Swipe upward</strong><small>Start in the lower court · direction aims · speed powers</small></span>
          </section>

          <section id="round-summary" class="round-summary" hidden aria-labelledby="summary-title">
            <span class="summary-eyebrow">Aurora Forum · Full time</span>
            <h1 id="summary-title">Round complete</h1>
            <p id="summary-text"></p>
            <div class="summary-actions">
              <button id="restart-round" type="button" aria-label="Restart round">Play another round</button>
            </div>
          </section>
          <p id="app-status" class="sr-only" role="status" aria-live="polite">Loading court</p>
        </div>
      </section>
    `,this.canvas=this.required("#game-canvas"),this.round=this.required("#hud-round"),this.score=this.required("#hud-score"),this.result=this.required("#hud-result"),this.resultDetail=this.required("#hud-result-detail"),this.powerFill=this.required("#hud-power-fill"),this.powerValue=this.required("#hud-power-value"),this.technique=this.required("#hud-technique-value"),this.hint=this.required("#input-hint"),this.summary=this.required("#round-summary"),this.summaryTitle=this.required("#summary-title"),this.summaryText=this.required("#summary-text"),this.restartButton=this.required("#restart-round"),this.audioButton=this.required("#toggle-audio"),this.motionButton=this.required("#toggle-motion"),this.trail=this.required(".swipe-trail"),this.trailGlow=this.required(".swipe-trail .swipe-glow"),this.trailCore=this.required(".swipe-trail .swipe-core"),this.trailTip=this.required(".swipe-trail .swipe-tip"),this.status=this.required("#app-status"),this.outcomeDots=Array.from(this.required("#hud-progress").querySelectorAll("span")),this.restartButton.addEventListener("click",this.onRestart),this.audioButton.addEventListener("click",this.onAudioToggle),this.motionButton.addEventListener("click",this.onMotionToggle),this.setAudioEnabled(this.audioEnabled),this.setReducedMotion(this.reducedMotion)}root;canvas;round;score;result;resultDetail;powerFill;powerValue;technique;hint;summary;summaryTitle;summaryText;restartButton;audioButton;motionButton;trail;trailGlow;trailCore;trailTip;status;outcomeDots;options;audioEnabled;reducedMotion;lastPresentedOutcome=null;outcomePresentations={GOAL:0,SAVED:0,MISS:0};rejectedGesturePresentations=0;techniqueCategory="DIRECT";feintState=null;feintApparentDirection=null;trailVisible=!1;diagnosticTechnique=null;setDiagnosticTechnique(e){this.diagnosticTechnique=e,this.setTechnique(this.techniqueCategory,this.feintState)}trailViewportWidth=0;trailViewportHeight=0;update(e,t,n,s,r,a,o){const l=Math.min(e.shotsTaken+1,5);if(this.round.textContent=e.phase==="ROUND_COMPLETE"?"Complete":`Shot ${l}`,this.score.textContent=`${e.goals} : ${e.saves+e.misses}`,this.updateProgress(r),this.setTechnique(n,o),e.lastOutcome!==null){const u=Uc[e.lastOutcome];this.result.textContent=u.title,this.resultDetail.textContent=u.detail}else e.phase==="SHOT_ACTIVE"?(this.result.textContent="IN FLIGHT",this.resultDetail.textContent="Standard release"):s?(this.result.textContent="READY",this.resultDetail.textContent="Read the keeper"):(this.result.textContent="LOCKED",this.resultDetail.textContent="Arena resetting");this.result.dataset.outcome=e.lastOutcome??"",this.root.dataset.matchPhase=e.phase,this.root.dataset.inputEnabled=String(s),this.root.dataset.lastOutcome=e.lastOutcome??"";const c=Math.round(t*100);this.powerValue.textContent=`${c}%`,this.powerFill.style.setProperty("--power-percent",`${c}%`),this.hint.hidden=e.shotsTaken>0||e.phase!=="READY";const h=e.phase==="ROUND_COMPLETE"&&a;this.summary.hidden=!h,this.restartButton.disabled=!h,h&&(this.summaryTitle.textContent=e.goals>=3?"Nova Aegis takes it":"Volt Union holds firm",this.summaryText.textContent=`${e.goals} goals · ${e.saves} saved · ${e.misses} wide`)}presentShot(e,t,n=!1){this.setTechnique(t,n?"released":null),this.root.dataset.feedback="release",this.powerFill.dataset.charged=e>=.78?"true":"false",this.trailGlow.classList.add("is-committed"),this.trailCore.classList.add("is-committed"),this.setStatus(`${n?"FEINT into ":""}${t} shot released at ${Math.round(e*100)} percent power.`)}presentFeint(e){this.feintApparentDirection=e.apparentDirection,this.setTechnique(this.techniqueCategory,"pending"),this.setStatus("FEINT recognized. Lift your finger to finish the fake, then start a new gesture to shoot.")}clearFeint(e){this.feintApparentDirection=null,this.setTechnique(e,null)}presentOutcome(e){this.lastPresentedOutcome=e,this.outcomePresentations[e]+=1,this.root.dataset.feedback=e.toLowerCase(),this.result.classList.remove("is-impact"),this.reducedMotion||(this.result.offsetWidth,this.result.classList.add("is-impact"));const t=Uc[e];this.setStatus(`${t.title}. ${t.detail}.`)}presentRejectedGesture(e){this.rejectedGesturePresentations+=1,this.root.dataset.feedback="rejected",this.setStatus(`Swipe rejected (${e}). Start low and swipe upward.`)}resetRoundFeedback(){this.lastPresentedOutcome=null,this.outcomePresentations.GOAL=0,this.outcomePresentations.SAVED=0,this.outcomePresentations.MISS=0,this.rejectedGesturePresentations=0,this.feintApparentDirection=null,this.setTechnique("DIRECT",null),this.result.classList.remove("is-impact"),this.powerFill.dataset.charged="false",this.root.dataset.feedback="ready"}setStatus(e){this.status.textContent=e}setAudioEnabled(e){this.audioEnabled=e,this.audioButton.setAttribute("aria-pressed",String(e)),this.audioButton.setAttribute("aria-label",e?"Mute synthesized audio":"Enable synthesized audio"),this.audioButton.dataset.enabled=String(e),this.audioButton.querySelector(".toggle-label")?.replaceChildren(document.createTextNode(e?"Audio on":"Audio off")),this.root.dataset.audioEnabled=String(e)}setReducedMotion(e){this.reducedMotion=e,this.motionButton.setAttribute("aria-pressed",String(e)),this.motionButton.setAttribute("aria-label",e?"Enable full motion":"Reduce motion"),this.motionButton.dataset.enabled=String(!e),this.motionButton.querySelector(".toggle-label")?.replaceChildren(document.createTextNode(e?"Motion low":"Motion full")),this.root.dataset.reducedMotion=String(e)}setTrail(e,t){if(e.length<2){this.trailVisible&&this.clearTrail();return}(this.trailViewportWidth!==t.widthPixels||this.trailViewportHeight!==t.heightPixels)&&(this.trail.setAttribute("viewBox",`0 0 ${t.widthPixels} ${t.heightPixels}`),this.trailViewportWidth=t.widthPixels,this.trailViewportHeight=t.heightPixels);const n=e.map(r=>`${r.x},${r.y}`).join(" ");this.trailGlow.setAttribute("points",n),this.trailCore.setAttribute("points",n),this.trailGlow.classList.remove("is-committed"),this.trailCore.classList.remove("is-committed"),this.trailVisible||(this.trailVisible=!0,this.trail.classList.add("is-active"),this.trailGlow.classList.add("is-visible"),this.trailCore.classList.add("is-visible"),this.trailTip.classList.add("is-visible"));const s=e.at(-1);s!==void 0&&(this.trailTip.setAttribute("cx",String(s.x)),this.trailTip.setAttribute("cy",String(s.y)))}clearTrail(){this.trailVisible&&(this.trailVisible=!1,this.trail.classList.remove("is-active"),this.trailGlow.setAttribute("points",""),this.trailCore.setAttribute("points",""),this.trailGlow.classList.remove("is-visible","is-committed"),this.trailCore.classList.remove("is-visible","is-committed"),this.trailTip.classList.remove("is-visible"))}diagnostics(){return Object.freeze({audioEnabled:this.audioEnabled,reducedMotion:this.reducedMotion,firstShotInstructionVisible:!this.hint.hidden,roundCompleteVisible:!this.summary.hidden,lastPresentedOutcome:this.lastPresentedOutcome,outcomePresentations:Object.freeze({...this.outcomePresentations}),rejectedGesturePresentations:this.rejectedGesturePresentations,techniqueCategory:this.techniqueCategory,techniqueLabel:this.technique.textContent??this.techniqueCategory,feintState:this.feintState,feintApparentDirection:this.feintApparentDirection,safeAreaPanels:Object.freeze(Array.from(this.root.querySelectorAll("[data-safe-zone]"),e=>e.dataset.safeZone??"").filter(e=>e.length>0)),fictionalHomeTeam:"NOVA AEGIS",fictionalAwayTeam:"VOLT UNION",fictionalArena:"AURORA FORUM"})}dispose(){this.restartButton.removeEventListener("click",this.onRestart),this.audioButton.removeEventListener("click",this.onAudioToggle),this.motionButton.removeEventListener("click",this.onMotionToggle),this.root.replaceChildren()}setTechnique(e,t){this.techniqueCategory=e,this.feintState=t,t===null&&(this.feintApparentDirection=null),this.technique.textContent=t==="pending"?"FEINT":t==="released"?`FEINT → ${e}`:this.diagnosticTechnique??e,this.root.dataset.shotCategory=e,this.root.dataset.feintState=t??"",this.feintApparentDirection===null?(delete this.root.dataset.feintApparentX,delete this.root.dataset.feintApparentY):(this.root.dataset.feintApparentX=String(this.feintApparentDirection.x),this.root.dataset.feintApparentY=String(this.feintApparentDirection.y))}updateProgress(e){for(let n=0;n<this.outcomeDots.length;n+=1){const s=this.outcomeDots[n];if(s===void 0)continue;const r=e[n]??null;s.dataset.outcome=r??"",s.classList.toggle("is-complete",r!==null)}this.required("#hud-progress").setAttribute("aria-label",e.length===0?"No shots taken":e.map((n,s)=>`Shot ${s+1}: ${n}`).join(", "))}onRestart=()=>{this.options.onRestart()};onAudioToggle=()=>{this.options.onAudioChanged(!this.audioEnabled)};onMotionToggle=()=>{this.options.onReducedMotionChanged(!this.reducedMotion)};required(e){const t=this.root.querySelector(e);if(t===null)throw new Error(`Required HUD element '${e}' is missing.`);return t}}const Pt=i=>JSON.parse(JSON.stringify(i));class ax{constructor(e,t,n=40,s=2048){this.config=e,this.session=t,this.maxAttempts=n,this.maxSamples=s}config;session;maxAttempts;maxSamples;metadata={intendedTechnique:"UNLABELLED",partition:"UNASSIGNED"};attempts=[];current=null;shot=null;nextId=1;droppedAttempts=0;start(e){this.attempts.length>=this.maxAttempts&&(this.attempts.shift(),this.droppedAttempts++),this.current={id:this.nextId++,metadata:Pt(this.metadata),context:Pt(e),samples:[],truncated:!1,inputComplete:!1,viewport:Pt(e.viewport),gesture:null,reason:null,release:null,result:null,reset:null,action:null,events:[]},this.attempts.push(this.current)}sample(e){if(this.current){if(this.current.samples.length>=this.maxSamples){this.current.truncated=!0;return}this.current.samples.push(Pt(e))}}movement(){const e=this.current?.samples.at(-1);e&&(e.feintCheck=!0)}finish(e,t,n){this.current&&(Object.assign(this.current,{viewport:Pt(e),gesture:Pt(t&&this.current.truncated?{...t,rawPoints:[],smoothedPoints:[],resampledPoints:[]}:t),reason:n,inputComplete:!0}),t&&(this.current.action=t.feint!==null?"FEINT":"SHOT",t.feint===null&&(this.shot=this.current)),this.current=null)}actionEvent(e,t,n){const s=this.current??this.attempts.at(-1);s&&(s.events.length<4096?s.events.push(Pt({type:e,simulationSeconds:t,keeper:n})):s.truncated=!0)}keeperStep(e,t){this.actionEvent("KEEPER_STEP",e,t)}release(e){this.shot&&(this.shot.release=Pt(e))}result(e){this.shot&&(this.shot.result=Pt(e))}reset(e){this.actionEvent("RESET",e.simulationSeconds,null),this.shot&&(this.shot.reset=Pt(e)),this.shot=null}export(){return{schema:"handball-gesture-trace-v2",confidence:"No calibrated classifier confidence is exposed",sourceBinding:"Supervisor candidate manifest; runtime does not assert Git identity",config:Pt(this.config),session:Pt(this.session),limits:{maxAttempts:this.maxAttempts,maxSamples:this.maxSamples},droppedAttempts:this.droppedAttempts,attempts:this.attempts.map(e=>{const t=e.samples[0]?.sample.timeSeconds??0;return{...Pt(e),timestampOriginSeconds:t,replayable:e.inputComplete&&!e.truncated,lifecycleComplete:e.reason!==null||e.action==="FEINT"||e.result!==null&&e.reset!==null,samples:e.samples.map(n=>({...Pt(n),sample:{...Pt(n.sample),timeSeconds:n.sample.timeSeconds-t},parentTimeSeconds:n.parentTimeSeconds-t}))}})}}}const Aa=1/60,ox=1/20;class lx{constructor(e,t={}){if(this.root=e,this.uiMode=t.initialMode??"PLAYING",this.quality=t.quality??"balanced",this.sessionSeed=(t.seed??7999950)>>>0,this.manualTime=t.manualTime??!1,this.trace=t.recordGestures?new ax(Ji,{seed:this.sessionSeed,fixedStepSeconds:Aa,goal:Tt,goalkeeper:Vt,trajectory:zs,flight:nl,releasePosition:ds}):void 0,this.quality==="capture"&&!this.manualTime)throw new Error("The capture quality preset is restricted to fixed-frame capture mode.");this.qualityConfig=cu(this.quality),this.keeperController=this.createKeeperController(),this.reducedMotion=window.matchMedia("(prefers-reduced-motion: reduce)").matches,this.audio=this.resources.track(new iu({enabled:this.audioEnabled,outputEnabled:!this.manualTime})),this.hud=new rx(e,{onRestart:()=>this.restart(),onAudioChanged:n=>this.setAudioEnabled(n),onReducedMotionChanged:n=>this.setReducedMotion(n),audioEnabled:this.audioEnabled,reducedMotion:this.reducedMotion}),this.onboarding=new zh(e,()=>this.enterPlay(),()=>this.beginTutorial()),this.resources.track(this.onboarding),this.scene=this.resources.track(new sx(this.hud.canvas,this.qualityConfig)),this.scene.setReducedMotion(this.reducedMotion),this.input=this.resources.track(new Ku(this.hud.canvas,Ji,{onAccepted:n=>this.acceptGesture(n),onFeintCompleted:n=>{this.keeperController.completeFeint(),this.completedFeints++,this.holdingAfterFeint=!0,this.hud.setStatus("FEINT completed. Ball held. Start a new gesture to shoot."),this.feintVisualUntil=this.engine.simulationSeconds+.3,this.feintVisualDirection=n.gesture.feint?.apparentDirection.x??0,this.hud.clearTrail(),this.trace?.actionEvent("FEINT_COMPLETED",this.engine.simulationSeconds,this.keeperController.diagnostics())},onGestureStarted:()=>{this.prepareAmount=.01,this.trace?.actionEvent("GESTURE_START",this.engine.simulationSeconds,null),this.keeperController.queueGestureStart()},onGoalkeeperObservation:n=>{this.prepareAmount=Math.min(1,n.elapsedGestureSeconds/.25),this.trace?.actionEvent("OBSERVATION",this.engine.simulationSeconds,n),this.keeperController.queueObservation(n)},onFeintChanged:n=>this.handleFeintChanged(n),onRejected:n=>{this.prepareAmount=0,this.trace?.actionEvent("CANCEL",this.engine.simulationSeconds,null),this.keeperController.cancelGesture(),this.rejectedGestures+=1,this.lastGestureRejectionReason=n,this.hud.presentRejectedGesture(n)},onTrailChanged:(n,s)=>{this.hud.setTrail(n,s)}},this.trace)),this.input.setEnabled(!1),this.engine=this.resources.track(new au({fixedStepSeconds:Aa,manualPumping:this.manualTime,onFixedUpdate:(n,s)=>{this.fixedUpdate(n,s)},onPresent:()=>{this.scene.render()}})),this.resources.add(this.events.on("shotReleased",n=>{this.scene.beginShotFeedback(ds,n.power,n.simulationSeconds),this.hud.presentShot(n.power,n.category,n.feint!==null),this.audio.shotReleased(n.power,n.durationSeconds)})),this.resources.add(this.events.on("outcome",n=>{this.scene.resolveShotFeedback(n.outcome,n.target,n.simulationSeconds),this.hud.presentOutcome(n.outcome),this.audio.outcome(n.outcome)})),this.bindResizeListener(),this.resources.add(()=>this.unbindResizeListener()),this.resources.add(()=>{this.events.clear()}),e.dataset.quality=this.quality,e.dataset.runtimeMode=this.manualTime?"capture":"gameplay",e.dataset.appState=this.state,e.dataset.acceptedShots="0",e.dataset.resolvedShots="0",this.resize(),this.forceReadyVisuals(0),this.updateHud()}root;onboarding;uiMode;technique="DIRECT";tutorialStep=0;tutorialStage="INTRO";tutorialAge=0;tutorialReleases=0;tutorialFeints=0;tutorialFollowUp=!1;tutorialComplete=!1;bootStartedAtMilliseconds=performance.now();events=new ou;resources=new uu;quality;qualityConfig;sessionSeed;manualTime;audio;hud;scene;input;engine;trace;keeperController;match=jc();activeShot=null;outcomeHistory=[];state="created";acceptedShots=0;resolvedShots=0;rejectedGestures=0;lastGestureRejectionReason=null;lastPointerType=null;prepareAmount=0;pendingFeint=null;completedFeints=0;feintVisualUntil=0;holdingAfterFeint=!1;feintVisualDirection=0;displayedPower=0;displayedCategory="DIRECT";resizeListenerAttached=!1;bootTimeMilliseconds=0;inputActivatedAfterPrewarm=!1;audioEnabled=!0;reducedMotion=!1;roundSummaryVisible=!1;nextReadyPresentationSeconds=0;presentedReadyKeeperPhase=null;presentedReadyKeeperDestination=null;async start(){if(this.state!=="created")throw new Error(`Cannot start app from '${this.state}' state.`);this.state="running",this.root.dataset.appState="warming",this.events.emit("lifecycle",{state:this.state}),this.hud.setStatus("Preparing arena materials and lights…"),await this.scene.prewarm(),!this.hasBeenDisposed()&&(this.engine.start(),this.bootTimeMilliseconds=performance.now()-this.bootStartedAtMilliseconds,this.inputActivatedAfterPrewarm=!0,this.root.dataset.appState="ready",this.setInputEnabled(!0),this.hud.setStatus("Court ready. Swipe upward to shoot."),this.root.dataset.uiMode=this.uiMode,this.uiMode==="MENU"&&this.onboarding.menu(),this.uiMode==="TUTORIAL"&&this.beginTutorial())}snapshot(){const e=this.activeShot===null?null:Object.freeze({target:this.activeShot.target,presentationPosition:this.activeShot.presentationBall?{...this.activeShot.presentationBall.position}:null,category:this.activeShot.category,feint:this.activeShot.feint,power:this.activeShot.power,elapsedSeconds:this.activeShot.ball.elapsedSeconds,durationSeconds:this.activeShot.ball.durationSeconds,keeperZone:this.activeShot.keeperZone,resolved:this.activeShot.ball.terminalState!==null,ball:Object.freeze({position:jn(this.activeShot.ball.position),previousPosition:jn(this.activeShot.ball.previousPosition),velocity:jn(this.activeShot.ball.velocity),initialVelocity:jn(this.activeShot.ball.initialVelocity),releasePower:this.activeShot.ball.releasePower,releaseLoft:this.activeShot.ball.releaseLoft,releaseSideSpin:this.activeShot.ball.releaseSideSpin,releaseTopSpin:this.activeShot.ball.releaseTopSpin,releaseBounceIntent:this.activeShot.ball.releaseBounceIntent,launchLiftMeters:this.activeShot.ball.launchLiftMeters,sideSpinAccelerationMetersPerSecondSquared:this.activeShot.ball.sideSpinAccelerationMetersPerSecondSquared,topSpinDropAccelerationMetersPerSecondSquared:this.activeShot.ball.topSpinDropAccelerationMetersPerSecondSquared,releaseSpeedMetersPerSecond:this.activeShot.ball.releaseSpeedMetersPerSecond,gravityMetersPerSecondSquared:this.activeShot.ball.gravityMetersPerSecondSquared,groundRestitution:this.activeShot.ball.groundRestitution,minimumGroundReboundSpeedMetersPerSecond:this.activeShot.ball.minimumGroundReboundSpeedMetersPerSecond,maximumGroundBounces:this.activeShot.ball.maximumGroundBounces,groundBounceCount:this.activeShot.ball.groundBounceCount,elapsedSeconds:this.activeShot.ball.elapsedSeconds,contactHistory:Object.freeze(this.activeShot.ball.contactHistory.map(t=>Object.freeze({...t,position:jn(t.position),...t.normal===void 0?{}:{normal:jn(t.normal)},...t.incomingVelocity===void 0?{}:{incomingVelocity:jn(t.incomingVelocity)},...t.outgoingVelocity===void 0?{}:{outgoingVelocity:jn(t.outgoingVelocity)}}))),terminalState:this.activeShot.ball.terminalState})});return Object.freeze({state:this.state,uiMode:this.uiMode,technique:this.technique,tutorial:{step:this.tutorialStep,stage:this.tutorialStage,releases:this.tutorialReleases,feints:this.tutorialFeints,complete:this.tutorialComplete},quality:this.quality,simulationSeconds:this.engine.simulationSeconds,sessionSeed:this.sessionSeed,inputEnabled:this.isInputEnabled(),acceptedShots:this.acceptedShots,resolvedShots:this.resolvedShots,rejectedGestures:this.rejectedGestures,lastGestureRejectionReason:this.lastGestureRejectionReason,resizeListenerCount:this.resizeListenerAttached?1:0,outcomes:Object.freeze([...this.outcomeHistory]),lastPointerType:this.lastPointerType,actionPhase:this.activeShot!==null?this.activeShot.ball.terminalState===null?"SHOT_IN_PROGRESS":"RESOLUTION":this.pendingFeint!==null?"FEINT_IN_PROGRESS":this.keeperController.diagnostics().feintAgeSeconds!==null?"READY_FOR_SHOT":"READY",completedFeints:this.completedFeints,pendingFeint:this.pendingFeint,gestureInput:this.input.diagnostics(),goalkeeper:this.keeperController.diagnostics(),match:this.match,activeShot:e,feedback:Object.freeze({audio:this.audio.diagnostics(),hud:this.hud.diagnostics()}),scene:this.scene.diagnostics()})}performanceSnapshot(){const e=this.scene.diagnostics();return Object.freeze({quality:this.quality,runtimeMode:this.manualTime?"capture":"gameplay",selectedQuality:this.qualityConfig,bootTimeMilliseconds:this.bootTimeMilliseconds,inputActivatedAfterPrewarm:this.inputActivatedAfterPrewarm,prewarmComplete:e.prewarmComplete,drawCalls:e.renderCalls,triangles:e.renderedTriangles,shaderPrograms:e.shaderPrograms,prewarmedShaderPrograms:e.prewarmedShaderPrograms,shaderProgramsStableSincePrewarm:e.shaderProgramsStableSincePrewarm,appliedPixelRatio:e.appliedPixelRatio,maximumPixelRatio:e.maximumPixelRatio,crowdInstances:e.crowd.totalInstances,animatedCrowdInstances:e.crowd.animatedInstances,renderer:e.renderer,measuredShot:e.performance})}exportGestureTrace(){return this.trace?.export()??null}setTraceMetadata(e,t){this.trace&&(this.trace.metadata={intendedTechnique:e.slice(0,80),partition:t.slice(0,40)})}restart(){this.match.phase==="ROUND_COMPLETE"&&this.resetMatch()}resetMatch(){this.input.setEnabled(!1),this.scene.finishShotMeasurement(),this.trace?.actionEvent("ROUND_RESTART",this.engine.simulationSeconds,null),this.match=Tu(),this.keeperController=this.createKeeperController(),this.activeShot=null,this.acceptedShots=0,this.resolvedShots=0,this.rejectedGestures=0,this.lastGestureRejectionReason=null,this.outcomeHistory=[],this.lastPointerType=null,this.prepareAmount=0,this.pendingFeint=null,this.completedFeints=0,this.feintVisualUntil=0,this.holdingAfterFeint=!1,this.displayedPower=0,this.displayedCategory="DIRECT",this.technique="DIRECT",this.hud.setDiagnosticTechnique("DIRECT"),this.roundSummaryVisible=!1,this.hud.clearTrail(),this.hud.resetRoundFeedback(),this.scene.resetFeedback(),this.forceReadyVisuals(this.engine.simulationSeconds),this.setInputEnabled(!0),this.audio.uiConfirm(),this.hud.setStatus("New round ready.")}pumpFrames(e){this.engine.pumpFrames(e)}presentFrames(e){this.engine.presentFrames(e)}applyCaptureScene(e){if(!this.manualTime)throw new Error("Capture scenes require the manual capture clock.");const t=_u(e);if(t.seed!==this.sessionSeed)throw new Error(`Capture scene '${e}' requires seed ${t.seed}, received ${this.sessionSeed}.`);if(t.quality!==this.quality)throw new Error(`Capture scene '${e}' requires '${t.quality}' quality, received '${this.quality}'.`);const n=this.hud.canvas.getBoundingClientRect();if(Math.round(n.width)!==t.viewport.width||Math.round(n.height)!==t.viewport.height)throw new Error(`Capture scene '${e}' requires ${t.viewport.width}x${t.viewport.height}, received ${Math.round(n.width)}x${Math.round(n.height)}.`);if(t.requirement==="READY"&&this.match.phase!=="READY")throw new Error(`Capture scene '${e}' requires a ready match.`);if(t.requirement==="ACTIVE_SHOT"){const r=this.activeShot;if(r===null||r.ball.terminalState!==null)throw new Error(`Capture scene '${e}' requires a real accepted active shot.`);const a=t.targetShotFrame;if(a===null)throw new Error(`Capture scene '${e}' has no target shot frame.`);const o=Math.round(r.ball.elapsedSeconds/Aa);if(o>a)throw new Error(`Capture scene '${e}' passed its deterministic frame (${o} > ${a}).`);this.pumpFrames(a-o)}if(t.expectedKeeperZone!==null&&this.activeShot?.keeperZone!==t.expectedKeeperZone)throw new Error(`Capture scene '${e}' requires goalkeeper zone '${t.expectedKeeperZone}', received '${this.activeShot?.keeperZone??"none"}'.`);if(t.requirement==="RESULT"){if(this.activeShot===null||this.activeShot.ball.terminalState===null||this.match.lastOutcome!==t.expectedOutcome)throw new Error(`Capture scene '${e}' requires a real '${t.expectedOutcome}' result.`);this.pumpFrames(1)}if(t.requirement==="ROUND_COMPLETE"&&this.match.phase!=="ROUND_COMPLETE")throw new Error(`Capture scene '${e}' requires a completed round.`);if(t.requirement==="ROUND_COMPLETE"){for(let r=0;r<90&&!this.roundSummaryVisible;r+=1)this.pumpFrames(1);if(!this.roundSummaryVisible)throw new Error(`Capture scene '${e}' did not reach the real round summary.`)}this.presentFrames(2);const s=this.snapshot();if(!s.scene.finiteTransforms||s.scene.cameraCount!==1||s.resizeListenerCount!==1||!s.scene.goalCentered||!s.scene.shooterLeftForeground||s.scene.renderCalls<1||s.scene.renderedTriangles<1)throw new Error(`Capture scene '${e}' failed framing diagnostics: ${JSON.stringify(s.scene)}.`);if(t.requirement==="ACTIVE_SHOT"&&(!s.scene.ballProjection.visible||s.scene.ballPathPointCount<2))throw new Error(`Capture scene '${e}' does not show the real ball flight path.`);return s}dispose(){this.state!=="disposed"&&(this.state="disposed",this.keeperController.reset(),this.root.dataset.appState=this.state,this.events.emit("lifecycle",{state:this.state}),this.resources.dispose(),this.hud.dispose())}enterPlay(){this.uiMode="PLAYING",this.root.dataset.uiMode=this.uiMode,this.tutorialStage="STOPPED",this.onboarding.hide(),this.resetMatch()}beginTutorial(){this.uiMode="TUTORIAL",this.root.dataset.uiMode=this.uiMode,this.resetMatch(),this.tutorialStep=0,this.tutorialReleases=0,this.tutorialFeints=0,this.tutorialFollowUp=!1,this.tutorialComplete=!1,this.startTutorialStep()}startTutorialStep(){const e=Pa[this.tutorialStep];this.tutorialStage="INTRO",this.tutorialAge=0,this.hud.clearTrail(),this.onboarding.step(this.tutorialStep,e.name,e.instruction)}advanceTutorial(e){if(this.tutorialComplete)return;this.tutorialAge+=e;const t=this.tutorialFollowUp?eu:Pa[this.tutorialStep],n=this.hud.canvas.getBoundingClientRect(),s={widthPixels:n.width,heightPixels:n.height};if(this.tutorialStage==="INTRO"&&this.tutorialAge>=.8&&(this.tutorialStage="DRAW",this.tutorialAge=0,this.keeperController.queueGestureStart()),this.tutorialStage==="DRAW"){const r=Math.min(1,this.tutorialAge/1.5),a=nu(t.path,r,n.width,n.height);this.hud.setTrail(a.length===1?[a[0],a[0]]:a,s);const o=a[0],l=a.at(-1),c=(l.x-o.x)/n.width,h=(o.y-l.y)/n.height,u=Math.hypot(c,h);if(u>0&&this.keeperController.queueObservation({apparentDirection:{x:c/u,y:h/u},elapsedGestureSeconds:r*.36,confidence:Math.min(1,u),feint:null}),t.name==="FEINT"){const f=cl(t.path,s).rawPoints;this.pendingFeint=bo(f.slice(0,Math.floor(r*(f.length-1))+1),Ji)}if(r>=1){const f=cl(t.path,s);if(Fr(f)!==t.name)throw new Error(`Tutorial technique mismatch: ${t.name}`);this.technique=Fr(f),this.pendingFeint=null,f.feint?(this.keeperController.completeFeint(),this.holdingAfterFeint=!0,this.feintVisualDirection=f.feint.apparentDirection.x,this.feintVisualUntil=this.engine.simulationSeconds+.3,this.tutorialFeints++):(this.acceptGesture({gesture:f,pointerType:"synthetic-instructional"},!0),this.scene.beginShotFeedback(ds,f.power,this.engine.simulationSeconds),this.tutorialReleases++),this.tutorialStage="ACTION",this.tutorialAge=0,this.hud.clearTrail()}}else this.tutorialStage==="ACTION"&&this.tutorialAge>1&&this.activeShot===null?(this.tutorialStage="TAKEAWAY",this.tutorialAge=0,this.onboarding.message(t.takeaway)):this.tutorialStage==="TAKEAWAY"&&this.tutorialAge>1.8&&(this.tutorialStep===5&&!this.tutorialFollowUp?(this.tutorialFollowUp=!0,this.tutorialStage="INTRO",this.tutorialAge=0,this.onboarding.step(5,"FEINT → DIRECT","Nuevo toque. Ahora desliza y suelta para lanzar.")):this.tutorialStep<5?(this.tutorialStep++,this.startTutorialStep()):(this.tutorialComplete=!0,this.tutorialStage="COMPLETE",this.hud.clearTrail(),this.onboarding.complete()))}acceptGesture(e,t=!1){if(this.lastGestureRejectionReason=null,!t&&!this.isInputEnabled())return;const n=e.gesture;this.holdingAfterFeint=!1;const s=Au(n.aim.horizontalAim,n.aim.verticalAim,Tt),r=Ou(ds,s,n.power,zs,nl,n.loft,n.sideSpin,n.topSpin,n.bounceIntent),a=this.keeperController.preReleasePosition(Tt.center),o=this.keeperController.releaseGesture();this.trace?.actionEvent("SHOT_RELEASED",this.engine.simulationSeconds,this.keeperController.diagnostics()),this.trace?.release({target:s,initialPosition:{...r.position},initialVelocity:r.initialVelocity,ball:r,keeperZone:o,keeperStart:a,keeper:this.keeperController.diagnostics(),shotNumber:this.match.shotsTaken+1,simulationSeconds:this.engine.simulationSeconds}),t||(this.match=yu(this.match)),this.prepareAmount=0,this.activeShot={category:n.category,feint:n.feint,power:n.power,target:s,keeperZone:o,keeperStart:a,ball:r,presentationBall:null,presentedContacts:0,keeperTerminalPosition:null,resultElapsedSeconds:0},t||(this.acceptedShots+=1),this.technique=Fr(n),this.hud.setDiagnosticTechnique(this.technique),this.scene.beginShotMeasurement(),this.lastPointerType=e.pointerType,this.displayedPower=n.power,this.displayedCategory=n.category,this.hud.clearTrail(),this.root.dataset.acceptedShots=String(this.acceptedShots),this.setInputEnabled(!1),t||this.events.emit("shotReleased",{category:n.category,feint:n.feint,power:n.power,durationSeconds:r.durationSeconds,shotNumber:this.match.shotsTaken+1,simulationSeconds:this.engine.simulationSeconds}),this.applyShotVisuals(this.activeShot,this.engine.simulationSeconds)}handleFeintChanged(e){this.pendingFeint=e,e!==null?(this.trace?.actionEvent("FEINT_START",this.engine.simulationSeconds,this.keeperController.diagnostics()),this.hud.presentFeint(e)):this.activeShot===null&&this.hud.clearFeint(this.displayedCategory)}fixedUpdate(e,t){this.uiMode==="TUTORIAL"&&this.advanceTutorial(e);const n=this.activeShot;if(n===null){this.keeperController.advance(e),this.trace?.keeperStep(t,this.keeperController.diagnostics()),this.updateReadyVisuals(t);return}if(n.ball.terminalState===null){const s=Bs(n.keeperZone,Tt.center,Vt,n.ball.elapsedSeconds,n.keeperStart),r=Bs(n.keeperZone,Tt.center,Vt,n.ball.elapsedSeconds+e,n.keeperStart),a=Uu(n.ball,e,Tt,Vt,{previousPosition:s,currentPosition:r});this.trace?.actionEvent("FLIGHT_STEP",t,{position:n.ball.position,velocity:n.ball.velocity,elapsedSeconds:n.ball.elapsedSeconds,contacts:n.ball.contactHistory.length,terminalState:n.ball.terminalState});for(const o of n.ball.contactHistory.slice(n.presentedContacts))(o.kind==="VERTICAL_POST"||o.kind==="CROSSBAR")&&(this.audio.frameImpact(o.kind),this.scene.frameImpact(o.position,t));n.presentedContacts=n.ball.contactHistory.length,this.applyShotVisuals(n,t),a!==null&&this.resolveActiveShot(n);return}if(n.presentationBall){const s=n.presentationBall.netImpact;Nh(n.presentationBall,e,Tt),n.presentationBall.netImpact!==s&&n.presentationBall.netImpact&&this.scene.netImpact(n.presentationBall.netImpact,t)}n.resultElapsedSeconds+=e,this.applyResultVisuals(n,t),!(n.resultElapsedSeconds+Number.EPSILON<zs.resetDelaySeconds)&&(this.trace?.reset({simulationSeconds:t,nextShotReady:this.match.phase==="RESULT",roundComplete:this.match.phase==="ROUND_COMPLETE"}),this.activeShot=null,this.keeperController.reset(),this.scene.finishShotMeasurement(),this.scene.resetFeedback(),this.displayedPower=0,this.hud.clearTrail(),this.forceReadyVisuals(t),this.uiMode!=="TUTORIAL"&&(this.match.phase==="RESULT"?(this.match=Eu(this.match),this.setInputEnabled(!0),this.hud.setStatus("Ready for the next shot.")):(this.roundSummaryVisible=!0,this.setInputEnabled(!1),this.hud.setStatus("Round complete. Review the result and restart."))))}resolveActiveShot(e){const t=e.ball.terminalState;if(t===null)throw new Error("Cannot resolve a shot before a physical contact.");if(e.keeperTerminalPosition===null){if(e.keeperTerminalPosition=Bs(e.keeperZone,Tt.center,Vt,e.ball.elapsedSeconds,e.keeperStart),e.presentationBall=Oh(e.ball),e.resultElapsedSeconds=0,this.uiMode==="TUTORIAL"){this.scene.resolveShotFeedback(t,e.ball.position,this.engine.simulationSeconds);return}this.match=bu(this.match,t,Bh),this.resolvedShots+=1,this.outcomeHistory.push(t),this.trace?.result({outcome:t,contacts:e.ball.contactHistory,terminalPosition:e.ball.position,elapsedSeconds:e.ball.elapsedSeconds,simulationSeconds:this.engine.simulationSeconds}),this.root.dataset.resolvedShots=String(this.resolvedShots),this.updateHud(),this.events.emit("outcome",{outcome:t,shotNumber:this.match.shotsTaken,target:e.ball.position,simulationSeconds:this.engine.simulationSeconds})}}applyReadyVisuals(e){const t=this.keeperController.currentPhase,n=this.keeperController.currentDestination,s=t==="COMMIT";this.scene.apply({ballPosition:ds,keeperPosition:this.keeperController.preReleasePosition(Tt.center),keeperZone:s||t==="RECOVER"?n:null,keeperDiveProgress:s?.12:0,keeperPhase:t,shooterPhase:this.pendingFeint!==null||this.holdingAfterFeint||e<this.feintVisualUntil?"FEINT":"READY",feintDirection:this.pendingFeint?.apparentDirection.x??this.feintVisualDirection,feintAmount:this.pendingFeint!==null?1:Math.max(0,(this.feintVisualUntil-e)/.3),shotProgress:this.prepareAmount,resultProgress:t==="RECOVER"?Math.min(1,Math.max(0,((this.keeperController.diagnostics().feintAgeSeconds??0)-Vt.feintHoldSeconds)/Vt.feintRecoverySeconds)):0,outcome:null,simulationSeconds:e}),this.presentedReadyKeeperPhase=t,this.presentedReadyKeeperDestination=n}forceReadyVisuals(e){this.applyReadyVisuals(e),this.nextReadyPresentationSeconds=e+ox}updateReadyVisuals(e){const t=this.keeperController.currentPhase,n=this.keeperController.currentDestination;!(t!==this.presentedReadyKeeperPhase||n!==this.presentedReadyKeeperDestination)&&e+Number.EPSILON<this.nextReadyPresentationSeconds||this.forceReadyVisuals(e)}applyShotVisuals(e,t){const n=Xc(e.ball.elapsedSeconds,Vt),s=e.ball.elapsedSeconds<Vt.reactionDelaySeconds?"PREPARE":n<1?"DIVE":"HOLD";this.scene.apply({ballPosition:e.ball.position,keeperPosition:Bs(e.keeperZone,Tt.center,Vt,e.ball.elapsedSeconds,e.keeperStart),keeperZone:e.keeperZone,keeperDiveProgress:n,keeperPhase:s,keeperCommitted:this.keeperController.currentPhase==="COMMIT",shooterPhase:"RELEASE",releasePower:e.power,shotCategory:e.category,sideSpin:e.ball.releaseSideSpin,shotProgress:e.ball.elapsedSeconds/e.ball.durationSeconds,resultProgress:0,outcome:null,simulationSeconds:t})}applyResultVisuals(e,t){const n=Su(e.keeperTerminalPosition??Tt.center,Tt.center,Vt,e.resultElapsedSeconds),s=Math.min(1,e.resultElapsedSeconds/Vt.returnDurationSeconds),r="RECOVER",a=Math.min(1,e.resultElapsedSeconds/zs.resetDelaySeconds);this.scene.apply({ballPosition:e.presentationBall?.position??e.ball.position,keeperPosition:n,keeperZone:e.keeperZone,keeperDiveProgress:1-s,keeperPhase:"RETURN",shooterPhase:r,shotProgress:1,resultProgress:a,outcome:e.ball.terminalState,simulationSeconds:t})}isInputEnabled(){return this.uiMode==="PLAYING"&&this.state==="running"&&this.match.phase==="READY"}hasBeenDisposed(){return this.state==="disposed"}setInputEnabled(e){const t=e&&this.isInputEnabled();this.input.setEnabled(t),this.updateHud()}createKeeperController(){return new Mu(Vt,new Pr(this.sessionSeed).fork("keeper"))}updateHud(){const e=this.isInputEnabled();if(this.hud.update(this.match,this.displayedPower,this.displayedCategory,e,this.outcomeHistory,this.roundSummaryVisible,this.pendingFeint!==null?"pending":this.activeShot?.feint!==null&&this.activeShot?.feint!==void 0?"released":null),this.roundSummaryVisible&&this.match.goals===1){const t=this.root.querySelector("#summary-text");t!==null&&(t.textContent=t.textContent?.replace("1 goals","1 goal")??null)}this.root.dataset.acceptedShots=String(this.acceptedShots),this.root.dataset.resolvedShots=String(this.resolvedShots)}setAudioEnabled(e){this.audioEnabled=e,this.audio.setEnabled(e),this.hud.setAudioEnabled(e),this.hud.setStatus(e?"Synthesized arena audio enabled.":"Arena audio muted.")}setReducedMotion(e){this.reducedMotion=e,this.scene.setReducedMotion(e),this.hud.setReducedMotion(e),this.hud.setStatus(e?"Reduced motion enabled.":"Full arcade motion enabled.")}bindResizeListener(){if(this.resizeListenerAttached)throw new Error("Duplicate gameplay resize listener registration.");window.addEventListener("resize",this.resize),this.resizeListenerAttached=!0}unbindResizeListener(){this.resizeListenerAttached&&(window.removeEventListener("resize",this.resize),this.resizeListenerAttached=!1)}resize=()=>{const e=this.hud.canvas.getBoundingClientRect();this.scene.resize(e.width,e.height)}}function jn(i){return Object.freeze({x:i.x,y:i.y,z:i.z})}const jo=document.querySelector("#app");if(jo===null)throw new Error("Handball demo root element '#app' is missing.");const ii=new URLSearchParams(window.location.search),os=ii.has("capture"),Yo=ii.has("playtest"),Ah=Yo&&ii.has("trace")&&!os,zc=ii.get("seed"),Ra=zc===null?Number.NaN:Number(zc),Bc=Number.isFinite(Ra)&&Ra>=0?Ra:void 0,cx=ii.get("quality"),hx=hu(cx,os?"capture":"gameplay"),on=new lx(jo,{manualTime:os,initialMode:os||Yo?"PLAYING":ii.has("tutorial")?"TUTORIAL":"MENU",quality:hx,recordGestures:Ah,...Bc===void 0?{}:{seed:Bc}});if(Ah){const i=document.createElement("div");i.dataset.gestureTrace="true",i.style.cssText="position:fixed;top:64px;left:8px;z-index:100;max-width:90vw;max-height:calc(55dvh - 72px);overflow:auto;background:#18202b;color:white;padding:6px;font:12px sans-serif";const e=document.createElement("select");e.setAttribute("aria-label","Human intended technique");for(const a of["UNLABELLED","LOB","ROSCA_LEFT","ROSCA_RIGHT","DIRECT","BOUNCE","FEINT"])e.add(new Option(a,a));const t=document.createElement("select");t.setAttribute("aria-label","Dataset partition");for(const a of["UNASSIGNED","CALIBRATION","HELD_OUT","SYNTHETIC_DIAGNOSTIC"])t.add(new Option(a,a));const n=()=>on.setTraceMetadata(e.value,t.value);e.addEventListener("change",n),t.addEventListener("change",n);const s=document.createElement("button");s.type="button",s.textContent="Download local gesture traces",s.addEventListener("click",()=>{const a=URL.createObjectURL(new Blob([JSON.stringify(on.exportGestureTrace(),null,2)],{type:"application/json"})),o=document.createElement("a");o.href=a,o.download="handball-gesture-traces.json",o.click(),setTimeout(()=>URL.revokeObjectURL(a),1e3)});const r=document.createElement("div");r.textContent="Diagnostic recording · human intent / dataset (next attempt)",i.append(r,e,t,s),jo.append(i)}async function ux(){await on.start(),(os||Yo||ii.has("tutorial")||ii.has("onboarding-test"))&&(window.__DEMO__=Object.freeze({snapshot:()=>on.snapshot(),restart:()=>on.restart(),exportGestureTrace:()=>on.exportGestureTrace()}),window.__PERF_SNAPSHOT__=()=>on.performanceSnapshot(),os&&(window.__PUMP__=i=>on.pumpFrames(i),window.__PRESENT__=i=>on.presentFrames(i),window.__CAPTURE_SCENES__=gu,window.__APPLY_CAPTURE_SCENE__=i=>on.applyCaptureScene(i)),window.__READY__=!0)}ux().catch(i=>{console.error("Handball demo failed during material/light pre-warm.",i),on.dispose()});
