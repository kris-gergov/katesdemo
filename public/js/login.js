/* eslint-disable */
import axios from 'axios';
import { toast } from './alerts';

export const login = async (email, password) => {
	try {
		const res = await axios({
			method: 'POST',
			url: '/api/v1/users/login',
			data: {
				email,
				password,
			},
		});

		if (res.data.status === 'success') {
			toast.fire({
				icon: 'success',
				title: 'Logged in successfully',
			});
			window.setTimeout(() => {
				location.assign('https://katescleaning.herokuapp.com/');
			}, 1000);
		}
	} catch (err) {
		showAlert('error', err.response.data);
	}
};

export const logout = async () => {
	try {
		const res = await axios({
			method: 'GET',
			url: '/api/v1/users/logout',
		});

		if (res.data.status === 'success') {
			toast.fire({
				icon: 'success',
				title: 'Logged out successfully',
			});
			window.setTimeout(() => {
				location.assign('/login');
			}, 1000);
		}
	} catch (err) {
		showAlert('error', err.response.data);
	}
};
