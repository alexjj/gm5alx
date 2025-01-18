// Fetch user ID based on callsign
async function fetchUserId(callsign) {
    const response = await fetch(`https://sotl.as/api/activators/${callsign}`);
    if (response.ok) {
        const data = await response.json();
        return data.userId;
    }
    return null;
}

// Fetch activations based on user ID
async function fetchActivations(userId) {
    const response = await fetch(`https://api-db2.sota.org.uk/logs/activator/${userId}/99999/0`);
    if (response.ok) {
        return await response.json();
    }
    return [];
}

// Plot progress using Chart.js
function plotProgress(data, avgPointsPerWeek) {
    const labels = data.map(item => new Date(item.ActivationDate).toLocaleDateString());
    const cumulativePoints = data.map(item => item.Total);

    const ctx = document.getElementById('progressChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Current Progress',
                data: cumulativePoints,
                borderColor: 'blue',
                fill: false
            }]
        },
        options: {
            scales: {
                x: { title: { display: true, text: 'Date' } },
                y: { title: { display: true, text: 'Cumulative Points' } }
            }
        }
    });
}

// Main function to handle user input and logic
document.getElementById('checkProgress').addEventListener('click', async () => {
    const callsign = document.getElementById('callsign').value.toUpperCase();
    const avgPointsPerWeek = parseInt(document.getElementById('avgPoints').value);

    if (callsign) {
        const userId = await fetchUserId(callsign);
        if (userId) {
            const activations = await fetchActivations(userId);
            if (activations.length > 0) {
                const totalPoints = activations[activations.length - 1].Total;
                if (totalPoints >= 1000) {
                    alert("You're already a mountain goat. Time to climb a real mountain!");
                } else {
                    document.getElementById('pointsInfo').textContent = `${callsign}, you have ${totalPoints} points, only ${1000 - totalPoints} to go!`;
                    plotProgress(activations, avgPointsPerWeek);
                }
            } else {
                alert('No activation data found.');
            }
        } else {
            alert('Invalid callsign or data not found.');
        }
    }
});
