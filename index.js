import TSK_expert_system from "./src/expert.js";
import Robot from "./src/robot.js";
import {
	set_color, 
	find_xy, 
	reset_paint
} from "./src/painter.js";

import {
	SIZE_W, 
	SIZE_H, 
	START_RADIUS, 
	FPS
} from "./src/constants.js";

let map;
let bw = true;

const robot = new Robot(START_RADIUS, SIZE_H / 2, 0);

const $paint  = document.querySelector("#paint");
const $robot  = document.querySelector("#robot");
const $bw     = document.querySelector("#bw");
const $launch = document.querySelector("#launch");

const p = $paint.getContext("2d");
const r = $robot.getContext("2d");

$paint.width  = SIZE_W;
$paint.height = SIZE_H;

$robot.width  = SIZE_W;
$robot.height = SIZE_H;

let fps, fpsInterval, startTime, now, then, elapsed;

function animate() {
	requestAnimationFrame(animate);

	now = Date.now();
	elapsed = now - then;

	if (elapsed > fpsInterval) {
		then = now - (elapsed % fpsInterval);
		r.clearRect(0, 0, SIZE_W, SIZE_H);

		robot.move(TSK_expert_system(robot.sensors));
		robot.draw_trace(p);
		robot.set_sensors(map);
		robot.draw(r);
	}
}

reset_paint(p);
robot.draw(r);
	
$launch.addEventListener("click", e => {
	map = p.getImageData(0, 0, SIZE_W, SIZE_H);

	fpsInterval = 1000 / FPS;
	then = Date.now();
	startTime = then;
	animate();
});

$robot.addEventListener("mousemove", e => {
	find_xy("move", e, $paint);
}, false);
	
$robot.addEventListener("mousedown", e => {
	find_xy("down", e, $paint);
}, false);
	
$robot.addEventListener("mouseup", e => {
	find_xy("up", e, $paint);
}, false);
	
$robot.addEventListener("mouseout", e => {
	find_xy("out", e, $paint);
}, false);

$bw.addEventListener("click", () => {
	bw = !bw;
	set_color(bw);
	$bw.value = `change to ${bw ? "black" : "white"}`;
});
