import { Billboard, Text } from "@react-three/drei";

type Props = {
	health: number;
	color: string;
	name: string;
};

const PlayerInfo = ({ health, color, name }: Props) => {
	return (
		<Billboard position-y={2.5}>
			<Text position-y={0.36} fontSize={0.4}>
				{name}
				<meshBasicMaterial color={color} />
			</Text>
			<mesh position-z={-0.1}>
				<planeGeometry args={[1, 0.2]} />
				<meshBasicMaterial color="black" transparent opacity={0.5} />
			</mesh>
			<mesh scale-x={health / 100} position-x={-0.5 * (1 - health / 100)}>
				<planeGeometry args={[1, 0.2]} />
				<meshBasicMaterial color="red" />
			</mesh>
		</Billboard>
	);
};

export default PlayerInfo;
