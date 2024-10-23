async function getLiveData() {
    const url = 'https://127.0.0.1:2999/liveclientdata/playerlist';

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            mode: 'cors',
            credentials: 'same-origin'
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Live Player Data:', data); // Check what the API returns
            return data;
        } else {
            console.error('Error fetching data:', response.statusText);
            return null; // Return null if the response is not okay
        }
    } catch (error) {
        console.error('Request failed:', error);
        return null; // Return null on fetch failure
    }
}


//display team stats
function displayTeamStats(teamStats, teamListId) {
    const teamList = document.getElementById('teamListId');

    // clear content
    teamList.innerHTML = '';

    //for each player create a list for stats
    teamStats.forEach(player => {
    const listItem = document.createElement('li');
    listItem.textContent = `${player.name} - Kills: ${player.kills}, Deaths: ${player.deaths}, Assists: ${player.assists}, cs: ${player.cs}`;
    teamList.append(listItem)
    });
}

// Call the function to fetch and log live player data
async function gameInformation() {
    const playerData = await getLiveData();
    console.log('Player Data:', playerData); // Add this line to check the output

    if (!playerData) {
        console.error('No player data returned from API');
        return; // Exit early if no data
    }

    // Filter by teams
    const teamOrder = playerData.filter(player => player.team === 'ORDER');
    const teamChaos = playerData.filter(player => player.team === 'CHAOS');

    // Stats for each team
    const teamOrderStats = teamOrder.map(player => ({
        name: player.riotIdGameName,
        kills: player.scores.kills,
        cs: player.scores.creepScore,
        deaths: player.scores.deaths,
        assists: player.scores.assists,
        wardScore: player.scores.wardScore
    }));

    const teamChaosStats = teamChaos.map(player => ({
        name: player.riotIdGameName,
        kills: player.scores.kills,
        cs: player.scores.creepScore,
        deaths: player.scores.deaths,
        assists: player.scores.assists,
        wardScore: player.scores.wardScore
    }));

    // Display the stats
    displayTeamStats(teamOrderStats, 'order-list');
    displayTeamStats(teamChaosStats, 'chaos-list');
}


document.addEventListener('DOMContentLoaded', () => {
    gameInformation();
});