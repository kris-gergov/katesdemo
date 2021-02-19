/* eslint-disable */
import '@babel/polyfill';
import swal from 'sweetalert2';
import { login, logout } from './login';
import { add_shift } from './add_shift';
import { edit_shift } from './edit_shift';
import { delete_shift } from './delete_shift';
import { add_user } from './add_user';
import { edit_user } from './edit_user';
import { delete_user } from './delete_user';
import { summary } from './summary';
import { sign } from 'jsonwebtoken';

// DOM elements
const loginForm = document.querySelector('.login__form');
const addShiftForm = document.querySelector('.add_shift__form');
const editShiftForm = document.querySelector('.edit_shift__form');
const addUserForm = document.querySelector('.add_user__form');
const editUserForm = document.querySelector('.edit_user__form');
const summaryForm = document.querySelector('.summary__form');
const logoutBtn = document.querySelector('.user-nav__user-btn-logout');
const deleteShiftBtns = document.querySelectorAll('.flat-table__link-delete');
const deleteUserBtns = document.querySelectorAll('.flat-table__link-delete-user');

if (loginForm) {
	loginForm.addEventListener('submit', e => {
		e.preventDefault();
		const email = document.getElementById('email').value;
		const password = document.getElementById('password').value;
		login(email, password);
	});
}

if (addShiftForm) {
	addShiftForm.addEventListener('submit', e => {
		e.preventDefault();
		const client = document.getElementById('client').value;
		const cleaner = document.getElementById('cleaner').value;
		const date = document.getElementById('date').value;
		const hours = document.getElementById('hours').value;
		const amount = document.getElementById('amount').value;
		const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
		const commission = document.getElementById('commission').value;
		const notes = document.getElementById('notes').value;
		add_shift(client, cleaner, date, hours, amount, paymentMethod, commission, notes);
	});
}

if (editShiftForm) {
	editShiftForm.addEventListener('submit', e => {
		e.preventDefault();
		const client = document.getElementById('client').value;
		const cleaner = document.getElementById('cleaner').value;
		const date = document.getElementById('date').value;
		const hours = document.getElementById('hours').value;
		const amount = document.getElementById('amount').value;
		const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
		const paidString = document.querySelector('input[name="paid"]:checked').value;
		const paymentDate = document.getElementById('paymentDate').value;
		const commission = document.getElementById('commission').value;
		const notes = document.getElementById('notes').value;
		const id = document.getElementById('id').value;
		edit_shift(client, cleaner, date, hours, amount, paymentMethod, paidString, paymentDate, commission, notes, id);
	});
}

if (addUserForm) {
	addUserForm.addEventListener('submit', e => {
		e.preventDefault();
		let street,
			city,
			postcode,
			deposit = '';
		const name = document.getElementById('name').value;
		const email = document.getElementById('email').value;
		const role = document.getElementById('role').value;
		if (role === 'client') {
			street = document.getElementById('street').value;
			city = document.getElementById('city').value;
			postcode = document.getElementById('postcode').value;
		}
		if (role === 'cleaner') {
			deposit = document.getElementById('deposit').value;
		}
		const phone = document.getElementById('phone').value;
		const password = document.getElementById('password').value;
		const passwordConfirm = document.getElementById('passwordConfirm').value;

		add_user(name, email, street, city, postcode, phone, deposit, password, passwordConfirm, role);
	});
}

if (editUserForm) {
	editUserForm.addEventListener('submit', e => {
		e.preventDefault();
		const name = document.getElementById('name').value;
		const email = document.getElementById('email').value;
		const street = document.getElementById('street');
		if (street) {
			street = street.value;
		}
		let city = document.getElementById('city');
		if (city) {
			city = city.value;
		}
		let postcode = document.getElementById('postcode');
		if (postcode) {
			postcode = postcode.value;
		}
		const phone = document.getElementById('phone').value;
		let deposit = document.getElementById('deposit');
		if (deposit) {
			deposit = deposit.value;
		}
		const id = document.getElementById('id').value;
		edit_user(name, email, street, city, postcode, phone, deposit, id);
	});
}

if (summaryForm) {
	summaryForm.addEventListener('submit', e => {
		e.preventDefault();
		const from = document.getElementById('from').value;
		const to = document.getElementById('to').value;
		const client = document.getElementById('client').value;
		const cleaner = document.getElementById('cleaner').value;
		const field = document.getElementById('field').value;
		summary(from, to, client, cleaner, field);
	});
}

if (logoutBtn) {
	logoutBtn.addEventListener('click', logout);
}

if (deleteShiftBtns) {
	deleteShiftBtns.forEach(function (deleteShiftBtn) {
		deleteShiftBtn.addEventListener('click', function () {
			swal.fire({
				title: 'Are you sure?',
				text: 'Once deleted, you will not be able to recover this shift.',
				icon: 'warning',
				showCancelButton: true,
				confirmButtonColor: '#3085d6',
				cancelButtonColor: '#d33',
				confirmButtonText: 'Yes, delete it!',
			}).then(result => {
				if (result.isConfirmed) {
					delete_shift(deleteShiftBtn.getAttribute('href'));
					swal.fire('Deleted!', 'Shift has been deleted.', 'success');
					window.setTimeout(() => {
						location.assign(`/`);
					}, 1500);
				}
			});
		});
	});
}

if (deleteUserBtns) {
	deleteUserBtns.forEach(function (deleteUserBtn) {
		deleteUserBtn.addEventListener('click', function () {
			swal.fire({
				title: 'Are you sure?',
				text: 'Once deleted, you will not be able to recover this user.',
				icon: 'warning',
				showCancelButton: true,
				confirmButtonColor: '#3085d6',
				cancelButtonColor: '#d33',
				confirmButtonText: 'Yes, delete it!',
			}).then(result => {
				if (result.isConfirmed) {
					delete_user(deleteUserBtn.getAttribute('href'));
					swal.fire('Deleted!', 'User has been deleted.', 'success');
					window.setTimeout(() => {
						location.assign(`/`);
					}, 1500);
				}
			});
		});
	});
}
