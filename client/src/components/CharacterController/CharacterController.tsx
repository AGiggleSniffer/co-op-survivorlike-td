import { isHost, Joystick, PlayerState } from "playroomkit";
import { useEffect, useRef, useState } from "react";
import { BulletType } from "../shared.types";
import CharacterPlayer, { ActionName } from "./CharacterPlayer";
import { CONTROLS, WALK_SPEED, WeaponName } from "../../constants";
import { extend, useFrame, useThree } from "@react-three/fiber";
import {
	CapsuleCollider,
	RapierRigidBody,
	RigidBody,
} from "@react-three/rapier";
import { OrbitControls, useKeyboardControls } from "@react-three/drei";
import { Vector3 } from "three";
import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";

type Props = {
	state: PlayerState;
	joystick: Joystick;
	userPlayer: Boolean;
	onFire: (b: BulletType) => void;
	onKilled: (id: string, p: string) => void;
	props?: JSX.IntrinsicElements["group"];
};
const CharacterController = ({
	state,
	joystick,
	userPlayer,
	onFire,
	onKilled,
	...props
}: Props) => {
	const jumpPressed = useKeyboardControls((state) => state[CONTROLS.jump]);
	const leftPressed = useKeyboardControls((state) => state[CONTROLS.left]);
	const rightPressed = useKeyboardControls((state) => state[CONTROLS.right]);
	const backPressed = useKeyboardControls((state) => state[CONTROLS.back]);
	const forwardPressed = useKeyboardControls(
		(state) => state[CONTROLS.forward],
	);

	const [animation, setAnimation] = useState<ActionName>("Idle");
	const [weapon] = useState<WeaponName>("AK");
	const rb = useRef<RapierRigidBody>(null);

	const { camera } = useThree();

	useEffect(() => {
		const canvas = document.getElementById("Canvas");

		const controls = new PointerLockControls(camera, canvas);
		const click = () => controls.lock();
		const lock = () => {
			console.log("locked");
		};

		controls.domElement?.addEventListener("click", click);
		controls.addEventListener("lock", lock);
		return () => {
			controls.domElement?.removeEventListener("click", click);
			controls.removeEventListener("lock", lock);
		};
	}, []);

	useFrame((_, delta) => {
		if (!rb.current) return;
		if (!userPlayer) {
			const pos = state.getState("pos");
			if (pos) {
				rb.current.setTranslation(pos, false);
			}

			const rot = state.getState("rot");
			if (rot) {
				rb.current.setRotation(rot, false);
			}

			return;
		}

		const moveVec = new Vector3();
		if (forwardPressed) moveVec.z += WALK_SPEED * delta;
		if (backPressed) moveVec.z += -WALK_SPEED * delta;
		if (leftPressed) moveVec.x += WALK_SPEED * delta;
		if (rightPressed) moveVec.x += -WALK_SPEED * delta;

		rb.current.applyImpulse(moveVec, true);

		const playerPos = rb.current.translation();

		state.setState("pos", playerPos);
		state.setState("rot", playerPos);
	});

	return (
		<>
			{isHost() ? (
				<OrbitControls />
			) : (
				<group position={[0, 5, 0]}>
					<RigidBody
						ref={rb}
						colliders={false}
						enabledRotations={[false, false, false]}
						type={userPlayer ? "dynamic" : "kinematicPosition"}
					>
						<CharacterPlayer
							color={state.getProfile().color.hexString}
							animation={animation}
							weapon={weapon}
							position={[0, -1.28, 0]}
						/>
						<CapsuleCollider args={[0.7, 0.6]} />
					</RigidBody>
				</group>
			)}
		</>
	);
};

export default CharacterController;
