import { isHost, Joystick, PlayerState, usePlayerState } from "playroomkit";
import { useEffect, useRef, useState } from "react";
import { Camera, Group, MathUtils, Vector2, Vector3 } from "three";
import CharacterPlayer, { ActionName } from "./CharacterPlayer";
import {
	CapsuleCollider,
	euler,
	IntersectionEnterHandler,
	quat,
	RapierRigidBody,
	RigidBody,
	vec3,
} from "@react-three/rapier";
import { useFrame, useThree } from "@react-three/fiber";
import {
	CONTROLS,
	FIRE_RATE,
	JUMP_FORCE,
	MOVEMENT_SPEED,
	ROTATION_SPEED,
	RUN_SPEED,
	WALK_SPEED,
	WeaponName,
} from "../../constants";
import { BulletType, isBulletData } from "../shared.types";
import CharacterInfo from "./CharacterInfo";
import { OrbitControls, Sphere, useKeyboardControls } from "@react-three/drei";
import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";

type Props = {
	state: PlayerState;
	joystick: Joystick;
	userPlayer: Boolean;
	onFire: (b: BulletType) => void;
	onKilled: (id: string, p: string) => void;
	props?: JSX.IntrinsicElements["group"];
};

const vel = new Vector3();

const CharacterController = ({
	state,
	joystick,
	userPlayer,
	onFire,
	onKilled,
	...props
}: Props) => {
	const inTheAir = useRef(true);
	const landed = useRef(false);
	const cameraPosition = useRef<Group>(null);
	const cameraLookAt = useRef(new Vector3());

	const mousePos = useRef(new Vector2());
	const [mouseup, setMouseup] = useState(true);

	const rb = useRef<RapierRigidBody>(null);

	const [animation, setAnimation] = useState<ActionName>("Idle");
	const [weapon] = useState<WeaponName>("AK");

	const [, getKey] = useKeyboardControls();
	const scene = useThree((state) => state.scene);
	const camera = useThree((state) => state.camera);

	const spawnRandomly = () => {
		const spawns = [];
		for (let i = 0; i < 1000; i++) {
			const spawn = scene.getObjectByName(`spawn_${i}`);
			if (spawn) {
				spawns.push(spawn);
			} else {
				break;
			}
		}
		const spawnPos =
			spawns[Math.floor(Math.random() * spawns.length)].position;
		rb.current?.setTranslation(spawnPos, true);
	};

	useEffect(() => {
		spawnRandomly();
	}, []);

	// useFrame(({ camera }, delta) => {
	// 	if (userPlayer) {
	// 		const rbPosition = vec3(rb.current?.translation());
	// 		// if (!cameraLookAt.current) {
	// 		// 	cameraLookAt.current = rbPosition;
	// 		// }
	// 		// cameraLookAt.current.lerp(rbPosition, 0.05);
	// 		// camera.lookAt(cameraLookAt.current);
	// 		const worldPos = rbPosition;
	// 		cameraPosition.current?.getWorldPosition(worldPos);
	// 		camera.position.lerp(worldPos, 0.05);
	// 	}

	// 	if (!userPlayer) {
	// 		const pos = state.getState("pos");
	// 		if (pos) {
	// 			rb.current?.setTranslation(pos, true);
	// 		}
	// 		const rot = state.getState("rot");
	// 		if (rot) {
	// 			rb.current?.setRotation(rot, true);
	// 		}
	// 		const anim = state.getState("animation");
	// 		setAnimation(anim);
	// 		return;
	// 	}

	// 	const rotVel = {
	// 		x: 0,
	// 		y: 0,
	// 		z: 0,
	// 	};

	// 	const curVel = rb.current?.linvel();
	// 	vel.x = 0;
	// 	vel.y = 0;
	// 	vel.z = 0;

	// 	const angle = joystick.angle();
	// 	const joystickX = Math.sin(angle);
	// 	const joystickY = Math.cos(angle);

	// 	const speed = getKey().run ? RUN_SPEED : WALK_SPEED;

	// 	if (
	// 		getKey()[CONTROLS.forward] ||
	// 		(joystick.isJoystickPressed() && joystickY < -0.1)
	// 	) {
	// 		vel.z += delta * speed;
	// 	}
	// 	if (
	// 		getKey()[CONTROLS.back] ||
	// 		(joystick.isJoystickPressed() && joystickY > 0.1)
	// 	) {
	// 		vel.z -= delta * speed;
	// 	}
	// 	if (
	// 		getKey()[CONTROLS.left] ||
	// 		(joystick.isJoystickPressed() && joystickX < -0.1)
	// 	) {
	// 		vel.x += delta * speed;
	// 	}
	// 	if (
	// 		getKey()[CONTROLS.right] ||
	// 		(joystick.isJoystickPressed() && joystickX > 0.1)
	// 	) {
	// 		vel.x -= delta * speed;
	// 	}

	// 	// if (mousePos.current.x > 2) {
	// 	// 	rotVel.y -= ROTATION_SPEED * delta * mousePos.current.x;
	// 	// }
	// 	// if (mousePos.current.x < -2) {
	// 	// 	rotVel.y += ROTATION_SPEED * delta * -mousePos.current.x;
	// 	// }
	// 	// if (mousePos.current.y > 2) {
	// 	// 	rotVel.y -= ROTATION_SPEED * delta * mousePos.current.x;
	// 	// }
	// 	// if (mousePos.current.y < -2) {
	// 	// 	rotVel.y += ROTATION_SPEED * delta * -mousePos.current.x;
	// 	// }

	// 	// rb.current?.setAngvel(rotVel, true);
	// 	// // apply rotation to x and z to go in the right direction
	// 	// const eulerRot = euler().setFromQuaternion(
	// 	// 	quat(rb.current?.rotation()),
	// 	// );
	// 	// vel.applyEuler(eulerRot);

	// 	if (
	// 		(getKey()[CONTROLS.jump] || joystick.isPressed("Jump")) &&
	// 		!inTheAir.current &&
	// 		landed.current
	// 	) {
	// 		vel.y += JUMP_FORCE;
	// 		inTheAir.current = true;
	// 		landed.current = false;
	// 	} else if (curVel) {
	// 		vel.y = curVel.y;
	// 	}

	// 	if (Math.abs(vel.y) > 1) {
	// 		inTheAir.current = true;
	// 		landed.current = false;
	// 	} else {
	// 		inTheAir.current = false;
	// 	}

	// 	rb.current?.setLinvel(vel, true);
	// 	// console.log(rb.current?.rotation());
	// 	state.setState("pos", rb.current?.translation());
	// 	state.setState("rot", rb.current?.rotation());

	// 	// ANIMATION
	// 	const movement = Math.abs(vel.x) + Math.abs(vel.z);
	// 	if (inTheAir.current && vel.y > 2) {
	// 		setAnimation("Jump");
	// 		state.setState("animation", "Jump");
	// 	} else if (inTheAir.current && vel.y < -5) {
	// 		setAnimation("Jump_Land");
	// 		state.setState("animation", "Jump_Land");
	// 	} else if (movement > 1 || inTheAir.current) {
	// 		setAnimation("Run");
	// 		state.setState("animation", "Run");
	// 	} else {
	// 		setAnimation("Idle");
	// 		state.setState("animation", "Idle");
	// 	}
	// });

	useFrame(() => {
		if (!userPlayer) {
			const pos = state.getState("pos");
			if (pos) {
				rb.current?.setTranslation(pos, true);
			}

			const rot = state.getState("rot");
			if (rot) {
				rb.current?.setRotation(rot, true);
			}
			return;
		}

		state.setState("pos", rb.current?.translation());
		state.setState("rot", rb.current?.rotation());
	});

	return (
		<>
			{/* {userPlayer && <OrbitControls />} */}
			<RigidBody
				ref={rb}
				colliders={false}
				linearDamping={12}
				enabledRotations={[false, true, false]}
				name={userPlayer ? "player" : "other"}
				// type={isHost() ? "dynamic" : "kinematicPosition"}
				// onIntersectionEnter={onEnter}
			>
				{/* <CharacterInfo
					name={state.getProfile().name}
					color={state.getProfile().color.hexString}
					health={health}
				/> */}

				<group ref={cameraPosition} position={[0, 8, -16]} />
				<CharacterPlayer
					color={state.getProfile().color.hexString}
					animation={animation}
					weapon={weapon}
				/>

				<CapsuleCollider args={[0.7, 0.6]} position={[0, 1.28, 0]} />
			</RigidBody>
		</>
	);
};

export default CharacterController;
