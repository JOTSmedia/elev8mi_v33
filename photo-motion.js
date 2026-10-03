(() => {
 'use strict';
 const journey=document.getElementById('journey');if(!journey||!window.Elev8Motion)return;
 const canvas=document.createElement('canvas');canvas.id='photoMotion';canvas.setAttribute('aria-hidden','true');journey.insertBefore(canvas,journey.querySelector('.day-sky'));
 const gl=canvas.getContext('webgl',{alpha:true,antialias:false,depth:false,stencil:false,premultipliedAlpha:true,preserveDrawingBuffer:false});
 if(!gl){canvas.remove();return;}
 let active=false,lost=false,width=0,height=0;
 const images=[...document.querySelectorAll('.journey-plate img')];
 const vertex='attribute vec2 point;varying vec2 screenUV;void main(){screenUV=vec2((point.x+1.0)*.5,(1.0-point.y)*.5);gl_Position=vec4(point,0.0,1.0);}';
 const fragment=`precision highp float;
 varying vec2 screenUV;
 uniform sampler2D photo,earthSurface,earthClouds,earthDetail,earthNight,milkyWay;
uniform float detailReady,nightReady,skyReady,parallax,skyGain;
 uniform vec2 viewport,imageSize;
 uniform float plateHeight,plateTop,camera,seam,scene,time,earthWeatherTime,earthSpin,earthMapReady,daylight,descent,twilight,sunRising,solarAltitude,sunAzimuth,moonScreenX,moonAltitude,moonLight;
 float band(float a,float b,float feather,float x){return smoothstep(a,a+feather,x)*(1.0-smoothstep(b-feather,b,x));}
 vec3 toWorld(vec3 n){float tilt=.408407,latitude=1.04719755;vec3 a=vec3(n.x*cos(tilt)-n.y*sin(tilt),n.x*sin(tilt)+n.y*cos(tilt),n.z);return vec3(a.x,a.y*cos(latitude)-a.z*sin(latitude),a.y*sin(latitude)+a.z*cos(latitude));}
vec3 toScreen(vec3 w){float tilt=.408407,latitude=1.04719755;vec3 a=vec3(w.x,w.y*cos(latitude)+w.z*sin(latitude),-w.y*sin(latitude)+w.z*cos(latitude));return vec3(a.x*cos(tilt)+a.y*sin(tilt),-a.x*sin(tilt)+a.y*cos(tilt),a.z);}
vec3 aces(vec3 x){return clamp((x*(2.51*x+.03))/(x*(2.43*x+.59)+.14),0.0,1.0);}
vec3 filmic(vec3 c){vec3 l=pow(max(c,vec3(0.0)),vec3(2.2));return pow(aces(l*.8),vec3(1.0/2.2));}
float hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
vec3 starfield(vec2 px){vec2 cell=floor(px/3.0);float h=hash(cell);if(h<.991)return vec3(0.0);vec2 c=(cell+.5+vec2(hash(cell+7.1),hash(cell+3.7))*.6-.3)*3.0;float d=length(px-c);float mag=pow(hash(cell+1.3),9.0);float t=hash(cell+9.9);vec3 tint=mix(vec3(1.0,.82,.62),vec3(.72,.82,1.0),t);return tint*(.25+2.2*mag)*exp(-d*d*1.6);}
vec2 globeUV(vec3 normal){
   float tilt=.408407,latitude=1.04719755;
   vec3 axis=vec3(normal.x*cos(tilt)-normal.y*sin(tilt),normal.x*sin(tilt)+normal.y*cos(tilt),normal.z);
   vec3 world=vec3(axis.x,axis.y*cos(latitude)-axis.z*sin(latitude),axis.y*sin(latitude)+axis.z*cos(latitude));
   return vec2(fract(atan(world.x,world.z)/6.2831853+.5+earthSpin/6.2831853),clamp(.5-asin(clamp(world.y,-1.0,1.0))/3.14159265,.001,.999));
 }
 vec3 warmLight(){return mix(vec3(1.0,.35,.19),vec3(1.0,.63,.32),sunRising);}
 vec3 skyColor(float heightAbove,float horizontal){
   float height=clamp(heightAbove,0.0,1.0);
   vec3 night=mix(vec3(.045,.066,.13),vec3(.008,.018,.045),pow(height,.65));
   vec3 day=mix(vec3(.61,.80,.95),vec3(.10,.30,.62),pow(height,.62));
   vec3 high=mix(vec3(.22,.12,.31),vec3(.13,.21,.40),sunRising);
   vec3 dusk=mix(warmLight(),high,smoothstep(.03,.94,height));
   float solarGlow=exp(-pow((horizontal-sunAzimuth)/.36,2.0))*exp(-height*4.6);
   vec3 sky=mix(night,day,daylight);
   sky=mix(sky,dusk,twilight*(.82+.18*solarGlow));
   return sky+vec3(1.0,.76,.44)*solarGlow*(daylight*.055+twilight*.16);
 }
 float movingCloud(vec2 uv){
   // Two satellite cloud layers advect at different heights and speeds.
   // The independent weather clock never moves the land or the limb.
   vec2 low=vec2(fract(uv.x+earthWeatherTime*.00085),clamp(uv.y+.0015*sin(earthWeatherTime*.043+uv.x*19.0),.001,.999));
   vec2 high=vec2(fract(uv.x-earthWeatherTime*.00135+.13),clamp(.25+uv.y*.50,.001,.999));
   float dense=texture2D(earthClouds,low).r;
   float cirrus=texture2D(earthClouds,high).r;
   return clamp(dense*.88+smoothstep(.28,.84,cirrus)*.21,0.0,1.0);
 }
 vec3 airClouds(vec3 sky,vec2 uv,float horizon,float heightScale,float visibility){
   float height=clamp((horizon-uv.y)/heightScale,0.0,1.0);
   // This helper belongs only to the forest's photographic sky. The orbital
   // atmosphere is a rotating satellite-textured shell, never this photo.
   float drift=sin(time*.045)*.075;
   vec2 coords=vec2(.12+uv.x*.76+drift,.035+height*.16);
   vec3 detail=texture2D(photo,clamp(coords,vec2(.001),vec2(.999))).rgb;
   float clouds=min(detail.r,min(detail.g,detail.b));
   float density=smoothstep(.26,.70,clouds)*(1.0-smoothstep(.42,.90,height));
   float sunward=exp(-pow((uv.x-sunAzimuth)/.38,2.0));
   vec3 tint=mix(vec3(.10,.15,.25),vec3(.89,.95,1.0),daylight);
   // Low Sun lights cloud undersides: retain cool upper shadows.
   tint=mix(tint,warmLight()*(.56+clouds*.40),twilight*(.60+.25*sunward)*(1.0-height*.5));
   sky=mix(sky,tint,density*visibility*.58);
   // Soft shafts follow holes in the moving cloud photograph, not stripes.
   float aperture=1.0-smoothstep(.22,.74,clouds);
   sky+=warmLight()*pow(aperture,3.0)*sunward*exp(-height*3.0)*visibility*(twilight*.035+daylight*.015);
   return sky;
 }
 float riverCenter(float y){
   if(y<.429)return mix(.59,.60,clamp((y-.397)/.032,0.0,1.0));
   if(y<.45)return mix(.60,.675,(y-.429)/.021);
   if(y<.48)return mix(.675,.76,(y-.45)/.03);
   if(y<.51)return mix(.76,.69,(y-.48)/.03);
   if(y<.54)return mix(.69,.61,(y-.51)/.03);
   return mix(.61,.71,clamp((y-.54)/.024,0.0,1.0));
 }
 float wideRiverCenter(float y){
   if(y<.496)return mix(.51,.574,clamp((y-.432)/.064,0.0,1.0));
   if(y<.527)return mix(.574,.563,(y-.496)/.031);
   if(y<.542)return mix(.563,.584,(y-.527)/.015);
   if(y<.59)return mix(.584,.545,(y-.542)/.048);
   if(y<.61)return mix(.545,.586,(y-.59)/.02);
   return mix(.586,.558,clamp((y-.61)/.055,0.0,1.0));
 }
 void main(){
   vec2 local=vec2(screenUV.x*viewport.x,screenUV.y*viewport.y+camera-plateTop);
   if(local.y<0.0||local.y>plateHeight)discard;
   float fit=max(viewport.x/imageSize.x,plateHeight/imageSize.y);
   vec2 drawn=imageSize*fit;
   vec2 uv=(local-vec2((viewport.x-drawn.x)*.5,(plateHeight-drawn.y)*.5))/drawn;
   vec2 warped=uv;float shimmer=0.0;
   if(scene<.5){
     // Earth's photograph stays rigid. Only a separately sampled cloud
     // layer drifts; no rubber-sheet deformation or synthetic storm vortex.
   }else if(scene<1.5){
     float clouds=1.0-smoothstep(.225,.28,uv.y);
     float openSky=smoothstep(.06,.23,uv.x)*(1.0-smoothstep(.92,.99,uv.x));
     // Broad cloud banks translate together instead of wobbling by scanline.
     warped.x+=clouds*openSky*sin(time*.03)*.09;
     warped.y+=clouds*openSky*sin(time*.025)*.0005;
     bool wide=imageSize.x>imageSize.y;
     float width=wide?mix(.002,.011,clamp((uv.y-.43)/.23,0.0,1.0)):mix(.003,.015,clamp((uv.y-.40)/.16,0.0,1.0));
     float center=wide?wideRiverCenter(uv.y):riverCenter(uv.y);
     float river=(1.0-smoothstep(width*.55,width,abs(uv.x-center)))*(wide?band(.432,.665,.008,uv.y):band(.397,.564,.008,uv.y));
     float flow=sin(uv.y*940.0-time*4.0)+.5*sin(uv.x*650.0+uv.y*320.0-time*2.7);
     warped.x+=river*flow*3.4/drawn.x;
     warped.y+=river*sin(uv.y*760.0-time*3.0)*2.2/drawn.y;
     shimmer=river*pow(max(0.0,sin(uv.y*510.0-time*3.2+uv.x*31.0)),12.0)*.11;
     float edgeTrees=wide?(1.0-smoothstep(.06,.19,uv.x))+smoothstep(.83,.97,uv.x):(1.0-smoothstep(.12,.32,uv.x))+smoothstep(.70,.95,uv.x);
     float canopy=wide?band(.32,.90,.07,uv.y):band(.49,.90,.07,uv.y);
     float roots=1.0-smoothstep(.74,.9,uv.y);
     float wind=sin(time*.72+uv.x*31.0)+.35*sin(time*1.23+uv.y*24.0);
     warped.x+=clamp(edgeTrees,0.0,1.0)*canopy*roots*wind*5.2/drawn.x;
     warped.y+=canopy*roots*sin(time*.8+uv.x*36.0)*1.0/drawn.y;
   }else{
     vec2 pool=imageSize.x>imageSize.y?(uv-vec2(.51,.855))/vec2(.44,.12):(uv-vec2(.55,.883))/vec2(.39,.061);
     float water=1.0-smoothstep(.82,1.0,dot(pool,pool));
     float ripple=sin(length(pool)*29.0-time*2.5);
     warped.x+=water*(sin(uv.y*180.0-time*.65)+.25*ripple)*1.6/drawn.x;
     warped.y+=water*sin(uv.x*90.0-time*.45)*1.0/drawn.y;
     shimmer=water*(pow(max(0.0,ripple),18.0)*.014+sin(uv.y*180.0-time*.65)*.007);
   }
   vec4 color=texture2D(photo,clamp(warped,vec2(.001),vec2(.999)));
   if(scene<.5){
     // The orbital photograph supplies space only. Replace its entire Earth,
     // including the old bright rim, with one continuous projected globe.
     // The larger radius matches the photo's shallow full-width horizon.
     float radius=2.4;
     float x=(uv.x-.5)*imageSize.x/imageSize.y;
     float horizon=.52+radius-sqrt(max(.001,radius*radius-x*x));
     vec2 sphere=vec2(x,uv.y-(.52+radius))/radius;
     float r2=dot(sphere,sphere);
     vec2 spaceUV=clamp(uv,vec2(.001),vec2(.999));
     color=texture2D(photo,spaceUV);
     // Lift the starfield/nebula: gentle gamma plus gain keeps black space black.
     color.rgb=min(vec3(1.0),pow(color.rgb,vec3(.88))*1.22);
     if(skyReady>.5){
       // E8-05: real sky. The ESO/S. Brunier panorama (galactic coordinates) is
       // laid diagonally like the v31 plate's band and scrolls at 45% of the
       // plate's rate (distant-sky parallax); point stars are drawn per pixel.
       vec2 sky=vec2((uv.x-.5)*imageSize.x/imageSize.y,uv.y-.20-parallax*camera/drawn.y);
       float ca=cos(-.62),sa=sin(-.62);vec2 r=vec2(sky.x*ca-sky.y*sa,sky.x*sa+sky.y*ca);
       vec2 pano=vec2(fract(.5+r.x*.30),clamp(.5+r.y*.60,.001,.999));
       vec3 band=texture2D(milkyWay,pano).rgb;band=pow(band,vec3(1.18))*skyGain;
       vec2 starPx=vec2(uv.x*drawn.x,(uv.y-parallax*camera/drawn.y)*drawn.y);
       color.rgb=(band+starfield(starPx)*.85+starfield(starPx*.61+311.0)*.45)*(1.0-smoothstep(.33,.47,uv.y))*1.0;
     }
     // Fade the old photographed horizon out before it enters the globe.
     // Repeating a fixed starfield row would turn stars into vertical pillars.
     if(skyReady<.5)color.rgb*=1.0-smoothstep(.42,.455,uv.y);
     // v32: while the Sun is up the sky above Earth's limb turns to daytime
     // blue (the same scattering palette as the forest sky); stars and the
     // Milky Way fade under it, and return as the Sun sets.
     if(daylight>.001){
       float aboveLimb=1.0-smoothstep(horizon-.004,horizon+.002,uv.y);
       vec3 daySky=skyColor(clamp((horizon-uv.y)/.48,0.0,1.0),uv.x);
       color.rgb=mix(color.rgb,daySky,aboveLimb*daylight*.96);
     }
     float immersion=smoothstep(.35,.80,descent);
     float skyHeight=clamp((horizon-uv.y)/.525,0.0,1.0);
     float lowAir=exp(-skyHeight*7.0);
     float airExposure=clamp(immersion+(1.0-immersion)*lowAir*(daylight*.91+twilight*.92),0.0,1.0);
     vec3 litSky=skyColor(skyHeight,uv.x);
     color.rgb=mix(color.rgb,litSky,airExposure);
     if(earthMapReady>.5){
       vec3 light=normalize(vec3((sunAzimuth-.5)*2.4,.10+max(0.0,solarAltitude)*.72,.30+daylight*.65));
       vec3 lunarLight=normalize(vec3((moonScreenX-.5)*2.4,.12+max(0.0,moonAltitude)*.60,.50));
       float moon=max(0.0,moonLight);
       // Clouds have their own raised ray intersection and weather clock.
       vec2 cloudSphere=sphere/1.003;
       float cloudR2=dot(cloudSphere,cloudSphere);
       vec3 cloudNormal=vec3(cloudSphere.x,-cloudSphere.y,sqrt(max(0.0,1.0-cloudR2)));
       vec2 weatherUV=globeUV(cloudNormal);
       float cloud=movingCloud(weatherUV);
       float cloudSun=max(0.0,dot(cloudNormal,light));
       float cloudMoon=max(0.0,dot(cloudNormal,lunarLight));
       vec3 cloudColor=mix(vec3(.17,.24,.36),vec3(.91,.96,1.0)*(.50+.50*cloudSun),daylight);
       cloudColor=mix(cloudColor,warmLight()*(.46+.51*cloudSun),twilight*.78*(.30+.70*cloudSun));
       cloudColor+=vec3(.48,.65,1.0)*cloudMoon*moon*.46;
       float edgeAA=2.0/(drawn.y*radius);
       if(r2<1.0+edgeAA){
         vec3 normal=vec3(sphere.x,-sphere.y,sqrt(max(0.0,1.0-r2)));
         vec2 mapUV=globeUV(normal);
         vec3 land=texture2D(earthSurface,mapUV).rgb;
         vec4 detail=texture2D(earthDetail,mapUV);
         vec3 litNormal=normal;
         if(detailReady>.5){
           // GEBCO elevation relief on land, in the globe's own east/north frame.
           vec3 w=toWorld(normal);vec3 east=normalize(vec3(w.z,0.0,-w.x)+vec3(1e-5,0.0,0.0));vec3 north=cross(w,east);
           vec2 t=(detail.rg*2.0-1.0)*1.6*(1.0-detail.b);
           litNormal=normalize(toScreen(normalize(w+east*t.x+north*t.y)));
         }
         float shadow=movingCloud(vec2(fract(mapUV.x-.0024*(sunAzimuth-.5)),mapUV.y+.0016));
         float diffuse=max(0.0,dot(litNormal,light));
         float lunarDiffuse=max(0.0,dot(normal,lunarLight));
         float ambient=.30+.12*daylight+.07*twilight;
         vec3 groundColor=land*1.08*(ambient+(.88*daylight+.20*twilight)*diffuse)*(1.0-shadow*(.10+.15*daylight));
         groundColor=mix(groundColor,groundColor*vec3(1.12,.67,.40),twilight*.14*diffuse);
         groundColor+=land*vec3(.46,.64,1.0)*lunarDiffuse*moon*.42;
         float water=detailReady>.5?detail.b:(1.0-smoothstep(.025,.13,land.r))*smoothstep(.01,.05,land.b-land.r);
         vec3 halfSun=normalize(light+vec3(0.0,0.0,1.0));
         vec3 halfMoon=normalize(lunarLight+vec3(0.0,0.0,1.0));
         // GGX ocean glint with Schlick Fresnel (F0 .02), viewer along +z.
         float nh=max(0.0,dot(normal,halfSun)),nl=max(0.0,dot(normal,light)),nv=max(.02,normal.z);
         float a2=.034*.034,dd=nh*nh*(a2-1.0)+1.0,ggx=a2/(3.14159*dd*dd);
         float fresnel=.02+.98*pow(1.0-max(0.0,dot(halfSun,vec3(0.0,0.0,1.0))),5.0);
         float specular=min(6.0,ggx*fresnel*nl/(4.0*nv*max(.05,nl)))*nl*water*(1.0-cloud)*(daylight*.55+twilight*.35);
         specular+=pow(nh,24.0)*water*(1.0-cloud)*.05*(daylight+twilight*.6);
         float lunarGlint=pow(max(0.0,dot(normal,halfMoon)),65.0)*water*.10*(1.0-cloud)*moon;
         vec3 globe=mix(groundColor,cloudColor,smoothstep(.12,.88,cloud)*.92);
         globe+=mix(vec3(1.0,.92,.77),warmLight(),twilight*.7)*specular+vec3(.42,.66,1.0)*lunarGlint;
         if(nightReady>.5){
           // Black Marble 2016 city lights on the night side, dimmed under cloud.
           float dark=smoothstep(.06,-.14,dot(normal,light));
           float city=texture2D(earthNight,mapUV).r;
           globe+=vec3(1.0,.74,.44)*city*city*dark*(1.0-cloud*.8)*.85;
         }
         float limb=pow(1.0-normal.z,4.0);
         vec3 rayleigh=mix(vec3(.055,.12,.24),vec3(.30,.62,.92),daylight);
         float source=exp(-pow((uv.x-sunAzimuth)/.43,2.0));
         rayleigh=mix(rayleigh,warmLight()*.90,twilight*source*.80);
         rayleigh+=vec3(.19,.34,.60)*moon*cloudMoon;
         globe=mix(globe,rayleigh,limb*(.25+.25*source)*(.86+.14*cloud));
         // No photographed Earth, fixed edge strip, or detail ghost remains.
         // Analytic coverage softens the silhouette over roughly two physical
         // pixels. Its color remains generated; no photograph is blended in.
         if(r2<=1.0)color.rgb=globe;
         else color.rgb=mix(color.rgb,globe,1.0-smoothstep(1.0,1.0+edgeAA,r2));
       }else if(cloudR2<1.0){
         // The cloud shell continues above the geometric limb at both edges.
         float tangent=1.0-smoothstep(.994,1.0,cloudR2);
         color.rgb=mix(color.rgb,cloudColor,smoothstep(.15,.82,cloud)*tangent*.62);
       }
       // A separate 100 km atmospheric shell has its own ray intersection.
       // Its latitude/longitude rotate with Earth while photographed weather
       // advects gently within that frame, including outside both limbs.
       vec2 airSphere=sphere/1.016;
       float airR2=dot(airSphere,airSphere);
       float shellAA=2.0/(drawn.y*radius*1.016);
       if(airR2<1.0+shellAA){
         vec3 airNormal=vec3(airSphere.x,-airSphere.y,sqrt(max(0.0,1.0-airR2)));
         float aerosol=movingCloud(globeUV(airNormal));
         float airSun=max(0.0,dot(airNormal,light));
         float airMoon=max(0.0,dot(airNormal,lunarLight));
         float altitude=max(0.0,sqrt(r2)-1.0);
         float altitudeFade=1.0-smoothstep(.001,.016,altitude);
         float column=pow(1.0-airNormal.z,2.5)*pow(altitudeFade,1.45);
         float exterior=smoothstep(.999,1.001,r2);
         float shellCoverage=1.0-smoothstep(1.0,1.0+shellAA,airR2);
         float shellDensity=(.06+.57*pow(aerosol,.72))*column*mix(.20,1.0,exterior)*shellCoverage;
         float source=exp(-pow((uv.x-sunAzimuth)/.40,2.0));
         vec3 scattering=mix(vec3(.055,.13,.27),vec3(.28,.58,.88),daylight);
         scattering=mix(scattering,warmLight()*(.70+.27*airSun),twilight*source*.83);
         scattering+=vec3(.17,.32,.62)*moon*airMoon;
         // Cloud-density detail changes transmitted light and forward scatter;
         // this is angular texture movement, rather than a uniform halo pulse.
         float thinVeil=smoothstep(.12,.58,aerosol)*column*exterior*.32;
         vec3 veilColor=mix(vec3(.11,.19,.34),vec3(.75,.86,1.0)*(.55+.45*airSun),daylight);
         veilColor=mix(veilColor,warmLight()*(.54+.35*airSun),twilight*source*.74);
         veilColor+=vec3(.31,.48,.79)*moon*airMoon*.35;
         color.rgb=mix(color.rgb,scattering,shellDensity);
         color.rgb=mix(color.rgb,veilColor,thinVeil*shellCoverage);
       }
       // Curved aerosol shell: optical density and shadowing advect around
       // the whole circumference, not a motionless photographic blue band.
       float distanceToLimb=abs(sqrt(r2)-1.0);
       float ring=exp(-distanceToLimb/.0045);
       float sunward=exp(-pow((uv.x-sunAzimuth)/.34,2.0));
       float lunarward=exp(-pow((uv.x-moonScreenX)/.38,2.0));
       vec3 rimColor=mix(vec3(.12,.27,.54),vec3(.40,.72,1.0),daylight);
       rimColor=mix(rimColor,warmLight()*(.93+.18*sunward),twilight*sunward*.88);
       rimColor+=vec3(.20,.35,.65)*moon*lunarward;
       float density=.55+.30*cloud;
       // Earth's complete rim breathes on the same frozen-capable clock as
       // its marker halo, with a small amplitude to keep the limb natural.
       float earthBreath=1.0+.08*sin(time*6.2831853/7.78+3.46);
       color.rgb=mix(color.rgb,rimColor,ring*density*(.45+.35*daylight+.20*twilight)*earthBreath);
       color.rgb+=warmLight()*ring*sunward*twilight*.09;
     }
     // Retain the original image while satellite maps decode, and if the
     // connection blocks them. Once ready, every Earth pixel is generated.
     if(earthMapReady<.5)color=texture2D(photo,clamp(uv,vec2(.001),vec2(.999)));
     else color.rgb=filmic(color.rgb*1.02);
   }else if(scene<1.5){
     // Preserve the photographed cloud shapes while grading both the sky
     // and terrain consistently with the same sunrise/day/sunset/night state.
     float sky=1.0-smoothstep(.225,.29,uv.y);
     float horizon=smoothstep(.02,.27,uv.y);
     float cloudLight=dot(color.rgb,vec3(.2126,.7152,.0722));
     float cloudShape=smoothstep(.30,.64,min(color.r,min(color.g,color.b)));
     vec3 nightGrade=vec3(.36,.47,.66);
     vec3 exposure=mix(nightGrade,vec3(.98,1.02,1.04),daylight);
     color.rgb*=exposure;
     float height=clamp((.27-uv.y)/.27,0.0,1.0);
     vec3 litSky=skyColor(height,uv.x);
     // Keep the real photographed clouds, lighting their undersides with
     // sunrise gold or sunset coral while upper shadows remain cool.
     float underLight=twilight*(.40+.60*horizon)*(.55+.45*exp(-pow((uv.x-sunAzimuth)/.4,2.0)));
     vec3 warm=warmLight();
     vec3 litCloud=mix(color.rgb,warm*(.18+.88*cloudLight),underLight*.73);
     color.rgb=mix(color.rgb,litSky,sky*(1.0-cloudShape)*(.20+.28*daylight+twilight*.15));
     color.rgb=mix(color.rgb,litCloud,sky*cloudShape);
     // A faint higher cloud veil travels independently over the photo sky.
     vec3 layered=airClouds(color.rgb,uv,.27,.27,.42);
     color.rgb=mix(color.rgb,layered,sky);
     color.rgb+=warm*twilight*(1.0-sky)*.028;
   }
   color.rgb+=vec3(.75,.88,1.0)*shimmer;
   float alpha=scene>.5?clamp(local.y/max(1.0,seam),0.0,1.0):1.0;
   gl_FragColor=vec4(color.rgb,alpha);
 }`;
 function shader(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){gl.deleteShader(s);throw new Error('Photo motion shader unavailable');}return s;}
 let program;
 try{const v=shader(gl.VERTEX_SHADER,vertex),f=shader(gl.FRAGMENT_SHADER,fragment);program=gl.createProgram();gl.attachShader(program,v);gl.attachShader(program,f);gl.linkProgram(program);gl.deleteShader(v);gl.deleteShader(f);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error('Photo motion link unavailable');}
 catch(_){canvas.remove();return;}
 gl.useProgram(program);const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
 const point=gl.getAttribLocation(program,'point');gl.enableVertexAttribArray(point);gl.vertexAttribPointer(point,2,gl.FLOAT,false,0,0);
 const uniforms=Object.fromEntries(['viewport','imageSize','plateHeight','plateTop','camera','seam','scene','time','earthWeatherTime','earthSpin','earthMapReady','daylight','descent','twilight','sunRising','solarAltitude','sunAzimuth','moonScreenX','moonAltitude','moonLight','photo','earthSurface','earthClouds','earthDetail','earthNight','milkyWay','detailReady','nightReady','skyReady','parallax','skyGain'].map(n=>[n,gl.getUniformLocation(program,n)]));
 gl.enable(gl.BLEND);gl.blendFuncSeparate(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA,gl.ONE,gl.ONE_MINUS_SRC_ALPHA);gl.clearColor(0,0,0,0);gl.uniform1i(uniforms.photo,0);
 const textures=images.map(()=>({texture:null,source:''}));
 const globeTextures=[];
 let settleEarth,remainingMaps=2;
 const mapResults=[null,null];
 const earthReady=new Promise(resolve=>{settleEarth=resolve;});
 function mapSettled(i,success){if(mapResults[i]!==null)return;mapResults[i]=success;if(--remainingMaps===0)settleEarth(mapResults.every(Boolean));}
 const mapLimit=Math.min(4096,gl.getParameter(gl.MAX_TEXTURE_SIZE)||2048);
 gl.uniform1i(uniforms.earthSurface,1);gl.uniform1i(uniforms.earthClouds,2);
 // E8-05 mobile tier: half-resolution maps and a lower DPR cap.
const mobileTier=matchMedia('(max-width: 720px)').matches||(matchMedia('(pointer: coarse)').matches&&Math.max(screen.width,screen.height)<=1024);
const tierSuffix=mobileTier?'-m':'';
(mobileTier?['assets/space/earth-surfacemap-m.webp','assets/space/earth-cloudmap-m.webp']:['assets/earth-surfacemap.webp','assets/earth-cloudmap.webp']).forEach((source,i)=>{
   const map=new Image();map.decoding='async';map.onload=()=>{
     if(lost){mapSettled(i,false);return;}
     const texture=gl.createTexture();gl.activeTexture(gl.TEXTURE0+i+1);gl.bindTexture(gl.TEXTURE_2D,texture);
     gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
     gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
     let pixels=map,downsample;
     if(map.naturalWidth>mapLimit||map.naturalHeight>mapLimit){
       downsample=document.createElement('canvas');
       const scale=Math.min(mapLimit/map.naturalWidth,mapLimit/map.naturalHeight);
       downsample.width=Math.max(1,Math.round(map.naturalWidth*scale));downsample.height=Math.max(1,Math.round(map.naturalHeight*scale));
       const painter=downsample.getContext('2d');
       if(painter){painter.imageSmoothingEnabled=true;painter.imageSmoothingQuality='high';painter.drawImage(map,0,0,downsample.width,downsample.height);pixels=downsample;}
       else{gl.deleteTexture(texture);gl.activeTexture(gl.TEXTURE0);mapSettled(i,false);return;}
     }
     try{gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,pixels);if(gl.getError()!==gl.NO_ERROR)throw new Error('Earth map upload unavailable');gl.generateMipmap(gl.TEXTURE_2D);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);globeTextures[i]=texture;mapSettled(i,true);}catch(_){gl.deleteTexture(texture);mapSettled(i,false);}
     if(downsample){downsample.width=1;downsample.height=1;}map.onload=null;
     gl.activeTexture(gl.TEXTURE0);
     render(window.Elev8Motion.time||0);
   };map.onerror=()=>mapSettled(i,false);map.src=source;
 });
 // E8-05 extras: GEBCO relief + ocean mask, Black Marble lights, ESO Milky Way.
// Each is optional; until it arrives the v31 shading is used for that layer.
const extras={earthDetail:[3,'detailReady',false],earthNight:[4,'nightReady',true],milkyWay:[5,'skyReady',true]};
const extraReady={detailReady:0,nightReady:0,skyReady:0};
gl.uniform1i(uniforms.earthDetail,3);gl.uniform1i(uniforms.earthNight,4);gl.uniform1i(uniforms.milkyWay,5);
[['earthDetail','earth-detail'],['earthNight','earth-night'],['milkyWay','milkyway']].forEach(([key,file])=>{
  const [unit,flag,color]=extras[key];const map=new Image();map.decoding='async';
  map.onload=()=>{
    if(lost)return;const texture=gl.createTexture();gl.activeTexture(gl.TEXTURE0+unit);gl.bindTexture(gl.TEXTURE_2D,texture);
    gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL,color?gl.BROWSER_DEFAULT_WEBGL:gl.NONE);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    let pixels=map,small;
    if(map.naturalWidth>mapLimit){small=document.createElement('canvas');small.width=mapLimit;small.height=Math.round(map.naturalHeight*mapLimit/map.naturalWidth);const g=small.getContext('2d');if(g){g.drawImage(map,0,0,small.width,small.height);pixels=small;}}
    try{gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,pixels);if(gl.getError()!==gl.NO_ERROR)throw new Error('extra map');gl.generateMipmap(gl.TEXTURE_2D);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);extraReady[flag]=1;}catch(_){gl.deleteTexture(texture);}
    gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL,gl.BROWSER_DEFAULT_WEBGL);
    if(small)small.width=small.height=1;gl.activeTexture(gl.TEXTURE0);map.onload=null;render(window.Elev8Motion.time||0);
  };
  map.src=`assets/space/${file}${tierSuffix}.webp?v=34`;
});
function upload(image,i){
   gl.activeTexture(gl.TEXTURE0);
   if(lost||!image.complete||!image.naturalWidth||textures[i].source===image.currentSrc)return;
   if(textures[i].texture)gl.deleteTexture(textures[i].texture);
   const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
   let pixels=image,small;
   const limit=gl.getParameter(gl.MAX_TEXTURE_SIZE)||2048;
   if(Math.max(image.naturalWidth,image.naturalHeight)>limit){
     small=document.createElement('canvas');const scale=limit/Math.max(image.naturalWidth,image.naturalHeight);
     small.width=Math.max(1,Math.round(image.naturalWidth*scale));small.height=Math.max(1,Math.round(image.naturalHeight*scale));
     const painter=small.getContext('2d');if(!painter){gl.deleteTexture(t);return;}
     painter.imageSmoothingQuality='high';painter.drawImage(image,0,0,small.width,small.height);pixels=small;
   }
   try{gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,pixels);if(gl.getError()!==gl.NO_ERROR)throw new Error('Photo upload unavailable');textures[i]={texture:t,source:image.currentSrc};if(i===0){active=true;journey.dataset.photoMotion='gpu';render(window.Elev8Motion.time||0);}}catch(_){gl.deleteTexture(t);}
   if(small)small.width=small.height=1;
 }
 let stillFrame=0;
 function scheduleStill(){if(stillFrame)return;stillFrame=requestAnimationFrame(()=>{stillFrame=0;render(window.Elev8Motion.time||0);});}
 function resize(){width=innerWidth;height=innerHeight;const dpr=Math.min(devicePixelRatio||1,mobileTier?1.5:2);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);gl.viewport(0,0,canvas.width,canvas.height);images.forEach(upload);scheduleStill();}
 images.forEach((image,i)=>image.addEventListener('load',()=>upload(image,i)));
 // Warm distant scenery after the critical hero has had a chance to load.
 const warm=()=>images.slice(1).forEach(image=>{image.loading='eager';});
 if('requestIdleCallback'in window)requestIdleCallback(warm,{timeout:2200});else setTimeout(warm,1500);
 canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();lost=true;active=false;mapSettled(0,false);mapSettled(1,false);journey.dataset.photoMotion='fallback';canvas.style.display='none';window.dispatchEvent(new CustomEvent('elev8mi:photo-fallback'));});
 // Keep the static images and inexpensive 2D fallback if the GPU context is lost.
 window.Elev8PhotoMotion={ready:earthReady,globeReady:earthReady,get earthReady(){return !!globeTextures[0]&&!!globeTextures[1]&&!lost;},get active(){return active&&!lost;}};
 function render(time){
   if(!active||lost)return;
   const state=window.elev8miJourney;if(!state)return;
   gl.activeTexture(gl.TEXTURE0);gl.clear(gl.COLOR_BUFFER_BIT);gl.uniform2f(uniforms.viewport,width,height);gl.uniform1f(uniforms.camera,state.camera);gl.uniform1f(uniforms.plateHeight,state.plateHeight);gl.uniform1f(uniforms.seam,state.seam);gl.uniform1f(uniforms.time,time);
   const clock=window.elev8miCelestial;
   gl.uniform1f(uniforms.earthWeatherTime,time);
   gl.uniform1f(uniforms.descent,(state.camera+height*.5)/state.plateHeight);
   gl.uniform1f(uniforms.twilight,clock?.twilight||0);gl.uniform1f(uniforms.sunRising,clock?.sunRising?1:0);
   gl.uniform1f(uniforms.solarAltitude,clock?.solarAltitude??-.4);gl.uniform1f(uniforms.sunAzimuth,clock?.sunAzimuth??.5);
   gl.uniform1f(uniforms.moonScreenX,clock?.moonScreenX??.5);gl.uniform1f(uniforms.moonAltitude,clock?.moonAltitude??0);gl.uniform1f(uniforms.moonLight,clock?.moonLight??0);
   gl.uniform1f(uniforms.earthSpin,(clock?.time??time)*Math.PI*2/(clock?.earthSpinSeconds||360));
   gl.uniform1f(uniforms.detailReady,extraReady.detailReady);gl.uniform1f(uniforms.nightReady,extraReady.nightReady);gl.uniform1f(uniforms.skyReady,extraReady.skyReady);gl.uniform1f(uniforms.parallax,.55);gl.uniform1f(uniforms.skyGain,mobileTier?.68:1.0);
  gl.uniform1f(uniforms.earthMapReady,globeTextures[0]&&globeTextures[1]?1:0);gl.uniform1f(uniforms.daylight,clock?.daylight||0);
   images.forEach((image,i)=>{const frame=state.scenes[i],top=frame.top;if(!textures[i].texture||top-state.camera>height||top+frame.height-state.camera<0)return;
     gl.bindTexture(gl.TEXTURE_2D,textures[i].texture);gl.uniform2f(uniforms.imageSize,image.naturalWidth,image.naturalHeight);gl.uniform1f(uniforms.plateTop,top);gl.uniform1f(uniforms.plateHeight,frame.height);gl.uniform1f(uniforms.scene,i);gl.drawArrays(gl.TRIANGLES,0,6);
   });
 }
 window.addEventListener('resize',resize,{passive:true});resize();
 // A paused world still follows user-controlled camera travel and resizing.
 // Repaint the same frozen instant after Journey updates its geometry.
 window.addEventListener('scroll',()=>{if(window.Elev8Motion.paused)scheduleStill();},{passive:true});
 window.addEventListener('elev8mi:moon',scheduleStill);
 document.fonts?.ready.then(scheduleStill);
 window.Elev8Motion.add(render,{fps:30});
})();
