/* eslint-disable */
import axios from 'axios';
import { toast } from './alerts';

export const add_shift = async (client, cleaner, date, hours, amount, paymentMethod, commission, notes) => {
	try {
		const res = await axios({
			method: 'POST',
			url: '/api/v1/shifts/',
			data: {
				client,
				cleaner,
				date,
				hours,
				amount,
				paymentMethod,
				commission,
				notes,
			},
		});
		if (res.data.status === 'success') {
			toast.fire({
				icon: 'success',
				title: 'Shift added successfully',
			});
			window.setTimeout(() => {
				location.assign('/');
			}, 1500);
		}
	} catch (err) {
		toast.fire({
			icon: 'error',
			title: err.response.data,
		});
	}
};
