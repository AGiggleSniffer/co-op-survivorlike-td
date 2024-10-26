import { Joystick, PlayerState } from "playroomkit";
import { useEffect, useRef, useState } from "react";
import { BulletType } from "../shared.types";
import CharacterPlayer, { ActionName } from "./CharacterPlayer";
import { CONTROLS, WALK_SPEED, WeaponName } from "../../constants";
import { ThreeEvent, useFrame, useThree } from "@react-three/fiber";
import {
	CapsuleCollider,
	RapierRigidBody,
	RigidBody,
} from "@react-three/rapier";
import { CameraControls, useKeyboardControls } from "@react-three/drei";
import { Euler, Quaternion, Vector3 } from "three";
import { PointerLockControls } from "@react-three/drei";

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
	const controls = useRef<CameraControls>(null);

	// const camera = useThree((state) => state.camera);
	// const canvas = document.getElementById("canvas");

	// useEffect(() => {
	// 	const change = () => console.log("Controls Change");

	// 	controls.addEventListener("change", change);
	// 	canvas?.addEventListener("click", start);

	// 	return () => {
	// 		controls.removeEventListener("change", change);
	// 		canvas?.removeEventListener("click", start);
	// 	};
	// }, []);

	const [animation, setAnimation] = useState<ActionName>("Idle");
	const [weapon] = useState<WeaponName>("AK");
	const rb = useRef<RapierRigidBody>(null);

	const [mouse, setMouse] = useState({ x: 0, y: 0 });

	useEffect(() => {
		const moveMouse = (e: MouseEvent) => {
			const { innerWidth, innerHeight } = window;
			const x = (e.clientX / innerWidth) * 2 - 1;
			const y = -(e.clientY / innerHeight) * 2 + 1;
			setMouse({ x, y });
		};

		document.addEventListener("mousemove", moveMouse);

		return () => {
			document.removeEventListener("mousemove", moveMouse);
		};
	}, []);

	const offset = new Vector3(0, 10, 0);
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

		controls.current?.setLookAt(
			offset.x,
			offset.y,
			offset.z,
			playerPos.x,
			playerPos.y,
			playerPos.z,
			true,
		);

		const euler = new Euler(0, mouse.x * Math.PI, 0);
		const quaternion = new Quaternion().setFromEuler(euler);
		rb.current.setRotation(quaternion, true);

		console.log(mouse.x, mouse.y);

		state.setState("pos", playerPos);
		state.setState("rot", playerPos);
	});

	return (
		<>
			{/* {userPlayer && <CameraControls ref={controls} />} */}
			<group position={[0, 5, 0]}>
				{userPlayer ? (
					<RigidBody
						ref={rb}
						colliders={false}
						enabledRotations={[false, false, false]}
					>
						<group>
							<CharacterPlayer
								color={state.getProfile().color.hexString}
								animation={animation}
								weapon={weapon}
								position={[0, -1.28, 0]}
							/>
						</group>
						<CapsuleCollider args={[0.7, 0.6]} />
					</RigidBody>
				) : (
					<RigidBody
						ref={rb}
						colliders={false}
						type="kinematicPosition"
					>
						<CharacterPlayer
							color={state.getProfile().color.hexString}
							animation={animation}
							weapon={weapon}
							position={[0, -1.28, 0]}
						/>
						<CapsuleCollider args={[0.7, 0.6]} />
					</RigidBody>
				)}
			</group>
		</>
	);
};

export default CharacterController;
