import { Suspense, useMemo, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { KeyboardControls, SoftShadows } from "@react-three/drei";
import { Physics } from "@react-three/rapier";
import Experience from "./components/Experience";

function App() {
	const map = useMemo(
		() => [
			{ name: "forward", keys: ["ArrowUp", "KeyW"] },
			{ name: "backward", keys: ["ArrowDown", "KeyS"] },
			{ name: "leftward", keys: ["ArrowLeft", "KeyA"] },
			{ name: "rightward", keys: ["ArrowRight", "KeyD"] },
			{ name: "jump", keys: ["Space"] },
			{ name: "run", keys: ["Shift"] },
		],
		[],
	);

	return (
		<KeyboardControls map={map}>
			<Canvas
				id="Canvas"
				shadows
				camera={{ position: [0, 30, 0], fov: 30 }}
			>
				<color attach="background" args={["#ececec"]} />
				<SoftShadows size={42} />

				<Suspense>
					<Physics debug>
						<Experience />
					</Physics>
				</Suspense>

				<EffectComposer>
					<Bloom luminanceThreshold={1} intensity={1.5} mipmapBlur />
				</EffectComposer>
			</Canvas>
		</KeyboardControls>
	);
}

export default App;
