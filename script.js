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

// Initialize Flatpickr with Korean locale
flatpickr("#calendar", {
    locale: "ko",
    dateFormat: "Y-m-d",
    onChange: function(selectedDates, dateStr, instance) {
        selectedDate = dateStr;
        document.getElementById('selectedDate').innerText = selectedDate;
    }
});
