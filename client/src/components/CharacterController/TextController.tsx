import { Joystick, PlayerState } from "playroomkit";
import React, { useRef, useState } from "react";
import { BulletType } from "../shared.types";
import CharacterPlayer, { ActionName } from "./CharacterPlayer";
import { WeaponName } from "../../constants";
import Ecctrl, { EcctrlAnimation } from "ecctrl";
import { useFrame } from "@react-three/fiber";
import {
	CapsuleCollider,
	RapierRigidBody,
	RigidBody,
} from "@react-three/rapier";

type Props = {
	state: PlayerState;
	joystick: Joystick;
	userPlayer: Boolean;
	onFire: (b: BulletType) => void;
	onKilled: (id: string, p: string) => void;
	props?: JSX.IntrinsicElements["group"];
};

const TextController = ({
	state,
	joystick,
	userPlayer,
	onFire,
	onKilled,
	...props
}: Props) => {
	const [animation, setAnimation] = useState<ActionName>("Idle");
	const [weapon] = useState<WeaponName>("AK");
	const rb = useRef<RapierRigidBody>(null);

	useFrame(() => {
		if (!userPlayer) {
			const pos = state.getState("pos");
			if (pos) {
				rb.current?.setTranslation(pos, false);
			}

			const rot = state.getState("rot");
			if (rot) {
				rb.current?.setRotation(rot, false);
			}
			return;
		}

		state.setState("pos", rb.current?.translation());
		state.setState("rot", rb.current?.rotation());
	});

	const characterURL = "/models/Character_Soldier.gltf";
	const animationSet = {
		idle: "Idle",
		walk: "Walk",
		run: "Run",
		jump: "Jump",
		jumpIdle: "Jump_Idle",
		jumpLand: "Jump_Land",
	};

	return (
		<>
			{userPlayer ? (
				<Ecctrl
					ref={rb}
					animated
					capsuleHalfHeight={0.7}
					capsuleRadius={0.6}
					camInitDis={-15}
					floatHeight={0}
					autoBalanceDampingC={0.8}
					autoBalanceDampingOnY={0.1}
				>
					<EcctrlAnimation
						characterURL={characterURL} // Must have property
						animationSet={animationSet} // Must have property
					>
						<CharacterPlayer
							color={state.getProfile().color.hexString}
							animation={animation}
							weapon={weapon}
							position={[0, -1.28, 0]}
						/>
					</EcctrlAnimation>
				</Ecctrl>
			) : (
				<RigidBody ref={rb} colliders={false} type="kinematicPosition">
					<CharacterPlayer
						color={state.getProfile().color.hexString}
						animation={animation}
						weapon={weapon}
						position={[0, -1.28, 0]}
					/>
					<CapsuleCollider args={[0.7, 0.6]} />
				</RigidBody>
			)}
		</>
	);
};

export default TextController;
