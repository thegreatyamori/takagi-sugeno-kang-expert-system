import {ROAD_WIDTH, START_RADIUS, SIZE_H, SIZE_W} from "./constants";

let currX = 0;
let currY = 0;
let prevX = 0;
let prevY = 0;

let color = true;

let flag = false;
let dot_flag = false;

export function set_color(bool) {
	color = bool;
}

export function reset_paint(ctx) {
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

export function find_xy(res, e, canvas) {
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