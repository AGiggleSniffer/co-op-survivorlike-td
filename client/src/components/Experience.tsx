import { useEffect, useState } from "react";
import { Environment } from "@react-three/drei";
import {
	insertCoin,
	Joystick,
	myPlayer,
	onPlayerJoin,
	PlayerState,
} from "playroomkit";
import Map from "./Map";
import CharacterController from "./CharacterController";

type Player = {
	state: PlayerState;
	joystick: Joystick;
};

type Bullet = {
	id: number;
	position: number;
};

const Experience = () => {
	const [players, setPlayers] = useState<Player[]>([]);
	const [bullets, setBullets] = useState<Bullet[]>([]);
	const [hits, setHits] = useState<Bullet[]>([]);

	const onFire = () => {
		setBullets((bullet) => [...bullets, bullet] as Bullet[]);
	};

	const onHit = (bulletId: number) => {
		setBullets((bullets) =>
			bullets.filter((bullet) => bullet.id !== bulletId),
		);
		// setHits((hits) => [...hits, { id: bulletId, position }]);
	};

	const start = async () => {
		// Start the game
		await insertCoin();

		// Create a joystick controller for each joining player
		onPlayerJoin((state) => {
			// Joystick will only create UI for current player
			// For others, it will only sync their state
			const joystick = new Joystick(state, {
				type: "angular",
				buttons: [{ id: "fire", label: "Fire" }],
			});
			const newPlayer = { state, joystick };
			state.setState("health", 100);
			state.setState("deaths", 0);
			state.setState("kills", 0);
			setPlayers((playersArray) => [...playersArray, newPlayer]);
			state.onQuit(() => {
				setPlayers((playersArray) =>
					playersArray.filter((p) => p.state.id !== state.id),
				);
			});
		});
	};

	useEffect(() => {
		start();
	}, []);

	return (
		<>
			<directionalLight
				position={[25, 18, -25]}
				intensity={0.3}
				castShadow
				shadow-camera-near={0}
				shadow-camera-far={80}
				shadow-camera-left={-30}
				shadow-camera-right={30}
				shadow-camera-top={25}
				shadow-camera-bottom={-25}
				shadow-mapSize-height={4096}
				shadow-mapSize-width={4096}
				shadow-bias={-0.0001}
			/>
			<Map />
			{players.map(({ state, joystick }, idx) => (
				<CharacterController
					key={state.id}
					position-x={idx * 2}
					state={state}
					joystick={joystick}
					userPlayer={state.id === myPlayer().id}
					onFire={onFire}
				/>
			))}
			{bullets.map((bullet) => (
				<Bullet
					key={bullet.id}
					{...bullet}
					onHit={() => onHit(bullet.id)}
				/>
			))}
			<Environment preset="sunset" />
		</>
	);
};

export default Experience;
