import TSK_expert_system from "./src/expert";
import Robot from "./src/robot";
import {set_color, find_xy, reset_paint} from "./src/painter";
import {SIZE_W, SIZE_H, ROAD_WIDTH, ACCURACY, RAY_LENGTH, STEP, START_RADIUS, FPS} from "./src/constants";

let map;
let b_and_w = true;

const robot = new Robot(START_RADIUS, SIZE_H / 2, 0);

const $paint   = document.querySelector("#paint");
const $robot   = document.querySelector("#robot");
const $b_and_w = document.querySelector("#b_and_w");
const $launch  = document.querySelector("#launch");

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
	find_xy("move", e, p, $paint);
}, false);
	
$robot.addEventListener("mousedown", e => {
	find_xy("down", e, p, $paint);
}, false);
	
$robot.addEventListener("mouseup", e => {
	find_xy("up", e, p, $paint);
}, false);
	
$robot.addEventListener("mouseout", e => {
	find_xy("out", e, p, $paint);
}, false);

$b_and_w.addEventListener("click", () => {
	b_and_w = !b_and_w;

	set_color(b_and_w);

	$b_and_w.value = `change to ${b_and_w ? "black" : "white"}`;
});