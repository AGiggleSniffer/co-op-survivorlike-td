import { isHost, Joystick, PlayerState, usePlayerState } from "playroomkit";
import { useEffect, useRef, useState } from "react";
import { Group, Vector3 } from "three";
import CharacterPlayer, { ActionName } from "./CharacterPlayer";
import {
	CapsuleCollider,
	IntersectionEnterHandler,
	RapierRigidBody,
	RigidBody,
	vec3,
} from "@react-three/rapier";
import { useFrame, useThree } from "@react-three/fiber";
import { CameraControls } from "@react-three/drei";
import { FIRE_RATE, MOVEMENT_SPEED, WeaponName } from "../constants";
import { BulletType, isBulletData } from "./shared.types";
import PlayerInfo from "./PlayerInfo";

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
	const group = useRef<Group>(null);
	const character = useRef<Group>(null);
	const rigidBody = useRef<RapierRigidBody>(null);
	const controls = useRef<CameraControls>(null);
	const lastShoot = useRef<number>(0);

	const [animation, setAnimation] = useState<ActionName>("Idle");
	const [weapon] = useState<WeaponName>("AK");
	const [pos, setPos] = usePlayerState(state, "pos", new Vector3());
	const [health, setHealth] = usePlayerState(state, "health", 100);
	const [deaths, setDeaths] = usePlayerState(state, "deaths", 0);
	const [dead, setDead] = usePlayerState(state, "dead", false);
	// const [kills, setKills] = usePlayerState(state, "kills", 0);

	const scene = useThree((state) => state.scene);

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
		rigidBody.current?.setTranslation(spawnPos, true);
	};

	useEffect(() => {
		if (isHost()) spawnRandomly();
	}, []);

	useEffect(() => {});

	const handleMovement = (delta: number): number => {
		const angle = joystick.angle();

		if (joystick.isJoystickPressed() && angle && character.current) {
			setAnimation("Run");
			character.current.rotation.y = angle;

			const impulse = {
				x: Math.sin(angle) * MOVEMENT_SPEED * delta,
				y: 0,
				z: Math.cos(angle) * MOVEMENT_SPEED * delta,
			};
			rigidBody.current?.applyImpulse(impulse, true);
		} else {
			setAnimation("Idle");
		}

		if (isHost()) {
			setPos(rigidBody.current?.translation(), false);
		} else {
			// const newPos = vec3(rigidBody.current.translation()).lerp(pos, 1);
			rigidBody.current?.setTranslation(pos, true);
		}

		return angle;
	};

	const handleCamera = () => {
		const cameraDistanceY = window.innerWidth < 1024 ? 16 : 20;
		const cameraDistanceZ = window.innerWidth < 1024 ? 12 : 16;
		const playerWorldPos = vec3(rigidBody.current?.translation());
		controls.current?.setLookAt(
			playerWorldPos.x,
			playerWorldPos.y + (state.getState("dead") ? 12 : cameraDistanceY),
			playerWorldPos.z + (state.getState("dead") ? 2 : cameraDistanceZ),
			playerWorldPos.x,
			playerWorldPos.y + 1.5,
			playerWorldPos.z,
			true,
		);
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
					const newBullet: BulletType = {
						id: state.id + "-" + +new Date(),
						position: vec3(rigidBody.current?.translation()),
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

		if (dead) {
			setAnimation("Death");
			return;
		}

		const angle = handleMovement(delta);

		handleFire(angle);
	});

	const onEnter: IntersectionEnterHandler = ({ other }) => {
		if (isHost() && isBulletData(other.rigidBody?.userData) && health > 0) {
			const newHealth = health - other.rigidBody.userData.damage;

			if (newHealth <= 0) {
				setDeaths(deaths + 1);
				setDead(true);
				setHealth(0);
				rigidBody.current?.setEnabled(false);

				setTimeout(() => {
					spawnRandomly();
					rigidBody.current?.setEnabled(true);
					setHealth(100);
					setDead(false);
				}, 2000);

				onKilled(state.id, other.rigidBody.userData.player);
			} else {
				setHealth(newHealth);
			}
		}
	};

	return (
		<group ref={group} {...props}>
			{userPlayer && <CameraControls ref={controls} />}
			<RigidBody
				ref={rigidBody}
				colliders={false}
				linearDamping={12}
				lockRotations
				type={isHost() ? "dynamic" : "kinematicPosition"}
				onIntersectionEnter={onEnter}
			>
				<PlayerInfo
					name={state.getProfile().name}
					color={state.getProfile().color.hexString}
					health={health}
				/>
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
