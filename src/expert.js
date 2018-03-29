export default function TSK_expert_system(array) {
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