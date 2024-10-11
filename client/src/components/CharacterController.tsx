import { isHost, Joystick, PlayerState } from "playroomkit";
import { useRef, useState } from "react";
import { Group } from "three";
import CharacterPlayer, { ActionName, WeaponName } from "./CharacterPlayer";
import {
	CapsuleCollider,
	RapierRigidBody,
	RigidBody,
	vec3,
} from "@react-three/rapier";
import { useFrame } from "@react-three/fiber";
import { CameraControls } from "@react-three/drei";

type Props = {
	state: PlayerState;
	joystick: Joystick;
    userPlayer: Boolean;
    onFire: Function;
	props?: JSX.IntrinsicElements["group"];
};

const MOVEMENT_SPEED = 200;
const FIRE_RATE = 380;

const CharacterController = ({
	state,
	joystick,
    userPlayer,
    onFire,
	...props
}: Props) => {
	const group = useRef<Group>(null!);
	const character = useRef<Group>(null!);
	const rigidBody = useRef<RapierRigidBody>(null!);
    const controls = useRef<CameraControls>(null!);
    const lastShoot = useRef<number>(0);

	const [animation, setAnimation] = useState<ActionName>("Idle");
	const [weapon] = useState<WeaponName>("AK");

	const handleMovement = (delta: number): number => {
		const angle = joystick.angle();

		if (joystick.isJoystickPressed() && angle) {
			setAnimation("Run");
			character.current.rotation.y = angle;

			const impulse = {
				x: Math.sin(angle) * MOVEMENT_SPEED * delta,
				y: 0,
				z: Math.cos(angle) * MOVEMENT_SPEED * delta,
			};
			rigidBody.current.applyImpulse(impulse, true);
		} else {
			setAnimation("Idle");
		}

		if (isHost()) {
			state.setState("pos", rigidBody.current.translation());
		} else {
			const pos = state.getState("pos");
			if (pos) {
				// const newPos = vec3(rigidBody.current.translation()).lerp(pos, 1);
				rigidBody.current.setTranslation(pos, true);
			}
        }
        
        return angle;
	};

	const handleCamera = () => {
		if (controls.current) {
			const cameraDistanceY = window.innerWidth < 1024 ? 16 : 20;
			const cameraDistanceZ = window.innerWidth < 1024 ? 12 : 16;
			const playerWorldPos = vec3(rigidBody.current.translation());
			controls.current.setLookAt(
				playerWorldPos.x,
				playerWorldPos.y +
					(state.getState("dead") ? 12 : cameraDistanceY),
				playerWorldPos.z +
					(state.getState("dead") ? 2 : cameraDistanceZ),
				playerWorldPos.x,
				playerWorldPos.y + 1.5,
				playerWorldPos.z,
				true,
			);
		}
	};

	const handleFire = (angle: number) => {
		if (joystick.isPressed("fire")) {
			// fire
			setAnimation(
				joystick.isJoystickPressed() && angle
					? "Run_Shoot"
					: "Idle_Shoot",
			);
			if (isHost()) {
				if (Date.now() - lastShoot.current > FIRE_RATE) {
					lastShoot.current = Date.now();
					const newBullet = {
						id: state.id + "-" + +new Date(),
						position: vec3(rigidBody.current.translation()),
						angle,
						player: state.id,
					};
					onFire(newBullet);
				}
			}
		}
	};

	useFrame((_, delta) => {
		handleCamera();

		const angle = handleMovement(delta);

		handleFire(angle);
	});

	return (
		<group ref={group} {...props}>
			{userPlayer && <CameraControls ref={controls} />}
			<RigidBody
				ref={rigidBody}
				colliders={false}
				linearDamping={12}
				lockRotations
				type={isHost() ? "dynamic" : "kinematicPosition"}
			>
				<group ref={character}>
					<CharacterPlayer
						color={state.getProfile().color.hexString}
						animation={animation}
						weapon={weapon}
					/>
				</group>
				<CapsuleCollider args={[0.7, 0.6]} position={[0, 1.28, 0]} />
			</RigidBody>
		</group>
	);
};

export default CharacterController;
