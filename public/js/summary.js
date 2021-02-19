/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';
import swal from 'sweetalert2';

export const summary = async (from, to, client, cleaner, field) => {
	try {
		const res = await axios({
			method: 'POST',
			url: '/api/v1/shifts/summary',
			data: {
				from,
				to,
				client,
				cleaner,
				field,
			},
		});

		if (res.data.status === 'success') {
			swal.fire({
				title: 'Summary results:',
				html: `<br><b>Date range:</b> ${res.data.data.summary.range}, <br><br>
				<b>${res.data.data.summary.field}:</b> £${res.data.data.summary.total} <br><br>
				<b>Number of shifts:</b> ${res.data.data.summary.num}`,
				icon: 'success',
				showCancelButton: true,
				showConfirmButton: false,
				cancelButtonColor: '#3085d6',
				cancelButtonText: 'Close',
			});
		} else {
			swal.fire({
				title: 'No results found:',
				html: `Please select different dates.`,
				icon: 'warning',
				showCancelButton: true,
				showConfirmButton: false,
				cancelButtonColor: '#3085d6',
				cancelButtonText: 'Close',
			});
		}
	} catch (err) {
		showAlert('error', err.response.data);
	}
};
