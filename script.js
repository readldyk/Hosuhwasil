let remainingReservations = 3;

document.getElementById('reserveBtn').addEventListener('click', () => {
    if (remainingReservations > 0) {
        remainingReservations--;
        document.getElementById('remaining').innerText = remainingReservations;
        alert('Reservation successful');
    } else {
        alert('No remaining reservations');
    }
});

// Calendar code (simple placeholder)
const calendar = document.getElementById('calendar');
for (let i = 1; i <= 31; i++) {
    const day = document.createElement('div');
    day.innerText = i;
    day.style.display = 'inline-block';
    day.style.width = '20px';
    day.style.margin = '2px';
    day.style.cursor = 'pointer';
    day.addEventListener('click', () => {
        alert(`You selected ${i}`);
    });
    calendar.appendChild(day);
}
