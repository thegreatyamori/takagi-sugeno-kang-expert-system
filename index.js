const SIZE_W = window.innerWidth;
const SIZE_H = window.innerHeight;
const ROAD_WIDTH = 70;
const ACCURACY = 20;
const RAY_LENGTH = 60;
const RAY_WIDTH = 3;
const STEP = 5;
const START_RADIUS = 100;
const ROBOT_LENGTH = 30;
const ROBOT_WIDTH = 10;
const FPS = 60;

function TSK_expert_system(array) {
	let y = [
		[1, 0, 0, 0, 0, 0, 0, 0,  0, 1, 1, 1,  0, 0, 0, 0,  0, 1, 1, 1,  0, 0, 0, 0,  0, 1, 1, 1,  0,  0,  0, 0],
		[0, 1, 1, 1, 1, 1, 1, 1, -1, 0, 0, 0, -1, 1, 1, 1, -1, 0, 0, 0, -1, 1, 1, 1, -1, 0, 0, 0, -1, -1, -1, 1]
	];

	let [R, RF, F, LF, L] = array;
	let [NR, NRF, NF, NLF, NL] = array.map(i => 1 - i);

	let t = [[L, NL], [LF, NLF], [F, NF], [RF, NRF], [R, NR]];
	let P = [];
	let i = 0;

	for (let a = 0; a < 2; a++) {
		for (let b = 0; b < 2; b++) {
			for (let c = 0; c < 2; c++) {
				for (let d = 0; d < 2; d++) {
					for (let e = 0; e < 2; e++) {
						P[i++] = Math.min(t[0][a], t[1][b], t[2][c], t[3][d], t[4][e]);
					}
				}
			}
		}
	}

	let yF = 0, yT = 0, sum_of_weights = 0;

	for (let i = 0; i < 32; i++) {
		yF += y[0][i] * P[i];
		yT += y[1][i] * P[i];

		sum_of_weights += P[i];
	}

	yF = yF / sum_of_weights;
	yT = yT / sum_of_weights;

	return [yF, yT];
}

let currX = 0;
let currY = 0;
let prevX = 0;
let prevY = 0;

let color = true;

let flag = false;
let dot_flag = false;

function set_color(bool) {
	color = bool;
}

function reset_paint(ctx) {
	ctx.fillRect(0, 0, SIZE_W, SIZE_H);

	ctx.fillStyle = "#fff";
	ctx.arc(START_RADIUS, 0.5 * SIZE_H, START_RADIUS, 0, 2 * Math.PI);
	ctx.fill();
}

function draw(ctx, color) {
	ctx.beginPath();
	ctx.moveTo(prevX, prevY);
	ctx.lineTo(currX, currY);
	ctx.strokeStyle = color;
	ctx.lineCap = "round";
	ctx.lineWidth = ROAD_WIDTH;
	ctx.stroke();
	ctx.closePath();
}

function find_xy(res, e, canvas) {
	let ctx = canvas.getContext("2d");

	if (res == 'down') {
		let rect = canvas.getBoundingClientRect();

		prevX = currX;
		prevY = currY;
		currX = e.clientX - rect.left;
		currY = e.clientY - rect.top;
	
		flag = true;
		dot_flag = true;

		if (dot_flag) {
			ctx.beginPath();
			ctx.fillStyle = "#fff";
			ctx.fillRect(currX, currY, 2, 2);
			ctx.closePath();
			dot_flag = false;
		}
	}

	if (res == 'up' || res == "out") {
		flag = false;
	}

	if (res == 'move') {
		if (flag) {
			let rect = canvas.getBoundingClientRect();

			prevX = currX;
			prevY = currY;
			currX = e.clientX - rect.left;
			currY = e.clientY - rect.top;
			draw(ctx, color ? "#fff" : "#000");
		}
	}
}

class Robot {
	constructor(x, y, angle) {
		this.x = x;
		this.y = y;
		this.prev_x = x;
		this.prev_y = y;
		this.angle = angle;
		this.len = ROBOT_LENGTH;
		this.width = ROBOT_WIDTH;
		this.sensors = [1, 1, 1, 1, 1];
	}

	draw(ctx) {
		ctx.beginPath();
		ctx.moveTo(this.x, this.y);
		ctx.lineWidth = this.width;
		ctx.lineTo(this.x + Math.cos(this.angle - Math.PI) * this.len, this.y + Math.sin(this.angle - Math.PI) * this.len);
		ctx.stroke();
		ctx.lineWidth = 1;

		this.draw_rays(ctx);
	}

	draw_rays(ctx) {
		ctx.lineWidth = RAY_WIDTH;
		
		for (let i = -2; i <= 2; i++) {
			let dir = this.angle + Math.PI / 4 * i;

			let delta_x = Math.cos(dir) * RAY_LENGTH;
			let delta_y = Math.sin(dir) * RAY_LENGTH;

			let mid_x = this.sensors[i+2] * delta_x;
			let mid_y = this.sensors[i+2] * delta_y;
			
			ctx.beginPath();
			ctx.moveTo(this.x, this.y);
			ctx.lineTo(this.x + mid_x, this.y + mid_y);
			ctx.strokeStyle = "#0f0";
			ctx.stroke();

			ctx.beginPath();
			ctx.moveTo(this.x + mid_x, this.y + mid_y);
			ctx.lineTo(this.x + delta_x, this.y + delta_y);
			ctx.strokeStyle = "#f00";
			ctx.stroke();
		}
		
		ctx.lineWidth = 1;
		ctx.strokeStyle = "#000";
	}

	draw_trace(ctx, color = "#f0f") {
		ctx.beginPath();
		ctx.moveTo(this.prev_x, this.prev_y);
		ctx.lineTo(this.x, this.y);
		ctx.strokeStyle = color;
		ctx.lineWidth = 1;
		ctx.stroke();
		ctx.strokeStyle = "#000";
	}

	move([yF, yT]) {
		this.prev_x = this.x;
		this.prev_y = this.y;

		this.angle += Math.atan2(yT, yF);
		this.x += STEP * Math.cos(this.angle);
		this.y += STEP * Math.sin(this.angle);
	}

	set_sensors(map) {
		this.sensors.length = 5;
		this.sensors.fill(0);

		for (let i = -2; i <= 2; i++) {
			let dir = this.angle + (Math.PI / 4 * i);
			let radius = 1;
			
			while (radius <= ACCURACY) {
				let len = radius / ACCURACY * RAY_LENGTH;
				let x = Math.floor(this.x + Math.cos(dir) * len);
				let y = Math.floor(this.y + Math.sin(dir) * len);

				let v = map.data[(SIZE_W * 4) * y + 4 * x];

				if (v == 0 || radius == ACCURACY) {
					this.sensors[i + 2] = radius / ACCURACY;
					break;
				}

				radius++;
			}
		}
	}
}

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
