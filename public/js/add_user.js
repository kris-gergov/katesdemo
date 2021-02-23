/* eslint-disable */
import axios from 'axios';
import { toast } from './alerts';

export const add_user = async (name, email, street, city, postcode, phone, deposit, password, passwordConfirm, role) => {
	try {
		let address;
		if (street && city && postcode) {
			address = { street, city, postcode };
		} else {
			address = { street: '', city: '', postcode: '' };
		}
		if (!deposit) {
			deposit = 'N/A';
		}

		const res = await axios({
			method: 'POST',
			url: '/api/v1/users/register',
			data: {
				name,
				email,
				address,
				phone,
				password,
				passwordConfirm,
				deposit,
				role,
			},
		});
		if (res.data.status === 'success') {
			toast.fire({
				icon: 'success',
				title: 'User added successfully',
			});
			window.setTimeout(() => {
				location.assign('/');
			}, 1500);
		}
	} catch (err) {
		console.log(err.response);
		toast.fire({
			icon: 'error',
			title: err.response.data.message,
		});
	}
};
