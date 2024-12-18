/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
Command: npx gltfjsx@6.5.2 ./public/models/Character_Soldier.gltf -o ./src/components/PlayerCharacter.tsx -t s 
*/

import * as THREE from "three";
import { useEffect, useMemo, useRef } from "react";
import { useGraph } from "@react-three/fiber";
import { useGLTF, useAnimations } from "@react-three/drei";
import { GLTF, SkeletonUtils } from "three-stdlib";
import { WeaponName, WEAPONS } from "../../constants";

export type ActionName =
	| "Death"
	| "Duck"
	| "HitReact"
	| "Idle"
	| "Idle_Shoot"
	| "Jump"
	| "Jump_Idle"
	| "Jump_Land"
	| "No"
	| "Punch"
	| "Run"
	| "Run_Gun"
	| "Run_Shoot"
	| "Walk"
	| "Walk_Shoot"
	| "Wave"
	| "Yes";

interface GLTFAction extends THREE.AnimationClip {
	name: ActionName;
}

type GLTFResult = GLTF & {
	nodes: {
		Body: THREE.Mesh;
		Head: THREE.Mesh;

		GrenadeLauncher: THREE.Object3D;
		AK: THREE.Object3D;
		Knife_1: THREE.Object3D;
		Knife_2: THREE.Object3D;
		Pistol: THREE.Object3D;
		Revolver: THREE.Object3D;
		Revolver_Small: THREE.Object3D;
		RocketLauncher: THREE.Object3D;
		ShortCannon: THREE.Object3D;
		SMG: THREE.Object3D;
		Shotgun: THREE.Object3D;
		Shovel: THREE.Object3D;
		Sniper: THREE.Object3D;
		Sniper_2: THREE.Object3D;

		Cube003: THREE.Mesh;
		Cube003_1: THREE.Mesh;
		Cube003_2: THREE.Mesh;
		ShoulderPadL: THREE.Mesh;
		Cube276: THREE.Mesh;
		Cube276_1: THREE.Mesh;
		Cube276_2: THREE.Mesh;
		Cube276_3: THREE.Mesh;
		Cylinder019: THREE.Mesh;
		Cylinder019_1: THREE.Mesh;
		Cylinder019_2: THREE.Mesh;
		Cylinder019_3: THREE.Mesh;
		Cube300: THREE.Mesh;
		Cube300_1: THREE.Mesh;
		Cube300_2: THREE.Mesh;
		Cube300_3: THREE.Mesh;
		Cylinder027: THREE.Mesh;
		Cylinder027_1: THREE.Mesh;
		Cylinder027_2: THREE.Mesh;
		Cube022: THREE.Mesh;
		Cube022_1: THREE.Mesh;
		Cube022_2: THREE.Mesh;
		Cube016: THREE.Mesh;
		Cube016_1: THREE.Mesh;
		Cube016_2: THREE.Mesh;
		Cube016_3: THREE.Mesh;
		Cube290: THREE.Mesh;
		Cube290_1: THREE.Mesh;
		Cube290_2: THREE.Mesh;
		Cube290_3: THREE.Mesh;
		Cube298: THREE.Mesh;
		Cube298_1: THREE.Mesh;
		Cube298_2: THREE.Mesh;
		Cube298_3: THREE.Mesh;
		Cube000: THREE.Mesh;
		Cube000_1: THREE.Mesh;
		Cube000_2: THREE.Mesh;
		Cube283: THREE.Mesh;
		Cube283_1: THREE.Mesh;
		Cube283_2: THREE.Mesh;
		Cube283_3: THREE.Mesh;
		Cylinder025: THREE.Mesh;
		Cylinder025_1: THREE.Mesh;
		Cylinder025_2: THREE.Mesh;
		Cube052: THREE.Mesh;
		Cube052_1: THREE.Mesh;
		Cube052_2: THREE.Mesh;
		Cube052_3: THREE.Mesh;
		Cube312: THREE.Mesh;
		Cube312_1: THREE.Mesh;
		Cube312_2: THREE.Mesh;
		Cube282: THREE.Mesh;
		Cube282_1: THREE.Mesh;
		Cube282_2: THREE.Mesh;
		ShoulderPadR: THREE.Mesh;
		Cube004: THREE.SkinnedMesh;
		Cube004_1: THREE.SkinnedMesh;
		Cube004_2: THREE.SkinnedMesh;
		Cube004_3: THREE.SkinnedMesh;
		Cube004_4: THREE.SkinnedMesh;
		Root: THREE.Bone;
	};
	materials: {
		Grey: THREE.MeshStandardMaterial;
		Character_Main: THREE.MeshStandardMaterial;
		Black: THREE.MeshStandardMaterial;
		Grey2: THREE.MeshStandardMaterial;
		Wood: THREE.MeshStandardMaterial;
		DarkGrey: THREE.MeshStandardMaterial;
		// Grey: THREE.MeshStandardMaterial;
		// DarkGrey: THREE.MeshStandardMaterial;
		// Wood: THREE.MeshStandardMaterial;
		// Grey2: THREE.MeshStandardMaterial;
		LightGrey: THREE.MeshStandardMaterial;
		DarkWood: THREE.MeshStandardMaterial;
		// Black: THREE.MeshStandardMaterial;
		Red: THREE.MeshStandardMaterial;
		// DarkWood: THREE.MeshStandardMaterial;
		Skin: THREE.MeshStandardMaterial;
		// DarkGrey: THREE.MeshStandardMaterial;
		Pants: THREE.MeshStandardMaterial;
		// Character_Main: THREE.MeshStandardMaterial;
		// Black: THREE.MeshStandardMaterial;
	};
	animations: GLTFAction[];
};

type Props = JSX.IntrinsicElements["group"] & {
	color: string;
	animation: ActionName;
	weapon: WeaponName;
};

const CharacterPlayer = ({
	color = "black",
	animation = "Idle",
	weapon = "AK",
	...props
}: Props) => {
	const group = useRef<THREE.Group>(null!);
	const { scene, materials, animations } = useGLTF(
		"./models/Character_Soldier.gltf",
	);
	const clone = useMemo(() => SkeletonUtils.clone(scene), [scene]);
	const { nodes } = useGraph(clone) as GLTFResult;
	const { actions } = useAnimations(animations, group);

	if (actions["Death"]) {
		actions["Death"].loop = THREE.LoopOnce;
		actions["Death"].clampWhenFinished = true;
	}

	useEffect(() => {
		actions[animation]?.reset().fadeIn(0.2).play();
		return () => {
			actions[animation]?.fadeOut(0.2);
		};
	}, [animation]);

	const playerColorMaterial = useMemo(
		() =>
			new THREE.MeshStandardMaterial({
				color: new THREE.Color(color),
			}),
		[color],
	);

	useEffect(() => {
		// HIDING NON-SELECTED WEAPONS
		WEAPONS.forEach((wp) => {
			const isCurrentWeapon = wp === weapon;
			nodes[wp].visible = isCurrentWeapon;
		});

		// ASSIGNING CHARACTER COLOR
		nodes.Body.traverse((child) => {
			if (
				child instanceof THREE.Mesh &&
				child.material.name === "Character_Main"
			) {
				child.material = playerColorMaterial;
			}

			if (child instanceof THREE.Mesh) {
				child.castShadow = true;
				child.receiveShadow = true;
			}
		});
		nodes.Head.traverse((child) => {
			if (
				child instanceof THREE.Mesh &&
				child.material.name === "Character_Main"
			) {
				child.material = playerColorMaterial;
			}
		});
		clone.traverse((child) => {
			if (
				child instanceof THREE.Mesh &&
				child.material.name === "Character_Main"
			) {
				child.material = playerColorMaterial;
			}

			if (child instanceof THREE.Mesh) {
				child.castShadow = true;
			}
		});
	}, [nodes, clone]);

	return (
		<group ref={group} {...props} dispose={null} >
			<group name="Scene">
				<group name="CharacterArmature">
					<primitive object={nodes.Root} />
					<group name="Body_1">
						<skinnedMesh
							name="Cube004"
							geometry={nodes.Cube004.geometry}
							material={materials.Skin}
							skeleton={nodes.Cube004.skeleton}
							castShadow
						/>
						<skinnedMesh
							name="Cube004_1"
							geometry={nodes.Cube004_1.geometry}
							material={materials.DarkGrey}
							skeleton={nodes.Cube004_1.skeleton}
							castShadow
						/>
						<skinnedMesh
							name="Cube004_2"
							geometry={nodes.Cube004_2.geometry}
							material={materials.Pants}
							skeleton={nodes.Cube004_2.skeleton}
							castShadow
						/>
						<skinnedMesh
							name="Cube004_3"
							geometry={nodes.Cube004_3.geometry}
							material={materials.Character_Main}
							skeleton={nodes.Cube004_3.skeleton}
							castShadow
						/>
						<skinnedMesh
							name="Cube004_4"
							geometry={nodes.Cube004_4.geometry}
							material={materials.Black}
							skeleton={nodes.Cube004_4.skeleton}
							castShadow
						/>
					</group>
				</group>
			</group>
		</group>
	);
};

useGLTF.preload("./models/Character_Soldier.gltf");

export default CharacterPlayer;
