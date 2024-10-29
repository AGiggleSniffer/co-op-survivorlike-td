import { isHost, Joystick, PlayerState } from "playroomkit";
import { useEffect, useRef, useState } from "react";
import { BulletType } from "../shared.types";
import CharacterPlayer, { ActionName } from "./CharacterPlayer";
import {
	CONTROLS,
	ROTATION_SPEED,
	WALK_SPEED,
	WeaponName,
} from "../../constants";
import { useFrame } from "@react-three/fiber";
import {
	CapsuleCollider,
	RapierRigidBody,
	RigidBody,
} from "@react-three/rapier";
import {
	PerspectiveCamera,
	Sphere,
	useKeyboardControls,
} from "@react-three/drei";
import { Group, Vector2, Vector3 } from "three";

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
	const cameraLookAt = useRef<Group>(null);
	const mouseRef = useRef(new Vector2());

	useEffect(() => {
		const canvas = document.getElementById("Canvas");
		if (!canvas) return;

		const lockCursor = async () => await canvas.requestPointerLock();
		const updateMouse = (e: MouseEvent) =>
			mouseRef.current.set(e.movementX, e.movementY);

		canvas.addEventListener("click", lockCursor);
		canvas.addEventListener("mousemove", updateMouse);

		return () => {
			canvas.removeEventListener("click", lockCursor);
			canvas.removeEventListener("mousemove", updateMouse);
		};
	}, []);

	useFrame(({ camera }, delta) => {
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

		// Get forward vector from camera
		const cameraForward = new Vector3();
		camera.getWorldDirection(cameraForward);

		// Project forward vector onto the horizontal plane (y = 0)
		cameraForward.y = 0;
		cameraForward.normalize();

		// Get the right direction based on camera orientation
		const cameraRight = new Vector3().crossVectors(
			cameraForward,
			new Vector3(0, 1, 0),
		);

		// Create movement vector based on keyboard input
		const moveVec = new Vector3();
		if (forwardPressed) {
			moveVec.addScaledVector(cameraForward, WALK_SPEED * delta);
		}
		if (backPressed) {
			moveVec.addScaledVector(cameraForward, -WALK_SPEED * delta);
		}
		if (leftPressed) {
			moveVec.addScaledVector(cameraRight, -WALK_SPEED * delta);
		}
		if (rightPressed) {
			moveVec.addScaledVector(cameraRight, WALK_SPEED * delta);
		}

		rb.current.applyImpulse(moveVec, true);

		const { x: mouseX, y: mouseY } = mouseRef.current;

		const torqueImpulse = new Vector3(0, -mouseX * ROTATION_SPEED * 2, 0);
		rb.current.applyTorqueImpulse(torqueImpulse, true);

		camera.rotation.x = Math.max(
			-Math.PI / 2,
			Math.min(Math.PI / 2, camera.rotation.x + mouseY * ROTATION_SPEED),
		);

		mouseRef.current.set(0, 0);

		const playerPos = rb.current.translation();
		state.setState("pos", playerPos);
		state.setState("rot", rb.current.rotation());
	});

	return (
		<>
			<group position={[0, 5, 0]} {...props}>
				<RigidBody
					ref={rb}
					colliders={false}
					enabledRotations={[false, true, false]}
					type={userPlayer ? "dynamic" : "kinematicPosition"}
					angularDamping={10}
				>
					{userPlayer && (
						<PerspectiveCamera
							makeDefault
							position={[0, 0.5, 1]}
							rotation={[0, Math.PI, 0]}
						/>
					)}
					<CharacterPlayer
						color={state.getProfile().color.hexString}
						animation={animation}
						weapon={weapon}
						position={[0, -1.28, 0]}
					/>
					<CapsuleCollider args={[0.7, 0.6]} />
					<group ref={cameraLookAt}>
						<Sphere args={[0.2]} position={[0, 0, 5]}>
							<meshBasicMaterial color={"pink"} />
						</Sphere>
					</group>
				</RigidBody>
			</group>
		</>
	);
};

export default CharacterController;
