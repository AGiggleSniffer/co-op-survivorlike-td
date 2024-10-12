import { Vector3 } from "three";

export type BulletType = {
	id: string;
	position: Vector3;
	angle: number;
	player: string;
};

export type BulletData = {
	type: string;
	player: string;
	damage: number;
};

export const isBulletData = (
	userData: BulletData | unknown,
): userData is BulletData => (userData as BulletData).type === "bullet";
