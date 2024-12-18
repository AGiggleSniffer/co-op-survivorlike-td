export const MOVEMENT_SPEED = 4.2 as const;
export const WALK_SPEED = 20 as const;
export const RUN_SPEED = 300 as const;
export const JUMP_FORCE = 800 as const;
export const ROTATION_SPEED = 0.01 as const;

export const FIRE_RATE = 380 as const;

export const WEAPON_OFFSET = {
	x: -0.2,
	y: 1.4,
	z: 0.8,
} as const;

export const BULLET_SPEED = 20;

enum Weapons {
	"GrenadeLauncher",
	"AK",
	"Knife_1",
	"Knife_2",
	"Pistol",
	"Revolver",
	"Revolver_Small",
	"RocketLauncher",
	"ShortCannon",
	"SMG",
	"Shotgun",
	"Shovel",
	"Sniper",
	"Sniper_2",
}

export type WeaponName = keyof typeof Weapons;

// change enum to array with just strings
export const WEAPONS = Object.keys(Weapons).filter(
	(value) => isNaN(Number(value)) === true,
) as WeaponName[];

export const CONTROLS = {
	forward: "forward",
	back: "backward",
	left: "leftward",
	right: "rightward",
	jump: "jump",
} as const;

