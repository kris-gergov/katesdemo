/* eslint-disable */
import axios from 'axios';
import { toast } from './alerts';

export const delete_shift = async id => {
	try {
		const res = await axios({
			method: 'DELETE',
			url: `/api/v1/shifts/${id}`,
		});

		if (res.data.status === 'success') {
			toast.fire({
				icon: 'success',
				title: 'Shift deleted successfully',
			});
			window.setTimeout(() => {
				location.reload();
			}, 2000);
		}
	} catch (err) {
		showAlert('error', err.response.data);
	}
};
