let remainingReservations = 3;
let selectedDate = null;
let selectedTime = null;
const bookedSlots = {}; // { '2023-07-25': ['10:00', '10:30', ...], ... }

// Initialize Flatpickr with Korean locale
flatpickr("#calendar", {
    locale: "ko",
    dateFormat: "Y-m-d",
    onChange: function(selectedDates, dateStr, instance) {
        selectedDate = dateStr;
        document.getElementById('selectedDate').innerText = selectedDate;
        generateTimeTable(selectedDate);
    }
});

document.getElementById('reserveBtn').addEventListener('click', () => {
    if (!selectedDate || !selectedTime) {
        alert('Please select a date and time.');
        return;
    }
    if (remainingReservations > 0) {
        const endTime = addHours(selectedTime, 2);
        const newReservation = generateTimeSlots(selectedTime, endTime);

        // Check if any of the selected slots are already booked
        if (newReservation.some(time => bookedSlots[selectedDate]?.includes(time))) {
            alert('One or more selected time slots are already booked.');
            return;
        }

        // Update the booked slots
        bookedSlots[selectedDate] = bookedSlots[selectedDate] || [];
        bookedSlots[selectedDate].push(...newReservation);

        remainingReservations--;
        document.getElementById('remaining').innerText = remainingReservations;
        alert(`Reservation successful for ${selectedDate} ${selectedTime} - ${endTime}`);
        generateTimeTable(selectedDate); // Refresh the timetable to show booked slots
    } else {
        alert('No remaining reservations');
    }
});

function generateTimeTable(date) {
    const timeTable = document.getElementById('timeTable');
    timeTable.innerHTML = ''; // Clear previous time slots
    const times = generateTimeSlots('09:00', '21:00', 30);

    times.forEach(time => {
        const timeSlot = document.createElement('div');
        timeSlot.innerText = time;
        timeSlot.className = 'time-slot';
        if (bookedSlots[date]?.includes(time)) {
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
