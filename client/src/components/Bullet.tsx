import {
	IntersectionEnterHandler,
	RapierRigidBody,
	RigidBody,
	vec3,
} from "@react-three/rapier";
import { useEffect, useRef } from "react";
import { MeshBasicMaterial, Vector3 } from "three";
import { BULLET_SPEED, WEAPON_OFFSET } from "../constants";
import { isHost } from "playroomkit";
import { BulletData, isBulletData } from "./shared.types";

type Props = {
	player: string;
	angle: number;
	position: Vector3;
	onHit: (v: Vector3) => void;
};

const bulletMaterial = new MeshBasicMaterial({
	color: "hotpink",
	toneMapped: false,
});

bulletMaterial.color.multiplyScalar(42);

const Bullet = ({ player, angle, position, onHit }: Props) => {
	const rigidbody = useRef<RapierRigidBody>(null);

	useEffect(() => {
		const velocity = {
			x: Math.sin(angle) * BULLET_SPEED,
			y: 0,
			z: Math.cos(angle) * BULLET_SPEED,
		};

		rigidbody.current?.setLinvel(velocity, true);

		// const audio = new Audio("/audio/rifle.mp3");
		// audio.play();
	}, []);

	const bulletdata: BulletData = {
		type: "bullet",
		player,
		damage: 10,
	};

	const onEnter: IntersectionEnterHandler = ({ other }) => {
		if (isHost() && isBulletData(other.rigidBody?.userData)) {
			rigidbody.current?.setEnabled(false);
			onHit(vec3(rigidbody.current?.translation()));
		}
	};

	return (
		<group
			position={[position.x, position.y, position.z]}
			rotation-y={angle}
		>
			<group
				position-x={WEAPON_OFFSET.x}
				position-y={WEAPON_OFFSET.y}
				position-z={WEAPON_OFFSET.z}
			>
				<RigidBody
					ref={rigidbody}
					gravityScale={0}
					sensor
					onIntersectionEnter={onEnter}
					userData={bulletdata}
				>
					<mesh
						position-z={0.25}
						material={bulletMaterial}
						castShadow
					>
						<boxGeometry args={[0.05, 0.05, 0.5]} />
					</mesh>
				</RigidBody>
			</group>
		</group>
	);
};

export default Bullet;
