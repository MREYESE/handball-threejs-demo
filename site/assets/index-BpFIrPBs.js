(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))n(s);new MutationObserver(s=>{for(const r of s)if(r.type==="childList")for(const a of r.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&n(a)}).observe(document,{childList:!0,subtree:!0});function t(s){const r={};return s.integrity&&(r.integrity=s.integrity),s.referrerPolicy&&(r.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?r.credentials="include":s.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function n(s){if(s.ep)return;s.ep=!0;const r=t(s);fetch(s.href,r)}})();const Wo=Object.freeze({minimumDistancePixels:40,minimumDurationSeconds:.03,maximumDurationSeconds:1.5,maximumSampleGapSeconds:.25,startZoneFraction:.45,minimumIntermediateDistanceSafeFraction:.002,horizontalFullRangeViewportFraction:.22,verticalFullRangeViewportFraction:.28,resamplePointCount:32,smoothingWindow:3,releaseSpeedSampleCount:4,releaseSpeedFullPowerSafeFractionsPerSecond:2.4,maximumSpeedFullPowerSafeFractionsPerSecond:3,pathLengthFullPowerSafeFraction:.35,loftFullRangeSafeFraction:.12,loftMaximumHorizontalDeviationSafeFraction:.12,sideSpinFullRangeSafeFraction:.12,topSpinFullRangeSafeFraction:.12,topSpinMaximumHorizontalDeviationSafeFraction:.12,bounceZeroIntentVerticalGesture01:.5,lobCategoryMinimumLoft:.6,bounceCategoryMinimumIntent:.6,feintMinimumInitialImpulseSafeFraction:.055,feintMinimumInitialHorizontalRatio:.7,feintMinimumBrakeSafeFraction:.025,feintMaximumBrakeSpeedRatio:.3,feintMaximumReversalDirectionDot:-.35,feintMinimumSecondImpulseSafeFraction:.06,feintMaximumSecondImpulseDirectionDot:-.2,feintMaximumPrefixDurationSeconds:.75,releaseSpeedWeight:.5,maximumSpeedWeight:.3,pathLengthWeight:.2}),Ct=Object.freeze({widthMeters:3,heightMeters:2,postThicknessMeters:.12,ballRadiusMeters:.094,safetyMarginMeters:.02,horizontalOvershootFactor:.15,verticalOvershootFactor:.15,center:Object.freeze({x:0,y:1,z:7})}),Is=Object.freeze({minimumDurationSeconds:.35,maximumDurationSeconds:.8,arcHeightMeters:1.1,resetDelaySeconds:.7}),Xo=Object.freeze({playableVolume:Object.freeze({halfWidthMeters:10.025,ceilingHeightMeters:9.58,minimumZMeters:-12.5}),minimumReleaseSpeedMetersPerSecond:8,maximumReleaseSpeedMetersPerSecond:24,minimumLaunchLiftMeters:.45,maximumLaunchLiftMeters:1.35,maximumSideSpinAccelerationMetersPerSecondSquared:8,maximumTopSpinDropAccelerationMetersPerSecondSquared:12,gravityMetersPerSecondSquared:-9.81,postRestitution:.72,crossbarRestitution:.68,minimumGroundRestitution:0,maximumGroundRestitution:.72,minimumGroundReboundSpeedMetersPerSecond:1.25,maximumGroundBounces:1}),kt=Object.freeze({feintHoldSeconds:.65,feintRecoverySeconds:.6,feintMaximumSpeedMetersPerSecond:1.2,horizontalRangeMeters:1.2,verticalRangeMeters:.75,reactionDelaySeconds:.15,diveDurationSeconds:.3,returnDurationSeconds:.25,saveRadiusMeters:.65,contactRestitution:.6,minimumReadSeconds:.08,maximumReadSeconds:.45,minimumCueConfidence:.055,minimumCueAgreementDot:.5,minimumStableCueSamples:2,horizontalCommitThreshold:.3,verticalCommitThreshold:.35,maximumTendency:.08}),yh=Object.freeze({shotsPerRound:5}),Os=Object.freeze({x:0,y:1,z:0}),qo=()=>({ambience:0,crowd:0,throw:0,flight:0,goal:0,save:0,miss:0,ui:0});class bh{requestedCues=qo();scheduledCues=qo();outputEnabled;enabled;context=null;masterGain=null;ambienceStarted=!1;ambienceNodes=[];noiseBuffer=null;disposed=!1;outputAvailable;constructor(e){this.enabled=e.enabled,this.outputEnabled=e.outputEnabled,this.outputAvailable=this.resolveConstructor()!==null}setEnabled(e){if(!(this.disposed||this.enabled===e)){if(this.enabled=e,!e){this.context?.state==="running"&&this.context.suspend().catch(()=>{});return}this.requestedCues.ui+=1,this.withContext((t,n)=>{this.scheduledCues.ui+=1,this.scheduleTone(t,n,{frequency:620,endFrequency:880,durationSeconds:.08,gain:.05,type:"sine"})})}}shotReleased(e,t){this.disposed||!this.enabled||(this.requestedCues.throw+=1,this.requestedCues.flight+=1,this.withContext((n,s)=>{this.scheduledCues.throw+=1,this.scheduledCues.flight+=1;const r=Math.max(0,Math.min(1,e));this.scheduleNoiseBurst(n,s,{durationSeconds:.16,gain:.075+r*.035,filterFrequency:1250+r*650,filterType:"bandpass"}),this.scheduleTone(n,s,{frequency:105+r*45,endFrequency:68,durationSeconds:.14,gain:.07,type:"triangle"}),this.scheduleTone(n,s,{frequency:175+r*70,endFrequency:360+r*110,durationSeconds:Math.max(.12,t),gain:.022+r*.018,type:"sine"})}))}outcome(e){if(this.disposed||!this.enabled)return;const t=e==="GOAL"?"goal":e==="SAVED"?"save":"miss";this.requestedCues[t]+=1,this.requestedCues.crowd+=1,this.requestedCues.ui+=1,this.withContext((n,s)=>{this.scheduledCues[t]+=1,this.scheduledCues.crowd+=1,this.scheduledCues.ui+=1,this.scheduleOutcomeTones(n,s,e),this.scheduleCrowdReaction(n,s,e)})}uiConfirm(){this.disposed||!this.enabled||(this.requestedCues.ui+=1,this.withContext((e,t)=>{this.scheduledCues.ui+=1,this.scheduleTone(e,t,{frequency:520,endFrequency:720,durationSeconds:.07,gain:.045,type:"sine"})}))}diagnostics(){return Object.freeze({enabled:this.enabled,outputEnabled:this.outputEnabled,outputAvailable:this.outputAvailable,state:this.state(),contextState:this.context?.state??"not-created",requestedCues:Object.freeze({...this.requestedCues}),scheduledCues:Object.freeze({...this.scheduledCues}),ambienceStarted:this.ambienceStarted,synthesizedOnly:!0})}dispose(){if(this.disposed)return;this.disposed=!0;for(const t of this.ambienceNodes){try{t.stop()}catch{}t.disconnect()}this.ambienceNodes=[],this.masterGain?.disconnect(),this.masterGain=null,this.noiseBuffer=null;const e=this.context;this.context=null,e!==null&&e.state!=="closed"&&e.close().catch(()=>{})}state(){return this.disposed?"disposed":this.outputEnabled?this.outputAvailable?this.enabled?this.context===null?"armed":this.context.state==="running"?"running":"suspended":"muted":"unavailable":"capture-muted"}resolveConstructor(){const e=globalThis;return e.AudioContext??e.webkitAudioContext??null}async withContext(e){if(this.disposed||!this.enabled||!this.outputEnabled||!this.outputAvailable)return;const t=this.ensureContext();if(t!==null)try{if(t.state==="suspended"&&await t.resume(),this.disposed||!this.enabled||t.state!=="running")return;this.startAmbience(t);const n=this.masterGain;n!==null&&e(t,n)}catch{this.outputAvailable=!1}}ensureContext(){if(this.context!==null)return this.context;const e=this.resolveConstructor();if(e===null)return this.outputAvailable=!1,null;try{const t=new e({latencyHint:"interactive"}),n=t.createGain();return n.gain.setValueAtTime(.42,t.currentTime),n.connect(t.destination),this.context=t,this.masterGain=n,this.noiseBuffer=this.createGeneratedNoise(t),t}catch{return this.outputAvailable=!1,null}}startAmbience(e){if(this.ambienceStarted||this.masterGain===null)return;this.ambienceStarted=!0,this.requestedCues.ambience+=1,this.scheduledCues.ambience+=1;const t=e.createGain();t.gain.setValueAtTime(.018,e.currentTime);const n=e.createBiquadFilter();n.type="lowpass",n.frequency.setValueAtTime(520,e.currentTime),t.connect(n),n.connect(this.masterGain);for(const[s,r]of[[82,"sine"],[123,"triangle"]]){const a=e.createOscillator();a.type=r,a.frequency.setValueAtTime(s,e.currentTime),a.detune.setValueAtTime(s===82?-4:5,e.currentTime),a.connect(t),a.start(),this.ambienceNodes.push(a)}}scheduleOutcomeTones(e,t,n){if(n==="GOAL"){this.scheduleTone(e,t,{frequency:392,endFrequency:784,durationSeconds:.32,gain:.095,type:"sawtooth"}),this.scheduleTone(e,t,{frequency:523.25,endFrequency:659.25,durationSeconds:.38,gain:.06,type:"triangle",delaySeconds:.05});return}if(n==="SAVED"){this.scheduleTone(e,t,{frequency:168,endFrequency:92,durationSeconds:.26,gain:.11,type:"square"}),this.scheduleNoiseBurst(e,t,{durationSeconds:.2,gain:.08,filterFrequency:720,filterType:"lowpass"});return}this.scheduleTone(e,t,{frequency:260,endFrequency:128,durationSeconds:.34,gain:.07,type:"triangle"})}scheduleCrowdReaction(e,t,n){this.scheduleNoiseBurst(e,t,{durationSeconds:n==="GOAL"?.62:.42,gain:n==="GOAL"?.11:n==="SAVED"?.085:.05,filterFrequency:n==="GOAL"?1450:n==="SAVED"?980:620,filterType:"bandpass",delaySeconds:n==="MISS"?.04:0})}scheduleTone(e,t,n){const s=e.currentTime+(n.delaySeconds??0),r=s+n.durationSeconds,a=e.createOscillator(),o=e.createGain();a.type=n.type,a.frequency.setValueAtTime(n.frequency,s),a.frequency.exponentialRampToValueAtTime(Math.max(1,n.endFrequency),r),o.gain.setValueAtTime(1e-4,s),o.gain.exponentialRampToValueAtTime(n.gain,s+.012),o.gain.exponentialRampToValueAtTime(1e-4,r),a.connect(o),o.connect(t),a.start(s),a.stop(r+.02)}scheduleNoiseBurst(e,t,n){const s=this.noiseBuffer;if(s===null)return;const r=e.currentTime+(n.delaySeconds??0),a=r+n.durationSeconds,o=e.createBufferSource(),l=e.createBiquadFilter(),c=e.createGain();o.buffer=s,l.type=n.filterType,l.frequency.setValueAtTime(n.filterFrequency,r),l.Q.setValueAtTime(.7,r),c.gain.setValueAtTime(1e-4,r),c.gain.exponentialRampToValueAtTime(n.gain,r+.02),c.gain.exponentialRampToValueAtTime(1e-4,a),o.connect(l),l.connect(c),c.connect(t),o.start(r),o.stop(a+.02)}createGeneratedNoise(e){const t=Math.max(1,Math.floor(e.sampleRate*.72)),n=e.createBuffer(1,t,e.sampleRate),s=n.getChannelData(0);let r=7999950;for(let a=0;a<s.length;a+=1)r=Math.imul(r,1664525)+1013904223>>>0,s[a]=r/4294967295*2-1;return n}}const jo=1e-9;class Eh{stepSeconds;maximumFrameSeconds;maximumStepsPerFrame;accumulatorSeconds=0;elapsedSimulationSeconds=0;constructor(e={}){if(this.stepSeconds=e.stepSeconds??1/60,this.maximumFrameSeconds=e.maximumFrameSeconds??.25,this.maximumStepsPerFrame=e.maximumStepsPerFrame??8,!Number.isFinite(this.stepSeconds)||this.stepSeconds<=0)throw new RangeError("Fixed clock step must be a positive finite number.");if(!Number.isFinite(this.maximumFrameSeconds)||this.maximumFrameSeconds<=0)throw new RangeError("Maximum frame duration must be a positive finite number.");if(!Number.isInteger(this.maximumStepsPerFrame)||this.maximumStepsPerFrame<1)throw new RangeError("Maximum steps per frame must be a positive integer.")}get simulationSeconds(){return this.elapsedSimulationSeconds}advance(e,t){const n=Number.isFinite(e)?Math.max(0,e):0,s=Math.min(n,this.maximumFrameSeconds);let r=n-s;this.accumulatorSeconds+=s;let a=0;for(;this.accumulatorSeconds+jo>=this.stepSeconds&&a<this.maximumStepsPerFrame;)this.accumulatorSeconds-=this.stepSeconds,this.elapsedSimulationSeconds+=this.stepSeconds,a+=1,t(this.stepSeconds,this.elapsedSimulationSeconds);if(this.accumulatorSeconds+jo>=this.stepSeconds){const o=this.accumulatorSeconds%this.stepSeconds;r+=this.accumulatorSeconds-o,this.accumulatorSeconds=o}return Object.freeze({steps:a,interpolationAlpha:this.accumulatorSeconds/this.stepSeconds,droppedSeconds:r})}reset(){this.accumulatorSeconds=0,this.elapsedSimulationSeconds=0}}function Th(){return{request:i=>window.requestAnimationFrame(i),cancel:i=>window.cancelAnimationFrame(i)}}class wh{constructor(e){this.options=e,this.clock=new Eh({stepSeconds:e.fixedStepSeconds}),this.scheduler=e.scheduler??Th()}options;clock;scheduler;animationFrame;previousTimestampMilliseconds;running=!1;get simulationSeconds(){return this.clock.simulationSeconds}start(){if(!this.running){if(this.running=!0,this.previousTimestampMilliseconds=void 0,this.options.onPresent?.(0),this.options.manualPumping===!0){this.animationFrame=this.scheduler.request(this.presentationFrame);return}this.animationFrame=this.scheduler.request(this.frame)}}pumpFrames(e){if(!this.running||this.options.manualPumping!==!0)throw new Error("Manual frame pumping is only available in running manual mode.");if(!Number.isInteger(e)||e<0)throw new RangeError("Manual frame count must be a non-negative integer.");for(let t=0;t<e;t+=1){const n=this.clock.advance(this.options.fixedStepSeconds,this.options.onFixedUpdate);this.options.onPresent?.(n.interpolationAlpha)}}presentFrames(e){if(!this.running||this.options.manualPumping!==!0)throw new Error("Manual presentation is only available in running manual mode.");if(!Number.isInteger(e)||e<0)throw new RangeError("Presentation frame count must be a non-negative integer.");for(let t=0;t<e;t+=1)this.options.onPresent?.(0)}stop(){this.running&&(this.running=!1,this.animationFrame!==void 0&&(this.scheduler.cancel(this.animationFrame),this.animationFrame=void 0),this.previousTimestampMilliseconds=void 0)}dispose(){this.stop()}frame=e=>{if(!this.running)return;const t=this.previousTimestampMilliseconds??e,n=(e-t)/1e3;this.previousTimestampMilliseconds=e;const s=this.clock.advance(n,this.options.onFixedUpdate);this.options.onPresent?.(s.interpolationAlpha),this.animationFrame=this.scheduler.request(this.frame)};presentationFrame=()=>{this.running&&(this.options.onPresent?.(0),this.animationFrame=this.scheduler.request(this.presentationFrame))}}class Ah{handlers=new Map;on(e,t){let n=this.handlers.get(e);n===void 0&&(n=new Set,this.handlers.set(e,n));const s=t;return n.add(s),()=>{n.delete(s),n.size===0&&this.handlers.delete(e)}}emit(e,t){const n=this.handlers.get(e);if(n!==void 0)for(const s of[...n])s(t)}clear(){this.handlers.clear()}}const Rh={balanced:Object.freeze({name:"balanced",runtimeRole:"default_gameplay",maximumPixelRatio:1.25,shadowMapSize:512,shadowMapSizeMaximum:1024,crowdInstances:160,crowdInstancesMaximum:240,animatedCrowdInstances:0,animatedCrowdInstancesMaximum:48,crowdAnimationMaximumHz:0,proceduralTextureResolution:96,proceduralTextureResolutionMaximum:128,environmentMapSize:32,environmentMapSizeMaximum:96,shadowCastingLightsMaximum:1,shadowCastingKeyLight:!1,antialias:!1,postProcessing:!1,postProcessingAllowed:!1,frustumCullingRequired:!0}),high:Object.freeze({name:"high",runtimeRole:"explicit_opt_in_gameplay",maximumPixelRatio:1.5,shadowMapSize:512,shadowMapSizeMaximum:1024,crowdInstances:256,crowdInstancesMaximum:480,animatedCrowdInstances:0,animatedCrowdInstancesMaximum:96,crowdAnimationMaximumHz:0,proceduralTextureResolution:128,proceduralTextureResolutionMaximum:192,environmentMapSize:64,environmentMapSizeMaximum:128,shadowCastingLightsMaximum:1,shadowCastingKeyLight:!1,antialias:!1,postProcessing:!1,postProcessingAllowed:!1,frustumCullingRequired:!0}),capture:Object.freeze({name:"capture",runtimeRole:"offline_capture_only",maximumPixelRatio:1,shadowMapSize:1024,shadowMapSizeMaximum:2048,crowdInstances:480,crowdInstancesMaximum:960,animatedCrowdInstances:0,animatedCrowdInstancesMaximum:0,crowdAnimationMaximumHz:0,proceduralTextureResolution:192,proceduralTextureResolutionMaximum:256,environmentMapSize:96,environmentMapSizeMaximum:256,shadowCastingLightsMaximum:1,shadowCastingKeyLight:!0,antialias:!0,postProcessing:!1,postProcessingAllowed:!0,frustumCullingRequired:!0})};function Ch(i){return Rh[i]}function Ph(i,e){return e==="gameplay"?i==="high"?"high":"balanced":i==="balanced"||i==="medium"||i==="low"?"balanced":i==="high"?"high":"capture"}class Lh{disposeActions=[];disposed=!1;track(e){return this.assertActive(),this.disposeActions.push(()=>{e.dispose()}),e}add(e){return this.assertActive(),this.disposeActions.push(e),e}dispose(){if(this.disposed)return;this.disposed=!0;const e=[];for(let t=this.disposeActions.length-1;t>=0;t-=1)try{this.disposeActions[t]?.()}catch(n){e.push(n)}if(this.disposeActions.length=0,e.length>0)throw new AggregateError(e,"One or more resources failed to dispose.")}assertActive(){if(this.disposed)throw new Error("Cannot track a resource after disposal.")}}const Dh=4294967296,Ih=1831565813;function Oh(i,e){let t=(i^2166136261)>>>0;for(let n=0;n<e.length;n+=1)t^=e.charCodeAt(n),t=Math.imul(t,16777619)>>>0;return t}class Ar{constructor(e){if(this.initialSeed=e,!Number.isFinite(e))throw new RangeError("RNG seed must be finite.");this.state=e>>>0}initialSeed;state;nextUint32(){this.state=this.state+Ih>>>0;let e=this.state;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),(e^e>>>14)>>>0}nextFloat(){return this.nextUint32()/Dh}nextInt(e){if(!Number.isInteger(e)||e<1)throw new RangeError("RNG integer bound must be a positive integer.");return Math.floor(this.nextFloat()*e)}fork(e){return new Ar(Oh(this.initialSeed>>>0,e))}}const Nh=["hero-ready","hero-release","hero-ball-flight","hero-promo","hero-goal","hero-save-high","hero-miss","mobile-ready","round-complete"],Fn=Object.freeze({width:1920,height:1080}),Rc=Object.freeze({"hero-ready":Object.freeze({name:"hero-ready",viewport:Fn,quality:"balanced",seed:1,requirement:"READY",targetShotFrame:null,expectedOutcome:null,expectedKeeperZone:null}),"hero-release":Object.freeze({name:"hero-release",viewport:Fn,quality:"balanced",seed:1,requirement:"ACTIVE_SHOT",targetShotFrame:8,expectedOutcome:null,expectedKeeperZone:null}),"hero-ball-flight":Object.freeze({name:"hero-ball-flight",viewport:Fn,quality:"balanced",seed:1,requirement:"ACTIVE_SHOT",targetShotFrame:12,expectedOutcome:null,expectedKeeperZone:null}),"hero-promo":Object.freeze({name:"hero-promo",viewport:Fn,quality:"capture",seed:1,requirement:"ACTIVE_SHOT",targetShotFrame:12,expectedOutcome:null,expectedKeeperZone:null}),"hero-goal":Object.freeze({name:"hero-goal",viewport:Fn,quality:"balanced",seed:1,requirement:"RESULT",targetShotFrame:null,expectedOutcome:"GOAL",expectedKeeperZone:null}),"hero-save-high":Object.freeze({name:"hero-save-high",viewport:Fn,quality:"balanced",seed:3,requirement:"RESULT",targetShotFrame:null,expectedOutcome:"SAVED",expectedKeeperZone:"high-center"}),"hero-miss":Object.freeze({name:"hero-miss",viewport:Fn,quality:"balanced",seed:1,requirement:"RESULT",targetShotFrame:null,expectedOutcome:"MISS",expectedKeeperZone:null}),"mobile-ready":Object.freeze({name:"mobile-ready",viewport:Object.freeze({width:844,height:390}),quality:"balanced",seed:1,requirement:"READY",targetShotFrame:null,expectedOutcome:null,expectedKeeperZone:null}),"round-complete":Object.freeze({name:"round-complete",viewport:Fn,quality:"balanced",seed:1,requirement:"ROUND_COMPLETE",targetShotFrame:null,expectedOutcome:null,expectedKeeperZone:null})}),Fh=Object.freeze(Nh.map(i=>Rc[i]));function Uh(i){return Rc[i]}function Yt(i,e,t){return Math.min(t,Math.max(e,i))}function qt(i){return Yt(i,0,1)}function xt(i,e,t){return i+(e-i)*t}function Nn(i,e){return Math.hypot(e.x-i.x,e.y-i.y)}const zh=Object.freeze({"low-left":Object.freeze({x:-1,y:-1}),"low-center":Object.freeze({x:0,y:-1}),"low-right":Object.freeze({x:1,y:-1}),"mid-left":Object.freeze({x:-1,y:0}),"mid-center":Object.freeze({x:0,y:0}),"mid-right":Object.freeze({x:1,y:0}),"high-left":Object.freeze({x:-1,y:1}),"high-center":Object.freeze({x:0,y:1}),"high-right":Object.freeze({x:1,y:1})});function Cc(i,e,t){const n=zh[i];return Object.freeze({x:e.x+n.x*t.horizontalRangeMeters,y:e.y+n.y*t.verticalRangeMeters,z:e.z})}function Pc(i,e){return qt((i-e.reactionDelaySeconds)/e.diveDurationSeconds)}function Ns(i,e,t,n,s=e){const r=Cc(i,e,t),a=Pc(n,t);return Object.freeze({x:xt(s.x,r.x,a),y:xt(s.y,r.y,a),z:e.z})}function Bh(i,e,t,n){const s=qt(n/t.returnDurationSeconds);return Object.freeze({x:xt(i.x,e.x,s),y:xt(i.y,e.y,s),z:e.z})}const os=1e-9,Yo="mid-center";function Hh(i){if(![i.feintHoldSeconds,i.feintRecoverySeconds,i.feintMaximumSpeedMetersPerSecond,i.minimumReadSeconds,i.maximumReadSeconds,i.minimumCueConfidence,i.minimumCueAgreementDot,i.horizontalCommitThreshold,i.verticalCommitThreshold,i.maximumTendency].every(Number.isFinite))throw new RangeError("Goalkeeper commitment configuration must be finite.");if(i.feintHoldSeconds<=0||i.feintRecoverySeconds<=0||i.feintMaximumSpeedMetersPerSecond<=0)throw new RangeError("Invalid FEINT recovery bounds");if(i.minimumReadSeconds<=0||i.maximumReadSeconds<i.minimumReadSeconds)throw new RangeError("Goalkeeper read bounds must be positive and ordered.");if(i.minimumCueConfidence<=0||i.minimumCueConfidence>1)throw new RangeError("Goalkeeper cue confidence must be within (0, 1].");if(i.minimumCueAgreementDot<-1||i.minimumCueAgreementDot>=1)throw new RangeError("Goalkeeper cue agreement must be within [-1, 1).");if(!Number.isInteger(i.minimumStableCueSamples)||i.minimumStableCueSamples<1)throw new RangeError("Goalkeeper stable cue sample count must be a positive integer.");if(i.horizontalCommitThreshold<0||i.horizontalCommitThreshold>=1||i.verticalCommitThreshold<0||i.verticalCommitThreshold>=1)throw new RangeError("Goalkeeper commitment thresholds must be within [0, 1).");if(i.maximumTendency<0||i.maximumTendency>.25)throw new RangeError("Goalkeeper tendency must be within [0, 0.25].")}class kh{constructor(e,t){this.config=e,this.rng=t,Hh(e)}config;rng;feintAgeSeconds=null;offset={x:0,y:0};recoveringGesture=!1;phase="READY";observedCue=null;seededTendency=null;commitmentTimeSeconds=null;committedDestination=null;releaseDestination=null;gestureElapsedSeconds=0;stableCueSamples=0;conflictingCue=!1;referenceDirection=null;gestureQueuedOrActive=!1;readingClosed=!1;queuedEvents=[];completeFeint(){this.consumeQueuedEvents(),this.recoveringGesture=!1,this.feintAgeSeconds===null&&(this.feintAgeSeconds=0)}preReleasePosition(e){return{x:e.x+this.offset.x,y:e.y+this.offset.y,z:e.z}}queueGestureStart(){if(this.feintAgeSeconds!==null){this.recoveringGesture=!0;return}this.gestureQueuedOrActive||(this.clearState(),this.gestureQueuedOrActive=!0,this.queuedEvents.push(Object.freeze({type:"START"})))}queueObservation(e){this.gestureQueuedOrActive&&(this.validateObservation(e),this.queuedEvents.push(Object.freeze({type:"OBSERVATION",observation:Ir(e)})))}advance(e){if(!Number.isFinite(e)||e<=0)throw new RangeError("Goalkeeper fixed step must be finite and positive.");if(this.consumeQueuedEvents(),this.feintAgeSeconds!==null){this.feintAgeSeconds<this.config.feintHoldSeconds&&this.phase!=="COMMIT"&&this.advanceReading(e),this.feintAgeSeconds+=e;const t=this.feintAgeSeconds>=this.config.feintHoldSeconds;t&&(this.phase="RECOVER");const n=!t&&this.committedDestination!==null?Cc(this.committedDestination,{x:0,y:0,z:0},this.config):{x:0,y:0},s=n.x*(t?1:.35)-this.offset.x,r=n.y*(t?1:.35)-this.offset.y,a=Math.hypot(s,r),o=a===0?0:Math.min(1,this.config.feintMaximumSpeedMetersPerSecond*e/a);if(this.offset.x+=s*o,this.offset.y+=r*o,t&&a<=this.config.feintMaximumSpeedMetersPerSecond*e&&this.feintAgeSeconds>=this.config.feintHoldSeconds+this.config.feintRecoverySeconds){const l=this.recoveringGesture;this.clearState(),l&&this.queueGestureStart()}return}this.advanceReading(e)}consumeQueuedEvents(){for(let e=0;e<this.queuedEvents.length;e+=1){const t=this.queuedEvents[e];t.type==="START"?(this.phase="READ",this.seededTendency=Object.freeze({x:(this.rng.nextFloat()*2-1)*this.config.maximumTendency,y:(this.rng.nextFloat()*2-1)*this.config.maximumTendency})):this.phase!=="COMMIT"&&!this.readingClosed&&this.consumeObservation(t.observation)}this.queuedEvents.length=0}advanceReading(e){if(!(!this.gestureQueuedOrActive||this.phase==="READY")&&(this.gestureElapsedSeconds+=e,this.phase!=="COMMIT")){if(this.gestureElapsedSeconds+os>=this.config.maximumReadSeconds){this.phase="HOLD",this.readingClosed=!0;return}if(this.gestureElapsedSeconds+os<this.config.minimumReadSeconds){this.phase="READ";return}this.observedCue!==null&&!this.conflictingCue&&this.stableCueSamples>=this.config.minimumStableCueSamples&&this.observedCue.confidence>this.config.minimumCueConfidence+os?this.commit(this.observedCue.apparentDirection):this.phase="HOLD"}}releaseGesture(){return this.consumeQueuedEvents(),this.feintAgeSeconds=null,this.recoveringGesture=!1,this.gestureQueuedOrActive=!1,this.phase!=="COMMIT"||this.committedDestination===null?(this.phase="HOLD",this.committedDestination=null,this.commitmentTimeSeconds=null,this.releaseDestination=Yo,Yo):(this.releaseDestination=this.committedDestination,this.committedDestination)}cancelGesture(){if(this.feintAgeSeconds!==null){this.recoveringGesture=!1;return}this.clearState()}reset(){this.clearState()}get currentPhase(){return this.phase}get currentDestination(){return this.committedDestination}diagnostics(){return Object.freeze({phase:this.phase,feintAgeSeconds:this.feintAgeSeconds,positionOffset:Object.freeze({...this.offset}),observedCue:this.observedCue,seededTendency:this.seededTendency,commitmentTimeSeconds:this.commitmentTimeSeconds,committedDestination:this.committedDestination,releaseDestination:this.releaseDestination,gestureElapsedSeconds:this.gestureElapsedSeconds,stableCueSamples:this.stableCueSamples,conflictingCue:this.conflictingCue})}consumeObservation(e){const t=e.feint===null?Ir(e):Ir({...e,apparentDirection:e.feint.apparentDirection});if(this.observedCue=t,t.confidence<=this.config.minimumCueConfidence+os)return;if(t.feint!==null){this.referenceDirection=t.apparentDirection,this.conflictingCue=!1,this.stableCueSamples=Math.max(this.stableCueSamples,this.config.minimumStableCueSamples);return}if(this.referenceDirection===null){this.referenceDirection=t.apparentDirection,this.stableCueSamples=1;return}if(this.referenceDirection.x*t.apparentDirection.x+this.referenceDirection.y*t.apparentDirection.y<=this.config.minimumCueAgreementDot+os){this.conflictingCue=!0,this.stableCueSamples=0;return}this.conflictingCue||(this.stableCueSamples+=1)}commit(e){const t=this.seededTendency??Object.freeze({x:0,y:0}),n=e.x+t.x,s=e.y+t.y,r=n<-this.config.horizontalCommitThreshold?"left":n>this.config.horizontalCommitThreshold?"right":"center",a=s<-this.config.verticalCommitThreshold?"low":s>this.config.verticalCommitThreshold?"high":"mid";this.committedDestination=`${a}-${r}`,this.commitmentTimeSeconds=this.gestureElapsedSeconds,this.phase="COMMIT",this.readingClosed=!0}validateObservation(e){if(![e.apparentDirection.x,e.apparentDirection.y,e.elapsedGestureSeconds,e.confidence].every(Number.isFinite))throw new RangeError("Goalkeeper observations must contain finite values.");const n=Math.hypot(e.apparentDirection.x,e.apparentDirection.y);if(Math.abs(n-1)>1e-6||e.elapsedGestureSeconds<0||e.confidence<0||e.confidence>1)throw new RangeError("Goalkeeper observations require a unit direction, non-negative time, and normalized confidence.")}clearState(){this.feintAgeSeconds=null,this.offset={x:0,y:0},this.recoveringGesture=!1,this.phase="READY",this.observedCue=null,this.seededTendency=null,this.commitmentTimeSeconds=null,this.committedDestination=null,this.releaseDestination=null,this.gestureElapsedSeconds=0,this.stableCueSamples=0,this.conflictingCue=!1,this.referenceDirection=null,this.gestureQueuedOrActive=!1,this.readingClosed=!1,this.queuedEvents.length=0}}function Ir(i){return Object.freeze({apparentDirection:Object.freeze({...i.apparentDirection}),elapsedGestureSeconds:i.elapsedGestureSeconds,confidence:i.confidence,feint:i.feint})}function Lc(){return Object.freeze({phase:"READY",shotsTaken:0,goals:0,saves:0,misses:0,lastOutcome:null})}function Gh(i){if(i.phase!=="READY")throw new Error(`Cannot begin a shot while match is '${i.phase}'.`);return Object.freeze({...i,phase:"SHOT_ACTIVE",lastOutcome:null})}function Vh(i,e,t){if(i.phase!=="SHOT_ACTIVE")throw new Error(`Cannot resolve a shot while match is '${i.phase}'.`);const n=i.shotsTaken+1;return Object.freeze({phase:n>=t.shotsPerRound?"ROUND_COMPLETE":"RESULT",shotsTaken:n,goals:i.goals+(e==="GOAL"?1:0),saves:i.saves+(e==="SAVED"?1:0),misses:i.misses+(e==="MISS"?1:0),lastOutcome:e})}function Wh(i){if(i.phase!=="RESULT")throw new Error(`Cannot prepare next shot while match is '${i.phase}'.`);return Object.freeze({...i,phase:"READY"})}function Xh(){return Lc()}function Dc(i){const e=i.widthMeters/2,t=i.heightMeters/2,n=Math.max(0,i.ballRadiusMeters+i.safetyMarginMeters),s=Math.max(0,e-n),r=Math.max(0,t-n);return Object.freeze({validHorizontalHalfRange:s,validVerticalHalfRange:r,horizontalTargetRange:s+e*i.horizontalOvershootFactor,verticalTargetLow:-r-t*i.verticalOvershootFactor,verticalTargetHigh:r+t*i.verticalOvershootFactor})}function qh(i,e,t){const n=Dc(t),s=Yt(i,-1,1),r=qt((Yt(e,-1,1)+1)/2);return Object.freeze({x:t.center.x-s*n.horizontalTargetRange,y:t.center.y+xt(n.verticalTargetLow,n.verticalTargetHigh,r),z:t.center.z})}function jh(i,e){const t=Dc(e);return Math.abs(i.x-e.center.x)<=t.validHorizontalHalfRange&&Math.abs(i.y-e.center.y)<=t.validVerticalHalfRange}function Yh(i,e){return xt(e.maximumDurationSeconds,e.minimumDurationSeconds,qt(i))}const Dt=Number.POSITIVE_INFINITY,Un=1e-6,$h=4,Kh=4,Zh=1,$o=1e-12,Jh=1e-10;function Qh(i,e,t,n,s,r=0,a=0,o=0,l=0){ki(i,"Ball release position"),ki(e,"Ball aim target"),po(s),au(n);const c=Ic(t),h=iu(r),u=su(a),f=ru(o),p=Oc(l),g=Yh(c,n),_=eu(c,s),m=e.x-i.x,d=xt(s.minimumLaunchLiftMeters,s.maximumLaunchLiftMeters,h),b=e.y-i.y+d-p*1.8,E=e.z-i.z,y=Math.hypot(m,b,E);if(!Number.isFinite(y)||y<=Number.EPSILON)throw new RangeError("Ball launch direction must have finite non-zero length.");const w=_/y,A=Object.freeze({x:m*w,y:b*w,z:E*w});return{playableVolume:Object.freeze({...s.playableVolume}),position:Or(i),previousPosition:Or(i),velocity:Or(A),gravityMetersPerSecondSquared:s.gravityMetersPerSecondSquared,releasePower:c,releaseLoft:h,releaseSideSpin:u,releaseTopSpin:f,releaseBounceIntent:p,launchLiftMeters:d,sideSpinAccelerationMetersPerSecondSquared:-u*s.maximumSideSpinAccelerationMetersPerSecondSquared,topSpinDropAccelerationMetersPerSecondSquared:f*s.maximumTopSpinDropAccelerationMetersPerSecondSquared,releaseSpeedMetersPerSecond:_,initialVelocity:A,postRestitution:Yt(s.postRestitution,0,1),crossbarRestitution:Yt(s.crossbarRestitution,0,1),groundRestitution:tu(p,s),minimumGroundReboundSpeedMetersPerSecond:s.minimumGroundReboundSpeedMetersPerSecond,maximumGroundBounces:s.maximumGroundBounces,groundBounceCount:0,durationSeconds:g,elapsedSeconds:0,contactHistory:[],terminalState:null}}function eu(i,e){return po(e),xt(e.minimumReleaseSpeedMetersPerSecond,e.maximumReleaseSpeedMetersPerSecond,Ic(i))}function tu(i,e){return po(e),xt(e.minimumGroundRestitution,e.maximumGroundRestitution,Oc(i))}function nu(i,e,t,n,s){if(i.terminalState!==null)return i.terminalState;if(!Number.isFinite(e)||e<=0)throw new RangeError("Ball flight step must be a positive finite number.");ou(i),i.previousPosition.x=i.position.x,i.previousPosition.y=i.position.y,i.previousPosition.z=i.position.z;let r=e,a=0,o=0,l=0,c=0;for(;r>Number.EPSILON;){const h=i.position.x,u=i.position.y,f=i.position.z,p=i.velocity.x,g=i.velocity.y,_=i.velocity.z,m=i.gravityMetersPerSecondSquared-i.topSpinDropAccelerationMetersPerSecondSquared,d=i.sideSpinAccelerationMetersPerSecondSquared,b=h+p*r+.5*d*r*r,E=u+g*r+.5*m*r*r,y=f+_*r,w=a/e,A=(a+r)/e,P=gn(s.previousPosition.x,s.currentPosition.x,w),I=gn(s.previousPosition.y,s.currentPosition.y,w),M=gn(s.previousPosition.z,s.currentPosition.z,w),v=gn(s.previousPosition.x,s.currentPosition.x,A),C=gn(s.previousPosition.y,s.currentPosition.y,A),F=gn(s.previousPosition.z,s.currentPosition.z,A),z=du(f,y,t.center.z),X=uu(u,g,m,r,t.ballRadiusMeters),V=c<Zh?fu(h,u,f,p,g,_,d,m,r,P,I,M,v,C,F,n.saveRadiusMeters+t.ballRadiusMeters):Dt,G=o<$h?hu(h,u,f,p,g,_,d,m,r,t):null,$=G?.fraction??Dt,B=l<Kh?cu(h,u,f,p,g,_,m,d,r,t):null,ie=B?.fraction??Dt,re=lu(X,$,ie,V,z),_e=re===null?Dt:re==="GROUND"?X:re==="VERTICAL_POST"?$:re==="CROSSBAR"?ie:re==="KEEPER"?V:z,Ie=mu(i,r,t.ballRadiusMeters),He=Ie<_e?"PLAY_VOLUME":re,Xe=Math.min(Ie,_e);if(He===null)return i.position.x=b,i.position.y=E,i.position.z=y,i.velocity.x=p+d*r,i.velocity.y=g+m*r,i.elapsedSeconds+=r,null;const Oe=r*Xe;if(i.position.x=h+p*Oe+.5*d*Oe*Oe,i.position.y=He==="GROUND"?t.ballRadiusMeters:u+g*Oe+.5*m*Oe*Oe,i.position.z=gn(f,y,Xe),i.velocity.x=p+d*Oe,i.velocity.y=g+m*Oe,i.velocity.z=_,i.elapsedSeconds+=Oe,a+=Oe,r-=Oe,He==="GROUND"){const le=Gt(i.position),Me=Gt(i.velocity),de=-i.velocity.y*i.groundRestitution;if(i.groundBounceCount<i.maximumGroundBounces&&i.velocity.y<0&&de>=i.minimumGroundReboundSpeedMetersPerSecond){i.velocity.y=de,i.position.y=t.ballRadiusMeters+Un;const Ae=Gt(i.velocity);i.contactHistory.push(Object.freeze({kind:"GROUND",elapsedSeconds:i.elapsedSeconds,position:le,normal:Object.freeze({x:0,y:1,z:0}),incomingVelocity:Me,outgoingVelocity:Ae,outcome:null})),i.groundBounceCount+=1;continue}}if(He==="VERTICAL_POST"){if(G===null)throw new Error("Vertical-post contact is missing swept collision data.");const le=Gt(i.position),Me=Gt(i.velocity),de=i.velocity.x*G.normal.x+i.velocity.z*G.normal.z,ae=(1+i.postRestitution)*de;i.velocity.x-=ae*G.normal.x,i.velocity.z-=ae*G.normal.z;const Ae=t.ballRadiusMeters+t.postThicknessMeters/2;i.position.x=G.centerX+G.normal.x*(Ae+Un),i.position.z=t.center.z+G.normal.z*(Ae+Un);const R=Gt(i.velocity);i.contactHistory.push(Object.freeze({kind:"VERTICAL_POST",post:G.post,elapsedSeconds:i.elapsedSeconds,position:le,normal:G.normal,incomingVelocity:Me,outgoingVelocity:R,outcome:null})),o+=1;continue}if(He==="CROSSBAR"){if(B===null)throw new Error("Crossbar contact is missing swept collision data.");const le=Gt(i.position),Me=Gt(i.velocity),de=i.velocity.y*B.normal.y+i.velocity.z*B.normal.z,ae=(1+i.crossbarRestitution)*de;i.velocity.y-=ae*B.normal.y,i.velocity.z-=ae*B.normal.z;const Ae=t.ballRadiusMeters+t.postThicknessMeters/2;i.position.y=B.centerY+B.normal.y*(Ae+Un),i.position.z=t.center.z+B.normal.z*(Ae+Un);const R=Gt(i.velocity);i.contactHistory.push(Object.freeze({kind:"CROSSBAR",elapsedSeconds:i.elapsedSeconds,position:le,normal:B.normal,incomingVelocity:Me,outgoingVelocity:R,outcome:null})),l+=1;continue}if(He==="KEEPER"){const le=Gt(i.position),Me=Gt(i.velocity),de=gn(P,v,Xe),ae=gn(I,C,Xe),Ae=gn(M,F,Xe),R=(s.currentPosition.x-s.previousPosition.x)/e,qe=(s.currentPosition.y-s.previousPosition.y)/e,Le=(s.currentPosition.z-s.previousPosition.z)/e,Te=i.velocity.x-R,pe=i.velocity.y-qe,Ze=i.velocity.z-Le,fe=pu(i.position.x-de,i.position.y-ae,i.position.z-Ae,Te,pe,Ze),Fe=Te*fe.x+pe*fe.y+Ze*fe.z,lt=Fe<0?(1+Yt(n.contactRestitution,0,1))*Fe:0;i.velocity.x=Te-lt*fe.x+R,i.velocity.y=pe-lt*fe.y+qe,i.velocity.z=Ze-lt*fe.z+Le;const st=n.saveRadiusMeters+t.ballRadiusMeters;i.position.x=de+fe.x*(st+Un),i.position.y=ae+fe.y*(st+Un),i.position.z=Ae+fe.z*(st+Un);const T=Gt(i.velocity);i.contactHistory.push(Object.freeze({kind:"KEEPER",elapsedSeconds:i.elapsedSeconds,position:le,normal:fe,incomingVelocity:Me,outgoingVelocity:T,outcome:null})),c+=1;continue}const j=i.contactHistory.some(le=>le.kind==="KEEPER"),K=He==="GOAL_PLANE"&&jh(i.position,t)?"GOAL":j?"SAVED":"MISS";return i.terminalState=K,i.contactHistory.push(Object.freeze({kind:He,elapsedSeconds:i.elapsedSeconds,position:Gt(i.position),outcome:K})),K}return null}function Ic(i){if(!Number.isFinite(i))throw new RangeError("Ball release power must be finite.");return Yt(i,0,1)}function iu(i){if(!Number.isFinite(i))throw new RangeError("Ball release loft must be finite.");return Yt(i,0,1)}function su(i){if(!Number.isFinite(i))throw new RangeError("Ball release side-spin must be finite.");return Yt(i,-1,1)}function ru(i){if(!Number.isFinite(i))throw new RangeError("Ball release top-spin must be finite.");return Yt(i,0,1)}function Oc(i){if(!Number.isFinite(i))throw new RangeError("Ball release bounce intent must be finite.");return Yt(i,0,1)}function po(i){if(![i.playableVolume.halfWidthMeters,i.playableVolume.ceilingHeightMeters,i.playableVolume.minimumZMeters,i.minimumReleaseSpeedMetersPerSecond,i.maximumReleaseSpeedMetersPerSecond,i.minimumLaunchLiftMeters,i.maximumLaunchLiftMeters,i.maximumSideSpinAccelerationMetersPerSecondSquared,i.maximumTopSpinDropAccelerationMetersPerSecondSquared,i.gravityMetersPerSecondSquared,i.postRestitution,i.crossbarRestitution,i.minimumGroundRestitution,i.maximumGroundRestitution,i.minimumGroundReboundSpeedMetersPerSecond,i.maximumGroundBounces].every(Number.isFinite))throw new RangeError("Ball flight configuration must contain only finite values.");if(i.playableVolume.halfWidthMeters<=0||i.playableVolume.ceilingHeightMeters<=0||i.playableVolume.minimumZMeters>=0)throw new RangeError("Playable arena volume must surround the release area.");if(i.minimumReleaseSpeedMetersPerSecond<=0||i.maximumReleaseSpeedMetersPerSecond<i.minimumReleaseSpeedMetersPerSecond)throw new RangeError("Ball release-speed bounds must be positive and ordered.");if(i.minimumLaunchLiftMeters<0||i.maximumLaunchLiftMeters<i.minimumLaunchLiftMeters)throw new RangeError("Ball launch-lift bounds must be non-negative and ordered.");if(i.maximumSideSpinAccelerationMetersPerSecondSquared<=0)throw new RangeError("Ball side-spin acceleration bound must be positive.");if(i.maximumTopSpinDropAccelerationMetersPerSecondSquared<=0)throw new RangeError("Ball top-spin drop acceleration bound must be positive.");if(i.gravityMetersPerSecondSquared>=0)throw new RangeError("Ball flight gravity must be finite and negative.");if(i.minimumGroundRestitution<0||i.maximumGroundRestitution<i.minimumGroundRestitution||i.maximumGroundRestitution>1)throw new RangeError("Ground restitution bounds must be ordered within [0, 1].");if(i.minimumGroundReboundSpeedMetersPerSecond<=0)throw new RangeError("Ground settling speed must be positive.");if(!Number.isInteger(i.maximumGroundBounces)||i.maximumGroundBounces<0||i.maximumGroundBounces>1)throw new RangeError("Maximum ground bounces must be an integer within [0, 1].")}function au(i){if(![i.minimumDurationSeconds,i.maximumDurationSeconds,i.arcHeightMeters,i.resetDelaySeconds].every(Number.isFinite))throw new RangeError("Nominal trajectory configuration must be finite.");if(i.minimumDurationSeconds<=0||i.maximumDurationSeconds<i.minimumDurationSeconds||i.arcHeightMeters<0||i.resetDelaySeconds<0)throw new RangeError("Nominal trajectory configuration is out of bounds.")}function ki(i,e){if(![i.x,i.y,i.z].every(Number.isFinite))throw new RangeError(`${e} must contain only finite values.`)}function ou(i){if(ki(i.position,"Ball position"),ki(i.previousPosition,"Previous ball position"),ki(i.velocity,"Ball velocity"),ki(i.initialVelocity,"Initial ball velocity"),!Number.isFinite(i.gravityMetersPerSecondSquared)||!Number.isFinite(i.releasePower)||!Number.isFinite(i.releaseLoft)||!Number.isFinite(i.releaseSideSpin)||!Number.isFinite(i.releaseTopSpin)||!Number.isFinite(i.releaseBounceIntent)||!Number.isFinite(i.launchLiftMeters)||!Number.isFinite(i.sideSpinAccelerationMetersPerSecondSquared)||!Number.isFinite(i.topSpinDropAccelerationMetersPerSecondSquared)||!Number.isFinite(i.releaseSpeedMetersPerSecond)||!Number.isFinite(i.postRestitution)||!Number.isFinite(i.crossbarRestitution)||!Number.isFinite(i.groundRestitution)||!Number.isFinite(i.minimumGroundReboundSpeedMetersPerSecond)||!Number.isFinite(i.maximumGroundBounces)||!Number.isFinite(i.groundBounceCount)||!Number.isFinite(i.durationSeconds)||!Number.isFinite(i.elapsedSeconds))throw new RangeError("Ball flight state must remain finite.");if(i.releaseSideSpin<-1||i.releaseSideSpin>1)throw new RangeError("Ball release side-spin must remain within [-1, 1].");if(i.releaseTopSpin<0||i.releaseTopSpin>1)throw new RangeError("Ball release top-spin must remain within [0, 1].");if(i.releaseBounceIntent<0||i.releaseBounceIntent>1)throw new RangeError("Ball release bounce intent must remain within [0, 1].");if(i.groundRestitution<0||i.groundRestitution>1)throw new RangeError("Ball ground restitution must remain within [0, 1].");if(i.minimumGroundReboundSpeedMetersPerSecond<=0)throw new RangeError("Ball ground settling speed must remain positive.");if(!Number.isInteger(i.maximumGroundBounces)||!Number.isInteger(i.groundBounceCount)||i.maximumGroundBounces<0||i.maximumGroundBounces>1||i.groundBounceCount<0||i.groundBounceCount>i.maximumGroundBounces)throw new RangeError("Ball ground-contact counts must remain bounded integers.");if(i.topSpinDropAccelerationMetersPerSecondSquared<0)throw new RangeError("Ball top-spin drop acceleration must remain non-negative.")}function lu(i,e,t,n,s){return i<=n&&i<=e&&i<=t&&i<=s?i===Dt?null:"GROUND":e<=t&&e<=n&&e<=s?"VERTICAL_POST":t<=n&&t<=s?"CROSSBAR":n<=s?"KEEPER":"GOAL_PLANE"}function cu(i,e,t,n,s,r,a,o,l,c){const h=c.center.y+c.heightMeters/2+c.postThicknessMeters/2,u=c.widthMeters/2+c.postThicknessMeters/2,f=c.ballRadiusMeters+c.postThicknessMeters/2,p=.5*a,g=e-h,_=t-c.center.z,m=As([g*g+_*_-f*f,2*(g*s+_*r),s*s+2*g*p+r*r,2*s*p,p*p],0,l);for(const d of m){const b=i+n*d+.5*o*d*d;if(Math.abs(b-c.center.x)>u)continue;const E=e+s*d+p*d*d,y=t+r*d,w=(E-h)/f,A=(y-c.center.z)/f;if(!((s+a*d)*w+r*A>=0))return{fraction:d/l,centerY:h,normal:Object.freeze({x:0,y:w,z:A})}}return null}function As(i,e,t){let n=i.length-1;for(;n>0&&Math.abs(i[n]??0)<=$o;)n-=1;if(n===0)return[];if(n===1){const l=i[1]??0,c=-(i[0]??0)/l;return c>=e&&c<=t?[c]:[]}const s=Array.from({length:n},(l,c)=>(i[c+1]??0)*(c+1)),r=As(s,e,t),a=[e,...r,t],o=[];for(const l of a)Math.abs(Fs(i,n,l))<=$o&&Ko(o,l);for(let l=0;l+1<a.length;l+=1){let c=a[l]??e,h=a[l+1]??t,u=Fs(i,n,c);const f=Fs(i,n,h);if(!(u===0||f===0||u*f>0)){for(let p=0;p<64;p+=1){const g=(c+h)/2,_=Fs(i,n,g);if(_===0){c=g,h=g;break}u*_<0?h=g:(c=g,u=_)}Ko(o,(c+h)/2)}}return o.sort((l,c)=>l-c),o}function Fs(i,e,t){let n=i[e]??0;for(let s=e-1;s>=0;s-=1)n=n*t+(i[s]??0);return n}function Ko(i,e){i.every(t=>Math.abs(t-e)>Jh)&&i.push(e)}function hu(i,e,t,n,s,r,a,o,l,c){const h=c.widthMeters/2+c.postThicknessMeters/2,u=c.ballRadiusMeters+c.postThicknessMeters/2,f=.5*a;let p=null;for(const g of["LEFT","RIGHT"]){const _=c.center.x+(g==="LEFT"?-h:h),m=i-_,d=t-c.center.z,b=As([m*m+d*d-u*u,2*(m*n+d*r),n*n+2*m*f+r*r,2*n*f,f*f],0,l);for(const E of b){const y=E/l;if(p!==null&&y>=p.fraction)continue;const w=e+s*E+.5*o*E*E,A=c.center.y+c.heightMeters/2+c.postThicknessMeters;if(w<c.ballRadiusMeters||w>A)continue;const P=i+n*E+f*E*E,I=t+r*E,M=(P-_)/u,v=(I-c.center.z)/u;(n+a*E)*M+r*v>=0||(p={fraction:y,post:g,centerX:_,normal:Object.freeze({x:M,y:0,z:v})})}}return p}function uu(i,e,t,n,s){const r=i-s;if(r<0)return 0;const a=.5*t;if(Math.abs(a)<=Number.EPSILON){if(e>=0)return r===0?0:Dt;const g=-r/e;return g>=0&&g<=n?g/n:Dt}const o=e*e-4*a*r;if(o<0)return Dt;const l=2*a,c=-e,h=Math.sqrt(o),u=(c-h)/l,f=(c+h)/l;let p=Dt;return u>=0&&u<=n&&e+t*u<=0&&(p=u),f>=0&&f<=n&&e+t*f<=0&&f<p&&(p=f),p===Dt?Dt:p/n}function du(i,e,t){return i>=t||e<t||e===i?Dt:(t-i)/(e-i)}function fu(i,e,t,n,s,r,a,o,l,c,h,u,f,p,g,_){const m=i-c,d=e-h,b=t-u,E=n-(f-c)/l,y=s-(p-h)/l,w=r-(g-u)/l,A=.5*a,P=.5*o,I=_*_,M=m*m+d*d+b*b-I;if(M<=0)return 0;const v=As([M,2*(m*E+d*y+b*w),E*E+y*y+w*w+2*(m*A+d*P),2*(E*A+y*P),A*A+P*P],0,l);for(const C of v){const F=m+E*C+A*C*C,z=d+y*C+P*C*C,X=b+w*C,V=E+a*C,G=y+o*C;if(F*V+z*G+X*w<0)return C/l}return Dt}function pu(i,e,t,n,s,r){const a=Math.hypot(i,e,t);if(a>Number.EPSILON)return Object.freeze({x:i/a,y:e/a,z:t/a});const o=Math.hypot(n,s,r);return o>Number.EPSILON?Object.freeze({x:-n/o,y:-s/o,z:-r/o}):Object.freeze({x:0,y:0,z:-1})}function Or(i){return{x:i.x,y:i.y,z:i.z}}function Gt(i){return Object.freeze({x:i.x,y:i.y,z:i.z})}function gn(i,e,t){return i+(e-i)*t}function mu(i,e,t){const n=i.playableVolume;return Math.min(Us(i.position.x,i.velocity.x,i.sideSpinAccelerationMetersPerSecondSquared,n.halfWidthMeters-t,e),Us(-i.position.x,-i.velocity.x,-i.sideSpinAccelerationMetersPerSecondSquared,n.halfWidthMeters-t,e),Us(i.position.y,i.velocity.y,i.gravityMetersPerSecondSquared-i.topSpinDropAccelerationMetersPerSecondSquared,n.ceilingHeightMeters-t,e),Us(-i.position.z,-i.velocity.z,0,-n.minimumZMeters-t,e))}function Us(i,e,t,n,s){if(i>n)return 0;const r=i+e*s+.5*t*s*s,a=t<0?-e/t:-1;if((a>0&&a<s?Math.max(i,r,i+e*a+.5*t*a*a):Math.max(i,r))<n)return Dt;for(const l of As([i-n,e,.5*t],0,s))if(e+t*l>0)return l/s;return Dt}function Nc(i){const e=i[0],t=i.at(-1);if(!e||!t)return{hook:!1,vee:!1,descent:0};let n=e.y,s=e.y,r=0,a=0;for(let u=1;u<i.length;u++){const f=i[u].y,p=i[u-1].y;n=Math.min(n,f),s=Math.max(s,f),r+=Math.max(0,p-f),a+=Math.max(0,f-p)}const o=e.y-n,l=t.y-n,c=s-e.y,h=s-t.y;return{hook:o>.16&&l>.045&&l<o*.65&&e.y-t.y>.065&&r<o*1.18&&a<l*1.18,vee:c>.07&&h>.12&&a<c*1.18&&r<h*1.18,descent:c}}function Zo(i,e){if(!Number.isFinite(i)||i<0||i>1)throw new RangeError(`${e} must be finite and within [0, 1].`)}function Jo(i,e){if(!Number.isFinite(i)||i<=0||i>=1)throw new RangeError(`${e} must be finite and within (0, 1).`)}function gu(i,e){Zo(i.loft,"Shot-category loft"),Zo(i.bounceIntent,"Shot-category bounce intent"),Jo(e.lobCategoryMinimumLoft,"LOB category threshold"),Jo(e.bounceCategoryMinimumIntent,"BOUNCE category threshold");const t=i.loft>e.lobCategoryMinimumLoft,n=i.bounceIntent>e.bounceCategoryMinimumIntent;return t===n?"DIRECT":t?"LOB":"BOUNCE"}const Qo=1e-6;function Tt(i){return Object.freeze({accepted:!1,reason:i})}function _u(i,e){return e??{xPixels:0,yPixels:0,widthPixels:i.widthPixels,heightPixels:i.heightPixels}}function el(i,e,t){return Object.freeze({positionPixels:Object.freeze({...i.positionPixels}),safeAreaPosition01:Object.freeze({x:(i.positionPixels.x-e.xPixels)/e.widthPixels,y:(i.positionPixels.y-e.yPixels)/e.heightPixels}),timeSeconds:i.timeSeconds-t})}function xu(i,e,t,n={}){const s=_u(e,n.safeArea);if(!Number.isFinite(e.widthPixels)||!Number.isFinite(e.heightPixels)||e.widthPixels<=0||e.heightPixels<=0||!Number.isFinite(s.widthPixels)||!Number.isFinite(s.heightPixels)||s.widthPixels<=0||s.heightPixels<=0)return Tt("INVALID_VIEWPORT");if(i.length<2)return Tt("TOO_FEW_POINTS");if(i.some(h=>!Number.isFinite(h.positionPixels.x)||!Number.isFinite(h.positionPixels.y)||!Number.isFinite(h.timeSeconds)))return Tt("NON_FINITE_SAMPLE");if(n.inputEnabled===!1)return Tt("INPUT_DISABLED");if(n.captureAlreadyActive===!0)return Tt("CAPTURE_ALREADY_ACTIVE");if(n.startedOverBlockingUi===!0)return Tt("STARTED_OVER_BLOCKING_UI");if(n.interrupted===!0)return Tt("INTERRUPTED");const r=i[0],a=i[i.length-1];if(r===void 0||a===void 0)return Tt("TOO_FEW_POINTS");const o=el(r,s,r.timeSeconds);if(o.safeAreaPosition01.x<0||o.safeAreaPosition01.x>1||o.safeAreaPosition01.y<1-t.startZoneFraction||o.safeAreaPosition01.y>1)return Tt("START_OUTSIDE_INPUT_ZONE");for(let h=1;h<i.length;h+=1){const u=i[h-1],f=i[h];if(u===void 0||f===void 0)return Tt("TOO_FEW_POINTS");const p=f.timeSeconds-u.timeSeconds;if(!Number.isFinite(p)||p<0)return Tt("NON_MONOTONIC_TIME");if(p>t.maximumSampleGapSeconds)return Tt("SAMPLE_GAP_TOO_LONG")}const l=a.timeSeconds-r.timeSeconds;if(l<t.minimumDurationSeconds)return Tt("DURATION_TOO_SHORT");if(l>t.maximumDurationSeconds)return Tt("DURATION_TOO_LONG");const c=i.map(h=>el(h,s,r.timeSeconds));if(!n.nonShootingFeint&&Nn(r.positionPixels,a.positionPixels)<t.minimumDistancePixels){const h=Nc(c.map(f=>f.safeAreaPosition01));let u=0;for(let f=1;f<i.length;f++)u+=Nn(i[f-1].positionPixels,i[f].positionPixels);if(!h.vee&&!h.hook||u<t.minimumDistancePixels)return Tt("DISTANCE_TOO_SHORT")}return Object.freeze({accepted:!0,points:Object.freeze(c),durationSeconds:l})}function Su(i,e,t,n){if(t.widthPixels<=0||t.heightPixels<=0)return!1;const s={x:(i.x-t.xPixels)/t.widthPixels,y:(i.y-t.yPixels)/t.heightPixels},r={x:(e.x-t.xPixels)/t.widthPixels,y:(e.y-t.yPixels)/t.heightPixels};return Nn(s,r)+Number.EPSILON*8>=n.minimumIntermediateDistanceSafeFraction}function vu(i,e){if(i.length<2||e<=1)return Object.freeze(i.map(s=>Object.freeze({...s})));const t=Math.max(1,Math.floor(e/2)),n=i.map((s,r)=>{if(r===0||r===i.length-1)return Object.freeze({...s});let a=0,o=0,l=0;const c=Math.max(0,r-t),h=Math.min(i.length-1,r+t);for(let u=c;u<=h;u+=1){const f=i[u];f!==void 0&&(a+=f.x,o+=f.y,l+=1)}return Object.freeze({x:a/l,y:o/l})});return Object.freeze(n)}function Mu(i,e){if(!Number.isInteger(e)||e<2)throw new RangeError("Gesture resample count must be an integer of at least two.");if(i.length===0)return Object.freeze(Array.from({length:e},()=>Object.freeze({x:0,y:0})));const t=i[0];if(t===void 0)return Object.freeze([]);if(i.length===1)return Object.freeze(Array.from({length:e},()=>Object.freeze({...t})));const n=new Array(i.length).fill(0);let s=0;for(let l=1;l<i.length;l+=1){const c=i[l-1],h=i[l];c!==void 0&&h!==void 0&&(s+=Nn(c,h),n[l]=s)}const r=i[i.length-1]??t;if(s<=Qo)return Object.freeze(Array.from({length:e},(l,c)=>Object.freeze({...c===e-1?r:t})));const a=[Object.freeze({...t})];let o=1;for(let l=1;l<e-1;l+=1){const c=s*l/(e-1);for(;o<n.length-1&&(n[o]??0)<c;)o+=1;const h=i[o-1]??t,u=i[o]??r,f=n[o-1]??0,g=(n[o]??s)-f,_=g<=Qo?0:(c-f)/g;a.push(Object.freeze({x:xt(h.x,u.x,_),y:xt(h.y,u.y,_)}))}return a.push(Object.freeze({...r})),Object.freeze(a)}const vr=1e-4,tl=1e-6,nl=.0011;function yu(i){let e=0;for(let t=1;t<i.length;t+=1){const n=i[t-1],s=i[t];n!==void 0&&s!==void 0&&(e+=Nn(n,s))}return e}function bu(i){const e=i[0],t=i.at(-1);if(!e||!t)return[];const n=t.timeSeconds-e.timeSeconds;if(n<=vr)return[];const s=32,r=n/s,a=c=>{let h=1;for(;h<i.length-1&&i[h].timeSeconds<c;)h++;const u=i[h-1],f=i[h],p=f.timeSeconds-u.timeSeconds,g=p<=vr?1:qt((c-u.timeSeconds)/p);return{x:xt(u.safeAreaPosition01.x,f.safeAreaPosition01.x,g),y:xt(u.safeAreaPosition01.y,f.safeAreaPosition01.y,g)}},o=[];let l=e.safeAreaPosition01;for(let c=1;c<=s;c++){const h=a(e.timeSeconds+r*c);o.push(Nn(l,h)/r),l=h}return o}function Eu(i){if(i.length===0)return 0;const e=[...i].sort((n,s)=>n-s),t=Math.floor(e.length/2);return e.length%2===1?e[t]??0:((e[t-1]??0)+(e[t]??0))/2}function Tu(i,e,t){const n=Math.max(1,e.widthPixels*t.horizontalFullRangeViewportFraction),s=Math.max(1,e.heightPixels*t.verticalFullRangeViewportFraction),r=Yt(i.dx/n,-1,1),a=qt(i.dyUp/s);return Object.freeze({horizontalAim:r,verticalGesture01:a,verticalAim:a*2-1})}function wu(i,e,t){const n=(i[i.length-1]?.timeSeconds??0)-(i[0]?.timeSeconds??0),s=bu(i),r=s.length>0?Math.max(...s):0,a=s.slice(-Math.max(1,t.releaseSpeedSampleCount)),o=Eu(a),l=yu(e),c=qt(o/t.releaseSpeedFullPowerSafeFractionsPerSecond),h=qt(r/t.maximumSpeedFullPowerSafeFractionsPerSecond),u=qt(l/t.pathLengthFullPowerSafeFraction);return Object.freeze({durationSeconds:n,pathLengthSafeFraction:l,maximumSpeedSafeFractionsPerSecond:r,releaseSpeedSafeFractionsPerSecond:o,releaseSpeedContribution:c,maximumSpeedContribution:h,pathLengthContribution:u,usedTimingFallback:n<=vr||r<=0||o<=0})}function Au(i,e){const t=e.releaseSpeedWeight+e.maximumSpeedWeight+e.pathLengthWeight;return i.usedTimingFallback||t<=vr?i.pathLengthContribution:qt((i.releaseSpeedContribution*e.releaseSpeedWeight+i.maximumSpeedContribution*e.maximumSpeedWeight+i.pathLengthContribution*e.pathLengthWeight)/t)}function Ru(i,e){if(!Number.isFinite(e.loftFullRangeSafeFraction)||e.loftFullRangeSafeFraction<=0||!Number.isFinite(e.loftMaximumHorizontalDeviationSafeFraction)||e.loftMaximumHorizontalDeviationSafeFraction<=0)throw new RangeError("Gesture loft range must be a positive finite number.");if(i.length<2)throw new RangeError("Gesture loft requires at least two trace points.");if(i.some(l=>!Number.isFinite(l.x)||!Number.isFinite(l.y)))throw new RangeError("Gesture loft points must contain only finite values.");const t=i[0],n=i[i.length-1];if(t===void 0||n===void 0)throw new RangeError("Gesture loft requires finite endpoints.");let s=0;const r=[];let a=0;for(let l=1;l<i.length;l+=1){const c=i[l-1],h=i[l];if(c===void 0||h===void 0)continue;const u=Nn(c,h);r.push(u),a+=u}if(a<=Number.EPSILON)return 0;let o=0;for(let l=1;l<i.length-1;l+=1){const c=i[l];if(c===void 0)continue;o+=r[l-1]??0;const h=o/a,u=xt(t.x,n.x,h);if(Math.abs(c.x-u)>e.loftMaximumHorizontalDeviationSafeFraction)continue;const f=xt(t.y,n.y,h);s=Math.max(s,f-c.y)}return qt(s/e.loftFullRangeSafeFraction)}function Cu(i,e){if(!Number.isFinite(e.sideSpinFullRangeSafeFraction)||e.sideSpinFullRangeSafeFraction<=0)throw new RangeError("Gesture side-spin range must be a positive finite number.");if(i.length<2)throw new RangeError("Gesture side-spin requires at least two trace points.");if(i.some(c=>!Number.isFinite(c.x)||!Number.isFinite(c.y)))throw new RangeError("Gesture side-spin points must contain only finite values.");const t=i[0],n=i[i.length-1];if(t===void 0||n===void 0)throw new RangeError("Gesture side-spin requires finite endpoints.");const s=[];let r=0;for(let c=1;c<i.length;c+=1){const h=i[c-1],u=i[c];if(h===void 0||u===void 0)continue;const f=Nn(h,u);s.push(f),r+=f}if(r<=Number.EPSILON)return 0;let a=0,o=0;for(let c=1;c<i.length-1;c+=1){const h=i[c];if(h===void 0)continue;a+=s[c-1]??0;const u=a/r,f=xt(t.x,n.x,u),p=h.x-f;Math.abs(p)>Math.abs(o)&&(o=p)}if(Math.abs(o)<=tl)return 0;const l=Math.sign(o)*(Math.abs(o)-tl);return Yt(l/e.sideSpinFullRangeSafeFraction,-1,1)}function Pu(i,e){if(!Number.isFinite(e.topSpinFullRangeSafeFraction)||e.topSpinFullRangeSafeFraction<=0||!Number.isFinite(e.topSpinMaximumHorizontalDeviationSafeFraction)||e.topSpinMaximumHorizontalDeviationSafeFraction<=0)throw new RangeError("Gesture top-spin range must be a positive finite number.");if(i.length<2)throw new RangeError("Gesture top-spin requires at least two trace points.");if(i.some(l=>!Number.isFinite(l.safeAreaPosition01.x)||!Number.isFinite(l.safeAreaPosition01.y)||!Number.isFinite(l.timeSeconds)))throw new RangeError("Gesture top-spin points must contain only finite values.");const t=i[0],n=i[i.length-1];if(t===void 0||n===void 0)throw new RangeError("Gesture top-spin requires finite endpoints.");const s=[];let r=0;for(let l=1;l<i.length;l+=1){const c=i[l-1],h=i[l];if(c===void 0||h===void 0)continue;const u=Nn(c.safeAreaPosition01,h.safeAreaPosition01);s.push(u),r+=u}if(r<=Number.EPSILON)return 0;let a=0,o=0;for(let l=1;l<i.length-1;l+=1){const c=i[l];if(c===void 0)continue;o+=s[l-1]??0;const h=o/r,u=xt(t.safeAreaPosition01.x,n.safeAreaPosition01.x,h);if(Math.abs(c.safeAreaPosition01.x-u)>e.topSpinMaximumHorizontalDeviationSafeFraction)continue;const f=xt(t.safeAreaPosition01.y,n.safeAreaPosition01.y,h);a=Math.max(a,c.safeAreaPosition01.y-f)}return a<=nl?0:qt((a-nl)/e.topSpinFullRangeSafeFraction)}function Lu(i,e,t,n=null){const s=i[0],r=i[i.length-1];if(s===void 0||r===void 0)throw new Error("At least two preprocessed gesture points are required.");const a=i.map(m=>m.safeAreaPosition01),o=vu(a,t.smoothingWindow),l=Mu(o,t.resamplePointCount),c=wu(i,a,t),h=Tu({dx:r.positionPixels.x-s.positionPixels.x,dyUp:s.positionPixels.y-r.positionPixels.y},e,t),{hook:u,vee:f,descent:p}=Nc(a),g=u?Ru(a,t):0,_=f?qt(.65+p*1.4):0;return Object.freeze({category:gu({loft:g,bounceIntent:_},t),feint:n,aim:h,power:Math.round(Au(c,t)*1e12)/1e12,loft:g,sideSpin:u||f?0:Cu(a,t),topSpin:f?Math.min(.25,p):Pu(i,t),bounceIntent:_,features:c,rawPoints:i,smoothedPoints:o,resampledPoints:l})}const il=1e-9,Xt=1e-9;function xn(i,e){const t=e.safeAreaPosition01.x-i.safeAreaPosition01.x,n=i.safeAreaPosition01.y-e.safeAreaPosition01.y;return{x:t,y:n,length:Math.hypot(t,n)}}function Yi(i,e,t){return i.x*e+i.y*t}function Fc(i){const e=[["initial impulse",i.feintMinimumInitialImpulseSafeFraction],["brake",i.feintMinimumBrakeSafeFraction],["second impulse",i.feintMinimumSecondImpulseSafeFraction]];for(const[t,n]of e)if(!Number.isFinite(n)||n<=0||n>1)throw new RangeError(`FEINT ${t} threshold must be finite and within (0, 1].`);if(!Number.isFinite(i.feintMinimumInitialHorizontalRatio)||i.feintMinimumInitialHorizontalRatio<=0||i.feintMinimumInitialHorizontalRatio>1)throw new RangeError("FEINT initial horizontal ratio must be finite and within (0, 1].");if(!Number.isFinite(i.feintMaximumBrakeSpeedRatio)||i.feintMaximumBrakeSpeedRatio<0||i.feintMaximumBrakeSpeedRatio>=1)throw new RangeError("FEINT brake speed ratio must be finite and within [0, 1).");for(const[t,n]of[["reversal direction",i.feintMaximumReversalDirectionDot],["second impulse direction",i.feintMaximumSecondImpulseDirectionDot]])if(!Number.isFinite(n)||n<-1||n>=0)throw new RangeError(`FEINT ${t} dot threshold must be finite and within [-1, 0).`);if(!Number.isFinite(i.feintMaximumPrefixDurationSeconds)||i.feintMaximumPrefixDurationSeconds<=0||i.feintMaximumPrefixDurationSeconds>i.maximumDurationSeconds)throw new RangeError("FEINT prefix duration must be finite, positive, and no longer than the gesture duration.")}function Du(i,e){if(Fc(e),i.length<4)return null;if(i.some(s=>!Number.isFinite(s.safeAreaPosition01.x)||!Number.isFinite(s.safeAreaPosition01.y)||!Number.isFinite(s.timeSeconds)))throw new RangeError("FEINT points must contain only finite values.");const t=i[0];if(t===void 0)return null;const n=i.find(s=>xn(t,s).length>.035);if(n!==void 0){const s=xn(t,n);if(Math.abs(s.x)/s.length<=e.feintMinimumInitialHorizontalRatio)return null}for(let s=1;s<i.length-2;s+=1){const r=i[s];if(r===void 0)continue;const a=xn(t,r);if(a.length<=e.feintMinimumInitialImpulseSafeFraction+Xt||Math.abs(a.x)/a.length<=e.feintMinimumInitialHorizontalRatio+Xt)continue;const o=r.timeSeconds-t.timeSeconds;if(o<=0)continue;const l=a.x/a.length,c=a.y/a.length,h=a.length/o;let u=a.length;for(let f=s+1;f<i.length-1;f+=1){const p=i[f-1],g=i[f];if(p===void 0||g===void 0)continue;const _=xn(t,g),m=Yi(_,l,c);u=Math.max(u,m);const d=u-m,b=xn(p,g),E=g.timeSeconds-p.timeSeconds;if(E<=0)continue;const y=b.length/E,w=b.length<=il?1:Yi(b,l,c)/b.length,A=d>e.feintMinimumBrakeSafeFraction+Xt&&w<e.feintMaximumReversalDirectionDot-Xt,P=y<h*e.feintMaximumBrakeSpeedRatio-Xt;if(!(!A&&!P))for(let I=f+1;I<i.length;I+=1){const M=i[I];if(M===void 0)continue;const v=M.timeSeconds-t.timeSeconds;if(v<=0||v>=e.feintMaximumPrefixDurationSeconds-Xt)continue;const C=xn(g,M);if(!(C.length<=e.feintMinimumSecondImpulseSafeFraction+Xt||Yi(C,l,c)/C.length>=e.feintMaximumSecondImpulseDirectionDot-Xt)&&!(A&&!P&&b.length>il&&(b.x*C.x+b.y*C.y)/(b.length*C.length)>.95))return Object.freeze({type:"FEINT",apparentDirection:Object.freeze({x:l,y:c}),recognizedAtSeconds:v,initialImpulseSafeFraction:a.length,brakeSafeFraction:A?d:b.length,secondImpulseSafeFraction:C.length})}}}return null}function Iu(i,e){const t=Du(i,e);if(t!==null||i.length<3)return t;if(i.some(a=>!Number.isFinite(a.safeAreaPosition01.x)||!Number.isFinite(a.safeAreaPosition01.y)||!Number.isFinite(a.timeSeconds)))throw new RangeError("FEINT points must contain only finite values.");const n=i[0],s=i.find(a=>xn(n,a).length>.035);if(!s)return null;const r=xn(n,s);if(Math.abs(r.x)/r.length<=e.feintMinimumInitialHorizontalRatio)return null;for(let a=1;a<i.length-1;a++){const o=i[a],l=xn(n,o),c=o.timeSeconds-n.timeSeconds;if(c<=0||l.length<=e.feintMinimumInitialImpulseSafeFraction+Xt||Math.abs(l.x)/l.length<=e.feintMinimumInitialHorizontalRatio+Xt)continue;const h=l.x/l.length,u=l.y/l.length;for(let f=a+1;f<i.length;f++){const p=i[f],g=p.timeSeconds-n.timeSeconds;if(g>=e.feintMaximumPrefixDurationSeconds||g<=0)continue;const _=xn(o,p),m=_.length===0?1:Yi(_,h,u)/_.length,d=-Yi(_,h,u),E=(_.y<=.015||n.safeAreaPosition01.y-p.safeAreaPosition01.y<=.02)&&_.length>e.feintMinimumSecondImpulseSafeFraction+Xt&&d>e.feintMinimumBrakeSafeFraction+Xt&&m<e.feintMaximumReversalDirectionDot-Xt,y=p.timeSeconds-o.timeSeconds,w=f<i.length-1&&y>=.06&&_.length>.006&&Yi(_,h,u)>0&&_.length/y<l.length/c*e.feintMaximumBrakeSpeedRatio;if(!(!E&&!w))return Object.freeze({type:"FEINT",apparentDirection:Object.freeze({x:h,y:u}),recognizedAtSeconds:g,initialImpulseSafeFraction:l.length,brakeSafeFraction:E?d:_.length,secondImpulseSafeFraction:E?_.length:0})}}return null}class Ou{constructor(e,t,n,s){this.canvas=e,this.config=t,this.callbacks=n,this.trace=s,Fc(t),e.addEventListener("pointerdown",this.onPointerDown),e.addEventListener("pointermove",this.onPointerMove),e.addEventListener("pointerup",this.onPointerUp),e.addEventListener("pointercancel",this.onPointerCancel),e.addEventListener("lostpointercapture",this.onLostCapture)}canvas;config;callbacks;trace;activePointerId=null;activePointerType="unknown";samples=[];pendingFeint=null;enabled=!0;captureLossTimer;setEnabled(e){this.enabled=e,!e&&this.activePointerId!==null&&this.cancelActive("INTERRUPTED")}dispose(){this.canvas.removeEventListener("pointerdown",this.onPointerDown),this.canvas.removeEventListener("pointermove",this.onPointerMove),this.canvas.removeEventListener("pointerup",this.onPointerUp),this.canvas.removeEventListener("pointercancel",this.onPointerCancel),this.canvas.removeEventListener("lostpointercapture",this.onLostCapture),this.captureLossTimer!==void 0&&clearTimeout(this.captureLossTimer),this.releaseActiveCapture(),this.callbacks.onFeintChanged?.(null)}diagnostics(){return Object.freeze({captureActive:this.activePointerId!==null,pointerType:this.activePointerId===null?null:this.activePointerType,sampleCount:this.samples.length,pendingFeint:this.pendingFeint})}onPointerDown=e=>{if(!this.enabled||this.activePointerId!==null||!e.isPrimary)return;const{point:t,viewport:n}=this.localPoint(e);this.startTrace(e,n);const s=n.heightPixels*(1-this.config.startZoneFraction);if(t.x<0||t.x>n.widthPixels||t.y<s||t.y>n.heightPixels){this.traceSample(e,"down",!1,e,n,t),this.trace?.finish(n,null,"START_OUTSIDE_INPUT_ZONE"),this.callbacks.onRejected("START_OUTSIDE_INPUT_ZONE");return}e.preventDefault(),this.activePointerId=e.pointerId,this.activePointerType=e.pointerType||"unknown",this.samples=[this.sample(e,t)],this.traceSample(e,"down",!0,e,n,t),this.canvas.setPointerCapture(e.pointerId),this.callbacks.onGestureStarted?.(),this.publishTrail(n)};onPointerMove=e=>{if(e.pointerId!==this.activePointerId)return;e.preventDefault();const t=typeof e.getCoalescedEvents=="function"?e.getCoalescedEvents():[],n=t.length>0?t:[e],s=this.viewport();let r=!1;t.length>0&&this.traceSample(e,"parent",!1,e,s);for(const a of n){if(a.pointerId!==this.activePointerId)continue;const o=this.localPointInViewport(a),l=this.samples.at(-1),c=l!==void 0&&Su(l.positionPixels,o,{xPixels:0,yPixels:0,widthPixels:s.widthPixels,heightPixels:s.heightPixels},this.config);this.traceSample(a,t.length>0?"coalesced":"parent",c,e,s,o),c&&(this.samples.push(this.sample(a,o)),this.trace?.movement(),this.tryRecognizeFeint(s),this.publishGoalkeeperObservation(s),r=!0)}r&&this.publishTrail(s)};onPointerUp=e=>{if(e.pointerId!==this.activePointerId)return;e.preventDefault();const{point:t,viewport:n}=this.localPoint(e);this.samples.push(this.sample(e,t)),this.traceSample(e,"up",!0,e,n,t);const s=this.activePointerType,r=this.samples;this.trace?.movement(),this.tryRecognizeFeint(n);const a=this.pendingFeint;this.releaseCapture(e.pointerId);const o=xu(r,n,this.config,{inputEnabled:this.enabled,nonShootingFeint:a!==null});if(!o.accepted){this.trace?.finish(n,null,o.reason),this.callbacks.onFeintChanged?.(null),this.callbacks.onRejected(o.reason),this.callbacks.onTrailChanged(Object.freeze([]),n);return}const l=Lu(o.points,n,this.config,a);this.trace?.finish(n,l,null),a!==null?(this.callbacks.onFeintCompleted?.({gesture:l,pointerType:s}),this.callbacks.onTrailChanged(Object.freeze([]),n)):this.callbacks.onAccepted({gesture:l,pointerType:s}),this.callbacks.onFeintChanged?.(null)};onLostCapture=e=>{if(e.pointerId!==this.activePointerId)return;const t=e.pointerId;this.captureLossTimer=setTimeout(()=>{this.activePointerId===t&&this.cancelActive("INTERRUPTED")},0)};onPointerCancel=e=>{e.pointerId===this.activePointerId&&(this.traceSample(e,"cancel",!1,e,this.viewport()),this.cancelActive("INTERRUPTED"))};cancelActive(e){const t=this.viewport();this.trace?.finish(t,null,e),this.releaseActiveCapture(),this.callbacks.onFeintChanged?.(null),this.callbacks.onTrailChanged(Object.freeze([]),t),this.callbacks.onRejected(e)}releaseCapture(e){this.clearActiveState(),this.releaseHeldCapture(e)}releaseActiveCapture(){const e=this.activePointerId;this.clearActiveState(),e!==null&&this.releaseHeldCapture(e)}clearActiveState(){this.captureLossTimer!==void 0&&clearTimeout(this.captureLossTimer),this.activePointerId=null,this.activePointerType="unknown",this.samples=[],this.pendingFeint=null}releaseHeldCapture(e){this.canvas.hasPointerCapture(e)&&this.canvas.releasePointerCapture(e)}startTrace(e,t){if(!this.trace)return;const n=this.canvas.getBoundingClientRect();this.trace.start({pointerType:e.pointerType||"unknown",viewport:t,bounds:{left:n.left,top:n.top,width:n.width,height:n.height},browserViewport:{width:window.innerWidth,height:window.innerHeight},backingStore:{width:this.canvas.width,height:this.canvas.height},dpr:window.devicePixelRatio})}traceSample(e,t,n,s,r,a){this.trace?.sample({sample:this.sample(e,a??this.localPointInViewport(e)),source:t,retained:n,parentTimeSeconds:s.timeStamp/1e3,viewport:r})}localPoint(e){const t=this.canvas.getBoundingClientRect(),n=Object.freeze({widthPixels:t.width,heightPixels:t.height});return{point:Object.freeze({x:e.clientX-t.left,y:e.clientY-t.top}),viewport:n}}localPointInViewport(e){const t=this.canvas.getBoundingClientRect();return Object.freeze({x:e.clientX-t.left,y:e.clientY-t.top})}sample(e,t){return Object.freeze({positionPixels:t,timeSeconds:e.timeStamp/1e3})}viewport(){const e=this.canvas.getBoundingClientRect();return Object.freeze({widthPixels:e.width,heightPixels:e.height})}publishTrail(e){this.callbacks.onTrailChanged(Object.freeze(this.samples.map(t=>t.positionPixels)),e)}tryRecognizeFeint(e){if(this.pendingFeint!==null||this.samples.length<3)return;const t=this.samples[0];if(t===void 0)return;const n=this.samples.map(r=>Object.freeze({positionPixels:r.positionPixels,safeAreaPosition01:Object.freeze({x:r.positionPixels.x/e.widthPixels,y:r.positionPixels.y/e.heightPixels}),timeSeconds:r.timeSeconds-t.timeSeconds})),s=Iu(n,this.config);s!==null&&(this.pendingFeint=s,this.callbacks.onFeintChanged?.(s))}publishGoalkeeperObservation(e){const t=this.samples[0],n=this.samples.at(-1);if(t===void 0||n===void 0||e.widthPixels<=0||e.heightPixels<=0)return;const s={x:(n.positionPixels.x-t.positionPixels.x)/e.widthPixels,y:(t.positionPixels.y-n.positionPixels.y)/e.heightPixels},r=Math.hypot(s.x,s.y);if(!Number.isFinite(r)||r<=1e-9)return;const a=this.pendingFeint,o=a?.apparentDirection??Object.freeze({x:s.x/r,y:s.y/r});this.callbacks.onGoalkeeperObservation?.(Object.freeze({apparentDirection:o,elapsedGestureSeconds:Math.max(0,n.timeSeconds-t.timeSeconds),confidence:Math.min(1,r),feint:a}))}}const mo="180",Nu=0,sl=1,Fu=2,Uc=1,zc=2,Pn=3,Jn=0,Nt=1,cn=2,Kn=0,$i=1,_s=2,rl=3,al=4,Uu=5,ui=100,zu=101,Bu=102,Hu=103,ku=104,Gu=200,Vu=201,Wu=202,Xu=203,ba=204,Ea=205,qu=206,ju=207,Yu=208,$u=209,Ku=210,Zu=211,Ju=212,Qu=213,ed=214,Ta=0,wa=1,Aa=2,Zi=3,Ra=4,Ca=5,Pa=6,La=7,go=0,td=1,nd=2,Zn=0,id=1,sd=2,rd=3,Bc=4,ad=5,od=6,ld=7,Hc=300,Ji=301,Qi=302,Da=303,Ia=304,Rr=306,vs=1e3,dn=1001,Oa=1002,jt=1003,cd=1004,zs=1005,tn=1006,Nr=1007,fi=1008,bn=1009,kc=1010,Gc=1011,Ms=1012,_o=1013,gi=1014,vn=1015,Rs=1016,xo=1017,So=1018,ys=1020,Vc=35902,Wc=35899,Xc=1021,qc=1022,fn=1023,bs=1026,Es=1027,vo=1028,Mo=1029,jc=1030,yo=1031,bo=1033,fr=33776,pr=33777,mr=33778,gr=33779,Na=35840,Fa=35841,Ua=35842,za=35843,Ba=36196,Ha=37492,ka=37496,Ga=37808,Va=37809,Wa=37810,Xa=37811,qa=37812,ja=37813,Ya=37814,$a=37815,Ka=37816,Za=37817,Ja=37818,Qa=37819,eo=37820,to=37821,no=36492,io=36494,so=36495,ro=36283,ao=36284,oo=36285,lo=36286,hd=3200,ud=3201,Eo=0,dd=1,hn="",St="srgb",es="srgb-linear",Mr="linear",Qe="srgb",Mi=7680,ol=519,fd=512,pd=513,md=514,Yc=515,gd=516,_d=517,xd=518,Sd=519,ll=35044,vd=35048,cl="300 es",Mn=2e3,yr=2001;class is{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});const n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){const n=this._listeners;return n===void 0?!1:n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){const n=this._listeners;if(n===void 0)return;const s=n[e];if(s!==void 0){const r=s.indexOf(t);r!==-1&&s.splice(r,1)}}dispatchEvent(e){const t=this._listeners;if(t===void 0)return;const n=t[e.type];if(n!==void 0){e.target=this;const s=n.slice(0);for(let r=0,a=s.length;r<a;r++)s[r].call(this,e);e.target=null}}}const Mt=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];let hl=1234567;const xs=Math.PI/180,ts=180/Math.PI;function ss(){const i=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(Mt[i&255]+Mt[i>>8&255]+Mt[i>>16&255]+Mt[i>>24&255]+"-"+Mt[e&255]+Mt[e>>8&255]+"-"+Mt[e>>16&15|64]+Mt[e>>24&255]+"-"+Mt[t&63|128]+Mt[t>>8&255]+"-"+Mt[t>>16&255]+Mt[t>>24&255]+Mt[n&255]+Mt[n>>8&255]+Mt[n>>16&255]+Mt[n>>24&255]).toLowerCase()}function We(i,e,t){return Math.max(e,Math.min(t,i))}function To(i,e){return(i%e+e)%e}function Md(i,e,t,n,s){return n+(i-e)*(s-n)/(t-e)}function yd(i,e,t){return i!==e?(t-i)/(e-i):0}function Ss(i,e,t){return(1-t)*i+t*e}function bd(i,e,t,n){return Ss(i,e,1-Math.exp(-t*n))}function Ed(i,e=1){return e-Math.abs(To(i,e*2)-e)}function Td(i,e,t){return i<=e?0:i>=t?1:(i=(i-e)/(t-e),i*i*(3-2*i))}function wd(i,e,t){return i<=e?0:i>=t?1:(i=(i-e)/(t-e),i*i*i*(i*(i*6-15)+10))}function Ad(i,e){return i+Math.floor(Math.random()*(e-i+1))}function Rd(i,e){return i+Math.random()*(e-i)}function Cd(i){return i*(.5-Math.random())}function Pd(i){i!==void 0&&(hl=i);let e=hl+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}function Ld(i){return i*xs}function Dd(i){return i*ts}function Id(i){return(i&i-1)===0&&i!==0}function Od(i){return Math.pow(2,Math.ceil(Math.log(i)/Math.LN2))}function Nd(i){return Math.pow(2,Math.floor(Math.log(i)/Math.LN2))}function Fd(i,e,t,n,s){const r=Math.cos,a=Math.sin,o=r(t/2),l=a(t/2),c=r((e+n)/2),h=a((e+n)/2),u=r((e-n)/2),f=a((e-n)/2),p=r((n-e)/2),g=a((n-e)/2);switch(s){case"XYX":i.set(o*h,l*u,l*f,o*c);break;case"YZY":i.set(l*f,o*h,l*u,o*c);break;case"ZXZ":i.set(l*u,l*f,o*h,o*c);break;case"XZX":i.set(o*h,l*g,l*p,o*c);break;case"YXY":i.set(l*p,o*h,l*g,o*c);break;case"ZYZ":i.set(l*g,l*p,o*h,o*c);break;default:console.warn("THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+s)}}function Bi(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return i/4294967295;case Uint16Array:return i/65535;case Uint8Array:return i/255;case Int32Array:return Math.max(i/2147483647,-1);case Int16Array:return Math.max(i/32767,-1);case Int8Array:return Math.max(i/127,-1);default:throw new Error("Invalid component type.")}}function At(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return Math.round(i*4294967295);case Uint16Array:return Math.round(i*65535);case Uint8Array:return Math.round(i*255);case Int32Array:return Math.round(i*2147483647);case Int16Array:return Math.round(i*32767);case Int8Array:return Math.round(i*127);default:throw new Error("Invalid component type.")}}const Dn={DEG2RAD:xs,RAD2DEG:ts,generateUUID:ss,clamp:We,euclideanModulo:To,mapLinear:Md,inverseLerp:yd,lerp:Ss,damp:bd,pingpong:Ed,smoothstep:Td,smootherstep:wd,randInt:Ad,randFloat:Rd,randFloatSpread:Cd,seededRandom:Pd,degToRad:Ld,radToDeg:Dd,isPowerOfTwo:Id,ceilPowerOfTwo:Od,floorPowerOfTwo:Nd,setQuaternionFromProperEuler:Fd,normalize:At,denormalize:Bi};class Ge{constructor(e=0,t=0){Ge.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){const t=this.x,n=this.y,s=e.elements;return this.x=s[0]*t+s[3]*n+s[6],this.y=s[1]*t+s[4]*n+s[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=We(this.x,e.x,t.x),this.y=We(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=We(this.x,e,t),this.y=We(this.y,e,t),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(We(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const n=this.dot(e)/t;return Math.acos(We(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){const n=Math.cos(t),s=Math.sin(t),r=this.x-e.x,a=this.y-e.y;return this.x=r*n-a*s+e.x,this.y=r*s+a*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class It{constructor(e=0,t=0,n=0,s=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=s}static slerpFlat(e,t,n,s,r,a,o){let l=n[s+0],c=n[s+1],h=n[s+2],u=n[s+3];const f=r[a+0],p=r[a+1],g=r[a+2],_=r[a+3];if(o===0){e[t+0]=l,e[t+1]=c,e[t+2]=h,e[t+3]=u;return}if(o===1){e[t+0]=f,e[t+1]=p,e[t+2]=g,e[t+3]=_;return}if(u!==_||l!==f||c!==p||h!==g){let m=1-o;const d=l*f+c*p+h*g+u*_,b=d>=0?1:-1,E=1-d*d;if(E>Number.EPSILON){const w=Math.sqrt(E),A=Math.atan2(w,d*b);m=Math.sin(m*A)/w,o=Math.sin(o*A)/w}const y=o*b;if(l=l*m+f*y,c=c*m+p*y,h=h*m+g*y,u=u*m+_*y,m===1-o){const w=1/Math.sqrt(l*l+c*c+h*h+u*u);l*=w,c*=w,h*=w,u*=w}}e[t]=l,e[t+1]=c,e[t+2]=h,e[t+3]=u}static multiplyQuaternionsFlat(e,t,n,s,r,a){const o=n[s],l=n[s+1],c=n[s+2],h=n[s+3],u=r[a],f=r[a+1],p=r[a+2],g=r[a+3];return e[t]=o*g+h*u+l*p-c*f,e[t+1]=l*g+h*f+c*u-o*p,e[t+2]=c*g+h*p+o*f-l*u,e[t+3]=h*g-o*u-l*f-c*p,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,s){return this._x=e,this._y=t,this._z=n,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){const n=e._x,s=e._y,r=e._z,a=e._order,o=Math.cos,l=Math.sin,c=o(n/2),h=o(s/2),u=o(r/2),f=l(n/2),p=l(s/2),g=l(r/2);switch(a){case"XYZ":this._x=f*h*u+c*p*g,this._y=c*p*u-f*h*g,this._z=c*h*g+f*p*u,this._w=c*h*u-f*p*g;break;case"YXZ":this._x=f*h*u+c*p*g,this._y=c*p*u-f*h*g,this._z=c*h*g-f*p*u,this._w=c*h*u+f*p*g;break;case"ZXY":this._x=f*h*u-c*p*g,this._y=c*p*u+f*h*g,this._z=c*h*g+f*p*u,this._w=c*h*u-f*p*g;break;case"ZYX":this._x=f*h*u-c*p*g,this._y=c*p*u+f*h*g,this._z=c*h*g-f*p*u,this._w=c*h*u+f*p*g;break;case"YZX":this._x=f*h*u+c*p*g,this._y=c*p*u+f*h*g,this._z=c*h*g-f*p*u,this._w=c*h*u-f*p*g;break;case"XZY":this._x=f*h*u-c*p*g,this._y=c*p*u-f*h*g,this._z=c*h*g+f*p*u,this._w=c*h*u+f*p*g;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+a)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){const n=t/2,s=Math.sin(n);return this._x=e.x*s,this._y=e.y*s,this._z=e.z*s,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){const t=e.elements,n=t[0],s=t[4],r=t[8],a=t[1],o=t[5],l=t[9],c=t[2],h=t[6],u=t[10],f=n+o+u;if(f>0){const p=.5/Math.sqrt(f+1);this._w=.25/p,this._x=(h-l)*p,this._y=(r-c)*p,this._z=(a-s)*p}else if(n>o&&n>u){const p=2*Math.sqrt(1+n-o-u);this._w=(h-l)/p,this._x=.25*p,this._y=(s+a)/p,this._z=(r+c)/p}else if(o>u){const p=2*Math.sqrt(1+o-n-u);this._w=(r-c)/p,this._x=(s+a)/p,this._y=.25*p,this._z=(l+h)/p}else{const p=2*Math.sqrt(1+u-n-o);this._w=(a-s)/p,this._x=(r+c)/p,this._y=(l+h)/p,this._z=.25*p}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<1e-8?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(We(this.dot(e),-1,1)))}rotateTowards(e,t){const n=this.angleTo(e);if(n===0)return this;const s=Math.min(1,t/n);return this.slerp(e,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){const n=e._x,s=e._y,r=e._z,a=e._w,o=t._x,l=t._y,c=t._z,h=t._w;return this._x=n*h+a*o+s*c-r*l,this._y=s*h+a*l+r*o-n*c,this._z=r*h+a*c+n*l-s*o,this._w=a*h-n*o-s*l-r*c,this._onChangeCallback(),this}slerp(e,t){if(t===0)return this;if(t===1)return this.copy(e);const n=this._x,s=this._y,r=this._z,a=this._w;let o=a*e._w+n*e._x+s*e._y+r*e._z;if(o<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,o=-o):this.copy(e),o>=1)return this._w=a,this._x=n,this._y=s,this._z=r,this;const l=1-o*o;if(l<=Number.EPSILON){const p=1-t;return this._w=p*a+t*this._w,this._x=p*n+t*this._x,this._y=p*s+t*this._y,this._z=p*r+t*this._z,this.normalize(),this}const c=Math.sqrt(l),h=Math.atan2(c,o),u=Math.sin((1-t)*h)/c,f=Math.sin(t*h)/c;return this._w=a*u+this._w*f,this._x=n*u+this._x*f,this._y=s*u+this._y*f,this._z=r*u+this._z*f,this._onChangeCallback(),this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){const e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),s=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(s*Math.sin(e),s*Math.cos(e),r*Math.sin(t),r*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class L{constructor(e=0,t=0,n=0){L.prototype.isVector3=!0,this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(ul.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(ul.setFromAxisAngle(e,t))}applyMatrix3(e){const t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6]*s,this.y=r[1]*t+r[4]*n+r[7]*s,this.z=r[2]*t+r[5]*n+r[8]*s,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){const t=this.x,n=this.y,s=this.z,r=e.elements,a=1/(r[3]*t+r[7]*n+r[11]*s+r[15]);return this.x=(r[0]*t+r[4]*n+r[8]*s+r[12])*a,this.y=(r[1]*t+r[5]*n+r[9]*s+r[13])*a,this.z=(r[2]*t+r[6]*n+r[10]*s+r[14])*a,this}applyQuaternion(e){const t=this.x,n=this.y,s=this.z,r=e.x,a=e.y,o=e.z,l=e.w,c=2*(a*s-o*n),h=2*(o*t-r*s),u=2*(r*n-a*t);return this.x=t+l*c+a*u-o*h,this.y=n+l*h+o*c-r*u,this.z=s+l*u+r*h-a*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){const t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[4]*n+r[8]*s,this.y=r[1]*t+r[5]*n+r[9]*s,this.z=r[2]*t+r[6]*n+r[10]*s,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=We(this.x,e.x,t.x),this.y=We(this.y,e.y,t.y),this.z=We(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=We(this.x,e,t),this.y=We(this.y,e,t),this.z=We(this.z,e,t),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(We(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){const n=e.x,s=e.y,r=e.z,a=t.x,o=t.y,l=t.z;return this.x=s*l-r*o,this.y=r*a-n*l,this.z=n*o-s*a,this}projectOnVector(e){const t=e.lengthSq();if(t===0)return this.set(0,0,0);const n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return Fr.copy(this).projectOnVector(e),this.sub(Fr)}reflect(e){return this.sub(Fr.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const n=this.dot(e)/t;return Math.acos(We(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y,s=this.z-e.z;return t*t+n*n+s*s}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){const s=Math.sin(t)*e;return this.x=s*Math.sin(n),this.y=Math.cos(t)*e,this.z=s*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){const t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),s=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=s,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const Fr=new L,ul=new It;class Be{constructor(e,t,n,s,r,a,o,l,c){Be.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,a,o,l,c)}set(e,t,n,s,r,a,o,l,c){const h=this.elements;return h[0]=e,h[1]=s,h[2]=o,h[3]=t,h[4]=r,h[5]=l,h[6]=n,h[7]=a,h[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){const t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){const t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const n=e.elements,s=t.elements,r=this.elements,a=n[0],o=n[3],l=n[6],c=n[1],h=n[4],u=n[7],f=n[2],p=n[5],g=n[8],_=s[0],m=s[3],d=s[6],b=s[1],E=s[4],y=s[7],w=s[2],A=s[5],P=s[8];return r[0]=a*_+o*b+l*w,r[3]=a*m+o*E+l*A,r[6]=a*d+o*y+l*P,r[1]=c*_+h*b+u*w,r[4]=c*m+h*E+u*A,r[7]=c*d+h*y+u*P,r[2]=f*_+p*b+g*w,r[5]=f*m+p*E+g*A,r[8]=f*d+p*y+g*P,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){const e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],h=e[8];return t*a*h-t*o*c-n*r*h+n*o*l+s*r*c-s*a*l}invert(){const e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],h=e[8],u=h*a-o*c,f=o*l-h*r,p=c*r-a*l,g=t*u+n*f+s*p;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);const _=1/g;return e[0]=u*_,e[1]=(s*c-h*n)*_,e[2]=(o*n-s*a)*_,e[3]=f*_,e[4]=(h*t-s*l)*_,e[5]=(s*r-o*t)*_,e[6]=p*_,e[7]=(n*l-c*t)*_,e[8]=(a*t-n*r)*_,this}transpose(){let e;const t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){const t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,s,r,a,o){const l=Math.cos(r),c=Math.sin(r);return this.set(n*l,n*c,-n*(l*a+c*o)+a+e,-s*c,s*l,-s*(-c*a+l*o)+o+t,0,0,1),this}scale(e,t){return this.premultiply(Ur.makeScale(e,t)),this}rotate(e){return this.premultiply(Ur.makeRotation(-e)),this}translate(e,t){return this.premultiply(Ur.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){const t=this.elements,n=e.elements;for(let s=0;s<9;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){const n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}}const Ur=new Be;function $c(i){for(let e=i.length-1;e>=0;--e)if(i[e]>=65535)return!0;return!1}function br(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function Ud(){const i=br("canvas");return i.style.display="block",i}const dl={};function Ts(i){i in dl||(dl[i]=!0,console.warn(i))}function zd(i,e,t){return new Promise(function(n,s){function r(){switch(i.clientWaitSync(e,i.SYNC_FLUSH_COMMANDS_BIT,0)){case i.WAIT_FAILED:s();break;case i.TIMEOUT_EXPIRED:setTimeout(r,t);break;default:n()}}setTimeout(r,t)})}const fl=new Be().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),pl=new Be().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function Bd(){const i={enabled:!0,workingColorSpace:es,spaces:{},convert:function(s,r,a){return this.enabled===!1||r===a||!r||!a||(this.spaces[r].transfer===Qe&&(s.r=On(s.r),s.g=On(s.g),s.b=On(s.b)),this.spaces[r].primaries!==this.spaces[a].primaries&&(s.applyMatrix3(this.spaces[r].toXYZ),s.applyMatrix3(this.spaces[a].fromXYZ)),this.spaces[a].transfer===Qe&&(s.r=Ki(s.r),s.g=Ki(s.g),s.b=Ki(s.b))),s},workingToColorSpace:function(s,r){return this.convert(s,this.workingColorSpace,r)},colorSpaceToWorking:function(s,r){return this.convert(s,r,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===hn?Mr:this.spaces[s].transfer},getToneMappingMode:function(s){return this.spaces[s].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(s,r=this.workingColorSpace){return s.fromArray(this.spaces[r].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,r,a){return s.copy(this.spaces[r].toXYZ).multiply(this.spaces[a].fromXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(s,r){return Ts("THREE.ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),i.workingToColorSpace(s,r)},toWorkingColorSpace:function(s,r){return Ts("THREE.ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),i.colorSpaceToWorking(s,r)}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],n=[.3127,.329];return i.define({[es]:{primaries:e,whitePoint:n,transfer:Mr,toXYZ:fl,fromXYZ:pl,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:St},outputColorSpaceConfig:{drawingBufferColorSpace:St}},[St]:{primaries:e,whitePoint:n,transfer:Qe,toXYZ:fl,fromXYZ:pl,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:St}}}),i}const $e=Bd();function On(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function Ki(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}let yi;class Hd{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{yi===void 0&&(yi=br("canvas")),yi.width=e.width,yi.height=e.height;const s=yi.getContext("2d");e instanceof ImageData?s.putImageData(e,0,0):s.drawImage(e,0,0,e.width,e.height),n=yi}return n.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){const t=br("canvas");t.width=e.width,t.height=e.height;const n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);const s=n.getImageData(0,0,e.width,e.height),r=s.data;for(let a=0;a<r.length;a++)r[a]=On(r[a]/255)*255;return n.putImageData(s,0,0),t}else if(e.data){const t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor(On(t[n]/255)*255):t[n]=On(t[n]);return{data:t,width:e.width,height:e.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}}let kd=0;class wo{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:kd++}),this.uuid=ss(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){const t=this.data;return typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):t instanceof VideoFrame?e.set(t.displayHeight,t.displayWidth,0):t!==null?e.set(t.width,t.height,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];const n={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let a=0,o=s.length;a<o;a++)s[a].isDataTexture?r.push(zr(s[a].image)):r.push(zr(s[a]))}else r=zr(s);n.url=r}return t||(e.images[this.uuid]=n),n}}function zr(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?Hd.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}let Gd=0;const Br=new L;class bt extends is{constructor(e=bt.DEFAULT_IMAGE,t=bt.DEFAULT_MAPPING,n=dn,s=dn,r=tn,a=fi,o=fn,l=bn,c=bt.DEFAULT_ANISOTROPY,h=hn){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Gd++}),this.uuid=ss(),this.name="",this.source=new wo(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=n,this.wrapT=s,this.magFilter=r,this.minFilter=a,this.anisotropy=c,this.format=o,this.internalFormat=null,this.type=l,this.offset=new Ge(0,0),this.repeat=new Ge(1,1),this.center=new Ge(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Be,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0}get width(){return this.source.getSize(Br).x}get height(){return this.source.getSize(Br).y}get depth(){return this.source.getSize(Br).z}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(const t in e){const n=e[t];if(n===void 0){console.warn(`THREE.Texture.setValues(): parameter '${t}' has value of undefined.`);continue}const s=this[t];if(s===void 0){console.warn(`THREE.Texture.setValues(): property '${t}' does not exist.`);continue}s&&n&&s.isVector2&&n.isVector2||s&&n&&s.isVector3&&n.isVector3||s&&n&&s.isMatrix3&&n.isMatrix3?s.copy(n):this[t]=n}}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];const n={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==Hc)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case vs:e.x=e.x-Math.floor(e.x);break;case dn:e.x=e.x<0?0:1;break;case Oa:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case vs:e.y=e.y-Math.floor(e.y);break;case dn:e.y=e.y<0?0:1;break;case Oa:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}}bt.DEFAULT_IMAGE=null;bt.DEFAULT_MAPPING=Hc;bt.DEFAULT_ANISOTROPY=1;class et{constructor(e=0,t=0,n=0,s=1){et.prototype.isVector4=!0,this.x=e,this.y=t,this.z=n,this.w=s}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,s){return this.x=e,this.y=t,this.z=n,this.w=s,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){const t=this.x,n=this.y,s=this.z,r=this.w,a=e.elements;return this.x=a[0]*t+a[4]*n+a[8]*s+a[12]*r,this.y=a[1]*t+a[5]*n+a[9]*s+a[13]*r,this.z=a[2]*t+a[6]*n+a[10]*s+a[14]*r,this.w=a[3]*t+a[7]*n+a[11]*s+a[15]*r,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);const t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,s,r;const l=e.elements,c=l[0],h=l[4],u=l[8],f=l[1],p=l[5],g=l[9],_=l[2],m=l[6],d=l[10];if(Math.abs(h-f)<.01&&Math.abs(u-_)<.01&&Math.abs(g-m)<.01){if(Math.abs(h+f)<.1&&Math.abs(u+_)<.1&&Math.abs(g+m)<.1&&Math.abs(c+p+d-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;const E=(c+1)/2,y=(p+1)/2,w=(d+1)/2,A=(h+f)/4,P=(u+_)/4,I=(g+m)/4;return E>y&&E>w?E<.01?(n=0,s=.707106781,r=.707106781):(n=Math.sqrt(E),s=A/n,r=P/n):y>w?y<.01?(n=.707106781,s=0,r=.707106781):(s=Math.sqrt(y),n=A/s,r=I/s):w<.01?(n=.707106781,s=.707106781,r=0):(r=Math.sqrt(w),n=P/r,s=I/r),this.set(n,s,r,t),this}let b=Math.sqrt((m-g)*(m-g)+(u-_)*(u-_)+(f-h)*(f-h));return Math.abs(b)<.001&&(b=1),this.x=(m-g)/b,this.y=(u-_)/b,this.z=(f-h)/b,this.w=Math.acos((c+p+d-1)/2),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=We(this.x,e.x,t.x),this.y=We(this.y,e.y,t.y),this.z=We(this.z,e.z,t.z),this.w=We(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=We(this.x,e,t),this.y=We(this.y,e,t),this.z=We(this.z,e,t),this.w=We(this.w,e,t),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(We(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class Vd extends is{constructor(e=1,t=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:tn,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1},n),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=n.depth,this.scissor=new et(0,0,e,t),this.scissorTest=!1,this.viewport=new et(0,0,e,t);const s={width:e,height:t,depth:n.depth},r=new bt(s);this.textures=[];const a=n.count;for(let o=0;o<a;o++)this.textures[o]=r.clone(),this.textures[o].isRenderTargetTexture=!0,this.textures[o].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview}_setTextureOptions(e={}){const t={minFilter:tn,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let n=0;n<this.textures.length;n++)this.textures[n].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&(this._depthTexture.renderTarget=null),e!==null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=e,this.textures[s].image.height=t,this.textures[s].image.depth=n,this.textures[s].isArrayTexture=this.textures[s].image.depth>1;this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,n=e.textures.length;t<n;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;const s=Object.assign({},e.textures[t].image);this.textures[t].source=new wo(s)}return this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class Qn extends Vd{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}}class Kc extends bt{constructor(e=null,t=1,n=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=jt,this.minFilter=jt,this.wrapR=dn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}}class Wd extends bt{constructor(e=null,t=1,n=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=jt,this.minFilter=jt,this.wrapR=dn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class _i{constructor(e=new L(1/0,1/0,1/0),t=new L(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(sn.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(sn.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){const n=sn.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);const n=e.geometry;if(n!==void 0){const r=n.getAttribute("position");if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let a=0,o=r.count;a<o;a++)e.isMesh===!0?e.getVertexPosition(a,sn):sn.fromBufferAttribute(r,a),sn.applyMatrix4(e.matrixWorld),this.expandByPoint(sn);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),Bs.copy(e.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),Bs.copy(n.boundingBox)),Bs.applyMatrix4(e.matrixWorld),this.union(Bs)}const s=e.children;for(let r=0,a=s.length;r<a;r++)this.expandByObject(s[r],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,sn),sn.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(ls),Hs.subVectors(this.max,ls),bi.subVectors(e.a,ls),Ei.subVectors(e.b,ls),Ti.subVectors(e.c,ls),zn.subVectors(Ei,bi),Bn.subVectors(Ti,Ei),ii.subVectors(bi,Ti);let t=[0,-zn.z,zn.y,0,-Bn.z,Bn.y,0,-ii.z,ii.y,zn.z,0,-zn.x,Bn.z,0,-Bn.x,ii.z,0,-ii.x,-zn.y,zn.x,0,-Bn.y,Bn.x,0,-ii.y,ii.x,0];return!Hr(t,bi,Ei,Ti,Hs)||(t=[1,0,0,0,1,0,0,0,1],!Hr(t,bi,Ei,Ti,Hs))?!1:(ks.crossVectors(zn,Bn),t=[ks.x,ks.y,ks.z],Hr(t,bi,Ei,Ti,Hs))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,sn).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(sn).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(Tn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Tn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Tn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Tn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Tn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Tn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Tn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Tn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Tn),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}}const Tn=[new L,new L,new L,new L,new L,new L,new L,new L],sn=new L,Bs=new _i,bi=new L,Ei=new L,Ti=new L,zn=new L,Bn=new L,ii=new L,ls=new L,Hs=new L,ks=new L,si=new L;function Hr(i,e,t,n,s){for(let r=0,a=i.length-3;r<=a;r+=3){si.fromArray(i,r);const o=s.x*Math.abs(si.x)+s.y*Math.abs(si.y)+s.z*Math.abs(si.z),l=e.dot(si),c=t.dot(si),h=n.dot(si);if(Math.max(-Math.max(l,c,h),Math.min(l,c,h))>o)return!1}return!0}const Xd=new _i,cs=new L,kr=new L;class xi{constructor(e=new L,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){const n=this.center;t!==void 0?n.copy(t):Xd.setFromPoints(e).getCenter(n);let s=0;for(let r=0,a=e.length;r<a;r++)s=Math.max(s,n.distanceToSquared(e[r]));return this.radius=Math.sqrt(s),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){const t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){const n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;cs.subVectors(e,this.center);const t=cs.lengthSq();if(t>this.radius*this.radius){const n=Math.sqrt(t),s=(n-this.radius)*.5;this.center.addScaledVector(cs,s/n),this.radius+=s}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(kr.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(cs.copy(e.center).add(kr)),this.expandByPoint(cs.copy(e.center).sub(kr))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}}const wn=new L,Gr=new L,Gs=new L,Hn=new L,Vr=new L,Vs=new L,Wr=new L;class Zc{constructor(e=new L,t=new L(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,wn)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);const n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){const t=wn.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(wn.copy(this.origin).addScaledVector(this.direction,t),wn.distanceToSquared(e))}distanceSqToSegment(e,t,n,s){Gr.copy(e).add(t).multiplyScalar(.5),Gs.copy(t).sub(e).normalize(),Hn.copy(this.origin).sub(Gr);const r=e.distanceTo(t)*.5,a=-this.direction.dot(Gs),o=Hn.dot(this.direction),l=-Hn.dot(Gs),c=Hn.lengthSq(),h=Math.abs(1-a*a);let u,f,p,g;if(h>0)if(u=a*l-o,f=a*o-l,g=r*h,u>=0)if(f>=-g)if(f<=g){const _=1/h;u*=_,f*=_,p=u*(u+a*f+2*o)+f*(a*u+f+2*l)+c}else f=r,u=Math.max(0,-(a*f+o)),p=-u*u+f*(f+2*l)+c;else f=-r,u=Math.max(0,-(a*f+o)),p=-u*u+f*(f+2*l)+c;else f<=-g?(u=Math.max(0,-(-a*r+o)),f=u>0?-r:Math.min(Math.max(-r,-l),r),p=-u*u+f*(f+2*l)+c):f<=g?(u=0,f=Math.min(Math.max(-r,-l),r),p=f*(f+2*l)+c):(u=Math.max(0,-(a*r+o)),f=u>0?r:Math.min(Math.max(-r,-l),r),p=-u*u+f*(f+2*l)+c);else f=a>0?-r:r,u=Math.max(0,-(a*f+o)),p=-u*u+f*(f+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,u),s&&s.copy(Gr).addScaledVector(Gs,f),p}intersectSphere(e,t){wn.subVectors(e.center,this.origin);const n=wn.dot(this.direction),s=wn.dot(wn)-n*n,r=e.radius*e.radius;if(s>r)return null;const a=Math.sqrt(r-s),o=n-a,l=n+a;return l<0?null:o<0?this.at(l,t):this.at(o,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){const t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;const n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){const n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){const t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,s,r,a,o,l;const c=1/this.direction.x,h=1/this.direction.y,u=1/this.direction.z,f=this.origin;return c>=0?(n=(e.min.x-f.x)*c,s=(e.max.x-f.x)*c):(n=(e.max.x-f.x)*c,s=(e.min.x-f.x)*c),h>=0?(r=(e.min.y-f.y)*h,a=(e.max.y-f.y)*h):(r=(e.max.y-f.y)*h,a=(e.min.y-f.y)*h),n>a||r>s||((r>n||isNaN(n))&&(n=r),(a<s||isNaN(s))&&(s=a),u>=0?(o=(e.min.z-f.z)*u,l=(e.max.z-f.z)*u):(o=(e.max.z-f.z)*u,l=(e.min.z-f.z)*u),n>l||o>s)||((o>n||n!==n)&&(n=o),(l<s||s!==s)&&(s=l),s<0)?null:this.at(n>=0?n:s,t)}intersectsBox(e){return this.intersectBox(e,wn)!==null}intersectTriangle(e,t,n,s,r){Vr.subVectors(t,e),Vs.subVectors(n,e),Wr.crossVectors(Vr,Vs);let a=this.direction.dot(Wr),o;if(a>0){if(s)return null;o=1}else if(a<0)o=-1,a=-a;else return null;Hn.subVectors(this.origin,e);const l=o*this.direction.dot(Vs.crossVectors(Hn,Vs));if(l<0)return null;const c=o*this.direction.dot(Vr.cross(Hn));if(c<0||l+c>a)return null;const h=-o*Hn.dot(Wr);return h<0?null:this.at(h/a,r)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class je{constructor(e,t,n,s,r,a,o,l,c,h,u,f,p,g,_,m){je.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,a,o,l,c,h,u,f,p,g,_,m)}set(e,t,n,s,r,a,o,l,c,h,u,f,p,g,_,m){const d=this.elements;return d[0]=e,d[4]=t,d[8]=n,d[12]=s,d[1]=r,d[5]=a,d[9]=o,d[13]=l,d[2]=c,d[6]=h,d[10]=u,d[14]=f,d[3]=p,d[7]=g,d[11]=_,d[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new je().fromArray(this.elements)}copy(e){const t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){const t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){const t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){const t=this.elements,n=e.elements,s=1/wi.setFromMatrixColumn(e,0).length(),r=1/wi.setFromMatrixColumn(e,1).length(),a=1/wi.setFromMatrixColumn(e,2).length();return t[0]=n[0]*s,t[1]=n[1]*s,t[2]=n[2]*s,t[3]=0,t[4]=n[4]*r,t[5]=n[5]*r,t[6]=n[6]*r,t[7]=0,t[8]=n[8]*a,t[9]=n[9]*a,t[10]=n[10]*a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){const t=this.elements,n=e.x,s=e.y,r=e.z,a=Math.cos(n),o=Math.sin(n),l=Math.cos(s),c=Math.sin(s),h=Math.cos(r),u=Math.sin(r);if(e.order==="XYZ"){const f=a*h,p=a*u,g=o*h,_=o*u;t[0]=l*h,t[4]=-l*u,t[8]=c,t[1]=p+g*c,t[5]=f-_*c,t[9]=-o*l,t[2]=_-f*c,t[6]=g+p*c,t[10]=a*l}else if(e.order==="YXZ"){const f=l*h,p=l*u,g=c*h,_=c*u;t[0]=f+_*o,t[4]=g*o-p,t[8]=a*c,t[1]=a*u,t[5]=a*h,t[9]=-o,t[2]=p*o-g,t[6]=_+f*o,t[10]=a*l}else if(e.order==="ZXY"){const f=l*h,p=l*u,g=c*h,_=c*u;t[0]=f-_*o,t[4]=-a*u,t[8]=g+p*o,t[1]=p+g*o,t[5]=a*h,t[9]=_-f*o,t[2]=-a*c,t[6]=o,t[10]=a*l}else if(e.order==="ZYX"){const f=a*h,p=a*u,g=o*h,_=o*u;t[0]=l*h,t[4]=g*c-p,t[8]=f*c+_,t[1]=l*u,t[5]=_*c+f,t[9]=p*c-g,t[2]=-c,t[6]=o*l,t[10]=a*l}else if(e.order==="YZX"){const f=a*l,p=a*c,g=o*l,_=o*c;t[0]=l*h,t[4]=_-f*u,t[8]=g*u+p,t[1]=u,t[5]=a*h,t[9]=-o*h,t[2]=-c*h,t[6]=p*u+g,t[10]=f-_*u}else if(e.order==="XZY"){const f=a*l,p=a*c,g=o*l,_=o*c;t[0]=l*h,t[4]=-u,t[8]=c*h,t[1]=f*u+_,t[5]=a*h,t[9]=p*u-g,t[2]=g*u-p,t[6]=o*h,t[10]=_*u+f}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(qd,e,jd)}lookAt(e,t,n){const s=this.elements;return Vt.subVectors(e,t),Vt.lengthSq()===0&&(Vt.z=1),Vt.normalize(),kn.crossVectors(n,Vt),kn.lengthSq()===0&&(Math.abs(n.z)===1?Vt.x+=1e-4:Vt.z+=1e-4,Vt.normalize(),kn.crossVectors(n,Vt)),kn.normalize(),Ws.crossVectors(Vt,kn),s[0]=kn.x,s[4]=Ws.x,s[8]=Vt.x,s[1]=kn.y,s[5]=Ws.y,s[9]=Vt.y,s[2]=kn.z,s[6]=Ws.z,s[10]=Vt.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const n=e.elements,s=t.elements,r=this.elements,a=n[0],o=n[4],l=n[8],c=n[12],h=n[1],u=n[5],f=n[9],p=n[13],g=n[2],_=n[6],m=n[10],d=n[14],b=n[3],E=n[7],y=n[11],w=n[15],A=s[0],P=s[4],I=s[8],M=s[12],v=s[1],C=s[5],F=s[9],z=s[13],X=s[2],V=s[6],G=s[10],$=s[14],B=s[3],ie=s[7],re=s[11],_e=s[15];return r[0]=a*A+o*v+l*X+c*B,r[4]=a*P+o*C+l*V+c*ie,r[8]=a*I+o*F+l*G+c*re,r[12]=a*M+o*z+l*$+c*_e,r[1]=h*A+u*v+f*X+p*B,r[5]=h*P+u*C+f*V+p*ie,r[9]=h*I+u*F+f*G+p*re,r[13]=h*M+u*z+f*$+p*_e,r[2]=g*A+_*v+m*X+d*B,r[6]=g*P+_*C+m*V+d*ie,r[10]=g*I+_*F+m*G+d*re,r[14]=g*M+_*z+m*$+d*_e,r[3]=b*A+E*v+y*X+w*B,r[7]=b*P+E*C+y*V+w*ie,r[11]=b*I+E*F+y*G+w*re,r[15]=b*M+E*z+y*$+w*_e,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){const e=this.elements,t=e[0],n=e[4],s=e[8],r=e[12],a=e[1],o=e[5],l=e[9],c=e[13],h=e[2],u=e[6],f=e[10],p=e[14],g=e[3],_=e[7],m=e[11],d=e[15];return g*(+r*l*u-s*c*u-r*o*f+n*c*f+s*o*p-n*l*p)+_*(+t*l*p-t*c*f+r*a*f-s*a*p+s*c*h-r*l*h)+m*(+t*c*u-t*o*p-r*a*u+n*a*p+r*o*h-n*c*h)+d*(-s*o*h-t*l*u+t*o*f+s*a*u-n*a*f+n*l*h)}transpose(){const e=this.elements;let t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){const s=this.elements;return e.isVector3?(s[12]=e.x,s[13]=e.y,s[14]=e.z):(s[12]=e,s[13]=t,s[14]=n),this}invert(){const e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],h=e[8],u=e[9],f=e[10],p=e[11],g=e[12],_=e[13],m=e[14],d=e[15],b=u*m*c-_*f*c+_*l*p-o*m*p-u*l*d+o*f*d,E=g*f*c-h*m*c-g*l*p+a*m*p+h*l*d-a*f*d,y=h*_*c-g*u*c+g*o*p-a*_*p-h*o*d+a*u*d,w=g*u*l-h*_*l-g*o*f+a*_*f+h*o*m-a*u*m,A=t*b+n*E+s*y+r*w;if(A===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const P=1/A;return e[0]=b*P,e[1]=(_*f*r-u*m*r-_*s*p+n*m*p+u*s*d-n*f*d)*P,e[2]=(o*m*r-_*l*r+_*s*c-n*m*c-o*s*d+n*l*d)*P,e[3]=(u*l*r-o*f*r-u*s*c+n*f*c+o*s*p-n*l*p)*P,e[4]=E*P,e[5]=(h*m*r-g*f*r+g*s*p-t*m*p-h*s*d+t*f*d)*P,e[6]=(g*l*r-a*m*r-g*s*c+t*m*c+a*s*d-t*l*d)*P,e[7]=(a*f*r-h*l*r+h*s*c-t*f*c-a*s*p+t*l*p)*P,e[8]=y*P,e[9]=(g*u*r-h*_*r-g*n*p+t*_*p+h*n*d-t*u*d)*P,e[10]=(a*_*r-g*o*r+g*n*c-t*_*c-a*n*d+t*o*d)*P,e[11]=(h*o*r-a*u*r-h*n*c+t*u*c+a*n*p-t*o*p)*P,e[12]=w*P,e[13]=(h*_*s-g*u*s+g*n*f-t*_*f-h*n*m+t*u*m)*P,e[14]=(g*o*s-a*_*s-g*n*l+t*_*l+a*n*m-t*o*m)*P,e[15]=(a*u*s-h*o*s+h*n*l-t*u*l-a*n*f+t*o*f)*P,this}scale(e){const t=this.elements,n=e.x,s=e.y,r=e.z;return t[0]*=n,t[4]*=s,t[8]*=r,t[1]*=n,t[5]*=s,t[9]*=r,t[2]*=n,t[6]*=s,t[10]*=r,t[3]*=n,t[7]*=s,t[11]*=r,this}getMaxScaleOnAxis(){const e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],s=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,s))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){const t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){const n=Math.cos(t),s=Math.sin(t),r=1-n,a=e.x,o=e.y,l=e.z,c=r*a,h=r*o;return this.set(c*a+n,c*o-s*l,c*l+s*o,0,c*o+s*l,h*o+n,h*l-s*a,0,c*l-s*o,h*l+s*a,r*l*l+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,s,r,a){return this.set(1,n,r,0,e,1,a,0,t,s,1,0,0,0,0,1),this}compose(e,t,n){const s=this.elements,r=t._x,a=t._y,o=t._z,l=t._w,c=r+r,h=a+a,u=o+o,f=r*c,p=r*h,g=r*u,_=a*h,m=a*u,d=o*u,b=l*c,E=l*h,y=l*u,w=n.x,A=n.y,P=n.z;return s[0]=(1-(_+d))*w,s[1]=(p+y)*w,s[2]=(g-E)*w,s[3]=0,s[4]=(p-y)*A,s[5]=(1-(f+d))*A,s[6]=(m+b)*A,s[7]=0,s[8]=(g+E)*P,s[9]=(m-b)*P,s[10]=(1-(f+_))*P,s[11]=0,s[12]=e.x,s[13]=e.y,s[14]=e.z,s[15]=1,this}decompose(e,t,n){const s=this.elements;let r=wi.set(s[0],s[1],s[2]).length();const a=wi.set(s[4],s[5],s[6]).length(),o=wi.set(s[8],s[9],s[10]).length();this.determinant()<0&&(r=-r),e.x=s[12],e.y=s[13],e.z=s[14],rn.copy(this);const c=1/r,h=1/a,u=1/o;return rn.elements[0]*=c,rn.elements[1]*=c,rn.elements[2]*=c,rn.elements[4]*=h,rn.elements[5]*=h,rn.elements[6]*=h,rn.elements[8]*=u,rn.elements[9]*=u,rn.elements[10]*=u,t.setFromRotationMatrix(rn),n.x=r,n.y=a,n.z=o,this}makePerspective(e,t,n,s,r,a,o=Mn,l=!1){const c=this.elements,h=2*r/(t-e),u=2*r/(n-s),f=(t+e)/(t-e),p=(n+s)/(n-s);let g,_;if(l)g=r/(a-r),_=a*r/(a-r);else if(o===Mn)g=-(a+r)/(a-r),_=-2*a*r/(a-r);else if(o===yr)g=-a/(a-r),_=-a*r/(a-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return c[0]=h,c[4]=0,c[8]=f,c[12]=0,c[1]=0,c[5]=u,c[9]=p,c[13]=0,c[2]=0,c[6]=0,c[10]=g,c[14]=_,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,t,n,s,r,a,o=Mn,l=!1){const c=this.elements,h=2/(t-e),u=2/(n-s),f=-(t+e)/(t-e),p=-(n+s)/(n-s);let g,_;if(l)g=1/(a-r),_=a/(a-r);else if(o===Mn)g=-2/(a-r),_=-(a+r)/(a-r);else if(o===yr)g=-1/(a-r),_=-r/(a-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return c[0]=h,c[4]=0,c[8]=0,c[12]=f,c[1]=0,c[5]=u,c[9]=0,c[13]=p,c[2]=0,c[6]=0,c[10]=g,c[14]=_,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){const t=this.elements,n=e.elements;for(let s=0;s<16;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){const n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}}const wi=new L,rn=new je,qd=new L(0,0,0),jd=new L(1,1,1),kn=new L,Ws=new L,Vt=new L,ml=new je,gl=new It;class pn{constructor(e=0,t=0,n=0,s=pn.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=s}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,s=this._order){return this._x=e,this._y=t,this._z=n,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){const s=e.elements,r=s[0],a=s[4],o=s[8],l=s[1],c=s[5],h=s[9],u=s[2],f=s[6],p=s[10];switch(t){case"XYZ":this._y=Math.asin(We(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-h,p),this._z=Math.atan2(-a,r)):(this._x=Math.atan2(f,c),this._z=0);break;case"YXZ":this._x=Math.asin(-We(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(o,p),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-u,r),this._z=0);break;case"ZXY":this._x=Math.asin(We(f,-1,1)),Math.abs(f)<.9999999?(this._y=Math.atan2(-u,p),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-We(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(f,p),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-a,c));break;case"YZX":this._z=Math.asin(We(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-h,c),this._y=Math.atan2(-u,r)):(this._x=0,this._y=Math.atan2(o,p));break;case"XZY":this._z=Math.asin(-We(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(f,c),this._y=Math.atan2(o,r)):(this._x=Math.atan2(-h,p),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return ml.makeRotationFromQuaternion(e),this.setFromRotationMatrix(ml,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return gl.setFromEuler(this),this.setFromQuaternion(gl,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}pn.DEFAULT_ORDER="XYZ";class Jc{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}}let Yd=0;const _l=new L,Ai=new It,An=new je,Xs=new L,hs=new L,$d=new L,Kd=new It,xl=new L(1,0,0),Sl=new L(0,1,0),vl=new L(0,0,1),Ml={type:"added"},Zd={type:"removed"},Ri={type:"childadded",child:null},Xr={type:"childremoved",child:null};class dt extends is{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Yd++}),this.uuid=ss(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=dt.DEFAULT_UP.clone();const e=new L,t=new pn,n=new It,s=new L(1,1,1);function r(){n.setFromEuler(t,!1)}function a(){t.setFromQuaternion(n,void 0,!1)}t._onChange(r),n._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new je},normalMatrix:{value:new Be}}),this.matrix=new je,this.matrixWorld=new je,this.matrixAutoUpdate=dt.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=dt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Jc,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return Ai.setFromAxisAngle(e,t),this.quaternion.multiply(Ai),this}rotateOnWorldAxis(e,t){return Ai.setFromAxisAngle(e,t),this.quaternion.premultiply(Ai),this}rotateX(e){return this.rotateOnAxis(xl,e)}rotateY(e){return this.rotateOnAxis(Sl,e)}rotateZ(e){return this.rotateOnAxis(vl,e)}translateOnAxis(e,t){return _l.copy(e).applyQuaternion(this.quaternion),this.position.add(_l.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(xl,e)}translateY(e){return this.translateOnAxis(Sl,e)}translateZ(e){return this.translateOnAxis(vl,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(An.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?Xs.copy(e):Xs.set(e,t,n);const s=this.parent;this.updateWorldMatrix(!0,!1),hs.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?An.lookAt(hs,Xs,this.up):An.lookAt(Xs,hs,this.up),this.quaternion.setFromRotationMatrix(An),s&&(An.extractRotation(s.matrixWorld),Ai.setFromRotationMatrix(An),this.quaternion.premultiply(Ai.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(Ml),Ri.child=e,this.dispatchEvent(Ri),Ri.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}const t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(Zd),Xr.child=e,this.dispatchEvent(Xr),Xr.child=null),this}removeFromParent(){const e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),An.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),An.multiply(e.parent.matrixWorld)),e.applyMatrix4(An),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(Ml),Ri.child=e,this.dispatchEvent(Ri),Ri.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,s=this.children.length;n<s;n++){const a=this.children[n].getObjectByProperty(e,t);if(a!==void 0)return a}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);const s=this.children;for(let r=0,a=s.length;r<a;r++)s[r].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(hs,e,$d),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(hs,Kd,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);const t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);const t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverseVisible(e)}traverseAncestors(e){const t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);const t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t){const n=this.parent;if(e===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),t===!0){const s=this.children;for(let r=0,a=s.length;r<a;r++)s[r].updateWorldMatrix(!1,!0)}}toJSON(e){const t=e===void 0||typeof e=="string",n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});const s={};s.uuid=this.uuid,s.type=this.type,this.name!==""&&(s.name=this.name),this.castShadow===!0&&(s.castShadow=!0),this.receiveShadow===!0&&(s.receiveShadow=!0),this.visible===!1&&(s.visible=!1),this.frustumCulled===!1&&(s.frustumCulled=!1),this.renderOrder!==0&&(s.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(s.matrixAutoUpdate=!1),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.geometryInfo=this._geometryInfo.map(o=>({...o,boundingBox:o.boundingBox?o.boundingBox.toJSON():void 0,boundingSphere:o.boundingSphere?o.boundingSphere.toJSON():void 0})),s.instanceInfo=this._instanceInfo.map(o=>({...o})),s.availableInstanceIds=this._availableInstanceIds.slice(),s.availableGeometryIds=this._availableGeometryIds.slice(),s.nextIndexStart=this._nextIndexStart,s.nextVertexStart=this._nextVertexStart,s.geometryCount=this._geometryCount,s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.matricesTexture=this._matricesTexture.toJSON(e),s.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(s.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(s.boundingBox=this.boundingBox.toJSON()));function r(o,l){return o[l.uuid]===void 0&&(o[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(e.geometries,this.geometry);const o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){const l=o.shapes;if(Array.isArray(l))for(let c=0,h=l.length;c<h;c++){const u=l[c];r(e.shapes,u)}else r(e.shapes,l)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(e.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const o=[];for(let l=0,c=this.material.length;l<c;l++)o.push(r(e.materials,this.material[l]));s.material=o}else s.material=r(e.materials,this.material);if(this.children.length>0){s.children=[];for(let o=0;o<this.children.length;o++)s.children.push(this.children[o].toJSON(e).object)}if(this.animations.length>0){s.animations=[];for(let o=0;o<this.animations.length;o++){const l=this.animations[o];s.animations.push(r(e.animations,l))}}if(t){const o=a(e.geometries),l=a(e.materials),c=a(e.textures),h=a(e.images),u=a(e.shapes),f=a(e.skeletons),p=a(e.animations),g=a(e.nodes);o.length>0&&(n.geometries=o),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),h.length>0&&(n.images=h),u.length>0&&(n.shapes=u),f.length>0&&(n.skeletons=f),p.length>0&&(n.animations=p),g.length>0&&(n.nodes=g)}return n.object=s,n;function a(o){const l=[];for(const c in o){const h=o[c];delete h.metadata,l.push(h)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){const s=e.children[n];this.add(s.clone())}return this}}dt.DEFAULT_UP=new L(0,1,0);dt.DEFAULT_MATRIX_AUTO_UPDATE=!0;dt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const an=new L,Rn=new L,qr=new L,Cn=new L,Ci=new L,Pi=new L,yl=new L,jr=new L,Yr=new L,$r=new L,Kr=new et,Zr=new et,Jr=new et;class un{constructor(e=new L,t=new L,n=new L){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,s){s.subVectors(n,t),an.subVectors(e,t),s.cross(an);const r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(e,t,n,s,r){an.subVectors(s,t),Rn.subVectors(n,t),qr.subVectors(e,t);const a=an.dot(an),o=an.dot(Rn),l=an.dot(qr),c=Rn.dot(Rn),h=Rn.dot(qr),u=a*c-o*o;if(u===0)return r.set(0,0,0),null;const f=1/u,p=(c*l-o*h)*f,g=(a*h-o*l)*f;return r.set(1-p-g,g,p)}static containsPoint(e,t,n,s){return this.getBarycoord(e,t,n,s,Cn)===null?!1:Cn.x>=0&&Cn.y>=0&&Cn.x+Cn.y<=1}static getInterpolation(e,t,n,s,r,a,o,l){return this.getBarycoord(e,t,n,s,Cn)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,Cn.x),l.addScaledVector(a,Cn.y),l.addScaledVector(o,Cn.z),l)}static getInterpolatedAttribute(e,t,n,s,r,a){return Kr.setScalar(0),Zr.setScalar(0),Jr.setScalar(0),Kr.fromBufferAttribute(e,t),Zr.fromBufferAttribute(e,n),Jr.fromBufferAttribute(e,s),a.setScalar(0),a.addScaledVector(Kr,r.x),a.addScaledVector(Zr,r.y),a.addScaledVector(Jr,r.z),a}static isFrontFacing(e,t,n,s){return an.subVectors(n,t),Rn.subVectors(e,t),an.cross(Rn).dot(s)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,s){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[s]),this}setFromAttributeAndIndices(e,t,n,s){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,s),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return an.subVectors(this.c,this.b),Rn.subVectors(this.a,this.b),an.cross(Rn).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return un.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return un.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,n,s,r){return un.getInterpolation(e,this.a,this.b,this.c,t,n,s,r)}containsPoint(e){return un.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return un.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){const n=this.a,s=this.b,r=this.c;let a,o;Ci.subVectors(s,n),Pi.subVectors(r,n),jr.subVectors(e,n);const l=Ci.dot(jr),c=Pi.dot(jr);if(l<=0&&c<=0)return t.copy(n);Yr.subVectors(e,s);const h=Ci.dot(Yr),u=Pi.dot(Yr);if(h>=0&&u<=h)return t.copy(s);const f=l*u-h*c;if(f<=0&&l>=0&&h<=0)return a=l/(l-h),t.copy(n).addScaledVector(Ci,a);$r.subVectors(e,r);const p=Ci.dot($r),g=Pi.dot($r);if(g>=0&&p<=g)return t.copy(r);const _=p*c-l*g;if(_<=0&&c>=0&&g<=0)return o=c/(c-g),t.copy(n).addScaledVector(Pi,o);const m=h*g-p*u;if(m<=0&&u-h>=0&&p-g>=0)return yl.subVectors(r,s),o=(u-h)/(u-h+(p-g)),t.copy(s).addScaledVector(yl,o);const d=1/(m+_+f);return a=_*d,o=f*d,t.copy(n).addScaledVector(Ci,a).addScaledVector(Pi,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}const Qc={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Gn={h:0,s:0,l:0},qs={h:0,s:0,l:0};function Qr(i,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?i+(e-i)*6*t:t<1/2?e:t<2/3?i+(e-i)*6*(2/3-t):i}class Ne{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){const s=e;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=St){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,$e.colorSpaceToWorking(this,t),this}setRGB(e,t,n,s=$e.workingColorSpace){return this.r=e,this.g=t,this.b=n,$e.colorSpaceToWorking(this,s),this}setHSL(e,t,n,s=$e.workingColorSpace){if(e=To(e,1),t=We(t,0,1),n=We(n,0,1),t===0)this.r=this.g=this.b=n;else{const r=n<=.5?n*(1+t):n+t-n*t,a=2*n-r;this.r=Qr(a,r,e+1/3),this.g=Qr(a,r,e),this.b=Qr(a,r,e-1/3)}return $e.colorSpaceToWorking(this,s),this}setStyle(e,t=St){function n(r){r!==void 0&&parseFloat(r)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(e)){let r;const a=s[1],o=s[2];switch(a){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,t);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,t);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,t);break;default:console.warn("THREE.Color: Unknown color model "+e)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(e)){const r=s[1],a=r.length;if(a===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,t);if(a===6)return this.setHex(parseInt(r,16),t);console.warn("THREE.Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=St){const n=Qc[e.toLowerCase()];return n!==void 0?this.setHex(n,t):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=On(e.r),this.g=On(e.g),this.b=On(e.b),this}copyLinearToSRGB(e){return this.r=Ki(e.r),this.g=Ki(e.g),this.b=Ki(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=St){return $e.workingToColorSpace(yt.copy(this),e),Math.round(We(yt.r*255,0,255))*65536+Math.round(We(yt.g*255,0,255))*256+Math.round(We(yt.b*255,0,255))}getHexString(e=St){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=$e.workingColorSpace){$e.workingToColorSpace(yt.copy(this),t);const n=yt.r,s=yt.g,r=yt.b,a=Math.max(n,s,r),o=Math.min(n,s,r);let l,c;const h=(o+a)/2;if(o===a)l=0,c=0;else{const u=a-o;switch(c=h<=.5?u/(a+o):u/(2-a-o),a){case n:l=(s-r)/u+(s<r?6:0);break;case s:l=(r-n)/u+2;break;case r:l=(n-s)/u+4;break}l/=6}return e.h=l,e.s=c,e.l=h,e}getRGB(e,t=$e.workingColorSpace){return $e.workingToColorSpace(yt.copy(this),t),e.r=yt.r,e.g=yt.g,e.b=yt.b,e}getStyle(e=St){$e.workingToColorSpace(yt.copy(this),e);const t=yt.r,n=yt.g,s=yt.b;return e!==St?`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(s*255)})`}offsetHSL(e,t,n){return this.getHSL(Gn),this.setHSL(Gn.h+e,Gn.s+t,Gn.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(Gn),e.getHSL(qs);const n=Ss(Gn.h,qs.h,t),s=Ss(Gn.s,qs.s,t),r=Ss(Gn.l,qs.l,t);return this.setHSL(n,s,r),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){const t=this.r,n=this.g,s=this.b,r=e.elements;return this.r=r[0]*t+r[3]*n+r[6]*s,this.g=r[1]*t+r[4]*n+r[7]*s,this.b=r[2]*t+r[5]*n+r[8]*s,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const yt=new Ne;Ne.NAMES=Qc;let Jd=0;class Si extends is{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Jd++}),this.uuid=ss(),this.name="",this.type="Material",this.blending=$i,this.side=Jn,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=ba,this.blendDst=Ea,this.blendEquation=ui,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Ne(0,0,0),this.blendAlpha=0,this.depthFunc=Zi,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=ol,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Mi,this.stencilZFail=Mi,this.stencilZPass=Mi,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const t in e){const n=e[t];if(n===void 0){console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);continue}const s=this[t];if(s===void 0){console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(n):s&&s.isVector3&&n&&n.isVector3?s.copy(n):this[t]=n}}toJSON(e){const t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});const n={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==$i&&(n.blending=this.blending),this.side!==Jn&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==ba&&(n.blendSrc=this.blendSrc),this.blendDst!==Ea&&(n.blendDst=this.blendDst),this.blendEquation!==ui&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==Zi&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==ol&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==Mi&&(n.stencilFail=this.stencilFail),this.stencilZFail!==Mi&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==Mi&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function s(r){const a=[];for(const o in r){const l=r[o];delete l.metadata,a.push(l)}return a}if(t){const r=s(e.textures),a=s(e.images);r.length>0&&(n.textures=r),a.length>0&&(n.images=a)}return n}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const t=e.clippingPlanes;let n=null;if(t!==null){const s=t.length;n=new Array(s);for(let r=0;r!==s;++r)n[r]=t[r].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}}class Qt extends Si{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Ne(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new pn,this.combine=go,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}const ft=new L,js=new Ge;let Qd=0;class Ot{constructor(e,t,n=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:Qd++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=ll,this.updateRanges=[],this.gpuType=vn,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[e+s]=t.array[n+s];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)js.fromBufferAttribute(this,t),js.applyMatrix3(e),this.setXY(t,js.x,js.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)ft.fromBufferAttribute(this,t),ft.applyMatrix3(e),this.setXYZ(t,ft.x,ft.y,ft.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)ft.fromBufferAttribute(this,t),ft.applyMatrix4(e),this.setXYZ(t,ft.x,ft.y,ft.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)ft.fromBufferAttribute(this,t),ft.applyNormalMatrix(e),this.setXYZ(t,ft.x,ft.y,ft.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)ft.fromBufferAttribute(this,t),ft.transformDirection(e),this.setXYZ(t,ft.x,ft.y,ft.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=Bi(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=At(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=Bi(t,this.array)),t}setX(e,t){return this.normalized&&(t=At(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=Bi(t,this.array)),t}setY(e,t){return this.normalized&&(t=At(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=Bi(t,this.array)),t}setZ(e,t){return this.normalized&&(t=At(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=Bi(t,this.array)),t}setW(e,t){return this.normalized&&(t=At(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=At(t,this.array),n=At(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,s){return e*=this.itemSize,this.normalized&&(t=At(t,this.array),n=At(n,this.array),s=At(s,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this}setXYZW(e,t,n,s,r){return e*=this.itemSize,this.normalized&&(t=At(t,this.array),n=At(n,this.array),s=At(s,this.array),r=At(r,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this.array[e+3]=r,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==ll&&(e.usage=this.usage),e}}class eh extends Ot{constructor(e,t,n){super(new Uint16Array(e),t,n)}}class th extends Ot{constructor(e,t,n){super(new Uint32Array(e),t,n)}}class nt extends Ot{constructor(e,t,n){super(new Float32Array(e),t,n)}}let ef=0;const Zt=new je,ea=new dt,Li=new L,Wt=new _i,us=new _i,_t=new L;class vt extends is{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:ef++}),this.uuid=ss(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new($c(e)?th:eh)(e,1):this.index=e,this}setIndirect(e){return this.indirect=e,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){const t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);const n=this.attributes.normal;if(n!==void 0){const r=new Be().getNormalMatrix(e);n.applyNormalMatrix(r),n.needsUpdate=!0}const s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(e),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return Zt.makeRotationFromQuaternion(e),this.applyMatrix4(Zt),this}rotateX(e){return Zt.makeRotationX(e),this.applyMatrix4(Zt),this}rotateY(e){return Zt.makeRotationY(e),this.applyMatrix4(Zt),this}rotateZ(e){return Zt.makeRotationZ(e),this.applyMatrix4(Zt),this}translate(e,t,n){return Zt.makeTranslation(e,t,n),this.applyMatrix4(Zt),this}scale(e,t,n){return Zt.makeScale(e,t,n),this.applyMatrix4(Zt),this}lookAt(e){return ea.lookAt(e),ea.updateMatrix(),this.applyMatrix4(ea.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Li).negate(),this.translate(Li.x,Li.y,Li.z),this}setFromPoints(e){const t=this.getAttribute("position");if(t===void 0){const n=[];for(let s=0,r=e.length;s<r;s++){const a=e[s];n.push(a.x,a.y,a.z||0)}this.setAttribute("position",new nt(n,3))}else{const n=Math.min(e.length,t.count);for(let s=0;s<n;s++){const r=e[s];t.setXYZ(s,r.x,r.y,r.z||0)}e.length>t.count&&console.warn("THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new _i);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new L(-1/0,-1/0,-1/0),new L(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,s=t.length;n<s;n++){const r=t[n];Wt.setFromBufferAttribute(r),this.morphTargetsRelative?(_t.addVectors(this.boundingBox.min,Wt.min),this.boundingBox.expandByPoint(_t),_t.addVectors(this.boundingBox.max,Wt.max),this.boundingBox.expandByPoint(_t)):(this.boundingBox.expandByPoint(Wt.min),this.boundingBox.expandByPoint(Wt.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new xi);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new L,1/0);return}if(e){const n=this.boundingSphere.center;if(Wt.setFromBufferAttribute(e),t)for(let r=0,a=t.length;r<a;r++){const o=t[r];us.setFromBufferAttribute(o),this.morphTargetsRelative?(_t.addVectors(Wt.min,us.min),Wt.expandByPoint(_t),_t.addVectors(Wt.max,us.max),Wt.expandByPoint(_t)):(Wt.expandByPoint(us.min),Wt.expandByPoint(us.max))}Wt.getCenter(n);let s=0;for(let r=0,a=e.count;r<a;r++)_t.fromBufferAttribute(e,r),s=Math.max(s,n.distanceToSquared(_t));if(t)for(let r=0,a=t.length;r<a;r++){const o=t[r],l=this.morphTargetsRelative;for(let c=0,h=o.count;c<h;c++)_t.fromBufferAttribute(o,c),l&&(Li.fromBufferAttribute(e,c),_t.add(Li)),s=Math.max(s,n.distanceToSquared(_t))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const n=t.position,s=t.normal,r=t.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new Ot(new Float32Array(4*n.count),4));const a=this.getAttribute("tangent"),o=[],l=[];for(let I=0;I<n.count;I++)o[I]=new L,l[I]=new L;const c=new L,h=new L,u=new L,f=new Ge,p=new Ge,g=new Ge,_=new L,m=new L;function d(I,M,v){c.fromBufferAttribute(n,I),h.fromBufferAttribute(n,M),u.fromBufferAttribute(n,v),f.fromBufferAttribute(r,I),p.fromBufferAttribute(r,M),g.fromBufferAttribute(r,v),h.sub(c),u.sub(c),p.sub(f),g.sub(f);const C=1/(p.x*g.y-g.x*p.y);isFinite(C)&&(_.copy(h).multiplyScalar(g.y).addScaledVector(u,-p.y).multiplyScalar(C),m.copy(u).multiplyScalar(p.x).addScaledVector(h,-g.x).multiplyScalar(C),o[I].add(_),o[M].add(_),o[v].add(_),l[I].add(m),l[M].add(m),l[v].add(m))}let b=this.groups;b.length===0&&(b=[{start:0,count:e.count}]);for(let I=0,M=b.length;I<M;++I){const v=b[I],C=v.start,F=v.count;for(let z=C,X=C+F;z<X;z+=3)d(e.getX(z+0),e.getX(z+1),e.getX(z+2))}const E=new L,y=new L,w=new L,A=new L;function P(I){w.fromBufferAttribute(s,I),A.copy(w);const M=o[I];E.copy(M),E.sub(w.multiplyScalar(w.dot(M))).normalize(),y.crossVectors(A,M);const C=y.dot(l[I])<0?-1:1;a.setXYZW(I,E.x,E.y,E.z,C)}for(let I=0,M=b.length;I<M;++I){const v=b[I],C=v.start,F=v.count;for(let z=C,X=C+F;z<X;z+=3)P(e.getX(z+0)),P(e.getX(z+1)),P(e.getX(z+2))}}computeVertexNormals(){const e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0)n=new Ot(new Float32Array(t.count*3),3),this.setAttribute("normal",n);else for(let f=0,p=n.count;f<p;f++)n.setXYZ(f,0,0,0);const s=new L,r=new L,a=new L,o=new L,l=new L,c=new L,h=new L,u=new L;if(e)for(let f=0,p=e.count;f<p;f+=3){const g=e.getX(f+0),_=e.getX(f+1),m=e.getX(f+2);s.fromBufferAttribute(t,g),r.fromBufferAttribute(t,_),a.fromBufferAttribute(t,m),h.subVectors(a,r),u.subVectors(s,r),h.cross(u),o.fromBufferAttribute(n,g),l.fromBufferAttribute(n,_),c.fromBufferAttribute(n,m),o.add(h),l.add(h),c.add(h),n.setXYZ(g,o.x,o.y,o.z),n.setXYZ(_,l.x,l.y,l.z),n.setXYZ(m,c.x,c.y,c.z)}else for(let f=0,p=t.count;f<p;f+=3)s.fromBufferAttribute(t,f+0),r.fromBufferAttribute(t,f+1),a.fromBufferAttribute(t,f+2),h.subVectors(a,r),u.subVectors(s,r),h.cross(u),n.setXYZ(f+0,h.x,h.y,h.z),n.setXYZ(f+1,h.x,h.y,h.z),n.setXYZ(f+2,h.x,h.y,h.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){const e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)_t.fromBufferAttribute(e,t),_t.normalize(),e.setXYZ(t,_t.x,_t.y,_t.z)}toNonIndexed(){function e(o,l){const c=o.array,h=o.itemSize,u=o.normalized,f=new c.constructor(l.length*h);let p=0,g=0;for(let _=0,m=l.length;_<m;_++){o.isInterleavedBufferAttribute?p=l[_]*o.data.stride+o.offset:p=l[_]*h;for(let d=0;d<h;d++)f[g++]=c[p++]}return new Ot(f,h,u)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const t=new vt,n=this.index.array,s=this.attributes;for(const o in s){const l=s[o],c=e(l,n);t.setAttribute(o,c)}const r=this.morphAttributes;for(const o in r){const l=[],c=r[o];for(let h=0,u=c.length;h<u;h++){const f=c[h],p=e(f,n);l.push(p)}t.morphAttributes[o]=l}t.morphTargetsRelative=this.morphTargetsRelative;const a=this.groups;for(let o=0,l=a.length;o<l;o++){const c=a[o];t.addGroup(c.start,c.count,c.materialIndex)}return t}toJSON(){const e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){const l=this.parameters;for(const c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};const t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});const n=this.attributes;for(const l in n){const c=n[l];e.data.attributes[l]=c.toJSON(e.data)}const s={};let r=!1;for(const l in this.morphAttributes){const c=this.morphAttributes[l],h=[];for(let u=0,f=c.length;u<f;u++){const p=c[u];h.push(p.toJSON(e.data))}h.length>0&&(s[l]=h,r=!0)}r&&(e.data.morphAttributes=s,e.data.morphTargetsRelative=this.morphTargetsRelative);const a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));const o=this.boundingSphere;return o!==null&&(e.data.boundingSphere=o.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const t={};this.name=e.name;const n=e.index;n!==null&&this.setIndex(n.clone());const s=e.attributes;for(const c in s){const h=s[c];this.setAttribute(c,h.clone(t))}const r=e.morphAttributes;for(const c in r){const h=[],u=r[c];for(let f=0,p=u.length;f<p;f++)h.push(u[f].clone(t));this.morphAttributes[c]=h}this.morphTargetsRelative=e.morphTargetsRelative;const a=e.groups;for(let c=0,h=a.length;c<h;c++){const u=a[c];this.addGroup(u.start,u.count,u.materialIndex)}const o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());const l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}const bl=new je,ri=new Zc,Ys=new xi,El=new L,$s=new L,Ks=new L,Zs=new L,ta=new L,Js=new L,Tl=new L,Qs=new L;class ht extends dt{constructor(e=new vt,t=new Qt){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){const o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}getVertexPosition(e,t){const n=this.geometry,s=n.attributes.position,r=n.morphAttributes.position,a=n.morphTargetsRelative;t.fromBufferAttribute(s,e);const o=this.morphTargetInfluences;if(r&&o){Js.set(0,0,0);for(let l=0,c=r.length;l<c;l++){const h=o[l],u=r[l];h!==0&&(ta.fromBufferAttribute(u,e),a?Js.addScaledVector(ta,h):Js.addScaledVector(ta.sub(t),h))}t.add(Js)}return t}raycast(e,t){const n=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),Ys.copy(n.boundingSphere),Ys.applyMatrix4(r),ri.copy(e.ray).recast(e.near),!(Ys.containsPoint(ri.origin)===!1&&(ri.intersectSphere(Ys,El)===null||ri.origin.distanceToSquared(El)>(e.far-e.near)**2))&&(bl.copy(r).invert(),ri.copy(e.ray).applyMatrix4(bl),!(n.boundingBox!==null&&ri.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(e,t,ri)))}_computeIntersections(e,t,n){let s;const r=this.geometry,a=this.material,o=r.index,l=r.attributes.position,c=r.attributes.uv,h=r.attributes.uv1,u=r.attributes.normal,f=r.groups,p=r.drawRange;if(o!==null)if(Array.isArray(a))for(let g=0,_=f.length;g<_;g++){const m=f[g],d=a[m.materialIndex],b=Math.max(m.start,p.start),E=Math.min(o.count,Math.min(m.start+m.count,p.start+p.count));for(let y=b,w=E;y<w;y+=3){const A=o.getX(y),P=o.getX(y+1),I=o.getX(y+2);s=er(this,d,e,n,c,h,u,A,P,I),s&&(s.faceIndex=Math.floor(y/3),s.face.materialIndex=m.materialIndex,t.push(s))}}else{const g=Math.max(0,p.start),_=Math.min(o.count,p.start+p.count);for(let m=g,d=_;m<d;m+=3){const b=o.getX(m),E=o.getX(m+1),y=o.getX(m+2);s=er(this,a,e,n,c,h,u,b,E,y),s&&(s.faceIndex=Math.floor(m/3),t.push(s))}}else if(l!==void 0)if(Array.isArray(a))for(let g=0,_=f.length;g<_;g++){const m=f[g],d=a[m.materialIndex],b=Math.max(m.start,p.start),E=Math.min(l.count,Math.min(m.start+m.count,p.start+p.count));for(let y=b,w=E;y<w;y+=3){const A=y,P=y+1,I=y+2;s=er(this,d,e,n,c,h,u,A,P,I),s&&(s.faceIndex=Math.floor(y/3),s.face.materialIndex=m.materialIndex,t.push(s))}}else{const g=Math.max(0,p.start),_=Math.min(l.count,p.start+p.count);for(let m=g,d=_;m<d;m+=3){const b=m,E=m+1,y=m+2;s=er(this,a,e,n,c,h,u,b,E,y),s&&(s.faceIndex=Math.floor(m/3),t.push(s))}}}}function tf(i,e,t,n,s,r,a,o){let l;if(e.side===Nt?l=n.intersectTriangle(a,r,s,!0,o):l=n.intersectTriangle(s,r,a,e.side===Jn,o),l===null)return null;Qs.copy(o),Qs.applyMatrix4(i.matrixWorld);const c=t.ray.origin.distanceTo(Qs);return c<t.near||c>t.far?null:{distance:c,point:Qs.clone(),object:i}}function er(i,e,t,n,s,r,a,o,l,c){i.getVertexPosition(o,$s),i.getVertexPosition(l,Ks),i.getVertexPosition(c,Zs);const h=tf(i,e,t,n,$s,Ks,Zs,Tl);if(h){const u=new L;un.getBarycoord(Tl,$s,Ks,Zs,u),s&&(h.uv=un.getInterpolatedAttribute(s,o,l,c,u,new Ge)),r&&(h.uv1=un.getInterpolatedAttribute(r,o,l,c,u,new Ge)),a&&(h.normal=un.getInterpolatedAttribute(a,o,l,c,u,new L),h.normal.dot(n.direction)>0&&h.normal.multiplyScalar(-1));const f={a:o,b:l,c,normal:new L,materialIndex:0};un.getNormal($s,Ks,Zs,f.normal),h.face=f,h.barycoord=u}return h}class ut extends vt{constructor(e=1,t=1,n=1,s=1,r=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:s,heightSegments:r,depthSegments:a};const o=this;s=Math.floor(s),r=Math.floor(r),a=Math.floor(a);const l=[],c=[],h=[],u=[];let f=0,p=0;g("z","y","x",-1,-1,n,t,e,a,r,0),g("z","y","x",1,-1,n,t,-e,a,r,1),g("x","z","y",1,1,e,n,t,s,a,2),g("x","z","y",1,-1,e,n,-t,s,a,3),g("x","y","z",1,-1,e,t,n,s,r,4),g("x","y","z",-1,-1,e,t,-n,s,r,5),this.setIndex(l),this.setAttribute("position",new nt(c,3)),this.setAttribute("normal",new nt(h,3)),this.setAttribute("uv",new nt(u,2));function g(_,m,d,b,E,y,w,A,P,I,M){const v=y/P,C=w/I,F=y/2,z=w/2,X=A/2,V=P+1,G=I+1;let $=0,B=0;const ie=new L;for(let re=0;re<G;re++){const _e=re*C-z;for(let Ie=0;Ie<V;Ie++){const He=Ie*v-F;ie[_]=He*b,ie[m]=_e*E,ie[d]=X,c.push(ie.x,ie.y,ie.z),ie[_]=0,ie[m]=0,ie[d]=A>0?1:-1,h.push(ie.x,ie.y,ie.z),u.push(Ie/P),u.push(1-re/I),$+=1}}for(let re=0;re<I;re++)for(let _e=0;_e<P;_e++){const Ie=f+_e+V*re,He=f+_e+V*(re+1),Xe=f+(_e+1)+V*(re+1),Oe=f+(_e+1)+V*re;l.push(Ie,He,Oe),l.push(He,Xe,Oe),B+=6}o.addGroup(p,B,M),p+=B,f+=$}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new ut(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}function ns(i){const e={};for(const t in i){e[t]={};for(const n in i[t]){const s=i[t][n];s&&(s.isColor||s.isMatrix3||s.isMatrix4||s.isVector2||s.isVector3||s.isVector4||s.isTexture||s.isQuaternion)?s.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][n]=null):e[t][n]=s.clone():Array.isArray(s)?e[t][n]=s.slice():e[t][n]=s}}return e}function Rt(i){const e={};for(let t=0;t<i.length;t++){const n=ns(i[t]);for(const s in n)e[s]=n[s]}return e}function nf(i){const e=[];for(let t=0;t<i.length;t++)e.push(i[t].clone());return e}function nh(i){const e=i.getRenderTarget();return e===null?i.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:$e.workingColorSpace}const sf={clone:ns,merge:Rt};var rf=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,af=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class ei extends Si{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=rf,this.fragmentShader=af,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=ns(e.uniforms),this.uniformsGroups=nf(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){const t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(const s in this.uniforms){const a=this.uniforms[s].value;a&&a.isTexture?t.uniforms[s]={type:"t",value:a.toJSON(e).uuid}:a&&a.isColor?t.uniforms[s]={type:"c",value:a.getHex()}:a&&a.isVector2?t.uniforms[s]={type:"v2",value:a.toArray()}:a&&a.isVector3?t.uniforms[s]={type:"v3",value:a.toArray()}:a&&a.isVector4?t.uniforms[s]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?t.uniforms[s]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?t.uniforms[s]={type:"m4",value:a.toArray()}:t.uniforms[s]={value:a}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;const n={};for(const s in this.extensions)this.extensions[s]===!0&&(n[s]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}}class Ao extends dt{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new je,this.projectionMatrix=new je,this.projectionMatrixInverse=new je,this.coordinateSystem=Mn,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}const Vn=new L,wl=new Ge,Al=new Ge;class zt extends Ao{constructor(e=50,t=1,n=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=s,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const t=.5*this.getFilmHeight()/e;this.fov=ts*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan(xs*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return ts*2*Math.atan(Math.tan(xs*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){Vn.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(Vn.x,Vn.y).multiplyScalar(-e/Vn.z),Vn.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(Vn.x,Vn.y).multiplyScalar(-e/Vn.z)}getViewSize(e,t){return this.getViewBounds(e,wl,Al),t.subVectors(Al,wl)}setViewOffset(e,t,n,s,r,a){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let t=e*Math.tan(xs*.5*this.fov)/this.zoom,n=2*t,s=this.aspect*n,r=-.5*s;const a=this.view;if(this.view!==null&&this.view.enabled){const l=a.fullWidth,c=a.fullHeight;r+=a.offsetX*s/l,t-=a.offsetY*n/c,s*=a.width/l,n*=a.height/c}const o=this.filmOffset;o!==0&&(r+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,t,t-n,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}}const Di=-90,Ii=1;class of extends dt{constructor(e,t,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;const s=new zt(Di,Ii,e,t);s.layers=this.layers,this.add(s);const r=new zt(Di,Ii,e,t);r.layers=this.layers,this.add(r);const a=new zt(Di,Ii,e,t);a.layers=this.layers,this.add(a);const o=new zt(Di,Ii,e,t);o.layers=this.layers,this.add(o);const l=new zt(Di,Ii,e,t);l.layers=this.layers,this.add(l);const c=new zt(Di,Ii,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){const e=this.coordinateSystem,t=this.children.concat(),[n,s,r,a,o,l]=t;for(const c of t)this.remove(c);if(e===Mn)n.up.set(0,1,0),n.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===yr)n.up.set(0,-1,0),n.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(const c of t)this.add(c),c.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();const{renderTarget:n,activeMipmapLevel:s}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());const[r,a,o,l,c,h]=this.children,u=e.getRenderTarget(),f=e.getActiveCubeFace(),p=e.getActiveMipmapLevel(),g=e.xr.enabled;e.xr.enabled=!1;const _=n.texture.generateMipmaps;n.texture.generateMipmaps=!1,e.setRenderTarget(n,0,s),e.render(t,r),e.setRenderTarget(n,1,s),e.render(t,a),e.setRenderTarget(n,2,s),e.render(t,o),e.setRenderTarget(n,3,s),e.render(t,l),e.setRenderTarget(n,4,s),e.render(t,c),n.texture.generateMipmaps=_,e.setRenderTarget(n,5,s),e.render(t,h),e.setRenderTarget(u,f,p),e.xr.enabled=g,n.texture.needsPMREMUpdate=!0}}class ih extends bt{constructor(e=[],t=Ji,n,s,r,a,o,l,c,h){super(e,t,n,s,r,a,o,l,c,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}}class lf extends Qn{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;const n={width:e,height:e,depth:1},s=[n,n,n,n,n,n];this.texture=new ih(s),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;const n={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},s=new ut(5,5,5),r=new ei({name:"CubemapFromEquirect",uniforms:ns(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:Nt,blending:Kn});r.uniforms.tEquirect.value=t;const a=new ht(s,r),o=t.minFilter;return t.minFilter===fi&&(t.minFilter=tn),new of(1,10,this).update(e,a),t.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(e,t=!0,n=!0,s=!0){const r=e.getRenderTarget();for(let a=0;a<6;a++)e.setRenderTarget(this,a),e.clear(t,n,s);e.setRenderTarget(r)}}class nn extends dt{constructor(){super(),this.isGroup=!0,this.type="Group"}}const cf={type:"move"};class na{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new nn,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new nn,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new L,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new L),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new nn,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new L,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new L),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){const t=this._hand;if(t)for(const n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let s=null,r=null,a=null;const o=this._targetRay,l=this._grip,c=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(c&&e.hand){a=!0;for(const _ of e.hand.values()){const m=t.getJointPose(_,n),d=this._getHandJoint(c,_);m!==null&&(d.matrix.fromArray(m.transform.matrix),d.matrix.decompose(d.position,d.rotation,d.scale),d.matrixWorldNeedsUpdate=!0,d.jointRadius=m.radius),d.visible=m!==null}const h=c.joints["index-finger-tip"],u=c.joints["thumb-tip"],f=h.position.distanceTo(u.position),p=.02,g=.005;c.inputState.pinching&&f>p+g?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&f<=p-g&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(r=t.getPose(e.gripSpace,n),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1));o!==null&&(s=t.getPose(e.targetRaySpace,n),s===null&&r!==null&&(s=r),s!==null&&(o.matrix.fromArray(s.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,s.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(s.linearVelocity)):o.hasLinearVelocity=!1,s.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(s.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(cf)))}return o!==null&&(o.visible=s!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){const n=new nn;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}}class Ro{constructor(e,t=1,n=1e3){this.isFog=!0,this.name="",this.color=new Ne(e),this.near=t,this.far=n}clone(){return new Ro(this.color,this.near,this.far)}toJSON(){return{type:"Fog",name:this.name,color:this.color.getHex(),near:this.near,far:this.far}}}class Co extends dt{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new pn,this.environmentIntensity=1,this.environmentRotation=new pn,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){const t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}}class hf extends bt{constructor(e=null,t=1,n=1,s,r,a,o,l,c=jt,h=jt,u,f){super(null,a,o,l,c,h,s,r,u,f),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class Rl extends Ot{constructor(e,t,n,s=1){super(e,t,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=s}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){const e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}}const Oi=new je,Cl=new je,tr=[],Pl=new _i,uf=new je,ds=new ht,fs=new xi;class Pt extends ht{constructor(e,t,n){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new Rl(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let s=0;s<n;s++)this.setMatrixAt(s,uf)}computeBoundingBox(){const e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new _i),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,Oi),Pl.copy(e.boundingBox).applyMatrix4(Oi),this.boundingBox.union(Pl)}computeBoundingSphere(){const e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new xi),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,Oi),fs.copy(e.boundingSphere).applyMatrix4(Oi),this.boundingSphere.union(fs)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.morphTexture!==null&&(this.morphTexture=e.morphTexture.clone()),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,t){t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){const n=t.morphTargetInfluences,s=this.morphTexture.source.data.data,r=n.length+1,a=e*r+1;for(let o=0;o<n.length;o++)n[o]=s[a+o]}raycast(e,t){const n=this.matrixWorld,s=this.count;if(ds.geometry=this.geometry,ds.material=this.material,ds.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),fs.copy(this.boundingSphere),fs.applyMatrix4(n),e.ray.intersectsSphere(fs)!==!1))for(let r=0;r<s;r++){this.getMatrixAt(r,Oi),Cl.multiplyMatrices(n,Oi),ds.matrixWorld=Cl,ds.raycast(e,tr);for(let a=0,o=tr.length;a<o;a++){const l=tr[a];l.instanceId=r,l.object=this,t.push(l)}tr.length=0}}setColorAt(e,t){this.instanceColor===null&&(this.instanceColor=new Rl(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3)}setMatrixAt(e,t){t.toArray(this.instanceMatrix.array,e*16)}setMorphAt(e,t){const n=t.morphTargetInfluences,s=n.length+1;this.morphTexture===null&&(this.morphTexture=new hf(new Float32Array(s*this.count),s,this.count,vo,vn));const r=this.morphTexture.source.data.data;let a=0;for(let c=0;c<n.length;c++)a+=n[c];const o=this.geometry.morphTargetsRelative?1:1-a,l=s*e;r[l]=o,r.set(n,l+1)}updateMorphTargets(){}dispose(){this.dispatchEvent({type:"dispose"}),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}}const ia=new L,df=new L,ff=new Be;class ci{constructor(e=new L(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,s){return this.normal.set(e,t,n),this.constant=s,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){const s=ia.subVectors(n,t).cross(df.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(s,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){const n=e.delta(ia),s=this.normal.dot(n);if(s===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;const r=-(e.start.dot(this.normal)+this.constant)/s;return r<0||r>1?null:t.copy(e.start).addScaledVector(n,r)}intersectsLine(e){const t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){const n=t||ff.getNormalMatrix(e),s=this.coplanarPoint(ia).applyMatrix4(e),r=this.normal.applyMatrix3(n).normalize();return this.constant=-s.dot(r),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}}const ai=new xi,pf=new Ge(.5,.5),nr=new L;class Po{constructor(e=new ci,t=new ci,n=new ci,s=new ci,r=new ci,a=new ci){this.planes=[e,t,n,s,r,a]}set(e,t,n,s,r,a){const o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(n),o[3].copy(s),o[4].copy(r),o[5].copy(a),this}copy(e){const t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=Mn,n=!1){const s=this.planes,r=e.elements,a=r[0],o=r[1],l=r[2],c=r[3],h=r[4],u=r[5],f=r[6],p=r[7],g=r[8],_=r[9],m=r[10],d=r[11],b=r[12],E=r[13],y=r[14],w=r[15];if(s[0].setComponents(c-a,p-h,d-g,w-b).normalize(),s[1].setComponents(c+a,p+h,d+g,w+b).normalize(),s[2].setComponents(c+o,p+u,d+_,w+E).normalize(),s[3].setComponents(c-o,p-u,d-_,w-E).normalize(),n)s[4].setComponents(l,f,m,y).normalize(),s[5].setComponents(c-l,p-f,d-m,w-y).normalize();else if(s[4].setComponents(c-l,p-f,d-m,w-y).normalize(),t===Mn)s[5].setComponents(c+l,p+f,d+m,w+y).normalize();else if(t===yr)s[5].setComponents(l,f,m,y).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),ai.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{const t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),ai.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(ai)}intersectsSprite(e){ai.center.set(0,0,0);const t=pf.distanceTo(e.center);return ai.radius=.7071067811865476+t,ai.applyMatrix4(e.matrixWorld),this.intersectsSphere(ai)}intersectsSphere(e){const t=this.planes,n=e.center,s=-e.radius;for(let r=0;r<6;r++)if(t[r].distanceToPoint(n)<s)return!1;return!0}intersectsBox(e){const t=this.planes;for(let n=0;n<6;n++){const s=t[n];if(nr.x=s.normal.x>0?e.max.x:e.min.x,nr.y=s.normal.y>0?e.max.y:e.min.y,nr.z=s.normal.z>0?e.max.z:e.min.z,s.distanceToPoint(nr)<0)return!1}return!0}containsPoint(e){const t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}class co extends Si{constructor(e){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new Ne(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}}const Er=new L,Tr=new L,Ll=new je,ps=new Zc,ir=new xi,sa=new L,Dl=new L;class mf extends dt{constructor(e=new vt,t=new co){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,n=[0];for(let s=1,r=t.count;s<r;s++)Er.fromBufferAttribute(t,s-1),Tr.fromBufferAttribute(t,s),n[s]=n[s-1],n[s]+=Er.distanceTo(Tr);e.setAttribute("lineDistance",new nt(n,1))}else console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(e,t){const n=this.geometry,s=this.matrixWorld,r=e.params.Line.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),ir.copy(n.boundingSphere),ir.applyMatrix4(s),ir.radius+=r,e.ray.intersectsSphere(ir)===!1)return;Ll.copy(s).invert(),ps.copy(e.ray).applyMatrix4(Ll);const o=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=o*o,c=this.isLineSegments?2:1,h=n.index,f=n.attributes.position;if(h!==null){const p=Math.max(0,a.start),g=Math.min(h.count,a.start+a.count);for(let _=p,m=g-1;_<m;_+=c){const d=h.getX(_),b=h.getX(_+1),E=sr(this,e,ps,l,d,b,_);E&&t.push(E)}if(this.isLineLoop){const _=h.getX(g-1),m=h.getX(p),d=sr(this,e,ps,l,_,m,g-1);d&&t.push(d)}}else{const p=Math.max(0,a.start),g=Math.min(f.count,a.start+a.count);for(let _=p,m=g-1;_<m;_+=c){const d=sr(this,e,ps,l,_,_+1,_);d&&t.push(d)}if(this.isLineLoop){const _=sr(this,e,ps,l,g-1,p,g-1);_&&t.push(_)}}}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){const o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}}function sr(i,e,t,n,s,r,a){const o=i.geometry.attributes.position;if(Er.fromBufferAttribute(o,s),Tr.fromBufferAttribute(o,r),t.distanceSqToSegment(Er,Tr,sa,Dl)>n)return;sa.applyMatrix4(i.matrixWorld);const c=e.ray.origin.distanceTo(sa);if(!(c<e.near||c>e.far))return{distance:c,point:Dl.clone().applyMatrix4(i.matrixWorld),index:a,face:null,faceIndex:null,barycoord:null,object:i}}const Il=new L,Ol=new L;class Nl extends mf{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,n=[];for(let s=0,r=t.count;s<r;s+=2)Il.fromBufferAttribute(t,s),Ol.fromBufferAttribute(t,s+1),n[s]=s===0?0:n[s-1],n[s+1]=n[s]+Il.distanceTo(Ol);e.setAttribute("lineDistance",new nt(n,1))}else console.warn("THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}}class gf extends bt{constructor(e,t,n,s,r,a,o,l,c){super(e,t,n,s,r,a,o,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}}class sh extends bt{constructor(e,t,n=gi,s,r,a,o=jt,l=jt,c,h=bs,u=1){if(h!==bs&&h!==Es)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");const f={width:e,height:t,depth:u};super(f,s,r,a,o,l,h,n,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new wo(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){const t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}}class rh extends bt{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}}class jn extends vt{constructor(e=1,t=1,n=4,s=8,r=1){super(),this.type="CapsuleGeometry",this.parameters={radius:e,height:t,capSegments:n,radialSegments:s,heightSegments:r},t=Math.max(0,t),n=Math.max(1,Math.floor(n)),s=Math.max(3,Math.floor(s)),r=Math.max(1,Math.floor(r));const a=[],o=[],l=[],c=[],h=t/2,u=Math.PI/2*e,f=t,p=2*u+f,g=n*2+r,_=s+1,m=new L,d=new L;for(let b=0;b<=g;b++){let E=0,y=0,w=0,A=0;if(b<=n){const M=b/n,v=M*Math.PI/2;y=-h-e*Math.cos(v),w=e*Math.sin(v),A=-e*Math.cos(v),E=M*u}else if(b<=n+r){const M=(b-n)/r;y=-h+M*t,w=e,A=0,E=u+M*f}else{const M=(b-n-r)/n,v=M*Math.PI/2;y=h+e*Math.sin(v),w=e*Math.cos(v),A=e*Math.sin(v),E=u+f+M*u}const P=Math.max(0,Math.min(1,E/p));let I=0;b===0?I=.5/s:b===g&&(I=-.5/s);for(let M=0;M<=s;M++){const v=M/s,C=v*Math.PI*2,F=Math.sin(C),z=Math.cos(C);d.x=-w*z,d.y=y,d.z=w*F,o.push(d.x,d.y,d.z),m.set(-w*z,A,w*F),m.normalize(),l.push(m.x,m.y,m.z),c.push(v+I,P)}if(b>0){const M=(b-1)*_;for(let v=0;v<s;v++){const C=M+v,F=M+v+1,z=b*_+v,X=b*_+v+1;a.push(C,F,z),a.push(F,X,z)}}}this.setIndex(a),this.setAttribute("position",new nt(o,3)),this.setAttribute("normal",new nt(l,3)),this.setAttribute("uv",new nt(c,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new jn(e.radius,e.height,e.capSegments,e.radialSegments,e.heightSegments)}}class Lo extends vt{constructor(e=1,t=32,n=0,s=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:e,segments:t,thetaStart:n,thetaLength:s},t=Math.max(3,t);const r=[],a=[],o=[],l=[],c=new L,h=new Ge;a.push(0,0,0),o.push(0,0,1),l.push(.5,.5);for(let u=0,f=3;u<=t;u++,f+=3){const p=n+u/t*s;c.x=e*Math.cos(p),c.y=e*Math.sin(p),a.push(c.x,c.y,c.z),o.push(0,0,1),h.x=(a[f]/e+1)/2,h.y=(a[f+1]/e+1)/2,l.push(h.x,h.y)}for(let u=1;u<=t;u++)r.push(u,u+1,0);this.setIndex(r),this.setAttribute("position",new nt(a,3)),this.setAttribute("normal",new nt(o,3)),this.setAttribute("uv",new nt(l,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Lo(e.radius,e.segments,e.thetaStart,e.thetaLength)}}class yn extends vt{constructor(e=1,t=1,n=1,s=32,r=1,a=!1,o=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:n,radialSegments:s,heightSegments:r,openEnded:a,thetaStart:o,thetaLength:l};const c=this;s=Math.floor(s),r=Math.floor(r);const h=[],u=[],f=[],p=[];let g=0;const _=[],m=n/2;let d=0;b(),a===!1&&(e>0&&E(!0),t>0&&E(!1)),this.setIndex(h),this.setAttribute("position",new nt(u,3)),this.setAttribute("normal",new nt(f,3)),this.setAttribute("uv",new nt(p,2));function b(){const y=new L,w=new L;let A=0;const P=(t-e)/n;for(let I=0;I<=r;I++){const M=[],v=I/r,C=v*(t-e)+e;for(let F=0;F<=s;F++){const z=F/s,X=z*l+o,V=Math.sin(X),G=Math.cos(X);w.x=C*V,w.y=-v*n+m,w.z=C*G,u.push(w.x,w.y,w.z),y.set(V,P,G).normalize(),f.push(y.x,y.y,y.z),p.push(z,1-v),M.push(g++)}_.push(M)}for(let I=0;I<s;I++)for(let M=0;M<r;M++){const v=_[M][I],C=_[M+1][I],F=_[M+1][I+1],z=_[M][I+1];(e>0||M!==0)&&(h.push(v,C,z),A+=3),(t>0||M!==r-1)&&(h.push(C,F,z),A+=3)}c.addGroup(d,A,0),d+=A}function E(y){const w=g,A=new Ge,P=new L;let I=0;const M=y===!0?e:t,v=y===!0?1:-1;for(let F=1;F<=s;F++)u.push(0,m*v,0),f.push(0,v,0),p.push(.5,.5),g++;const C=g;for(let F=0;F<=s;F++){const X=F/s*l+o,V=Math.cos(X),G=Math.sin(X);P.x=M*G,P.y=m*v,P.z=M*V,u.push(P.x,P.y,P.z),f.push(0,v,0),A.x=V*.5+.5,A.y=G*.5*v+.5,p.push(A.x,A.y),g++}for(let F=0;F<s;F++){const z=w+F,X=C+F;y===!0?h.push(X,X+1,z):h.push(X+1,X,z),I+=3}c.addGroup(d,I,y===!0?1:2),d+=I}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new yn(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}class Cr extends yn{constructor(e=1,t=1,n=32,s=1,r=!1,a=0,o=Math.PI*2){super(0,e,t,n,s,r,a,o),this.type="ConeGeometry",this.parameters={radius:e,height:t,radialSegments:n,heightSegments:s,openEnded:r,thetaStart:a,thetaLength:o}}static fromJSON(e){return new Cr(e.radius,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}class Lt extends vt{constructor(e=1,t=1,n=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:s};const r=e/2,a=t/2,o=Math.floor(n),l=Math.floor(s),c=o+1,h=l+1,u=e/o,f=t/l,p=[],g=[],_=[],m=[];for(let d=0;d<h;d++){const b=d*f-a;for(let E=0;E<c;E++){const y=E*u-r;g.push(y,-b,0),_.push(0,0,1),m.push(E/o),m.push(1-d/l)}}for(let d=0;d<l;d++)for(let b=0;b<o;b++){const E=b+c*d,y=b+c*(d+1),w=b+1+c*(d+1),A=b+1+c*d;p.push(E,y,A),p.push(y,w,A)}this.setIndex(p),this.setAttribute("position",new nt(g,3)),this.setAttribute("normal",new nt(_,3)),this.setAttribute("uv",new nt(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Lt(e.width,e.height,e.widthSegments,e.heightSegments)}}class Do extends vt{constructor(e=.5,t=1,n=32,s=1,r=0,a=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:e,outerRadius:t,thetaSegments:n,phiSegments:s,thetaStart:r,thetaLength:a},n=Math.max(3,n),s=Math.max(1,s);const o=[],l=[],c=[],h=[];let u=e;const f=(t-e)/s,p=new L,g=new Ge;for(let _=0;_<=s;_++){for(let m=0;m<=n;m++){const d=r+m/n*a;p.x=u*Math.cos(d),p.y=u*Math.sin(d),l.push(p.x,p.y,p.z),c.push(0,0,1),g.x=(p.x/t+1)/2,g.y=(p.y/t+1)/2,h.push(g.x,g.y)}u+=f}for(let _=0;_<s;_++){const m=_*(n+1);for(let d=0;d<n;d++){const b=d+m,E=b,y=b+n+1,w=b+n+2,A=b+1;o.push(E,y,A),o.push(y,w,A)}}this.setIndex(o),this.setAttribute("position",new nt(l,3)),this.setAttribute("normal",new nt(c,3)),this.setAttribute("uv",new nt(h,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Do(e.innerRadius,e.outerRadius,e.thetaSegments,e.phiSegments,e.thetaStart,e.thetaLength)}}class ln extends vt{constructor(e=1,t=32,n=16,s=0,r=Math.PI*2,a=0,o=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:n,phiStart:s,phiLength:r,thetaStart:a,thetaLength:o},t=Math.max(3,Math.floor(t)),n=Math.max(2,Math.floor(n));const l=Math.min(a+o,Math.PI);let c=0;const h=[],u=new L,f=new L,p=[],g=[],_=[],m=[];for(let d=0;d<=n;d++){const b=[],E=d/n;let y=0;d===0&&a===0?y=.5/t:d===n&&l===Math.PI&&(y=-.5/t);for(let w=0;w<=t;w++){const A=w/t;u.x=-e*Math.cos(s+A*r)*Math.sin(a+E*o),u.y=e*Math.cos(a+E*o),u.z=e*Math.sin(s+A*r)*Math.sin(a+E*o),g.push(u.x,u.y,u.z),f.copy(u).normalize(),_.push(f.x,f.y,f.z),m.push(A+y,1-E),b.push(c++)}h.push(b)}for(let d=0;d<n;d++)for(let b=0;b<t;b++){const E=h[d][b+1],y=h[d][b],w=h[d+1][b],A=h[d+1][b+1];(d!==0||a>0)&&p.push(E,y,A),(d!==n-1||l<Math.PI)&&p.push(y,w,A)}this.setIndex(p),this.setAttribute("position",new nt(g,3)),this.setAttribute("normal",new nt(_,3)),this.setAttribute("uv",new nt(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new ln(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}}class Io extends vt{constructor(e=1,t=.4,n=12,s=48,r=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:e,tube:t,radialSegments:n,tubularSegments:s,arc:r},n=Math.floor(n),s=Math.floor(s);const a=[],o=[],l=[],c=[],h=new L,u=new L,f=new L;for(let p=0;p<=n;p++)for(let g=0;g<=s;g++){const _=g/s*r,m=p/n*Math.PI*2;u.x=(e+t*Math.cos(m))*Math.cos(_),u.y=(e+t*Math.cos(m))*Math.sin(_),u.z=t*Math.sin(m),o.push(u.x,u.y,u.z),h.x=e*Math.cos(_),h.y=e*Math.sin(_),f.subVectors(u,h).normalize(),l.push(f.x,f.y,f.z),c.push(g/s),c.push(p/n)}for(let p=1;p<=n;p++)for(let g=1;g<=s;g++){const _=(s+1)*p+g-1,m=(s+1)*(p-1)+g-1,d=(s+1)*(p-1)+g,b=(s+1)*p+g;a.push(_,m,b),a.push(m,d,b)}this.setIndex(a),this.setAttribute("position",new nt(o,3)),this.setAttribute("normal",new nt(l,3)),this.setAttribute("uv",new nt(c,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Io(e.radius,e.tube,e.radialSegments,e.tubularSegments,e.arc)}}class pi extends Si{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new Ne(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Ne(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Eo,this.normalScale=new Ge(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new pn,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class qn extends Si{constructor(e){super(),this.isMeshLambertMaterial=!0,this.type="MeshLambertMaterial",this.color=new Ne(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Ne(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Eo,this.normalScale=new Ge(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new pn,this.combine=go,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class _f extends Si{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=hd,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}}class xf extends Si{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}}class Cs extends dt{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new Ne(e),this.intensity=t}dispose(){}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){const t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,this.groundColor!==void 0&&(t.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(t.object.distance=this.distance),this.angle!==void 0&&(t.object.angle=this.angle),this.decay!==void 0&&(t.object.decay=this.decay),this.penumbra!==void 0&&(t.object.penumbra=this.penumbra),this.shadow!==void 0&&(t.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(t.object.target=this.target.uuid),t}}class Sf extends Cs{constructor(e,t,n){super(e,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(dt.DEFAULT_UP),this.updateMatrix(),this.groundColor=new Ne(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}}const ra=new je,Fl=new L,Ul=new L;class Oo{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new Ge(512,512),this.mapType=bn,this.map=null,this.mapPass=null,this.matrix=new je,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Po,this._frameExtents=new Ge(1,1),this._viewportCount=1,this._viewports=[new et(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){const t=this.camera,n=this.matrix;Fl.setFromMatrixPosition(e.matrixWorld),t.position.copy(Fl),Ul.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(Ul),t.updateMatrixWorld(),ra.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(ra,t.coordinateSystem,t.reversedDepth),t.reversedDepth?n.set(.5,0,0,.5,0,.5,0,.5,0,0,1,0,0,0,0,1):n.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),n.multiply(ra)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){const e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}}class vf extends Oo{constructor(){super(new zt(50,1,.5,500)),this.isSpotLightShadow=!0,this.focus=1,this.aspect=1}updateMatrices(e){const t=this.camera,n=ts*2*e.angle*this.focus,s=this.mapSize.width/this.mapSize.height*this.aspect,r=e.distance||t.far;(n!==t.fov||s!==t.aspect||r!==t.far)&&(t.fov=n,t.aspect=s,t.far=r,t.updateProjectionMatrix()),super.updateMatrices(e)}copy(e){return super.copy(e),this.focus=e.focus,this}}class zl extends Cs{constructor(e,t,n=0,s=Math.PI/3,r=0,a=2){super(e,t),this.isSpotLight=!0,this.type="SpotLight",this.position.copy(dt.DEFAULT_UP),this.updateMatrix(),this.target=new dt,this.distance=n,this.angle=s,this.penumbra=r,this.decay=a,this.map=null,this.shadow=new vf}get power(){return this.intensity*Math.PI}set power(e){this.intensity=e/Math.PI}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.angle=e.angle,this.penumbra=e.penumbra,this.decay=e.decay,this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}}const Bl=new je,ms=new L,aa=new L;class Mf extends Oo{constructor(){super(new zt(90,1,.5,500)),this.isPointLightShadow=!0,this._frameExtents=new Ge(4,2),this._viewportCount=6,this._viewports=[new et(2,1,1,1),new et(0,1,1,1),new et(3,1,1,1),new et(1,1,1,1),new et(3,0,1,1),new et(1,0,1,1)],this._cubeDirections=[new L(1,0,0),new L(-1,0,0),new L(0,0,1),new L(0,0,-1),new L(0,1,0),new L(0,-1,0)],this._cubeUps=[new L(0,1,0),new L(0,1,0),new L(0,1,0),new L(0,1,0),new L(0,0,1),new L(0,0,-1)]}updateMatrices(e,t=0){const n=this.camera,s=this.matrix,r=e.distance||n.far;r!==n.far&&(n.far=r,n.updateProjectionMatrix()),ms.setFromMatrixPosition(e.matrixWorld),n.position.copy(ms),aa.copy(n.position),aa.add(this._cubeDirections[t]),n.up.copy(this._cubeUps[t]),n.lookAt(aa),n.updateMatrixWorld(),s.makeTranslation(-ms.x,-ms.y,-ms.z),Bl.multiplyMatrices(n.projectionMatrix,n.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Bl,n.coordinateSystem,n.reversedDepth)}}class yf extends Cs{constructor(e,t,n=0,s=2){super(e,t),this.isPointLight=!0,this.type="PointLight",this.distance=n,this.decay=s,this.shadow=new Mf}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}}class No extends Ao{constructor(e=-1,t=1,n=1,s=-1,r=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=s,this.near=r,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,s,r,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,s=(this.top+this.bottom)/2;let r=n-e,a=n+e,o=s+t,l=s-t;if(this.view!==null&&this.view.enabled){const c=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,a=r+c*this.view.width,o-=h*this.view.offsetY,l=o-h*this.view.height}this.projectionMatrix.makeOrthographic(r,a,o,l,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}}class bf extends Oo{constructor(){super(new No(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class Hl extends Cs{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(dt.DEFAULT_UP),this.updateMatrix(),this.target=new dt,this.shadow=new bf}dispose(){this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}}class Ef extends zt{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}}function kl(i,e,t,n){const s=Tf(n);switch(t){case Xc:return i*e;case vo:return i*e/s.components*s.byteLength;case Mo:return i*e/s.components*s.byteLength;case jc:return i*e*2/s.components*s.byteLength;case yo:return i*e*2/s.components*s.byteLength;case qc:return i*e*3/s.components*s.byteLength;case fn:return i*e*4/s.components*s.byteLength;case bo:return i*e*4/s.components*s.byteLength;case fr:case pr:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case mr:case gr:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case Fa:case za:return Math.max(i,16)*Math.max(e,8)/4;case Na:case Ua:return Math.max(i,8)*Math.max(e,8)/2;case Ba:case Ha:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case ka:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case Ga:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case Va:return Math.floor((i+4)/5)*Math.floor((e+3)/4)*16;case Wa:return Math.floor((i+4)/5)*Math.floor((e+4)/5)*16;case Xa:return Math.floor((i+5)/6)*Math.floor((e+4)/5)*16;case qa:return Math.floor((i+5)/6)*Math.floor((e+5)/6)*16;case ja:return Math.floor((i+7)/8)*Math.floor((e+4)/5)*16;case Ya:return Math.floor((i+7)/8)*Math.floor((e+5)/6)*16;case $a:return Math.floor((i+7)/8)*Math.floor((e+7)/8)*16;case Ka:return Math.floor((i+9)/10)*Math.floor((e+4)/5)*16;case Za:return Math.floor((i+9)/10)*Math.floor((e+5)/6)*16;case Ja:return Math.floor((i+9)/10)*Math.floor((e+7)/8)*16;case Qa:return Math.floor((i+9)/10)*Math.floor((e+9)/10)*16;case eo:return Math.floor((i+11)/12)*Math.floor((e+9)/10)*16;case to:return Math.floor((i+11)/12)*Math.floor((e+11)/12)*16;case no:case io:case so:return Math.ceil(i/4)*Math.ceil(e/4)*16;case ro:case ao:return Math.ceil(i/4)*Math.ceil(e/4)*8;case oo:case lo:return Math.ceil(i/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function Tf(i){switch(i){case bn:case kc:return{byteLength:1,components:1};case Ms:case Gc:case Rs:return{byteLength:2,components:1};case xo:case So:return{byteLength:2,components:4};case gi:case _o:case vn:return{byteLength:4,components:1};case Vc:case Wc:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${i}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:mo}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=mo);function ah(){let i=null,e=!1,t=null,n=null;function s(r,a){t(r,a),n=i.requestAnimationFrame(s)}return{start:function(){e!==!0&&t!==null&&(n=i.requestAnimationFrame(s),e=!0)},stop:function(){i.cancelAnimationFrame(n),e=!1},setAnimationLoop:function(r){t=r},setContext:function(r){i=r}}}function wf(i){const e=new WeakMap;function t(o,l){const c=o.array,h=o.usage,u=c.byteLength,f=i.createBuffer();i.bindBuffer(l,f),i.bufferData(l,c,h),o.onUploadCallback();let p;if(c instanceof Float32Array)p=i.FLOAT;else if(typeof Float16Array<"u"&&c instanceof Float16Array)p=i.HALF_FLOAT;else if(c instanceof Uint16Array)o.isFloat16BufferAttribute?p=i.HALF_FLOAT:p=i.UNSIGNED_SHORT;else if(c instanceof Int16Array)p=i.SHORT;else if(c instanceof Uint32Array)p=i.UNSIGNED_INT;else if(c instanceof Int32Array)p=i.INT;else if(c instanceof Int8Array)p=i.BYTE;else if(c instanceof Uint8Array)p=i.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)p=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:f,type:p,bytesPerElement:c.BYTES_PER_ELEMENT,version:o.version,size:u}}function n(o,l,c){const h=l.array,u=l.updateRanges;if(i.bindBuffer(c,o),u.length===0)i.bufferSubData(c,0,h);else{u.sort((p,g)=>p.start-g.start);let f=0;for(let p=1;p<u.length;p++){const g=u[f],_=u[p];_.start<=g.start+g.count+1?g.count=Math.max(g.count,_.start+_.count-g.start):(++f,u[f]=_)}u.length=f+1;for(let p=0,g=u.length;p<g;p++){const _=u[p];i.bufferSubData(c,_.start*h.BYTES_PER_ELEMENT,h,_.start,_.count)}l.clearUpdateRanges()}l.onUploadCallback()}function s(o){return o.isInterleavedBufferAttribute&&(o=o.data),e.get(o)}function r(o){o.isInterleavedBufferAttribute&&(o=o.data);const l=e.get(o);l&&(i.deleteBuffer(l.buffer),e.delete(o))}function a(o,l){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){const h=e.get(o);(!h||h.version<o.version)&&e.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}const c=e.get(o);if(c===void 0)e.set(o,t(o,l));else if(c.version<o.version){if(c.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(c.buffer,o,l),c.version=o.version}}return{get:s,remove:r,update:a}}var Af=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Rf=`#ifdef USE_ALPHAHASH
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
#endif`,Cf=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,Pf=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Lf=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,Df=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,If=`#ifdef USE_AOMAP
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
#endif`,Of=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Nf=`#ifdef USE_BATCHING
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
#endif`,Ff=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,Uf=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,zf=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Bf=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,Hf=`#ifdef USE_IRIDESCENCE
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
#endif`,kf=`#ifdef USE_BUMPMAP
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
#endif`,Gf=`#if NUM_CLIPPING_PLANES > 0
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
#endif`,Vf=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Wf=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,Xf=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,qf=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,jf=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,Yf=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,$f=`#if defined( USE_COLOR_ALPHA )
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
#endif`,Kf=`#define PI 3.141592653589793
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
} // validated`,Zf=`#ifdef ENVMAP_TYPE_CUBE_UV
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
#endif`,Jf=`vec3 transformedNormal = objectNormal;
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
#endif`,Qf=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,ep=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,tp=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,np=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,ip="gl_FragColor = linearToOutputTexel( gl_FragColor );",sp=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,rp=`#ifdef USE_ENVMAP
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
#endif`,ap=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,op=`#ifdef USE_ENVMAP
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
#endif`,lp=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,cp=`#ifdef USE_ENVMAP
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
#endif`,hp=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,up=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,dp=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,fp=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,pp=`#ifdef USE_GRADIENTMAP
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
}`,mp=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,gp=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,_p=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,xp=`uniform bool receiveShadow;
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
#endif`,Sp=`#ifdef USE_ENVMAP
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
#endif`,vp=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,Mp=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,yp=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,bp=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,Ep=`PhysicalMaterial material;
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
#endif`,Tp=`struct PhysicalMaterial {
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
}`,wp=`
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
#endif`,Ap=`#if defined( RE_IndirectDiffuse )
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
#endif`,Rp=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,Cp=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,Pp=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Lp=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Dp=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,Ip=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,Op=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Np=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,Fp=`#if defined( USE_POINTS_UV )
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
#endif`,Up=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,zp=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,Bp=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,Hp=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,kp=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Gp=`#ifdef USE_MORPHTARGETS
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
#endif`,Vp=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Wp=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`,Xp=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`,qp=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,jp=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Yp=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,$p=`#ifdef USE_NORMALMAP
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
#endif`,Kp=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,Zp=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,Jp=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,Qp=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,em=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,tm=`vec3 packNormalToRGB( const in vec3 normal ) {
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
}`,nm=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,im=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,sm=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,rm=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,am=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,om=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,lm=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,cm=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,hm=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`,um=`float getShadowMask() {
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
}`,dm=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,fm=`#ifdef USE_SKINNING
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
#endif`,pm=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,mm=`#ifdef USE_SKINNING
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
#endif`,gm=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,_m=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,xm=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,Sm=`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,vm=`#ifdef USE_TRANSMISSION
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
#endif`,Mm=`#ifdef USE_TRANSMISSION
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
#endif`,ym=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,bm=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,Em=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,Tm=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const wm=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,Am=`uniform sampler2D t2D;
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
}`,Rm=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Cm=`#ifdef ENVMAP_TYPE_CUBE
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
}`,Pm=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Lm=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Dm=`#include <common>
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
}`,Im=`#if DEPTH_PACKING == 3200
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
}`,Om=`#define DISTANCE
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
}`,Nm=`#define DISTANCE
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
}`,Fm=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,Um=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,zm=`uniform float scale;
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
}`,Bm=`uniform vec3 diffuse;
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
}`,Hm=`#include <common>
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
}`,km=`uniform vec3 diffuse;
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
}`,Gm=`#define LAMBERT
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
}`,Vm=`#define LAMBERT
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
}`,Wm=`#define MATCAP
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
}`,Xm=`#define MATCAP
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
}`,qm=`#define NORMAL
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
}`,jm=`#define NORMAL
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
}`,Ym=`#define PHONG
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
}`,$m=`#define PHONG
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
}`,Km=`#define STANDARD
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
}`,Zm=`#define STANDARD
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
}`,Jm=`#define TOON
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
}`,Qm=`#define TOON
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
}`,eg=`uniform float size;
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
}`,tg=`uniform vec3 diffuse;
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
}`,ng=`#include <common>
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
}`,ig=`uniform vec3 color;
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
}`,sg=`uniform float rotation;
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
}`,rg=`uniform vec3 diffuse;
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
}`,ke={alphahash_fragment:Af,alphahash_pars_fragment:Rf,alphamap_fragment:Cf,alphamap_pars_fragment:Pf,alphatest_fragment:Lf,alphatest_pars_fragment:Df,aomap_fragment:If,aomap_pars_fragment:Of,batching_pars_vertex:Nf,batching_vertex:Ff,begin_vertex:Uf,beginnormal_vertex:zf,bsdfs:Bf,iridescence_fragment:Hf,bumpmap_pars_fragment:kf,clipping_planes_fragment:Gf,clipping_planes_pars_fragment:Vf,clipping_planes_pars_vertex:Wf,clipping_planes_vertex:Xf,color_fragment:qf,color_pars_fragment:jf,color_pars_vertex:Yf,color_vertex:$f,common:Kf,cube_uv_reflection_fragment:Zf,defaultnormal_vertex:Jf,displacementmap_pars_vertex:Qf,displacementmap_vertex:ep,emissivemap_fragment:tp,emissivemap_pars_fragment:np,colorspace_fragment:ip,colorspace_pars_fragment:sp,envmap_fragment:rp,envmap_common_pars_fragment:ap,envmap_pars_fragment:op,envmap_pars_vertex:lp,envmap_physical_pars_fragment:Sp,envmap_vertex:cp,fog_vertex:hp,fog_pars_vertex:up,fog_fragment:dp,fog_pars_fragment:fp,gradientmap_pars_fragment:pp,lightmap_pars_fragment:mp,lights_lambert_fragment:gp,lights_lambert_pars_fragment:_p,lights_pars_begin:xp,lights_toon_fragment:vp,lights_toon_pars_fragment:Mp,lights_phong_fragment:yp,lights_phong_pars_fragment:bp,lights_physical_fragment:Ep,lights_physical_pars_fragment:Tp,lights_fragment_begin:wp,lights_fragment_maps:Ap,lights_fragment_end:Rp,logdepthbuf_fragment:Cp,logdepthbuf_pars_fragment:Pp,logdepthbuf_pars_vertex:Lp,logdepthbuf_vertex:Dp,map_fragment:Ip,map_pars_fragment:Op,map_particle_fragment:Np,map_particle_pars_fragment:Fp,metalnessmap_fragment:Up,metalnessmap_pars_fragment:zp,morphinstance_vertex:Bp,morphcolor_vertex:Hp,morphnormal_vertex:kp,morphtarget_pars_vertex:Gp,morphtarget_vertex:Vp,normal_fragment_begin:Wp,normal_fragment_maps:Xp,normal_pars_fragment:qp,normal_pars_vertex:jp,normal_vertex:Yp,normalmap_pars_fragment:$p,clearcoat_normal_fragment_begin:Kp,clearcoat_normal_fragment_maps:Zp,clearcoat_pars_fragment:Jp,iridescence_pars_fragment:Qp,opaque_fragment:em,packing:tm,premultiplied_alpha_fragment:nm,project_vertex:im,dithering_fragment:sm,dithering_pars_fragment:rm,roughnessmap_fragment:am,roughnessmap_pars_fragment:om,shadowmap_pars_fragment:lm,shadowmap_pars_vertex:cm,shadowmap_vertex:hm,shadowmask_pars_fragment:um,skinbase_vertex:dm,skinning_pars_vertex:fm,skinning_vertex:pm,skinnormal_vertex:mm,specularmap_fragment:gm,specularmap_pars_fragment:_m,tonemapping_fragment:xm,tonemapping_pars_fragment:Sm,transmission_fragment:vm,transmission_pars_fragment:Mm,uv_pars_fragment:ym,uv_pars_vertex:bm,uv_vertex:Em,worldpos_vertex:Tm,background_vert:wm,background_frag:Am,backgroundCube_vert:Rm,backgroundCube_frag:Cm,cube_vert:Pm,cube_frag:Lm,depth_vert:Dm,depth_frag:Im,distanceRGBA_vert:Om,distanceRGBA_frag:Nm,equirect_vert:Fm,equirect_frag:Um,linedashed_vert:zm,linedashed_frag:Bm,meshbasic_vert:Hm,meshbasic_frag:km,meshlambert_vert:Gm,meshlambert_frag:Vm,meshmatcap_vert:Wm,meshmatcap_frag:Xm,meshnormal_vert:qm,meshnormal_frag:jm,meshphong_vert:Ym,meshphong_frag:$m,meshphysical_vert:Km,meshphysical_frag:Zm,meshtoon_vert:Jm,meshtoon_frag:Qm,points_vert:eg,points_frag:tg,shadow_vert:ng,shadow_frag:ig,sprite_vert:sg,sprite_frag:rg},oe={common:{diffuse:{value:new Ne(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Be},alphaMap:{value:null},alphaMapTransform:{value:new Be},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Be}},envmap:{envMap:{value:null},envMapRotation:{value:new Be},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Be}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Be}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Be},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Be},normalScale:{value:new Ge(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Be},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Be}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Be}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Be}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Ne(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new Ne(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Be},alphaTest:{value:0},uvTransform:{value:new Be}},sprite:{diffuse:{value:new Ne(16777215)},opacity:{value:1},center:{value:new Ge(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Be},alphaMap:{value:null},alphaMapTransform:{value:new Be},alphaTest:{value:0}}},Sn={basic:{uniforms:Rt([oe.common,oe.specularmap,oe.envmap,oe.aomap,oe.lightmap,oe.fog]),vertexShader:ke.meshbasic_vert,fragmentShader:ke.meshbasic_frag},lambert:{uniforms:Rt([oe.common,oe.specularmap,oe.envmap,oe.aomap,oe.lightmap,oe.emissivemap,oe.bumpmap,oe.normalmap,oe.displacementmap,oe.fog,oe.lights,{emissive:{value:new Ne(0)}}]),vertexShader:ke.meshlambert_vert,fragmentShader:ke.meshlambert_frag},phong:{uniforms:Rt([oe.common,oe.specularmap,oe.envmap,oe.aomap,oe.lightmap,oe.emissivemap,oe.bumpmap,oe.normalmap,oe.displacementmap,oe.fog,oe.lights,{emissive:{value:new Ne(0)},specular:{value:new Ne(1118481)},shininess:{value:30}}]),vertexShader:ke.meshphong_vert,fragmentShader:ke.meshphong_frag},standard:{uniforms:Rt([oe.common,oe.envmap,oe.aomap,oe.lightmap,oe.emissivemap,oe.bumpmap,oe.normalmap,oe.displacementmap,oe.roughnessmap,oe.metalnessmap,oe.fog,oe.lights,{emissive:{value:new Ne(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:ke.meshphysical_vert,fragmentShader:ke.meshphysical_frag},toon:{uniforms:Rt([oe.common,oe.aomap,oe.lightmap,oe.emissivemap,oe.bumpmap,oe.normalmap,oe.displacementmap,oe.gradientmap,oe.fog,oe.lights,{emissive:{value:new Ne(0)}}]),vertexShader:ke.meshtoon_vert,fragmentShader:ke.meshtoon_frag},matcap:{uniforms:Rt([oe.common,oe.bumpmap,oe.normalmap,oe.displacementmap,oe.fog,{matcap:{value:null}}]),vertexShader:ke.meshmatcap_vert,fragmentShader:ke.meshmatcap_frag},points:{uniforms:Rt([oe.points,oe.fog]),vertexShader:ke.points_vert,fragmentShader:ke.points_frag},dashed:{uniforms:Rt([oe.common,oe.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:ke.linedashed_vert,fragmentShader:ke.linedashed_frag},depth:{uniforms:Rt([oe.common,oe.displacementmap]),vertexShader:ke.depth_vert,fragmentShader:ke.depth_frag},normal:{uniforms:Rt([oe.common,oe.bumpmap,oe.normalmap,oe.displacementmap,{opacity:{value:1}}]),vertexShader:ke.meshnormal_vert,fragmentShader:ke.meshnormal_frag},sprite:{uniforms:Rt([oe.sprite,oe.fog]),vertexShader:ke.sprite_vert,fragmentShader:ke.sprite_frag},background:{uniforms:{uvTransform:{value:new Be},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:ke.background_vert,fragmentShader:ke.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Be}},vertexShader:ke.backgroundCube_vert,fragmentShader:ke.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:ke.cube_vert,fragmentShader:ke.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:ke.equirect_vert,fragmentShader:ke.equirect_frag},distanceRGBA:{uniforms:Rt([oe.common,oe.displacementmap,{referencePosition:{value:new L},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:ke.distanceRGBA_vert,fragmentShader:ke.distanceRGBA_frag},shadow:{uniforms:Rt([oe.lights,oe.fog,{color:{value:new Ne(0)},opacity:{value:1}}]),vertexShader:ke.shadow_vert,fragmentShader:ke.shadow_frag}};Sn.physical={uniforms:Rt([Sn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Be},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Be},clearcoatNormalScale:{value:new Ge(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Be},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Be},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Be},sheen:{value:0},sheenColor:{value:new Ne(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Be},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Be},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Be},transmissionSamplerSize:{value:new Ge},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Be},attenuationDistance:{value:0},attenuationColor:{value:new Ne(0)},specularColor:{value:new Ne(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Be},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Be},anisotropyVector:{value:new Ge},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Be}}]),vertexShader:ke.meshphysical_vert,fragmentShader:ke.meshphysical_frag};const rr={r:0,b:0,g:0},oi=new pn,ag=new je;function og(i,e,t,n,s,r,a){const o=new Ne(0);let l=r===!0?0:1,c,h,u=null,f=0,p=null;function g(E){let y=E.isScene===!0?E.background:null;return y&&y.isTexture&&(y=(E.backgroundBlurriness>0?t:e).get(y)),y}function _(E){let y=!1;const w=g(E);w===null?d(o,l):w&&w.isColor&&(d(w,1),y=!0);const A=i.xr.getEnvironmentBlendMode();A==="additive"?n.buffers.color.setClear(0,0,0,1,a):A==="alpha-blend"&&n.buffers.color.setClear(0,0,0,0,a),(i.autoClear||y)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil))}function m(E,y){const w=g(y);w&&(w.isCubeTexture||w.mapping===Rr)?(h===void 0&&(h=new ht(new ut(1,1,1),new ei({name:"BackgroundCubeMaterial",uniforms:ns(Sn.backgroundCube.uniforms),vertexShader:Sn.backgroundCube.vertexShader,fragmentShader:Sn.backgroundCube.fragmentShader,side:Nt,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),h.geometry.deleteAttribute("normal"),h.geometry.deleteAttribute("uv"),h.onBeforeRender=function(A,P,I){this.matrixWorld.copyPosition(I.matrixWorld)},Object.defineProperty(h.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),s.update(h)),oi.copy(y.backgroundRotation),oi.x*=-1,oi.y*=-1,oi.z*=-1,w.isCubeTexture&&w.isRenderTargetTexture===!1&&(oi.y*=-1,oi.z*=-1),h.material.uniforms.envMap.value=w,h.material.uniforms.flipEnvMap.value=w.isCubeTexture&&w.isRenderTargetTexture===!1?-1:1,h.material.uniforms.backgroundBlurriness.value=y.backgroundBlurriness,h.material.uniforms.backgroundIntensity.value=y.backgroundIntensity,h.material.uniforms.backgroundRotation.value.setFromMatrix4(ag.makeRotationFromEuler(oi)),h.material.toneMapped=$e.getTransfer(w.colorSpace)!==Qe,(u!==w||f!==w.version||p!==i.toneMapping)&&(h.material.needsUpdate=!0,u=w,f=w.version,p=i.toneMapping),h.layers.enableAll(),E.unshift(h,h.geometry,h.material,0,0,null)):w&&w.isTexture&&(c===void 0&&(c=new ht(new Lt(2,2),new ei({name:"BackgroundMaterial",uniforms:ns(Sn.background.uniforms),vertexShader:Sn.background.vertexShader,fragmentShader:Sn.background.fragmentShader,side:Jn,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),s.update(c)),c.material.uniforms.t2D.value=w,c.material.uniforms.backgroundIntensity.value=y.backgroundIntensity,c.material.toneMapped=$e.getTransfer(w.colorSpace)!==Qe,w.matrixAutoUpdate===!0&&w.updateMatrix(),c.material.uniforms.uvTransform.value.copy(w.matrix),(u!==w||f!==w.version||p!==i.toneMapping)&&(c.material.needsUpdate=!0,u=w,f=w.version,p=i.toneMapping),c.layers.enableAll(),E.unshift(c,c.geometry,c.material,0,0,null))}function d(E,y){E.getRGB(rr,nh(i)),n.buffers.color.setClear(rr.r,rr.g,rr.b,y,a)}function b(){h!==void 0&&(h.geometry.dispose(),h.material.dispose(),h=void 0),c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0)}return{getClearColor:function(){return o},setClearColor:function(E,y=1){o.set(E),l=y,d(o,l)},getClearAlpha:function(){return l},setClearAlpha:function(E){l=E,d(o,l)},render:_,addToRenderList:m,dispose:b}}function lg(i,e){const t=i.getParameter(i.MAX_VERTEX_ATTRIBS),n={},s=f(null);let r=s,a=!1;function o(v,C,F,z,X){let V=!1;const G=u(z,F,C);r!==G&&(r=G,c(r.object)),V=p(v,z,F,X),V&&g(v,z,F,X),X!==null&&e.update(X,i.ELEMENT_ARRAY_BUFFER),(V||a)&&(a=!1,y(v,C,F,z),X!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,e.get(X).buffer))}function l(){return i.createVertexArray()}function c(v){return i.bindVertexArray(v)}function h(v){return i.deleteVertexArray(v)}function u(v,C,F){const z=F.wireframe===!0;let X=n[v.id];X===void 0&&(X={},n[v.id]=X);let V=X[C.id];V===void 0&&(V={},X[C.id]=V);let G=V[z];return G===void 0&&(G=f(l()),V[z]=G),G}function f(v){const C=[],F=[],z=[];for(let X=0;X<t;X++)C[X]=0,F[X]=0,z[X]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:C,enabledAttributes:F,attributeDivisors:z,object:v,attributes:{},index:null}}function p(v,C,F,z){const X=r.attributes,V=C.attributes;let G=0;const $=F.getAttributes();for(const B in $)if($[B].location>=0){const re=X[B];let _e=V[B];if(_e===void 0&&(B==="instanceMatrix"&&v.instanceMatrix&&(_e=v.instanceMatrix),B==="instanceColor"&&v.instanceColor&&(_e=v.instanceColor)),re===void 0||re.attribute!==_e||_e&&re.data!==_e.data)return!0;G++}return r.attributesNum!==G||r.index!==z}function g(v,C,F,z){const X={},V=C.attributes;let G=0;const $=F.getAttributes();for(const B in $)if($[B].location>=0){let re=V[B];re===void 0&&(B==="instanceMatrix"&&v.instanceMatrix&&(re=v.instanceMatrix),B==="instanceColor"&&v.instanceColor&&(re=v.instanceColor));const _e={};_e.attribute=re,re&&re.data&&(_e.data=re.data),X[B]=_e,G++}r.attributes=X,r.attributesNum=G,r.index=z}function _(){const v=r.newAttributes;for(let C=0,F=v.length;C<F;C++)v[C]=0}function m(v){d(v,0)}function d(v,C){const F=r.newAttributes,z=r.enabledAttributes,X=r.attributeDivisors;F[v]=1,z[v]===0&&(i.enableVertexAttribArray(v),z[v]=1),X[v]!==C&&(i.vertexAttribDivisor(v,C),X[v]=C)}function b(){const v=r.newAttributes,C=r.enabledAttributes;for(let F=0,z=C.length;F<z;F++)C[F]!==v[F]&&(i.disableVertexAttribArray(F),C[F]=0)}function E(v,C,F,z,X,V,G){G===!0?i.vertexAttribIPointer(v,C,F,X,V):i.vertexAttribPointer(v,C,F,z,X,V)}function y(v,C,F,z){_();const X=z.attributes,V=F.getAttributes(),G=C.defaultAttributeValues;for(const $ in V){const B=V[$];if(B.location>=0){let ie=X[$];if(ie===void 0&&($==="instanceMatrix"&&v.instanceMatrix&&(ie=v.instanceMatrix),$==="instanceColor"&&v.instanceColor&&(ie=v.instanceColor)),ie!==void 0){const re=ie.normalized,_e=ie.itemSize,Ie=e.get(ie);if(Ie===void 0)continue;const He=Ie.buffer,Xe=Ie.type,Oe=Ie.bytesPerElement,j=Xe===i.INT||Xe===i.UNSIGNED_INT||ie.gpuType===_o;if(ie.isInterleavedBufferAttribute){const K=ie.data,le=K.stride,Me=ie.offset;if(K.isInstancedInterleavedBuffer){for(let de=0;de<B.locationSize;de++)d(B.location+de,K.meshPerAttribute);v.isInstancedMesh!==!0&&z._maxInstanceCount===void 0&&(z._maxInstanceCount=K.meshPerAttribute*K.count)}else for(let de=0;de<B.locationSize;de++)m(B.location+de);i.bindBuffer(i.ARRAY_BUFFER,He);for(let de=0;de<B.locationSize;de++)E(B.location+de,_e/B.locationSize,Xe,re,le*Oe,(Me+_e/B.locationSize*de)*Oe,j)}else{if(ie.isInstancedBufferAttribute){for(let K=0;K<B.locationSize;K++)d(B.location+K,ie.meshPerAttribute);v.isInstancedMesh!==!0&&z._maxInstanceCount===void 0&&(z._maxInstanceCount=ie.meshPerAttribute*ie.count)}else for(let K=0;K<B.locationSize;K++)m(B.location+K);i.bindBuffer(i.ARRAY_BUFFER,He);for(let K=0;K<B.locationSize;K++)E(B.location+K,_e/B.locationSize,Xe,re,_e*Oe,_e/B.locationSize*K*Oe,j)}}else if(G!==void 0){const re=G[$];if(re!==void 0)switch(re.length){case 2:i.vertexAttrib2fv(B.location,re);break;case 3:i.vertexAttrib3fv(B.location,re);break;case 4:i.vertexAttrib4fv(B.location,re);break;default:i.vertexAttrib1fv(B.location,re)}}}}b()}function w(){I();for(const v in n){const C=n[v];for(const F in C){const z=C[F];for(const X in z)h(z[X].object),delete z[X];delete C[F]}delete n[v]}}function A(v){if(n[v.id]===void 0)return;const C=n[v.id];for(const F in C){const z=C[F];for(const X in z)h(z[X].object),delete z[X];delete C[F]}delete n[v.id]}function P(v){for(const C in n){const F=n[C];if(F[v.id]===void 0)continue;const z=F[v.id];for(const X in z)h(z[X].object),delete z[X];delete F[v.id]}}function I(){M(),a=!0,r!==s&&(r=s,c(r.object))}function M(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:o,reset:I,resetDefaultState:M,dispose:w,releaseStatesOfGeometry:A,releaseStatesOfProgram:P,initAttributes:_,enableAttribute:m,disableUnusedAttributes:b}}function cg(i,e,t){let n;function s(c){n=c}function r(c,h){i.drawArrays(n,c,h),t.update(h,n,1)}function a(c,h,u){u!==0&&(i.drawArraysInstanced(n,c,h,u),t.update(h,n,u))}function o(c,h,u){if(u===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,c,0,h,0,u);let p=0;for(let g=0;g<u;g++)p+=h[g];t.update(p,n,1)}function l(c,h,u,f){if(u===0)return;const p=e.get("WEBGL_multi_draw");if(p===null)for(let g=0;g<c.length;g++)a(c[g],h[g],f[g]);else{p.multiDrawArraysInstancedWEBGL(n,c,0,h,0,f,0,u);let g=0;for(let _=0;_<u;_++)g+=h[_]*f[_];t.update(g,n,1)}}this.setMode=s,this.render=r,this.renderInstances=a,this.renderMultiDraw=o,this.renderMultiDrawInstances=l}function hg(i,e,t,n){let s;function r(){if(s!==void 0)return s;if(e.has("EXT_texture_filter_anisotropic")===!0){const P=e.get("EXT_texture_filter_anisotropic");s=i.getParameter(P.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function a(P){return!(P!==fn&&n.convert(P)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(P){const I=P===Rs&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(P!==bn&&n.convert(P)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE)&&P!==vn&&!I)}function l(P){if(P==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";P="mediump"}return P==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=t.precision!==void 0?t.precision:"highp";const h=l(c);h!==c&&(console.warn("THREE.WebGLRenderer:",c,"not supported, using",h,"instead."),c=h);const u=t.logarithmicDepthBuffer===!0,f=t.reversedDepthBuffer===!0&&e.has("EXT_clip_control"),p=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),g=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),_=i.getParameter(i.MAX_TEXTURE_SIZE),m=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),d=i.getParameter(i.MAX_VERTEX_ATTRIBS),b=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),E=i.getParameter(i.MAX_VARYING_VECTORS),y=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),w=g>0,A=i.getParameter(i.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:a,textureTypeReadable:o,precision:c,logarithmicDepthBuffer:u,reversedDepthBuffer:f,maxTextures:p,maxVertexTextures:g,maxTextureSize:_,maxCubemapSize:m,maxAttributes:d,maxVertexUniforms:b,maxVaryings:E,maxFragmentUniforms:y,vertexTextures:w,maxSamples:A}}function ug(i){const e=this;let t=null,n=0,s=!1,r=!1;const a=new ci,o=new Be,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(u,f){const p=u.length!==0||f||n!==0||s;return s=f,n=u.length,p},this.beginShadows=function(){r=!0,h(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(u,f){t=h(u,f,0)},this.setState=function(u,f,p){const g=u.clippingPlanes,_=u.clipIntersection,m=u.clipShadows,d=i.get(u);if(!s||g===null||g.length===0||r&&!m)r?h(null):c();else{const b=r?0:n,E=b*4;let y=d.clippingState||null;l.value=y,y=h(g,f,E,p);for(let w=0;w!==E;++w)y[w]=t[w];d.clippingState=y,this.numIntersection=_?this.numPlanes:0,this.numPlanes+=b}};function c(){l.value!==t&&(l.value=t,l.needsUpdate=n>0),e.numPlanes=n,e.numIntersection=0}function h(u,f,p,g){const _=u!==null?u.length:0;let m=null;if(_!==0){if(m=l.value,g!==!0||m===null){const d=p+_*4,b=f.matrixWorldInverse;o.getNormalMatrix(b),(m===null||m.length<d)&&(m=new Float32Array(d));for(let E=0,y=p;E!==_;++E,y+=4)a.copy(u[E]).applyMatrix4(b,o),a.normal.toArray(m,y),m[y+3]=a.constant}l.value=m,l.needsUpdate=!0}return e.numPlanes=_,e.numIntersection=0,m}}function dg(i){let e=new WeakMap;function t(a,o){return o===Da?a.mapping=Ji:o===Ia&&(a.mapping=Qi),a}function n(a){if(a&&a.isTexture){const o=a.mapping;if(o===Da||o===Ia)if(e.has(a)){const l=e.get(a).texture;return t(l,a.mapping)}else{const l=a.image;if(l&&l.height>0){const c=new lf(l.height);return c.fromEquirectangularTexture(i,a),e.set(a,c),a.addEventListener("dispose",s),t(c.texture,a.mapping)}else return null}}return a}function s(a){const o=a.target;o.removeEventListener("dispose",s);const l=e.get(o);l!==void 0&&(e.delete(o),l.dispose())}function r(){e=new WeakMap}return{get:n,dispose:r}}const Gi=4,Gl=[.125,.215,.35,.446,.526,.582],di=20,oa=new No,Vl=new Ne;let la=null,ca=0,ha=0,ua=!1;const hi=(1+Math.sqrt(5))/2,Ni=1/hi,Wl=[new L(-hi,Ni,0),new L(hi,Ni,0),new L(-Ni,0,hi),new L(Ni,0,hi),new L(0,hi,-Ni),new L(0,hi,Ni),new L(-1,1,-1),new L(1,1,-1),new L(-1,1,1),new L(1,1,1)],fg=new L;class ho{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,t=0,n=.1,s=100,r={}){const{size:a=256,position:o=fg}=r;la=this._renderer.getRenderTarget(),ca=this._renderer.getActiveCubeFace(),ha=this._renderer.getActiveMipmapLevel(),ua=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(a);const l=this._allocateTargets();return l.depthBuffer=!0,this._sceneToCubeUV(e,n,s,l,o),t>0&&this._blur(l,0,0,t),this._applyPMREM(l),this._cleanup(l),l}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=jl(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=ql(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(la,ca,ha),this._renderer.xr.enabled=ua,e.scissorTest=!1,ar(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===Ji||e.mapping===Qi?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),la=this._renderer.getRenderTarget(),ca=this._renderer.getActiveCubeFace(),ha=this._renderer.getActiveMipmapLevel(),ua=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){const e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:tn,minFilter:tn,generateMipmaps:!1,type:Rs,format:fn,colorSpace:es,depthBuffer:!1},s=Xl(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Xl(e,t,n);const{_lodMax:r}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=pg(r)),this._blurMaterial=mg(r,e,t)}return s}_compileMaterial(e){const t=new ht(this._lodPlanes[0],e);this._renderer.compile(t,oa)}_sceneToCubeUV(e,t,n,s,r){const l=new zt(90,1,t,n),c=[1,-1,1,1,1,1],h=[1,1,1,-1,-1,-1],u=this._renderer,f=u.autoClear,p=u.toneMapping;u.getClearColor(Vl),u.toneMapping=Zn,u.autoClear=!1,u.state.buffers.depth.getReversed()&&(u.setRenderTarget(s),u.clearDepth(),u.setRenderTarget(null));const _=new Qt({name:"PMREM.Background",side:Nt,depthWrite:!1,depthTest:!1}),m=new ht(new ut,_);let d=!1;const b=e.background;b?b.isColor&&(_.color.copy(b),e.background=null,d=!0):(_.color.copy(Vl),d=!0);for(let E=0;E<6;E++){const y=E%3;y===0?(l.up.set(0,c[E],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x+h[E],r.y,r.z)):y===1?(l.up.set(0,0,c[E]),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y+h[E],r.z)):(l.up.set(0,c[E],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y,r.z+h[E]));const w=this._cubeSize;ar(s,y*w,E>2?w:0,w,w),u.setRenderTarget(s),d&&u.render(m,l),u.render(e,l)}m.geometry.dispose(),m.material.dispose(),u.toneMapping=p,u.autoClear=f,e.background=b}_textureToCubeUV(e,t){const n=this._renderer,s=e.mapping===Ji||e.mapping===Qi;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=jl()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=ql());const r=s?this._cubemapMaterial:this._equirectMaterial,a=new ht(this._lodPlanes[0],r),o=r.uniforms;o.envMap.value=e;const l=this._cubeSize;ar(t,0,0,3*l,2*l),n.setRenderTarget(t),n.render(a,oa)}_applyPMREM(e){const t=this._renderer,n=t.autoClear;t.autoClear=!1;const s=this._lodPlanes.length;for(let r=1;r<s;r++){const a=Math.sqrt(this._sigmas[r]*this._sigmas[r]-this._sigmas[r-1]*this._sigmas[r-1]),o=Wl[(s-r-1)%Wl.length];this._blur(e,r-1,r,a,o)}t.autoClear=n}_blur(e,t,n,s,r){const a=this._pingPongRenderTarget;this._halfBlur(e,a,t,n,s,"latitudinal",r),this._halfBlur(a,e,n,n,s,"longitudinal",r)}_halfBlur(e,t,n,s,r,a,o){const l=this._renderer,c=this._blurMaterial;a!=="latitudinal"&&a!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");const h=3,u=new ht(this._lodPlanes[s],c),f=c.uniforms,p=this._sizeLods[n]-1,g=isFinite(r)?Math.PI/(2*p):2*Math.PI/(2*di-1),_=r/g,m=isFinite(r)?1+Math.floor(h*_):di;m>di&&console.warn(`sigmaRadians, ${r}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${di}`);const d=[];let b=0;for(let P=0;P<di;++P){const I=P/_,M=Math.exp(-I*I/2);d.push(M),P===0?b+=M:P<m&&(b+=2*M)}for(let P=0;P<d.length;P++)d[P]=d[P]/b;f.envMap.value=e.texture,f.samples.value=m,f.weights.value=d,f.latitudinal.value=a==="latitudinal",o&&(f.poleAxis.value=o);const{_lodMax:E}=this;f.dTheta.value=g,f.mipInt.value=E-n;const y=this._sizeLods[s],w=3*y*(s>E-Gi?s-E+Gi:0),A=4*(this._cubeSize-y);ar(t,w,A,3*y,2*y),l.setRenderTarget(t),l.render(u,oa)}}function pg(i){const e=[],t=[],n=[];let s=i;const r=i-Gi+1+Gl.length;for(let a=0;a<r;a++){const o=Math.pow(2,s);t.push(o);let l=1/o;a>i-Gi?l=Gl[a-i+Gi-1]:a===0&&(l=0),n.push(l);const c=1/(o-2),h=-c,u=1+c,f=[h,h,u,h,u,u,h,h,u,u,h,u],p=6,g=6,_=3,m=2,d=1,b=new Float32Array(_*g*p),E=new Float32Array(m*g*p),y=new Float32Array(d*g*p);for(let A=0;A<p;A++){const P=A%3*2/3-1,I=A>2?0:-1,M=[P,I,0,P+2/3,I,0,P+2/3,I+1,0,P,I,0,P+2/3,I+1,0,P,I+1,0];b.set(M,_*g*A),E.set(f,m*g*A);const v=[A,A,A,A,A,A];y.set(v,d*g*A)}const w=new vt;w.setAttribute("position",new Ot(b,_)),w.setAttribute("uv",new Ot(E,m)),w.setAttribute("faceIndex",new Ot(y,d)),e.push(w),s>Gi&&s--}return{lodPlanes:e,sizeLods:t,sigmas:n}}function Xl(i,e,t){const n=new Qn(i,e,t);return n.texture.mapping=Rr,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function ar(i,e,t,n,s){i.viewport.set(e,t,n,s),i.scissor.set(e,t,n,s)}function mg(i,e,t){const n=new Float32Array(di),s=new L(0,1,0);return new ei({name:"SphericalGaussianBlur",defines:{n:di,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:n},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:s}},vertexShader:Fo(),fragmentShader:`

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
		`,blending:Kn,depthTest:!1,depthWrite:!1})}function ql(){return new ei({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Fo(),fragmentShader:`

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
		`,blending:Kn,depthTest:!1,depthWrite:!1})}function jl(){return new ei({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Fo(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Kn,depthTest:!1,depthWrite:!1})}function Fo(){return`

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
	`}function gg(i){let e=new WeakMap,t=null;function n(o){if(o&&o.isTexture){const l=o.mapping,c=l===Da||l===Ia,h=l===Ji||l===Qi;if(c||h){let u=e.get(o);const f=u!==void 0?u.texture.pmremVersion:0;if(o.isRenderTargetTexture&&o.pmremVersion!==f)return t===null&&(t=new ho(i)),u=c?t.fromEquirectangular(o,u):t.fromCubemap(o,u),u.texture.pmremVersion=o.pmremVersion,e.set(o,u),u.texture;if(u!==void 0)return u.texture;{const p=o.image;return c&&p&&p.height>0||h&&p&&s(p)?(t===null&&(t=new ho(i)),u=c?t.fromEquirectangular(o):t.fromCubemap(o),u.texture.pmremVersion=o.pmremVersion,e.set(o,u),o.addEventListener("dispose",r),u.texture):null}}}return o}function s(o){let l=0;const c=6;for(let h=0;h<c;h++)o[h]!==void 0&&l++;return l===c}function r(o){const l=o.target;l.removeEventListener("dispose",r);const c=e.get(l);c!==void 0&&(e.delete(l),c.dispose())}function a(){e=new WeakMap,t!==null&&(t.dispose(),t=null)}return{get:n,dispose:a}}function _g(i){const e={};function t(n){if(e[n]!==void 0)return e[n];let s;switch(n){case"WEBGL_depth_texture":s=i.getExtension("WEBGL_depth_texture")||i.getExtension("MOZ_WEBGL_depth_texture")||i.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":s=i.getExtension("EXT_texture_filter_anisotropic")||i.getExtension("MOZ_EXT_texture_filter_anisotropic")||i.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":s=i.getExtension("WEBGL_compressed_texture_s3tc")||i.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":s=i.getExtension("WEBGL_compressed_texture_pvrtc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:s=i.getExtension(n)}return e[n]=s,s}return{has:function(n){return t(n)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(n){const s=t(n);return s===null&&Ts("THREE.WebGLRenderer: "+n+" extension not supported."),s}}}function xg(i,e,t,n){const s={},r=new WeakMap;function a(u){const f=u.target;f.index!==null&&e.remove(f.index);for(const g in f.attributes)e.remove(f.attributes[g]);f.removeEventListener("dispose",a),delete s[f.id];const p=r.get(f);p&&(e.remove(p),r.delete(f)),n.releaseStatesOfGeometry(f),f.isInstancedBufferGeometry===!0&&delete f._maxInstanceCount,t.memory.geometries--}function o(u,f){return s[f.id]===!0||(f.addEventListener("dispose",a),s[f.id]=!0,t.memory.geometries++),f}function l(u){const f=u.attributes;for(const p in f)e.update(f[p],i.ARRAY_BUFFER)}function c(u){const f=[],p=u.index,g=u.attributes.position;let _=0;if(p!==null){const b=p.array;_=p.version;for(let E=0,y=b.length;E<y;E+=3){const w=b[E+0],A=b[E+1],P=b[E+2];f.push(w,A,A,P,P,w)}}else if(g!==void 0){const b=g.array;_=g.version;for(let E=0,y=b.length/3-1;E<y;E+=3){const w=E+0,A=E+1,P=E+2;f.push(w,A,A,P,P,w)}}else return;const m=new($c(f)?th:eh)(f,1);m.version=_;const d=r.get(u);d&&e.remove(d),r.set(u,m)}function h(u){const f=r.get(u);if(f){const p=u.index;p!==null&&f.version<p.version&&c(u)}else c(u);return r.get(u)}return{get:o,update:l,getWireframeAttribute:h}}function Sg(i,e,t){let n;function s(f){n=f}let r,a;function o(f){r=f.type,a=f.bytesPerElement}function l(f,p){i.drawElements(n,p,r,f*a),t.update(p,n,1)}function c(f,p,g){g!==0&&(i.drawElementsInstanced(n,p,r,f*a,g),t.update(p,n,g))}function h(f,p,g){if(g===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,p,0,r,f,0,g);let m=0;for(let d=0;d<g;d++)m+=p[d];t.update(m,n,1)}function u(f,p,g,_){if(g===0)return;const m=e.get("WEBGL_multi_draw");if(m===null)for(let d=0;d<f.length;d++)c(f[d]/a,p[d],_[d]);else{m.multiDrawElementsInstancedWEBGL(n,p,0,r,f,0,_,0,g);let d=0;for(let b=0;b<g;b++)d+=p[b]*_[b];t.update(d,n,1)}}this.setMode=s,this.setIndex=o,this.render=l,this.renderInstances=c,this.renderMultiDraw=h,this.renderMultiDrawInstances=u}function vg(i){const e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,a,o){switch(t.calls++,a){case i.TRIANGLES:t.triangles+=o*(r/3);break;case i.LINES:t.lines+=o*(r/2);break;case i.LINE_STRIP:t.lines+=o*(r-1);break;case i.LINE_LOOP:t.lines+=o*r;break;case i.POINTS:t.points+=o*r;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",a);break}}function s(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:s,update:n}}function Mg(i,e,t){const n=new WeakMap,s=new et;function r(a,o,l){const c=a.morphTargetInfluences,h=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,u=h!==void 0?h.length:0;let f=n.get(o);if(f===void 0||f.count!==u){let v=function(){I.dispose(),n.delete(o),o.removeEventListener("dispose",v)};var p=v;f!==void 0&&f.texture.dispose();const g=o.morphAttributes.position!==void 0,_=o.morphAttributes.normal!==void 0,m=o.morphAttributes.color!==void 0,d=o.morphAttributes.position||[],b=o.morphAttributes.normal||[],E=o.morphAttributes.color||[];let y=0;g===!0&&(y=1),_===!0&&(y=2),m===!0&&(y=3);let w=o.attributes.position.count*y,A=1;w>e.maxTextureSize&&(A=Math.ceil(w/e.maxTextureSize),w=e.maxTextureSize);const P=new Float32Array(w*A*4*u),I=new Kc(P,w,A,u);I.type=vn,I.needsUpdate=!0;const M=y*4;for(let C=0;C<u;C++){const F=d[C],z=b[C],X=E[C],V=w*A*4*C;for(let G=0;G<F.count;G++){const $=G*M;g===!0&&(s.fromBufferAttribute(F,G),P[V+$+0]=s.x,P[V+$+1]=s.y,P[V+$+2]=s.z,P[V+$+3]=0),_===!0&&(s.fromBufferAttribute(z,G),P[V+$+4]=s.x,P[V+$+5]=s.y,P[V+$+6]=s.z,P[V+$+7]=0),m===!0&&(s.fromBufferAttribute(X,G),P[V+$+8]=s.x,P[V+$+9]=s.y,P[V+$+10]=s.z,P[V+$+11]=X.itemSize===4?s.w:1)}}f={count:u,texture:I,size:new Ge(w,A)},n.set(o,f),o.addEventListener("dispose",v)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)l.getUniforms().setValue(i,"morphTexture",a.morphTexture,t);else{let g=0;for(let m=0;m<c.length;m++)g+=c[m];const _=o.morphTargetsRelative?1:1-g;l.getUniforms().setValue(i,"morphTargetBaseInfluence",_),l.getUniforms().setValue(i,"morphTargetInfluences",c)}l.getUniforms().setValue(i,"morphTargetsTexture",f.texture,t),l.getUniforms().setValue(i,"morphTargetsTextureSize",f.size)}return{update:r}}function yg(i,e,t,n){let s=new WeakMap;function r(l){const c=n.render.frame,h=l.geometry,u=e.get(l,h);if(s.get(u)!==c&&(e.update(u),s.set(u,c)),l.isInstancedMesh&&(l.hasEventListener("dispose",o)===!1&&l.addEventListener("dispose",o),s.get(l)!==c&&(t.update(l.instanceMatrix,i.ARRAY_BUFFER),l.instanceColor!==null&&t.update(l.instanceColor,i.ARRAY_BUFFER),s.set(l,c))),l.isSkinnedMesh){const f=l.skeleton;s.get(f)!==c&&(f.update(),s.set(f,c))}return u}function a(){s=new WeakMap}function o(l){const c=l.target;c.removeEventListener("dispose",o),t.remove(c.instanceMatrix),c.instanceColor!==null&&t.remove(c.instanceColor)}return{update:r,dispose:a}}const oh=new bt,Yl=new sh(1,1),lh=new Kc,ch=new Wd,hh=new ih,$l=[],Kl=[],Zl=new Float32Array(16),Jl=new Float32Array(9),Ql=new Float32Array(4);function rs(i,e,t){const n=i[0];if(n<=0||n>0)return i;const s=e*t;let r=$l[s];if(r===void 0&&(r=new Float32Array(s),$l[s]=r),e!==0){n.toArray(r,0);for(let a=1,o=0;a!==e;++a)o+=t,i[a].toArray(r,o)}return r}function mt(i,e){if(i.length!==e.length)return!1;for(let t=0,n=i.length;t<n;t++)if(i[t]!==e[t])return!1;return!0}function gt(i,e){for(let t=0,n=e.length;t<n;t++)i[t]=e[t]}function Pr(i,e){let t=Kl[e];t===void 0&&(t=new Int32Array(e),Kl[e]=t);for(let n=0;n!==e;++n)t[n]=i.allocateTextureUnit();return t}function bg(i,e){const t=this.cache;t[0]!==e&&(i.uniform1f(this.addr,e),t[0]=e)}function Eg(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(mt(t,e))return;i.uniform2fv(this.addr,e),gt(t,e)}}function Tg(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(i.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(mt(t,e))return;i.uniform3fv(this.addr,e),gt(t,e)}}function wg(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(mt(t,e))return;i.uniform4fv(this.addr,e),gt(t,e)}}function Ag(i,e){const t=this.cache,n=e.elements;if(n===void 0){if(mt(t,e))return;i.uniformMatrix2fv(this.addr,!1,e),gt(t,e)}else{if(mt(t,n))return;Ql.set(n),i.uniformMatrix2fv(this.addr,!1,Ql),gt(t,n)}}function Rg(i,e){const t=this.cache,n=e.elements;if(n===void 0){if(mt(t,e))return;i.uniformMatrix3fv(this.addr,!1,e),gt(t,e)}else{if(mt(t,n))return;Jl.set(n),i.uniformMatrix3fv(this.addr,!1,Jl),gt(t,n)}}function Cg(i,e){const t=this.cache,n=e.elements;if(n===void 0){if(mt(t,e))return;i.uniformMatrix4fv(this.addr,!1,e),gt(t,e)}else{if(mt(t,n))return;Zl.set(n),i.uniformMatrix4fv(this.addr,!1,Zl),gt(t,n)}}function Pg(i,e){const t=this.cache;t[0]!==e&&(i.uniform1i(this.addr,e),t[0]=e)}function Lg(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(mt(t,e))return;i.uniform2iv(this.addr,e),gt(t,e)}}function Dg(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(mt(t,e))return;i.uniform3iv(this.addr,e),gt(t,e)}}function Ig(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(mt(t,e))return;i.uniform4iv(this.addr,e),gt(t,e)}}function Og(i,e){const t=this.cache;t[0]!==e&&(i.uniform1ui(this.addr,e),t[0]=e)}function Ng(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(mt(t,e))return;i.uniform2uiv(this.addr,e),gt(t,e)}}function Fg(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(mt(t,e))return;i.uniform3uiv(this.addr,e),gt(t,e)}}function Ug(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(mt(t,e))return;i.uniform4uiv(this.addr,e),gt(t,e)}}function zg(i,e,t){const n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);let r;this.type===i.SAMPLER_2D_SHADOW?(Yl.compareFunction=Yc,r=Yl):r=oh,t.setTexture2D(e||r,s)}function Bg(i,e,t){const n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture3D(e||ch,s)}function Hg(i,e,t){const n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTextureCube(e||hh,s)}function kg(i,e,t){const n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture2DArray(e||lh,s)}function Gg(i){switch(i){case 5126:return bg;case 35664:return Eg;case 35665:return Tg;case 35666:return wg;case 35674:return Ag;case 35675:return Rg;case 35676:return Cg;case 5124:case 35670:return Pg;case 35667:case 35671:return Lg;case 35668:case 35672:return Dg;case 35669:case 35673:return Ig;case 5125:return Og;case 36294:return Ng;case 36295:return Fg;case 36296:return Ug;case 35678:case 36198:case 36298:case 36306:case 35682:return zg;case 35679:case 36299:case 36307:return Bg;case 35680:case 36300:case 36308:case 36293:return Hg;case 36289:case 36303:case 36311:case 36292:return kg}}function Vg(i,e){i.uniform1fv(this.addr,e)}function Wg(i,e){const t=rs(e,this.size,2);i.uniform2fv(this.addr,t)}function Xg(i,e){const t=rs(e,this.size,3);i.uniform3fv(this.addr,t)}function qg(i,e){const t=rs(e,this.size,4);i.uniform4fv(this.addr,t)}function jg(i,e){const t=rs(e,this.size,4);i.uniformMatrix2fv(this.addr,!1,t)}function Yg(i,e){const t=rs(e,this.size,9);i.uniformMatrix3fv(this.addr,!1,t)}function $g(i,e){const t=rs(e,this.size,16);i.uniformMatrix4fv(this.addr,!1,t)}function Kg(i,e){i.uniform1iv(this.addr,e)}function Zg(i,e){i.uniform2iv(this.addr,e)}function Jg(i,e){i.uniform3iv(this.addr,e)}function Qg(i,e){i.uniform4iv(this.addr,e)}function e0(i,e){i.uniform1uiv(this.addr,e)}function t0(i,e){i.uniform2uiv(this.addr,e)}function n0(i,e){i.uniform3uiv(this.addr,e)}function i0(i,e){i.uniform4uiv(this.addr,e)}function s0(i,e,t){const n=this.cache,s=e.length,r=Pr(t,s);mt(n,r)||(i.uniform1iv(this.addr,r),gt(n,r));for(let a=0;a!==s;++a)t.setTexture2D(e[a]||oh,r[a])}function r0(i,e,t){const n=this.cache,s=e.length,r=Pr(t,s);mt(n,r)||(i.uniform1iv(this.addr,r),gt(n,r));for(let a=0;a!==s;++a)t.setTexture3D(e[a]||ch,r[a])}function a0(i,e,t){const n=this.cache,s=e.length,r=Pr(t,s);mt(n,r)||(i.uniform1iv(this.addr,r),gt(n,r));for(let a=0;a!==s;++a)t.setTextureCube(e[a]||hh,r[a])}function o0(i,e,t){const n=this.cache,s=e.length,r=Pr(t,s);mt(n,r)||(i.uniform1iv(this.addr,r),gt(n,r));for(let a=0;a!==s;++a)t.setTexture2DArray(e[a]||lh,r[a])}function l0(i){switch(i){case 5126:return Vg;case 35664:return Wg;case 35665:return Xg;case 35666:return qg;case 35674:return jg;case 35675:return Yg;case 35676:return $g;case 5124:case 35670:return Kg;case 35667:case 35671:return Zg;case 35668:case 35672:return Jg;case 35669:case 35673:return Qg;case 5125:return e0;case 36294:return t0;case 36295:return n0;case 36296:return i0;case 35678:case 36198:case 36298:case 36306:case 35682:return s0;case 35679:case 36299:case 36307:return r0;case 35680:case 36300:case 36308:case 36293:return a0;case 36289:case 36303:case 36311:case 36292:return o0}}class c0{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=Gg(t.type)}}class h0{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=l0(t.type)}}class u0{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){const s=this.seq;for(let r=0,a=s.length;r!==a;++r){const o=s[r];o.setValue(e,t[o.id],n)}}}const da=/(\w+)(\])?(\[|\.)?/g;function ec(i,e){i.seq.push(e),i.map[e.id]=e}function d0(i,e,t){const n=i.name,s=n.length;for(da.lastIndex=0;;){const r=da.exec(n),a=da.lastIndex;let o=r[1];const l=r[2]==="]",c=r[3];if(l&&(o=o|0),c===void 0||c==="["&&a+2===s){ec(t,c===void 0?new c0(o,i,e):new h0(o,i,e));break}else{let u=t.map[o];u===void 0&&(u=new u0(o),ec(t,u)),t=u}}}class _r{constructor(e,t){this.seq=[],this.map={};const n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let s=0;s<n;++s){const r=e.getActiveUniform(t,s),a=e.getUniformLocation(t,r.name);d0(r,a,this)}}setValue(e,t,n,s){const r=this.map[t];r!==void 0&&r.setValue(e,n,s)}setOptional(e,t,n){const s=t[n];s!==void 0&&this.setValue(e,n,s)}static upload(e,t,n,s){for(let r=0,a=t.length;r!==a;++r){const o=t[r],l=n[o.id];l.needsUpdate!==!1&&o.setValue(e,l.value,s)}}static seqWithValue(e,t){const n=[];for(let s=0,r=e.length;s!==r;++s){const a=e[s];a.id in t&&n.push(a)}return n}}function tc(i,e,t){const n=i.createShader(e);return i.shaderSource(n,t),i.compileShader(n),n}const f0=37297;let p0=0;function m0(i,e){const t=i.split(`
`),n=[],s=Math.max(e-6,0),r=Math.min(e+6,t.length);for(let a=s;a<r;a++){const o=a+1;n.push(`${o===e?">":" "} ${o}: ${t[a]}`)}return n.join(`
`)}const nc=new Be;function g0(i){$e._getMatrix(nc,$e.workingColorSpace,i);const e=`mat3( ${nc.elements.map(t=>t.toFixed(4))} )`;switch($e.getTransfer(i)){case Mr:return[e,"LinearTransferOETF"];case Qe:return[e,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space: ",i),[e,"LinearTransferOETF"]}}function ic(i,e,t){const n=i.getShaderParameter(e,i.COMPILE_STATUS),r=(i.getShaderInfoLog(e)||"").trim();if(n&&r==="")return"";const a=/ERROR: 0:(\d+)/.exec(r);if(a){const o=parseInt(a[1]);return t.toUpperCase()+`

`+r+`

`+m0(i.getShaderSource(e),o)}else return r}function _0(i,e){const t=g0(e);return[`vec4 ${i}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}function x0(i,e){let t;switch(e){case id:t="Linear";break;case sd:t="Reinhard";break;case rd:t="Cineon";break;case Bc:t="ACESFilmic";break;case od:t="AgX";break;case ld:t="Neutral";break;case ad:t="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",e),t="Linear"}return"vec3 "+i+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}const or=new L;function S0(){$e.getLuminanceCoefficients(or);const i=or.x.toFixed(4),e=or.y.toFixed(4),t=or.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${i}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function v0(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(gs).join(`
`)}function M0(i){const e=[];for(const t in i){const n=i[t];n!==!1&&e.push("#define "+t+" "+n)}return e.join(`
`)}function y0(i,e){const t={},n=i.getProgramParameter(e,i.ACTIVE_ATTRIBUTES);for(let s=0;s<n;s++){const r=i.getActiveAttrib(e,s),a=r.name;let o=1;r.type===i.FLOAT_MAT2&&(o=2),r.type===i.FLOAT_MAT3&&(o=3),r.type===i.FLOAT_MAT4&&(o=4),t[a]={type:r.type,location:i.getAttribLocation(e,a),locationSize:o}}return t}function gs(i){return i!==""}function sc(i,e){const t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return i.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function rc(i,e){return i.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}const b0=/^[ \t]*#include +<([\w\d./]+)>/gm;function uo(i){return i.replace(b0,T0)}const E0=new Map;function T0(i,e){let t=ke[e];if(t===void 0){const n=E0.get(e);if(n!==void 0)t=ke[n],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,n);else throw new Error("Can not resolve #include <"+e+">")}return uo(t)}const w0=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function ac(i){return i.replace(w0,A0)}function A0(i,e,t,n){let s="";for(let r=parseInt(e);r<parseInt(t);r++)s+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function oc(i){let e=`precision ${i.precision} float;
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
#define LOW_PRECISION`),e}function R0(i){let e="SHADOWMAP_TYPE_BASIC";return i.shadowMapType===Uc?e="SHADOWMAP_TYPE_PCF":i.shadowMapType===zc?e="SHADOWMAP_TYPE_PCF_SOFT":i.shadowMapType===Pn&&(e="SHADOWMAP_TYPE_VSM"),e}function C0(i){let e="ENVMAP_TYPE_CUBE";if(i.envMap)switch(i.envMapMode){case Ji:case Qi:e="ENVMAP_TYPE_CUBE";break;case Rr:e="ENVMAP_TYPE_CUBE_UV";break}return e}function P0(i){let e="ENVMAP_MODE_REFLECTION";return i.envMap&&i.envMapMode===Qi&&(e="ENVMAP_MODE_REFRACTION"),e}function L0(i){let e="ENVMAP_BLENDING_NONE";if(i.envMap)switch(i.combine){case go:e="ENVMAP_BLENDING_MULTIPLY";break;case td:e="ENVMAP_BLENDING_MIX";break;case nd:e="ENVMAP_BLENDING_ADD";break}return e}function D0(i){const e=i.envMapCubeUVHeight;if(e===null)return null;const t=Math.log2(e)-2,n=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:n,maxMip:t}}function I0(i,e,t,n){const s=i.getContext(),r=t.defines;let a=t.vertexShader,o=t.fragmentShader;const l=R0(t),c=C0(t),h=P0(t),u=L0(t),f=D0(t),p=v0(t),g=M0(r),_=s.createProgram();let m,d,b=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(m=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(gs).join(`
`),m.length>0&&(m+=`
`),d=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(gs).join(`
`),d.length>0&&(d+=`
`)):(m=[oc(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+h:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(gs).join(`
`),d=[oc(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+c:"",t.envMap?"#define "+h:"",t.envMap?"#define "+u:"",f?"#define CUBEUV_TEXEL_WIDTH "+f.texelWidth:"",f?"#define CUBEUV_TEXEL_HEIGHT "+f.texelHeight:"",f?"#define CUBEUV_MAX_MIP "+f.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor||t.batchingColor?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==Zn?"#define TONE_MAPPING":"",t.toneMapping!==Zn?ke.tonemapping_pars_fragment:"",t.toneMapping!==Zn?x0("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",ke.colorspace_pars_fragment,_0("linearToOutputTexel",t.outputColorSpace),S0(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(gs).join(`
`)),a=uo(a),a=sc(a,t),a=rc(a,t),o=uo(o),o=sc(o,t),o=rc(o,t),a=ac(a),o=ac(o),t.isRawShaderMaterial!==!0&&(b=`#version 300 es
`,m=[p,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,d=["#define varying in",t.glslVersion===cl?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===cl?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+d);const E=b+m+a,y=b+d+o,w=tc(s,s.VERTEX_SHADER,E),A=tc(s,s.FRAGMENT_SHADER,y);s.attachShader(_,w),s.attachShader(_,A),t.index0AttributeName!==void 0?s.bindAttribLocation(_,0,t.index0AttributeName):t.morphTargets===!0&&s.bindAttribLocation(_,0,"position"),s.linkProgram(_);function P(C){if(i.debug.checkShaderErrors){const F=s.getProgramInfoLog(_)||"",z=s.getShaderInfoLog(w)||"",X=s.getShaderInfoLog(A)||"",V=F.trim(),G=z.trim(),$=X.trim();let B=!0,ie=!0;if(s.getProgramParameter(_,s.LINK_STATUS)===!1)if(B=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(s,_,w,A);else{const re=ic(s,w,"vertex"),_e=ic(s,A,"fragment");console.error("THREE.WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(_,s.VALIDATE_STATUS)+`

Material Name: `+C.name+`
Material Type: `+C.type+`

Program Info Log: `+V+`
`+re+`
`+_e)}else V!==""?console.warn("THREE.WebGLProgram: Program Info Log:",V):(G===""||$==="")&&(ie=!1);ie&&(C.diagnostics={runnable:B,programLog:V,vertexShader:{log:G,prefix:m},fragmentShader:{log:$,prefix:d}})}s.deleteShader(w),s.deleteShader(A),I=new _r(s,_),M=y0(s,_)}let I;this.getUniforms=function(){return I===void 0&&P(this),I};let M;this.getAttributes=function(){return M===void 0&&P(this),M};let v=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return v===!1&&(v=s.getProgramParameter(_,f0)),v},this.destroy=function(){n.releaseStatesOfProgram(this),s.deleteProgram(_),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=p0++,this.cacheKey=e,this.usedTimes=1,this.program=_,this.vertexShader=w,this.fragmentShader=A,this}let O0=0;class N0{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){const t=e.vertexShader,n=e.fragmentShader,s=this._getShaderStage(t),r=this._getShaderStage(n),a=this._getShaderCacheForMaterial(e);return a.has(s)===!1&&(a.add(s),s.usedTimes++),a.has(r)===!1&&(a.add(r),r.usedTimes++),this}remove(e){const t=this.materialCache.get(e);for(const n of t)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){const t=this.materialCache;let n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){const t=this.shaderCache;let n=t.get(e);return n===void 0&&(n=new F0(e),t.set(e,n)),n}}class F0{constructor(e){this.id=O0++,this.code=e,this.usedTimes=0}}function U0(i,e,t,n,s,r,a){const o=new Jc,l=new N0,c=new Set,h=[],u=s.logarithmicDepthBuffer,f=s.vertexTextures;let p=s.precision;const g={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function _(M){return c.add(M),M===0?"uv":`uv${M}`}function m(M,v,C,F,z){const X=F.fog,V=z.geometry,G=M.isMeshStandardMaterial?F.environment:null,$=(M.isMeshStandardMaterial?t:e).get(M.envMap||G),B=$&&$.mapping===Rr?$.image.height:null,ie=g[M.type];M.precision!==null&&(p=s.getMaxPrecision(M.precision),p!==M.precision&&console.warn("THREE.WebGLProgram.getParameters:",M.precision,"not supported, using",p,"instead."));const re=V.morphAttributes.position||V.morphAttributes.normal||V.morphAttributes.color,_e=re!==void 0?re.length:0;let Ie=0;V.morphAttributes.position!==void 0&&(Ie=1),V.morphAttributes.normal!==void 0&&(Ie=2),V.morphAttributes.color!==void 0&&(Ie=3);let He,Xe,Oe,j;if(ie){const Ke=Sn[ie];He=Ke.vertexShader,Xe=Ke.fragmentShader}else He=M.vertexShader,Xe=M.fragmentShader,l.update(M),Oe=l.getVertexShaderID(M),j=l.getFragmentShaderID(M);const K=i.getRenderTarget(),le=i.state.buffers.depth.getReversed(),Me=z.isInstancedMesh===!0,de=z.isBatchedMesh===!0,ae=!!M.map,Ae=!!M.matcap,R=!!$,qe=!!M.aoMap,Le=!!M.lightMap,Te=!!M.bumpMap,pe=!!M.normalMap,Ze=!!M.displacementMap,fe=!!M.emissiveMap,Fe=!!M.metalnessMap,lt=!!M.roughnessMap,st=M.anisotropy>0,T=M.clearcoat>0,x=M.dispersion>0,U=M.iridescence>0,q=M.sheen>0,Z=M.transmission>0,W=st&&!!M.anisotropyMap,Ee=T&&!!M.clearcoatMap,ne=T&&!!M.clearcoatNormalMap,ve=T&&!!M.clearcoatRoughnessMap,ye=U&&!!M.iridescenceMap,ee=U&&!!M.iridescenceThicknessMap,ue=q&&!!M.sheenColorMap,Pe=q&&!!M.sheenRoughnessMap,be=!!M.specularMap,ce=!!M.specularColorMap,ze=!!M.specularIntensityMap,D=Z&&!!M.transmissionMap,te=Z&&!!M.thicknessMap,se=!!M.gradientMap,ge=!!M.alphaMap,J=M.alphaTest>0,Y=!!M.alphaHash,Se=!!M.extensions;let Ue=Zn;M.toneMapped&&(K===null||K.isXRRenderTarget===!0)&&(Ue=i.toneMapping);const it={shaderID:ie,shaderType:M.type,shaderName:M.name,vertexShader:He,fragmentShader:Xe,defines:M.defines,customVertexShaderID:Oe,customFragmentShaderID:j,isRawShaderMaterial:M.isRawShaderMaterial===!0,glslVersion:M.glslVersion,precision:p,batching:de,batchingColor:de&&z._colorsTexture!==null,instancing:Me,instancingColor:Me&&z.instanceColor!==null,instancingMorph:Me&&z.morphTexture!==null,supportsVertexTextures:f,outputColorSpace:K===null?i.outputColorSpace:K.isXRRenderTarget===!0?K.texture.colorSpace:es,alphaToCoverage:!!M.alphaToCoverage,map:ae,matcap:Ae,envMap:R,envMapMode:R&&$.mapping,envMapCubeUVHeight:B,aoMap:qe,lightMap:Le,bumpMap:Te,normalMap:pe,displacementMap:f&&Ze,emissiveMap:fe,normalMapObjectSpace:pe&&M.normalMapType===dd,normalMapTangentSpace:pe&&M.normalMapType===Eo,metalnessMap:Fe,roughnessMap:lt,anisotropy:st,anisotropyMap:W,clearcoat:T,clearcoatMap:Ee,clearcoatNormalMap:ne,clearcoatRoughnessMap:ve,dispersion:x,iridescence:U,iridescenceMap:ye,iridescenceThicknessMap:ee,sheen:q,sheenColorMap:ue,sheenRoughnessMap:Pe,specularMap:be,specularColorMap:ce,specularIntensityMap:ze,transmission:Z,transmissionMap:D,thicknessMap:te,gradientMap:se,opaque:M.transparent===!1&&M.blending===$i&&M.alphaToCoverage===!1,alphaMap:ge,alphaTest:J,alphaHash:Y,combine:M.combine,mapUv:ae&&_(M.map.channel),aoMapUv:qe&&_(M.aoMap.channel),lightMapUv:Le&&_(M.lightMap.channel),bumpMapUv:Te&&_(M.bumpMap.channel),normalMapUv:pe&&_(M.normalMap.channel),displacementMapUv:Ze&&_(M.displacementMap.channel),emissiveMapUv:fe&&_(M.emissiveMap.channel),metalnessMapUv:Fe&&_(M.metalnessMap.channel),roughnessMapUv:lt&&_(M.roughnessMap.channel),anisotropyMapUv:W&&_(M.anisotropyMap.channel),clearcoatMapUv:Ee&&_(M.clearcoatMap.channel),clearcoatNormalMapUv:ne&&_(M.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:ve&&_(M.clearcoatRoughnessMap.channel),iridescenceMapUv:ye&&_(M.iridescenceMap.channel),iridescenceThicknessMapUv:ee&&_(M.iridescenceThicknessMap.channel),sheenColorMapUv:ue&&_(M.sheenColorMap.channel),sheenRoughnessMapUv:Pe&&_(M.sheenRoughnessMap.channel),specularMapUv:be&&_(M.specularMap.channel),specularColorMapUv:ce&&_(M.specularColorMap.channel),specularIntensityMapUv:ze&&_(M.specularIntensityMap.channel),transmissionMapUv:D&&_(M.transmissionMap.channel),thicknessMapUv:te&&_(M.thicknessMap.channel),alphaMapUv:ge&&_(M.alphaMap.channel),vertexTangents:!!V.attributes.tangent&&(pe||st),vertexColors:M.vertexColors,vertexAlphas:M.vertexColors===!0&&!!V.attributes.color&&V.attributes.color.itemSize===4,pointsUvs:z.isPoints===!0&&!!V.attributes.uv&&(ae||ge),fog:!!X,useFog:M.fog===!0,fogExp2:!!X&&X.isFogExp2,flatShading:M.flatShading===!0&&M.wireframe===!1,sizeAttenuation:M.sizeAttenuation===!0,logarithmicDepthBuffer:u,reversedDepthBuffer:le,skinning:z.isSkinnedMesh===!0,morphTargets:V.morphAttributes.position!==void 0,morphNormals:V.morphAttributes.normal!==void 0,morphColors:V.morphAttributes.color!==void 0,morphTargetsCount:_e,morphTextureStride:Ie,numDirLights:v.directional.length,numPointLights:v.point.length,numSpotLights:v.spot.length,numSpotLightMaps:v.spotLightMap.length,numRectAreaLights:v.rectArea.length,numHemiLights:v.hemi.length,numDirLightShadows:v.directionalShadowMap.length,numPointLightShadows:v.pointShadowMap.length,numSpotLightShadows:v.spotShadowMap.length,numSpotLightShadowsWithMaps:v.numSpotLightShadowsWithMaps,numLightProbes:v.numLightProbes,numClippingPlanes:a.numPlanes,numClipIntersection:a.numIntersection,dithering:M.dithering,shadowMapEnabled:i.shadowMap.enabled&&C.length>0,shadowMapType:i.shadowMap.type,toneMapping:Ue,decodeVideoTexture:ae&&M.map.isVideoTexture===!0&&$e.getTransfer(M.map.colorSpace)===Qe,decodeVideoTextureEmissive:fe&&M.emissiveMap.isVideoTexture===!0&&$e.getTransfer(M.emissiveMap.colorSpace)===Qe,premultipliedAlpha:M.premultipliedAlpha,doubleSided:M.side===cn,flipSided:M.side===Nt,useDepthPacking:M.depthPacking>=0,depthPacking:M.depthPacking||0,index0AttributeName:M.index0AttributeName,extensionClipCullDistance:Se&&M.extensions.clipCullDistance===!0&&n.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(Se&&M.extensions.multiDraw===!0||de)&&n.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:n.has("KHR_parallel_shader_compile"),customProgramCacheKey:M.customProgramCacheKey()};return it.vertexUv1s=c.has(1),it.vertexUv2s=c.has(2),it.vertexUv3s=c.has(3),c.clear(),it}function d(M){const v=[];if(M.shaderID?v.push(M.shaderID):(v.push(M.customVertexShaderID),v.push(M.customFragmentShaderID)),M.defines!==void 0)for(const C in M.defines)v.push(C),v.push(M.defines[C]);return M.isRawShaderMaterial===!1&&(b(v,M),E(v,M),v.push(i.outputColorSpace)),v.push(M.customProgramCacheKey),v.join()}function b(M,v){M.push(v.precision),M.push(v.outputColorSpace),M.push(v.envMapMode),M.push(v.envMapCubeUVHeight),M.push(v.mapUv),M.push(v.alphaMapUv),M.push(v.lightMapUv),M.push(v.aoMapUv),M.push(v.bumpMapUv),M.push(v.normalMapUv),M.push(v.displacementMapUv),M.push(v.emissiveMapUv),M.push(v.metalnessMapUv),M.push(v.roughnessMapUv),M.push(v.anisotropyMapUv),M.push(v.clearcoatMapUv),M.push(v.clearcoatNormalMapUv),M.push(v.clearcoatRoughnessMapUv),M.push(v.iridescenceMapUv),M.push(v.iridescenceThicknessMapUv),M.push(v.sheenColorMapUv),M.push(v.sheenRoughnessMapUv),M.push(v.specularMapUv),M.push(v.specularColorMapUv),M.push(v.specularIntensityMapUv),M.push(v.transmissionMapUv),M.push(v.thicknessMapUv),M.push(v.combine),M.push(v.fogExp2),M.push(v.sizeAttenuation),M.push(v.morphTargetsCount),M.push(v.morphAttributeCount),M.push(v.numDirLights),M.push(v.numPointLights),M.push(v.numSpotLights),M.push(v.numSpotLightMaps),M.push(v.numHemiLights),M.push(v.numRectAreaLights),M.push(v.numDirLightShadows),M.push(v.numPointLightShadows),M.push(v.numSpotLightShadows),M.push(v.numSpotLightShadowsWithMaps),M.push(v.numLightProbes),M.push(v.shadowMapType),M.push(v.toneMapping),M.push(v.numClippingPlanes),M.push(v.numClipIntersection),M.push(v.depthPacking)}function E(M,v){o.disableAll(),v.supportsVertexTextures&&o.enable(0),v.instancing&&o.enable(1),v.instancingColor&&o.enable(2),v.instancingMorph&&o.enable(3),v.matcap&&o.enable(4),v.envMap&&o.enable(5),v.normalMapObjectSpace&&o.enable(6),v.normalMapTangentSpace&&o.enable(7),v.clearcoat&&o.enable(8),v.iridescence&&o.enable(9),v.alphaTest&&o.enable(10),v.vertexColors&&o.enable(11),v.vertexAlphas&&o.enable(12),v.vertexUv1s&&o.enable(13),v.vertexUv2s&&o.enable(14),v.vertexUv3s&&o.enable(15),v.vertexTangents&&o.enable(16),v.anisotropy&&o.enable(17),v.alphaHash&&o.enable(18),v.batching&&o.enable(19),v.dispersion&&o.enable(20),v.batchingColor&&o.enable(21),v.gradientMap&&o.enable(22),M.push(o.mask),o.disableAll(),v.fog&&o.enable(0),v.useFog&&o.enable(1),v.flatShading&&o.enable(2),v.logarithmicDepthBuffer&&o.enable(3),v.reversedDepthBuffer&&o.enable(4),v.skinning&&o.enable(5),v.morphTargets&&o.enable(6),v.morphNormals&&o.enable(7),v.morphColors&&o.enable(8),v.premultipliedAlpha&&o.enable(9),v.shadowMapEnabled&&o.enable(10),v.doubleSided&&o.enable(11),v.flipSided&&o.enable(12),v.useDepthPacking&&o.enable(13),v.dithering&&o.enable(14),v.transmission&&o.enable(15),v.sheen&&o.enable(16),v.opaque&&o.enable(17),v.pointsUvs&&o.enable(18),v.decodeVideoTexture&&o.enable(19),v.decodeVideoTextureEmissive&&o.enable(20),v.alphaToCoverage&&o.enable(21),M.push(o.mask)}function y(M){const v=g[M.type];let C;if(v){const F=Sn[v];C=sf.clone(F.uniforms)}else C=M.uniforms;return C}function w(M,v){let C;for(let F=0,z=h.length;F<z;F++){const X=h[F];if(X.cacheKey===v){C=X,++C.usedTimes;break}}return C===void 0&&(C=new I0(i,v,M,r),h.push(C)),C}function A(M){if(--M.usedTimes===0){const v=h.indexOf(M);h[v]=h[h.length-1],h.pop(),M.destroy()}}function P(M){l.remove(M)}function I(){l.dispose()}return{getParameters:m,getProgramCacheKey:d,getUniforms:y,acquireProgram:w,releaseProgram:A,releaseShaderCache:P,programs:h,dispose:I}}function z0(){let i=new WeakMap;function e(a){return i.has(a)}function t(a){let o=i.get(a);return o===void 0&&(o={},i.set(a,o)),o}function n(a){i.delete(a)}function s(a,o,l){i.get(a)[o]=l}function r(){i=new WeakMap}return{has:e,get:t,remove:n,update:s,dispose:r}}function B0(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.material.id!==e.material.id?i.material.id-e.material.id:i.z!==e.z?i.z-e.z:i.id-e.id}function lc(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.z!==e.z?e.z-i.z:i.id-e.id}function cc(){const i=[];let e=0;const t=[],n=[],s=[];function r(){e=0,t.length=0,n.length=0,s.length=0}function a(u,f,p,g,_,m){let d=i[e];return d===void 0?(d={id:u.id,object:u,geometry:f,material:p,groupOrder:g,renderOrder:u.renderOrder,z:_,group:m},i[e]=d):(d.id=u.id,d.object=u,d.geometry=f,d.material=p,d.groupOrder=g,d.renderOrder=u.renderOrder,d.z=_,d.group=m),e++,d}function o(u,f,p,g,_,m){const d=a(u,f,p,g,_,m);p.transmission>0?n.push(d):p.transparent===!0?s.push(d):t.push(d)}function l(u,f,p,g,_,m){const d=a(u,f,p,g,_,m);p.transmission>0?n.unshift(d):p.transparent===!0?s.unshift(d):t.unshift(d)}function c(u,f){t.length>1&&t.sort(u||B0),n.length>1&&n.sort(f||lc),s.length>1&&s.sort(f||lc)}function h(){for(let u=e,f=i.length;u<f;u++){const p=i[u];if(p.id===null)break;p.id=null,p.object=null,p.geometry=null,p.material=null,p.group=null}}return{opaque:t,transmissive:n,transparent:s,init:r,push:o,unshift:l,finish:h,sort:c}}function H0(){let i=new WeakMap;function e(n,s){const r=i.get(n);let a;return r===void 0?(a=new cc,i.set(n,[a])):s>=r.length?(a=new cc,r.push(a)):a=r[s],a}function t(){i=new WeakMap}return{get:e,dispose:t}}function k0(){const i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new L,color:new Ne};break;case"SpotLight":t={position:new L,direction:new L,color:new Ne,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new L,color:new Ne,distance:0,decay:0};break;case"HemisphereLight":t={direction:new L,skyColor:new Ne,groundColor:new Ne};break;case"RectAreaLight":t={color:new Ne,position:new L,halfWidth:new L,halfHeight:new L};break}return i[e.id]=t,t}}}function G0(){const i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Ge};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Ge};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Ge,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[e.id]=t,t}}}let V0=0;function W0(i,e){return(e.castShadow?2:0)-(i.castShadow?2:0)+(e.map?1:0)-(i.map?1:0)}function X0(i){const e=new k0,t=G0(),n={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)n.probe.push(new L);const s=new L,r=new je,a=new je;function o(c){let h=0,u=0,f=0;for(let M=0;M<9;M++)n.probe[M].set(0,0,0);let p=0,g=0,_=0,m=0,d=0,b=0,E=0,y=0,w=0,A=0,P=0;c.sort(W0);for(let M=0,v=c.length;M<v;M++){const C=c[M],F=C.color,z=C.intensity,X=C.distance,V=C.shadow&&C.shadow.map?C.shadow.map.texture:null;if(C.isAmbientLight)h+=F.r*z,u+=F.g*z,f+=F.b*z;else if(C.isLightProbe){for(let G=0;G<9;G++)n.probe[G].addScaledVector(C.sh.coefficients[G],z);P++}else if(C.isDirectionalLight){const G=e.get(C);if(G.color.copy(C.color).multiplyScalar(C.intensity),C.castShadow){const $=C.shadow,B=t.get(C);B.shadowIntensity=$.intensity,B.shadowBias=$.bias,B.shadowNormalBias=$.normalBias,B.shadowRadius=$.radius,B.shadowMapSize=$.mapSize,n.directionalShadow[p]=B,n.directionalShadowMap[p]=V,n.directionalShadowMatrix[p]=C.shadow.matrix,b++}n.directional[p]=G,p++}else if(C.isSpotLight){const G=e.get(C);G.position.setFromMatrixPosition(C.matrixWorld),G.color.copy(F).multiplyScalar(z),G.distance=X,G.coneCos=Math.cos(C.angle),G.penumbraCos=Math.cos(C.angle*(1-C.penumbra)),G.decay=C.decay,n.spot[_]=G;const $=C.shadow;if(C.map&&(n.spotLightMap[w]=C.map,w++,$.updateMatrices(C),C.castShadow&&A++),n.spotLightMatrix[_]=$.matrix,C.castShadow){const B=t.get(C);B.shadowIntensity=$.intensity,B.shadowBias=$.bias,B.shadowNormalBias=$.normalBias,B.shadowRadius=$.radius,B.shadowMapSize=$.mapSize,n.spotShadow[_]=B,n.spotShadowMap[_]=V,y++}_++}else if(C.isRectAreaLight){const G=e.get(C);G.color.copy(F).multiplyScalar(z),G.halfWidth.set(C.width*.5,0,0),G.halfHeight.set(0,C.height*.5,0),n.rectArea[m]=G,m++}else if(C.isPointLight){const G=e.get(C);if(G.color.copy(C.color).multiplyScalar(C.intensity),G.distance=C.distance,G.decay=C.decay,C.castShadow){const $=C.shadow,B=t.get(C);B.shadowIntensity=$.intensity,B.shadowBias=$.bias,B.shadowNormalBias=$.normalBias,B.shadowRadius=$.radius,B.shadowMapSize=$.mapSize,B.shadowCameraNear=$.camera.near,B.shadowCameraFar=$.camera.far,n.pointShadow[g]=B,n.pointShadowMap[g]=V,n.pointShadowMatrix[g]=C.shadow.matrix,E++}n.point[g]=G,g++}else if(C.isHemisphereLight){const G=e.get(C);G.skyColor.copy(C.color).multiplyScalar(z),G.groundColor.copy(C.groundColor).multiplyScalar(z),n.hemi[d]=G,d++}}m>0&&(i.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=oe.LTC_FLOAT_1,n.rectAreaLTC2=oe.LTC_FLOAT_2):(n.rectAreaLTC1=oe.LTC_HALF_1,n.rectAreaLTC2=oe.LTC_HALF_2)),n.ambient[0]=h,n.ambient[1]=u,n.ambient[2]=f;const I=n.hash;(I.directionalLength!==p||I.pointLength!==g||I.spotLength!==_||I.rectAreaLength!==m||I.hemiLength!==d||I.numDirectionalShadows!==b||I.numPointShadows!==E||I.numSpotShadows!==y||I.numSpotMaps!==w||I.numLightProbes!==P)&&(n.directional.length=p,n.spot.length=_,n.rectArea.length=m,n.point.length=g,n.hemi.length=d,n.directionalShadow.length=b,n.directionalShadowMap.length=b,n.pointShadow.length=E,n.pointShadowMap.length=E,n.spotShadow.length=y,n.spotShadowMap.length=y,n.directionalShadowMatrix.length=b,n.pointShadowMatrix.length=E,n.spotLightMatrix.length=y+w-A,n.spotLightMap.length=w,n.numSpotLightShadowsWithMaps=A,n.numLightProbes=P,I.directionalLength=p,I.pointLength=g,I.spotLength=_,I.rectAreaLength=m,I.hemiLength=d,I.numDirectionalShadows=b,I.numPointShadows=E,I.numSpotShadows=y,I.numSpotMaps=w,I.numLightProbes=P,n.version=V0++)}function l(c,h){let u=0,f=0,p=0,g=0,_=0;const m=h.matrixWorldInverse;for(let d=0,b=c.length;d<b;d++){const E=c[d];if(E.isDirectionalLight){const y=n.directional[u];y.direction.setFromMatrixPosition(E.matrixWorld),s.setFromMatrixPosition(E.target.matrixWorld),y.direction.sub(s),y.direction.transformDirection(m),u++}else if(E.isSpotLight){const y=n.spot[p];y.position.setFromMatrixPosition(E.matrixWorld),y.position.applyMatrix4(m),y.direction.setFromMatrixPosition(E.matrixWorld),s.setFromMatrixPosition(E.target.matrixWorld),y.direction.sub(s),y.direction.transformDirection(m),p++}else if(E.isRectAreaLight){const y=n.rectArea[g];y.position.setFromMatrixPosition(E.matrixWorld),y.position.applyMatrix4(m),a.identity(),r.copy(E.matrixWorld),r.premultiply(m),a.extractRotation(r),y.halfWidth.set(E.width*.5,0,0),y.halfHeight.set(0,E.height*.5,0),y.halfWidth.applyMatrix4(a),y.halfHeight.applyMatrix4(a),g++}else if(E.isPointLight){const y=n.point[f];y.position.setFromMatrixPosition(E.matrixWorld),y.position.applyMatrix4(m),f++}else if(E.isHemisphereLight){const y=n.hemi[_];y.direction.setFromMatrixPosition(E.matrixWorld),y.direction.transformDirection(m),_++}}}return{setup:o,setupView:l,state:n}}function hc(i){const e=new X0(i),t=[],n=[];function s(h){c.camera=h,t.length=0,n.length=0}function r(h){t.push(h)}function a(h){n.push(h)}function o(){e.setup(t)}function l(h){e.setupView(t,h)}const c={lightsArray:t,shadowsArray:n,camera:null,lights:e,transmissionRenderTarget:{}};return{init:s,state:c,setupLights:o,setupLightsView:l,pushLight:r,pushShadow:a}}function q0(i){let e=new WeakMap;function t(s,r=0){const a=e.get(s);let o;return a===void 0?(o=new hc(i),e.set(s,[o])):r>=a.length?(o=new hc(i),a.push(o)):o=a[r],o}function n(){e=new WeakMap}return{get:t,dispose:n}}const j0=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,Y0=`uniform sampler2D shadow_pass;
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
}`;function $0(i,e,t){let n=new Po;const s=new Ge,r=new Ge,a=new et,o=new _f({depthPacking:ud}),l=new xf,c={},h=t.maxTextureSize,u={[Jn]:Nt,[Nt]:Jn,[cn]:cn},f=new ei({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Ge},radius:{value:4}},vertexShader:j0,fragmentShader:Y0}),p=f.clone();p.defines.HORIZONTAL_PASS=1;const g=new vt;g.setAttribute("position",new Ot(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const _=new ht(g,f),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Uc;let d=this.type;this.render=function(A,P,I){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||A.length===0)return;const M=i.getRenderTarget(),v=i.getActiveCubeFace(),C=i.getActiveMipmapLevel(),F=i.state;F.setBlending(Kn),F.buffers.depth.getReversed()===!0?F.buffers.color.setClear(0,0,0,0):F.buffers.color.setClear(1,1,1,1),F.buffers.depth.setTest(!0),F.setScissorTest(!1);const z=d!==Pn&&this.type===Pn,X=d===Pn&&this.type!==Pn;for(let V=0,G=A.length;V<G;V++){const $=A[V],B=$.shadow;if(B===void 0){console.warn("THREE.WebGLShadowMap:",$,"has no shadow.");continue}if(B.autoUpdate===!1&&B.needsUpdate===!1)continue;s.copy(B.mapSize);const ie=B.getFrameExtents();if(s.multiply(ie),r.copy(B.mapSize),(s.x>h||s.y>h)&&(s.x>h&&(r.x=Math.floor(h/ie.x),s.x=r.x*ie.x,B.mapSize.x=r.x),s.y>h&&(r.y=Math.floor(h/ie.y),s.y=r.y*ie.y,B.mapSize.y=r.y)),B.map===null||z===!0||X===!0){const _e=this.type!==Pn?{minFilter:jt,magFilter:jt}:{};B.map!==null&&B.map.dispose(),B.map=new Qn(s.x,s.y,_e),B.map.texture.name=$.name+".shadowMap",B.camera.updateProjectionMatrix()}i.setRenderTarget(B.map),i.clear();const re=B.getViewportCount();for(let _e=0;_e<re;_e++){const Ie=B.getViewport(_e);a.set(r.x*Ie.x,r.y*Ie.y,r.x*Ie.z,r.y*Ie.w),F.viewport(a),B.updateMatrices($,_e),n=B.getFrustum(),y(P,I,B.camera,$,this.type)}B.isPointLightShadow!==!0&&this.type===Pn&&b(B,I),B.needsUpdate=!1}d=this.type,m.needsUpdate=!1,i.setRenderTarget(M,v,C)};function b(A,P){const I=e.update(_);f.defines.VSM_SAMPLES!==A.blurSamples&&(f.defines.VSM_SAMPLES=A.blurSamples,p.defines.VSM_SAMPLES=A.blurSamples,f.needsUpdate=!0,p.needsUpdate=!0),A.mapPass===null&&(A.mapPass=new Qn(s.x,s.y)),f.uniforms.shadow_pass.value=A.map.texture,f.uniforms.resolution.value=A.mapSize,f.uniforms.radius.value=A.radius,i.setRenderTarget(A.mapPass),i.clear(),i.renderBufferDirect(P,null,I,f,_,null),p.uniforms.shadow_pass.value=A.mapPass.texture,p.uniforms.resolution.value=A.mapSize,p.uniforms.radius.value=A.radius,i.setRenderTarget(A.map),i.clear(),i.renderBufferDirect(P,null,I,p,_,null)}function E(A,P,I,M){let v=null;const C=I.isPointLight===!0?A.customDistanceMaterial:A.customDepthMaterial;if(C!==void 0)v=C;else if(v=I.isPointLight===!0?l:o,i.localClippingEnabled&&P.clipShadows===!0&&Array.isArray(P.clippingPlanes)&&P.clippingPlanes.length!==0||P.displacementMap&&P.displacementScale!==0||P.alphaMap&&P.alphaTest>0||P.map&&P.alphaTest>0||P.alphaToCoverage===!0){const F=v.uuid,z=P.uuid;let X=c[F];X===void 0&&(X={},c[F]=X);let V=X[z];V===void 0&&(V=v.clone(),X[z]=V,P.addEventListener("dispose",w)),v=V}if(v.visible=P.visible,v.wireframe=P.wireframe,M===Pn?v.side=P.shadowSide!==null?P.shadowSide:P.side:v.side=P.shadowSide!==null?P.shadowSide:u[P.side],v.alphaMap=P.alphaMap,v.alphaTest=P.alphaToCoverage===!0?.5:P.alphaTest,v.map=P.map,v.clipShadows=P.clipShadows,v.clippingPlanes=P.clippingPlanes,v.clipIntersection=P.clipIntersection,v.displacementMap=P.displacementMap,v.displacementScale=P.displacementScale,v.displacementBias=P.displacementBias,v.wireframeLinewidth=P.wireframeLinewidth,v.linewidth=P.linewidth,I.isPointLight===!0&&v.isMeshDistanceMaterial===!0){const F=i.properties.get(v);F.light=I}return v}function y(A,P,I,M,v){if(A.visible===!1)return;if(A.layers.test(P.layers)&&(A.isMesh||A.isLine||A.isPoints)&&(A.castShadow||A.receiveShadow&&v===Pn)&&(!A.frustumCulled||n.intersectsObject(A))){A.modelViewMatrix.multiplyMatrices(I.matrixWorldInverse,A.matrixWorld);const z=e.update(A),X=A.material;if(Array.isArray(X)){const V=z.groups;for(let G=0,$=V.length;G<$;G++){const B=V[G],ie=X[B.materialIndex];if(ie&&ie.visible){const re=E(A,ie,M,v);A.onBeforeShadow(i,A,P,I,z,re,B),i.renderBufferDirect(I,null,z,re,A,B),A.onAfterShadow(i,A,P,I,z,re,B)}}}else if(X.visible){const V=E(A,X,M,v);A.onBeforeShadow(i,A,P,I,z,V,null),i.renderBufferDirect(I,null,z,V,A,null),A.onAfterShadow(i,A,P,I,z,V,null)}}const F=A.children;for(let z=0,X=F.length;z<X;z++)y(F[z],P,I,M,v)}function w(A){A.target.removeEventListener("dispose",w);for(const I in c){const M=c[I],v=A.target.uuid;v in M&&(M[v].dispose(),delete M[v])}}}const K0={[Ta]:wa,[Aa]:Pa,[Ra]:La,[Zi]:Ca,[wa]:Ta,[Pa]:Aa,[La]:Ra,[Ca]:Zi};function Z0(i,e){function t(){let D=!1;const te=new et;let se=null;const ge=new et(0,0,0,0);return{setMask:function(J){se!==J&&!D&&(i.colorMask(J,J,J,J),se=J)},setLocked:function(J){D=J},setClear:function(J,Y,Se,Ue,it){it===!0&&(J*=Ue,Y*=Ue,Se*=Ue),te.set(J,Y,Se,Ue),ge.equals(te)===!1&&(i.clearColor(J,Y,Se,Ue),ge.copy(te))},reset:function(){D=!1,se=null,ge.set(-1,0,0,0)}}}function n(){let D=!1,te=!1,se=null,ge=null,J=null;return{setReversed:function(Y){if(te!==Y){const Se=e.get("EXT_clip_control");Y?Se.clipControlEXT(Se.LOWER_LEFT_EXT,Se.ZERO_TO_ONE_EXT):Se.clipControlEXT(Se.LOWER_LEFT_EXT,Se.NEGATIVE_ONE_TO_ONE_EXT),te=Y;const Ue=J;J=null,this.setClear(Ue)}},getReversed:function(){return te},setTest:function(Y){Y?K(i.DEPTH_TEST):le(i.DEPTH_TEST)},setMask:function(Y){se!==Y&&!D&&(i.depthMask(Y),se=Y)},setFunc:function(Y){if(te&&(Y=K0[Y]),ge!==Y){switch(Y){case Ta:i.depthFunc(i.NEVER);break;case wa:i.depthFunc(i.ALWAYS);break;case Aa:i.depthFunc(i.LESS);break;case Zi:i.depthFunc(i.LEQUAL);break;case Ra:i.depthFunc(i.EQUAL);break;case Ca:i.depthFunc(i.GEQUAL);break;case Pa:i.depthFunc(i.GREATER);break;case La:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}ge=Y}},setLocked:function(Y){D=Y},setClear:function(Y){J!==Y&&(te&&(Y=1-Y),i.clearDepth(Y),J=Y)},reset:function(){D=!1,se=null,ge=null,J=null,te=!1}}}function s(){let D=!1,te=null,se=null,ge=null,J=null,Y=null,Se=null,Ue=null,it=null;return{setTest:function(Ke){D||(Ke?K(i.STENCIL_TEST):le(i.STENCIL_TEST))},setMask:function(Ke){te!==Ke&&!D&&(i.stencilMask(Ke),te=Ke)},setFunc:function(Ke,En,mn){(se!==Ke||ge!==En||J!==mn)&&(i.stencilFunc(Ke,En,mn),se=Ke,ge=En,J=mn)},setOp:function(Ke,En,mn){(Y!==Ke||Se!==En||Ue!==mn)&&(i.stencilOp(Ke,En,mn),Y=Ke,Se=En,Ue=mn)},setLocked:function(Ke){D=Ke},setClear:function(Ke){it!==Ke&&(i.clearStencil(Ke),it=Ke)},reset:function(){D=!1,te=null,se=null,ge=null,J=null,Y=null,Se=null,Ue=null,it=null}}}const r=new t,a=new n,o=new s,l=new WeakMap,c=new WeakMap;let h={},u={},f=new WeakMap,p=[],g=null,_=!1,m=null,d=null,b=null,E=null,y=null,w=null,A=null,P=new Ne(0,0,0),I=0,M=!1,v=null,C=null,F=null,z=null,X=null;const V=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let G=!1,$=0;const B=i.getParameter(i.VERSION);B.indexOf("WebGL")!==-1?($=parseFloat(/^WebGL (\d)/.exec(B)[1]),G=$>=1):B.indexOf("OpenGL ES")!==-1&&($=parseFloat(/^OpenGL ES (\d)/.exec(B)[1]),G=$>=2);let ie=null,re={};const _e=i.getParameter(i.SCISSOR_BOX),Ie=i.getParameter(i.VIEWPORT),He=new et().fromArray(_e),Xe=new et().fromArray(Ie);function Oe(D,te,se,ge){const J=new Uint8Array(4),Y=i.createTexture();i.bindTexture(D,Y),i.texParameteri(D,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(D,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let Se=0;Se<se;Se++)D===i.TEXTURE_3D||D===i.TEXTURE_2D_ARRAY?i.texImage3D(te,0,i.RGBA,1,1,ge,0,i.RGBA,i.UNSIGNED_BYTE,J):i.texImage2D(te+Se,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,J);return Y}const j={};j[i.TEXTURE_2D]=Oe(i.TEXTURE_2D,i.TEXTURE_2D,1),j[i.TEXTURE_CUBE_MAP]=Oe(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),j[i.TEXTURE_2D_ARRAY]=Oe(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),j[i.TEXTURE_3D]=Oe(i.TEXTURE_3D,i.TEXTURE_3D,1,1),r.setClear(0,0,0,1),a.setClear(1),o.setClear(0),K(i.DEPTH_TEST),a.setFunc(Zi),Te(!1),pe(sl),K(i.CULL_FACE),qe(Kn);function K(D){h[D]!==!0&&(i.enable(D),h[D]=!0)}function le(D){h[D]!==!1&&(i.disable(D),h[D]=!1)}function Me(D,te){return u[D]!==te?(i.bindFramebuffer(D,te),u[D]=te,D===i.DRAW_FRAMEBUFFER&&(u[i.FRAMEBUFFER]=te),D===i.FRAMEBUFFER&&(u[i.DRAW_FRAMEBUFFER]=te),!0):!1}function de(D,te){let se=p,ge=!1;if(D){se=f.get(te),se===void 0&&(se=[],f.set(te,se));const J=D.textures;if(se.length!==J.length||se[0]!==i.COLOR_ATTACHMENT0){for(let Y=0,Se=J.length;Y<Se;Y++)se[Y]=i.COLOR_ATTACHMENT0+Y;se.length=J.length,ge=!0}}else se[0]!==i.BACK&&(se[0]=i.BACK,ge=!0);ge&&i.drawBuffers(se)}function ae(D){return g!==D?(i.useProgram(D),g=D,!0):!1}const Ae={[ui]:i.FUNC_ADD,[zu]:i.FUNC_SUBTRACT,[Bu]:i.FUNC_REVERSE_SUBTRACT};Ae[Hu]=i.MIN,Ae[ku]=i.MAX;const R={[Gu]:i.ZERO,[Vu]:i.ONE,[Wu]:i.SRC_COLOR,[ba]:i.SRC_ALPHA,[Ku]:i.SRC_ALPHA_SATURATE,[Yu]:i.DST_COLOR,[qu]:i.DST_ALPHA,[Xu]:i.ONE_MINUS_SRC_COLOR,[Ea]:i.ONE_MINUS_SRC_ALPHA,[$u]:i.ONE_MINUS_DST_COLOR,[ju]:i.ONE_MINUS_DST_ALPHA,[Zu]:i.CONSTANT_COLOR,[Ju]:i.ONE_MINUS_CONSTANT_COLOR,[Qu]:i.CONSTANT_ALPHA,[ed]:i.ONE_MINUS_CONSTANT_ALPHA};function qe(D,te,se,ge,J,Y,Se,Ue,it,Ke){if(D===Kn){_===!0&&(le(i.BLEND),_=!1);return}if(_===!1&&(K(i.BLEND),_=!0),D!==Uu){if(D!==m||Ke!==M){if((d!==ui||y!==ui)&&(i.blendEquation(i.FUNC_ADD),d=ui,y=ui),Ke)switch(D){case $i:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case _s:i.blendFunc(i.ONE,i.ONE);break;case rl:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case al:i.blendFuncSeparate(i.DST_COLOR,i.ONE_MINUS_SRC_ALPHA,i.ZERO,i.ONE);break;default:console.error("THREE.WebGLState: Invalid blending: ",D);break}else switch(D){case $i:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case _s:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE,i.ONE,i.ONE);break;case rl:console.error("THREE.WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case al:console.error("THREE.WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:console.error("THREE.WebGLState: Invalid blending: ",D);break}b=null,E=null,w=null,A=null,P.set(0,0,0),I=0,m=D,M=Ke}return}J=J||te,Y=Y||se,Se=Se||ge,(te!==d||J!==y)&&(i.blendEquationSeparate(Ae[te],Ae[J]),d=te,y=J),(se!==b||ge!==E||Y!==w||Se!==A)&&(i.blendFuncSeparate(R[se],R[ge],R[Y],R[Se]),b=se,E=ge,w=Y,A=Se),(Ue.equals(P)===!1||it!==I)&&(i.blendColor(Ue.r,Ue.g,Ue.b,it),P.copy(Ue),I=it),m=D,M=!1}function Le(D,te){D.side===cn?le(i.CULL_FACE):K(i.CULL_FACE);let se=D.side===Nt;te&&(se=!se),Te(se),D.blending===$i&&D.transparent===!1?qe(Kn):qe(D.blending,D.blendEquation,D.blendSrc,D.blendDst,D.blendEquationAlpha,D.blendSrcAlpha,D.blendDstAlpha,D.blendColor,D.blendAlpha,D.premultipliedAlpha),a.setFunc(D.depthFunc),a.setTest(D.depthTest),a.setMask(D.depthWrite),r.setMask(D.colorWrite);const ge=D.stencilWrite;o.setTest(ge),ge&&(o.setMask(D.stencilWriteMask),o.setFunc(D.stencilFunc,D.stencilRef,D.stencilFuncMask),o.setOp(D.stencilFail,D.stencilZFail,D.stencilZPass)),fe(D.polygonOffset,D.polygonOffsetFactor,D.polygonOffsetUnits),D.alphaToCoverage===!0?K(i.SAMPLE_ALPHA_TO_COVERAGE):le(i.SAMPLE_ALPHA_TO_COVERAGE)}function Te(D){v!==D&&(D?i.frontFace(i.CW):i.frontFace(i.CCW),v=D)}function pe(D){D!==Nu?(K(i.CULL_FACE),D!==C&&(D===sl?i.cullFace(i.BACK):D===Fu?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):le(i.CULL_FACE),C=D}function Ze(D){D!==F&&(G&&i.lineWidth(D),F=D)}function fe(D,te,se){D?(K(i.POLYGON_OFFSET_FILL),(z!==te||X!==se)&&(i.polygonOffset(te,se),z=te,X=se)):le(i.POLYGON_OFFSET_FILL)}function Fe(D){D?K(i.SCISSOR_TEST):le(i.SCISSOR_TEST)}function lt(D){D===void 0&&(D=i.TEXTURE0+V-1),ie!==D&&(i.activeTexture(D),ie=D)}function st(D,te,se){se===void 0&&(ie===null?se=i.TEXTURE0+V-1:se=ie);let ge=re[se];ge===void 0&&(ge={type:void 0,texture:void 0},re[se]=ge),(ge.type!==D||ge.texture!==te)&&(ie!==se&&(i.activeTexture(se),ie=se),i.bindTexture(D,te||j[D]),ge.type=D,ge.texture=te)}function T(){const D=re[ie];D!==void 0&&D.type!==void 0&&(i.bindTexture(D.type,null),D.type=void 0,D.texture=void 0)}function x(){try{i.compressedTexImage2D(...arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function U(){try{i.compressedTexImage3D(...arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function q(){try{i.texSubImage2D(...arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function Z(){try{i.texSubImage3D(...arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function W(){try{i.compressedTexSubImage2D(...arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function Ee(){try{i.compressedTexSubImage3D(...arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function ne(){try{i.texStorage2D(...arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function ve(){try{i.texStorage3D(...arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function ye(){try{i.texImage2D(...arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function ee(){try{i.texImage3D(...arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function ue(D){He.equals(D)===!1&&(i.scissor(D.x,D.y,D.z,D.w),He.copy(D))}function Pe(D){Xe.equals(D)===!1&&(i.viewport(D.x,D.y,D.z,D.w),Xe.copy(D))}function be(D,te){let se=c.get(te);se===void 0&&(se=new WeakMap,c.set(te,se));let ge=se.get(D);ge===void 0&&(ge=i.getUniformBlockIndex(te,D.name),se.set(D,ge))}function ce(D,te){const ge=c.get(te).get(D);l.get(te)!==ge&&(i.uniformBlockBinding(te,ge,D.__bindingPointIndex),l.set(te,ge))}function ze(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),a.setReversed(!1),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),h={},ie=null,re={},u={},f=new WeakMap,p=[],g=null,_=!1,m=null,d=null,b=null,E=null,y=null,w=null,A=null,P=new Ne(0,0,0),I=0,M=!1,v=null,C=null,F=null,z=null,X=null,He.set(0,0,i.canvas.width,i.canvas.height),Xe.set(0,0,i.canvas.width,i.canvas.height),r.reset(),a.reset(),o.reset()}return{buffers:{color:r,depth:a,stencil:o},enable:K,disable:le,bindFramebuffer:Me,drawBuffers:de,useProgram:ae,setBlending:qe,setMaterial:Le,setFlipSided:Te,setCullFace:pe,setLineWidth:Ze,setPolygonOffset:fe,setScissorTest:Fe,activeTexture:lt,bindTexture:st,unbindTexture:T,compressedTexImage2D:x,compressedTexImage3D:U,texImage2D:ye,texImage3D:ee,updateUBOMapping:be,uniformBlockBinding:ce,texStorage2D:ne,texStorage3D:ve,texSubImage2D:q,texSubImage3D:Z,compressedTexSubImage2D:W,compressedTexSubImage3D:Ee,scissor:ue,viewport:Pe,reset:ze}}function J0(i,e,t,n,s,r,a){const o=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new Ge,h=new WeakMap;let u;const f=new WeakMap;let p=!1;try{p=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function g(T,x){return p?new OffscreenCanvas(T,x):br("canvas")}function _(T,x,U){let q=1;const Z=st(T);if((Z.width>U||Z.height>U)&&(q=U/Math.max(Z.width,Z.height)),q<1)if(typeof HTMLImageElement<"u"&&T instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&T instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&T instanceof ImageBitmap||typeof VideoFrame<"u"&&T instanceof VideoFrame){const W=Math.floor(q*Z.width),Ee=Math.floor(q*Z.height);u===void 0&&(u=g(W,Ee));const ne=x?g(W,Ee):u;return ne.width=W,ne.height=Ee,ne.getContext("2d").drawImage(T,0,0,W,Ee),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+Z.width+"x"+Z.height+") to ("+W+"x"+Ee+")."),ne}else return"data"in T&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+Z.width+"x"+Z.height+")."),T;return T}function m(T){return T.generateMipmaps}function d(T){i.generateMipmap(T)}function b(T){return T.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:T.isWebGL3DRenderTarget?i.TEXTURE_3D:T.isWebGLArrayRenderTarget||T.isCompressedArrayTexture?i.TEXTURE_2D_ARRAY:i.TEXTURE_2D}function E(T,x,U,q,Z=!1){if(T!==null){if(i[T]!==void 0)return i[T];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+T+"'")}let W=x;if(x===i.RED&&(U===i.FLOAT&&(W=i.R32F),U===i.HALF_FLOAT&&(W=i.R16F),U===i.UNSIGNED_BYTE&&(W=i.R8)),x===i.RED_INTEGER&&(U===i.UNSIGNED_BYTE&&(W=i.R8UI),U===i.UNSIGNED_SHORT&&(W=i.R16UI),U===i.UNSIGNED_INT&&(W=i.R32UI),U===i.BYTE&&(W=i.R8I),U===i.SHORT&&(W=i.R16I),U===i.INT&&(W=i.R32I)),x===i.RG&&(U===i.FLOAT&&(W=i.RG32F),U===i.HALF_FLOAT&&(W=i.RG16F),U===i.UNSIGNED_BYTE&&(W=i.RG8)),x===i.RG_INTEGER&&(U===i.UNSIGNED_BYTE&&(W=i.RG8UI),U===i.UNSIGNED_SHORT&&(W=i.RG16UI),U===i.UNSIGNED_INT&&(W=i.RG32UI),U===i.BYTE&&(W=i.RG8I),U===i.SHORT&&(W=i.RG16I),U===i.INT&&(W=i.RG32I)),x===i.RGB_INTEGER&&(U===i.UNSIGNED_BYTE&&(W=i.RGB8UI),U===i.UNSIGNED_SHORT&&(W=i.RGB16UI),U===i.UNSIGNED_INT&&(W=i.RGB32UI),U===i.BYTE&&(W=i.RGB8I),U===i.SHORT&&(W=i.RGB16I),U===i.INT&&(W=i.RGB32I)),x===i.RGBA_INTEGER&&(U===i.UNSIGNED_BYTE&&(W=i.RGBA8UI),U===i.UNSIGNED_SHORT&&(W=i.RGBA16UI),U===i.UNSIGNED_INT&&(W=i.RGBA32UI),U===i.BYTE&&(W=i.RGBA8I),U===i.SHORT&&(W=i.RGBA16I),U===i.INT&&(W=i.RGBA32I)),x===i.RGB&&(U===i.UNSIGNED_INT_5_9_9_9_REV&&(W=i.RGB9_E5),U===i.UNSIGNED_INT_10F_11F_11F_REV&&(W=i.R11F_G11F_B10F)),x===i.RGBA){const Ee=Z?Mr:$e.getTransfer(q);U===i.FLOAT&&(W=i.RGBA32F),U===i.HALF_FLOAT&&(W=i.RGBA16F),U===i.UNSIGNED_BYTE&&(W=Ee===Qe?i.SRGB8_ALPHA8:i.RGBA8),U===i.UNSIGNED_SHORT_4_4_4_4&&(W=i.RGBA4),U===i.UNSIGNED_SHORT_5_5_5_1&&(W=i.RGB5_A1)}return(W===i.R16F||W===i.R32F||W===i.RG16F||W===i.RG32F||W===i.RGBA16F||W===i.RGBA32F)&&e.get("EXT_color_buffer_float"),W}function y(T,x){let U;return T?x===null||x===gi||x===ys?U=i.DEPTH24_STENCIL8:x===vn?U=i.DEPTH32F_STENCIL8:x===Ms&&(U=i.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):x===null||x===gi||x===ys?U=i.DEPTH_COMPONENT24:x===vn?U=i.DEPTH_COMPONENT32F:x===Ms&&(U=i.DEPTH_COMPONENT16),U}function w(T,x){return m(T)===!0||T.isFramebufferTexture&&T.minFilter!==jt&&T.minFilter!==tn?Math.log2(Math.max(x.width,x.height))+1:T.mipmaps!==void 0&&T.mipmaps.length>0?T.mipmaps.length:T.isCompressedTexture&&Array.isArray(T.image)?x.mipmaps.length:1}function A(T){const x=T.target;x.removeEventListener("dispose",A),I(x),x.isVideoTexture&&h.delete(x)}function P(T){const x=T.target;x.removeEventListener("dispose",P),v(x)}function I(T){const x=n.get(T);if(x.__webglInit===void 0)return;const U=T.source,q=f.get(U);if(q){const Z=q[x.__cacheKey];Z.usedTimes--,Z.usedTimes===0&&M(T),Object.keys(q).length===0&&f.delete(U)}n.remove(T)}function M(T){const x=n.get(T);i.deleteTexture(x.__webglTexture);const U=T.source,q=f.get(U);delete q[x.__cacheKey],a.memory.textures--}function v(T){const x=n.get(T);if(T.depthTexture&&(T.depthTexture.dispose(),n.remove(T.depthTexture)),T.isWebGLCubeRenderTarget)for(let q=0;q<6;q++){if(Array.isArray(x.__webglFramebuffer[q]))for(let Z=0;Z<x.__webglFramebuffer[q].length;Z++)i.deleteFramebuffer(x.__webglFramebuffer[q][Z]);else i.deleteFramebuffer(x.__webglFramebuffer[q]);x.__webglDepthbuffer&&i.deleteRenderbuffer(x.__webglDepthbuffer[q])}else{if(Array.isArray(x.__webglFramebuffer))for(let q=0;q<x.__webglFramebuffer.length;q++)i.deleteFramebuffer(x.__webglFramebuffer[q]);else i.deleteFramebuffer(x.__webglFramebuffer);if(x.__webglDepthbuffer&&i.deleteRenderbuffer(x.__webglDepthbuffer),x.__webglMultisampledFramebuffer&&i.deleteFramebuffer(x.__webglMultisampledFramebuffer),x.__webglColorRenderbuffer)for(let q=0;q<x.__webglColorRenderbuffer.length;q++)x.__webglColorRenderbuffer[q]&&i.deleteRenderbuffer(x.__webglColorRenderbuffer[q]);x.__webglDepthRenderbuffer&&i.deleteRenderbuffer(x.__webglDepthRenderbuffer)}const U=T.textures;for(let q=0,Z=U.length;q<Z;q++){const W=n.get(U[q]);W.__webglTexture&&(i.deleteTexture(W.__webglTexture),a.memory.textures--),n.remove(U[q])}n.remove(T)}let C=0;function F(){C=0}function z(){const T=C;return T>=s.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+T+" texture units while this GPU supports only "+s.maxTextures),C+=1,T}function X(T){const x=[];return x.push(T.wrapS),x.push(T.wrapT),x.push(T.wrapR||0),x.push(T.magFilter),x.push(T.minFilter),x.push(T.anisotropy),x.push(T.internalFormat),x.push(T.format),x.push(T.type),x.push(T.generateMipmaps),x.push(T.premultiplyAlpha),x.push(T.flipY),x.push(T.unpackAlignment),x.push(T.colorSpace),x.join()}function V(T,x){const U=n.get(T);if(T.isVideoTexture&&Fe(T),T.isRenderTargetTexture===!1&&T.isExternalTexture!==!0&&T.version>0&&U.__version!==T.version){const q=T.image;if(q===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(q.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{j(U,T,x);return}}else T.isExternalTexture&&(U.__webglTexture=T.sourceTexture?T.sourceTexture:null);t.bindTexture(i.TEXTURE_2D,U.__webglTexture,i.TEXTURE0+x)}function G(T,x){const U=n.get(T);if(T.isRenderTargetTexture===!1&&T.version>0&&U.__version!==T.version){j(U,T,x);return}t.bindTexture(i.TEXTURE_2D_ARRAY,U.__webglTexture,i.TEXTURE0+x)}function $(T,x){const U=n.get(T);if(T.isRenderTargetTexture===!1&&T.version>0&&U.__version!==T.version){j(U,T,x);return}t.bindTexture(i.TEXTURE_3D,U.__webglTexture,i.TEXTURE0+x)}function B(T,x){const U=n.get(T);if(T.version>0&&U.__version!==T.version){K(U,T,x);return}t.bindTexture(i.TEXTURE_CUBE_MAP,U.__webglTexture,i.TEXTURE0+x)}const ie={[vs]:i.REPEAT,[dn]:i.CLAMP_TO_EDGE,[Oa]:i.MIRRORED_REPEAT},re={[jt]:i.NEAREST,[cd]:i.NEAREST_MIPMAP_NEAREST,[zs]:i.NEAREST_MIPMAP_LINEAR,[tn]:i.LINEAR,[Nr]:i.LINEAR_MIPMAP_NEAREST,[fi]:i.LINEAR_MIPMAP_LINEAR},_e={[fd]:i.NEVER,[Sd]:i.ALWAYS,[pd]:i.LESS,[Yc]:i.LEQUAL,[md]:i.EQUAL,[xd]:i.GEQUAL,[gd]:i.GREATER,[_d]:i.NOTEQUAL};function Ie(T,x){if(x.type===vn&&e.has("OES_texture_float_linear")===!1&&(x.magFilter===tn||x.magFilter===Nr||x.magFilter===zs||x.magFilter===fi||x.minFilter===tn||x.minFilter===Nr||x.minFilter===zs||x.minFilter===fi)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),i.texParameteri(T,i.TEXTURE_WRAP_S,ie[x.wrapS]),i.texParameteri(T,i.TEXTURE_WRAP_T,ie[x.wrapT]),(T===i.TEXTURE_3D||T===i.TEXTURE_2D_ARRAY)&&i.texParameteri(T,i.TEXTURE_WRAP_R,ie[x.wrapR]),i.texParameteri(T,i.TEXTURE_MAG_FILTER,re[x.magFilter]),i.texParameteri(T,i.TEXTURE_MIN_FILTER,re[x.minFilter]),x.compareFunction&&(i.texParameteri(T,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(T,i.TEXTURE_COMPARE_FUNC,_e[x.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(x.magFilter===jt||x.minFilter!==zs&&x.minFilter!==fi||x.type===vn&&e.has("OES_texture_float_linear")===!1)return;if(x.anisotropy>1||n.get(x).__currentAnisotropy){const U=e.get("EXT_texture_filter_anisotropic");i.texParameterf(T,U.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(x.anisotropy,s.getMaxAnisotropy())),n.get(x).__currentAnisotropy=x.anisotropy}}}function He(T,x){let U=!1;T.__webglInit===void 0&&(T.__webglInit=!0,x.addEventListener("dispose",A));const q=x.source;let Z=f.get(q);Z===void 0&&(Z={},f.set(q,Z));const W=X(x);if(W!==T.__cacheKey){Z[W]===void 0&&(Z[W]={texture:i.createTexture(),usedTimes:0},a.memory.textures++,U=!0),Z[W].usedTimes++;const Ee=Z[T.__cacheKey];Ee!==void 0&&(Z[T.__cacheKey].usedTimes--,Ee.usedTimes===0&&M(x)),T.__cacheKey=W,T.__webglTexture=Z[W].texture}return U}function Xe(T,x,U){return Math.floor(Math.floor(T/U)/x)}function Oe(T,x,U,q){const W=T.updateRanges;if(W.length===0)t.texSubImage2D(i.TEXTURE_2D,0,0,0,x.width,x.height,U,q,x.data);else{W.sort((ee,ue)=>ee.start-ue.start);let Ee=0;for(let ee=1;ee<W.length;ee++){const ue=W[Ee],Pe=W[ee],be=ue.start+ue.count,ce=Xe(Pe.start,x.width,4),ze=Xe(ue.start,x.width,4);Pe.start<=be+1&&ce===ze&&Xe(Pe.start+Pe.count-1,x.width,4)===ce?ue.count=Math.max(ue.count,Pe.start+Pe.count-ue.start):(++Ee,W[Ee]=Pe)}W.length=Ee+1;const ne=i.getParameter(i.UNPACK_ROW_LENGTH),ve=i.getParameter(i.UNPACK_SKIP_PIXELS),ye=i.getParameter(i.UNPACK_SKIP_ROWS);i.pixelStorei(i.UNPACK_ROW_LENGTH,x.width);for(let ee=0,ue=W.length;ee<ue;ee++){const Pe=W[ee],be=Math.floor(Pe.start/4),ce=Math.ceil(Pe.count/4),ze=be%x.width,D=Math.floor(be/x.width),te=ce,se=1;i.pixelStorei(i.UNPACK_SKIP_PIXELS,ze),i.pixelStorei(i.UNPACK_SKIP_ROWS,D),t.texSubImage2D(i.TEXTURE_2D,0,ze,D,te,se,U,q,x.data)}T.clearUpdateRanges(),i.pixelStorei(i.UNPACK_ROW_LENGTH,ne),i.pixelStorei(i.UNPACK_SKIP_PIXELS,ve),i.pixelStorei(i.UNPACK_SKIP_ROWS,ye)}}function j(T,x,U){let q=i.TEXTURE_2D;(x.isDataArrayTexture||x.isCompressedArrayTexture)&&(q=i.TEXTURE_2D_ARRAY),x.isData3DTexture&&(q=i.TEXTURE_3D);const Z=He(T,x),W=x.source;t.bindTexture(q,T.__webglTexture,i.TEXTURE0+U);const Ee=n.get(W);if(W.version!==Ee.__version||Z===!0){t.activeTexture(i.TEXTURE0+U);const ne=$e.getPrimaries($e.workingColorSpace),ve=x.colorSpace===hn?null:$e.getPrimaries(x.colorSpace),ye=x.colorSpace===hn||ne===ve?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,x.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,x.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,x.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,ye);let ee=_(x.image,!1,s.maxTextureSize);ee=lt(x,ee);const ue=r.convert(x.format,x.colorSpace),Pe=r.convert(x.type);let be=E(x.internalFormat,ue,Pe,x.colorSpace,x.isVideoTexture);Ie(q,x);let ce;const ze=x.mipmaps,D=x.isVideoTexture!==!0,te=Ee.__version===void 0||Z===!0,se=W.dataReady,ge=w(x,ee);if(x.isDepthTexture)be=y(x.format===Es,x.type),te&&(D?t.texStorage2D(i.TEXTURE_2D,1,be,ee.width,ee.height):t.texImage2D(i.TEXTURE_2D,0,be,ee.width,ee.height,0,ue,Pe,null));else if(x.isDataTexture)if(ze.length>0){D&&te&&t.texStorage2D(i.TEXTURE_2D,ge,be,ze[0].width,ze[0].height);for(let J=0,Y=ze.length;J<Y;J++)ce=ze[J],D?se&&t.texSubImage2D(i.TEXTURE_2D,J,0,0,ce.width,ce.height,ue,Pe,ce.data):t.texImage2D(i.TEXTURE_2D,J,be,ce.width,ce.height,0,ue,Pe,ce.data);x.generateMipmaps=!1}else D?(te&&t.texStorage2D(i.TEXTURE_2D,ge,be,ee.width,ee.height),se&&Oe(x,ee,ue,Pe)):t.texImage2D(i.TEXTURE_2D,0,be,ee.width,ee.height,0,ue,Pe,ee.data);else if(x.isCompressedTexture)if(x.isCompressedArrayTexture){D&&te&&t.texStorage3D(i.TEXTURE_2D_ARRAY,ge,be,ze[0].width,ze[0].height,ee.depth);for(let J=0,Y=ze.length;J<Y;J++)if(ce=ze[J],x.format!==fn)if(ue!==null)if(D){if(se)if(x.layerUpdates.size>0){const Se=kl(ce.width,ce.height,x.format,x.type);for(const Ue of x.layerUpdates){const it=ce.data.subarray(Ue*Se/ce.data.BYTES_PER_ELEMENT,(Ue+1)*Se/ce.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,J,0,0,Ue,ce.width,ce.height,1,ue,it)}x.clearLayerUpdates()}else t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,J,0,0,0,ce.width,ce.height,ee.depth,ue,ce.data)}else t.compressedTexImage3D(i.TEXTURE_2D_ARRAY,J,be,ce.width,ce.height,ee.depth,0,ce.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else D?se&&t.texSubImage3D(i.TEXTURE_2D_ARRAY,J,0,0,0,ce.width,ce.height,ee.depth,ue,Pe,ce.data):t.texImage3D(i.TEXTURE_2D_ARRAY,J,be,ce.width,ce.height,ee.depth,0,ue,Pe,ce.data)}else{D&&te&&t.texStorage2D(i.TEXTURE_2D,ge,be,ze[0].width,ze[0].height);for(let J=0,Y=ze.length;J<Y;J++)ce=ze[J],x.format!==fn?ue!==null?D?se&&t.compressedTexSubImage2D(i.TEXTURE_2D,J,0,0,ce.width,ce.height,ue,ce.data):t.compressedTexImage2D(i.TEXTURE_2D,J,be,ce.width,ce.height,0,ce.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):D?se&&t.texSubImage2D(i.TEXTURE_2D,J,0,0,ce.width,ce.height,ue,Pe,ce.data):t.texImage2D(i.TEXTURE_2D,J,be,ce.width,ce.height,0,ue,Pe,ce.data)}else if(x.isDataArrayTexture)if(D){if(te&&t.texStorage3D(i.TEXTURE_2D_ARRAY,ge,be,ee.width,ee.height,ee.depth),se)if(x.layerUpdates.size>0){const J=kl(ee.width,ee.height,x.format,x.type);for(const Y of x.layerUpdates){const Se=ee.data.subarray(Y*J/ee.data.BYTES_PER_ELEMENT,(Y+1)*J/ee.data.BYTES_PER_ELEMENT);t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,Y,ee.width,ee.height,1,ue,Pe,Se)}x.clearLayerUpdates()}else t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,ee.width,ee.height,ee.depth,ue,Pe,ee.data)}else t.texImage3D(i.TEXTURE_2D_ARRAY,0,be,ee.width,ee.height,ee.depth,0,ue,Pe,ee.data);else if(x.isData3DTexture)D?(te&&t.texStorage3D(i.TEXTURE_3D,ge,be,ee.width,ee.height,ee.depth),se&&t.texSubImage3D(i.TEXTURE_3D,0,0,0,0,ee.width,ee.height,ee.depth,ue,Pe,ee.data)):t.texImage3D(i.TEXTURE_3D,0,be,ee.width,ee.height,ee.depth,0,ue,Pe,ee.data);else if(x.isFramebufferTexture){if(te)if(D)t.texStorage2D(i.TEXTURE_2D,ge,be,ee.width,ee.height);else{let J=ee.width,Y=ee.height;for(let Se=0;Se<ge;Se++)t.texImage2D(i.TEXTURE_2D,Se,be,J,Y,0,ue,Pe,null),J>>=1,Y>>=1}}else if(ze.length>0){if(D&&te){const J=st(ze[0]);t.texStorage2D(i.TEXTURE_2D,ge,be,J.width,J.height)}for(let J=0,Y=ze.length;J<Y;J++)ce=ze[J],D?se&&t.texSubImage2D(i.TEXTURE_2D,J,0,0,ue,Pe,ce):t.texImage2D(i.TEXTURE_2D,J,be,ue,Pe,ce);x.generateMipmaps=!1}else if(D){if(te){const J=st(ee);t.texStorage2D(i.TEXTURE_2D,ge,be,J.width,J.height)}se&&t.texSubImage2D(i.TEXTURE_2D,0,0,0,ue,Pe,ee)}else t.texImage2D(i.TEXTURE_2D,0,be,ue,Pe,ee);m(x)&&d(q),Ee.__version=W.version,x.onUpdate&&x.onUpdate(x)}T.__version=x.version}function K(T,x,U){if(x.image.length!==6)return;const q=He(T,x),Z=x.source;t.bindTexture(i.TEXTURE_CUBE_MAP,T.__webglTexture,i.TEXTURE0+U);const W=n.get(Z);if(Z.version!==W.__version||q===!0){t.activeTexture(i.TEXTURE0+U);const Ee=$e.getPrimaries($e.workingColorSpace),ne=x.colorSpace===hn?null:$e.getPrimaries(x.colorSpace),ve=x.colorSpace===hn||Ee===ne?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,x.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,x.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,x.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,ve);const ye=x.isCompressedTexture||x.image[0].isCompressedTexture,ee=x.image[0]&&x.image[0].isDataTexture,ue=[];for(let Y=0;Y<6;Y++)!ye&&!ee?ue[Y]=_(x.image[Y],!0,s.maxCubemapSize):ue[Y]=ee?x.image[Y].image:x.image[Y],ue[Y]=lt(x,ue[Y]);const Pe=ue[0],be=r.convert(x.format,x.colorSpace),ce=r.convert(x.type),ze=E(x.internalFormat,be,ce,x.colorSpace),D=x.isVideoTexture!==!0,te=W.__version===void 0||q===!0,se=Z.dataReady;let ge=w(x,Pe);Ie(i.TEXTURE_CUBE_MAP,x);let J;if(ye){D&&te&&t.texStorage2D(i.TEXTURE_CUBE_MAP,ge,ze,Pe.width,Pe.height);for(let Y=0;Y<6;Y++){J=ue[Y].mipmaps;for(let Se=0;Se<J.length;Se++){const Ue=J[Se];x.format!==fn?be!==null?D?se&&t.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Y,Se,0,0,Ue.width,Ue.height,be,Ue.data):t.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Y,Se,ze,Ue.width,Ue.height,0,Ue.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):D?se&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Y,Se,0,0,Ue.width,Ue.height,be,ce,Ue.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Y,Se,ze,Ue.width,Ue.height,0,be,ce,Ue.data)}}}else{if(J=x.mipmaps,D&&te){J.length>0&&ge++;const Y=st(ue[0]);t.texStorage2D(i.TEXTURE_CUBE_MAP,ge,ze,Y.width,Y.height)}for(let Y=0;Y<6;Y++)if(ee){D?se&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Y,0,0,0,ue[Y].width,ue[Y].height,be,ce,ue[Y].data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Y,0,ze,ue[Y].width,ue[Y].height,0,be,ce,ue[Y].data);for(let Se=0;Se<J.length;Se++){const it=J[Se].image[Y].image;D?se&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Y,Se+1,0,0,it.width,it.height,be,ce,it.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Y,Se+1,ze,it.width,it.height,0,be,ce,it.data)}}else{D?se&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Y,0,0,0,be,ce,ue[Y]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Y,0,ze,be,ce,ue[Y]);for(let Se=0;Se<J.length;Se++){const Ue=J[Se];D?se&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Y,Se+1,0,0,be,ce,Ue.image[Y]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Y,Se+1,ze,be,ce,Ue.image[Y])}}}m(x)&&d(i.TEXTURE_CUBE_MAP),W.__version=Z.version,x.onUpdate&&x.onUpdate(x)}T.__version=x.version}function le(T,x,U,q,Z,W){const Ee=r.convert(U.format,U.colorSpace),ne=r.convert(U.type),ve=E(U.internalFormat,Ee,ne,U.colorSpace),ye=n.get(x),ee=n.get(U);if(ee.__renderTarget=x,!ye.__hasExternalTextures){const ue=Math.max(1,x.width>>W),Pe=Math.max(1,x.height>>W);Z===i.TEXTURE_3D||Z===i.TEXTURE_2D_ARRAY?t.texImage3D(Z,W,ve,ue,Pe,x.depth,0,Ee,ne,null):t.texImage2D(Z,W,ve,ue,Pe,0,Ee,ne,null)}t.bindFramebuffer(i.FRAMEBUFFER,T),fe(x)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,q,Z,ee.__webglTexture,0,Ze(x)):(Z===i.TEXTURE_2D||Z>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&Z<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,q,Z,ee.__webglTexture,W),t.bindFramebuffer(i.FRAMEBUFFER,null)}function Me(T,x,U){if(i.bindRenderbuffer(i.RENDERBUFFER,T),x.depthBuffer){const q=x.depthTexture,Z=q&&q.isDepthTexture?q.type:null,W=y(x.stencilBuffer,Z),Ee=x.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,ne=Ze(x);fe(x)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,ne,W,x.width,x.height):U?i.renderbufferStorageMultisample(i.RENDERBUFFER,ne,W,x.width,x.height):i.renderbufferStorage(i.RENDERBUFFER,W,x.width,x.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,Ee,i.RENDERBUFFER,T)}else{const q=x.textures;for(let Z=0;Z<q.length;Z++){const W=q[Z],Ee=r.convert(W.format,W.colorSpace),ne=r.convert(W.type),ve=E(W.internalFormat,Ee,ne,W.colorSpace),ye=Ze(x);U&&fe(x)===!1?i.renderbufferStorageMultisample(i.RENDERBUFFER,ye,ve,x.width,x.height):fe(x)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,ye,ve,x.width,x.height):i.renderbufferStorage(i.RENDERBUFFER,ve,x.width,x.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function de(T,x){if(x&&x.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(t.bindFramebuffer(i.FRAMEBUFFER,T),!(x.depthTexture&&x.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");const q=n.get(x.depthTexture);q.__renderTarget=x,(!q.__webglTexture||x.depthTexture.image.width!==x.width||x.depthTexture.image.height!==x.height)&&(x.depthTexture.image.width=x.width,x.depthTexture.image.height=x.height,x.depthTexture.needsUpdate=!0),V(x.depthTexture,0);const Z=q.__webglTexture,W=Ze(x);if(x.depthTexture.format===bs)fe(x)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,Z,0,W):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,Z,0);else if(x.depthTexture.format===Es)fe(x)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,Z,0,W):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,Z,0);else throw new Error("Unknown depthTexture format")}function ae(T){const x=n.get(T),U=T.isWebGLCubeRenderTarget===!0;if(x.__boundDepthTexture!==T.depthTexture){const q=T.depthTexture;if(x.__depthDisposeCallback&&x.__depthDisposeCallback(),q){const Z=()=>{delete x.__boundDepthTexture,delete x.__depthDisposeCallback,q.removeEventListener("dispose",Z)};q.addEventListener("dispose",Z),x.__depthDisposeCallback=Z}x.__boundDepthTexture=q}if(T.depthTexture&&!x.__autoAllocateDepthBuffer){if(U)throw new Error("target.depthTexture not supported in Cube render targets");const q=T.texture.mipmaps;q&&q.length>0?de(x.__webglFramebuffer[0],T):de(x.__webglFramebuffer,T)}else if(U){x.__webglDepthbuffer=[];for(let q=0;q<6;q++)if(t.bindFramebuffer(i.FRAMEBUFFER,x.__webglFramebuffer[q]),x.__webglDepthbuffer[q]===void 0)x.__webglDepthbuffer[q]=i.createRenderbuffer(),Me(x.__webglDepthbuffer[q],T,!1);else{const Z=T.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,W=x.__webglDepthbuffer[q];i.bindRenderbuffer(i.RENDERBUFFER,W),i.framebufferRenderbuffer(i.FRAMEBUFFER,Z,i.RENDERBUFFER,W)}}else{const q=T.texture.mipmaps;if(q&&q.length>0?t.bindFramebuffer(i.FRAMEBUFFER,x.__webglFramebuffer[0]):t.bindFramebuffer(i.FRAMEBUFFER,x.__webglFramebuffer),x.__webglDepthbuffer===void 0)x.__webglDepthbuffer=i.createRenderbuffer(),Me(x.__webglDepthbuffer,T,!1);else{const Z=T.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,W=x.__webglDepthbuffer;i.bindRenderbuffer(i.RENDERBUFFER,W),i.framebufferRenderbuffer(i.FRAMEBUFFER,Z,i.RENDERBUFFER,W)}}t.bindFramebuffer(i.FRAMEBUFFER,null)}function Ae(T,x,U){const q=n.get(T);x!==void 0&&le(q.__webglFramebuffer,T,T.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),U!==void 0&&ae(T)}function R(T){const x=T.texture,U=n.get(T),q=n.get(x);T.addEventListener("dispose",P);const Z=T.textures,W=T.isWebGLCubeRenderTarget===!0,Ee=Z.length>1;if(Ee||(q.__webglTexture===void 0&&(q.__webglTexture=i.createTexture()),q.__version=x.version,a.memory.textures++),W){U.__webglFramebuffer=[];for(let ne=0;ne<6;ne++)if(x.mipmaps&&x.mipmaps.length>0){U.__webglFramebuffer[ne]=[];for(let ve=0;ve<x.mipmaps.length;ve++)U.__webglFramebuffer[ne][ve]=i.createFramebuffer()}else U.__webglFramebuffer[ne]=i.createFramebuffer()}else{if(x.mipmaps&&x.mipmaps.length>0){U.__webglFramebuffer=[];for(let ne=0;ne<x.mipmaps.length;ne++)U.__webglFramebuffer[ne]=i.createFramebuffer()}else U.__webglFramebuffer=i.createFramebuffer();if(Ee)for(let ne=0,ve=Z.length;ne<ve;ne++){const ye=n.get(Z[ne]);ye.__webglTexture===void 0&&(ye.__webglTexture=i.createTexture(),a.memory.textures++)}if(T.samples>0&&fe(T)===!1){U.__webglMultisampledFramebuffer=i.createFramebuffer(),U.__webglColorRenderbuffer=[],t.bindFramebuffer(i.FRAMEBUFFER,U.__webglMultisampledFramebuffer);for(let ne=0;ne<Z.length;ne++){const ve=Z[ne];U.__webglColorRenderbuffer[ne]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,U.__webglColorRenderbuffer[ne]);const ye=r.convert(ve.format,ve.colorSpace),ee=r.convert(ve.type),ue=E(ve.internalFormat,ye,ee,ve.colorSpace,T.isXRRenderTarget===!0),Pe=Ze(T);i.renderbufferStorageMultisample(i.RENDERBUFFER,Pe,ue,T.width,T.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+ne,i.RENDERBUFFER,U.__webglColorRenderbuffer[ne])}i.bindRenderbuffer(i.RENDERBUFFER,null),T.depthBuffer&&(U.__webglDepthRenderbuffer=i.createRenderbuffer(),Me(U.__webglDepthRenderbuffer,T,!0)),t.bindFramebuffer(i.FRAMEBUFFER,null)}}if(W){t.bindTexture(i.TEXTURE_CUBE_MAP,q.__webglTexture),Ie(i.TEXTURE_CUBE_MAP,x);for(let ne=0;ne<6;ne++)if(x.mipmaps&&x.mipmaps.length>0)for(let ve=0;ve<x.mipmaps.length;ve++)le(U.__webglFramebuffer[ne][ve],T,x,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+ne,ve);else le(U.__webglFramebuffer[ne],T,x,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+ne,0);m(x)&&d(i.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(Ee){for(let ne=0,ve=Z.length;ne<ve;ne++){const ye=Z[ne],ee=n.get(ye);let ue=i.TEXTURE_2D;(T.isWebGL3DRenderTarget||T.isWebGLArrayRenderTarget)&&(ue=T.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(ue,ee.__webglTexture),Ie(ue,ye),le(U.__webglFramebuffer,T,ye,i.COLOR_ATTACHMENT0+ne,ue,0),m(ye)&&d(ue)}t.unbindTexture()}else{let ne=i.TEXTURE_2D;if((T.isWebGL3DRenderTarget||T.isWebGLArrayRenderTarget)&&(ne=T.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(ne,q.__webglTexture),Ie(ne,x),x.mipmaps&&x.mipmaps.length>0)for(let ve=0;ve<x.mipmaps.length;ve++)le(U.__webglFramebuffer[ve],T,x,i.COLOR_ATTACHMENT0,ne,ve);else le(U.__webglFramebuffer,T,x,i.COLOR_ATTACHMENT0,ne,0);m(x)&&d(ne),t.unbindTexture()}T.depthBuffer&&ae(T)}function qe(T){const x=T.textures;for(let U=0,q=x.length;U<q;U++){const Z=x[U];if(m(Z)){const W=b(T),Ee=n.get(Z).__webglTexture;t.bindTexture(W,Ee),d(W),t.unbindTexture()}}}const Le=[],Te=[];function pe(T){if(T.samples>0){if(fe(T)===!1){const x=T.textures,U=T.width,q=T.height;let Z=i.COLOR_BUFFER_BIT;const W=T.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,Ee=n.get(T),ne=x.length>1;if(ne)for(let ye=0;ye<x.length;ye++)t.bindFramebuffer(i.FRAMEBUFFER,Ee.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+ye,i.RENDERBUFFER,null),t.bindFramebuffer(i.FRAMEBUFFER,Ee.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+ye,i.TEXTURE_2D,null,0);t.bindFramebuffer(i.READ_FRAMEBUFFER,Ee.__webglMultisampledFramebuffer);const ve=T.texture.mipmaps;ve&&ve.length>0?t.bindFramebuffer(i.DRAW_FRAMEBUFFER,Ee.__webglFramebuffer[0]):t.bindFramebuffer(i.DRAW_FRAMEBUFFER,Ee.__webglFramebuffer);for(let ye=0;ye<x.length;ye++){if(T.resolveDepthBuffer&&(T.depthBuffer&&(Z|=i.DEPTH_BUFFER_BIT),T.stencilBuffer&&T.resolveStencilBuffer&&(Z|=i.STENCIL_BUFFER_BIT)),ne){i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,Ee.__webglColorRenderbuffer[ye]);const ee=n.get(x[ye]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,ee,0)}i.blitFramebuffer(0,0,U,q,0,0,U,q,Z,i.NEAREST),l===!0&&(Le.length=0,Te.length=0,Le.push(i.COLOR_ATTACHMENT0+ye),T.depthBuffer&&T.resolveDepthBuffer===!1&&(Le.push(W),Te.push(W),i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,Te)),i.invalidateFramebuffer(i.READ_FRAMEBUFFER,Le))}if(t.bindFramebuffer(i.READ_FRAMEBUFFER,null),t.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),ne)for(let ye=0;ye<x.length;ye++){t.bindFramebuffer(i.FRAMEBUFFER,Ee.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+ye,i.RENDERBUFFER,Ee.__webglColorRenderbuffer[ye]);const ee=n.get(x[ye]).__webglTexture;t.bindFramebuffer(i.FRAMEBUFFER,Ee.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+ye,i.TEXTURE_2D,ee,0)}t.bindFramebuffer(i.DRAW_FRAMEBUFFER,Ee.__webglMultisampledFramebuffer)}else if(T.depthBuffer&&T.resolveDepthBuffer===!1&&l){const x=T.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[x])}}}function Ze(T){return Math.min(s.maxSamples,T.samples)}function fe(T){const x=n.get(T);return T.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&x.__useRenderToTexture!==!1}function Fe(T){const x=a.render.frame;h.get(T)!==x&&(h.set(T,x),T.update())}function lt(T,x){const U=T.colorSpace,q=T.format,Z=T.type;return T.isCompressedTexture===!0||T.isVideoTexture===!0||U!==es&&U!==hn&&($e.getTransfer(U)===Qe?(q!==fn||Z!==bn)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",U)),x}function st(T){return typeof HTMLImageElement<"u"&&T instanceof HTMLImageElement?(c.width=T.naturalWidth||T.width,c.height=T.naturalHeight||T.height):typeof VideoFrame<"u"&&T instanceof VideoFrame?(c.width=T.displayWidth,c.height=T.displayHeight):(c.width=T.width,c.height=T.height),c}this.allocateTextureUnit=z,this.resetTextureUnits=F,this.setTexture2D=V,this.setTexture2DArray=G,this.setTexture3D=$,this.setTextureCube=B,this.rebindTextures=Ae,this.setupRenderTarget=R,this.updateRenderTargetMipmap=qe,this.updateMultisampleRenderTarget=pe,this.setupDepthRenderbuffer=ae,this.setupFrameBufferTexture=le,this.useMultisampledRTT=fe}function Q0(i,e){function t(n,s=hn){let r;const a=$e.getTransfer(s);if(n===bn)return i.UNSIGNED_BYTE;if(n===xo)return i.UNSIGNED_SHORT_4_4_4_4;if(n===So)return i.UNSIGNED_SHORT_5_5_5_1;if(n===Vc)return i.UNSIGNED_INT_5_9_9_9_REV;if(n===Wc)return i.UNSIGNED_INT_10F_11F_11F_REV;if(n===kc)return i.BYTE;if(n===Gc)return i.SHORT;if(n===Ms)return i.UNSIGNED_SHORT;if(n===_o)return i.INT;if(n===gi)return i.UNSIGNED_INT;if(n===vn)return i.FLOAT;if(n===Rs)return i.HALF_FLOAT;if(n===Xc)return i.ALPHA;if(n===qc)return i.RGB;if(n===fn)return i.RGBA;if(n===bs)return i.DEPTH_COMPONENT;if(n===Es)return i.DEPTH_STENCIL;if(n===vo)return i.RED;if(n===Mo)return i.RED_INTEGER;if(n===jc)return i.RG;if(n===yo)return i.RG_INTEGER;if(n===bo)return i.RGBA_INTEGER;if(n===fr||n===pr||n===mr||n===gr)if(a===Qe)if(r=e.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===fr)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===pr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===mr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===gr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=e.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===fr)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===pr)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===mr)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===gr)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===Na||n===Fa||n===Ua||n===za)if(r=e.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===Na)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===Fa)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===Ua)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===za)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===Ba||n===Ha||n===ka)if(r=e.get("WEBGL_compressed_texture_etc"),r!==null){if(n===Ba||n===Ha)return a===Qe?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===ka)return a===Qe?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(n===Ga||n===Va||n===Wa||n===Xa||n===qa||n===ja||n===Ya||n===$a||n===Ka||n===Za||n===Ja||n===Qa||n===eo||n===to)if(r=e.get("WEBGL_compressed_texture_astc"),r!==null){if(n===Ga)return a===Qe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===Va)return a===Qe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===Wa)return a===Qe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===Xa)return a===Qe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===qa)return a===Qe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===ja)return a===Qe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===Ya)return a===Qe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===$a)return a===Qe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===Ka)return a===Qe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===Za)return a===Qe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===Ja)return a===Qe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===Qa)return a===Qe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===eo)return a===Qe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===to)return a===Qe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===no||n===io||n===so)if(r=e.get("EXT_texture_compression_bptc"),r!==null){if(n===no)return a===Qe?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===io)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===so)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===ro||n===ao||n===oo||n===lo)if(r=e.get("EXT_texture_compression_rgtc"),r!==null){if(n===ro)return r.COMPRESSED_RED_RGTC1_EXT;if(n===ao)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===oo)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===lo)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===ys?i.UNSIGNED_INT_24_8:i[n]!==void 0?i[n]:null}return{convert:t}}const e_=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,t_=`
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

}`;class n_{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){const n=new rh(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(e){if(this.texture!==null&&this.mesh===null){const t=e.cameras[0].viewport,n=new ei({vertexShader:e_,fragmentShader:t_,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new ht(new Lt(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class i_ extends is{constructor(e,t){super();const n=this;let s=null,r=1,a=null,o="local-floor",l=1,c=null,h=null,u=null,f=null,p=null,g=null;const _=typeof XRWebGLBinding<"u",m=new n_,d={},b=t.getContextAttributes();let E=null,y=null;const w=[],A=[],P=new Ge;let I=null;const M=new zt;M.viewport=new et;const v=new zt;v.viewport=new et;const C=[M,v],F=new Ef;let z=null,X=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(j){let K=w[j];return K===void 0&&(K=new na,w[j]=K),K.getTargetRaySpace()},this.getControllerGrip=function(j){let K=w[j];return K===void 0&&(K=new na,w[j]=K),K.getGripSpace()},this.getHand=function(j){let K=w[j];return K===void 0&&(K=new na,w[j]=K),K.getHandSpace()};function V(j){const K=A.indexOf(j.inputSource);if(K===-1)return;const le=w[K];le!==void 0&&(le.update(j.inputSource,j.frame,c||a),le.dispatchEvent({type:j.type,data:j.inputSource}))}function G(){s.removeEventListener("select",V),s.removeEventListener("selectstart",V),s.removeEventListener("selectend",V),s.removeEventListener("squeeze",V),s.removeEventListener("squeezestart",V),s.removeEventListener("squeezeend",V),s.removeEventListener("end",G),s.removeEventListener("inputsourceschange",$);for(let j=0;j<w.length;j++){const K=A[j];K!==null&&(A[j]=null,w[j].disconnect(K))}z=null,X=null,m.reset();for(const j in d)delete d[j];e.setRenderTarget(E),p=null,f=null,u=null,s=null,y=null,Oe.stop(),n.isPresenting=!1,e.setPixelRatio(I),e.setSize(P.width,P.height,!1),n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(j){r=j,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(j){o=j,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(j){c=j},this.getBaseLayer=function(){return f!==null?f:p},this.getBinding=function(){return u===null&&_&&(u=new XRWebGLBinding(s,t)),u},this.getFrame=function(){return g},this.getSession=function(){return s},this.setSession=async function(j){if(s=j,s!==null){if(E=e.getRenderTarget(),s.addEventListener("select",V),s.addEventListener("selectstart",V),s.addEventListener("selectend",V),s.addEventListener("squeeze",V),s.addEventListener("squeezestart",V),s.addEventListener("squeezeend",V),s.addEventListener("end",G),s.addEventListener("inputsourceschange",$),b.xrCompatible!==!0&&await t.makeXRCompatible(),I=e.getPixelRatio(),e.getSize(P),_&&"createProjectionLayer"in XRWebGLBinding.prototype){let le=null,Me=null,de=null;b.depth&&(de=b.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,le=b.stencil?Es:bs,Me=b.stencil?ys:gi);const ae={colorFormat:t.RGBA8,depthFormat:de,scaleFactor:r};u=this.getBinding(),f=u.createProjectionLayer(ae),s.updateRenderState({layers:[f]}),e.setPixelRatio(1),e.setSize(f.textureWidth,f.textureHeight,!1),y=new Qn(f.textureWidth,f.textureHeight,{format:fn,type:bn,depthTexture:new sh(f.textureWidth,f.textureHeight,Me,void 0,void 0,void 0,void 0,void 0,void 0,le),stencilBuffer:b.stencil,colorSpace:e.outputColorSpace,samples:b.antialias?4:0,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1})}else{const le={antialias:b.antialias,alpha:!0,depth:b.depth,stencil:b.stencil,framebufferScaleFactor:r};p=new XRWebGLLayer(s,t,le),s.updateRenderState({baseLayer:p}),e.setPixelRatio(1),e.setSize(p.framebufferWidth,p.framebufferHeight,!1),y=new Qn(p.framebufferWidth,p.framebufferHeight,{format:fn,type:bn,colorSpace:e.outputColorSpace,stencilBuffer:b.stencil,resolveDepthBuffer:p.ignoreDepthValues===!1,resolveStencilBuffer:p.ignoreDepthValues===!1})}y.isXRRenderTarget=!0,this.setFoveation(l),c=null,a=await s.requestReferenceSpace(o),Oe.setContext(s),Oe.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return m.getDepthTexture()};function $(j){for(let K=0;K<j.removed.length;K++){const le=j.removed[K],Me=A.indexOf(le);Me>=0&&(A[Me]=null,w[Me].disconnect(le))}for(let K=0;K<j.added.length;K++){const le=j.added[K];let Me=A.indexOf(le);if(Me===-1){for(let ae=0;ae<w.length;ae++)if(ae>=A.length){A.push(le),Me=ae;break}else if(A[ae]===null){A[ae]=le,Me=ae;break}if(Me===-1)break}const de=w[Me];de&&de.connect(le)}}const B=new L,ie=new L;function re(j,K,le){B.setFromMatrixPosition(K.matrixWorld),ie.setFromMatrixPosition(le.matrixWorld);const Me=B.distanceTo(ie),de=K.projectionMatrix.elements,ae=le.projectionMatrix.elements,Ae=de[14]/(de[10]-1),R=de[14]/(de[10]+1),qe=(de[9]+1)/de[5],Le=(de[9]-1)/de[5],Te=(de[8]-1)/de[0],pe=(ae[8]+1)/ae[0],Ze=Ae*Te,fe=Ae*pe,Fe=Me/(-Te+pe),lt=Fe*-Te;if(K.matrixWorld.decompose(j.position,j.quaternion,j.scale),j.translateX(lt),j.translateZ(Fe),j.matrixWorld.compose(j.position,j.quaternion,j.scale),j.matrixWorldInverse.copy(j.matrixWorld).invert(),de[10]===-1)j.projectionMatrix.copy(K.projectionMatrix),j.projectionMatrixInverse.copy(K.projectionMatrixInverse);else{const st=Ae+Fe,T=R+Fe,x=Ze-lt,U=fe+(Me-lt),q=qe*R/T*st,Z=Le*R/T*st;j.projectionMatrix.makePerspective(x,U,q,Z,st,T),j.projectionMatrixInverse.copy(j.projectionMatrix).invert()}}function _e(j,K){K===null?j.matrixWorld.copy(j.matrix):j.matrixWorld.multiplyMatrices(K.matrixWorld,j.matrix),j.matrixWorldInverse.copy(j.matrixWorld).invert()}this.updateCamera=function(j){if(s===null)return;let K=j.near,le=j.far;m.texture!==null&&(m.depthNear>0&&(K=m.depthNear),m.depthFar>0&&(le=m.depthFar)),F.near=v.near=M.near=K,F.far=v.far=M.far=le,(z!==F.near||X!==F.far)&&(s.updateRenderState({depthNear:F.near,depthFar:F.far}),z=F.near,X=F.far),F.layers.mask=j.layers.mask|6,M.layers.mask=F.layers.mask&3,v.layers.mask=F.layers.mask&5;const Me=j.parent,de=F.cameras;_e(F,Me);for(let ae=0;ae<de.length;ae++)_e(de[ae],Me);de.length===2?re(F,M,v):F.projectionMatrix.copy(M.projectionMatrix),Ie(j,F,Me)};function Ie(j,K,le){le===null?j.matrix.copy(K.matrixWorld):(j.matrix.copy(le.matrixWorld),j.matrix.invert(),j.matrix.multiply(K.matrixWorld)),j.matrix.decompose(j.position,j.quaternion,j.scale),j.updateMatrixWorld(!0),j.projectionMatrix.copy(K.projectionMatrix),j.projectionMatrixInverse.copy(K.projectionMatrixInverse),j.isPerspectiveCamera&&(j.fov=ts*2*Math.atan(1/j.projectionMatrix.elements[5]),j.zoom=1)}this.getCamera=function(){return F},this.getFoveation=function(){if(!(f===null&&p===null))return l},this.setFoveation=function(j){l=j,f!==null&&(f.fixedFoveation=j),p!==null&&p.fixedFoveation!==void 0&&(p.fixedFoveation=j)},this.hasDepthSensing=function(){return m.texture!==null},this.getDepthSensingMesh=function(){return m.getMesh(F)},this.getCameraTexture=function(j){return d[j]};let He=null;function Xe(j,K){if(h=K.getViewerPose(c||a),g=K,h!==null){const le=h.views;p!==null&&(e.setRenderTargetFramebuffer(y,p.framebuffer),e.setRenderTarget(y));let Me=!1;le.length!==F.cameras.length&&(F.cameras.length=0,Me=!0);for(let R=0;R<le.length;R++){const qe=le[R];let Le=null;if(p!==null)Le=p.getViewport(qe);else{const pe=u.getViewSubImage(f,qe);Le=pe.viewport,R===0&&(e.setRenderTargetTextures(y,pe.colorTexture,pe.depthStencilTexture),e.setRenderTarget(y))}let Te=C[R];Te===void 0&&(Te=new zt,Te.layers.enable(R),Te.viewport=new et,C[R]=Te),Te.matrix.fromArray(qe.transform.matrix),Te.matrix.decompose(Te.position,Te.quaternion,Te.scale),Te.projectionMatrix.fromArray(qe.projectionMatrix),Te.projectionMatrixInverse.copy(Te.projectionMatrix).invert(),Te.viewport.set(Le.x,Le.y,Le.width,Le.height),R===0&&(F.matrix.copy(Te.matrix),F.matrix.decompose(F.position,F.quaternion,F.scale)),Me===!0&&F.cameras.push(Te)}const de=s.enabledFeatures;if(de&&de.includes("depth-sensing")&&s.depthUsage=="gpu-optimized"&&_){u=n.getBinding();const R=u.getDepthInformation(le[0]);R&&R.isValid&&R.texture&&m.init(R,s.renderState)}if(de&&de.includes("camera-access")&&_){e.state.unbindTexture(),u=n.getBinding();for(let R=0;R<le.length;R++){const qe=le[R].camera;if(qe){let Le=d[qe];Le||(Le=new rh,d[qe]=Le);const Te=u.getCameraImage(qe);Le.sourceTexture=Te}}}}for(let le=0;le<w.length;le++){const Me=A[le],de=w[le];Me!==null&&de!==void 0&&de.update(Me,K,c||a)}He&&He(j,K),K.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:K}),g=null}const Oe=new ah;Oe.setAnimationLoop(Xe),this.setAnimationLoop=function(j){He=j},this.dispose=function(){}}}const li=new pn,s_=new je;function r_(i,e){function t(m,d){m.matrixAutoUpdate===!0&&m.updateMatrix(),d.value.copy(m.matrix)}function n(m,d){d.color.getRGB(m.fogColor.value,nh(i)),d.isFog?(m.fogNear.value=d.near,m.fogFar.value=d.far):d.isFogExp2&&(m.fogDensity.value=d.density)}function s(m,d,b,E,y){d.isMeshBasicMaterial||d.isMeshLambertMaterial?r(m,d):d.isMeshToonMaterial?(r(m,d),u(m,d)):d.isMeshPhongMaterial?(r(m,d),h(m,d)):d.isMeshStandardMaterial?(r(m,d),f(m,d),d.isMeshPhysicalMaterial&&p(m,d,y)):d.isMeshMatcapMaterial?(r(m,d),g(m,d)):d.isMeshDepthMaterial?r(m,d):d.isMeshDistanceMaterial?(r(m,d),_(m,d)):d.isMeshNormalMaterial?r(m,d):d.isLineBasicMaterial?(a(m,d),d.isLineDashedMaterial&&o(m,d)):d.isPointsMaterial?l(m,d,b,E):d.isSpriteMaterial?c(m,d):d.isShadowMaterial?(m.color.value.copy(d.color),m.opacity.value=d.opacity):d.isShaderMaterial&&(d.uniformsNeedUpdate=!1)}function r(m,d){m.opacity.value=d.opacity,d.color&&m.diffuse.value.copy(d.color),d.emissive&&m.emissive.value.copy(d.emissive).multiplyScalar(d.emissiveIntensity),d.map&&(m.map.value=d.map,t(d.map,m.mapTransform)),d.alphaMap&&(m.alphaMap.value=d.alphaMap,t(d.alphaMap,m.alphaMapTransform)),d.bumpMap&&(m.bumpMap.value=d.bumpMap,t(d.bumpMap,m.bumpMapTransform),m.bumpScale.value=d.bumpScale,d.side===Nt&&(m.bumpScale.value*=-1)),d.normalMap&&(m.normalMap.value=d.normalMap,t(d.normalMap,m.normalMapTransform),m.normalScale.value.copy(d.normalScale),d.side===Nt&&m.normalScale.value.negate()),d.displacementMap&&(m.displacementMap.value=d.displacementMap,t(d.displacementMap,m.displacementMapTransform),m.displacementScale.value=d.displacementScale,m.displacementBias.value=d.displacementBias),d.emissiveMap&&(m.emissiveMap.value=d.emissiveMap,t(d.emissiveMap,m.emissiveMapTransform)),d.specularMap&&(m.specularMap.value=d.specularMap,t(d.specularMap,m.specularMapTransform)),d.alphaTest>0&&(m.alphaTest.value=d.alphaTest);const b=e.get(d),E=b.envMap,y=b.envMapRotation;E&&(m.envMap.value=E,li.copy(y),li.x*=-1,li.y*=-1,li.z*=-1,E.isCubeTexture&&E.isRenderTargetTexture===!1&&(li.y*=-1,li.z*=-1),m.envMapRotation.value.setFromMatrix4(s_.makeRotationFromEuler(li)),m.flipEnvMap.value=E.isCubeTexture&&E.isRenderTargetTexture===!1?-1:1,m.reflectivity.value=d.reflectivity,m.ior.value=d.ior,m.refractionRatio.value=d.refractionRatio),d.lightMap&&(m.lightMap.value=d.lightMap,m.lightMapIntensity.value=d.lightMapIntensity,t(d.lightMap,m.lightMapTransform)),d.aoMap&&(m.aoMap.value=d.aoMap,m.aoMapIntensity.value=d.aoMapIntensity,t(d.aoMap,m.aoMapTransform))}function a(m,d){m.diffuse.value.copy(d.color),m.opacity.value=d.opacity,d.map&&(m.map.value=d.map,t(d.map,m.mapTransform))}function o(m,d){m.dashSize.value=d.dashSize,m.totalSize.value=d.dashSize+d.gapSize,m.scale.value=d.scale}function l(m,d,b,E){m.diffuse.value.copy(d.color),m.opacity.value=d.opacity,m.size.value=d.size*b,m.scale.value=E*.5,d.map&&(m.map.value=d.map,t(d.map,m.uvTransform)),d.alphaMap&&(m.alphaMap.value=d.alphaMap,t(d.alphaMap,m.alphaMapTransform)),d.alphaTest>0&&(m.alphaTest.value=d.alphaTest)}function c(m,d){m.diffuse.value.copy(d.color),m.opacity.value=d.opacity,m.rotation.value=d.rotation,d.map&&(m.map.value=d.map,t(d.map,m.mapTransform)),d.alphaMap&&(m.alphaMap.value=d.alphaMap,t(d.alphaMap,m.alphaMapTransform)),d.alphaTest>0&&(m.alphaTest.value=d.alphaTest)}function h(m,d){m.specular.value.copy(d.specular),m.shininess.value=Math.max(d.shininess,1e-4)}function u(m,d){d.gradientMap&&(m.gradientMap.value=d.gradientMap)}function f(m,d){m.metalness.value=d.metalness,d.metalnessMap&&(m.metalnessMap.value=d.metalnessMap,t(d.metalnessMap,m.metalnessMapTransform)),m.roughness.value=d.roughness,d.roughnessMap&&(m.roughnessMap.value=d.roughnessMap,t(d.roughnessMap,m.roughnessMapTransform)),d.envMap&&(m.envMapIntensity.value=d.envMapIntensity)}function p(m,d,b){m.ior.value=d.ior,d.sheen>0&&(m.sheenColor.value.copy(d.sheenColor).multiplyScalar(d.sheen),m.sheenRoughness.value=d.sheenRoughness,d.sheenColorMap&&(m.sheenColorMap.value=d.sheenColorMap,t(d.sheenColorMap,m.sheenColorMapTransform)),d.sheenRoughnessMap&&(m.sheenRoughnessMap.value=d.sheenRoughnessMap,t(d.sheenRoughnessMap,m.sheenRoughnessMapTransform))),d.clearcoat>0&&(m.clearcoat.value=d.clearcoat,m.clearcoatRoughness.value=d.clearcoatRoughness,d.clearcoatMap&&(m.clearcoatMap.value=d.clearcoatMap,t(d.clearcoatMap,m.clearcoatMapTransform)),d.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=d.clearcoatRoughnessMap,t(d.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),d.clearcoatNormalMap&&(m.clearcoatNormalMap.value=d.clearcoatNormalMap,t(d.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(d.clearcoatNormalScale),d.side===Nt&&m.clearcoatNormalScale.value.negate())),d.dispersion>0&&(m.dispersion.value=d.dispersion),d.iridescence>0&&(m.iridescence.value=d.iridescence,m.iridescenceIOR.value=d.iridescenceIOR,m.iridescenceThicknessMinimum.value=d.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=d.iridescenceThicknessRange[1],d.iridescenceMap&&(m.iridescenceMap.value=d.iridescenceMap,t(d.iridescenceMap,m.iridescenceMapTransform)),d.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=d.iridescenceThicknessMap,t(d.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),d.transmission>0&&(m.transmission.value=d.transmission,m.transmissionSamplerMap.value=b.texture,m.transmissionSamplerSize.value.set(b.width,b.height),d.transmissionMap&&(m.transmissionMap.value=d.transmissionMap,t(d.transmissionMap,m.transmissionMapTransform)),m.thickness.value=d.thickness,d.thicknessMap&&(m.thicknessMap.value=d.thicknessMap,t(d.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=d.attenuationDistance,m.attenuationColor.value.copy(d.attenuationColor)),d.anisotropy>0&&(m.anisotropyVector.value.set(d.anisotropy*Math.cos(d.anisotropyRotation),d.anisotropy*Math.sin(d.anisotropyRotation)),d.anisotropyMap&&(m.anisotropyMap.value=d.anisotropyMap,t(d.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=d.specularIntensity,m.specularColor.value.copy(d.specularColor),d.specularColorMap&&(m.specularColorMap.value=d.specularColorMap,t(d.specularColorMap,m.specularColorMapTransform)),d.specularIntensityMap&&(m.specularIntensityMap.value=d.specularIntensityMap,t(d.specularIntensityMap,m.specularIntensityMapTransform))}function g(m,d){d.matcap&&(m.matcap.value=d.matcap)}function _(m,d){const b=e.get(d).light;m.referencePosition.value.setFromMatrixPosition(b.matrixWorld),m.nearDistance.value=b.shadow.camera.near,m.farDistance.value=b.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:s}}function a_(i,e,t,n){let s={},r={},a=[];const o=i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS);function l(b,E){const y=E.program;n.uniformBlockBinding(b,y)}function c(b,E){let y=s[b.id];y===void 0&&(g(b),y=h(b),s[b.id]=y,b.addEventListener("dispose",m));const w=E.program;n.updateUBOMapping(b,w);const A=e.render.frame;r[b.id]!==A&&(f(b),r[b.id]=A)}function h(b){const E=u();b.__bindingPointIndex=E;const y=i.createBuffer(),w=b.__size,A=b.usage;return i.bindBuffer(i.UNIFORM_BUFFER,y),i.bufferData(i.UNIFORM_BUFFER,w,A),i.bindBuffer(i.UNIFORM_BUFFER,null),i.bindBufferBase(i.UNIFORM_BUFFER,E,y),y}function u(){for(let b=0;b<o;b++)if(a.indexOf(b)===-1)return a.push(b),b;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function f(b){const E=s[b.id],y=b.uniforms,w=b.__cache;i.bindBuffer(i.UNIFORM_BUFFER,E);for(let A=0,P=y.length;A<P;A++){const I=Array.isArray(y[A])?y[A]:[y[A]];for(let M=0,v=I.length;M<v;M++){const C=I[M];if(p(C,A,M,w)===!0){const F=C.__offset,z=Array.isArray(C.value)?C.value:[C.value];let X=0;for(let V=0;V<z.length;V++){const G=z[V],$=_(G);typeof G=="number"||typeof G=="boolean"?(C.__data[0]=G,i.bufferSubData(i.UNIFORM_BUFFER,F+X,C.__data)):G.isMatrix3?(C.__data[0]=G.elements[0],C.__data[1]=G.elements[1],C.__data[2]=G.elements[2],C.__data[3]=0,C.__data[4]=G.elements[3],C.__data[5]=G.elements[4],C.__data[6]=G.elements[5],C.__data[7]=0,C.__data[8]=G.elements[6],C.__data[9]=G.elements[7],C.__data[10]=G.elements[8],C.__data[11]=0):(G.toArray(C.__data,X),X+=$.storage/Float32Array.BYTES_PER_ELEMENT)}i.bufferSubData(i.UNIFORM_BUFFER,F,C.__data)}}}i.bindBuffer(i.UNIFORM_BUFFER,null)}function p(b,E,y,w){const A=b.value,P=E+"_"+y;if(w[P]===void 0)return typeof A=="number"||typeof A=="boolean"?w[P]=A:w[P]=A.clone(),!0;{const I=w[P];if(typeof A=="number"||typeof A=="boolean"){if(I!==A)return w[P]=A,!0}else if(I.equals(A)===!1)return I.copy(A),!0}return!1}function g(b){const E=b.uniforms;let y=0;const w=16;for(let P=0,I=E.length;P<I;P++){const M=Array.isArray(E[P])?E[P]:[E[P]];for(let v=0,C=M.length;v<C;v++){const F=M[v],z=Array.isArray(F.value)?F.value:[F.value];for(let X=0,V=z.length;X<V;X++){const G=z[X],$=_(G),B=y%w,ie=B%$.boundary,re=B+ie;y+=ie,re!==0&&w-re<$.storage&&(y+=w-re),F.__data=new Float32Array($.storage/Float32Array.BYTES_PER_ELEMENT),F.__offset=y,y+=$.storage}}}const A=y%w;return A>0&&(y+=w-A),b.__size=y,b.__cache={},this}function _(b){const E={boundary:0,storage:0};return typeof b=="number"||typeof b=="boolean"?(E.boundary=4,E.storage=4):b.isVector2?(E.boundary=8,E.storage=8):b.isVector3||b.isColor?(E.boundary=16,E.storage=12):b.isVector4?(E.boundary=16,E.storage=16):b.isMatrix3?(E.boundary=48,E.storage=48):b.isMatrix4?(E.boundary=64,E.storage=64):b.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",b),E}function m(b){const E=b.target;E.removeEventListener("dispose",m);const y=a.indexOf(E.__bindingPointIndex);a.splice(y,1),i.deleteBuffer(s[E.id]),delete s[E.id],delete r[E.id]}function d(){for(const b in s)i.deleteBuffer(s[b]);a=[],s={},r={}}return{bind:l,update:c,dispose:d}}class o_{constructor(e={}){const{canvas:t=Ud(),context:n=null,depth:s=!0,stencil:r=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:u=!1,reversedDepthBuffer:f=!1}=e;this.isWebGLRenderer=!0;let p;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");p=n.getContextAttributes().alpha}else p=a;const g=new Uint32Array(4),_=new Int32Array(4);let m=null,d=null;const b=[],E=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=Zn,this.toneMappingExposure=1,this.transmissionResolutionScale=1;const y=this;let w=!1;this._outputColorSpace=St;let A=0,P=0,I=null,M=-1,v=null;const C=new et,F=new et;let z=null;const X=new Ne(0);let V=0,G=t.width,$=t.height,B=1,ie=null,re=null;const _e=new et(0,0,G,$),Ie=new et(0,0,G,$);let He=!1;const Xe=new Po;let Oe=!1,j=!1;const K=new je,le=new L,Me=new et,de={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let ae=!1;function Ae(){return I===null?B:1}let R=n;function qe(S,O){return t.getContext(S,O)}try{const S={alpha:!0,depth:s,stencil:r,antialias:o,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:h,failIfMajorPerformanceCaveat:u};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${mo}`),t.addEventListener("webglcontextlost",se,!1),t.addEventListener("webglcontextrestored",ge,!1),t.addEventListener("webglcontextcreationerror",J,!1),R===null){const O="webgl2";if(R=qe(O,S),R===null)throw qe(O)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(S){throw console.error("THREE.WebGLRenderer: "+S.message),S}let Le,Te,pe,Ze,fe,Fe,lt,st,T,x,U,q,Z,W,Ee,ne,ve,ye,ee,ue,Pe,be,ce,ze;function D(){Le=new _g(R),Le.init(),be=new Q0(R,Le),Te=new hg(R,Le,e,be),pe=new Z0(R,Le),Te.reversedDepthBuffer&&f&&pe.buffers.depth.setReversed(!0),Ze=new vg(R),fe=new z0,Fe=new J0(R,Le,pe,fe,Te,be,Ze),lt=new dg(y),st=new gg(y),T=new wf(R),ce=new lg(R,T),x=new xg(R,T,Ze,ce),U=new yg(R,x,T,Ze),ee=new Mg(R,Te,Fe),ne=new ug(fe),q=new U0(y,lt,st,Le,Te,ce,ne),Z=new r_(y,fe),W=new H0,Ee=new q0(Le),ye=new og(y,lt,st,pe,U,p,l),ve=new $0(y,U,Te),ze=new a_(R,Ze,Te,pe),ue=new cg(R,Le,Ze),Pe=new Sg(R,Le,Ze),Ze.programs=q.programs,y.capabilities=Te,y.extensions=Le,y.properties=fe,y.renderLists=W,y.shadowMap=ve,y.state=pe,y.info=Ze}D();const te=new i_(y,R);this.xr=te,this.getContext=function(){return R},this.getContextAttributes=function(){return R.getContextAttributes()},this.forceContextLoss=function(){const S=Le.get("WEBGL_lose_context");S&&S.loseContext()},this.forceContextRestore=function(){const S=Le.get("WEBGL_lose_context");S&&S.restoreContext()},this.getPixelRatio=function(){return B},this.setPixelRatio=function(S){S!==void 0&&(B=S,this.setSize(G,$,!1))},this.getSize=function(S){return S.set(G,$)},this.setSize=function(S,O,H=!0){if(te.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}G=S,$=O,t.width=Math.floor(S*B),t.height=Math.floor(O*B),H===!0&&(t.style.width=S+"px",t.style.height=O+"px"),this.setViewport(0,0,S,O)},this.getDrawingBufferSize=function(S){return S.set(G*B,$*B).floor()},this.setDrawingBufferSize=function(S,O,H){G=S,$=O,B=H,t.width=Math.floor(S*H),t.height=Math.floor(O*H),this.setViewport(0,0,S,O)},this.getCurrentViewport=function(S){return S.copy(C)},this.getViewport=function(S){return S.copy(_e)},this.setViewport=function(S,O,H,k){S.isVector4?_e.set(S.x,S.y,S.z,S.w):_e.set(S,O,H,k),pe.viewport(C.copy(_e).multiplyScalar(B).round())},this.getScissor=function(S){return S.copy(Ie)},this.setScissor=function(S,O,H,k){S.isVector4?Ie.set(S.x,S.y,S.z,S.w):Ie.set(S,O,H,k),pe.scissor(F.copy(Ie).multiplyScalar(B).round())},this.getScissorTest=function(){return He},this.setScissorTest=function(S){pe.setScissorTest(He=S)},this.setOpaqueSort=function(S){ie=S},this.setTransparentSort=function(S){re=S},this.getClearColor=function(S){return S.copy(ye.getClearColor())},this.setClearColor=function(){ye.setClearColor(...arguments)},this.getClearAlpha=function(){return ye.getClearAlpha()},this.setClearAlpha=function(){ye.setClearAlpha(...arguments)},this.clear=function(S=!0,O=!0,H=!0){let k=0;if(S){let N=!1;if(I!==null){const Q=I.texture.format;N=Q===bo||Q===yo||Q===Mo}if(N){const Q=I.texture.type,he=Q===bn||Q===gi||Q===Ms||Q===ys||Q===xo||Q===So,xe=ye.getClearColor(),me=ye.getClearAlpha(),Ce=xe.r,De=xe.g,we=xe.b;he?(g[0]=Ce,g[1]=De,g[2]=we,g[3]=me,R.clearBufferuiv(R.COLOR,0,g)):(_[0]=Ce,_[1]=De,_[2]=we,_[3]=me,R.clearBufferiv(R.COLOR,0,_))}else k|=R.COLOR_BUFFER_BIT}O&&(k|=R.DEPTH_BUFFER_BIT),H&&(k|=R.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),R.clear(k)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",se,!1),t.removeEventListener("webglcontextrestored",ge,!1),t.removeEventListener("webglcontextcreationerror",J,!1),ye.dispose(),W.dispose(),Ee.dispose(),fe.dispose(),lt.dispose(),st.dispose(),U.dispose(),ce.dispose(),ze.dispose(),q.dispose(),te.dispose(),te.removeEventListener("sessionstart",mn),te.removeEventListener("sessionend",zo),ti.stop()};function se(S){S.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),w=!0}function ge(){console.log("THREE.WebGLRenderer: Context Restored."),w=!1;const S=Ze.autoReset,O=ve.enabled,H=ve.autoUpdate,k=ve.needsUpdate,N=ve.type;D(),Ze.autoReset=S,ve.enabled=O,ve.autoUpdate=H,ve.needsUpdate=k,ve.type=N}function J(S){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",S.statusMessage)}function Y(S){const O=S.target;O.removeEventListener("dispose",Y),Se(O)}function Se(S){Ue(S),fe.remove(S)}function Ue(S){const O=fe.get(S).programs;O!==void 0&&(O.forEach(function(H){q.releaseProgram(H)}),S.isShaderMaterial&&q.releaseShaderCache(S))}this.renderBufferDirect=function(S,O,H,k,N,Q){O===null&&(O=de);const he=N.isMesh&&N.matrixWorld.determinant()<0,xe=gh(S,O,H,k,N);pe.setMaterial(k,he);let me=H.index,Ce=1;if(k.wireframe===!0){if(me=x.getWireframeAttribute(H),me===void 0)return;Ce=2}const De=H.drawRange,we=H.attributes.position;let Ve=De.start*Ce,Je=(De.start+De.count)*Ce;Q!==null&&(Ve=Math.max(Ve,Q.start*Ce),Je=Math.min(Je,(Q.start+Q.count)*Ce)),me!==null?(Ve=Math.max(Ve,0),Je=Math.min(Je,me.count)):we!=null&&(Ve=Math.max(Ve,0),Je=Math.min(Je,we.count));const ct=Je-Ve;if(ct<0||ct===1/0)return;ce.setup(N,k,xe,H,me);let rt,tt=ue;if(me!==null&&(rt=T.get(me),tt=Pe,tt.setIndex(rt)),N.isMesh)k.wireframe===!0?(pe.setLineWidth(k.wireframeLinewidth*Ae()),tt.setMode(R.LINES)):tt.setMode(R.TRIANGLES);else if(N.isLine){let Re=k.linewidth;Re===void 0&&(Re=1),pe.setLineWidth(Re*Ae()),N.isLineSegments?tt.setMode(R.LINES):N.isLineLoop?tt.setMode(R.LINE_LOOP):tt.setMode(R.LINE_STRIP)}else N.isPoints?tt.setMode(R.POINTS):N.isSprite&&tt.setMode(R.TRIANGLES);if(N.isBatchedMesh)if(N._multiDrawInstances!==null)Ts("THREE.WebGLRenderer: renderMultiDrawInstances has been deprecated and will be removed in r184. Append to renderMultiDraw arguments and use indirection."),tt.renderMultiDrawInstances(N._multiDrawStarts,N._multiDrawCounts,N._multiDrawCount,N._multiDrawInstances);else if(Le.get("WEBGL_multi_draw"))tt.renderMultiDraw(N._multiDrawStarts,N._multiDrawCounts,N._multiDrawCount);else{const Re=N._multiDrawStarts,at=N._multiDrawCounts,Ye=N._multiDrawCount,Bt=me?T.get(me).bytesPerElement:1,vi=fe.get(k).currentProgram.getUniforms();for(let Ht=0;Ht<Ye;Ht++)vi.setValue(R,"_gl_DrawID",Ht),tt.render(Re[Ht]/Bt,at[Ht])}else if(N.isInstancedMesh)tt.renderInstances(Ve,ct,N.count);else if(H.isInstancedBufferGeometry){const Re=H._maxInstanceCount!==void 0?H._maxInstanceCount:1/0,at=Math.min(H.instanceCount,Re);tt.renderInstances(Ve,ct,at)}else tt.render(Ve,ct)};function it(S,O,H){S.transparent===!0&&S.side===cn&&S.forceSinglePass===!1?(S.side=Nt,S.needsUpdate=!0,Ds(S,O,H),S.side=Jn,S.needsUpdate=!0,Ds(S,O,H),S.side=cn):Ds(S,O,H)}this.compile=function(S,O,H=null){H===null&&(H=S),d=Ee.get(H),d.init(O),E.push(d),H.traverseVisible(function(N){N.isLight&&N.layers.test(O.layers)&&(d.pushLight(N),N.castShadow&&d.pushShadow(N))}),S!==H&&S.traverseVisible(function(N){N.isLight&&N.layers.test(O.layers)&&(d.pushLight(N),N.castShadow&&d.pushShadow(N))}),d.setupLights();const k=new Set;return S.traverse(function(N){if(!(N.isMesh||N.isPoints||N.isLine||N.isSprite))return;const Q=N.material;if(Q)if(Array.isArray(Q))for(let he=0;he<Q.length;he++){const xe=Q[he];it(xe,H,N),k.add(xe)}else it(Q,H,N),k.add(Q)}),d=E.pop(),k},this.compileAsync=function(S,O,H=null){const k=this.compile(S,O,H);return new Promise(N=>{function Q(){if(k.forEach(function(he){fe.get(he).currentProgram.isReady()&&k.delete(he)}),k.size===0){N(S);return}setTimeout(Q,10)}Le.get("KHR_parallel_shader_compile")!==null?Q():setTimeout(Q,10)})};let Ke=null;function En(S){Ke&&Ke(S)}function mn(){ti.stop()}function zo(){ti.start()}const ti=new ah;ti.setAnimationLoop(En),typeof self<"u"&&ti.setContext(self),this.setAnimationLoop=function(S){Ke=S,te.setAnimationLoop(S),S===null?ti.stop():ti.start()},te.addEventListener("sessionstart",mn),te.addEventListener("sessionend",zo),this.render=function(S,O){if(O!==void 0&&O.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(w===!0)return;if(S.matrixWorldAutoUpdate===!0&&S.updateMatrixWorld(),O.parent===null&&O.matrixWorldAutoUpdate===!0&&O.updateMatrixWorld(),te.enabled===!0&&te.isPresenting===!0&&(te.cameraAutoUpdate===!0&&te.updateCamera(O),O=te.getCamera()),S.isScene===!0&&S.onBeforeRender(y,S,O,I),d=Ee.get(S,E.length),d.init(O),E.push(d),K.multiplyMatrices(O.projectionMatrix,O.matrixWorldInverse),Xe.setFromProjectionMatrix(K,Mn,O.reversedDepth),j=this.localClippingEnabled,Oe=ne.init(this.clippingPlanes,j),m=W.get(S,b.length),m.init(),b.push(m),te.enabled===!0&&te.isPresenting===!0){const Q=y.xr.getDepthSensingMesh();Q!==null&&Lr(Q,O,-1/0,y.sortObjects)}Lr(S,O,0,y.sortObjects),m.finish(),y.sortObjects===!0&&m.sort(ie,re),ae=te.enabled===!1||te.isPresenting===!1||te.hasDepthSensing()===!1,ae&&ye.addToRenderList(m,S),this.info.render.frame++,Oe===!0&&ne.beginShadows();const H=d.state.shadowsArray;ve.render(H,S,O),Oe===!0&&ne.endShadows(),this.info.autoReset===!0&&this.info.reset();const k=m.opaque,N=m.transmissive;if(d.setupLights(),O.isArrayCamera){const Q=O.cameras;if(N.length>0)for(let he=0,xe=Q.length;he<xe;he++){const me=Q[he];Ho(k,N,S,me)}ae&&ye.render(S);for(let he=0,xe=Q.length;he<xe;he++){const me=Q[he];Bo(m,S,me,me.viewport)}}else N.length>0&&Ho(k,N,S,O),ae&&ye.render(S),Bo(m,S,O);I!==null&&P===0&&(Fe.updateMultisampleRenderTarget(I),Fe.updateRenderTargetMipmap(I)),S.isScene===!0&&S.onAfterRender(y,S,O),ce.resetDefaultState(),M=-1,v=null,E.pop(),E.length>0?(d=E[E.length-1],Oe===!0&&ne.setGlobalState(y.clippingPlanes,d.state.camera)):d=null,b.pop(),b.length>0?m=b[b.length-1]:m=null};function Lr(S,O,H,k){if(S.visible===!1)return;if(S.layers.test(O.layers)){if(S.isGroup)H=S.renderOrder;else if(S.isLOD)S.autoUpdate===!0&&S.update(O);else if(S.isLight)d.pushLight(S),S.castShadow&&d.pushShadow(S);else if(S.isSprite){if(!S.frustumCulled||Xe.intersectsSprite(S)){k&&Me.setFromMatrixPosition(S.matrixWorld).applyMatrix4(K);const he=U.update(S),xe=S.material;xe.visible&&m.push(S,he,xe,H,Me.z,null)}}else if((S.isMesh||S.isLine||S.isPoints)&&(!S.frustumCulled||Xe.intersectsObject(S))){const he=U.update(S),xe=S.material;if(k&&(S.boundingSphere!==void 0?(S.boundingSphere===null&&S.computeBoundingSphere(),Me.copy(S.boundingSphere.center)):(he.boundingSphere===null&&he.computeBoundingSphere(),Me.copy(he.boundingSphere.center)),Me.applyMatrix4(S.matrixWorld).applyMatrix4(K)),Array.isArray(xe)){const me=he.groups;for(let Ce=0,De=me.length;Ce<De;Ce++){const we=me[Ce],Ve=xe[we.materialIndex];Ve&&Ve.visible&&m.push(S,he,Ve,H,Me.z,we)}}else xe.visible&&m.push(S,he,xe,H,Me.z,null)}}const Q=S.children;for(let he=0,xe=Q.length;he<xe;he++)Lr(Q[he],O,H,k)}function Bo(S,O,H,k){const N=S.opaque,Q=S.transmissive,he=S.transparent;d.setupLightsView(H),Oe===!0&&ne.setGlobalState(y.clippingPlanes,H),k&&pe.viewport(C.copy(k)),N.length>0&&Ls(N,O,H),Q.length>0&&Ls(Q,O,H),he.length>0&&Ls(he,O,H),pe.buffers.depth.setTest(!0),pe.buffers.depth.setMask(!0),pe.buffers.color.setMask(!0),pe.setPolygonOffset(!1)}function Ho(S,O,H,k){if((H.isScene===!0?H.overrideMaterial:null)!==null)return;d.state.transmissionRenderTarget[k.id]===void 0&&(d.state.transmissionRenderTarget[k.id]=new Qn(1,1,{generateMipmaps:!0,type:Le.has("EXT_color_buffer_half_float")||Le.has("EXT_color_buffer_float")?Rs:bn,minFilter:fi,samples:4,stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:$e.workingColorSpace}));const Q=d.state.transmissionRenderTarget[k.id],he=k.viewport||C;Q.setSize(he.z*y.transmissionResolutionScale,he.w*y.transmissionResolutionScale);const xe=y.getRenderTarget(),me=y.getActiveCubeFace(),Ce=y.getActiveMipmapLevel();y.setRenderTarget(Q),y.getClearColor(X),V=y.getClearAlpha(),V<1&&y.setClearColor(16777215,.5),y.clear(),ae&&ye.render(H);const De=y.toneMapping;y.toneMapping=Zn;const we=k.viewport;if(k.viewport!==void 0&&(k.viewport=void 0),d.setupLightsView(k),Oe===!0&&ne.setGlobalState(y.clippingPlanes,k),Ls(S,H,k),Fe.updateMultisampleRenderTarget(Q),Fe.updateRenderTargetMipmap(Q),Le.has("WEBGL_multisampled_render_to_texture")===!1){let Ve=!1;for(let Je=0,ct=O.length;Je<ct;Je++){const rt=O[Je],tt=rt.object,Re=rt.geometry,at=rt.material,Ye=rt.group;if(at.side===cn&&tt.layers.test(k.layers)){const Bt=at.side;at.side=Nt,at.needsUpdate=!0,ko(tt,H,k,Re,at,Ye),at.side=Bt,at.needsUpdate=!0,Ve=!0}}Ve===!0&&(Fe.updateMultisampleRenderTarget(Q),Fe.updateRenderTargetMipmap(Q))}y.setRenderTarget(xe,me,Ce),y.setClearColor(X,V),we!==void 0&&(k.viewport=we),y.toneMapping=De}function Ls(S,O,H){const k=O.isScene===!0?O.overrideMaterial:null;for(let N=0,Q=S.length;N<Q;N++){const he=S[N],xe=he.object,me=he.geometry,Ce=he.group;let De=he.material;De.allowOverride===!0&&k!==null&&(De=k),xe.layers.test(H.layers)&&ko(xe,O,H,me,De,Ce)}}function ko(S,O,H,k,N,Q){S.onBeforeRender(y,O,H,k,N,Q),S.modelViewMatrix.multiplyMatrices(H.matrixWorldInverse,S.matrixWorld),S.normalMatrix.getNormalMatrix(S.modelViewMatrix),N.onBeforeRender(y,O,H,k,S,Q),N.transparent===!0&&N.side===cn&&N.forceSinglePass===!1?(N.side=Nt,N.needsUpdate=!0,y.renderBufferDirect(H,O,k,N,S,Q),N.side=Jn,N.needsUpdate=!0,y.renderBufferDirect(H,O,k,N,S,Q),N.side=cn):y.renderBufferDirect(H,O,k,N,S,Q),S.onAfterRender(y,O,H,k,N,Q)}function Ds(S,O,H){O.isScene!==!0&&(O=de);const k=fe.get(S),N=d.state.lights,Q=d.state.shadowsArray,he=N.state.version,xe=q.getParameters(S,N.state,Q,O,H),me=q.getProgramCacheKey(xe);let Ce=k.programs;k.environment=S.isMeshStandardMaterial?O.environment:null,k.fog=O.fog,k.envMap=(S.isMeshStandardMaterial?st:lt).get(S.envMap||k.environment),k.envMapRotation=k.environment!==null&&S.envMap===null?O.environmentRotation:S.envMapRotation,Ce===void 0&&(S.addEventListener("dispose",Y),Ce=new Map,k.programs=Ce);let De=Ce.get(me);if(De!==void 0){if(k.currentProgram===De&&k.lightsStateVersion===he)return Vo(S,xe),De}else xe.uniforms=q.getUniforms(S),S.onBeforeCompile(xe,y),De=q.acquireProgram(xe,me),Ce.set(me,De),k.uniforms=xe.uniforms;const we=k.uniforms;return(!S.isShaderMaterial&&!S.isRawShaderMaterial||S.clipping===!0)&&(we.clippingPlanes=ne.uniform),Vo(S,xe),k.needsLights=xh(S),k.lightsStateVersion=he,k.needsLights&&(we.ambientLightColor.value=N.state.ambient,we.lightProbe.value=N.state.probe,we.directionalLights.value=N.state.directional,we.directionalLightShadows.value=N.state.directionalShadow,we.spotLights.value=N.state.spot,we.spotLightShadows.value=N.state.spotShadow,we.rectAreaLights.value=N.state.rectArea,we.ltc_1.value=N.state.rectAreaLTC1,we.ltc_2.value=N.state.rectAreaLTC2,we.pointLights.value=N.state.point,we.pointLightShadows.value=N.state.pointShadow,we.hemisphereLights.value=N.state.hemi,we.directionalShadowMap.value=N.state.directionalShadowMap,we.directionalShadowMatrix.value=N.state.directionalShadowMatrix,we.spotShadowMap.value=N.state.spotShadowMap,we.spotLightMatrix.value=N.state.spotLightMatrix,we.spotLightMap.value=N.state.spotLightMap,we.pointShadowMap.value=N.state.pointShadowMap,we.pointShadowMatrix.value=N.state.pointShadowMatrix),k.currentProgram=De,k.uniformsList=null,De}function Go(S){if(S.uniformsList===null){const O=S.currentProgram.getUniforms();S.uniformsList=_r.seqWithValue(O.seq,S.uniforms)}return S.uniformsList}function Vo(S,O){const H=fe.get(S);H.outputColorSpace=O.outputColorSpace,H.batching=O.batching,H.batchingColor=O.batchingColor,H.instancing=O.instancing,H.instancingColor=O.instancingColor,H.instancingMorph=O.instancingMorph,H.skinning=O.skinning,H.morphTargets=O.morphTargets,H.morphNormals=O.morphNormals,H.morphColors=O.morphColors,H.morphTargetsCount=O.morphTargetsCount,H.numClippingPlanes=O.numClippingPlanes,H.numIntersection=O.numClipIntersection,H.vertexAlphas=O.vertexAlphas,H.vertexTangents=O.vertexTangents,H.toneMapping=O.toneMapping}function gh(S,O,H,k,N){O.isScene!==!0&&(O=de),Fe.resetTextureUnits();const Q=O.fog,he=k.isMeshStandardMaterial?O.environment:null,xe=I===null?y.outputColorSpace:I.isXRRenderTarget===!0?I.texture.colorSpace:es,me=(k.isMeshStandardMaterial?st:lt).get(k.envMap||he),Ce=k.vertexColors===!0&&!!H.attributes.color&&H.attributes.color.itemSize===4,De=!!H.attributes.tangent&&(!!k.normalMap||k.anisotropy>0),we=!!H.morphAttributes.position,Ve=!!H.morphAttributes.normal,Je=!!H.morphAttributes.color;let ct=Zn;k.toneMapped&&(I===null||I.isXRRenderTarget===!0)&&(ct=y.toneMapping);const rt=H.morphAttributes.position||H.morphAttributes.normal||H.morphAttributes.color,tt=rt!==void 0?rt.length:0,Re=fe.get(k),at=d.state.lights;if(Oe===!0&&(j===!0||S!==v)){const Et=S===v&&k.id===M;ne.setState(k,S,Et)}let Ye=!1;k.version===Re.__version?(Re.needsLights&&Re.lightsStateVersion!==at.state.version||Re.outputColorSpace!==xe||N.isBatchedMesh&&Re.batching===!1||!N.isBatchedMesh&&Re.batching===!0||N.isBatchedMesh&&Re.batchingColor===!0&&N.colorTexture===null||N.isBatchedMesh&&Re.batchingColor===!1&&N.colorTexture!==null||N.isInstancedMesh&&Re.instancing===!1||!N.isInstancedMesh&&Re.instancing===!0||N.isSkinnedMesh&&Re.skinning===!1||!N.isSkinnedMesh&&Re.skinning===!0||N.isInstancedMesh&&Re.instancingColor===!0&&N.instanceColor===null||N.isInstancedMesh&&Re.instancingColor===!1&&N.instanceColor!==null||N.isInstancedMesh&&Re.instancingMorph===!0&&N.morphTexture===null||N.isInstancedMesh&&Re.instancingMorph===!1&&N.morphTexture!==null||Re.envMap!==me||k.fog===!0&&Re.fog!==Q||Re.numClippingPlanes!==void 0&&(Re.numClippingPlanes!==ne.numPlanes||Re.numIntersection!==ne.numIntersection)||Re.vertexAlphas!==Ce||Re.vertexTangents!==De||Re.morphTargets!==we||Re.morphNormals!==Ve||Re.morphColors!==Je||Re.toneMapping!==ct||Re.morphTargetsCount!==tt)&&(Ye=!0):(Ye=!0,Re.__version=k.version);let Bt=Re.currentProgram;Ye===!0&&(Bt=Ds(k,O,N));let vi=!1,Ht=!1,as=!1;const ot=Bt.getUniforms(),$t=Re.uniforms;if(pe.useProgram(Bt.program)&&(vi=!0,Ht=!0,as=!0),k.id!==M&&(M=k.id,Ht=!0),vi||v!==S){pe.buffers.depth.getReversed()&&S.reversedDepth!==!0&&(S._reversedDepth=!0,S.updateProjectionMatrix()),ot.setValue(R,"projectionMatrix",S.projectionMatrix),ot.setValue(R,"viewMatrix",S.matrixWorldInverse);const Ft=ot.map.cameraPosition;Ft!==void 0&&Ft.setValue(R,le.setFromMatrixPosition(S.matrixWorld)),Te.logarithmicDepthBuffer&&ot.setValue(R,"logDepthBufFC",2/(Math.log(S.far+1)/Math.LN2)),(k.isMeshPhongMaterial||k.isMeshToonMaterial||k.isMeshLambertMaterial||k.isMeshBasicMaterial||k.isMeshStandardMaterial||k.isShaderMaterial)&&ot.setValue(R,"isOrthographic",S.isOrthographicCamera===!0),v!==S&&(v=S,Ht=!0,as=!0)}if(N.isSkinnedMesh){ot.setOptional(R,N,"bindMatrix"),ot.setOptional(R,N,"bindMatrixInverse");const Et=N.skeleton;Et&&(Et.boneTexture===null&&Et.computeBoneTexture(),ot.setValue(R,"boneTexture",Et.boneTexture,Fe))}N.isBatchedMesh&&(ot.setOptional(R,N,"batchingTexture"),ot.setValue(R,"batchingTexture",N._matricesTexture,Fe),ot.setOptional(R,N,"batchingIdTexture"),ot.setValue(R,"batchingIdTexture",N._indirectTexture,Fe),ot.setOptional(R,N,"batchingColorTexture"),N._colorsTexture!==null&&ot.setValue(R,"batchingColorTexture",N._colorsTexture,Fe));const Kt=H.morphAttributes;if((Kt.position!==void 0||Kt.normal!==void 0||Kt.color!==void 0)&&ee.update(N,H,Bt),(Ht||Re.receiveShadow!==N.receiveShadow)&&(Re.receiveShadow=N.receiveShadow,ot.setValue(R,"receiveShadow",N.receiveShadow)),k.isMeshGouraudMaterial&&k.envMap!==null&&($t.envMap.value=me,$t.flipEnvMap.value=me.isCubeTexture&&me.isRenderTargetTexture===!1?-1:1),k.isMeshStandardMaterial&&k.envMap===null&&O.environment!==null&&($t.envMapIntensity.value=O.environmentIntensity),Ht&&(ot.setValue(R,"toneMappingExposure",y.toneMappingExposure),Re.needsLights&&_h($t,as),Q&&k.fog===!0&&Z.refreshFogUniforms($t,Q),Z.refreshMaterialUniforms($t,k,B,$,d.state.transmissionRenderTarget[S.id]),_r.upload(R,Go(Re),$t,Fe)),k.isShaderMaterial&&k.uniformsNeedUpdate===!0&&(_r.upload(R,Go(Re),$t,Fe),k.uniformsNeedUpdate=!1),k.isSpriteMaterial&&ot.setValue(R,"center",N.center),ot.setValue(R,"modelViewMatrix",N.modelViewMatrix),ot.setValue(R,"normalMatrix",N.normalMatrix),ot.setValue(R,"modelMatrix",N.matrixWorld),k.isShaderMaterial||k.isRawShaderMaterial){const Et=k.uniformsGroups;for(let Ft=0,Dr=Et.length;Ft<Dr;Ft++){const ni=Et[Ft];ze.update(ni,Bt),ze.bind(ni,Bt)}}return Bt}function _h(S,O){S.ambientLightColor.needsUpdate=O,S.lightProbe.needsUpdate=O,S.directionalLights.needsUpdate=O,S.directionalLightShadows.needsUpdate=O,S.pointLights.needsUpdate=O,S.pointLightShadows.needsUpdate=O,S.spotLights.needsUpdate=O,S.spotLightShadows.needsUpdate=O,S.rectAreaLights.needsUpdate=O,S.hemisphereLights.needsUpdate=O}function xh(S){return S.isMeshLambertMaterial||S.isMeshToonMaterial||S.isMeshPhongMaterial||S.isMeshStandardMaterial||S.isShadowMaterial||S.isShaderMaterial&&S.lights===!0}this.getActiveCubeFace=function(){return A},this.getActiveMipmapLevel=function(){return P},this.getRenderTarget=function(){return I},this.setRenderTargetTextures=function(S,O,H){const k=fe.get(S);k.__autoAllocateDepthBuffer=S.resolveDepthBuffer===!1,k.__autoAllocateDepthBuffer===!1&&(k.__useRenderToTexture=!1),fe.get(S.texture).__webglTexture=O,fe.get(S.depthTexture).__webglTexture=k.__autoAllocateDepthBuffer?void 0:H,k.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(S,O){const H=fe.get(S);H.__webglFramebuffer=O,H.__useDefaultFramebuffer=O===void 0};const Sh=R.createFramebuffer();this.setRenderTarget=function(S,O=0,H=0){I=S,A=O,P=H;let k=!0,N=null,Q=!1,he=!1;if(S){const me=fe.get(S);if(me.__useDefaultFramebuffer!==void 0)pe.bindFramebuffer(R.FRAMEBUFFER,null),k=!1;else if(me.__webglFramebuffer===void 0)Fe.setupRenderTarget(S);else if(me.__hasExternalTextures)Fe.rebindTextures(S,fe.get(S.texture).__webglTexture,fe.get(S.depthTexture).__webglTexture);else if(S.depthBuffer){const we=S.depthTexture;if(me.__boundDepthTexture!==we){if(we!==null&&fe.has(we)&&(S.width!==we.image.width||S.height!==we.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");Fe.setupDepthRenderbuffer(S)}}const Ce=S.texture;(Ce.isData3DTexture||Ce.isDataArrayTexture||Ce.isCompressedArrayTexture)&&(he=!0);const De=fe.get(S).__webglFramebuffer;S.isWebGLCubeRenderTarget?(Array.isArray(De[O])?N=De[O][H]:N=De[O],Q=!0):S.samples>0&&Fe.useMultisampledRTT(S)===!1?N=fe.get(S).__webglMultisampledFramebuffer:Array.isArray(De)?N=De[H]:N=De,C.copy(S.viewport),F.copy(S.scissor),z=S.scissorTest}else C.copy(_e).multiplyScalar(B).floor(),F.copy(Ie).multiplyScalar(B).floor(),z=He;if(H!==0&&(N=Sh),pe.bindFramebuffer(R.FRAMEBUFFER,N)&&k&&pe.drawBuffers(S,N),pe.viewport(C),pe.scissor(F),pe.setScissorTest(z),Q){const me=fe.get(S.texture);R.framebufferTexture2D(R.FRAMEBUFFER,R.COLOR_ATTACHMENT0,R.TEXTURE_CUBE_MAP_POSITIVE_X+O,me.__webglTexture,H)}else if(he){const me=O;for(let Ce=0;Ce<S.textures.length;Ce++){const De=fe.get(S.textures[Ce]);R.framebufferTextureLayer(R.FRAMEBUFFER,R.COLOR_ATTACHMENT0+Ce,De.__webglTexture,H,me)}}else if(S!==null&&H!==0){const me=fe.get(S.texture);R.framebufferTexture2D(R.FRAMEBUFFER,R.COLOR_ATTACHMENT0,R.TEXTURE_2D,me.__webglTexture,H)}M=-1},this.readRenderTargetPixels=function(S,O,H,k,N,Q,he,xe=0){if(!(S&&S.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let me=fe.get(S).__webglFramebuffer;if(S.isWebGLCubeRenderTarget&&he!==void 0&&(me=me[he]),me){pe.bindFramebuffer(R.FRAMEBUFFER,me);try{const Ce=S.textures[xe],De=Ce.format,we=Ce.type;if(!Te.textureFormatReadable(De)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!Te.textureTypeReadable(we)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}O>=0&&O<=S.width-k&&H>=0&&H<=S.height-N&&(S.textures.length>1&&R.readBuffer(R.COLOR_ATTACHMENT0+xe),R.readPixels(O,H,k,N,be.convert(De),be.convert(we),Q))}finally{const Ce=I!==null?fe.get(I).__webglFramebuffer:null;pe.bindFramebuffer(R.FRAMEBUFFER,Ce)}}},this.readRenderTargetPixelsAsync=async function(S,O,H,k,N,Q,he,xe=0){if(!(S&&S.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let me=fe.get(S).__webglFramebuffer;if(S.isWebGLCubeRenderTarget&&he!==void 0&&(me=me[he]),me)if(O>=0&&O<=S.width-k&&H>=0&&H<=S.height-N){pe.bindFramebuffer(R.FRAMEBUFFER,me);const Ce=S.textures[xe],De=Ce.format,we=Ce.type;if(!Te.textureFormatReadable(De))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!Te.textureTypeReadable(we))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");const Ve=R.createBuffer();R.bindBuffer(R.PIXEL_PACK_BUFFER,Ve),R.bufferData(R.PIXEL_PACK_BUFFER,Q.byteLength,R.STREAM_READ),S.textures.length>1&&R.readBuffer(R.COLOR_ATTACHMENT0+xe),R.readPixels(O,H,k,N,be.convert(De),be.convert(we),0);const Je=I!==null?fe.get(I).__webglFramebuffer:null;pe.bindFramebuffer(R.FRAMEBUFFER,Je);const ct=R.fenceSync(R.SYNC_GPU_COMMANDS_COMPLETE,0);return R.flush(),await zd(R,ct,4),R.bindBuffer(R.PIXEL_PACK_BUFFER,Ve),R.getBufferSubData(R.PIXEL_PACK_BUFFER,0,Q),R.deleteBuffer(Ve),R.deleteSync(ct),Q}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(S,O=null,H=0){const k=Math.pow(2,-H),N=Math.floor(S.image.width*k),Q=Math.floor(S.image.height*k),he=O!==null?O.x:0,xe=O!==null?O.y:0;Fe.setTexture2D(S,0),R.copyTexSubImage2D(R.TEXTURE_2D,H,0,0,he,xe,N,Q),pe.unbindTexture()};const vh=R.createFramebuffer(),Mh=R.createFramebuffer();this.copyTextureToTexture=function(S,O,H=null,k=null,N=0,Q=null){Q===null&&(N!==0?(Ts("WebGLRenderer: copyTextureToTexture function signature has changed to support src and dst mipmap levels."),Q=N,N=0):Q=0);let he,xe,me,Ce,De,we,Ve,Je,ct;const rt=S.isCompressedTexture?S.mipmaps[Q]:S.image;if(H!==null)he=H.max.x-H.min.x,xe=H.max.y-H.min.y,me=H.isBox3?H.max.z-H.min.z:1,Ce=H.min.x,De=H.min.y,we=H.isBox3?H.min.z:0;else{const Kt=Math.pow(2,-N);he=Math.floor(rt.width*Kt),xe=Math.floor(rt.height*Kt),S.isDataArrayTexture?me=rt.depth:S.isData3DTexture?me=Math.floor(rt.depth*Kt):me=1,Ce=0,De=0,we=0}k!==null?(Ve=k.x,Je=k.y,ct=k.z):(Ve=0,Je=0,ct=0);const tt=be.convert(O.format),Re=be.convert(O.type);let at;O.isData3DTexture?(Fe.setTexture3D(O,0),at=R.TEXTURE_3D):O.isDataArrayTexture||O.isCompressedArrayTexture?(Fe.setTexture2DArray(O,0),at=R.TEXTURE_2D_ARRAY):(Fe.setTexture2D(O,0),at=R.TEXTURE_2D),R.pixelStorei(R.UNPACK_FLIP_Y_WEBGL,O.flipY),R.pixelStorei(R.UNPACK_PREMULTIPLY_ALPHA_WEBGL,O.premultiplyAlpha),R.pixelStorei(R.UNPACK_ALIGNMENT,O.unpackAlignment);const Ye=R.getParameter(R.UNPACK_ROW_LENGTH),Bt=R.getParameter(R.UNPACK_IMAGE_HEIGHT),vi=R.getParameter(R.UNPACK_SKIP_PIXELS),Ht=R.getParameter(R.UNPACK_SKIP_ROWS),as=R.getParameter(R.UNPACK_SKIP_IMAGES);R.pixelStorei(R.UNPACK_ROW_LENGTH,rt.width),R.pixelStorei(R.UNPACK_IMAGE_HEIGHT,rt.height),R.pixelStorei(R.UNPACK_SKIP_PIXELS,Ce),R.pixelStorei(R.UNPACK_SKIP_ROWS,De),R.pixelStorei(R.UNPACK_SKIP_IMAGES,we);const ot=S.isDataArrayTexture||S.isData3DTexture,$t=O.isDataArrayTexture||O.isData3DTexture;if(S.isDepthTexture){const Kt=fe.get(S),Et=fe.get(O),Ft=fe.get(Kt.__renderTarget),Dr=fe.get(Et.__renderTarget);pe.bindFramebuffer(R.READ_FRAMEBUFFER,Ft.__webglFramebuffer),pe.bindFramebuffer(R.DRAW_FRAMEBUFFER,Dr.__webglFramebuffer);for(let ni=0;ni<me;ni++)ot&&(R.framebufferTextureLayer(R.READ_FRAMEBUFFER,R.COLOR_ATTACHMENT0,fe.get(S).__webglTexture,N,we+ni),R.framebufferTextureLayer(R.DRAW_FRAMEBUFFER,R.COLOR_ATTACHMENT0,fe.get(O).__webglTexture,Q,ct+ni)),R.blitFramebuffer(Ce,De,he,xe,Ve,Je,he,xe,R.DEPTH_BUFFER_BIT,R.NEAREST);pe.bindFramebuffer(R.READ_FRAMEBUFFER,null),pe.bindFramebuffer(R.DRAW_FRAMEBUFFER,null)}else if(N!==0||S.isRenderTargetTexture||fe.has(S)){const Kt=fe.get(S),Et=fe.get(O);pe.bindFramebuffer(R.READ_FRAMEBUFFER,vh),pe.bindFramebuffer(R.DRAW_FRAMEBUFFER,Mh);for(let Ft=0;Ft<me;Ft++)ot?R.framebufferTextureLayer(R.READ_FRAMEBUFFER,R.COLOR_ATTACHMENT0,Kt.__webglTexture,N,we+Ft):R.framebufferTexture2D(R.READ_FRAMEBUFFER,R.COLOR_ATTACHMENT0,R.TEXTURE_2D,Kt.__webglTexture,N),$t?R.framebufferTextureLayer(R.DRAW_FRAMEBUFFER,R.COLOR_ATTACHMENT0,Et.__webglTexture,Q,ct+Ft):R.framebufferTexture2D(R.DRAW_FRAMEBUFFER,R.COLOR_ATTACHMENT0,R.TEXTURE_2D,Et.__webglTexture,Q),N!==0?R.blitFramebuffer(Ce,De,he,xe,Ve,Je,he,xe,R.COLOR_BUFFER_BIT,R.NEAREST):$t?R.copyTexSubImage3D(at,Q,Ve,Je,ct+Ft,Ce,De,he,xe):R.copyTexSubImage2D(at,Q,Ve,Je,Ce,De,he,xe);pe.bindFramebuffer(R.READ_FRAMEBUFFER,null),pe.bindFramebuffer(R.DRAW_FRAMEBUFFER,null)}else $t?S.isDataTexture||S.isData3DTexture?R.texSubImage3D(at,Q,Ve,Je,ct,he,xe,me,tt,Re,rt.data):O.isCompressedArrayTexture?R.compressedTexSubImage3D(at,Q,Ve,Je,ct,he,xe,me,tt,rt.data):R.texSubImage3D(at,Q,Ve,Je,ct,he,xe,me,tt,Re,rt):S.isDataTexture?R.texSubImage2D(R.TEXTURE_2D,Q,Ve,Je,he,xe,tt,Re,rt.data):S.isCompressedTexture?R.compressedTexSubImage2D(R.TEXTURE_2D,Q,Ve,Je,rt.width,rt.height,tt,rt.data):R.texSubImage2D(R.TEXTURE_2D,Q,Ve,Je,he,xe,tt,Re,rt);R.pixelStorei(R.UNPACK_ROW_LENGTH,Ye),R.pixelStorei(R.UNPACK_IMAGE_HEIGHT,Bt),R.pixelStorei(R.UNPACK_SKIP_PIXELS,vi),R.pixelStorei(R.UNPACK_SKIP_ROWS,Ht),R.pixelStorei(R.UNPACK_SKIP_IMAGES,as),Q===0&&O.generateMipmaps&&R.generateMipmap(at),pe.unbindTexture()},this.initRenderTarget=function(S){fe.get(S).__webglFramebuffer===void 0&&Fe.setupRenderTarget(S)},this.initTexture=function(S){S.isCubeTexture?Fe.setTextureCube(S,0):S.isData3DTexture?Fe.setTexture3D(S,0):S.isDataArrayTexture||S.isCompressedArrayTexture?Fe.setTexture2DArray(S,0):Fe.setTexture2D(S,0),pe.unbindTexture()},this.resetState=function(){A=0,P=0,I=null,pe.reset(),ce.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Mn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;const t=this.getContext();t.drawingBufferColorSpace=$e._getDrawingBufferColorSpace(e),t.unpackColorSpace=$e._getUnpackColorSpace()}}class l_ extends Co{constructor(){super();const e=new ut;e.deleteAttribute("uv");const t=new pi({side:Nt}),n=new pi,s=new yf(16777215,900,28,2);s.position.set(.418,16.199,.3),this.add(s);const r=new ht(e,t);r.position.set(-.757,13.219,.717),r.scale.set(31.713,28.305,28.591),this.add(r);const a=new Pt(e,n,6),o=new dt;o.position.set(-10.906,2.009,1.846),o.rotation.set(0,-.195,0),o.scale.set(2.328,7.905,4.651),o.updateMatrix(),a.setMatrixAt(0,o.matrix),o.position.set(-5.607,-.754,-.758),o.rotation.set(0,.994,0),o.scale.set(1.97,1.534,3.955),o.updateMatrix(),a.setMatrixAt(1,o.matrix),o.position.set(6.167,.857,7.803),o.rotation.set(0,.561,0),o.scale.set(3.927,6.285,3.687),o.updateMatrix(),a.setMatrixAt(2,o.matrix),o.position.set(-2.017,.018,6.124),o.rotation.set(0,.333,0),o.scale.set(2.002,4.566,2.064),o.updateMatrix(),a.setMatrixAt(3,o.matrix),o.position.set(2.291,-.756,-2.621),o.rotation.set(0,-.286,0),o.scale.set(1.546,1.552,1.496),o.updateMatrix(),a.setMatrixAt(4,o.matrix),o.position.set(-2.193,-.369,-5.547),o.rotation.set(0,.516,0),o.scale.set(3.875,3.487,2.986),o.updateMatrix(),a.setMatrixAt(5,o.matrix),this.add(a);const l=new ht(e,Fi(50));l.position.set(-16.116,14.37,8.208),l.scale.set(.1,2.428,2.739),this.add(l);const c=new ht(e,Fi(50));c.position.set(-16.109,18.021,-8.207),c.scale.set(.1,2.425,2.751),this.add(c);const h=new ht(e,Fi(17));h.position.set(14.904,12.198,-1.832),h.scale.set(.15,4.265,6.331),this.add(h);const u=new ht(e,Fi(43));u.position.set(-.462,8.89,14.52),u.scale.set(4.38,5.441,.088),this.add(u);const f=new ht(e,Fi(20));f.position.set(3.235,11.486,-12.541),f.scale.set(2.5,2,.1),this.add(f);const p=new ht(e,Fi(100));p.position.set(0,20,0),p.scale.set(1,.1,1),this.add(p)}dispose(){const e=new Set;this.traverse(t=>{t.isMesh&&(e.add(t.geometry),e.add(t.material))});for(const t of e)t.dispose()}}function Fi(i){return new qn({color:0,emissive:16777215,emissiveIntensity:i})}const fa=360;class c_{renderCpuMilliseconds=new Float32Array(fa);frameMilliseconds=new Float32Array(fa);sampleCount=0;renderCpuSum=0;maximumRenderCpuMilliseconds=0;maximumDrawCalls=0;maximumTriangles=0;shaderProgramsAtShotStart=0;shaderProgramsCurrent=0;measurementActive=!1;beginShot(e){this.sampleCount=0,this.renderCpuSum=0,this.maximumRenderCpuMilliseconds=0,this.maximumDrawCalls=0,this.maximumTriangles=0,this.shaderProgramsAtShotStart=e,this.shaderProgramsCurrent=e,this.measurementActive=!0}recordRender(e,t,n,s,r){if(!this.measurementActive)return;const a=Number.isFinite(e)?Math.max(0,e):0,o=Number.isFinite(t)?Math.max(0,t):0;this.sampleCount<fa&&(this.renderCpuMilliseconds[this.sampleCount]=a,this.frameMilliseconds[this.sampleCount]=o,this.sampleCount+=1,this.renderCpuSum+=a),this.maximumRenderCpuMilliseconds=Math.max(this.maximumRenderCpuMilliseconds,a),this.maximumDrawCalls=Math.max(this.maximumDrawCalls,n),this.maximumTriangles=Math.max(this.maximumTriangles,s),this.shaderProgramsCurrent=r}finishShot(e){this.shaderProgramsCurrent=e,this.measurementActive=!1}snapshot(){const e=this.shaderProgramsCurrent-this.shaderProgramsAtShotStart,t=Array.from(this.frameMilliseconds.subarray(0,this.sampleCount)).sort((s,r)=>s-r),n=pa(t,.5);return Object.freeze({measurementActive:this.measurementActive,sampleCount:this.sampleCount,maximumRenderCpuMilliseconds:this.maximumRenderCpuMilliseconds,meanRenderCpuMilliseconds:this.sampleCount===0?0:this.renderCpuSum/this.sampleCount,medianFrameMilliseconds:n,p50FrameMilliseconds:n,p95FrameMilliseconds:pa(t,.95),p99FrameMilliseconds:pa(t,.99),worstFrameMilliseconds:t.at(-1)??0,maximumDrawCalls:this.maximumDrawCalls,maximumTriangles:this.maximumTriangles,shaderProgramsAtShotStart:this.shaderProgramsAtShotStart,shaderProgramsCurrent:this.shaderProgramsCurrent,shaderProgramDelta:e,shaderProgramsStable:e===0})}}function pa(i,e){if(i.length===0)return 0;const t=Math.min(i.length-1,Math.max(0,Math.ceil(i.length*e)-1));return i[t]??0}const ma=Object.freeze({x:0,y:1.08,z:7}),h_=Object.freeze({x:-3.3,y:2.15,z:-3}),u_=Object.freeze({x:-2.9,y:2.2,z:-3.2}),d_=Object.freeze({x:-2.95,y:2.15,z:-2.9});function uc(i,e){const t=Math.max(1,Math.floor(i)),n=Math.max(1,Math.floor(e)),s=t/n;return s>=2?Object.freeze({profile:"mobile-landscape",aspect:s,verticalFovDegrees:34,position:d_,target:ma}):s<1.7?Object.freeze({profile:"desktop-compact",aspect:s,verticalFovDegrees:37,position:u_,target:ma}):Object.freeze({profile:"desktop-wide",aspect:s,verticalFovDegrees:30,position:h_,target:ma})}class f_{camera=new zt(47,16/9,.05,80);layout=uc(1920,1080);constructor(){this.camera.name="LockedGameplayCamera",this.camera.userData.activeGameplayCamera=!0,this.applyLayout(this.layout)}resize(e,t){return this.layout=uc(e,t),this.applyLayout(this.layout),this.layout}currentLayout(){return this.layout}projectBounds(e,t){const n=[new L(e.x,e.y,e.z),new L(e.x,e.y,t.z),new L(e.x,t.y,e.z),new L(e.x,t.y,t.z),new L(t.x,e.y,e.z),new L(t.x,e.y,t.z),new L(t.x,t.y,e.z),new L(t.x,t.y,t.z)].map(l=>l.project(this.camera)),s=Math.min(...n.map(l=>l.x)),r=Math.max(...n.map(l=>l.x)),a=Math.max(...n.map(l=>l.y)),o=Math.min(...n.map(l=>l.y));return Object.freeze({left:s,right:r,top:a,bottom:o,width:r-s,height:a-o,visibleWidth:Math.max(0,Math.min(1,r)-Math.max(-1,s)),visibleHeight:Math.max(0,Math.min(1,a)-Math.max(-1,o)),centerX:(s+r)/2,centerY:(a+o)/2,fullyVisible:s>=-1&&r<=1&&o>=-1&&a<=1&&n.every(l=>Number.isFinite(l.x)&&Number.isFinite(l.y)&&Number.isFinite(l.z)&&l.z>=-1&&l.z<=1)})}projectPoint(e){const t=new L(e.x,e.y,e.z).project(this.camera);return Object.freeze({x:t.x,y:t.y,depth:t.z,visible:Number.isFinite(t.x)&&Number.isFinite(t.y)&&Number.isFinite(t.z)&&Math.abs(t.x)<=1&&Math.abs(t.y)<=1&&t.z>=-1&&t.z<=1})}applyLayout(e){this.camera.aspect=e.aspect,this.camera.fov=e.verticalFovDegrees,this.camera.position.set(e.position.x,e.position.y,e.position.z),this.camera.lookAt(e.target.x,e.target.y,e.target.z),this.camera.updateProjectionMatrix(),this.camera.updateMatrixWorld(!0)}}const p_="LockedArenaStaticLayer";class m_{frameWork={drawCalls:0,triangles:0};compositeScene=new Co;compositeCamera=new No(-1,1,1,-1,0,1);compositeGeometry=new Lt(2,2);compositeMaterial=new Qt({color:16777215,depthTest:!1,depthWrite:!1,toneMapped:!1});renderTarget=null;quality;widthPixels=0;heightPixels=0;pixelRatio=1;rebuildCount=0;invalidationCount=0;createdRenderTargets=0;disposedRenderTargets=0;staticDrawCallsAtRebuild=0;staticTrianglesAtRebuild=0;valid=!1;disposed=!1;constructor(e){this.quality=e;const t=new ht(this.compositeGeometry,this.compositeMaterial);t.frustumCulled=!1,t.name="LockedArenaStaticLayerComposite",this.compositeScene.add(t)}get isValid(){return this.valid}configure(e,t,n,s){this.assertUsable();const r=Math.max(1,Math.floor(e)),a=Math.max(1,Math.floor(t)),o=Math.max(.25,n);if(this.renderTarget!==null&&this.widthPixels===r&&this.heightPixels===a&&this.pixelRatio===o&&this.quality===s)return!1;this.disposeRenderTarget(),this.widthPixels=r,this.heightPixels=a,this.pixelRatio=o,this.quality=s;const l=Math.max(1,Math.floor(r*o)),c=Math.max(1,Math.floor(a*o));return this.renderTarget=new Qn(l,c,{depthBuffer:!0,stencilBuffer:!1,magFilter:tn,minFilter:tn,generateMipmaps:!1}),this.renderTarget.texture.name=p_,this.renderTarget.texture.colorSpace=St,this.compositeMaterial.map=this.renderTarget.texture,this.compositeMaterial.needsUpdate=!0,this.createdRenderTargets+=1,this.invalidationCount+=1,this.valid=!1,!0}async compileComposite(e){this.assertUsable(),await e.compileAsync(this.compositeScene,this.compositeCamera)}rebuild(e,t){this.assertUsable();const n=this.renderTarget;if(n===null)throw new Error("The locked static layer cache must be configured before rebuilding.");const s=e.getRenderTarget();e.setRenderTarget(n);try{e.clear(!0,!0,!0),t(),this.staticDrawCallsAtRebuild=e.info.render.calls,this.staticTrianglesAtRebuild=e.info.render.triangles}finally{e.setRenderTarget(s)}this.valid=!0,this.rebuildCount+=1}present(e,t){if(this.assertUsable(),!this.valid||this.renderTarget===null)throw new Error("The locked static layer cache must be rebuilt before presentation.");const n=e.autoClear;let s=0,r=0,a=0,o=0;try{e.setRenderTarget(null),e.autoClear=!0,e.render(this.compositeScene,this.compositeCamera),s=e.info.render.calls,r=e.info.render.triangles,e.autoClear=!1,e.clearDepth(),t(),a=e.info.render.calls,o=e.info.render.triangles}finally{e.autoClear=n}return this.frameWork.drawCalls=s+a,this.frameWork.triangles=r+o,this.frameWork}diagnostics(){const e=this.renderTarget===null?0:1;return Object.freeze({enabled:!0,valid:this.valid,quality:this.quality,widthPixels:this.widthPixels,heightPixels:this.heightPixels,pixelRatio:this.pixelRatio,rebuildCount:this.rebuildCount,invalidationCount:this.invalidationCount,createdRenderTargets:this.createdRenderTargets,disposedRenderTargets:this.disposedRenderTargets,activeRenderTargets:e,orphanedRenderTargets:this.createdRenderTargets-this.disposedRenderTargets-e,staticDrawCallsAtRebuild:this.staticDrawCallsAtRebuild,staticTrianglesAtRebuild:this.staticTrianglesAtRebuild})}dispose(){this.disposed||(this.disposed=!0,this.disposeRenderTarget(),this.compositeMaterial.dispose(),this.compositeGeometry.dispose())}disposeRenderTarget(){this.renderTarget!==null&&(this.renderTarget.dispose(),this.renderTarget=null,this.compositeMaterial.map=null,this.disposedRenderTargets+=1,this.valid=!1)}assertUsable(){if(this.disposed)throw new Error("The locked static layer cache has been disposed.")}}const g_=-.3,dc=Object.freeze({name:"authored-bind",bodyLeanX:0,bodyLeanZ:0,bodyTwistY:0,headYaw:0,leftHand:Object.freeze({x:-.35,y:.98,z:.02}),rightHand:Object.freeze({x:.35,y:.98,z:.02}),leftElbowPole:Object.freeze({x:-.58,y:1.18,z:.12}),rightElbowPole:Object.freeze({x:.58,y:1.18,z:.12}),leftFoot:Object.freeze({x:-.17,y:.08,z:.04}),rightFoot:Object.freeze({x:.17,y:.08,z:.04}),leftKneePole:Object.freeze({x:-.22,y:.46,z:.2}),rightKneePole:Object.freeze({x:.22,y:.46,z:.2}),handSpread:.08}),Vi=Object.freeze({name:"shooter-aim",bodyLeanX:.08,bodyLeanZ:-.1,bodyTwistY:-.25,headYaw:.2,leftHand:Object.freeze({x:-.36,y:1.2,z:.24}),rightHand:Object.freeze({x:.87,y:1.12,z:.17}),leftElbowPole:Object.freeze({x:-.58,y:1.38,z:.22}),rightElbowPole:Object.freeze({x:.82,y:1.52,z:-.02}),leftFoot:Object.freeze({x:-.25,y:.08,z:.18}),rightFoot:Object.freeze({x:.28,y:.08,z:-.2}),leftKneePole:Object.freeze({x:-.32,y:.45,z:.4}),rightKneePole:Object.freeze({x:.36,y:.48,z:.05}),handSpread:.1}),fc=Object.freeze({name:"shooter-release",bodyLeanX:.2,bodyLeanZ:.08,bodyTwistY:.22,headYaw:-.12,leftHand:Object.freeze({x:-.4,y:1.3,z:.3}),rightHand:Object.freeze({x:.9,y:1.62,z:.66}),leftElbowPole:Object.freeze({x:-.62,y:1.42,z:.28}),rightElbowPole:Object.freeze({x:.56,y:1.82,z:.48}),leftFoot:Object.freeze({x:-.27,y:.08,z:.24}),rightFoot:Object.freeze({x:.29,y:.08,z:-.12}),leftKneePole:Object.freeze({x:-.34,y:.44,z:.45}),rightKneePole:Object.freeze({x:.37,y:.48,z:.08}),handSpread:.16}),pc=Object.freeze({name:"shooter-follow-through",bodyLeanX:.3,bodyLeanZ:.14,bodyTwistY:.38,headYaw:-.16,leftHand:Object.freeze({x:-.38,y:1.28,z:.3}),rightHand:Object.freeze({x:.9,y:1.5,z:.78}),leftElbowPole:Object.freeze({x:-.58,y:1.38,z:.3}),rightElbowPole:Object.freeze({x:.52,y:1.7,z:.64}),leftFoot:Object.freeze({x:-.28,y:.08,z:.27}),rightFoot:Object.freeze({x:.27,y:.08,z:-.05}),leftKneePole:Object.freeze({x:-.34,y:.42,z:.48}),rightKneePole:Object.freeze({x:.34,y:.45,z:.14}),handSpread:.2}),mc=Object.freeze({name:"keeper-ready",bodyLeanX:.08,bodyLeanZ:0,bodyTwistY:0,headYaw:0,leftHand:Object.freeze({x:-.48,y:1.28,z:.2}),rightHand:Object.freeze({x:.48,y:1.28,z:.2}),leftElbowPole:Object.freeze({x:-.68,y:1.2,z:.14}),rightElbowPole:Object.freeze({x:.68,y:1.2,z:.14}),leftFoot:Object.freeze({x:-.25,y:.08,z:.12}),rightFoot:Object.freeze({x:.25,y:.08,z:.12}),leftKneePole:Object.freeze({x:-.31,y:.43,z:.37}),rightKneePole:Object.freeze({x:.31,y:.43,z:.37}),handSpread:.16}),Hi=Object.freeze({name:"keeper-anticipation",bodyLeanX:.18,bodyLeanZ:0,bodyTwistY:0,headYaw:0,leftHand:Object.freeze({x:-.56,y:1.1,z:.28}),rightHand:Object.freeze({x:.56,y:1.1,z:.28}),leftElbowPole:Object.freeze({x:-.72,y:1.08,z:.18}),rightElbowPole:Object.freeze({x:.72,y:1.08,z:.18}),leftFoot:Object.freeze({x:-.3,y:.08,z:.15}),rightFoot:Object.freeze({x:.3,y:.08,z:.15}),leftKneePole:Object.freeze({x:-.38,y:.38,z:.48}),rightKneePole:Object.freeze({x:.38,y:.38,z:.48}),handSpread:.2}),__=Object.freeze({...Hi,name:"keeper-hold",bodyLeanX:.12,leftHand:Object.freeze({x:-.64,y:1.4,z:.24}),rightHand:Object.freeze({x:.64,y:1.4,z:.24}),leftElbowPole:Object.freeze({x:-.76,y:1.22,z:.18}),rightElbowPole:Object.freeze({x:.76,y:1.22,z:.18})}),lr=.42;function wr(i){return Math.min(1,Math.max(0,i))}function mi(i){const e=wr(i);return e*e*(3-2*e)}function x_(i){const e=wr(i);return 1-(1-e)*(1-e)*(1-e)}function Yn(i,e,t){return i+(e-i)*t}function en(i,e,t){return Object.freeze({x:Yn(i.x,e.x,t),y:Yn(i.y,e.y,t),z:Yn(i.z,e.z,t)})}function $n(i,e,t,n){const s=mi(t);return Object.freeze({name:n,bodyLeanX:Yn(i.bodyLeanX,e.bodyLeanX,s),bodyLeanZ:Yn(i.bodyLeanZ,e.bodyLeanZ,s),bodyTwistY:Yn(i.bodyTwistY,e.bodyTwistY,s),headYaw:Yn(i.headYaw,e.headYaw,s),leftHand:en(i.leftHand,e.leftHand,s),rightHand:en(i.rightHand,e.rightHand,s),leftElbowPole:en(i.leftElbowPole,e.leftElbowPole,s),rightElbowPole:en(i.rightElbowPole,e.rightElbowPole,s),leftFoot:en(i.leftFoot,e.leftFoot,s),rightFoot:en(i.rightFoot,e.rightFoot,s),leftKneePole:en(i.leftKneePole,e.leftKneePole,s),rightKneePole:en(i.rightKneePole,e.rightKneePole,s),handSpread:Yn(i.handSpread,e.handSpread,s)})}function cr(i){const e=Math.sin(i*2.4);return Object.freeze({...Vi,name:"shooter-idle-aim",bodyLeanX:Vi.bodyLeanX+e*.012,rightHand:Object.freeze({...Vi.rightHand,y:Vi.rightHand.y+e*.018})})}function uh(i,e,t,n,s=0,r=0,a="DIRECT",o=0){if(i==="FEINT"){const h=wr(r),u=cr(n);return{stage:h>0?"FEINT":"IDLE",releaseAmount:0,pose:{...u,name:h>0?"shooter-feint-held":"shooter-feint-ready",bodyTwistY:u.bodyTwistY+s*h*.22,bodyLeanZ:u.bodyLeanZ-s*h*.07,rightHand:{x:.55+s*h*.09,y:1.5+h*.18,z:.65+h*.1},rightElbowPole:{...u.rightElbowPole,y:u.rightElbowPole.y+h*.2}}}}if(i==="RELEASE"&&(a!=="DIRECT"||Math.abs(o)>.05)){const h=uh(i,e,t,n),u=a==="LOB"?.28:a==="BOUNCE"?-.22:0;return{...h,pose:{...h.pose,name:`shooter-${a.toLowerCase()}-${Math.abs(o)>.05?"rosca":h.stage.toLowerCase()}`,bodyTwistY:h.pose.bodyTwistY+o*.22,rightHand:{...h.pose.rightHand,y:h.pose.rightHand.y+u,x:h.pose.rightHand.x+o*.18},rightElbowPole:{...h.pose.rightElbowPole,y:h.pose.rightElbowPole.y+u},handSpread:h.pose.handSpread+Math.abs(o)*.1}}}if(i==="READY")return Object.freeze({stage:"IDLE",releaseAmount:0,pose:cr(n)});if(i==="RECOVER"){const h=mi(t);return Object.freeze({stage:"RECOVERY",releaseAmount:1-h,pose:$n(pc,cr(n),h,"shooter-recovery")})}const l=wr(e);if(l<.16)return Object.freeze({stage:"AIM",releaseAmount:l/.42,pose:$n(cr(n),Vi,l/.16,"shooter-cocked-aim")});if(l<.42){const h=(l-.16)/.26;return Object.freeze({stage:"RELEASE",releaseAmount:mi(h),pose:$n(Vi,fc,h,"shooter-handball-release")})}const c=(l-.42)/.58;return Object.freeze({stage:"FOLLOW_THROUGH",releaseAmount:1,pose:$n(fc,pc,c,"shooter-follow-through")})}function S_(i){return Object.freeze(i===null?{x:0,y:0}:{x:i.endsWith("left")?-1:i.endsWith("right")?1:0,y:i.startsWith("low")?-1:i.startsWith("high")?1:0})}function v_(i){const e=S_(i),t=e.y<0?.24:e.y>0?1.82:1.08,n=.86,s=e.y>0?.7:.78,r=e.x===0?e.y>0?-.32:e.y===0?.24:.12:0,a=Object.freeze({x:e.x<0?-n:e.x>0?.38:-s,y:t+(e.x<0?.02:-.02),z:.18}),o=Object.freeze({x:e.x>0?n:e.x<0?-.38:s,y:t+(e.x>0?.02:-.02),z:.18}),l=e.x<0?a:e.x>0?o:Object.freeze({x:0,y:(a.y+o.y)/2,z:(a.z+o.z)/2}),c=Object.freeze({name:`keeper-${i}-dive`,bodyLeanX:e.y>0?-.16:.1,bodyLeanZ:e.x*-.88+r,bodyTwistY:e.x*.2,headYaw:e.x*.16,leftHand:a,rightHand:o,leftElbowPole:Object.freeze({x:a.x-.18,y:t-.12,z:.32}),rightElbowPole:Object.freeze({x:o.x+.18,y:t-.12,z:.32}),leftFoot:Object.freeze({x:e.x>0?-.54:e.x<0?-.28:-.5,y:e.y>0?.4:.08,z:e.y<0?.34:-.08}),rightFoot:Object.freeze({x:e.x<0?.54:e.x>0?.28:.5,y:e.y>0?.4:.08,z:e.y<0?.34:-.08}),leftKneePole:Object.freeze({x:-.42,y:.42,z:.4}),rightKneePole:Object.freeze({x:.42,y:.42,z:.4}),handSpread:.36});return Object.freeze({pose:c,reachPoint:l})}function M_(i,e,t,n,s,r,a=!1){const o=Math.sin(r*3)*.012,l=Object.freeze({...mc,bodyLeanX:mc.bodyLeanX+o});if(e==="READ")return Object.freeze({stage:"ANTICIPATION",diveAmount:0,pose:Hi,reachPoint:Object.freeze({x:0,y:1.1,z:.28})});if(e==="HOLD"&&i===null)return Object.freeze({stage:"ANTICIPATION",diveAmount:0,pose:__,reachPoint:Object.freeze({x:0,y:1.4,z:.24})});if(i===null||e==="READY")return Object.freeze({stage:"READY",diveAmount:0,pose:l,reachPoint:Object.freeze({x:0,y:1.28,z:.2})});const c=v_(i),h=a||e==="COMMIT"||e==="RECOVER",u=h?$n(Hi,c.pose,lr,`keeper-${i}-commit`):Hi,f=h?en({x:0,y:1.1,z:.28},c.reachPoint,mi(lr)):{x:0,y:1.1,z:.28};if(e==="COMMIT"||e==="PREPARE"&&a)return Object.freeze({stage:"ANTICIPATION",diveAmount:lr,pose:u,reachPoint:f});if(e==="PREPARE")return Object.freeze({stage:"ANTICIPATION",diveAmount:0,pose:Hi,reachPoint:Object.freeze({x:0,y:1.1,z:.28})});if(e==="RECOVER")return{stage:"RECOVERY",diveAmount:lr*(1-mi(n)),pose:$n(u,l,n,"keeper-feint-recovery"),reachPoint:en(f,{x:0,y:1.28,z:.2},mi(n))};if(e==="RETURN"){const g=mi(n),_=s==="SAVED"&&g<.22;return Object.freeze({stage:_?"IMPACT":"RECOVERY",diveAmount:1-g,pose:$n(c.pose,l,g,_?`keeper-${i}-impact`:`keeper-${i}-recovery`),reachPoint:en(c.reachPoint,{x:0,y:1.28,z:.2},g)})}const p=e==="HOLD"?1:x_(t);return Object.freeze({stage:e==="HOLD"&&s==="SAVED"?"IMPACT":"DIVE",diveAmount:p,pose:$n(a&&p<1?u:Hi,c.pose,p,`keeper-${i}-${e.toLowerCase()}`),reachPoint:en(a&&p<1?f:{x:0,y:1.1,z:.28},c.reachPoint,p)})}const gc=Object.freeze(["court","painted-metal","fabric","skin","hair","rubber","net","wall-panel","led-board"]),y_={court:834685457,"painted-metal":195936478,fabric:4205954305,skin:1511459345,hair:2702401261,rubber:3021015981,net:242330861,"wall-panel":2702884951,"led-board":517671501},b_={court:.5,"painted-metal":.42,fabric:.78,skin:.67,hair:.86,rubber:.82,net:.72,"wall-panel":.88,"led-board":.36},dh={court:[7,61],"painted-metal":[9,73],fabric:[18,92],skin:[6,47],hair:[12,79],rubber:[10,58],net:[8,64],"wall-panel":[5,43],"led-board":[14,96]};function hr(i,e,t){let n=Math.imul(i+1^t,73244475)^Math.imul(e+1^t>>>8,295559667);return n=Math.imul(n^n>>>16,73244475),n^=n>>>16,(n>>>0)/4294967295}function ga(i,e,t,n){const[s,r]=dh[i],a=Math.sin(e/s*Math.PI*2)*.28+Math.cos(t/(s*1.7)*Math.PI*2)*.18,o=Math.sin((e+t*.37)/r*Math.PI*2)*.16,l=hr(e,t,n)*2-1;switch(i){case"court":{const c=Math.sin(e/46*Math.PI)*.16,h=hr(Math.floor(e/7),Math.floor(t/13),n)-.5;return a*.22+o*.12+l*.16+c+h*.12}case"painted-metal":{const c=Math.sin(t*.82)*.08,h=hr(Math.floor(e/3),Math.floor(t/11),n);return a*.08+l*.08+c+(h>.985?-.48:0)}case"fabric":{const c=Math.sin(e*1.18)*.34,h=Math.sin(t*1.36)*.3;return c+h+a*.08+l*.05}case"skin":return a*.08+o*.05+l*.055;case"hair":return Math.sin(e*.24+t*1.18)*.34+a*.08+l*.06;case"rubber":{const c=Math.sin(e*.44),h=Math.sin(t*.44);return c*h*.28+a*.08+l*.12}case"net":return(Math.sin(e*.62)+Math.sin(t*.62))*.16+l*.06;case"wall-panel":{const c=hr(Math.floor(e/2),Math.floor(t/2),n)-.5,h=e%48<2||t%64<2?-.35:0;return a*.13+c*.3+h}case"led-board":return(t%4===0?-.2:.08)+o*.1+l*.035}}function E_(i,e){return i==="wall-panel"?32:i==="led-board"?Math.max(32,Math.floor(e/2)):e}function Wi(i,e){const t=document.createElement("canvas");return t.width=i,t.height=e,t}function Xi(i){const e=i.getContext("2d");if(e===null)throw new Error("Procedural texture generation requires a 2D canvas context.");return e}function qi(i,e,t=1,n=1){const s=new gf(i);return s.colorSpace=e,s.wrapS=vs,s.wrapT=vs,s.repeat.set(t,n),s.anisotropy=4,s.userData.generatedInCode=!0,s}function T_(i,e){const t=E_(i,e),n=Wi(t,t),s=Wi(t,t),r=Wi(t,t),a=Xi(n),o=Xi(s),l=Xi(r),c=a.createImageData(t,t),h=o.createImageData(t,t),u=l.createImageData(t,t),f=y_[i];for(let m=0;m<t;m+=1)for(let d=0;d<t;d+=1){const b=(m*t+d)*4,E=ga(i,d,m,f),y=ga(i,d+1,m,f),w=ga(i,d,m+1,f),A=Dn.clamp(Math.round((.82+E*.13)*255),0,255),P=Dn.clamp(Math.round(128-(y-E)*72),0,255),I=Dn.clamp(Math.round(128-(w-E)*72),0,255),M=Dn.clamp(Math.round((b_[i]+E*.09)*255),8,250);c.data[b]=A,c.data[b+1]=A,c.data[b+2]=A,c.data[b+3]=255,h.data[b]=P,h.data[b+1]=I,h.data[b+2]=246,h.data[b+3]=255,u.data[b]=M,u.data[b+1]=M,u.data[b+2]=M,u.data[b+3]=255}a.putImageData(c,0,0),o.putImageData(h,0,0),l.putImageData(u,0,0);let p=null;if(i==="net"){const m=Wi(t,t),d=Xi(m);d.fillStyle="#000",d.fillRect(0,0,t,t),d.strokeStyle="#fff",d.lineWidth=Math.max(2,t/80);const b=t/10;for(let E=0;E<=10;E+=1){const y=E*b;d.beginPath(),d.moveTo(y,0),d.lineTo(y,t),d.stroke(),d.beginPath(),d.moveTo(0,y),d.lineTo(t,y),d.stroke()}p=qi(m,hn)}const _={court:[5,7],fabric:[3,5],"painted-metal":[2,5],"wall-panel":[2,2]}[i]??[1,1];return Object.freeze({name:i,albedo:qi(n,St,_[0],_[1]),normal:qi(s,hn,_[0],_[1]),roughness:qi(r,hn,_[0],_[1]),alpha:p,resolution:t,detailScales:dh[i]})}class w_{surfaces=new Map;generatedTextTextures=[];extraTextures=[];maximumResolution;largestAuxiliaryTextureEdge=0;disposed=!1;constructor(e){if(!Number.isInteger(e)||e<96||e>256)throw new RangeError("Procedural texture base resolution must be an integer from 96 to 256.");this.maximumResolution=e;for(const t of gc)this.surfaces.set(t,T_(t,e))}surface(e){const t=this.surfaces.get(e);if(t===void 0)throw new Error(`Unknown procedural surface '${e}'.`);return t}createTextPanelTexture(e,t){const n=Math.max(t.width,t.height),s=Math.min(1,this.maximumResolution/n),r=Math.max(1,Math.round(t.width*s)),a=Math.max(1,Math.round(t.height*s)),o=Wi(r,a),l=Xi(o),c=l.createLinearGradient(0,0,r,0);c.addColorStop(0,t.background),c.addColorStop(.48,"#06162d"),c.addColorStop(1,t.background),l.fillStyle=c,l.fillRect(0,0,r,a),l.fillStyle=t.accent,l.fillRect(0,0,r,Math.max(1,a*.04)),l.fillRect(0,a-Math.max(1,a*.04),r,Math.max(1,a*.04)),l.globalAlpha=.14;for(let u=-a;u<r;u+=a/2)l.beginPath(),l.moveTo(u,a),l.lineTo(u+a*.55,0),l.lineWidth=Math.max(1,a*.018),l.strokeStyle=t.accent,l.stroke();l.globalAlpha=1,l.fillStyle=t.foreground,l.font=`800 ${Math.max(8,Math.round(t.fontPixels*s))}px system-ui, sans-serif`,l.textAlign="center",l.textBaseline="middle",l.fillText(e,r/2,a*.52);const h=qi(o,St);return h.wrapS=dn,h.wrapT=dn,this.generatedTextTextures.push(h),this.largestAuxiliaryTextureEdge=Math.max(this.largestAuxiliaryTextureEdge,r,a),h}createContactShadowTexture(){const e=Math.min(128,this.maximumResolution),t=e/2,n=Wi(e,e),s=Xi(n),r=s.createRadialGradient(t,t,e/32,t,t,e*.47);r.addColorStop(0,"rgba(0, 0, 0, 0.82)"),r.addColorStop(.42,"rgba(0, 0, 0, 0.42)"),r.addColorStop(1,"rgba(0, 0, 0, 0)"),s.clearRect(0,0,e,e),s.fillStyle=r,s.fillRect(0,0,e,e);const a=qi(n,St);return a.wrapS=dn,a.wrapT=dn,this.extraTextures.push(a),this.largestAuxiliaryTextureEdge=Math.max(this.largestAuxiliaryTextureEdge,e),a}diagnostics(){let e=0,t=0,n=0;for(const s of this.surfaces.values())e=Math.max(e,s.resolution),t+=s.alpha===null?3:4,s.detailScales[1]>s.detailScales[0]&&(n+=1);return t+=this.generatedTextTextures.length+this.extraTextures.length,e=Math.max(e,this.largestAuxiliaryTextureEdge),Object.freeze({surfaceNames:gc,textureCount:t,largestTextureEdge:e,multiScaleSurfaceCount:n,generatedTextTextureCount:this.generatedTextTextures.length})}dispose(){if(!this.disposed){this.disposed=!0;for(const e of this.surfaces.values())e.albedo.dispose(),e.normal.dispose(),e.roughness.dispose(),e.alpha?.dispose();for(const e of this.generatedTextTextures)e.dispose();for(const e of this.extraTextures)e.dispose()}}}function ji(i){return{map:i.albedo,normalMap:i.normal,roughnessMap:i.roughness}}function A_(i){return{map:i.albedo}}function Ln(i,e){const t=new pi(e);return t.name=i,t.userData.proceduralMaterial=!0,t}function _c(i,e,t="pbr"){const n=i==="shooter",s=h=>e===void 0?{}:t==="pbr"?ji(e.surface(h)):A_(e.surface(h)),r=s("fabric"),a=s("skin"),o=s("hair"),l=s("rubber"),c=s("painted-metal");return Object.freeze({kit:Ln(`${i}-woven-kit`,{color:n?1060187:5824357,roughness:n?.72:.64,metalness:.02,...r,emissive:n?132884:466699,emissiveIntensity:.08}),kitAccent:Ln(`${i}-kit-accent`,{color:n?3048408:13238150,roughness:.58,metalness:.05,...r,emissive:n?202031:1522440,emissiveIntensity:.14}),lowerKit:Ln(`${i}-lower-kit`,{color:n?860479:1516598,roughness:.74,metalness:.01,...r}),skin:Ln(`${i}-stylized-skin`,{color:n?14654323:13797989,roughness:.7,metalness:0,...a}),hair:Ln(`${i}-matte-hair`,{color:n?1120295:2431253,roughness:.9,metalness:0,...o}),rubber:Ln(`${i}-rubber-sole`,{color:527120,roughness:.84,metalness:0,...l}),footwear:Ln(`${i}-court-footwear`,{color:n?15068146:1186083,roughness:.52,metalness:.04,...c}),eye:Ln(`${i}-eye`,{color:1119516,roughness:.42,metalness:0})})}function R_(i){return Ln("handball-grippy-rubber",{color:15770927,roughness:.64,metalness:.01,...i===void 0?{}:ji(i.surface("rubber")),emissive:6037248,emissiveIntensity:.24})}function xc(i){for(const e of Object.values(i))e.dispose()}const C_=new L(0,-1,0),ur=1e-4;class Sc{constructor(e,t){this.role=e,this.materials=t,this.root.name=e==="shooter"?"ProceduralShooterVisualRoot":"ProceduralGoalkeeperVisualRoot",this.root.userData.presentationOnly=!0,this.root.userData.ownsScoring=!1,this.body.name=`${e}-body-control`,this.root.add(this.body),this.buildTorsoAndHead(),this.leftArm=this.buildArm("left"),this.rightArm=this.buildArm("right"),this.leftLeg=this.buildLeg("left"),this.rightLeg=this.buildLeg("right"),this.applyBindPose()}role;materials;root=new nn;body=new nn;headJoint=new nn;leftArm;rightArm;leftLeg;rightLeg;geometries=[];joints=[];poseName=dc.name;disposed=!1;applyBindPose(){this.applyPose(dc)}applyPose(e){this.poseName=e.name,this.body.rotation.set(e.bodyLeanX,e.bodyTwistY,e.bodyLeanZ),this.headJoint.rotation.set(0,e.headYaw,-e.bodyLeanZ*.18),this.root.updateMatrixWorld(!0),this.solveChain(this.leftArm,e.leftHand,e.leftElbowPole),this.solveChain(this.rightArm,e.rightHand,e.rightElbowPole),this.solveChain(this.leftLeg,e.leftFoot,e.leftKneePole),this.solveChain(this.rightLeg,e.rightFoot,e.rightKneePole),this.leftArm.endJoint.rotation.z=-e.handSpread,this.rightArm.endJoint.rotation.z=e.handSpread,this.leftLeg.endJoint.rotation.x=Math.PI/2-.16,this.rightLeg.endJoint.rotation.x=Math.PI/2-.16,this.root.updateMatrixWorld(!0)}throwingHandWorld(){return this.worldPoint(this.rightArm.endJoint)}diagnostics(){let e=!0;return this.root.traverse(t=>{[t.position.x,t.position.y,t.position.z,t.quaternion.x,t.quaternion.y,t.quaternion.z,t.quaternion.w,t.scale.x,t.scale.y,t.scale.z].some(s=>!Number.isFinite(s))&&(e=!1)}),Object.freeze({role:this.role,poseName:this.poseName,articulatedJointCount:this.joints.length,finiteTransforms:e,leftHandWorld:this.worldPoint(this.leftArm.endJoint),rightHandWorld:this.worldPoint(this.rightArm.endJoint),leftFootWorld:this.worldPoint(this.leftLeg.endJoint),rightFootWorld:this.worldPoint(this.rightLeg.endJoint)})}dispose(){if(!this.disposed){this.disposed=!0;for(const e of this.geometries)e.dispose()}}buildTorsoAndHead(){const e=this.mesh(new ln(.25,12,8),this.materials.lowerKit,"pelvis");e.scale.set(1,.72,.72),e.position.y=.86,this.body.add(e);const t=this.mesh(new yn(.22,.24,.25,12),this.materials.lowerKit,"waist");t.position.y=1.02,this.body.add(t);const n=this.mesh(new yn(.25,.33,.62,12),this.materials.kit,"tapered-jersey");n.position.y=1.3,n.scale.z=.72,this.body.add(n);const s=this.mesh(new jn(.08,.43,5,10),this.materials.kitAccent,"shoulder-band");s.rotation.z=Math.PI/2,s.position.set(0,1.53,0),s.scale.z=.72,this.body.add(s);const r=this.mesh(new Io(.105,.025,6,16),this.materials.kitAccent,"jersey-collar");r.rotation.x=Math.PI/2,r.position.set(0,1.58,0),this.body.add(r);const a=this.mesh(new yn(.085,.095,.14,10),this.materials.skin,"neck");a.position.y=1.65,this.body.add(a),this.headJoint.name=`${this.role}-neck-joint`,this.headJoint.position.y=1.72,this.joints.push(this.headJoint),this.body.add(this.headJoint);const o=this.mesh(new ln(.18,14,10),this.materials.skin,"head");o.scale.set(.92,1.08,.92),o.position.y=.08,this.headJoint.add(o);const l=this.role==="shooter"?.165:-.165,c=new ln(.018,8,5),h=this.instancedMesh(c,this.materials.eye,"paired-eyes",2),u=new je;for(const[p,g]of[-.055,.055].entries())u.makeTranslation(g,.11,l),h.setMatrixAt(p,u);this.finalizeInstancedMesh(h),this.headJoint.add(h);const f=this.mesh(new ln(.19,12,8,0,Math.PI*2,0,Math.PI*.58),this.materials.hair,"hair-cap");f.scale.set(1.04,.9,1.04),f.position.y=.115,this.headJoint.add(f),this.addHairSilhouette()}addHairSilhouette(){const e=this.role==="shooter"?11:5,t=new Cr(.045,1,6),n=this.instancedMesh(t,this.materials.hair,"authored-hair-spikes",e),s=new L,r=new It,a=new L,o=new je;for(let l=0;l<e;l+=1){const c=l/e*Math.PI*2,h=this.role==="shooter"?.12+l%3*.025:.075+l%2*.015;s.set(Math.cos(c)*.15,.18+l%2*.025,Math.sin(c)*.15),r.setFromUnitVectors(new L(0,1,0),new L(Math.cos(c)*.62,.78,Math.sin(c)*.62).normalize()),a.set(1,h,1),o.compose(s,r,a),n.setMatrixAt(l,o)}this.finalizeInstancedMesh(n),this.headJoint.add(n)}buildArm(e){const t=e==="left"?-1:1,n=this.role==="shooter"?.37:.39,s=this.role==="shooter"?.34:.36,r=this.joint(`${this.role}-${e}-shoulder`);r.position.set(t*.29,1.49,0),this.body.add(r);const a=this.armSegment(n*.42,.082,.045,.02,this.materials.kit,`${e}-upper-sleeve`);r.add(a);const o=this.armSegment(n*.58,.062,.02,.035,this.materials.skin,`${e}-upper-arm`);o.position.y-=n*.42,r.add(o);const l=this.joint(`${this.role}-${e}-elbow`);l.position.y=-n,r.add(l);const c=this.armSegment(s,.055,.035,.025,this.materials.skin,`${e}-forearm`);l.add(c);const h=this.joint(`${this.role}-${e}-wrist`);return h.position.y=-s,l.add(h),this.addHand(h,e),{upperJoint:r,lowerJoint:l,endJoint:h,upperLength:n,lowerLength:s}}buildLeg(e){const t=e==="left"?-1:1,n=.43,s=.42,r=this.joint(`${this.role}-${e}-hip`);r.position.set(t*.13,.88,0),this.body.add(r);const a=this.segment(n,.105,.082,this.materials.lowerKit,`${e}-thigh`);r.add(a);const o=this.joint(`${this.role}-${e}-knee`);o.position.y=-n,r.add(o);const l=this.segment(s,.078,.052,this.materials.lowerKit,`${e}-shin`);o.add(l);const c=this.joint(`${this.role}-${e}-ankle`);return c.position.y=-s,o.add(c),this.addFoot(c,e),{upperJoint:r,lowerJoint:o,endJoint:c,upperLength:n,lowerLength:s}}addHand(e,t){const n=this.mesh(new ln(.07,10,7),this.materials.skin,`${t}-shaped-palm`);n.scale.set(.72,1.05,.48),n.position.y=-.055,e.add(n);const s=new jn(.011,.055,3,6),r=this.instancedMesh(s,this.materials.skin,`${t}-fingers`,4),a=new L,o=new It,l=new L(1,1,1),c=new je;for(let u=0;u<4;u+=1)a.set((u-1.5)*.019,-.14,0),o.setFromAxisAngle(new L(0,0,1),(u-1.5)*.035),c.compose(a,o,l),r.setMatrixAt(u,c);this.finalizeInstancedMesh(r),e.add(r);const h=this.mesh(new jn(.013,.045,3,6),this.materials.skin,`${t}-thumb`);h.position.set(t==="left"?.066:-.066,-.07,.012),h.rotation.z=t==="left"?-.75:.75,e.add(h)}addFoot(e,t){const n=this.mesh(new ln(.09,10,7),this.materials.footwear,`${t}-shoe-upper`);n.scale.set(.84,.58,1.55),n.position.set(0,-.045,.055),e.add(n);const s=this.mesh(new jn(.045,.16,4,8),this.materials.rubber,`${t}-rubber-sole`);s.rotation.x=Math.PI/2,s.position.set(0,-.095,.07),s.scale.x=1.18,e.add(s)}solveChain(e,t,n){this.root.updateMatrixWorld(!0);const s=e.upperJoint.getWorldPosition(new L),r=this.root.localToWorld(new L(t.x,t.y,t.z)),a=this.root.localToWorld(new L(n.x,n.y,n.z)),o=r.clone().sub(s),l=o.length(),c=Math.abs(e.upperLength-e.lowerLength)+ur,h=e.upperLength+e.lowerLength-ur,u=Dn.clamp(l,c,h),f=l>ur?o.multiplyScalar(1/l):new L(0,-1,0),p=a.sub(s);p.addScaledVector(f,-p.dot(f)),p.lengthSq()<ur&&p.set(0,0,1),p.normalize();const g=(e.upperLength*e.upperLength+u*u-e.lowerLength*e.lowerLength)/(2*u),_=Math.sqrt(Math.max(0,e.upperLength*e.upperLength-g*g)),m=s.clone().addScaledVector(f,g).addScaledVector(p,_),d=s.clone().addScaledVector(f,u),b=m.clone().sub(s).normalize(),E=d.clone().sub(m).normalize();this.setWorldDirection(e.upperJoint,b),e.upperJoint.updateMatrixWorld(!0),this.setWorldDirection(e.lowerJoint,E),e.lowerJoint.updateMatrixWorld(!0)}setWorldDirection(e,t){const n=new It().setFromUnitVectors(C_,t),s=new It;e.parent?.getWorldQuaternion(s),e.quaternion.copy(s.invert().multiply(n))}joint(e){const t=new nn;return t.name=e,t.userData.articulatedJoint=!0,this.joints.push(t),t}segment(e,t,n,s,r){const a=this.mesh(new yn(n,t,e,10),s,r);return a.position.y=-e/2,a}armSegment(e,t,n,s,r,a){const o=e+n+s,l=this.mesh(new jn(t,Math.max(.01,o-t*2),4,8),r,a);return l.position.y=(-e+n-s)/2,l}mesh(e,t,n){e.name=`${this.role}-${n}-geometry`,this.geometries.push(e);const s=new ht(e,t);return s.name=`${this.role}-${n}`,s.castShadow=!0,s.receiveShadow=!0,s}instancedMesh(e,t,n,s){e.name=`${this.role}-${n}-geometry`,this.geometries.push(e);const r=new Pt(e,t,s);return r.name=`${this.role}-${n}`,r.castShadow=!1,r.receiveShadow=!0,r.userData.boundedProceduralDetail=!0,r}finalizeInstancedMesh(e){e.instanceMatrix.needsUpdate=!0,e.computeBoundingBox(),e.computeBoundingSphere()}worldPoint(e){const t=e.getWorldPosition(new L);return Object.freeze({x:t.x,y:t.y,z:t.z})}}const xr=Object.freeze([1398694,2457821,15331839,2111059,4945578,7901877]),Sr=Object.freeze([15776913,14260079,12153938,9196092,6306349]),fo=Object.freeze([3524351,16120063,1266873,8962047]),P_=8,L_=6;function In(i,e,t){return e+(t-e)*i.nextFloat()}function D_(i,e,t){const n=Math.max(1,Math.ceil(e/P_)),s=Math.floor(i/n),r=i%n,a=n===1?.5:r/Math.max(1,n-1);let o=Dn.lerp(-8.82,8.82,a);o+=In(t,-.18,.18);for(const c of[-4.1,4.1])Math.abs(o-c)<.34&&(o+=o<c?-.34:.34);const l=s<=3||s===4&&r%3===0?"hero":"distant";return fh(t,o,.55+s*.43+In(t,-.055,.055),9.28+s*.78+In(t,-.09,.09),Math.PI+In(t,-.1,.1),l)}function I_(i,e,t,n){const s=Math.ceil(e/2),r=Math.max(1,Math.ceil(s/L_)),a=Math.floor(i/2),o=Math.floor(a/r),l=a%r,c=r===1?.5:l/Math.max(1,r-1);return fh(n,t*(8.78+o*.19),.68+o*.48,Dn.lerp(.8,13.7,c)+In(n,-.09,.09),t*(Math.PI/2)+In(n,-.12,.12),o<=2?"hero":"distant")}function fh(i,e,t,n,s,r){const a=i.nextInt(xr.length),o=Math.abs(e)<2.2&&a===2?4:a;return Object.freeze({x:e,y:t,z:n,yaw:s,heightScale:In(i,.82,1.2),widthScale:In(i,.82,1.16),animationPhase:i.nextFloat()*Math.PI*2,pose:In(i,-1,1),kitColorIndex:o,skinColorIndex:i.nextInt(Sr.length),scarfColorIndex:i.nextInt(fo.length),hasScarf:r==="hero"&&i.nextFloat()>.46,lod:r})}function O_(i,e){if(!Number.isInteger(i)||i<1||i>960)throw new RangeError("Crowd instance count must be an integer from 1 to 960.");const t=new Ar(e).fork("arena-crowd"),n=Math.round(i*.55),s=[];for(let a=0;a<n;a+=1)s.push(D_(a,n,t));const r=i-n;for(let a=0;a<r;a+=1)s.push(I_(a,r,a%2===0?-1:1,t));return Object.freeze(s)}function _a(i,e){const t=new qn({color:16777215,map:e.albedo,emissive:i.includes("skin")?2035723:i.includes("scarves")?465462:398378,emissiveIntensity:i.includes("skin")?.16:.22});return t.name=i,t.vertexColors=!0,t.userData.proceduralMaterial=!0,t}class N_{root=new nn;layout;heroMembers;staticHeroMembers;distantMembers;animatedMembers;scarfMembers;staticScarfMembers;animatedScarfMembers;animatedHeroTorso;animatedHeroHeads;animatedHeroArms;animatedScarves;staticHeroTorso;staticHeroHeads;staticHeroArms;staticScarves;distantBodies;distantHeads;geometries=[];materials=[];matrix=new je;position=new L;scale=new L;rotation=new It;yawRotation=new It;localRotation=new It;yAxis=new L(0,1,0);zAxis=new L(0,0,1);animationMaximumHz;staticMeshes;animatedMeshes;instancedMeshes;lastAnimationSecond=0;animationUpdateCount=0;matrixWritesLastUpdate=0;disposed=!1;constructor(e,t,n,s){if(!Number.isInteger(e.animatedInstanceMaximum)||e.animatedInstanceMaximum<0||e.animatedInstanceMaximum>e.instanceCount)throw new RangeError("Animated crowd maximum must be an integer within the crowd count.");if(!Number.isFinite(e.animationMaximumHz)||e.animationMaximumHz<0)throw new RangeError("Crowd animation frequency must be non-negative.");this.root.name="InstancedEuropeanArenaCrowd",this.root.userData.presentationOnly=!0,this.root.userData.ownsScoring=!1,this.layout=O_(e.instanceCount,t),this.heroMembers=Object.freeze(this.layout.filter(d=>d.lod==="hero")),this.distantMembers=Object.freeze(this.layout.filter(d=>d.lod==="distant")),this.animatedMembers=Object.freeze(this.heroMembers.slice(0,e.animatedInstanceMaximum)),this.staticHeroMembers=Object.freeze(this.heroMembers.slice(e.animatedInstanceMaximum)),this.scarfMembers=Object.freeze(this.heroMembers.filter(d=>d.hasScarf));const r=new Set(this.animatedMembers);this.animatedScarfMembers=Object.freeze(this.scarfMembers.filter(d=>r.has(d))),this.staticScarfMembers=Object.freeze(this.scarfMembers.filter(d=>!r.has(d))),this.animationMaximumHz=e.animationMaximumHz;const a=this.geometry(new jn(.13,.35,3,7)),o=this.geometry(new ln(.105,8,6)),l=this.geometry(new yn(.035,.045,.45,6)),c=this.geometry(new ut(.48,.07,.045)),h=this.geometry(new Cr(.14,.62,5)),u=this.geometry(new ln(.095,5,4)),f=this.material(_a("crowd-generated-fabric",n)),p=this.material(_a("crowd-generated-skin",s)),g=this.material(_a("crowd-generated-scarves",n));this.animatedHeroTorso=this.instanceMesh(a,f,this.animatedMembers.length,"CrowdAnimatedHeroLodTorsos"),this.animatedHeroHeads=this.instanceMesh(o,p,this.animatedMembers.length,"CrowdAnimatedHeroLodHeads"),this.animatedHeroArms=this.instanceMesh(l,f,this.animatedMembers.length*2,"CrowdAnimatedHeroLodPoseArms"),this.animatedScarves=this.instanceMesh(c,g,this.animatedScarfMembers.length,"CrowdAnimatedHeroLodScarves"),this.staticHeroTorso=this.instanceMesh(a,f,this.staticHeroMembers.length,"CrowdStaticHeroLodTorsos"),this.staticHeroHeads=this.instanceMesh(o,p,this.staticHeroMembers.length,"CrowdStaticHeroLodHeads"),this.staticHeroArms=this.instanceMesh(l,f,this.staticHeroMembers.length*2,"CrowdStaticHeroLodPoseArms"),this.staticScarves=this.instanceMesh(c,g,this.staticScarfMembers.length,"CrowdStaticHeroLodScarves"),this.distantBodies=new Pt(h,f,this.distantMembers.length),this.distantHeads=new Pt(u,p,this.distantMembers.length),this.animatedMeshes=Object.freeze([this.animatedHeroTorso,this.animatedHeroHeads,this.animatedHeroArms,this.animatedScarves].filter(d=>d!==null)),this.staticMeshes=Object.freeze([this.staticHeroTorso,this.staticHeroHeads,this.staticHeroArms,this.staticScarves,this.distantBodies,this.distantHeads].filter(d=>d!==null)),this.instancedMeshes=Object.freeze([...this.animatedMeshes,...this.staticMeshes]);const _=e.staticRenderLayer??0,m=e.animatedRenderLayer??0;for(const d of this.animatedMeshes)d.layers.set(m),d.userData.crowdMotion="animated";for(const d of this.staticMeshes)d.layers.set(_),d.userData.crowdMotion="static";for(const d of this.instancedMeshes)d.frustumCulled=!0,d.castShadow=!1,d.receiveShadow=!1,d.userData.crowdLod=d===this.distantBodies||d===this.distantHeads?"distant":"hero",this.root.add(d);this.distantBodies.name="CrowdDistantLodBodies",this.distantHeads.name="CrowdDistantLodHeads";for(const d of this.animatedMeshes)d.instanceMatrix.setUsage(vd);this.applyInstanceColors(),this.initializeInstanceMatrices(),this.computeConservativeBounds()}update(e){if(!(this.animatedMembers.length===0||this.animationMaximumHz===0||e-this.lastAnimationSecond+Number.EPSILON<1/this.animationMaximumHz)){this.lastAnimationSecond=e,this.animationUpdateCount+=1,this.matrixWritesLastUpdate=0;for(let t=0;t<this.animatedMembers.length;t+=1){const n=this.animatedMembers[t];if(n===void 0)continue;const s=Math.sin(e*2.4+n.animationPhase),r=s*.025*n.heightScale;if(this.animatedHeroTorso===null||this.animatedHeroHeads===null||this.animatedHeroArms===null)throw new Error("Animated crowd meshes are missing.");this.setBodyMatrix(this.animatedHeroTorso,t,n,r,.5,n.widthScale,n.heightScale),this.setBodyMatrix(this.animatedHeroHeads,t,n,r,.91,n.widthScale,n.heightScale),this.matrixWritesLastUpdate+=2,this.setArmMatrix(this.animatedHeroArms,n,t*2,-1,s,r),this.setArmMatrix(this.animatedHeroArms,n,t*2+1,1,s,r),this.matrixWritesLastUpdate+=2}for(let t=0;t<this.animatedScarfMembers.length;t+=1){const n=this.animatedScarfMembers[t];if(n===void 0)continue;if(this.animatedScarves===null)throw new Error("Animated crowd scarf mesh is missing.");const s=Math.sin(e*2.4+n.animationPhase);this.setBodyMatrix(this.animatedScarves,t,n,s*.03,.82,n.widthScale,n.heightScale),this.matrixWritesLastUpdate+=1}this.markMatrixRange(this.animatedHeroTorso,this.animatedMembers.length),this.markMatrixRange(this.animatedHeroHeads,this.animatedMembers.length),this.markMatrixRange(this.animatedHeroArms,this.animatedMembers.length*2),this.markMatrixRange(this.animatedScarves,this.animatedScarfMembers.length)}}diagnostics(){return Object.freeze({totalInstances:this.layout.length,heroLodInstances:this.heroMembers.length,distantLodInstances:this.distantMembers.length,animatedInstances:this.animatedMembers.length,staticInstances:this.layout.length-this.animatedMembers.length,animationMaximumHz:this.animationMaximumHz,animationUpdateCount:this.animationUpdateCount,matrixWritesLastUpdate:this.matrixWritesLastUpdate,distantRowsStatic:!0,scarfInstances:this.scarfMembers.length,uniqueKitColors:new Set(this.layout.map(e=>e.kitColorIndex)).size,uniquePoseBands:new Set(this.layout.map(e=>Math.round(e.pose*8))).size,uniqueAnimationPhases:new Set(this.layout.map(e=>Math.round(e.animationPhase*100))).size,instancedDrawGroups:this.instancedMeshes.length,staticInstancedDrawGroups:this.staticMeshes.length,animatedInstancedDrawGroups:this.animatedMeshes.length,frustumCulledMeshes:this.instancedMeshes.filter(e=>e.frustumCulled).length,boundedCullingMeshes:this.instancedMeshes.filter(e=>e.boundingBox!==null&&e.boundingSphere!==null).length,unboundedCullingMeshes:this.instancedMeshes.filter(e=>e.boundingBox===null||e.boundingSphere===null).length,sharedGeometryCount:this.geometries.length,sharedMaterialCount:this.materials.length})}dispose(){if(!this.disposed){this.disposed=!0;for(const e of this.geometries)e.dispose();for(const e of this.materials)e.dispose()}}initializeInstanceMatrices(){for(let e=0;e<this.animatedMembers.length;e+=1){const t=this.animatedMembers[e];if(t===void 0)continue;if(this.animatedHeroTorso===null||this.animatedHeroHeads===null||this.animatedHeroArms===null)throw new Error("Animated crowd meshes are missing.");const n=Math.sin(t.animationPhase),s=n*.025*t.heightScale;this.setBodyMatrix(this.animatedHeroTorso,e,t,s,.5,t.widthScale,t.heightScale),this.setBodyMatrix(this.animatedHeroHeads,e,t,s,.91,t.widthScale,t.heightScale),this.setArmMatrix(this.animatedHeroArms,t,e*2,-1,n,s),this.setArmMatrix(this.animatedHeroArms,t,e*2+1,1,n,s)}for(let e=0;e<this.animatedScarfMembers.length;e+=1){const t=this.animatedScarfMembers[e];if(t===void 0)continue;if(this.animatedScarves===null)throw new Error("Animated crowd scarf mesh is missing.");const n=Math.sin(t.animationPhase);this.setBodyMatrix(this.animatedScarves,e,t,n*.03,.82,t.widthScale,t.heightScale)}for(let e=0;e<this.staticHeroMembers.length;e+=1){const t=this.staticHeroMembers[e];if(t===void 0)continue;if(this.staticHeroTorso===null||this.staticHeroHeads===null||this.staticHeroArms===null)throw new Error("Static crowd meshes are missing.");const n=Math.sin(t.animationPhase),s=n*.025*t.heightScale;this.setBodyMatrix(this.staticHeroTorso,e,t,s,.5,t.widthScale,t.heightScale),this.setBodyMatrix(this.staticHeroHeads,e,t,s,.91,t.widthScale,t.heightScale),this.setArmMatrix(this.staticHeroArms,t,e*2,-1,n,s),this.setArmMatrix(this.staticHeroArms,t,e*2+1,1,n,s)}for(let e=0;e<this.staticScarfMembers.length;e+=1){const t=this.staticScarfMembers[e];if(t===void 0)continue;if(this.staticScarves===null)throw new Error("Static crowd scarf mesh is missing.");const n=Math.sin(t.animationPhase);this.setBodyMatrix(this.staticScarves,e,t,n*.03,.82,t.widthScale,t.heightScale)}for(let e=0;e<this.distantMembers.length;e+=1){const t=this.distantMembers[e];t!==void 0&&(this.setBodyMatrix(this.distantBodies,e,t,0,.43,t.widthScale,t.heightScale),this.setBodyMatrix(this.distantHeads,e,t,0,.81,t.widthScale,t.heightScale))}for(const e of this.instancedMeshes)e.instanceMatrix.needsUpdate=!0}computeConservativeBounds(){for(const e of this.instancedMeshes)e.computeBoundingBox(),e.computeBoundingSphere(),e.boundingBox?.expandByScalar(.12),e.boundingSphere!==null&&(e.boundingSphere.radius+=.12)}markMatrixRange(e,t){e===null||t===0||(e.instanceMatrix.clearUpdateRanges(),e.instanceMatrix.addUpdateRange(0,t*16),e.instanceMatrix.needsUpdate=!0)}applyInstanceColors(){for(let e=0;e<this.animatedMembers.length;e+=1){const t=this.animatedMembers[e];if(t===void 0)continue;if(this.animatedHeroTorso===null||this.animatedHeroHeads===null||this.animatedHeroArms===null)throw new Error("Animated crowd meshes are missing.");const n=new Ne(xr[t.kitColorIndex]??16777215),s=new Ne(Sr[t.skinColorIndex]??16777215);this.animatedHeroTorso.setColorAt(e,n),this.animatedHeroHeads.setColorAt(e,s),this.animatedHeroArms.setColorAt(e*2,n),this.animatedHeroArms.setColorAt(e*2+1,n)}for(let e=0;e<this.staticHeroMembers.length;e+=1){const t=this.staticHeroMembers[e];if(t===void 0)continue;if(this.staticHeroTorso===null||this.staticHeroHeads===null||this.staticHeroArms===null)throw new Error("Static crowd meshes are missing.");const n=new Ne(xr[t.kitColorIndex]??16777215),s=new Ne(Sr[t.skinColorIndex]??16777215);this.staticHeroTorso.setColorAt(e,n),this.staticHeroHeads.setColorAt(e,s),this.staticHeroArms.setColorAt(e*2,n),this.staticHeroArms.setColorAt(e*2+1,n)}for(let e=0;e<this.animatedScarfMembers.length;e+=1){const t=this.animatedScarfMembers[e];if(t!==void 0){if(this.animatedScarves===null)throw new Error("Animated crowd scarf mesh is missing.");this.animatedScarves.setColorAt(e,new Ne(fo[t.scarfColorIndex]??16777215))}}for(let e=0;e<this.staticScarfMembers.length;e+=1){const t=this.staticScarfMembers[e];if(t!==void 0){if(this.staticScarves===null)throw new Error("Static crowd scarf mesh is missing.");this.staticScarves.setColorAt(e,new Ne(fo[t.scarfColorIndex]??16777215))}}for(let e=0;e<this.distantMembers.length;e+=1){const t=this.distantMembers[e];t!==void 0&&(this.distantBodies.setColorAt(e,new Ne(xr[t.kitColorIndex]??16777215)),this.distantHeads.setColorAt(e,new Ne(Sr[t.skinColorIndex]??16777215)))}for(const e of this.instancedMeshes)e.instanceColor!==null&&(e.instanceColor.needsUpdate=!0)}setBodyMatrix(e,t,n,s,r,a,o){this.position.set(n.x,n.y+r*o+s,n.z),this.rotation.setFromAxisAngle(this.yAxis,n.yaw),this.scale.set(a,o,a*.9),this.matrix.compose(this.position,this.rotation,this.scale),e.setMatrixAt(t,this.matrix)}setArmMatrix(e,t,n,s,r,a){const o=s*(.22+Math.abs(t.pose)*.92+r*.14),l=s*.18*t.widthScale,c=.225*t.heightScale,h=l-Math.sin(o)*c,u=.69*t.heightScale+Math.cos(o)*c;this.position.set(t.x+Math.cos(t.yaw)*h,t.y+u+a,t.z-Math.sin(t.yaw)*h),this.yawRotation.setFromAxisAngle(this.yAxis,t.yaw),this.localRotation.setFromAxisAngle(this.zAxis,o),this.rotation.multiplyQuaternions(this.yawRotation,this.localRotation),this.scale.set(t.widthScale,t.heightScale,t.widthScale),this.matrix.compose(this.position,this.rotation,this.scale),e.setMatrixAt(n,this.matrix)}instanceMesh(e,t,n,s){if(n===0)return null;const r=new Pt(e,t,n);return r.name=s,r}geometry(e){return this.geometries.push(e),e}material(e){return this.materials.push(e),e}}const F_=Object.freeze({balanced:Object.freeze({ribbonPoints:18,speedLines:6,particles:24}),high:Object.freeze({ribbonPoints:24,speedLines:10,particles:36}),capture:Object.freeze({ribbonPoints:28,speedLines:12,particles:48})}),vc=Object.freeze({GOAL:Object.freeze({label:"Goal surge",colorHex:"#4dff87",threeColor:5111687}),SAVED:Object.freeze({label:"Keeper shield",colorHex:"#4ed8ff",threeColor:5167359}),MISS:Object.freeze({label:"Miss warning",colorHex:"#ff725f",threeColor:16740959})}),dr=Object.freeze({tailHalfWidthMeters:.006,headHalfWidthMeters:.038,opacity:.56}),xa=16757819,U_=.22,z_=.48,Mc=.14,yc=.24,Sa=new xi(new L(0,1.4,3.5),6);class B_{root=new nn;limits;camera;ribbonHistory;ribbonPositions;ribbonGeometry=new vt;ribbonMaterial=new Qt({color:xa,transparent:!0,opacity:dr.opacity,depthWrite:!1,blending:_s,side:cn,toneMapped:!1});speedLinePositions;speedLineGeometry=new vt;speedLineMaterial=new co({color:16766071,transparent:!0,opacity:.46,depthWrite:!1,blending:_s,toneMapped:!1});particlePositions;particleGeometry=new vt;particleMaterial=new co({color:xa,transparent:!0,opacity:.9,depthWrite:!1,blending:_s,toneMapped:!1});tempPrevious=new L;tempNext=new L;tempPoint=new L;tempDirection=new L;tempView=new L;tempSide=new L;releaseOrigin=new L;impactOrigin=new L;cameraImpulsePixels={x:0,y:0};phase="READY";particleMode=null;currentOutcome=null;reducedMotion=!1;ribbonPointCount=0;activeSpeedLines=0;activeParticles=0;previousShotProgress=0;releaseAtSeconds=Number.NEGATIVE_INFINITY;impactAtSeconds=Number.NEGATIVE_INFINITY;releasePower=0;releaseBursts=0;impactBursts=0;outcomeBursts={GOAL:0,SAVED:0,MISS:0};constructor(e,t){this.limits=F_[e.name],this.camera=t,this.root.name="BoundedArcadeEffects",this.root.userData.qualityPreset=e.name,this.root.userData.ownsScoring=!1,this.root.visible=!0,this.ribbonHistory=new Float32Array(this.limits.ribbonPoints*3),this.ribbonPositions=new Float32Array(this.limits.ribbonPoints*2*3);const n=new Uint16Array(Math.max(0,this.limits.ribbonPoints-1)*6);for(let o=0;o<this.limits.ribbonPoints-1;o+=1){const l=o*2,c=o*6;n[c]=l,n[c+1]=l+1,n[c+2]=l+2,n[c+3]=l+1,n[c+4]=l+3,n[c+5]=l+2}this.ribbonGeometry.setAttribute("position",new Ot(this.ribbonPositions,3)),this.ribbonGeometry.setIndex(new Ot(n,1)),this.ribbonGeometry.setDrawRange(0,0),this.ribbonGeometry.boundingSphere=Sa.clone();const s=new ht(this.ribbonGeometry,this.ribbonMaterial);s.name="WarmGoldBallRibbon",s.renderOrder=4,this.root.add(s),this.speedLinePositions=new Float32Array(this.limits.speedLines*2*3),this.speedLineGeometry.setAttribute("position",new Ot(this.speedLinePositions,3)),this.speedLineGeometry.setDrawRange(0,0),this.speedLineGeometry.boundingSphere=Sa.clone();const r=new Nl(this.speedLineGeometry,this.speedLineMaterial);r.name="RestrainedBallSpeedLines",r.renderOrder=3,this.root.add(r),this.particlePositions=new Float32Array(this.limits.particles*2*3),this.particleGeometry.setAttribute("position",new Ot(this.particlePositions,3)),this.particleGeometry.setDrawRange(0,0),this.particleGeometry.boundingSphere=Sa.clone();const a=new Nl(this.particleGeometry,this.particleMaterial);a.name="BoundedReleaseImpactParticles",a.renderOrder=6,this.root.add(a)}setReducedMotion(e){this.reducedMotion=e,e&&(this.speedLineGeometry.setDrawRange(0,0),this.particleGeometry.setDrawRange(0,0),this.activeSpeedLines=0,this.activeParticles=0,this.cameraImpulsePixels.x=0,this.cameraImpulsePixels.y=0)}beginShot(e,t,n){this.root.visible=!0,this.phase="FLIGHT",this.currentOutcome=null,this.releasePower=Dn.clamp(t,0,1),this.releaseAtSeconds=n,this.impactAtSeconds=Number.NEGATIVE_INFINITY,this.releaseOrigin.set(e.x,e.y,e.z),this.particleMode="RELEASE",this.releaseBursts+=1,this.previousShotProgress=0,this.clearRibbon(),this.appendRibbonPoint(e),this.configureParticleColor(xa)}resolveOutcome(e,t,n){if(this.phase!=="FLIGHT"||this.currentOutcome!==null)return;this.phase="RESULT",this.currentOutcome=e,this.impactAtSeconds=n,this.impactOrigin.set(t.x,t.y,t.z),this.particleMode="IMPACT",this.impactBursts+=1,this.outcomeBursts[e]+=1;const s=vc[e];this.configureParticleColor(s.threeColor)}resetVisuals(){this.root.visible=!1,this.phase="READY",this.currentOutcome=null,this.particleMode=null,this.previousShotProgress=0,this.clearRibbon(),this.speedLineGeometry.setDrawRange(0,0),this.particleGeometry.setDrawRange(0,0),this.activeSpeedLines=0,this.activeParticles=0,this.cameraImpulsePixels.x=0,this.cameraImpulsePixels.y=0}update(e){if(this.phase==="READY")return;this.phase==="FLIGHT"&&e.shotProgress>this.previousShotProgress+Number.EPSILON&&(this.appendRibbonPoint(e.ballPosition),this.previousShotProgress=e.shotProgress);const t=this.phase==="RESULT"?Math.max(0,1-e.resultProgress*1.35):1;this.ribbonMaterial.opacity=dr.opacity*t,this.updateSpeedLines(e),this.updateParticles(e.simulationSeconds),this.updateCameraImpulse(e.simulationSeconds)}screenImpulse(){return this.cameraImpulsePixels}diagnostics(){return Object.freeze({limits:this.limits,reducedMotion:this.reducedMotion,phase:this.phase,activeRibbonPoints:this.ribbonPointCount,activeSpeedLines:this.activeSpeedLines,activeParticles:this.activeParticles,releaseBursts:this.releaseBursts,impactBursts:this.impactBursts,outcomeBursts:Object.freeze({...this.outcomeBursts}),currentOutcome:this.currentOutcome,currentOutcomeColor:this.currentOutcome===null?null:vc[this.currentOutcome].colorHex,resultEffectsStartedAfterOutcome:this.impactBursts===this.outcomeBursts.GOAL+this.outcomeBursts.SAVED+this.outcomeBursts.MISS,cameraImpulsePixels:Object.freeze({x:this.cameraImpulsePixels.x,y:this.cameraImpulsePixels.y})})}dispose(){this.ribbonGeometry.dispose(),this.ribbonMaterial.dispose(),this.speedLineGeometry.dispose(),this.speedLineMaterial.dispose(),this.particleGeometry.dispose(),this.particleMaterial.dispose()}clearRibbon(){this.ribbonPointCount=0,this.ribbonGeometry.setDrawRange(0,0)}appendRibbonPoint(e){this.ribbonPointCount>=this.limits.ribbonPoints&&(this.ribbonHistory.copyWithin(0,3),this.ribbonPointCount=this.limits.ribbonPoints-1);const t=this.ribbonPointCount*3;this.ribbonHistory[t]=e.x,this.ribbonHistory[t+1]=e.y,this.ribbonHistory[t+2]=e.z,this.ribbonPointCount+=1,this.rebuildRibbon()}rebuildRibbon(){const e=this.ribbonPointCount;for(let t=0;t<e;t+=1){const n=Math.max(0,t-1)*3,s=Math.min(e-1,t+1)*3,r=t*3;this.tempPrevious.fromArray(this.ribbonHistory,n),this.tempNext.fromArray(this.ribbonHistory,s),this.tempPoint.fromArray(this.ribbonHistory,r),this.tempDirection.subVectors(this.tempNext,this.tempPrevious),this.tempDirection.lengthSq()<1e-6?this.tempDirection.set(0,0,1):this.tempDirection.normalize(),this.tempView.subVectors(this.camera.position,this.tempPoint),this.tempView.lengthSq()<1e-6?this.tempView.set(0,1,0):this.tempView.normalize(),this.tempSide.crossVectors(this.tempDirection,this.tempView),this.tempSide.lengthSq()<1e-6?this.tempSide.set(1,0,0):this.tempSide.normalize();const a=e<=1?1:t/(e-1),o=Dn.lerp(dr.tailHalfWidthMeters,dr.headHalfWidthMeters,a),l=t*6;this.ribbonPositions[l]=this.tempPoint.x+this.tempSide.x*o,this.ribbonPositions[l+1]=this.tempPoint.y+this.tempSide.y*o,this.ribbonPositions[l+2]=this.tempPoint.z+this.tempSide.z*o,this.ribbonPositions[l+3]=this.tempPoint.x-this.tempSide.x*o,this.ribbonPositions[l+4]=this.tempPoint.y-this.tempSide.y*o,this.ribbonPositions[l+5]=this.tempPoint.z-this.tempSide.z*o}this.ribbonGeometry.getAttribute("position").needsUpdate=!0,this.ribbonGeometry.setDrawRange(0,Math.max(0,e-1)*6)}updateSpeedLines(e){if(this.reducedMotion||this.phase!=="FLIGHT"||e.shotProgress<.08||e.shotProgress>.94){this.activeSpeedLines!==0&&this.speedLineGeometry.setDrawRange(0,0),this.activeSpeedLines=0;return}const t=this.limits.speedLines,n=.18+this.releasePower*.26;for(let s=0;s<t;s+=1){const r=s*2.399963229728653+e.simulationSeconds*(s%2===0?.7:-.5),a=.2+s%3*.095,o=e.ballPosition.x+Math.cos(r)*a,l=e.ballPosition.y+Math.sin(r)*a*.7,c=e.ballPosition.z-.22-s%4*.09,h=s*6;this.speedLinePositions[h]=o,this.speedLinePositions[h+1]=l,this.speedLinePositions[h+2]=c,this.speedLinePositions[h+3]=o*.998,this.speedLinePositions[h+4]=l-.015,this.speedLinePositions[h+5]=c-n}this.speedLineGeometry.getAttribute("position").needsUpdate=!0,this.speedLineGeometry.setDrawRange(0,t*2),this.activeSpeedLines=t}updateParticles(e){if(this.reducedMotion||this.particleMode===null){this.activeParticles!==0&&this.particleGeometry.setDrawRange(0,0),this.activeParticles=0;return}const t=this.particleMode==="RELEASE"?this.releaseAtSeconds:this.impactAtSeconds,n=this.particleMode==="RELEASE"?U_:z_,s=Math.max(0,e-t);if(s>=n){this.particleGeometry.setDrawRange(0,0),this.activeParticles=0,this.particleMode=null;return}const r=this.particleMode==="RELEASE"?this.releaseOrigin:this.impactOrigin,a=s/n,o=this.limits.particles;for(let l=0;l<o;l+=1){const c=l*2.399963229728653,h=.45+l%5*.11,u=this.particleMode==="RELEASE"?a*(.18+this.releasePower*.34):a*.78,f=this.particleMode==="RELEASE"?.04:.18*a,p=l*6,g=p+3,_=r.x+Math.cos(c)*u*h,m=r.y+Math.sin(c)*u*h+f-a*a*.12,d=r.z+Math.sin(c*.63)*u*.45-(this.particleMode==="RELEASE"?a*.12:0),b=(this.particleMode==="RELEASE"?.035:.065)*(1-a);this.particlePositions[p]=_,this.particlePositions[p+1]=m,this.particlePositions[p+2]=d,this.particlePositions[g]=_+Math.cos(c)*b,this.particlePositions[g+1]=m+Math.sin(c)*b,this.particlePositions[g+2]=d+Math.sin(c*.63)*b}this.particleMaterial.opacity=Math.max(0,1-a),this.particleGeometry.getAttribute("position").needsUpdate=!0,this.particleGeometry.setDrawRange(0,o*2),this.activeParticles=o}configureParticleColor(e){this.particleMaterial.color.setHex(e)}updateCameraImpulse(e){if(this.reducedMotion){this.cameraImpulsePixels.x=0,this.cameraImpulsePixels.y=0;return}if(this.phase==="FLIGHT"){const t=e-this.releaseAtSeconds;if(t>=0&&t<Mc){const n=Math.sin(t/Mc*Math.PI),s=2.2+this.releasePower*1.8;this.cameraImpulsePixels.x=-s*n,this.cameraImpulsePixels.y=s*.32*n;return}}if(this.phase==="RESULT"&&this.currentOutcome!==null){const t=e-this.impactAtSeconds;if(t>=0&&t<yc){const n=1-t/yc,s=this.currentOutcome==="SAVED"?4:this.currentOutcome==="GOAL"?3.2:2.2;this.cameraImpulsePixels.x=Math.sin(t*155)*s*n,this.cameraImpulsePixels.y=Math.sin(t*119+.7)*s*.55*n;return}}this.cameraImpulsePixels.x=0,this.cameraImpulsePixels.y=0}}const pt=Ct.center.z,Jt=Ct.widthMeters,_n=Ct.heightMeters,Ui=.8,Ut=Ct.postThicknessMeters,va=6,bc=7,Ec=9,H_=Object.freeze({x:-1.24,y:0,z:-.78}),k_=Object.freeze({x:-.28,y:2.05,z:.25}),zi=0,Wn=1;class G_{scene=new Co;staticRoot=new nn;cameraRig=new f_;renderer;canvas;ball;arcadeEffects;materialLibrary;quality;shooterMaterials;goalkeeperMaterials;shooter;goalkeeper;goalRoot;crowd;staticLayerCache;goalkeeperContactShadow;performanceProbe=new c_;environmentTarget=null;disposables=new Set;shooterAnimationStage="IDLE";shooterReleaseAmount=0;goalkeeperAnimationStage="READY";goalkeeperVisualPhase="READY";goalkeeperDiveAmount=0;goalkeeperZone=null;goalkeeperSaveVolumeCenter=new L(0,1,pt);goalkeeperVisibleReach=new L(0,1.28,pt);prewarmComplete=!1;prewarmedShaderPrograms=0;presentedFrames=0;lastPresentationMilliseconds=null;lastRenderCalls=0;lastRenderedTriangles=0;appliedCanvasTransform="";constructor(e,t){this.quality=t,this.canvas=e,this.canvas.__HANDBALL_PRESENTED_FRAMES__=0,this.canvas.__HANDBALL_RENDER_INTERVALS__=new Float64Array(512*2),this.staticLayerCache=new m_(t.name),this.staticRoot.name="LockedArenaStaticLayerRoot",this.staticRoot.userData.cachedStaticLayer=!0,this.scene.add(this.staticRoot),this.materialLibrary=new w_(t.proceduralTextureResolution);const n=t.name==="capture"?"pbr":"albedo";this.shooterMaterials=_c("shooter",this.materialLibrary,n),this.goalkeeperMaterials=_c("goalkeeper",this.materialLibrary,n),this.shooter=new Sc("shooter",this.shooterMaterials),this.goalkeeper=new Sc("goalkeeper",this.goalkeeperMaterials),this.renderer=new o_({canvas:e,antialias:t.antialias,alpha:!1,powerPreference:"high-performance"}),this.renderer.setPixelRatio(Math.min(window.devicePixelRatio,t.maximumPixelRatio)),this.renderer.outputColorSpace=St,this.renderer.toneMapping=Bc,this.renderer.toneMappingExposure=1,this.renderer.shadowMap.enabled=t.shadowCastingKeyLight,this.renderer.shadowMap.type=zc,this.scene.background=new Ne(463135),this.scene.fog=new Ro(463135,18,38),this.cameraRig.camera.layers.set(zi),this.scene.add(this.cameraRig.camera),this.addGeneratedEnvironment(),this.addLighting(t),this.collectStaticLayerObjects(()=>this.addCourt()),this.goalRoot=this.addGoal(),this.collectStaticLayerObjects(()=>this.addArenaBackdrop()),this.shooter.root.position.set(-.78,0,-.42),this.shooter.root.rotation.y=g_,this.scene.add(this.shooter.root),this.goalkeeper.root.position.set(0,0,pt-.08),this.scene.add(this.goalkeeper.root),this.crowd=new N_({instanceCount:t.crowdInstances,animatedInstanceMaximum:t.animatedCrowdInstances,animationMaximumHz:t.crowdAnimationMaximumHz,staticRenderLayer:Wn,animatedRenderLayer:zi},1592598533,this.materialLibrary.surface("fabric"),this.materialLibrary.surface("skin")),this.scene.add(this.crowd.root),this.goalkeeperContactShadow=this.addContactShadows(),this.ball=this.mesh(new ln(.094,20,14),R_(this.materialLibrary)),this.ball.castShadow=!0,this.scene.add(this.ball),this.arcadeEffects=new B_(t,this.cameraRig.camera),this.scene.add(this.arcadeEffects.root)}async prewarm(){this.prewarmComplete||(await this.compileLayer(zi),this.arcadeEffects.resetVisuals(),await this.staticLayerCache.compileComposite(this.renderer),this.rebuildStaticLayerCache(),this.presentCachedFrame(),this.presentCachedFrame(),this.prewarmedShaderPrograms=this.shaderProgramCount(),this.prewarmComplete=!0)}beginShotMeasurement(){if(!this.prewarmComplete)throw new Error("Cannot measure a shot before material/light pre-warm.");this.performanceProbe.beginShot(this.shaderProgramCount())}beginShotFeedback(e,t,n){this.arcadeEffects.beginShot(e,t,n)}resolveShotFeedback(e,t,n){this.arcadeEffects.resolveOutcome(e,t,n)}resetFeedback(){this.arcadeEffects.resetVisuals(),this.applyCanvasImpulse(0,0)}setReducedMotion(e){this.arcadeEffects.setReducedMotion(e),e&&this.applyCanvasImpulse(0,0)}finishShotMeasurement(){this.performanceProbe.finishShot(this.shaderProgramCount())}resize(e,t){const n=Math.max(1,Math.floor(e)),s=Math.max(1,Math.floor(t));this.cameraRig.resize(n,s),this.renderer.setSize(n,s,!1),this.staticLayerCache.configure(n,s,this.renderer.getPixelRatio(),this.quality.name)}apply(e){this.ball.position.set(e.ballPosition.x,e.ballPosition.y,e.ballPosition.z),this.ball.rotation.set(e.simulationSeconds*8,e.simulationSeconds*5,e.simulationSeconds*2),this.arcadeEffects.update({ballPosition:e.ballPosition,shotProgress:e.shotProgress,resultProgress:e.resultProgress,simulationSeconds:e.simulationSeconds});const t=this.arcadeEffects.screenImpulse();this.applyCanvasImpulse(t.x,t.y),this.crowd.update(e.simulationSeconds);const n=uh(e.shooterPhase,e.shotProgress,e.resultProgress,e.simulationSeconds,e.feintDirection,e.feintAmount,e.shotCategory,e.sideSpin);if(this.shooter.applyPose(n.pose),e.shooterPhase==="FEINT"||e.shooterPhase==="READY"){const o=this.shooter.throwingHandWorld();this.ball.position.set(o.x,o.y,o.z)}this.shooterAnimationStage=n.stage,this.shooterReleaseAmount=n.releaseAmount,this.goalkeeper.root.position.set(e.keeperPosition.x*.52,Math.max(0,(e.keeperPosition.y-1)*.28),e.keeperPosition.z-.08),this.goalkeeperContactShadow.position.set(this.goalkeeper.root.position.x,.021,this.goalkeeper.root.position.z),this.goalkeeperContactShadow.scale.set(1+e.keeperDiveProgress*.65,1+e.keeperDiveProgress*.18,1);const s=M_(e.keeperZone,e.keeperPhase,e.keeperDiveProgress,e.resultProgress,e.outcome,e.simulationSeconds,e.keeperCommitted??!1);this.goalkeeper.applyPose(s.pose),this.goalkeeperAnimationStage=s.stage,this.goalkeeperVisualPhase=e.keeperPhase,this.goalkeeperDiveAmount=s.diveAmount,this.goalkeeperZone=e.keeperZone,this.goalkeeperSaveVolumeCenter.set(e.keeperPosition.x,e.keeperPosition.y,e.keeperPosition.z);const r=this.goalkeeper.diagnostics(),a=e.keeperZone?.endsWith("left")===!0?r.leftHandWorld:e.keeperZone?.endsWith("right")===!0?r.rightHandWorld:{x:(r.leftHandWorld.x+r.rightHandWorld.x)/2,y:(r.leftHandWorld.y+r.rightHandWorld.y)/2,z:(r.leftHandWorld.z+r.rightHandWorld.z)/2};this.goalkeeperVisibleReach.set(a.x,a.y,a.z)}render(){const e=performance.now(),t=this.lastPresentationMilliseconds===null?0:e-this.lastPresentationMilliseconds;this.staticLayerCache.isValid||this.rebuildStaticLayerCache();const n=this.presentCachedFrame();this.lastRenderCalls=n.drawCalls,this.lastRenderedTriangles=n.triangles,this.lastPresentationMilliseconds=e,this.presentedFrames+=1,this.canvas.__HANDBALL_PRESENTED_FRAMES__=this.presentedFrames;const s=this.canvas.__HANDBALL_RENDER_INTERVALS__,r=(this.presentedFrames-1)%512*2;s[r]=e,s[r+1]=performance.now(),this.performanceProbe.recordRender(performance.now()-e,t,this.lastRenderCalls,this.lastRenderedTriangles,this.shaderProgramCount())}diagnostics(){let e=!0,t=0;this.scene.traverse(_=>{_ instanceof Ao&&(t+=1),[_.position.x,_.position.y,_.position.z,_.rotation.x,_.rotation.y,_.rotation.z,_.scale.x,_.scale.y,_.scale.z].some(d=>!Number.isFinite(d))&&(e=!1)});const n=this.cameraRig.projectBounds({x:-Jt/2-Ut,y:0,z:pt},{x:Jt/2+Ut,y:_n+Ut,z:pt+Ui}),s=this.cameraRig.projectBounds(H_,k_),r=this.cameraRig.projectPoint(this.ball.position),a=this.shooter.diagnostics(),o=this.goalkeeper.diagnostics(),l=this.materialLibrary.diagnostics(),c=this.crowd.diagnostics(),h=this.rendererDiagnostics();let u=0,f=0;this.scene.traverse(_=>{_ instanceof Cs&&(u+=1,_.castShadow&&(f+=1))});const p=this.shaderProgramCount(),g=[...Object.values(this.shooterMaterials),...Object.values(this.goalkeeperMaterials)].map(_=>_.name);return Object.freeze({finiteTransforms:e&&a.finiteTransforms&&o.finiteTransforms,goalInnerWidthMeters:Jt,goalInnerHeightMeters:_n,releaseToGoalMeters:pt,goalAreaRadiusMeters:va,penaltyLineDistanceMeters:bc,freeThrowRadiusMeters:Ec,cameraCount:t,cameraProfile:this.cameraRig.currentLayout().profile,goalProjection:n,shooterProjection:s,ballProjection:r,ballWorldPosition:Object.freeze({x:this.ball.position.x,y:this.ball.position.y,z:this.ball.position.z}),shooterHandWorldPosition:a.rightHandWorld,goalCentered:n.fullyVisible&&Math.abs(n.centerX)<=.08&&Math.abs(n.centerY)<=.16,shooterLeftForeground:s.left<-.3&&s.right<-.18&&s.top<=1&&s.top>=-.35&&s.visibleWidth>=.46&&s.visibleWidth<=.72,shooterAnimationStage:this.shooterAnimationStage,shooterPoseName:a.poseName,shooterReleaseAmount:this.shooterReleaseAmount,goalkeeperAnimationStage:this.goalkeeperAnimationStage,goalkeeperVisualPhase:this.goalkeeperVisualPhase,goalkeeperPoseName:o.poseName,goalkeeperZone:this.goalkeeperZone,goalkeeperDiveAmount:this.goalkeeperDiveAmount,goalkeeperSaveVolumeCenter:Object.freeze({x:this.goalkeeperSaveVolumeCenter.x,y:this.goalkeeperSaveVolumeCenter.y,z:this.goalkeeperSaveVolumeCenter.z}),goalkeeperVisibleReach:Object.freeze({x:this.goalkeeperVisibleReach.x,y:this.goalkeeperVisibleReach.y,z:this.goalkeeperVisibleReach.z}),goalkeeperReachErrorMeters:this.goalkeeperVisibleReach.distanceTo(this.goalkeeperSaveVolumeCenter),characterArticulatedJointCount:a.articulatedJointCount+o.articulatedJointCount,characterMaterialNames:Object.freeze(g),characterVisualRootsOwnScoring:!1,ballPathPointCount:this.arcadeEffects.diagnostics().activeRibbonPoints,arcadeFx:this.arcadeEffects.diagnostics(),renderCalls:this.lastRenderCalls,renderedTriangles:this.lastRenderedTriangles,presentedFrames:this.presentedFrames,shaderPrograms:p,prewarmedShaderPrograms:this.prewarmedShaderPrograms,shaderProgramsStableSincePrewarm:this.prewarmComplete&&p===this.prewarmedShaderPrograms,prewarmComplete:this.prewarmComplete,appliedPixelRatio:this.renderer.getPixelRatio(),maximumPixelRatio:this.quality.maximumPixelRatio,shadowMapSize:this.quality.shadowMapSize,shadowCastingLights:f,arenaLights:u,environmentMapSize:this.quality.environmentMapSize,postProcessing:this.quality.postProcessing,renderer:h,generatedEnvironment:this.environmentTarget?.texture.userData.generatedInCode===!0,contactShadowCount:3,proceduralMaterials:l,crowd:c,staticLayerCache:Object.freeze({...this.staticLayerCache.diagnostics(),staticSceneObjects:this.staticRoot.children.length,preservesGoalKeeperOcclusion:this.usesOnlyLayer(this.goalRoot,zi)&&this.usesOnlyLayer(this.goalkeeper.root,zi)}),performance:this.performanceProbe.snapshot(),gpuGeometries:this.renderer.info.memory.geometries,gpuTextures:this.renderer.info.memory.textures})}dispose(){this.arcadeEffects.dispose(),this.shooter.dispose(),this.goalkeeper.dispose(),this.crowd.dispose(),xc(this.shooterMaterials),xc(this.goalkeeperMaterials);for(const e of this.disposables)e.dispose();this.staticLayerCache.dispose(),this.environmentTarget?.dispose(),this.materialLibrary.dispose(),this.renderer.dispose(),this.applyCanvasImpulse(0,0),delete this.canvas.__HANDBALL_PRESENTED_FRAMES__,delete this.canvas.__HANDBALL_RENDER_INTERVALS__}applyCanvasImpulse(e,t){const n=e===0&&t===0?"":`translate3d(${e.toFixed(2)}px, ${t.toFixed(2)}px, 0) scale(1.003)`;if(n!==this.appliedCanvasTransform){if(this.appliedCanvasTransform=n,n.length===0){this.canvas.style.removeProperty("transform");return}this.canvas.style.transform=n}}collectStaticLayerObjects(e){const t=new Set(this.scene.children);e();const n=this.scene.children.filter(s=>!t.has(s));for(const s of n)s.traverse(r=>{r.layers.set(Wn),r.userData.cachedStaticLayer=!0}),this.staticRoot.add(s)}async compileLayer(e){const t=this.cameraRig.camera.layers.mask;this.cameraRig.camera.layers.set(e);try{await this.renderer.compileAsync(this.scene,this.cameraRig.camera)}finally{this.cameraRig.camera.layers.mask=t}}rebuildStaticLayerCache(){this.staticLayerCache.rebuild(this.renderer,()=>{this.renderLayer(Wn)})}presentCachedFrame(){return this.staticLayerCache.present(this.renderer,()=>{this.renderDynamicLayer()})}renderDynamicLayer(){const e=this.scene.background;this.scene.background=null;try{this.renderLayer(zi)}finally{this.scene.background=e}}renderLayer(e){const t=this.cameraRig.camera.layers.mask;this.cameraRig.camera.layers.set(e);try{this.renderer.render(this.scene,this.cameraRig.camera)}finally{this.cameraRig.camera.layers.mask=t}}usesOnlyLayer(e,t){let n=!0;const s=1<<t;return e.traverse(r=>{r.layers.mask!==s&&(n=!1)}),n}addGeneratedEnvironment(){const e=new ho(this.renderer),t=new l_;this.environmentTarget=e.fromScene(t,.045,.1,100,{size:this.quality.environmentMapSize}),this.environmentTarget.texture.name="GeneratedArenaReflection",this.environmentTarget.texture.userData.generatedInCode=!0,this.scene.environment=this.environmentTarget.texture,this.scene.environmentIntensity=.58,t.dispose(),e.dispose()}addLighting(e){const t=new Sf(11065343,1582141,.68);t.layers.enable(Wn),this.scene.add(t);const n=new Hl(16775144,2.6);if(n.layers.enable(Wn),n.position.set(-4.5,9.5,-1.5),n.castShadow=e.shadowCastingKeyLight,n.shadow.mapSize.set(e.shadowMapSize,e.shadowMapSize),n.shadow.bias=-18e-5,n.shadow.normalBias=.025,n.shadow.camera.left=-11,n.shadow.camera.right=11,n.shadow.camera.top=15,n.shadow.camera.bottom=-6,n.shadow.camera.near=.5,n.shadow.camera.far=30,n.target.position.set(0,1,pt),this.scene.add(n.target),this.scene.add(n),e.name!=="balanced"){const s=new Hl(6994687,1.1);s.layers.enable(Wn),s.castShadow=!1,s.position.set(6,4.5,-2),s.target.position.set(0,1.3,5),this.scene.add(s.target,s)}if(e.name==="capture"){const s=new zl(3324159,28,18,Math.PI/5,.62,1.7);s.layers.enable(Wn),s.castShadow=!1,s.position.set(4.5,5.5,2),s.target.position.set(-.75,1.1,-.2),this.scene.add(s.target,s);const r=new zl(16760176,24,15,Math.PI/5,.65,1.8);r.layers.enable(Wn),r.castShadow=!1,r.position.set(-5,5.8,10.5),r.target.position.set(0,1.1,pt),this.scene.add(r.target,r)}}addCourt(){const e=this.materialLibrary.surface("court"),t=this.mesh(new Lt(20,28),new pi({color:553941,roughness:.5,metalness:.04,normalScale:new Ge(.18,.18),envMapIntensity:.68,...ji(e)}));t.rotation.x=-Math.PI/2,t.position.set(0,0,1),t.receiveShadow=!0,t.name="RegulationBlueCourt",this.scene.add(t);const n=this.mesh(new Lo(va,64,0,Math.PI),new Qt({color:480422,transparent:!0,opacity:.44,depthWrite:!1}));n.rotation.x=-Math.PI/2,n.position.set(0,.006,pt),n.name="SixMetreGoalArea",this.scene.add(n);const s=new Qt({color:16054527,toneMapped:!1});this.trackDisposables(s),this.addFloorRectangle(1,.065,0,pt-bc,s,"SevenMetrePenaltyLine"),this.addFloorRectangle(20,.055,0,pt,s,"GoalLine");for(const r of[-9.97,9.97])this.addFloorRectangle(.055,20,r,-3,s,"Sideline");this.addArc(va,!1,s),this.addArc(Ec,!0,s)}addArc(e,t,n){if(!t){const f=this.mesh(new Do(e-.035,e+.035,96,1,0,Math.PI),n);f.rotation.x=-Math.PI/2,f.position.set(0,.016,pt),f.name="SixMetreArc",this.scene.add(f);return}const s=25,r=Math.PI/(s*1.7),a=new ut(e*r,.028,.055),o=new Pt(a,n,s),l=new je,c=new L,h=new It,u=new L(1,1,1);for(let f=0;f<s;f+=1){const p=Math.PI+(f+.5)*Math.PI/s;c.set(Math.cos(p)*e,.022,pt+Math.sin(p)*e),h.setFromAxisAngle(new L(0,1,0),-p-Math.PI/2),l.compose(c,h,u),o.setMatrixAt(f,l)}o.instanceMatrix.needsUpdate=!0,o.name="InstancedNineMetreDashes",this.trackDisposables(a),this.scene.add(o)}addGoal(){const e=this.materialLibrary.surface("painted-metal"),t=new pi({color:16054527,roughness:.38,metalness:.22,envMapIntensity:.85,...ji(e)}),n=new pi({color:480472,roughness:.4,metalness:.2,envMapIntensity:.82,...ji(e)});this.trackDisposables(t,n);const s=new ut(1,1,1);this.trackDisposables(s);const r=new nn;r.name="RegulationThreeByTwoGoal";const a=[],o=[],l=new L,c=new It,h=new L,u=new je,f=(b,E,y,w,A)=>{l.set(E,y,pt),h.set(w,A,Ut),u.compose(l,c,h),(b==="blue"?a:o).push(u.clone())};for(const b of[-Jt/2-Ut/2,Jt/2+Ut/2])for(let E=0;E<6;E+=1)f(E%2===0?"blue":"white",b,(E+.5)*(_n+Ut)/6,Ut,(_n+Ut)/6);for(let b=0;b<9;b+=1)f(b%2===0?"blue":"white",-Jt/2-Ut+(b+.5)*(Jt+Ut*2)/9,_n+Ut/2,(Jt+Ut*2)/9,Ut);for(const[b,E,y]of[["Blue",n,a],["White",t,o]]){const w=new Pt(s,E,y.length);for(let A=0;A<y.length;A+=1){const P=y[A];P!==void 0&&w.setMatrixAt(A,P)}w.instanceMatrix.needsUpdate=!0,w.castShadow=!0,w.receiveShadow=!0,w.computeBoundingBox(),w.computeBoundingSphere(),w.name=`StripedGoal${b}Sections`,w.userData.sharedGoalStripeGeometry=!0,r.add(w)}const p=this.materialLibrary.surface("net"),g=new Qt({color:15267839,map:p.albedo,alphaMap:p.alpha,transparent:!0,opacity:.72,alphaTest:.18,depthWrite:!1,side:cn,toneMapped:!1}),_=pt+Ui;this.trackDisposables(g);const m=this.mesh(new Lt(Jt,_n),g);m.position.set(0,_n/2,_),m.name="ProceduralGoalNetBack",r.add(m);for(const b of[-Jt/2,Jt/2]){const E=this.mesh(new Lt(Ui,_n),g);E.rotation.y=Math.PI/2,E.position.set(b,_n/2,pt+Ui/2),E.name="ProceduralGoalNetSide",r.add(E)}const d=this.mesh(new Lt(Jt,Ui),g);return d.rotation.x=Math.PI/2,d.position.set(0,_n,pt+Ui/2),d.name="ProceduralGoalNetTop",r.add(d),this.scene.add(r),r}addArenaBackdrop(){const e=this.materialLibrary.surface("painted-metal"),t=this.materialLibrary.surface("fabric"),n=this.materialLibrary.surface("led-board"),s=new qn({color:1121067}),r=new qn({color:1714754}),a=new qn({color:2503751}),o=new qn({color:735085,map:t.albedo}),l=new pi({color:10467272,roughness:.38,metalness:.78,envMapIntensity:.9,...ji(e)});this.trackDisposables(s,r,a,o,l);const c=this.mesh(new ut(20.6,9.6,.35),s);c.position.set(0,4.8,15.4),c.receiveShadow=!0,c.name="ArenaEndWall",this.scene.add(c);for(const ae of[-10.2,10.2]){const Ae=this.mesh(new ut(.35,9.6,28),r);Ae.position.set(ae,4.8,1.5),Ae.receiveShadow=!0,Ae.name="ArenaSideWall",this.scene.add(Ae)}const h=this.mesh(new ut(20.7,.24,28),s);h.position.set(0,9.7,1.5),h.name="ArenaCeiling",this.scene.add(h);const u=new ut(18.4,.42,.88),f=8,p=new Pt(u,o,f),g=new je;for(let ae=0;ae<f;ae+=1)g.makeTranslation(0,.28+ae*.43,9.25+ae*.78),p.setMatrixAt(ae,g);p.instanceMatrix.needsUpdate=!0,p.receiveShadow=!0,p.name="SteepEuropeanStands",this.trackDisposables(u),this.scene.add(p);const _=new ut(.72,.08,.78);this.trackDisposables(_);const m=2*f,d=new Pt(_,a,m);let b=0;for(const ae of[-4.1,4.1])for(let Ae=0;Ae<f;Ae+=1)g.makeTranslation(ae,.53+Ae*.43,9.25+Ae*.78),d.setMatrixAt(b,g),b+=1;d.instanceMatrix.needsUpdate=!0,d.name="InstancedStandAisleSteps",this.scene.add(d);const E=new yn(.025,.025,18,6),y=new yn(.022,.022,.8,6);this.trackDisposables(E,y);const w=new Pt(E,l,2),A=new Pt(y,l,14),P=new It().setFromAxisAngle(new L(0,0,1),Math.PI/2),I=new L(1,1,1),M=new L;let v=0,C=0;for(const ae of[0,4]){const Ae=8.76+ae*.78,R=.8+ae*.43;M.set(0,R,Ae),g.compose(M,P,I),w.setMatrixAt(v,g),v+=1;for(const qe of[-8.5,-6,-3,0,3,6,8.5])g.makeTranslation(qe,R-.35,Ae),A.setMatrixAt(C,g),C+=1}w.instanceMatrix.needsUpdate=!0,w.name="InstancedStandRailings",A.instanceMatrix.needsUpdate=!0,A.name="InstancedStandRailingPosts",this.scene.add(w,A);const F=new qn({color:1516336}),z=new Qt({color:9109450,toneMapped:!1});this.trackDisposables(F,z);for(const ae of[-6.8,6.8]){const Ae=this.mesh(new ut(1.25,2.2,.18),F);Ae.position.set(ae,1.15,15.14),Ae.name="ArenaExit",this.scene.add(Ae);const R=this.mesh(new ut(.86,.22,.08),z);R.position.set(ae,2.48,14.92),R.name="ExitLuminaire",this.scene.add(R)}const X=new Qt({color:408977,map:n.albedo,toneMapped:!1});this.trackDisposables(X);const V=["NOVA AEGIS","AURORA FORUM","VOLT UNION","SPIEL MIT HERZ"],G=[-6.8,-4.1,4.1,6.8];for(let ae=0;ae<G.length;ae+=1){const Ae=G[ae],R=V[ae];if(Ae===void 0||R===void 0)continue;const qe=this.mesh(new ut(2.35,.72,.12),X);qe.position.set(Ae,.55,8.48),qe.name="FictionalLedBoard",this.scene.add(qe);const Le=this.materialLibrary.createTextPanelTexture(R,{width:768,height:192,background:"#05275f",foreground:"#f4fbff",accent:ae%2===0?"#27c8ff":"#5d91ff",fontPixels:R.length>16?54:66}),Te=new Qt({color:16777215,map:Le,toneMapped:!1});this.trackDisposables(Te);const pe=this.mesh(new Lt(2.14,.5),Te);pe.position.set(Ae,.55,8.415),pe.rotation.y=Math.PI,pe.name="GeneratedLedMessage",this.scene.add(pe)}this.addFictionalBanner(-4.15,5.25,14.98,"ENSEMBLE, PLUS FORTS","#0a4cac","#f3f7ff"),this.addFictionalBanner(0,5.55,14.98,"JUNTOS HACIA EL GOL","#123b86","#47cfff"),this.addFictionalBanner(4.15,5.25,14.98,"GEMEINSAM STARK","#0a4cac","#f3f7ff");const $=new ut(19.4,.13,.13),B=new ut(.1,.1,2.1),ie=new ut(1.25,.08,.42);this.trackDisposables($,B,ie);const re=new Qt({color:16317439,toneMapped:!1});this.trackDisposables(re);const _e=[-.5,5,10.5],Ie=new Pt($,l,_e.length),He=new Pt(B,l,_e.length*7),Xe=new Pt(ie,re,_e.length*4);let Oe=0,j=0,K=0;for(const ae of _e){g.makeTranslation(0,8.65,ae),Ie.setMatrixAt(Oe,g),Oe+=1;for(const Ae of[-7.5,-5,-2.5,0,2.5,5,7.5])g.makeTranslation(Ae,8.65,ae),He.setMatrixAt(j,g),j+=1;for(const Ae of[-6,-2,2,6])g.makeTranslation(Ae,8.5,ae),Xe.setMatrixAt(K,g),K+=1}Ie.instanceMatrix.needsUpdate=!0,Ie.name="InstancedArenaRoofTrusses",He.instanceMatrix.needsUpdate=!0,He.name="InstancedArenaTrussCrossMembers",Xe.instanceMatrix.needsUpdate=!0,Xe.name="InstancedSportsHallLuminaires",this.scene.add(Ie,He,Xe);const le=new ut(3.1,1.15,.12);this.trackDisposables(le);const Me=[-7.2,-3.6,0,3.6,7.2],de=new Pt(le,r,Me.length);for(let ae=0;ae<Me.length;ae+=1)g.makeTranslation(Me[ae]??0,7.15,15.05),de.setMatrixAt(ae,g);de.instanceMatrix.needsUpdate=!0,de.name="InstancedAcousticWallPanels",this.scene.add(de)}addFictionalBanner(e,t,n,s,r,a){const o=this.materialLibrary.createTextPanelTexture(s,{width:1024,height:320,background:r,foreground:"#f6f9ff",accent:a,fontPixels:s.length>18?74:88}),l=new qn({color:16777215,map:o});this.trackDisposables(l);const c=this.mesh(new Lt(3.45,1.05),l);c.position.set(e,t,n),c.rotation.y=Math.PI,c.name="FictionalEuropeanBanner",this.scene.add(c)}addContactShadows(){const e=this.materialLibrary.createContactShadowTexture(),t=new Qt({color:132362,map:e,transparent:!0,opacity:.44,depthWrite:!1,toneMapped:!1});this.trackDisposables(t);const n=this.mesh(new Lt(1.15,.72),t);n.rotation.x=-Math.PI/2,n.position.set(-.78,.021,-.38),n.renderOrder=2,n.name="ShooterGeneratedContactShadow",this.scene.add(n);const s=this.mesh(new Lt(1.28,.66),t);s.rotation.x=-Math.PI/2,s.position.set(0,.021,pt-.08),s.renderOrder=2,s.name="GoalkeeperGeneratedContactShadow",this.scene.add(s);const r=this.mesh(new Lt(3.6,.82),t);return r.rotation.x=-Math.PI/2,r.position.set(0,.02,pt+.18),r.scale.y=.74,r.renderOrder=2,r.name="GoalGeneratedContactShadow",this.scene.add(r),s}addFloorRectangle(e,t,n,s,r,a){const o=this.mesh(new Lt(e,t),r);o.rotation.x=-Math.PI/2,o.position.set(n,.018,s),o.name=a,this.scene.add(o)}shaderProgramCount(){return this.renderer.info.programs?.length??0}rendererDiagnostics(){const e=this.renderer.getContext(),t=e.getExtension("WEBGL_debug_renderer_info"),n=String(t===null?e.getParameter(e.RENDERER):e.getParameter(t.UNMASKED_RENDERER_WEBGL)),s=String(t===null?e.getParameter(e.VENDOR):e.getParameter(t.UNMASKED_VENDOR_WEBGL)),r=String(e.getParameter(e.VERSION)),a=`${n} ${s}`.toLowerCase(),o=["swiftshader","llvmpipe","softpipe","software rasterizer","microsoft basic render"],l=["webkit webgl","mozilla","generic renderer"],c=o.some(h=>a.includes(h))?"software":n.trim().length===0||n.toLowerCase()==="unknown"||l.some(h=>a.includes(h))?"unknown":"hardware";return Object.freeze({acceleration:c,renderer:n,vendor:s,version:r})}mesh(e,t){return this.trackDisposables(e,t),new ht(e,t)}trackDisposables(...e){for(const t of e)this.disposables.add(t)}}const Tc=Object.freeze({GOAL:Object.freeze({title:"GOAL",detail:"Net ignited"}),SAVED:Object.freeze({title:"SAVED",detail:"Keeper shield"}),MISS:Object.freeze({title:"MISS",detail:"Outside the frame"})});class V_{constructor(e,t){this.root=e,this.options=t,this.audioEnabled=t.audioEnabled,this.reducedMotion=t.reducedMotion,e.innerHTML=`
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
    `,this.canvas=this.required("#game-canvas"),this.round=this.required("#hud-round"),this.score=this.required("#hud-score"),this.result=this.required("#hud-result"),this.resultDetail=this.required("#hud-result-detail"),this.powerFill=this.required("#hud-power-fill"),this.powerValue=this.required("#hud-power-value"),this.technique=this.required("#hud-technique-value"),this.hint=this.required("#input-hint"),this.summary=this.required("#round-summary"),this.summaryTitle=this.required("#summary-title"),this.summaryText=this.required("#summary-text"),this.restartButton=this.required("#restart-round"),this.audioButton=this.required("#toggle-audio"),this.motionButton=this.required("#toggle-motion"),this.trail=this.required(".swipe-trail"),this.trailGlow=this.required(".swipe-trail .swipe-glow"),this.trailCore=this.required(".swipe-trail .swipe-core"),this.trailTip=this.required(".swipe-trail .swipe-tip"),this.status=this.required("#app-status"),this.outcomeDots=Array.from(this.required("#hud-progress").querySelectorAll("span")),this.restartButton.addEventListener("click",this.onRestart),this.audioButton.addEventListener("click",this.onAudioToggle),this.motionButton.addEventListener("click",this.onMotionToggle),this.setAudioEnabled(this.audioEnabled),this.setReducedMotion(this.reducedMotion)}root;canvas;round;score;result;resultDetail;powerFill;powerValue;technique;hint;summary;summaryTitle;summaryText;restartButton;audioButton;motionButton;trail;trailGlow;trailCore;trailTip;status;outcomeDots;options;audioEnabled;reducedMotion;lastPresentedOutcome=null;outcomePresentations={GOAL:0,SAVED:0,MISS:0};rejectedGesturePresentations=0;techniqueCategory="DIRECT";feintState=null;feintApparentDirection=null;trailVisible=!1;trailViewportWidth=0;trailViewportHeight=0;update(e,t,n,s,r,a,o){const l=Math.min(e.shotsTaken+1,5);if(this.round.textContent=e.phase==="ROUND_COMPLETE"?"Complete":`Shot ${l}`,this.score.textContent=`${e.goals} : ${e.saves+e.misses}`,this.updateProgress(r),this.setTechnique(n,o),e.lastOutcome!==null){const u=Tc[e.lastOutcome];this.result.textContent=u.title,this.resultDetail.textContent=u.detail}else e.phase==="SHOT_ACTIVE"?(this.result.textContent="IN FLIGHT",this.resultDetail.textContent="Standard release"):s?(this.result.textContent="READY",this.resultDetail.textContent="Read the keeper"):(this.result.textContent="LOCKED",this.resultDetail.textContent="Arena resetting");this.result.dataset.outcome=e.lastOutcome??"",this.root.dataset.matchPhase=e.phase,this.root.dataset.inputEnabled=String(s),this.root.dataset.lastOutcome=e.lastOutcome??"";const c=Math.round(t*100);this.powerValue.textContent=`${c}%`,this.powerFill.style.setProperty("--power-percent",`${c}%`),this.hint.hidden=e.shotsTaken>0||e.phase!=="READY";const h=e.phase==="ROUND_COMPLETE"&&a;this.summary.hidden=!h,this.restartButton.disabled=!h,h&&(this.summaryTitle.textContent=e.goals>=3?"Nova Aegis takes it":"Volt Union holds firm",this.summaryText.textContent=`${e.goals} goals · ${e.saves} saved · ${e.misses} wide`)}presentShot(e,t,n=!1){this.setTechnique(t,n?"released":null),this.root.dataset.feedback="release",this.powerFill.dataset.charged=e>=.78?"true":"false",this.trailGlow.classList.add("is-committed"),this.trailCore.classList.add("is-committed"),this.setStatus(`${n?"FEINT into ":""}${t} shot released at ${Math.round(e*100)} percent power.`)}presentFeint(e){this.feintApparentDirection=e.apparentDirection,this.setTechnique(this.techniqueCategory,"pending"),this.setStatus("FEINT recognized. Lift your finger to finish the fake, then start a new gesture to shoot.")}clearFeint(e){this.feintApparentDirection=null,this.setTechnique(e,null)}presentOutcome(e){this.lastPresentedOutcome=e,this.outcomePresentations[e]+=1,this.root.dataset.feedback=e.toLowerCase(),this.result.classList.remove("is-impact"),this.reducedMotion||(this.result.offsetWidth,this.result.classList.add("is-impact"));const t=Tc[e];this.setStatus(`${t.title}. ${t.detail}.`)}presentRejectedGesture(e){this.rejectedGesturePresentations+=1,this.root.dataset.feedback="rejected",this.setStatus(`Swipe rejected (${e}). Start low and swipe upward.`)}resetRoundFeedback(){this.lastPresentedOutcome=null,this.outcomePresentations.GOAL=0,this.outcomePresentations.SAVED=0,this.outcomePresentations.MISS=0,this.rejectedGesturePresentations=0,this.feintApparentDirection=null,this.setTechnique("DIRECT",null),this.result.classList.remove("is-impact"),this.powerFill.dataset.charged="false",this.root.dataset.feedback="ready"}setStatus(e){this.status.textContent=e}setAudioEnabled(e){this.audioEnabled=e,this.audioButton.setAttribute("aria-pressed",String(e)),this.audioButton.setAttribute("aria-label",e?"Mute synthesized audio":"Enable synthesized audio"),this.audioButton.dataset.enabled=String(e),this.audioButton.querySelector(".toggle-label")?.replaceChildren(document.createTextNode(e?"Audio on":"Audio off")),this.root.dataset.audioEnabled=String(e)}setReducedMotion(e){this.reducedMotion=e,this.motionButton.setAttribute("aria-pressed",String(e)),this.motionButton.setAttribute("aria-label",e?"Enable full motion":"Reduce motion"),this.motionButton.dataset.enabled=String(!e),this.motionButton.querySelector(".toggle-label")?.replaceChildren(document.createTextNode(e?"Motion low":"Motion full")),this.root.dataset.reducedMotion=String(e)}setTrail(e,t){if(e.length<2){this.trailVisible&&this.clearTrail();return}(this.trailViewportWidth!==t.widthPixels||this.trailViewportHeight!==t.heightPixels)&&(this.trail.setAttribute("viewBox",`0 0 ${t.widthPixels} ${t.heightPixels}`),this.trailViewportWidth=t.widthPixels,this.trailViewportHeight=t.heightPixels);const n=e.map(r=>`${r.x},${r.y}`).join(" ");this.trailGlow.setAttribute("points",n),this.trailCore.setAttribute("points",n),this.trailGlow.classList.remove("is-committed"),this.trailCore.classList.remove("is-committed"),this.trailVisible||(this.trailVisible=!0,this.trail.classList.add("is-active"),this.trailGlow.classList.add("is-visible"),this.trailCore.classList.add("is-visible"),this.trailTip.classList.add("is-visible"));const s=e.at(-1);s!==void 0&&(this.trailTip.setAttribute("cx",String(s.x)),this.trailTip.setAttribute("cy",String(s.y)))}clearTrail(){this.trailVisible&&(this.trailVisible=!1,this.trail.classList.remove("is-active"),this.trailGlow.setAttribute("points",""),this.trailCore.setAttribute("points",""),this.trailGlow.classList.remove("is-visible","is-committed"),this.trailCore.classList.remove("is-visible","is-committed"),this.trailTip.classList.remove("is-visible"))}diagnostics(){return Object.freeze({audioEnabled:this.audioEnabled,reducedMotion:this.reducedMotion,firstShotInstructionVisible:!this.hint.hidden,roundCompleteVisible:!this.summary.hidden,lastPresentedOutcome:this.lastPresentedOutcome,outcomePresentations:Object.freeze({...this.outcomePresentations}),rejectedGesturePresentations:this.rejectedGesturePresentations,techniqueCategory:this.techniqueCategory,techniqueLabel:this.technique.textContent??this.techniqueCategory,feintState:this.feintState,feintApparentDirection:this.feintApparentDirection,safeAreaPanels:Object.freeze(Array.from(this.root.querySelectorAll("[data-safe-zone]"),e=>e.dataset.safeZone??"").filter(e=>e.length>0)),fictionalHomeTeam:"NOVA AEGIS",fictionalAwayTeam:"VOLT UNION",fictionalArena:"AURORA FORUM"})}dispose(){this.restartButton.removeEventListener("click",this.onRestart),this.audioButton.removeEventListener("click",this.onAudioToggle),this.motionButton.removeEventListener("click",this.onMotionToggle),this.root.replaceChildren()}setTechnique(e,t){this.techniqueCategory=e,this.feintState=t,t===null&&(this.feintApparentDirection=null),this.technique.textContent=t==="pending"?"FEINT":t==="released"?`FEINT → ${e}`:e,this.root.dataset.shotCategory=e,this.root.dataset.feintState=t??"",this.feintApparentDirection===null?(delete this.root.dataset.feintApparentX,delete this.root.dataset.feintApparentY):(this.root.dataset.feintApparentX=String(this.feintApparentDirection.x),this.root.dataset.feintApparentY=String(this.feintApparentDirection.y))}updateProgress(e){for(let n=0;n<this.outcomeDots.length;n+=1){const s=this.outcomeDots[n];if(s===void 0)continue;const r=e[n]??null;s.dataset.outcome=r??"",s.classList.toggle("is-complete",r!==null)}this.required("#hud-progress").setAttribute("aria-label",e.length===0?"No shots taken":e.map((n,s)=>`Shot ${s+1}: ${n}`).join(", "))}onRestart=()=>{this.options.onRestart()};onAudioToggle=()=>{this.options.onAudioChanged(!this.audioEnabled)};onMotionToggle=()=>{this.options.onReducedMotionChanged(!this.reducedMotion)};required(e){const t=this.root.querySelector(e);if(t===null)throw new Error(`Required HUD element '${e}' is missing.`);return t}}const wt=i=>JSON.parse(JSON.stringify(i));class W_{constructor(e,t,n=40,s=2048){this.config=e,this.session=t,this.maxAttempts=n,this.maxSamples=s}config;session;maxAttempts;maxSamples;metadata={intendedTechnique:"UNLABELLED",partition:"UNASSIGNED"};attempts=[];current=null;shot=null;nextId=1;droppedAttempts=0;start(e){this.attempts.length>=this.maxAttempts&&(this.attempts.shift(),this.droppedAttempts++),this.current={id:this.nextId++,metadata:wt(this.metadata),context:wt(e),samples:[],truncated:!1,inputComplete:!1,viewport:wt(e.viewport),gesture:null,reason:null,release:null,result:null,reset:null,action:null,events:[]},this.attempts.push(this.current)}sample(e){if(this.current){if(this.current.samples.length>=this.maxSamples){this.current.truncated=!0;return}this.current.samples.push(wt(e))}}movement(){const e=this.current?.samples.at(-1);e&&(e.feintCheck=!0)}finish(e,t,n){this.current&&(Object.assign(this.current,{viewport:wt(e),gesture:wt(t&&this.current.truncated?{...t,rawPoints:[],smoothedPoints:[],resampledPoints:[]}:t),reason:n,inputComplete:!0}),t&&(this.current.action=t.feint!==null?"FEINT":"SHOT",t.feint===null&&(this.shot=this.current)),this.current=null)}actionEvent(e,t,n){const s=this.current??this.attempts.at(-1);s&&(s.events.length<4096?s.events.push(wt({type:e,simulationSeconds:t,keeper:n})):s.truncated=!0)}keeperStep(e,t){this.actionEvent("KEEPER_STEP",e,t)}release(e){this.shot&&(this.shot.release=wt(e))}result(e){this.shot&&(this.shot.result=wt(e))}reset(e){this.actionEvent("RESET",e.simulationSeconds,null),this.shot&&(this.shot.reset=wt(e)),this.shot=null}export(){return{schema:"handball-gesture-trace-v2",confidence:"No calibrated classifier confidence is exposed",sourceBinding:"Supervisor candidate manifest; runtime does not assert Git identity",config:wt(this.config),session:wt(this.session),limits:{maxAttempts:this.maxAttempts,maxSamples:this.maxSamples},droppedAttempts:this.droppedAttempts,attempts:this.attempts.map(e=>{const t=e.samples[0]?.sample.timeSeconds??0;return{...wt(e),timestampOriginSeconds:t,replayable:e.inputComplete&&!e.truncated,lifecycleComplete:e.reason!==null||e.action==="FEINT"||e.result!==null&&e.reset!==null,samples:e.samples.map(n=>({...wt(n),sample:{...wt(n.sample),timeSeconds:n.sample.timeSeconds-t},parentTimeSeconds:n.parentTimeSeconds-t}))}})}}}const Ma=1/60,X_=1/20;class q_{constructor(e,t={}){if(this.root=e,this.quality=t.quality??"balanced",this.sessionSeed=(t.seed??7999950)>>>0,this.manualTime=t.manualTime??!1,this.trace=t.recordGestures?new W_(Wo,{seed:this.sessionSeed,fixedStepSeconds:Ma,goal:Ct,goalkeeper:kt,trajectory:Is,flight:Xo,releasePosition:Os}):void 0,this.quality==="capture"&&!this.manualTime)throw new Error("The capture quality preset is restricted to fixed-frame capture mode.");this.qualityConfig=Ch(this.quality),this.keeperController=this.createKeeperController(),this.reducedMotion=window.matchMedia("(prefers-reduced-motion: reduce)").matches,this.audio=this.resources.track(new bh({enabled:this.audioEnabled,outputEnabled:!this.manualTime})),this.hud=new V_(e,{onRestart:()=>this.restart(),onAudioChanged:n=>this.setAudioEnabled(n),onReducedMotionChanged:n=>this.setReducedMotion(n),audioEnabled:this.audioEnabled,reducedMotion:this.reducedMotion}),this.scene=this.resources.track(new G_(this.hud.canvas,this.qualityConfig)),this.scene.setReducedMotion(this.reducedMotion),this.input=this.resources.track(new Ou(this.hud.canvas,Wo,{onAccepted:n=>this.acceptGesture(n),onFeintCompleted:n=>{this.keeperController.completeFeint(),this.completedFeints++,this.holdingAfterFeint=!0,this.hud.setStatus("FEINT completed. Ball held. Start a new gesture to shoot."),this.feintVisualUntil=this.engine.simulationSeconds+.3,this.feintVisualDirection=n.gesture.feint?.apparentDirection.x??0,this.hud.clearTrail(),this.trace?.actionEvent("FEINT_COMPLETED",this.engine.simulationSeconds,this.keeperController.diagnostics())},onGestureStarted:()=>{this.trace?.actionEvent("GESTURE_START",this.engine.simulationSeconds,null),this.keeperController.queueGestureStart()},onGoalkeeperObservation:n=>{this.trace?.actionEvent("OBSERVATION",this.engine.simulationSeconds,n),this.keeperController.queueObservation(n)},onFeintChanged:n=>this.handleFeintChanged(n),onRejected:n=>{this.trace?.actionEvent("CANCEL",this.engine.simulationSeconds,null),this.keeperController.cancelGesture(),this.rejectedGestures+=1,this.lastGestureRejectionReason=n,this.hud.presentRejectedGesture(n)},onTrailChanged:(n,s)=>{this.hud.setTrail(n,s)}},this.trace)),this.input.setEnabled(!1),this.engine=this.resources.track(new wh({fixedStepSeconds:Ma,manualPumping:this.manualTime,onFixedUpdate:(n,s)=>{this.fixedUpdate(n,s)},onPresent:()=>{this.scene.render()}})),this.resources.add(this.events.on("shotReleased",n=>{this.scene.beginShotFeedback(Os,n.power,n.simulationSeconds),this.hud.presentShot(n.power,n.category,n.feint!==null),this.audio.shotReleased(n.power,n.durationSeconds)})),this.resources.add(this.events.on("outcome",n=>{this.scene.resolveShotFeedback(n.outcome,n.target,n.simulationSeconds),this.hud.presentOutcome(n.outcome),this.audio.outcome(n.outcome)})),this.bindResizeListener(),this.resources.add(()=>this.unbindResizeListener()),this.resources.add(()=>{this.events.clear()}),e.dataset.quality=this.quality,e.dataset.runtimeMode=this.manualTime?"capture":"gameplay",e.dataset.appState=this.state,e.dataset.acceptedShots="0",e.dataset.resolvedShots="0",this.resize(),this.forceReadyVisuals(0),this.updateHud()}root;bootStartedAtMilliseconds=performance.now();events=new Ah;resources=new Lh;quality;qualityConfig;sessionSeed;manualTime;audio;hud;scene;input;engine;trace;keeperController;match=Lc();activeShot=null;outcomeHistory=[];state="created";acceptedShots=0;resolvedShots=0;rejectedGestures=0;lastGestureRejectionReason=null;lastPointerType=null;pendingFeint=null;completedFeints=0;feintVisualUntil=0;holdingAfterFeint=!1;feintVisualDirection=0;displayedPower=0;displayedCategory="DIRECT";resizeListenerAttached=!1;bootTimeMilliseconds=0;inputActivatedAfterPrewarm=!1;audioEnabled=!0;reducedMotion=!1;roundSummaryVisible=!1;nextReadyPresentationSeconds=0;presentedReadyKeeperPhase=null;presentedReadyKeeperDestination=null;async start(){if(this.state!=="created")throw new Error(`Cannot start app from '${this.state}' state.`);this.state="running",this.root.dataset.appState="warming",this.events.emit("lifecycle",{state:this.state}),this.hud.setStatus("Preparing arena materials and lights…"),await this.scene.prewarm(),!this.hasBeenDisposed()&&(this.engine.start(),this.bootTimeMilliseconds=performance.now()-this.bootStartedAtMilliseconds,this.inputActivatedAfterPrewarm=!0,this.root.dataset.appState="ready",this.setInputEnabled(!0),this.hud.setStatus("Court ready. Swipe upward to shoot."))}snapshot(){const e=this.activeShot===null?null:Object.freeze({target:this.activeShot.target,category:this.activeShot.category,feint:this.activeShot.feint,power:this.activeShot.power,elapsedSeconds:this.activeShot.ball.elapsedSeconds,durationSeconds:this.activeShot.ball.durationSeconds,keeperZone:this.activeShot.keeperZone,resolved:this.activeShot.ball.terminalState!==null,ball:Object.freeze({position:Xn(this.activeShot.ball.position),previousPosition:Xn(this.activeShot.ball.previousPosition),velocity:Xn(this.activeShot.ball.velocity),initialVelocity:Xn(this.activeShot.ball.initialVelocity),releasePower:this.activeShot.ball.releasePower,releaseLoft:this.activeShot.ball.releaseLoft,releaseSideSpin:this.activeShot.ball.releaseSideSpin,releaseTopSpin:this.activeShot.ball.releaseTopSpin,releaseBounceIntent:this.activeShot.ball.releaseBounceIntent,launchLiftMeters:this.activeShot.ball.launchLiftMeters,sideSpinAccelerationMetersPerSecondSquared:this.activeShot.ball.sideSpinAccelerationMetersPerSecondSquared,topSpinDropAccelerationMetersPerSecondSquared:this.activeShot.ball.topSpinDropAccelerationMetersPerSecondSquared,releaseSpeedMetersPerSecond:this.activeShot.ball.releaseSpeedMetersPerSecond,gravityMetersPerSecondSquared:this.activeShot.ball.gravityMetersPerSecondSquared,groundRestitution:this.activeShot.ball.groundRestitution,minimumGroundReboundSpeedMetersPerSecond:this.activeShot.ball.minimumGroundReboundSpeedMetersPerSecond,maximumGroundBounces:this.activeShot.ball.maximumGroundBounces,groundBounceCount:this.activeShot.ball.groundBounceCount,elapsedSeconds:this.activeShot.ball.elapsedSeconds,contactHistory:Object.freeze(this.activeShot.ball.contactHistory.map(t=>Object.freeze({...t,position:Xn(t.position),...t.normal===void 0?{}:{normal:Xn(t.normal)},...t.incomingVelocity===void 0?{}:{incomingVelocity:Xn(t.incomingVelocity)},...t.outgoingVelocity===void 0?{}:{outgoingVelocity:Xn(t.outgoingVelocity)}}))),terminalState:this.activeShot.ball.terminalState})});return Object.freeze({state:this.state,quality:this.quality,simulationSeconds:this.engine.simulationSeconds,sessionSeed:this.sessionSeed,inputEnabled:this.isInputEnabled(),acceptedShots:this.acceptedShots,resolvedShots:this.resolvedShots,rejectedGestures:this.rejectedGestures,lastGestureRejectionReason:this.lastGestureRejectionReason,resizeListenerCount:this.resizeListenerAttached?1:0,outcomes:Object.freeze([...this.outcomeHistory]),lastPointerType:this.lastPointerType,actionPhase:this.activeShot!==null?this.activeShot.ball.terminalState===null?"SHOT_IN_PROGRESS":"RESOLUTION":this.pendingFeint!==null?"FEINT_IN_PROGRESS":this.keeperController.diagnostics().feintAgeSeconds!==null?"READY_FOR_SHOT":"READY",completedFeints:this.completedFeints,pendingFeint:this.pendingFeint,gestureInput:this.input.diagnostics(),goalkeeper:this.keeperController.diagnostics(),match:this.match,activeShot:e,feedback:Object.freeze({audio:this.audio.diagnostics(),hud:this.hud.diagnostics()}),scene:this.scene.diagnostics()})}performanceSnapshot(){const e=this.scene.diagnostics();return Object.freeze({quality:this.quality,runtimeMode:this.manualTime?"capture":"gameplay",selectedQuality:this.qualityConfig,bootTimeMilliseconds:this.bootTimeMilliseconds,inputActivatedAfterPrewarm:this.inputActivatedAfterPrewarm,prewarmComplete:e.prewarmComplete,drawCalls:e.renderCalls,triangles:e.renderedTriangles,shaderPrograms:e.shaderPrograms,prewarmedShaderPrograms:e.prewarmedShaderPrograms,shaderProgramsStableSincePrewarm:e.shaderProgramsStableSincePrewarm,appliedPixelRatio:e.appliedPixelRatio,maximumPixelRatio:e.maximumPixelRatio,crowdInstances:e.crowd.totalInstances,animatedCrowdInstances:e.crowd.animatedInstances,renderer:e.renderer,measuredShot:e.performance})}exportGestureTrace(){return this.trace?.export()??null}setTraceMetadata(e,t){this.trace&&(this.trace.metadata={intendedTechnique:e.slice(0,80),partition:t.slice(0,40)})}restart(){this.match.phase==="ROUND_COMPLETE"&&(this.trace?.actionEvent("ROUND_RESTART",this.engine.simulationSeconds,null),this.match=Xh(),this.keeperController=this.createKeeperController(),this.activeShot=null,this.acceptedShots=0,this.resolvedShots=0,this.rejectedGestures=0,this.lastGestureRejectionReason=null,this.outcomeHistory=[],this.lastPointerType=null,this.pendingFeint=null,this.completedFeints=0,this.feintVisualUntil=0,this.holdingAfterFeint=!1,this.displayedPower=0,this.displayedCategory="DIRECT",this.roundSummaryVisible=!1,this.hud.clearTrail(),this.hud.resetRoundFeedback(),this.scene.resetFeedback(),this.forceReadyVisuals(this.engine.simulationSeconds),this.setInputEnabled(!0),this.audio.uiConfirm(),this.hud.setStatus("New round ready."))}pumpFrames(e){this.engine.pumpFrames(e)}presentFrames(e){this.engine.presentFrames(e)}applyCaptureScene(e){if(!this.manualTime)throw new Error("Capture scenes require the manual capture clock.");const t=Uh(e);if(t.seed!==this.sessionSeed)throw new Error(`Capture scene '${e}' requires seed ${t.seed}, received ${this.sessionSeed}.`);if(t.quality!==this.quality)throw new Error(`Capture scene '${e}' requires '${t.quality}' quality, received '${this.quality}'.`);const n=this.hud.canvas.getBoundingClientRect();if(Math.round(n.width)!==t.viewport.width||Math.round(n.height)!==t.viewport.height)throw new Error(`Capture scene '${e}' requires ${t.viewport.width}x${t.viewport.height}, received ${Math.round(n.width)}x${Math.round(n.height)}.`);if(t.requirement==="READY"&&this.match.phase!=="READY")throw new Error(`Capture scene '${e}' requires a ready match.`);if(t.requirement==="ACTIVE_SHOT"){const r=this.activeShot;if(r===null||r.ball.terminalState!==null)throw new Error(`Capture scene '${e}' requires a real accepted active shot.`);const a=t.targetShotFrame;if(a===null)throw new Error(`Capture scene '${e}' has no target shot frame.`);const o=Math.round(r.ball.elapsedSeconds/Ma);if(o>a)throw new Error(`Capture scene '${e}' passed its deterministic frame (${o} > ${a}).`);this.pumpFrames(a-o)}if(t.expectedKeeperZone!==null&&this.activeShot?.keeperZone!==t.expectedKeeperZone)throw new Error(`Capture scene '${e}' requires goalkeeper zone '${t.expectedKeeperZone}', received '${this.activeShot?.keeperZone??"none"}'.`);if(t.requirement==="RESULT"){if(this.activeShot===null||this.activeShot.ball.terminalState===null||this.match.lastOutcome!==t.expectedOutcome)throw new Error(`Capture scene '${e}' requires a real '${t.expectedOutcome}' result.`);this.pumpFrames(1)}if(t.requirement==="ROUND_COMPLETE"&&this.match.phase!=="ROUND_COMPLETE")throw new Error(`Capture scene '${e}' requires a completed round.`);if(t.requirement==="ROUND_COMPLETE"){for(let r=0;r<90&&!this.roundSummaryVisible;r+=1)this.pumpFrames(1);if(!this.roundSummaryVisible)throw new Error(`Capture scene '${e}' did not reach the real round summary.`)}this.presentFrames(2);const s=this.snapshot();if(!s.scene.finiteTransforms||s.scene.cameraCount!==1||s.resizeListenerCount!==1||!s.scene.goalCentered||!s.scene.shooterLeftForeground||s.scene.renderCalls<1||s.scene.renderedTriangles<1)throw new Error(`Capture scene '${e}' failed framing diagnostics: ${JSON.stringify(s.scene)}.`);if(t.requirement==="ACTIVE_SHOT"&&(!s.scene.ballProjection.visible||s.scene.ballPathPointCount<2))throw new Error(`Capture scene '${e}' does not show the real ball flight path.`);return s}dispose(){this.state!=="disposed"&&(this.state="disposed",this.keeperController.reset(),this.root.dataset.appState=this.state,this.events.emit("lifecycle",{state:this.state}),this.resources.dispose(),this.hud.dispose())}acceptGesture(e){if(this.lastGestureRejectionReason=null,!this.isInputEnabled())return;const t=e.gesture;this.holdingAfterFeint=!1;const n=qh(t.aim.horizontalAim,t.aim.verticalAim,Ct),s=Qh(Os,n,t.power,Is,Xo,t.loft,t.sideSpin,t.topSpin,t.bounceIntent),r=this.keeperController.preReleasePosition(Ct.center),a=this.keeperController.releaseGesture();this.trace?.actionEvent("SHOT_RELEASED",this.engine.simulationSeconds,this.keeperController.diagnostics()),this.trace?.release({target:n,initialPosition:{...s.position},initialVelocity:s.initialVelocity,ball:s,keeperZone:a,keeperStart:r,keeper:this.keeperController.diagnostics(),shotNumber:this.match.shotsTaken+1,simulationSeconds:this.engine.simulationSeconds}),this.match=Gh(this.match),this.activeShot={category:t.category,feint:t.feint,power:t.power,target:n,keeperZone:a,keeperStart:r,ball:s,keeperTerminalPosition:null,resultElapsedSeconds:0},this.acceptedShots+=1,this.scene.beginShotMeasurement(),this.lastPointerType=e.pointerType,this.displayedPower=t.power,this.displayedCategory=t.category,this.hud.clearTrail(),this.root.dataset.acceptedShots=String(this.acceptedShots),this.setInputEnabled(!1),this.events.emit("shotReleased",{category:t.category,feint:t.feint,power:t.power,durationSeconds:s.durationSeconds,shotNumber:this.match.shotsTaken+1,simulationSeconds:this.engine.simulationSeconds}),this.applyShotVisuals(this.activeShot,this.engine.simulationSeconds)}handleFeintChanged(e){this.pendingFeint=e,e!==null?(this.trace?.actionEvent("FEINT_START",this.engine.simulationSeconds,this.keeperController.diagnostics()),this.hud.presentFeint(e)):this.activeShot===null&&this.hud.clearFeint(this.displayedCategory)}fixedUpdate(e,t){const n=this.activeShot;if(n===null){this.keeperController.advance(e),this.trace?.keeperStep(t,this.keeperController.diagnostics()),this.updateReadyVisuals(t);return}if(n.ball.terminalState===null){const s=Ns(n.keeperZone,Ct.center,kt,n.ball.elapsedSeconds,n.keeperStart),r=Ns(n.keeperZone,Ct.center,kt,n.ball.elapsedSeconds+e,n.keeperStart),a=nu(n.ball,e,Ct,kt,{previousPosition:s,currentPosition:r});this.trace?.actionEvent("FLIGHT_STEP",t,{position:n.ball.position,velocity:n.ball.velocity,elapsedSeconds:n.ball.elapsedSeconds,contacts:n.ball.contactHistory.length,terminalState:n.ball.terminalState}),this.applyShotVisuals(n,t),a!==null&&this.resolveActiveShot(n);return}n.resultElapsedSeconds+=e,this.applyResultVisuals(n,t),!(n.resultElapsedSeconds+Number.EPSILON<Is.resetDelaySeconds)&&(this.trace?.reset({simulationSeconds:t,nextShotReady:this.match.phase==="RESULT",roundComplete:this.match.phase==="ROUND_COMPLETE"}),this.activeShot=null,this.keeperController.reset(),this.scene.finishShotMeasurement(),this.scene.resetFeedback(),this.displayedPower=0,this.hud.clearTrail(),this.forceReadyVisuals(t),this.match.phase==="RESULT"?(this.match=Wh(this.match),this.setInputEnabled(!0),this.hud.setStatus("Ready for the next shot.")):(this.roundSummaryVisible=!0,this.setInputEnabled(!1),this.hud.setStatus("Round complete. Review the result and restart.")))}resolveActiveShot(e){const t=e.ball.terminalState;if(t===null)throw new Error("Cannot resolve a shot before a physical contact.");e.keeperTerminalPosition===null&&(e.keeperTerminalPosition=Ns(e.keeperZone,Ct.center,kt,e.ball.elapsedSeconds,e.keeperStart),e.resultElapsedSeconds=0,this.match=Vh(this.match,t,yh),this.resolvedShots+=1,this.outcomeHistory.push(t),this.trace?.result({outcome:t,contacts:e.ball.contactHistory,terminalPosition:e.ball.position,elapsedSeconds:e.ball.elapsedSeconds,simulationSeconds:this.engine.simulationSeconds}),this.root.dataset.resolvedShots=String(this.resolvedShots),this.updateHud(),this.events.emit("outcome",{outcome:t,shotNumber:this.match.shotsTaken,target:e.ball.position,simulationSeconds:this.engine.simulationSeconds}))}applyReadyVisuals(e){const t=this.keeperController.currentPhase,n=this.keeperController.currentDestination,s=t==="COMMIT";this.scene.apply({ballPosition:Os,keeperPosition:this.keeperController.preReleasePosition(Ct.center),keeperZone:s||t==="RECOVER"?n:null,keeperDiveProgress:s?.12:0,keeperPhase:t,shooterPhase:this.pendingFeint!==null||this.holdingAfterFeint||e<this.feintVisualUntil?"FEINT":"READY",feintDirection:this.pendingFeint?.apparentDirection.x??this.feintVisualDirection,feintAmount:this.pendingFeint!==null?1:Math.max(0,(this.feintVisualUntil-e)/.3),shotProgress:0,resultProgress:t==="RECOVER"?Math.min(1,Math.max(0,((this.keeperController.diagnostics().feintAgeSeconds??0)-kt.feintHoldSeconds)/kt.feintRecoverySeconds)):0,outcome:null,simulationSeconds:e}),this.presentedReadyKeeperPhase=t,this.presentedReadyKeeperDestination=n}forceReadyVisuals(e){this.applyReadyVisuals(e),this.nextReadyPresentationSeconds=e+X_}updateReadyVisuals(e){const t=this.keeperController.currentPhase,n=this.keeperController.currentDestination;!(t!==this.presentedReadyKeeperPhase||n!==this.presentedReadyKeeperDestination)&&e+Number.EPSILON<this.nextReadyPresentationSeconds||this.forceReadyVisuals(e)}applyShotVisuals(e,t){const n=Pc(e.ball.elapsedSeconds,kt),s=e.ball.elapsedSeconds<kt.reactionDelaySeconds?"PREPARE":n<1?"DIVE":"HOLD";this.scene.apply({ballPosition:e.ball.position,keeperPosition:Ns(e.keeperZone,Ct.center,kt,e.ball.elapsedSeconds,e.keeperStart),keeperZone:e.keeperZone,keeperDiveProgress:n,keeperPhase:s,keeperCommitted:this.keeperController.currentPhase==="COMMIT",shooterPhase:"RELEASE",shotCategory:e.category,sideSpin:e.ball.releaseSideSpin,shotProgress:e.ball.elapsedSeconds/e.ball.durationSeconds,resultProgress:0,outcome:null,simulationSeconds:t})}applyResultVisuals(e,t){const n=Bh(e.keeperTerminalPosition??Ct.center,Ct.center,kt,e.resultElapsedSeconds),s=Math.min(1,e.resultElapsedSeconds/kt.returnDurationSeconds),r="RECOVER",a=Math.min(1,e.resultElapsedSeconds/Is.resetDelaySeconds);this.scene.apply({ballPosition:e.ball.position,keeperPosition:n,keeperZone:e.keeperZone,keeperDiveProgress:1-s,keeperPhase:"RETURN",shooterPhase:r,shotProgress:1,resultProgress:a,outcome:e.ball.terminalState,simulationSeconds:t})}isInputEnabled(){return this.state==="running"&&this.match.phase==="READY"}hasBeenDisposed(){return this.state==="disposed"}setInputEnabled(e){const t=e&&this.state==="running"&&this.match.phase==="READY";this.input.setEnabled(t),this.updateHud()}createKeeperController(){return new kh(kt,new Ar(this.sessionSeed).fork("keeper"))}updateHud(){const e=this.isInputEnabled();if(this.hud.update(this.match,this.displayedPower,this.displayedCategory,e,this.outcomeHistory,this.roundSummaryVisible,this.pendingFeint!==null?"pending":this.activeShot?.feint!==null&&this.activeShot?.feint!==void 0?"released":null),this.roundSummaryVisible&&this.match.goals===1){const t=this.root.querySelector("#summary-text");t!==null&&(t.textContent=t.textContent?.replace("1 goals","1 goal")??null)}this.root.dataset.acceptedShots=String(this.acceptedShots),this.root.dataset.resolvedShots=String(this.resolvedShots)}setAudioEnabled(e){this.audioEnabled=e,this.audio.setEnabled(e),this.hud.setAudioEnabled(e),this.hud.setStatus(e?"Synthesized arena audio enabled.":"Arena audio muted.")}setReducedMotion(e){this.reducedMotion=e,this.scene.setReducedMotion(e),this.hud.setReducedMotion(e),this.hud.setStatus(e?"Reduced motion enabled.":"Full arcade motion enabled.")}bindResizeListener(){if(this.resizeListenerAttached)throw new Error("Duplicate gameplay resize listener registration.");window.addEventListener("resize",this.resize),this.resizeListenerAttached=!0}unbindResizeListener(){this.resizeListenerAttached&&(window.removeEventListener("resize",this.resize),this.resizeListenerAttached=!1)}resize=()=>{const e=this.hud.canvas.getBoundingClientRect();this.scene.resize(e.width,e.height)}}function Xn(i){return Object.freeze({x:i.x,y:i.y,z:i.z})}const Uo=document.querySelector("#app");if(Uo===null)throw new Error("Handball demo root element '#app' is missing.");const Ps=new URLSearchParams(window.location.search),ws=Ps.has("capture"),ph=Ps.has("playtest"),mh=ph&&Ps.has("trace")&&!ws,wc=Ps.get("seed"),ya=wc===null?Number.NaN:Number(wc),Ac=Number.isFinite(ya)&&ya>=0?ya:void 0,j_=Ps.get("quality"),Y_=Ph(j_,ws?"capture":"gameplay"),on=new q_(Uo,{manualTime:ws,quality:Y_,recordGestures:mh,...Ac===void 0?{}:{seed:Ac}});if(mh){const i=document.createElement("div");i.dataset.gestureTrace="true",i.style.cssText="position:fixed;top:64px;left:8px;z-index:100;max-width:90vw;max-height:calc(55dvh - 72px);overflow:auto;background:#18202b;color:white;padding:6px;font:12px sans-serif";const e=document.createElement("select");e.setAttribute("aria-label","Human intended technique");for(const a of["UNLABELLED","LOB","ROSCA_LEFT","ROSCA_RIGHT","DIRECT","BOUNCE","FEINT"])e.add(new Option(a,a));const t=document.createElement("select");t.setAttribute("aria-label","Dataset partition");for(const a of["UNASSIGNED","CALIBRATION","HELD_OUT","SYNTHETIC_DIAGNOSTIC"])t.add(new Option(a,a));const n=()=>on.setTraceMetadata(e.value,t.value);e.addEventListener("change",n),t.addEventListener("change",n);const s=document.createElement("button");s.type="button",s.textContent="Download local gesture traces",s.addEventListener("click",()=>{const a=URL.createObjectURL(new Blob([JSON.stringify(on.exportGestureTrace(),null,2)],{type:"application/json"})),o=document.createElement("a");o.href=a,o.download="handball-gesture-traces.json",o.click(),setTimeout(()=>URL.revokeObjectURL(a),1e3)});const r=document.createElement("div");r.textContent="Diagnostic recording · human intent / dataset (next attempt)",i.append(r,e,t,s),Uo.append(i)}async function $_(){await on.start(),(ws||ph)&&(window.__DEMO__=Object.freeze({snapshot:()=>on.snapshot(),restart:()=>on.restart(),exportGestureTrace:()=>on.exportGestureTrace()}),window.__PERF_SNAPSHOT__=()=>on.performanceSnapshot(),ws&&(window.__PUMP__=i=>on.pumpFrames(i),window.__PRESENT__=i=>on.presentFrames(i),window.__CAPTURE_SCENES__=Fh,window.__APPLY_CAPTURE_SCENE__=i=>on.applyCaptureScene(i)),window.__READY__=!0)}$_().catch(i=>{console.error("Handball demo failed during material/light pre-warm.",i),on.dispose()});
