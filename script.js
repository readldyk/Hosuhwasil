let remainingReservations = 3;
let selectedDate = null;

document.getElementById('reserveBtn').addEventListener('click', () => {
    if (!selectedDate) {
        alert('Please select a date.');
        return;
    }
    if (remainingReservations > 0) {
        remainingReservations--;
        document.getElementById('remaining').innerText = remainingReservations;
        alert(`Reservation successful for ${selectedDate}`);
    } else {
        alert('No remaining reservations');
    }
});

// Simple calendar code
const calendar = document.getElementById('calendar');
for (let i = 1; i <= 31; i++) {
    const day = document.createElement('div');
    day.innerText = i;
    day.addEventListener('click', () => {
        if (selectedDate) {
            document.querySelector(`#calendar div[data-day="${selectedDate}"]`).classList.remove('selected');
        }
        selectedDate = i;
        document.getElementById('selectedDate').innerText = selectedDate;
        day.classList.add('selected');
    });
    day.setAttribute('data-day', i);
    calendar.appendChild(day);
}
