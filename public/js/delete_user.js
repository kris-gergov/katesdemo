/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

export const delete_user = async id => {
	try {
		const res = await axios({
			method: 'DELETE',
			url: `/api/v1/users/deleteAccount/${id}`,
		});

		if (res.data.status === 'success') {
			showAlert('success', 'User deleted successfully');
			window.setTimeout(() => {
				location.reload();
			}, 1500);
		}
	} catch (err) {
		showAlert('error', err.response.data);
	}
};
