const adminPhone = '8962'; // 관리자 전화번호
let users = JSON.parse(localStorage.getItem('users')) || {};
let reservations = JSON.parse(localStorage.getItem('reservations')) || {};
let loggedInUser = null;
let selectedDate = null;
let selectedTime = null;
let selectedUser = null; // 관리자가 선택한 사용자

document.addEventListener('DOMContentLoaded', () => {
    if (Object.keys(users).length === 0) {
        users[adminPhone] = { name: '관리자', phone: adminPhone, password: '8962', isAdmin: true, remaining: 0 };
        localStorage.setItem('users', JSON.stringify(users));
    }

    flatpickr("#calendar", {
        locale: "ko",
        dateFormat: "Y-m-d",
        onChange: function(selectedDates, dateStr, instance) {
            selectedDate = dateStr;
            document.getElementById('selectedDate').innerText = selectedDate;
            generateTimeTable(selectedDate);
        }
    });

    flatpickr("#adminCalendar", {
        locale: "ko",
        dateFormat: "Y-m-d",
        onChange: function(selectedDates, dateStr, instance) {
            selectedDate = dateStr;
            document.getElementById('selectedDate').innerText = selectedDate;
            updateReservations();
        }
    });

    document.getElementById('login').style.display = 'block'; // 로그인 화면 표시
});

function login() {
    const phone = document.getElementById('phone').value;
    const passwordInput = document.getElementById('password');
    const loginError = document.getElementById('loginError');
    loginError.style.display = 'none';

    if (phone === adminPhone) {
        passwordInput.style.display = 'block';
        const password = passwordInput.value;
        if (users[phone] && users[phone].password === password) {
            loggedInUser = users[phone];
            showAdminScreen();
        } else {
            loginError.style.display = 'block';
        }
        return;
    }

    if (users[phone]) {
        loggedInUser = users[phone];
        showUserScreen();
    } else {
        alert('등록되지 않은 사용자입니다.');
    }
}

function showAdminScreen() {
    document.getElementById('login').style.display = 'none';
    document.getElementById('admin').style.display = 'block';
    updateUserList();
}

function showUserScreen() {
    document.getElementById('login').style.display = 'none';
    document.getElementById('user').style.display = 'block';
    document.getElementById('userNameDisplay').innerText = loggedInUser.name;
    document.getElementById('userPhoneDisplay').innerText = loggedInUser.phone;
    document.getElementById('remaining').innerText = loggedInUser.remaining;
    generateUserCalendar();
}

function registerUser() {
    const name = document.getElementById('userName').value;
    const phone = document.getElementById('userPhone').value;
    if (!name || !phone) {
        alert('모든 필드를 입력하세요.');
        return;
    }
    users[phone] = { name, phone, remaining: 0 };
    localStorage.setItem('users', JSON.stringify(users));
    alert('사용자가 등록되었습니다.');
    updateUserList();
}

function updateRemaining() {
    const remaining = document.getElementById('remainingCount').value;
    if (!selectedUser) {
        alert('사용자를 선택하세요.');
        return;
    }
    users[selectedUser].remaining = parseInt(remaining, 10);
    localStorage.setItem('users', JSON.stringify(users));
    alert('잔여 횟수가 업데이트되었습니다.');
    updateUserList();
}

function updateUserList() {
    const userList = document.getElementById('userList');
    userList.innerHTML = '';
    for (const [phone, user] of Object.entries(users)) {
        if (phone !== adminPhone) {
            const listItem = document.createElement('li');
            listItem.innerText = `${user.name} (${phone}): 잔여횟수 ${user.remaining}`;
            listItem.onclick = () => {
                selectedUser = phone;
                document.getElementById('userName').value = user.name;
                document.getElementById('userPhone').value = phone;
                document.getElementById('remainingCount').value = user.remaining;
            };
            userList.appendChild(listItem);
        }
    }
}

function generateTimeTable(date) {
    const timeTable = document.getElementById('timeTable');
    timeTable.innerHTML = '';
    const times = generateTimeSlots('09:00', '21:00', 30);

    times.forEach(time => {
        const timeSlot = document.createElement('div');
        timeSlot.innerText = time;
        timeSlot.className = 'time-slot';
        const bookedUsers = reservations[date]?.[time]?.users || [];
        if (bookedUsers.length > 0) {
            timeSlot.classList.add('booked');
            timeSlot.innerText += ` (${bookedUsers.length}/3)`;
        }
        if (bookedUsers.length < 3) {
            timeSlot.addEventListener('click', () => {
                document.querySelectorAll('.time-slot').forEach(slot => slot.classList.remove('selected'));
                timeSlot.classList.add('selected');
                selectedTime = time;
            });
        } else {
            timeSlot.classList.add('fully-booked');
        }
        timeTable.appendChild(timeSlot);
    });
}

function generateTimeSlots(startTime, endTime, interval = 30) {
    const slots = [];
    let current = startTime;
    while (current < endTime) {
        slots.push(current);
        current = addMinutes(current, interval);
    }
    return slots;
}

function addMinutes(time, minutes) {
    const [hour, minute] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(hour);
    date.setMinutes(minute + minutes);
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function addHours(time, hours) {
    const [hour, minute] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(hour + hours);
    date.setMinutes(minute);
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function reserve() {
    if (!selectedDate || !selectedTime) {
        alert('날짜와 시간을 선택하세요.');
        return;
    }
    if (loggedInUser.remaining <= 0) {
        alert('잔여 횟수가 부족합니다.');
        return;
    }
    const endTime = addHours(selectedTime, 2);
    const newReservation = generateTimeSlots(selectedTime, endTime);

    // Check if any of the selected slots are already booked
    if (newReservation.some(time => reservations[selectedDate]?.[time]?.users?.includes(loggedInUser.phone))) {
        alert('선택한 시간 중 일부가 이미 예약되었습니다.');
        return;
    }

    reservations[selectedDate] = reservations[selectedDate] || {};
    newReservation.forEach(time => {
        reservations[selectedDate][time] = reservations[selectedDate][time] || { users: [] };
        reservations[selectedDate][time].users.push(loggedInUser.phone);
    });

    loggedInUser.remaining--;
    document.getElementById('remaining').innerText = loggedInUser.remaining;

    localStorage.setItem('reservations', JSON.stringify(reservations));
    localStorage.setItem('users', JSON.stringify(users));
    alert(`예약이 완료되었습니다: ${selectedDate} ${selectedTime} - ${endTime}`);
    generateTimeTable(selectedDate);
}

function cancelReservation() {
    if (!selectedDate || !selectedTime) {
        alert('날짜와 시간을 선택하세요.');
        return;
    }
    const endTime = addHours(selectedTime, 2);
    const cancelReservation = generateTimeSlots(selectedTime, endTime);

    reservations[selectedDate] = reservations[selectedDate] || {};
    cancelReservation.forEach(time => {
        if (reservations[selectedDate][time]) {
            reservations[selectedDate][time].users = reservations[selectedDate][time].users.filter(phone => phone !== loggedInUser.phone);
            if (reservations[selectedDate][time].users.length === 0) {
                delete reservations[selectedDate][time];
            }
        }
    });

    loggedInUser.remaining++;
    document.getElementById('remaining').innerText = loggedInUser.remaining;

    localStorage.setItem('reservations', JSON.stringify(reservations));
    localStorage.setItem('users', JSON.stringify(users));
    alert(`예약이 취소되었습니다: ${selectedDate} ${selectedTime} - ${endTime}`);
    generateTimeTable(selectedDate);
}

function updateReservations() {
    const reservationList = document.getElementById('reservations');
    reservationList.innerHTML = '';
    if (reservations[selectedDate]) {
        for (const [time, data] of Object.entries(reservations[selectedDate])) {
            const listItem = document.createElement('li');
            listItem.innerText = `${time}: ${data.users.join(', ')}`;
            reservationList.appendChild(listItem);
        }
    }
}

function generateUserCalendar() {
    const userCalendar = document.getElementById('userCalendar');
    userCalendar.innerHTML = '';
    const calendar = flatpickr(userCalendar, {
        locale: "ko",
        inline: true,
        dateFormat: "Y-m-d",
        onChange: function(selectedDates, dateStr, instance) {
            selectedDate = dateStr;
            document.getElementById('selectedDate').innerText = selectedDate;
            generateTimeTable(selectedDate);
        }
    });
}
