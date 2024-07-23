const adminPhone = '64145614'; // 관리자 전화번호
let users = JSON.parse(localStorage.getItem('users')) || {};
let reservations = JSON.parse(localStorage.getItem('reservations')) || {};
let loggedInUser = null;
let selectedDate = null;
let selectedTime = null;

document.addEventListener('DOMContentLoaded', () => {
    if (Object.keys(users).length === 0) {
        users[adminPhone] = { name: '관리자', password: 'admin', isAdmin: true, remaining: 0 };
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
    
    document.getElementById('login').style.display = 'block'; // 로그인 화면 표시
});

function login() {
    const phone = document.getElementById('phone').value;
    const passwordInput = document.getElementById('password');
    if (phone === adminPhone) {
        passwordInput.style.display = 'block';
        const password = passwordInput.value;
        if (users[phone] && users[phone].password === password) {
            loggedInUser = users[phone];
            showAdminScreen();
        } else {
            alert('잘못된 암호입니다.');
        }
    } else {
        if (users[phone]) {
            loggedInUser = users[phone];
            showUserScreen();
        } else {
            alert('등록되지 않은 사용자입니다.');
        }
    }
}

function showAdminScreen() {
    document.getElementById('login').style.display = 'none';
    document.getElementById('admin').style.display = 'block';
    updateReservations();
}

function showUserScreen() {
    document.getElementById('login').style.display = 'none';
    document.getElementById('user').style.display = 'block';
    document.getElementById('remaining').innerText = loggedInUser.remaining;
}

function registerUser() {
    const name = document.getElementById('userName').value;
    const phone = document.getElementById('userPhone').value;
    if (!name || !phone) {
        alert('모든 필드를 입력하세요.');
        return;
    }
    users[phone] = { name, remaining: 0 };
    localStorage.setItem('users', JSON.stringify(users));
    alert('사용자가 등록되었습니다.');
}

function updateRemaining() {
    const phone = document.getElementById('remainingPhone').value;
    const remaining = document.getElementById('remainingCount').value;
    if (!users[phone]) {
        alert('등록되지 않은 사용자입니다.');
        return;
    }
    users[phone].remaining = parseInt(remaining, 10);
    localStorage.setItem('users', JSON.stringify(users));
    alert('잔여 횟수가 업데이트되었습니다.');
}

function generateTimeTable(date) {
    const timeTable = document.getElementById('timeTable');
    timeTable.innerHTML = '';
    const times = generateTimeSlots('09:00', '21:00', 30);

    times.forEach(time => {
        const timeSlot = document.createElement('div');
        timeSlot.innerText = time;
        timeSlot.className = 'time-slot';
        if (reservations[date]?.includes(time)) {
            timeSlot.classList.add('booked');
        } else {
            timeSlot.addEventListener('click', () => {
                document.querySelectorAll('.time-slot').forEach(slot => slot.classList.remove('selected'));
                timeSlot.classList.add('selected');
                selectedTime = time;
            });
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
    if (newReservation.some(time => reservations[selectedDate]?.includes(time))) {
        alert('선택한 시간 중 일부가 이미 예약되었습니다.');
        return;
    }

    reservations[selectedDate] = reservations[selectedDate] || [];
    reservations[selectedDate].push(...newReservation);
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

    reservations[selectedDate] = reservations[selectedDate]?.filter(time => !cancelReservation.includes(time)) || [];
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
    for (const [date, times] of Object.entries(reservations)) {
        const listItem = document.createElement('li');
        listItem.innerText = `${date}: ${times.join(', ')}`;
        reservationList.appendChild(listItem);
    }
}
