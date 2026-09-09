import { FLOOR } from './game.js';
const shape = { chair:[62,83], books:[70,38], bag:[63,49], sign:[49,66], rolling:[65,82], printer:[93,83], paper:[58,65], files:[67,67], auto:[152,105], dog:[75,70], cycle:[107,86], cable:[80,13], meeting:[120,94], gate:[55,145], bucket:[51,47], guard:[58,115], crowd:[103,111], lift:[120,20] };
const palettes = [
  { sky:'#776641', floor:'#302d21', edge:'#baa573', light:'#ffde83' },
  { sky:'#716944', floor:'#30372e', edge:'#a4ad80', light:'#f0db96' },
  { sky:'#bc8651', floor:'#343733', edge:'#c4ad7b', light:'#ffd695' },
  { sky:'#416761', floor:'#203b39', edge:'#73a79b', light:'#b4f3db' },
  { sky:'#141d21', floor:'#192522', edge:'#c28d46', light:'#f2b657' },
];
const definitions = [
  { name:'THE ROOM', subtitle:'THE JOURNEY BEGINS', objective:'Get out of the room. Keep your dignity.', length:3100,
    objects:[['books',620],['chair',1030],['bag',1350],['cable',1600],['books',1860],['chair',2140],['bag',2440],['cable',2700]],
    platforms:[[750,490,140],[1810,480,160],[2350,490,150]], pits:[],
    hints:[[80,'A / D to move · SPACE to jump'],[520,'Jump over books. There is no time to read.'],[850,'E: swing your bag. Chairs are negotiable.'],[1480,'SHIFT to dash · S to duck'],[2280,'F: Do Not Disturb slows the world for 5 seconds.']],
    pickups:[['document',410,510],['document',820,442],['chai',1180,539],['document',1520,450],['wifi',1940,431],['document',2240,510],['document',2570,465],['chai',2860,535]] },
  { name:'THE CORRIDOR', subtitle:'PRINTER NOT RESPONDING', objective:'Find the exit. Resolve the printer situation.', length:4400,
    objects:[['rolling',550],['files',860],['sign',1180],['paper',1530,445],['bucket',1830],['printer',2180],['paper',2600,455],['files',2960],['gate',3180]],
    platforms:[[940,480,140],[1750,470,170],[2520,490,170]], pits:[[1380,110]], boss:'printer',
    hints:[[60,'The corridor has entered its villain era.'],[1080,'Yellow edges mark safe platforms.'],[1970,'Malfunctioning printers fire paper. E sends it back.'],[2960,'THE PRINTER FROM HELL · Get close. Swing the bag.']],
    pickups:[['document',370,513],['chai',730,539],['document',1000,432],['wifi',1350,489],['document',1800,422],['chai',2420,539],['document',2620,439],['document',2830,470],['chai',3310,539]] },
  { name:'THE STREET', subtitle:'METER SE NAHI JAYEGA!', objective:'Cross the street. A chai break is essential.', length:4850,
    objects:[['auto',580],['cycle',1100],['dog',1440],['auto',1950],['sign',2220],['cycle',2630],['dog',3000],['auto',3460],['books',3930],['cycle',4260]],
    platforms:[[1150,480,150],[2260,480,140],[3070,470,150],[3970,485,150]], pits:[[1640,135],[2810,130],[3690,145]],
    hints:[[80,'Traffic is temporary. The meeting is eternal.'],[1570,'Pothole ahead. Jump early — dash across if needed.'],[2390,'CHAI STOP · Refuel and regain 25 energy.'],[3380,'Auto driver: “Meter se nahi jayega!”']],
    pickups:[['chai',390,539],['document',910,445],['document',1220,432],['wifi',1550,490],['document',1880,455],['chai',2430,539],['chai',2490,539],['document',3140,422],['wifi',3590,440],['document',4010,437],['chai',4530,539]] },
  { name:'THE OFFICE / CAMPUS', subtitle:'JUST ONE QUICK MEETING', objective:'Get past security. Avoid unnecessary meetings.', length:4650,
    objects:[['guard',650],['meeting',1060],['paper',1440,455],['files',1800],['crowd',2170],['gate',2530],['meeting',2850],['printer',3290],['paper',3690,420],['guard',4070]],
    platforms:[[740,480,130],[1550,475,140],[2230,460,155],[3490,480,140]], pits:[[1930,125],[3800,125]], lifts:[[3020,470,135]],
    hints:[[40,'Security asks you to look busy.'],[850,'QUICK MEETING? Jump over it — or mash SPACE to escape.'],[2320,'Closing doors open every few seconds.'],[3130,'A working elevator. A small miracle.']],
    pickups:[['document',400,510],['chai',880,539],['wifi',1340,485],['document',1610,427],['document',2290,412],['chai',2710,539],['document',3090,410],['chai',3570,539],['wifi',3950,480],['document',4340,505]] },
  { name:'THE DEADLINE', subtitle:'TIME HAS TAKEN THIS PERSONALLY', objective:'Defeat the Deadline. Make it to the meeting.', length:3850,
    objects:[['paper',530,440],['files',930],['paper',1340,445],['printer',1690],['paper',2040,425]],
    platforms:[[680,490,150],[1210,470,170],[1950,480,150]], pits:[[1070,110],[1810,110]], boss:'clock',
    hints:[[80,'The deadline is no longer a figure of speech.'],[1130,'Save your phone special for the boss.'],[2060,'THE DEADLINE · Three phases. One very durable bag.']],
    pickups:[['chai',350,539],['document',740,442],['wifi',1170,495],['document',1280,420],['chai',1580,539],['document',2010,431],['chai',2310,539],['wifi',2510,490],['chai',3200,539]] },
];
export function createLevel(index) {
  const d = definitions[index]; if (!d) throw new Error('Invalid chapter');
  const level = { ...d, index, palette:palettes[index], hints:d.hints.map(([x,text]) => ({x,text,seen:false})), time:0, projectiles:[], hazards:[], floor:[],
    pickups:d.pickups.map(([type,x,y], i) => ({id:`pickup-${i}`,type,x,y,w:37,h:43,collected:false,phase:i*.9})),
    platforms:d.platforms.map(([x,y,w]) => ({x,y,w,h:20})),
    objects:d.objects.map(([type,x,y], i) => { const [w,h] = shape[type]; return {id:`object-${i}`,type,x,y:y ?? FLOOR-h,w,h,originX:x,originY:y ?? FLOOR-h,hp:type==='printer'?2:1,dead:false,solid:['chair','books','bag','files','sign','bucket','gate'].includes(type),hostile:['rolling','printer','paper','auto','dog','cycle','guard','crowd'].includes(type),phase:i*1.7,cooldown:1.7,hitIds:new Set()}; }),
  };
  let cursor=0;
  for (const [x,w] of d.pits) { level.floor.push({x:cursor,y:FLOOR,w:x-cursor,h:250}); cursor=x+w; }
  level.floor.push({x:cursor,y:FLOOR,w:d.length-cursor,h:250});
  for (const [x,y,w] of d.lifts||[]) level.platforms.push({x,y,w,h:20,moving:true,originY:y});
  level.exit={x:d.length-170,y:FLOOR-176,w:104,h:176};
  return level;
}
export const CHAPTERS = definitions.map(({name,subtitle}) => ({name,subtitle}));
