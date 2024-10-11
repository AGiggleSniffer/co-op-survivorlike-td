import { Vector3 } from "@react-three/fiber";
import { PlayerProfile } from "playroomkit";

type Props = {
    player: PlayerProfile;
    angle: number;
    position: Vector3;
    onHit: Function;
}

const Bullet = ({player, angle, position, onHit}: Props) => {
  return (
    <group></group>
  )
}

export default Bullet