/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

export const edit_user = async (name, email, street, city, postcode, phone, deposit, id) => {
	let address;
	if (street && city && postcode) {
		address = { street, city, postcode };
	} else {
		address = { street: '', city: '', postcode: '' };
	}
	if (!deposit) {
		deposit = 'N/A';
	}
	try {
		const res = await axios({
			method: 'PATCH',
			url: `/api/v1/users/updateAccount/${id}`,
			data: {
				name,
				email,
				address,
				phone,
				deposit,
			},
		});
		if (res.data.status === 'success') {
			showAlert('success', 'User edited successfully');
			window.setTimeout(() => {
				location.assign(`/profile/${id}`);
			}, 1500);
		}
	} catch (err) {
		showAlert('error', err.response.data);
	}
};
