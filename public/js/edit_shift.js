/* eslint-disable */
import axios from 'axios';
import { toast } from './alerts';

export const edit_shift = async (client, cleaner, date, hours, amount, paymentMethod, paidString, paymentDate, commission, notes, id) => {
	let paid;
	if (paidString === 'No') paid = false;
	else {
		paid = true;
	}
	try {
		const res = await axios({
			method: 'PATCH',
			url: `/api/v1/shifts/${id}`,
			data: {
				client,
				cleaner,
				date,
				hours,
				amount,
				paymentMethod,
				paid,
				paymentDate,
				commission,
				notes,
			},
		});

		if (res.data.status === 'success') {
			toast.fire({
				icon: 'success',
				title: 'Shift edited successfully',
			});
			window.setTimeout(() => {
				location.assign(`/shifts/${id}`);
			}, 2000);
		}
	} catch (err) {
		showAlert('error', err.response.data);
	}
};
