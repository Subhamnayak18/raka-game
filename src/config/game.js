export const WIDTH = 1280;
export const HEIGHT = 720;
export const FLOOR = 610;
export const START_TIME = 300;
export const PHYSICS = Object.freeze({ gravity: 1820, acceleration: 2350, friction: 2100, speed: 320, jump: 685, coyote: .12, buffer: .14, dashSpeed: 830, dashDuration: .19, dashCooldown: .85, attackCooldown: .42 });
export const RANKS = { S: 'ABSOLUTE PROFESSIONAL', A: 'MEETING READY', B: 'GOOD ENOUGH', C: 'NEEDS MORE CHAI', D: 'MEETING COULD HAVE BEEN AN EMAIL' };
export const ART = {
  hero: '/assets/backgrounds/menu.png',
  character: '/assets/character/character-atlas.png',
  environments: '/assets/backgrounds/environments-atlas.png',
  props: '/assets/enemies/props-atlas.png',
  office: '/assets/enemies/office-props.png',
};
export const CHARACTER_FRAMES = [
  [23, 42, 220, 480], [277, 45, 306, 480], [606, 61, 313, 461], [926, 38, 326, 480], [1260, 75, 276, 448],
  [10, 674, 283, 311], [305, 557, 414, 429], [719, 554, 267, 434], [990, 524, 239, 469], [1240, 600, 296, 392],
];
export const PROP = { chair: 0, books: 1, bag: 2, sign: 3, rolling: 4, printer: 5, paper: 6, files: 7, auto: 8, dog: 9, cycle: 10, chai: 11, wifi: 12, document: 13, clock: 14, door: 15 };
