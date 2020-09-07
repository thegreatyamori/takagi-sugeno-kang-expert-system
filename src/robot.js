import {ACCURACY, RAY_LENGTH, ROBOT_LENGTH, ROBOT_WIDTH, SIZE_W, STEP, RAY_WIDTH} from "./constants.js";

export default class Robot {
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
