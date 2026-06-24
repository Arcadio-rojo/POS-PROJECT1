document.addEventListener('DOMContentLoaded', function() {
    const calendarEl = document.getElementById('calendar');
    const addEventModal = document.getElementById('addEventModal');
    const deleteEventModal = document.getElementById('deleteEventModal');
    let currentEvent = null;

    // Close modal when clicking on X or outside
    document.querySelectorAll('.close, .modal').forEach(element => {
        element.addEventListener('click', (e) => {
            if (e.target === element) {
                addEventModal.style.display = 'none';
                deleteEventModal.style.display = 'none';
            }
        });
    });

    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        selectable: true,
        editable: true,
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        
        events: 'http://localhost:3000/events',
        
        select: function(info) {
            // Populate the add event modal with selected dates
            document.getElementById('eventStart').value = info.startStr;
            document.getElementById('eventEnd').value = info.endStr;
            addEventModal.style.display = 'block';
            calendar.unselect();
        },
        
        eventClick: function(info) {
            currentEvent = info.event;
            document.getElementById('deleteEventText').textContent = 
                `Are you sure you want to delete '${info.event.title}'?`;
            deleteEventModal.style.display = 'block';
        }
    });

    // Handle add event form submission
    document.getElementById('addEventForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const eventData = {
            title: document.getElementById('eventTitle').value,
            start: document.getElementById('eventStart').value,
            end: document.getElementById('eventEnd').value,
            allDay: document.getElementById('eventAllDay').checked
        };

        try {
            const response = await fetch('http://localhost:3000/events', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(eventData)
            });
            const savedEvent = await response.json();
            calendar.addEvent(savedEvent);
            addEventModal.style.display = 'none';
            document.getElementById('addEventForm').reset();
        } catch (error) {
            alert('Error saving event');
        }
    });

    // Handle delete event confirmation
    document.getElementById('confirmDelete').addEventListener('click', async () => {
        if (currentEvent) {
            try {
                await fetch(`http://localhost:3000/events/${currentEvent.id}`, {
                    method: 'DELETE'
                });
                currentEvent.remove();
                deleteEventModal.style.display = 'none';
            } catch (error) {
                alert('Error deleting event');
            }
        }
    });

    document.getElementById('cancelDelete').addEventListener('click', () => {
        deleteEventModal.style.display = 'none';
    });

    calendar.render();
});